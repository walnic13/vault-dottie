# Dottie Conversation-Management Backend — Pass-1 VEP (dottie_delete/rename/set_starred)

First package of the FE↔backend reconciliation build-out (`spec/DOTTIE_THEO_RECONCILIATION.md` §B): the three conversation-management handlers the transplanted FE already calls but Dottie's backend lacked — so **delete / rename / star error today**. Each is a **byte-faithful mirror of its deployed Theo primary reference** (`theo_delete_conversation` / `theo_rename_conversation` / `theo_set_conversation_starred`), with the single allowed delta being the table + exists-helper name (`theo_conversations`→`dottie_conversations`, `theo_conversation_exists_unscoped`→`dottie_conversation_exists_unscoped`). **No migration** (the `dottie_conversations` columns `title`/`starred`/`updated_at` + the exists helper landed in D1). Kudu-VFS deploy to `vaultgpt-func-dottie` + golden curls.

## Repair note (rev-2 — addresses Codex REJECT T13 / T4)
- **T13 (FE still calls `theo_*`):** the FE gateway (`gateway.live.ts`) is now repointed for these three —
  `deleteConversation`/`renameConversation`/`setConversationStarred` call `/api/dottie_delete_conversation` /
  `dottie_rename_conversation` / `dottie_set_conversation_starred`. So this package + the paired FE repoint
  CLOSE the live error path together (they land together — see §8). The FE repoint extends the Foundation
  gateway-repoint (same pattern, same FE package family).
