# Dottie — Azure Postgres Schema (deployed truth)

Dottie's `dottie_*` schema in the shared `vaultgpt` Postgres instance (`vaultgpt-postgres-prod`, schema `public`), alongside `theo_*` and `reporting_*`. Dottie is a full independent agent with its OWN layered memory ([[VAULT_MEMORY_ARCHITECTURE.md]] §A Amendment 9); this doc records the DEPLOYED `dottie_*` DDL only. **Dottie's memory NEVER crosses Theo's L1** — `dottie_*` is separate data; Dottie reads Theo's shared L1.5/L2/L3 through the access-policy engine (`theo_can_read`), never duplicated here.

## §1 Conventions

- `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`, `created_by text NOT NULL` (Entra OID), `created_at`/`updated_at timestamptz NOT NULL DEFAULT now()`; immutable tables omit `updated_at`.
- Four ownership RLS policies per table, `TO authenticated`, keyed on `created_by = auth.uid()` — SELECT `USING`, INSERT `WITH CHECK`, UPDATE `USING`+`WITH CHECK`, DELETE `USING`; policy names `dottie_<entity>_<verb>_own`.
- Per-user isolation is ALSO enforced by explicit `created_by = $oid` predicates in the handlers (the shared Functions connection role bypasses RLS) — RLS is defence-in-depth. Mirrors the deployed Theo posture.
- `_exists_unscoped(uuid) RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public` + `REVOKE ALL FROM PUBLIC` / `GRANT EXECUTE TO authenticated` — for handler 403/404 discrimination on individually-addressable rows.

## §2 Boundary (BINDING)

`dottie_*` tables are net-new and additively namespaced in the shared `vaultgpt` instance. Dottie MUST NOT read or write `reporting_*`. Dottie MUST NOT read or write **`theo_user_memory`** (Theo's L1 — inviolable, Amendment 9): Dottie's own 1:1 lives in `dottie_user_memory`; the two personal memories never cross. Dottie's reads of Theo's shared layers (L1.5 `theo_project_context_items`, future L2/L3) go through the access-policy engine (`theo_can_read`), never via direct table access here.

## §3 Structural Table Set

| Table | Purpose | Notes | Status |
|-------|---------|-------|--------|
| `dottie_conversations` | Dottie chat thread | `title text NULL`, `model text NULL`, `last_opened_at timestamptz NULL` (restore-on-reopen), `starred boolean NOT NULL DEFAULT false`. Mirrors `theo_conversations` (b2) minus project/publish/app-context, plus the deployed last-opened + star addenda. | DEPLOYED — D1 (§4) |
| `dottie_messages` | Turn within a thread | `conversation_id` FK→`dottie_conversations` ON DELETE CASCADE; `seq int` (UNIQUE per conversation), `role text` CHECK `('user','assistant')`, `content text`, `model text NULL`. Immutable — no `updated_at`. Mirrors `theo_messages` (b2). | DEPLOYED — D1 (§4) |
| `dottie_user_memory` | **Dottie-L1** — the consensual 1:1 relationship memory | `kind text` (DEFAULT `'fact'`), `content text` (non-empty CHECK), `source_conversation_id uuid NULL` FK→`dottie_conversations` ON DELETE SET NULL, `salience int`. User-scoped only (no `scope`/`project_id`/`plate`). Mirrors `theo_user_memory` (b7a). **SEPARATE from Theo's L1 — never crosses.** | DEPLOYED — D1 (§4) |

## §4 DEPLOYED DDL — Dottie Phase D1: conversation + Dottie-L1 memory (2026-08-01)

**Status:** DEPLOYED against `vaultgpt-postgres-prod` (schema `public`; run by Walter as `pgadmin_vault` 2026-08-01). Read-only-verified (catalog): the three tables `dottie_conversations` / `dottie_messages` / `dottie_user_memory` present, RLS enabled on all three with four `TO authenticated` `_own` policies each (12 total); `dottie_conversation_exists_unscoped(uuid)` + `dottie_user_memory_exists_unscoped(uuid)` present (`prosecdef=t`, `search_path=public`, EXECUTE to `authenticated` not `PUBLIC`); constraints — `dottie_messages` role CHECK `('user','assistant')` + UNIQUE `(conversation_id, seq)` + FK→`dottie_conversations` ON DELETE CASCADE, `dottie_user_memory` content non-empty + FK→`dottie_conversations` ON DELETE SET NULL; `dottie_conversations.last_opened_at` (timestamptz, nullable) + `starred` (boolean NOT NULL DEFAULT false) + the restore index `idx_dottie_conversations_created_by_last_opened_desc`.

**Canonical DDL (single source of truth):** `Codex Governance/Dottie-D1-Schema-Foundation-Pass-1-VEP/dottie_d1_migration.sql` (Codex-APPROVED at `37d2b02`; deployed by Walter). Additive `CREATE ... IF NOT EXISTS` / `CREATE OR REPLACE`; idempotent + reversible (commented footer); no top-level `BEGIN`/`COMMIT` (Golden Handler §5.2). Read-only verification `…/dottie_d1_verify.sql`. Not duplicated here.

**As-built specifics (Dottie's conversation surface + Dottie-L1, mirroring the deployed Theo b2/b7a idioms byte-faithfully):** `dottie_conversations` mirrors `theo_conversations` (b2) minus the project/publish/app-context/citations/media columns Dottie doesn't use, PLUS the deployed `theo_conversations` addenda — `last_opened_at` + the restore-on-reopen index `(created_by, last_opened_at desc)` (byte-faithful to the deployed Theo index; the list query supplies `NULLS LAST` at `ORDER BY` time) and `starred`. `dottie_messages` mirrors `theo_messages` exactly (immutable; `seq` UNIQUE per conversation; cascade-delete; no `_exists_unscoped` helper — immutable + cascade-only). `dottie_user_memory` is **Dottie-L1** — the consensual 1:1 relationship memory (Amendment 9): mirrors `theo_user_memory` (b7a) **user-scoped only** (no `scope`/`project_id`/`scope_project_ck`, no `plate` — those are Theo features), keeping `kind`/`content` (non-empty CHECK)/`source_conversation_id`/`salience`/timestamps + the 4-policy RLS + exists helper. Dottie-L2 (level/expectation) + Dottie-L3 (firm/governance) are separate later tables. Boundary: net-new additive `dottie_*` tables + two helper functions; no `theo_*`/`reporting_*` object touched; Dottie-L1 is separate from Theo's L1 (`theo_user_memory`) — the two personal memories never cross. The handlers that use these tables (`dottie_message` send/persist, list/get, memory CRUD + distillation) are Phases D2/D3.
