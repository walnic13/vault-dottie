// dottie_adjudicate — Dottie's FIRST governance check (App Host §6D(2); VO-AH-Dottie-Governance-First-Check-Contract
// §C4): adjudicate an exception clearance. func-dottie runs a gpt-5 TOOL-LOOP that declares Sigma's six deterministic
// review tools (via the deployed func-sigma sigma_governance_tool, §C2) and re-derives the exception INDEPENDENTLY,
// then judges whether the clearance holds and emits EXACTLY ONE [[CHECK]]…[[/CHECK]] block — the same governance-output
// mechanism Dottie already uses (parsed by the deployed parseCheck, rendered by the deployed GovernanceCheck).
//
// Grounding: this handler mirrors the DEPLOYED dottie_ask (PRIMARY REFERENCE — same app vaultgpt-func-dottie, v1
// classic model) for its auth/envelope/getAadToken/model-call scaffold; the bounded function-tool loop mirrors the
// DEPLOYED dottie_message_stream (func-dottie-stream) Responses-API tool mechanics, BUFFERED (stream:false — an
// adjudication is one request → one verdict, not a chat stream). It WRITES NOTHING to Sigma (read/compute-only,
// advisory — the reviewer counter-sign stays Sigma's integrity gate). All Sigma calls are AS-THE-SIGNED-IN-USER:
// the caller's bearer is forwarded (shared EasyAuth audience api://4e1a1e31-…), so Sigma's RLS/owner∨reviewer scope
// applies unchanged; review_id is injected server-side into every tool call so the model can never retarget a
// different review.

const AZURE_OPENAI_ENDPOINT = (process.env.AZURE_OPENAI_ENDPOINT || "").replace(/\/+$/, "");
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-5";
const RESPONSES_API_VERSION = process.env.AZURE_OPENAI_RESPONSES_API_VERSION || "2025-03-01-preview";
const OPENAI_SCOPE = "https://cognitiveservices.azure.com/.default";
const SIGMA_API_BASE_URL = (process.env.SIGMA_API_BASE_URL || "https://vaultgpt-func-sigma.azurewebsites.net").replace(/\/+$/, "");
const MAX_TOOL_TURNS = parseInt(process.env.DOTTIE_ADJUDICATE_MAX_TOOL_TURNS, 10) > 0 ? parseInt(process.env.DOTTIE_ADJUDICATE_MAX_TOOL_TURNS, 10) : 10;
const DEFAULT_MAX_OUTPUT_TOKENS = 16000;

// The six deterministic tools exposed to gpt-5, mirroring the DEPLOYED engine tool-loop.js TOOL_SCHEMAS
// descriptions/fields verbatim — declared in Responses-API function-tool shape. `review_id` is NOT a tool field:
// it is fixed per-request and injected server-side, so the model can only re-derive THE review it was asked about.
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

// Dottie's adjudication persona + the STRUCTURED GOVERNANCE OUTPUT contract — mirrors the deployed
// dottie_message_stream DOTTIE_SYSTEM_PROMPT emit section so the block matches the deployed parseCheck/CheckData.
const ADJUDICATION_SYSTEM_PROMPT =
  "You are Dottie, the independent governance observer for Vault. You are the check-on-the-checker: you adjudicate a " +
  "review's claims by INDEPENDENTLY re-deriving them, and your output is advisory (the human reviewer's counter-sign " +
  "remains the authoritative gate). You are deliberately independent of the assistants that produced the content.\n\n" +
  "TASK: adjudicate whether a flagged exception has been genuinely cleared. Do NOT trust the recorded numbers — " +
  "re-derive the figure yourself from the workbooks using the tools (find_label to anchor a labelled cell, get_range " +
  "to read the underlying values, tie_out to compare two amounts within tolerance, k1_box_tie / scan_external_links / " +
  "scan_errors as relevant). The tools do ALL arithmetic; you orchestrate and judge. Call tools as needed, then stop " +
  "calling tools and give your verdict. If a tool returns an error (e.g. the workbook set is unresolved), say so " +
  "plainly and lower your confidence rather than guessing.\n\n" +
  "STRUCTURED GOVERNANCE OUTPUT — THE [[CHECK]] BLOCK\n" +
  "Emit your verdict as EXACTLY ONE machine-readable block and nothing else — no prose before or after it:\n" +
  "[[CHECK]]{ ...single JSON object... }[[/CHECK]]\n" +
  "The JSON object's fields:\n" +
  "- \"verdict\": \"concur\" | \"caution\" | \"challenge\" — REQUIRED (this is an adjudication). concur = the clearance " +
  "holds on your independent re-derivation; caution = it may hold but needs support/you could not fully verify; " +
  "challenge = your re-derivation contradicts the clearance.\n" +
  "- \"claim\": { \"source\": \"who/what you review, e.g. Theo · <control_id>\", \"text\": \"the exact assertion being judged\" } (required for an adjudication).\n" +
  "- \"lead\": one clear sentence giving your verdict in plain terms (REQUIRED).\n" +
  "- \"support\": ordered array of { \"label\", \"body\", \"cites\" } steps showing your re-derivation; labels like " +
  "\"What I recomputed\", \"What it says\", \"How it applies\"; \"cites\" is an array of precise strings (cell addresses, " +
  "tie-out deltas) and may be omitted when a step has none.\n" +
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

