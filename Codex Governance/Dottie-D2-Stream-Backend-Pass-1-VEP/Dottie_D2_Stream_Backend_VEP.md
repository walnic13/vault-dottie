# Dottie Phase D2-Stream — `dottie_message_stream` (v4 SSE sidecar) — Pass-1 VEP

Backend companion to D2 ([[VAULT_MEMORY_ARCHITECTURE.md]] §A Amendment 9). Delivers Dottie's **streaming** chat path so gpt-5's tokens render in real time instead of the client waiting on a buffered reply — the exact latency-killer Walter flagged for Theo. This is the **faithful Dottie port of the deployed Theo B9 streaming sidecar** (`theo_message_stream`): the **v4 programming model** with HTTP streaming, an **SSE relay** of the upstream model to the browser verbatim, and **persistence of the full turn on stream completion** (identical DB write to buffered `dottie_message` → history/reload identical). It replicates Theo's topology exactly: a **new Windows v4 Function App `vaultgpt-func-dottie-stream`** sharing the existing EP1 plan (≈$0), hosting **only** `dottie_message_stream`; **`vaultgpt-func-dottie` and its `dottie_ask` + D2 trio are NOT touched** — they stay v3 as the non-streaming endpoints, exactly as Theo kept its monolith. Two allowed deltas vs the Theo mechanism (Golden §4): (1) the model call is **Azure OpenAI gpt-5** `chat/completions` with `stream:true` (client-credentials `getAadToken`) — endpoint/scope/body from the deployed `dottie_ask`, error-envelope from the `theo_message_stream` reference (byte-identical to neither) — NOT Foundry-Anthropic (observer independence); (2) the relayed SSE + the parse-for-persistence follow the **OpenAI chunk shape** (`choices[].delta.content` … `[DONE]`). Dottie-L1 memory injected; no attachments/RAG/web-tools/thinking/project-sharing. **No migration** (reuses the deployed D1 tables).

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Verified Evidence Pack (backend implementation package — one v4 streaming handler + sidecar app files; no migration)
Grounding parent (source baseline): `836a5ef12a00d998aa556d96cad713d694e20990` (vault-dottie, `development`) — this package is carried at a later reviewed commit named only in the Codex activation note; currency anchors below are tip-independent blob SHAs
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD) |
| - | ------------------------------- | ------------------------------ | --------------------------------- |
| 1 | GOVERNING VISION — `governance/VAULT_MEMORY_ARCHITECTURE.md` (§A Amendment 9 — Dottie full agent, replicate Theo, Dottie-L1) | `Read`(§A9) this turn | `3afda098df614b11adc8a7cdcf28d0f9a3f47011` |
| 2 | Backend Governor — `governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md` (§3 Never-Guess; §4 Schema Reality Lock; §8 VEP/Gap Register) | `Grep("Never-Guess")` + `Grep("Schema Reality Lock")` this turn | `e44cdd85d3d0e5df332dc754cdec731e2e68022e` |
| 3 | Grounding Conformance — `governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR; §5 Rule Anchor) | `Grep("MUST open with a Grounding Conformance Receipt")` this turn | `7c0d902bdff3b6c0af475b483e31ed796214e57b` |
| 4 | Golden Handler — `governance/THEO_GOLDEN_HANDLER_STANDARD.md` (§2 canonical primary reference; §4 allowed deltas / EXACT-mirror; §5.1 Structural Mirror Table; §5.3 Golden Curl; §5.5 deploy) | `Grep("EXACT mirror")` this turn | `f8f0e5ea36447502e35fb87b373c94e376f05cbb` |
| 5 | Execution Orchestration — `governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md` (§1D ordered pass; §1E deploy-after-Codex-APPROVED — sidecar authority per the Walter authorization below) | `Grep("ordered, non-skippable")` this turn | `565559b699c1309f8e750b0dbbac859c13d807c8` |
| 6 | SCHEMA TRUTH — `spec/DOTTIE_AZURE_POSTGRES_SCHEMA.md` (the deployed D1 `dottie_conversations`/`dottie_messages`/`dottie_user_memory` this handler reads+writes) | `Read`(§3/§4) this turn | `bb096db53a8d76dc3589b3744f6492ddad8f1f7f` |
| 7 | **CANONICAL PRIMARY REFERENCE (1/2) — the streaming MECHANISM** — deployed Theo B9 `theo_message_stream` (v4 `app.setup({enableHttpStream:true})` + `PassThrough` SSE relay + persist-on-end + `vault_meta`; the foundational clean streamer, before SPW/tool-loop accretion Dottie omits) | `Read`(§H-STREAM, full) this turn; byte-identical copy in-package | vault-theo `2939303ffa2d1164ed2987aa0052ae34f3ed07f3` |
| 8 | **CANONICAL PRIMARY REFERENCE (2/2) — the gpt-5 model call** — deployed `dottie_ask.index.js` (client-credentials `getAadToken` → Azure OpenAI gpt-5 `chat/completions`; endpoint/scope/body reused as an allowed-delta with `stream:true` added — error-envelope from the `theo_message_stream` reference, so byte-identical to neither) | `Read`(dottie_ask.index.js, full — this session) this turn; byte-identical copy in-package | vault-dottie `531568ca1ef7768ad2ce11fd8692f90911a265ad` |
| 9 | STRUCTURAL COMPANION (NOT a cleared dependency — D2 rev-2 is in re-review; see G-0) — buffered `dottie_message.index.js` (D2, this repo) — the Dottie-L1 injection + `dottie_*` lazy-create/seq/persist that `persistTurn` mirrors structurally. This package's persistence is grounded on the DEPLOYED D1 schema (row 6), NOT on this handler; the companion is a structural-parity reference only. | `Read`(dottie_message.index.js, full) this turn | vault-dottie `a8ab0f6990c9be3779649f93568b92a075a33072` (D2 rev-2 @ `a123bad`, pending Codex) |

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt" | GCR (head) |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §3 | "Never-Guess" | §3 — v4 mechanism + gpt-5 call mirrored from deployed handlers, not invented |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §4 | "Schema Reality Lock" | §3 — reads/writes only the deployed D1 dottie_* tables |
| governance/THEO_GOLDEN_HANDLER_STANDARD.md | §4 | "EXACT mirror" | §5 / §CHANGESET — the v4 mechanism + shared helpers EXACT-mirror deployed theo_message_stream; the gpt-5 call is an ALLOWED DELTA (endpoint/scope/body from dottie_ask, error-envelope from theo_message_stream — byte-identical to neither) |
| governance/THEO_GOLDEN_HANDLER_STANDARD.md | §2 | "deployed `function.json` file as the canonical Primary Reference" | §5 — two deployed primary references inlined (v4 has NO function.json — registration is in-code; noted §2) |
| governance/THEO_GOLDEN_HANDLER_STANDARD.md | §5.1 | "Structural Mirror Table" | §5 — the mirror table |
| governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md | §1D | "ordered, non-skippable" | §9 — Codex → sidecar infra + deploy → curls |
| governance/VAULT_MEMORY_ARCHITECTURE.md | §A-9 | "consensual 1:1 relationship" | §2 — Dottie-L1 memory injection |

## Walter Authorization (quoted verbatim — the feature authority + the sidecar topology)

> "backend looks light though: i beleive we had a streaming function as well for theo, let's not forget this, we shoudl replicate theo exactly, the streaming allows for streaming instead of buffering, this is very important to have chatgpt's thoughts in real time during the processing, exact same as theo!" — Walter, 2026-08-01 (directing the streaming handler, replicated exactly from Theo).
> "you can do both and the governance regime should be mirrored from our current stnadard as you suggest." — Walter, 2026-08-01 (authorizing the mirrored Dottie backend on its own function app).

"Replicate theo exactly" is grounded to a concrete topology: Theo's streaming is a **separate Windows v4 sidecar app** (`vaultgpt-func-stream`) sharing EP1, hosting only `theo_message_stream`, with the v3 monolith untouched (Theo B9 VEP §P2). The Dottie mirror is `vaultgpt-func-dottie-stream` hosting only `dottie_message_stream`, with v3 `vaultgpt-func-dottie` untouched. Claude Code stands up the sidecar + deploys only after this VEP is Codex-APPROVED; DB writes/migrations remain Walter-only (this VEP has none).

---

## §1 — Feature + design

One new handler on a new v4 sidecar: **`dottie_message_stream`** (`POST`, `text/event-stream`). Same request body as buffered `dottie_message` (`{ messages, conversation_id?, system?, max_completion_tokens? }`). It injects **Dottie-L1** memory, opens the **gpt-5** `chat/completions` stream (`stream:true`), **relays the upstream SSE to the browser verbatim** so tokens appear as generated, and on stream end **persists the user+assistant turn** to `dottie_*` (lazy-create/owner-gate identical to `dottie_message`) then emits a final `event: vault_meta\ndata: {conversation_id, model}` so the FE learns the (possibly new) conversation id. Pre-stream failures (auth/validation/ownership/gateway-non-2xx) are clean **JSON errors**; a mid-stream upstream error emits `event: vault_error`; a post-stream persistence failure emits `vault_meta {persisted:false}` (the answer was already delivered). `OPTIONS` → `204`.

## §2 — Architecture & boundary reconciliation

**Why a sidecar (exact Theo mirror).** HTTP streaming requires the **v4 programming model** (`app.setup({enableHttpStream:true})` + a `PassThrough`/`Readable` response body), which is **app-wide**. `vaultgpt-func-dottie` runs classic v3 (`dottie_ask` + the D2 trio, Kudu-VFS). Rather than convert those to v4 (blast-radius on in-review D2), Dottie replicates Theo's exact answer: a **new Windows v4 Function App `vaultgpt-func-dottie-stream`** sharing the existing EP1 plan `ASP-VaultTax-931c` (≈$0), hosting **only** `dottie_message_stream`. `vaultgpt-func-dottie` and every v3 handler on it are **untouched** — exactly as Theo's monolith stayed v3 when `theo_message_stream` moved to `vaultgpt-func-stream`. Dottie keeps both paths: buffered `dottie_message` (v3, func-dottie) still exists; the FE points live chat at the streaming endpoint (D4).

**Independence + faithful mirror.** The v4 streaming mechanism (app.setup, `app.http`, `request.headers.get`/`request.text`, the `PassThrough` relay that writes each upstream chunk to the client AND accumulates `rawAll`, parse-on-end, `persistTurn`, `vault_meta`, `context.error` logging) is byte-faithful to the deployed `theo_message_stream`. The **model call is gpt-5** (client-credentials → Azure OpenAI `chat/completions` `stream:true` + `stream_options.include_usage`) — an allowed delta adapting the deployed `dottie_ask` endpoint with the `theo_message_stream` error-envelope — deliberately NOT Foundry-Claude (observer independence). The relayed SSE + `parseSseForPersistence` follow the **OpenAI chunk shape** (`choices[0].delta.content`, terminal `data: [DONE]`), not Anthropic events.

**Boundary.** No `reporting_*`; no `theo_*` (Dottie-L1 separate from Theo's L1); no Blob/MI/attachments; no embed/search/history-RAG; no web tools; no extended thinking; no project-sharing (owner-gate `created_by=$oid` + `dottie_conversation_exists_unscoped`). Reads+writes only the deployed D1 `dottie_*` tables; external calls = the AAD token + the in-tenant gpt-5 endpoint. **No change to `vaultgpt-func-dottie`.** **Fail-closed:** no identity → 401; unconfigured endpoint → 500; upstream non-2xx → 502 (429 passthrough); persistence-after-stream failure non-fatal (`vault_meta {persisted:false}`); memory fetch non-fatal; the AAD secret is a KV reference.

## §3 — Schema Reality Lock (deployed grounding)

Nothing invented (Governor §3/§4):
- **Tables** = the DEPLOYED D1 `dottie_conversations`/`dottie_messages` + `dottie_conversation_exists_unscoped` + `dottie_user_memory` (schema doc §3/§4, GCR row 6) — catalog-verified. `persistTurn` (lazy-create → count-based seq → user+assistant INSERT → `updated_at`+`last_opened_at`) + the Dottie-L1 SELECT + the owner-gate/exists-discrimination are **structurally identical** to the buffered `dottie_message` (GCR row 9; same `dottie_*` SQL). No `scope` column; no `app_key`/`app_context`/`citations`/`message_seq`/attachments.
- **v4 streaming mechanism** = the DEPLOYED Theo `theo_message_stream` (GCR row 7); **feasibility already proven for Theo** on this exact target (Windows v4 on EP1 flushing SSE; the upstream relays `text/event-stream`).
- **Model call** = ALLOWED DELTA: the `getAadToken` mechanics + `chat/completions` endpoint/scope/body mirror the deployed `dottie_ask` (GCR row 8) with `stream:true`+`stream_options` added; the error-envelope mirrors the `theo_message_stream` reference — byte-identical to neither. gpt-5 streaming SSE is standard Azure OpenAI `chat/completions` behaviour.
- **Deployed app fact:** `vaultgpt-func-dottie` already carries pg + the OpenAI env + `getAadToken` config (`AAD_*` KV-ref) + EasyAuth; the new sidecar mirrors those settings (§9). Zero new schema.

## §4 — No migration

Handler + sidecar app files only. The `dottie_*` tables landed in D1 (Walter-run, catalog-verified). Walter runs no SQL for this VEP.

## §5 — Canonical Primary References (DEPLOYED) + Structural Mirror Table

**Two deployed primary references (Golden §2).** v4 handlers carry **no `function.json`** — the trigger is registered in code via `app.http(...)`, so there is no function.json to inline (unlike v3); the two references are the deployed handler bodies. **(1/2)** deployed Theo **`theo_message_stream`** — the v4 streaming mechanism + `PassThrough` relay + `persistTurn` shape. (The current deployed `theo_message_stream` has since accreted SPW/tool-loop/web-tools; per the same choice made for `dottie_message` vs `theo_message`, the faithful reference is the **B9 foundational clean streamer**, which matches Dottie's minimal scope — a real deployed artifact, blob `2939303f`.) **(2/2)** deployed **`dottie_ask`** — the gpt-5 `getAadToken` + `chat/completions` call. Both inlined full-verbatim (§5.4/§5.5). The buffered `dottie_message` (GCR row 9) is the structural companion for the `dottie_*` persistence + Dottie-L1 injection.

### §5.1 `dottie_message_stream` mirror table (vs deployed `theo_message_stream`)

| Region | Classification | Notes |
| ------ | -------------- | ----- |
| v4 scaffolding: `require("@azure/functions")`, `app.setup({enableHttpStream:true})`, `app.http("…",{methods,authLevel,handler})`, `request.headers.get`, `await request.text()`, `{status,headers,jsonBody}` errors / `{status:200,headers,body:PassThrough}` stream, `context.error` | **EXACT** | byte-identical to the primary reference |
| `corsHeaders`/`errorBody`/`nowIso`/`getPrincipal`/`getClaimValue`/`buildKnownError`/`isUuid`/`parseJsonSafe`/`requestUrl`/pool | **EXACT** | byte-identical |
| pre-stream ownership check (owner filter + `_exists_unscoped` → JSON 403/404 before upstream) | **EXACT (adapted table)** | `dottie_*` tables |
| the `PassThrough` relay (write each upstream chunk to client + accumulate `rawAll`) + persist-on-`end` + `vault_meta` + `vault_error` | **EXACT** | byte-identical control flow |
| Dottie-L1 memory injection (SELECT salience-ordered → memory block) | **EXACT (adapted table)** | `dottie_user_memory` (no `scope` clause); Dottie-worded block — mirrors buffered `dottie_message` |
| `getAadToken(scope)` + the model call (Azure OpenAI gpt-5 `chat/completions`, `stream:true`, `stream_options.include_usage`, `max_completion_tokens`) | **ALLOWED DELTA** | endpoint/scope/body from the deployed `dottie_ask` (GCR row 8); error-envelope (`buildKnownError`/502/429) from the `theo_message_stream` reference — byte-identical to neither; replaces Foundry-Anthropic `…/anthropic/v1/messages` (observer independence) |
| `parseSseForPersistence` — OpenAI chunk shape (`choices[0].delta.content`, `model`, `finish_reason`, `usage`; skip `[DONE]`) | **ALLOWED DELTA** | replaces the Anthropic-event parse (`content_block_delta`/`message_delta`) |
| `persistTurn` on `dottie_*` (lazy-create/seq/user+assistant/`updated_at`+`last_opened_at`) | **EXACT (adapted table)** | drops `app_key`/`app_context`/`citations`/`message_seq`/attachment linkage; mirrors buffered `dottie_message` |
| web-grounding tools, history-RAG (embed/search), attachments (blob/MI/`buildAttachmentBlocks`), extended thinking | **NOT MIRRORED** | out of Dottie D2 scope; regions omitted |

No DEVIATION regions.

### §CHANGESET — what differs from the `theo_message_stream` reference (diff-reviewed)
1. **Model call → Azure OpenAI gpt-5** `chat/completions` with `stream:true` + `stream_options:{include_usage:true}` via `getAadToken` (scope `cognitiveservices`) — endpoint/scope/body from deployed `dottie_ask`, error-envelope from the `theo_message_stream` reference (allowed delta, byte-identical to neither) — replaces the Foundry-Anthropic `stream:true` call + `getFoundryToken`.
2. **SSE parse → OpenAI shape** (`parseSseForPersistence`: `choices[0].delta.content` / `finish_reason` / top-level `model` / `usage`; terminal `[DONE]`) — replaces the Anthropic-event parse.
3. **Dottie-L1 injection** (`dottie_user_memory`, no `scope`) + `DOTTIE_SYSTEM_PROMPT` prepended — replaces Theo's `theo_user_memory scope='user'` + no persona.
4. **`persistTurn` on `dottie_*`** — drops `app_key`/`app_context`/`citations`/B8i `message_seq`/attachment linkage; stamps `last_opened_at` (Dottie restore-on-reopen).
5. **DROPPED regions:** web tools, history-RAG, attachments/blob/MI, extended thinking, `app_key`/`app_context`.
6. Everything else — the v4 model surface, the `PassThrough` relay, persist-on-end, `vault_meta`/`vault_error`, the pre-stream ownership check, all envelope helpers — **unchanged**.

### §5.2 `dottie_message_stream` (v4 streaming handler; full verbatim)

```javascript
const { app } = require("@azure/functions");
const https = require("https");
const http = require("http");
const { Pool } = require("pg");
const { PassThrough } = require("node:stream");

