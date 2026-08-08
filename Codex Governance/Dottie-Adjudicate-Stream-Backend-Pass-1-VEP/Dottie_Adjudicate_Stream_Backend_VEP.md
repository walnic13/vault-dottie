# Dottie `dottie_adjudicate_stream` — streaming governance adjudication ("watch Dottie work") — Pass 1 Backend VEP (CODE-BEARING)

> Reviewer: **Codex** (backend). THEO backend governor + Golden Handler regime. **Code-bearing** — a NEW v4 streaming function + a byte-verbatim bundled engine, shipped in `proposed-app/` for the **func-dottie-stream** SSE sidecar. Realizes Walter's 2026-08-08 redesign: replace the buffered per-exception burst with **ONE streaming call** that loads the review's workbooks ONCE, adjudicates **all** exceptions in a single gpt-5 tool-loop against the in-memory `ctx`, and **streams** the reasoning ("thinking") + tool activity + a `[[CHECK]]` verdict per exception — so the FE can render a Claude-Code-style watch-it-work surface with a Stop control. **Read/compute-only — writes nothing to Sigma; advisory** (the reviewer counter-sign remains the integrity gate). **COMPOSITE** of three deployed handlers (§2). Supersedes the buffered `dottie_adjudicate` (②) for the multi-exception path.

## Grounding Conformance Receipt

```
Role: Claude Code
Turn Type: Pass 1 — Backend Verified Evidence Pack (code-bearing; composite streaming handler)
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A
Turn issued against HEAD: vault-dottie development 47ebd37 (+ authority: vault-origin Governance Loop contract 3dcd976, Codex-APPROVED)
```

| # | Document / file (absolute path) | Read this turn | Currency (blob) |
| - | ------------------------------- | -------------- | --------------- |
| 1 | AUTHORITY — Vault Governance Loop Contract §GL4/§GL6/§GL7 (Codex-APPROVED) — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-origin/Codex Governance/VO-AH-Vault-Governance-Loop-Contract-Pass-1/VO_AH_Vault_Governance_Loop_Contract_Pass_1.md` | `Read` this turn | `3dcd976284a825e4079ec6344225e7f459cd2264` |
| 2 | Claude Code THEO Backend Governor — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md` | grounded | `e44cdd85d3d0e5df332dc754cdec731e2e68022e` |
| 3 | THEO Golden Handler Standard (§2 PR pairing; §3 as-user/RLS; §5 mirror; §5.5 deploy) — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/THEO_GOLDEN_HANDLER_STANDARD.md` | `Read` this turn | `f8f0e5ea36447502e35fb87b373c94e376f05cbb` |
| 4 | THEO Backend Grounding Conformance — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md` | grounded | `7c0d902bdff3b6c0af475b483e31ed796214e57b` |
| 5 | Codex THEO Backend Review Standard — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/CODEX_THEO_BACKEND_REVIEW_STANDARD.md` | grounded | `d2e1b9881b6e2ed7d77921a055feffb0852257fd` |
| 6 | PRIMARY REFERENCE — streaming skeleton (DEPLOYED, func-stream) — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/Codex Governance/Dottie-Adjudicate-Stream-Backend-Pass-1-VEP/primary-reference/PRIMARY_REFERENCE.sigma_review_agent_stream.js` (byte-copy of the deployed `sigma_review_agent_stream.LIVE.js`) | `Read(full)` this turn | `80171e78aee6a2cb31a6e76bf42c9c4dbb17ef2e` |
| 7 | PRIMARY REFERENCE — adjudication brains (DEPLOYED, func-dottie) — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/Codex Governance/Dottie-Adjudicate-Stream-Backend-Pass-1-VEP/primary-reference/PRIMARY_REFERENCE.dottie_adjudicate.index.js` (byte-copy of the deployed buffered handler) | `Read(full)` this turn | `e7cb4444ac592a6f864204323b6056b45dcdbdf8` |
| 8 | REFERENCE — gpt-5 Responses streaming (DEPLOYED, func-dottie-stream) — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/Codex Governance/Dottie-D2-Stream-Backend-Pass-1-VEP/proposed-app/src/functions/dottie_message_stream.js` | grounded | `51807a160c63a46cb6a47d44eba1f6529f3ec492` |
| 9 | REFERENCE — Sigma context endpoint (DEPLOYED; returns `{review(+files), checks[]}`) — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/sigma/Codex Governance/Sigma-Backend-SummaryFigures-Pass-1-VEP/handlers/sigma_get_review/index.js` | grounded (deployed) | `7486300f8fa48af25c98a63291eb5d981a1f652d` |
| 10 | FE RENDERER CONTRACT (DEPLOYED) — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/src/theo/lib/check.ts` (`CheckData`/`parseCheck`) | grounded | `53fd892efab9541299efe2106c7ed3d3162fcb96` |
| 11 | BUNDLED ENGINE (byte-verbatim from DEPLOYED func-sigma `wwwroot/engine`) — `.../proposed-app/src/engine/tool-loop.js` / `sheet-tools.js` / `registry.js` | `Read`/hash-matched this turn | `ec50418…` / `81eb2c4b…` / `3ef9394…` (tool-loop + sheet-tools = deployed byte-for-byte) |
| 12 | NEW function (this package) — `.../proposed-app/src/functions/dottie_adjudicate_stream.js` (+ `proposed-app/package.json`) | authored this turn | `f0c7f5cd9ffbab1bc6a0a14173fcdf00ee208668` (+ package.json `0a8b9e4bcb2739a5be8d6c7ac1699bb62fc930a7`) |

