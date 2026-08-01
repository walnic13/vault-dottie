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
  context.res = { status, headers: { ...corsHeaders, "Content-Type": "application/json" }, body };
}

function nowIso() {
  return new Date().toISOString();
}

function errorBody(code, message, status) {
  return { error: { code, message, status, timestamp: nowIso() } };
}

function successBody(data) {
  return { data, meta: { timestamp: nowIso(), version: "1.0" } };
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
