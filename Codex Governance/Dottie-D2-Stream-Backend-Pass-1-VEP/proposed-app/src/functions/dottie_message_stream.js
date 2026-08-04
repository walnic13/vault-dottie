const { app } = require("@azure/functions");
const https = require("https");
const http = require("http");
const { Pool } = require("pg");
const { PassThrough } = require("node:stream");

// dottie_message_stream — Dottie's STREAMING send→reply→persist handler (Phase D2-Stream). The faithful
// Dottie port of the deployed Theo B9 streaming sidecar (theo_message_stream): v4 programming model with
// HTTP streaming, an SSE relay of the upstream model to the browser, and persistence of the full turn on
// stream completion (identical DB write to the buffered dottie_message → history/reload identical).
// Allowed deltas vs the Theo mechanism (Golden §4): (1) the model call is Azure OpenAI gpt-5 via the
// RESPONSES API (/openai/responses) with stream:true and client-credentials getAadToken — NOT Foundry-
// Anthropic (observer independence); (2) the relayed SSE + parse-for-persistence follow the OpenAI/Responses
// shape (choices[].delta.content) rather than Anthropic events; (3) internet grounding uses gpt-5's built-in
// server-side web_search tool, and image/video use model-callable find_image/find_video FUNCTION tools that
// reuse the deployed func-theo-tools handlers via a client-credentials call (Dottie has no user token to
// forward — see the Media tools block) — relayed to the FE as the vault_image/vault_video frames it already
// renders; the model is told not to paste URLs.
// Dottie-L1 relationship memory (dottie_user_memory) + conversation-scoped attachments (B8d/B8i) are injected.
// No history-RAG, no extended thinking, no project-sharing. Runs on the v4 sidecar vaultgpt-func-dottie-stream.

// HTTP streaming must be explicitly enabled in the v4 Node model (proven on Windows EP1 — Theo B9 Gate 2).
app.setup({ enableHttpStream: true });

const AZURE_OPENAI_ENDPOINT = (process.env.AZURE_OPENAI_ENDPOINT || "").replace(/\/+$/, "");
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-5";
const AZURE_OPENAI_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || "2025-01-01-preview";
// Internet grounding: gpt-5's built-in server-side web_search runs via the Azure OpenAI RESPONSES API
// (NOT chat/completions), enabled only for api-version >= 2025-03-01-preview. This is the gpt-5-native
// equivalent of Theo's Claude/Foundry web_search (arch §4.2) — search + citations, no SerpAPI tool-loop.
const RESPONSES_API_VERSION = process.env.AZURE_OPENAI_RESPONSES_API_VERSION || "2025-03-01-preview";
const OPENAI_SCOPE = "https://cognitiveservices.azure.com/.default";
const DEFAULT_MAX_COMPLETION_TOKENS = 8000;
const TITLE_MAX_LEN = 80;

const DOTTIE_SYSTEM_PROMPT = `You are Dottie, Vault's independent governance-and-second-opinion agent for a UK-based US tax advisory firm serving VC, PE and real-estate funds and their non-US corporations with US subsidiaries. Vault's professionals use you as a careful check on their work and a considered second opinion. You are deliberately independent of Theo (the primary assistant) — a more conservative voice. Your output is advisory and is reviewed before it is relied on. Accuracy and clear, auditable reasoning are your highest priority — above being comprehensive, fast, or agreeable.

GROUNDING — BE SPECIFIC AND HONEST ABOUT WHAT YOU CAN VERIFY
For any specific authority or figure — an IRC § (26 U.S.C.), a Treasury Reg (26 C.F.R.; note proposed/temporary/final), an IRS Notice/Revenue Ruling/Revenue Procedure, a case, a rate, threshold, dollar amount, deadline, or effective date — be precise, and NEVER fabricate a citation, section/ruling number, case, rate, or date. You do NOT currently have live web search, so you do not know anything current or time-varying (live results, prices, markets, breaking news, weather, "today/now/currently/latest/this week" anything). Do not state such a specific from memory, however confident it feels — say plainly "I don't have a verified source for that — confirm against [authority]" and stop. A fluent invented answer is the worst possible outcome, worse than "I can't verify that," because it reads exactly like a verified one.

DOCUMENTS THE USER PROVIDES — VERIFY, DON'T INFER
Any claim that a specific clause, section number, defined term, figure, party, or date is present, absent, or says X is a claim you MUST ground in the provided text: locate and quote (or precisely cite) the exact passage before asserting it. If you cannot find it, say "I can't locate that in the document text provided," and flag that the text may be incomplete. Never infer a document's contents, or that a provision is missing, from what typical documents contain. When the user challenges a claim ("are you sure?", "is that right?"), treat it as a signal to RE-VERIFY against the source, not to agree — do not flip your answer merely to be agreeable.

MATERIALITY FIRST — ANALYZE WHAT THE FACTS TRIGGER (NO RABBIT HOLES)
Lead with the transaction's form and intended tax treatment, then the primary consequences to each party, then the cross-border/anti-abuse overlays the facts clearly trigger, then remote/contingent overlays (brief and labeled). Before raising any special regime (FIRPTA/USRPHC, §1446(f), §367, §7874, PFIC, CFC/GILTI, Pillar 2, etc.): state its factual trigger in one line, check whether the facts show it, and if not, label it "not indicated by the facts — contingent overlay" and keep it a short aside. The space you give an issue should track its materiality to THESE facts. Where facts are silent you may offer a clearly-labeled prior, never a fact.

SHOW YOUR WORK (AUDITABLE)
For each substantive conclusion: the authority (precise cite) → what it says → how it applies to these facts → the conclusion. A reviewer should be able to trace every conclusion to its source; cite at the claim, not as a trailing list. State the facts and assumptions you relied on; if a needed fact is missing, ask or assume-and-flag. Mark confidence where it matters (high confidence / fact-dependent / low-probability absent more facts). Keep parties distinct — corporate parties, the selling fund/partnership, partner/LP consequences (US vs non-US), and the withholding agent's obligations.

SECOND OPINION & GOVERNANCE
When asked for a second opinion or a governance check, be candid and specific: say what you agree with, what you would challenge, what is missing, and the risk plainly — that is the value of an independent voice. You advise; you do not take actions on the user's behalf. You know the person you are speaking with from your own relationship memory (apply when relevant; do not recite it back).

TONE AND FORMAT
Warm, calm, precise, direct. Correct mistakes gently with explanation; do not people-please or agree just to be agreeable; no flattery; stay composed if the user is frustrated. Truth and clarity over soothing. Respond in clean Markdown: lead with the answer, then the support. Short questions get a short answer; complex ones get light structure (brief summary → details → next steps / what to verify). Format richly in clean Markdown by default: use ## / ### headings to structure any multi-part answer, **bold** for key terms and inline labels, bullet or numbered lists for enumerations, and tables for comparisons. Give even short answers light structure (a bold lead line, a few bullets); reserve a single unbroken paragraph only for a genuinely one-line reply. Be as concise as accuracy allows; give clear, human-readable reasoning — never dump raw chain-of-thought.`;

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

