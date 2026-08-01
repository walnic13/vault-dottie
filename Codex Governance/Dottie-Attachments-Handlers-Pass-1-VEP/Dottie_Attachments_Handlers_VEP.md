# Dottie Attachments Handlers — Pass-1 VEP (dottie_create/finalize/delete/list_attachment)

Handlers half of the attachments build-out (`spec/DOTTIE_THEO_RECONCILIATION.md` §D), paired with the schema package (`Dottie-Attachments-Schema-Pass-1-VEP`, which lands `dottie_attachments`). Four handlers on `vaultgpt-func-dottie`, each a **byte-faithful mirror of its deployed Theo B8 primary reference**, whose ONLY delta is the adapted identifiers (route name; the `dottie_attachments` / exists-helper / `dottie_conversations` SQL names; the `DOTTIE_BLOB_ACCOUNT` / `DOTTIE_BLOB_CONTAINER` / `DOTTIE_PDF_NATIVE_MAX_BYTES` env vars + their `vaultgptdottiestore` / `dottie-content` defaults; the `context.log` tags). No logic, SQL shape, SAS-signing, or extraction change. The upload flow: **create** mints a user-delegation SAS (hand-rolled with `crypto`+`https` via the Function MI — no `@azure/storage-blob`), the FE PUTs the bytes to Blob, **finalize** HEADs the blob for the authoritative type/size, extracts text for extract-class (or large-PDF-promoted) files, and INSERTs the metadata row; **delete** removes the row + best-effort blob; **list** returns a conversation's rows for reload parity. **Handler-only** (the table lands via the paired schema package; the blob container + MI role + npm deps are deploy prerequisites, §4).

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Verified Evidence Pack (backend handlers; no migration in THIS package)
Grounding parent (source baseline): `bd5d0e1804dd02bbd1c169cd813801059fd7c349` (vault-dottie, `development`) — anchors below are tip-independent blob SHAs
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD) |
| - | ------------------------------- | ------------------------------ | --------------------------------- |
| 1 | GOVERNING VISION — `governance/VAULT_MEMORY_ARCHITECTURE.md` (§A Amendment 9 — Dottie full agent) | `Read`(§A9) this turn | `3afda098df614b11adc8a7cdcf28d0f9a3f47011` |
| 2 | Backend Governor — `governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md` (§3 Never-Guess; §4 Schema/Infra Reality Lock) | `Grep("Never-Guess")` this turn | `e44cdd85d3d0e5df332dc754cdec731e2e68022e` |
| 3 | Grounding Conformance — `governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR; §5 Rule Anchor) | `Grep("MUST open with a Grounding Conformance Receipt")` this turn | `7c0d902bdff3b6c0af475b483e31ed796214e57b` |
| 4 | Golden Handler — `governance/THEO_GOLDEN_HANDLER_STANDARD.md` (§2 primary reference = handler + function.json; §4 EXACT mirror / allowed delta; §5.1 Structural Mirror Table; §5.3 Golden Curl; §5.5 deploy) | `Grep("EXACT mirror")` this turn | `f8f0e5ea36447502e35fb87b373c94e376f05cbb` |
| 5 | Execution Orchestration — `governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md` (§1D ordered pass; §1E deploy-after-Codex-APPROVED) | `Grep("ordered, non-skippable")` this turn | `565559b699c1309f8e750b0dbbac859c13d807c8` |
| 6 | PAIRED SCHEMA (this package's FK/table source) — `Codex Governance/Dottie-Attachments-Schema-Pass-1-VEP/dottie_attachments_migration.sql` (the `dottie_attachments` these handlers read/write) | `Read`(full) this turn | `c1250b708bbbb9332f94d08419efd969f771f3bb` |
| 7 | DEPLOYED D1 SCHEMA — `spec/DOTTIE_AZURE_POSTGRES_SCHEMA.md` (the FK parent `dottie_conversations` + `dottie_conversation_exists_unscoped` used by finalize/list) | `Read` this turn | `bb096db53a8d76dc3589b3744f6492ddad8f1f7f` |
| 8 | **PRIMARY REFERENCE (DEPLOYED)** — `theo_create_attachment_upload` handler + function.json (SAS mint; B8L type list) | `Read`(full) this turn; copy in-package | index.js `4a68a830b68af1b5a9cc6f8a19332a6ad247d737`; function.json `c2031bdb3789a51d119c7a5c8b5055bc1c2d5a3b` |
| 9 | **PRIMARY REFERENCE (DEPLOYED)** — `theo_finalize_attachment` handler + function.json (HEAD/GET/extract/INSERT; B8L + B8f) | `Read`(full) this turn; copy in-package | index.js `9bfe26011c8852ab5571cea7e096f784d681ef2c`; function.json `9fdd3c54d25b7a8c3bcf285459acd0ddea8316e7` |
| 10 | **PRIMARY REFERENCE (DEPLOYED)** — `theo_delete_attachment` handler + function.json (owner-scoped delete + best-effort blob) | `Read`(full) this turn; copy in-package | index.js `8620793be5ff2d01b5289a56ead874659316c52f`; function.json `df1943b4d7696c24e5f90862f825f71daf43a41a` |
| 11 | **PRIMARY REFERENCE (DEPLOYED)** — `theo_list_conversation_attachments` handler + function.json (reload-parity list) | `Read`(full) this turn; copy in-package | index.js `bcdabd3544618d8e421373068b3b9409e01e77e6`; function.json `79174187ed32564c340f89b149acd0eddca0d520` |

No ChatGPT advisory cited. No `reporting_*` / `theo_*` object touched. Backend handler package (no migration; no write SQL by Claude — the paired schema migration is run by Walter).

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt" | GCR (head) |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §3 | "Never-Guess" | §4 — the blob/MI/deps prerequisites are az-VERIFIED (current absent state stated honestly), not assumed |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §4 | "Schema Reality Lock" | §3 — reads/writes only the `dottie_attachments` columns the paired migration defines + the deployed D1 `dottie_conversations` |
| governance/THEO_GOLDEN_HANDLER_STANDARD.md | §4 | "EXACT mirror" | §5 — each handler EXACT-mirrors its deployed Theo primary reference (allowed delta: adapted identifiers only) |
| governance/THEO_GOLDEN_HANDLER_STANDARD.md | §2 | "deployed `function.json` file as the canonical Primary Reference" | §5 — each primary reference = handler index.js AND function.json (both inlined) |
| governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md | §1D | "ordered, non-skippable" | §8 — schema → infra → Codex → deploy → curls |

---

## §1 — Feature
Four handlers on `vaultgpt-func-dottie`, EasyAuth-gated, owner-scoped (`created_by = oid`):
- **`dottie_create_attachment_upload`** (POST `{ filename, content_type }`) → mints a 15-min user-delegation SAS (perms `cw`) for blob key `attachments/<oid>/<attachmentId>`. `201 { data:{ attachmentId, filename, contentType, ingestionClass, maxBytes, upload:{ account, container, blobKey, blobUrl, uploadUrl, method:"PUT", requiredHeaders, expiresAt } } }`. Errors `401`/`400 BAD_REQUEST|INVALID_REQUEST|UNSUPPORTED_MEDIA_TYPE`/`500`. No SQL.
- **`dottie_finalize_attachment`** (POST `{ attachment_id, filename, conversation_id? }`) → HEADs the blob for authoritative `content-type`+`content-length` (anti-misdeclaration), enforces the allow-list + per-class cap, extracts text for extract-class (or PDF > `DOTTIE_PDF_NATIVE_MAX_BYTES`, default 3 MB) into a `.extracted.md` sibling (extraction failure non-fatal), then INSERTs the `dottie_attachments` row (owner-gating any `conversation_id` against `dottie_conversations`). `201 { data:{ attachment } }`. Errors `401`/`400`/`404`/`502 STORAGE_ERROR`/`403`(42501)/`409`(23505)/`404`(23503)/`400`(23514)/`500`.
- **`dottie_delete_attachment`** (POST `{ id }`) → owner-scoped `DELETE … RETURNING blob_path`; 0 rows → `dottie_attachment_exists_unscoped` → `403`/`404`; best-effort MI blob delete after commit. `200 { data:{ deleted:true, id } }`.
- **`dottie_list_conversation_attachments`** (GET `?conversationId=`) → owner-gate the conversation, then the conversation's rows (id, filename, content_type, byte_size, ingestion_class, message_seq, created_at — **no** blob paths to the client) ordered `message_seq ASC NULLS LAST, created_at ASC`. `200 { data:{ attachments:[…] } }`.
All: `OPTIONS`→`204`; `401` no identity; `500` unexpected.

## §2 — Architecture & boundary
The file body lives in Azure Blob (`dottie-content` on `vaultgptdottiestore`); Postgres holds only the pointer + metadata (`dottie_attachments`). **SAS is hand-rolled** with `crypto` + raw `https` (mirroring the deployed axis/artifacts-upload technique): the Function's system-assigned MI (`IDENTITY_ENDPOINT`/`IDENTITY_HEADER`) gets a `https://storage.azure.com/` token → user-delegation key (`?restype=service&comp=userdelegationkey`, `x-ms-version: 2022-11-02`) → SAS signed over the canonical 24-field string-to-sign (`sv=2022-11-02`, `sr=b`, `sp=cw`, `rsct` pinned). No `@azure/storage-blob`/`@azure/identity`. Owner OID embedded in the blob path (`attachments/<oid>/<id>`) lets finalize/delete prove ownership without a DB lookup. Extraction (finalize, lazy `require`): text/csv native UTF-8; xlsx/xls/xlsm/xlsb via `xlsx`; docx via `mammoth`; pptx via `officeparser`; large-PDF via `pdf-parse/lib/pdf-parse.js`. Fail-closed on every path; extraction + presence + blob cleanup are best-effort (never fail the row). No `theo_*`/`reporting_*` object touched; no cross-app read. Same envelope/pool/`set_config`/EasyAuth/owner-gate as the D2 + ConvMgmt handlers.

## §3 — Schema Reality Lock (Governor §4)
These handlers read/write `dottie_attachments` (all 12 columns) + the deployed D1 `dottie_conversations` + `dottie_conversation_exists_unscoped` (finalize/list owner-gate) + `dottie_attachment_exists_unscoped` (delete 403/404). `dottie_conversations` + its exists-helper are DEPLOYED D1 (schema doc, GCR row 7, catalog-verified). `dottie_attachments` + `dottie_attachment_exists_unscoped` land via the **paired schema package** (GCR row 6; Codex-approved + Walter-run) — **these handlers do not deploy until that migration is live and verified** (deploy plan §8, ordered). Nothing invented; no DDL in this package. (Disclosed sequencing, G-SCHEMA.)

