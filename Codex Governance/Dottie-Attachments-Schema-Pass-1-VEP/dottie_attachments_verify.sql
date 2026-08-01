-- Read-only catalog verification for the dottie_attachments migration (run after apply).
-- SELECT-only; safe from the RO workstation path. Each block should return the expected rows.

-- 1) Table + columns (expect 12 rows: id, created_by, conversation_id, filename, content_type,
--    byte_size, blob_container, blob_path, created_at, ingestion_class, extracted_text_path, message_seq)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'dottie_attachments'
ORDER BY ordinal_position;

-- 2) FK to dottie_conversations ON DELETE SET NULL
SELECT tc.constraint_name, rc.delete_rule, ccu.table_name AS references_table
FROM information_schema.table_constraints tc
JOIN information_schema.referential_constraints rc ON rc.constraint_name = tc.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public' AND tc.table_name = 'dottie_attachments' AND tc.constraint_type = 'FOREIGN KEY';

-- 3) RLS enabled + the four ownership policies (expect rowsecurity=t; 4 policy rows)
SELECT relrowsecurity FROM pg_class WHERE oid = 'public.dottie_attachments'::regclass;
SELECT policyname, cmd FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'dottie_attachments' ORDER BY policyname;

-- 4) exists-unscoped helper (expect prosecdef=t, search_path=public, EXECUTE to authenticated)
SELECT p.proname, p.prosecdef, p.proconfig
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'dottie_attachment_exists_unscoped';

-- 5) indexes (expect the two idx_dottie_attachments_* plus the PK)
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'dottie_attachments' ORDER BY indexname;

-- 6) CHECK constraints (filename non-empty; byte_size >= 0)
SELECT con.conname, pg_get_constraintdef(con.oid)
FROM pg_constraint con JOIN pg_class c ON c.oid = con.conrelid
WHERE c.relname = 'dottie_attachments' AND con.contype = 'c' ORDER BY con.conname;
