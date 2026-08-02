-- ============================================================================
-- Dottie — dottie_attachments (files attached to a Dottie chat; document/image RAG-to-model)
-- Target: shared `vaultgpt` Azure Postgres instance (vaultgpt-postgres-prod), schema `public`.
-- Plain PostgreSQL SQL; no top-level BEGIN/COMMIT (migration governance). Idempotent.
-- Run as pgadmin_vault (owner), same as every prior dottie migration (D1).
--
-- Byte-faithful mirror of the deployed theo_attachments (Tier B8a + B8c + B8i, consolidated into one
-- net-new table since dottie_attachments does not yet exist): four RLS policies TO authenticated keyed on
-- auth.uid() (= Entra OID in created_by) + a SECURITY DEFINER dottie_attachment_exists_unscoped(uuid)
-- helper (403/404 discrimination for the delete/list handlers). The file body lives in Azure Blob
-- (the `dottie-content` container on vaultgptdottiestore); this row holds the Blob pointer + metadata only.
-- Per-user isolation is ALSO enforced by explicit `created_by = $oid` predicates in the handlers (the shared
-- connection role enforces RLS via set_config; the explicit filter is defence-in-depth).
-- FK to the deployed D1 table dottie_conversations, ON DELETE SET NULL (attachments survive an unlinked
-- conversation, mirroring theo_attachments).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.dottie_attachments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by          text NOT NULL,
  conversation_id     uuid NULL REFERENCES public.dottie_conversations(id) ON DELETE SET NULL,
  filename            text NOT NULL CHECK (length(trim(filename)) > 0),
  content_type        text NOT NULL,
  byte_size           bigint NOT NULL CHECK (byte_size >= 0),
  blob_container      text NOT NULL,
  blob_path           text NOT NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  ingestion_class     text,          -- native | extract | stored (how the file is fed to the model); free-text, no CHECK (mirrors theo B8c)
  extracted_text_path text,          -- Blob pointer (within blob_container) to the extracted .md; NULL for native / failed / not-run (B8c)
  message_seq         int            -- the dottie_messages.seq of the user turn this was sent with; NULL if not sent in a message (B8i reload parity)
);
CREATE INDEX IF NOT EXISTS idx_dottie_attachments_created_by ON public.dottie_attachments (created_by);
CREATE INDEX IF NOT EXISTS idx_dottie_attachments_conversation ON public.dottie_attachments (conversation_id);
ALTER TABLE public.dottie_attachments ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_attachments' AND policyname='dottie_attachment_select_own') THEN
    CREATE POLICY "dottie_attachment_select_own" ON public.dottie_attachments FOR SELECT TO authenticated USING (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_attachments' AND policyname='dottie_attachment_insert_own') THEN
    CREATE POLICY "dottie_attachment_insert_own" ON public.dottie_attachments FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_attachments' AND policyname='dottie_attachment_update_own') THEN
    CREATE POLICY "dottie_attachment_update_own" ON public.dottie_attachments FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_attachments' AND policyname='dottie_attachment_delete_own') THEN
    CREATE POLICY "dottie_attachment_delete_own" ON public.dottie_attachments FOR DELETE TO authenticated USING (created_by = auth.uid());
  END IF;
END $$;
CREATE OR REPLACE FUNCTION public.dottie_attachment_exists_unscoped(p_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.dottie_attachments WHERE id = p_id);
$$;
-- Dottie D1 hardening idiom (stricter than Theo B8a): a SECURITY DEFINER function is EXECUTE-able by
-- PUBLIC by default, so REVOKE that before granting only to authenticated. Byte-faithful to the deployed
-- dottie_conversation_exists_unscoped / dottie_user_memory_exists_unscoped grants (D1).
REVOKE ALL ON FUNCTION public.dottie_attachment_exists_unscoped(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.dottie_attachment_exists_unscoped(uuid) TO authenticated;

COMMENT ON COLUMN public.dottie_attachments.ingestion_class IS
  'native | extract | stored — how the attachment is fed to the model. Free-text (no CHECK), mirrors theo_attachments B8c.';
COMMENT ON COLUMN public.dottie_attachments.extracted_text_path IS
  'Blob pointer (within blob_container) to the extracted text for extract-class attachments; NULL for native, or when extraction failed/has not run.';
COMMENT ON COLUMN public.dottie_attachments.message_seq IS
  'The dottie_messages.seq of the user turn this attachment was sent with; NULL if not sent in a message. Lets a reloaded thread show chips on the right message (B8i reload parity).';
