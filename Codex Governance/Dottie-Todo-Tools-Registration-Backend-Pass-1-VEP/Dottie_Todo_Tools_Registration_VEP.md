# Dottie TODO Tools Registration — Pass-1 VEP (create/list/update/complete in dottie_message_stream)

Package 3 of the cross-agent TODO tool (#3), the **Dottie half**. Registers the four TODO tools (`create_todo` / `list_todos` / `update_todo` / `complete_todo`) in Dottie's streaming tool array so gpt-5 can call the **already-deployed, golden-green** func-theo-tools handlers (`theo_create_todo` / `theo_list_todos` / `theo_update_todo` / `theo_complete_todo`, the shared `theo_todos` store). Mirrors the deployed Theo `chat-tools` registration (Pkg-2, LIVE + verified end-to-end). Backend-only, one file: `dottie_message_stream.js`.

**The one real design point — auth (as-the-user, no client-credentials for TODOs).** Dottie's media tools (#2) call func-theo-tools with a **client-credentials** token (ephemeral images → app identity is fine). But a TODO's `created_by` MUST be the **human**, so the TODO tools instead **forward the caller's own incoming bearer** — `dottie_message_stream` already receives it (`request.headers.get("authorization")`), and func-dottie-stream + func-theo-tools share EasyAuth audience `api://4e1a1e31-…`, so the same token authorizes the call and the deployed handler records `created_by` = the signed-in user (identical to how Theo forwards the bearer). No allowlist, no OBO, no app-identity attribution. `agent` is fixed to `"dottie"`. TODO results are relayed as **text** (no SSE frame).

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Verified Evidence Pack (backend handler modification; no migration; no schema; reuse of deployed handlers)
Grounding parent (source baseline): `69536b20b44da09ab2898def448fc1cdf33df4ed` (vault-dottie, `development`)
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD) |
| - | ------------------------------- | ------------------------------ | --------------------------------- |
| 1 | GOVERNING VISION — `governance/VAULT_MEMORY_ARCHITECTURE.md` (§1 L1.5 TODOs = engagement memory; §10 Stage 1) | `Read` this turn | `3afda098df614b11adc8a7cdcf28d0f9a3f47011` |
| 2 | TODO PRE-SPEC — `spec/DOTTIE_MEMORY_MODEL.md` (§6 the shared cross-agent TODO tool; Dottie subscribes) | `Read`/`Grep("TODO tool")` this turn | `6bcdb25b92d532536922b2057d4b854f9613d0ce` |
| 3 | Backend Governor — `governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md` (§3 Never-Guess; §4 Schema/Infra Reality Lock) | `Read`/`Grep("Never-Guess")` this turn | `e44cdd85d3d0e5df332dc754cdec731e2e68022e` |
| 4 | Grounding Conformance — `governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR; §5 Rule Anchor) | `Read` this turn | `7c0d902bdff3b6c0af475b483e31ed796214e57b` |
| 5 | Golden Handler — `governance/THEO_GOLDEN_HANDLER_STANDARD.md` (§4 EXACT mirror / allowed delta; §5.5 deploy) | `Read`/`Grep("EXACT mirror")` this turn | `f8f0e5ea36447502e35fb87b373c94e376f05cbb` |
| 6 | Execution Orchestration — `governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md` (§1D ordered pass; §1E deploy-after-Codex) | `Read` this turn | `565559b699c1309f8e750b0dbbac859c13d807c8` |
| 7 | RECONCILIATION — `spec/DOTTIE_THEO_RECONCILIATION.md` (§H Grounding/tools — the tool catalog Role-C flips post-deploy) | `Read` this turn | `ff859057625dc6ca735f7374daaee7b2c35abfd4` |
| 8 | **TOOL CONTRACT — `theo_create_todo` (DEPLOYED, Pkg-1)** — `vault-theo-tools/Codex Governance/Theo-Tools-Todo-Store-Pass-1-VEP/handlers/theo_create_todo/index.js` (request `{agent,title,detail?,project_id?,source_ref?}`; response `data.{todo}`) | `Read`(full) this turn | `b8630b3ff6aa6579a388454ffde34fc031cd437f` |
| 9 | **TOOL CONTRACT — `theo_list_todos` (DEPLOYED)** — `.../handlers/theo_list_todos/index.js` (request `{project_id?,status?}`; response `data.{todos[]}`) | `Read`(full) this turn | `3d74ce2dec7cffb87c847f5b540888b52aa35543` |
| 10 | **TOOL CONTRACT — `theo_update_todo` (DEPLOYED)** — `.../handlers/theo_update_todo/index.js` (request `{id,title?,detail?,status?}`; response `data.{todo}`) | `Read`(full) this turn | `b9b4b6efee312539ec9216ecb8a7d6cb37934911` |
| 11 | **TOOL CONTRACT — `theo_complete_todo` (DEPLOYED)** — `.../handlers/theo_complete_todo/index.js` (request `{id}`; response `data.{todo}`) | `Read`(full) this turn | `eb5f8c54206c033f12378fdb51019ec5fdb0f457` |
| 12 | **SIBLING REGISTRATION (DEPLOYED + verified) — Theo `chat-tools` TODO entries** — `vault-theo/Codex Governance/Theo-Backend-Todo-Tools-Registration-Pass-1-VEP/engine/chat-tools.js` (the same four tools registered on func-stream; the pattern this Dottie half mirrors) | `Read`(full) this turn | `5daea3e61de1968088511b4b0ca5b8db152feb5c` |
| 13 | **MODIFIED HANDLER (proposed, committed at this package's HEAD) — `dottie_message_stream`** — `Codex Governance/Dottie-D2-Stream-Backend-Pass-1-VEP/proposed-app/src/functions/dottie_message_stream.js` | `Read`(full) + `Edit` this turn; `node --check` PASS | `2c4edac55d36ba8b93913d738dbcd0911e1ff3b2` (base @HEAD before this package = deployed: `031364a635fb81bef6b647a9cc1fd4aff503ef27`) |
| 14 | **DEPLOY AUTHORITY (v4 sidecar) — `Codex Governance/Dottie-D2-Stream-Backend-Pass-1-VEP/Dottie_D2_Stream_Backend_VEP.md` (§7 G-2 / §8 — v4 zip-deploy / run-from-package of the WHOLE sidecar, NOT per-function Kudu-VFS)** | `Read`(§7 G-2 / §8) this turn | `35f8dc485350292f199c45a06347dd59fd14039c` |

No ChatGPT advisory cited. No `reporting_*` / `theo_*` object touched. No `func-theo-tools` file modified (reuse only). No migration; no schema; no write SQL by Claude.

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt" | GCR (head) |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §3 | "Never-Guess" | §3 — the tools audience/base are env-derived; TODO auth = the forwarded user bearer (not invented) |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §4 | "Schema Reality Lock" | §2 — no schema/DB touched; the deployed theo_todos handlers are reused as-is |
| governance/THEO_GOLDEN_HANDLER_STANDARD.md | §4 | "EXACT mirror" | §4 — the four tool entries mirror the existing media-tool entry structure + the deployed Theo chat-tools TODO registration; the auth path (user-bearer forward) is the documented delta |
| governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md | §1D | "ordered, non-skippable" | §7 — Codex → deploy → live verify → Role-C |
| spec/DOTTIE_MEMORY_MODEL.md | §6 | "The shared TODO tool (cross-agent)" | §1 — this package wires Dottie to the shared store both agents use |

---

## §1 — Feature
When the user asks Dottie to track a task / show her work (a check she raised, a document she needs, a flag to clear), gpt-5 calls `create_todo` / `list_todos` / `update_todo` / `complete_todo`. Dottie dispatches to the deployed func-theo-tools handlers **as the signed-in user** (forwarded bearer), so the TODO is owned by the human and appears in the same `theo_todos` store Theo writes to. `create_todo` tags `agent="dottie"`. Results are relayed to the user as text (no SSE frame). `web_search` + the media tools (#2) are unaffected; all coexist in the same request `tools` array + tool loop.

## §2 — Architecture & boundary
**One file, additive.** Everything outside the TODO additions is byte-identical to the deployed `dottie_message_stream` (base `031364a6` → proposed `2c4edac5`, git-diffable). The additions: (a) `TODO_TOOL_ROUTES` + `TODO_TOOLS` (four flat gpt-5 function schemas) + `ACTIVE_TOOLS` now includes them; (b) `dispatchTodoTool` (posts the model's input verbatim to `/api/theo_*_todo` with the **user bearer**; unwraps `{data}`; never throws); (c) `userBearer` captured from the incoming `Authorization` header; (d) `consumeTurn` collects TODO function-calls (early `event: tool` indicator + `response.completed` collection) alongside media; (e) the driver loop branches — TODO → `dispatchTodoTool(userBearer)` (no frame); media → `dispatchMediaTool(client-creds)` + `vault_image`/`vault_video` frame; (f) a one-line `effectiveSystem` TODO note.

**Reuse, not rebuild.** `func-theo-tools` + the `theo_todos` schema are untouched (deployed in Pkg-1). No new endpoint, no DB/schema/migration/Blob/MI. No `theo_*`/`reporting_*` object touched. TODO tools are **always active** (they need only `TOOLS_BASE` + the user bearer), independent of `THEO_TOOLS_SCOPE` (which gates the media tools).

**Schema/Infra Reality Lock (Governor §4):** SATISFIED — no schema change; the deployed `theo_todos` store + handlers are reused. No infra change (func-dottie-stream already has the incoming user bearer; no new env required — `THEO_TOOLS_BASE` already defaulted from #2).

## §3 — Identity model (the crux, no allowlist)
`created_by` on `theo_todos` is set server-side by the deployed handler from the **JWT claim** (never a parameter). For the TODO tools to attribute to the human, Dottie forwards the **caller's own incoming bearer** (`request.headers.get("authorization")`) to func-theo-tools. This works because func-dottie-stream and func-theo-tools share EasyAuth audience `api://4e1a1e31-5c20-4480-99e4-098901707d9e` — the same delegated token that authenticated the user to Dottie also authenticates the tool call, and EasyAuth injects the human's OID. **No client-credentials (that would attribute to Dottie's app), no OBO, no maintained allowlist.** The model never supplies identity; `agent` is a fixed display tag (`"dottie"`). This is the same as-the-user model Theo uses (its `dispatchChatTool` forwards the bearer).

