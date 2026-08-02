# Dottie Artifacts Schema — Pass-1 VEP (dottie_artifacts + dottie_artifact_versions migration)

## Role-C completion — DEPLOYED + read-only-verified (2026-08-01)
Codex Pass-2 **APPROVED** (rev-2). Walter ran `dottie_artifacts_migration.sql` as `pgadmin_vault`. Claude read-only-verified (catalog): `dottie_artifacts` **8 columns — no `project_id`** + `dottie_artifact_versions` **9 columns**; FKs `conversation_id`→`dottie_conversations` **SET NULL** and `artifact_id`→`dottie_artifacts` **CASCADE** (via `pg_constraint`); RLS + four `_own` policies each (8 total); helper `dottie_artifact_exists_unscoped` `prosecdef=t`, `search_path=public`, ACL `authenticated=X` + owner — **no PUBLIC** (the rev-2 REVOKE-PUBLIC hardening confirmed live); `UNIQUE (artifact_id, version_number)`; CHECKs `title` non-empty + `type IN (…)`; 6 indexes. Role-C: schema doc `spec/DOTTIE_AZURE_POSTGRES_SCHEMA.md` §3 rows + new §6 record the deployed tables. The paired **Artifacts-Handlers** package is now unblocked at the schema gate (pending its own Codex approval).

## Repair note (rev-2 — addresses Codex REJECT T13: delta-count self-contradiction)
Codex cleared the schema substance but found a self-contradictory delta count: the abstract + the runnable migration header said **two** Dottie deltas (counting only project_id-drop + REVOKE-PUBLIC, treating the `theo_`→`dottie_` rename as implicit), while the §3 Structural Mirror Table, the Rule Anchor row, and the activation note said **three**. Aligned on **three** everywhere: the abstract (intro) and the migration file header now both enumerate (1) `theo_`→`dottie_` identifiers (names + conversation FK parent), (2) DROP `project_id`, (3) helper `REVOKE ALL FROM PUBLIC` hardening — matching the mirror table. The inlined §4.1 was re-spliced to the updated migration file (byte-identical); no DDL change. Lint re-run PASS.

