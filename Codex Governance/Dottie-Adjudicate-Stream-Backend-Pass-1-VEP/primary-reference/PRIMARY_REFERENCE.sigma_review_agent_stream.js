const { app } = require("@azure/functions");
const https = require("https");
const http = require("http");
const { Pool } = require("pg");
const { PassThrough } = require("node:stream");
const XLSX = require("xlsx");

// The deterministic engine + the tool registry (deployed onto func-stream under src/engine/). We reuse
// the engine's TOOL_SCHEMAS + dispatch, but run our OWN streaming loop (runReviewLoop is non-streaming).
const { TOOL_SCHEMAS, dispatch } = require("../engine/tool-loop");

// HTTP streaming (v4 Node model). func-stream already enables this for theo_message_stream; idempotent here.
app.setup({ enableHttpStream: true });

const FOUNDRY_BASE = process.env.THEO_FOUNDRY_BASE;
const FOUNDRY_DEPLOYMENT = process.env.THEO_FOUNDRY_DEPLOYMENT;
const ANTHROPIC_VERSION = "2023-06-01";
const MAX_TOKENS = 4096;
const MAX_TURNS = 40;
const TITLE_MAX_LEN = 80;
const DMS_API_BASE_URL = process.env.DMS_API_BASE_URL || "https://vaultgpt-func-dms.azurewebsites.net";
const SIGMA_API_BASE_URL = process.env.SIGMA_API_BASE_URL || "https://vaultgpt-func-sigma.azurewebsites.net";
const REQUIRED_ROLES = ["input", "output"];
const OPTIONAL_ROLES = ["tables", "dataconn"];

// The K-1 review-agent ruleset — the SERVER-SIDE, mandatory, non-bypassable leading system block
// (Operating Ruleset §1). Byte-identical to sigma_review_agent (the non-streaming reference); a client
// cannot supply or omit it. Self-contained: anti-fabrication / tool-grounding + review-specialist behavior.
const K1_REVIEW_RULESET = [
  "You are the Vault K-1 review specialist. A deterministic engine has already computed every control for this fund's workbook set; the results are in CURRENT REVIEW STATE below.",
  "YOU NEVER DO ARITHMETIC. For every figure, call a deterministic tool (read_cell, get_range, find_label, tie_out, k1_box_tie, recompute_control, scan_errors, scan_external_links) and cite the exact workbook cell(s) it read. Never state or infer a number you did not get from a tool this turn.",
  "For each control needing attention: explain in plain English what failed, cite the workbook cell(s), state the most likely cause, and tell the preparer exactly what to check or fix. Work crown severity first, then high, then normal.",
  "When the preparer says they have fixed something, RE-VERIFY it with recompute_control(control_id) against the current workbooks — report the fresh status; do not take 'fixed' on trust.",
  "Track cleared vs still-open across the conversation. When (and only when) every exception is cleared, confirm the review is ready to submit to Jake for sign-off. Never green-light a submission while any exception remains.",
  "Be concise and directive — a senior reviewer walking a preparer through the file, not a chatbot.",
].join("\n");

const pool = new Pool({ connectionString: process.env.POSTGRES_CONNECTION_STRING, ssl: { rejectUnauthorized: false } });

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

