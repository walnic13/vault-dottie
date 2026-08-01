# Dottie Attachments Schema — Pass-1 VEP (dottie_attachments migration)

Schema half of the attachments build-out (`spec/DOTTIE_THEO_RECONCILIATION.md` §D). The transplanted FE has a full attachment surface (paperclip, upload, reload-parity chips) but Dottie has no `dottie_attachments` table, so it is gated off today. This package lands that table — a **byte-faithful mirror of the deployed `theo_attachments`** (Tier B8a base + B8c extraction columns + B8i reload-parity column, consolidated into one net-new `CREATE TABLE`). The paired **handlers** package (`dottie_create_attachment_upload` / `dottie_finalize_attachment` / `dottie_delete_attachment` / `dottie_list_conversation_attachments`) is a separate Pass-1 VEP that grounds against THIS table once deployed — the Golden Handler Schema Reality Lock requires the handlers reference a **deployed** table, which is why schema lands first (mirroring Theo's B8a→B8b split). **Migration only** (Walter runs it as `pgadmin_vault`); no handler, no blob, no FE change in this package.

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Verified Evidence Pack (schema migration)
Grounding parent (source baseline): `4aad2cf3bbb677908f5e36272a47c99b4e70b302` (vault-dottie, `development`) — anchors below are tip-independent blob SHAs
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD) |
| - | ------------------------------- | ------------------------------ | --------------------------------- |
| 1 | GOVERNING VISION — `governance/VAULT_MEMORY_ARCHITECTURE.md` (§A Amendment 9 — Dottie full agent; net-new `dottie_*` tables, never touch `theo_*`) | `Read`(§A9) this turn | `3afda098df614b11adc8a7cdcf28d0f9a3f47011` |
| 2 | Backend Governor — `governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md` (§3 Never-Guess; §4 Schema Reality Lock) | `Grep("Never-Guess")` this turn | `e44cdd85d3d0e5df332dc754cdec731e2e68022e` |
| 3 | Grounding Conformance — `governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR; §5 Rule Anchor) | `Grep("MUST open with a Grounding Conformance Receipt")` this turn | `7c0d902bdff3b6c0af475b483e31ed796214e57b` |
| 4 | Golden Handler — `governance/THEO_GOLDEN_HANDLER_STANDARD.md` (§4 EXACT mirror / allowed delta; §5.2 migrations carry no top-level BEGIN/COMMIT) | `Grep("EXACT mirror")` this turn | `f8f0e5ea36447502e35fb87b373c94e376f05cbb` |
| 5 | Execution Orchestration — `governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md` (§1D ordered pass; migrations run by Walter as pgadmin_vault) | `Grep("ordered, non-skippable")` this turn | `565559b699c1309f8e750b0dbbac859c13d807c8` |
| 6 | DEPLOYED D1 SCHEMA — `spec/DOTTIE_AZURE_POSTGRES_SCHEMA.md` (the FK parent `dottie_conversations`; the `dottie_*` RLS + exists-helper idiom this table mirrors) | `Read` this turn | `bb096db53a8d76dc3589b3744f6492ddad8f1f7f` |
| 7 | **PRIMARY REFERENCE (DEPLOYED migration) — `theo_attachments` base** — `vault-theo/Codex Governance/Theo-1B-B8a-Attachments-Schema-Pass-1-VEP/b8a_migration.sql` | `Read`(full) this turn; inlined §4 | `cc61acf1bbb2187260fd88232b92e445141ea395` |
| 8 | **PRIMARY REFERENCE (DEPLOYED migration) — B8c addendum** — `vault-theo/Codex Governance/Theo-1B-B8c-Attachment-Extraction-Pass-1-VEP/b8c_addendum.sql` (`ingestion_class`, `extracted_text_path`) | `Read`(full) this turn; inlined §4 | `e3cdb948643cc4e50c8ea4fc7b428825f4ca6021` |
| 9 | **PRIMARY REFERENCE (DEPLOYED migration) — B8i addendum** — `vault-theo/Codex Governance/Theo-1B-B8i-Reload-Parity-Backend-Pass-1-VEP/b8i_addendum.sql` (`message_seq`) | `Read`(full) this turn; inlined §4 | `62c432bf9eeac2eae12fca547cc71a7c444ce1cb` |

No ChatGPT advisory cited. No `reporting_*` / `theo_*` object touched. Migration package (Walter runs; no handler, no write SQL by Claude).

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt" | GCR (head) |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §4 | "Schema Reality Lock" | §3 — the FK parent `dottie_conversations` is DEPLOYED D1; nothing invented |
| governance/THEO_GOLDEN_HANDLER_STANDARD.md | §4 | "EXACT mirror" | §3 — `dottie_attachments` EXACT-mirrors the deployed `theo_attachments` (allowed delta: `theo_`→`dottie_` names + FK parent + container comment) |
| governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md | §1D | "ordered, non-skippable" | §7 — Codex → Walter runs migration → verify → handlers package |

---

## §1 — Feature
One net-new table `public.dottie_attachments`: the per-file metadata + Blob pointer for files attached to a Dottie chat. Columns (12): `id uuid PK`, `created_by text`, `conversation_id uuid NULL` (FK→`dottie_conversations` ON DELETE SET NULL), `filename text` (non-empty CHECK), `content_type text`, `byte_size bigint` (≥0 CHECK), `blob_container text`, `blob_path text`, `created_at timestamptz`, `ingestion_class text` (native|extract|stored), `extracted_text_path text`, `message_seq int`. Two indexes (`created_by`, `conversation_id`); RLS with four `TO authenticated` ownership policies; `dottie_attachment_exists_unscoped(uuid)` SECURITY DEFINER helper (403/404 discrimination for the handlers). The file body lives in Azure Blob (`dottie-content` on `vaultgptdottiestore`); this row holds the pointer + metadata only.

## §2 — Architecture & boundary
Additive net-new `dottie_*` table on the shared `vaultgpt-postgres-prod` (schema `public`). Mirrors the deployed `dottie_*` idiom (D1): RLS `TO authenticated` keyed on `created_by = auth.uid()` + a SECURITY DEFINER exists-helper. FK to the DEPLOYED D1 table `dottie_conversations(id)` ON DELETE SET NULL (attachments survive an unlinked conversation, byte-faithful to `theo_attachments`). No `theo_*`/`reporting_*` object touched; no RLS change to any existing table; no data backfill. Idempotent (`CREATE TABLE IF NOT EXISTS`, guarded `CREATE POLICY`, `CREATE OR REPLACE FUNCTION`). No top-level BEGIN/COMMIT (Golden §5.2). Run by Walter as `pgadmin_vault`.

## §3 — Schema Reality Lock + Structural Mirror Table (Governor §4 / Golden §4)
FK parent `dottie_conversations(id)` is DEPLOYED (D1, schema doc §3/§4, GCR row 6, catalog-verified). `gen_random_uuid()`, `auth.uid()`, and the RLS/exists-helper idiom are the same primitives D1 already uses. Nothing invented.

`dottie_attachments` is the consolidated EXACT mirror of the deployed `theo_attachments` (base b8a + b8c + b8i). Every column, type, CHECK, index, policy, and the helper are identical; the ONLY deltas are the `theo_`→`dottie_` identifiers and the FK parent:

| Region | Classification | Notes |
| ------ | -------------- | ----- |
| all 12 columns + types + CHECKs (`filename` non-empty, `byte_size >= 0`) + `created_at` default + `id` PK default `gen_random_uuid()` | **EXACT** | byte-identical to `theo_attachments` (base + b8c `ingestion_class`/`extracted_text_path` + b8i `message_seq`) |
| the four RLS policies (`select/insert/update/delete_own`, `TO authenticated`, `created_by = auth.uid()`) + `ENABLE ROW LEVEL SECURITY` | **EXACT** | same predicates; only the policy names carry the `dottie_` prefix |
| the two indexes + the `_exists_unscoped(uuid)` SECURITY DEFINER helper (`search_path=public`, `GRANT EXECUTE TO authenticated`) | **EXACT** | same shape; `dottie_` names |
| table/policy/index/helper NAMES (`theo_`→`dottie_`); the FK parent (`theo_conversations`→`dottie_conversations`); the container comment (`theo-content`→`dottie-content`) | **ALLOWED DELTA (adapted identity)** | the only changes; no structural difference |

No DEVIATION regions. Theo's B8a/B8c/B8i arrive as three files (a base + two `ALTER … ADD COLUMN` addenda accreted over time); Dottie consolidates them into one net-new `CREATE TABLE` with all columns inline — same end-state schema, no separate ALTERs needed because the table does not pre-exist.

## §4 — Migration (the deliverable) + primary references
### §4.1 `dottie_attachments_migration.sql` (Walter runs as pgadmin_vault)
```sql
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
GRANT EXECUTE ON FUNCTION public.dottie_attachment_exists_unscoped(uuid) TO authenticated;

