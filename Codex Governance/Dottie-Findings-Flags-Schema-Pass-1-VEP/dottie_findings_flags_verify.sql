-- dottie_findings_flags_verify.sql — READ-ONLY verification for the Dottie findings/flags store. No writes; safe to re-run.

-- 1) The two tables exist.
SELECT table_name
  FROM information_schema.tables
 WHERE table_schema='public' AND table_name IN ('dottie_findings','dottie_flags')
 ORDER BY table_name;   -- expect 2 rows

-- 2) RLS enabled on both.
SELECT relname, relrowsecurity
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname='public' AND relname IN ('dottie_findings','dottie_flags')
 ORDER BY relname;   -- expect relrowsecurity = t for both

-- 3) Four ownership policies per table (created_by = auth.uid()).
SELECT tablename, policyname, cmd
  FROM pg_policies
 WHERE schemaname='public' AND tablename IN ('dottie_findings','dottie_flags')
 ORDER BY tablename, policyname;   -- expect 4 per table (select/insert/update/delete _own)

-- 4) exists-unscoped helpers present, SECURITY DEFINER, EXECUTE to authenticated (not PUBLIC).
SELECT p.proname, p.prosecdef,
       (SELECT string_agg(cfg, ', ') FROM unnest(p.proconfig) cfg) AS settings,
       pg_catalog.array_to_string(p.proacl, ' ') AS acl
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname IN ('dottie_finding_exists_unscoped','dottie_flag_exists_unscoped')
 ORDER BY p.proname;   -- expect prosecdef=t, search_path=public, authenticated=X (not PUBLIC)

-- 5) Key constraints: findings verdict/target_kind/confidence CHECKs; flags flag_type/severity/status CHECKs + FK cascade.
SELECT t.relname, c.conname, pg_get_constraintdef(c.oid) AS def
  FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid JOIN pg_namespace n ON n.oid=t.relnamespace
 WHERE n.nspname='public' AND t.relname IN ('dottie_findings','dottie_flags')
   AND c.contype IN ('c','f')
 ORDER BY t.relname, c.contype, c.conname;
 -- expect findings: verdict IN (concur,caution,challenge), target_kind IN (theo_answer,workpaper,context_item,conversation),
 --        confidence_level 0..1-or-null; flags: flag_type IN (…5…), severity IN (low,medium,high), status IN (open,resolved),
 --        finding_id FK → dottie_findings ON DELETE CASCADE, conversation_id FK → dottie_conversations ON DELETE SET NULL.

-- 6) Array columns default '{}' (not NULL) so list rendering never NPEs on authorities/flags/docs_expected.
SELECT column_name, data_type, is_nullable, column_default
  FROM information_schema.columns
 WHERE table_schema='public' AND table_name='dottie_findings'
   AND column_name IN ('authorities','flags','docs_expected')
 ORDER BY column_name;   -- expect each: ARRAY, NO, '{}'::text[]

-- 7) The two list indexes the Overview/Checks/Flags surfaces rely on exist.
SELECT indexname
  FROM pg_indexes
 WHERE schemaname='public'
   AND indexname IN ('idx_dottie_findings_created_by_created_desc','idx_dottie_flags_owner_status_created_desc')
 ORDER BY indexname;   -- expect 2 rows