## §4 — Infra Reality Lock (Governor §3 Never-Guess — az-VERIFIED current state; established at deploy)
No blob/MI infra is assumed. Verified live with `az` this turn — and stated honestly, including what is NOT yet present (each is a deploy prerequisite, not a runtime claim):
- **MI present:** `vaultgpt-func-dottie` has a system-assigned MI (`86c251f4-3920-4c6a-898d-173b9eacac93`) — the SAS/HEAD/GET/PUT/DELETE identity. `IDENTITY_ENDPOINT`/`IDENTITY_HEADER` are injected by Azure.
- **Storage account present, container ABSENT:** `vaultgptdottiestore` exists; it has only the webjobs containers — **no `dottie-content` yet** → created at deploy.
- **MI role ABSENT:** the MI holds **no role** on `vaultgptdottiestore` → grant **Storage Blob Data Contributor** at deploy (required for the delegation key + read-back + delete).
- **Deps ABSENT:** func-dottie has `pg` but not `xlsx`/`mammoth`/`officeparser`/`pdf-parse` → `npm install xlsx mammoth officeparser pdf-parse@1.1.1` at deploy (SAS needs none — hand-rolled). `pdf-parse` **pinned 1.1.1** + required as `pdf-parse/lib/pdf-parse.js` (root crashes at load in Functions).
- **App settings to set:** `DOTTIE_BLOB_ACCOUNT=vaultgptdottiestore`, `DOTTIE_BLOB_CONTAINER=dottie-content` (the code defaults already match, set explicitly for clarity); optional `DOTTIE_PDF_NATIVE_MAX_BYTES`.
- **Blob CORS:** the storage account must allow the dev-SWA origin for the browser PUT (the Function's own CORS covers the API calls, not the direct-to-blob PUT).
These are established in the deploy step (§8); the create→PUT→finalize→list→delete golden curl round-trip (§6) is the end-to-end proof.

## §5 — Primary references + Structural Mirror Tables (Golden §2/§4/§5.1)
Each handler's canonical primary reference = its DEPLOYED Theo original (handler index.js AND function.json), inlined full-verbatim. The delta for every handler is **token-only** (diff-verified: the generated mirror differs from its primary reference ONLY in the substitutions below), so one classification covers all four:

| Region | Classification | Notes |
| ------ | -------------- | ----- |
| all helpers + SAS signing (`buildUserDelegationSas`/token-fetch/`requestUrl`/`requestBinary`), ingestion-class allow-list + caps, HEAD/GET/PUT blob ops, extraction dispatch, `set_config` + owner-gate + exists-discrimination + error mapping, envelope | **EXACT** | byte-identical to the deployed Theo primary reference |
| adapted identifiers ONLY: route (`theo_*`→`dottie_*`); SQL names (`theo_attachments`→`dottie_attachments`, `theo_conversations`→`dottie_conversations`, `theo_attachment_exists_unscoped`/`theo_conversation_exists_unscoped`→`dottie_*`); env vars (`THEO_BLOB_ACCOUNT`/`THEO_BLOB_CONTAINER`/`THEO_PDF_NATIVE_MAX_BYTES`→`DOTTIE_*`) + defaults (`vaultgptstorage01`→`vaultgptdottiestore`, `theo-content`→`dottie-content`); a comment ref (`theo_get_conversation`→`dottie_get_conversation`); `context.log` tags | **ALLOWED DELTA (adapted identity)** | the only changes; no logic/SQL-shape/SAS/extraction difference (per-handler changed-line counts: create 3, finalize 9, delete 6, list 5) |

No DEVIATION regions. `function.json`: EXACT except the `route` (=handler name).

### §5.1 dottie_create_attachment_upload
```javascript
const crypto = require("crypto");

// ---- Ingestion classes (D-8 RESOLVED): declared-type allow-list + per-class size cap.
// Native-read formats inject as document/image content blocks (cap 10 MB; native reading
// is accurate at/below). Extract-class formats are text-extracted at finalize (cap 50 MB).
const NATIVE_MAX_BYTES = 10 * 1024 * 1024;
const EXTRACT_MAX_BYTES = 50 * 1024 * 1024;
const INGESTION_CLASSES = {
  "application/pdf": { class: "native", maxBytes: NATIVE_MAX_BYTES },
  "image/png": { class: "native", maxBytes: NATIVE_MAX_BYTES },
  "image/jpeg": { class: "native", maxBytes: NATIVE_MAX_BYTES },
  "image/webp": { class: "native", maxBytes: NATIVE_MAX_BYTES },
  "image/gif": { class: "native", maxBytes: NATIVE_MAX_BYTES },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { class: "extract", maxBytes: EXTRACT_MAX_BYTES }, // .xlsx
  "application/vnd.ms-excel": { class: "extract", maxBytes: EXTRACT_MAX_BYTES }, // .xls
  "application/vnd.ms-excel.sheet.macroenabled.12": { class: "extract", maxBytes: EXTRACT_MAX_BYTES }, // .xlsm (B8L — key lowercased; normalizeContentType lowercases macroEnabled)
  "application/vnd.ms-excel.sheet.binary.macroenabled.12": { class: "extract", maxBytes: EXTRACT_MAX_BYTES }, // .xlsb (B8L)
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { class: "extract", maxBytes: EXTRACT_MAX_BYTES }, // .docx
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": { class: "extract", maxBytes: EXTRACT_MAX_BYTES }, // .pptx
  "text/csv": { class: "extract", maxBytes: EXTRACT_MAX_BYTES },
  "text/plain": { class: "extract", maxBytes: EXTRACT_MAX_BYTES },
};
const ALLOWED_CONTENT_TYPES = Object.keys(INGESTION_CLASSES);

const STORAGE_ACCOUNT = process.env.DOTTIE_BLOB_ACCOUNT || "vaultgptdottiestore";
const STORAGE_CONTAINER = process.env.DOTTIE_BLOB_CONTAINER || "dottie-content";
const SAS_TTL_MINUTES = 15;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-ms-client-principal",
};

function send(context, status, body) {
  context.res = {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    body,
  };
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
    if (match && typeof match.val === "string" && match.val.trim()) {
      return match.val.trim();
    }
  }
  return null;
}

function parseBody(req) {
  if (req.body == null) return {};
  if (typeof req.body === "string") return JSON.parse(req.body);
  if (typeof req.body === "object") return req.body;
  return {};
}

function normalizeContentType(ct) {
  return String(ct || "").split(";")[0].trim().toLowerCase();
}

function cleanFileName(name) {
  if (name === undefined || name === null) return null;
  const raw = String(name).trim();
  if (!raw.length) return null;
  const cleaned = raw.replace(/[\\/:*?"<>|]+/g, "_").replace(/\s+/g, " ").trim();
  return cleaned.length ? cleaned.slice(0, 180) : null;
}

// ---- Managed-identity user-delegation SAS issuance (mirrors the deployed axis
// artifacts-upload-url technique; pure crypto + https, no @azure/storage-blob dependency).
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
        res.on("end", () => {
          resolve({ statusCode: res.statusCode || 0, headers: res.headers || {}, body: data });
        });
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
    throw new Error(
      "Managed Identity endpoint not available (IDENTITY_ENDPOINT/IDENTITY_HEADER missing). " +
      "Ensure System Assigned Managed Identity is enabled on the Function App."
    );
  }
  const tokenUrl = `${identityEndpoint}?resource=${encodeURIComponent(resource)}&api-version=2019-08-01`;
  const r = await requestUrl(tokenUrl, { method: "GET", headers: { "X-IDENTITY-HEADER": identityHeader } });
  if (r.statusCode < 200 || r.statusCode >= 300) {
    throw new Error(`Managed Identity token endpoint failed (${r.statusCode}): ${r.body}`);
  }
  const payload = JSON.parse(r.body || "{}");
  if (!payload.access_token) {
    throw new Error("Managed Identity token endpoint did not return access_token.");
  }
  return payload.access_token;
}

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function encodeBlobPath(blobKey) {
  return blobKey.split("/").map(encodeURIComponent).join("/");
}

function decodeXmlTag(xml, tagName) {
  const m = xml.match(new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`, "i"));
  return m ? m[1] : null;
}

function toIsoNoMillis(d) {
  return new Date(d).toISOString().replace(/\.\d{3}Z$/, "Z");
}

async function getUserDelegationKey(accountName, startTime, expiryTime) {
  const accessToken = await getManagedIdentityAccessToken("https://storage.azure.com/");
  const url = `https://${accountName}.blob.core.windows.net/?restype=service&comp=userdelegationkey`;
  const body =
    `<?xml version="1.0" encoding="utf-8"?>` +
    `<KeyInfo><Start>${xmlEscape(startTime)}</Start><Expiry>${xmlEscape(expiryTime)}</Expiry></KeyInfo>`;
  const r = await requestUrl(
    url,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "x-ms-version": "2022-11-02",
        "Content-Type": "application/xml",
        "Content-Length": Buffer.byteLength(body, "utf8"),
      },
    },
    body
  );
  if (r.statusCode < 200 || r.statusCode >= 300) {
    throw new Error(`Get User Delegation Key failed (${r.statusCode}): ${r.body}`);
  }
  const udk = {
    signedOid: decodeXmlTag(r.body, "SignedOid"),
    signedTid: decodeXmlTag(r.body, "SignedTid"),
    signedStart: decodeXmlTag(r.body, "SignedStart"),
    signedExpiry: decodeXmlTag(r.body, "SignedExpiry"),
    signedService: decodeXmlTag(r.body, "SignedService"),
    signedVersion: decodeXmlTag(r.body, "SignedVersion"),
    value: decodeXmlTag(r.body, "Value"),
  };
  if (!udk.signedOid || !udk.signedTid || !udk.signedStart || !udk.signedExpiry || !udk.signedService || !udk.signedVersion || !udk.value) {
    throw new Error("Get User Delegation Key response was missing required fields.");
  }
  return udk;
}

function computeUserDelegationSignature(params, userDelegationKey) {
  // User-delegation SAS canonical string-to-sign for service version >= 2020-12-06
  // (we sign with sv = 2022-11-02). Field order is exact and positional — every field is
  // present (empty string when unused). The block after `sr` is:
  //   sst, ses (signedEncryptionScope, added in 2020-12-06), rscc, rscd, rsce, rscl, rsct.
  // Built as an explicit array (not hand-counted newlines) so the field positions are provable
  // against Azure's canonical (which Azure echoes verbatim in any AuthenticationFailed detail).
  const stringToSign = [
    params.sp,
    params.st,
    params.se,
    params.canonicalizedResource,
    userDelegationKey.signedOid,
    userDelegationKey.signedTid,
    userDelegationKey.signedStart,
    userDelegationKey.signedExpiry,
    userDelegationKey.signedService,
    userDelegationKey.signedVersion,
    "", // signedAuthorizedUserObjectId (saoid)
    "", // signedUnauthorizedUserObjectId (suoid)
    "", // signedCorrelationId (scid)
    "", // signedIP (sip)
    params.spr,
    params.sv,
    params.sr,
    "", // signedSnapshotTime (sst)
    "", // signedEncryptionScope (ses)
    "", // rscc (Cache-Control)
    "", // rscd (Content-Disposition)
    "", // rsce (Content-Encoding)
    "", // rscl (Content-Language)
    params.rsct || "", // rsct (Content-Type)
  ].join("\n");
  const key = Buffer.from(userDelegationKey.value, "base64");
  return crypto.createHmac("sha256", key).update(stringToSign, "utf8").digest("base64");
}

