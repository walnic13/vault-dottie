# Dottie Media Tools — Pass-1 VEP (find_image / find_video in dottie_message_stream)

Gives Dottie in-chat image + video like Theo, by REUSING the already-deployed `func-theo-tools` handlers (`theo_find_image`, `theo_find_video`) as **model-callable gpt-5 Responses-API FUNCTION tools** wired into a bounded tool loop inside the streaming handler. **Backend-only, one file** (`dottie_message_stream`): the transplanted Theo FE already renders the `vault_image`/`vault_video` SSE frames (verified — `src/theo/services/gateway.live.ts` `onImage`/`onVideo`), and `func-theo-tools` is unchanged. Closes the two open rows in `DOTTIE_THEO_RECONCILIATION.md` §H ("Image fetch / Video fetch — ❌ not wired").

**What's new vs the deployed handler.** The deployed `dottie_message_stream` already calls the gpt-5 **Responses API** (`/openai/responses`) with the built-in server-side `web_search` tool and relays its activity as `event: tool`/`event: tool_result`. This package adds (a) two **function tools** (`find_image`, `find_video`) to the request `tools` array (alongside `web_search`), and (b) a **bounded tool loop**: on `response.completed` the handler inspects `response.output` for `function_call` items → dispatches each to `func-theo-tools` → emits the `vault_image`/`vault_video` frame → feeds the result back as a `function_call_output` appended to `input` → re-opens the turn, up to `MAX_TOOL_TURNS`. Answer text accumulates across turns for the unchanged persistence write.