## §4 — The change + Structural Mirror (Golden §4)
`node --check` PASS. Route/method/streaming envelope unchanged.

| Region | Classification | Notes |
| ------ | -------------- | ----- |
| `TODO_TOOLS` four function schemas (flat gpt-5 `{type:"function",name,description,parameters}`); added to `ACTIVE_TOOLS`; `consumeTurn` collects their calls | **EXACT MIRROR (structure)** | identical entry structure to the deployed `MEDIA_TOOLS` (find_image/find_video) already in this file; input_schemas match the deployed handler request contracts (GCR rows 8–11) + the deployed Theo chat-tools TODO registration (row 12) |
| `dispatchTodoTool` (route→`POST /api/theo_*_todo` + `{data}` unwrap) | **EXACT MIRROR** | structurally identical to `dispatchMediaTool`, minus media-specific subject-slicing (posts input verbatim; the handler validates) |
| **auth = forward the incoming USER bearer** (vs the media tools' client-credentials token) | **ALLOWED DELTA (as-the-user)** | required so `created_by` is the human; mirrors Theo's forwarded-bearer dispatch; shared audience — no client-creds/OBO/allowlist |
| no SSE frame for TODO results (relayed as text) | **ALLOWED DELTA** | TODO results are non-media; the model relays them (matches Theo) |
| `agent` fixed `"dottie"` (required enum); `create_todo` description says the app has no separate task-list view yet | **EXACT MIRROR** | mirrors Theo's `agent:"theo"` enum + the accurate text-relay description (the Codex T13 fix on the Theo side) |
| media tools' client-credentials path, web_search, attachments, persistence | **UNCHANGED** | byte-identical to the deployed base |

No DEVIATION rows.

## §5 — Golden test (Golden §5.3; Claude runs post-deploy, via the live Dottie streaming path as `wmansfield@vault-tax.com`)
| # | Step | Expect |
| - | ---- | ------ |
| T1 | Dottie turn: "add a TODO: confirm the §1446(f) withholding on the ABC exit" | a `create_todo` `tool_use` → `event: tool_result {ok:true}`; the created row's `created_by` = the human OID (not Dottie's app), `agent`="dottie" (verify via T2 or the store) |
| T2 | Dottie turn: "list my TODOs" | `list_todos` `ok:true`; the T1 item is returned (same `theo_todos` store Theo writes to — cross-agent shared) |
| T3 | Dottie turn: "mark that in progress, then complete it" | `update_todo` + `complete_todo` `ok:true`; status transitions |
| T4 | cross-agent check: a TODO Dottie created is visible when **Theo** lists (same user) | shared store confirmed |
| T5 | media regression: "show me a picture of a red panda" | `vault_image` still renders (client-credentials media path unchanged) |
| T6 | no-tool turn | clean text; no spurious tool call |

