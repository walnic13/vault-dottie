# Dottie Findings/Flags Schema — Pass-1 VEP (dottie_findings + dottie_flags migration)

The schema half of pkg 3a — Dottie's **governance-findings store** (her operational L4 memory), the data the 9/10 **Overview** console renders. `DOTTIE_MEMORY_MODEL` §2.4 defines the store and §7 puts it at build-order 2 ("`dottie_findings`/`dottie_flags` … unblocks the console Overview with real data"); §5 maps **Console → Overview = `dottie_findings` + `dottie_flags` + `dottie_review_chains`**. This package lands the first two tables — **net-new, Dottie-specific** (no Theo analog; design-system §9 "Dottie-specific: the verdict/flag/confidence/docs vocabulary"), so they do NOT mirror a `theo_*` table; instead they mirror the **deployed D1 idiom** (RLS + `_exists_unscoped` helper + grants, byte-faithful to `dottie_d1_migration.sql`), and every COLUMN is grounded in `DOTTIE_MEMORY_MODEL §2.4` and/or the Codex-APPROVED FE `CheckData` contract (`src/theo/lib/check.ts` @ `53fd892`). `dottie_review_chains` (the governance queue) is a SEPARATE later migration (§7 build-order 3). **Migration only** (Walter runs it as `pgadmin_vault`); no handler, no blob, no FE change here. The paired **write-on-verdict + read handlers** are pkg 3a.2, a separate Pass-1 VEP that grounds against THESE deployed tables (Schema Reality Lock needs the table deployed first — the D1→D2 split).

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Verified Evidence Pack (schema migration)
Grounding parent (source baseline): `0c0b1a60002616ad057fcece473a3ca207045b51` (vault-dottie, `development`) — anchors below are tip-independent blob SHAs
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD / proposed) |
| - | ------------------------------- | ------------------------------ | -------------------------------------------- |
| 1 | GOVERNING VISION — `governance/VAULT_MEMORY_ARCHITECTURE.md` (§A Amendment 9 — Dottie full agent; net-new `dottie_*`, never touch `theo_*`) | grounded; unchanged @ HEAD | `3afda098df614b11adc8a7cdcf28d0f9a3f47011` |
| 2 | Backend Governor — `governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md` (§3 Never-Guess; §4 Schema Reality Lock) | `Grep`("Schema Reality Lock"/"Never-Guess") this turn | `e44cdd85d3d0e5df332dc754cdec731e2e68022e` |
| 3 | Grounding Conformance — `governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR; §5 Rule Anchor) | grounded; unchanged @ HEAD (quote re-verified literal) | `7c0d902bdff3b6c0af475b483e31ed796214e57b` |
| 4 | Golden Handler — `governance/THEO_GOLDEN_HANDLER_STANDARD.md` (§4 EXACT mirror / allowed delta; §5.2 migrations carry no top-level BEGIN/COMMIT) | grounded; unchanged @ HEAD (quote re-verified literal) | `f8f0e5ea36447502e35fb87b373c94e376f05cbb` |
| 5 | Execution Orchestration — `governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md` (§1D ordered pass; migrations run by Walter as pgadmin_vault) | grounded; unchanged @ HEAD (quote re-verified literal) | `565559b699c1309f8e750b0dbbac859c13d807c8` |
| 6 | **FIELD AUTHORITY (binding, Codex-APPROVED) — `spec/DOTTIE_MEMORY_MODEL.md`** (§2.4 the findings/flags/review_chains field lists; §5 Console→Overview mapping; §7 build-order 2 = findings/flags unblock the Overview) | `Read`(§2.4/§5/§7) this turn | `6bcdb25b92d532536922b2057d4b854f9613d0ce` |
| 7 | **IDIOM AUTHORITY (DEPLOYED migration) — D1** — `Codex Governance/Dottie-D1-Schema-Foundation-Pass-1-VEP/dottie_d1_migration.sql` (the `dottie_*` RLS + four ownership policies + `_exists_unscoped` SECURITY DEFINER helper with `REVOKE ALL … FROM PUBLIC` then `GRANT EXECUTE … TO authenticated`; FK parent `dottie_conversations`) | `Read`(full) this turn | `6c51847b5b878cb7f5bf639005b1697b676884f3` |
| 8 | DEPLOYED SCHEMA DOC — `spec/DOTTIE_AZURE_POSTGRES_SCHEMA.md` (the deployed `dottie_*` tables + FK parent `dottie_conversations`; Role-C target for the new tables post-apply) | grounded; unchanged @ HEAD | `53ee66d1f2192163463bf4de40407652b6913e8c` |
| 9 | **DISPLAY CONTRACT (Codex-APPROVED FE) — the governance-component payload the finding persists** — `src/theo/lib/check.ts` (`CheckData`: verdict, claim{source,text}, lead, support, conclusion, flags, confidence{level,label}, docs) | `Read`(full) this session (authored pkg 2) | `53fd892efab9541299efe2106c7ed3d3162fcb96` |
| 10 | **MIGRATION (the deliverable) — `dottie_findings_flags_migration.sql`** (in-package) | `Write` this turn | proposed `a0be0218f4ed7377f6d979072bb67029fbaaa10c` |
| 11 | **VERIFY (read-only, in-package) — `dottie_findings_flags_verify.sql`** | `Write` this turn | proposed `eaa8dce823f848a23bd0f663f3b574fbc51b3d59` |

No ChatGPT advisory cited. No `reporting_*` / `theo_*` object touched. Migration package (Walter runs as `pgadmin_vault`; no handler, no blob, no write SQL by Claude).

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt" | GCR (head) |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §4 | "Schema Reality Lock" | §3 — FK parent `dottie_conversations` is DEPLOYED D1; columns from §2.4 + approved CheckData; nothing invented |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §3 | "Never-Guess" | §3 — every column traces to DOTTIE_MEMORY_MODEL §2.4 or the approved CheckData; enum values grounded, not assumed |
| governance/THEO_GOLDEN_HANDLER_STANDARD.md | §4 | "EXACT mirror" | §3 — the RLS/exists-helper/grant idiom EXACT-mirrors the deployed D1 |
| spec/DOTTIE_MEMORY_MODEL.md | §2.4 | "her operational L4 memory" | §1/§3 — the two tables realise the §2.4 findings/flags store |
| governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md | §1D | "ordered, non-skippable" | §7 — Codex → Walter runs migration → RO verify + Role-C → 3a.2 handlers |

---

## §1 — Feature
Two net-new tables realise `DOTTIE_MEMORY_MODEL §2.4`:
- **`public.dottie_findings`** — a check/verdict on a target. Columns: `id`, `created_by`, `target_ref`, `target_kind` (CHECK ∈ theo_answer|workpaper|context_item|conversation), `verdict` (CHECK ∈ concur|caution|challenge), `confidence_level` (double precision NULL, CHECK null-or-0..1), `confidence_label` (text NULL), `claim_source`, `claim_text`, `lead`, `conclusion`, `authorities text[]`, `flags text[]`, `docs_expected text[]` (all three default `'{}'`), `conversation_id` (FK→`dottie_conversations` ON DELETE SET NULL), `created_at`. Two indexes (`created_by`; `created_by, created_at DESC` for the "recent checks" list). RLS + four ownership policies + `dottie_finding_exists_unscoped(uuid)` helper.
- **`public.dottie_flags`** — an open governance flag. Columns: `id`, `created_by`, `finding_id` (FK→`dottie_findings` ON DELETE CASCADE, NULL for a standalone flag), `flag_type` (CHECK ∈ unsupported_assumption|missing_documentation|tag_drift|review_chain_gap|other), `severity` (CHECK ∈ low|medium|high, default medium), `target_ref`, `summary`, `status` (CHECK ∈ open|resolved, default open), `created_at`, `resolved_at`. Three indexes (`created_by`; `finding_id`; `created_by, status, created_at DESC` for the open-flags list + Overview count). RLS + four ownership policies + `dottie_flag_exists_unscoped(uuid)` helper.

## §2 — Architecture & boundary
Additive net-new `dottie_*` tables on the shared `vaultgpt-postgres-prod` (schema `public`). They mirror the deployed **D1 idiom**: RLS `TO authenticated` keyed on `created_by = auth.uid()` (the Entra OID) + a SECURITY DEFINER `_exists_unscoped` helper with `REVOKE ALL … FROM PUBLIC` then `GRANT EXECUTE … TO authenticated`. `dottie_findings.conversation_id` FKs the DEPLOYED D1 table `dottie_conversations(id)` ON DELETE SET NULL (a finding survives an unlinked conversation, D1 idiom); `dottie_flags.finding_id` FKs `dottie_findings(id)` ON DELETE CASCADE (a flag is meaningless without its finding). No `theo_*`/`reporting_*` object touched; no RLS change to any existing table; no data backfill. Idempotent (`CREATE TABLE IF NOT EXISTS`, guarded `CREATE POLICY`, `CREATE OR REPLACE FUNCTION`). **No top-level BEGIN/COMMIT** (Golden §5.2). Run by Walter as `pgadmin_vault`.

## §3 — Schema Reality Lock + Structural Mirror (Governor §3/§4 / Golden §4)
FK parent `dottie_conversations(id)` is DEPLOYED (D1, schema doc, GCR rows 7/8). `gen_random_uuid()`, `auth.uid()`, and the RLS + `_exists_unscoped` idiom (incl. the `REVOKE ALL FROM PUBLIC` hardening) are the SAME primitives D1 already uses (GCR row 7). These tables are **net-new + Dottie-specific** (design-system §9 — the verdict/flag/confidence/docs vocabulary is Dottie's, not Theo's), so there is **no `theo_*` table to mirror**; the "mirror" is the D1 idiom, and the "reality lock" on columns is `DOTTIE_MEMORY_MODEL §2.4` (the binding field authority) + the Codex-APPROVED `CheckData` display shape. Every column is classified below — nothing invented.

**`dottie_findings`:**
| Region | Classification | Grounding |
| ------ | -------------- | --------- |
| `id`/`created_by`/`created_at`; ENABLE RLS + 4 `_own` policies (`created_by = auth.uid()`, `TO authenticated`); `dottie_finding_exists_unscoped` (`prosecdef`, `search_path=public`, REVOKE PUBLIC + GRANT authenticated); `created_by` index | **EXACT MIRROR** of deployed D1 | GCR row 7 (`dottie_d1_migration.sql`) |
| `target_ref`, `target_kind` (CHECK 4), `verdict` (CHECK 3), `authorities text[]`, `flags text[]`, `docs_expected text[]` | **EXACT** from the field authority | DOTTIE_MEMORY_MODEL §2.4 `{ target_ref, target_kind (theo_answer\|workpaper\|context_item\|conversation), verdict (concur\|caution\|challenge), … authorities[], flags[], docs_expected[], created_by, created_at }` |
| `confidence_level` (double precision, CHECK null-or-0..1) + `confidence_label` (text) | **ALLOWED DELTA** — the two-field realisation of §2.4 "confidence" | the APPROVED `CheckData.confidence { level: 0..1, label }` (GCR row 9, `check.ts`) |
| `claim_source`, `claim_text`, `lead`, `conclusion` (all NULL) | **ALLOWED DELTA** — persist the approved governance-component payload so the Checks/Audit surfaces re-render the component from the row | the APPROVED `CheckData` (`claim{source,text}`, `lead`, `conclusion`; GCR row 9) + §5 "Console→Overview" mapping |
| `conversation_id` (FK→`dottie_conversations` ON DELETE SET NULL) | **ALLOWED DELTA** — the standard `dottie_*` conversation link | D1 idiom (`dottie_attachments`/`dottie_user_memory` carry the same FK-to-conversations) |
| `(created_by, created_at DESC)` list index | **ALLOWED DELTA (additive)** | the "Recent checks on Theo" newest-first list (§5) |

**`dottie_flags`:**
| Region | Classification | Grounding |
| ------ | -------------- | --------- |
| `id`/`created_by`/`created_at`; ENABLE RLS + 4 `_own` policies; `dottie_flag_exists_unscoped`; `created_by` index | **EXACT MIRROR** of deployed D1 | GCR row 7 |
| `finding_id` (FK→`dottie_findings` ON DELETE CASCADE, NULL), `flag_type`, `severity`, `target_ref`, `status` (open\|resolved) | **EXACT** from the field authority | DOTTIE_MEMORY_MODEL §2.4 `{ finding_id?, flag_type, severity, target_ref, status (open\|resolved), … }` |
| `flag_type` CHECK values `unsupported_assumption\|missing_documentation\|tag_drift\|review_chain_gap\|other` | **ALLOWED DELTA** — snake_case realisation of the §2.4 prose examples + an `other` catch-all | §2.4 examples "unsupported assumption, missing documentation, tag drift, review-chain gap" |
| `severity` CHECK `low\|medium\|high` (default medium); `summary`; `resolved_at`; `(created_by, status, created_at DESC)` index | **ALLOWED DELTA (additive)** — the standard fields the §2.4 "…" leaves open; `summary` = the flag text, `resolved_at` timestamps a resolve, the index backs the open-flags list | §2.4 dottie_flags spec ("… severity …, status (open\|resolved), …") + §5 "Open flags" surface |

No DEVIATION regions. The only structural difference from D1 is the domain columns above, each grounded in §2.4 or the approved CheckData.

## §4 — Migration (the deliverable)
`dottie_findings_flags_migration.sql` (in-package, GCR row 10) — full text lands the two tables exactly as §1/§3 describe. Structure per table, byte-faithful to the D1 idiom: `CREATE TABLE IF NOT EXISTS` → `CREATE INDEX IF NOT EXISTS` (×2–3) → `ENABLE ROW LEVEL SECURITY` → guarded `DO $$ … CREATE POLICY …` (4 `_own`) → `CREATE OR REPLACE FUNCTION … SECURITY DEFINER SET search_path = public` → `REVOKE ALL … FROM PUBLIC` → `GRANT EXECUTE … TO authenticated`. Reversal footer (drop flags before findings — FK order). No top-level BEGIN/COMMIT; idempotent. The D1 grant idiom this mirrors (GCR row 7):
```sql
CREATE OR REPLACE FUNCTION public.dottie_user_memory_exists_unscoped(p_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.dottie_user_memory WHERE id = p_id);
$$;
REVOKE ALL ON FUNCTION public.dottie_user_memory_exists_unscoped(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.dottie_user_memory_exists_unscoped(uuid) TO authenticated;
```

## §5 — Verify (read-only catalog; run after apply)
`dottie_findings_flags_verify.sql` (in-package, GCR row 11) SELECT-only: (1) both tables exist; (2) `relrowsecurity=t` on both; (3) 4 `_own` policies per table; (4) both `_exists_unscoped` helpers `prosecdef=t`, `search_path=public`, `proacl` shows `authenticated=X` with no bare PUBLIC `=X/` entry; (5) the CHECK + FK constraint defs (verdict/target_kind/confidence on findings; flag_type/severity/status + FK cascade on flags); (6) the three array columns default `'{}'` (not NULL); (7) the two list indexes exist. Expected outputs noted inline.

## §6 — Gap Register
**PROCEED.** No missing CURRENT authority — the FK parent `dottie_conversations` is deployed (D1) and the field authority (`DOTTIE_MEMORY_MODEL §2.4`) is Codex-APPROVED + binding.
- **G-HANDLERS (pkg 3a.2): PRE-LAND (paired package).** The write-on-verdict path (the stream persists a `dottie_findings` row when it emits a verdict `[[CHECK]]` — §5 "Claim-check writes a `dottie_findings` row") + the read handlers (`dottie_findings_list` / `dottie_flags_list`) are a separate Pass-1 VEP grounding against THESE deployed tables (Schema Reality Lock). Disclosed.
- **G-FE (pkg 3b): PRE-LAND.** The 9/10 Overview console + Checks/Flags/Audit surfaces read the handlers. Disclosed.
- **G-REVIEWCHAINS (pkg 3c): PRE-LAND.** `dottie_review_chains` (the Workflows/governance queue) is §2.4's third table + §7 build-order 3 — a separate later migration; not in this package. Disclosed.
- **G-NO-BACKFILL / G-NO-THEO / G-NO-MIGRATION-TXN.** Additive; no existing table/RLS touched; no `theo_*`/`reporting_*`; no top-level transaction. PROCEED.

## §7 — Deploy plan (ordered; §1D)
1. Codex Pass-2 → APPROVED/REJECTED.
2. **Walter** runs `dottie_findings_flags_migration.sql` as `pgadmin_vault` against `vaultgpt-postgres-prod`.
3. Claude runs `dottie_findings_flags_verify.sql` read-only (RO workstation path) + Role-C's the schema doc (`spec/DOTTIE_AZURE_POSTGRES_SCHEMA.md`) to record the two deployed tables.
4. The paired **handlers** Pass-1 VEP (pkg 3a.2 — write-on-verdict + read handlers) proceeds, grounded against the now-deployed tables; then pkg 3b (the Overview console FE).

## Codex activation note (Walter forwards)

```
Codex is activated for Pass-2 review of Dottie Findings/Flags Schema (dottie_findings + dottie_flags migration),
vault-dottie, "Codex Governance/Dottie-Findings-Flags-Schema-Pass-1-VEP/Dottie_Findings_Flags_Schema_VEP.md" @ commit
<HEAD>. Open with a governance-bound GCR + Rule Anchor Table; hard-gate; emit only APPROVED or REJECTED. MIGRATION-ONLY
(Walter runs it as pgadmin_vault; no handler, no blob, no FE in this package). This is the schema half of pkg 3a —
Dottie's governance-findings store (her operational L4 memory) that the 9/10 Overview console renders; DOTTIE_MEMORY_MODEL
§7 build-order 2. Review: (1) two NET-NEW, Dottie-specific tables (no theo_ analog — design-system §9), so NOT a theo_
mirror; they mirror the DEPLOYED D1 idiom (RLS + 4 _own policies + _exists_unscoped SECURITY DEFINER with REVOKE ALL
FROM PUBLIC then GRANT EXECUTE TO authenticated — byte-faithful to dottie_d1_migration.sql). (2) Never-Guess/Schema
Reality Lock — EVERY column traces to DOTTIE_MEMORY_MODEL §2.4 (target_ref/target_kind/verdict/authorities[]/flags[]/
docs_expected[]; finding_id/flag_type/severity/target_ref/status) or the Codex-APPROVED FE CheckData contract (check.ts
@ 53fd892 — confidence{level,label} split into confidence_level+confidence_label; claim_source/claim_text/lead/
conclusion persist the governance-component payload); §3 classifies each column EXACT-from-§2.4 / ALLOWED-DELTA-from-
CheckData / EXACT-MIRROR-of-D1-idiom. Nothing invented. (3) FK parents deployed: findings.conversation_id ->
dottie_conversations ON DELETE SET NULL (D1), flags.finding_id -> dottie_findings ON DELETE CASCADE. (4) idempotent, no
top-level BEGIN/COMMIT (Golden §5.2), run as pgadmin_vault; verify SQL is read-only. (5) dottie_review_chains + the
write-on-verdict handlers + the FE console are disclosed PRE-LAND follow-ups (§6). Emit APPROVED or REJECTED only.
```
