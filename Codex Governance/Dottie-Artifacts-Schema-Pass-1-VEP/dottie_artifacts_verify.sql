-- Read-only catalog verification for the dottie_artifacts + dottie_artifact_versions migration.
-- SELECT-only; safe from the RO workstation path. pg_catalog forms (information_schema.*_column_usage
-- is invisible to a read-only role). Expected outputs noted inline.

-- 1) dottie_artifacts columns (expect 8: id, created_by, conversation_id, title, type, current_version,
--    created_at, updated_at — NOTE: NO project_id, the Dottie delta)
SELECT column_name, data_type, is_nullable FROM information_schema.columns
WHERE table_schema='public' AND table_name='dottie_artifacts' ORDER BY ordinal_position;

-- 2) dottie_artifact_versions columns (expect 9: id, created_by, artifact_id, version_number,
--    blob_container, blob_path, byte_size, content_type, created_at)
SELECT column_name, data_type, is_nullable FROM information_schema.columns
WHERE table_schema='public' AND table_name='dottie_artifact_versions' ORDER BY ordinal_position;

-- 3) FKs (pg_catalog; confdeltype 'n'=SET NULL, 'c'=CASCADE). Expect:
--    dottie_artifacts.conversation_id -> dottie_conversations, 'n'
--    dottie_artifact_versions.artifact_id -> dottie_artifacts, 'c'
SELECT c.relname AS tbl, con.conname, con.confrelid::regclass AS references_table, con.confdeltype AS del_rule
FROM pg_constraint con JOIN pg_class c ON c.oid = con.conrelid
WHERE c.relname IN ('dottie_artifacts','dottie_artifact_versions') AND con.contype='f'
ORDER BY tbl;

-- 4) RLS enabled + four policies per table (8 total)
SELECT tablename, count(*) AS policy_count FROM pg_policies
WHERE schemaname='public' AND tablename IN ('dottie_artifacts','dottie_artifact_versions')
GROUP BY tablename ORDER BY tablename;   -- expect 4 each
SELECT relname, relrowsecurity FROM pg_class
WHERE oid IN ('public.dottie_artifacts'::regclass, 'public.dottie_artifact_versions'::regclass);  -- expect t, t

-- 5) exists-unscoped helper on the PARENT only (not versions): SECURITY DEFINER, search_path=public,
--    EXECUTE to authenticated, NO PUBLIC (the D1 REVOKE-PUBLIC hardening)
SELECT p.proname, p.prosecdef,
       (SELECT string_agg(cfg, ', ') FROM unnest(p.proconfig) cfg) AS settings,
       pg_catalog.array_to_string(p.proacl, ' ') AS acl,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_can_execute
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' AND p.proname LIKE 'dottie_artifact%exists_unscoped';
-- expect exactly 1 row (dottie_artifact_exists_unscoped): prosecdef=t, settings='search_path=public',
-- acl has 'authenticated=X' and NO bare '=X/' PUBLIC entry, authenticated_can_execute=t.

-- 6) version UNIQUE (artifact_id, version_number) + indexes + type CHECK
SELECT con.conname, pg_get_constraintdef(con.oid)
FROM pg_constraint con JOIN pg_class c ON c.oid=con.conrelid
WHERE c.relname IN ('dottie_artifacts','dottie_artifact_versions') AND con.contype IN ('u','c')
ORDER BY c.relname, con.contype;
SELECT indexname FROM pg_indexes
WHERE schemaname='public' AND tablename IN ('dottie_artifacts','dottie_artifact_versions') ORDER BY indexname;
