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
