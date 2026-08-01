# Dottie Artifacts Handlers — Pass-1 VEP (dottie_upsert/list/get_artifact)

## Role-C completion — DEPLOYED + golden-curl round-trip green (2026-08-01)
Codex Pass-2 **APPROVED** (rev-4). Deployed `dottie_upsert/list/get_artifact` to `vaultgpt-func-dottie` (Kudu VFS, GET-back byte-identical — upsert 12624b/302b, list 3732b/300b, get 8445b/298b; restart). No migration (schema live), no infra (blob reused). Golden curls green (EasyAuth aud `api://4e1a1e31…`):
- **upsert** — create `201` (`current_version:1`, `version_number:1`, type document); same title re-version `200` (`current_version:2`, `version_number:2`, **type changed → code**); blobs `artifacts/{oid}/{id}/v1.txt` + `v2.txt` confirmed in `dottie-content`.
- **list** — `200`, GC Memo `current_version:2`, **metadata-only** (no `content`/`versions`/`blob_path`).
- **get** — `200`, versions **[1,2] ascending**, each `content` hydrated from Blob (`# hello` / `console.log(1)`), content_type per version.
- **negatives** — bad type `400`, blank title `400`, get random uuid `404`, unauthenticated `401`.

Role-C — the three coordinated un-gate changes done together (per the flip-without-repoint lesson): (1) `DOTTIE_CAPABILITIES.artifactsPersistence` → `true`; (2) the FE gateway already calls `dottie_*` (repointed rev-2); (3) status prose swept — `spec/DOTTIE_API_SPEC.md § Artifacts` (LIVE), `spec/DOTTIE_THEO_RECONCILIATION.md §F/Summary/Live` (→ ✅ LIVE), gateway `persistArtifact`/`listServerArtifacts` guard comments (→ LIVE). Un-hides the Artifacts nav + activates persist/gallery. CI-deployed to dev SWA. G-APISPEC + G-UNGATE closed.

