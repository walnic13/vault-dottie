# Dottie Phase D2 — Conversation Handlers (send→gpt-5+persist, list, get) — Pass-1 VEP

Second Dottie build phase ([[VAULT_MEMORY_ARCHITECTURE.md]] §A Amendment 9). Delivers the three handlers that make Dottie a **real stateful conversational surface**, on the D1 `dottie_*` schema: **`dottie_message`** (send a turn → **Azure OpenAI gpt-5** → persist user+assistant, lazy-create the conversation, inject **Dottie-L1** relationship memory), **`dottie_list_conversations`**, **`dottie_get_conversation`**. Mirrors the deployed Theo `theo_message` (memory-injection version) / `theo_list_conversations` / `theo_get_conversation` idioms (shared envelope helpers byte-identical to `theo_message`); the gpt-5 model call is an **allowed delta** — endpoint/scope/body from the deployed **`dottie_ask`**, error-envelope from the `theo_message` primary reference (byte-identical to neither single reference) — NOT Theo's Foundry-Claude (observer independence). **Handler-only — NO migration** (uses the deployed D1 tables). Self-contained (Node built-ins); Kudu-VFS deploy to `vaultgpt-func-dottie`. No web-grounding, no history-RAG, no media, no project-sharing.

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Verified Evidence Pack (backend implementation package — handlers, no migration)
Grounding parent (source baseline): `cca5a4fcda73647580f7091c93e4fb741c675474` (vault-dottie, `development`) — this package is carried at a later reviewed commit named only in the Codex activation note; currency anchors below are tip-independent blob SHAs
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD) |
| - | ------------------------------- | ------------------------------ | --------------------------------- |
| 1 | GOVERNING VISION — `governance/VAULT_MEMORY_ARCHITECTURE.md` (§A Amendment 9 — Dottie full agent, Dottie-L1 the consensual 1:1, gpt-5 independence) | `Read`(§A9) this turn | `3afda098df614b11adc8a7cdcf28d0f9a3f47011` |
| 2 | Backend Governor — `governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md` (§3 Never-Guess; §4 Schema Reality Lock; §8 VEP format) | `Grep("Never-Guess")` + `Grep("Schema Reality Lock")` this turn | `e44cdd85d3d0e5df332dc754cdec731e2e68022e` |
| 3 | Grounding Conformance — `governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR; §5 Rule Anchor) | `Grep("MUST open with a Grounding Conformance Receipt")` this turn | `7c0d902bdff3b6c0af475b483e31ed796214e57b` |
| 4 | Golden Handler — `governance/THEO_GOLDEN_HANDLER_STANDARD.md` (§2 canonical primary reference; §4 allowed deltas / EXACT-mirror; §5.1 Structural Mirror Table; §5.3 Golden Curl; §5.5 Kudu-VFS deploy) | `Grep("Structural Mirror Table")` this turn | `f8f0e5ea36447502e35fb87b373c94e376f05cbb` |
| 5 | Execution Orchestration — `governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md` (§1D ordered pass; §1E deploy-after-Codex-APPROVED — func-dottie authority per the Walter authorization below) | `Grep("ordered, non-skippable")` this turn | `565559b699c1309f8e750b0dbbac859c13d807c8` |
| 6 | SCHEMA TRUTH — `spec/DOTTIE_AZURE_POSTGRES_SCHEMA.md` (the deployed D1 `dottie_conversations`/`dottie_messages`/`dottie_user_memory` these handlers read+write) | `Read`(§3/§4) this turn | `bb096db53a8d76dc3589b3744f6492ddad8f1f7f` |
| 7 | **CANONICAL PRIMARY REFERENCE (DEPLOYED)** — Theo `theo_message` handler + function.json (memory-injection version; pool/set_config/envelope/EasyAuth, lazy-create conversation, persist user+assistant, memory injection) | `Read`(theo_message.index.js, full) this turn; byte-identical copies in-package | index.js `f41362bb020a2488915fce0699f8598344b558e8`; function.json `bd476fc8d144ed9592b561b4c0ded84f5911cff0` |
| 8 | GPT-5-CALL SOURCE (DEPLOYED, vault-dottie) — `dottie_ask.index.js` (client-credentials `getAadToken` → Azure OpenAI gpt-5 chat/completions; endpoint/scope/body reused as an allowed-delta — error-envelope taken from the `theo_message` primary reference, so byte-identical to neither) | `Read`(dottie_ask.index.js, full — this session) this turn | vault-dottie `531568ca1ef7768ad2ce11fd8692f90911a265ad` |
| 9 | LIST/GET MIRROR (DEPLOYED, vault-theo) — `theo_list_conversations` + `theo_get_conversation` (the owner-scoped list SELECT + get SELECT + `_exists_unscoped` 403/404 the D2 list/get SELECT-deltas mirror) | survey (paths + SQL) this turn | theo_list_conversations `5eaf178d03bf77fe45b4f99edc2866c150f234a6`; theo_get_conversation `7e31d701fbd2404f4dc2cd8d92d1576d5382d71f` |

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt" | GCR (head) |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §3 | "Never-Guess" | §3 — idioms mirrored from deployed handlers, not invented |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §4 | "Schema Reality Lock" | §3 — reads/writes only the deployed D1 dottie_* tables |
| governance/THEO_GOLDEN_HANDLER_STANDARD.md | §5.1 | "Structural Mirror Table" | §5 — the mirror tables |
| governance/THEO_GOLDEN_HANDLER_STANDARD.md | §2 | "deployed `function.json` file as the canonical Primary Reference" | §5 — primary reference = theo_message index.js AND function.json (both inlined) |
| governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md | §1D | "ordered, non-skippable" | §9 — Codex → deploy → curls |
| governance/VAULT_MEMORY_ARCHITECTURE.md | §A-9 | "consensual 1:1 relationship" | §2 — Dottie-L1 memory injection |

## Walter Authorization (quoted verbatim, predating this VEP — the func-dottie deploy authority)

> "you can do both and the governance regime should be mirrored from our current stnadard as you suggest." — Walter, 2026-08-01 (authorizing the `vaultgpt-func-dottie` app + mirrored governance).
> "let's keep moving forward, i would like to have dottie fully built and deployed backend and frontend today" — Walter, 2026-08-01 (directing the D2 backend on that app).

Claude Code deploys the D2 handlers to `vaultgpt-func-dottie` only after this VEP is Codex-APPROVED; DB writes/migrations remain Walter-only (this VEP has none).

---

## §1 — Feature + design

Three handlers on `vaultgpt-func-dottie`, EasyAuth-gated, on the D1 `dottie_*` schema:
- **`dottie_message`** (`POST`) — body `{ messages: [{role:'user'|'assistant', content:string}], conversation_id?, system?, max_completion_tokens? }`. Injects **Dottie-L1** memory (`dottie_user_memory`, salience-ordered) into the system prompt (with the Dottie persona), calls **gpt-5** chat/completions (client-credentials `getAadToken`; allowed delta — `dottie_ask` endpoint + `theo_message` error-envelope), then persists the new user turn + the assistant reply in one txn (lazy-creating the conversation on the first turn, or owner-gating an existing one). Returns `200 { data:{ conversation_id, role, model, content, finish_reason, usage } }`.
- **`dottie_list_conversations`** (`GET ?limit=`) — the caller's conversations, `last_opened_at DESC NULLS LAST, updated_at DESC` (restore-on-reopen ordering). `200 { data:{ conversations } }`.
- **`dottie_get_conversation`** (`GET ?conversationId=`) — one owned conversation + its messages (seq order), stamps `last_opened_at`. `200 { data:{ conversation, messages } }`.

Errors (all three): `401 UNAUTHORIZED` (no EasyAuth identity); `400 BAD_REQUEST`/`INVALID_REQUEST` (bad body/params); `403 FORBIDDEN` / `404 NOT_FOUND` (owner-gate via `dottie_conversation_exists_unscoped`); `429 RATE_LIMITED` / `502 BAD_GATEWAY` (gpt-5 upstream, `dottie_message`); `500`. `OPTIONS` → `204`.

## §2 — Architecture & boundary reconciliation

**Dottie's conversational surface (Amendment 9).** These handlers turn the D1 substrate into a working stateful console: Dottie remembers your conversations and **knows you** — `dottie_message` injects **Dottie-L1** (`dottie_user_memory`, `"consensual 1:1 relationship"`) into every turn's system prompt.

**Independence + faithful mirror.** The shared envelope helpers are **byte-identical** to the deployed Theo `theo_message` (the canonical primary reference, §5; verified this turn), and the conversation/persist/memory-injection structure mirrors it with documented `dottie_*` allowed-deltas; the **model call is gpt-5** (client-credentials → Azure OpenAI chat/completions) — an **allowed delta** adapting the deployed `dottie_ask` endpoint with the `theo_message` error-envelope — deliberately NOT Theo's Foundry-Claude (observer independence). Owner-gating uses `created_by = $oid` + `dottie_conversation_exists_unscoped` (the pre-SPW / `theo_list_project_knowledge` idiom) — Dottie has **no project-sharing**, so the SPW `theo_conversation_access` branch is intentionally omitted.

**Boundary.** No `reporting_*`; no `theo_*` (Dottie-L1 is separate from Theo's L1 — never crossed); no Blob; no migration; no web-grounding/RAG/media. Reads+writes only the deployed D1 `dottie_*` tables; the only external call is the AAD token + the in-tenant Azure OpenAI gpt-5 endpoint. Runs on `vaultgpt-func-dottie`. **Fail-closed:** no identity → 401; unconfigured endpoint → 500; gpt-5 non-2xx → 502; memory-fetch failure is NON-FATAL (degrades to no memory block); the AAD secret is a KV reference.

## §3 — Schema Reality Lock (deployed grounding)

Nothing invented (Governor §3/§4):
- **Tables** = the DEPLOYED D1 `dottie_conversations` / `dottie_messages` / `dottie_user_memory` + `dottie_conversation_exists_unscoped` (schema doc §3/§4, GCR row 6) — catalog-verified this session. The persist txn (lazy-create → count seq → INSERT user+assistant → `updated_at`+`last_opened_at`), the memory SELECT (salience-ordered), and the owner-gate + exists-discrimination are **structurally faithful** to the deployed `theo_message` (GCR row 7) with documented `dottie_*` allowed-deltas (no `scope` clause on the memory SELECT; no `app_key`/`app_context`/`citations` columns; adds the `last_opened_at` stamp).
- **Model call** = ALLOWED DELTA: the `getAadToken` client-credentials mechanics + the `chat/completions` endpoint/scope/body (`cognitiveservices` scope, `max_completion_tokens`) mirror the deployed `dottie_ask` (GCR row 8); the error-envelope (`buildKnownError`/502/429) mirrors the `theo_message` primary reference — byte-identical to neither single reference.
- **List/get SELECTs** mirror the deployed `theo_list_conversations` / `theo_get_conversation` (GCR row 9), on `dottie_*`.
- **Deployed app fact:** `vaultgpt-func-dottie` has pg (`POSTGRES_CONNECTION_STRING`), the OpenAI env + `getAadToken` config (`AAD_*` KV-ref), EasyAuth, and is Kudu-VFS writable (used for `dottie_ask`). Zero new infra.

## §4 — No migration

Handler-only. The `dottie_*` tables landed in D1 (Walter-run, catalog-verified). Walter runs nothing for this VEP.

## §5 — Canonical Primary Reference (DEPLOYED) + Structural Mirror Tables

**Canonical Primary Reference (Golden Handler §2 — one per package):** the deployed Theo **`theo_message`** (memory-injection version) — it carries every shared idiom the three Dottie handlers reuse (pool + `set_config` preamble, `{data,meta}`/`{error}` envelope, EasyAuth `getPrincipal`/`getClaimValue`, `requestUrl`, lazy-create conversation, persist user+assistant txn with per-conversation `seq`, and Dottie-L1 memory injection). Both files inlined full-verbatim. (The current func-premium `theo_message` has since been broadened for SPW project-sharing; Dottie intentionally does NOT mirror that — the memory-injection version is the faithful structural baseline.)

### §5.1 `dottie_message` mirror table

| Region | Classification vs primary reference `theo_message` | Notes |
| ------ | -------------------------------------------------- | ----- |
| `corsHeaders` + `send`/`nowIso`/`errorBody`/`successBody`/`getPrincipal`/`getClaimValue`/`parseBody`/`buildKnownError`/`isUuid`/`parseJsonSafe`/`requestUrl` + pool + `set_config` preamble | **EXACT** | **byte-identical to the primary reference — verified this turn** (all 11 helpers + `corsHeaders` diffed equal) |
| Dottie-L1 memory injection (SELECT salience-ordered → memory block) | **ALLOWED DELTA** | same idiom on `dottie_user_memory`; drops the `AND scope='user'` clause (no `scope` column); Dottie-worded memory block |
| persist txn (lazy-create → seq count → INSERT user+assistant → `updated_at`+`last_opened_at`) + owner-gate + `_exists_unscoped` | **ALLOWED DELTA** | same SQL structure as `theo_message`'s owner-only branch on `dottie_*`; drops `app_key`/`app_context`/`citations`; adds the `last_opened_at` stamp |
| `getAadToken(scope)` + the model call (Azure OpenAI gpt-5 chat/completions, `max_completion_tokens`) | **ALLOWED DELTA** | endpoint/scope/body from the deployed `dottie_ask` (GCR row 8); error-envelope (`buildKnownError`/502/429) from the `theo_message` primary reference — byte-identical to neither; replaces Theo's Foundry-Claude call (observer independence) |
| web-grounding tools (`buildGroundingTools`, WEB_* config) | **NOT MIRRORED** | Dottie does no web grounding; region omitted |

### §5.2 `dottie_list_conversations` mirror table

| Region | Classification | Notes |
| ------ | -------------- | ----- |
| the six shared envelope helper bodies `send`/`nowIso`/`errorBody`/`successBody`/`getPrincipal`/`getClaimValue` + pool + `set_config` | **EXACT** | **byte-identical to the `theo_message` primary reference — verified this turn** (helper bodies normalized to the primary reference in this rev-2) |
| `corsHeaders` methods `GET, OPTIONS`; POST-only helpers (`parseBody`/`buildKnownError`/`isUuid`/`parseJsonSafe`/`requestUrl`) omitted | **ALLOWED DELTA** | this is a GET reader — method differs from `theo_message`'s POST; helpers a reader does not use are not carried |
| the owner-scoped list SELECT (`last_opened_at DESC NULLS LAST, updated_at DESC`) | **ALLOWED DELTA** | mirrors the DEPLOYED `theo_list_conversations` (GCR row 9), on `dottie_conversations` (drops project/publish columns) |

### §5.3 `dottie_get_conversation` mirror table

| Region | Classification | Notes |
| ------ | -------------- | ----- |
| the six shared envelope helper bodies + `buildKnownError`/`isUuid` + pool + `set_config` + `_exists_unscoped` 403/404 discrimination | **EXACT** | **byte-identical to the `theo_message` primary reference — verified this turn** (helper bodies normalized in this rev-2) |
| `corsHeaders` methods `GET, OPTIONS`; POST-only helpers (`parseBody`/`parseJsonSafe`/`requestUrl`) omitted | **ALLOWED DELTA** | GET reader — method differs from `theo_message`'s POST; unused helpers not carried |
| the get SELECT (conversation + messages seq-ordered) + `last_opened_at` stamp | **ALLOWED DELTA** | mirrors the DEPLOYED `theo_get_conversation` (GCR row 9), on `dottie_*`; drops SPW `theo_conversation_access`, publish state, media re-sign |

No DEVIATION regions.

### §5.4 Primary Reference — `theo_message` index.js (full verbatim)

```javascript
const https = require("https");
const { Pool } = require("pg");

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
    if (match && typeof match.val === "string" && match.val.trim() !== "") {
      return match.val.trim();
    }
  }

  return null;
}

