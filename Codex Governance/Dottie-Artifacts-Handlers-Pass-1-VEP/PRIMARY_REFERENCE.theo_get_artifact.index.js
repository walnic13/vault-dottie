const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
});

const STORAGE_ACCOUNT = process.env.THEO_BLOB_ACCOUNT || "vaultgptstorage01";

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

function buildKnownError(code, message, status) {
  const err = new Error(message);
  err.code = code; err.status = status; err.isKnown = true;
  return err;
}

function isUuid(value) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

// ---- Managed-identity data-plane Blob access (verbatim technique from the deployed theo_finalize_attachment, B8h) ----
function requestBinary(urlStr, options = {}) {
  return new Promise((resolve, reject) => {
    const https = require("https");
    const url = new URL(urlStr);
    const req = https.request(
      {
        method: options.method || "GET",
        hostname: url.hostname,
        port: url.port ? Number(url.port) : undefined,
        path: url.pathname + url.search,
        headers: options.headers || {},
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => { chunks.push(chunk); });
        res.on("end", () => { resolve({ statusCode: res.statusCode || 0, headers: res.headers || {}, body: Buffer.concat(chunks) }); });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

function requestUrl(urlStr, options = {}) {
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
        res.on("end", () => { resolve({ statusCode: res.statusCode || 0, headers: res.headers || {}, body: data }); });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

async function getManagedIdentityAccessToken(resource) {
  const identityEndpoint = process.env.IDENTITY_ENDPOINT;
  const identityHeader = process.env.IDENTITY_HEADER;
  if (!identityEndpoint || !identityHeader) {
    throw new Error("Managed Identity endpoint not available (IDENTITY_ENDPOINT/IDENTITY_HEADER missing).");
  }
  const tokenUrl = `${identityEndpoint}?resource=${encodeURIComponent(resource)}&api-version=2019-08-01`;
  const r = await requestUrl(tokenUrl, { method: "GET", headers: { "X-IDENTITY-HEADER": identityHeader } });
  if (r.statusCode < 200 || r.statusCode >= 300) {
    throw new Error(`Managed Identity token endpoint failed (${r.statusCode}): ${r.body}`);
  }
  const payload = JSON.parse(r.body || "{}");
  if (!payload.access_token) throw new Error("Managed Identity token endpoint did not return access_token.");
  return payload.access_token;
}

function encodeBlobPath(blobKey) { return blobKey.split("/").map(encodeURIComponent).join("/"); }
function blobUrlFor(accountName, containerName, blobKey) {
  return `https://${accountName}.blob.core.windows.net/${containerName}/${encodeBlobPath(blobKey)}`;
}

async function downloadBlob(accountName, containerName, blobKey) {
  const accessToken = await getManagedIdentityAccessToken("https://storage.azure.com/");
  const r = await requestBinary(blobUrlFor(accountName, containerName, blobKey), {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}`, "x-ms-version": "2022-11-02" },
  });
  if (r.statusCode < 200 || r.statusCode >= 300) throw new Error(`GET blob failed (${r.statusCode})`);
  return r.body; // Buffer
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

  const artifactId = req.query ? req.query.artifactId : undefined;
  if (!isUuid(artifactId)) return send(context, 400, errorBody("INVALID_REQUEST", "Query 'artifactId' is required and must be a valid UUID.", 400));

  const client = await pool.connect();
  try {
    await client.query(
      `SELECT set_config('app.current_user_id', $1, false),
              set_config('request.jwt.claim.sub', $1, false),
              set_config('request.jwt.claim.oid', $1, false)`,
      [oid]
    );

    const artifact = await client.query(
      `SELECT id, conversation_id, project_id, title, type, current_version, created_at, updated_at
       FROM public.theo_artifacts
       WHERE id = $1 AND created_by = $2`,
      [artifactId, oid]
    );
    if (artifact.rowCount === 0) {
      const existsResult = await client.query(`SELECT public.theo_artifact_exists_unscoped($1::uuid) AS e`, [artifactId]);
      const exists = existsResult.rows[0] && existsResult.rows[0].e === true;
      throw exists
        ? buildKnownError("FORBIDDEN", "You do not have access to this artifact.", 403)
        : buildKnownError("NOT_FOUND", "Artifact not found.", 404);
    }

    const versionRows = await client.query(
      `SELECT version_number, blob_container, blob_path, byte_size, content_type, created_at
       FROM public.theo_artifact_versions
       WHERE artifact_id = $1 AND created_by = $2
       ORDER BY version_number ASC`,
      [artifactId, oid]
    );

    // Read each version body from Blob (server-side, managed identity). The row carries the container +
    // key; the account is the configured storage account. Small text; sequential is fine. A failed
    // blob read degrades to "" for that version rather than failing the whole artifact fetch.
    const versions = [];
    for (const v of versionRows.rows) {
      let content = "";
      try {
        const buf = await downloadBlob(STORAGE_ACCOUNT, v.blob_container, v.blob_path);
        content = buf.toString("utf8");
      } catch (e) {
        context.log.warn("theo_get_artifact: version blob read failed", { artifactId, version: v.version_number, e });
      }
      versions.push({
        version_number: v.version_number,
        content,
        byte_size: v.byte_size,
        content_type: v.content_type,
        created_at: v.created_at,
      });
    }

    return send(context, 200, successBody({ artifact: { ...artifact.rows[0], versions } }));
  } catch (err) {
    context.log.error("theo_get_artifact failed", err);
    if (err && err.code === "42501") return send(context, 403, errorBody("FORBIDDEN", "You do not have access to this artifact.", 403));
    if (err && err.isKnown === true && typeof err.status === "number" && typeof err.code === "string") {
      return send(context, err.status, errorBody(err.code, err.message, err.status));
    }
    return send(context, 500, errorBody("INTERNAL_SERVER_ERROR", "An unexpected error occurred.", 500));
  } finally {
    client.release();
  }
};
