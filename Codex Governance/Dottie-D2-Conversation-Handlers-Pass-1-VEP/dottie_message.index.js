const https = require("https");
const http = require("http");
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
    const lib = url.protocol === "http:" ? http : https;

    const req = lib.request(
      {
        method: options.method || "GET",
        hostname: url.hostname,
        port: url.port ? Number(url.port) : (url.protocol === "http:" ? 80 : 443),
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

// ── Attachment injection (B8d/B8i, gpt-5 chat/completions) ─────────────────────────────────────
// Structure mirrors the deployed theo_message (owner-scoped fetch, strict-404, native-vs-extract
// dispatch, conversation-scoped message_seq keying + B8i linkage). Content is in gpt-5 CHAT/COMPLETIONS
// part shape (this buffered path uses chat/completions, not the Responses API): image → {type:image_url,
// image_url:{url}}; extract-class → {type:text}. Native PDFs have no chat/completions content part → a
// note (the streaming path reads PDFs via input_file). Blob bytes via the Function MI. Per-message
// size/char budgets bound the upstream payload (mirrors Theo's ATTACH_*_BUDGET): an oversize image or an
// over-budget extracted text (e.g. a bloated Excel CSV) is truncated/omitted with a note rather than
// blowing the model input (which returns an empty reply).
const ATTACH_MAX_COUNT = parseInt(process.env.DOTTIE_ATTACH_MAX_COUNT, 10) > 0 ? parseInt(process.env.DOTTIE_ATTACH_MAX_COUNT, 10) : 10;
const ATTACH_NATIVE_BUDGET_BYTES = parseInt(process.env.DOTTIE_ATTACH_NATIVE_BUDGET_BYTES, 10) > 0 ? parseInt(process.env.DOTTIE_ATTACH_NATIVE_BUDGET_BYTES, 10) : 14 * 1024 * 1024;
// 100000 (not Theo's 200000): gpt-5 is a reasoning model that returns an EMPTY reply when the input is
// very large (it spends its output budget reasoning), so the char budget is tuned below that failure zone.
const ATTACH_EXTRACT_BUDGET_CHARS = parseInt(process.env.DOTTIE_ATTACH_EXTRACT_BUDGET_CHARS, 10) > 0 ? parseInt(process.env.DOTTIE_ATTACH_EXTRACT_BUDGET_CHARS, 10) : 100000;
const ATTACH_STORAGE_ACCOUNT = process.env.DOTTIE_BLOB_ACCOUNT || "vaultgptdottiestore";
const ATTACH_STORAGE_CONTAINER = process.env.DOTTIE_BLOB_CONTAINER || "dottie-content";
const NATIVE_MEDIA_TYPES = { "application/pdf": "document", "image/png": "image", "image/jpeg": "image", "image/webp": "image", "image/gif": "image" };

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
async function buildAttachmentParts(context, rows, budget) {
  if (!rows.length) return [];
  let storageToken;
  try { storageToken = await getManagedIdentityAccessToken("https://storage.azure.com/"); }
  catch (tokErr) { context.log.error("dottie_message: storage token for attachments failed (non-fatal)", tokErr); return rows.map((r) => ({ type: "text", text: `[Attached file "${r.filename}" could not be loaded.]` })); }
  const parts = [];
  for (const row of rows) {
    const isExtractRow = row.ingestion_class === "extract";
    const native = !isExtractRow && NATIVE_MEDIA_TYPES[row.content_type];
    try {
      if (native === "image") {
        const buf = await downloadBlobBinary(storageToken, row.blob_path);
        if (budget.nativeBytes + buf.length > ATTACH_NATIVE_BUDGET_BYTES) {
          parts.push({ type: "text", text: `[Attached file "${row.filename}" omitted — exceeds the per-message attachment size budget.]` });
          continue;
        }
        budget.nativeBytes += buf.length;
        parts.push({ type: "image_url", image_url: { url: `data:${row.content_type};base64,${buf.toString("base64")}` } });
        parts.push({ type: "text", text: `(above is the attached file "${row.filename}")` });
      } else if (isExtractRow && row.extracted_text_path) {
        const text = await downloadBlobText(storageToken, row.extracted_text_path);
        const remaining = ATTACH_EXTRACT_BUDGET_CHARS - budget.extractChars;
        if (remaining <= 0) {
          parts.push({ type: "text", text: `[Attached file "${row.filename}" omitted — exceeds the per-message extracted-text budget.]` });
          continue;
        }
        const clipped = text.length > remaining ? text.slice(0, remaining) + "\n…[truncated]" : text;
        budget.extractChars += clipped.length;
        parts.push({ type: "text", text: `Attached file "${row.filename}" (${row.content_type}):\n\n${clipped}` });
      } else {
        parts.push({ type: "text", text: `[Attached file "${row.filename}" (${row.content_type}) could not be read into this message on the non-streaming path.]` });
      }
    } catch (rowErr) {
      context.log.error("dottie_message: attachment row failed (non-fatal)", rowErr);
      parts.push({ type: "text", text: `[Attached file "${row.filename}" could not be loaded.]` });
    }
  }
  return parts;
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

  // attachment_ids (B8d): top-level field; dedup + strict uuid + ≤ ATTACH_MAX_COUNT; attach to last user turn.
  let attachmentIds = [];
  if (body.attachment_ids != null) {
    if (!Array.isArray(body.attachment_ids)) return send(context, 400, errorBody("BAD_REQUEST", "Field 'attachment_ids' must be an array of UUIDs.", 400));
    attachmentIds = [...new Set(body.attachment_ids)];
    if (attachmentIds.length > ATTACH_MAX_COUNT) return send(context, 400, errorBody("BAD_REQUEST", `At most ${ATTACH_MAX_COUNT} attachments may be sent per message.`, 400));
    if (!attachmentIds.every((id) => isUuid(id))) return send(context, 400, errorBody("BAD_REQUEST", "Every entry in 'attachment_ids' must be a valid UUID.", 400));
  }
  const lastUserIndex = (() => { for (let i = chatMessages.length - 1; i >= 0; i--) if (chatMessages[i].role === "user") return i; return -1; })();
  if (attachmentIds.length > 0 && lastUserIndex < 0) return send(context, 400, errorBody("BAD_REQUEST", "Attachments require a user message.", 400));

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

  // Conversation-scoped attachment injection (B8d/B8i), mirroring current Theo (chat/completions parts):
  // prior turns' attachments keyed by message_seq + this turn's attachment_ids at lastUserIndex; each
  // spliced onto its own user message.
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
           FROM public.dottie_attachments WHERE conversation_id = $1 AND created_by = $2 AND message_seq IS NOT NULL ORDER BY message_seq, created_at`,
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
        if (res.rows.length !== attachmentIds.length) return send(context, 404, errorBody("NOT_FOUND", "One or more attachments were not found.", 404));
        const orderById = new Map(attachmentIds.map((id, i) => [id, i]));
        const cur = res.rows.sort((a, b) => orderById.get(a.id) - orderById.get(b.id));
        if (!rowsBySeq.has(lastUserIndex)) rowsBySeq.set(lastUserIndex, []);
        rowsBySeq.get(lastUserIndex).push(...cur);
      }
    } catch (attErr) {
      context.log.error("dottie_message: attachment fetch failed", attErr);
      return send(context, 500, errorBody("INTERNAL_SERVER_ERROR", "Failed to load attachments.", 500));
    } finally { if (attClient) attClient.release(); }
    if (rowsBySeq.size > 0) {
      // One shared budget across ALL turns' attachments (conversation-scoped injection re-injects every
      // prior turn's files each message; a per-turn budget would still let N turns × the same large file
      // blow the input). Allocate CURRENT-turn-first, then most-recent prior turns, so the file the user
      // is asking about keeps its content and only the oldest re-injected copies truncate. Sequential so
      // the shared counter is race-free.
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
        return { ...m, content: [...attParts, { type: "text", text: m.content }] };
      });
    }
  }

  let client = null;
  try {
    const token = await getAadToken(OPENAI_SCOPE);

    const upstreamPayload = JSON.stringify({
      messages: [{ role: "system", content: effectiveSystem }, ...messagesForUpstream],
      max_completion_tokens: maxCompletionTokens,
      reasoning_effort: "low",
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

    // B8i: link this turn's attachments to the conversation + user-turn seq (idempotent, only if not
    // already homed), so a reloaded thread rehydrates each chip on its originating message.
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