// The signed-in user's delegated bearer, forwarded to func-sigma so Sigma runs AS THE USER (shared EasyAuth
// audience). Mirrors dottie_message_stream's userBearer extraction for as-user tool dispatch.
function getUserBearer(req) {
  const raw = req.headers["authorization"];
  const m = raw && typeof raw === "string" ? raw.match(/^Bearer\s+(.+)$/i) : null;
  if (m && m[1]) return m[1].trim();
  const store = req.headers["x-ms-token-aad-access-token"];
  if (typeof store === "string" && store.trim() !== "") return store.trim();
  return null;
}

// ---- HTTPS helper: byte-identical requestUrl from the deployed dottie_ask / theo_add_project_knowledge ----
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

// Client-credentials token for a given Azure resource scope — byte-identical to the deployed dottie_ask getAadToken.
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

// ---- Sigma calls (AS THE USER: forward the caller's bearer; EasyAuth on func-sigma reconstructs the principal) ----
async function sigmaGet(fn, query, bearer) {
  const url = new URL(`${SIGMA_API_BASE_URL}/api/${fn}`);
  for (const [k, v] of Object.entries(query || {})) url.searchParams.set(k, v);
  const r = await requestUrl(url.toString(), {
    method: "GET",
    headers: { Authorization: `Bearer ${bearer}`, "x-ms-token-aad-access-token": bearer },
  });
  return { statusCode: r.statusCode, payload: parseJsonSafe(r.body) };
}

async function sigmaPost(fn, bodyObj, bearer) {
  const b = JSON.stringify(bodyObj);
  const r = await requestUrl(`${SIGMA_API_BASE_URL}/api/${fn}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearer}`,
      "x-ms-token-aad-access-token": bearer,
      "Content-Length": Buffer.byteLength(b),
    },
  }, b);
  return { statusCode: r.statusCode, payload: parseJsonSafe(r.body) };
}

// Dispatch ONE model tool call to sigma_governance_tool, review_id injected server-side. Never throws — returns the
// tool's {result} on success or an {error} the model can read and react to (mirrors dottie_message_stream dispatch).
async function dispatchSigmaTool(name, args, bearer, reviewId) {
  const { statusCode, payload } = await sigmaPost("sigma_governance_tool", { review_id: reviewId, tool: name, input: args || {} }, bearer);
  if (statusCode >= 200 && statusCode < 300 && payload && payload.data) {
    return { result: payload.data.result };
  }
  const err = payload && payload.error ? payload.error : { code: "TOOL_DISPATCH_FAILED", message: `sigma_governance_tool returned HTTP ${statusCode}.`, status: statusCode };
  return { error: err };
}

// Collect the assistant's text + any function calls from a buffered Responses-API `output` array.
function readResponsesOutput(payload) {
  const output = payload && Array.isArray(payload.output) ? payload.output : [];
  const fcalls = [];
  let text = "";
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    if (item.type === "function_call" && typeof item.name === "string") {
      fcalls.push({ call_id: item.call_id, name: item.name, arguments: item.arguments || "{}" });
    } else if (item.type === "message" && Array.isArray(item.content)) {
      for (const c of item.content) {
        if (c && c.type === "output_text" && typeof c.text === "string") text += c.text;
      }
    }
  }
  return { fcalls, text };
}