- **T4 (function.json anchors):** GCR rows 7-9 now carry concrete blob SHAs for BOTH the primary-reference
  `index.js` AND its deployed `function.json` (the Golden Handler canonical pair).

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Verified Evidence Pack (backend handlers; no migration)
Grounding parent (source baseline): `7a957cc0ddc59c3a7b0f8c36b1b1927ffad8eb8b` (vault-dottie, `development`) — carried at a later reviewed commit named in the Codex note; anchors below are tip-independent blob SHAs
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD) |
| - | ------------------------------- | ------------------------------ | --------------------------------- |
| 1 | GOVERNING VISION — `governance/VAULT_MEMORY_ARCHITECTURE.md` (§A Amendment 9 — Dottie full agent) | `Read`(§A9) this turn | `3afda098df614b11adc8a7cdcf28d0f9a3f47011` |
| 2 | Backend Governor — `governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md` (§3 Never-Guess; §4 Schema Reality Lock) | `Grep("Never-Guess")` this turn | `e44cdd85d3d0e5df332dc754cdec731e2e68022e` |
| 3 | Grounding Conformance — `governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR; §5 Rule Anchor) | `Grep("MUST open with a Grounding Conformance Receipt")` this turn | `7c0d902bdff3b6c0af475b483e31ed796214e57b` |
| 4 | Golden Handler — `governance/THEO_GOLDEN_HANDLER_STANDARD.md` (§2 primary reference = handler + function.json; §4 EXACT mirror / allowed delta; §5.1 Structural Mirror Table; §5.3 Golden Curl; §5.5 deploy) | `Grep("EXACT mirror")` this turn | `f8f0e5ea36447502e35fb87b373c94e376f05cbb` |
| 5 | Execution Orchestration — `governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md` (§1D ordered pass; §1E deploy-after-Codex-APPROVED) | `Grep("ordered, non-skippable")` this turn | `565559b699c1309f8e750b0dbbac859c13d807c8` |
| 6 | SCHEMA TRUTH — `spec/DOTTIE_AZURE_POSTGRES_SCHEMA.md` (the deployed D1 `dottie_conversations` incl. `title`/`starred`/`updated_at` + `dottie_conversation_exists_unscoped`) | `Read`(§3/§4) this turn | `bb096db53a8d76dc3589b3744f6492ddad8f1f7f` |
| 7 | **PRIMARY REFERENCE 1 (DEPLOYED)** — `theo_delete_conversation` handler + function.json (func-premium; the DELETE + owner-gate/exists-discrimination mirrored) | `Read`(theo_delete_conversation.index.js, full) this turn; copy in-package | index.js `f4f0c9d8b72c0abf570eba78a139787f74e8c149`; function.json `ab35a53652e16c3e5b70a1c6225e51dbf6f75030` |
| 8 | **PRIMARY REFERENCE 2 (DEPLOYED)** — `theo_rename_conversation` handler + function.json (UPDATE title + updated_at; owner-gate) | `Read`(theo_rename_conversation.index.js, full) this turn; copy in-package | index.js `f796183d4b5b359e069e16689e7d1efe1343b403`; function.json `75296005caee18324f8a5365dcdd8db1a4726ea0` |
| 9 | **PRIMARY REFERENCE 3 (DEPLOYED)** — `theo_set_conversation_starred` handler + function.json (UPDATE starred; body `{conversation_id, starred}`) | `Read`(theo_set_conversation_starred.index.js, full) this turn; copy in-package | index.js `e7cc90058d40a40bbfd520d9ae469d6ce89b5024`; function.json `523eaac4557b89e654d2063bf9e3fe7149cb90b1` |

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt" | GCR (head) |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §4 | "Schema Reality Lock" | §3 — reads/writes only the deployed D1 dottie_conversations columns |
| governance/THEO_GOLDEN_HANDLER_STANDARD.md | §4 | "EXACT mirror" | §5 — each handler EXACT-mirrors its deployed Theo primary reference (allowed delta: table + exists-helper name) |
| governance/THEO_GOLDEN_HANDLER_STANDARD.md | §2 | "deployed `function.json` file as the canonical Primary Reference" | §5 — each primary reference = handler index.js AND function.json (both inlined) |
| governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md | §1D | "ordered, non-skippable" | §9 — Codex → deploy → curls |

---

## §1 — Feature
Three POST handlers on `vaultgpt-func-dottie`, EasyAuth-gated, owner-scoped (`created_by = oid`):
- **`dottie_delete_conversation`** — body `{ id:uuid }` → permanently deletes the caller's conversation (`dottie_messages` cascade per the D1 FK). `200 { data:{ deleted:true, id } }`.
- **`dottie_rename_conversation`** — body `{ id:uuid, title:string }` (≤200) → updates `title` + `updated_at`. `200 { data:{ conversation } }`.
- **`dottie_set_conversation_starred`** — body `{ conversation_id:uuid, starred:boolean }` → updates `starred`. `200 { data:{ conversation_id, starred } }`.
Errors (all): `401` (no identity), `400` (bad body/uuid/title), `403`/`404` (owner-gate via `dottie_conversation_exists_unscoped`), `500`. `OPTIONS`→`204`.

## §2 — Architecture & boundary
Owner-only mutation of the caller's own `dottie_conversations` rows, byte-faithful to the deployed Theo conversation-management handlers. Same envelope/pool/`set_config`/EasyAuth/owner-gate the D2 trio already uses. No `theo_*`, no cross-app reads, no Blob, no migration. Fail-closed: no identity→401; non-owned id→403 (exists)/404 (absent); `42501`→403; unexpected→500 with ROLLBACK.

## §3 — Schema Reality Lock
DEPLOYED D1 (schema doc §3/§4, GCR row 6, catalog-verified): `dottie_conversations` has `title text`, `starred boolean`, `updated_at timestamptz`, and `dottie_conversation_exists_unscoped(uuid)`; `dottie_messages.conversation_id` FK is `ON DELETE CASCADE`. Nothing invented (Governor §4). No DDL.

## §4 — No migration
Handler-only. The columns + exists helper + cascade FK landed in D1 (Walter-run, catalog-verified). Walter runs no SQL.

## §5 — Primary references + Structural Mirror Tables (Golden §2/§4/§5.1)
Each handler's canonical primary reference = its DEPLOYED Theo original (handler index.js AND function.json), inlined full-verbatim. Classification for all three:

| Region | Classification | Notes |
| ------ | -------------- | ----- |
| envelope + helpers (`corsHeaders`/`send`/`nowIso`/`errorBody`/`successBody`/`getPrincipal`/`getClaimValue`/`parseBody`/`buildKnownError`/`isUuid`) + pool + `set_config` + input validation + owner-gate + exists-discrimination + error mapping | **EXACT** | byte-identical to the Theo primary reference |
| the table + exists-helper name in the SQL (`theo_conversations`→`dottie_conversations`; `theo_conversation_exists_unscoped`→`dottie_conversation_exists_unscoped`); the `context.log.error` tag | **ALLOWED DELTA (adapted table)** | the only change; SQL structure identical |
| (delete only) the FK-behavior comment | **ALLOWED DELTA** | `dottie_messages` cascade; Dottie has no attachments yet |

No DEVIATION regions. `function.json`: EXACT except the `route` (=handler name).

### §5.1 dottie_delete_conversation
```javascript
const { Pool } = require("pg");

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

  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!isUuid(id)) {
    return send(context, 400, errorBody("INVALID_REQUEST", "Field 'id' is required and must be a valid UUID.", 400));
  }

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

    // Explicit ownership scope (connection role bypasses RLS): permanent delete of the caller's own
    // conversation. dottie_messages CASCADE (deleted with the thread) per the deployed D1 FK. Dottie has no attachments yet.
    const deleted = await client.query(
      `DELETE FROM public.dottie_conversations WHERE id = $1 AND created_by = $2 RETURNING id`,
      [id, oid]
    );

    if (deleted.rowCount === 0) {
      const existsResult = await client.query(
        `SELECT public.dottie_conversation_exists_unscoped($1::uuid) AS e`,
        [id]
      );
      const exists = existsResult.rows[0] && existsResult.rows[0].e === true;
      throw exists
        ? buildKnownError("FORBIDDEN", "You do not have access to this conversation.", 403)
        : buildKnownError("NOT_FOUND", "Conversation not found.", 404);
    }

    await client.query("COMMIT");

    return send(context, 200, successBody({ deleted: true, id: deleted.rows[0].id }));
  } catch (err) {
    if (client) {
      try { await client.query("ROLLBACK"); } catch {}
    }

    context.log.error("dottie_delete_conversation failed", err);

    if (err && err.code === "42501") {
      return send(context, 403, errorBody("FORBIDDEN", "You do not have access to this conversation.", 403));
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
```

```json
{
  "bindings": [
    { "authLevel": "anonymous", "type": "httpTrigger", "direction": "in", "name": "req", "methods": ["post", "options"], "route": "dottie_delete_conversation" },
    { "type": "http", "direction": "out", "name": "res" }
  ]
}
```

Primary reference (deployed `theo_delete_conversation`):
```javascript
const { Pool } = require("pg");

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

  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!isUuid(id)) {
    return send(context, 400, errorBody("INVALID_REQUEST", "Field 'id' is required and must be a valid UUID.", 400));
  }

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

    // Explicit ownership scope (connection role bypasses RLS): permanent delete of the caller's own
    // conversation. theo_messages CASCADE (deleted with the thread); theo_attachments.conversation_id
    // SET NULL (attachments survive, unlinked) per the deployed FKs (Schema §3).
    const deleted = await client.query(
      `DELETE FROM public.theo_conversations WHERE id = $1 AND created_by = $2 RETURNING id`,
      [id, oid]
    );

    if (deleted.rowCount === 0) {
      const existsResult = await client.query(
        `SELECT public.theo_conversation_exists_unscoped($1::uuid) AS e`,
        [id]
      );
      const exists = existsResult.rows[0] && existsResult.rows[0].e === true;
      throw exists
        ? buildKnownError("FORBIDDEN", "You do not have access to this conversation.", 403)
        : buildKnownError("NOT_FOUND", "Conversation not found.", 404);
    }

    await client.query("COMMIT");

    return send(context, 200, successBody({ deleted: true, id: deleted.rows[0].id }));
  } catch (err) {
    if (client) {
      try { await client.query("ROLLBACK"); } catch {}
    }

    context.log.error("theo_delete_conversation failed", err);

    if (err && err.code === "42501") {
      return send(context, 403, errorBody("FORBIDDEN", "You do not have access to this conversation.", 403));
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
```

```json
{
  "bindings": [
    { "authLevel": "anonymous", "type": "httpTrigger", "direction": "in", "name": "req", "methods": ["post", "options"], "route": "theo_delete_conversation" },
    { "type": "http", "direction": "out", "name": "res" }
  ]
}
```

### §5.2 dottie_rename_conversation
```javascript
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
});