Schema half of the artifacts-persistence build-out (`spec/DOTTIE_THEO_RECONCILIATION.md` §F). The transplanted FE persists `[[ARTIFACT]]` deliverables to a gallery; Dottie has no artifacts tables, so persistence is gated off today (the in-reply `[[ARTIFACT]]` render already works — it is text-parsed and local). This package lands the two tables — a **byte-faithful mirror of the deployed `theo_artifacts` + `theo_artifact_versions`** (Theo Tier B2) — with **three documented Dottie deltas** (enumerated in the §3 Structural Mirror Table): (1) `theo_`→`dottie_` identifiers (names + the conversation FK parent); (2) the `project_id` column/FK/index is DROPPED (Dottie has no Projects backend → no `dottie_projects` table to FK to); (3) the `_exists_unscoped` helper adds `REVOKE ALL FROM PUBLIC` (the deployed Dottie D1 hardening idiom, stricter than the looser Theo B2 grant). The paired **handlers** package (`dottie_upsert/list/get_artifact`) grounds against THIS schema once deployed (Golden Handler Schema Reality Lock → schema first, mirroring Theo's B2→B4h split). **Migration only** (Walter runs it as `pgadmin_vault`); no handler, no blob, no FE change in this package.

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Verified Evidence Pack (schema migration)
Grounding parent (source baseline): `a9ea8a45303c449821ff5595bae6f5899a88d078` (vault-dottie, `development`) — anchors below are tip-independent blob SHAs
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD) |
| - | ------------------------------- | ------------------------------ | --------------------------------- |
| 1 | GOVERNING VISION — `governance/VAULT_MEMORY_ARCHITECTURE.md` (§A Amendment 9 — Dottie full agent; net-new `dottie_*` tables) | `Read`(§A9) this turn | `3afda098df614b11adc8a7cdcf28d0f9a3f47011` |
| 2 | Backend Governor — `governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md` (§3 Never-Guess; §4 Schema Reality Lock) | `Grep("Never-Guess")` this turn | `e44cdd85d3d0e5df332dc754cdec731e2e68022e` |
| 3 | Grounding Conformance — `governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR; §5 Rule Anchor) | `Grep("MUST open with a Grounding Conformance Receipt")` this turn | `7c0d902bdff3b6c0af475b483e31ed796214e57b` |
| 4 | Golden Handler — `governance/THEO_GOLDEN_HANDLER_STANDARD.md` (§4 EXACT mirror / allowed delta; §5.2 migrations carry no top-level BEGIN/COMMIT) | `Grep("EXACT mirror")` this turn | `f8f0e5ea36447502e35fb87b373c94e376f05cbb` |
| 5 | Execution Orchestration — `governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md` (§1D ordered pass; migrations run by Walter as pgadmin_vault) | `Grep("ordered, non-skippable")` this turn | `565559b699c1309f8e750b0dbbac859c13d807c8` |
| 6 | DEPLOYED D1 SCHEMA — `spec/DOTTIE_AZURE_POSTGRES_SCHEMA.md` (FK parent `dottie_conversations`; the `dottie_*` RLS + REVOKE-PUBLIC exists-helper idiom this mirrors) | `Read` this turn | `9aad3a0ad7ae727e2696b8b9fc4a5d6e8a9589a9` |
| 6b | DEPLOYED D1 MIGRATION (helper-grant idiom authority) — `Codex Governance/Dottie-D1-Schema-Foundation-Pass-1-VEP/dottie_d1_migration.sql` (`REVOKE ALL … FROM PUBLIC` + `GRANT EXECUTE … TO authenticated`) | `Grep("exists_unscoped(uuid) FROM PUBLIC")` this turn | `6c51847b5b878cb7f5bf639005b1697b676884f3` |
| 7 | **PRIMARY REFERENCE (DEPLOYED migration) — `theo_artifacts` + `theo_artifact_versions`** — `vault-theo/Codex Governance/Theo-1B-B2-Persistence-Substrate-Pass-1-VEP/b2_migration.sql` (the artifacts DDL, lines 153–220) | `Read`(§153–220) this turn; inlined §4.2 | `2f2b6ddf8bf87525bc1a43e34bb7f82351a54b7c` |

No ChatGPT advisory cited. No `reporting_*` / `theo_*` object touched. Migration package (Walter runs; no handler, no write SQL by Claude).

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt" | GCR (head) |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §4 | "Schema Reality Lock" | §3 — the FK parent `dottie_conversations` is DEPLOYED D1; nothing invented |
| governance/THEO_GOLDEN_HANDLER_STANDARD.md | §4 | "EXACT mirror" | §3 — `dottie_artifacts*` EXACT-mirror the deployed `theo_artifacts*` (allowed deltas: names, project_id drop, REVOKE-PUBLIC hardening) |
| governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md | §1D | "ordered, non-skippable" | §7 — Codex → Walter runs migration → verify → handlers package |

---

## §1 — Feature
Two net-new tables: **`dottie_artifacts`** (per-artifact metadata: `id`, `created_by`, `conversation_id` NULL FK→`dottie_conversations` ON DELETE SET NULL, `title` non-empty CHECK, `type` CHECK `('document','code','html')`, `current_version int DEFAULT 1`, `created_at`, `updated_at`; 2 indexes; RLS 4 policies; `dottie_artifact_exists_unscoped(uuid)` helper) and **`dottie_artifact_versions`** (immutable version rows: `id`, `created_by`, `artifact_id` NOT NULL FK→`dottie_artifacts` ON DELETE CASCADE, `version_number int`, `blob_container`, `blob_path`, `byte_size`, `content_type`, `created_at`; UNIQUE `(artifact_id, version_number)`; 1 index; RLS 4 policies; no helper). Content lives in Blob (`dottie-content`, key `artifacts/{oid}/{artifactId}/v{n}.txt`); the version row holds the pointer + metadata only.

## §2 — Architecture & boundary
Additive net-new `dottie_*` tables on `vaultgpt-postgres-prod` (schema `public`). Mirrors the deployed `dottie_*` idiom (D1): RLS `TO authenticated` on `created_by = auth.uid()` + a SECURITY DEFINER exists-helper (parent only; versions are immutable + cascade). FK to DEPLOYED D1 `dottie_conversations(id)` ON DELETE SET NULL; versions FK→`dottie_artifacts` ON DELETE CASCADE (the delete-artifact path relies on it). No `theo_*`/`reporting_*` object touched; no RLS change to any existing table; no data backfill. Idempotent (`CREATE TABLE IF NOT EXISTS`, guarded `CREATE POLICY`, `CREATE OR REPLACE FUNCTION`). No top-level BEGIN/COMMIT (Golden §5.2). Run by Walter as `pgadmin_vault`.

## §3 — Schema Reality Lock + Structural Mirror Table (Governor §4 / Golden §4)
FK parent `dottie_conversations(id)` is DEPLOYED (D1, schema doc, GCR row 6, catalog-verified). `gen_random_uuid()`, `auth.uid()`, and the RLS/exists-helper idiom (incl. the REVOKE-PUBLIC grant, GCR row 6b) are the same primitives D1 already uses. Nothing invented.

`dottie_artifacts` + `dottie_artifact_versions` are the EXACT mirror of the deployed `theo_artifacts` + `theo_artifact_versions` (Theo B2). Classification:

| Region | Classification | Notes |
| ------ | -------------- | ----- |
| both tables' columns + types + CHECKs (`title` non-empty, `type IN (…)`) + `current_version` default + `id` PK default; the versions `UNIQUE (artifact_id, version_number)`; the versions FK ON DELETE CASCADE; all 8 RLS policies; both indexes on each table | **EXACT** | byte-identical to `theo_artifacts*` |
| the `_exists_unscoped(uuid)` SECURITY DEFINER helper body (`search_path=public`) on the parent only | **EXACT** | same shape; `dottie_` name |
| table/policy/index/helper NAMES (`theo_`→`dottie_`); the conversation FK parent (`theo_conversations`→`dottie_conversations`) | **ALLOWED DELTA (adapted identity)** | the identity changes; no structural difference |
| **DROP `project_id`** — column + `REFERENCES theo_projects(id) ON DELETE SET NULL` + `idx_theo_artifacts_project_id` are omitted | **ALLOWED DELTA (Dottie has no Projects)** | Dottie has no `dottie_projects` table (Projects hidden — reconciliation §E). The artifact keeps its conversation link; the paired handler drops the project owner-check + INSERT column accordingly. |
| the helper grant surface: **`REVOKE ALL … FROM PUBLIC` then `GRANT EXECUTE … TO authenticated`** (Theo B2 only `GRANT`s) | **ALLOWED DELTA (Dottie D1 hardening)** | matches the deployed `dottie_conversation_exists_unscoped` idiom (GCR row 6b), not the looser Theo B2 grant |

No DEVIATION regions.

## §4 — Migration (the deliverable) + primary reference
### §4.1 `dottie_artifacts_migration.sql` (Walter runs as pgadmin_vault)
```sql
-- ============================================================================
-- Dottie — dottie_artifacts + dottie_artifact_versions (persisted [[ARTIFACT]] deliverables; Blob-backed).
-- Target: shared `vaultgpt` Azure Postgres instance (vaultgpt-postgres-prod), schema `public`.
-- Plain PostgreSQL SQL; no top-level BEGIN/COMMIT (migration governance). Idempotent.
-- Run as pgadmin_vault (owner), same as every prior dottie migration (D1 / attachments).
--
-- Byte-faithful mirror of the deployed theo_artifacts + theo_artifact_versions (Theo Tier B2), with three
-- Dottie deltas, all documented in the Structural Mirror Table of the VEP:
--   (1) theo_ -> dottie_ identifiers (table / policy / index / helper names + the conversation FK parent
--       theo_conversations -> dottie_conversations).
--   (2) DROP the `project_id` column + its FK + its index — Dottie has NO Projects backend (Projects are
--       hidden; there is no `dottie_projects` table to FK to). The conversation link is retained.
--   (3) The `_exists_unscoped` helper adds `REVOKE ALL FROM PUBLIC` before `GRANT ... TO authenticated`,
--       matching the deployed Dottie D1 hardening idiom (dottie_conversation/user_memory_exists_unscoped),
--       which is stricter than the looser Theo B2 grant.
-- Content lives in Azure Blob (`dottie-content` on `vaultgptdottiestore`, key
-- `artifacts/{oid}/{artifactId}/v{n}.txt`); the version row holds only the Blob pointer + metadata.
-- FK to the deployed D1 table dottie_conversations, ON DELETE SET NULL (artifacts survive an unlinked
-- conversation, mirroring theo_artifacts). Versions FK -> dottie_artifacts ON DELETE CASCADE.
-- ============================================================================

