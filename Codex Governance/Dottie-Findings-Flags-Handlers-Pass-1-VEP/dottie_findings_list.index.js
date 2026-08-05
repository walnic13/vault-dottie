const { Pool } = require("pg");

// dottie_findings_list — the caller's governance findings (checks/verdicts), newest-first. Mirrors the deployed
// dottie_list_conversations (pool/set_config/envelope, owner-scoped) on public.dottie_findings. Backs the 9/10
// Overview + "Checks on Theo" surfaces. Read-only; per-user isolation via explicit created_by = $oid (the shared
// connection role bypasses RLS — RLS is defence-in-depth).

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

  // Optional verdict filter (the "Challenge only" view etc.). Absent = all verdicts.
  let verdict = null;
  if (req.query && typeof req.query.verdict === "string" && req.query.verdict.trim() !== "") {
    const v = req.query.verdict.trim();
    if (v !== "concur" && v !== "caution" && v !== "challenge") {
      return send(context, 400, errorBody("INVALID_REQUEST", "Query parameter 'verdict' must be one of concur|caution|challenge.", 400));
    }
    verdict = v;
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
      SELECT id, target_ref, target_kind, verdict, confidence_level, confidence_label,
             claim_source, claim_text, lead, conclusion, authorities, flags, docs_expected,
             conversation_id, created_at
      FROM public.dottie_findings
      WHERE created_by = $1 AND ($2::text IS NULL OR verdict = $2)
      ORDER BY created_at DESC, id DESC
      LIMIT $3
      `,
      [oid, verdict, limit]
    );

    return send(context, 200, successBody({ findings: result.rows }));
  } catch (err) {
    context.log.error("dottie_findings_list failed", err);
    if (err && err.code === "42501") {
      return send(context, 403, errorBody("FORBIDDEN", "You do not have access to these findings.", 403));
    }
    return send(context, 500, errorBody("INTERNAL_SERVER_ERROR", "An unexpected error occurred.", 500));
  } finally {
    if (client) {
      client.release();
    }
  }
};