const TITLE_MAX_LEN = 200;

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

  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!isUuid(id)) {
    return send(context, 400, errorBody("INVALID_REQUEST", "Field 'id' is required and must be a valid UUID.", 400));
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (title === "") {
    return send(context, 400, errorBody("INVALID_REQUEST", "Field 'title' is required and must be a non-empty string.", 400));
  }
  if (title.length > TITLE_MAX_LEN) {
    return send(context, 400, errorBody("INVALID_REQUEST", `Field 'title' must be at most ${TITLE_MAX_LEN} characters.`, 400));
  }

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

    // Explicit ownership scope (connection role bypasses RLS): id AND created_by = the signed-in OID.
    const updated = await client.query(
      `
      UPDATE public.dottie_conversations
      SET title = $1, updated_at = now()
      WHERE id = $2 AND created_by = $3
      RETURNING id, title
      `,
      [title, id, oid]
    );

    if (updated.rowCount === 0) {
      const existsResult = await client.query(
        `SELECT public.dottie_conversation_exists_unscoped($1::uuid) AS e`,
        [id]
      );
      const exists = existsResult.rows[0] && existsResult.rows[0].e === true;
      throw exists
        ? buildKnownError("FORBIDDEN", "You do not have access to this conversation.", 403)
        : buildKnownError("NOT_FOUND", "Conversation not found.", 404);
    }

    await client.query("COMMIT");

    return send(context, 200, successBody({ conversation: updated.rows[0] }));
  } catch (err) {
    if (client) {
      try { await client.query("ROLLBACK"); } catch {}
    }

    context.log.error("dottie_rename_conversation failed", err);

    if (err && err.code === "42501") {
      return send(context, 403, errorBody("FORBIDDEN", "You do not have access to this conversation.", 403));
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
```

```json
{
  "bindings": [
    { "authLevel": "anonymous", "type": "httpTrigger", "direction": "in", "name": "req", "methods": ["post", "options"], "route": "dottie_rename_conversation" },
    { "type": "http", "direction": "out", "name": "res" }
  ]
}
```

Primary reference (deployed `theo_rename_conversation`):
```javascript
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
});