async function buildUserDelegationSas(accountName, containerName, blobKey, permissions, expiresInMinutes, mimeType) {
  const now = new Date();
  const start = new Date(now.getTime() - 5 * 60 * 1000);
  const expiry = new Date(now.getTime() + expiresInMinutes * 60 * 1000);
  const udk = await getUserDelegationKey(accountName, toIsoNoMillis(start), toIsoNoMillis(expiry));

  const sv = "2022-11-02";
  const sr = "b";
  const spr = "https";
  const st = toIsoNoMillis(start);
  const se = toIsoNoMillis(expiry);
  const canonicalizedResource = `/blob/${accountName}/${containerName}/${blobKey}`;

  const sig = computeUserDelegationSignature(
    { sp: permissions, st, se, canonicalizedResource, spr, sv, sr, rsct: mimeType || "" },
    udk
  );

  const qp = new URLSearchParams();
  qp.set("sp", permissions);
  qp.set("st", st);
  qp.set("se", se);
  qp.set("skoid", udk.signedOid);
  qp.set("sktid", udk.signedTid);
  qp.set("skt", udk.signedStart);
  qp.set("ske", udk.signedExpiry);
  qp.set("sks", udk.signedService);
  qp.set("skv", udk.signedVersion);
  qp.set("spr", spr);
  qp.set("sv", sv);
  qp.set("sr", sr);
  if (mimeType) qp.set("rsct", mimeType);
  qp.set("sig", sig);

  return { sas: qp.toString(), expiresAt: se };
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

  // ---- Validate inputs before issuing any SAS (deterministic 400s) ----
  const filename = cleanFileName(body.filename);
  if (!filename) {
    return send(context, 400, errorBody("INVALID_REQUEST", "Field 'filename' is required and must be a non-empty string.", 400));
  }

  const contentType = normalizeContentType(body.content_type);
  const ingestion = INGESTION_CLASSES[contentType];
  if (!ingestion) {
    return send(
      context,
      400,
      errorBody(
        "UNSUPPORTED_MEDIA_TYPE",
        `Field 'content_type' must be one of the supported attachment types: ${ALLOWED_CONTENT_TYPES.join(", ")}.`,
        400
      )
    );
  }

  try {
    // Owner-scoped, deterministic blob path: attachments/<oid>/<attachmentId>.
    // The path embeds the caller OID so finalize/delete can prove ownership of the blob,
    // and embeds the attachment id so the persisted row id matches the stored blob 1:1.
    const attachmentId = crypto.randomUUID();
    const blobKey = `attachments/${oid}/${attachmentId}`;

    // Short-lived (15 min), single-blob, create+write SAS; response content-type pinned.
    const { sas, expiresAt } = await buildUserDelegationSas(
      STORAGE_ACCOUNT,
      STORAGE_CONTAINER,
      blobKey,
      "cw",
      SAS_TTL_MINUTES,
      contentType
    );

    const blobUrl = `https://${STORAGE_ACCOUNT}.blob.core.windows.net/${STORAGE_CONTAINER}/${encodeBlobPath(blobKey)}`;
    const uploadUrl = `${blobUrl}?${sas}`;

    return send(context, 201, successBody({
      attachmentId,
      filename,
      contentType,
      ingestionClass: ingestion.class,
      maxBytes: ingestion.maxBytes,
      upload: {
        storageProvider: "azure_blob",
        account: STORAGE_ACCOUNT,
        container: STORAGE_CONTAINER,
        blobKey,
        blobUrl,
        uploadUrl,
        method: "PUT",
        requiredHeaders: {
          "x-ms-blob-type": "BlockBlob",
          "Content-Type": contentType,
        },
        expiresAt,
      },
    }));
  } catch (err) {
    context.log.error("dottie_create_attachment_upload failed", err);
    return send(context, 500, errorBody("INTERNAL_SERVER_ERROR", "An unexpected error occurred issuing the upload URL.", 500));
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
      "methods": ["post", "options"],
      "route": "dottie_create_attachment_upload"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```
Primary reference (deployed `theo_create_attachment_upload`):
```javascript
const crypto = require("crypto");

// ---- Ingestion classes (D-8 RESOLVED): declared-type allow-list + per-class size cap.
// Native-read formats inject as document/image content blocks (cap 10 MB; native reading
// is accurate at/below). Extract-class formats are text-extracted at finalize (cap 50 MB).
const NATIVE_MAX_BYTES = 10 * 1024 * 1024;
const EXTRACT_MAX_BYTES = 50 * 1024 * 1024;
const INGESTION_CLASSES = {
  "application/pdf": { class: "native", maxBytes: NATIVE_MAX_BYTES },
  "image/png": { class: "native", maxBytes: NATIVE_MAX_BYTES },
  "image/jpeg": { class: "native", maxBytes: NATIVE_MAX_BYTES },
  "image/webp": { class: "native", maxBytes: NATIVE_MAX_BYTES },
  "image/gif": { class: "native", maxBytes: NATIVE_MAX_BYTES },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { class: "extract", maxBytes: EXTRACT_MAX_BYTES }, // .xlsx
  "application/vnd.ms-excel": { class: "extract", maxBytes: EXTRACT_MAX_BYTES }, // .xls
  "application/vnd.ms-excel.sheet.macroenabled.12": { class: "extract", maxBytes: EXTRACT_MAX_BYTES }, // .xlsm (B8L — key lowercased; normalizeContentType lowercases macroEnabled)
  "application/vnd.ms-excel.sheet.binary.macroenabled.12": { class: "extract", maxBytes: EXTRACT_MAX_BYTES }, // .xlsb (B8L)
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { class: "extract", maxBytes: EXTRACT_MAX_BYTES }, // .docx
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": { class: "extract", maxBytes: EXTRACT_MAX_BYTES }, // .pptx
  "text/csv": { class: "extract", maxBytes: EXTRACT_MAX_BYTES },
  "text/plain": { class: "extract", maxBytes: EXTRACT_MAX_BYTES },
};
const ALLOWED_CONTENT_TYPES = Object.keys(INGESTION_CLASSES);

const STORAGE_ACCOUNT = process.env.THEO_BLOB_ACCOUNT || "vaultgptstorage01";
const STORAGE_CONTAINER = process.env.THEO_BLOB_CONTAINER || "theo-content";
const SAS_TTL_MINUTES = 15;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-ms-client-principal",
};

function send(context, status, body) {
  context.res = {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    body,
  };
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
    if (match && typeof match.val === "string" && match.val.trim()) {
      return match.val.trim();
    }
  }
  return null;
}

function parseBody(req) {
  if (req.body == null) return {};
  if (typeof req.body === "string") return JSON.parse(req.body);
  if (typeof req.body === "object") return req.body;
  return {};
}

function normalizeContentType(ct) {
  return String(ct || "").split(";")[0].trim().toLowerCase();
}

function cleanFileName(name) {
  if (name === undefined || name === null) return null;
  const raw = String(name).trim();
  if (!raw.length) return null;
  const cleaned = raw.replace(/[\\/:*?"<>|]+/g, "_").replace(/\s+/g, " ").trim();
  return cleaned.length ? cleaned.slice(0, 180) : null;
}

// ---- Managed-identity user-delegation SAS issuance (mirrors the deployed axis
// artifacts-upload-url technique; pure crypto + https, no @azure/storage-blob dependency).
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
        res.on("end", () => {
          resolve({ statusCode: res.statusCode || 0, headers: res.headers || {}, body: data });
        });
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
    throw new Error(
      "Managed Identity endpoint not available (IDENTITY_ENDPOINT/IDENTITY_HEADER missing). " +
      "Ensure System Assigned Managed Identity is enabled on the Function App."
    );
  }
  const tokenUrl = `${identityEndpoint}?resource=${encodeURIComponent(resource)}&api-version=2019-08-01`;
  const r = await requestUrl(tokenUrl, { method: "GET", headers: { "X-IDENTITY-HEADER": identityHeader } });
  if (r.statusCode < 200 || r.statusCode >= 300) {
    throw new Error(`Managed Identity token endpoint failed (${r.statusCode}): ${r.body}`);
  }
  const payload = JSON.parse(r.body || "{}");
  if (!payload.access_token) {
    throw new Error("Managed Identity token endpoint did not return access_token.");
  }
  return payload.access_token;
}

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function encodeBlobPath(blobKey) {
  return blobKey.split("/").map(encodeURIComponent).join("/");
}

function decodeXmlTag(xml, tagName) {
  const m = xml.match(new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`, "i"));
  return m ? m[1] : null;
}

function toIsoNoMillis(d) {
  return new Date(d).toISOString().replace(/\.\d{3}Z$/, "Z");
}

async function getUserDelegationKey(accountName, startTime, expiryTime) {
  const accessToken = await getManagedIdentityAccessToken("https://storage.azure.com/");
  const url = `https://${accountName}.blob.core.windows.net/?restype=service&comp=userdelegationkey`;
  const body =
    `<?xml version="1.0" encoding="utf-8"?>` +
    `<KeyInfo><Start>${xmlEscape(startTime)}</Start><Expiry>${xmlEscape(expiryTime)}</Expiry></KeyInfo>`;
  const r = await requestUrl(
    url,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "x-ms-version": "2022-11-02",
        "Content-Type": "application/xml",
        "Content-Length": Buffer.byteLength(body, "utf8"),
      },
    },
    body
  );
  if (r.statusCode < 200 || r.statusCode >= 300) {
    throw new Error(`Get User Delegation Key failed (${r.statusCode}): ${r.body}`);
  }
  const udk = {
    signedOid: decodeXmlTag(r.body, "SignedOid"),
    signedTid: decodeXmlTag(r.body, "SignedTid"),
    signedStart: decodeXmlTag(r.body, "SignedStart"),
    signedExpiry: decodeXmlTag(r.body, "SignedExpiry"),
    signedService: decodeXmlTag(r.body, "SignedService"),
    signedVersion: decodeXmlTag(r.body, "SignedVersion"),
    value: decodeXmlTag(r.body, "Value"),
  };
  if (!udk.signedOid || !udk.signedTid || !udk.signedStart || !udk.signedExpiry || !udk.signedService || !udk.signedVersion || !udk.value) {
    throw new Error("Get User Delegation Key response was missing required fields.");
  }
  return udk;
}