-- ---------- dottie_artifacts ----------
CREATE TABLE IF NOT EXISTS public.dottie_artifacts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by      text NOT NULL,
  conversation_id uuid NULL REFERENCES public.dottie_conversations(id) ON DELETE SET NULL,
  title           text NOT NULL CHECK (length(trim(title)) > 0),
  type            text NOT NULL CHECK (type IN ('document','code','html')),
  current_version integer NOT NULL DEFAULT 1,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dottie_artifacts_created_by ON public.dottie_artifacts (created_by);
CREATE INDEX IF NOT EXISTS idx_dottie_artifacts_conversation_id ON public.dottie_artifacts (conversation_id);
ALTER TABLE public.dottie_artifacts ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_artifacts' AND policyname='dottie_artifact_select_own') THEN
    CREATE POLICY "dottie_artifact_select_own" ON public.dottie_artifacts FOR SELECT TO authenticated USING (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_artifacts' AND policyname='dottie_artifact_insert_own') THEN
    CREATE POLICY "dottie_artifact_insert_own" ON public.dottie_artifacts FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_artifacts' AND policyname='dottie_artifact_update_own') THEN
    CREATE POLICY "dottie_artifact_update_own" ON public.dottie_artifacts FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_artifacts' AND policyname='dottie_artifact_delete_own') THEN
    CREATE POLICY "dottie_artifact_delete_own" ON public.dottie_artifacts FOR DELETE TO authenticated USING (created_by = auth.uid());
  END IF;
END $$;
CREATE OR REPLACE FUNCTION public.dottie_artifact_exists_unscoped(p_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.dottie_artifacts WHERE id = p_id);
$$;
-- Dottie D1 hardening idiom (stricter than Theo B2): a SECURITY DEFINER function is EXECUTE-able by
-- PUBLIC by default, so REVOKE that before granting only to authenticated.
REVOKE ALL ON FUNCTION public.dottie_artifact_exists_unscoped(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.dottie_artifact_exists_unscoped(uuid) TO authenticated;

-- ---------- dottie_artifact_versions (immutable; Blob pointer content) ----------
CREATE TABLE IF NOT EXISTS public.dottie_artifact_versions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by     text NOT NULL,
  artifact_id    uuid NOT NULL REFERENCES public.dottie_artifacts(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  blob_container text NOT NULL,
  blob_path      text NOT NULL,
  byte_size      bigint NULL,
  content_type   text NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (artifact_id, version_number)
);
CREATE INDEX IF NOT EXISTS idx_dottie_artifact_versions_artifact_id ON public.dottie_artifact_versions (artifact_id);
ALTER TABLE public.dottie_artifact_versions ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_artifact_versions' AND policyname='dottie_artifact_version_select_own') THEN
    CREATE POLICY "dottie_artifact_version_select_own" ON public.dottie_artifact_versions FOR SELECT TO authenticated USING (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_artifact_versions' AND policyname='dottie_artifact_version_insert_own') THEN
    CREATE POLICY "dottie_artifact_version_insert_own" ON public.dottie_artifact_versions FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_artifact_versions' AND policyname='dottie_artifact_version_update_own') THEN
    CREATE POLICY "dottie_artifact_version_update_own" ON public.dottie_artifact_versions FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dottie_artifact_versions' AND policyname='dottie_artifact_version_delete_own') THEN
    CREATE POLICY "dottie_artifact_version_delete_own" ON public.dottie_artifact_versions FOR DELETE TO authenticated USING (created_by = auth.uid());
  END IF;
END $$;
-- (immutable + cascade-delete only -> no _exists_unscoped for the versions table)
```

### §4.2 Primary reference — deployed `theo_artifacts` + `theo_artifact_versions` (b2_migration.sql §153–220, full-verbatim)
```sql
-- ---------- theo_artifacts ----------
CREATE TABLE IF NOT EXISTS public.theo_artifacts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by      text NOT NULL,
  conversation_id uuid NULL REFERENCES public.theo_conversations(id) ON DELETE SET NULL,
  project_id      uuid NULL REFERENCES public.theo_projects(id) ON DELETE SET NULL,
  title           text NOT NULL CHECK (length(trim(title)) > 0),
  type            text NOT NULL CHECK (type IN ('document','code','html')),
  current_version integer NOT NULL DEFAULT 1,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_theo_artifacts_created_by ON public.theo_artifacts (created_by);
CREATE INDEX IF NOT EXISTS idx_theo_artifacts_conversation_id ON public.theo_artifacts (conversation_id);
CREATE INDEX IF NOT EXISTS idx_theo_artifacts_project_id ON public.theo_artifacts (project_id);
ALTER TABLE public.theo_artifacts ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='theo_artifacts' AND policyname='theo_artifact_select_own') THEN
    CREATE POLICY "theo_artifact_select_own" ON public.theo_artifacts FOR SELECT TO authenticated USING (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='theo_artifacts' AND policyname='theo_artifact_insert_own') THEN
    CREATE POLICY "theo_artifact_insert_own" ON public.theo_artifacts FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='theo_artifacts' AND policyname='theo_artifact_update_own') THEN
    CREATE POLICY "theo_artifact_update_own" ON public.theo_artifacts FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='theo_artifacts' AND policyname='theo_artifact_delete_own') THEN
    CREATE POLICY "theo_artifact_delete_own" ON public.theo_artifacts FOR DELETE TO authenticated USING (created_by = auth.uid());
  END IF;