**The one real delta — auth.** Theo forwards the *user's* delegated bearer to `func-theo-tools` (func-stream shares the audience, so the tool runs "as the user"). **Dottie has no user token** — it authenticates the user via EasyAuth `x-ms-client-principal` (OID for DB scoping) and calls every downstream (gpt-5, Blob) with a **client-credentials app token** via `getAadToken(scope)`. This package calls `func-theo-tools` the same way: a client-credentials token for the tools audience (`THEO_TOOLS_SCOPE`). It is an **ALLOWED DELTA** in the same spirit as Dottie's already-approved client-credentials deltas for the model call and Blob reads; the tool runs under Dottie's app identity. **No migration; no schema; no `func-theo-tools` change.**

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Verified Evidence Pack (backend handler modification; no migration; no schema)
Grounding parent (source baseline): `4d060f2c14aa0fc190021e435387d179f8f972f0` (vault-dottie, `development`)
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD) |
| - | ------------------------------- | ------------------------------ | --------------------------------- |
| 1 | GOVERNING VISION — `governance/VAULT_MEMORY_ARCHITECTURE.md` (§A Amendment 9 — Dottie full agent on gpt-5) | `Read` this turn | `3afda098df614b11adc8a7cdcf28d0f9a3f47011` |
| 2 | Backend Governor — `governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md` (§3 Never-Guess; §4 Schema/Infra Reality Lock) | `Read`/`Grep("Never-Guess")` this turn | `e44cdd85d3d0e5df332dc754cdec731e2e68022e` |
| 3 | Grounding Conformance — `governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR; §5 Rule Anchor) | `Read` this turn | `7c0d902bdff3b6c0af475b483e31ed796214e57b` |
| 4 | Golden Handler — `governance/THEO_GOLDEN_HANDLER_STANDARD.md` (§4 EXACT mirror / allowed delta; §5.3 Golden Curl; §5.5 deploy) | `Read`/`Grep("EXACT mirror")` this turn | `f8f0e5ea36447502e35fb87b373c94e376f05cbb` |
| 5 | Execution Orchestration — `governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md` (§1D ordered pass; §1E deploy-after-Codex) | `Read` this turn | `565559b699c1309f8e750b0dbbac859c13d807c8` |
| 6 | RECONCILIATION (the gap this closes) — `spec/DOTTIE_THEO_RECONCILIATION.md` (§H Grounding/tools — find_image/find_video "not wired") | `Read`/`Grep("find_image")` this turn | `df4bfec1ceea6e512b2d213060407cc8e084ed95` |
| 7 | API Spec (Role-C target — media SSE note post-deploy) — `spec/DOTTIE_API_SPEC.md` | `Read`/`Grep` this turn | `8af56d85e4c1032a0d87be44d837e9fe9e83491b` |
| 8 | **TOOL CONTRACT — `theo_find_image` (DEPLOYED)** — `vault-theo-tools/Codex Governance/Theo-Tools-FindImage-Offset-Only-Pass-1-VEP/handlers/theo_find_image/index.js` (request `{subject,offset?}`; response `data.{imageUrl,fullImageUrl,title,pageUrl,license,creator,images[]}`) | `Read`(full, via Explore) this turn | `7af0938ff8d470307aa0a4d611969e7cc2bf2e36` |
| 9 | **TOOL CONTRACT — `theo_find_image` function.json (DEPLOYED)** — `vault-theo-tools/Codex Governance/Theo-Tools-FindImage-Offset-Only-Pass-1-VEP/handlers/theo_find_image/function.json` (`authLevel:anonymous`, POST+OPTIONS) | `Read` this turn | `eae24fc2a35728ba7f3f952022fdb8258e55e677` |
| 10 | **TOOL CONTRACT — `theo_find_video` (DEPLOYED)** — `vault-theo-tools/Codex Governance/Theo-Tools-FindVideo-Pass-1-VEP/handlers/theo_find_video/index.js` (request `{subject}`; response `data.{videoUrl,embedUrl,title,thumbnail,source,duration,date}`) | `Read`(full, via Explore) this turn | `a47d1c11592fee655ecf8abc0e00e2b3e9559ffd` |
| 11 | **TOOL CONTRACT — `theo_find_video` function.json (DEPLOYED)** — `vault-theo-tools/Codex Governance/Theo-Tools-FindVideo-Pass-1-VEP/handlers/theo_find_video/function.json` (`authLevel:anonymous`, POST+OPTIONS) | `Read` this turn | `fcb34c25fa678208145cdcae4ec0e8e8539636b2` |
| 12 | **STRUCTURAL REFERENCE — Theo tool-loop registry (DEPLOYED)** — `vault-theo/Codex Governance/Theo-Backend-FindImage-Offset-ChatTools-Pass-1-VEP/engine/chat-tools.js` (`dispatchChatTool` route→POST, `{data}` unwrap; the pattern mirrored) | `Read`(full, via Explore) this turn | `8850c347205430b937d5117a8446d8549ec02efc` |
| 13 | **STRUCTURAL REFERENCE — Theo streaming tool-loop (DEPLOYED)** — `vault-theo/Codex Governance/Theo-SPW-Phase2b3e-Member-Project-Knowledge-Pass-1-VEP/handlers/theo_message_stream.js` (the detect→dispatch→feed-back→re-open loop + `vault_image`/`vault_video` SSE the FE mirrors) | `Read`(full, via Explore) this turn | `76d69204047f60d2d3c1b6ee55b467b33468261f` |
| 14 | **MODIFIED HANDLER (proposed, committed at this package's HEAD; = deployed base + this package's media-tool loop) — `dottie_message_stream`** — `Codex Governance/Dottie-D2-Stream-Backend-Pass-1-VEP/proposed-app/src/functions/dottie_message_stream.js` | `Read`(full) + `Edit` this turn; `node --check` PASS | `031364a635fb81bef6b647a9cc1fd4aff503ef27` (base @HEAD before this package: `460681e93703d7c264c84607fec6f397833fefbd`) |
| 15 | **DEPLOY AUTHORITY (v4 sidecar) — `Codex Governance/Dottie-D2-Stream-Backend-Pass-1-VEP/Dottie_D2_Stream_Backend_VEP.md` (§7 G-2 / §8 — v4 zip-deploy / run-from-package of the WHOLE sidecar, NOT per-function Kudu-VFS)** — the approved authority §7 step 3 conforms to | `Read`(§7 G-2 / §8) this turn | `35f8dc485350292f199c45a06347dd59fd14039c` |

No ChatGPT advisory cited. No `reporting_*` / `theo_*` object touched. No `func-theo-tools` file modified (reuse only). Backend handler package (no migration; no write SQL by Claude).

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt" | GCR (head) |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §3 | "Never-Guess" | §3 — the tools audience is env-set at deploy, never hard-coded (media tools inert until `THEO_TOOLS_SCOPE` is present) |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §4 | "Schema Reality Lock" | §3 — no schema/column touched; persistence write unchanged |
| governance/THEO_GOLDEN_HANDLER_STANDARD.md | §4 | "EXACT mirror" | §4 — the detect→dispatch→feed-back loop + SSE frames mirror deployed Theo; the Responses-API loop shape + client-credentials auth are the allowed gpt-5 deltas |
| governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md | §1D | "ordered, non-skippable" | §7 — Codex → (env set) → deploy → golden test → Role-C |
| spec/DOTTIE_THEO_RECONCILIATION.md | §H | "BUILD/REUSE func-theo-tools" | §1 — this package wires the reused tools |

---

## §1 — Feature
When the user asks Dottie to show an image or play a video, gpt-5 calls `find_image` / `find_video` (model-callable function tools). The handler dispatches the call to the deployed `func-theo-tools` endpoint, streams the result to the browser as the `vault_image` (gallery) / `vault_video` (YouTube embed or thumbnail card) SSE frame the FE already renders, and feeds the tool result back to gpt-5 so it can add a short caption — all within one streamed turn. `web_search` (already live) is unaffected; both tool types coexist in the same request.

## §2 — Architecture & boundary
**One file, additive.** Everything outside the media-tool additions is byte-identical to the deployed `dottie_message_stream` (base @HEAD `460681e9…` → proposed `031364a6…`, git-diffable). The additions are: (a) a **Media tools block** (constants `TOOLS_BASE`/`TOOLS_SCOPE`/`MAX_TOOL_TURNS`, `MEDIA_TOOL_ROUTES`, the two `MEDIA_TOOLS` function schemas, `ACTIVE_TOOLS`, and `dispatchMediaTool`); (b) a one-line `effectiveSystem` media note (only when tools are enabled); (c) the streaming section refactored from a single upstream request into a **bounded tool loop** (`openUpstream` + `consumeTurn` + the driver).

**Reuse, not rebuild.** `func-theo-tools` is untouched. `dispatchMediaTool` POSTs `{subject[,offset]}` to `/api/theo_find_*` and unwraps the `{data}` envelope — the exact contract of the deployed handlers (GCR rows 8–11) and the same shape as Theo's `dispatchChatTool` (row 12).

**Boundary.** Owner identity (OID) and DB scoping are unchanged. Media tools are **stream-only** (the buffered `dottie_message` has no SSE media channel — same as Theo, which ships these tools only in the streaming path). No route/`function.json` change. No `theo_*`/`reporting_*` access. Server-side `web_search` and attachment injection (B8d/B8i) are preserved verbatim.

**gpt-5 Responses-API loop shape (allowed delta).** Theo's loop appends Anthropic `assistant`/`tool_result` blocks to a `messages` array and re-opens; Dottie appends Responses-API `function_call` + `function_call_output` items to the `input` array and re-opens. Same concept, different API — an intrinsic delta because Dottie is gpt-5, not Claude/Foundry.

## §3 — Schema & Infra Reality Lock (Governor §3/§4)
- **Schema — SATISFIED, no migration.** Persistence is unchanged (`persistTurn` still writes only the deployed `dottie_messages` columns `created_by, conversation_id, message_seq, role, content, model`). Media results are **not persisted** this cut (stream-only) — disclosed as G-MEDIA-PERSIST. No DDL.
- **Infra — Never-Guess.** The `func-theo-tools` audience is **not hard-coded** (it is truncated to `api://4e1a1e31-…` in every governance doc; inventing the remainder is a Never-Guess violation). Instead the audience is an env value `THEO_TOOLS_SCOPE`, set at deploy from the live `func-theo-tools` EasyAuth config (`az webapp auth show`). **Media tools stay inert until it is set** (`ACTIVE_TOOLS` omits them when `TOOLS_SCOPE === ""`), so an unconfigured deploy degrades gracefully to text + web_search. Env also: `THEO_TOOLS_BASE` (default `https://vaultgpt-func-theo-tools.azurewebsites.net`), `DOTTIE_MAX_TOOL_TURNS` (default 8). No new secret (reuses the existing `AAD_CLIENT_ID`/`AAD_CLIENT_SECRET`/`AAD_TENANT_ID` client-credentials app).

