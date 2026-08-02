const { Pool } = require("pg");

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

function nowIso() { return new Date().toISOString(); }

function errorBody(code, message, status) {
  return { error: { code, message, status, timestamp: nowIso() } };
}

function successBody(data) {
  return { data, meta: { timestamp: nowIso(), version: "1.0" } };
}

function getPrincipal(req) {
  const raw = req.headers["x-ms-client-principal"];
  if (!raw || typeof raw !== "string") return null;
  try { return JSON.parse(Buffer.from(raw, "base64").toString("utf8")); } catch { return null; }
}

function getClaimValue(principal, claimTypes) {
  if (!principal || !Array.isArray(principal.claims)) return null;
  for (const claimType of claimTypes) {
    const match = principal.claims.find((c) => c.typ === claimType);
    if (match && typeof match.val === "string" && match.val.trim()) return match.val.trim();
  }
  return null;
}

function isUuid(value) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

module.exports = async function (context, req) {
  if (req.method === "OPTIONS") return send(context, 204, "");

  const principal = getPrincipal(req);
  const oid = getClaimValue(principal, [
    "http://schemas.microsoft.com/identity/claims/objectidentifier",
    "oid",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
  ]);
  if (!oid) return send(context, 401, errorBody("UNAUTHORIZED", "Missing or invalid EasyAuth identity.", 401));

  // Optional ?conversationId filter (scopes to one thread's artifacts; backs the reload path).
  const rawConv = req.query ? req.query.conversationId : undefined;
  let conversationId = null;
  if (rawConv != null && rawConv !== "") {
    if (!isUuid(rawConv)) return send(context, 400, errorBody("INVALID_REQUEST", "Query 'conversationId', when supplied, must be a valid UUID.", 400));
    conversationId = rawConv;
  }

  const client = await pool.connect();
  try {
    await client.query(
      `SELECT set_config('app.current_user_id', $1, false),
              set_config('request.jwt.claim.sub', $1, false),
              set_config('request.jwt.claim.oid', $1, false)`,
      [oid]
    );

    // Explicit ownership scope (the connection role bypasses RLS). Newest-updated first. Metadata only —
    // version content lives in Blob and is fetched per-artifact via theo_get_artifact.
    const params = [oid];
    let where = "created_by = $1";
    if (conversationId) { params.push(conversationId); where += ` AND conversation_id = $${params.length}`; }

    const result = await client.query(
      `SELECT id, conversation_id, project_id, title, type, current_version, created_at, updated_at
       FROM public.theo_artifacts
       WHERE ${where}
       ORDER BY updated_at DESC, id DESC
       LIMIT 500`,
      params
    );

    return send(context, 200, successBody({ artifacts: result.rows }));
  } catch (err) {
    context.log.error("theo_list_artifacts failed", err);
    if (err && err.code === "42501") return send(context, 403, errorBody("FORBIDDEN", "You do not have permission to list artifacts.", 403));
    return send(context, 500, errorBody("INTERNAL_SERVER_ERROR", "An unexpected error occurred.", 500));
  } finally {
    client.release();
  }
};