function computeUserDelegationSignature(params, userDelegationKey) {
  // User-delegation SAS canonical string-to-sign for service version >= 2020-12-06
  // (we sign with sv = 2022-11-02). Field order is exact and positional — every field is
  // present (empty string when unused). The block after `sr` is:
  //   sst, ses (signedEncryptionScope, added in 2020-12-06), rscc, rscd, rsce, rscl, rsct.
  // Built as an explicit array (not hand-counted newlines) so the field positions are provable
  // against Azure's canonical (which Azure echoes verbatim in any AuthenticationFailed detail).
  const stringToSign = [
    params.sp,
    params.st,
    params.se,
    params.canonicalizedResource,
    userDelegationKey.signedOid,
    userDelegationKey.signedTid,
    userDelegationKey.signedStart,
    userDelegationKey.signedExpiry,
    userDelegationKey.signedService,
    userDelegationKey.signedVersion,
    "", // signedAuthorizedUserObjectId (saoid)
    "", // signedUnauthorizedUserObjectId (suoid)
    "", // signedCorrelationId (scid)
    "", // signedIP (sip)
    params.spr,
    params.sv,
    params.sr,
    "", // signedSnapshotTime (sst)
    "", // signedEncryptionScope (ses)
    "", // rscc (Cache-Control)
    "", // rscd (Content-Disposition)
    "", // rsce (Content-Encoding)
    "", // rscl (Content-Language)
    params.rsct || "", // rsct (Content-Type)
  ].join("\n");
  const key = Buffer.from(userDelegationKey.value, "base64");
  return crypto.createHmac("sha256", key).update(stringToSign, "utf8").digest("base64");
}

