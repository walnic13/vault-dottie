const { Pool } = require("pg");

// dottie_flags_list — the caller's open governance flags (default), newest-first. Mirrors the deployed
// dottie_list_conversations (pool/set_config/envelope, owner-scoped) on public.dottie_flags. Backs the 9/10
// "Open flags" surface + the Overview open-flag count. Optional ?status=open|resolved|all (default open).
// Read-only; per-user isolation via explicit created_by = $oid (the shared connection role bypasses RLS —
// RLS is defence-in-depth).

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

  // Status filter: default 'open' (the Open-flags surface). 'all' = no filter; 'resolved' = closed flags.
  let status = "open";
  if (req.query && typeof req.query.status === "string" && req.query.status.trim() !== "") {
    const s = req.query.status.trim();
    if (s !== "open" && s !== "resolved" && s !== "all") {
      return send(context, 400, errorBody("INVALID_REQUEST", "Query parameter 'status' must be one of open|resolved|all.", 400));
    }
    status = s;
  }
  const statusFilter = status === "all" ? null : status;

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
      SELECT id, finding_id, flag_type, severity, target_ref, summary, status, created_at, resolved_at
      FROM public.dottie_flags
      WHERE created_by = $1 AND ($2::text IS NULL OR status = $2)
      ORDER BY created_at DESC, id DESC
      LIMIT $3
      `,
      [oid, statusFilter, limit]
    );

    return send(context, 200, successBody({ flags: result.rows }));
  } catch (err) {
    context.log.error("dottie_flags_list failed", err);
    if (err && err.code === "42501") {
      return send(context, 403, errorBody("FORBIDDEN", "You do not have access to these flags.", 403));
    }
    return send(context, 500, errorBody("INTERNAL_SERVER_ERROR", "An unexpected error occurred.", 500));
  } finally {
    if (client) {
      client.release();
    }
  }
};
