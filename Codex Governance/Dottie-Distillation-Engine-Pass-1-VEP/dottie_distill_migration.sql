-- ============================================================================
-- Dottie D3 — distillation: watermark column + cross-owner due-scan helper
-- Target: shared `vaultgpt` Azure Postgres (`vaultgpt-postgres-prod`), schema `public`.
-- Run by Walter as `pgadmin_vault`. Plain PostgreSQL; NO top-level BEGIN/COMMIT
-- (migration governance). Idempotent (IF NOT EXISTS / CREATE OR REPLACE).
--
-- Byte-faithful mirror of the deployed Theo B7 `b7d2_migration.sql` (theo_conversations
-- watermark + `theo_due_conversations` helper), with the identifiers swapped to `dottie_*`
-- and the Dottie D1 REVOKE-PUBLIC hardening on the helper.
--
-- The distillation timer is a server-side batch with NO signed-in user, so it cannot satisfy
-- the per-user RLS predicate (created_by = auth.uid()) on a cross-owner scan — under RLS the
-- scan returns zero rows. This adds (1) the `last_distilled_at` watermark and (2) a SECURITY
-- DEFINER scan helper (runs as the function owner → bypasses RLS, exactly like the deployed
-- `dottie_*_exists_unscoped` helpers) that returns the due (id, created_by) list across all
-- owners. The timer then sets each owner's context (set_config) before reading that owner's
-- messages/memory and writing — so isolation holds. Dottie-L1 stays SEPARATE from Theo's L1;
-- no `theo_*` object is touched.
-- ============================================================================

ALTER TABLE public.dottie_conversations
  ADD COLUMN IF NOT EXISTS last_distilled_at timestamptz NULL;

CREATE INDEX IF NOT EXISTS idx_dottie_conversations_distill_scan
  ON public.dottie_conversations (updated_at)
  WHERE last_distilled_at IS NULL OR last_distilled_at < updated_at;

-- Cross-owner ENUMERATION helper for the distillation timer — the scheduled-job SECURITY
-- DEFINER enumeration carve-out. Runs as the function owner so it sees all owners'
-- conversations regardless of RLS; returns ONLY identifiers + owner ids for scheduling (never
-- user content). The timer then processes each owner under that owner's set_config context.
-- Hardened per the Dottie D1 idiom: REVOKE from PUBLIC, EXECUTE to `authenticated` only.
CREATE OR REPLACE FUNCTION public.dottie_due_conversations(p_idle_minutes int, p_limit int)
RETURNS TABLE (id uuid, created_by text)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT c.id, c.created_by
  FROM public.dottie_conversations c
  WHERE c.updated_at < now() - ((p_idle_minutes)::text || ' minutes')::interval
    AND (c.last_distilled_at IS NULL OR c.last_distilled_at < c.updated_at)
  ORDER BY c.updated_at ASC
  LIMIT p_limit;
$$;
REVOKE ALL ON FUNCTION public.dottie_due_conversations(int, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.dottie_due_conversations(int, int) TO authenticated;