// dottie_message_stream — Dottie's STREAMING send→reply→persist handler (Phase D2-Stream). The faithful
// Dottie port of the deployed Theo B9 streaming sidecar (theo_message_stream): v4 programming model with
// HTTP streaming, an SSE relay of the upstream model to the browser verbatim, and persistence of the full
// turn on stream completion (identical DB write to the buffered dottie_message → history/reload identical).
// Two allowed deltas vs the Theo mechanism (Golden §4): (1) the model call is Azure OpenAI gpt-5 chat/completions
// with stream:true via client-credentials getAadToken — endpoint/scope/body from the deployed dottie_ask,
// error-envelope from the theo_message_stream reference (byte-identical to neither) — NOT Foundry-Anthropic
// (observer independence); (2) the SSE it relays + the parse-for-persistence follow the OpenAI chunk shape
// (choices[].delta.content … [DONE]) rather than Anthropic events.
// Dottie-L1 relationship memory is injected (dottie_user_memory). No attachments, no history-RAG, no web
// tools, no extended thinking, no project-sharing. Runs on the v4 sidecar vaultgpt-func-dottie-stream.

// HTTP streaming must be explicitly enabled in the v4 Node model (proven on Windows EP1 — Theo B9 Gate 2).
app.setup({ enableHttpStream: true });

const AZURE_OPENAI_ENDPOINT = (process.env.AZURE_OPENAI_ENDPOINT || "").replace(/\/+$/, "");
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-5";
const AZURE_OPENAI_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || "2025-01-01-preview";
const OPENAI_SCOPE = "https://cognitiveservices.azure.com/.default";
const DEFAULT_MAX_COMPLETION_TOKENS = 4096;
const TITLE_MAX_LEN = 80;

const DOTTIE_SYSTEM_PROMPT =
  "You are Dottie, Vault's independent governance-and-second-opinion agent for a professional-services firm's " +
  "shared-memory system. You are deliberately independent of Theo (the primary assistant) — a different, more " +
  "conservative voice for checking work and offering a considered second opinion. You reason carefully and " +
  "thoroughly, cite specifics, distinguish what you can and cannot verify, weigh risk plainly, and never " +
  "overstate certainty. You can (a) give an individual a substantive second opinion or a governance check, and " +
  "(b) observe the shared record for governance quality. You know the person you are speaking with from your own " +
  "relationship memory. You advise; you do not take actions on their behalf.";

// Persistence pool (shared `vaultgpt` instance). The shared Functions connection role bypasses RLS, so per-user
// isolation is enforced by explicit `created_by = $oid` predicates on every query below (RLS is defence-in-depth).
const pool = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-ms-client-principal",
};

function nowIso() {
  return new Date().toISOString();
}

function errorBody(code, message, status) {
  return { error: { code, message, status, timestamp: nowIso() } };
}

// Extract the EasyAuth client principal (v4: headers is a Headers object — use .get()).
function getPrincipal(request) {
  const raw = request.headers.get("x-ms-client-principal");
  if (!raw || typeof raw !== "string") return null;
  try {
    return JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

function getClaimValue(principal, claimTypes) {
  if (!principal || !Array.isArray(principal.claims)) return null;
  for (const claimType of claimTypes) {
    const match = principal.claims.find((c) => c.typ === claimType);
    if (match && typeof match.val === "string" && match.val.trim() !== "") {
      return match.val.trim();
    }
  }
  return null;
}

function buildKnownError(code, message, status) {
  const err = new Error(message);
  err.code = code;
  err.status = status;
  err.isKnown = true;
  return err;
}

function isUuid(value) {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  );
}

function parseJsonSafe(raw) {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function requestUrl(urlStr, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const lib = url.protocol === "http:" ? http : https;

    const req = lib.request(
      {
        method: options.method || "GET",
        hostname: url.hostname,
        port: url.port ? Number(url.port) : 443,
        path: url.pathname + url.search,
        headers: options.headers || {},
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode || 0,
            headers: res.headers || {},
            body: data,
          });
        });
      }
    );

    req.on("error", reject);

    if (body) {
      req.write(body);
    }

    req.end();
  });
}