END $$;
CREATE OR REPLACE FUNCTION public.theo_artifact_exists_unscoped(p_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.theo_artifacts WHERE id = p_id);
$$;
GRANT EXECUTE ON FUNCTION public.theo_artifact_exists_unscoped(uuid) TO authenticated;

-- ---------- theo_artifact_versions (immutable; Blob pointer content) ----------
CREATE TABLE IF NOT EXISTS public.theo_artifact_versions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by     text NOT NULL,
  artifact_id    uuid NOT NULL REFERENCES public.theo_artifacts(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  blob_container text NOT NULL,
  blob_path      text NOT NULL,
  byte_size      bigint NULL,
  content_type   text NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (artifact_id, version_number)
);
CREATE INDEX IF NOT EXISTS idx_theo_artifact_versions_artifact_id ON public.theo_artifact_versions (artifact_id);
ALTER TABLE public.theo_artifact_versions ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='theo_artifact_versions' AND policyname='theo_artifact_version_select_own') THEN
    CREATE POLICY "theo_artifact_version_select_own" ON public.theo_artifact_versions FOR SELECT TO authenticated USING (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='theo_artifact_versions' AND policyname='theo_artifact_version_insert_own') THEN
    CREATE POLICY "theo_artifact_version_insert_own" ON public.theo_artifact_versions FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='theo_artifact_versions' AND policyname='theo_artifact_version_update_own') THEN
    CREATE POLICY "theo_artifact_version_update_own" ON public.theo_artifact_versions FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='theo_artifact_versions' AND policyname='theo_artifact_version_delete_own') THEN
    CREATE POLICY "theo_artifact_version_delete_own" ON public.theo_artifact_versions FOR DELETE TO authenticated USING (created_by = auth.uid());
  END IF;