const TITLE_MAX_LEN = 200;

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

  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!isUuid(id)) {
    return send(context, 400, errorBody("INVALID_REQUEST", "Field 'id' is required and must be a valid UUID.", 400));
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (title === "") {
    return send(context, 400, errorBody("INVALID_REQUEST", "Field 'title' is required and must be a non-empty string.", 400));
  }
  if (title.length > TITLE_MAX_LEN) {
    return send(context, 400, errorBody("INVALID_REQUEST", `Field 'title' must be at most ${TITLE_MAX_LEN} characters.`, 400));
  }

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

    // Explicit ownership scope (connection role bypasses RLS): id AND created_by = the signed-in OID.
    const updated = await client.query(
      `
      UPDATE public.theo_conversations
      SET title = $1, updated_at = now()
      WHERE id = $2 AND created_by = $3
      RETURNING id, title
      `,
      [title, id, oid]
    );

    if (updated.rowCount === 0) {
      const existsResult = await client.query(
        `SELECT public.theo_conversation_exists_unscoped($1::uuid) AS e`,
        [id]
      );
      const exists = existsResult.rows[0] && existsResult.rows[0].e === true;
      throw exists
        ? buildKnownError("FORBIDDEN", "You do not have access to this conversation.", 403)
        : buildKnownError("NOT_FOUND", "Conversation not found.", 404);
    }

    await client.query("COMMIT");

    return send(context, 200, successBody({ conversation: updated.rows[0] }));
  } catch (err) {
    if (client) {
      try { await client.query("ROLLBACK"); } catch {}
    }

    context.log.error("theo_rename_conversation failed", err);

    if (err && err.code === "42501") {
      return send(context, 403, errorBody("FORBIDDEN", "You do not have access to this conversation.", 403));
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
```

```json
{
  "bindings": [
    { "authLevel": "anonymous", "type": "httpTrigger", "direction": "in", "name": "req", "methods": ["post", "options"], "route": "theo_rename_conversation" },
    { "type": "http", "direction": "out", "name": "res" }
  ]
}
```

### §5.3 dottie_set_conversation_starred
```javascript
const { Pool } = require("pg");

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

  const ALLOWED_BODY_KEYS = new Set(["conversation_id", "starred"]);
  const unknownKey = Object.keys(body || {}).find((k) => !ALLOWED_BODY_KEYS.has(k));
  if (unknownKey) {
    return send(context, 400, errorBody("INVALID_REQUEST", `Unknown field '${unknownKey}'.`, 400));
  }

  const conversationId = typeof body.conversation_id === "string" ? body.conversation_id.trim() : "";
  if (!isUuid(conversationId)) {
    return send(context, 400, errorBody("INVALID_REQUEST", "Field 'conversation_id' is required and must be a valid UUID.", 400));
  }
  if (typeof body.starred !== "boolean") {
    return send(context, 400, errorBody("INVALID_REQUEST", "Field 'starred' is required and must be a boolean.", 400));
  }
  const starred = body.starred;

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

    // Owner-scoped star toggle. Deliberately does NOT bump updated_at — starring is metadata, not
    // activity, so it must not re-order Recents (which sorts by last-touched). 0 rows → 403
    // (existing-foreign) / 404 (absent) via the shared exists-unscoped helper.
    const updated = await client.query(
      `
      UPDATE public.dottie_conversations
      SET starred = $1
      WHERE id = $2 AND created_by = $3
      RETURNING starred
      `,
      [starred, conversationId, oid]
    );
    if (updated.rowCount === 0) {
      const existsResult = await client.query(
        `SELECT public.dottie_conversation_exists_unscoped($1::uuid) AS e`,
        [conversationId]
      );
      const exists = existsResult.rows[0] && existsResult.rows[0].e === true;
      throw exists
        ? buildKnownError("FORBIDDEN", "You do not have access to this conversation.", 403)
        : buildKnownError("NOT_FOUND", "Conversation not found.", 404);
    }

    await client.query("COMMIT");

    return send(context, 200, successBody({ conversation_id: conversationId, starred: updated.rows[0].starred }));
  } catch (err) {
    if (client) {
      try { await client.query("ROLLBACK"); } catch {}
    }

    context.log.error("dottie_set_conversation_starred failed", err);

    if (err && err.code === "42501") {
      return send(context, 403, errorBody("FORBIDDEN", "You do not have access to this conversation.", 403));
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
```

```json
{
  "bindings": [
    { "authLevel": "anonymous", "type": "httpTrigger", "direction": "in", "name": "req", "methods": ["post", "options"], "route": "dottie_set_conversation_starred" },
    { "type": "http", "direction": "out", "name": "res" }
  ]
}
```

Primary reference (deployed `theo_set_conversation_starred`):
```javascript
const { Pool } = require("pg");

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

  const ALLOWED_BODY_KEYS = new Set(["conversation_id", "starred"]);
  const unknownKey = Object.keys(body || {}).find((k) => !ALLOWED_BODY_KEYS.has(k));
  if (unknownKey) {
    return send(context, 400, errorBody("INVALID_REQUEST", `Unknown field '${unknownKey}'.`, 400));
  }

  const conversationId = typeof body.conversation_id === "string" ? body.conversation_id.trim() : "";
  if (!isUuid(conversationId)) {
    return send(context, 400, errorBody("INVALID_REQUEST", "Field 'conversation_id' is required and must be a valid UUID.", 400));
  }
  if (typeof body.starred !== "boolean") {
    return send(context, 400, errorBody("INVALID_REQUEST", "Field 'starred' is required and must be a boolean.", 400));
  }
  const starred = body.starred;

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

    // Owner-scoped star toggle. Deliberately does NOT bump updated_at — starring is metadata, not
    // activity, so it must not re-order Recents (which sorts by last-touched). 0 rows → 403
    // (existing-foreign) / 404 (absent) via the shared exists-unscoped helper.
    const updated = await client.query(
      `
      UPDATE public.theo_conversations
      SET starred = $1
      WHERE id = $2 AND created_by = $3
      RETURNING starred
      `,
      [starred, conversationId, oid]
    );
    if (updated.rowCount === 0) {
      const existsResult = await client.query(
        `SELECT public.theo_conversation_exists_unscoped($1::uuid) AS e`,
        [conversationId]
      );
      const exists = existsResult.rows[0] && existsResult.rows[0].e === true;
      throw exists
        ? buildKnownError("FORBIDDEN", "You do not have access to this conversation.", 403)
        : buildKnownError("NOT_FOUND", "Conversation not found.", 404);
    }

    await client.query("COMMIT");

    return send(context, 200, successBody({ conversation_id: conversationId, starred: updated.rows[0].starred }));
  } catch (err) {
    if (client) {
      try { await client.query("ROLLBACK"); } catch {}
    }

    context.log.error("theo_set_conversation_starred failed", err);

    if (err && err.code === "42501") {
      return send(context, 403, errorBody("FORBIDDEN", "You do not have access to this conversation.", 403));
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
```

```json
{
  "bindings": [
    { "authLevel": "anonymous", "type": "httpTrigger", "direction": "in", "name": "req", "methods": ["post", "options"], "route": "theo_set_conversation_starred" },
    { "type": "http", "direction": "out", "name": "res" }
  ]
}
```

## §6 — Golden Curls (Golden §5.3; Claude runs post-deploy)
Authenticated `az` bearer (audience `api://4e1a1e31-…`). Seed a conversation via `dottie_message` (C0).
| # | Call | Expect |
| - | ---- | ------ |
| C1 | `POST /api/dottie_rename_conversation` `{id:<C0>, title:"Renamed"}` | 200 `{conversation:{id,title:"Renamed"}}`; then `dottie_get_conversation` shows the new title |
| C2 | `POST /api/dottie_set_conversation_starred` `{conversation_id:<C0>, starred:true}` | 200 `{starred:true}`; `dottie_list_conversations` shows `starred:true` |
| C3 | `POST /api/dottie_delete_conversation` `{id:<C0>}` | 200 `{deleted:true}`; `dottie_get_conversation` → 404 |
| C4 | each with `{}` / bad uuid | 400 |
| C5 | each with a random uuid | 404 |
| C6 | unauth | 401 |

## §7 — Gap Register
**PROCEED.** No missing CURRENT authority.
- **G-1 (rest of the reconciliation): PROCEED (subsequent governed packages).** People, attachments, artifacts, voice, image/video are their own packages per `spec/DOTTIE_THEO_RECONCILIATION.md`. Projects hidden (Walter). Disclosed.
- **G-APISPEC: PRE-LAND (Role-C post-deploy)** — add the 3 endpoints to `spec/DOTTIE_API_SPEC.md`. Disclosed.

## §8 — Deploy plan (ordered; §1D)
1. Codex Pass-2 → APPROVED/REJECTED. 2. Claude Kudu-VFS deploys the 3 handlers to `vaultgpt-func-dottie` (PUT `<fn>/{index.js,function.json}`, GET-back diff, restart, syncfunctiontriggers). 2b. The PAIRED FE repoint (the 3 `gateway.live.ts` calls now target `dottie_*`) deploys to the dev SWA alongside — CLOSING the live delete/rename/star error path end-to-end. 3. Claude runs §6 curls. No migration. 4. Role-C API doc.

## Codex activation note (Walter forwards)

```
Codex is activated for Pass-2 review of Dottie Conversation-Management (dottie_delete/rename/set_starred),
vault-dottie, "Codex Governance/Dottie-ConvMgmt-Backend-Pass-1-VEP/Dottie_ConvMgmt_Backend_VEP.md". Open with a
governance-bound GCR + Rule Anchor Table. HANDLER-ONLY (no migration — the columns/exists-helper/cascade landed
in D1; Claude Kudu-VFS deploy to func-dottie + golden curls). First package closing the FE↔backend reconciliation
(spec/DOTTIE_THEO_RECONCILIATION.md) — these three error today because the FE calls them but the backend lacked
them. Review: (1) each handler is a byte-faithful EXACT mirror of its deployed Theo primary reference (§5), the
ONLY delta being the table + exists-helper name (theo_conversations->dottie_conversations); confirm envelope/
owner-gate/exists-discrimination/error-mapping are byte-identical. (2) Schema Reality Lock — only deployed D1
columns/helper used; no DDL. (3) fail-closed 401/400/403/404/500 + ROLLBACK. (4) deploy plan. Emit APPROVED or
REJECTED only.
```