async function buildUserDelegationSas(accountName, containerName, blobKey, permissions, expiresInMinutes, mimeType) {
  const now = new Date();
  const start = new Date(now.getTime() - 5 * 60 * 1000);
  const expiry = new Date(now.getTime() + expiresInMinutes * 60 * 1000);
  const udk = await getUserDelegationKey(accountName, toIsoNoMillis(start), toIsoNoMillis(expiry));

  const sv = "2022-11-02";
  const sr = "b";
  const spr = "https";
  const st = toIsoNoMillis(start);
  const se = toIsoNoMillis(expiry);
  const canonicalizedResource = `/blob/${accountName}/${containerName}/${blobKey}`;

  const sig = computeUserDelegationSignature(
    { sp: permissions, st, se, canonicalizedResource, spr, sv, sr, rsct: mimeType || "" },
    udk
  );

  const qp = new URLSearchParams();
  qp.set("sp", permissions);
  qp.set("st", st);
  qp.set("se", se);
  qp.set("skoid", udk.signedOid);
  qp.set("sktid", udk.signedTid);
  qp.set("skt", udk.signedStart);
  qp.set("ske", udk.signedExpiry);
  qp.set("sks", udk.signedService);
  qp.set("skv", udk.signedVersion);
  qp.set("spr", spr);
  qp.set("sv", sv);
  qp.set("sr", sr);
  if (mimeType) qp.set("rsct", mimeType);
  qp.set("sig", sig);

  return { sas: qp.toString(), expiresAt: se };
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

  // ---- Validate inputs before issuing any SAS (deterministic 400s) ----
  const filename = cleanFileName(body.filename);
  if (!filename) {
    return send(context, 400, errorBody("INVALID_REQUEST", "Field 'filename' is required and must be a non-empty string.", 400));
  }

  const contentType = normalizeContentType(body.content_type);
  const ingestion = INGESTION_CLASSES[contentType];
  if (!ingestion) {
    return send(
      context,
      400,
      errorBody(
        "UNSUPPORTED_MEDIA_TYPE",
        `Field 'content_type' must be one of the supported attachment types: ${ALLOWED_CONTENT_TYPES.join(", ")}.`,
        400
      )
    );
  }

  try {
    // Owner-scoped, deterministic blob path: attachments/<oid>/<attachmentId>.
    // The path embeds the caller OID so finalize/delete can prove ownership of the blob,
    // and embeds the attachment id so the persisted row id matches the stored blob 1:1.
    const attachmentId = crypto.randomUUID();
    const blobKey = `attachments/${oid}/${attachmentId}`;

    // Short-lived (15 min), single-blob, create+write SAS; response content-type pinned.
    const { sas, expiresAt } = await buildUserDelegationSas(
      STORAGE_ACCOUNT,
      STORAGE_CONTAINER,
      blobKey,
      "cw",
      SAS_TTL_MINUTES,
      contentType
    );

    const blobUrl = `https://${STORAGE_ACCOUNT}.blob.core.windows.net/${STORAGE_CONTAINER}/${encodeBlobPath(blobKey)}`;
    const uploadUrl = `${blobUrl}?${sas}`;

    return send(context, 201, successBody({
      attachmentId,
      filename,
      contentType,
      ingestionClass: ingestion.class,
      maxBytes: ingestion.maxBytes,
      upload: {
        storageProvider: "azure_blob",
        account: STORAGE_ACCOUNT,
        container: STORAGE_CONTAINER,
        blobKey,
        blobUrl,
        uploadUrl,
        method: "PUT",
        requiredHeaders: {
          "x-ms-blob-type": "BlockBlob",
          "Content-Type": contentType,
        },
        expiresAt,
      },
    }));
  } catch (err) {
    context.log.error("theo_create_attachment_upload failed", err);
    return send(context, 500, errorBody("INTERNAL_SERVER_ERROR", "An unexpected error occurred issuing the upload URL.", 500));
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
      "methods": ["post", "options"],
      "route": "theo_create_attachment_upload"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

### §5.2 dottie_finalize_attachment
```javascript
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
});

// ---- Ingestion classes (D-8 RESOLVED): declared-type allow-list + per-class size cap.
const NATIVE_MAX_BYTES = 10 * 1024 * 1024;
const PDF_NATIVE_MAX_BYTES = parseInt(process.env.DOTTIE_PDF_NATIVE_MAX_BYTES || "", 10) > 0 ? parseInt(process.env.DOTTIE_PDF_NATIVE_MAX_BYTES, 10) : 3 * 1024 * 1024; // B8f: PDFs larger than this are text-extracted instead of sent as a (large) document block
const EXTRACT_MAX_BYTES = 50 * 1024 * 1024;
const INGESTION_CLASSES = {
  "application/pdf": { class: "native", maxBytes: NATIVE_MAX_BYTES },
  "image/png": { class: "native", maxBytes: NATIVE_MAX_BYTES },
  "image/jpeg": { class: "native", maxBytes: NATIVE_MAX_BYTES },
  "image/webp": { class: "native", maxBytes: NATIVE_MAX_BYTES },
  "image/gif": { class: "native", maxBytes: NATIVE_MAX_BYTES },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { class: "extract", maxBytes: EXTRACT_MAX_BYTES }, // .xlsx
  "application/vnd.ms-excel": { class: "extract", maxBytes: EXTRACT_MAX_BYTES }, // .xls
  "application/vnd.ms-excel.sheet.macroenabled.12": { class: "extract", maxBytes: EXTRACT_MAX_BYTES }, // .xlsm (B8L — key lowercased; normalizeContentType lowercases macroEnabled)
  "application/vnd.ms-excel.sheet.binary.macroenabled.12": { class: "extract", maxBytes: EXTRACT_MAX_BYTES }, // .xlsb (B8L)
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { class: "extract", maxBytes: EXTRACT_MAX_BYTES }, // .docx
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": { class: "extract", maxBytes: EXTRACT_MAX_BYTES }, // .pptx
  "text/csv": { class: "extract", maxBytes: EXTRACT_MAX_BYTES },
  "text/plain": { class: "extract", maxBytes: EXTRACT_MAX_BYTES },
};
const ALLOWED_CONTENT_TYPES = Object.keys(INGESTION_CLASSES);

const STORAGE_ACCOUNT = process.env.DOTTIE_BLOB_ACCOUNT || "vaultgptdottiestore";
const STORAGE_CONTAINER = process.env.DOTTIE_BLOB_CONTAINER || "dottie-content";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-ms-client-principal",
};

function send(context, status, body) {
  context.res = {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    body,
  };
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
    if (match && typeof match.val === "string" && match.val.trim()) {
      return match.val.trim();
    }
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

function normalizeContentType(ct) {
  return String(ct || "").split(";")[0].trim().toLowerCase();
}

function cleanFileName(name) {
  if (name === undefined || name === null) return null;
  const raw = String(name).trim();
  if (!raw.length) return null;
  const cleaned = raw.replace(/[\\/:*?"<>|]+/g, "_").replace(/\s+/g, " ").trim();
  return cleaned.length ? cleaned.slice(0, 180) : null;
}

// ---- Managed-identity data-plane Blob access (mirrors the deployed axis MI technique).
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
        res.on("end", () => {
          resolve({ statusCode: res.statusCode || 0, headers: res.headers || {}, body: data });
        });
      }
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

// Binary variant: collects Buffer chunks (must NOT coerce to string — blobs are binary zips).
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
        res.on("end", () => {
          resolve({ statusCode: res.statusCode || 0, headers: res.headers || {}, body: Buffer.concat(chunks) });
        });
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
    throw new Error(
      "Managed Identity endpoint not available (IDENTITY_ENDPOINT/IDENTITY_HEADER missing). " +
      "Ensure System Assigned Managed Identity is enabled on the Function App."
    );
  }
  const tokenUrl = `${identityEndpoint}?resource=${encodeURIComponent(resource)}&api-version=2019-08-01`;
  const r = await requestUrl(tokenUrl, { method: "GET", headers: { "X-IDENTITY-HEADER": identityHeader } });
  if (r.statusCode < 200 || r.statusCode >= 300) {
    throw new Error(`Managed Identity token endpoint failed (${r.statusCode}): ${r.body}`);
  }
  const payload = JSON.parse(r.body || "{}");
  if (!payload.access_token) {
    throw new Error("Managed Identity token endpoint did not return access_token.");
  }
  return payload.access_token;
}

function encodeBlobPath(blobKey) {
  return blobKey.split("/").map(encodeURIComponent).join("/");
}

function blobUrlFor(accountName, containerName, blobKey) {
  return `https://${accountName}.blob.core.windows.net/${containerName}/${encodeBlobPath(blobKey)}`;
}

// HEAD the blob to read its AUTHORITATIVE byte size + stored Content-Type. Returns null when absent.
async function getBlobProperties(accountName, containerName, blobKey) {
  const accessToken = await getManagedIdentityAccessToken("https://storage.azure.com/");
  const r = await requestUrl(blobUrlFor(accountName, containerName, blobKey), {
    method: "HEAD",
    headers: { Authorization: `Bearer ${accessToken}`, "x-ms-version": "2022-11-02" },
  });
  if (r.statusCode === 404) return null;
  if (r.statusCode < 200 || r.statusCode >= 300) {
    throw new Error(`HEAD blob failed (${r.statusCode}): ${r.body}`);
  }
  const len = Number(r.headers["content-length"]);
  return {
    contentLength: Number.isFinite(len) ? len : 0,
    contentType: r.headers["content-type"] || null,
  };
}

async function downloadBlob(accountName, containerName, blobKey) {
  const accessToken = await getManagedIdentityAccessToken("https://storage.azure.com/");
  const r = await requestBinary(blobUrlFor(accountName, containerName, blobKey), {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}`, "x-ms-version": "2022-11-02" },
  });
  if (r.statusCode < 200 || r.statusCode >= 300) {
    throw new Error(`GET blob failed (${r.statusCode})`);
  }
  return r.body; // Buffer
}

async function putTextBlob(accountName, containerName, blobKey, text) {
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
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Length": bodyBuf.length,
      },
    },
    bodyBuf
  );
  if (r.statusCode < 200 || r.statusCode >= 300) {
    throw new Error(`PUT extracted blob failed (${r.statusCode}): ${r.body}`);
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
    context.log.warn("dottie_finalize_attachment: best-effort blob cleanup failed", e);
  }
}

// ---- Extract-class text extraction (Walter-authorized npm libs; "path a is the way to go").
// xlsx/.xls -> SheetJS (per-sheet CSV + manifest); .docx -> mammoth; .pptx -> officeparser;
// text/csv + text/plain -> native UTF-8 decode. Returns a markdown string.
async function extractTextFromBlob(buf, contentType) {
  if (contentType === "text/plain" || contentType === "text/csv") {
    return buf.toString("utf8");
  }
  if (
    contentType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    contentType === "application/vnd.ms-excel" ||
    contentType === "application/vnd.ms-excel.sheet.macroenabled.12" || // .xlsm (B8L; SheetJS reads it)
    contentType === "application/vnd.ms-excel.sheet.binary.macroenabled.12" // .xlsb (B8L; SheetJS reads it)
  ) {
    const XLSX = require("xlsx");
    const wb = XLSX.read(buf, { type: "buffer" });
    const manifest = [];
    const sections = [];
    for (const name of wb.SheetNames) {
      const ws = wb.Sheets[name];
      const ref = (ws && ws["!ref"]) || "(empty)";
      const csv = ws ? XLSX.utils.sheet_to_csv(ws) : "";
      manifest.push(`- ${name} (${ref})`);
      sections.push(`## Sheet: ${name} (${ref})\n\n\`\`\`csv\n${csv}\n\`\`\``);
    }
    return `# Workbook — ${wb.SheetNames.length} sheet(s)\n\n${manifest.join("\n")}\n\n${sections.join("\n\n")}`;
  }
  if (contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const mammoth = require("mammoth");
    const result = await mammoth.extractRawText({ buffer: buf });
    return (result && result.value) || "";
  }
  if (contentType === "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
    const officeParser = require("officeparser");
    return await officeParser.parseOfficeAsync(buf);
  }
  if (contentType === "application/pdf") {
    const pdfParse = require("pdf-parse/lib/pdf-parse.js"); // pin pdf-parse@1.1.1; inner lib avoids the index.js debug-block (reads a test PDF when module.parent is falsy, as in Functions)
    const data = await pdfParse(buf);
    return (data && data.text) || "";
  }
  throw new Error(`No extractor registered for content-type ${contentType}`);
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

  // ---- Validate inputs before any SQL / Blob call (deterministic 400s) ----
  const attachmentId = typeof body.attachment_id === "string" ? body.attachment_id.trim() : "";
  if (!isUuid(attachmentId)) {
    return send(context, 400, errorBody("INVALID_REQUEST", "Field 'attachment_id' is required and must be a valid UUID.", 400));
  }

  const filename = cleanFileName(body.filename);
  if (!filename) {
    return send(context, 400, errorBody("INVALID_REQUEST", "Field 'filename' is required and must be a non-empty string.", 400));
  }

  // NOTE: content-type is NOT taken from the request body — it is read from the blob's
  // ACTUAL stored Content-Type below (after HEAD), so the client cannot misdeclare it (D-8).

  const conversationId =
    body.conversation_id != null && typeof body.conversation_id === "string" && body.conversation_id.trim() !== ""
      ? body.conversation_id.trim()
      : null;
  if (conversationId !== null && !isUuid(conversationId)) {
    return send(context, 400, errorBody("INVALID_REQUEST", "Field 'conversation_id', when supplied, must be a valid UUID.", 400));
  }

  // Deterministic owner-scoped blob path (same construction as create). The caller cannot
  // finalize another user's blob: the path is derived from THIS request's OID.
  const blobKey = `attachments/${oid}/${attachmentId}`;

  // Read the actual stored size from Blob (authoritative; the client cannot misdeclare it).
  let props;
  try {
    props = await getBlobProperties(STORAGE_ACCOUNT, STORAGE_CONTAINER, blobKey);
  } catch (err) {
    context.log.error("dottie_finalize_attachment: blob HEAD failed", err);
    return send(context, 502, errorBody("STORAGE_ERROR", "Could not read the uploaded blob.", 502));
  }
  if (!props) {
    return send(context, 404, errorBody("NOT_FOUND", "Uploaded blob not found for this attachment id (upload may have failed or expired).", 404));
  }

  // AUTHORITATIVE content-type = the blob's ACTUAL stored Content-Type (set on the client's PUT),
  // NOT a client-declared body field. The allow-list, ingestion class, and per-class cap are all
  // enforced against this actual type, so a client cannot misdeclare the type past the guardrail (D-8).
  const contentType = normalizeContentType(props.contentType);
  const ingestion = INGESTION_CLASSES[contentType];
  if (!ingestion) {
    await deleteBlobBestEffort(context, STORAGE_ACCOUNT, STORAGE_CONTAINER, blobKey);
    return send(
      context,
      400,
      errorBody(
        "UNSUPPORTED_MEDIA_TYPE",
        `Uploaded blob Content-Type '${contentType || "(none)"}' is not a supported attachment type. Allowed: ${ALLOWED_CONTENT_TYPES.join(", ")}.`,
        400
      )
    );
  }

  if (!Number.isFinite(props.contentLength) || props.contentLength <= 0) {
    await deleteBlobBestEffort(context, STORAGE_ACCOUNT, STORAGE_CONTAINER, blobKey);
    return send(context, 400, errorBody("INVALID_REQUEST", "Uploaded file is empty.", 400));
  }
  if (props.contentLength > ingestion.maxBytes) {
    await deleteBlobBestEffort(context, STORAGE_ACCOUNT, STORAGE_CONTAINER, blobKey);
    const limitMb = Math.round(ingestion.maxBytes / (1024 * 1024));
    return send(context, 400, errorBody(
      "PAYLOAD_TOO_LARGE",
      `Uploaded file (${props.contentLength} bytes) exceeds the ${limitMb} MB limit for ${ingestion.class}-class files.`,
      400
    ));
  }
  const byteSize = props.contentLength;

  // ---- B8c: extract-class types are text-extracted at finalize and the text stored as a
  // sibling blob. Native types skip extraction. Extraction failure is NON-FATAL: the file is
  // already stored, so we still persist the row (extracted_text_path = NULL) and the gateway
  // (B8d) reports the file could not be read rather than losing the upload.
  // B8f (large-document handling): a PDF larger than PDF_NATIVE_MAX_BYTES is promoted from native
  // to extract-class — its text is extracted (pdf-parse) and budgeted at the gateway — so a big,
  // text-dense PDF cannot blow the synchronous request / model context. Small PDFs stay native.
  const isLargePdf = contentType === "application/pdf" && byteSize > PDF_NATIVE_MAX_BYTES;
  let ingestionClass = isLargePdf ? "extract" : ingestion.class; // 'native' | 'extract'
  let extractedTextPath = null;
  if (ingestionClass === "extract") {
    try {
      const buf = await downloadBlob(STORAGE_ACCOUNT, STORAGE_CONTAINER, blobKey);
      const text = await extractTextFromBlob(buf, contentType);
      const siblingKey = `${blobKey}.extracted.md`;
      await putTextBlob(STORAGE_ACCOUNT, STORAGE_CONTAINER, siblingKey, text);
      extractedTextPath = siblingKey;
    } catch (exErr) {
      context.log.error("dottie_finalize_attachment: extraction failed (non-fatal)", exErr);
      extractedTextPath = null;
    }
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

    // FK ownership: a referenced conversation MUST belong to the caller, else 404 (no leakage).
    if (conversationId !== null) {
      const owned = await client.query(
        `SELECT 1 FROM public.dottie_conversations WHERE id = $1 AND created_by = $2`,
        [conversationId, oid]
      );
      if (owned.rowCount === 0) {
        throw buildKnownError("NOT_FOUND", "Referenced conversation not found.", 404);
      }
    }

    // Persist the owner-scoped attachment row. id = attachmentId so row id ↔ blob path are 1:1.
    // created_by = the signed-in OID (explicit ownership; RLS is the defence-in-depth layer).
    const inserted = await client.query(
      `
      INSERT INTO public.dottie_attachments
        (id, created_by, conversation_id, filename, content_type, byte_size, blob_container, blob_path, ingestion_class, extracted_text_path)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING
        id, conversation_id, filename, content_type, byte_size, blob_container, blob_path, ingestion_class, extracted_text_path, created_at
      `,
      [attachmentId, oid, conversationId, filename, contentType, byteSize, STORAGE_CONTAINER, blobKey, ingestionClass, extractedTextPath]
    );

    await client.query("COMMIT");

    return send(context, 201, successBody({ attachment: inserted.rows[0] }));
  } catch (err) {
    if (client) {
      try { await client.query("ROLLBACK"); } catch {}
    }

    context.log.error("dottie_finalize_attachment failed", err);

    if (err && err.code === "42501") {
      return send(context, 403, errorBody("FORBIDDEN", "You do not have permission to create this attachment.", 403));
    }
    if (err && err.isKnown === true && typeof err.status === "number" && typeof err.code === "string") {
      return send(context, err.status, errorBody(err.code, err.message, err.status));
    }
    // Duplicate primary key: this attachment id was already finalized.
    if (err && err.code === "23505") {
      return send(context, 409, errorBody("CONFLICT", "This attachment has already been finalized.", 409));
    }
    // FK violation: conversation_id absent / not owned.
    if (err && err.code === "23503") {
      return send(context, 404, errorBody("NOT_FOUND", "Referenced conversation not found.", 404));
    }
    // CHECK violation (non-empty filename / byte_size >= 0), defensive (validated above).
    if (err && err.code === "23514") {
      return send(context, 400, errorBody("INVALID_REQUEST", "Attachment violates a field constraint.", 400));
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
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["post", "options"],
      "route": "dottie_finalize_attachment"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```
Primary reference (deployed `theo_finalize_attachment`):
```javascript
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
});

// ---- Ingestion classes (D-8 RESOLVED): declared-type allow-list + per-class size cap.
const NATIVE_MAX_BYTES = 10 * 1024 * 1024;
const PDF_NATIVE_MAX_BYTES = parseInt(process.env.THEO_PDF_NATIVE_MAX_BYTES || "", 10) > 0 ? parseInt(process.env.THEO_PDF_NATIVE_MAX_BYTES, 10) : 3 * 1024 * 1024; // B8f: PDFs larger than this are text-extracted instead of sent as a (large) document block
const EXTRACT_MAX_BYTES = 50 * 1024 * 1024;
const INGESTION_CLASSES = {
  "application/pdf": { class: "native", maxBytes: NATIVE_MAX_BYTES },
  "image/png": { class: "native", maxBytes: NATIVE_MAX_BYTES },
  "image/jpeg": { class: "native", maxBytes: NATIVE_MAX_BYTES },
  "image/webp": { class: "native", maxBytes: NATIVE_MAX_BYTES },
  "image/gif": { class: "native", maxBytes: NATIVE_MAX_BYTES },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { class: "extract", maxBytes: EXTRACT_MAX_BYTES }, // .xlsx
  "application/vnd.ms-excel": { class: "extract", maxBytes: EXTRACT_MAX_BYTES }, // .xls
  "application/vnd.ms-excel.sheet.macroenabled.12": { class: "extract", maxBytes: EXTRACT_MAX_BYTES }, // .xlsm (B8L — key lowercased; normalizeContentType lowercases macroEnabled)
  "application/vnd.ms-excel.sheet.binary.macroenabled.12": { class: "extract", maxBytes: EXTRACT_MAX_BYTES }, // .xlsb (B8L)
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { class: "extract", maxBytes: EXTRACT_MAX_BYTES }, // .docx
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": { class: "extract", maxBytes: EXTRACT_MAX_BYTES }, // .pptx
  "text/csv": { class: "extract", maxBytes: EXTRACT_MAX_BYTES },
  "text/plain": { class: "extract", maxBytes: EXTRACT_MAX_BYTES },
};
const ALLOWED_CONTENT_TYPES = Object.keys(INGESTION_CLASSES);

const STORAGE_ACCOUNT = process.env.THEO_BLOB_ACCOUNT || "vaultgptstorage01";
const STORAGE_CONTAINER = process.env.THEO_BLOB_CONTAINER || "theo-content";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-ms-client-principal",
};

