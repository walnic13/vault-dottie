-- dottie_d1_migration.sql
-- Dottie Phase D1 — the conversation surface + Dottie-L1 (the consensual 1:1 relationship) memory substrate.
-- Additively namespaced `dottie_*` in the shared `vaultgpt` Postgres (schema `public`), mirroring the DEPLOYED
-- Theo idioms byte-faithfully: theo_conversations / theo_messages (b2_migration.sql, blob 2f2b6ddf) PLUS the
-- deployed theo_conversations addenda — last_opened_at + its restore-on-reopen index (migration blob 19114f8a)
-- and starred (migration blob 352600fa) — plus theo_user_memory (b7a_migration.sql, blob bbb66f45). Four ownership RLS policies per table
-- (created_by = auth.uid(), the Entra OID); `_exists_unscoped` SECURITY DEFINER helpers for 403/404
-- discrimination. Per-user isolation is ALSO enforced by explicit `created_by = $oid` predicates in the D2
-- handlers (the shared Functions role bypasses RLS — RLS is defence-in-depth), exactly as Theo.
-- Dottie-L1 (dottie_user_memory) = Dottie's OWN 1:1 relationship memory (Vault Memory Architecture §A
-- Amendment 9) — SEPARATE from Theo's L1; the two personal memories never cross. Dottie-L2 (level) / L3
-- (firm/governance) are their own later tables; Dottie's reads of Theo's shared L1.5/L2/L3 go through the
-- access-policy engine (theo_can_read), never duplicated here.
-- Executor: Walter, as pgadmin_vault. Additive; CREATE ... IF NOT EXISTS / CREATE OR REPLACE; NO top-level
-- BEGIN/COMMIT (Golden Handler §5.2); idempotent + reversible (footer).

-- ─────────────────────────────────────────────────────────────────────────────────────────────
-- 1) dottie_conversations — Dottie chat threads (mirrors theo_conversations, minus project/publish/app-context)
-- ─────────────────────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dottie_conversations (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by     text NOT NULL,
  title          text NULL,
  model          text NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  last_opened_at timestamptz NULL,
  starred        boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_dottie_conversations_created_by
  ON public.dottie_conversations (created_by);
-- byte-faithful to the deployed Theo restore-on-reopen index (created_by, last_opened_at desc) — the list
-- query supplies NULLS LAST at ORDER BY time, exactly as Theo (the index itself carries no NULLS LAST).
CREATE INDEX IF NOT EXISTS idx_dottie_conversations_created_by_last_opened_desc
  ON public.dottie_conversations (created_by, last_opened_at desc);

ALTER TABLE public.dottie_conversations ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_conversations' AND policyname='dottie_conversation_select_own') THEN
    CREATE POLICY "dottie_conversation_select_own" ON public.dottie_conversations FOR SELECT TO authenticated USING (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_conversations' AND policyname='dottie_conversation_insert_own') THEN
    CREATE POLICY "dottie_conversation_insert_own" ON public.dottie_conversations FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_conversations' AND policyname='dottie_conversation_update_own') THEN
    CREATE POLICY "dottie_conversation_update_own" ON public.dottie_conversations FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_conversations' AND policyname='dottie_conversation_delete_own') THEN
    CREATE POLICY "dottie_conversation_delete_own" ON public.dottie_conversations FOR DELETE TO authenticated USING (created_by = auth.uid());
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.dottie_conversation_exists_unscoped(p_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.dottie_conversations WHERE id = p_id);
$$;
REVOKE ALL ON FUNCTION public.dottie_conversation_exists_unscoped(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.dottie_conversation_exists_unscoped(uuid) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────────────────────
-- 2) dottie_messages — immutable turns (mirrors theo_messages; no updated_at; UNIQUE per-conversation seq)
-- ─────────────────────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dottie_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by      text NOT NULL,
  conversation_id uuid NOT NULL REFERENCES public.dottie_conversations(id) ON DELETE CASCADE,
  seq             integer NOT NULL,
  role            text NOT NULL CHECK (role IN ('user','assistant')),
  content         text NOT NULL,
  model           text NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (conversation_id, seq)
);
CREATE INDEX IF NOT EXISTS idx_dottie_messages_conversation_id ON public.dottie_messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_dottie_messages_created_by ON public.dottie_messages (created_by);

ALTER TABLE public.dottie_messages ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_messages' AND policyname='dottie_message_select_own') THEN
    CREATE POLICY "dottie_message_select_own" ON public.dottie_messages FOR SELECT TO authenticated USING (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_messages' AND policyname='dottie_message_insert_own') THEN
    CREATE POLICY "dottie_message_insert_own" ON public.dottie_messages FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_messages' AND policyname='dottie_message_update_own') THEN
    CREATE POLICY "dottie_message_update_own" ON public.dottie_messages FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_messages' AND policyname='dottie_message_delete_own') THEN
    CREATE POLICY "dottie_message_delete_own" ON public.dottie_messages FOR DELETE TO authenticated USING (created_by = auth.uid());
  END IF;
END $$;
-- (No _exists_unscoped: dottie_messages are immutable + cascade-delete only — mirrors theo_messages.)

-- ─────────────────────────────────────────────────────────────────────────────────────────────
-- 3) dottie_user_memory — Dottie-L1: the consensual 1:1 relationship memory (mirrors theo_user_memory,
--    USER-SCOPED only; no project scope — Dottie-L2/L3 are their own later tables)
-- ─────────────────────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dottie_user_memory (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by             text NOT NULL,
  kind                   text NOT NULL DEFAULT 'fact',
  content                text NOT NULL CHECK (length(trim(content)) > 0),
  source_conversation_id uuid NULL REFERENCES public.dottie_conversations(id) ON DELETE SET NULL,
  salience               int  NOT NULL DEFAULT 0,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dottie_user_memory_created_by ON public.dottie_user_memory (created_by);
CREATE INDEX IF NOT EXISTS idx_dottie_user_memory_owner_salience ON public.dottie_user_memory (created_by, salience DESC);

ALTER TABLE public.dottie_user_memory ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_user_memory' AND policyname='dottie_user_memory_select_own') THEN
    CREATE POLICY "dottie_user_memory_select_own" ON public.dottie_user_memory FOR SELECT TO authenticated USING (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_user_memory' AND policyname='dottie_user_memory_insert_own') THEN
    CREATE POLICY "dottie_user_memory_insert_own" ON public.dottie_user_memory FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_user_memory' AND policyname='dottie_user_memory_update_own') THEN
    CREATE POLICY "dottie_user_memory_update_own" ON public.dottie_user_memory FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_user_memory' AND policyname='dottie_user_memory_delete_own') THEN
    CREATE POLICY "dottie_user_memory_delete_own" ON public.dottie_user_memory FOR DELETE TO authenticated USING (created_by = auth.uid());
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.dottie_user_memory_exists_unscoped(p_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.dottie_user_memory WHERE id = p_id);
$$;
REVOKE ALL ON FUNCTION public.dottie_user_memory_exists_unscoped(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.dottie_user_memory_exists_unscoped(uuid) TO authenticated;

-- ── Reversal (documented; run only to roll back — additive tables/functions) ──────────────────────────
-- DROP FUNCTION IF EXISTS public.dottie_user_memory_exists_unscoped(uuid);
-- DROP FUNCTION IF EXISTS public.dottie_conversation_exists_unscoped(uuid);
-- DROP TABLE IF EXISTS public.dottie_user_memory;
-- DROP TABLE IF EXISTS public.dottie_messages;
-- DROP TABLE IF EXISTS public.dottie_conversations;
