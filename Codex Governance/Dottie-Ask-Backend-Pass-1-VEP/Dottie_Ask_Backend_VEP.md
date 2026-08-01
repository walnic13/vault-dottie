# Dottie `dottie_ask` Backend — the Azure OpenAI connection, framed out — Pass-1 VEP

First backend VEP for **Dottie** (the L4 governance observer; `vault-theo/governance/VAULT_MEMORY_ARCHITECTURE.md` §A Amendment 8). Delivers `dottie_ask` — a single authenticated round-trip from `vaultgpt-func-dottie` to the in-tenant **Azure OpenAI `gpt-5`** deployment (the "API connection framed out"). **Copies the deployed Theo pattern** for reaching Azure Cognitive Services: `getAadToken` **client-credentials** (the shared "Vault GPT API" app + `AAD_CLIENT_SECRET`, scope `https://cognitiveservices.azure.com/.default`) — byte-identical to the deployed `theo_add_project_knowledge`. **Handler-only — NO migration.** Self-contained (Node built-ins), EasyAuth-gated, deployed via Kudu-VFS. The governance ruleset (reading L1.5/L2/L3, drift/review-chain/pattern detection) is **NOT** here — this frames the connection; the observational logic is tuned as those layers populate (frame-first, Amendment 8).

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Verified Evidence Pack (backend implementation package — handler, no migration)
Grounding parent (source baseline): `6a77624d713bd492b88f3e9e2b827af8ea79bbac` (vault-dottie, `development`) — this package is carried at a later reviewed commit named only in the Codex activation note; currency anchors below are tip-independent blob SHAs
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD) |
| - | ------------------------------- | ------------------------------ | --------------------------------- |
| 1 | GOVERNING VISION — `governance/VAULT_MEMORY_ARCHITECTURE.md` (§5 Dottie observational; §A Amendment 8 — Dottie impl: in-tenant Azure OpenAI, keyless, observer independence, frame-first) | `Read`(§5/§A8) this turn | `030baad51b571108d0d8be9fe008aeeb7c9b2e01` |
| 2 | Backend Governor — `governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md` (§3 Never-Guess; §4 Schema Reality Lock; §8 VEP format + Gap Register) | `Grep("Never-Guess")` + `Grep("Schema Reality Lock")` this turn | `e44cdd85d3d0e5df332dc754cdec731e2e68022e` |
| 3 | Grounding Conformance — `governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR; §5 Rule Anchor) | `Grep("MUST open with a Grounding Conformance Receipt")` this turn | `7c0d902bdff3b6c0af475b483e31ed796214e57b` |
| 4 | Golden Handler — `governance/THEO_GOLDEN_HANDLER_STANDARD.md` (§2 primary reference; §4 allowed deltas / EXACT-mirror; §5.1 Structural Mirror Table; §5.3 Golden Curl; §5.5 Kudu-VFS deploy) | `Grep("Structural Mirror Table")` this turn | `f8f0e5ea36447502e35fb87b373c94e376f05cbb` |
| 5 | Execution Orchestration — `governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md` (§1D ordered pass; §1E deploy-after-Codex-APPROVED discipline — the app-list is Theo's; func-dottie deploy authority is the Walter authorization below) | `Grep("ordered, non-skippable")` this turn | `565559b699c1309f8e750b0dbbac859c13d807c8` |
| 6 | **PRIMARY REFERENCE (DEPLOYED)** — `theo_add_project_knowledge` handler + function.json on `vaultgpt-func-projects` (client-credentials `getAadToken` + Cognitive Services HTTP call + envelope + EasyAuth; `requestUrl`/`parseJsonSafe`) | `Read`(theo_add_project_knowledge.index.js, full — Kudu GET this session) this turn | index.js `fc0163383a4714b8dd0d887a5b74a92723470410`; function.json `ce3589b4e2e85f6c3a7d4161831a68b60bd6efaa` |
| 7 | DEPLOYED FACT — `vaultgpt-func-dottie` (EP1, Node 24 v4, SystemAssigned MI; EasyAuth v2 shared audience; Kudu-VFS writable) + `Vaultgpt` Azure OpenAI (`gpt-5`); the "Vault GPT API" SP granted Cognitive Services OpenAI User on `Vaultgpt`; app settings `AZURE_OPENAI_*` + AAD (KV-ref secret) set | `az` create/grant/appsettings + `az cognitiveservices` this session | live Azure state (§3) |

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt" | GCR (head) |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §3 | "Never-Guess" | §3 — token idiom + endpoints mirrored from the deployed handler / live infra |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §4 | "Schema Reality Lock" | §3 — reuses only deployed/provisioned infra |
| governance/THEO_GOLDEN_HANDLER_STANDARD.md | §5.1 | "Structural Mirror Table" | §5 — handler mirror table |
| governance/THEO_GOLDEN_HANDLER_STANDARD.md | §2 | "deployed `function.json` file as the canonical Primary Reference" | §5 — primary reference = theo_add_project_knowledge index.js AND function.json (both inlined) |
| governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md | §1D | "ordered, non-skippable" | §9 — Codex → Claude deploy → curls |

## Walter Authorization (quoted verbatim, predating this VEP — the func-dottie deploy authority)

> "you can do both and the governance regime should be mirrored from our current stnadard as you suggest." — Walter, 2026-08-01 (authorizing creation of the `vault-dottie` repo + the `vaultgpt-func-dottie` function app, and the mirrored governance regime).
> "let's continue to the backend" — Walter, 2026-08-01 (directing this backend, on the app he authorized).

`vaultgpt-func-dottie` is a Walter-created, Walter-authorized dedicated app for Dottie (EP1, SystemAssigned MI, EasyAuth on the shared audience) — the direct analog of the DR-T7/§1E scoped-deployment exception, established for the `vault-dottie` repo by the authorization above. Claude Code deploys `dottie_ask` to it only after this VEP is Codex-APPROVED; DB writes/migrations remain Walter-only (this VEP has none).

---

## §1 — Feature + design

**Feature.** `dottie_ask` — a `POST` handler on `vaultgpt-func-dottie`. Body `{ prompt (string), system? (string) }`. EasyAuth-gated (Entra OID from `x-ms-client-principal`; 401 if absent). It:
1. Acquires a Cognitive Services token via `getAadToken("https://cognitiveservices.azure.com/.default")` — **client-credentials** with the shared "Vault GPT API" app + `AAD_CLIENT_SECRET` (byte-identical to the deployed `theo_add_project_knowledge`).
2. Calls **Azure OpenAI** `POST {AZURE_OPENAI_ENDPOINT}/openai/deployments/gpt-5/chat/completions?api-version={ver}` with `{ messages: [ {system: Dottie persona}, {user: prompt} ], max_completion_tokens }` (gpt-5 is a reasoning model → `max_completion_tokens`, no `temperature`).
3. Returns `200 { data:{ answer, model, finish_reason, usage }, meta }`.

Errors: `401 UNAUTHORIZED` (no EasyAuth identity); `400 INVALID_REQUEST` (missing/oversized `prompt`) / `BAD_REQUEST` (bad JSON); `502 UPSTREAM_ERROR` (Azure OpenAI non-2xx); `500` (unexpected / endpoint unconfigured). `OPTIONS` → `204`.

**Dottie persona** (system prompt, overridable): the *independent* governance observer — careful, conservative, cites specifics, distinguishes verifiable from not, observes/advises but does not act. This frames Dottie's voice; the actual governance *inputs* (L1.5/L2/L3 context) are wired later.

## §2 — Architecture & boundary reconciliation

**What this is (and isn't).** The **connection framed out** — Dottie can now reason with in-tenant `gpt-5`. It is **NOT** the observational ruleset (no reading of L1.5/L2/L3, no drift/review-chain detection) — that is tuned as the layers populate (Amendment 8, frame-first). Dottie is **observational** and **never reads L1** — this handler reads no Vault memory at all yet; it only relays a prompt to gpt-5.

**Observer independence (Amendment 8).** Dottie runs on **Azure OpenAI gpt-5**, a deliberately different model from Theo's Claude — the QC model is not the model that produced the content.

**"Copy what we've done for theo" (Walter-directed).** The token idiom is the deployed Theo **client-credentials `getAadToken`** (the shared AAD app reaching Cognitive Services), byte-identical to `theo_add_project_knowledge`. To make it reach `gpt-5` on `Vaultgpt`, the "Vault GPT API" SP (`976bbd69…`) was granted **Cognitive Services OpenAI User** on `Vaultgpt` (the SP already holds Cognitive Services roles for the deployed embeddings/search path; this extends it to the OpenAI resource — consistent, not a new pattern). (`vaultgpt-func-dottie` also has its own MI with the same role as belt-and-suspenders; a future switch to MI-only token acquisition is a one-function change.)

**Boundary.** No Vault DB; no Blob; no `reporting_*`; no migration; no write. One outbound call to the AAD token endpoint + one to the in-tenant Azure OpenAI endpoint (`vaultgpt.openai.azure.com`, in-tenant). Runs on `vaultgpt-func-dottie`. Self-contained (Node built-ins; no npm deps).

**Fail-closed:** no identity → 401; unconfigured endpoint → 500; any Azure OpenAI non-2xx → 502 (the upstream message surfaced, not swallowed); the `AAD_CLIENT_SECRET` is a Key Vault reference (no secret bytes on the app; func-dottie MI holds Key Vault Secrets User).

## §3 — Schema Reality Lock (deployed grounding)

Nothing invented (Governor §3/§4) — reuses only deployed idioms + provisioned infra:
- **`getAadToken` (client-credentials) + `requestUrl` (http/https) + `parseJsonSafe`** — byte-identical to the DEPLOYED `theo_add_project_knowledge` (func-projects; primary reference, GCR row 6).
- **Envelope + EasyAuth** (`send`/`errorBody`/`successBody`/`getPrincipal`/`getClaimValue`) — the standard func-projects handler envelope (identical across `theo_add_project_knowledge` / `theo_list_project_knowledge`).
- **Provisioned infra (this session, live):** `vaultgpt-func-dottie` (EP1 `ASP-VaultTax-931c`, Windows/Node 24, Functions v4, SystemAssigned MI, storage `vaultgptdottiestore`, EasyAuth v2 mirrored from func-projects — shared app `4e1a1e31`, audience `api://4e1a1e31…`); `Vaultgpt` Azure OpenAI with the `gpt-5` deployment; app settings `AZURE_OPENAI_ENDPOINT`/`AZURE_OPENAI_DEPLOYMENT=gpt-5`/`AZURE_OPENAI_API_VERSION`, `AAD_*` (secret = `aad-client-secret` KV ref); the "Vault GPT API" SP granted Cognitive Services OpenAI User on `Vaultgpt`. **Kudu-VFS writable** (WEBSITE_RUN_FROM_PACKAGE unset) → classic per-fn deploy (like func-theo-tools).