// ── Media tools (find_image / find_video) — model-callable gpt-5 Responses-API FUNCTION tools that reuse the
// deployed func-theo-tools handlers (SerpAPI image/video search; proxy-only URLs). DISTINCT from the built-in
// server-side web_search: these are client-side function tools this handler dispatches. Dottie calls
// func-theo-tools with a CLIENT-CREDENTIALS bearer for the tools audience (THEO_TOOLS_SCOPE) — the same
// client-credentials mechanism Dottie already uses for gpt-5 and Blob (an ALLOWED DELTA vs Theo's
// user-delegated forward: Dottie has no user token, so the tool runs under Dottie's app identity). Results are
// relayed to the FE as the vault_image / vault_video SSE frames the transplanted Theo FE already renders; the
// tool DESCRIPTIONS tell the model NOT to paste URLs. Media tools are offered only when THEO_TOOLS_SCOPE is
// configured (Never-Guess: the exact audience is set at deploy, never hard-coded here).
const TOOLS_BASE = (process.env.THEO_TOOLS_BASE || "https://vaultgpt-func-theo-tools.azurewebsites.net").replace(/\/+$/, "");
const TOOLS_SCOPE = process.env.THEO_TOOLS_SCOPE || "";
const MAX_TOOL_TURNS = parseInt(process.env.DOTTIE_MAX_TOOL_TURNS, 10) > 0 ? parseInt(process.env.DOTTIE_MAX_TOOL_TURNS, 10) : 8;
const MEDIA_TOOL_ROUTES = { find_image: "theo_find_image", find_video: "theo_find_video" };
const MEDIA_TOOLS = [
  {
    type: "function",
    name: "find_image",
    description:
      "Search the web for an image of a subject and display it to the user automatically as a gallery. Pass the FULL descriptive phrase as `subject`. The app renders the returned image(s) itself — DO NOT paste any URL or a markdown image into your reply; after calling, briefly say what you found. Optional `offset` (0-40) fetches a different result for the same subject.",
    parameters: {
      type: "object",
      properties: {
        subject: { type: "string", description: "Full descriptive phrase of the image to find (max 300 chars)." },
        offset: { type: "integer", minimum: 0, maximum: 40, description: "Result offset to fetch a different image for the same subject." },
      },
      required: ["subject"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "find_video",
    description:
      "Search the web for a video of a subject; the app plays it inline automatically (a YouTube embed, or a thumbnail link-card). Pass the FULL descriptive phrase as `subject`. DO NOT paste any URL — after calling, briefly say what you found.",
    parameters: {
      type: "object",
      properties: {
        subject: { type: "string", description: "Full descriptive phrase of the video to find (max 300 chars)." },
      },
      required: ["subject"],
      additionalProperties: false,
    },
  },
];

// ── TODO tools (create/list/update/complete) — model-callable gpt-5 Responses-API FUNCTION tools that reuse the
// deployed func-theo-tools theo_*_todo handlers (the cross-agent theo_todos store). Unlike the media tools
// (client-credentials), these run AS THE SIGNED-IN USER: the handler forwards the caller's own incoming bearer
// (func-dottie-stream + func-theo-tools share audience api://4e1a1e31-…), so created_by is the human. `agent`
// is fixed to "dottie" (which assistant authored). Results are relayed as text (no SSE frame). Always active
// (they need only the user bearer + TOOLS_BASE), independent of THEO_TOOLS_SCOPE.
const TODO_TOOL_ROUTES = { create_todo: "theo_create_todo", list_todos: "theo_list_todos", update_todo: "theo_update_todo", complete_todo: "theo_complete_todo" };
const TODO_TOOLS = [
  {
    type: "function",
    name: "create_todo",
    description:
      "Create a TODO / task item to show the user your work and track what needs doing (a check you raised, a document you need, a flag to clear). After creating it, briefly confirm what you captured (your text reply is how the user sees it — there is no separate task-list view yet). Set `agent` to \"dottie\". Include `project_id` ONLY when the task belongs to a specific project in context; omit it for a personal / standalone TODO. The owner is the signed-in user (handled automatically); do not pass any identity.",
    parameters: {
      type: "object",
      properties: {
        agent: { type: "string", enum: ["dottie"], description: "The authoring assistant — always \"dottie\" for tools you call." },
        title: { type: "string", description: "Short, action-oriented task title." },
        detail: { type: "string", description: "Optional longer description / notes." },
        project_id: { type: "string", description: "Optional project UUID when the task belongs to a specific project; omit for a personal TODO." },
      },
      required: ["agent", "title"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "list_todos",
    description:
      "List TODOs. With no arguments, returns the caller's own TODOs (personal + across projects). Pass `project_id` to list a specific project's TODOs, or `status` to filter (open / in_progress / done / cancelled). Use this to show the user their outstanding tasks or to find a TODO's id before updating or completing it.",
    parameters: {
      type: "object",
      properties: {
        project_id: { type: "string", description: "Optional project UUID to list that project's TODOs." },
        status: { type: "string", enum: ["open", "in_progress", "done", "cancelled"], description: "Optional status filter." },
      },
      required: [],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "update_todo",
    description:
      "Update one of your own TODOs by id — change its `title`, `detail`, or `status` (open / in_progress / done / cancelled). Provide at least one field to change. Get the id from list_todos first if you do not have it. To simply mark a task finished, prefer complete_todo.",
    parameters: {
      type: "object",
      properties: {
        id: { type: "string", description: "The TODO's UUID." },
        title: { type: "string", description: "New title." },
        detail: { type: "string", description: "New detail / notes." },
        status: { type: "string", enum: ["open", "in_progress", "done", "cancelled"], description: "New status." },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "complete_todo",
    description:
      "Mark one of your own TODOs done by id (sets status \"done\"). Get the id from list_todos if you do not have it.",
    parameters: {
      type: "object",
      properties: {
        id: { type: "string", description: "The TODO's UUID to complete." },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
];
const TOOLS_ENABLED = TOOLS_SCOPE !== "";
// web_search always; TODO tools always (user-bearer, no scope needed); media tools only when THEO_TOOLS_SCOPE set.
const ACTIVE_TOOLS = [{ type: "web_search" }, ...TODO_TOOLS, ...(TOOLS_ENABLED ? MEDIA_TOOLS : [])];

// Dispatch a media tool to func-theo-tools: POST {subject[,offset]} to /api/theo_find_* with the client-
// credentials bearer; unwrap the {data} envelope (mirrors Theo's dispatchChatTool). Never throws — returns
// {error} on any non-2xx / malformed response so the tool loop can feed it back to the model.
async function dispatchMediaTool(name, input, bearer) {
  const route = MEDIA_TOOL_ROUTES[name];
  if (!route) return { error: `unknown tool: ${name}` };
  const subject = typeof input.subject === "string" ? input.subject.slice(0, 300) : "";
  if (!subject.trim()) return { error: "subject is required" };
  const payload =
    name === "find_image" && Number.isInteger(input.offset)
      ? { subject, offset: Math.max(0, Math.min(40, input.offset)) }
      : { subject };
  const bodyStr = JSON.stringify(payload);
  let res;
  try {
    res = await requestUrl(
      `${TOOLS_BASE}/api/${route}`,
      { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${bearer}`, "Content-Length": Buffer.byteLength(bodyStr) } },
      bodyStr
    );
  } catch (e) {
    return { error: `tool call failed: ${String((e && e.message) || e)}` };
  }
  const parsed = parseJsonSafe(res.body);
  if (res.statusCode >= 200 && res.statusCode < 300 && parsed && parsed.data) return parsed.data;
  return { error: (parsed && parsed.error && parsed.error.message) || `tool call failed (HTTP ${res.statusCode})` };
}

// Dispatch a TODO tool to func-theo-tools with the USER's forwarded bearer (as-the-user — created_by is the
// human; the tool runs under the signed-in user, NOT Dottie's app identity). Posts the model's input verbatim
// (the deployed handler validates + rejects unknown keys). Never throws — returns {error} for the tool loop.
async function dispatchTodoTool(name, input, userBearer) {
  const route = TODO_TOOL_ROUTES[name];
  if (!route) return { error: `unknown tool: ${name}` };
  if (!userBearer) return { error: "no user token available to record the TODO as you" };
  const bodyStr = JSON.stringify(input && typeof input === "object" ? input : {});
  let res;
  try {
    res = await requestUrl(
      `${TOOLS_BASE}/api/${route}`,
      { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${userBearer}`, "Content-Length": Buffer.byteLength(bodyStr) } },
      bodyStr
    );
  } catch (e) {
    return { error: `tool call failed: ${String((e && e.message) || e)}` };
  }
  const parsed = parseJsonSafe(res.body);
  if (res.statusCode >= 200 && res.statusCode < 300 && parsed && parsed.data) return parsed.data;
  return { error: (parsed && parsed.error && parsed.error.message) || `tool call failed (HTTP ${res.statusCode})` };
}

// ── Attachment injection (B8d/B8i, gpt-5-adapted) ──────────────────────────────────────────────
// Structure mirrors the deployed theo_message_stream: owner-scoped fetch, strict-404, native-vs-extract
// dispatch (extract-class wins over a native media type), conversation-scoped message_seq keying + the
// B8i linkage. Content is ADAPTED for the gpt-5 Responses API — Claude {type:image|document|text} →
// {type:input_image|input_file|input_text}; NO cache_control (gpt-5 has none). Blob bytes read via the
// Function's system-assigned MI (Storage Blob Data Contributor on vaultgptdottiestore), same technique
// as the dottie attachment handlers. Per-message size/char budgets bound the upstream payload (mirrors
// Theo's ATTACH_*_BUDGET): an oversize native file or an over-budget extracted text (e.g. a bloated Excel
// CSV) is truncated/omitted with a note rather than blowing the model input (which returns an empty reply).
const ATTACH_MAX_COUNT = parseInt(process.env.DOTTIE_ATTACH_MAX_COUNT, 10) > 0 ? parseInt(process.env.DOTTIE_ATTACH_MAX_COUNT, 10) : 10;
const ATTACH_NATIVE_BUDGET_BYTES = parseInt(process.env.DOTTIE_ATTACH_NATIVE_BUDGET_BYTES, 10) > 0 ? parseInt(process.env.DOTTIE_ATTACH_NATIVE_BUDGET_BYTES, 10) : 14 * 1024 * 1024;
// 100000 (not Theo's 200000): gpt-5 is a reasoning model that returns an EMPTY reply when the input is
// very large (it spends its output budget reasoning), so the char budget is tuned below that failure zone.
const ATTACH_EXTRACT_BUDGET_CHARS = parseInt(process.env.DOTTIE_ATTACH_EXTRACT_BUDGET_CHARS, 10) > 0 ? parseInt(process.env.DOTTIE_ATTACH_EXTRACT_BUDGET_CHARS, 10) : 100000;
// Model per-image size guard (mirrors the Theo image-downscale fix): images whose long edge exceeds
// IMAGE_MAX_EDGE, or whose bytes exceed IMAGE_RESIZE_THRESHOLD_BYTES (~3.75MB), are downscaled + re-encoded
// before injection so a large phone photo no longer risks an upstream failure ("couldn't reach the
// assistant"). See prepareImageForModel. Defaults: 1568px long edge, 3,932,160-byte threshold.
const IMAGE_MAX_EDGE = parseInt(process.env.DOTTIE_IMAGE_MAX_EDGE, 10) > 0 ? parseInt(process.env.DOTTIE_IMAGE_MAX_EDGE, 10) : 1568;
const IMAGE_RESIZE_THRESHOLD_BYTES = parseInt(process.env.DOTTIE_IMAGE_RESIZE_THRESHOLD_BYTES, 10) > 0 ? parseInt(process.env.DOTTIE_IMAGE_RESIZE_THRESHOLD_BYTES, 10) : 3932160;
const ATTACH_STORAGE_ACCOUNT = process.env.DOTTIE_BLOB_ACCOUNT || "vaultgptdottiestore";
const ATTACH_STORAGE_CONTAINER = process.env.DOTTIE_BLOB_CONTAINER || "dottie-content";
const NATIVE_MEDIA_TYPES = {
  "application/pdf": "document",
  "image/png": "image",
  "image/jpeg": "image",
  "image/webp": "image",
  "image/gif": "image",
};

// Binary GET — collect Buffer chunks; must NOT string-coerce (binary safety).
function requestBinary(urlStr, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const lib = url.protocol === "http:" ? http : https;
    const req = lib.request(
      { method: options.method || "GET", hostname: url.hostname, port: url.port ? Number(url.port) : 443, path: url.pathname + url.search, headers: options.headers || {} },
      (res) => { const chunks = []; res.on("data", (c) => chunks.push(c)); res.on("end", () => resolve({ statusCode: res.statusCode || 0, headers: res.headers || {}, body: Buffer.concat(chunks) })); }
    );
    req.on("error", reject);
    req.end();
  });
}

// System-assigned MI token for Azure Storage (App Service MSI endpoint) — distinct from getAadToken
// (the client-credentials app used for gpt-5); blob reads use the Function's own MI.
async function getManagedIdentityAccessToken(resource) {
  const idEndpoint = process.env.IDENTITY_ENDPOINT;
  const idHeader = process.env.IDENTITY_HEADER;
  if (!idEndpoint || !idHeader) throw new Error("Managed identity endpoint not configured.");
  const u = `${idEndpoint}?resource=${encodeURIComponent(resource)}&api-version=2019-08-01`;
  const r = await requestUrl(u, { method: "GET", headers: { "X-IDENTITY-HEADER": idHeader } });
  const payload = parseJsonSafe(r.body);
  if (r.statusCode < 200 || r.statusCode >= 300 || !payload || !payload.access_token) throw new Error(`MI token failed (HTTP ${r.statusCode}).`);
  return payload.access_token;
}

function encodeBlobPath(blobKey) { return blobKey.split("/").map(encodeURIComponent).join("/"); }
function blobUrlFor(blobKey) { return `https://${ATTACH_STORAGE_ACCOUNT}.blob.core.windows.net/${ATTACH_STORAGE_CONTAINER}/${encodeBlobPath(blobKey)}`; }
async function downloadBlobBinary(token, blobKey) {
  const r = await requestBinary(blobUrlFor(blobKey), { method: "GET", headers: { Authorization: `Bearer ${token}`, "x-ms-version": "2022-11-02" } });
  if (r.statusCode < 200 || r.statusCode >= 300) throw new Error(`GET blob (binary) failed (HTTP ${r.statusCode}).`);
  return r.body;
}
async function downloadBlobText(token, blobKey) {
  const r = await requestUrl(blobUrlFor(blobKey), { method: "GET", headers: { Authorization: `Bearer ${token}`, "x-ms-version": "2022-11-02" } });
  if (r.statusCode < 200 || r.statusCode >= 300) throw new Error(`GET blob (text) failed (HTTP ${r.statusCode}).`);
  return r.body;
}

// Prepare an image buffer for the model: downscale the long edge to <= IMAGE_MAX_EDGE + re-encode ONLY when
// the image is oversized (dimensions or bytes), so a large photo fits the model's per-image limit. Small
// images pass through unchanged (media_type preserved). jimp is LAZY-REQUIRED (pure JS — no native binary;
// pinned to v0.x at deploy; loaded only when an image is actually resized). GIFs are not re-encoded (would
// break animation) — passed through when within budget, else skipped. Returns { data(base64), mediaType }
// or null on failure (caller degrades to a note; never throws). Mirrors the Theo prepareImageForModel.
async function prepareImageForModel(buf, contentType, context) {
  try {
    const oversizeBytes = buf.length > IMAGE_RESIZE_THRESHOLD_BYTES;
    if (contentType === "image/gif") {
      return oversizeBytes ? null : { data: buf.toString("base64"), mediaType: contentType };
    }
    const Jimp = require("jimp");
    const img = await Jimp.read(buf);
    const longEdge = Math.max(img.bitmap.width, img.bitmap.height);
    if (longEdge <= IMAGE_MAX_EDGE && !oversizeBytes) {
      return { data: buf.toString("base64"), mediaType: contentType };
    }
    if (longEdge > IMAGE_MAX_EDGE) img.scaleToFit(IMAGE_MAX_EDGE, IMAGE_MAX_EDGE);
    if (contentType === "image/png") {
      const png = await img.getBufferAsync(Jimp.MIME_PNG);
      if (png.length <= IMAGE_RESIZE_THRESHOLD_BYTES) return { data: png.toString("base64"), mediaType: "image/png" };
    }
    img.quality(82);
    const jpg = await img.getBufferAsync(Jimp.MIME_JPEG);
    return { data: jpg.toString("base64"), mediaType: "image/jpeg" };
  } catch (e) {
    context.error("dottie_message_stream: image prepare/resize failed (non-fatal)", e && e.message);
    return null;
  }
}

// gpt-5 Responses-API content PARTS for the owned attachment rows. image → input_image (data URI);
// native PDF → input_file (base64 file_data); extract-class → input_text (stored extracted text).
// Per-attachment failures degrade to a text note, never throw.
async function buildAttachmentParts(context, rows, budget) {
  if (!rows.length) return [];
  let storageToken;
  try { storageToken = await getManagedIdentityAccessToken("https://storage.azure.com/"); }
  catch (tokErr) { context.error("dottie_message_stream: storage token for attachments failed (non-fatal)", tokErr); return rows.map((r) => ({ type: "input_text", text: `[Attached file "${r.filename}" could not be loaded.]` })); }
  const parts = [];
  for (const row of rows) {
    const isExtractRow = row.ingestion_class === "extract"; // extract-class NEVER falls back to native
    const native = !isExtractRow && NATIVE_MEDIA_TYPES[row.content_type];
    try {
      if (native) {
        const buf = await downloadBlobBinary(storageToken, row.blob_path);
        // Images: downscale large ones to fit the model's per-image limit (a full-size phone photo otherwise
        // risks an upstream failure). PDFs inject as-is. Budget on the ACTUAL injected bytes (post-resize for
        // images) so a resized photo doesn't over-count against later attachments.
        let dataUri, injectBytes;
        if (native === "image") {
          const prepared = await prepareImageForModel(buf, row.content_type, context);
          if (!prepared) {
            parts.push({ type: "input_text", text: `[Attached image "${row.filename}" could not be prepared for the model (too large or unreadable) — ask the user to resize/compress it.]` });
            continue;
          }
          dataUri = `data:${prepared.mediaType};base64,${prepared.data}`;
          injectBytes = Math.ceil((prepared.data.length * 3) / 4); // base64 → bytes
        } else {
          dataUri = `data:${row.content_type};base64,${buf.toString("base64")}`; // native PDF
          injectBytes = buf.length;
        }
        if (budget.nativeBytes + injectBytes > ATTACH_NATIVE_BUDGET_BYTES) {
          parts.push({ type: "input_text", text: `[Attached file "${row.filename}" omitted — exceeds the per-message attachment size budget.]` });
          continue;
        }
        budget.nativeBytes += injectBytes;
        if (native === "image") parts.push({ type: "input_image", image_url: dataUri });
        else parts.push({ type: "input_file", filename: row.filename, file_data: dataUri }); // native PDF
        parts.push({ type: "input_text", text: `(above is the attached file "${row.filename}")` });
      } else if (isExtractRow && row.extracted_text_path) {
        const text = await downloadBlobText(storageToken, row.extracted_text_path);
        const remaining = ATTACH_EXTRACT_BUDGET_CHARS - budget.extractChars;
        if (remaining <= 0) {
          parts.push({ type: "input_text", text: `[Attached file "${row.filename}" omitted — exceeds the per-message extracted-text budget.]` });
          continue;
        }
        const clipped = text.length > remaining ? text.slice(0, remaining) + "\n…[truncated]" : text;
        budget.extractChars += clipped.length;
        parts.push({ type: "input_text", text: `Attached file "${row.filename}" (${row.content_type}):\n\n${clipped}` });
      } else {
        parts.push({ type: "input_text", text: `[Attached file "${row.filename}" (${row.content_type}) is stored but could not be read into this message.]` });
      }
    } catch (rowErr) {
      context.error("dottie_message_stream: attachment row failed (non-fatal)", rowErr);
      parts.push({ type: "input_text", text: `[Attached file "${row.filename}" could not be loaded.]` });
    }
  }
  return parts;
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
  const { oid, requestedConversationId, userText, acc, attachmentIds } = opts;
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

    // B8i: link this turn's attachments to the conversation + the user-turn seq (only if not already
    // homed, idempotent), so a reloaded thread rehydrates each chip on its originating message.
    if (attachmentIds && attachmentIds.length > 0) {
      await client.query(
        `UPDATE public.dottie_attachments SET conversation_id = $1, message_seq = $2 WHERE id = ANY($3::uuid[]) AND created_by = $4 AND conversation_id IS NULL`,
        [conversationId, baseSeq, attachmentIds, oid]
      );
    }

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
    // The signed-in user's own bearer (EasyAuth passes the incoming Authorization through). Forwarded to
    // func-theo-tools for the TODO tools so they run AS THE USER (created_by = the human; shared audience).
    const userBearer = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
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

    // attachment_ids (B8d): top-level field, separate from messages[]. Validate; this turn's attachments
    // attach to the last user turn. Dedup + strict uuid + ≤ ATTACH_MAX_COUNT.
    let attachmentIds = [];
    if (body.attachment_ids != null) {
      if (!Array.isArray(body.attachment_ids)) return jsonErr(400, "BAD_REQUEST", "Field 'attachment_ids' must be an array of UUIDs.");
      attachmentIds = [...new Set(body.attachment_ids)];
      if (attachmentIds.length > ATTACH_MAX_COUNT) return jsonErr(400, "BAD_REQUEST", `At most ${ATTACH_MAX_COUNT} attachments may be sent per message.`);
      if (!attachmentIds.every((id) => isUuid(id))) return jsonErr(400, "BAD_REQUEST", "Every entry in 'attachment_ids' must be a valid UUID.");
    }
    const lastUserIndex = (() => { for (let i = chatMessages.length - 1; i >= 0; i--) if (chatMessages[i].role === "user") return i; return -1; })();
    if (attachmentIds.length > 0 && lastUserIndex < 0) return jsonErr(400, "BAD_REQUEST", "Attachments require a user message.");

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
    const mediaToolNote = TOOLS_ENABLED
      ? "MEDIA DISPLAY: When the user asks to see an image or watch a video, call find_image or find_video with a full descriptive subject. The app displays the result automatically — do NOT paste any URL or a markdown image/link; after calling, briefly say what you found."
      : "";
    const todoToolNote =
      "TODOS: Use create_todo / list_todos / update_todo / complete_todo to track your work for the user (checks you raise, documents you need, flags to clear). Set agent to \"dottie\" when creating. The result is relayed to the user as text — briefly confirm what you did.";
    const effectiveSystem = [DOTTIE_SYSTEM_PROMPT, memoryBlock, systemPrompt, mediaToolNote, todoToolNote]
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

    // Conversation-scoped attachment injection (B8d/B8i), mirroring current Theo: prior turns' attachments
    // keyed by their message_seq + this turn's attachment_ids keyed to lastUserIndex; each turn's parts are
    // spliced onto ITS OWN user message so the historical context is stable across the conversation.
    let messagesForUpstream = chatMessages;
    {
      const rowsBySeq = new Map();
      let attClient = null;
      try {
        attClient = await pool.connect();
        await attClient.query(`SELECT set_config('app.current_user_id',$1,false), set_config('request.jwt.claim.sub',$1,false), set_config('request.jwt.claim.oid',$1,false)`, [oid]);
        if (requestedConversationId) {
          const prior = await attClient.query(
            `SELECT id, filename, content_type, byte_size, blob_container, blob_path, ingestion_class, extracted_text_path, message_seq
             FROM public.dottie_attachments WHERE conversation_id = $1 AND created_by = $2 AND message_seq IS NOT NULL
             ORDER BY message_seq, created_at`,
            [requestedConversationId, oid]
          );
          for (const r of prior.rows) { if (!rowsBySeq.has(r.message_seq)) rowsBySeq.set(r.message_seq, []); rowsBySeq.get(r.message_seq).push(r); }
        }
        if (attachmentIds.length > 0) {
          const res = await attClient.query(
            `SELECT id, filename, content_type, byte_size, blob_container, blob_path, ingestion_class, extracted_text_path
             FROM public.dottie_attachments WHERE id = ANY($1::uuid[]) AND created_by = $2`,
            [attachmentIds, oid]
          );
          if (res.rows.length !== attachmentIds.length) return jsonErr(404, "NOT_FOUND", "One or more attachments were not found.");
          const orderById = new Map(attachmentIds.map((id, i) => [id, i]));
          const cur = res.rows.sort((a, b) => orderById.get(a.id) - orderById.get(b.id));
          if (!rowsBySeq.has(lastUserIndex)) rowsBySeq.set(lastUserIndex, []);
          rowsBySeq.get(lastUserIndex).push(...cur);
        }
      } catch (attErr) {
        context.error("dottie_message_stream: attachment fetch failed", attErr);
        return jsonErr(500, "INTERNAL_SERVER_ERROR", "Failed to load attachments.");
      } finally { if (attClient) attClient.release(); }
      if (rowsBySeq.size > 0) {
        // One shared budget across ALL turns' attachments (the conversation-scoped injection re-injects
        // every prior turn's files each message, so a per-turn budget would still let N turns × the same
        // large file blow the input). Allocate the budget CURRENT-turn-first, then most-recent prior turns,
        // so the file the user is asking about keeps its content and only the oldest re-injected copies
        // truncate. Sequential (not Promise.all) so the shared counter is race-free.
        const attBudget = { nativeBytes: 0, extractChars: 0 };
        const order = [...rowsBySeq.keys()].sort((a, b) => (a === lastUserIndex ? -1 : b === lastUserIndex ? 1 : b - a));
        const partsByIndex = new Map();
        for (const i of order) {
          const rows = rowsBySeq.get(i);
          const m = chatMessages[i];
          if (!rows || rows.length === 0 || !m || m.role !== "user" || typeof m.content !== "string") continue;
          partsByIndex.set(i, await buildAttachmentParts(context, rows, attBudget));
        }
        messagesForUpstream = chatMessages.map((m, i) => {
          const attParts = partsByIndex.get(i);
          if (!attParts || attParts.length === 0) return m;
          return { ...m, content: [...attParts, { type: "input_text", text: m.content }] };
        });
      }
    }

    // ---- gpt-5 Responses API turn opener. `instructions` = the Dottie ruleset + memory; `input` = the chat
    // turns (+ attachment parts) on turn 1, then grows with function_call / function_call_output items on each
    // media-tool turn. `tools` = the built-in web_search PLUS (when THEO_TOOLS_SCOPE is set) the find_image/
    // find_video FUNCTION tools. The same client-credentials `token` is reused across turns. ----
    const openUpstream = (inputItems) =>
      new Promise((resolve) => {
        const payload = JSON.stringify({
          model: AZURE_OPENAI_DEPLOYMENT,
          instructions: effectiveSystem,
          input: inputItems,
          tools: ACTIVE_TOOLS,
          reasoning: { effort: "low" },
          max_output_tokens: Math.max(maxCompletionTokens, 16000),
          stream: true,
        });
        const u = new URL(`${AZURE_OPENAI_ENDPOINT}/openai/responses?api-version=${RESPONSES_API_VERSION}`);
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
              "Content-Length": Buffer.byteLength(payload),
              Accept: "text/event-stream",
            },
          },
          (res) => resolve(res)
        );
        r.on("error", (e) => {
          context.error("dottie_message_stream: upstream connect failed", e);
          resolve(null);
        });
        r.write(payload);
        r.end();
      });

    // Open the FIRST turn BEFORE committing to the stream, so a pre-stream non-2xx (429/5xx) surfaces as a
    // clean JSON error (not a mid-stream break) — unchanged from the single-shot path.
    let inputItems = messagesForUpstream;
    const firstRes = await openUpstream(inputItems);
    if (!firstRes) {
      return jsonErr(502, "BAD_GATEWAY", "Model gateway call failed.");
    }
    if (firstRes.statusCode < 200 || firstRes.statusCode >= 300) {
      const errText = await new Promise((res) => {
        let d = "";
        firstRes.setEncoding("utf8");
        firstRes.on("data", (c) => { d += c; });
        firstRes.on("end", () => res(d));
        firstRes.on("error", () => res(d));
      });
      context.error("dottie_message_stream: gateway non-2xx", firstRes.statusCode, errText.slice(0, 300));
      if (firstRes.statusCode === 429) {
        return jsonErr(429, "RATE_LIMITED", "Model gateway rate limit exceeded.");
      }
      return jsonErr(502, "BAD_GATEWAY", "Model gateway call failed.");
    }

    // ---- 2xx → stream. TRANSLATE the Responses-API event stream into the shape the FE already parses:
    // text deltas → OpenAI chat chunks ({choices:[{delta:{content}}]}); web-search AND media-tool activity →
    // tool / tool_result events (the activity indicator); media results → the vault_image / vault_video SSE
    // frames the FE already renders. When the model calls find_image/find_video, the tool is dispatched to
    // func-theo-tools and its result is fed back as a function_call_output so the model can continue the turn
    // (bounded by MAX_TOOL_TURNS). Answer text accumulates across turns for persistence. ----
    const stream = new PassThrough();
    let text = "";
    let respModel = AZURE_OPENAI_DEPLOYMENT;
    let searchOpen = 0;
    let toolsToken = null;
    const getToolsToken = async () => {
      if (!toolsToken) toolsToken = await getAadToken(TOOLS_SCOPE);
      return toolsToken;
    };

    // Consume one upstream response: translate its SSE to the FE and collect any media function calls the
    // model requested. Resolves on `end` with those calls (empty ⇒ the turn is final).
    const consumeTurn = (res) =>
      new Promise((resolve) => {
        let buf = "";
        const fcalls = [];
        const handleEvent = (block) => {
          const dataLine = block.split("\n").find((l) => l.startsWith("data:"));
          if (!dataLine) return;
          const json = parseJsonSafe(dataLine.slice(5).trim());
          if (!json || typeof json.type !== "string") return;
          switch (json.type) {
            case "response.output_text.delta":
              if (typeof json.delta === "string" && json.delta) {
                text += json.delta;
                stream.write(`data: ${JSON.stringify({ choices: [{ delta: { content: json.delta } }] })}\n\n`);
              }
              break;
            case "response.web_search_call.in_progress":
            case "response.web_search_call.searching":
              if (searchOpen === 0) stream.write(`event: tool\ndata: ${JSON.stringify({ name: "web_search", input: {} })}\n\n`);
              searchOpen += 1;
              break;
            case "response.web_search_call.completed":
              searchOpen = Math.max(0, searchOpen - 1);
              stream.write(`event: tool_result\ndata: ${JSON.stringify({ name: "web_search", ok: true })}\n\n`);
              break;
            case "response.output_item.added":
              // early activity indicator when the model opens a media function call
              if (json.item && json.item.type === "function_call" && (MEDIA_TOOL_ROUTES[json.item.name] || TODO_TOOL_ROUTES[json.item.name])) {
                stream.write(`event: tool\ndata: ${JSON.stringify({ name: json.item.name, input: {} })}\n\n`);
              }
              break;
            case "response.created":
            case "response.completed":
              if (json.response && typeof json.response.model === "string") respModel = json.response.model;
              if (json.type === "response.completed" && json.response && Array.isArray(json.response.output)) {
                for (const item of json.response.output) {
                  if (item && item.type === "function_call" && (MEDIA_TOOL_ROUTES[item.name] || TODO_TOOL_ROUTES[item.name])) {
                    fcalls.push({ call_id: item.call_id, name: item.name, arguments: item.arguments || "{}" });
                  }
                }
              }
              break;
            default:
              break;
          }
        };
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          buf += chunk;
          let idx;
          while ((idx = buf.indexOf("\n\n")) !== -1) {
            const block = buf.slice(0, idx);
            buf = buf.slice(idx + 2);
            if (block.trim() !== "") handleEvent(block);
          }
        });
        res.on("end", () => {
          if (buf.trim() !== "") handleEvent(buf);
          resolve(fcalls);
        });
        res.on("error", (e) => {
          context.error("dottie_message_stream: upstream stream error", e);
          try { stream.write(`event: vault_error\ndata: ${JSON.stringify({ message: "The model stream was interrupted." })}\n\n`); } catch {}
          resolve([]);
        });
      });

    // Media tool-loop driver: consume the first turn, and while the model requests find_image/find_video,
    // dispatch each to func-theo-tools, emit the vault_image/vault_video frame, feed the result back as a
    // function_call_output, and re-open the turn — bounded by MAX_TOOL_TURNS. Persist on completion.
    (async () => {
      try {
        let res = firstRes;
        for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
          const fcalls = await consumeTurn(res);
          if (fcalls.length === 0) break;
          // Media tools use the client-credentials token (fetched lazily — only if a media call is present);
          // TODO tools use the forwarded USER bearer (as-the-user). A media-token failure disables only the
          // media calls this turn; TODO calls still proceed.
          let mediaBearer = null;
          if (fcalls.some((fc) => MEDIA_TOOL_ROUTES[fc.name])) {
            try {
              mediaBearer = await getToolsToken();
            } catch (tokErr) {
              context.error("dottie_message_stream: media tools token failed", tokErr);
              mediaBearer = null;
            }
          }
          for (const fc of fcalls) {
            inputItems = inputItems.concat([{ type: "function_call", call_id: fc.call_id, name: fc.name, arguments: fc.arguments }]);
            const args = parseJsonSafe(fc.arguments) || {};
            let out;
            try {
              if (TODO_TOOL_ROUTES[fc.name]) {
                out = await dispatchTodoTool(fc.name, args, userBearer);
              } else if (!mediaBearer) {
                out = { error: "media tool unavailable (no gateway token)" };
              } else {
                out = await dispatchMediaTool(fc.name, args, mediaBearer);
              }
            } catch (e) {
              out = { error: String((e && e.message) || e) };
            }
            stream.write(`event: tool_result\ndata: ${JSON.stringify({ name: fc.name, ok: !(out && out.error) })}\n\n`);
            if (fc.name === "find_image" && out && typeof out.imageUrl === "string" && out.imageUrl.startsWith("https://")) {
              stream.write(`event: vault_image\ndata: ${JSON.stringify({ url: out.imageUrl, title: out.title, source: out.source, pageUrl: out.pageUrl, license: out.license, creator: out.creator, images: out.images })}\n\n`);
            } else if (fc.name === "find_video" && out && typeof out.videoUrl === "string" && out.videoUrl.startsWith("https://")) {
              stream.write(`event: vault_video\ndata: ${JSON.stringify({ videoUrl: out.videoUrl, embedUrl: out.embedUrl, title: out.title, thumbnail: out.thumbnail, source: out.source, duration: out.duration, date: out.date })}\n\n`);
            }
            inputItems = inputItems.concat([{ type: "function_call_output", call_id: fc.call_id, output: JSON.stringify(out) }]);
          }
          const next = await openUpstream(inputItems);
          if (!next) {
            stream.write(`event: vault_error\ndata: ${JSON.stringify({ message: "The model stream was interrupted." })}\n\n`);
            break;
          }
          if (next.statusCode < 200 || next.statusCode >= 300) {
            context.error("dottie_message_stream: gateway non-2xx (tool-loop turn)", next.statusCode);
            stream.write(`event: vault_error\ndata: ${JSON.stringify({ message: "The model stream was interrupted." })}\n\n`);
            break;
          }
          res = next;
        }
      } catch (driveErr) {
        context.error("dottie_message_stream: tool-loop driver error", driveErr);
        try { stream.write(`event: vault_error\ndata: ${JSON.stringify({ message: "The model stream was interrupted." })}\n\n`); } catch {}
      } finally {
        let conversationId = null;
        try {
          conversationId = await persistTurn({ oid, requestedConversationId, userText, acc: { text, model: respModel }, attachmentIds });
          stream.write(`event: vault_meta\ndata: ${JSON.stringify({ conversation_id: conversationId, model: respModel })}\n\n`);
        } catch (perr) {
          context.error("dottie_message_stream: persistence failed (answer already streamed)", perr);
          stream.write(`event: vault_meta\ndata: ${JSON.stringify({ conversation_id: null, persisted: false })}\n\n`);
        } finally {
          stream.end();
        }
      }
    })();

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