function send(context, status, body) {
  context.res = {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    body,
  };
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
    if (match && typeof match.val === "string" && match.val.trim()) {
      return match.val.trim();
    }
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

function normalizeContentType(ct) {
  return String(ct || "").split(";")[0].trim().toLowerCase();
}

function cleanFileName(name) {
  if (name === undefined || name === null) return null;
  const raw = String(name).trim();
  if (!raw.length) return null;
  const cleaned = raw.replace(/[\\/:*?"<>|]+/g, "_").replace(/\s+/g, " ").trim();
  return cleaned.length ? cleaned.slice(0, 180) : null;
}

// ---- Managed-identity data-plane Blob access (mirrors the deployed axis MI technique).
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
        res.on("end", () => {
          resolve({ statusCode: res.statusCode || 0, headers: res.headers || {}, body: data });
        });
      }
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

// Binary variant: collects Buffer chunks (must NOT coerce to string — blobs are binary zips).
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
        res.on("end", () => {
          resolve({ statusCode: res.statusCode || 0, headers: res.headers || {}, body: Buffer.concat(chunks) });
        });
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
    throw new Error(
      "Managed Identity endpoint not available (IDENTITY_ENDPOINT/IDENTITY_HEADER missing). " +
      "Ensure System Assigned Managed Identity is enabled on the Function App."
    );
  }
  const tokenUrl = `${identityEndpoint}?resource=${encodeURIComponent(resource)}&api-version=2019-08-01`;
  const r = await requestUrl(tokenUrl, { method: "GET", headers: { "X-IDENTITY-HEADER": identityHeader } });
  if (r.statusCode < 200 || r.statusCode >= 300) {
    throw new Error(`Managed Identity token endpoint failed (${r.statusCode}): ${r.body}`);
  }
  const payload = JSON.parse(r.body || "{}");
  if (!payload.access_token) {
    throw new Error("Managed Identity token endpoint did not return access_token.");
  }
  return payload.access_token;
}

function encodeBlobPath(blobKey) {
  return blobKey.split("/").map(encodeURIComponent).join("/");
}

function blobUrlFor(accountName, containerName, blobKey) {
  return `https://${accountName}.blob.core.windows.net/${containerName}/${encodeBlobPath(blobKey)}`;
}

// HEAD the blob to read its AUTHORITATIVE byte size + stored Content-Type. Returns null when absent.
async function getBlobProperties(accountName, containerName, blobKey) {
  const accessToken = await getManagedIdentityAccessToken("https://storage.azure.com/");
  const r = await requestUrl(blobUrlFor(accountName, containerName, blobKey), {
    method: "HEAD",
    headers: { Authorization: `Bearer ${accessToken}`, "x-ms-version": "2022-11-02" },
  });
  if (r.statusCode === 404) return null;
  if (r.statusCode < 200 || r.statusCode >= 300) {
    throw new Error(`HEAD blob failed (${r.statusCode}): ${r.body}`);
  }
  const len = Number(r.headers["content-length"]);
  return {
    contentLength: Number.isFinite(len) ? len : 0,
    contentType: r.headers["content-type"] || null,
  };
}