## Rule Anchor Table

| Source doc (absolute path) | Clause id | Verbatim clause text (read this turn) | Applied in output at |
| -------------------------- | --------- | ------------------------------------- | -------------------- |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/Codex Governance/Dottie-Adjudicate-Stream-Backend-Pass-1-VEP/primary-reference/PRIMARY_REFERENCE.sigma_review_agent_stream.js | load-once | "Load the workbook ctx (OBO via vault-dms)" | handler loads the workbook set ONCE (OBO) + builds `ctx` before opening the stream — the load-once realization |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/Codex Governance/Dottie-D2-Stream-Backend-Pass-1-VEP/proposed-app/src/functions/dottie_message_stream.js | responses-sse | "response.output_text.delta" | `relayResponsesTurn` parses the gpt-5 Responses SSE (text delta → `event: delta{kind:text}`) |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/THEO_GOLDEN_HANDLER_STANDARD.md | §3 | "honouring deployed RLS" | all data is fetched as the signed-in user (OBO to vault-dms + sigma_get_review); no elevated creds against Sigma |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/THEO_GOLDEN_HANDLER_STANDARD.md | §5 | "EXACT / ALLOWED DELTA / DEVIATION" | §5.1 Structural Mirror classifies each region against the primary references |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-origin/Codex Governance/VO-AH-Vault-Governance-Loop-Contract-Pass-1/VO_AH_Vault_Governance_Loop_Contract_Pass_1.md | §GL4 | "cleared` is advisory" | `event: done {summary, cleared}` is advisory only; nothing authoritative is mutated |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/src/theo/lib/check.ts | header | "the structured body of a [[CHECK]]...[[/CHECK]] block" | each `event: verdict` carries the deployed `CheckData` (extracted from the model's one `[[CHECK]]` block) |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/Codex Governance/Dottie-Adjudicate-Stream-Backend-Pass-1-VEP/proposed-app/src/engine/tool-loop.js | dispatch | "Route a tool_use block to its deterministic implementation." | tool calls dispatch to the bundled engine `dispatch(name,input,ctx)` against the shared in-memory `ctx` |

## §1 — Feature identification / sourcing
NEW streaming endpoint `POST /api/dottie_adjudicate_stream` on **func-dottie-stream** (v4 SSE sidecar). Input `{ review_id }` (the client sends only the id; the handler fetches the review + `files` via `sigma_get_review` and loads the workbooks itself). It adjudicates every open exception (`checks.filter(status !== 'pass')`) in ONE run and streams: `event: delta{kind:'text'|'thinking'}`, `event: tool`/`tool_result`, `event: exception`, `event: verdict{control_id, check:CheckData}`, `event: done{summary,cleared}` (+ `event: error`). Read/compute-only; writes nothing; no schema/migration; advisory.

## §2 — Primary Reference (COMPOSITE)
Per Golden Handler §2, a composite handler mirrors more than one deployed handler; each is inlined byte-verbatim in `primary-reference/`:
- **Streaming skeleton = `sigma_review_agent_stream`** (DEPLOYED on the same func-stream family; blob `80171e78`): the v4 `app.setup({enableHttpStream:true})` + `PassThrough` SSE + `sseHeaders` + auth/OBO helpers + `sigmaGetReview` + **load-workbooks-once + `ctx` build** + the clean `event: delta/tool/tool_result/error/done` protocol + the streaming tool-loop shape, all EXACT. It runs the LOCAL bundled engine `dispatch` (same as the reference).
- **Adjudication brains = `dottie_adjudicate`** (DEPLOYED buffered handler; blob `e7cb444`): `SIGMA_TOOLS` (Responses shape), `ADJUDICATION_SYSTEM_PROMPT`, per-exception context builder, `extractVerdictPayload` (fail-closed), the fail-closed forcing turn, and the 429/503 retry-backoff — EXACT / ALLOWED-DELTA.
- **gpt-5 Responses streaming = `dottie_message_stream`** (DEPLOYED; blob `51807a16`): the Azure OpenAI `/openai/responses?…stream:true` turn opener + the SSE frame parse (`response.output_text.delta`, `response.output_item.added` function_call, `response.completed` output collection). ALLOWED DELTA — extended with `reasoning:{summary:"auto"}` + a `reasoning*.delta → thinking` case (the one piece with no prior precedent; see §GAP G-2).

## §5.1 — Component Structural Mirror Table
| Region (new handler) | Reference | Classification |
|---|---|---|
| `app.setup({enableHttpStream:true})`; cors/`sseHeaders`; `nowIso`/`jsonErr`; `getPrincipal`/`getClaimValue`/`getOboInputToken`/`isUuid`; `httpsRequest`; `dmsReadFile`; `sigmaGetReview` | `sigma_review_agent_stream` | EXACT (byte-parallel) |
| load workbooks ONCE (`dmsReadFile` loop → `XLSX.read` → `ctx` w/ `k1Layout`/`partnerCols`) | `sigma_review_agent_stream` :255-266 | EXACT (files sourced from `sigma_get_review` `review.files` instead of the request body) |
| `PassThrough` client stream; async IIFE; `return {status:200, headers:sseHeaders, body:clientStream}` | `sigma_review_agent_stream` | EXACT |
| `getAadToken(OPENAI_SCOPE)` (client-creds, cognitiveservices) | `dottie_adjudicate` / `dottie_message_stream` | EXACT |
| `SIGMA_TOOLS` (6, Responses shape) + `ADJUDICATION_SYSTEM_PROMPT` + `extractVerdictPayload` (fail-closed) + forcing turn | `dottie_adjudicate` | EXACT |
| `openResponsesStream` + `openTurnWithRetry` (429/503 Retry-After/backoff, cap 30s, ≤4) | `dottie_adjudicate` retry + `dottie_message_stream` opener | ALLOWED DELTA (streaming opener + retry fused) |
| `relayResponsesTurn` — gpt-5 SSE parse → `event: delta{kind:text}` (output_text.delta) + `event: delta{kind:thinking}` (**reasoning*.delta**) + `event: tool` (output_item.added) + collect `function_call` on `response.completed` | `dottie_message_stream` `consumeTurn` + `sigma_review_agent_stream` `relayTurn` | ALLOWED DELTA (adds the reasoning→thinking forward — new) |
| tool dispatch → bundled engine `dispatch(name,input,ctx)`; `event: tool`/`tool_result`; feed `function_call`/`function_call_output` back | `sigma_review_agent_stream` loop + engine `dispatch` | EXACT (local engine, in-memory ctx = load-once) |
| per-exception loop over `checks.filter(status!=='pass')`; `event: exception`; `event: verdict{control_id, check}`; `event: done{summary,cleared}` | (Loop §GL4/§GL7 realization) | DEVIATION (intentional: one call, all exceptions, streamed — the load-once redesign; see §RECON) |
| NO conversation persistence (no `persistTurn`/Pool) | — | ALLOWED DELTA (a governance check is not a chat; writes nothing) |

## §5.2 — Golden SQL
**NONE.** The handler issues no SQL and mutates nothing. It reads via `sigma_get_review` + `dms_read_file` as the signed-in user (Sigma/DMS own all DB/graph access, read-only). No migration, no table, no schema change; the bundled engine is pure compute over in-memory workbooks.

## §5.3 — Golden Curl (SSE; run at Pass-3, post-deploy)
```
TOKEN=$(az account get-access-token --resource api://4e1a1e31-5c20-4480-99e4-098901707d9e --query accessToken -o tsv)
curl -N -sS -X POST "https://vaultgpt-func-dottie-stream.azurewebsites.net/api/dottie_adjudicate_stream" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"review_id":"<a real review VISIBLE to the signed-in user, with resolved workbooks + \u22651 exception>"}'
# Expect an SSE stream: event: exception … · event: delta {kind:"thinking"|"text"} … · event: tool / tool_result …
#   · event: verdict {control_id, check:{verdict,lead,support,…}} (one per exception) · event: done {summary,cleared}
```
Negative asserts: no token → 401 (platform EasyAuth); `{}` (missing review_id) → 400 JSON; malformed `review_id` → 400; a review the user cannot see → 403/404 JSON (before the stream opens); a review with no resolved workbooks → 422 UNRESOLVED_WORKBOOK_SET JSON. (Pre-stream failures are clean JSON — the stream opens only after the workbook ctx loads.)

## §GAP — Gap Register
**PROCEED.**
- **G-1 — Load-once, local engine (the redesign).** Per Walter 2026-08-08, this supersedes the buffered per-exception burst: workbooks load ONCE, all exceptions adjudicate in one run against the in-memory `ctx` via the BUNDLED engine (byte-verbatim from deployed func-sigma), not per-tool-call routing to `sigma_governance_tool`. Reconciled with Loop §GL6/§GL7 in §RECON. Disclosed.
- **G-2 — gpt-5 reasoning streaming has no prior precedent.** No deployed handler streams gpt-5 reasoning; `dottie_message_stream` forwards only text. This handler sets `reasoning:{effort:"medium",summary:"auto"}` and forwards `response.reasoning_summary_text.delta` (matched defensively: any `type` containing `reasoning` ending `.delta`, `delta` string or `delta.text`) as `event: delta{kind:"thinking"}`. If Azure names the frame differently, the defensive match still catches it; worst case thinking is silent (verdicts unaffected). Confirmed live in the Pass-3 dev re-verify. Disclosed. PROCEED.
- **G-3 — Advisory; writes nothing.** No Sigma/DMS mutation; `cleared`/verdicts drive only UI. Reviewer counter-sign remains the gate. PROCEED.
- **G-4 — Deploy = func-dottie-stream (Pass-3).** On APPROVED, Claude Code adds `src/functions/dottie_adjudicate_stream.js` + `src/engine/*` + `xlsx` to the live `vaultgpt-func-dottie-stream` app and zip/run-from-package redeploys; ensures `SIGMA_API_BASE_URL`/`DMS_API_BASE_URL` app settings (default to the known hosts if unset) + the existing `AZURE_OPENAI_*`/`AAD_*` env. Then runs §5.3.
- **G-5 — engine byte-provenance.** `tool-loop.js` (`ec50418`) + `sheet-tools.js` (`81eb2c4b`) are byte-identical to the DEPLOYED func-sigma engine (hash-matched this turn); `registry.js` fetched from the same live `wwwroot/engine`. Bundling (not re-authoring) keeps the deterministic engine single-sourced. Disclosed. PROCEED.

## §RECON — reconciliation with the Governance Loop contract (§GL6/§GL7)
| Contract clause | This handler | Classification |
| --- | --- | --- |
| §GL7 "Dottie runs `dottie_adjudicate` per item" | Runs ALL exceptions in ONE streaming call (load once); the per-item buffered `dottie_adjudicate` (②) remains deployed but is superseded for the multi-exception path. Same OUTCOME: one `CheckData` verdict per exception. | REALIZED-VARIANT (Walter 2026-08-08 load-once redesign) |
| §GL6 "Engine: … against func-dottie `dottie_adjudicate` (②) which re-derives via func-sigma" | Re-derives via the BUNDLED deterministic engine over the in-memory `ctx` (workbooks loaded once, OBO). Avoids the per-tool-call workbook re-load that defeats "load once". Still as-the-user (OBO to vault-dms for the bytes). | REALIZED-VARIANT (disclosed; same determinism + as-user) |
| §GL4 verdict item = deployed `CheckData` | UNCHANGED — each `event: verdict.check` is the deployed `CheckData`, parsed by the deployed `parseCheck`/`GovernanceCheck`. | MATCH |
| §GL1 advisory; human counter-sign | UNCHANGED — writes nothing; advisory. | MATCH |

## §5.4 — Parity Checklist
As-user (OBO bearer to vault-dms + sigma_get_review; RLS applies) ✓ · no elevated creds (client-creds token used ONLY for gpt-5) ✓ · input fail-closed (uuid `review_id`; endpoint configured) ✓ · **verdict fail-closed** (per exception: valid `{verdict∈enum,lead}` or a low-confidence caution placeholder; never a hollow success) ✓ · writes nothing ✓ · pre-stream failures are clean JSON (403/404/422/400) ✓ · 429/503 retry-backoff ✓ · engine byte-verbatim to deployed ✓ · `node --check` clean (function + all 3 engine files) ✓ · SSE protocol matches the FE `sendReviewAgentStream` consumer (`delta`/`tool`/`tool_result`/`done`) + the new `verdict`/`exception` frames ✓.

## Mechanical lint
`node tools/lint_microstep_submission.mjs "Codex Governance/Dottie-Adjudicate-Stream-Backend-Pass-1-VEP/Dottie_Adjudicate_Stream_Backend_VEP.md" --repo-root .` — expect PASS.

## §CODEX — activation (Walter forwards)

```
Codex is activated for Pass-2 BACKEND review of the Dottie dottie_adjudicate_stream streaming handler (code-bearing;
composite), "vault-dottie/Codex Governance/Dottie-Adjudicate-Stream-Backend-Pass-1-VEP/Dottie_Adjudicate_Stream_Backend_VEP.md"
committed at vault-dottie development <HEAD> + corporate-reporting f928152. Open Pass-2 with a GCR + Rule Anchor Table;
hard-gate against the THEO Golden Handler + Backend Conformance; emit APPROVED or REJECTED only. NEW v4 SSE endpoint on
func-dottie-stream: input {review_id}; fetches sigma_get_review (+files) as-user; loads the workbook set ONCE (OBO via
vault-dms) + builds ctx; adjudicates ALL exceptions (checks.filter status!=='pass') in ONE gpt-5 Responses tool-loop
against the BUNDLED deterministic engine (byte-verbatim from deployed func-sigma: tool-loop ec50418 + sheet-tools
81eb2c4b + registry); streams event: delta{kind:text|thinking} (thinking via reasoning:{summary:"auto"} →
reasoning_summary_text.delta), tool/tool_result, exception, verdict{control_id, check:CheckData}, done{summary,cleared}.
Review: (1) COMPOSITE — streaming skeleton EXACT to deployed sigma_review_agent_stream (load-once, PassThrough, clean
SSE, local dispatch); brains EXACT to deployed dottie_adjudicate (SIGMA_TOOLS, ADJUDICATION_SYSTEM_PROMPT,
extractVerdictPayload fail-closed, forcing turn, 429 retry); gpt-5 Responses stream from deployed dottie_message_stream.
(2) §RECON: intentionally supersedes Loop §GL6/§GL7 "per-item / route to func-sigma" with the Walter-2026-08-08
load-once/one-call/local-engine realization — SAME per-exception CheckData outcome, as-user, advisory. (3) verdict item
= deployed CheckData (no new render). (4) read/compute-only, writes nothing, no schema/migration; the only new gpt-5
call is the Responses stream. (5) reasoning-streaming (G-2) is the one no-precedent piece — defensively matched. On
APPROVED, Claude Code deploys to func-dottie-stream (zip/run-from-package: fn + engine + xlsx; env SIGMA/DMS base) +
runs the §5.3 SSE golden curl. Emit APPROVED or REJECTED only.
```

*End of Dottie `dottie_adjudicate_stream` Streaming Backend Pass-1 VEP (code-bearing).*
