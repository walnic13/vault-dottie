-- Read-only catalog verification for the dottie_attachments migration (run after apply).
-- SELECT-only; safe from the RO workstation path. Each block should return the expected rows.

-- 1) Table + columns (expect 12 rows: id, created_by, conversation_id, filename, content_type,
--    byte_size, blob_container, blob_path, created_at, ingestion_class, extracted_text_path, message_seq)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'dottie_attachments'
ORDER BY ordinal_position;

-- 2) FK to dottie_conversations ON DELETE SET NULL. Use pg_catalog (information_schema.*_column_usage
--    is invisible to a read-only role that can't see the parent table's grants). confdeltype 'n' = SET NULL.
SELECT conname, confrelid::regclass AS references_table, confdeltype AS del_rule,
       pg_get_constraintdef(oid) AS def
FROM pg_constraint
WHERE conrelid = 'public.dottie_attachments'::regclass AND contype = 'f';
-- expect 1 row: references dottie_conversations, del_rule='n' (SET NULL)

-- 3) RLS enabled + the four ownership policies (expect rowsecurity=t; 4 policy rows)
SELECT relrowsecurity FROM pg_class WHERE oid = 'public.dottie_attachments'::regclass;
SELECT policyname, cmd FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'dottie_attachments' ORDER BY policyname;

-- 4) exists-unscoped helper: SECURITY DEFINER, search_path=public, and EXECUTE granted to
--    authenticated but NOT to PUBLIC (Dottie D1 hardening idiom). The acl must show `authenticated=X`
--    and must NOT contain a bare `=X/` PUBLIC entry.
SELECT p.proname, p.prosecdef,
       (SELECT string_agg(cfg, ', ') FROM unnest(p.proconfig) cfg) AS settings,
       pg_catalog.array_to_string(p.proacl, ' ') AS acl,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_can_execute
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'dottie_attachment_exists_unscoped';
-- expect: prosecdef=t; settings='search_path=public'; acl contains 'authenticated=X' and NO bare '=X/'
-- (PUBLIC) entry; authenticated_can_execute = t.

-- 5) indexes (expect the two idx_dottie_attachments_* plus the PK)
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'dottie_attachments' ORDER BY indexname;

-- 6) CHECK constraints (filename non-empty; byte_size >= 0)
SELECT con.conname, pg_get_constraintdef(con.oid)
FROM pg_constraint con JOIN pg_class c ON c.oid = con.conrelid
WHERE c.relname = 'dottie_attachments' AND con.contype = 'c' ORDER BY con.conname;