// Client-credentials token for a given Azure resource scope (same AAD app as the gateway). The client-credentials
// mechanics (scope/body/token URL) mirror the deployed dottie_ask; the error-envelope (buildKnownError / 500)
// mirrors the theo_message_stream reference — an allowed delta, not byte-identical to either.
async function getAadToken(scope) {
  const tenantId = process.env.AAD_TENANT_ID;
  const clientId = process.env.AAD_CLIENT_ID;
  const clientSecret = process.env.AAD_CLIENT_SECRET;
  if (!tenantId || !clientId || !clientSecret) {
    throw buildKnownError("INTERNAL_SERVER_ERROR", "Missing required model gateway configuration.", 500);
  }
  const form = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
    scope,
  }).toString();
  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const r = await requestUrl(
    tokenUrl,
    { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", "Content-Length": Buffer.byteLength(form) } },
    form
  );
  const payload = parseJsonSafe(r.body);
  if (r.statusCode < 200 || r.statusCode >= 300 || !payload || !payload.access_token) {
    const description = payload && (payload.error_description || payload.error || (payload.error_codes && payload.error_codes.join(", ")));
    const message = description ? `Model gateway token request failed: ${description}` : "Model gateway token request failed.";
    throw buildKnownError("INTERNAL_SERVER_ERROR", message, 500);
  }
  return payload.access_token;
}

// Parse the accumulated upstream SSE text to reconstruct the assistant turn for persistence. (The raw SSE is
// relayed to the client verbatim; this parse is ONLY for the DB write.) OpenAI chunk shape: each `data:` line
// carries {choices:[{delta:{content},finish_reason},...], model, usage?}; the stream ends with `data: [DONE]`.
function parseSseForPersistence(raw) {
  let text = "";
  let model = null;
  let finishReason = null;
  let usage = null;
  for (const ev of raw.split("\n\n")) {
    const dataLine = ev.split("\n").find((l) => l.startsWith("data:"));
    if (!dataLine) continue;
    const payload = dataLine.slice(5).trim();
    if (payload === "" || payload === "[DONE]") continue;
    const json = parseJsonSafe(payload);
    if (!json) continue;
    if (typeof json.model === "string") model = json.model;
    if (json.usage != null) usage = json.usage;
    const choice = Array.isArray(json.choices) && json.choices.length > 0 ? json.choices[0] : null;
    if (choice) {
      if (choice.delta && typeof choice.delta.content === "string") text += choice.delta.content;
      if (choice.finish_reason != null) finishReason = choice.finish_reason;
    }
  }
  return { text, model, finishReason, usage };
}

// Persist the completed turn (explicit created_by ownership; shared vaultgpt instance). Mirrors the buffered
// dottie_message persistence EXACTLY (lazy-create → seq count → user+assistant INSERT → updated_at). Returns
// the conversation id.
async function persistTurn(opts) {
  const { oid, requestedConversationId, userText, acc } = opts;
  const assistantModel = acc.model || AZURE_OPENAI_DEPLOYMENT;
  let client = null;
  try {
    client = await pool.connect();
    await client.query("BEGIN");
    await client.query(
      `
      SELECT
        set_config('app.current_user_id', $1, false),
        set_config('request.jwt.claim.sub', $1, false),
        set_config('request.jwt.claim.oid', $1, false)
      `,
      [oid]
    );

    let conversationId = requestedConversationId;
    if (conversationId) {
      const owned = await client.query(
        `SELECT id FROM public.dottie_conversations WHERE id = $1 AND created_by = $2`,
        [conversationId, oid]
      );
      if (owned.rowCount === 0) {
        const existsResult = await client.query(
          `SELECT public.dottie_conversation_exists_unscoped($1::uuid) AS e`,
          [conversationId]
        );
        const exists = existsResult.rows[0] && existsResult.rows[0].e === true;
        throw exists
          ? buildKnownError("FORBIDDEN", "You do not have access to this conversation.", 403)
          : buildKnownError("NOT_FOUND", "Conversation not found.", 404);
      }
    } else {
      const title = userText.trim().slice(0, TITLE_MAX_LEN) || "New chat";
      const created = await client.query(
        `
        INSERT INTO public.dottie_conversations (created_by, title, model)
        VALUES ($1, $2, $3)
        RETURNING id
        `,
        [oid, title, assistantModel]
      );
      conversationId = created.rows[0].id;
    }

    const seqResult = await client.query(
      `SELECT count(*)::int AS n FROM public.dottie_messages WHERE conversation_id = $1 AND created_by = $2`,
      [conversationId, oid]
    );
    const baseSeq = seqResult.rows[0].n;

    await client.query(
      `
      INSERT INTO public.dottie_messages (created_by, conversation_id, seq, role, content, model)
      VALUES ($1, $2, $3, 'user', $4, NULL)
      `,
      [oid, conversationId, baseSeq, userText]
    );

    await client.query(
      `
      INSERT INTO public.dottie_messages (created_by, conversation_id, seq, role, content, model)
      VALUES ($1, $2, $3, 'assistant', $4, $5)
      `,
      [oid, conversationId, baseSeq + 1, acc.text, assistantModel]
    );

    await client.query(
      `UPDATE public.dottie_conversations SET updated_at = now(), last_opened_at = now() WHERE id = $1 AND created_by = $2`,
      [conversationId, oid]
    );

    await client.query("COMMIT");
    return conversationId;
  } catch (err) {
    if (client) {
      try { await client.query("ROLLBACK"); } catch {}
    }
    throw err;
  } finally {
    if (client) {
      client.release();
    }
  }
}

app.http("dottie_message_stream", {
  methods: ["POST", "OPTIONS"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    const jsonErr = (status, code, message) => ({
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      jsonBody: errorBody(code, message, status),
    });

    if (request.method === "OPTIONS") {
      return { status: 204, headers: corsHeaders };
    }

    const principal = getPrincipal(request);
    const oid = getClaimValue(principal, [
      "http://schemas.microsoft.com/identity/claims/objectidentifier",
      "oid",
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
    ]);
    if (!oid) return jsonErr(401, "UNAUTHORIZED", "Missing or invalid EasyAuth identity.");
    if (!AZURE_OPENAI_ENDPOINT) {
      context.error("dottie_message_stream: missing Azure OpenAI configuration");
      return jsonErr(500, "INTERNAL_SERVER_ERROR", "Model gateway is not configured.");
    }

    let body;
    try {
      body = JSON.parse((await request.text()) || "{}");
    } catch {
      return jsonErr(400, "BAD_REQUEST", "Request body is not valid JSON.");
    }

    const messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return jsonErr(400, "BAD_REQUEST", "Field 'messages' must be a non-empty array.");
    }
    // Normalise to {role, content:string} chat turns (user/assistant only); reject malformed.
    const chatMessages = [];
    for (const m of messages) {
      if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") {
        return jsonErr(400, "BAD_REQUEST", "Each 'messages' item must be { role: 'user'|'assistant', content: string }.");
      }
      chatMessages.push({ role: m.role, content: m.content });
    }

    const maxCompletionTokens = Number.isInteger(body.max_completion_tokens) ? body.max_completion_tokens : DEFAULT_MAX_COMPLETION_TOKENS;
    const systemPrompt = typeof body.system === "string" && body.system.trim() !== "" ? body.system.trim() : null;

    const requestedConversationId =
      typeof body.conversation_id === "string" && body.conversation_id.trim() !== "" ? body.conversation_id.trim() : null;
    const lastUser = [...chatMessages].reverse().find((m) => m.role === "user");
    const userText = lastUser ? lastUser.content : "";

    if (requestedConversationId !== null && !isUuid(requestedConversationId)) {
      return jsonErr(400, "BAD_REQUEST", "Field 'conversation_id' must be a valid UUID.");
    }
    if (!userText.trim()) {
      return jsonErr(400, "BAD_REQUEST", "The submitted history must end with a non-empty user message.");
    }

    // ---- Dottie-L1 memory injection: prepend the caller's relationship-memory profile to the system prompt ----
    // Read-only, user-scoped (explicit created_by; the shared connection role bypasses RLS), NON-FATAL.
    let memoryBlock = "";
    {
      let memClient = null;
      try {
        memClient = await pool.connect();
        await memClient.query(
          `
          SELECT
            set_config('app.current_user_id', $1, false),
            set_config('request.jwt.claim.sub', $1, false),
            set_config('request.jwt.claim.oid', $1, false)
          `,
          [oid]
        );
        const mem = await memClient.query(
          `
          SELECT content
          FROM public.dottie_user_memory
          WHERE created_by = $1
          ORDER BY salience DESC, updated_at DESC, id DESC
          LIMIT 50
          `,
          [oid]
        );
        if (mem.rowCount > 0) {
          memoryBlock =
            "What you (Dottie) know about this person from your own relationship memory (apply when relevant; do not recite verbatim):\n" +
            mem.rows.map((r) => `- ${r.content}`).join("\n");
        }
      } catch (memErr) {
        context.error("dottie_message_stream: memory fetch failed (non-fatal)", memErr);
      } finally {
        if (memClient) {
          memClient.release();
        }
      }
    }
    const effectiveSystem = [DOTTIE_SYSTEM_PROMPT, memoryBlock, systemPrompt]
      .filter((s) => typeof s === "string" && s.trim() !== "")
      .join("\n\n");

    // ---- Pre-stream conversation ownership check (so a non-owned id is a clean JSON 403/404, not a
    // mid-stream error). Persistence re-checks under the transaction as defense-in-depth. ----
    if (requestedConversationId) {
      let chkClient = null;
      try {
        chkClient = await pool.connect();
        await chkClient.query(
          `
          SELECT
            set_config('app.current_user_id', $1, false),
            set_config('request.jwt.claim.sub', $1, false),
            set_config('request.jwt.claim.oid', $1, false)
          `,
          [oid]
        );
        const owned = await chkClient.query(
          `SELECT id FROM public.dottie_conversations WHERE id = $1 AND created_by = $2`,
          [requestedConversationId, oid]
        );
        if (owned.rowCount === 0) {
          const existsResult = await chkClient.query(
            `SELECT public.dottie_conversation_exists_unscoped($1::uuid) AS e`,
            [requestedConversationId]
          );
          const exists = existsResult.rows[0] && existsResult.rows[0].e === true;
          return exists
            ? jsonErr(403, "FORBIDDEN", "You do not have access to this conversation.")
            : jsonErr(404, "NOT_FOUND", "Conversation not found.");
        }
      } catch (chkErr) {
        context.error("dottie_message_stream: conversation ownership check failed", chkErr);
        return jsonErr(500, "INTERNAL_SERVER_ERROR", "Failed to verify the conversation.");
      } finally {
        if (chkClient) chkClient.release();
      }
    }

    // ---- Open the upstream gpt-5 stream; decide JSON-error vs stream from the response status ----
    let token;
    try {
      token = await getAadToken(OPENAI_SCOPE);
    } catch (e) {
      return jsonErr(e.status || 500, e.code || "INTERNAL_SERVER_ERROR", e.message || "Model gateway token failed.");
    }

    const upstreamPayload = JSON.stringify({
      messages: [{ role: "system", content: effectiveSystem }, ...chatMessages],
      max_completion_tokens: maxCompletionTokens,
      stream: true,
      stream_options: { include_usage: true },
    });

    const upstreamRes = await new Promise((resolve) => {
      const u = new URL(
        `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${encodeURIComponent(AZURE_OPENAI_DEPLOYMENT)}/chat/completions?api-version=${AZURE_OPENAI_API_VERSION}`
      );
      const lib = u.protocol === "http:" ? http : https;
      const r = lib.request(
        {
          method: "POST",
          hostname: u.hostname,
          port: u.port ? Number(u.port) : 443,
          path: u.pathname + u.search,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "Content-Length": Buffer.byteLength(upstreamPayload),
            Accept: "text/event-stream",
          },
        },
        (res) => resolve(res)
      );
      r.on("error", (e) => {
        context.error("dottie_message_stream: upstream connect failed", e);
        resolve(null);
      });
      r.write(upstreamPayload);
      r.end();
    });

    if (!upstreamRes) {
      return jsonErr(502, "BAD_GATEWAY", "Model gateway call failed.");
    }
    if (upstreamRes.statusCode < 200 || upstreamRes.statusCode >= 300) {
      const errText = await new Promise((res) => {
        let d = "";
        upstreamRes.setEncoding("utf8");
        upstreamRes.on("data", (c) => { d += c; });
        upstreamRes.on("end", () => res(d));
        upstreamRes.on("error", () => res(d));
      });
      context.error("dottie_message_stream: gateway non-2xx", upstreamRes.statusCode, errText.slice(0, 300));
      if (upstreamRes.statusCode === 429) {
        return jsonErr(429, "RATE_LIMITED", "Model gateway rate limit exceeded.");
      }
      return jsonErr(502, "BAD_GATEWAY", "Model gateway call failed.");
    }

    // ---- 2xx → stream. Relay upstream SSE verbatim to the client AND accumulate for persistence. ----
    const stream = new PassThrough();
    let rawAll = "";
    upstreamRes.setEncoding("utf8");
    upstreamRes.on("data", (chunk) => {
      rawAll += chunk;
      stream.write(chunk);
    });
    upstreamRes.on("end", async () => {
      let conversationId = null;
      try {
        const acc = parseSseForPersistence(rawAll);
        conversationId = await persistTurn({ oid, requestedConversationId, userText, acc });
        // Emit a final app-level event so the FE learns the (possibly new) conversation id.
        stream.write(`event: vault_meta\ndata: ${JSON.stringify({ conversation_id: conversationId, model: acc.model || AZURE_OPENAI_DEPLOYMENT })}\n\n`);
      } catch (perr) {
        // The answer was already streamed to the user; a persistence failure must not crash the response —
        // log it and tell the FE the turn was not saved (it just won't appear in history).
        context.error("dottie_message_stream: persistence failed (answer already streamed)", perr);
        stream.write(`event: vault_meta\ndata: ${JSON.stringify({ conversation_id: null, persisted: false })}\n\n`);
      } finally {
        stream.end();
      }
    });
    upstreamRes.on("error", (e) => {
      context.error("dottie_message_stream: upstream stream error", e);
      try { stream.write(`event: vault_error\ndata: ${JSON.stringify({ message: "The model stream was interrupted." })}\n\n`); } catch {}
      stream.end();
    });

    return {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
      body: stream,
    };
  },
});
```

### §5.3 sidecar `host.json` + `package.json` (full verbatim)

```json
{
  "version": "2.0",
  "logging": { "applicationInsights": { "samplingSettings": { "isEnabled": true, "excludedTypes": "Request" } } },
  "extensionBundle": { "id": "Microsoft.Azure.Functions.ExtensionBundle", "version": "[4.*, 5.0.0)" }
}
```

```json
{
  "name": "vaultgpt-func-dottie-stream",
  "version": "1.0.0",
  "description": "Dottie streaming sidecar — dottie_message_stream (v4 model, SSE relay of Azure OpenAI gpt-5).",
  "main": "src/functions/*.js",
  "dependencies": {
    "@azure/functions": "^4.5.0",
    "pg": "^8.11.0"
  }
}
```

### §5.4 Primary Reference (1/2) — deployed Theo B9 `theo_message_stream` (full verbatim)

```javascript
const { app } = require("@azure/functions");
const https = require("https");
const http = require("http");
const { Pool } = require("pg");
const { PassThrough } = require("node:stream");