## §4 — No migration

Handler-only. Dottie has no Vault database of its own yet (its future L1.5/L2/L3 *reads* go through the access-policy engine when the ruleset lands). Walter runs nothing for this VEP.

## §5 — Primary Reference (DEPLOYED) + Structural Mirror Table

**Primary Reference:** `theo_add_project_knowledge` — DEPLOYED on `vaultgpt-func-projects` (Kudu GET this session). The single deployed handler carrying every idiom `dottie_ask` mirrors: client-credentials `getAadToken`, `requestUrl` (http/https), `parseJsonSafe`, the `{data,meta}`/`{error}` envelope, and EasyAuth. Byte-identical copies in-package; both files inlined full-verbatim (Golden Handler §2). Its RAG-indexing regions (Azure AI Search embed/index/upsert) are **not mirrored** — `dottie_ask` is far narrower (one Azure OpenAI call).

### §5.1 Structural Mirror Table (Golden Handler §5.1)

| Handler region | Classification vs Primary Reference | Notes |
| -------------- | ----------------------------------- | ----- |
| `getAadToken(scope)` (client-credentials) | **EXACT** | byte-identical |
| `requestUrl` (http/https) + `parseJsonSafe` | **EXACT** | byte-identical |
| `corsHeaders`/`send`/`nowIso`/`errorBody`/`successBody`/`getPrincipal`/`getClaimValue` | **EXACT** | the standard func-projects envelope + EasyAuth (corsHeaders methods POST/OPTIONS — allowed contract delta) |
| Azure OpenAI `chat/completions` call (endpoint/body/response shape) + `DOTTIE_SYSTEM_PROMPT` | **ALLOWED DELTA** | Golden Handler §4: same token idiom + `requestUrl`, a different Cognitive Services endpoint (OpenAI chat/completions vs Search/embeddings) — the new-external-system call is EXACT-mirrored on the deployed token+HTTP idiom; `max_completion_tokens` (gpt-5 reasoning) |
| RAG indexing (`ensureIndex`/`embedBatch`/`upsertDocs`) | **NOT MIRRORED** | Dottie does not index; region omitted (narrower scope) |