function parseBody(req) {
  if (req.body == null) return {};
  if (typeof req.body === "string") {
    return JSON.parse(req.body);
  }
  if (typeof req.body === "object") {
    return req.body;
  }
  return {};
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

    const req = https.request(
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
    return send(
      context,
      401,
      errorBody("UNAUTHORIZED", "Missing or invalid EasyAuth identity.", 401)
    );
  }

  if (!FOUNDRY_BASE || !FOUNDRY_DEPLOYMENT) {
    context.log.error("theo_message: missing gateway configuration");
    return send(
      context,
      500,
      errorBody("INTERNAL_SERVER_ERROR", "Model gateway is not configured.", 500)
    );
  }

  let body;
  try {
    body = parseBody(req);
  } catch {
    return send(
      context,
      400,
      errorBody("BAD_REQUEST", "Request body is not valid JSON.", 400)
    );
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return send(
      context,
      400,
      errorBody("BAD_REQUEST", "Field 'messages' must be a non-empty array.", 400)
    );
  }

  const maxTokens = Number.isInteger(body.max_tokens) ? body.max_tokens : DEFAULT_MAX_TOKENS;
  const systemPrompt = typeof body.system === "string" ? body.system : null;

  // B3 persistence inputs: optional conversation id + app-context anchor; the new user turn is
  // the last user message in the submitted history.
  const requestedConversationId =
    typeof body.conversation_id === "string" && body.conversation_id.trim() !== ""
      ? body.conversation_id.trim()
      : null;
  const appKey =
    typeof body.app_key === "string" && body.app_key.trim() !== "" ? body.app_key.trim() : null;
  const appContext =
    body.app_context != null && typeof body.app_context === "object" ? body.app_context : null;
  const lastUser = [...messages]
    .reverse()
    .find((m) => m && m.role === "user" && typeof m.content === "string");
  const userText = lastUser ? lastUser.content : "";

  if (requestedConversationId !== null && !isUuid(requestedConversationId)) {
    return send(
      context,
      400,
      errorBody("BAD_REQUEST", "Field 'conversation_id' must be a valid UUID.", 400)
    );
  }

  // ---- Memory injection (B7): prepend the user's distilled memory profile to the system prompt ----
  // Read-only, user-scoped (explicit created_by; the shared connection role bypasses RLS), and
  // NON-FATAL — a memory-fetch failure must never break chat, so it degrades to no memory block.
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
      context.log.error("theo_message: memory fetch failed (non-fatal)", memErr);
    } finally {
      if (memClient) {
        memClient.release();
      }
    }
  }
  const effectiveSystem =
    [memoryBlock, systemPrompt].filter((s) => typeof s === "string" && s.trim() !== "").join("\n\n") || null;

  let client = null;
  try {
    const token = await getFoundryToken();

    const upstreamPayload = JSON.stringify({
      model: FOUNDRY_DEPLOYMENT,
      max_tokens: maxTokens,
      ...(effectiveSystem ? { system: effectiveSystem } : {}),
      messages,
      tools: buildGroundingTools(),
      stream: false,
    });

    const upstream = await requestUrl(
      `${FOUNDRY_BASE}/anthropic/v1/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "anthropic-version": ANTHROPIC_VERSION,
          "anthropic-beta": WEB_FETCH_BETA,
          "Content-Length": Buffer.byteLength(upstreamPayload),
        },
      },
      upstreamPayload
    );

    const parsed = parseJsonSafe(upstream.body);

    if (upstream.statusCode < 200 || upstream.statusCode >= 300 || !parsed) {
      context.log.error("theo_message: gateway non-2xx", upstream.statusCode);
      if (upstream.statusCode === 429) {
        return send(
          context,
          429,
          errorBody("RATE_LIMITED", "Model gateway rate limit exceeded.", 429)
        );
      }
      return send(
        context,
        502,
        errorBody("BAD_GATEWAY", "Model gateway call failed.", 502)
      );
    }

    const textContent = Array.isArray(parsed.content)
      ? parsed.content.filter((b) => b && b.type === "text")
      : [];
    const assistantModel = typeof parsed.model === "string" ? parsed.model : FOUNDRY_DEPLOYMENT;
    const assistantText = textContent
      .map((b) => (typeof b.text === "string" ? b.text : ""))
      .join("");
    const assistantCitations = textContent.flatMap((b) =>
      Array.isArray(b.citations) ? b.citations : []
    );

    // ---- Persist the turn (HF-T2; explicit created_by ownership; shared vaultgpt instance) ----
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
      // Explicit ownership scope (the shared connection role bypasses RLS): a user may only
      // append to a conversation they own. Non-owned id → 0 rows → 403 (exists) / 404 (absent).
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
        assistantText,
        assistantModel,
        assistantCitations.length ? JSON.stringify(assistantCitations) : null,
      ]
    );

    await client.query(
      `UPDATE public.theo_conversations SET updated_at = now() WHERE id = $1 AND created_by = $2`,
      [conversationId, oid]
    );

    await client.query("COMMIT");

    return send(
      context,
      200,
      successBody({
        conversation_id: conversationId,
        role: typeof parsed.role === "string" ? parsed.role : "assistant",
        model: assistantModel,
        content: textContent,
        stop_reason: parsed.stop_reason != null ? parsed.stop_reason : null,
        usage: parsed.usage != null ? parsed.usage : null,
      })
    );
  } catch (err) {
    if (client) {
      try { await client.query("ROLLBACK"); } catch {}
    }

    context.log.error("theo_message failed", err);

    if (err && err.code === "42501") {
      return send(
        context,
        403,
        errorBody("FORBIDDEN", "You do not have permission for this conversation.", 403)
      );
    }

    if (err && err.isKnown === true && typeof err.status === "number" && typeof err.code === "string") {
      return send(
        context,
        err.status,
        errorBody(err.code, err.message, err.status)
      );
    }

    return send(
      context,
      500,
      errorBody("INTERNAL_SERVER_ERROR", "Failed to process message.", 500)
    );
  } finally {
    if (client) {
      client.release();
    }
  }
};
```

### §5.5 Primary Reference — `theo_message` function.json (full verbatim)

```json
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["post", "options"],
      "route": "theo_message"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

## §6 — The handlers

All `node --check` clean; the shared envelope helpers byte-identical to the `theo_message` primary reference (verified this turn); the `getAadToken` + gpt-5 model call an allowed delta (`dottie_ask` endpoint + `theo_message` error-envelope); the persist/memory SQL structurally faithful to `theo_message` with documented `dottie_*` allowed-deltas.

### §6.1 `dottie_message` index.js

```javascript
const https = require("https");
const { Pool } = require("pg");

// dottie_message — Dottie's send→reply→persist handler (Phase D2). Mirrors the deployed Theo memory-injection
// theo_message (pool/set_config/envelope/EasyAuth, lazy-create conversation, persist user+assistant, Dottie-L1
// memory injection) with two allowed-delta adaptations: (1) dottie_* tables + Dottie-L1 (dottie_user_memory, no
// scope column); (2) the model call is Azure OpenAI gpt-5 chat/completions via client-credentials getAadToken —
// endpoint/scope/body from the deployed dottie_ask, error-envelope from the theo_message primary reference (so
// byte-identical to neither single reference) — NOT Theo's Foundry-Claude (deliberately different model; observer
// independence). No web-grounding tools, no history-RAG, no media. Self-contained (Node built-ins). Runs on
// vaultgpt-func-dottie.

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
    if (match && typeof match.val === "string" && match.val.trim() !== "") {
      return match.val.trim();
    }
  }

  return null;
}

