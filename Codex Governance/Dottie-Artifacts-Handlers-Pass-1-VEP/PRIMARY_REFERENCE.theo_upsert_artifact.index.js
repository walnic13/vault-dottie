const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
});

const TITLE_MAX_LEN = 200;
const CONTENT_MAX_BYTES = 1024 * 1024; // 1 MiB per artifact version (text); generous for docs/code/html
const VALID_TYPES = ["document", "code", "html"];

const STORAGE_ACCOUNT = process.env.THEO_BLOB_ACCOUNT || "vaultgptstorage01";
const STORAGE_CONTAINER = process.env.THEO_BLOB_CONTAINER || "theo-content";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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

function parseBody(req) {
  if (req.body == null) return {};
  if (typeof req.body === "string") return JSON.parse(req.body);
  if (typeof req.body === "object") return req.body;
  return {};
}

function buildKnownError(code, message, status) {
  const err = new Error(message);
  err.code = code; err.status = status; err.isKnown = true;
  return err;
}

function isUuid(value) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

// content_type stored on the version row, by artifact type (mirrors how the FE renders each type).
function contentTypeFor(type) {
  if (type === "html") return "text/html; charset=utf-8";
  if (type === "code") return "text/plain; charset=utf-8";
  return "text/markdown; charset=utf-8";
}

// ---- Managed-identity data-plane Blob access (verbatim technique from the deployed theo_finalize_attachment, B8h) ----
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
        res.on("end", () => { resolve({ statusCode: res.statusCode || 0, headers: res.headers || {}, body: data }); });
      }
    );
    req.on("error", reject);
    if (body) req.write(body);
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

async function putTextBlob(accountName, containerName, blobKey, text, contentType) {
  const accessToken = await getManagedIdentityAccessToken("https://storage.azure.com/");
  const bodyBuf = Buffer.from(text, "utf8");
  const r = await requestUrl(
    blobUrlFor(accountName, containerName, blobKey),
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "x-ms-version": "2022-11-02",
        "x-ms-blob-type": "BlockBlob",
        "Content-Type": contentType,
        "Content-Length": bodyBuf.length,
      },
    },
    bodyBuf
  );
  if (r.statusCode < 200 || r.statusCode >= 300) {
    throw new Error(`PUT artifact blob failed (${r.statusCode}): ${r.body}`);
  }
}