No DEVIATION regions.

### §5.2 Primary Reference — `theo_add_project_knowledge` index.js (full verbatim)

```javascript
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
});

const TITLE_MAX_LEN = 200;
const CONTENT_MAX_LEN = 10000;
// Phase D / D2 - RAG on-ingest indexing (Azure AI Search project-knowledge index). Config + helpers
// reused from the deployed theo_index_messages (B7b1) + the deployed theo_add_project_knowledge_file (D1)
// per the Walter-authorized composite: getAadToken + embedBatch byte-identical (EXACT); ensureIndex +
// upsertDocs adapted reuse (index name -> PK_SEARCH_INDEX / project field set). Indexing is NON-FATAL.
const EMBED_ENDPOINT = (process.env.THEO_EMBED_ENDPOINT || "").replace(/\/+$/, "");
const EMBED_DEPLOYMENT = process.env.THEO_EMBED_DEPLOYMENT;
const EMBED_API_VERSION = process.env.THEO_EMBED_API_VERSION || "2023-05-15";
const SEARCH_ENDPOINT = (process.env.THEO_SEARCH_ENDPOINT || "").replace(/\/+$/, "");
const PK_SEARCH_INDEX = process.env.THEO_PK_SEARCH_INDEX || "theo-project-knowledge";
const SEARCH_API_VERSION = process.env.THEO_SEARCH_API_VERSION || "2023-11-01";
const EMBED_SCOPE = "https://cognitiveservices.azure.com/.default";
const SEARCH_SCOPE = "https://search.azure.com/.default";
const CHUNK_CHARS = 2000; // project-knowledge docs are large; chunk for retrieval granularity
const EMBED_BATCH = 64;

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

// ---- HTTPS helper: byte-identical requestUrl from the deployed theo_add_project_knowledge_file (D1) ----
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

// ---- Phase D RAG indexing helpers reused from the deployed theo_index_messages B7b1 per the
// Walter-authorized composite: getAadToken + embedBatch byte-identical (EXACT); ensureIndex +
// upsertDocs adapted reuse (index name -> PK_SEARCH_INDEX / project field set) ----
function parseJsonSafe(raw) {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Client-credentials token for a given Azure resource scope (same AAD app as the gateway).
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

// PUT the index definition (create-or-update; idempotent). Vector field matches text-embedding-3-small (1536).
async function ensureIndex(searchToken) {
  const indexDef = {
    name: PK_SEARCH_INDEX,
    fields: [
      { name: "id", type: "Edm.String", key: true, filterable: true },
      { name: "knowledge_id", type: "Edm.String", filterable: true },
      { name: "project_id", type: "Edm.String", filterable: true },
      { name: "created_by", type: "Edm.String", filterable: true },
      { name: "title", type: "Edm.String", searchable: true },
      { name: "content", type: "Edm.String", searchable: true },
      { name: "chunk_index", type: "Edm.Int32", filterable: true, sortable: true },
      { name: "created_at", type: "Edm.DateTimeOffset", filterable: true, sortable: true },
      {
        name: "content_vector",
        type: "Collection(Edm.Single)",
        searchable: true,
        dimensions: 1536,
        vectorSearchProfile: "theo-vec-profile",
      },
    ],
    vectorSearch: {
      algorithms: [{ name: "theo-hnsw", kind: "hnsw" }],
      profiles: [{ name: "theo-vec-profile", algorithm: "theo-hnsw" }],
    },
  };
  const body = JSON.stringify(indexDef);
  const r = await requestUrl(
    `${SEARCH_ENDPOINT}/indexes/${encodeURIComponent(PK_SEARCH_INDEX)}?api-version=${SEARCH_API_VERSION}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${searchToken}`,
        "Content-Length": Buffer.byteLength(body),
      },
    },
    body
  );
  if (r.statusCode < 200 || r.statusCode >= 300) {
    throw new Error(`ensureIndex failed (HTTP ${r.statusCode}): ${r.body.slice(0, 300)}`);
  }
}

// Batch-embed an array of strings → array of 1536-d vectors (order preserved).
async function embedBatch(embedToken, inputs) {
  const body = JSON.stringify({ input: inputs });
  const r = await requestUrl(
    `${EMBED_ENDPOINT}/openai/deployments/${encodeURIComponent(EMBED_DEPLOYMENT)}/embeddings?api-version=${EMBED_API_VERSION}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${embedToken}`,
        "Content-Length": Buffer.byteLength(body),
      },
    },
    body
  );
  const payload = parseJsonSafe(r.body);
  if (r.statusCode < 200 || r.statusCode >= 300 || !payload || !Array.isArray(payload.data)) {
    throw new Error(`embedBatch failed (HTTP ${r.statusCode}): ${r.body.slice(0, 300)}`);
  }
  return payload.data
    .slice()
    .sort((a, b) => (a.index || 0) - (b.index || 0))
    .map((d) => d.embedding);
}

// Upsert documents into the index (mergeOrUpload).
async function upsertDocs(searchToken, docs) {
  const body = JSON.stringify({ value: docs.map((d) => ({ "@search.action": "mergeOrUpload", ...d })) });
  const r = await requestUrl(
    `${SEARCH_ENDPOINT}/indexes/${encodeURIComponent(PK_SEARCH_INDEX)}/docs/index?api-version=${SEARCH_API_VERSION}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${searchToken}`,
        "Content-Length": Buffer.byteLength(body),
      },
    },
    body
  );
  if (r.statusCode < 200 || r.statusCode >= 300) {
    throw new Error(`upsertDocs failed (HTTP ${r.statusCode}): ${r.body.slice(0, 300)}`);
  }
}

// Split large knowledge content into fixed-size chunks (retrieval granularity).
function chunkText(s) {
  const chunks = [];
  for (let i = 0; i < s.length; i += CHUNK_CHARS) chunks.push(s.slice(i, i + CHUNK_CHARS));
  return chunks.length ? chunks : [""];
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
    body = parseBody(req);
  } catch {
    return send(context, 400, errorBody("BAD_REQUEST", "Request body is not valid JSON.", 400));
  }

  // ---- Validate inputs before any SQL (deterministic 400s) ----
  const projectId = typeof body.project_id === "string" ? body.project_id.trim() : "";
  if (!isUuid(projectId)) {
    return send(context, 400, errorBody("INVALID_REQUEST", "Field 'project_id' is required and must be a valid UUID.", 400));
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (title === "") {
    return send(context, 400, errorBody("INVALID_REQUEST", "Field 'title' is required and must be a non-empty string.", 400));
  }
  if (title.length > TITLE_MAX_LEN) {
    return send(context, 400, errorBody("INVALID_REQUEST", `Field 'title' must be at most ${TITLE_MAX_LEN} characters.`, 400));
  }

  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (content === "") {
    return send(context, 400, errorBody("INVALID_REQUEST", "Field 'content' is required and must be a non-empty string.", 400));
  }
  if (content.length > CONTENT_MAX_LEN) {
    return send(context, 400, errorBody("INVALID_REQUEST", `Field 'content' must be at most ${CONTENT_MAX_LEN} characters.`, 400));
  }

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

    // FK ownership (the connection role bypasses RLS, so FK existence does NOT prove ownership):
    // the referenced project MUST belong to the caller, else 404 (no leakage).
    const owned = await client.query(
      `SELECT 1 FROM public.theo_projects WHERE id = $1 AND created_by = $2`,
      [projectId, oid]
    );
    if (owned.rowCount === 0) {
      throw buildKnownError("NOT_FOUND", "Project not found.", 404);
    }

    // created_by = the signed-in OID (explicit ownership; the connection role bypasses RLS).
    // source_type is fixed to 'text' (inline content); file-backed knowledge is a later microstep.
    const inserted = await client.query(
      `
      INSERT INTO public.theo_project_knowledge
        (created_by, project_id, title, source_type, content)
      VALUES ($1, $2, $3, 'text', $4)
      RETURNING
        id, project_id, title, source_type, content, created_at
      `,
      [oid, projectId, title, content]
    );

    await client.query("COMMIT");

    const knowledge = inserted.rows[0];

    // Phase D / D2 - best-effort on-ingest RAG indexing (NON-FATAL: an index failure NEVER fails the add;
    // the row is already committed). Byte-mirror of the deployed theo_add_project_knowledge_file (D1) on-ingest
    // indexer per the Walter-authorized composite; chunk stored text -> embed -> upsert one doc/chunk into the
    // project-knowledge index (created idempotently), scoped by project_id + created_by.
    try {
      if (EMBED_ENDPOINT && EMBED_DEPLOYMENT && SEARCH_ENDPOINT) {
        const chunks = chunkText(content);
        const [embedToken, searchToken] = await Promise.all([getAadToken(EMBED_SCOPE), getAadToken(SEARCH_SCOPE)]);
        await ensureIndex(searchToken);
        const vectors = [];
        for (let i = 0; i < chunks.length; i += EMBED_BATCH) {
          const vecs = await embedBatch(embedToken, chunks.slice(i, i + EMBED_BATCH));
          vectors.push(...vecs);
        }
        const docs = chunks.map((c, i) => ({
          id: `${knowledge.id}-${i}`,
          knowledge_id: knowledge.id,
          project_id: knowledge.project_id,
          created_by: oid,
          title: knowledge.title,
          content: c,
          chunk_index: i,
          created_at: knowledge.created_at,
          content_vector: vectors[i],
        }));
        await upsertDocs(searchToken, docs);
      }
    } catch (indexErr) {
      context.log.error("theo_add_project_knowledge: RAG indexing failed (non-fatal)", indexErr);
    }

    return send(context, 201, successBody({ knowledge }));
  } catch (err) {
    if (client) {
      try { await client.query("ROLLBACK"); } catch {}
    }

    context.log.error("theo_add_project_knowledge failed", err);

    if (err && err.code === "42501") {
      return send(context, 403, errorBody("FORBIDDEN", "You do not have permission to add knowledge to this project.", 403));
    }
    if (err && err.isKnown === true && typeof err.status === "number" && typeof err.code === "string") {
      return send(context, err.status, errorBody(err.code, err.message, err.status));
    }
    // FK violation: project_id absent or not owned.
    if (err && err.code === "23503") {
      return send(context, 404, errorBody("NOT_FOUND", "Project not found.", 404));
    }
    // CHECK violation (title non-blank or source_type), defensive (validated above).
    if (err && err.code === "23514") {
      return send(context, 400, errorBody("INVALID_REQUEST", "Knowledge item violates a field constraint.", 400));
    }

    return send(context, 500, errorBody("INTERNAL_SERVER_ERROR", "An unexpected error occurred.", 500));
  } finally {
    if (client) {
      client.release();
    }
  }
};
```

