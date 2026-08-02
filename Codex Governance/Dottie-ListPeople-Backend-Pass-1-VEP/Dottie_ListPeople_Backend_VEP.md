# Dottie People-Roster Backend — Pass-1 VEP (dottie_list_people)

Second package of the FE↔backend reconciliation build-out (`spec/DOTTIE_THEO_RECONCILIATION.md` §C): the Vault Staff roster + live presence for Dottie's People panel / invite picker. The transplanted FE calls `theo_list_people`; Dottie lacked it, so the roster degraded to empty (greeting lost the first name, invite picker blank). This handler is a **byte-faithful mirror of the deployed `theo_list_people` primary reference**, whose single allowed delta is the route name, the Dottie-namespaced roster-group env var, the header comment, and the two `context.log` tags. **No DB, no Blob, no migration** — it is a read-only delegated **Microsoft Graph OBO** call (exchange the caller's bearer → Graph token → Vault Staff group members + presence + photos). Kudu-VFS deploy to `vaultgpt-func-dottie` + golden curls. On land, the FE `DOTTIE_CAPABILITIES.people` flag flips `true` in the paired gate/hide follow-up.

## Role-C completion — DEPLOYED + golden curls green (2026-08-01)
Codex Pass-2 **APPROVED** (HEAD `240fd3d`). Deployed `dottie_list_people` to `vaultgpt-func-dottie` via Kudu VFS (AAD Bearer): dir created, `index.js` (11903b) + `function.json` (297b) PUT, **GET-back byte-identical**, app restarted. Golden curls:
- **C1/C2** authenticated `GET` → `200` — roster of **9**; caller (self) `isSelf:true` sorted first; `photo` (data: URI), `availability` ("Available"), `jobTitle` populated; person keys `{id,displayName,email,jobTitle,availability,activity,photo,isSelf}` — no token/secret leakage. **This 200 is the end-to-end OBO proof** (the exchange + the 3 consented Graph scopes work on func-dottie).
- **C3** unauthenticated `GET` → `401` (EasyAuth fail-closed).
- **CORS** preflight (dev-SWA origin `https://brave-dune-0a97c7d03.7.azurestaticapps.net`) → `200` with matching `Access-Control-Allow-Origin` (platform CORS answers browser preflight; a bare `OPTIONS` without preflight headers gets EasyAuth `401`, which is expected and does not affect the FE).

