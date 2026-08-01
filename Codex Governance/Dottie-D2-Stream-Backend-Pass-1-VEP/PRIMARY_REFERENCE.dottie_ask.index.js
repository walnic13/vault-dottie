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