COMMENT ON COLUMN public.dottie_attachments.ingestion_class IS
  'native | extract | stored — how the attachment is fed to the model. Free-text (no CHECK), mirrors theo_attachments B8c.';
COMMENT ON COLUMN public.dottie_attachments.extracted_text_path IS
  'Blob pointer (within blob_container) to the extracted text for extract-class attachments; NULL for native, or when extraction failed/has not run.';
COMMENT ON COLUMN public.dottie_attachments.message_seq IS
  'The dottie_messages.seq of the user turn this attachment was sent with; NULL if not sent in a message. Lets a reloaded thread show chips on the right message (B8i reload parity).';
```

### §4.2 Primary reference — deployed `theo_attachments` base (`b8a_migration.sql`, full-verbatim)
```sql
-- ============================================================================
-- Theo 1B — Tier B8a: theo_attachments (files attached to a chat; document/image RAG-to-model)
-- Target: shared `vaultgpt` Azure Postgres instance, schema `public`.
-- Plain PostgreSQL SQL; no top-level BEGIN/COMMIT (migration governance). Idempotent.
-- Mirrors the deployed theo_* idiom (Tier B2): four RLS policies TO authenticated keyed on
-- auth.uid() (= Entra OID in created_by) + a SECURITY DEFINER theo_attachment_exists_unscoped(uuid)
-- helper (403/404 discrimination for the B8b upload/delete handlers). The file body lives in Azure
-- Blob (the existing `theo-content` container); this row holds the Blob pointer + metadata only.
-- Per-user isolation is ALSO enforced by explicit `created_by = $oid` predicates in the B8 handlers
-- (the shared connection role enforces RLS via set_config; explicit filter is defence-in-depth).
-- FK to deployed B2 table theo_conversations.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.theo_attachments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by      text NOT NULL,
  conversation_id uuid NULL REFERENCES public.theo_conversations(id) ON DELETE SET NULL,
  filename        text NOT NULL CHECK (length(trim(filename)) > 0),
  content_type    text NOT NULL,
  byte_size       bigint NOT NULL CHECK (byte_size >= 0),
  blob_container  text NOT NULL,
  blob_path       text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_theo_attachments_created_by ON public.theo_attachments (created_by);
