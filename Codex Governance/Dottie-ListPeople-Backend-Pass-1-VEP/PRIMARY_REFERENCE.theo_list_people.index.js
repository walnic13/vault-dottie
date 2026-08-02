const https = require("https");

// theo_list_people (Tier B5/Phase 2A) — the Vault Staff roster + live presence for the vault-origin
// "People" panel. Read-only. Delegated Microsoft Graph via ON-BEHALF-OF (OBO): the signed-in user's
// bearer token is exchanged for a Graph token server-side (same technique + env as the deployed
// reporting_dms_tree DMS handler on this monolith: AAD_TENANT_ID / AAD_CLIENT_ID / AAD_CLIENT_SECRET,
// where AAD_CLIENT_ID = the "Vault GPT API" app that holds the admin-consented User.Read.All /
// Presence.Read.All / GroupMember.Read.All delegated scopes). No DB, no Blob. Each person is keyed by
// Entra OID (the same identity used as created_by everywhere) so the future in-Vault chat can key
// conversations on OID pairs with no re-lookup.

const ROSTER_GROUP_ID = process.env.THEO_ROSTER_GROUP_ID || "86a86cad-515e-4cad-bdb2-3434242e74b6"; // "Vault Staff" dynamic group (employeeId-based)
const GRAPH = "https://graph.microsoft.com/v1.0";

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
    if (match && typeof match.val === "string" && match.val.trim() !== "") return match.val.trim();
  }
  return null;
}

function buildKnownError(code, message, status) {
  const err = new Error(message);
  err.code = code; err.status = status; err.isKnown = true;
  return err;
}

function parseJsonSafe(raw) {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  try { return JSON.parse(raw); } catch { return null; }
}

// ── HTTP + OBO→Graph (verbatim technique from the deployed reporting_dms_tree) ──────────────
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
        res.on("data", (chunk) => { data += chunk; });
        res.on("end", () => { resolve({ statusCode: res.statusCode || 0, headers: res.headers || {}, body: data }); });
      }
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

// Binary variant (photo bytes): collect Buffer chunks (must NOT coerce to string).
function requestBinary(urlStr, options = {}) {
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
        const chunks = [];
        res.on("data", (chunk) => { chunks.push(chunk); });
        res.on("end", () => { resolve({ statusCode: res.statusCode || 0, headers: res.headers || {}, body: Buffer.concat(chunks) }); });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

function getBearerTokenFromAuthorization(req) {
  const raw = req.headers["authorization"];
  if (!raw || typeof raw !== "string") return null;
  const match = raw.match(/^Bearer\s+(.+)$/i);
  return match && match[1] ? match[1].trim() : null;
}

function getOboInputToken(req) {
  const bearer = getBearerTokenFromAuthorization(req);
  if (bearer) {
    return {
      token: bearer,
      source: "authorization_bearer",
    };
  }

  const tokenStore = req.headers["x-ms-token-aad-access-token"];
  if (typeof tokenStore === "string" && tokenStore.trim() !== "") {
    return {
      token: tokenStore.trim(),
      source: "x-ms-token-aad-access-token",
    };
  }

  return null;
}

async function exchangeGraphToken(oboInputToken) {
  const tenantId = process.env.AAD_TENANT_ID;
  const clientId = process.env.AAD_CLIENT_ID;
  const clientSecret = process.env.AAD_CLIENT_SECRET;
  if (!tenantId || !clientId || !clientSecret) {
    throw buildKnownError("INTERNAL_SERVER_ERROR", "Missing required OBO configuration.", 500);
  }
  const form = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    requested_token_use: "on_behalf_of",
    assertion: oboInputToken,
    scope: "https://graph.microsoft.com/.default",
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
    const message = description ? `Delegated Graph token exchange failed: ${description}` : "Delegated Graph token exchange failed.";
    if (r.statusCode === 400 || r.statusCode === 401 || r.statusCode === 403) throw buildKnownError("FORBIDDEN", message, 403);
    throw buildKnownError("INTERNAL_SERVER_ERROR", message, 500);
  }
  return payload.access_token;
}