function parseBody(req) {
  if (req.body == null) return {};
  if (typeof req.body === "string") {
    return JSON.parse(req.body);
  }
  if (typeof req.body === "object") {
    return req.body;
  }
  return {};
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

    const req = https.request(
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
// mirrors the theo_message primary reference's getFoundryToken — an allowed delta, not byte-identical to either.
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

  if (!AZURE_OPENAI_ENDPOINT) {
    context.log.error("dottie_message: missing Azure OpenAI configuration");
    return send(context, 500, errorBody("INTERNAL_SERVER_ERROR", "Model gateway is not configured.", 500));
  }

  let body;
  try {
    body = parseBody(req);
  } catch {
    return send(context, 400, errorBody("BAD_REQUEST", "Request body is not valid JSON.", 400));
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return send(context, 400, errorBody("BAD_REQUEST", "Field 'messages' must be a non-empty array.", 400));
  }
  // Normalise to {role, content:string} chat turns (user/assistant only); reject malformed.
  const chatMessages = [];
  for (const m of messages) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") {
      return send(context, 400, errorBody("BAD_REQUEST", "Each 'messages' item must be { role: 'user'|'assistant', content: string }.", 400));
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
    return send(context, 400, errorBody("BAD_REQUEST", "Field 'conversation_id' must be a valid UUID.", 400));
  }
  if (!userText.trim()) {
    return send(context, 400, errorBody("BAD_REQUEST", "The submitted history must end with a non-empty user message.", 400));
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
      context.log.error("dottie_message: memory fetch failed (non-fatal)", memErr);
    } finally {
      if (memClient) {
        memClient.release();
      }
    }
  }
  const effectiveSystem = [DOTTIE_SYSTEM_PROMPT, memoryBlock, systemPrompt]
    .filter((s) => typeof s === "string" && s.trim() !== "")
    .join("\n\n");

  let client = null;
  try {
    const token = await getAadToken(OPENAI_SCOPE);

    const upstreamPayload = JSON.stringify({
      messages: [{ role: "system", content: effectiveSystem }, ...chatMessages],
      max_completion_tokens: maxCompletionTokens,
    });

    const upstream = await requestUrl(
      `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${encodeURIComponent(AZURE_OPENAI_DEPLOYMENT)}/chat/completions?api-version=${AZURE_OPENAI_API_VERSION}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Length": Buffer.byteLength(upstreamPayload),
        },
      },
      upstreamPayload
    );

    const parsed = parseJsonSafe(upstream.body);

    if (upstream.statusCode < 200 || upstream.statusCode >= 300 || !parsed) {
      context.log.error("dottie_message: gateway non-2xx", upstream.statusCode);
      if (upstream.statusCode === 429) {
        return send(context, 429, errorBody("RATE_LIMITED", "Model gateway rate limit exceeded.", 429));
      }
      const message = (parsed && parsed.error && parsed.error.message) || "Model gateway call failed.";
      return send(context, 502, errorBody("BAD_GATEWAY", message, 502));
    }

    const choice = Array.isArray(parsed.choices) && parsed.choices.length > 0 ? parsed.choices[0] : null;
    const assistantText = choice && choice.message && typeof choice.message.content === "string" ? choice.message.content : "";
    const assistantModel = typeof parsed.model === "string" ? parsed.model : AZURE_OPENAI_DEPLOYMENT;

    // ---- Persist the turn (explicit created_by ownership; shared vaultgpt instance) ----
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
      [oid, conversationId, baseSeq + 1, assistantText, assistantModel]
    );

    await client.query(
      `UPDATE public.dottie_conversations SET updated_at = now(), last_opened_at = now() WHERE id = $1 AND created_by = $2`,
      [conversationId, oid]
    );

    await client.query("COMMIT");

    return send(
      context,
      200,
      successBody({
        conversation_id: conversationId,
        role: "assistant",
        model: assistantModel,
        content: assistantText,
        finish_reason: choice ? choice.finish_reason : null,
        usage: parsed.usage != null ? parsed.usage : null,
      })
    );
  } catch (err) {
    if (client) {
      try { await client.query("ROLLBACK"); } catch {}
    }

    context.log.error("dottie_message failed", err);

    if (err && err.code === "42501") {
      return send(context, 403, errorBody("FORBIDDEN", "You do not have permission for this conversation.", 403));
    }
    if (err && err.isKnown === true && typeof err.status === "number" && typeof err.code === "string") {
      return send(context, err.status, errorBody(err.code, err.message, err.status));
    }
    return send(context, 500, errorBody("INTERNAL_SERVER_ERROR", "Failed to process message.", 500));
  } finally {
    if (client) {
      client.release();
    }
  }
};
```

### §6.2 `dottie_message` function.json

```json
{
  "bindings": [
    { "authLevel": "anonymous", "type": "httpTrigger", "direction": "in", "name": "req", "methods": ["post", "options"], "route": "dottie_message" },
    { "type": "http", "direction": "out", "name": "res" }
  ]
}
```

### §6.3 `dottie_list_conversations` index.js

```javascript
const { Pool } = require("pg");

// dottie_list_conversations — the caller's Dottie conversations, newest-touched first. Mirrors the deployed
// theo_list_conversations (pool/set_config/envelope, owner-scoped, restore-on-reopen ordering), on dottie_*.
// No project/publish columns.

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

const pool = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
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
    if (match && typeof match.val === "string" && match.val.trim() !== "") {
      return match.val.trim();
    }
  }

  return null;
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

  let limit = DEFAULT_LIMIT;
  if (req.query && typeof req.query.limit === "string" && req.query.limit.trim() !== "") {
    const n = parseInt(req.query.limit, 10);
    if (!Number.isInteger(n) || n < 1 || n > MAX_LIMIT) {
      return send(context, 400, errorBody("INVALID_REQUEST", `Query parameter 'limit' must be an integer 1..${MAX_LIMIT}.`, 400));
    }
    limit = n;
  }

  let client = null;
  try {
    client = await pool.connect();
    await client.query(
      `
      SELECT
        set_config('app.current_user_id', $1, false),
        set_config('request.jwt.claim.sub', $1, false),
        set_config('request.jwt.claim.oid', $1, false)
      `,
      [oid]
    );

    const result = await client.query(
      `
      SELECT id, title, model, created_at, updated_at, last_opened_at, starred
      FROM public.dottie_conversations
      WHERE created_by = $1
      ORDER BY last_opened_at DESC NULLS LAST, updated_at DESC, id DESC
      LIMIT $2
      `,
      [oid, limit]
    );

    return send(context, 200, successBody({ conversations: result.rows }));
  } catch (err) {
    context.log.error("dottie_list_conversations failed", err);
    if (err && err.code === "42501") {
      return send(context, 403, errorBody("FORBIDDEN", "You do not have access to these conversations.", 403));
    }
    return send(context, 500, errorBody("INTERNAL_SERVER_ERROR", "An unexpected error occurred.", 500));
  } finally {
    if (client) {
      client.release();
    }
  }
};
```

### §6.4 `dottie_list_conversations` function.json

```json
{
  "bindings": [
    { "authLevel": "anonymous", "type": "httpTrigger", "direction": "in", "name": "req", "methods": ["get", "options"], "route": "dottie_list_conversations" },
    { "type": "http", "direction": "out", "name": "res" }
  ]
}
```

### §6.5 `dottie_get_conversation` index.js

```javascript
const { Pool } = require("pg");

// dottie_get_conversation — one Dottie conversation + its messages, owner-scoped. Mirrors the deployed
// theo_get_conversation (pool/set_config/envelope, owner filter + _exists_unscoped 403/404 discrimination,
// last_opened_at stamp) on dottie_*. No SPW conversation_access, no publish state, no media re-sign.

const pool = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
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

  const conversationId =
    req.query && typeof req.query.conversationId === "string" ? req.query.conversationId.trim() : "";
  if (!isUuid(conversationId)) {
    return send(context, 400, errorBody("INVALID_REQUEST", "Query parameter 'conversationId' is required and must be a valid UUID.", 400));
  }

  let client = null;
  try {
    client = await pool.connect();
    await client.query(
      `
      SELECT
        set_config('app.current_user_id', $1, false),
        set_config('request.jwt.claim.sub', $1, false),
        set_config('request.jwt.claim.oid', $1, false)
      `,
      [oid]
    );

    const conv = await client.query(
      `
      SELECT id, title, model, created_by, created_at, updated_at, last_opened_at, starred
      FROM public.dottie_conversations
      WHERE id = $1 AND created_by = $2
      `,
      [conversationId, oid]
    );
    if (conv.rowCount === 0) {
      const existsResult = await client.query(
        `SELECT public.dottie_conversation_exists_unscoped($1::uuid) AS e`,
        [conversationId]
      );
      const exists = existsResult.rows[0] && existsResult.rows[0].e === true;
      throw exists
        ? buildKnownError("FORBIDDEN", "You do not have access to this conversation.", 403)
        : buildKnownError("NOT_FOUND", "Conversation not found.", 404);
    }

    const msgs = await client.query(
      `
      SELECT id, seq, role, content, model, created_at
      FROM public.dottie_messages
      WHERE conversation_id = $1 AND created_by = $2
      ORDER BY seq ASC, created_at ASC
      `,
      [conversationId, oid]
    );

    // best-effort restore-on-reopen stamp
    try {
      await client.query(
        `UPDATE public.dottie_conversations SET last_opened_at = now() WHERE id = $1 AND created_by = $2`,
        [conversationId, oid]
      );
    } catch (stampErr) {
      context.log.error("dottie_get_conversation: last_opened_at stamp failed (non-fatal)", stampErr);
    }

    return send(context, 200, successBody({ conversation: conv.rows[0], messages: msgs.rows }));
  } catch (err) {
    context.log.error("dottie_get_conversation failed", err);
    if (err && err.code === "42501") {
      return send(context, 403, errorBody("FORBIDDEN", "You do not have access to this conversation.", 403));
    }
    if (err && err.isKnown === true && typeof err.status === "number" && typeof err.code === "string") {
      return send(context, err.status, errorBody(err.code, err.message, err.status));
    }
    return send(context, 500, errorBody("INTERNAL_SERVER_ERROR", "An unexpected error occurred.", 500));
  } finally {
    if (client) {
      client.release();
    }
  }
};
```

### §6.6 `dottie_get_conversation` function.json

```json
{
  "bindings": [
    { "authLevel": "anonymous", "type": "httpTrigger", "direction": "in", "name": "req", "methods": ["get", "options"], "route": "dottie_get_conversation" },
    { "type": "http", "direction": "out", "name": "res" }
  ]
}
```

## §7 — Golden Curls (Golden Handler §5.3; Claude runs post-deploy)

Authenticated `az` bearer (audience `api://4e1a1e31-5c20-4480-99e4-098901707d9e`, as wmansfield@vault-tax.com).

| # | Call | Expect |
| - | ---- | ------ |
| C1 | `POST /api/dottie_message` `{ "messages":[{"role":"user","content":"In one sentence, who are you?"}] }` | **200** `{ data:{ conversation_id:<uuid>, content:<gpt-5 text>, model, usage } }` — new conversation + live gpt-5 reply persisted |
| C2 | `GET /api/dottie_list_conversations` | **200** `{ data:{ conversations:[ { id:<C1's id>, title, last_opened_at, starred:false … } ] } }` |
| C3 | `GET /api/dottie_get_conversation?conversationId=<C1's id>` | **200** `{ data:{ conversation, messages:[ {seq:0,role:"user"…}, {seq:1,role:"assistant"…} ] } }` |
| C4 | `POST /api/dottie_message` `{ "messages":[{"role":"user","content":"and again"}], "conversation_id":"<C1's id>" }` | **200** — appended (messages seq 2/3); same conversation_id |
| C5 | `POST /api/dottie_message` `{ }` (no messages) | **400** BAD_REQUEST |
| C6 | `GET /api/dottie_get_conversation?conversationId=<random uuid>` | **404** NOT_FOUND |
| C7 | (unauth) any | **401** |

C1 is the milestone — a conversation created, a live gpt-5 turn persisted; C3/C4 prove the seq/persist round-trip. Verifying the Dottie-L1 injection end-to-end (Dottie referencing a remembered fact) is exercised once D3 writes memory / via the FE; the memory SELECT itself mirrors the deployed `theo_message` (allowed-delta: no `scope` clause) and degrades non-fatally.

## §8 — Gap Register

**PROCEED.** No missing CURRENT authority; no ESCALATE.
- **G-1 (Dottie-L1 write — distillation + CRUD): PROCEED (Phase D3)** — `dottie_message` READS `dottie_user_memory`; the WRITE (distillation timer + CRUD) is D3. The injection degrades non-fatally until then.
- **G-2 (streaming): PROCEED (optional later)** — `dottie_message` is synchronous (like `theo_message`); a `dottie_message_stream` SSE sidecar mirroring `theo_message_stream` is an optional later phase.
- **G-3 (gpt-5 contract): PROCEED** — confirmed live by the deployed `dottie_ask` (same chat/completions + `max_completion_tokens` + api-version); the C1 curl re-confirms.
- **G-APISPEC/DOC: PRE-LAND (Role-C, post-deploy)** — the three endpoints are recorded in a `vault-dottie` API/contract doc via Role-C after deploy + golden curls. Disclosed.

## §9 — Deploy plan (ordered; §1D)

1. **Codex Pass-2** → APPROVED/REJECTED.
2. **Claude** Kudu-VFS deploys the three handlers to `vaultgpt-func-dottie` (classic per-fn: PUT each `<fn>/{index.js,function.json}`, GET-back diff, restart, syncfunctiontriggers), then runs the §7 golden curls. **No migration.**
3. **Role-C** records the Dottie conversation API in the vault-dottie docs.

## Codex activation note (Walter forwards)

```
Codex is activated for Pass-2 RE-REVIEW of Dottie Phase D2 (conversation handlers), vault-dottie,
"Codex Governance/Dottie-D2-Conversation-Handlers-Pass-1-VEP/Dottie_D2_Conversation_Handlers_VEP.md".
This is rev-2 after the T13/T12 REJECT. Repairs: (a) dottie_list_conversations/dottie_get_conversation envelope
helper BODIES normalized to be byte-identical to the theo_message primary reference (verified: send/nowIso/
errorBody/successBody/getPrincipal/getClaimValue diff equal); (b) the gpt-5 model call reclassified honestly as an
ALLOWED DELTA (endpoint/scope/body from dottie_ask, error-envelope from the theo_message primary reference —
byte-identical to neither), in the intro, GCR row 8, §3, §5.1, §6, and the handler comments; (c) the Dottie-L1
memory SELECT and the persist txn reclassified EXACT→ALLOWED DELTA (no scope clause; drops app_key/app_context/
citations; adds last_opened_at). Open with a governance-bound GCR + Rule Anchor Table. HANDLER-ONLY (no migration;
Claude Kudu-VFS deploy to the Walter-authorized vaultgpt-func-dottie + golden curls). Review:
(1) faithful mirror — are the shared envelope helpers now byte-identical to the theo_message canonical primary
reference (§5.1), the gpt-5 call an accurately-labelled ALLOWED DELTA, and the memory/persist SQL structurally
faithful with the documented dottie_* deltas? (2) the primary-reference structure (theo_message canonical; list/get
envelope bodies byte-identical + GET/SELECT allowed-deltas). (3) boundary — dottie_* only (Dottie-L1 separate from
Theo's L1), gpt-5 not Claude, owner-gate created_by=$oid (SPW conversation_access intentionally omitted — no
project-sharing), no web/RAG/media. (4) fail-closed — 401/400/403/404/429/502/500; non-fatal memory fetch; KV-ref
secret. (5) deploy plan — Kudu-VFS to func-dottie; the Dottie-L1-injection-end-to-end + streaming + memory-write
correctly deferred (D3/D2-Stream). Emit APPROVED or REJECTED only.
```