Role-C docs updated same turn: `spec/DOTTIE_API_SPEC.md § People roster` (LIVE + curl matrix) and `spec/DOTTIE_THEO_RECONCILIATION.md §C/Summary` (→ backend LIVE). **FE un-gate deferred**: `DOTTIE_CAPABILITIES.people` → `true` lands bundled with the gate/hide package (which owns `swapBlock.ts` and is in Codex review) so the shared file isn't churned mid-review. Satisfies G-DEPLOY + G-APISPEC; G-UNGATE pending gate/hide.

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Verified Evidence Pack (backend handler; no migration)
Grounding parent (source baseline): `9d7170590e3fe4a07d2473c8294e17f52c8cbc3d` (vault-dottie, `development`) — anchors below are tip-independent blob SHAs
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD) |
| - | ------------------------------- | ------------------------------ | --------------------------------- |
| 1 | GOVERNING VISION — `governance/VAULT_MEMORY_ARCHITECTURE.md` (§A Amendment 9 — Dottie full agent; shared org roster) | `Read`(§A9) this turn | `3afda098df614b11adc8a7cdcf28d0f9a3f47011` |
| 2 | Backend Governor — `governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md` (§3 Never-Guess; §4 Reality Lock) | `Grep("Never-Guess")` this turn | `e44cdd85d3d0e5df332dc754cdec731e2e68022e` |
| 3 | Grounding Conformance — `governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR; §5 Rule Anchor) | `Grep("MUST open with a Grounding Conformance Receipt")` this turn | `7c0d902bdff3b6c0af475b483e31ed796214e57b` |
| 4 | Golden Handler — `governance/THEO_GOLDEN_HANDLER_STANDARD.md` (§2 primary reference = handler + function.json; §4 EXACT mirror / allowed delta; §5.1 Structural Mirror Table; §5.3 Golden Curl; §5.5 deploy) | `Grep("EXACT mirror")` this turn | `f8f0e5ea36447502e35fb87b373c94e376f05cbb` |
| 5 | Execution Orchestration — `governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md` (§1D ordered pass; §1E deploy-after-Codex-APPROVED) | `Grep("ordered, non-skippable")` this turn | `565559b699c1309f8e750b0dbbac859c13d807c8` |
| 6 | RECONCILIATION — `spec/DOTTIE_THEO_RECONCILIATION.md` (§C People — the gap this closes) | `Read`(§C) this turn | `34f415cfe7c5d8f4cb5f8329fab68b1732a14831` |
| 7 | **PRIMARY REFERENCE (DEPLOYED)** — `theo_list_people` handler + function.json (delegated Graph OBO roster+presence; the exact technique mirrored) | `Read`(PRIMARY_REFERENCE.theo_list_people.index.js, full) this turn; copy in-package | index.js `5ae78419dd7dd7b0873c6a97c197a09744ee508a`; function.json `fca156d9ba172f4eedb35b1d7f1c99abf51a2283` |

No ChatGPT advisory cited. No `reporting_*` change. Backend handler package (no migration; no write SQL).

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt" | GCR (head) |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §3 | "Never-Guess" | §3 — the OBO config + Graph scopes are az-VERIFIED present, not assumed |
| governance/THEO_GOLDEN_HANDLER_STANDARD.md | §4 | "EXACT mirror" | §5 — the handler EXACT-mirrors the deployed `theo_list_people` (allowed delta: route + roster-var + comment + log tags) |
| governance/THEO_GOLDEN_HANDLER_STANDARD.md | §2 | "deployed `function.json` file as the canonical Primary Reference" | §5 — the primary reference = handler index.js AND function.json (both inlined) |
| governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md | §1D | "ordered, non-skippable" | §8 — Codex → deploy → curls |

---

## §1 — Feature
One GET handler on `vaultgpt-func-dottie`, EasyAuth-gated:
- **`dottie_list_people`** — no body. Reads the "Vault Staff" group roster + live presence + 48×48 photos via delegated Microsoft Graph OBO. → `200 { data:{ people:[{ id, displayName, email, jobTitle, availability, activity, photo, isSelf }], self } }` (self first, then alphabetical). Errors: `401` (no EasyAuth identity, or no bearer to exchange), `403` (OBO/Graph forbidden), `500` (missing OBO config / unexpected). `OPTIONS`→`204`. Presence + photos are best-effort (null on failure; never fail the roster).

## §2 — Architecture & boundary
Read-only delegated Microsoft Graph via **On-Behalf-Of**: the caller's EasyAuth bearer (audience `api://4e1a1e31…`, the shared Vault GPT API app) is exchanged server-side for a Graph token using the API app's client credentials (`AAD_TENANT_ID`/`AAD_CLIENT_ID`/`AAD_CLIENT_SECRET`), then Graph is queried for the group members, their presence, and photos. **No DB, no Blob, no migration, no `theo_*`.** Identical OBO technique + env to the deployed `reporting_dms_tree` and to `theo_list_people` itself. Fail-closed: no identity → 401; no bearer → 401; missing OBO config → 500; Graph 401/403 → 403; unexpected → 500. Each person is keyed by Entra OID (the same identity used as `created_by` in `dottie_conversations`), so the roster aligns with conversation ownership with no re-lookup.