async function graphGetJson(url, accessToken) {
  const r = await requestUrl(url, { method: "GET", headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" } });
  const payload = parseJsonSafe(r.body);
  if (r.statusCode < 200 || r.statusCode >= 300) {
    const message = (payload && payload.error && payload.error.message) || `Graph request failed (HTTP ${r.statusCode}).`;
    if (r.statusCode === 401 || r.statusCode === 403) throw buildKnownError("FORBIDDEN", message, 403);
    throw buildKnownError("INTERNAL_SERVER_ERROR", message, 500);
  }
  return payload || {};
}

async function graphPostJson(url, accessToken, bodyObj) {
  const body = JSON.stringify(bodyObj);
  const r = await requestUrl(
    url,
    { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) } },
    body
  );
  const payload = parseJsonSafe(r.body);
  if (r.statusCode < 200 || r.statusCode >= 300) {
    const message = (payload && payload.error && payload.error.message) || `Graph request failed (HTTP ${r.statusCode}).`;
    if (r.statusCode === 401 || r.statusCode === 403) throw buildKnownError("FORBIDDEN", message, 403);
    throw buildKnownError("INTERNAL_SERVER_ERROR", message, 500);
  }
  return payload || {};
}

// Best-effort 48x48 profile photo → data URI (null when absent/forbidden/any failure). Never fails the roster.
async function fetchPhotoDataUri(oid, accessToken) {
  try {
    const r = await requestBinary(`${GRAPH}/users/${encodeURIComponent(oid)}/photos/48x48/$value`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (r.statusCode < 200 || r.statusCode >= 300 || !r.body || r.body.length === 0) return null;
    const contentType = (r.headers["content-type"] || "image/jpeg").split(";")[0].trim();
    return `data:${contentType};base64,${r.body.toString("base64")}`;
  } catch {
    return null;
  }
}

module.exports = async function (context, req) {
  if (req.method === "OPTIONS") return send(context, 204, "");

  const principal = getPrincipal(req);
  const callerOid = getClaimValue(principal, [
    "http://schemas.microsoft.com/identity/claims/objectidentifier",
    "oid",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
  ]);
  if (!callerOid) return send(context, 401, errorBody("UNAUTHORIZED", "Missing or invalid EasyAuth identity.", 401));

  const oboInput = getOboInputToken(req);
  if (!oboInput) return send(context, 401, errorBody("UNAUTHORIZED", "Missing bearer token for delegated Graph access.", 401));

  try {
    const graphToken = await exchangeGraphToken(oboInput.token);

    // 1) Vault Staff members (users only, selected fields). The group is the employeeId-gated roster.
    const membersRes = await graphGetJson(
      `${GRAPH}/groups/${encodeURIComponent(ROSTER_GROUP_ID)}/members/microsoft.graph.user?$select=id,displayName,mail,userPrincipalName,jobTitle&$top=999`,
      graphToken
    );
    const members = Array.isArray(membersRes.value) ? membersRes.value : [];
    const ids = members.map((m) => m.id).filter((id) => typeof id === "string" && id);

    // 2) Live presence for those ids (best-effort — a presence failure yields null availability, never
    // fails the roster). getPresencesByUserId accepts up to 650 ids; the roster is far smaller.
    const presenceById = new Map();
    if (ids.length) {
      try {
        const presRes = await graphPostJson(`${GRAPH}/communications/getPresencesByUserId`, graphToken, { ids });
        for (const p of (Array.isArray(presRes.value) ? presRes.value : [])) {
          if (p && typeof p.id === "string") presenceById.set(p.id, { availability: p.availability || null, activity: p.activity || null });
        }
      } catch (e) {
        context.log.warn("theo_list_people: presence fetch failed (roster still returned)", e);
      }
    }

    // 3) Photos (best-effort, parallel; null when absent). Small roster → a handful of calls.
    const photos = await Promise.all(members.map((m) => fetchPhotoDataUri(m.id, graphToken)));

    const people = members.map((m, i) => {
      const pres = presenceById.get(m.id) || { availability: null, activity: null };
      return {
        id: m.id,                                   // Entra OID — canonical person key (chat-forward)
        displayName: m.displayName || m.userPrincipalName || "Unknown",
        email: m.mail || m.userPrincipalName || null,
        jobTitle: m.jobTitle || null,
        availability: pres.availability,            // Available | Busy | Away | BeRightBack | DoNotDisturb | Offline | ...
        activity: pres.activity,
        photo: photos[i],                           // data: URI or null
        isSelf: m.id === callerOid,
      };
    });

    // Self first, then alphabetical by display name — the panel shows "you" at the top.
    people.sort((a, b) => (a.isSelf === b.isSelf ? a.displayName.localeCompare(b.displayName) : a.isSelf ? -1 : 1));

    return send(context, 200, successBody({ people, self: callerOid }));
  } catch (err) {
    context.log.error("theo_list_people failed", err);
    if (err && err.isKnown === true && typeof err.status === "number" && typeof err.code === "string") {
      return send(context, err.status, errorBody(err.code, err.message, err.status));
    }
    return send(context, 500, errorBody("INTERNAL_SERVER_ERROR", "An unexpected error occurred.", 500));
  }
};
