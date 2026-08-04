# Dottie Findings/Flags Handlers — Pass-1 VEP (write-on-verdict + read handlers)

The handlers half of pkg 3a — the write + read layer over the DEPLOYED `dottie_findings`/`dottie_flags` store (Findings/Flags-Schema, live 2026-08-04). Two parts, two deploy targets:
- **Write-on-verdict** (in `dottie_message_stream` on `func-dottie-stream`): when a persisted turn's assistant text carries a **verdict** `[[CHECK]]` block, persist one `dottie_findings` row + one `dottie_flags` row per `[[CHECK]].flags[]`. `DOTTIE_MEMORY_MODEL §5`: a **verdict intensity** claim-check writes a `dottie_findings` row. POST-COMMIT + non-fatal — the turn is already durably committed, so this never affects the conversation; a grounded "My read" turn (no verdict) or a light/malformed turn writes nothing (`dottie_findings.verdict` is NOT NULL).
- **Read handlers** (`dottie_findings_list` + `dottie_flags_list` on `func-dottie`, Kudu-VFS): owner-scoped, newest-first list SELECTs that back the 9/10 Overview / Checks-on-Theo / Open-flags surfaces (pkg 3b). Byte-faithful mirrors of the deployed `dottie_list_conversations` (pool/set_config/EasyAuth/envelope), with the findings/flags SELECT as the allowed delta.

