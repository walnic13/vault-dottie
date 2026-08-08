const { app } = require("@azure/functions");
const https = require("https");
const http = require("http");
const { PassThrough } = require("node:stream");
const XLSX = require("xlsx");

// Load-once deterministic engine (bundled byte-verbatim from the DEPLOYED sigma engine). We reuse its
// dispatch(name, input, ctx) against ONE in-memory workbook ctx — so all tool calls across all exceptions
// run without re-loading the workbooks (the "load once" goal). We run our OWN streaming loop, not runReviewLoop.
const { dispatch } = require("../engine/tool-loop");

// HTTP streaming (v4 Node model). The func-dottie-stream sidecar already enables this for
// dottie_message_stream; app.setup is idempotent.
app.setup({ enableHttpStream: true });

// Dottie's model is gpt-5 (Azure OpenAI Responses API) — deliberately DIFFERENT from Theo's Claude
// (governance-observer independence). Env mirrors dottie_message_stream on this same sidecar.
const AZURE_OPENAI_ENDPOINT = (process.env.AZURE_OPENAI_ENDPOINT || "").replace(/\/+$/, "");
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-5";
const RESPONSES_API_VERSION = process.env.AZURE_OPENAI_RESPONSES_API_VERSION || "2025-03-01-preview";
const OPENAI_SCOPE = "https://cognitiveservices.azure.com/.default";
const DMS_API_BASE_URL = process.env.DMS_API_BASE_URL || "https://vaultgpt-func-dms.azurewebsites.net";
const SIGMA_API_BASE_URL = process.env.SIGMA_API_BASE_URL || "https://vaultgpt-func-sigma.azurewebsites.net";
const REQUIRED_ROLES = ["input", "output"];
const OPTIONAL_ROLES = ["tables", "dataconn"];
const MAX_TOOL_TURNS = parseInt(process.env.DOTTIE_ADJUDICATE_MAX_TOOL_TURNS, 10) > 0 ? parseInt(process.env.DOTTIE_ADJUDICATE_MAX_TOOL_TURNS, 10) : 10;
const DEFAULT_MAX_OUTPUT_TOKENS = 16000;
const RESPONSES_MAX_RETRIES = 4;             // 429/503 backoff attempts per turn
const RESPONSES_BACKOFF_CAP_MS = 30000;

// The six deterministic tools exposed to gpt-5 (engine tool-loop.js TOOL_SCHEMAS, Responses function-tool
// shape). review-scoped ctx is server-side; the model only supplies tool input. Byte-parallel to the
// buffered dottie_adjudicate SIGMA_TOOLS.
const WB_ENUM = ["input", "output", "tables", "dataconn"];
const SIGMA_TOOLS = [
  { type: "function", name: "find_label", description: "Locate a cell by its label text on a sheet (anchor by meaning, not a fixed address).",
    parameters: { type: "object", properties: { workbook: { type: "string", enum: WB_ENUM, description: "which workbook; defaults to output" }, sheet: { type: "string" }, text: { type: "string" } }, required: ["sheet", "text"], additionalProperties: false } },
  { type: "function", name: "get_range", description: "Read column values (+ formulas) for a sheet region.",
    parameters: { type: "object", properties: { workbook: { type: "string", enum: WB_ENUM, description: "which workbook; defaults to output" }, sheet: { type: "string" }, col: { type: "integer" }, rowStart: { type: "integer" }, rowEnd: { type: "integer" } }, required: ["sheet", "col", "rowStart", "rowEnd"], additionalProperties: false } },
  { type: "function", name: "tie_out", description: "Compare two amounts within tolerance ($1 default). Returns {delta, pass}.",
    parameters: { type: "object", properties: { a: { type: "number" }, b: { type: "number" }, tol: { type: "number" } }, required: ["a", "b"], additionalProperties: false } },
  { type: "function", name: "k1_box_tie", description: "Σ each K-1 box across partners vs the Schedule K total.",
    parameters: { type: "object", properties: {}, additionalProperties: false } },
  { type: "function", name: "scan_external_links", description: "List external-workbook links (integrity).",
    parameters: { type: "object", properties: { workbook: { type: "string", enum: WB_ENUM } }, additionalProperties: false } },
  { type: "function", name: "scan_errors", description: "List #REF!/#N/A/error cells.",
    parameters: { type: "object", properties: { workbook: { type: "string", enum: WB_ENUM } }, additionalProperties: false } },
];
const GOV_TOOL_NAMES = new Set(SIGMA_TOOLS.map((t) => t.name));