async function deleteBlobBestEffort(context, accountName, containerName, blobKey) {
  try {
    const accessToken = await getManagedIdentityAccessToken("https://storage.azure.com/");
    await requestUrl(blobUrlFor(accountName, containerName, blobKey), {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}`, "x-ms-version": "2022-11-02" },
    });
  } catch (e) {
    context.log.warn("theo_upsert_artifact: best-effort blob cleanup failed", e);
  }
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

  let body;
  try { body = parseBody(req); } catch { return send(context, 400, errorBody("BAD_REQUEST", "Request body is not valid JSON.", 400)); }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return send(context, 400, errorBody("INVALID_REQUEST", "Field 'title' is required and must be non-blank.", 400));
  if (title.length > TITLE_MAX_LEN) return send(context, 400, errorBody("INVALID_REQUEST", `Field 'title' must be at most ${TITLE_MAX_LEN} characters.`, 400));

  const type = typeof body.type === "string" ? body.type.trim() : "";
  if (!VALID_TYPES.includes(type)) return send(context, 400, errorBody("INVALID_REQUEST", "Field 'type' must be one of 'document', 'code', 'html'.", 400));

  if (typeof body.content !== "string") return send(context, 400, errorBody("INVALID_REQUEST", "Field 'content' is required and must be a string.", 400));
  const content = body.content;
  if (Buffer.byteLength(content, "utf8") > CONTENT_MAX_BYTES) {
    return send(context, 400, errorBody("INVALID_REQUEST", `Field 'content' must be at most ${CONTENT_MAX_BYTES} bytes.`, 400));
  }

  let conversationId = null;
  if (body.conversation_id != null) {
    if (!isUuid(body.conversation_id)) return send(context, 400, errorBody("INVALID_REQUEST", "Field 'conversation_id', when supplied, must be a valid UUID.", 400));
    conversationId = body.conversation_id;
  }
  let projectId = null;
  if (body.project_id != null) {
    if (!isUuid(body.project_id)) return send(context, 400, errorBody("INVALID_REQUEST", "Field 'project_id', when supplied, must be a valid UUID.", 400));
    projectId = body.project_id;
  }

  const byteSize = Buffer.byteLength(content, "utf8");
  const contentType = contentTypeFor(type);

  let client = null;
  let writtenBlobKey = null;
  try {
    client = await pool.connect();
    await client.query("BEGIN");
    await client.query(
      `SELECT set_config('app.current_user_id', $1, false),
              set_config('request.jwt.claim.sub', $1, false),
              set_config('request.jwt.claim.oid', $1, false)`,
      [oid]
    );

    // Verify any supplied parent is OWNED by the caller BEFORE linking (owner-scoped parent-link pattern;
    // mirrors the deployed theo_finalize_attachment, which checks theo_conversations WHERE id AND created_by).
    // The FKs alone are not enough — a foreign-owned parent row would satisfy the constraint and leak a
    // cross-user link. A foreign-owned OR absent parent fails deterministically 404 (no existence leak).
    if (conversationId) {
      const c = await client.query(
        `SELECT 1 FROM public.theo_conversations WHERE id = $1 AND created_by = $2`,
        [conversationId, oid]
      );
      if (c.rowCount === 0) throw buildKnownError("NOT_FOUND", "Referenced conversation not found.", 404);
    }
    if (projectId) {
      const p = await client.query(
        `SELECT 1 FROM public.theo_projects WHERE id = $1 AND created_by = $2`,
        [projectId, oid]
      );
      if (p.rowCount === 0) throw buildKnownError("NOT_FOUND", "Referenced project not found.", 404);
    }

    // Upsert-by-title (owner-scoped, case-insensitive) — mirrors the FE upsert(): a reused title adds
    // a new version; a new title creates the artifact at v1. The connection role bypasses RLS, so the
    // explicit created_by predicate enforces ownership.
    const existing = await client.query(
      `SELECT id, current_version FROM public.theo_artifacts
       WHERE created_by = $1 AND lower(title) = lower($2)
       ORDER BY updated_at DESC LIMIT 1`,
      [oid, title]
    );

    let artifactId;
    let versionNumber;
    if (existing.rowCount > 0) {
      artifactId = existing.rows[0].id;
      versionNumber = existing.rows[0].current_version + 1;
    } else {
      const created = await client.query(
        `INSERT INTO public.theo_artifacts (created_by, conversation_id, project_id, title, type, current_version)
         VALUES ($1, $2, $3, $4, $5, 1)
         RETURNING id`,
        [oid, conversationId, projectId, title, type]
      );
      artifactId = created.rows[0].id;
      versionNumber = 1;
    }

    const blobKey = `artifacts/${oid}/${artifactId}/v${versionNumber}.txt`;
    await putTextBlob(STORAGE_ACCOUNT, STORAGE_CONTAINER, blobKey, content, contentType);
    writtenBlobKey = blobKey;

    await client.query(
      `INSERT INTO public.theo_artifact_versions
         (created_by, artifact_id, version_number, blob_container, blob_path, byte_size, content_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [oid, artifactId, versionNumber, STORAGE_CONTAINER, blobKey, byteSize, contentType]
    );

    // Bump the pointer + type on an existing artifact (a re-version may change the type); leave the
    // original conversation_id/project_id linkage intact. On create, current_version is already 1.
    const updated = await client.query(
      `UPDATE public.theo_artifacts
       SET current_version = $1, type = $2, updated_at = now()
       WHERE id = $3 AND created_by = $4
       RETURNING id, conversation_id, project_id, title, type, current_version, created_at, updated_at`,
      [versionNumber, type, artifactId, oid]
    );
    if (updated.rowCount === 0) {
      // Should not happen (we just created/found it under this oid), but never leave a partial write.
      throw buildKnownError("NOT_FOUND", "Artifact not found.", 404);
    }

    await client.query("COMMIT");
    return send(context, existing.rowCount > 0 ? 200 : 201, successBody({ artifact: { ...updated.rows[0], version_number: versionNumber } }));
  } catch (err) {
    if (client) { try { await client.query("ROLLBACK"); } catch {} }
    if (writtenBlobKey) await deleteBlobBestEffort(context, STORAGE_ACCOUNT, STORAGE_CONTAINER, writtenBlobKey);
    context.log.error("theo_upsert_artifact failed", err);

    if (err && err.code === "42501") return send(context, 403, errorBody("FORBIDDEN", "You do not have access to this artifact.", 403));
    if (err && err.isKnown === true && typeof err.status === "number" && typeof err.code === "string") {
      return send(context, err.status, errorBody(err.code, err.message, err.status));
    }
    if (err && err.code === "23503") return send(context, 404, errorBody("NOT_FOUND", "Referenced conversation or project not found.", 404));
    if (err && err.code === "23514") return send(context, 400, errorBody("INVALID_REQUEST", "Artifact violates a field constraint.", 400));
    return send(context, 500, errorBody("INTERNAL_SERVER_ERROR", "An unexpected error occurred.", 500));
  } finally {
    if (client) client.release();
  }
};