// HTTP streaming must be explicitly enabled in the v4 Node model (proven on Windows EP1, Gate 2).
app.setup({ enableHttpStream: true });

const FOUNDRY_BASE = process.env.THEO_FOUNDRY_BASE;
const FOUNDRY_DEPLOYMENT = process.env.THEO_FOUNDRY_DEPLOYMENT;
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MAX_TOKENS = 4096;
const TITLE_MAX_LEN = 80;

// Internet grounding — server-side Foundry-Claude tools (architecture §2.3; HF-T1 scope).
const WEB_FETCH_BETA = "web-fetch-2025-09-10";

function parsePositiveInt(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

const WEB_SEARCH_MAX_USES = parsePositiveInt(process.env.THEO_WEB_SEARCH_MAX_USES, 5);
const WEB_FETCH_MAX_USES = parsePositiveInt(process.env.THEO_WEB_FETCH_MAX_USES, 5);
const WEB_FETCH_ALLOWED_DOMAINS = (process.env.THEO_WEB_FETCH_ALLOWED_DOMAINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Extended thinking (B9): OFF unless THEO_THINKING_BUDGET_TOKENS > 0 is set, AND only after the
// Foundry thinking-passthrough is verified (see VEP §GOLDEN). When enabled, the upstream stream
// includes thinking_delta events, which are relayed VERBATIM to the client (the FE renders them in
// a collapsible panel). Thinking is NOT persisted as message content (ephemeral, like Claude).
const THINKING_BUDGET = parsePositiveInt(process.env.THEO_THINKING_BUDGET_TOKENS, 0);

// History-RAG (B7b-2): embedding + Azure AI Search config. When unset, history recall is silently
// skipped (non-fatal — never breaks chat).
const EMBED_ENDPOINT = (process.env.THEO_EMBED_ENDPOINT || "").replace(/\/+$/, "");
const EMBED_DEPLOYMENT = process.env.THEO_EMBED_DEPLOYMENT;
const EMBED_API_VERSION = process.env.THEO_EMBED_API_VERSION || "2023-05-15";
const SEARCH_ENDPOINT = (process.env.THEO_SEARCH_ENDPOINT || "").replace(/\/+$/, "");
const SEARCH_INDEX = process.env.THEO_SEARCH_INDEX || "theo-messages";
const SEARCH_API_VERSION = process.env.THEO_SEARCH_API_VERSION || "2023-11-01";
const EMBED_SCOPE = "https://cognitiveservices.azure.com/.default";
const SEARCH_SCOPE = "https://search.azure.com/.default";
const HISTORY_TOP_K = parsePositiveInt(process.env.THEO_HISTORY_TOP_K, 5);
const HISTORY_QUERY_MAX_CHARS = 8000;

// Attachments (B8d): blob lives in theo-content; read via the Function's managed identity
// (Storage Blob Data Contributor). Native (PDF/image) inject as document/image content blocks;
// extract-class inject the stored extracted text. Budgets bound the upstream payload.
const STORAGE_ACCOUNT = process.env.THEO_BLOB_ACCOUNT || "vaultgptstorage01";
const STORAGE_CONTAINER = process.env.THEO_BLOB_CONTAINER || "theo-content";
const ATTACH_MAX_COUNT = parsePositiveInt(process.env.THEO_ATTACH_MAX_COUNT, 10);
const ATTACH_NATIVE_BUDGET_BYTES = parsePositiveInt(process.env.THEO_ATTACH_NATIVE_BUDGET_BYTES, 14 * 1024 * 1024);
const ATTACH_EXTRACT_BUDGET_CHARS = parsePositiveInt(process.env.THEO_ATTACH_EXTRACT_BUDGET_CHARS, 200000);
const NATIVE_MEDIA_TYPES = {
  "application/pdf": "document",
  "image/png": "image",
  "image/jpeg": "image",
  "image/webp": "image",
  "image/gif": "image",
};

// Persistence pool (Family-B pattern; shared `vaultgpt` instance). The shared Functions connection
// role bypasses RLS, so per-user isolation is enforced by explicit `created_by = $oid` predicates on
// every query below (never by RLS alone) — set_config still establishes the request identity.
const pool = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-ms-client-principal",
};

function nowIso() {
  return new Date().toISOString();
}

function errorBody(code, message, status) {
  return { error: { code, message, status, timestamp: nowIso() } };
}

// Extract the EasyAuth client principal (v4: headers is a Headers object — use .get()).
function getPrincipal(request) {
  const raw = request.headers.get("x-ms-client-principal");
  if (!raw || typeof raw !== "string") return null;
  try {
    return JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

function getClaimValue(principal, claimTypes) {
  if (!principal || !Array.isArray(principal.claims)) return null;
  for (const claimType of claimTypes) {
    const match = principal.claims.find((c) => c.typ === claimType);
    if (match && typeof match.val === "string" && match.val.trim() !== "") {
      return match.val.trim();
    }
  }
  return null;
}

function buildKnownError(code, message, status) {
  const err = new Error(message);
  err.code = code;
  err.status = status;
  err.isKnown = true;
  return err;
}

function isUuid(value) {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  );
}

function parseJsonSafe(raw) {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function requestUrl(urlStr, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const lib = url.protocol === "http:" ? http : https;

    const req = lib.request(
      {
        method: options.method || "GET",
        hostname: url.hostname,
        port: url.port ? Number(url.port) : 443,
        path: url.pathname + url.search,
        headers: options.headers || {},
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode || 0,
            headers: res.headers || {},
            body: data,
          });
        });
      }
    );

    req.on("error", reject);

    if (body) {
      req.write(body);
    }

    req.end();
  });
}