## §4 — The change + Structural Mirror (Golden §4)
`node --check` PASS. Route/method/auth unchanged.

| Region | Classification | Notes |
| ------ | -------------- | ----- |
| detect a tool call in the stream → dispatch to `func-theo-tools` → emit `vault_image`/`vault_video` SSE → feed result back → re-open the turn, bounded by `MAX_TOOL_TURNS`; `dispatchMediaTool` route→`POST /api/theo_find_*` + `{data}` unwrap | **EXACT MIRROR (structure)** | mirrors deployed Theo `dispatchChatTool` + the streaming tool-loop (GCR rows 12–13); the `vault_image`/`vault_video` payloads match the FE's `onImage`/`onVideo` parse exactly (`{url,title,source,pageUrl,license,creator,images}` / `{videoUrl,embedUrl,title,thumbnail,source,duration,date}`) |
| **loop transport** — Responses-API `function_call` + `function_call_output` items appended to `input` and re-opened (vs Theo's Anthropic `assistant`/`tool_result` blocks on a `messages` array) | **ALLOWED DELTA (gpt-5)** | intrinsic: gpt-5 Responses API, not Claude/Foundry. The function-tool schema is the flat Responses shape `{type:"function",name,description,parameters}` |
| **downstream auth** — client-credentials token for `THEO_TOOLS_SCOPE` (vs Theo's forwarded user-delegated bearer) | **ALLOWED DELTA (Dottie has no user token)** | consistent with Dottie's approved client-credentials deltas for gpt-5 + Blob; the tool runs under Dottie's app identity (see §5 G-AUTH verify) |
| tool descriptions instruct the model NOT to paste URLs (the app renders media) | **EXACT MIRROR** | matches Theo's tool descriptions |

## §5 — Golden test (Golden §5.3; Claude runs post-deploy, after `THEO_TOOLS_SCOPE` is set)
Authenticated az bearer for Dottie's stream endpoint.
| # | Step | Expect |
| - | ---- | ------ |
| M1 | `dottie_message_stream` with `{messages:[{role:"user",content:"show me a picture of the Golden Gate Bridge"}]}` | `200` stream; an `event: tool {name:"find_image"}` then `event: vault_image` with `url` starting `https://` + an `images` array; a short caption; **no pasted URL in the text** |
| M2 | `{messages:[{role:"user",content:"play a video of how compound interest works"}]}` | `200`; `event: vault_video` with `videoUrl` https:// and (for a YouTube hit) an `embedUrl` `youtube-nocookie.com/embed/...` |
| M3 | **G-AUTH (the client-credentials gate):** confirm M1/M2 return `ok:true` (not an `event: tool_result {ok:false}`) | the client-credentials token for `THEO_TOOLS_SCOPE` is accepted by `func-theo-tools` EasyAuth. **If `ok:false` / 401:** Walter authorizes Dottie's app to the tools audience (add its appId to the allowed client apps / assign the app role) — a one-line Azure step; media is NOT claimed working until M3 is green |
| M4 | a plain factual question (no media ask) | unchanged: text + optional `web_search`; no media frame; the tool loop breaks on the first no-function-call turn |
| M5 | reload the M1 conversation | text rehydrates; **the image does not** (stream-only this cut) — matches G-MEDIA-PERSIST |
| M6 | Walter FE smoke test in the live Dottie SWA: "show me a picture of a red panda" | the gallery renders inline (the transplanted FE `onImage` path) |

## §6 — Gap Register
**PROCEED** (grounded; no schema; the two deploy-time unknowns are env/Azure config, verified by golden curl, not code risks).
- **G-AUTH: VERIFY-AT-DEPLOY.** Whether `func-theo-tools` EasyAuth accepts Dottie's client-credentials app token (M3). Standard "matching audience + tenant issuer" validation should pass; if the app is restricted to an allow-list, Walter grants Dottie's appId (one-line Azure step). Media is NOT claimed working until M3 is green (verify, don't overclaim).
- **G-TOOLLOOP-SHAPE: VERIFY-AT-DEPLOY.** The turn-2 transport (appending `function_call` + `function_call_output` items to `input` and re-opening) is the documented stateless Responses-API pattern; verified by M1 producing an `event: vault_image` (which only happens if turn-2 succeeds). Documented fallback if Azure requires server-state: switch to `previous_response_id` + only the `function_call_output` items (a localized change) — will not be claimed working until M1 is green.
- **G-MEDIA-PERSIST: DISCLOSED (follow-up).** Media is stream-only this cut (no `media` column on `dottie_messages`; adding it is a Walter-only migration). Theo persists media; Dottie parity for reload is a disclosed follow-up. Text/history are unaffected.
- **G-BUFFERED: DISCLOSED.** `dottie_message` (buffered) gets no media tools (no SSE media channel) — same as Theo. Intentional.
- **G-RECON / G-APISPEC: PRE-LAND (Role-C).** Post-deploy, `spec/DOTTIE_THEO_RECONCILIATION.md` §H flips find_image/find_video to LIVE and `spec/DOTTIE_API_SPEC.md` gains the `vault_image`/`vault_video` media-SSE note on the stream endpoint. Disclosed.
- **G-PROMPT-WEBSEARCH: NOTED (out of scope).** `DOTTIE_SYSTEM_PROMPT` still says "you do NOT currently have live web search" though `web_search` is enabled — pre-existing, behavioral, not touched by this media package; flagged to Walter for a separate turn.

## §7 — Deploy plan (ordered; §1D)
1. Codex Pass-2 → APPROVED/REJECTED.
2. **Env:** discover the `func-theo-tools` EasyAuth audience (`az webapp auth show -n vaultgpt-func-theo-tools`); set `THEO_TOOLS_SCOPE=<audience>/.default` (and, if overriding defaults, `THEO_TOOLS_BASE`) on `vaultgpt-func-dottie-stream`.
3. **Claude v4 zip-deploys the sidecar** to `vaultgpt-func-dottie-stream`: rebuild the whole v4 package (`host.json` + `package.json` + `src/functions/dottie_message_stream.js` + installed `node_modules`) and deploy the **whole app** via zip / run-from-package — **NOT** per-function Kudu-VFS (v4 apps deploy the whole package; the per-fn Kudu-VFS PUT path is v3 `func-dottie` only). This mirrors the approved D2-Stream sidecar deploy authority (`Dottie_D2_Stream_Backend_VEP.md` §7 G-2 / §8; GCR row 15). The sidecar already exists from D2-Stream — this re-deploys the updated handler; restart and verify the deployed `dottie_message_stream` reflects the new blob (`031364a6…`).
4. Claude runs §5 golden tests, including the G-AUTH gate (M3). If M3 fails, escalate the one-line Azure authorization to Walter; re-run.
5. Role-C: reconciliation §H → LIVE; API-spec media-SSE note.
6. Walter FE smoke test (M6).

## Codex activation note (Walter forwards)

```
Codex is activated for Pass-2 review of Dottie Media Tools (find_image/find_video in dottie_message_stream),
vault-dottie, "Codex Governance/Dottie-Media-Tools-Backend-Pass-1-VEP/Dottie_Media_Tools_VEP.md". Open with a
governance-bound GCR + Rule Anchor Table. BACKEND HANDLER MODIFICATION — one file, additive; NO migration, NO
schema, NO func-theo-tools change (reuse only). Gives Dottie in-chat image/video by adding find_image/find_video
as gpt-5 Responses-API FUNCTION tools + a bounded tool loop in dottie_message_stream; the transplanted Theo FE
already renders the vault_image/vault_video SSE frames. Review: (1) the detect→dispatch→emit-SSE→feed-back→re-open
loop + dispatchMediaTool (route→POST /api/theo_find_* + {data} unwrap) is an EXACT MIRROR of the deployed Theo
tool-loop (GCR rows 12-13); the vault_image/vault_video payloads match the FE onImage/onVideo parse. (2) ALLOWED
DELTAS: the Responses-API loop transport (function_call/function_call_output items on `input`, flat function-tool
schema) and the downstream auth (client-credentials token for THEO_TOOLS_SCOPE — Dottie has no user token to
forward, consistent with its approved client-credentials deltas for gpt-5 + Blob). (3) Never-Guess: the tools
audience is env-set at deploy, never hard-coded; media tools stay inert until THEO_TOOLS_SCOPE is present.
(4) Schema Reality Lock: persistence unchanged; media is stream-only (G-MEDIA-PERSIST disclosed). (5) fail-closed:
dispatchMediaTool never throws (returns {error}); a token/tool failure emits tool_result{ok:false} and continues.
(6) golden test incl. the G-AUTH gate (M3) — media is NOT claimed working until the client-credentials call is
accepted (verify, don't overclaim). node --check PASS. Emit APPROVED or REJECTED only.
```
