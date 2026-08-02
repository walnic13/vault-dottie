-- ============================================================================
-- Dottie — dottie_artifacts + dottie_artifact_versions (persisted [[ARTIFACT]] deliverables; Blob-backed).
-- Target: shared `vaultgpt` Azure Postgres instance (vaultgpt-postgres-prod), schema `public`.
-- Plain PostgreSQL SQL; no top-level BEGIN/COMMIT (migration governance). Idempotent.
-- Run as pgadmin_vault (owner), same as every prior dottie migration (D1 / attachments).
--
-- Byte-faithful mirror of the deployed theo_artifacts + theo_artifact_versions (Theo Tier B2), with three
-- Dottie deltas, all documented in the Structural Mirror Table of the VEP:
--   (1) theo_ -> dottie_ identifiers (table / policy / index / helper names + the conversation FK parent
--       theo_conversations -> dottie_conversations).
--   (2) DROP the `project_id` column + its FK + its index — Dottie has NO Projects backend (Projects are
--       hidden; there is no `dottie_projects` table to FK to). The conversation link is retained.
--   (3) The `_exists_unscoped` helper adds `REVOKE ALL FROM PUBLIC` before `GRANT ... TO authenticated`,
--       matching the deployed Dottie D1 hardening idiom (dottie_conversation/user_memory_exists_unscoped),
--       which is stricter than the looser Theo B2 grant.
-- Content lives in Azure Blob (`dottie-content` on `vaultgptdottiestore`, key
-- `artifacts/{oid}/{artifactId}/v{n}.txt`); the version row holds only the Blob pointer + metadata.
-- FK to the deployed D1 table dottie_conversations, ON DELETE SET NULL (artifacts survive an unlinked
-- conversation, mirroring theo_artifacts). Versions FK -> dottie_artifacts ON DELETE CASCADE.
-- ============================================================================

-- ---------- dottie_artifacts ----------
CREATE TABLE IF NOT EXISTS public.dottie_artifacts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by      text NOT NULL,
  conversation_id uuid NULL REFERENCES public.dottie_conversations(id) ON DELETE SET NULL,
  title           text NOT NULL CHECK (length(trim(title)) > 0),
  type            text NOT NULL CHECK (type IN ('document','code','html')),
  current_version integer NOT NULL DEFAULT 1,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dottie_artifacts_created_by ON public.dottie_artifacts (created_by);
CREATE INDEX IF NOT EXISTS idx_dottie_artifacts_conversation_id ON public.dottie_artifacts (conversation_id);
ALTER TABLE public.dottie_artifacts ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_artifacts' AND policyname='dottie_artifact_select_own') THEN
    CREATE POLICY "dottie_artifact_select_own" ON public.dottie_artifacts FOR SELECT TO authenticated USING (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_artifacts' AND policyname='dottie_artifact_insert_own') THEN
    CREATE POLICY "dottie_artifact_insert_own" ON public.dottie_artifacts FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_artifacts' AND policyname='dottie_artifact_update_own') THEN
    CREATE POLICY "dottie_artifact_update_own" ON public.dottie_artifacts FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_artifacts' AND policyname='dottie_artifact_delete_own') THEN
    CREATE POLICY "dottie_artifact_delete_own" ON public.dottie_artifacts FOR DELETE TO authenticated USING (created_by = auth.uid());
  END IF;
END $$;
CREATE OR REPLACE FUNCTION public.dottie_artifact_exists_unscoped(p_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.dottie_artifacts WHERE id = p_id);
$$;
-- Dottie D1 hardening idiom (stricter than Theo B2): a SECURITY DEFINER function is EXECUTE-able by
-- PUBLIC by default, so REVOKE that before granting only to authenticated.
REVOKE ALL ON FUNCTION public.dottie_artifact_exists_unscoped(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.dottie_artifact_exists_unscoped(uuid) TO authenticated;

-- ---------- dottie_artifact_versions (immutable; Blob pointer content) ----------
CREATE TABLE IF NOT EXISTS public.dottie_artifact_versions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by     text NOT NULL,
  artifact_id    uuid NOT NULL REFERENCES public.dottie_artifacts(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  blob_container text NOT NULL,
  blob_path      text NOT NULL,
  byte_size      bigint NULL,
  content_type   text NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (artifact_id, version_number)
);
CREATE INDEX IF NOT EXISTS idx_dottie_artifact_versions_artifact_id ON public.dottie_artifact_versions (artifact_id);
ALTER TABLE public.dottie_artifact_versions ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_artifact_versions' AND policyname='dottie_artifact_version_select_own') THEN
    CREATE POLICY "dottie_artifact_version_select_own" ON public.dottie_artifact_versions FOR SELECT TO authenticated USING (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_artifact_versions' AND policyname='dottie_artifact_version_insert_own') THEN
    CREATE POLICY "dottie_artifact_version_insert_own" ON public.dottie_artifact_versions FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_artifact_versions' AND policyname='dottie_artifact_version_update_own') THEN
    CREATE POLICY "dottie_artifact_version_update_own" ON public.dottie_artifact_versions FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_artifact_versions' AND policyname='dottie_artifact_version_delete_own') THEN
    CREATE POLICY "dottie_artifact_version_delete_own" ON public.dottie_artifact_versions FOR DELETE TO authenticated USING (created_by = auth.uid());
  END IF;
END $$;
-- (immutable + cascade-delete only -> no _exists_unscoped for the versions table)