// Binary HTTP GET (collects Buffer chunks; must NOT string-coerce — attachment blobs are binary).
function requestBinary(urlStr, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const lib = url.protocol === "http:" ? http : https;
    const req = lib.request(
      {
        method: options.method || "GET",
        hostname: url.hostname,
        port: url.port ? Number(url.port) : 443,
        path: url.pathname + url.search,
        headers: options.headers || {},
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => { chunks.push(chunk); });
        res.on("end", () => {
          resolve({ statusCode: res.statusCode || 0, headers: res.headers || {}, body: Buffer.concat(chunks) });
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

async function getFoundryToken() {
  const tenantId = process.env.AAD_TENANT_ID;
  const clientId = process.env.AAD_CLIENT_ID;
  const clientSecret = process.env.AAD_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw buildKnownError(
      "INTERNAL_SERVER_ERROR",
      "Missing required model gateway configuration.",
      500
    );
  }

  const form = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
    scope: "https://ai.azure.com/.default",
  }).toString();

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const r = await requestUrl(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(form),
    },
  }, form);

  const payload = parseJsonSafe(r.body);

  if (r.statusCode < 200 || r.statusCode >= 300 || !payload || !payload.access_token) {
    const description =
      payload &&
      (payload.error_description || payload.error || payload.error_codes?.join(", "));
    const message = description
      ? `Model gateway token request failed: ${description}`
      : "Model gateway token request failed.";

    throw buildKnownError("INTERNAL_SERVER_ERROR", message, 500);
  }

  return payload.access_token;
}

// Server-side grounding tools attached to every upstream Messages call. Claude invokes them
// autonomously only when a query needs live web data; max_uses caps spend. web_fetch carries an
// optional domain allowlist (THEO_WEB_FETCH_ALLOWED_DOMAINS) and requires the web-fetch beta header.
function buildGroundingTools() {
  const webFetch = {
    type: "web_fetch_20250910",
    name: "web_fetch",
    max_uses: WEB_FETCH_MAX_USES,
  };
  if (WEB_FETCH_ALLOWED_DOMAINS.length > 0) {
    webFetch.allowed_domains = WEB_FETCH_ALLOWED_DOMAINS;
  }
  return [
    { type: "web_search_20250305", name: "web_search", max_uses: WEB_SEARCH_MAX_USES },
    webFetch,
  ];
}

// Client-credentials token for an arbitrary Azure resource scope (same AAD app as the gateway).
async function getAadToken(scope) {
  const tenantId = process.env.AAD_TENANT_ID;
  const clientId = process.env.AAD_CLIENT_ID;
  const clientSecret = process.env.AAD_CLIENT_SECRET;
  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Missing required AAD client-credentials configuration.");
  }
  const form = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
    scope,
  }).toString();
  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const r = await requestUrl(
    tokenUrl,
    { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", "Content-Length": Buffer.byteLength(form) } },
    form
  );
  const payload = parseJsonSafe(r.body);
  if (r.statusCode < 200 || r.statusCode >= 300 || !payload || !payload.access_token) {
    throw new Error(`Token request failed for scope ${scope} (HTTP ${r.statusCode}).`);
  }
  return payload.access_token;
}

// Embed a single query string → 1536-d vector (text-embedding-3-small).
async function embedQuery(embedToken, text) {
  const body = JSON.stringify({ input: text });
  const r = await requestUrl(
    `${EMBED_ENDPOINT}/openai/deployments/${encodeURIComponent(EMBED_DEPLOYMENT)}/embeddings?api-version=${EMBED_API_VERSION}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${embedToken}`, "Content-Length": Buffer.byteLength(body) },
    },
    body
  );
  const payload = parseJsonSafe(r.body);
  if (r.statusCode < 200 || r.statusCode >= 300 || !payload || !Array.isArray(payload.data) || !payload.data[0]) {
    throw new Error(`embedQuery failed (HTTP ${r.statusCode}).`);
  }
  return payload.data[0].embedding;
}

// Hybrid (vector + keyword) search over the user's OWN indexed messages. created_by filter is the
// isolation boundary; the current conversation is excluded so we recall PAST discussions only.
async function searchHistory(searchToken, queryText, queryVector, ownerOid, excludeConversationId) {
  let filter = `created_by eq '${ownerOid.replace(/'/g, "''")}'`;
  if (excludeConversationId) {
    filter += ` and conversation_id ne '${excludeConversationId.replace(/'/g, "''")}'`;
  }
  const body = JSON.stringify({
    search: queryText,
    filter,
    top: HISTORY_TOP_K,
    select: "role,content,created_at",
    vectorQueries: [{ kind: "vector", vector: queryVector, fields: "content_vector", k: HISTORY_TOP_K }],
  });
  const r = await requestUrl(
    `${SEARCH_ENDPOINT}/indexes/${encodeURIComponent(SEARCH_INDEX)}/docs/search?api-version=${SEARCH_API_VERSION}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${searchToken}`, "Content-Length": Buffer.byteLength(body) },
    },
    body
  );
  const payload = parseJsonSafe(r.body);
  if (r.statusCode < 200 || r.statusCode >= 300 || !payload || !Array.isArray(payload.value)) {
    throw new Error(`searchHistory failed (HTTP ${r.statusCode}).`);
  }
  return payload.value;
}

// Managed-identity token (Storage data-plane). Distinct from the AAD client-credentials app above:
// blob reads use the Function's system-assigned identity (Storage Blob Data Contributor).
async function getManagedIdentityAccessToken(resource) {
  const identityEndpoint = process.env.IDENTITY_ENDPOINT;
  const identityHeader = process.env.IDENTITY_HEADER;
  if (!identityEndpoint || !identityHeader) {
    throw new Error("Managed Identity endpoint not available (IDENTITY_ENDPOINT/IDENTITY_HEADER missing).");
  }
  const tokenUrl = `${identityEndpoint}?resource=${encodeURIComponent(resource)}&api-version=2019-08-01`;
  const r = await requestUrl(tokenUrl, { method: "GET", headers: { "X-IDENTITY-HEADER": identityHeader } });
  const payload = parseJsonSafe(r.body);
  if (r.statusCode < 200 || r.statusCode >= 300 || !payload || !payload.access_token) {
    throw new Error(`Managed Identity token endpoint failed (HTTP ${r.statusCode}).`);
  }
  return payload.access_token;
}

function encodeBlobPath(blobKey) {
  return blobKey.split("/").map(encodeURIComponent).join("/");
}

function blobUrlFor(blobKey) {
  return `https://${STORAGE_ACCOUNT}.blob.core.windows.net/${STORAGE_CONTAINER}/${encodeBlobPath(blobKey)}`;
}

async function downloadBlobBinary(storageToken, blobKey) {
  const r = await requestBinary(blobUrlFor(blobKey), {
    method: "GET",
    headers: { Authorization: `Bearer ${storageToken}`, "x-ms-version": "2022-11-02" },
  });
  if (r.statusCode < 200 || r.statusCode >= 300) {
    throw new Error(`GET blob (binary) failed (HTTP ${r.statusCode}).`);
  }
  return r.body; // Buffer
}

async function downloadBlobText(storageToken, blobKey) {
  const r = await requestUrl(blobUrlFor(blobKey), {
    method: "GET",
    headers: { Authorization: `Bearer ${storageToken}`, "x-ms-version": "2022-11-02" },
  });
  if (r.statusCode < 200 || r.statusCode >= 300) {
    throw new Error(`GET blob (text) failed (HTTP ${r.statusCode}).`);
  }
  return r.body; // string
}

// Build Anthropic content blocks for the owned attachment rows, honouring the size/char budgets.
// Native (PDF/image) → document/image base64 block; extract-class → text block (stored extracted
// text); unreadable → a short text note. Per-attachment failures degrade to a note (never throw).
async function buildAttachmentBlocks(context, rows) {
  if (!rows.length) return [];
  let storageToken;
  try {
    storageToken = await getManagedIdentityAccessToken("https://storage.azure.com/");
  } catch (tokErr) {
    context.error("theo_message_stream: storage token for attachments failed (non-fatal)", tokErr);
    return rows.map((r) => ({ type: "text", text: `[Attached file "${r.filename}" could not be loaded.]` }));
  }

  const blocks = [];
  let nativeBytes = 0;
  let extractChars = 0;
  for (const row of rows) {
    // Honor finalize's classification — a row marked extract-class (e.g. a large PDF promoted to
    // text) injects its extracted text, not a giant document block, even though content_type is
    // application/pdf. Only non-extract rows with a native media type inject document/image blocks.
    const isExtractRow = row.ingestion_class === "extract"; // extract-class NEVER falls back to native (T13)
    const native = !isExtractRow && NATIVE_MEDIA_TYPES[row.content_type];
    try {
      if (native) {
        const buf = await downloadBlobBinary(storageToken, row.blob_path);
        if (nativeBytes + buf.length > ATTACH_NATIVE_BUDGET_BYTES) {
          blocks.push({ type: "text", text: `[Attached file "${row.filename}" omitted — exceeds the per-message attachment size budget.]` });
          continue;
        }
        nativeBytes += buf.length;
        const b64 = buf.toString("base64");
        if (native === "document") {
          blocks.push({ type: "document", source: { type: "base64", media_type: row.content_type, data: b64 } });
        } else {
          blocks.push({ type: "image", source: { type: "base64", media_type: row.content_type, data: b64 } });
        }
        blocks.push({ type: "text", text: `(above is the attached file "${row.filename}")` });
      } else if (isExtractRow && row.extracted_text_path) {
        const text = await downloadBlobText(storageToken, row.extracted_text_path);
        const remaining = ATTACH_EXTRACT_BUDGET_CHARS - extractChars;
        if (remaining <= 0) {
          blocks.push({ type: "text", text: `[Attached file "${row.filename}" omitted — exceeds the per-message extracted-text budget.]` });
          continue;
        }
        const clipped = text.length > remaining ? text.slice(0, remaining) + "\n…[truncated]" : text;
        extractChars += clipped.length;
        blocks.push({ type: "text", text: `Attached file "${row.filename}" (${row.content_type}):\n\n${clipped}` });
      } else {
        blocks.push({ type: "text", text: `[Attached file "${row.filename}" (${row.content_type}) is stored but could not be read into this message.]` });
      }
    } catch (attErr) {
      context.error(`theo_message_stream: attachment ${row.id} load failed (non-fatal)`, attErr);
      blocks.push({ type: "text", text: `[Attached file "${row.filename}" could not be loaded.]` });
    }
  }
  return blocks;
}

// Parse the accumulated upstream SSE text to reconstruct the assistant turn for persistence.
// (The raw SSE is relayed to the client verbatim; this parse is ONLY for the DB write.) Thinking
// deltas are intentionally ignored — thinking is ephemeral and not persisted as message content.
function parseSseForPersistence(raw) {
  let text = "";
  let model = null;
  let stopReason = null;
  let usage = null;
  const citations = [];
  for (const ev of raw.split("\n\n")) {
    const dataLine = ev.split("\n").find((l) => l.startsWith("data:"));
    if (!dataLine) continue;
    const json = parseJsonSafe(dataLine.slice(5).trim());
    if (!json || typeof json.type !== "string") continue;
    if (json.type === "message_start" && json.message && typeof json.message.model === "string") {
      model = json.message.model;
    } else if (json.type === "content_block_delta" && json.delta) {
      if (json.delta.type === "text_delta" && typeof json.delta.text === "string") {
        text += json.delta.text;
      } else if (json.delta.type === "citations_delta" && json.delta.citation) {
        citations.push(json.delta.citation);
      }
    } else if (json.type === "message_delta") {
      if (json.delta && json.delta.stop_reason != null) stopReason = json.delta.stop_reason;
      if (json.usage != null) usage = json.usage;
    }
  }
  return { text, citations, model, stopReason, usage };
}

