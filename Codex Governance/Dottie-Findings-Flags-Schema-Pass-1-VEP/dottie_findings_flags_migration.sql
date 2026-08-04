-- dottie_findings_flags_migration.sql
-- Dottie governance-findings store (her operational L4 memory) — DOTTIE_MEMORY_MODEL §2.4 / §5 / §7 (build-order 2).
-- Two additively-namespaced `dottie_*` tables in the shared `vaultgpt` Postgres (schema `public`), mirroring the
-- DEPLOYED Dottie D1 idioms byte-faithfully (dottie_d1_migration.sql): text `created_by` (Entra OID), four
-- ownership RLS policies per table (created_by = auth.uid()), `_exists_unscoped` SECURITY DEFINER helper for
-- 403/404 discrimination, created_by index. Per-user isolation is ALSO enforced by explicit `created_by = $oid`
-- predicates in the handlers (the shared Functions role bypasses RLS — RLS is defence-in-depth), exactly as D1/D2.
--   dottie_findings — a check/verdict on an artifact or claim (backs "Recent checks on Theo", verdict badges,
--                     the audit trail; a verdict-intensity [[CHECK]] turn writes a row — §5).
--   dottie_flags    — open governance flags derived from findings or standalone (backs "Open flags").
-- dottie_review_chains (the governance queue / her Codex-role) is a SEPARATE later migration (§7 build-order 3).
-- Executor: Walter, as pgadmin_vault. Additive; CREATE ... IF NOT EXISTS / CREATE OR REPLACE; NO top-level
-- BEGIN/COMMIT (Golden Handler §5.2); idempotent + reversible (footer).

-- ─────────────────────────────────────────────────────────────────────────────────────────────
-- 1) dottie_findings — a check/verdict on a target (Theo answer, workpaper, context item, conversation)
-- ─────────────────────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dottie_findings (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by        text NOT NULL,
  target_ref        text NOT NULL,
  target_kind       text NOT NULL CHECK (target_kind IN ('theo_answer','workpaper','context_item','conversation')),
  verdict           text NOT NULL CHECK (verdict IN ('concur','caution','challenge')),
  confidence_level  double precision NULL CHECK (confidence_level IS NULL OR (confidence_level >= 0 AND confidence_level <= 1)),
  confidence_label  text NULL,
  claim_source      text NULL,
  claim_text        text NULL,
  lead              text NULL,
  conclusion        text NULL,
  authorities       text[] NOT NULL DEFAULT '{}',
  flags             text[] NOT NULL DEFAULT '{}',
  docs_expected     text[] NOT NULL DEFAULT '{}',
  conversation_id   uuid NULL REFERENCES public.dottie_conversations(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dottie_findings_created_by ON public.dottie_findings (created_by);
-- list "recent checks" newest-first, per owner (the Overview + Checks-on-Theo surfaces)
CREATE INDEX IF NOT EXISTS idx_dottie_findings_created_by_created_desc ON public.dottie_findings (created_by, created_at DESC);

ALTER TABLE public.dottie_findings ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_findings' AND policyname='dottie_finding_select_own') THEN
    CREATE POLICY "dottie_finding_select_own" ON public.dottie_findings FOR SELECT TO authenticated USING (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_findings' AND policyname='dottie_finding_insert_own') THEN
    CREATE POLICY "dottie_finding_insert_own" ON public.dottie_findings FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_findings' AND policyname='dottie_finding_update_own') THEN
    CREATE POLICY "dottie_finding_update_own" ON public.dottie_findings FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_findings' AND policyname='dottie_finding_delete_own') THEN
    CREATE POLICY "dottie_finding_delete_own" ON public.dottie_findings FOR DELETE TO authenticated USING (created_by = auth.uid());
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.dottie_finding_exists_unscoped(p_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.dottie_findings WHERE id = p_id);
$$;
REVOKE ALL ON FUNCTION public.dottie_finding_exists_unscoped(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.dottie_finding_exists_unscoped(uuid) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────────────────────
-- 2) dottie_flags — open governance flags (may derive from a finding, or stand alone); backs "Open flags"
-- ─────────────────────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dottie_flags (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by   text NOT NULL,
  finding_id   uuid NULL REFERENCES public.dottie_findings(id) ON DELETE CASCADE,
  flag_type    text NOT NULL CHECK (flag_type IN ('unsupported_assumption','missing_documentation','tag_drift','review_chain_gap','other')),
  severity     text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high')),
  target_ref   text NULL,
  summary      text NULL,
  status       text NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  resolved_at  timestamptz NULL
);
CREATE INDEX IF NOT EXISTS idx_dottie_flags_created_by ON public.dottie_flags (created_by);
CREATE INDEX IF NOT EXISTS idx_dottie_flags_finding_id ON public.dottie_flags (finding_id);
-- list open flags newest-first, per owner (the Open-flags surface + the Overview count)
CREATE INDEX IF NOT EXISTS idx_dottie_flags_owner_status_created_desc ON public.dottie_flags (created_by, status, created_at DESC);

ALTER TABLE public.dottie_flags ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_flags' AND policyname='dottie_flag_select_own') THEN
    CREATE POLICY "dottie_flag_select_own" ON public.dottie_flags FOR SELECT TO authenticated USING (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_flags' AND policyname='dottie_flag_insert_own') THEN
    CREATE POLICY "dottie_flag_insert_own" ON public.dottie_flags FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_flags' AND policyname='dottie_flag_update_own') THEN
    CREATE POLICY "dottie_flag_update_own" ON public.dottie_flags FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_flags' AND policyname='dottie_flag_delete_own') THEN
    CREATE POLICY "dottie_flag_delete_own" ON public.dottie_flags FOR DELETE TO authenticated USING (created_by = auth.uid());
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.dottie_flag_exists_unscoped(p_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.dottie_flags WHERE id = p_id);
$$;
REVOKE ALL ON FUNCTION public.dottie_flag_exists_unscoped(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.dottie_flag_exists_unscoped(uuid) TO authenticated;

-- ── Reversal (documented; run only to roll back — additive tables/functions) ──────────────────────────
-- DROP FUNCTION IF EXISTS public.dottie_flag_exists_unscoped(uuid);
-- DROP FUNCTION IF EXISTS public.dottie_finding_exists_unscoped(uuid);
-- DROP TABLE IF EXISTS public.dottie_flags;      -- drop flags first (FK → dottie_findings)
-- DROP TABLE IF EXISTS public.dottie_findings;
