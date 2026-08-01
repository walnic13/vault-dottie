-- dottie_d1_verify.sql — READ-ONLY verification for Dottie Phase D1. No writes; safe to re-run.

-- 1) The three tables exist.
SELECT table_name
  FROM information_schema.tables
 WHERE table_schema='public' AND table_name IN ('dottie_conversations','dottie_messages','dottie_user_memory')
 ORDER BY table_name;   -- expect 3 rows

-- 2) RLS enabled on all three.
SELECT relname, relrowsecurity
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname='public' AND relname IN ('dottie_conversations','dottie_messages','dottie_user_memory')
 ORDER BY relname;   -- expect relrowsecurity = t for all

-- 3) Four ownership policies per table (created_by = auth.uid()).
SELECT tablename, policyname, cmd
  FROM pg_policies
 WHERE schemaname='public' AND tablename IN ('dottie_conversations','dottie_messages','dottie_user_memory')
 ORDER BY tablename, policyname;   -- expect 4 per table (select/insert/update/delete _own)

-- 4) exists-unscoped helpers present (conversations + user_memory; NOT messages), SECURITY DEFINER, EXECUTE to authenticated.
SELECT p.proname, p.prosecdef,
       (SELECT string_agg(cfg, ', ') FROM unnest(p.proconfig) cfg) AS settings,
       pg_catalog.array_to_string(p.proacl, ' ') AS acl
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname IN ('dottie_conversation_exists_unscoped','dottie_user_memory_exists_unscoped')
 ORDER BY p.proname;   -- expect prosecdef=t, search_path=public, authenticated=X (not PUBLIC)

-- 5) Key constraints: dottie_messages role CHECK + UNIQUE(conversation_id,seq) + FK cascade; content non-empty.
SELECT c.conname, pg_get_constraintdef(c.oid) AS def
  FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid JOIN pg_namespace n ON n.oid=t.relnamespace
 WHERE n.nspname='public' AND t.relname IN ('dottie_messages','dottie_user_memory')
   AND c.contype IN ('c','u','f')
 ORDER BY t.relname, c.contype, c.conname;