// Persist the completed turn (HF-T2; explicit created_by ownership; shared vaultgpt instance).
// Mirrors theo_message's persistence EXACTLY (incl. B8i message_seq linkage). Returns conversationId.
async function persistTurn(opts) {
  const { oid, requestedConversationId, appKey, appContext, userText, attachmentIds, acc } = opts;
  const assistantModel = acc.model || FOUNDRY_DEPLOYMENT;
  let client = null;
  try {
    client = await pool.connect();
    await client.query("BEGIN");
    await client.query(
      `
      SELECT
        set_config('app.current_user_id', $1, false),
        set_config('request.jwt.claim.sub', $1, false),
        set_config('request.jwt.claim.oid', $1, false)
      `,
      [oid]
    );

    let conversationId = requestedConversationId;
    if (conversationId) {
      const owned = await client.query(
        `SELECT id FROM public.theo_conversations WHERE id = $1 AND created_by = $2`,
        [conversationId, oid]
      );
      if (owned.rowCount === 0) {
        const existsResult = await client.query(
          `SELECT public.theo_conversation_exists_unscoped($1::uuid) AS e`,
          [conversationId]
        );
        const exists = existsResult.rows[0] && existsResult.rows[0].e === true;
        throw exists
          ? buildKnownError("FORBIDDEN", "You do not have access to this conversation.", 403)
          : buildKnownError("NOT_FOUND", "Conversation not found.", 404);
      }
    } else {
      const title = userText.trim().slice(0, TITLE_MAX_LEN) || "New chat";
      const created = await client.query(
        `
        INSERT INTO public.theo_conversations (created_by, title, model, app_key, app_context)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
        `,
        [oid, title, assistantModel, appKey, appContext != null ? JSON.stringify(appContext) : null]
      );
      conversationId = created.rows[0].id;
    }

    const seqResult = await client.query(
      `SELECT count(*)::int AS n FROM public.theo_messages WHERE conversation_id = $1 AND created_by = $2`,
      [conversationId, oid]
    );
    const baseSeq = seqResult.rows[0].n;

    // B8i: link the sent attachments to this conversation AND to the user-turn seq (owner-scoped;
    // only when not already linked) so a reloaded thread surfaces chips on the matching message.
    if (attachmentIds.length > 0) {
      await client.query(
        `
        UPDATE public.theo_attachments
        SET conversation_id = $1, message_seq = $2
        WHERE id = ANY($3::uuid[]) AND created_by = $4 AND conversation_id IS NULL
        `,
        [conversationId, baseSeq, attachmentIds, oid]
      );
    }

    await client.query(
      `
      INSERT INTO public.theo_messages (created_by, conversation_id, seq, role, content, model)
      VALUES ($1, $2, $3, 'user', $4, NULL)
      `,
      [oid, conversationId, baseSeq, userText]
    );

    await client.query(
      `
      INSERT INTO public.theo_messages (created_by, conversation_id, seq, role, content, model, citations)
      VALUES ($1, $2, $3, 'assistant', $4, $5, $6)
      `,
      [
        oid,
        conversationId,
        baseSeq + 1,
        acc.text,
        assistantModel,
        acc.citations.length ? JSON.stringify(acc.citations) : null,
      ]
    );

    await client.query(
      `UPDATE public.theo_conversations SET updated_at = now() WHERE id = $1 AND created_by = $2`,
      [conversationId, oid]
    );

    await client.query("COMMIT");
    return conversationId;
  } catch (err) {
    if (client) {
      try { await client.query("ROLLBACK"); } catch {}
    }
    throw err;
  } finally {
    if (client) {
      client.release();
    }
  }
}

app.http("theo_message_stream", {
  methods: ["POST", "OPTIONS"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    const jsonErr = (status, code, message) => ({
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      jsonBody: errorBody(code, message, status),
    });

    if (request.method === "OPTIONS") {
      return { status: 204, headers: corsHeaders };
    }

    const principal = getPrincipal(request);
    const oid = getClaimValue(principal, [
      "http://schemas.microsoft.com/identity/claims/objectidentifier",
      "oid",
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
    ]);
    if (!oid) return jsonErr(401, "UNAUTHORIZED", "Missing or invalid EasyAuth identity.");
    if (!FOUNDRY_BASE || !FOUNDRY_DEPLOYMENT) {
      context.error("theo_message_stream: missing gateway configuration");
      return jsonErr(500, "INTERNAL_SERVER_ERROR", "Model gateway is not configured.");
    }

    let body;
    try {
      body = JSON.parse((await request.text()) || "{}");
    } catch {
      return jsonErr(400, "BAD_REQUEST", "Request body is not valid JSON.");
    }

    const messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return jsonErr(400, "BAD_REQUEST", "Field 'messages' must be a non-empty array.");
    }

    let maxTokens = Number.isInteger(body.max_tokens) ? body.max_tokens : DEFAULT_MAX_TOKENS;
    const systemPrompt = typeof body.system === "string" ? body.system : null;

    const requestedConversationId =
      typeof body.conversation_id === "string" && body.conversation_id.trim() !== ""
        ? body.conversation_id.trim()
        : null;
    const appKey =
      typeof body.app_key === "string" && body.app_key.trim() !== "" ? body.app_key.trim() : null;
    const appContext =
      body.app_context != null && typeof body.app_context === "object" ? body.app_context : null;

    const lastUserIndex = (() => {
      for (let i = messages.length - 1; i >= 0; i--) {
        const m = messages[i];
        if (m && m.role === "user" && typeof m.content === "string") return i;
      }
      return -1;
    })();
    const userText = lastUserIndex >= 0 ? messages[lastUserIndex].content : "";

    if (requestedConversationId !== null && !isUuid(requestedConversationId)) {
      return jsonErr(400, "BAD_REQUEST", "Field 'conversation_id' must be a valid UUID.");
    }

    let attachmentIds = [];
    if (body.attachment_ids != null) {
      if (!Array.isArray(body.attachment_ids)) {
        return jsonErr(400, "BAD_REQUEST", "Field 'attachment_ids' must be an array of UUIDs.");
      }
      attachmentIds = [...new Set(body.attachment_ids)];
      if (attachmentIds.length > ATTACH_MAX_COUNT) {
        return jsonErr(400, "BAD_REQUEST", `At most ${ATTACH_MAX_COUNT} attachments may be sent per message.`);
      }
      if (!attachmentIds.every((id) => isUuid(id))) {
        return jsonErr(400, "BAD_REQUEST", "Every entry in 'attachment_ids' must be a valid UUID.");
      }
      if (attachmentIds.length > 0 && lastUserIndex < 0) {
        return jsonErr(400, "BAD_REQUEST", "Attachments require a user message with text content.");
      }
    }

    // ---- Memory injection (B7): prepend the user's distilled memory profile to the system prompt ----
    let memoryBlock = "";
    {
      let memClient = null;
      try {
        memClient = await pool.connect();
        await memClient.query(
          `
          SELECT
            set_config('app.current_user_id', $1, false),
            set_config('request.jwt.claim.sub', $1, false),
            set_config('request.jwt.claim.oid', $1, false)
          `,
          [oid]
        );
        const mem = await memClient.query(
          `
          SELECT content
          FROM public.theo_user_memory
          WHERE created_by = $1 AND scope = 'user'
          ORDER BY salience DESC, updated_at DESC, id DESC
          LIMIT 50
          `,
          [oid]
        );
        if (mem.rowCount > 0) {
          memoryBlock =
            "Saved memory about this user (apply when relevant; do not recite verbatim):\n" +
            mem.rows.map((r) => `- ${r.content}`).join("\n");
        }
      } catch (memErr) {
        context.error("theo_message_stream: memory fetch failed (non-fatal)", memErr);
      } finally {
        if (memClient) {
          memClient.release();
        }
      }
    }

    // ---- History-RAG injection (B7b-2): recall relevant excerpts from the user's PAST conversations ----
    let historyBlock = "";
    if (EMBED_ENDPOINT && EMBED_DEPLOYMENT && SEARCH_ENDPOINT && userText.trim() !== "") {
      try {
        const [embedToken, searchToken] = await Promise.all([getAadToken(EMBED_SCOPE), getAadToken(SEARCH_SCOPE)]);
        const queryVector = await embedQuery(embedToken, userText.slice(0, HISTORY_QUERY_MAX_CHARS));
        const hits = await searchHistory(searchToken, userText.slice(0, HISTORY_QUERY_MAX_CHARS), queryVector, oid, requestedConversationId);
        const lines = hits
          .map((h) => (typeof h.content === "string" ? h.content.trim() : ""))
          .filter((c) => c !== "")
          .map((c) => `- ${c.slice(0, 500)}`);
        if (lines.length > 0) {
          historyBlock =
            "Relevant excerpts from this user's earlier conversations (context only; may be unrelated — use if helpful, do not assume continuity):\n" +
            lines.join("\n");
        }
      } catch (histErr) {
        context.error("theo_message_stream: history-RAG retrieval failed (non-fatal)", histErr);
      }
    }

    const effectiveSystem =
      [memoryBlock, historyBlock, systemPrompt].filter((s) => typeof s === "string" && s.trim() !== "").join("\n\n") || null;

    // ---- Attachments: fetch OWNED rows + assemble blocks; strict ownership (404 on any missing) ----
    let attachmentRows = [];
    try {
      if (attachmentIds.length > 0) {
        const attClient = await pool.connect();
        try {
          await attClient.query(
            `
            SELECT
              set_config('app.current_user_id', $1, false),
              set_config('request.jwt.claim.sub', $1, false),
              set_config('request.jwt.claim.oid', $1, false)
            `,
            [oid]
          );
          const res = await attClient.query(
            `
            SELECT id, filename, content_type, byte_size, blob_container, blob_path, ingestion_class, extracted_text_path
            FROM public.theo_attachments
            WHERE id = ANY($1::uuid[]) AND created_by = $2
            `,
            [attachmentIds, oid]
          );
          attachmentRows = res.rows;
        } finally {
          attClient.release();
        }
        if (attachmentRows.length !== attachmentIds.length) {
          return jsonErr(404, "NOT_FOUND", "One or more attachments were not found.");
        }
        const orderById = new Map(attachmentIds.map((id, i) => [id, i]));
        attachmentRows.sort((a, b) => orderById.get(a.id) - orderById.get(b.id));
      }
    } catch (attErr) {
      context.error("theo_message_stream: attachment fetch failed", attErr);
      return jsonErr(500, "INTERNAL_SERVER_ERROR", "Failed to load attachments.");
    }

    // ---- Pre-stream conversation ownership check (so a non-owned id is a clean JSON 403/404, not a
    // mid-stream error). Persistence re-checks under the transaction as defense-in-depth. ----
    if (requestedConversationId) {
      let chkClient = null;
      try {
        chkClient = await pool.connect();
        await chkClient.query(
          `
          SELECT
            set_config('app.current_user_id', $1, false),
            set_config('request.jwt.claim.sub', $1, false),
            set_config('request.jwt.claim.oid', $1, false)
          `,
          [oid]
        );
        const owned = await chkClient.query(
          `SELECT id FROM public.theo_conversations WHERE id = $1 AND created_by = $2`,
          [requestedConversationId, oid]
        );
        if (owned.rowCount === 0) {
          const existsResult = await chkClient.query(
            `SELECT public.theo_conversation_exists_unscoped($1::uuid) AS e`,
            [requestedConversationId]
          );
          const exists = existsResult.rows[0] && existsResult.rows[0].e === true;
          return exists
            ? jsonErr(403, "FORBIDDEN", "You do not have access to this conversation.")
            : jsonErr(404, "NOT_FOUND", "Conversation not found.");
        }
      } catch (chkErr) {
        context.error("theo_message_stream: conversation ownership check failed", chkErr);
        return jsonErr(500, "INTERNAL_SERVER_ERROR", "Failed to verify the conversation.");
      } finally {
        if (chkClient) chkClient.release();
      }
    }

    const attachmentBlocks = await buildAttachmentBlocks(context, attachmentRows);

    let messagesForUpstream = messages;
    if (attachmentBlocks.length > 0 && lastUserIndex >= 0) {
      messagesForUpstream = messages.map((m, i) => {
        if (i !== lastUserIndex) return m;
        return {
          ...m,
          content: [...attachmentBlocks, { type: "text", text: userText }],
        };
      });
    }

    // ---- Open the upstream Foundry stream; decide JSON-error vs stream from the response status ----
    let token;
    try {
      token = await getFoundryToken();
    } catch (e) {
      return jsonErr(e.status || 500, e.code || "INTERNAL_SERVER_ERROR", e.message || "Model gateway token failed.");
    }

    if (THINKING_BUDGET > 0 && maxTokens <= THINKING_BUDGET) {
      maxTokens = THINKING_BUDGET + 1024; // Anthropic requires max_tokens > thinking budget
    }
    const upstreamPayload = JSON.stringify({
      model: FOUNDRY_DEPLOYMENT,
      max_tokens: maxTokens,
      ...(effectiveSystem ? { system: effectiveSystem } : {}),
      messages: messagesForUpstream,
      tools: buildGroundingTools(),
      stream: true,
      ...(THINKING_BUDGET > 0 ? { thinking: { type: "enabled", budget_tokens: THINKING_BUDGET } } : {}),
    });

    const upstreamRes = await new Promise((resolve) => {
      const u = new URL(`${FOUNDRY_BASE}/anthropic/v1/messages`);
      const lib = u.protocol === "http:" ? http : https;
      const r = lib.request(
        {
          method: "POST",
          hostname: u.hostname,
          port: u.port ? Number(u.port) : 443,
          path: u.pathname + u.search,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "anthropic-version": ANTHROPIC_VERSION,
            "anthropic-beta": WEB_FETCH_BETA,
            "Content-Length": Buffer.byteLength(upstreamPayload),
            Accept: "text/event-stream",
          },
        },
        (res) => resolve(res)
      );
      r.on("error", (e) => {
        context.error("theo_message_stream: upstream connect failed", e);
        resolve(null);
      });
      r.write(upstreamPayload);
      r.end();
    });

    if (!upstreamRes) {
      return jsonErr(502, "BAD_GATEWAY", "Model gateway call failed.");
    }
    if (upstreamRes.statusCode < 200 || upstreamRes.statusCode >= 300) {
      const errText = await new Promise((res) => {
        let d = "";
        upstreamRes.setEncoding("utf8");
        upstreamRes.on("data", (c) => { d += c; });
        upstreamRes.on("end", () => res(d));
        upstreamRes.on("error", () => res(d));
      });
      context.error("theo_message_stream: gateway non-2xx", upstreamRes.statusCode, errText.slice(0, 300));
      if (upstreamRes.statusCode === 429) {
        return jsonErr(429, "RATE_LIMITED", "Model gateway rate limit exceeded.");
      }
      return jsonErr(502, "BAD_GATEWAY", "Model gateway call failed.");
    }

    // ---- 2xx → stream. Relay upstream SSE verbatim to the client AND accumulate for persistence. ----
    const stream = new PassThrough();
    let rawAll = "";
    upstreamRes.setEncoding("utf8");
    upstreamRes.on("data", (chunk) => {
      rawAll += chunk;
      stream.write(chunk);
    });
    upstreamRes.on("end", async () => {
      let conversationId = null;
      try {
        const acc = parseSseForPersistence(rawAll);
        conversationId = await persistTurn({
          oid, requestedConversationId, appKey, appContext, userText, attachmentIds, acc,
        });
        // Emit a final app-level event so the FE learns the (possibly new) conversation id.
        stream.write(`event: vault_meta\ndata: ${JSON.stringify({ conversation_id: conversationId, model: acc.model || FOUNDRY_DEPLOYMENT })}\n\n`);
      } catch (perr) {
        // The answer was already streamed to the user; a persistence failure must not crash the
        // response — log it and tell the FE the turn was not saved (it just won't appear in history).
        context.error("theo_message_stream: persistence failed (answer already streamed)", perr);
        stream.write(`event: vault_meta\ndata: ${JSON.stringify({ conversation_id: null, persisted: false })}\n\n`);
      } finally {
        stream.end();
      }
    });
    upstreamRes.on("error", (e) => {
      context.error("theo_message_stream: upstream stream error", e);
      try { stream.write(`event: vault_error\ndata: ${JSON.stringify({ message: "The model stream was interrupted." })}\n\n`); } catch {}
      stream.end();
    });

    return {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
      body: stream,
    };
  },
});
```

### §5.5 Primary Reference (2/2) — deployed `dottie_ask.index.js` (full verbatim)

```javascript
// dottie_ask — Dottie (L4 governance observer) — the first backend: a single authenticated round-trip to the
// in-tenant Azure OpenAI gpt-5 deployment (the "API connection framed out"). Mirrors the deployed Theo pattern
// for reaching Azure Cognitive Services: getAadToken CLIENT-CREDENTIALS (the shared "Vault GPT API" app +
// AAD_CLIENT_SECRET, scope https://cognitiveservices.azure.com/.default) — byte-identical to the deployed
// theo_add_project_knowledge (func-projects). Dottie runs on a DELIBERATELY DIFFERENT model from Theo's Claude
// (governance-observer independence). EasyAuth-gated (x-ms-client-principal). Self-contained (Node built-ins).
// The governance ruleset (reading L1.5/L2/L3, drift/review-chain/pattern detection) is NOT here yet — this
// frames the connection; the observational logic is tuned as the layers populate (Vault Memory Arch §A Amendment 8).