async function downloadBlob(accountName, containerName, blobKey) {
  const accessToken = await getManagedIdentityAccessToken("https://storage.azure.com/");
  const r = await requestBinary(blobUrlFor(accountName, containerName, blobKey), {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}`, "x-ms-version": "2022-11-02" },
  });
  if (r.statusCode < 200 || r.statusCode >= 300) {
    throw new Error(`GET blob failed (${r.statusCode})`);
  }
  return r.body; // Buffer
}

async function putTextBlob(accountName, containerName, blobKey, text) {
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
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Length": bodyBuf.length,
      },
    },
    bodyBuf
  );
  if (r.statusCode < 200 || r.statusCode >= 300) {
    throw new Error(`PUT extracted blob failed (${r.statusCode}): ${r.body}`);
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
    context.log.warn("theo_finalize_attachment: best-effort blob cleanup failed", e);
  }
}

// ---- Extract-class text extraction (Walter-authorized npm libs; "path a is the way to go").
// xlsx/.xls -> SheetJS (per-sheet CSV + manifest); .docx -> mammoth; .pptx -> officeparser;
// text/csv + text/plain -> native UTF-8 decode. Returns a markdown string.
async function extractTextFromBlob(buf, contentType) {
  if (contentType === "text/plain" || contentType === "text/csv") {
    return buf.toString("utf8");
  }
  if (
    contentType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    contentType === "application/vnd.ms-excel" ||
    contentType === "application/vnd.ms-excel.sheet.macroenabled.12" || // .xlsm (B8L; SheetJS reads it)
    contentType === "application/vnd.ms-excel.sheet.binary.macroenabled.12" // .xlsb (B8L; SheetJS reads it)
  ) {
    const XLSX = require("xlsx");
    const wb = XLSX.read(buf, { type: "buffer" });
    const manifest = [];
    const sections = [];
    for (const name of wb.SheetNames) {
      const ws = wb.Sheets[name];
      const ref = (ws && ws["!ref"]) || "(empty)";
      const csv = ws ? XLSX.utils.sheet_to_csv(ws) : "";
      manifest.push(`- ${name} (${ref})`);
      sections.push(`## Sheet: ${name} (${ref})\n\n\`\`\`csv\n${csv}\n\`\`\``);
    }
    return `# Workbook — ${wb.SheetNames.length} sheet(s)\n\n${manifest.join("\n")}\n\n${sections.join("\n\n")}`;
  }
  if (contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const mammoth = require("mammoth");
    const result = await mammoth.extractRawText({ buffer: buf });
    return (result && result.value) || "";
  }
  if (contentType === "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
    const officeParser = require("officeparser");
    return await officeParser.parseOfficeAsync(buf);
  }
  if (contentType === "application/pdf") {
    const pdfParse = require("pdf-parse/lib/pdf-parse.js"); // pin pdf-parse@1.1.1; inner lib avoids the index.js debug-block (reads a test PDF when module.parent is falsy, as in Functions)
    const data = await pdfParse(buf);
    return (data && data.text) || "";
  }
  throw new Error(`No extractor registered for content-type ${contentType}`);
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

  // ---- Validate inputs before any SQL / Blob call (deterministic 400s) ----
  const attachmentId = typeof body.attachment_id === "string" ? body.attachment_id.trim() : "";
  if (!isUuid(attachmentId)) {
    return send(context, 400, errorBody("INVALID_REQUEST", "Field 'attachment_id' is required and must be a valid UUID.", 400));
  }

  const filename = cleanFileName(body.filename);
  if (!filename) {
    return send(context, 400, errorBody("INVALID_REQUEST", "Field 'filename' is required and must be a non-empty string.", 400));
  }

  // NOTE: content-type is NOT taken from the request body — it is read from the blob's
  // ACTUAL stored Content-Type below (after HEAD), so the client cannot misdeclare it (D-8).

  const conversationId =
    body.conversation_id != null && typeof body.conversation_id === "string" && body.conversation_id.trim() !== ""
      ? body.conversation_id.trim()
      : null;
  if (conversationId !== null && !isUuid(conversationId)) {
    return send(context, 400, errorBody("INVALID_REQUEST", "Field 'conversation_id', when supplied, must be a valid UUID.", 400));
  }

  // Deterministic owner-scoped blob path (same construction as create). The caller cannot
  // finalize another user's blob: the path is derived from THIS request's OID.
  const blobKey = `attachments/${oid}/${attachmentId}`;

  // Read the actual stored size from Blob (authoritative; the client cannot misdeclare it).
  let props;
  try {
    props = await getBlobProperties(STORAGE_ACCOUNT, STORAGE_CONTAINER, blobKey);
  } catch (err) {
    context.log.error("theo_finalize_attachment: blob HEAD failed", err);
    return send(context, 502, errorBody("STORAGE_ERROR", "Could not read the uploaded blob.", 502));
  }
  if (!props) {
    return send(context, 404, errorBody("NOT_FOUND", "Uploaded blob not found for this attachment id (upload may have failed or expired).", 404));
  }

  // AUTHORITATIVE content-type = the blob's ACTUAL stored Content-Type (set on the client's PUT),
  // NOT a client-declared body field. The allow-list, ingestion class, and per-class cap are all
  // enforced against this actual type, so a client cannot misdeclare the type past the guardrail (D-8).
  const contentType = normalizeContentType(props.contentType);
  const ingestion = INGESTION_CLASSES[contentType];
  if (!ingestion) {
    await deleteBlobBestEffort(context, STORAGE_ACCOUNT, STORAGE_CONTAINER, blobKey);
    return send(
      context,
      400,
      errorBody(
        "UNSUPPORTED_MEDIA_TYPE",
        `Uploaded blob Content-Type '${contentType || "(none)"}' is not a supported attachment type. Allowed: ${ALLOWED_CONTENT_TYPES.join(", ")}.`,
        400
      )
    );
  }

  if (!Number.isFinite(props.contentLength) || props.contentLength <= 0) {
    await deleteBlobBestEffort(context, STORAGE_ACCOUNT, STORAGE_CONTAINER, blobKey);
    return send(context, 400, errorBody("INVALID_REQUEST", "Uploaded file is empty.", 400));
  }
  if (props.contentLength > ingestion.maxBytes) {
    await deleteBlobBestEffort(context, STORAGE_ACCOUNT, STORAGE_CONTAINER, blobKey);
    const limitMb = Math.round(ingestion.maxBytes / (1024 * 1024));
    return send(context, 400, errorBody(
      "PAYLOAD_TOO_LARGE",
      `Uploaded file (${props.contentLength} bytes) exceeds the ${limitMb} MB limit for ${ingestion.class}-class files.`,
      400
    ));
  }
  const byteSize = props.contentLength;

  // ---- B8c: extract-class types are text-extracted at finalize and the text stored as a
  // sibling blob. Native types skip extraction. Extraction failure is NON-FATAL: the file is
  // already stored, so we still persist the row (extracted_text_path = NULL) and the gateway
  // (B8d) reports the file could not be read rather than losing the upload.
  // B8f (large-document handling): a PDF larger than PDF_NATIVE_MAX_BYTES is promoted from native
  // to extract-class — its text is extracted (pdf-parse) and budgeted at the gateway — so a big,
  // text-dense PDF cannot blow the synchronous request / model context. Small PDFs stay native.
  const isLargePdf = contentType === "application/pdf" && byteSize > PDF_NATIVE_MAX_BYTES;
  let ingestionClass = isLargePdf ? "extract" : ingestion.class; // 'native' | 'extract'
  let extractedTextPath = null;
  if (ingestionClass === "extract") {
    try {
      const buf = await downloadBlob(STORAGE_ACCOUNT, STORAGE_CONTAINER, blobKey);
      const text = await extractTextFromBlob(buf, contentType);
      const siblingKey = `${blobKey}.extracted.md`;
      await putTextBlob(STORAGE_ACCOUNT, STORAGE_CONTAINER, siblingKey, text);
      extractedTextPath = siblingKey;
    } catch (exErr) {
      context.log.error("theo_finalize_attachment: extraction failed (non-fatal)", exErr);
      extractedTextPath = null;
    }
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

    // FK ownership: a referenced conversation MUST belong to the caller, else 404 (no leakage).
    if (conversationId !== null) {
      const owned = await client.query(
        `SELECT 1 FROM public.theo_conversations WHERE id = $1 AND created_by = $2`,
        [conversationId, oid]
      );
      if (owned.rowCount === 0) {
        throw buildKnownError("NOT_FOUND", "Referenced conversation not found.", 404);
      }
    }

    // Persist the owner-scoped attachment row. id = attachmentId so row id ↔ blob path are 1:1.
    // created_by = the signed-in OID (explicit ownership; RLS is the defence-in-depth layer).
    const inserted = await client.query(
      `
      INSERT INTO public.theo_attachments
        (id, created_by, conversation_id, filename, content_type, byte_size, blob_container, blob_path, ingestion_class, extracted_text_path)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING
        id, conversation_id, filename, content_type, byte_size, blob_container, blob_path, ingestion_class, extracted_text_path, created_at
      `,
      [attachmentId, oid, conversationId, filename, contentType, byteSize, STORAGE_CONTAINER, blobKey, ingestionClass, extractedTextPath]
    );

    await client.query("COMMIT");

    return send(context, 201, successBody({ attachment: inserted.rows[0] }));
  } catch (err) {
    if (client) {
      try { await client.query("ROLLBACK"); } catch {}
    }

    context.log.error("theo_finalize_attachment failed", err);

    if (err && err.code === "42501") {
      return send(context, 403, errorBody("FORBIDDEN", "You do not have permission to create this attachment.", 403));
    }
    if (err && err.isKnown === true && typeof err.status === "number" && typeof err.code === "string") {
      return send(context, err.status, errorBody(err.code, err.message, err.status));
    }
    // Duplicate primary key: this attachment id was already finalized.
    if (err && err.code === "23505") {
      return send(context, 409, errorBody("CONFLICT", "This attachment has already been finalized.", 409));
    }
    // FK violation: conversation_id absent / not owned.
    if (err && err.code === "23503") {
      return send(context, 404, errorBody("NOT_FOUND", "Referenced conversation not found.", 404));
    }
    // CHECK violation (non-empty filename / byte_size >= 0), defensive (validated above).
    if (err && err.code === "23514") {
      return send(context, 400, errorBody("INVALID_REQUEST", "Attachment violates a field constraint.", 400));
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
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["post", "options"],
      "route": "theo_finalize_attachment"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

### §5.3 dottie_delete_attachment
```javascript
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
});

const STORAGE_ACCOUNT = process.env.DOTTIE_BLOB_ACCOUNT || "vaultgptdottiestore";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-ms-client-principal",
};

function send(context, status, body) {
  context.res = {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    body,
  };
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
    if (match && typeof match.val === "string" && match.val.trim()) {
      return match.val.trim();
    }
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

// ---- Managed-identity data-plane Blob delete (mirrors the deployed axis MI technique).
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
        res.on("end", () => {
          resolve({ statusCode: res.statusCode || 0, headers: res.headers || {}, body: data });
        });
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
    throw new Error(
      "Managed Identity endpoint not available (IDENTITY_ENDPOINT/IDENTITY_HEADER missing). " +
      "Ensure System Assigned Managed Identity is enabled on the Function App."
    );
  }
  const tokenUrl = `${identityEndpoint}?resource=${encodeURIComponent(resource)}&api-version=2019-08-01`;
  const r = await requestUrl(tokenUrl, { method: "GET", headers: { "X-IDENTITY-HEADER": identityHeader } });
  if (r.statusCode < 200 || r.statusCode >= 300) {
    throw new Error(`Managed Identity token endpoint failed (${r.statusCode}): ${r.body}`);
  }
  const payload = JSON.parse(r.body || "{}");
  if (!payload.access_token) {
    throw new Error("Managed Identity token endpoint did not return access_token.");
  }
  return payload.access_token;
}

function encodeBlobPath(blobKey) {
  return blobKey.split("/").map(encodeURIComponent).join("/");
}

// Best-effort blob delete AFTER the row is removed. The DB row is the source of truth;
// a residual blob (if this fails) is a harmless orphan that a future sweeper can reclaim.
async function deleteBlobBestEffort(context, accountName, containerName, blobKey) {
  try {
    const accessToken = await getManagedIdentityAccessToken("https://storage.azure.com/");
    const url = `https://${accountName}.blob.core.windows.net/${containerName}/${encodeBlobPath(blobKey)}`;
    await requestUrl(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}`, "x-ms-version": "2022-11-02" },
    });
  } catch (e) {
    context.log.warn("dottie_delete_attachment: best-effort blob cleanup failed", e);
  }
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
  let removed = null;
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

    // Explicit owner-scoped delete; RETURNING the blob pointer so we can clean it up after commit.
    const deleted = await client.query(
      `DELETE FROM public.dottie_attachments WHERE id = $1 AND created_by = $2 RETURNING id, blob_container, blob_path`,
      [id, oid]
    );

    if (deleted.rowCount === 0) {
      const existsResult = await client.query(
        `SELECT public.dottie_attachment_exists_unscoped($1::uuid) AS e`,
        [id]
      );
      const exists = existsResult.rows[0] && existsResult.rows[0].e === true;
      throw exists
        ? buildKnownError("FORBIDDEN", "You do not have access to this attachment.", 403)
        : buildKnownError("NOT_FOUND", "Attachment not found.", 404);
    }

    await client.query("COMMIT");
    removed = deleted.rows[0];
  } catch (err) {
    if (client) {
      try { await client.query("ROLLBACK"); } catch {}
    }

    context.log.error("dottie_delete_attachment failed", err);

    if (err && err.code === "42501") {
      return send(context, 403, errorBody("FORBIDDEN", "You do not have access to this attachment.", 403));
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

  // Row committed-deleted; reclaim the blob (best-effort, orphan-safe).
  if (removed && removed.blob_path) {
    await deleteBlobBestEffort(context, STORAGE_ACCOUNT, removed.blob_container || "dottie-content", removed.blob_path);
  }

  return send(context, 200, successBody({ deleted: true, id: removed.id }));
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
      "methods": ["post", "options"],
      "route": "dottie_delete_attachment"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```
Primary reference (deployed `theo_delete_attachment`):
```javascript
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
});

const STORAGE_ACCOUNT = process.env.THEO_BLOB_ACCOUNT || "vaultgptstorage01";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-ms-client-principal",
};

function send(context, status, body) {
  context.res = {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    body,
  };
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
    if (match && typeof match.val === "string" && match.val.trim()) {
      return match.val.trim();
    }
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

// ---- Managed-identity data-plane Blob delete (mirrors the deployed axis MI technique).
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
        res.on("end", () => {
          resolve({ statusCode: res.statusCode || 0, headers: res.headers || {}, body: data });
        });
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
    throw new Error(
      "Managed Identity endpoint not available (IDENTITY_ENDPOINT/IDENTITY_HEADER missing). " +
      "Ensure System Assigned Managed Identity is enabled on the Function App."
    );
  }
  const tokenUrl = `${identityEndpoint}?resource=${encodeURIComponent(resource)}&api-version=2019-08-01`;
  const r = await requestUrl(tokenUrl, { method: "GET", headers: { "X-IDENTITY-HEADER": identityHeader } });
  if (r.statusCode < 200 || r.statusCode >= 300) {
    throw new Error(`Managed Identity token endpoint failed (${r.statusCode}): ${r.body}`);
  }
  const payload = JSON.parse(r.body || "{}");
  if (!payload.access_token) {
    throw new Error("Managed Identity token endpoint did not return access_token.");
  }
  return payload.access_token;
}

function encodeBlobPath(blobKey) {
  return blobKey.split("/").map(encodeURIComponent).join("/");
}

// Best-effort blob delete AFTER the row is removed. The DB row is the source of truth;
// a residual blob (if this fails) is a harmless orphan that a future sweeper can reclaim.
async function deleteBlobBestEffort(context, accountName, containerName, blobKey) {
  try {
    const accessToken = await getManagedIdentityAccessToken("https://storage.azure.com/");
    const url = `https://${accountName}.blob.core.windows.net/${containerName}/${encodeBlobPath(blobKey)}`;
    await requestUrl(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}`, "x-ms-version": "2022-11-02" },
    });
  } catch (e) {
    context.log.warn("theo_delete_attachment: best-effort blob cleanup failed", e);
  }
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
  let removed = null;
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

    // Explicit owner-scoped delete; RETURNING the blob pointer so we can clean it up after commit.
    const deleted = await client.query(
      `DELETE FROM public.theo_attachments WHERE id = $1 AND created_by = $2 RETURNING id, blob_container, blob_path`,
      [id, oid]
    );

    if (deleted.rowCount === 0) {
      const existsResult = await client.query(
        `SELECT public.theo_attachment_exists_unscoped($1::uuid) AS e`,
        [id]
      );
      const exists = existsResult.rows[0] && existsResult.rows[0].e === true;
      throw exists
        ? buildKnownError("FORBIDDEN", "You do not have access to this attachment.", 403)
        : buildKnownError("NOT_FOUND", "Attachment not found.", 404);
    }

    await client.query("COMMIT");
    removed = deleted.rows[0];
  } catch (err) {
    if (client) {
      try { await client.query("ROLLBACK"); } catch {}
    }

    context.log.error("theo_delete_attachment failed", err);

    if (err && err.code === "42501") {
      return send(context, 403, errorBody("FORBIDDEN", "You do not have access to this attachment.", 403));
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

  // Row committed-deleted; reclaim the blob (best-effort, orphan-safe).
  if (removed && removed.blob_path) {
    await deleteBlobBestEffort(context, STORAGE_ACCOUNT, removed.blob_container || "theo-content", removed.blob_path);
  }

  return send(context, 200, successBody({ deleted: true, id: removed.id }));
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
      "methods": ["post", "options"],
      "route": "theo_delete_attachment"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

### §5.4 dottie_list_conversation_attachments
```javascript
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

  const conversationId =
    req.query && typeof req.query.conversationId === "string" ? req.query.conversationId.trim() : "";
  if (!isUuid(conversationId)) {
    return send(
      context,
      400,
      errorBody("INVALID_REQUEST", "Query parameter 'conversationId' is required and must be a valid UUID.", 400)
    );
  }

  const client = await pool.connect();

  try {
    await client.query(
      `
      SELECT
        set_config('app.current_user_id', $1, false),
        set_config('request.jwt.claim.sub', $1, false),
        set_config('request.jwt.claim.oid', $1, false)
      `,
      [oid]
    );

    // Resolve conversation ownership first so reload-parity reads return the same
    // 403/404 semantics as dottie_get_conversation (owner-scoped; defense-in-depth
    // created_by filter on top of RLS, since the connection role bypasses RLS).
    const convResult = await client.query(
      `
      SELECT id
      FROM public.dottie_conversations
      WHERE id = $1 AND created_by = $2
      `,
      [conversationId, oid]
    );

    if (convResult.rowCount === 0) {
      const existsResult = await client.query(
        `SELECT public.dottie_conversation_exists_unscoped($1::uuid) AS e`,
        [conversationId]
      );
      const exists = existsResult.rows[0] && existsResult.rows[0].e === true;
      return exists
        ? send(context, 403, errorBody("FORBIDDEN", "You do not have access to this conversation.", 403))
        : send(context, 404, errorBody("NOT_FOUND", "Conversation not found.", 404));
    }

    const attachmentsResult = await client.query(
      `
      SELECT
        id,
        filename,
        content_type,
        byte_size,
        ingestion_class,
        message_seq,
        created_at
      FROM public.dottie_attachments
      WHERE conversation_id = $1 AND created_by = $2
      ORDER BY message_seq ASC NULLS LAST, created_at ASC
      `,
      [conversationId, oid]
    );

    return send(context, 200, successBody({ attachments: attachmentsResult.rows }));
  } catch (err) {
    context.log.error("dottie_list_conversation_attachments failed", err);

    if (err && err.code === "42501") {
      return send(context, 403, errorBody("FORBIDDEN", "You do not have access to this conversation.", 403));
    }

    return send(context, 500, errorBody("INTERNAL_SERVER_ERROR", "An unexpected error occurred.", 500));
  } finally {
    client.release();
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
      "route": "dottie_list_conversation_attachments"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```
Primary reference (deployed `theo_list_conversation_attachments`):
```javascript
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

  const conversationId =
    req.query && typeof req.query.conversationId === "string" ? req.query.conversationId.trim() : "";
  if (!isUuid(conversationId)) {
    return send(
      context,
      400,
      errorBody("INVALID_REQUEST", "Query parameter 'conversationId' is required and must be a valid UUID.", 400)
    );
  }

  const client = await pool.connect();

  try {
    await client.query(
      `
      SELECT
        set_config('app.current_user_id', $1, false),
        set_config('request.jwt.claim.sub', $1, false),
        set_config('request.jwt.claim.oid', $1, false)
      `,
      [oid]
    );

    // Resolve conversation ownership first so reload-parity reads return the same
    // 403/404 semantics as theo_get_conversation (owner-scoped; defense-in-depth
    // created_by filter on top of RLS, since the connection role bypasses RLS).
    const convResult = await client.query(
      `
      SELECT id
      FROM public.theo_conversations
      WHERE id = $1 AND created_by = $2
      `,
      [conversationId, oid]
    );

    if (convResult.rowCount === 0) {
      const existsResult = await client.query(
        `SELECT public.theo_conversation_exists_unscoped($1::uuid) AS e`,
        [conversationId]
      );
      const exists = existsResult.rows[0] && existsResult.rows[0].e === true;
      return exists
        ? send(context, 403, errorBody("FORBIDDEN", "You do not have access to this conversation.", 403))
        : send(context, 404, errorBody("NOT_FOUND", "Conversation not found.", 404));
    }

    const attachmentsResult = await client.query(
      `
      SELECT
        id,
        filename,
        content_type,
        byte_size,
        ingestion_class,
        message_seq,
        created_at
      FROM public.theo_attachments
      WHERE conversation_id = $1 AND created_by = $2
      ORDER BY message_seq ASC NULLS LAST, created_at ASC
      `,
      [conversationId, oid]
    );

    return send(context, 200, successBody({ attachments: attachmentsResult.rows }));
  } catch (err) {
    context.log.error("theo_list_conversation_attachments failed", err);

    if (err && err.code === "42501") {
      return send(context, 403, errorBody("FORBIDDEN", "You do not have access to this conversation.", 403));
    }

    return send(context, 500, errorBody("INTERNAL_SERVER_ERROR", "An unexpected error occurred.", 500));
  } finally {
    client.release();
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
      "route": "theo_list_conversation_attachments"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

## §6 — Golden Curls (Golden §5.3; Claude runs post-deploy, authenticated az bearer aud `api://4e1a1e31…`)
Full upload round-trip against `dottie-content` (a small real PDF + a .txt):
| # | Call | Expect |
| - | ---- | ------ |
| C1 | `POST /api/dottie_create_attachment_upload` `{filename:"t.pdf", content_type:"application/pdf"}` | `201` + `upload.uploadUrl` (SAS); `ingestionClass:"native"` |
| C2 | `PUT` the bytes to `upload.uploadUrl` with `x-ms-blob-type:BlockBlob` + matching `Content-Type` | `201` (SAS + 24-field signer + Blob CORS all correct) |
| C3 | `POST /api/dottie_finalize_attachment` `{attachment_id:<C1>, filename:"t.pdf"}` | `201 { attachment:{ id, content_type:"application/pdf", byte_size, ingestion_class:"native", blob_path } }` |
| C4 | a `text/csv` upload → finalize | `201`; `ingestion_class:"extract"`; `extracted_text_path` set (sibling `.extracted.md` written) |
| C5 | `GET /api/dottie_list_conversation_attachments?conversationId=<owned>` (finalize with that conversation_id first) | `200 { attachments:[…] }`; no `blob_path`/`blob_container` projected |
| C6 | `POST /api/dottie_delete_attachment` `{id:<C1>}` | `200 { deleted:true }`; the blob is gone (best-effort) |
| C7 | create with a disallowed `content_type` (e.g. `application/zip`) | `400 UNSUPPORTED_MEDIA_TYPE` |
| C8 | finalize a never-uploaded `attachment_id` | `404` (blob absent) |
| C9 | each, unauthenticated | `401` |

## §7 — Gap Register
**PROCEED** (grounded; the paired schema + infra prerequisites are disclosed and deploy-ordered).
- **G-SCHEMA: PRE-LAND (paired package, ordered).** `dottie_attachments` + `dottie_attachment_exists_unscoped` land via `Dottie-Attachments-Schema-Pass-1-VEP` (Codex-approved + Walter-run) BEFORE these handlers deploy; re-verified at deploy. Disclosed (§3).
- **G-INFRA: PRE-LAND (deploy step).** Create `dottie-content`; grant the MI Storage Blob Data Contributor; `npm install` the 4 extraction deps; set the blob app settings; Blob CORS. az-verified current state in §4. Disclosed.
- **G-APISPEC / G-UNGATE: PRE-LAND (Role-C post-deploy).** Add the 4 endpoints to `spec/DOTTIE_API_SPEC.md`, flip reconciliation §D → LIVE, and flip `DOTTIE_CAPABILITIES.attachments` → `true` (un-gates the paperclip + reopen read) once the curls pass. Disclosed.

## §8 — Deploy plan (ordered; §1D)
1. **Schema first:** the paired schema package is Codex-APPROVED and Walter has run `dottie_attachments_migration.sql`; Claude verifies (read-only catalog) — this must be green before step 3. 2. **Infra:** Claude creates the `dottie-content` container on `vaultgptdottiestore`, grants the func-dottie MI Storage Blob Data Contributor, `npm install xlsx mammoth officeparser pdf-parse@1.1.1` (Kudu), sets `DOTTIE_BLOB_ACCOUNT`/`DOTTIE_BLOB_CONTAINER`, adds Blob CORS for the dev-SWA origin. 3. Codex Pass-2 → APPROVED/REJECTED. 4. Claude Kudu-VFS deploys the 4 handlers to `vaultgpt-func-dottie` (PUT `<fn>/{index.js,function.json}`, GET-back diff, restart, syncfunctiontriggers). 5. Claude runs §6 curls. 6. Role-C: API spec + reconciliation §D → LIVE; flip `DOTTIE_CAPABILITIES.attachments` true (paired FE).

## Codex activation note (Walter forwards)

```
Codex is activated for Pass-2 review of Dottie Attachments Handlers (dottie_create/finalize/delete/
list_attachment), vault-dottie, "Codex Governance/Dottie-Attachments-Handlers-Pass-1-VEP/
Dottie_Attachments_Handlers_VEP.md". Open with a governance-bound GCR + Rule Anchor Table. HANDLER-ONLY
(no migration in this package — the dottie_attachments table lands via the paired Dottie-Attachments-Schema
package, Codex-approved + Walter-run, BEFORE these handlers deploy; blob container + MI role + npm deps are
deploy prerequisites, az-verified current state in §4). Handlers half of the FE<->backend reconciliation §D.
Review: (1) each handler is a byte-faithful EXACT mirror of its deployed Theo B8 primary reference (§5) —
the delta is TOKEN-ONLY (route + dottie_attachments/dottie_conversations/exists-helper SQL names +
DOTTIE_BLOB_* env/defaults + log tags; per-handler changed-line counts create 3 / finalize 9 / delete 6 /
list 5), no SAS-signing / extraction / SQL-shape / envelope change; confirm the 24-field user-delegation SAS
signer, the HEAD-authoritative content-type, the owner-gate + exists-discrimination, and the fail-closed
error mapping are byte-identical. (2) Schema Reality Lock (§3) — reads/writes only dottie_attachments (paired
migration) + deployed D1 dottie_conversations; deploy is ordered schema-first. (3) Infra Reality Lock (§4) —
blob/MI/deps prerequisites az-verified (honest absent-state), established at deploy; golden-curl round-trip is
the end-to-end proof. (4) fail-closed + deploy plan. Emit APPROVED or REJECTED only.
```