### §5.3 Primary Reference — `theo_add_project_knowledge` function.json (full verbatim)

```json
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["post", "options"],
      "route": "theo_add_project_knowledge"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

## §6 — The handler (`dottie_ask`)

Deployed to `vaultgpt-func-dottie` (Kudu-VFS, classic per-fn). `node --check` clean; `getAadToken`/`requestUrl`/`parseJsonSafe`/envelope byte-identical to the deployed primary reference. Full text:

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

### §6.1 function.json

```json
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["post", "options"],
      "route": "dottie_ask"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

## §7 — Golden Curls (Golden Handler §5.3; Claude runs post-deploy)

Authenticated `az` bearer (audience `api://4e1a1e31-5c20-4480-99e4-098901707d9e`, as wmansfield@vault-tax.com).

| # | Call | Expect |
| - | ---- | ------ |
| C1 | `POST /api/dottie_ask` `{ "prompt": "In one sentence, what is your role?" }` | **200** `{ data:{ answer:<non-empty gpt-5 text>, model, usage } }` — the live gpt-5 round-trip |
| C2 | `POST` `{ }` (no prompt) | **400** INVALID_REQUEST |
| C3 | `POST` (unauthenticated) | **401** UNAUTHORIZED |
| C4 | `OPTIONS /api/dottie_ask` | **204** |