const AZURE_OPENAI_ENDPOINT = (process.env.AZURE_OPENAI_ENDPOINT || "").replace(/\/+$/, "");
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-5";
const AZURE_OPENAI_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || "2025-01-01-preview";
const OPENAI_SCOPE = "https://cognitiveservices.azure.com/.default";
const PROMPT_MAX_LEN = 20000;
const DEFAULT_MAX_COMPLETION_TOKENS = 4000;

// Dottie's persona — the independent governance observer. Overridable per-request (for the console + tests).
const DOTTIE_SYSTEM_PROMPT =
  "You are Dottie, the independent governance observer for Vault, a professional-services firm's shared " +
  "memory system. You reason carefully, thoroughly, and conservatively about governance and quality control: " +
  "information-tag consistency, review-chain integrity, appropriate access, and systemic patterns across an " +
  "engagement. You are deliberately independent of the assistants that produce the content you review. Be " +
  "precise, cite specifics, flag risks plainly, distinguish what you can and cannot verify, and never overstate " +
  "certainty. You observe and advise; you do not take actions.";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-ms-client-principal",
};

function send(context, status, body) {
  context.res = {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
    body,
  };
}

function nowIso() {
  return new Date().toISOString();
}

function errorBody(code, message, status) {
  return {
    error: {
      code,
      message,
      status,
      timestamp: nowIso(),
    },
  };
}

function successBody(data) {
  return {
    data,
    meta: {
      timestamp: nowIso(),
      version: "1.0",
    },
  };
}