END $$;
-- (immutable + cascade-delete only → no _exists_unscoped)
```

## §5 — Verify (read-only catalog; run after apply)
`dottie_artifacts_verify.sql` (in-package) SELECT-only, pg_catalog forms: (1) `dottie_artifacts` 8 columns — **no `project_id`**; (2) `dottie_artifact_versions` 9 columns; (3) FKs — conversation→`dottie_conversations` SET NULL, versions→`dottie_artifacts` CASCADE; (4) RLS + 4 policies each; (5) helper on the parent only, `authenticated=X` + **no PUBLIC** (the D1 hardening); (6) version UNIQUE + type CHECK + indexes. Expected outputs noted inline.

## §6 — Gap Register
**PROCEED.** No missing CURRENT authority (the FK parent `dottie_conversations` is deployed; Projects deliberately absent).
- **G-HANDLERS: PRE-LAND (paired package).** The 3 artifact handlers (`dottie_upsert/list/get_artifact`, the surface the FE calls — no delete-artifact FE call) are a separate Pass-1 VEP grounding against THIS schema once deployed. They reuse the already-provisioned blob infra (MI token; `dottie-content` container + func-dottie MI Storage Blob Data Contributor from the attachments deploy) — no new infra, no new npm deps. Disclosed.
- **G-PROJECTS: PROCEED (by decision).** `project_id` is dropped because Projects are hidden (Walter). If Projects are ever built for Dottie, an additive `ALTER TABLE … ADD COLUMN project_id …` migration re-introduces it. Disclosed.
- **G-APISPEC / G-UNGATE: PRE-LAND (handlers package Role-C).** API spec + reconciliation §F + `DOTTIE_CAPABILITIES.artifactsPersistence` flip happen when the handlers land, not here. Disclosed.

## §7 — Deploy plan (ordered; §1D)
1. Codex Pass-2 → APPROVED/REJECTED. 2. **Walter** runs `dottie_artifacts_migration.sql` as `pgadmin_vault` against `vaultgpt-postgres-prod`. 3. Claude runs `dottie_artifacts_verify.sql` read-only and Role-C's the schema doc (`spec/DOTTIE_AZURE_POSTGRES_SCHEMA.md`). 4. The paired **handlers** Pass-1 VEP proceeds, grounded against the now-deployed tables.

## Codex activation note (Walter forwards)

```
Codex is activated for Pass-2 review of Dottie Artifacts Schema (dottie_artifacts + dottie_artifact_versions
migration), vault-dottie, "Codex Governance/Dottie-Artifacts-Schema-Pass-1-VEP/Dottie_Artifacts_Schema_VEP.md".
Open with a governance-bound GCR + Rule Anchor Table. MIGRATION-ONLY (Walter runs it as pgadmin_vault; no
handler, no blob, no FE). Schema half of artifacts-persistence (spec §F); the 3 handlers are a paired Pass-1
VEP grounding against these tables once deployed (Schema Reality Lock), mirroring Theo's B2->B4h split. Review:
(1) dottie_artifacts + dottie_artifact_versions are a byte-faithful EXACT mirror of the deployed theo_artifacts
+ theo_artifact_versions (§3 Structural Mirror) with exactly THREE allowed deltas — theo_->dottie_ identifiers,
the DROP of project_id (Dottie has no dottie_projects; Projects hidden), and the helper REVOKE-PUBLIC hardening
(matching deployed D1, stricter than Theo B2). (2) Schema Reality Lock — FK parent dottie_conversations is
DEPLOYED D1; versions FK CASCADE; nothing invented. (3) migration idempotent, no top-level BEGIN/COMMIT, run as
pgadmin_vault. (4) verify SQL + deploy plan. Emit APPROVED or REJECTED only.
```