CREATE INDEX IF NOT EXISTS idx_theo_attachments_conversation ON public.theo_attachments (conversation_id);
ALTER TABLE public.theo_attachments ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='theo_attachments' AND policyname='theo_attachment_select_own') THEN
    CREATE POLICY "theo_attachment_select_own" ON public.theo_attachments FOR SELECT TO authenticated USING (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='theo_attachments' AND policyname='theo_attachment_insert_own') THEN
    CREATE POLICY "theo_attachment_insert_own" ON public.theo_attachments FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='theo_attachments' AND policyname='theo_attachment_update_own') THEN
    CREATE POLICY "theo_attachment_update_own" ON public.theo_attachments FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='theo_attachments' AND policyname='theo_attachment_delete_own') THEN
    CREATE POLICY "theo_attachment_delete_own" ON public.theo_attachments FOR DELETE TO authenticated USING (created_by = auth.uid());
  END IF;
END $$;
CREATE OR REPLACE FUNCTION public.theo_attachment_exists_unscoped(p_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.theo_attachments WHERE id = p_id);
$$;
GRANT EXECUTE ON FUNCTION public.theo_attachment_exists_unscoped(uuid) TO authenticated;
```

### §4.3 Primary reference — deployed B8c addendum (`b8c_addendum.sql`, full-verbatim)
```sql
-- Tier B8c addendum migration: extraction metadata on theo_attachments (ADDITIVE; idempotent).
-- Run as pgadmin_vault (owner), same as every prior theo migration. No RLS change — the new
-- columns inherit theo_attachments' existing four ownership policies. No data backfill needed
-- (theo_finalize_attachment sets these on insert going forward; pre-existing rows keep NULL).

ALTER TABLE public.theo_attachments
  ADD COLUMN IF NOT EXISTS ingestion_class text,
  ADD COLUMN IF NOT EXISTS extracted_text_path text;

COMMENT ON COLUMN public.theo_attachments.ingestion_class IS
  'native | extract | stored — how the attachment is fed to the model (B8c). Free-text (no CHECK), mirrors the app_key promotable convention.';
COMMENT ON COLUMN public.theo_attachments.extracted_text_path IS
  'Blob pointer (within blob_container) to the extracted text for extract-class attachments; NULL for native, or when extraction failed/has not run (B8c).';