function getPrincipal(req) {
  const raw = req.headers["x-ms-client-principal"];
  if (!raw || typeof raw !== "string") return null;

  try {
    return JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

function getClaimValue(principal, claimTypes) {
  if (!principal || !Array.isArray(principal.claims)) return null;

  for (const claimType of claimTypes) {
    const match = principal.claims.find((c) => c.typ === claimType);
    if (match && typeof match.val === "string" && match.val.trim()) {
      return match.val.trim();
    }
  }

  return null;
}

// ---- HTTPS helper: byte-identical requestUrl from the deployed theo_add_project_knowledge ----
function requestUrl(urlStr, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const http = require("http");
    const https = require("https");
    const url = new URL(urlStr);
    const lib = url.protocol === "http:" ? http : https;
    const req = lib.request(
      {
        method: options.method || "GET",
        hostname: url.hostname,
        port: url.port ? Number(url.port) : undefined,
        path: url.pathname + url.search,
        headers: options.headers || {},
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => { data += chunk; });
        res.on("end", () => {
          resolve({ statusCode: res.statusCode || 0, headers: res.headers || {}, body: data });
        });
      }
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

function parseJsonSafe(raw) {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Client-credentials token for a given Azure resource scope (same AAD app as the gateway) — byte-identical to
// the deployed theo_add_project_knowledge getAadToken.
async function getAadToken(scope) {
  const tenantId = process.env.AAD_TENANT_ID;
  const clientId = process.env.AAD_CLIENT_ID;
  const clientSecret = process.env.AAD_CLIENT_SECRET;
  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Missing required AAD client-credentials configuration.");
  }
  const form = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
    scope,
  }).toString();
  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const r = await requestUrl(
    tokenUrl,
    { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", "Content-Length": Buffer.byteLength(form) } },
    form
  );
  const payload = parseJsonSafe(r.body);
  if (r.statusCode < 200 || r.statusCode >= 300 || !payload || !payload.access_token) {
    throw new Error(`Token request failed for scope ${scope} (HTTP ${r.statusCode}).`);
  }
  return payload.access_token;
}

module.exports = async function (context, req) {
  if (req.method === "OPTIONS") {
    return send(context, 204, "");
  }

  const principal = getPrincipal(req);
  const oid = getClaimValue(principal, [
    "http://schemas.microsoft.com/identity/claims/objectidentifier",
    "oid",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
  ]);

  if (!oid) {
    return send(context, 401, errorBody("UNAUTHORIZED", "Missing or invalid EasyAuth identity.", 401));
  }

  let body;
  try {
    body = req.body == null ? {} : typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return send(context, 400, errorBody("BAD_REQUEST", "Request body is not valid JSON.", 400));
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) {
    return send(context, 400, errorBody("INVALID_REQUEST", "Field 'prompt' is required.", 400));
  }
  if (prompt.length > PROMPT_MAX_LEN) {
    return send(context, 400, errorBody("INVALID_REQUEST", `Field 'prompt' exceeds the maximum length of ${PROMPT_MAX_LEN} characters.`, 400));
  }
  const systemPrompt =
    typeof body.system === "string" && body.system.trim() ? body.system.trim() : DOTTIE_SYSTEM_PROMPT;

  if (!AZURE_OPENAI_ENDPOINT) {
    return send(context, 500, errorBody("INTERNAL_SERVER_ERROR", "Azure OpenAI endpoint is not configured.", 500));
  }

  try {
    const token = await getAadToken(OPENAI_SCOPE);

    const requestBody = JSON.stringify({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_completion_tokens: DEFAULT_MAX_COMPLETION_TOKENS,
    });

    const url = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${encodeURIComponent(AZURE_OPENAI_DEPLOYMENT)}/chat/completions?api-version=${AZURE_OPENAI_API_VERSION}`;
    const r = await requestUrl(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Length": Buffer.byteLength(requestBody),
        },
      },
      requestBody
    );

    const payload = parseJsonSafe(r.body);
    if (r.statusCode < 200 || r.statusCode >= 300 || !payload) {
      const message = (payload && payload.error && payload.error.message) || `Azure OpenAI request failed (HTTP ${r.statusCode}).`;
      context.log.error("dottie_ask upstream error", r.statusCode, message);
      return send(context, 502, errorBody("UPSTREAM_ERROR", message, 502));
    }

    const choice = Array.isArray(payload.choices) && payload.choices.length > 0 ? payload.choices[0] : null;
    const answer = choice && choice.message && typeof choice.message.content === "string" ? choice.message.content : "";

    return send(context, 200, successBody({
      answer,
      model: payload.model || AZURE_OPENAI_DEPLOYMENT,
      finish_reason: choice ? choice.finish_reason : null,
      usage: payload.usage || null,
    }));
  } catch (err) {
    context.log.error("dottie_ask failed", err);
    return send(context, 500, errorBody("INTERNAL_SERVER_ERROR", "An unexpected error occurred.", 500));
  }
};
```

## §6 — Golden Curls (Golden §5.3; Claude runs post-deploy)

Authenticated `az` bearer (audience `api://4e1a1e31-5c20-4480-99e4-098901707d9e`, as wmansfield@vault-tax.com), against `https://vaultgpt-func-dottie-stream.azurewebsites.net`.

| # | Call | Expect |
| - | ---- | ------ |
| C1 | `POST /api/dottie_message_stream` `{ "messages":[{"role":"user","content":"In two sentences, who are you?"}] }` (curl `-N`) | **200** `Content-Type: text/event-stream`; incremental `data: {choices:[{delta:{content:"…"}}]}` chunks arriving over time (NOT one buffered blob), then `data: [DONE]`, then `event: vault_meta\ndata:{conversation_id:<uuid>,model:"gpt-5-…"}` |
| C2 | re-verify persistence via v3 `dottie_get_conversation?conversationId=<C1 id>` (on func-dottie; **requires D2 deployed — see G-0**) | **200** `{ messages:[ {seq:0,role:"user"}, {seq:1,role:"assistant", content:<full streamed text>} ] }` — streamed turn stored identically to a buffered one |
| C3 | `POST /api/dottie_message_stream` `{ "messages":[{"role":"user","content":"and again"}], "conversation_id":"<C1 id>" }` | **200** stream; appended (seq 2/3); same conversation_id in `vault_meta` |
| C4 | `POST /api/dottie_message_stream` `{ }` (no messages) | **400** JSON BAD_REQUEST (clean pre-stream error, not SSE) |
| C5 | `POST /api/dottie_message_stream` `{ "messages":[…], "conversation_id":"<random uuid>" }` | **404** JSON NOT_FOUND (pre-stream ownership check) |
| C6 | (unauth) any | **401** JSON |

C1 is the milestone — real-time incremental delivery proving the SSE relay flushes (the whole point); C2 proves storage parity with the buffered path.

## §7 — Gap Register

**PROCEED (with one PRE-LAND dependency gate, G-0).** No missing CURRENT authority; no ESCALATE.
- **G-0 (D2 dependency — PRE-LAND, blocking deploy):** This package must NOT be deployed until the **D2 conversation trio (rev-2, `a123bad`) is Codex-APPROVED and deployed** to `vaultgpt-func-dottie`. Two reasons: (a) the streamed-turn persistence writes the same `dottie_*` shape the D2 package establishes — deploying the streamer while D2 is unsettled risks a contract divergence; (b) golden curl **C2 reads the persisted turn back via the D2 `dottie_get_conversation`**, which does not exist on func-dottie until D2 deploys. This package is runtime-independent of the D2 handlers otherwise (persistence is grounded on the DEPLOYED D1 schema, GCR row 6). **Natural build order already satisfies this** — D2 deploys first, then this. If for any reason D2's accepted revision differs materially from `a123bad`, re-anchor GCR row 9 to it before this deploys. Disclosed; blocking.
- **G-1 (sidecar infra — Claude, at deploy): PRE-LAND** — stand up `vaultgpt-func-dottie-stream` (Windows, **Node 24**, Functions v4, share EP1 plan `ASP-VaultTax-931c`, own storage), system-assigned MI, EasyAuth v2 mirrored from `vaultgpt-func-dottie` (shared app `4e1a1e31`, issuer `sts.windows.net/6a0a4c17…`), app settings mirrored (`AZURE_OPENAI_ENDPOINT`/`DEPLOYMENT`/`API_VERSION`, `AAD_TENANT_ID`/`CLIENT_ID`/`CLIENT_SECRET` KV-ref, `MICROSOFT_PROVIDER_AUTHENTICATION_SECRET` KV-ref, `POSTGRES_CONNECTION_STRING`), CORS = the Dottie SWA origin(s) no trailing slash. The Vault GPT API SP already holds Cognitive Services OpenAI User on `Vaultgpt` (client-credentials) → no new model grant. Done after APPROVED, before curls. Disclosed.
- **G-2 (deploy — Claude, at deploy): PRE-LAND** — v4 **zip-deploy** the sidecar (`host.json` + `package.json` + `src/functions/dottie_message_stream.js` + installed `node_modules`) to `vaultgpt-func-dottie-stream`. NOTE the deploy mechanism differs from func-dottie's per-fn Kudu-VFS: v4 apps deploy the whole package (zip / run-from-package), not per-function folders. Claude runs §6 after.
- **G-3 (FE consumes SSE): PROCEED (D4)** — the FE SSE consumption + repointing live chat at the streaming endpoint is the Dottie FE phase (D4); until then Dottie chat uses buffered `dottie_message`. Additive — the new endpoint breaks nothing.
- **G-4 (extended thinking): PROCEED** — intentionally OMITTED (Theo's is gated OFF by default; Dottie D2-Stream does not wire it). gpt-5 reasoning tokens are internal; a future phase can add a thinking surface.
- **G-APISPEC/DOC: PRE-LAND (Role-C, post-deploy)** — the streaming endpoint recorded in the vault-dottie API/contract doc via Role-C after deploy + curls. Disclosed.

## §8 — Deploy plan (ordered; §1D)

0. **Dependency gate (G-0):** the D2 conversation trio (rev-2) is Codex-APPROVED and deployed to `vaultgpt-func-dottie` (so `dottie_get_conversation` exists for C2 and the `dottie_*` persistence contract is settled). Natural order — D2 lands first.
1. **Codex Pass-2** (this package) → APPROVED/REJECTED.
2. **Claude** stands up `vaultgpt-func-dottie-stream` (G-1), v4 zip-deploys the sidecar (G-2), then runs the §6 golden curls. **No migration.** `vaultgpt-func-dottie` untouched.
3. **Role-C** records the streaming endpoint in the vault-dottie docs.

## Codex activation note (Walter forwards)

```
Codex is activated for Pass-2 RE-REVIEW of Dottie Phase D2-Stream (dottie_message_stream), vault-dottie
(review at current HEAD, NOT 8c9ee1d), "Codex Governance/Dottie-D2-Stream-Backend-Pass-1-VEP/
Dottie_D2_Stream_Backend_VEP.md". Prior REJECT was against the pre-fix commit 8c9ee1d. Repairs since:
- Finding 1 (byte-faithful-to-dottie_ask): ALREADY FIXED at a03db01 — the gpt-5 stream call is reclassified an
  ALLOWED DELTA (endpoint/scope/body from dottie_ask, error-envelope from the theo_message_stream reference —
  byte-identical to neither) at intro/GCR row 8/§2/§3/§5.1/§CHANGESET + handler comments.
- Finding 2 (D2 dependency on a rejected baseline): added PRE-LAND blocking gate G-0 — this package must not
  deploy until the D2 trio (rev-2, a123bad) is APPROVED + deployed (dottie_get_conversation must exist for curl
  C2; dottie_* persistence contract settled). GCR row 9 re-anchored to the D2 rev-2 blob a8ab0f6 and downgraded
  to a structural-parity reference (persistence is grounded on the DEPLOYED D1 schema, not on the D2 handler).
  §8 deploy plan now lists the D2 dependency as step 0; C2 flagged "requires D2 deployed".
Open with a governance-bound GCR + Rule Anchor Table. ONE v4 streaming handler on a NEW Windows v4 sidecar
(vaultgpt-func-dottie-stream, shares EP1) — Claude stands up the sidecar + v4 zip-deploys + golden curls after
APPROVED AND after G-0 is satisfied; func-dottie (dottie_ask + D2 trio, v3) is UNTOUCHED; no migration. Review:
(1) faithful mirror — is the v4 streaming mechanism (app.setup enableHttpStream, app.http, PassThrough relay,
persist-on-end, vault_meta/vault_error, pre-stream ownership check, envelope helpers) byte-identical to the
deployed theo_message_stream primary reference (§5.1/§CHANGESET; the 8 shared helpers were diff-verified equal),
with the gpt-5 chat/completions stream:true call an ALLOWED DELTA (endpoint/scope/body from dottie_ask,
error-envelope from the theo_message_stream reference — byte-identical to neither) and the OpenAI-shape SSE parse
a documented ALLOWED DELTA? (2) the choice of the B9 foundational theo_message_stream as the clean primary reference (vs the
current SPW/tool-loop deployment Dottie intentionally omits) — same call made for dottie_message vs theo_message.
(3) topology — separate v4 sidecar exactly like Theo's func-stream, func-dottie v3 untouched, both paths kept.
(4) boundary — dottie_* only (Dottie-L1 separate from Theo's L1), gpt-5 not Claude, owner-gate created_by=$oid,
no attachments/RAG/web/thinking/project-sharing. (5) fail-closed — clean JSON pre-stream errors (401/400/403/404/
429/502/500), mid-stream vault_error, non-fatal post-stream persistence (vault_meta persisted:false), non-fatal
memory fetch, KV-ref secret. (6) persistence parity — a streamed turn stored identically to a buffered
dottie_message turn (lazy-create/seq/user+assistant/updated_at+last_opened_at). (7) the G-0 dependency gate —
is it correctly stated: PRE-LAND, blocks DEPLOY (not authoring) until D2 rev-2 is APPROVED+deployed, with the
companion reference (GCR row 9) downgraded to structural-parity and persistence grounded on the deployed D1
schema? Emit APPROVED or REJECTED only.
```
