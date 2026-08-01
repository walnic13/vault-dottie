# Dottie Phase D1 — Conversation + Dottie-L1 Memory Schema Foundation — Pass-1 VEP

First schema VEP of Dottie's fuller build ([[VAULT_MEMORY_ARCHITECTURE.md]] §A **Amendment 9** — Dottie a full independent agent with its OWN layered memory, heavily Theo-derived). Delivers the `dottie_*` **conversation surface + Dottie-L1 (the consensual 1:1 relationship) memory** — three tables (`dottie_conversations`, `dottie_messages`, `dottie_user_memory`) + RLS + `_exists_unscoped` helpers, mirroring the DEPLOYED Theo b2 (`theo_conversations`/`theo_messages`) + b7a (`theo_user_memory`) idioms **byte-faithfully**, additively namespaced `dottie_*` in the shared `vaultgpt` Postgres. **Migration-only — Walter-run (`pgadmin_vault`); NO handler.** Dottie-L1 is **SEPARATE from Theo's L1** (Amendment 9 — the two personal memories never cross). Dottie-L2 (level) / L3 (firm/governance) are later tables; Dottie's reads of Theo's shared L1.5/L2/L3 go through the access-policy engine, never duplicated here.

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Verified Evidence Pack (backend implementation package — schema migration, no handler)
Grounding parent (source baseline): `50761a40bb8a8d7da62bc3318a5cad1dc5baebeb` (vault-dottie, `development`) — this package is carried at a later reviewed commit named only in the Codex activation note; currency anchors below are tip-independent blob SHAs
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD) |
| - | ------------------------------- | ------------------------------ | --------------------------------- |
| 1 | GOVERNING VISION — `governance/VAULT_MEMORY_ARCHITECTURE.md` (§A Amendment 9 — Dottie full agent, own layered memory Dottie-L1/L2/L3, refined L1 invariant; §1 the layered model) | `Read`(§A9/§1) this turn | `3afda098df614b11adc8a7cdcf28d0f9a3f47011` |
| 2 | Backend Governor — `governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md` (§3 Never-Guess; §4 Schema Reality Lock; §8 VEP format + Gap Register) | `Grep("Never-Guess")` + `Grep("Schema Reality Lock")` this turn | `e44cdd85d3d0e5df332dc754cdec731e2e68022e` |
| 3 | Grounding Conformance — `governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR; §5 Rule Anchor) | `Grep("MUST open with a Grounding Conformance Receipt")` this turn | `7c0d902bdff3b6c0af475b483e31ed796214e57b` |
| 4 | Golden Handler — `governance/THEO_GOLDEN_HANDLER_STANDARD.md` (Golden SQL: SECURITY DEFINER helper idiom; §5.2 no top-level transaction control) | `Grep("SECURITY DEFINER")` + `Grep("transaction control")` this turn | `f8f0e5ea36447502e35fb87b373c94e376f05cbb` |
| 5 | Execution Orchestration — `governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md` (§1C Walter-runs-migrations; §1D ordered pass) | `Grep("migrations/merges remain Walter-only")` this turn | `565559b699c1309f8e750b0dbbac859c13d807c8` |
| 6 | DEPLOYED MIRROR SOURCE — `vault-theo` `Codex Governance/Theo-1B-B2-Persistence-Substrate-Pass-1-VEP/b2_migration.sql` (theo_conversations/theo_messages DDL, 4-policy RLS, `theo_conversation_exists_unscoped`) | survey (paths + verbatim DDL) this turn | vault-theo `2f2b6ddf8bf87525bc1a43e34bb7f82351a54b7c` |
| 7 | DEPLOYED MIRROR SOURCE — `vault-theo` `Codex Governance/Theo-1B-B7a-Memory-Substrate-Schema-Pass-1-VEP/b7a_migration.sql` (theo_user_memory DDL, RLS, `theo_user_memory_exists_unscoped`) | survey (paths + verbatim DDL) this turn | vault-theo `bbb66f45d5b598bf104499f32b3812af41c64e26` |

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt" | GCR (head) |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §3 | "Never-Guess" | §3 — DDL mirrored from deployed b2/b7a, not invented |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §4 | "Schema Reality Lock" | §3 — byte-faithful to the deployed Theo shapes |
| governance/THEO_GOLDEN_HANDLER_STANDARD.md | Golden SQL | "SECURITY DEFINER" | §4 — the `_exists_unscoped` helper idiom |
| governance/THEO_GOLDEN_HANDLER_STANDARD.md | §5.2 | "transaction control" | §4 — no top-level BEGIN/COMMIT |
| governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md | §1C | "migrations/merges remain Walter-only" | §8 — Walter runs the migration |
| governance/VAULT_MEMORY_ARCHITECTURE.md | §A-9 | "consensual 1:1 relationship" | §1/§2 — Dottie-L1 = dottie_user_memory |

---

## §1 — Feature + design

**Feature.** Three additive tables (+ RLS + helpers) in the shared `vaultgpt` Postgres, the `dottie_*` foundation:
- **`dottie_conversations`** — Dottie chat threads. Mirrors `theo_conversations` **minus** project/publish/app-context columns (Dottie is not project-linked): `id`, `created_by`, `title`, `model`, `created_at`, `updated_at`, `last_opened_at`, `starred`.
- **`dottie_messages`** — immutable turns. Mirrors `theo_messages`: `id`, `created_by`, `conversation_id` (FK→`dottie_conversations` ON DELETE CASCADE), `seq`, `role` CHECK `('user','assistant')`, `content`, `model`, `created_at`, UNIQUE `(conversation_id, seq)`.
- **`dottie_user_memory`** — **Dottie-L1**: the consensual 1:1 relationship memory (Amendment 9's `"consensual 1:1 relationship"`). Mirrors `theo_user_memory` **user-scoped only** (no `scope`/`project_id` — Dottie-L2/L3 are their own later tables): `id`, `created_by`, `kind`, `content` (non-empty CHECK), `source_conversation_id` (FK→`dottie_conversations` ON DELETE SET NULL), `salience`, timestamps.

Each carries the deployed **4-policy ownership RLS** (`created_by = auth.uid()`); `dottie_conversations` + `dottie_user_memory` get `_exists_unscoped` SECURITY DEFINER helpers (for the D2 handlers' 403/404 discrimination); `dottie_messages` has none (immutable + cascade-only, exactly as `theo_messages`).

## §2 — Architecture & boundary reconciliation

**Dottie's own memory (Amendment 9).** This is the substrate for Dottie's OWN layered memory — starting with the conversation surface + **Dottie-L1** (`dottie_user_memory`). It is heavily Theo-derived (same table shapes, same RLS, same helper idiom) but **Dottie's own data**, additively namespaced `dottie_*`.

**The L1 invariant (Amendment 9), enforced by construction.** Dottie-L1 (`dottie_user_memory`) is **SEPARATE from Theo's L1** (`theo_user_memory`) — different tables, different data; the two personal memories **never cross**. This migration touches **no `theo_*` object** and reads no Theo data. Dottie's future reads of Theo's shared L1.5/L2/L3 (the observational + second-opinion role) go through the **access-policy engine** (`theo_can_read`), and are **never** a copy into `dottie_*`.

**Scope (D1 only).** The conversation + Dottie-L1 substrate. Dottie-L2 (level/expectation) + Dottie-L3 (firm/governance) tables are Phase D5. The handlers that USE these tables (`dottie_message` send/persist, list/get, memory CRUD + distillation) are Phases D2/D3. Boundary: net-new additive `dottie_*` tables + two helper functions; no `theo_*`/`reporting_*` touched; no existing object altered.

## §3 — Schema Reality Lock (deployed grounding)

Byte-faithful to the DEPLOYED Theo shapes (Governor §3/§4) — nothing invented:
- **`dottie_conversations`/`dottie_messages`** mirror `theo_conversations`/`theo_messages` (b2, blob `2f2b6ddf`): the exact column set (Dottie drops the project/publish/app-context/citations/media columns it doesn't use yet), the base `seq`/`UNIQUE(conversation_id,seq)`/immutable-messages shape, the 4-policy `_own` RLS naming, and the `_exists_unscoped` SECURITY DEFINER helper (`LANGUAGE sql SET search_path = public`, REVOKE PUBLIC/GRANT authenticated).
- **`dottie_user_memory`** mirrors `theo_user_memory` (b7a, blob `bbb66f45`): `kind`/`content` (non-empty CHECK)/`source_conversation_id`/`salience`/timestamps + 4-policy RLS + exists helper. Dottie omits `scope`/`project_id` (+ its `scope_project_ck`) because Dottie-L1 is user-scoped only; the plate lens (§7.5) is Theo's life-integration feature, not Dottie's.
- **Idioms:** additive `CREATE ... IF NOT EXISTS` / `CREATE OR REPLACE`; policies guarded by `DO $$ … IF NOT EXISTS (SELECT 1 FROM pg_policies …)`; **no top-level `BEGIN`/`COMMIT`** (§5.2); RLS is defence-in-depth (the D2 handlers also filter `created_by = $oid`, mirroring Theo).

## §4 — The migration (Walter runs as `pgadmin_vault`)

Runnable file: `dottie_d1_migration.sql`. Additive; idempotent; **no top-level `BEGIN`/`COMMIT`** (Golden Handler §5.2); reversible (commented footer). Full text:

```sql
-- dottie_d1_migration.sql
-- Dottie Phase D1 — the conversation surface + Dottie-L1 (the consensual 1:1 relationship) memory substrate.
-- Additively namespaced `dottie_*` in the shared `vaultgpt` Postgres (schema `public`), mirroring the DEPLOYED
-- Theo idioms byte-faithfully: theo_conversations / theo_messages (b2_migration.sql, blob 2f2b6ddf) +
-- theo_user_memory (b7a_migration.sql, blob bbb66f45). Four ownership RLS policies per table
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
CREATE INDEX IF NOT EXISTS idx_dottie_conversations_created_by_last_opened_desc
  ON public.dottie_conversations (created_by, last_opened_at DESC NULLS LAST);

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
```

## §5 — No handler (migration-only)

This package ships **no handler** — D1 is the schema foundation. The `dottie_message` send/persist, list/get, and memory CRUD + distillation handlers are Phases D2/D3 (mirroring the deployed `theo_message`/`theo_get_conversation`/`theo_list_conversations`/`theo_distill_memory`). No `SECURITY DEFINER` function beyond the two `_exists_unscoped` helpers (the Golden SQL helper idiom).

## §6 — Verification (read-only; no golden curls — no handler)

Runnable file: `dottie_d1_verify.sql` (catalog only). Post-migration checks: (1) the three tables present; (2) RLS enabled on all three; (3) four `_own` policies per table; (4) the two `_exists_unscoped` helpers (`prosecdef=t`, `search_path=public`, EXECUTE to `authenticated` not `PUBLIC`); (5) key constraints (`dottie_messages` role CHECK + UNIQUE(conversation_id,seq) + FK cascade; `dottie_user_memory` content non-empty + FK set-null). Claude runs it read-only after Walter's migration (shared-instance `codex_reporting_ro` catalog path). Full text:

```sql
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
```

## §7 — Gap Register

**PROCEED.** No missing CURRENT authority; no ESCALATE.
- **G-1 (Dottie-L2/L3 tables): PROCEED (deferred, by design)** — level/firm-knowledge layers are Phase D5; D1 is the conversation + Dottie-L1 substrate (Amendment 9's build order).
- **G-2 (handlers): PROCEED (Phases D2/D3)** — the send/persist/list/get + memory CRUD + distillation handlers mirror the deployed Theo handlers; separate VEPs.
- **G-3 (Theo columns Dottie omits — project/publish/app-context/citations/media/scope/plate): PROCEED** — deliberately dropped as out-of-scope for Dottie's conversation + Dottie-L1 role; addable additively later if a feature needs them.
- **G-SCHEMADOC: PRE-LAND (Role-C, post-migration)** — the `dottie_*` tables are recorded in a `vault-dottie` schema doc via Role-C after the Walter-run migration + read-only verification. Disclosed; does not block Pass-2.

## §8 — Deploy plan (ordered; §1C/§1D)

1. **Codex Pass-2** → APPROVED/REJECTED.
2. **Walter** runs `dottie_d1_migration.sql` as `pgadmin_vault` (DB migrations remain Walter-only).
3. **Claude** runs `dottie_d1_verify.sql` read-only (catalog) to confirm.
4. **Role-C** records the `dottie_*` schema in the vault-dottie docs (G-SCHEMADOC). No API-Spec change (no endpoint).

## Codex activation note (Walter forwards)

```
Codex is activated for Pass-2 review of Dottie Phase D1 (conversation + Dottie-L1 memory schema), vault-dottie,
"Codex Governance/Dottie-D1-Schema-Foundation-Pass-1-VEP/Dottie_D1_Schema_Foundation_VEP.md".
Open your Pass-2 turn with a governance-bound Grounding Conformance Receipt + Rule Anchor Table (standards
mirrored into vault-dottie). Migration-only package (Walter-run additive tables; NO handler, NO golden curls —
read-only catalog verification). Review for: (1) Schema Reality Lock — are dottie_conversations/dottie_messages/
dottie_user_memory byte-faithful to the deployed theo b2/b7a shapes (column set, seq/UNIQUE, immutable messages,
4-policy _own RLS naming, _exists_unscoped SECURITY DEFINER helper), and are the Theo columns Dottie omits
(project/publish/app-context/citations/media/scope/plate) correctly out-of-scope not accidental drops? (2)
Amendment 9 boundary — Dottie-L1 (dottie_user_memory) is SEPARATE from Theo's L1; the migration touches no theo_*
object; Dottie reads Theo's shared layers via the engine, never duplicated. (3) additive/idempotent/reversible,
no top-level BEGIN/COMMIT (§5.2); RLS + defence-in-depth predicate posture. (4) the deploy plan — Walter-runs-
migration / Claude read-only verify / schema-doc Role-C deferred. Emit APPROVED or REJECTED only.
```
