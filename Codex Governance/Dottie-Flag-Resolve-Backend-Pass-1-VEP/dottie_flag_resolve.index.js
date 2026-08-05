const { Pool } = require("pg");

// dottie_flag_resolve — mark one governance flag resolved (or re-open it). Owner-scoped UPDATE on the DEPLOYED
// dottie_flags store (pkg 3a.1). Mirrors the deployed dottie_set_conversation_starred idiom EXACTLY (pool/
// set_config/envelope/EasyAuth, BEGIN…UPDATE…exists-helper 403/404…COMMIT), on dottie_flags. Backs the "Resolve"
// action on the Open-flags surface (pkg 3b.3). status='resolved' stamps resolved_at=now(); status='open' clears it.

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
    if (match && typeof match.val === "string" && match.val.trim()) {
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
    body = parseBody(req);
  } catch {
    return send(context, 400, errorBody("BAD_REQUEST", "Request body is not valid JSON.", 400));
  }

  const ALLOWED_BODY_KEYS = new Set(["flag_id", "status"]);
  const unknownKey = Object.keys(body || {}).find((k) => !ALLOWED_BODY_KEYS.has(k));
  if (unknownKey) {
    return send(context, 400, errorBody("INVALID_REQUEST", `Unknown field '${unknownKey}'.`, 400));
  }

  const flagId = typeof body.flag_id === "string" ? body.flag_id.trim() : "";
  if (!isUuid(flagId)) {
    return send(context, 400, errorBody("INVALID_REQUEST", "Field 'flag_id' is required and must be a valid UUID.", 400));
  }
  if (body.status !== "open" && body.status !== "resolved") {
    return send(context, 400, errorBody("INVALID_REQUEST", "Field 'status' is required and must be 'open' or 'resolved'.", 400));
  }
  const status = body.status;

  let client = null;
  try {
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

    // Owner-scoped resolve/re-open. resolved_at is stamped on resolve and cleared on re-open. 0 rows → 403
    // (existing-foreign) / 404 (absent) via the shared exists-unscoped helper (pkg 3a.1).
    const updated = await client.query(
      `
      UPDATE public.dottie_flags
      SET status = $1, resolved_at = CASE WHEN $1 = 'resolved' THEN now() ELSE NULL END
      WHERE id = $2 AND created_by = $3
      RETURNING id, status, resolved_at
      `,
      [status, flagId, oid]
    );
    if (updated.rowCount === 0) {
      const existsResult = await client.query(
        `SELECT public.dottie_flag_exists_unscoped($1::uuid) AS e`,
        [flagId]
      );
      const exists = existsResult.rows[0] && existsResult.rows[0].e === true;
      throw exists
        ? buildKnownError("FORBIDDEN", "You do not have access to this flag.", 403)
        : buildKnownError("NOT_FOUND", "Flag not found.", 404);
    }

    await client.query("COMMIT");

    return send(context, 200, successBody({ flag: updated.rows[0] }));
  } catch (err) {
    if (client) {
      try { await client.query("ROLLBACK"); } catch {}
    }

    context.log.error("dottie_flag_resolve failed", err);

    if (err && err.code === "42501") {
      return send(context, 403, errorBody("FORBIDDEN", "You do not have access to this flag.", 403));
    }
    if (err && err.isKnown === true && typeof err.status === "number" && typeof err.code === "string") {
      return send(context, err.status, errorBody(err.code, err.message, err.status));
    }

    return send(context, 500, errorBody("INTERNAL_SERVER_ERROR", "An unexpected error occurred.", 500));
  } finally {
    if (client) {
      client.release();
    }
  }
};