// ---- https helpers -----------------------------------------------------------
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
async function getFoundryToken() {
  const form = new URLSearchParams({
    client_id: process.env.AAD_CLIENT_ID, client_secret: process.env.AAD_CLIENT_SECRET,
    grant_type: "client_credentials", scope: "https://ai.azure.com/.default",
  }).toString();
  const { status, body } = await httpsRequest(`https://login.microsoftonline.com/${process.env.AAD_TENANT_ID}/oauth2/v2.0/token`,
    { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", "Content-Length": Buffer.byteLength(form) } }, form);
  let json = null; try { json = JSON.parse(body.toString("utf8")); } catch {}
  if (status < 200 || status >= 300 || !json || !json.access_token) throw new Error("foundry token acquisition failed");
  return json.access_token;
}
// GET a DMS file's bytes (OBO via vault-dms), as the signed-in user.
async function dmsReadFile(driveId, itemId, token) {
  const url = new URL(`${DMS_API_BASE_URL}/api/dms_read_file`);
  url.searchParams.set("driveId", driveId); url.searchParams.set("itemId", itemId);
  const { status, body } = await httpsRequest(url.toString(), { method: "GET", headers: { Authorization: `Bearer ${token}`, "x-ms-token-aad-access-token": token } });
  return status >= 200 && status < 300 ? body : null;
}
// GET the review state via Sigma's published API (no direct sigma_* table read — §1 boundary).
async function sigmaGetReview(reviewId, token) {
  const url = new URL(`${SIGMA_API_BASE_URL}/api/sigma_get_review`);
  url.searchParams.set("reviewId", reviewId);
  const { status, body } = await httpsRequest(url.toString(), { method: "GET", headers: { Authorization: `Bearer ${token}`, "x-ms-token-aad-access-token": token } });
  let json = null; try { json = JSON.parse(body.toString("utf8")); } catch {}
  return { status, data: json && json.data ? json.data : null };
}

function reviewStateBlock(review, checks) {
  const sev = { crown: 0, high: 1, normal: 2 };
  const attention = (checks || []).filter((c) => c.status !== "pass").sort((a, b) => (sev[a.severity] ?? 3) - (sev[b.severity] ?? 3));
  const lines = attention.map((c) => {
    const computed = c.computed != null ? JSON.stringify(c.computed) : "—";
    const cells = Array.isArray(c.cell_refs) && c.cell_refs.length ? c.cell_refs.join(" · ") : "—";
    const delta = c.delta != null ? ` delta=${c.delta}` : "";
    return `- [${c.severity}] ${c.control_id} (${c.control_group}) — ${c.status}; computed=${computed};${delta} cells=${cells}`;
  });
  const sc = (review && review.scorecard) || {}; const by = sc.byStatus || {};
  return [
    "CURRENT REVIEW STATE",
    `Fund: ${review.fund_name || review.fund_id} · Period: ${review.period} · Currency: ${review.currency || "—"}`,
    `Status: ${review.status} · Scorecard: ${by.pass ?? 0}/${sc.total ?? (checks || []).length} passing, ${by.exception ?? 0} exceptions`,
    attention.length ? `Controls needing attention (${attention.length}):\n${lines.join("\n")}` : "No open exceptions — all controls pass.",
  ].join("\n");
}

// Open ONE streaming Foundry turn; resolves the raw SSE response stream (or null).
function openFoundryStream(payload, token) {
  return new Promise((resolve) => {
    const u = new URL(`${FOUNDRY_BASE}/anthropic/v1/messages`);
    const lib = u.protocol === "http:" ? http : https;
    const r = lib.request({ method: "POST", hostname: u.hostname, port: u.port ? Number(u.port) : 443, path: u.pathname + u.search,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "anthropic-version": ANTHROPIC_VERSION, "Content-Length": Buffer.byteLength(payload), Accept: "text/event-stream" } },
      (res) => resolve(res));
    r.on("error", () => resolve(null));
    r.write(payload); r.end();
  });
}

// Relay ONE model turn: parse the upstream Anthropic SSE, forward text/thinking deltas to the client as
// our clean event protocol, accumulate the assistant content blocks (text + tool_use) + stop_reason.
// Resolves { assistantContent, stopReason, text, model }.
function relayTurn(upstreamRes, clientStream) {
  return new Promise((resolve) => {
    let buf = "";
    const blocks = {};        // index -> { type, text, name, id, partialJson }
    let stopReason = null, model = null, text = "";
    upstreamRes.setEncoding("utf8");
    upstreamRes.on("data", (chunk) => {
      buf += chunk;
      let sep;
      while ((sep = buf.indexOf("\n\n")) !== -1) {
        const frame = buf.slice(0, sep); buf = buf.slice(sep + 2);
        let ev = null, data = "";
        for (const line of frame.split("\n")) {
          if (line.startsWith("event:")) ev = line.slice(6).trim();
          else if (line.startsWith("data:")) data += line.slice(5).trim();
        }
        if (!data) continue;
        let d; try { d = JSON.parse(data); } catch { continue; }
        if (ev === "message_start") { model = d.message && d.message.model; }
        else if (ev === "content_block_start") { blocks[d.index] = { type: d.content_block.type, text: "", name: d.content_block.name, id: d.content_block.id, partialJson: "" }; }
        else if (ev === "content_block_delta") {
          const b = blocks[d.index] || (blocks[d.index] = { type: "text", text: "", partialJson: "" });
          if (d.delta.type === "text_delta") { b.text += d.delta.text; text += d.delta.text; clientStream.write(`event: delta\ndata: ${JSON.stringify({ kind: "text", text: d.delta.text })}\n\n`); }
          else if (d.delta.type === "thinking_delta") { clientStream.write(`event: delta\ndata: ${JSON.stringify({ kind: "thinking", text: d.delta.thinking })}\n\n`); }
          else if (d.delta.type === "input_json_delta") { b.partialJson += d.delta.partial_json; }
        }
        else if (ev === "content_block_stop") { const b = blocks[d.index]; if (b && b.type === "tool_use") { try { b.input = b.partialJson ? JSON.parse(b.partialJson) : {}; } catch { b.input = {}; } } }
        else if (ev === "message_delta") { if (d.delta && d.delta.stop_reason) stopReason = d.delta.stop_reason; }
      }
    });
    upstreamRes.on("end", () => {
      const assistantContent = Object.keys(blocks).sort((a, b) => a - b).map((i) => {
        const b = blocks[i];
        return b.type === "tool_use" ? { type: "tool_use", id: b.id, name: b.name, input: b.input || {} } : { type: "text", text: b.text };
      });
      resolve({ assistantContent, stopReason, text, model: model || FOUNDRY_DEPLOYMENT });
    });
    upstreamRes.on("error", () => resolve({ assistantContent: [], stopReason: "error", text, model: model || FOUNDRY_DEPLOYMENT }));
  });
}

// Persist the completed turn to Theo's conversation (mirrors theo_message_stream.persistTurn).
async function persistTurn({ oid, requestedConversationId, appKey, appContext, userText, assistantText, model }) {
  let client = null;
  try {
    client = await pool.connect();
    await client.query("BEGIN");
    await client.query(`SELECT set_config('app.current_user_id',$1,false), set_config('request.jwt.claim.sub',$1,false), set_config('request.jwt.claim.oid',$1,false)`, [oid]);
    let conversationId = requestedConversationId;
    if (conversationId) {
      const owned = await client.query(`SELECT id FROM public.theo_conversations WHERE id=$1 AND created_by=$2`, [conversationId, oid]);
      if (owned.rowCount === 0) { await client.query("ROLLBACK"); return null; }
    } else {
      const title = (userText || "").trim().slice(0, TITLE_MAX_LEN) || "K-1 review";
      const created = await client.query(
        `INSERT INTO public.theo_conversations (created_by, title, model, app_key, app_context) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [oid, title, model, appKey, appContext != null ? JSON.stringify(appContext) : null]);
      conversationId = created.rows[0].id;
    }
    const seqRes = await client.query(`SELECT count(*)::int AS n FROM public.theo_messages WHERE conversation_id=$1 AND created_by=$2`, [conversationId, oid]);
    const baseSeq = seqRes.rows[0].n;
    await client.query(`INSERT INTO public.theo_messages (created_by, conversation_id, seq, role, content, model) VALUES ($1,$2,$3,'user',$4,NULL)`, [oid, conversationId, baseSeq, userText]);
    await client.query(`INSERT INTO public.theo_messages (created_by, conversation_id, seq, role, content, model) VALUES ($1,$2,$3,'assistant',$4,$5)`, [oid, conversationId, baseSeq + 1, assistantText, model]);
    await client.query(`UPDATE public.theo_conversations SET updated_at=now() WHERE id=$1 AND created_by=$2`, [conversationId, oid]);
    await client.query("COMMIT");
    return conversationId;
  } catch (e) { if (client) { try { await client.query("ROLLBACK"); } catch {} } throw e; }
  finally { if (client) client.release(); }
}

app.http("sigma_review_agent_stream", {
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
    const messages = Array.isArray(body.messages) ? body.messages : null;
    if (!messages || messages.length === 0) return jsonErr(400, "INVALID_REQUEST", "Field 'messages' is required and must be a non-empty array.");
    const VALID_ROLES = new Set(["user", "assistant"]);
    for (const m of messages) {
      if (!m || typeof m !== "object" || !VALID_ROLES.has(m.role) || m.content == null || (typeof m.content !== "string" && !Array.isArray(m.content)))
        return jsonErr(400, "INVALID_REQUEST", "Each message must be { role: 'user' | 'assistant', content: string | array }.");
    }
    const files = body.files && typeof body.files === "object" ? body.files : {};
    for (const role of REQUIRED_ROLES) {
      const f = files[role];
      if (!f || typeof f !== "object" || typeof f.driveId !== "string" || !f.driveId || typeof f.itemId !== "string" || !f.itemId)
        return jsonErr(400, "INVALID_REQUEST", `files.${role} is required and must be { driveId, itemId }.`);
    }
    const requestedConversationId = typeof body.conversation_id === "string" && isUuid(body.conversation_id) ? body.conversation_id : null;
    const userText = typeof body.user_text === "string" && body.user_text.trim() ? body.user_text.trim()
      : (messages[messages.length - 1] && typeof messages[messages.length - 1].content === "string" ? messages[messages.length - 1].content : "K-1 review");

    // Review state via Sigma's API (authoritative; propagate 403/404/etc. before opening the stream).
    const gr = await sigmaGetReview(reviewId, token);
    if (gr.status === 401 || gr.status === 403) return jsonErr(403, "FORBIDDEN", "You do not have permission to discuss this review.");
    if (gr.status === 404 || !gr.data || !gr.data.review) return jsonErr(404, "NOT_FOUND", "Review not found.");
    const review = gr.data.review, checks = gr.data.checks || [];

    // Load the workbook ctx (OBO via vault-dms) — required before opening the stream so failures are clean.
    const buffers = {};
    for (const role of [...REQUIRED_ROLES, ...OPTIONAL_ROLES]) {
      const f = files[role]; if (!f || typeof f.driveId !== "string") continue;
      const buf = await dmsReadFile(f.driveId, f.itemId, token); if (buf) buffers[role] = buf;
    }
    for (const role of REQUIRED_ROLES) if (!buffers[role]) return jsonErr(422, "UNRESOLVED_WORKBOOK_SET", `Could not read the '${role}' workbook from the DMS as the signed-in user.`);
    const wb = {};
    for (const [role, buf] of Object.entries(buffers)) wb[role] = XLSX.read(buf, { type: "buffer", cellFormula: true, cellNF: false, cellHTML: false });
    const outWs = wb.output.Sheets["Schedule K-1s"]; const partnerCols = [];
    if (outWs && outWs["!ref"]) { const rng = XLSX.utils.decode_range(outWs["!ref"]); for (let c = 9; c <= rng.e.c; c++) { const cell = outWs[XLSX.utils.encode_cell({ r: 3, c })]; if (cell && cell.v != null && String(cell.v).trim()) partnerCols.push(c); } }
    const ctx = { wb, k1Layout: { sheet: "Schedule K-1s", schedKCol: 7, partnerCols, boxRows: [5, 6, 7, 8, 9, 10, 12, 16, 17, 22, 23] }, py: { endingTaxCapital: {} }, cy: { beginningTaxCapital: {} }, ratios: {} };

    const effectiveSystem = [K1_REVIEW_RULESET, reviewStateBlock(review, checks)].join("\n\n");

    let foundryToken; try { foundryToken = await getFoundryToken(); } catch (e) { return jsonErr(500, "INTERNAL_SERVER_ERROR", "Model gateway token failed."); }

    // ---- open the client stream + drive the agentic loop asynchronously ----
    const clientStream = new PassThrough();
    (async () => {
      const convo = [...messages];
      let assistantText = "", model = FOUNDRY_DEPLOYMENT;
      try {
        for (let turn = 0; turn < MAX_TURNS; turn++) {
          const payload = JSON.stringify({ model: FOUNDRY_DEPLOYMENT, max_tokens: MAX_TOKENS, system: effectiveSystem, messages: convo, tools: TOOL_SCHEMAS, stream: true });
          const upstreamRes = await openFoundryStream(payload, foundryToken);
          if (!upstreamRes || (upstreamRes.statusCode && (upstreamRes.statusCode < 200 || upstreamRes.statusCode >= 300))) {
            clientStream.write(`event: error\ndata: ${JSON.stringify({ message: "Model gateway call failed." })}\n\n`); break;
          }
          const { assistantContent, stopReason, text, model: tm } = await relayTurn(upstreamRes, clientStream);
          assistantText += (assistantText && text ? "\n" : "") + text;
          model = tm || model;
          convo.push({ role: "assistant", content: assistantContent });
          const toolUses = assistantContent.filter((b) => b.type === "tool_use");
          if (!toolUses.length || stopReason !== "tool_use") break;
          const results = [];
          for (const tu of toolUses) {
            clientStream.write(`event: tool\ndata: ${JSON.stringify({ name: tu.name, input: tu.input })}\n\n`);
            let out; try { out = dispatch(tu.name, tu.input, ctx); } catch (e) { out = { error: String(e.message) }; }
            clientStream.write(`event: tool_result\ndata: ${JSON.stringify({ name: tu.name, ok: !(out && out.error) })}\n\n`);
            results.push({ type: "tool_result", tool_use_id: tu.id, content: JSON.stringify(out) });
          }
          convo.push({ role: "user", content: results });
        }
      } catch (e) {
        context.error("sigma_review_agent_stream loop failed", e);
        try { clientStream.write(`event: error\ndata: ${JSON.stringify({ message: "The review stream was interrupted." })}\n\n`); } catch {}
      }
      // persist + done
      let conversationId = null;
      try { conversationId = await persistTurn({ oid, requestedConversationId, appKey: "sigma", appContext: { sigma_review_id: reviewId }, userText, assistantText, model }); }
      catch (perr) { context.error("sigma_review_agent_stream persist failed (answer already streamed)", perr); }
      try { clientStream.write(`event: done\ndata: ${JSON.stringify({ conversation_id: conversationId, model })}\n\n`); } catch {}
      clientStream.end();
    })();

    return { status: 200, headers: sseHeaders, body: clientStream };
  },
});