C1 is the framing milestone — it proves the full chain: EasyAuth → client-credentials `getAadToken` → Azure OpenAI `gpt-5` → answer. **Note:** C1 confirms the exact gpt-5 chat/completions contract (`api-version`, `max_completion_tokens`, response shape); if the deployed `gpt-5` requires a different api-version or parameter, that is corrected at deploy-time before C1 is asserted green (the app settings + handler constants are the two tuning points), and the corrected values re-grounded.

## §8 — Gap Register

**PROCEED.** No missing CURRENT authority; no ESCALATE.
- **G-1 (gpt-5 exact API contract): PROCEED** — `chat/completions` + `max_completion_tokens` + `api-version=2025-01-01-preview` is the expected gpt-5-reasoning shape; the C1 golden curl confirms it live, and the api-version/param are the two documented tuning points if the deployed model differs. Non-blocking (deploy-time).
- **G-2 (governance ruleset — reading L1.5/L2/L3, drift/review-chain detection): PROCEED (out of scope, by design)** — Amendment 8 frame-first; this VEP is the connection only. The observational logic + its access-policy-engine-gated reads are follow-on VEPs as the layers populate.
- **G-3 (func-dottie deploy authority): PROCEED** — established for the `vault-dottie` repo by the quoted Walter authorization (the mirrored Orchestration Standard's app-list is Theo's; this new repo's deploy authority is Walter's direct program authorization + this Codex-APPROVED VEP).
- **G-APISPEC/DOC: PRE-LAND (Role-C, post-deploy)** — Dottie's API contract is recorded in the `vault-dottie` repo docs via Role-C after deploy + golden curls (a Dottie contract doc; no Theo API-Spec change). Disclosed; does not block Pass-2.