// Dottie's adjudication persona + the [[CHECK]] emit contract (matches the deployed parseCheck/CheckData).
// Byte-parallel to the buffered dottie_adjudicate ADJUDICATION_SYSTEM_PROMPT; ONE [[CHECK]] block per turn.
const ADJUDICATION_SYSTEM_PROMPT =
  "You are Dottie, the independent governance observer for Vault. You are the check-on-the-checker: you adjudicate a " +
  "review's claims by INDEPENDENTLY re-deriving them, and your output is advisory (the human reviewer's counter-sign " +
  "remains the authoritative gate). You are deliberately independent of the assistants that produced the content.\n\n" +
  "TASK: adjudicate whether a flagged exception has been genuinely cleared. Do NOT trust the recorded numbers — " +
  "re-derive the figure yourself from the workbooks using the tools (find_label to anchor a labelled cell, get_range " +
  "to read the underlying values, tie_out to compare two amounts within tolerance, k1_box_tie / scan_external_links / " +
  "scan_errors as relevant). The tools do ALL arithmetic; you orchestrate and judge. Call tools as needed, then stop " +
  "calling tools and give your verdict. If a tool returns an error, say so plainly and lower your confidence rather " +
  "than guessing.\n\n" +
  "STRUCTURED GOVERNANCE OUTPUT — THE [[CHECK]] BLOCK\n" +
  "Emit your verdict as EXACTLY ONE machine-readable block and nothing else — no prose before or after it:\n" +
  "[[CHECK]]{ ...single JSON object... }[[/CHECK]]\n" +
  "The JSON object's fields:\n" +
  "- \"verdict\": \"concur\" | \"caution\" | \"challenge\" — REQUIRED (this is an adjudication). concur = the clearance " +
  "holds on your independent re-derivation; caution = it may hold but needs support/you could not fully verify; " +
  "challenge = your re-derivation contradicts the clearance.\n" +
  "- \"claim\": { \"source\": \"Theo · <control_id>\", \"text\": \"the exact assertion being judged\" } (required).\n" +
  "- \"lead\": one clear sentence giving your verdict in plain terms (REQUIRED).\n" +
  "- \"support\": ordered array of { \"label\", \"body\", \"cites\" } steps showing your re-derivation; \"cites\" is an " +
  "array of precise strings (cell addresses, tie-out deltas), omit when a step has none.\n" +
  "- \"conclusion\": the actionable bottom line for the reviewer (REQUIRED).\n" +
  "- \"flags\": array of assumption/risk strings; use [] if none.\n" +
  "- \"confidence\": { \"level\": a number 0..1, \"label\": \"high\" | \"fact-dependent\" | \"low\" }.\n" +
  "- \"docs\": array of documents needed before the conclusion can be relied on; use [] if none.\n" +
  "The block MUST be valid JSON: double-quoted keys and strings, no trailing commas, newlines inside a string escaped as \\n.";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-ms-client-principal, x-ms-token-aad-access-token",
};
const sseHeaders = { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "X-Accel-Buffering": "no" };

function nowIso() { return new Date().toISOString(); }
function jsonErr(status, code, message) {
  return { status, headers: { ...corsHeaders, "Content-Type": "application/json" }, jsonBody: { error: { code, message, status, timestamp: nowIso() } } };
}
function parseJsonSafe(raw) { if (typeof raw !== "string" || raw.trim() === "") return null; try { return JSON.parse(raw); } catch { return null; } }
function getPrincipal(request) {
  const raw = request.headers.get("x-ms-client-principal");
  if (!raw || typeof raw !== "string") return null;
  try { return JSON.parse(Buffer.from(raw, "base64").toString("utf8")); } catch { return null; }
}
function getClaimValue(principal, claimTypes) {
  if (!principal || !Array.isArray(principal.claims)) return null;
  for (const t of claimTypes) { const m = principal.claims.find((c) => c.typ === t); if (m && typeof m.val === "string" && m.val.trim()) return m.val.trim(); }
  return null;
}
function getOboInputToken(request) {
  const raw = request.headers.get("authorization");
  const m = raw && typeof raw === "string" ? raw.match(/^Bearer\s+(.+)$/i) : null;
  if (m && m[1]) return m[1].trim();
  const store = request.headers.get("x-ms-token-aad-access-token");
  if (typeof store === "string" && store.trim() !== "") return store.trim();
  return null;
}
function isUuid(v) { return typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v); }
function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