## Repair note (rev-4 — addresses Codex REJECT T13: residual status drift the rev-3 sweep missed)
Two real residues rev-3 missed (both now fixed), plus one already-correct item:
- `gateway.live.ts:877` — the artifacts section HEADER comment still read `theo_upsert/list/get_artifact` (an **abbreviated** form my rev-3 grep for full route names didn't catch) → now `dottie_upsert/list/get_artifact`. (The `B4c projects` header keeps `theo_*_project` — Projects are gated/unbuilt, so that's accurate.)
- `spec/DOTTIE_THEO_RECONCILIATION.md:65` — the "Honest status" summary still listed **people, attachments** among "still to build" (my earlier sweep's `-v voice` filter hid this line because it also names voice) → corrected: people + attachments LIVE, artifacts schema-live/FE-repointed/handlers-pending, voice + image/video still to build.
- `spec/DOTTIE_API_SPEC.md:55` — **already correct at the reviewed HEAD** (`afd95f4`): the line reads "No project-sharing (SPW), history-RAG, or extended thinking" with an "Attachments are LIVE" note; "attachments" is not in the "No …" list. (The rev-3 fix landed; please re-check the current blob.)
Exhaustive re-sweep: gateway has **zero** `theo_*` refs to the 8 repointed routes (full or abbreviated); no spec lists a live feature as missing/to-build. tsc + build clean. Handler code unchanged.

## Repair note (rev-3 — addresses Codex REJECT T13: stale status prose after the repoint)
The rev-2 repoint was correct, but I didn't sweep the STATUS comments/docs that the repoint + earlier flag-flips made stale (the recurring whole-sweep lesson). Fixed every one Codex cited, plus a broad re-sweep:
- `gateway.live.ts` — `attachmentsAvailable` comment "Off until dottie attachments backend lands" → attachments LIVE; `listConversationAttachments` guard "No dottie attachments backend yet" → LIVE; `listPeople` guard "No dottie_list_people yet" → gate-retained-for-parity, dottie_list_people LIVE. (The `voiceAvailable` + `persistArtifact` "not built yet" comments are LEFT — voice and the artifacts *backend* genuinely aren't deployed yet; those are accurate.)
- `spec/DOTTIE_THEO_RECONCILIATION.md` §F — artifacts row updated from the `theo_*` names to the repointed `dottie_*` names (🟡 schema LIVE + FE repointed; handlers deploy pending).
- `spec/DOTTIE_API_SPEC.md` Notes — dropped "attachments" from the "No …" list (Attachments are LIVE, recorded in § Attachments above).
Broad re-sweep of `spec/` for any other "attachments/people missing/errors/not-built" residue: clean. Backend handler code unchanged (Codex-cleared); tsc + build clean.

## Repair note (rev-2 — addresses Codex REJECT T13 / T22: FE not repointed)
Codex cleared the handler code but correctly rejected the FE-integration claim: the live `gateway.live.ts` still called `theo_upsert_artifact` / `theo_list_artifacts` / `theo_get_artifact`, so flipping `DOTTIE_CAPABILITIES.artifactsPersistence` would activate the Artifacts path against non-existent `theo_*` routes on the func-dottie base. Fixed by **including the FE gateway repoint in this package** (§FE): the 3 artifact calls now target `dottie_*` (+ the `getServerArtifact` comment). The "exact FE-called surface" claim is now true, and §8's flip is valid because this package repoints the FE.

**Disclosed — latent bug this same commit also closes (attachments + people):** the identical flip-without-repoint mistake was already live for **attachments** and **people** — their capability flags were flipped `true` (prior packages) but `gateway.live.ts` still called `theo_create_attachment_upload` / `theo_finalize_attachment` / `theo_delete_attachment` / `theo_list_conversation_attachments` / `theo_list_people`, which **404 on func-dottie** (attachments broke on real FE upload; people silently degraded to an empty roster via the `.catch`). Those golden curls verified the *backend* directly, not the FE path — my error. This commit repoints **all eight** un-gated routes (attachments 4 + people 1 + artifacts 3) so the FE actually reaches Dottie's backend. The still-gated features (voice, projects, publish) keep their `theo_*` names. `spec/DOTTIE_THEO_RECONCILIATION.md` attachments/people rows are corrected accordingly.

Handlers half of artifacts-persistence (`spec/DOTTIE_THEO_RECONCILIATION.md` §F), paired with the now-DEPLOYED schema (`Dottie-Artifacts-Schema-Pass-1-VEP`; `dottie_artifacts` + `dottie_artifact_versions` live + RO-verified 2026-08-01). Three handlers on `vaultgpt-func-dottie` — the surface the transplanted FE calls, **repointed to `dottie_*` in this package** (§FE): `persistArtifact`→`dottie_upsert_artifact`, `listServerArtifacts`→`dottie_list_artifacts`, `getServerArtifact`→`dottie_get_artifact` (the FE has no delete-artifact call). Each is a **byte-faithful mirror of its deployed Theo B4h primary reference** with **two documented delta classes**: (1) adapted identifiers (route; `dottie_artifacts`/`dottie_artifact_versions`/exists-helper/`dottie_conversations` SQL names; `DOTTIE_BLOB_*` env + `vaultgptdottiestore`/`dottie-content` defaults; log tags); (2) the **`project_id` path is removed** (Dottie has no Projects — no `dottie_projects` table): upsert drops the project validation + owner-check + INSERT column + RETURNING column, and list/get drop `project_id` from their SELECT. Content lives in Blob (`dottie-content`, key `artifacts/{oid}/{artifactId}/v{n}.txt`) written server-side via the Function MI bearer token (plain `x-ms-version` PUT/GET — **no SAS**). **Handler-only** — the tables are already deployed; the blob infra (MI role + `dottie-content` container) is reused from the attachments deploy; no new npm deps.

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Verified Evidence Pack (backend handlers; no migration)
Grounding parent (source baseline): `42cf0655983a90f661d58d4f40319435d7142aca` (vault-dottie, `development`) — anchors below are tip-independent blob SHAs
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
| 6 | DEPLOYED SCHEMA — `spec/DOTTIE_AZURE_POSTGRES_SCHEMA.md` (§6: the DEPLOYED `dottie_artifacts` + `dottie_artifact_versions` these handlers read/write; §4 `dottie_conversations`) | `Read`(§6) this turn | `53ee66d1f2192163463bf4de40407652b6913e8c` |
| 7 | **PRIMARY REFERENCE (DEPLOYED)** — `theo_upsert_artifact` handler + function.json (title-keyed upsert; Blob write; project owner-check — dropped for Dottie) | `Read`(full) this turn; copy in-package | index.js `fe8375f38fd58343350f3ffb0e6432908c7171df`; function.json `fa61bb16915631a0c70e5fa7fa0d02c4f89103bd` |
| 8 | **PRIMARY REFERENCE (DEPLOYED)** — `theo_list_artifacts` handler + function.json (metadata gallery list) | `Read`(full) this turn; copy in-package | index.js `d64d69ac7e8568c0a864af92b47e5685e2272fd9`; function.json `8cd30ba215e0aea6eab678421feb17c6c7d84c9c` |
| 9 | **PRIMARY REFERENCE (DEPLOYED)** — `theo_get_artifact` handler + function.json (versions ascending; Blob read per version) | `Read`(full) this turn; copy in-package | index.js `08fa059ecefbdfac9b584e115a32c69225bfdafa`; function.json `6c0941579320f686c0189389082b420010f13137` |

No ChatGPT advisory cited. No `reporting_*` / `theo_*` object touched. Backend handler package (no migration; no write SQL by Claude).

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt" | GCR (head) |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §4 | "Schema Reality Lock" | §3 — reads/writes only the DEPLOYED `dottie_artifacts*` columns + `dottie_conversations` |
| governance/THEO_GOLDEN_HANDLER_STANDARD.md | §4 | "EXACT mirror" | §5 — each handler EXACT-mirrors its deployed Theo B4h primary reference (allowed deltas: identifiers + project_id removal) |
| governance/THEO_GOLDEN_HANDLER_STANDARD.md | §2 | "deployed `function.json` file as the canonical Primary Reference" | §5 — each primary reference = handler index.js AND function.json (both inlined) |
| governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md | §1D | "ordered, non-skippable" | §8 — Codex → deploy → curls |

---

## §1 — Feature
Three handlers on `vaultgpt-func-dottie`, EasyAuth-gated, owner-scoped (`created_by = oid`):
- **`dottie_upsert_artifact`** (POST `{ title (≤200), type ∈ {document,code,html}, content (≤1 MiB utf8), conversation_id? }`) → title-keyed owner-scoped upsert: a reused (case-insensitive) title adds a new version at `current_version+1`; a new title creates at v1. Writes content to Blob `artifacts/{oid}/{artifactId}/v{n}.txt`, inserts the version row, bumps the parent pointer/type. `201` (created) / `200` (new version) `{ data:{ artifact:{ …, version_number } } }`. Errors `401`/`400 BAD_REQUEST|INVALID_REQUEST`/`404`(conversation not owned / `23503`)/`403`(`42501`)/`400`(`23514`)/`500`; ROLLBACK + best-effort orphan-blob delete on failure.
- **`dottie_list_artifacts`** (GET `?conversationId=?`) → `SELECT … FROM dottie_artifacts WHERE created_by=$1 [AND conversation_id=$2] ORDER BY updated_at DESC, id DESC LIMIT 500`. `200 { data:{ artifacts:[…] } }` (metadata only — no content). `401`/`400`/`403`/`500`.
- **`dottie_get_artifact`** (GET `?artifactId=`) → owner-gate (0 rows → `dottie_artifact_exists_unscoped` → `403`/`404`), then versions ASC with each version's Blob content hydrated (failed blob read degrades to `content:""`). `200 { data:{ artifact:{ …, versions:[{ version_number, content, byte_size, content_type, created_at }] } } }`. `401`/`400`/`403`/`404`/`500`.
All: `OPTIONS`→`204`; `401` no identity.

## §2 — Architecture & boundary
Content in Azure Blob (`dottie-content` on `vaultgptdottiestore`); `dottie_artifacts` (metadata + `current_version`) + `dottie_artifact_versions` (immutable Blob-pointer rows) hold the rest. Blob I/O is **server-side via the Function MI bearer** (`getManagedIdentityAccessToken("https://storage.azure.com/")` → `Authorization: Bearer` + `x-ms-version: 2022-11-02` PUT/GET/DELETE) — **no SAS, no `@azure/storage-blob`**; deps are `pg` + node built-ins `http`/`https`. Owner-scoped throughout: explicit `created_by = $oid` on every query (the connection role bypasses RLS); parents (conversation) owner-checked before linking; the `_exists_unscoped` helper gives the 403-vs-404 split with no existence leak. Same envelope/`set_config`/EasyAuth as the D2 + attachments handlers. No `theo_*`/`reporting_*` object touched; no cross-app read.

## §3 — Schema Reality Lock (Governor §4) — SATISFIED
These handlers read/write the **DEPLOYED** `dottie_artifacts` (8 cols, no `project_id`) + `dottie_artifact_versions` (9 cols, `UNIQUE (artifact_id, version_number)`) + `dottie_artifact_exists_unscoped(uuid)` + the deployed D1 `dottie_conversations` (upsert's conversation owner-check). All are live and read-only-verified (schema doc §6, GCR row 6; Codex-APPROVED Artifacts-Schema rev-2, Walter-run 2026-08-01). Because `dottie_artifacts` has **no `project_id` column**, the handlers MUST NOT reference it — the removal (delta class 2, §5) is what makes the mirror valid against the real table. No DDL in this package. Nothing invented.

## §4 — Infra Reality Lock (Governor §3) — reused from attachments, az-verified
No new infra. The blob path reuses what the attachments deploy already provisioned + az-verified: the `dottie-content` container on `vaultgptdottiestore`, and the `vaultgpt-func-dottie` system-assigned MI (`86c251f4…`) holding **Storage Blob Data Contributor** on that account (the same identity + role the MI-bearer PUT/GET/DELETE needs). App settings `DOTTIE_BLOB_ACCOUNT`/`DOTTIE_BLOB_CONTAINER` are already set. **No new npm deps** (`pg` present; `http`/`https` built-in — the artifact handlers use no extraction libs and no SAS). The upsert→list→get golden curls (§6) are the end-to-end proof.

## §5 — Primary references + Structural Mirror Tables (Golden §2/§4/§5.1)
Each handler's canonical primary reference = its DEPLOYED Theo B4h original (handler index.js AND function.json), inlined full-verbatim. Two delta classes, both diff-verified:

| Region | Classification | Notes |
| ------ | -------------- | ----- |
| all helpers (envelope, `getPrincipal`/claims, `parseBody`, `isUuid`, `contentTypeFor`, the MI-token + `requestUrl`/`requestBinary` + `putTextBlob`/`getTextBlob`/`deleteBlob` plumbing), the `set_config` + owner-gate + exists-discrimination + upsert-by-title logic + version numbering + ROLLBACK/orphan-blob cleanup + error mapping, envelope | **EXACT** | byte-identical to the deployed Theo B4h primary reference |
| **delta class 1 — adapted identifiers:** route (`theo_*`→`dottie_*`); SQL names (`theo_artifacts`/`theo_artifact_versions`/`theo_artifact_exists_unscoped`/`theo_conversations`→`dottie_*`); env (`THEO_BLOB_ACCOUNT`/`THEO_BLOB_CONTAINER`→`DOTTIE_*`) + defaults (`vaultgptstorage01`→`vaultgptdottiestore`, `theo-content`→`dottie-content`); a comment ref (`theo_finalize_attachment`→`dottie_finalize_attachment`); `context.log` tags | **ALLOWED DELTA (adapted identity)** | no logic/SQL-shape/blob change |
| **delta class 2 — `project_id` removal (Dottie has no Projects):** upsert drops the `project_id` validation block, the `SELECT … theo_projects` owner-check, the INSERT `project_id` column (+ placeholder renumber `$3/$4`), and the `project_id` from the UPDATE `RETURNING`; list + get drop `project_id` from their `SELECT` column list | **ALLOWED DELTA (Dottie has no Projects backend)** | `dottie_artifacts` has no `project_id` column (schema §6); referencing it would be a runtime error. The conversation link + owner-check are retained. Per-handler changed lines: upsert +18/−27, list +4/−4, get +8/−8. |

No DEVIATION regions. `function.json`: EXACT except the `route` (=handler name).

### §5.1 dottie_upsert_artifact
```javascript
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
});

const TITLE_MAX_LEN = 200;
const CONTENT_MAX_BYTES = 1024 * 1024; // 1 MiB per artifact version (text); generous for docs/code/html
const VALID_TYPES = ["document", "code", "html"];

const STORAGE_ACCOUNT = process.env.DOTTIE_BLOB_ACCOUNT || "vaultgptdottiestore";
const STORAGE_CONTAINER = process.env.DOTTIE_BLOB_CONTAINER || "dottie-content";

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

// ---- Managed-identity data-plane Blob access (verbatim technique from the deployed dottie_finalize_attachment, B8h) ----
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
    context.log.warn("dottie_upsert_artifact: best-effort blob cleanup failed", e);
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
  // Dottie delta: no project_id — Dottie has no Projects backend (no dottie_projects table). The Theo
  // original validated/linked an optional project_id here; Dottie artifacts are conversation-scoped only.

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
    // mirrors the deployed dottie_finalize_attachment, which checks dottie_conversations WHERE id AND created_by).
    // The FKs alone are not enough — a foreign-owned parent row would satisfy the constraint and leak a
    // cross-user link. A foreign-owned OR absent parent fails deterministically 404 (no existence leak).
    if (conversationId) {
      const c = await client.query(
        `SELECT 1 FROM public.dottie_conversations WHERE id = $1 AND created_by = $2`,
        [conversationId, oid]
      );
      if (c.rowCount === 0) throw buildKnownError("NOT_FOUND", "Referenced conversation not found.", 404);
    }
    // (Dottie delta: no project owner-check — Projects are not a Dottie feature.)

    // Upsert-by-title (owner-scoped, case-insensitive) — mirrors the FE upsert(): a reused title adds
    // a new version; a new title creates the artifact at v1. The connection role bypasses RLS, so the
    // explicit created_by predicate enforces ownership.
    const existing = await client.query(
      `SELECT id, current_version FROM public.dottie_artifacts
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
        `INSERT INTO public.dottie_artifacts (created_by, conversation_id, title, type, current_version)
         VALUES ($1, $2, $3, $4, 1)
         RETURNING id`,
        [oid, conversationId, title, type]
      );
      artifactId = created.rows[0].id;
      versionNumber = 1;
    }

    const blobKey = `artifacts/${oid}/${artifactId}/v${versionNumber}.txt`;
    await putTextBlob(STORAGE_ACCOUNT, STORAGE_CONTAINER, blobKey, content, contentType);
    writtenBlobKey = blobKey;

    await client.query(
      `INSERT INTO public.dottie_artifact_versions
         (created_by, artifact_id, version_number, blob_container, blob_path, byte_size, content_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [oid, artifactId, versionNumber, STORAGE_CONTAINER, blobKey, byteSize, contentType]
    );

    // Bump the pointer + type on an existing artifact (a re-version may change the type); leave the
    // original conversation_id linkage intact. On create, current_version is already 1.
    const updated = await client.query(
      `UPDATE public.dottie_artifacts
       SET current_version = $1, type = $2, updated_at = now()
       WHERE id = $3 AND created_by = $4
       RETURNING id, conversation_id, title, type, current_version, created_at, updated_at`,
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
    context.log.error("dottie_upsert_artifact failed", err);

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
      "route": "dottie_upsert_artifact"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```
Primary reference (deployed `theo_upsert_artifact`):
```javascript
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
      "route": "theo_upsert_artifact"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

### §5.2 dottie_list_artifacts
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
    // version content lives in Blob and is fetched per-artifact via dottie_get_artifact.
    const params = [oid];
    let where = "created_by = $1";
    if (conversationId) { params.push(conversationId); where += ` AND conversation_id = $${params.length}`; }

    const result = await client.query(
      `SELECT id, conversation_id, title, type, current_version, created_at, updated_at
       FROM public.dottie_artifacts
       WHERE ${where}
       ORDER BY updated_at DESC, id DESC
       LIMIT 500`,
      params
    );

    return send(context, 200, successBody({ artifacts: result.rows }));
  } catch (err) {
    context.log.error("dottie_list_artifacts failed", err);
    if (err && err.code === "42501") return send(context, 403, errorBody("FORBIDDEN", "You do not have permission to list artifacts.", 403));
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
      "route": "dottie_list_artifacts"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```
Primary reference (deployed `theo_list_artifacts`):
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
      "route": "theo_list_artifacts"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

### §5.3 dottie_get_artifact
```javascript
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
});

const STORAGE_ACCOUNT = process.env.DOTTIE_BLOB_ACCOUNT || "vaultgptdottiestore";

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

// ---- Managed-identity data-plane Blob access (verbatim technique from the deployed dottie_finalize_attachment, B8h) ----
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
      `SELECT id, conversation_id, title, type, current_version, created_at, updated_at
       FROM public.dottie_artifacts
       WHERE id = $1 AND created_by = $2`,
      [artifactId, oid]
    );
    if (artifact.rowCount === 0) {
      const existsResult = await client.query(`SELECT public.dottie_artifact_exists_unscoped($1::uuid) AS e`, [artifactId]);
      const exists = existsResult.rows[0] && existsResult.rows[0].e === true;
      throw exists
        ? buildKnownError("FORBIDDEN", "You do not have access to this artifact.", 403)
        : buildKnownError("NOT_FOUND", "Artifact not found.", 404);
    }

    const versionRows = await client.query(
      `SELECT version_number, blob_container, blob_path, byte_size, content_type, created_at
       FROM public.dottie_artifact_versions
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
        context.log.warn("dottie_get_artifact: version blob read failed", { artifactId, version: v.version_number, e });
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
    context.log.error("dottie_get_artifact failed", err);
    if (err && err.code === "42501") return send(context, 403, errorBody("FORBIDDEN", "You do not have access to this artifact.", 403));
    if (err && err.isKnown === true && typeof err.status === "number" && typeof err.code === "string") {
      return send(context, err.status, errorBody(err.code, err.message, err.status));
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
      "route": "dottie_get_artifact"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```
Primary reference (deployed `theo_get_artifact`):
```javascript
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
      "route": "theo_get_artifact"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

## §FE — Frontend gateway repoint (in-package; the paired FE change §8's flip depends on)
`src/theo/services/gateway.live.ts` — the three artifact call sites are repointed `theo_*`→`dottie_*` so the FE reaches Dottie's backend when the capability un-gates. Signatures/logic UNCHANGED; the delta is the fetch URL (+ one comment):
- `persistArtifact()` → `POST ${apiBase}/api/dottie_upsert_artifact` (was `theo_upsert_artifact`).
- `listServerArtifacts()` → `GET ${apiBase}/api/dottie_list_artifacts` (was `theo_list_artifacts`).
- `getServerArtifact()` → `GET ${apiBase}/api/dottie_get_artifact?artifactId=…` (was `theo_get_artifact`) + its `// dottie_get_artifact →` comment.

These calls are gated today (`artifactsPersistence:false` → `listServerArtifacts` returns `[]`, `persistArtifact` no-ops; `getServerArtifact` reachable only via the hidden gallery), so the repoint is inert until §8 flips the flag after deploy. **Same commit also repoints the attachments (4) + people (1) routes** — a latent flip-without-repoint bug that was already live (those flags are `true`; see rev-2 note). Still-gated features (voice/projects/publish) keep `theo_*`. `tsc -p tsconfig.app.json` + `npm run build` clean.

## §6 — Golden Curls (Golden §5.3; Claude runs post-deploy, authenticated az bearer aud `api://4e1a1e31…`)
| # | Call | Expect |
| - | ---- | ------ |
| C1 | `POST /api/dottie_upsert_artifact` `{title:"GC Memo", type:"document", content:"# hello\n"}` | `201` `{ artifact:{ id, title:"GC Memo", type:"document", current_version:1, version_number:1 } }`; blob `artifacts/<oid>/<id>/v1.txt` exists |
| C2 | same title, new content, `type:"code"` | `200`; `current_version:2`, `version_number:2`, `type:"code"` (re-version changes type) |
| C3 | `GET /api/dottie_list_artifacts` | `200`; the artifact present (metadata only — no `content`/`versions`) |
| C4 | `GET /api/dottie_get_artifact?artifactId=<C1>` | `200`; `versions` length 2, ASCENDING, each with `content` hydrated from Blob |
| C5 | upsert `type:"bogus"` / `content` > 1 MiB / blank title | `400 INVALID_REQUEST` |
| C6 | `GET /api/dottie_get_artifact?artifactId=<random uuid>` | `404`; a foreign-owned id → `403` |
| C7 | each, unauthenticated | `401` |

## §7 — Gap Register
**PROCEED** (grounded against the DEPLOYED schema; blob infra reused/az-verified).
- **G-DELETE: PROCEED (not built — no FE call).** Theo's B4h package also ships `theo_delete_artifact`, but the Dottie FE gateway has no `deleteArtifact` (only `persistArtifact`/`listServerArtifacts`/`getServerArtifact`). Omitted to match the FE contract; a one-handler add if a gallery delete is ever wired. Disclosed.
- **G-UPSERT-RACE: PROCEED (mirrors Theo B4h G-3).** No `UNIQUE (created_by, lower(title))` index, so two concurrent upserts of the same NEW title could both INSERT a parent (effectively single-flight per reply, same as Theo; the FE upsert is single-flight). Same disposition as the deployed Theo original. Disclosed.
- **G-APISPEC / G-UNGATE: PRE-LAND (Role-C post-deploy).** Add the 3 endpoints to `spec/DOTTIE_API_SPEC.md`, flip reconciliation §F → LIVE, and flip `DOTTIE_CAPABILITIES.artifactsPersistence` → `true` (un-gates the Artifacts nav + persist/gallery calls) once the curls pass. Disclosed.

## §8 — Deploy plan (ordered; §1D)
1. **Schema — DONE** (`dottie_artifacts` + `dottie_artifact_versions` deployed + RO-verified; schema doc §6). 2. **Infra — reused/verified** (`dottie-content` + MI Storage Blob Data Contributor + `DOTTIE_BLOB_*` from the attachments deploy; no new deps). 3. Codex Pass-2 → APPROVED/REJECTED. 4. Claude Kudu-VFS deploys the 3 handlers to `vaultgpt-func-dottie` (PUT `<fn>/{index.js,function.json}`, GET-back diff, restart, syncfunctiontriggers). 5. Claude runs §6 curls. 6. Role-C: API spec + reconciliation §F → LIVE; flip `DOTTIE_CAPABILITIES.artifactsPersistence` true — valid because the **paired FE gateway repoint is in THIS package (§FE)**, so the un-gated calls target `dottie_*` — → CI-deploy dev SWA. (The FE repoint itself lands with this package's commit, before the flip.)

## Codex activation note (Walter forwards)

```
Codex is activated for Pass-2 review of Dottie Artifacts Handlers (dottie_upsert/list/get_artifact),
vault-dottie, "Codex Governance/Dottie-Artifacts-Handlers-Pass-1-VEP/Dottie_Artifacts_Handlers_VEP.md".
Open with a governance-bound GCR + Rule Anchor Table. HANDLER-ONLY (the dottie_artifacts +
dottie_artifact_versions tables are DEPLOYED + RO-verified — schema doc §6; blob infra reused from the
attachments deploy — MI Storage Blob Data Contributor + dottie-content container, az-verified; no new npm
deps). Handlers half of artifacts-persistence (spec §F); the 3 handlers are exactly the FE-called surface
(no delete-artifact FE call). Review: (1) each handler is a byte-faithful EXACT mirror of its deployed Theo
B4h primary reference (§5) with TWO delta classes — adapted identifiers, and the project_id REMOVAL (Dottie
has no dottie_projects; upsert drops the validation/owner-check/INSERT/RETURNING, list+get drop the SELECT
column; per-handler +18/-27, +4/-4, +8/-8). Confirm the MI-token blob I/O, title-keyed upsert + version
numbering, owner-gate + exists-discrimination, and ROLLBACK/orphan-blob cleanup are byte-identical. (2)
Schema Reality Lock (§3) — reads/writes only DEPLOYED dottie_artifacts* columns (no project_id) +
dottie_conversations. (3) Infra Reality Lock (§4) — blob MI/container reused, az-verified. (4) fail-closed +
deploy plan. Emit APPROVED or REJECTED only.
```