## §6 — Gap Register
**PROCEED.**
- **(G-1) User-bearer forwarding.** The TODO tools require the incoming `Authorization` bearer to be present + valid for the shared audience. The FE already sends it (aud `api://4e1a1e31…/access_as_user`; EasyAuth passes it through) — the same token Dottie already uses. If absent, `dispatchTodoTool` returns a clean `{error}` (the model relays "couldn't record it"), never a crash. Verified live in T1. PROCEED.
- **(G-2) Media tools unchanged.** The client-credentials path + `vault_image`/`vault_video` frames are byte-unchanged; the media-token fetch is now lazy (only when a media call is present) so a TODO-only turn never touches it. PROCEED.
- **(G-3) Role-C (catalog + API Spec).** With this Dottie half live, the tool is usable end-to-end from both agents → the vault-theo-tools platform catalog + `DOTTIE_API_SPEC` / `DOTTIE_THEO_RECONCILIATION` TODO rows flip to DEPLOYED via Role-C post-deploy. PROCEED.
- **(G-4) `project_id` model-supplied.** Included only when a project is in context; the deployed handler enforces membership (403 non-member, fail-closed). PROCEED.
- **(G-5) No schema/migration/keys/npm/FE.** PROCEED.

## §7 — Deploy plan (ordered; §1D)
1. Codex Pass-2 → APPROVED/REJECTED.
2. Claude **v4 zip-deploys the sidecar** to `vaultgpt-func-dottie-stream` (whole-app zip / `config-zip`, NOT per-function Kudu-VFS — per the D2-Stream authority, GCR row 14): rebuild the package with the updated `dottie_message_stream.js`, deploy, restart. (No new env — `THEO_TOOLS_BASE` already set from #2.)
3. Claude runs §5 golden tests via the live Dottie streaming path.
4. Role-C: flip the tool catalog + API-spec/reconciliation TODO rows to DEPLOYED (both agents live).

## Codex activation note (Walter forwards)

```
Codex is activated for Pass-2 review of Dottie TODO Tools Registration (Package 3 of the cross-agent TODO tool),
vault-dottie, "Codex Governance/Dottie-Todo-Tools-Registration-Backend-Pass-1-VEP/Dottie_Todo_Tools_Registration_VEP.md".
Open with a governance-bound GCR + Rule Anchor Table. BACKEND HANDLER MODIFICATION — one file (dottie_message_stream.js),
additive; NO migration, NO schema, NO func-theo-tools change (reuse of the deployed, golden-green theo_todos handlers).
Registers create/list/update/complete_todo as gpt-5 Responses-API function tools + a branch in the existing tool loop.
Review: (1) the four TODO tool schemas + dispatchTodoTool (route→POST /api/theo_*_todo + {data} unwrap) EXACT-mirror
the deployed MEDIA_TOOLS entries in this file + the deployed Theo chat-tools TODO registration (GCR rows 8-12);
input_schemas match the deployed handler request contracts. (2) THE KEY DELTA + crux: TODO tools forward the caller's
own incoming USER bearer (request.headers.get("authorization")) — NOT the client-credentials token the media tools use —
so created_by is the HUMAN (shared audience api://4e1a1e31-…; same as Theo's forwarded-bearer dispatch). No allowlist,
no OBO, no app-identity attribution. agent fixed "dottie"; TODO results relayed as text (no SSE frame). (3) Schema/Infra
Reality Lock: no schema/DB/infra change (deployed theo_todos reused). (4) fail-closed: dispatchTodoTool never throws
(returns {error}); media-token fetch is lazy so a TODO-only turn is unaffected by it. (5) media tools / web_search /
attachments / persistence byte-unchanged (base 031364a6 → proposed 2c4edac5). (6) golden test incl. cross-agent shared
store (a Dottie-created TODO visible to Theo) + created_by=human. node --check PASS. Deploy = v4 whole-app zip to
func-dottie-stream (NOT per-fn Kudu-VFS; D2-Stream authority). Emit APPROVED or REJECTED only.
```