## §3 — Infra Reality Lock (Governor §3 Never-Guess — az-VERIFIED this turn)
No DB, so the "reality" this handler depends on is Azure identity infra. Verified live with `az` (not assumed):
- **`vaultgpt-func-dottie` app settings** present: `AAD_TENANT_ID`, `AAD_CLIENT_ID`, `AAD_CLIENT_SECRET` (the OBO middle-tier credentials). `AAD_CLIENT_ID = 4e1a1e31-5c20-4480-99e4-098901707d9e` = the shared Vault GPT API app = Dottie's own EasyAuth audience, so the incoming token is exchangeable.
- **API app `4e1a1e31` delegated Microsoft Graph scopes** include exactly the three the handler needs: `GroupMember.Read.All`, `Presence.Read.All`, `User.Read.All` (resolved from the app's `requiredResourceAccess` GUIDs against the Graph SP). These are the same app + scopes that power the **deployed, live `theo_list_people`**, so admin consent is already in place; the deploy-time golden curl (a `200` roster) is the end-to-end proof.
- **Roster group**: `DOTTIE_ROSTER_GROUP_ID` (unset on func-dottie) → the handler's hardcoded default `86a86cad-515e-4cad-bdb2-3434242e74b6` (the "Vault Staff" employeeId-gated dynamic group) — the same group Theo uses. Nothing invented.

## §4 — No migration / no DDL
Not applicable — the handler touches no database. Walter runs no SQL.

## §5 — Primary reference + Structural Mirror Table (Golden §2/§4/§5.1)
Canonical primary reference = the DEPLOYED `theo_list_people` (handler index.js AND function.json), inlined full-verbatim below. Classification:

| Region | Classification | Notes |
| ------ | -------------- | ----- |
| all helpers (`send`/`nowIso`/`errorBody`/`successBody`/`getPrincipal`/`getClaimValue`/`buildKnownError`/`parseJsonSafe`/`requestUrl`/`requestBinary`/`getBearerTokenFromAuthorization`/`getOboInputToken`/`exchangeGraphToken`/`graphGetJson`/`graphPostJson`/`fetchPhotoDataUri`) + the whole `module.exports` body (identity gate, OBO exchange, members/presence/photos, mapping, sort, error mapping) | **EXACT** | byte-identical to the deployed `theo_list_people` |
| the roster-group env var name (`THEO_ROSTER_GROUP_ID` → `DOTTIE_ROSTER_GROUP_ID`; same default group id); the header comment; the two `context.log` tags (`theo_list_people` → `dottie_list_people`) | **ALLOWED DELTA (adapted identity/name)** | no logic change; no scope/URL/shape change |

No DEVIATION regions. `function.json`: EXACT except the `route` (`theo_list_people` → `dottie_list_people`).

### §5.1 dottie_list_people (the mirror)
```javascript
const https = require("https");

// dottie_list_people — the Vault Staff roster + live presence for Dottie's People panel / invite
// picker (mirror of the deployed theo_list_people). Read-only. Delegated Microsoft Graph via
// ON-BEHALF-OF (OBO): the signed-in user's bearer token is exchanged for a Graph token server-side
// (same technique + env as the deployed reporting_dms_tree DMS handler: AAD_TENANT_ID / AAD_CLIENT_ID /
// AAD_CLIENT_SECRET, where AAD_CLIENT_ID = the shared "Vault GPT API" app that holds the admin-consented
// User.Read.All / Presence.Read.All / GroupMember.Read.All delegated scopes — the SAME app Dottie's
// EasyAuth audience uses, so no new consent is required). No DB, no Blob. Each person is keyed by
// Entra OID (the same identity used as created_by everywhere) so conversations key on OID with no re-lookup.

const ROSTER_GROUP_ID = process.env.DOTTIE_ROSTER_GROUP_ID || "86a86cad-515e-4cad-bdb2-3434242e74b6"; // "Vault Staff" dynamic group (employeeId-based)
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
        context.log.warn("dottie_list_people: presence fetch failed (roster still returned)", e);
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
    context.log.error("dottie_list_people failed", err);
    if (err && err.isKnown === true && typeof err.status === "number" && typeof err.code === "string") {
      return send(context, err.status, errorBody(err.code, err.message, err.status));
    }
    return send(context, 500, errorBody("INTERNAL_SERVER_ERROR", "An unexpected error occurred.", 500));
  }
};
```

```json
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["get", "options"],
      "route": "dottie_list_people"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

### §5.2 Primary reference (deployed `theo_list_people`, full-verbatim)
```javascript
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
```

```json
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["get", "options"],
      "route": "theo_list_people"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

## §6 — Golden Curls (Golden §5.3; Claude runs post-deploy)
Authenticated `az` bearer (audience `api://4e1a1e31-…`, whose OBO exchange the handler performs).
| # | Call | Expect |
| - | ---- | ------ |
| C1 | `GET /api/dottie_list_people` (authenticated) | `200 { data:{ people:[…], self:<oid> } }`; the caller's own row present with `isSelf:true`, sorted first; `availability` populated for online staff |
| C2 | inspect C1 payload | each person has `id` (OID), `displayName`, `email`, `jobTitle`, `photo` (data: URI or null); no secret/token leakage |
| C3 | `GET /api/dottie_list_people` unauthenticated (no bearer) | `401` (EasyAuth fail-closed before the handler) |
| C4 | `OPTIONS /api/dottie_list_people` | `204` (CORS preflight) |

(A `200` roster in C1 is the end-to-end proof that the OBO exchange + the three consented Graph scopes work on func-dottie — the Infra Reality Lock's live confirmation.)

## §7 — Gap Register
**PROCEED.** No missing CURRENT authority.
- **G-1 (rest of the reconciliation): PROCEED (subsequent governed packages).** Attachments, artifacts, voice, image/video are their own packages per `spec/DOTTIE_THEO_RECONCILIATION.md`. Projects hidden (Walter). Disclosed.
- **G-UNGATE: PRE-LAND (paired FE one-liner).** On land, `DOTTIE_CAPABILITIES.people` flips `true` in `swapBlock.ts` so `listPeople()` stops short-circuiting to `[]` and the greeting/invite-picker light up — a one-line change bundled with this package's FE follow-up (the un-gate pattern from the gate/hide package). Disclosed.
- **G-APISPEC: PRE-LAND (Role-C post-deploy)** — add `dottie_list_people` to `spec/DOTTIE_API_SPEC.md` + flip reconciliation §C to ✅ LIVE. Disclosed.

## §8 — Deploy plan (ordered; §1D)
1. Codex Pass-2 → APPROVED/REJECTED. 2. Claude Kudu-VFS deploys `dottie_list_people` to `vaultgpt-func-dottie` (create dir; PUT `index.js`+`function.json`; GET-back byte-identical; restart; syncfunctiontriggers). No new app settings needed (`AAD_*` already present; roster-group default hardcoded). 3. Claude runs §6 curls. No migration. 4. Role-C: API spec + reconciliation §C → LIVE; flip `DOTTIE_CAPABILITIES.people` true (paired FE).

## Codex activation note (Walter forwards)

```
Codex is activated for Pass-2 review of Dottie People-Roster (dottie_list_people), vault-dottie,
"Codex Governance/Dottie-ListPeople-Backend-Pass-1-VEP/Dottie_ListPeople_Backend_VEP.md". Open with a
governance-bound GCR + Rule Anchor Table. HANDLER-ONLY, NO DB / NO MIGRATION — it is a read-only delegated
Microsoft Graph OBO roster (mirror of the deployed theo_list_people; Claude Kudu-VFS deploy to func-dottie +
golden curls). Second package of the FE<->backend reconciliation (spec/DOTTIE_THEO_RECONCILIATION.md §C).
Review: (1) the handler is a byte-faithful EXACT mirror of the deployed theo_list_people primary reference
(§5), the ONLY delta being the route name, the DOTTIE_ROSTER_GROUP_ID env var (same default group), the
header comment, and the two context.log tags — confirm the OBO exchange, Graph queries, mapping, sort, and
error mapping are byte-identical. (2) Infra Reality Lock (§3) — the OBO config (AAD_* on func-dottie) and the
three delegated Graph scopes (GroupMember/Presence/User.Read.All on the shared API app 4e1a1e31) are az-VERIFIED
present, not assumed; a 200 golden curl is the end-to-end proof. (3) fail-closed 401/403/500; presence+photos
best-effort. (4) deploy plan. Emit APPROVED or REJECTED only.
```
