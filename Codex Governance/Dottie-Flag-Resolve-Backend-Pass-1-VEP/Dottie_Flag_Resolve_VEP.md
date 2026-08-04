# Dottie Flag-Resolve Handler — Pass-1 VEP (dottie_flag_resolve)

A tiny owner-scoped write handler that marks a governance flag **resolved** (or re-opens it) — the backend for the "Resolve" action on the Open-flags surface (pkg 3b.3). One new handler on `func-dottie`: `dottie_flag_resolve` (POST `{ flag_id, status }`), an owner-scoped `UPDATE public.dottie_flags SET status, resolved_at …` on the DEPLOYED `dottie_flags` table (pkg 3a.1). Byte-faithful mirror of the deployed `dottie_set_conversation_starred` idiom (pool/set_config/EasyAuth/envelope, `BEGIN…UPDATE…exists-helper 403/404…COMMIT`); the only deltas are the target table + columns + the resolve validation. **Handler-only — NO migration, NO schema, NO dependency, NO route beyond the new function** (reads/writes the deployed 3a.1 table). The paired FE "Resolve" button is a separate FE package that grounds against THIS deployed handler.

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Verified Evidence Pack (backend handler; no migration; no schema; no dependency)
Grounding parent (source baseline): `0164ff26d24cd8bbbd9d0476a671004a1101fd86` (vault-dottie, `development`)
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD / proposed) |
| - | ------------------------------- | ------------------------------ | -------------------------------------------- |
| 1 | GOVERNING VISION — `governance/VAULT_MEMORY_ARCHITECTURE.md` (§A Amendment 9 — Dottie full agent; net-new `dottie_*`, never touch `theo_*`) | grounded; unchanged @ HEAD | `3afda098df614b11adc8a7cdcf28d0f9a3f47011` |
| 2 | Backend Governor — `governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md` (§3 Never-Guess; §4 Schema Reality Lock) | `Grep`("Schema Reality Lock"/"Never-Guess") this turn | `e44cdd85d3d0e5df332dc754cdec731e2e68022e` |
| 3 | Grounding Conformance — `governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR; §5 Rule Anchor) | grounded; unchanged @ HEAD (quote re-verified literal) | `7c0d902bdff3b6c0af475b483e31ed796214e57b` |
| 4 | Golden Handler — `governance/THEO_GOLDEN_HANDLER_STANDARD.md` (§2 primary reference = index.js + function.json; §4 EXACT mirror / allowed delta; §5.5 Kudu-VFS deploy) | grounded; unchanged @ HEAD (quote re-verified literal) | `f8f0e5ea36447502e35fb87b373c94e376f05cbb` |
| 5 | Execution Orchestration — `governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md` (§1D ordered pass; §1E deploy-after-Codex; func-dottie deploy authority) | grounded; unchanged @ HEAD (quote re-verified literal) | `565559b699c1309f8e750b0dbbac859c13d807c8` |
| 6 | SCHEMA TRUTH (DEPLOYED 3a.1) — `spec/DOTTIE_AZURE_POSTGRES_SCHEMA.md` (§7 the deployed `dottie_flags` this handler updates: `status` CHECK open\|resolved, `resolved_at`, `dottie_flag_exists_unscoped`) | `Read`(§7) this session | `36c77d127195bc17900991e654cb015c8e602896` |
| 7 | **PRIMARY REFERENCE (DEPLOYED handler pair) — `dottie_set_conversation_starred`** — `Codex Governance/Dottie-ConvMgmt-Backend-Pass-1-VEP/dottie_set_conversation_starred.index.js` (+ `.function.json`) — the owner-scoped UPDATE idiom this mirrors (BEGIN…set_config…UPDATE…exists-helper 403/404…COMMIT) | `Read`(full) this turn | index `f39df7092c2ac16a0ca70c33a31746c2154856f3`; function.json `55fbf17a83497151f0971db95e1646e41187ce44` |
| 8 | **NEW HANDLER — `dottie_flag_resolve`** (`.index.js` + `.function.json`, in-package) | `Write` this turn; `node --check` PASS | index `c1f6fb3f4ea49b00c0c2086fa5c4c50d7629238e`; function.json `5f65ca047797f257ec944a7419110dd536d9e927` |

No ChatGPT advisory cited. No `reporting_*` / `theo_*` object touched. No migration; no schema; no write SQL by Claude (the handler's UPDATE runs as the app at runtime, owner-scoped); no dependency change.

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt" | GCR (head) |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §3 | "Never-Guess" | §3 — mirrors the deployed starred handler + the deployed dottie_flags columns; nothing invented |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §4 | "Schema Reality Lock" | §2 — updates only the deployed 3a.1 dottie_flags columns; no schema/DB/dependency change |
| governance/THEO_GOLDEN_HANDLER_STANDARD.md | §4 | "EXACT mirror" | §4 — the handler EXACT-mirrors dottie_set_conversation_starred; allowed delta = target table/columns + resolve validation |
| governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md | §1D | "ordered, non-skippable" | §7 — Codex → Kudu-VFS deploy → golden curls |

---

## §1 — Feature
`dottie_flag_resolve` (POST, `func-dottie`): body `{ flag_id: uuid, status: "open"|"resolved" }`. Owner-scoped `UPDATE public.dottie_flags SET status = $1, resolved_at = CASE WHEN $1='resolved' THEN now() ELSE NULL END WHERE id = $2 AND created_by = $3 RETURNING id, status, resolved_at`. 0 rows → 403 (existing-foreign) / 404 (absent) via the deployed `dottie_flag_exists_unscoped`. Returns the updated flag row. Validates the EasyAuth oid, the body keys (`flag_id`/`status` only), `flag_id` is a UUID, and `status ∈ {open,resolved}` before any SQL (isUuid + enum gate first).

## §2 — Architecture & boundary (Schema Reality Lock — SATISFIED)
One net-new function on `func-dottie` (v3: `.index.js` + `.function.json` under `wwwroot`), additive. Reuses the deployed `POSTGRES_CONNECTION_STRING` + EasyAuth already serving the other `dottie_*` handlers; no new app setting / MI / infra / dependency. Every column it writes (`status`, `resolved_at`) + the helper it calls (`dottie_flag_exists_unscoped`) exist in the DEPLOYED 3a.1 `dottie_flags` (schema doc §7, catalog-verified 2026-08-04). No `theo_*`/`reporting_*`; no migration; no schema change; no RLS change (RLS's four `_own` policies already cover UPDATE; the explicit `created_by = $oid` is defence-in-depth, per the D1/D2 idiom).

## §3 — Never-Guess / grounding
The handler is an EXACT-mirror of the deployed `dottie_set_conversation_starred` (GCR row 7): identical `corsHeaders`/`send`/`errorBody`/`successBody`/`getPrincipal`/`getClaimValue`/`parseBody`/`buildKnownError`/`isUuid`/pool/`set_config`/`BEGIN…UPDATE…exists-helper…COMMIT`/`ROLLBACK`/`42501→403` shape. The only deltas: the target table (`dottie_flags`), the updated columns (`status`/`resolved_at`), the exists-helper (`dottie_flag_exists_unscoped`), and the resolve validation (`status ∈ {open,resolved}` in place of the boolean `starred`). Columns + helper are the deployed 3a.1 reality (§2). No authority/rate/date asserted.

## §4 — The change + Structural Mirror (Golden §4)
`node --check` PASS. POST/OPTIONS envelope identical to the starred handler.

| Region | Classification | Notes |
| ------ | -------------- | ----- |
| envelope helpers + auth + BEGIN/set_config/exists-helper/COMMIT/ROLLBACK/42501 | **EXACT MIRROR** of deployed `dottie_set_conversation_starred` (GCR row 7) | §3 |
| the UPDATE target/columns (`dottie_flags` `status`/`resolved_at`), the `dottie_flag_exists_unscoped` helper, the `status ∈ {open,resolved}` validation + `resolved_at` CASE | **ALLOWED DELTA** — the resolve action over the deployed 3a.1 table | §1/§2 |

No DEVIATION rows.

## §5 — Golden test (Golden §5.3; Claude runs post-deploy, live, as `wmansfield@vault-tax.com`)
| # | Step | Expect |
| - | ---- | ------ |
| G1 | Create a flag (a live adjudication turn with an assumption), then `GET /api/dottie_flags_list?status=open` → note a `flag_id` | `200`; the flag present, `status=open` |
| G2 | `POST /api/dottie_flag_resolve {flag_id, status:"resolved"}` | `200`; `data.flag.status="resolved"`, `resolved_at` set |
| G3 | `GET /api/dottie_flags_list?status=open` again | the flag no longer in Open; `?status=resolved` shows it |
| G4 | `POST … {status:"open"}` (re-open) | `200`; `status="open"`, `resolved_at=null` |
| G5 | Bad inputs — missing/invalid `flag_id`, bad `status`, unknown body key | `400` each (validated before SQL) |
| G6 | Another user's `flag_id` (if available) / absent uuid | `403` / `404` via the exists-helper |

## §6 — Gap Register
**PROCEED.**
- **(G-1) FE Resolve button = paired package.** The "Resolve" action on the Open-flags surface (gateway `resolveFlag` + a button + optimistic state) is a separate FE Pass-1 VEP grounding against THIS deployed handler. Disclosed.
- **(G-2) No schema/migration/dependency/keys.** Writes the deployed 3a.1 `dottie_flags` columns only. PROCEED.

## §7 — Deploy plan (ordered; §1D)
1. Codex Pass-2 → APPROVED/REJECTED.
2. Claude **Kudu-VFS deploys** `dottie_flag_resolve` to `vaultgpt-func-dottie` (§5.5): PUT `function.json` + `index.js` under `wwwroot/dottie_flag_resolve/`, GET-back diff, restart.
3. Claude runs §5 golden curls live (resolve → flags_list reflects it; re-open; 400/403/404 gates).
4. The paired FE "Resolve" package proceeds, grounded against the now-deployed handler.

## Codex activation note (Walter forwards)

```
Codex is activated for Pass-2 review of the Dottie flag-resolve handler (dottie_flag_resolve), vault-dottie,
"Codex Governance/Dottie-Flag-Resolve-Backend-Pass-1-VEP/Dottie_Flag_Resolve_VEP.md" @ commit <HEAD>. Open with a
governance-bound GCR + Rule Anchor Table; hard-gate; emit only APPROVED or REJECTED. HANDLER-ONLY (no migration/schema/
dependency; owner-scoped UPDATE on the DEPLOYED 3a.1 dottie_flags). One new function on func-dottie (Kudu-VFS), the backend
for the Open-flags "Resolve" action (pkg 3b.3). Review: (1) EXACT MIRROR of the deployed dottie_set_conversation_starred
(pool/set_config/EasyAuth/envelope/BEGIN…UPDATE…exists-helper 403/404…COMMIT/ROLLBACK/42501->403) — GCR row 7; the only
deltas are the target table dottie_flags, the columns status/resolved_at, the dottie_flag_exists_unscoped helper, and the
status∈{open,resolved} validation (vs the boolean starred). (2) Schema Reality Lock: status + resolved_at + the exists-
helper all exist in the deployed 3a.1 dottie_flags (schema doc §7, catalog-verified); no schema/DB/dependency change. (3)
validation before SQL (isUuid + enum + allowed-body-keys). (4) resolved_at stamped on resolve, cleared on re-open. (5) FE
Resolve button = paired FE package (§GAP G-1). node --check PASS. Deploy = Kudu-VFS to func-dottie. Golden curls resolve
+ re-open + 400/403/404. Emit APPROVED or REJECTED only.
```