## §9 — Deploy plan (ordered; §1D)

1. **Codex Pass-2** → APPROVED/REJECTED.
2. **Claude** deploys `dottie_ask` to `vaultgpt-func-dottie` via **Kudu-VFS** (classic per-fn: PUT `dottie_ask/{index.js,function.json}`, GET-back diff, restart, syncfunctiontriggers), then runs the §7 golden curls (tuning the gpt-5 api-version/params at C1 if needed). **No migration.**
3. **Role-C** records the Dottie API contract in the `vault-dottie` docs.

## Codex activation note (Walter forwards)

```
Codex is activated for Pass-2 review of the Dottie dottie_ask backend, vault-dottie,
"Codex Governance/Dottie-Ask-Backend-Pass-1-VEP/Dottie_Ask_Backend_VEP.md".
Open your Pass-2 turn with a governance-bound Grounding Conformance Receipt + Rule Anchor Table (Theo
Grounding Conformance §3/§5 — the standards are mirrored into vault-dottie). This is a HANDLER-ONLY package
(no migration; Claude Kudu-VFS deploy to the Walter-authorized vaultgpt-func-dottie + golden curls). Review
for: (1) "copy what we've done for theo" — is getAadToken client-credentials + requestUrl + parseJsonSafe +
envelope + EasyAuth byte-identical to the deployed theo_add_project_knowledge primary reference (§5.1), and
is the Azure OpenAI chat/completions call a faithful ALLOWED-DELTA on the same token+HTTP idiom? (2) boundary
(§2) — this frames the connection only; NO L1 read, NO governance ruleset, NO Vault DB; Dottie is observational
and independent (gpt-5 vs Theo's Claude). (3) fail-closed — 401/400/502/500 mapping; the AAD secret is a KV
reference (no bytes on the app). (4) the func-dottie deploy authority — the mirrored Orchestration app-list is
Theo's; is the quoted Walter authorization an adequate deploy authority for this NEW repo's dedicated app?
(5) the deploy plan (§9) — Kudu-VFS to func-dottie, gpt-5 contract confirmed at the C1 golden curl, doc Role-C
deferred. Emit APPROVED or REJECTED only.
```