**Handler-only — NO migration, NO schema, NO dependency** (reads/writes the deployed 3a.1 tables). The FE console that consumes the read handlers is pkg 3b.

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Verified Evidence Pack (backend handlers; no migration; no schema; no dependency)
Grounding parent (source baseline): `631bd5eeb52f4707d75c0d21239d972776692ec4` (vault-dottie, `development`)
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD / proposed) |
| - | ------------------------------- | ------------------------------ | -------------------------------------------- |
| 1 | GOVERNING VISION — `governance/VAULT_MEMORY_ARCHITECTURE.md` (§A Amendment 9 — Dottie full agent; net-new `dottie_*`, never touch `theo_*`) | grounded; unchanged @ HEAD | `3afda098df614b11adc8a7cdcf28d0f9a3f47011` |
| 2 | Backend Governor — `governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md` (§3 Never-Guess; §4 Schema Reality Lock) | `Grep`("Schema Reality Lock"/"Never-Guess") this turn | `e44cdd85d3d0e5df332dc754cdec731e2e68022e` |
| 3 | Grounding Conformance — `governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR; §5 Rule Anchor) | grounded; unchanged @ HEAD (quote re-verified literal) | `7c0d902bdff3b6c0af475b483e31ed796214e57b` |
| 4 | Golden Handler — `governance/THEO_GOLDEN_HANDLER_STANDARD.md` (§4 EXACT mirror / allowed delta; §5.1 Structural Mirror; §5.3 Golden Curl; §5.5 Kudu-VFS deploy) | grounded; unchanged @ HEAD (quote re-verified literal) | `f8f0e5ea36447502e35fb87b373c94e376f05cbb` |
| 5 | Execution Orchestration — `governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md` (§1D ordered pass; §1E deploy-after-Codex; func-dottie/func-dottie-stream deploy authority) | grounded; unchanged @ HEAD (quote re-verified literal) | `565559b699c1309f8e750b0dbbac859c13d807c8` |
| 6 | **WRITE AUTHORITY (binding) — `spec/DOTTIE_MEMORY_MODEL.md`** (§5 — a verdict-intensity claim-check writes a `dottie_findings` row; the review-target comes from the shell contract §7.3 G3) | `Read`(§5) this turn | `6bcdb25b92d532536922b2057d4b854f9613d0ce` |
| 7 | **SCHEMA TRUTH (DEPLOYED 3a.1) — `spec/DOTTIE_AZURE_POSTGRES_SCHEMA.md`** (§3/§7 the deployed `dottie_findings`/`dottie_flags` these handlers read+write — columns/CHECKs/FKs) | `Read`(§3/§7) this session (Role-C'd this session) | `36c77d127195bc17900991e654cb015c8e602896` |
| 8 | **PARSE CONTRACT (Codex-APPROVED FE) — `src/theo/lib/check.ts`** (`CheckData`; the write-path `extractVerdictFinding` reuses this field normalisation — confidence{level,label}, claim{source,text}, support[].cites, flags, docs — but gates on verdict, not lead; see §3) | `Read`(full) this session (authored pkg 2) | `53fd892efab9541299efe2106c7ed3d3162fcb96` |
| 9 | **READ-HANDLER MIRROR (DEPLOYED) — `dottie_list_conversations`** — `Codex Governance/Dottie-D2-Conversation-Handlers-Pass-1-VEP/dottie_list_conversations.index.js` (+ `.function.json`) — the owner-scoped list idiom (pool/set_config/EasyAuth/envelope/limit) the two read handlers mirror | `Read`(full) this turn | index `e0c61220c04bceb13c2b917af052f79a853cffe4` |
| 10 | **MODIFIED HANDLER (proposed) — `dottie_message_stream`** — `Codex Governance/Dottie-D2-Stream-Backend-Pass-1-VEP/proposed-app/src/functions/dottie_message_stream.js` (`extractVerdictFinding` helper + the post-COMMIT finding/flag write in `persistTurn`) | `Read` + `Edit` this turn; `node --check` PASS | proposed `51807a160c63a46cb6a47d44eba1f6529f3ec492` (base @HEAD = deployed 2b `c8bc9a295e268547aed220073ad64c3f9f263353`) |
| 11 | **NEW HANDLER — `dottie_findings_list`** (`.index.js` + `.function.json`, in-package) | `Write` this turn; `node --check` PASS | index `bf3d70ee2a887f90cab500ac11dfcfc1872812f2`; fn `aa3e0962a26ab5518ee27096962c7f4d5f8d1b90` |
| 12 | **NEW HANDLER — `dottie_flags_list`** (`.index.js` + `.function.json`, in-package) | `Write` this turn; `node --check` PASS | index `2184b38625c8cba93785af1a576fe376474e9f70`; fn `bbb941c118403729f7c9f67f5ee94fc3b1edfaaf` |

No ChatGPT advisory cited. No `reporting_*` / `theo_*` object touched. No migration; no schema; no write SQL by Claude; no dependency change.

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt" | GCR (head) |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §3 | "Never-Guess" | §3 — read handlers mirror the deployed dottie_list_conversations; the write parse mirrors the approved check.ts; nothing invented |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §4 | "Schema Reality Lock" | §2 — reads/writes ONLY the deployed 3a.1 tables; no schema/DB/dependency change |
| governance/THEO_GOLDEN_HANDLER_STANDARD.md | §4 | "EXACT mirror" | §4 — the read handlers EXACT-mirror dottie_list_conversations (allowed delta = the SELECT + route + verdict/status filter) |
| spec/DOTTIE_MEMORY_MODEL.md | §5 | "verdict intensity" | §1 — the write fires only on a verdict-intensity [[CHECK]] |
| governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md | §1D | "ordered, non-skippable" | §7 — Codex → deploy (config-zip stream + Kudu-VFS func-dottie) → golden test |

---

## §1 — Feature
- **Write-on-verdict** — `dottie_message_stream.persistTurn` gains a POST-COMMIT block: `extractVerdictFinding(acc.text)` parses the assistant text for a `[[CHECK]]{json}[[/CHECK]]` block; if its `verdict` ∈ {concur,caution,challenge}, INSERT a `dottie_findings` row (verdict, confidence_level/label, claim_source/text, lead, conclusion, authorities = the flattened `support[].cites`, flags, docs_expected, conversation_id) + one `dottie_flags` row per flag (`flag_type='other'`, `severity='medium'`, `summary`=flag text, `status='open'`). A grounded "My read" turn (verdict null → no finding, since `verdict` is NOT NULL) or a light/malformed turn writes nothing.
- **`dottie_findings_list`** (GET, `func-dottie`) — owner-scoped findings, newest-first, `?limit` (1..200, default 50) + optional `?verdict=concur|caution|challenge`. Uses `idx_dottie_findings_created_by_created_desc`.
- **`dottie_flags_list`** (GET, `func-dottie`) — owner-scoped flags, newest-first, `?limit` + optional `?status=open|resolved|all` (default open). Uses `idx_dottie_flags_owner_status_created_desc`.

## §2 — Architecture & boundary (Schema Reality Lock — SATISFIED)
Two deploy targets, both additive:
- **`func-dottie-stream`** (v4, config-zip): `dottie_message_stream.js` base `c8bc9a29` (deployed 2b) → proposed `51807a16`. Additions: the module-level `extractVerdictFinding` helper (+ `collectCites`/`findingStr`/`findingStrArray`) and the post-COMMIT try/catch block in `persistTurn`. No dependency (`package.json` untouched), no route/streaming/SSE change, no change to the pre-COMMIT turn persistence. The write is **POST-COMMIT** (autocommit; a failed finding INSERT poisons nothing) and **NON-FATAL** (wrapped; never rethrown) — the committed turn is sacred.
- **`func-dottie`** (v3, Kudu-VFS): two net-new functions (`dottie_findings_list`, `dottie_flags_list`), each a `.index.js` + `.function.json` under `wwwroot`. They reuse the deployed `POSTGRES_CONNECTION_STRING` app setting + EasyAuth already serving `dottie_list_conversations`; no new app setting, MI, or infra.
**Schema Reality Lock:** every column read/written exists in the DEPLOYED 3a.1 tables (schema doc §7, catalog-verified 2026-08-04). No `theo_*`/`reporting_*`; no migration; no schema change; no write SQL by Claude (the handlers' INSERTs run as the app at runtime, owner-scoped).

## §3 — Never-Guess / grounding
- The **read handlers** mirror the deployed `dottie_list_conversations` (GCR row 9): identical `corsHeaders`/`send`/`errorBody`/`successBody`/`getPrincipal`/`getClaimValue`/pool/`set_config('app.current_user_id'|'request.jwt.claim.sub'|'request.jwt.claim.oid')`/`limit` validation/`42501→403` mapping. The only deltas are the SELECT (the 3a.1 columns), the route name, and the domain filter (`verdict` / `status`).
- The **write parse** (`extractVerdictFinding`) reuses the Codex-APPROVED FE `check.ts` field normalisation (GCR row 8): the same forgiving extraction of `confidence{level,label}` (clamped 0..1), `claim{source,text}`, `flags`, `docs`, with `authorities` = the flattened `support[].cites` (the `[[CHECK]]` shape has no top-level authorities field — grounded, not assumed). **Deliberate gate delta:** it gates on a valid `verdict` ∈ {concur,caution,challenge} (the finding's NOT NULL key), where the FE `parseCheck` gates on a non-empty `lead` (the component's required field, `check.ts:63`). This is correct — a `dottie_findings` row requires a verdict, and a grounded "My read" turn (verdict null) is not a finding.
- **Interim target derivation (disclosed, §6):** standalone Dottie has no structured review-target yet (that is the Origin shell contract, design-system §7.3 G3), so `target_ref` = the claim source (truncated 500) else `conversation:<id>`, and `target_kind` = `theo_answer` when the claim source names Theo else `conversation`. Both are valid `target_kind` CHECK values.

## §4 — The changes + Structural Mirror (Golden §4)
`node --check` PASS on all three JS files. Route/method/streaming envelope of the stream handler unchanged.

| Region | Classification | Notes |
| ------ | -------------- | ----- |
| `dottie_message_stream` everything but the two additions | **EXACT** | byte-identical to deployed 2b `c8bc9a29` |
| `extractVerdictFinding` + helpers; the post-COMMIT finding/flag write | **ALLOWED DELTA (additive, non-fatal)** | §1/§2; parse reuses the check.ts field normalisation, gates on verdict (§3) |
| `dottie_findings_list` / `dottie_flags_list` — envelope/auth/pool/set_config/limit/error idiom | **EXACT MIRROR** of deployed `dottie_list_conversations` (GCR row 9) | §3 |
| the SELECT (3a.1 columns), route name, `verdict`/`status` filter | **ALLOWED DELTA** | the owner-scoped list over the new tables |

No DEVIATION rows.

## §5 — Golden test (Golden §5.3; Claude runs post-deploy, live, as `wmansfield@vault-tax.com`)
| # | Step | Expect |
| - | ---- | ------ |
| G1 | `GET /api/dottie_findings_list` (no findings yet) | `200`; `data.findings = []` |
| G2 | `GET /api/dottie_flags_list` | `200`; `data.flags = []` |
| G3 | A live **adjudication** turn in Dottie ("Theo says no withholding because the partnership is US-based — is that right?") | `200` stream; then `GET /api/dottie_findings_list` returns 1 row (verdict challenge/caution, claim_source/text set, authorities from cites); `dottie_flags_list` returns its flags (status open) |
| G4 | A **grounded** turn ("how does §1446(f) apply to us?" — My read, no verdict) | `200`; `dottie_findings_list` count **unchanged** (no verdict → no finding) |
| G5 | A **casual** turn ("morning") | `200`; count unchanged |
| G6 | Regression: the adjudication turn is still persisted as a normal `dottie_messages` turn + reloads in the thread | `200`; conversation intact (the finding write is post-commit/non-fatal) |

## §6 — Gap Register
**PROCEED.**
- **(G-1) Interim target derivation.** `target_ref`/`target_kind` are derived from the claim source until the Origin shell hands Dottie an explicit review target (design-system §7.3 G3 — a separate Origin-side track). Both derived `target_kind` values are valid CHECK values; when the shell contract lands, the write switches to the passed target. Disclosed.
- **(G-2) `flag_type='other'` default.** The `[[CHECK]].flags[]` entries are free-text assumption/risk lines with no type discriminator, so each becomes a `dottie_flags` row typed `other`, severity `medium`. A future enhancement could classify the flag_type from the text. Disclosed.
- **(G-3) Only verdict turns create findings.** By design (`verdict` NOT NULL): grounded "My read" answers are Dottie's supported position, not an adjudication, so they are not findings (§2.4). Disclosed.
- **(G-4) FE console = pkg 3b.** The 9/10 Overview + Checks/Flags/Audit surfaces that call these read handlers are the next package. Disclosed.
- **(G-5) No schema/migration/dependency/keys.** Reads/writes the deployed 3a.1 tables only. PROCEED.

## §7 — Deploy plan (ordered; §1D)
1. Codex Pass-2 → APPROVED/REJECTED.
2. Claude **config-zips** `func-dottie-stream` (whole-app v4, per 2b): stage `proposed-app` + `npm install --omit=dev` (UNCHANGED deps), zip, `config-zip` deploy, restart — ships the write-on-verdict.
3. Claude **Kudu-VFS deploys** `dottie_findings_list` + `dottie_flags_list` to `vaultgpt-func-dottie` (§5.5): PUT each `function.json` + `index.js` under `wwwroot/<name>/`, GET-back diff, restart.
4. Claude runs §5 golden tests live (read handlers 200; a real adjudication turn produces a finding + flags; grounded/casual turns produce none; the conversation persists intact).

## Codex activation note (Walter forwards)

```
Codex is activated for Pass-2 review of Dottie Findings/Flags Handlers (write-on-verdict + read handlers),
vault-dottie, "Codex Governance/Dottie-Findings-Flags-Handlers-Pass-1-VEP/Dottie_Findings_Flags_Handlers_VEP.md" @ commit
<HEAD>. Open with a governance-bound GCR + Rule Anchor Table; hard-gate; emit only APPROVED or REJECTED. HANDLERS-ONLY
(no migration/schema/dependency; reads+writes the DEPLOYED 3a.1 dottie_findings/dottie_flags). Two deploy targets:
func-dottie-stream (config-zip, the write-path) + func-dottie (Kudu-VFS, two read handlers). Review: (1) write-on-verdict
in dottie_message_stream.persistTurn is POST-COMMIT + NON-FATAL (the turn is already committed; a findings failure or a
no-verdict turn writes nothing — dottie_findings.verdict is NOT NULL); base c8bc9a29 (deployed 2b) -> proposed 51807a16,
everything else byte-identical. extractVerdictFinding reuses the approved FE check.ts field
normalisation (confidence{level,label}, claim{source,text}, authorities=flattened support[].cites, flags, docs) but
GATES ON verdict∈3 (the finding's NOT NULL key), where the FE parseCheck gates on lead (check.ts:63) - so grounded
"My read" turns write no finding. (2) dottie_findings_list + dottie_flags_list
EXACT-mirror the deployed dottie_list_conversations (pool/set_config/EasyAuth/envelope/limit/42501->403); only the SELECT
(3a.1 columns), route, and verdict/status filter differ. (3) Schema Reality Lock: every column exists in the deployed 3a.1
tables (schema doc §7, catalog-verified). (4) interim target_ref/target_kind derivation until the Origin shell review-target
contract (§7.3 G3) — both derived kinds are valid CHECK values (§6 G-1). (5) flags typed 'other'/'medium' (§6 G-2). node
--check PASS on all three. Golden test uses REAL live turns. Emit APPROVED or REJECTED only.
```