```

### §4.4 Primary reference — deployed B8i addendum (`b8i_addendum.sql`, full-verbatim)
```sql
-- Tier B8i addendum: record which user-turn the attachment was sent with (reload parity). ADDITIVE; idempotent.
-- Run as pgadmin_vault. No RLS change (inherits theo_attachments' four ownership policies). No backfill
-- (theo_message sets it on send going forward; pre-existing rows keep NULL → they group at the chat level).
ALTER TABLE public.theo_attachments
  ADD COLUMN IF NOT EXISTS message_seq int;

COMMENT ON COLUMN public.theo_attachments.message_seq IS
  'The theo_messages.seq of the user turn this attachment was sent with (set by theo_message at send); NULL if not sent in a message. Lets a reloaded thread show chips on the right message (B8i).';
```

## §5 — Verify (read-only catalog; run after apply)
`dottie_attachments_verify.sql` (in-package) SELECT-only: (1) 12 columns; (2) FK→`dottie_conversations` `delete_rule = SET NULL`; (3) `relrowsecurity=t` + 4 policies; (4) helper `prosecdef=t`, `search_path=public`; (5) the two indexes + PK; (6) the two CHECKs. Expected outputs noted inline.

## §6 — Gap Register
**PROCEED.** No missing CURRENT authority (the FK parent `dottie_conversations` is deployed).
- **G-HANDLERS: PRE-LAND (paired package).** The 4 attachment handlers are a separate Pass-1 VEP that grounds against THIS table once deployed (Schema Reality Lock needs the deployed table). Disclosed.
- **G-INFRA (handlers package prereqs, disclosed here for planning): PRE-LAND.** The handlers need: a `dottie-content` container on `vaultgptdottiestore`; func-dottie MI (`86c251f4…`) granted **Storage Blob Data Contributor** on it; `npm install xlsx mammoth officeparser pdf-parse@1.1.1` on func-dottie (SAS is hand-rolled with `crypto`+`https` — no `@azure/storage-blob`); Blob CORS for the dev-SWA origin; app settings `DOTTIE_BLOB_ACCOUNT`/`DOTTIE_BLOB_CONTAINER`. None are in THIS package; disclosed so the sequence is known.
- **G-APISPEC / G-UNGATE: PRE-LAND (handlers package Role-C)** — API spec + reconciliation §D + `DOTTIE_CAPABILITIES.attachments` flip happen when the handlers land, not here. Disclosed.

## §7 — Deploy plan (ordered; §1D)
1. Codex Pass-2 → APPROVED/REJECTED. 2. **Walter** runs `dottie_attachments_migration.sql` as `pgadmin_vault` against `vaultgpt-postgres-prod`. 3. Claude runs `dottie_attachments_verify.sql` read-only (RO workstation path) and Role-C's the schema doc (`spec/DOTTIE_AZURE_POSTGRES_SCHEMA.md`) to record the deployed table. 4. The paired **handlers** Pass-1 VEP proceeds, grounded against the now-deployed `dottie_attachments`.

## Codex activation note (Walter forwards)

```
Codex is activated for Pass-2 review of Dottie Attachments Schema (dottie_attachments migration),
vault-dottie, "Codex Governance/Dottie-Attachments-Schema-Pass-1-VEP/Dottie_Attachments_Schema_VEP.md".
Open with a governance-bound GCR + Rule Anchor Table. MIGRATION-ONLY (Walter runs it as pgadmin_vault;
no handler, no blob, no FE in this package). Schema half of the attachments build-out
(spec/DOTTIE_THEO_RECONCILIATION.md §D); the 4 handlers are a paired Pass-1 VEP that grounds against
this table once deployed (Schema Reality Lock), mirroring Theo's B8a->B8b split. Review: (1) dottie_attachments
is a byte-faithful EXACT mirror of the deployed theo_attachments (base b8a + b8c ingestion_class/extracted_text_path
+ b8i message_seq, consolidated into one net-new CREATE TABLE) — §3 Structural Mirror; the ONLY delta is
theo_->dottie_ identifiers + the FK parent (dottie_conversations) + the container comment. (2) Schema Reality
Lock — the FK parent dottie_conversations is DEPLOYED D1; RLS/exists-helper idiom matches D1; nothing invented.
(3) migration is idempotent, no top-level BEGIN/COMMIT, run as pgadmin_vault. (4) verify SQL + deploy plan.
Emit APPROVED or REJECTED only.
```
