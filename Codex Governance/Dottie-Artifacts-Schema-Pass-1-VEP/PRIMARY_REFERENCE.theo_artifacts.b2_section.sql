-- ---------- theo_artifacts ----------
CREATE TABLE IF NOT EXISTS public.theo_artifacts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by      text NOT NULL,
  conversation_id uuid NULL REFERENCES public.theo_conversations(id) ON DELETE SET NULL,
  project_id      uuid NULL REFERENCES public.theo_projects(id) ON DELETE SET NULL,
  title           text NOT NULL CHECK (length(trim(title)) > 0),
  type            text NOT NULL CHECK (type IN ('document','code','html')),
  current_version integer NOT NULL DEFAULT 1,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_theo_artifacts_created_by ON public.theo_artifacts (created_by);
CREATE INDEX IF NOT EXISTS idx_theo_artifacts_conversation_id ON public.theo_artifacts (conversation_id);
CREATE INDEX IF NOT EXISTS idx_theo_artifacts_project_id ON public.theo_artifacts (project_id);
ALTER TABLE public.theo_artifacts ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='theo_artifacts' AND policyname='theo_artifact_select_own') THEN
    CREATE POLICY "theo_artifact_select_own" ON public.theo_artifacts FOR SELECT TO authenticated USING (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='theo_artifacts' AND policyname='theo_artifact_insert_own') THEN
    CREATE POLICY "theo_artifact_insert_own" ON public.theo_artifacts FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='theo_artifacts' AND policyname='theo_artifact_update_own') THEN
    CREATE POLICY "theo_artifact_update_own" ON public.theo_artifacts FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='theo_artifacts' AND policyname='theo_artifact_delete_own') THEN
    CREATE POLICY "theo_artifact_delete_own" ON public.theo_artifacts FOR DELETE TO authenticated USING (created_by = auth.uid());
  END IF;
END $$;
CREATE OR REPLACE FUNCTION public.theo_artifact_exists_unscoped(p_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.theo_artifacts WHERE id = p_id);
$$;
GRANT EXECUTE ON FUNCTION public.theo_artifact_exists_unscoped(uuid) TO authenticated;

-- ---------- theo_artifact_versions (immutable; Blob pointer content) ----------
CREATE TABLE IF NOT EXISTS public.theo_artifact_versions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by     text NOT NULL,
  artifact_id    uuid NOT NULL REFERENCES public.theo_artifacts(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  blob_container text NOT NULL,
  blob_path      text NOT NULL,
  byte_size      bigint NULL,
  content_type   text NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (artifact_id, version_number)
);
CREATE INDEX IF NOT EXISTS idx_theo_artifact_versions_artifact_id ON public.theo_artifact_versions (artifact_id);
ALTER TABLE public.theo_artifact_versions ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='theo_artifact_versions' AND policyname='theo_artifact_version_select_own') THEN
    CREATE POLICY "theo_artifact_version_select_own" ON public.theo_artifact_versions FOR SELECT TO authenticated USING (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='theo_artifact_versions' AND policyname='theo_artifact_version_insert_own') THEN
    CREATE POLICY "theo_artifact_version_insert_own" ON public.theo_artifact_versions FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='theo_artifact_versions' AND policyname='theo_artifact_version_update_own') THEN
    CREATE POLICY "theo_artifact_version_update_own" ON public.theo_artifact_versions FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='theo_artifact_versions' AND policyname='theo_artifact_version_delete_own') THEN
    CREATE POLICY "theo_artifact_version_delete_own" ON public.theo_artifact_versions FOR DELETE TO authenticated USING (created_by = auth.uid());
  END IF;
END $$;
-- (immutable + cascade-delete only → no _exists_unscoped)