// ---- https helpers (byte-parallel to sigma_review_agent_stream) ----
function httpsRequest(urlStr, { method, headers }, bodyStr) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const lib = u.protocol === "http:" ? http : https;
    const r = lib.request({ method, hostname: u.hostname, port: u.port ? Number(u.port) : 443, path: u.pathname + u.search, headers }, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve({ status: res.statusCode || 0, body: Buffer.concat(chunks) }));
    });
    r.on("error", reject);
    if (bodyStr) r.write(bodyStr);
    r.end();
  });
}
async function getAadToken(scope) {
  const form = new URLSearchParams({
    client_id: process.env.AAD_CLIENT_ID, client_secret: process.env.AAD_CLIENT_SECRET,
    grant_type: "client_credentials", scope,
  }).toString();
  const { status, body } = await httpsRequest(`https://login.microsoftonline.com/${process.env.AAD_TENANT_ID}/oauth2/v2.0/token`,
    { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", "Content-Length": Buffer.byteLength(form) } }, form);
  let json = null; try { json = JSON.parse(body.toString("utf8")); } catch {}
  if (status < 200 || status >= 300 || !json || !json.access_token) throw new Error("gpt-5 token acquisition failed");
  return json.access_token;
}
async function dmsReadFile(driveId, itemId, token) {
  const url = new URL(`${DMS_API_BASE_URL}/api/dms_read_file`);
  url.searchParams.set("driveId", driveId); url.searchParams.set("itemId", itemId);
  const { status, body } = await httpsRequest(url.toString(), { method: "GET", headers: { Authorization: `Bearer ${token}`, "x-ms-token-aad-access-token": token } });
  return status >= 200 && status < 300 ? body : null;
}
async function sigmaGetReview(reviewId, token) {
  const url = new URL(`${SIGMA_API_BASE_URL}/api/sigma_get_review`);
  url.searchParams.set("reviewId", reviewId);
  const { status, body } = await httpsRequest(url.toString(), { method: "GET", headers: { Authorization: `Bearer ${token}`, "x-ms-token-aad-access-token": token } });
  let json = null; try { json = JSON.parse(body.toString("utf8")); } catch {}
  return { status, data: json && json.data ? json.data : null };
}

const CHECK_BLOCK_RE = /\[\[CHECK\]\]\s*([\s\S]*?)\s*\[\[\/CHECK\]\]/;
const VERDICTS = new Set(["concur", "caution", "challenge"]);
// Extract the one [[CHECK]] block's JSON, fail-closed: requires non-empty lead AND verdict ∈ enum.
function extractVerdictPayload(text) {
  if (typeof text !== "string") return null;
  const m = text.match(CHECK_BLOCK_RE);
  if (!m) return null;
  const obj = parseJsonSafe(m[1]);
  if (!obj || typeof obj !== "object") return null;
  if (typeof obj.lead !== "string" || !obj.lead.trim()) return null;
  if (typeof obj.verdict !== "string" || !VERDICTS.has(obj.verdict)) return null;
  return obj;
}

// Open ONE streaming gpt-5 Responses turn; resolves the raw SSE response stream (or {res:null,status}).
// `useTools` false omits the catalog (final forcing turn). Retries 429/503 (honor Retry-After, else backoff).
function openResponsesStream(reqObj, token) {
  const payload = JSON.stringify(reqObj);
  const u = new URL(`${AZURE_OPENAI_ENDPOINT}/openai/responses?api-version=${RESPONSES_API_VERSION}`);
  return new Promise((resolve) => {
    const lib = u.protocol === "http:" ? http : https;
    const r = lib.request({ method: "POST", hostname: u.hostname, port: u.port ? Number(u.port) : 443, path: u.pathname + u.search,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "Content-Length": Buffer.byteLength(payload), Accept: "text/event-stream" } },
      (res) => resolve(res));
    r.on("error", () => resolve(null));
    r.write(payload); r.end();
  });
}
function buildResponsesReq(inputItems, useTools) {
  const reqObj = {
    model: AZURE_OPENAI_DEPLOYMENT,
    instructions: ADJUDICATION_SYSTEM_PROMPT,
    input: inputItems,
    reasoning: { effort: "medium", summary: "auto" }, // summary:"auto" ⇒ gpt-5 streams reasoning_summary deltas (the "thinking")
    max_output_tokens: DEFAULT_MAX_OUTPUT_TOKENS,
    stream: true,
  };
  if (useTools) reqObj.tools = SIGMA_TOOLS;
  return reqObj;
}
// Open a turn with 429/503 retry-backoff; returns { res, status } (res is the SSE stream on success).
async function openTurnWithRetry(inputItems, useTools, token) {
  for (let attempt = 0; attempt <= RESPONSES_MAX_RETRIES; attempt++) {
    const res = await openResponsesStream(buildResponsesReq(inputItems, useTools), token);
    const status = res ? res.statusCode || 0 : 0;
    if (res && status >= 200 && status < 300) return { res, status };
    if ((status === 429 || status === 503) && attempt < RESPONSES_MAX_RETRIES) {
      let raSec = NaN;
      try { raSec = parseInt(res.headers && (res.headers["retry-after"] || res.headers["Retry-After"]), 10); } catch {}
      if (res) res.resume(); // drain
      const delayMs = Number.isFinite(raSec) && raSec > 0 ? Math.min(raSec * 1000, RESPONSES_BACKOFF_CAP_MS) : Math.min(1000 * Math.pow(2, attempt), RESPONSES_BACKOFF_CAP_MS);
      await sleep(delayMs);
      continue;
    }
    if (res) res.resume();
    return { res: null, status };
  }
  return { res: null, status: 0 };
}

// Relay ONE gpt-5 Responses turn: parse the upstream SSE, forward text + reasoning("thinking") deltas to the
// client as our clean event protocol, emit tool activity, and collect function_call items + assistant text.
// Resolves { fcalls, text }.
function relayResponsesTurn(upstreamRes, clientStream) {
  return new Promise((resolve) => {
    let buf = "";
    const fcalls = [];
    let text = "";
    upstreamRes.setEncoding("utf8");
    upstreamRes.on("data", (chunk) => {
      buf += chunk;
      let sep;
      while ((sep = buf.indexOf("\n\n")) !== -1) {
        const frame = buf.slice(0, sep); buf = buf.slice(sep + 2);
        let data = "";
        for (const line of frame.split("\n")) { if (line.startsWith("data:")) data += line.slice(5).trim(); }
        if (!data || data === "[DONE]") continue;
        const json = parseJsonSafe(data);
        if (!json || typeof json.type !== "string") continue;
        const type = json.type;
        if (type === "response.output_text.delta") {
          if (typeof json.delta === "string" && json.delta) { text += json.delta; clientStream.write(`event: delta\ndata: ${JSON.stringify({ kind: "text", text: json.delta })}\n\n`); }
        } else if (type.indexOf("reasoning") !== -1 && type.endsWith(".delta")) {
          // gpt-5 reasoning summary stream (response.reasoning_summary_text.delta and kin) → "thinking".
          const t = typeof json.delta === "string" ? json.delta : (json.delta && typeof json.delta.text === "string" ? json.delta.text : "");
          if (t) clientStream.write(`event: delta\ndata: ${JSON.stringify({ kind: "thinking", text: t })}\n\n`);
        } else if (type === "response.output_item.added" && json.item && json.item.type === "function_call" && GOV_TOOL_NAMES.has(json.item.name)) {
          clientStream.write(`event: tool\ndata: ${JSON.stringify({ name: json.item.name, input: parseJsonSafe(json.item.arguments) || {} })}\n\n`);
        } else if (type === "response.completed" && json.response && Array.isArray(json.response.output)) {
          for (const item of json.response.output) {
            if (item && item.type === "function_call") fcalls.push({ call_id: item.call_id, name: item.name, arguments: item.arguments || "{}" });
          }
        }
      }
    });
    upstreamRes.on("end", () => resolve({ fcalls, text }));
    upstreamRes.on("error", () => resolve({ fcalls, text }));
  });
}

// Adjudicate ONE exception via a streaming gpt-5 tool-loop against the shared in-memory ctx. Streams
// reasoning/text/tool activity to clientStream; returns the CheckData verdict (or null if none extracted).
async function adjudicateOne(exception, review, ctx, token, clientStream) {
  const cellRefs = Array.isArray(exception.cell_refs) ? exception.cell_refs.join(" · ") : JSON.stringify(exception.cell_refs);
  const userPrompt =
    `Adjudicate whether this exception has been genuinely cleared for review ${review.id || ""}.\n\n` +
    `REVIEW: ${review.fund_name || review.fund_id || "(fund)"} — ${review.period || "(period)"}; status ${review.status || "(unknown)"}.\n` +
    `EXCEPTION UNDER REVIEW (control_id ${exception.control_id}):\n` +
    `  description: ${exception.description || "(none)"}\n` +
    `  group/type/severity/status: ${exception.control_group}/${exception.ctype}/${exception.severity}/${exception.status}\n` +
    `  workbook/worksheet: ${exception.workbook || "(?)"} / ${exception.worksheet || "(?)"}\n` +
    `  recorded computed: ${JSON.stringify(exception.computed)}\n` +
    `  recorded delta: ${JSON.stringify(exception.delta)}\n` +
    `  cell_refs: ${cellRefs}\n\n` +
    `Independently re-derive the figure(s) using the tools (do NOT trust the recorded numbers). Then judge whether ` +
    `the clearance holds and emit exactly one [[CHECK]] block per the STRUCTURED GOVERNANCE OUTPUT contract. Set ` +
    `claim.source to "Theo · ${exception.control_id}" and claim.text to the assertion you are judging.`;

  let inputItems = [{ role: "user", content: [{ type: "input_text", text: userPrompt }] }];
  let finalText = null;
  for (let turn = 0; turn <= MAX_TOOL_TURNS; turn++) {
    const { res } = await openTurnWithRetry(inputItems, true, token);
    if (!res) { clientStream.write(`event: delta\ndata: ${JSON.stringify({ kind: "text", text: `\n(Model gateway unavailable for ${exception.control_id}.)` })}\n\n`); break; }
    const { fcalls, text } = await relayResponsesTurn(res, clientStream);
    if (fcalls.length === 0) { finalText = text; break; }
    for (const fc of fcalls) {
      inputItems = inputItems.concat([{ type: "function_call", call_id: fc.call_id, name: fc.name, arguments: fc.arguments }]);
      const args = parseJsonSafe(fc.arguments) || {};
      let out;
      if (!GOV_TOOL_NAMES.has(fc.name)) out = { error: `Tool '${fc.name}' is not available.` };
      else { try { out = dispatch(fc.name, args, ctx); } catch (e) { out = { error: String((e && e.message) || e) }; } }
      clientStream.write(`event: tool_result\ndata: ${JSON.stringify({ name: fc.name, ok: !(out && out.error) })}\n\n`);
      inputItems = inputItems.concat([{ type: "function_call_output", call_id: fc.call_id, output: JSON.stringify(out) }]);
    }
  }
  // Fail-closed forcing turn: exhausted the loop still calling tools ⇒ one no-tools turn to force the verdict.
  if (finalText === null) {
    inputItems = inputItems.concat([{ role: "user", content: [{ type: "input_text", text: "You have exhausted your tool budget. Do NOT call any more tools. Emit your [[CHECK]] verdict now from what you gathered; lower your confidence if you could not fully verify." }] }]);
    const { res } = await openTurnWithRetry(inputItems, false, token);
    if (res) { const { text } = await relayResponsesTurn(res, clientStream); finalText = text; }
  }
  return extractVerdictPayload(finalText);
}

app.http("dottie_adjudicate_stream", {
  methods: ["POST", "OPTIONS"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    if (request.method === "OPTIONS") return { status: 204, headers: corsHeaders };

    const principal = getPrincipal(request);
    const oid = getClaimValue(principal, ["http://schemas.microsoft.com/identity/claims/objectidentifier", "oid", "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]);
    if (!oid) return jsonErr(401, "UNAUTHORIZED", "Missing or invalid EasyAuth identity.");
    const token = getOboInputToken(request);
    if (!token) return jsonErr(401, "UNAUTHORIZED", "Missing delegated token input.");

    let body; try { body = await request.json(); } catch { return jsonErr(400, "BAD_REQUEST", "Body is not valid JSON."); }
    const reviewId = typeof body.review_id === "string" ? body.review_id.trim() : "";
    if (!isUuid(reviewId)) return jsonErr(400, "INVALID_REQUEST", "Field 'review_id' is required and must be a valid UUID.");
    if (!AZURE_OPENAI_ENDPOINT) return jsonErr(500, "INTERNAL_SERVER_ERROR", "Azure OpenAI endpoint is not configured.");

    // Review state via Sigma's API (authoritative; propagate 403/404 before opening the stream).
    const gr = await sigmaGetReview(reviewId, token);
    if (gr.status === 401 || gr.status === 403) return jsonErr(403, "FORBIDDEN", "You do not have permission to adjudicate this review.");
    if (gr.status === 404 || !gr.data || !gr.data.review) return jsonErr(404, "NOT_FOUND", "Review not found.");
    const review = gr.data.review, checks = Array.isArray(gr.data.checks) ? gr.data.checks : [];
    const files = review.files && typeof review.files === "object" ? review.files : (gr.data.files && typeof gr.data.files === "object" ? gr.data.files : {});

    // Load the workbook ctx ONCE (OBO via vault-dms) — before opening the stream so failures are clean JSON.
    const buffers = {};
    for (const role of [...REQUIRED_ROLES, ...OPTIONAL_ROLES]) {
      const f = files[role]; if (!f || typeof f.driveId !== "string" || typeof f.itemId !== "string") continue;
      const buf = await dmsReadFile(f.driveId, f.itemId, token); if (buf) buffers[role] = buf;
    }
    for (const role of REQUIRED_ROLES) if (!buffers[role]) return jsonErr(422, "UNRESOLVED_WORKBOOK_SET", `Could not read the '${role}' workbook from the DMS as the signed-in user.`);
    const wb = {};
    for (const [role, buf] of Object.entries(buffers)) wb[role] = XLSX.read(buf, { type: "buffer", cellFormula: true, cellNF: false, cellHTML: false });
    const outWs = wb.output.Sheets["Schedule K-1s"]; const partnerCols = [];
    if (outWs && outWs["!ref"]) { const rng = XLSX.utils.decode_range(outWs["!ref"]); for (let c = 9; c <= rng.e.c; c++) { const cell = outWs[XLSX.utils.encode_cell({ r: 3, c })]; if (cell && cell.v != null && String(cell.v).trim()) partnerCols.push(c); } }
    const ctx = { wb, k1Layout: { sheet: "Schedule K-1s", schedKCol: 7, partnerCols, boxRows: [5, 6, 7, 8, 9, 10, 12, 16, 17, 22, 23] }, py: { endingTaxCapital: {} }, cy: { beginningTaxCapital: {} }, ratios: {} };

    const exceptions = checks.filter((c) => c && c.status && c.status !== "pass");

    let gpt5Token; try { gpt5Token = await getAadToken(OPENAI_SCOPE); } catch (e) { return jsonErr(500, "INTERNAL_SERVER_ERROR", "Model gateway token failed."); }

    // ---- open the client stream + adjudicate every exception in ONE run ----
    const clientStream = new PassThrough();
    (async () => {
      let approved = 0, caution = 0, rejected = 0;
      try {
        if (exceptions.length === 0) {
          clientStream.write(`event: delta\ndata: ${JSON.stringify({ kind: "text", text: "No open exceptions on this review — nothing to adjudicate." })}\n\n`);
        }
        for (const exception of exceptions) {
          clientStream.write(`event: exception\ndata: ${JSON.stringify({ control_id: exception.control_id, severity: exception.severity })}\n\n`);
          const check = await adjudicateOne(exception, review, ctx, gpt5Token, clientStream);
          if (check) {
            if (check.verdict === "challenge") rejected += 1; else if (check.verdict === "caution") caution += 1; else approved += 1;
            clientStream.write(`event: verdict\ndata: ${JSON.stringify({ control_id: exception.control_id, gate: "sigma.exception_clearance", check })}\n\n`);
          } else {
            caution += 1;
            clientStream.write(`event: verdict\ndata: ${JSON.stringify({ control_id: exception.control_id, gate: "sigma.exception_clearance", check: { verdict: "caution", claim: { source: `Theo · ${exception.control_id}`, text: "exception clearance" }, lead: `Dottie could not complete an independent verdict for ${exception.control_id}.`, support: [], conclusion: "Re-run this check.", flags: ["incomplete adjudication"], confidence: { level: 0.2, label: "low" }, docs: [] } })}\n\n`);
          }
        }
      } catch (e) {
        context.error("dottie_adjudicate_stream loop failed", e);
        try { clientStream.write(`event: error\ndata: ${JSON.stringify({ message: "The adjudication stream was interrupted." })}\n\n`); } catch {}
      }
      try { clientStream.write(`event: done\ndata: ${JSON.stringify({ review_id: reviewId, model: AZURE_OPENAI_DEPLOYMENT, summary: { approved, caution, rejected }, cleared: rejected === 0 && caution === 0 && (approved + caution + rejected) > 0 })}\n\n`); } catch {}
      clientStream.end();
    })();

    return { status: 200, headers: sseHeaders, body: clientStream };
  },
});