const CHECK_BLOCK_RE = /\[\[CHECK\]\]\s*([\s\S]*?)\s*\[\[\/CHECK\]\]/;

// Extract the single [[CHECK]] block's parsed JSON (or null). The FE parseCheck is the authoritative renderer; this
// is a convenience passthrough of the model's CheckData JSON for a direct (non-FE) consumer of verdict_payload.
function extractVerdictPayload(text) {
  if (typeof text !== "string") return null;
  const m = text.match(CHECK_BLOCK_RE);
  if (!m) return null;
  const obj = parseJsonSafe(m[1]);
  if (!obj || typeof obj !== "object" || typeof obj.lead !== "string" || !obj.lead.trim()) return null;
  return obj;
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

  // The delegated bearer is required — every Sigma call runs as the signed-in user.
  const userBearer = getUserBearer(req);
  if (!userBearer) {
    return send(context, 401, errorBody("UNAUTHORIZED", "Missing delegated token input.", 401));
  }

  let body;
  try {
    body = req.body == null ? {} : typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return send(context, 400, errorBody("BAD_REQUEST", "Request body is not valid JSON.", 400));
  }

  // ---- Validate inputs before any upstream call (fail-closed deterministic 400s) ----
  const reviewId = typeof body.review_id === "string" ? body.review_id.trim() : "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reviewId)) {
    return send(context, 400, errorBody("INVALID_REQUEST", "Field 'review_id' is required and must be a valid UUID.", 400));
  }
  const claim = body.claim && typeof body.claim === "object" && !Array.isArray(body.claim) ? body.claim : null;
  if (!claim) {
    return send(context, 400, errorBody("INVALID_REQUEST", "Field 'claim' is required and must be an object.", 400));
  }
  if (claim.kind !== "exception_clearance") {
    return send(context, 400, errorBody("INVALID_REQUEST", "Only claim.kind 'exception_clearance' is supported.", 400));
  }
  const controlId = typeof claim.control_id === "string" ? claim.control_id.trim() : "";
  if (!controlId) {
    return send(context, 400, errorBody("INVALID_REQUEST", "Field 'claim.control_id' is required.", 400));
  }
  const theoAssessment = claim.theo_assessment && typeof claim.theo_assessment === "object" && !Array.isArray(claim.theo_assessment) ? claim.theo_assessment : null;
  const preparerResponse = typeof claim.preparer_response === "string" ? claim.preparer_response : null;

  if (!AZURE_OPENAI_ENDPOINT) {
    return send(context, 500, errorBody("INTERNAL_SERVER_ERROR", "Azure OpenAI endpoint is not configured.", 500));
  }

  try {
    // ---- Pre-fetch the review + its recorded checks (AS THE USER) to locate the exception under review. ----
    const gr = await sigmaGet("sigma_get_review", { reviewId }, userBearer);
    if (gr.statusCode === 401) return send(context, 401, errorBody("UNAUTHORIZED", "Delegated identity was rejected by Sigma.", 401));
    if (gr.statusCode === 404) return send(context, 404, errorBody("NOT_FOUND", "Review not found.", 404));
    if (gr.statusCode < 200 || gr.statusCode >= 300 || !gr.payload || !gr.payload.data || !gr.payload.data.review) {
      const message = (gr.payload && gr.payload.error && gr.payload.error.message) || `Could not read the review (HTTP ${gr.statusCode}).`;
      context.log.error("dottie_adjudicate sigma_get_review error", gr.statusCode, message);
      return send(context, 502, errorBody("UPSTREAM_ERROR", message, 502));
    }
    const review = gr.payload.data.review;
    const checks = Array.isArray(gr.payload.data.checks) ? gr.payload.data.checks : [];
    const exception = checks.find((c) => c && c.control_id === controlId) || null;
    if (!exception) {
      return send(context, 422, errorBody("CONTROL_NOT_IN_REVIEW", `No check for control '${controlId}' exists in this review.`, 422));
    }

    // ---- Build the adjudication turn (the claim + recorded figures; the model re-derives from the workbooks). ----
    const userPrompt =
      `Adjudicate whether the following exception has been genuinely cleared for review ${reviewId}.\n\n` +
      `REVIEW: ${review.fund_name || review.fund_id || "(fund)"} — ${review.period || "(period)"}; status ${review.status || "(unknown)"}.\n` +
      `RECORDED FIGURES: ${JSON.stringify(review.figures || review.scorecard || null)}\n\n` +
      `EXCEPTION UNDER REVIEW (control_id ${controlId}):\n` +
      `  description: ${exception.description || "(none)"}\n` +
      `  group/type/severity/status: ${exception.control_group}/${exception.ctype}/${exception.severity}/${exception.status}\n` +
      `  workbook/worksheet: ${exception.workbook || "(?)"} / ${exception.worksheet || "(?)"}\n` +
      `  recorded computed: ${JSON.stringify(exception.computed)}\n` +
      `  recorded delta: ${JSON.stringify(exception.delta)}\n` +
      `  cell_refs: ${JSON.stringify(exception.cell_refs)}\n\n` +
      `THEO'S ASSESSMENT: ${theoAssessment ? JSON.stringify(theoAssessment) : "(none provided)"}\n` +
      `PREPARER'S RESPONSE: ${preparerResponse != null ? preparerResponse : "(none provided)"}\n\n` +
      `Independently re-derive the figure(s) using the tools (do NOT trust the recorded numbers). Then judge whether ` +
      `the clearance holds and emit exactly one [[CHECK]] block per the STRUCTURED GOVERNANCE OUTPUT contract. Set ` +
      `claim.source to "Theo · ${controlId}" and claim.text to the assertion you are judging.`;

    const token = await getAadToken(OPENAI_SCOPE);

    // ---- Buffered Responses-API tool loop (mirrors dottie_message_stream mechanics, stream:false). ----
    let inputItems = [{ role: "user", content: [{ type: "input_text", text: userPrompt }] }];
    let finalText = "";
    let respModel = AZURE_OPENAI_DEPLOYMENT;

    for (let turn = 0; turn <= MAX_TOOL_TURNS; turn++) {
      const requestBody = JSON.stringify({
        model: AZURE_OPENAI_DEPLOYMENT,
        instructions: ADJUDICATION_SYSTEM_PROMPT,
        input: inputItems,
        tools: SIGMA_TOOLS,
        reasoning: { effort: "medium" },
        max_output_tokens: DEFAULT_MAX_OUTPUT_TOKENS,
      });
      const url = `${AZURE_OPENAI_ENDPOINT}/openai/responses?api-version=${RESPONSES_API_VERSION}`;
      const r = await requestUrl(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Length": Buffer.byteLength(requestBody),
        },
      }, requestBody);

      const payload = parseJsonSafe(r.body);
      if (r.statusCode < 200 || r.statusCode >= 300 || !payload) {
        const message = (payload && payload.error && payload.error.message) || `Azure OpenAI request failed (HTTP ${r.statusCode}).`;
        context.log.error("dottie_adjudicate upstream error", r.statusCode, message);
        return send(context, 502, errorBody("UPSTREAM_ERROR", message, 502));
      }
      if (typeof payload.model === "string") respModel = payload.model;

      const { fcalls, text } = readResponsesOutput(payload);
      if (fcalls.length === 0) {
        finalText = text;
        break;
      }
      // Feed each tool call + its deterministic result back, then re-open the turn.
      for (const fc of fcalls) {
        inputItems = inputItems.concat([{ type: "function_call", call_id: fc.call_id, name: fc.name, arguments: fc.arguments }]);
        const args = parseJsonSafe(fc.arguments) || {};
        let out;
        if (!GOV_TOOL_NAMES.has(fc.name)) {
          out = { error: { code: "UNKNOWN_TOOL", message: `Tool '${fc.name}' is not available.` } };
        } else {
          out = await dispatchSigmaTool(fc.name, args, userBearer, reviewId);
        }
        inputItems = inputItems.concat([{ type: "function_call_output", call_id: fc.call_id, output: JSON.stringify(out) }]);
      }
    }

    const verdictPayload = extractVerdictPayload(finalText);
    return send(context, 200, successBody({
      review_id: reviewId,
      control_id: controlId,
      message: finalText,          // contains the [[CHECK]] block — parsed by the deployed FE parseCheck/GovernanceCheck
      verdict_payload: verdictPayload,
      model: respModel,
    }));
  } catch (err) {
    context.log.error("dottie_adjudicate failed", err);
    return send(context, 500, errorBody("INTERNAL_SERVER_ERROR", "An unexpected error occurred.", 500));
  }
};
