# THEO PHASE 1B — BACKEND EXECUTION PLAN

> **Status: DRAFT v0.5 — NOT YET AUTHORITATIVE.** Authored by Claude Code as a foundational planning skeleton at Walter's request (2026-06-26). v0.2 baked in Walter's resolved decisions (D-1, D-2, D-4, D-5 — see §8); **v0.3** re-sequences §7 to **gateway-first** (live SWA Claude responses before the persistence layer) and assigns **golden-curl execution to Claude Code** (§2A); **v0.4** adds **Tier B7 — the memory layer (option C)** — a distilled per-user memory profile (`theo_user_memory`) plus cross-chat history-RAG over the user's own `theo_messages` — operationalizing the architecture's named 1B *memory* pillar (Architecture §8.2); **v0.5** adds **Tier B8 — attachments** (users attach files to a chat; Theo reads them via Anthropic document/image content blocks — capability golden-curl-verified 2026-06-28). It is **pending Codex Pass-2 review and Walter approval** before it governs. It is a *living* plan: each backend microstep updates the three Theo backend authority docs (Theo API Spec, Theo Azure Postgres Schema, Theo Golden Handler Standard) as it lands, in the same shape the Reporting backend plan uses.
>
> **Regime.** This plan is governed by the **Theo backend regime** — `vault-theo/governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md`, `THEO_GROUNDING_CONFORMANCE_STANDARD.md`, `THEO_GOLDEN_HANDLER_STANDARD.md`, with **Codex** as reviewer (Pass 2) and **Walter** as the sole DB-write / deployment authority. It is **not** governed by the Reporting backend Governor Standard. The Corporate Reporting backend standards are referenced as the **proven implementation pattern** the Theo backend reuses and as the **API surface** Theo's tool-dispatch calls — Theo **MUST NOT fork, copy, or restate** them (Theo Tool Manifest §1; Theo Architecture §0a).

---

## 1. Purpose & scope

Phase 1A built the full Theo frontend surface (chat, projects, artifacts, customize, app-context chip), mounted it inside Vault Origin, and ran it entirely against **mocked contracts behind a single service module + a mocked model gateway** (Theo 1A Frontend Plan §5; 1A Handover §2.3). Phase 1B makes those contracts **real** against the deployed Azure backend, with **no rendered-surface change** — every 1A mock is swapped for a live call behind the same service boundary.

**In scope (1B backend):**
1. **Model gateway** (HF-T1) — a real server-side broker to the model (Foundry-Claude), Anthropic Messages API shape, the only credential holder.
2. **Persistence + RLS** (HF-T2) — the `theo_*` Postgres schema and ownership-scoped CRUD handlers for conversations, messages, projects, project-knowledge, artifacts, artifact-versions, and user settings.
3. **App-context persistence** — `theo_conversations.app_key` / `app_context`, carried across reload.
4. **RAG retrieval** (HF-T4) — Azure AI Search over tax corpus + project knowledge, RLS-scoped, injected at system-prompt assembly.
5. **Tool dispatch** (HF-T3) — model tool-calls routed to authorized `reporting_*` endpoints, executed **as the signed-in user** through the published Reporting API (never direct table access).
6. **Memory** (option C; HF-T4 + system-prompt assembly) — a distilled per-user **memory profile** (`theo_user_memory`) surfaced across all chats/projects, plus **cross-chat history-RAG** over the user's own `theo_messages`; both RLS-scoped and injected at HF-T1 system-prompt assembly. Operationalizes the architecture's 1B `memory` pillar (Architecture §8.2). Gated by D-3 (ZDR), the D-5 Azure AI Search sub-item, and D-7 (distillation policy).
7. **Attachments** (Tier B8) — users attach files to a chat; Theo reads **native** formats (PDF/images, ≤10 MB) via Anthropic **document/image content blocks** and **extract-class** formats (Excel/Word/PPT/CSV/TXT, ≤50 MB) via in-process server-side text extraction injected at the gateway (capability golden-curl-verified — Foundry accepts document blocks with current headers). Stored owner-scoped in Blob (`theo_attachments` + the `theo-content` container) via a scoped write SAS. **D-8 RESOLVED** (mechanism + limits + ingestion classes); D-3 (ZDR, RESOLVED) covers attachment content reaching the model.

**Out of scope:** any change to `reporting_*` handlers, tables, or contracts; any rendered-surface redesign; multi-tenant; sharing/membership RLS models (ownership-only unless Walter authorizes).

---

## 2. Governance regime (BINDING)

| Aspect | Theo 1B backend |
|---|---|
| Plan author | Claude Code (Pass 1 VEP) |
| Reviewer | **Codex** (Pass 2) — `CODEX_THEO_BACKEND_REVIEW_STANDARD.md` |
| DB writes / migrations / deploys | **Walter only** for DB writes, migrations, and merges. Claude Code plans + hands off Walter-executable SQL; never writes the DB. **Deploy exception (Orchestration §1E / DR-T7, 2026-07-04; extended to `vaultgpt-func-theo-tools` 2026-07-17 / DR-T10; extended to `vaultgpt-func-stream` 2026-07-17 / DR-T11):** Claude Code MAY deploy handler/function code to the designated dedicated Theo Function Apps (`vaultgpt-func-chat`, `vaultgpt-func-theo-tools`, and the streaming sidecar `vaultgpt-func-stream`) after a Codex-APPROVED VEP; only the monolith `vaultgpt-func-premium` remains READ-ONLY, EXCEPT the narrow DR-T14 carve-out (2026-07-24) for the Projects-domain knowledge handlers `theo_add_project_knowledge`/`theo_remove_project_knowledge` and the narrow DR-T15 carve-out (2026-07-25) for the chat-read handler `theo_get_conversation` (media-persistence read) — Claude Code MAY deploy these to premium via surgical Kudu VFS after a Codex-APPROVED VEP. |
| Read-only SQL grounding | `codex_reporting_ro` (SELECT-only) per the local SQL rule |
| Authority docs (truth owners) | Theo API Spec (contract), Theo Azure Postgres Schema (data), Theo Golden Handler Standard (handler pattern), Theo Architecture & Structure (boundaries) |
| Pattern reference (reuse, do not fork) | Reporting Golden Handler Pack (Family B handler shape), Reporting Backend API Spec §3–§5 (auth, session context, 403/404), Reporting Azure Postgres Schema §4–§5 (RLS, existence helpers) |
| Per-microstep cadence | VEP → Codex APPROVED → Implementation Package (Walter-executable SQL + deterministic curls) → Walter executes/deploys → Claude Code updates the three Theo authority docs (Role-C) |
| Never-Guess | Every schema object / column / contract read in a governing doc or established by read-only SQL; DEPLOYED vs PROPOSED classified for every `theo_*` element |

---

## 2A. Operating discipline (BINDING — Walter directives 2026-06-26)

These reuse the Reporting Governor + Golden Handler Pack discipline verbatim:

1. **Claude Code runs all golden curls** (as in the corporate-reporting backend build; the Reporting Governor §1 Phase-D golden-curl execution pattern, standing for Theo 1B per Walter 2026-06-26). Claude Code acquires the bearer token itself via the live `az` session — `az account get-access-token --scope "api://<app-id>/access_as_user"` for handler endpoints, or `--scope "https://ai.azure.com/.default"` for the Foundry endpoint — executes the curl, and captures the verbatim command + response under `.local/` (gitignored), exactly as the corporate-reporting curl artifacts were captured. No hand-pasted tokens; no placeholders. Walter remains responsible for **deploys** (copy-paste handlers into Azure) and **SQL execution**; Claude Code owns curl execution + the captured evidence.
2. **Complete SQL, no placeholders.** Claude Code reads SQL (SELECT-only, `codex_reporting_ro`) for seed-data and current-state grounding, and authors **complete, runnable** migration + seed scripts for Walter to deploy — no placeholders, no bracketed values, no "fill in". Walter executes all DDL/DML.
3. **Complete, copy-paste-ready handlers — no placeholders, no guessing.** When Claude Code delivers a handler it delivers the **entire** handler file, ready to paste into the Azure portal UI. On any change it delivers a **full replacement handler**, never a diff/snippet. No guessed schema, columns, ids, auth, or envelopes — Never-Guess applies categorically (read it in a governing doc or establish it by read-only SQL / reference-artifact inspection first).
4. **Mirror, don't invent.** Each Theo handler names exactly one `corporate-reporting/reference-artifacts/handlers/` Family-B handler as its Primary Reference (inlined verbatim in the VEP), and mirrors its structure; Theo-specific deltas (route, SQL, business fields) are the only changes.

---

## 3. Current backend baseline (grounded 2026-06-26)

- **Compute.** One shared Azure Functions app — `vaultgpt-func-premium` (UK South), Node.js. Reporting and Theo deploy to the **same app** under separate route namespaces (Reporting API Spec §2.2: "Reporting does NOT inherit Theo endpoint namespaces, tables, or business logic by assumption").
- **Deployed handlers live in Azure; the mirror source is the Reporting reference-artifacts (D-1 RESOLVED).** Theo `theo_*` handlers are authored by **mirroring the `corporate-reporting/reference-artifacts/handlers/` (+ `function-json/`) Family-B handlers** — they are the authoritative source for auth, request/response shape, and handler structure. The handlers deploy to the shared Azure Functions app; **Walter deploys** each by copy-pasting the complete handler into the Azure portal UI. Claude Code authors complete, copy-paste-ready handlers (§2A) and the matching Theo reference-artifact + manifest entry; it never deploys.
- **No legacy Theo backend (D-2 RESOLVED).** The early `chat_proxy` + `chat_storage_*` handlers and the early tables (`conversations`, `chat_messages`, `theo_users`) are **explicitly NOT used, extended, or mirrored** — they predate current standards and are not trusted. Theo 1B is built **fresh, modelled on corporate-reporting**. (Physical decommission of the old Azure functions/tables is a Walter operational task, separate from this plan.)
- **Auth (reused verbatim).** Azure Easy Auth injects `x-ms-client-principal`; handlers resolve the Entra **OID** via `getPrincipal(req)` + `getClaimValue(principal, [oid claims])` (Reporting API Spec §4; canonical in `reporting_get_user_identity`). OBO bearer exchange is available for delegated Graph (Reporting API Spec §3a) — not needed by core Theo handlers.
- **Postgres (shared, namespaced).** Shared `vaultgpt` Azure Postgres. Per-request session context is set before queries: `set_config('app.current_user_id', $oid, false)` + `request.jwt.claim.sub` / `.oid` (Reporting API Spec §5). RLS is enforced per-user; 403-vs-404 is discriminated via a `SECURITY DEFINER … _exists_unscoped(uuid)` helper + PostgreSQL `42501` → HTTP 403 (Reporting API Spec §5a; Schema §5).
- **Handler shape (reused — "Family B").** `const { Pool } = require('pg')`; pool with `POSTGRES_CONNECTION_STRING`; `client = await pool.connect()` / `client.release()` in `finally`; narrow per-endpoint CORS; `OPTIONS` → 204; `send/errorBody/successBody/getPrincipal/getClaimValue/parseBody/isUuid` helpers; explicit `BEGIN/COMMIT/ROLLBACK` on mutations; fixed `{error:{code,message,status,timestamp}}` / `{data,meta}` envelopes (Reporting Golden Handler Pack §5/§7).
- **`function.json` (reused).** `authLevel: anonymous` (Easy Auth upstream), `httpTrigger` in / `http` out, narrow `methods`, underscore `route` (no slashes, no path params) (Reporting API Spec §9; Golden Handler Pack §20).
- **Model gateway (D-4 RESOLVED — Azure AI Foundry → Claude).** The Theo 1B gateway (HF-T1) is **new**, built fresh on the Family-B pattern (the legacy `chat_proxy` is not reused), and brokers to **Anthropic Claude via Microsoft Azure AI Foundry** in the standard Anthropic Messages shape; it is the sole model-credential holder and the model swap point. The Azure-side connection (Foundry resource, model deployment, endpoint, and Entra managed-identity / keyless auth) is being set up with Walter (see the Foundry connection walkthrough, §11). ZDR posture remains D-3.
- **Persistence (D-5 RESOLVED — Azure Blob + Azure Postgres).** Structured data → shared `vaultgpt` Azure **Postgres** (`theo_*` tables, RLS). Large/opaque content (artifact-version bodies, project-knowledge source content) → Azure **Blob**, with the Postgres row holding the Blob pointer + metadata. This persistence layer is the core deliverable of 1B. (Azure AI Search for RAG indexing is a separate B6 resource — still D-5-adjacent / to confirm.)

---

## 4. Architecture recap — Theo backend handler families

Per `THEO_GOLDEN_HANDLER_STANDARD.md §6` (registry) and Theo Architecture §2/§4/§5/§6 — all **PROPOSED**, authored in 1B:

| HF-id | Family | Scope |
|---|---|---|
| **HF-T1** | Model gateway broker | `POST /api/theo/message`; brokers to Foundry-Claude in the standard Anthropic Messages shape; sole model-credential holder; the model swap point; system-prompt assembly seam (settings + project knowledge + RAG). Built-in Foundry tools (`web_search`/`web_fetch`/code-exec) travel with the model. |
| **HF-T2** | `theo_*` CRUD + RLS | Ownership-scoped CRUD over the `theo_*` tables (conversations, messages, projects, project-knowledge, artifacts, artifact-versions, user-settings). |
| **HF-T3** | Tool dispatch | Maps model tool-calls → authorized `reporting_*` endpoints; validates against the canonical Reporting API Spec (never a local copy); calls **as the signed-in user**; context-scoped by `app_key`. |
| **HF-T4** | RAG retrieval | Azure AI Search (hybrid vector + BM25) over tax corpus + `theo_project_knowledge`; RLS-scoped to the user; injected at HF-T1 system-prompt assembly. |

---

## 5. The `theo_*` schema (PROPOSED — DDL finalized per-microstep in 1B)

Per `THEO_AZURE_POSTGRES_SCHEMA.md §3` + Theo Architecture §5. Conventions (BINDING): `theo_` prefix; `id uuid PK DEFAULT gen_random_uuid()`; ownership column `created_by text NOT NULL` (Entra OID); `created_at`/`updated_at timestamptz` server-managed (immutable tables omit `updated_at`); per-table `theo_<entity>_exists_unscoped(uuid) -> boolean` helper. RLS: ENABLED on every table; **four** policies (SELECT/INSERT/UPDATE/DELETE), `TO authenticated`, keyed on `created_by = auth.uid()`; no `FOR ALL`, no `USING(true)`.

| Table | Purpose | Notes |
|---|---|---|
| `theo_conversations` | chat thread | `app_key text NULL`, `app_context jsonb NULL`, `project_id uuid NULL`, `title`, `model` |
| `theo_messages` | turn in a thread | `conversation_id uuid FK ON DELETE CASCADE`, `role`, `content`, `model`, ordering key; **immutable** (no `updated_at`) |
| `theo_projects` | project (instructions + knowledge) | `name`, `instructions`, optional `app_key` scope |
| `theo_project_knowledge` | knowledge source under a project | `project_id uuid FK`, source pointer/title/type; RAG-indexed; immutable |
| `theo_artifacts` | artifact record | optional `conversation_id`/`project_id`, `title`, `type`, current-version pointer |
| `theo_artifact_versions` | versioned artifact content | `artifact_id uuid FK`, `version_number int`, content (Blob pointer); immutable |
| `theo_user_settings` | per-user style + custom instructions | text PK = Entra OID; prepended to the system prompt |
| `theo_user_memory` *(B7, option C)* | distilled cross-chat memory item | `created_by` (Entra OID), `scope text` (`'user'`\|`'project'`), `project_id uuid NULL` (set when `scope='project'`), `kind text`, `content text`, `source_conversation_id uuid NULL`, `salience`/`updated_at`; user-viewable/editable; injected at system-prompt assembly; ownership RLS |
| `theo_attachments` *(B8)* | file attached to a chat | `created_by` (Entra OID), `conversation_id uuid NULL`, `filename`, `content_type`, `byte_size`, `blob_container`/`blob_path` (pointer into `theo-content`), `created_at`; ownership RLS + `_exists_unscoped(uuid)`. Native (PDF/image, ≤10 MB) injected as content blocks; extract-class (Excel/Word/PPT/CSV/TXT, ≤50 MB) extracted to text at upload + injected — see Tier B8 |
| `theo_apps` / `theo_app_tools` *(candidate)* | registry backing the Tool Manifest | may start as config, not tables — 1B decides |

**Boundary (BINDING):** `theo_*` tables are net-new and additive in the shared `vaultgpt` instance. Theo **never** reads/writes `reporting_*` tables directly.

---

## 6. The 1A→1B seam (what 1B makes real, per surface)

Per `THEO_1A_FRONTEND_HANDOVER.md §2/§3`. The single service module means each row is a mock→live swap behind a stable boundary, **no surface change**:

| Surface | Mocked in 1A | Made real in 1B |
|---|---|---|
| Chat | composer, streaming-style load, markdown, artifact markers | live Foundry-Claude via HF-T1; turns persisted (HF-T2) |
| Recents | in-memory list + search | real history from `theo_conversations` (HF-T2) |
| Projects | CRUD + instructions + knowledge in memory | persisted (HF-T2); knowledge RAG-indexed (HF-T4) |
| Artifacts | marker-parsed, versioned by title reuse, in memory | persisted versioned (Blob + Postgres index), survive reload (HF-T2) |
| Customize | style preset + custom instructions in memory | persisted to `theo_user_settings`, applied server-side in the system prompt (HF-T1/HF-T2) |
| App-context chip | received from Origin, carried on conversation | persisted to `theo_conversations.app_key`/`app_context`; drives tool-dispatch (HF-T3) |
| Retrieval | stub results | real Azure AI Search retrieval, RLS-scoped (HF-T4) |
| Memory (option C) | *absent in 1A* | distilled per-user profile (`theo_user_memory`) + cross-chat history-RAG over `theo_messages`, RLS-scoped, injected at system-prompt assembly (B7) |
| Attachments (B8) | *absent in 1A* | upload files → Blob (`theo_attachments` / `theo-content`) via scoped write SAS; native (PDF/image) injected as content blocks + extract-class (Excel/Word/PPT/CSV/TXT) extracted to text and injected to Foundry-Claude (HF-T1), owner-scoped |

---

## 7. Execution sequence — backend tiers (BINDING ordering; backend-first)

Each tier is one or more governed microsteps. **Completion gate per microstep:** VEP Codex-APPROVED → Implementation Package → Walter executes SQL + deploys the handler → **Claude Code runs the golden curls** + SELECT-only verification → the three Theo authority docs updated → only then the next microstep. Sequencing is a state machine, not a guideline.

**Ordering note (v0.3 — gateway-first, Walter 2026-06-26).** The model connection is the biggest integration unknown and the most motivating to see working, so the sequence front-loads a **live, stateless chat** end-to-end before the persistence layer. The gateway does not depend on the schema (a turn round-trips `messages[]` → Claude → text without saving); persistence then makes it durable. This keeps backend-first integrity (the gateway is backend) while surfacing integration risk first.

### Tier B0 — Foundry connection + foundation
- **Purpose.** Stand up and prove the Azure AI Foundry → Claude connection; lock the baseline handler pattern.
- **Deliverables (split by owner).** Walter: §11 Part A (deploy the Claude model) + Part B (Function managed identity + `Cognitive Services User`) + grant the signed-in user `Cognitive Services User` for the direct test. **Claude Code:** run the §11 Part C Foundry golden curl (token via `az`), capture the 200 + body under `.local/`; select the canonical `corporate-reporting` Family-B Primary Reference handler (inlined verbatim in the B1 VEP).
- **Completion.** Part C curl returns 200 from Claude; Primary Reference handler chosen; D-3 ZDR noted (non-PII test prompts only until confirmed).

### Tier B1 — Thin model gateway (HF-T1), stateless
- **Purpose.** First live, deployable handler: Theo talks to Claude. No database.
- **Deliverables.** Complete copy-paste `POST /api/theo/message` handler mirroring the Family-B Primary Reference for Easy-Auth (`x-ms-client-principal` → OID) + CORS + envelopes, but calling Foundry with the Function's managed identity (scope `https://ai.azure.com/.default`, `anthropic-version: 2023-06-01`), returning `content[]` filtered to text with `[[ARTIFACT …]]` preserved; minimal/default system prompt (settings + RAG come later); its `function.json`; the deterministic golden curl.
- **Completion.** Walter deploys; **Claude Code's golden curl** gets a live Claude completion through the handler as the signed-in user.

### Tier B1.5 — Frontend chat-service swap (Theo-FE; live SWA test)
- **Purpose.** The visible win — Theo in the deployed SWA returns real Claude responses.
- **Deliverables.** Point the 1A chat contract in the single service module from the mock at the live `/api/theo/message` (mock→live swap, no surface change); redeploy. (Theo-FE regime / Codex — small change.)
- **Completion.** **Walter sees live Claude responses in the Origin/Theo SWA.** (Stateless: refresh loses the thread until B3.)

### Tier B2 — Persistence substrate: `theo_*` schema + RLS (HF-T2 foundation)
- **Purpose.** Stand up the data layer the whole surface persists to (the core of 1B).
- **Deliverables.** Complete Walter-executable DDL for the `theo_*` tables (§5), each with the 4-policy RLS set + `_exists_unscoped(uuid)` helper; Blob container for content bodies; schema doc updated DEPLOYED.
- **Completion.** Tables + policies + helpers deployed (Walter); Claude Code's SELECT-only verification confirms RLS shape; Theo Azure Postgres Schema reflects DEPLOYED.

### Tier B3 — Conversations + messages CRUD (HF-T2) + app-context + persist gateway turns
- **Purpose.** Make chats/recents durable; persist `app_key`/`app_context`; wire HF-T1 to save turns.
- **Deliverables.** `theo_conversations` + `theo_messages` handlers (list/create/fetch conversation; append message — create-only); app-context columns written/read; HF-T1 extended to persist each turn.
- **Completion.** Recents + a reloaded chat thread persist for the signed-in user under RLS; Claude Code golden curls pass. ZDR (D-3) confirmed before client-PII traffic.

### Tier B4 — Projects + project-knowledge + artifacts + settings CRUD (HF-T2)
- **Purpose.** Persist the remaining surfaces.
- **Deliverables.** `theo_projects` / `theo_project_knowledge` / `theo_artifacts` / `theo_artifact_versions` / `theo_user_settings` handlers; artifact versioning persisted (Blob body + Postgres index); settings applied server-side in the HF-T1 system prompt.
- **Completion.** Projects, knowledge, artifacts (versioned), and customize survive reload under RLS; Claude Code golden curls pass.

### Tier B5 — Tool dispatch (HF-T3)
- **Purpose.** Let the model act on the anchored app via the published Reporting API.
- **Deliverables.** Tool-dispatch handler mapping tool-id → authorized `reporting_*` endpoint, validated against the canonical Reporting API Spec, called as the signed-in user; context-scoped by `app_key`; Tool Manifest gains its **first Walter-authorized** endpoint row (D-6; empty at v0.1).
- **Completion.** A model tool-call reads Corporate Reporting data **as the user** (RLS at the Reporting layer); no `reporting_*` direct access anywhere in Theo.

### Tier B6 — RAG retrieval (HF-T4)
- **Purpose.** Replace stubbed retrieval with real hybrid search.
- **Deliverables.** Azure AI Search index over tax corpus + `theo_project_knowledge` (indexed on project create/update); top-k hybrid retrieval RLS-scoped to the user; injected at HF-T1 system-prompt assembly.
- **Completion.** Project-knowledge-grounded answers retrieve real sources scoped to the user; Claude Code golden curls / eval pass.

### Tier B7 — Memory layer (option C; HF-T4 + HF-T1 assembly)
- **Purpose.** Give Theo durable memory across the user's chats and projects: a distilled profile of stable facts/preferences (Claude-style) **and** recall of prior discussions.
- **Deliverables.**
  - **B7a — Distilled memory profile.** `theo_user_memory` table (§5) + 4-policy ownership RLS + `_exists_unscoped(uuid)`; a **distillation step** (server-side model call, governed by D-7) that extracts stable memory items from completed turns (scope `user` or `project`); CRUD handlers so the user can **view/edit/delete** their memory (Claude-style controls); items injected at HF-T1 system-prompt assembly (user-scoped always; project-scoped when a `project_id` / `app_key` is active).
  - **B7b — Cross-chat history-RAG.** Extend the B6 Azure AI Search index to also index the user's own `theo_messages` (RLS-scoped to `created_by`); top-k hybrid retrieval injected at HF-T1 assembly so prior-conversation context is recalled across threads.
- **Completion.** A fact stated in one chat is recalled in another (profile); a question about a past discussion retrieves the relevant prior turns (history-RAG); the user can inspect and edit their memory; all strictly RLS-scoped to the signed-in user. **Gated:** D-3 ZDR (distillation + indexing are client-PII flows), the D-5 Azure AI Search sub-item (history-RAG index), and D-7 (distillation policy) — no live client-PII memory traffic before these resolve.

### Tier B8 — Attachments (file upload → model-readable content)
- **Purpose.** Let users attach files (PDF / images / Excel / Word / etc.) to a chat so Theo can read and reason over them — the core tax-assistant use case ("analyse this K-1 / TB / workpaper"). Capability verified 2026-06-28: the deployed Foundry-Claude gateway accepts Anthropic document/image content blocks with current headers (no beta) and extracts PDF text.
- **Ingestion classes + limits (D-8 RESOLVED 2026-06-28).**
  - **Native-read** (`application/pdf`, `image/png|jpeg|webp|gif`): injected directly as document/image content blocks. **≤ 10 MB** (native reading is accurate at/below this). **(B8h:** a PDF **> 3 MB** (`THEO_PDF_NATIVE_MAX_BYTES`) is instead **text-extracted** and budgeted, so a large text-dense PDF cannot blow the synchronous request; PDFs ≤ 3 MB and all images stay native.**)**
  - **Extract-then-inject** (Excel `.xlsx/.xls`, Word `.docx`, PowerPoint `.pptx`, CSV, TXT): in-process server-side text extraction at upload (SheetJS for Excel, `mammoth` for Word, an office text parser for PPT, `pdf-parse` for large PDFs (B8h), native for CSV/TXT); extracted text injected at the gateway, **token-budgeted**. **≤ 50 MB.** Excel → markdown/CSV per sheet + a sheet manifest (names, row/col counts, est. tokens); full-workbook injection is the default when it fits the budget, with **per-sheet selection** when large.
  - **Stored-only (v1)** (Visio `.vsdx`, legacy binary `.doc/.ppt`): stored + downloadable; Theo replies it cannot yet read the format. Readability deferred to the converter follow-on (B8g).
  - **Upload mechanism:** a short-lived, single-blob, owner-scoped **write SAS** (direct-to-Blob); the finalize handler reads the blob's **actual** size + content-type from Blob properties and enforces the per-class cap (the client cannot misdeclare). **Retention:** indefinite (user-owned data), user-deletable; no auto-TTL.
- **Deliverables.**
  - **B8a — schema.** ✅ **DEPLOYED (2026-06-28).** `theo_attachments` table (§5) + 4-policy ownership RLS + `theo_attachment_exists_unscoped(uuid)`; Blob pointer into the existing `theo-content` container.
  - **B8b — upload handlers.** ✅ **DEPLOYED (2026-06-29).** `theo_create_attachment_upload` (issue the scoped write SAS + the intended blob path) + `theo_finalize_attachment` (verify the blob, read actual size/type, enforce the per-class cap + ingestion-class allow-list, insert the owner-scoped row, return the attachment id) + `theo_delete_attachment` (delete blob then row; RLS `delete_own`). SAS mechanism + 10/50 MB caps per D-8.
  - **B8c — extraction at upload.** ✅ **DEPLOYED (2026-06-29).** For extract-class types, extract text at finalize (SheetJS / mammoth / PPT parser / native) and store it as a sibling Blob pointer in `theo-content`; Excel → per-sheet markdown + sheet manifest. A small **additive schema addendum** records the extraction pointer + ingestion class on `theo_attachments`.
  - **B8d — gateway integration.** ✅ **DEPLOYED (2026-06-29).** `theo_message` accepts `attachment_ids`; for each **owned** attachment: native classes → fetch blob, base64-encode, inject a `document`/`image` content block; extract classes → inject the stored extracted text (token-budgeted; per-sheet selection for large Excel); stored-only → a short "cannot read this format yet" note. Handle array-content `userText`/title persistence.
  - **B8e — frontend.** ✅ **DEPLOYED (2026-06-29; SWA-verified).** Composer attach control + upload (SAS PUT) + attachment chips, plus **large-paste-to-attachment** (a paste ≥ ~1,500 chars becomes a collapsed, expandable "Pasted text" attachment) (Theo FE regime).
  - **B8h — large-document handling.** ✅ **DEPLOYED (2026-06-30).** Keeps large/text-dense documents within the synchronous request budget: `theo_finalize_attachment` promotes a **PDF larger than `THEO_PDF_NATIVE_MAX_BYTES` (3 MB)** from native to **extract-class** (text-extracted via `pdf-parse@1.1.1`; PDFs ≤ 3 MB stay native for visual fidelity); `theo_message` injects strictly by the row's `ingestion_class` (a promoted PDF injects budgeted text, **never** a giant document block — and an extract-class row never falls back to native), plus an extract-text token budget + tightened native byte budget. Fixes the big-document "Couldn't reach the assistant" timeout.
- **Follow-on tiers (deferred — flagged, not v1 scope).**
  - **B8f — spreadsheet read-tool.** A model-callable, owner-scoped attachment read-tool (list sheets → read range → search) for workbooks too large to inject. Triggered when real large-workbook usage appears; touches Theo's tool-dispatch surface (Tool Manifest, D-6-adjacent) as a **Theo-internal attachment tool family** (reads the user's own uploaded file; never a `reporting_*` endpoint).
  - **B8g — Office/Visio converter.** LibreOffice-headless (or a conversion service) rendering `.doc/.ppt/.vsdx` (and other non-OOXML formats) to PDF/image for native reading. Real infra; deferred until needed.
- **Completion.** ✅ **B8a–B8e + B8h DEPLOYED + verified (2026-06-30).** A user uploads a PDF / Excel / Word file (or a large LP agreement) and Theo answers grounded in it — golden-curl + SWA verified; attachments are owner-scoped (RLS + explicit `created_by`); content reaches the model only via the gateway (D-3 ZDR resolved). **Gates:** D-8 RESOLVED. **Pending follow-ons:** reload-parity (attachment chips on reloaded chats; a small FE + `theo_list_conversation_attachments` step), B8f (spreadsheet read-tool) and B8g (Office/Visio converter), and **B9 streaming** — a deliberate sidecar: a 2nd **Windows v4** Function App `vaultgpt-func-stream` on the existing EP1 plan (≈$0; the monolith stays v3 and untouched). `theo_message_stream` relays Foundry-Claude SSE token-by-token to the browser and persists the full turn on completion (same `theo_conversations`/`theo_messages` tables incl. B8i `message_seq`; reload-compatible). **B9 backend DEPLOYED + golden-verified (2026-06-30)** through Easy-Auth; **B9-FE** (live tokens + rotating status words + collapsible Thinking panel, Foundry `thinking_delta` passthrough verified) in Codex review. See the streaming assessment.

### Tier Voice — Voice I/O: dictation + read-aloud (PROPOSED — Walter-directed 2026-07-17)
- **Purpose.** Give Theo the two voice capabilities employees have requested, matching the Claude-app experience but **fully in-tenant**: **tap / press-and-hold dictation** (speak a message instead of typing) and **read-aloud** of Theo's responses in natural neural voices. No third-party voice service; no client audio leaves the Vault tenant.
- **In-tenant posture (DR-T8).** Unlike the Claude *text* model (Anthropic-hosted, Sweden Central — Architecture §2.4 / §11 of this plan), the audio models are true in-tenant Azure Cognitive Services and can run in-region: **Whisper** (Azure OpenAI — speech-to-text) and **Azure AI Speech** neural voices (text-to-speech). Both are reached keyless with the Function's managed identity (scope `https://cognitiveservices.azure.com/.default`), mirroring the existing embeddings / SAS-broker managed-identity pattern.
- **Deliverables (two microsteps, one tier).**
  - **Voice-MS1 — `theo_transcribe_audio`** (HF-T6): a `vaultgpt-func-chat` handler that accepts a short audio clip and returns the transcript from the in-tenant Whisper deployment. Provisioning (executed **only after** Codex APPROVAL): deploy the `whisper` model + confirm the func-chat managed identity's Cognitive Services data role. Stateless — no schema change, no migration. ✅ **DEPLOYED 2026-07-17** (VEP `d266866`, Codex-APPROVED; Whisper `001` on Switzerland North `wmans-mqxwlcdp-switzerlandnorth`; func-chat MI `Cognitive Services User`; golden-verified: 401/204/400×3/200 `{text}`).
  - **Voice-MS2 — `theo_synthesize_speech`** (HF-T6): a `vaultgpt-func-chat` handler that accepts response text and returns synthesized audio from in-tenant Azure AI Speech neural voices. Provisioning (post-APPROVAL): confirm the func-chat managed identity's Cognitive Services Speech data role. Stateless — no schema change, no migration. ✅ **DEPLOYED 2026-07-17** (VEP `f6e827d`, Codex-APPROVED; custom-subdomain `/tts/cognitiveservices/v1` + plain-bearer MI auth — same as the Whisper sibling; default voice `en-US-AvaMultilingualNeural`, optional curated `voice` override; golden-verified: 401/204/400/200 MP3, default + `en-GB-SoniaNeural`). **Tier Voice backend COMPLETE (MS1 + MS2 deployed); FE passes next.**
- **Deploy target.** `vaultgpt-func-chat` only (DR-T7 scoped deployment exception); the monolith `vaultgpt-func-premium` and streaming sidecar `vaultgpt-func-stream` are untouched. **Frontend** (composer mic dictation control + per-message read-aloud control) follows as Theo-FE passes under the frontend regime after each backend microstep lands.
- **Contracts.** Theo API Spec §2.11 (`theo_transcribe_audio`, `theo_synthesize_speech`; both PROPOSED until their VEPs land DEPLOYED). Handler family: Theo Golden Handler Standard §6 HF-T6. Decision: Execution Orchestration Standard §1B DR-T8.
- **Completion gate (per microstep).** VEP Codex-APPROVED → Claude Code provisions (model deploy / MI role) + deploys to func-chat → golden-curl-verified → Role-C updates the API Spec §2.11 row + the Golden Handler §6 HF-T6 status to DEPLOYED. No `theo_*` schema change in this tier.

### Tier Export — Theo → downloadable Excel (PROPOSED — Walter-directed 2026-07-17)
- **Purpose.** Let Theo emit a real **downloadable `.xlsx`** from data it extracts, so users stop copy/pasting model tables into Excel (Akshay's request). First use case: prior-year **K-1s → current-year workpaper input**. The *extraction* half already works (Tier B8 native document-block reading, incl. scanned PDFs ≤ 3 MB); this tier adds the *emit* half.
- **Best-in-class design (DR-T9).** Typed, formatted output (numbers as numbers, dates as dates, box numbers/descriptions preserved; header block fund · partner · tax year; K-1-organized layout); **review-before-export** (Theo shows the extracted table in chat to confirm/correct first; source-box + low-confidence flags); **multi-K-1 workbook** (sheet-per-K-1 or consolidated); **in-tenant** workbook build (SheetJS, the same lib B8 uses to read Excel); Blob (`theo-content`) + short-TTL read SAS → a Download card (may hand to desktop Excel via the Origin `webDavUrl`/Office-URI open). **Tool-driven** (the model calls the export tool when asked). **Stateless v1** (no `theo_*` table, no migration).
- **Deliverables.**
  - **Export-MS1 — `theo_export_spreadsheet`** (HF-T7): a `vaultgpt-func-theo-tools` handler that accepts structured data (one or more sheets: name + headers + typed rows + optional metadata) and returns an owner-scoped, short-TTL **read SAS** download URL for the generated `.xlsx` (built server-side with SheetJS, uploaded to `theo-content` via the HF-T5 managed-identity user-delegation SAS pattern). Stateless — no schema change, no migration. Invoked as a Theo tool via the general-chat tool-loop in `theo_message_stream` (`vaultgpt-func-stream`; `chat-tools` registry, DR-T11) — the loop and the handler on `vaultgpt-func-theo-tools` are both Claude-deployed (DR-T7/DR-T10/DR-T11); `theo_message` on `vaultgpt-func-premium` is unchanged.
  - **Export-MS2 (v1.1) — workpaper-template mapping**: extract K-1 → the current-year workpaper's input columns (Theo reads the template from the DMS), so the export is paste-ready. Optional Artifacts integration (the `.xlsx` as a versioned Theo artifact).
- **Deploy target.** `vaultgpt-func-theo-tools` (the dedicated Theo-tools app, DR-T10; Claude-deployable under the extended DR-T7); the general-chat tool-loop lives on `vaultgpt-func-stream` (`theo_message_stream`, DR-T11, Claude-deployed); `vaultgpt-func-premium` and `vaultgpt-func-chat` are otherwise untouched. **Frontend** (Download card + in-chat review affordance) follows as Theo-FE passes after the backend microstep lands.
- **Contracts.** Theo API Spec §2.12 (`theo_export_spreadsheet`; PROPOSED until its VEP lands DEPLOYED). Handler family: Theo Golden Handler Standard §6 HF-T7. Decision: Execution Orchestration Standard §1B DR-T9.
- **Completion gate (per microstep).** VEP Codex-APPROVED → Claude Code deploys the handler to `vaultgpt-func-theo-tools` → golden-curl-verified → Role-C updates the API Spec §2.12 row + Golden Handler §6 HF-T7 status to DEPLOYED. No `theo_*` schema change in this tier.

### Tier DMS-Push — DMS live-mirror change-notifications (PROPOSED — Walter-directed 2026-07-19)
- **Purpose.** Complete the OneDrive-grade DMS live mirror (governed in `vault-dms`: L1 instant-paint + L2 `dms_delta` incremental sync are SHIPPED) with **real-time push** — Layer 3. `vaultgpt-func-chat` hosts the *stateful infrastructure* the stateless DMS gateway (`func-dms`, no-DB charter) cannot: Microsoft Graph change-notification **subscriptions** on DMS drive roots, plus fan-out over the existing chat Web PubSub, so a SharePoint change reaches viewing clients within seconds without polling. **Domain boundary:** DMS *semantics* (browse, delta, per-user trimming) stay in `vault-dms`/`func-dms`; this tier is func-chat hosting the subscription + notification + fan-out **plumbing** only. **Security invariant (BINDING):** the fan-out signal is **trigger-only** — it carries at most a `drive_id`, never file names/content/metadata; each client reacts by calling its OWN delegated `dms_delta` (func-dms OBO), so per-user SharePoint permission trimming is fully preserved and no app-context data reaches an unentitled user.
- **Authorizations (Walter, 2026-07-19).** (1) Verbatim authorization to call the Graph change-notification subscription endpoints (`POST`/`PATCH`/`DELETE /v1.0/subscriptions`) — Golden Handler §4 new-external-interaction gate. (2) Tenant admin-consent granted for the change-notification application permission (app-level Graph token via the established `client_credentials` pattern).
- **Deliverables.**
  - **DMS-Push-MS1 — subscription + notification spine** (`vaultgpt-func-chat`): migration `dms_change_subscriptions` (subscription_id, site_id, drive_id, resource, expiration, client_state secret; app-scoped, NOT `created_by`/RLS — these are app-level infra rows, not user-owned); `dms_notifications` receiver (answers Graph's synchronous `validationToken` handshake; on a notification validates `client_state`, resolves drive→viewers, fans a trigger-only signal over Web PubSub); `dms_subscribe` (idempotent app-level Graph subscription create/ensure for a drive root, store the row) invoked by the FE when a drive is first viewed.
  - **DMS-Push-MS2 — renewal timer** (`vaultgpt-func-chat`): a timer that renews subscriptions before expiry (driveItem subscriptions are short-lived) and prunes dead rows.
- **Deploy target.** `vaultgpt-func-chat` only (DR-T7 scoped deployment exception; Kudu VFS). `func-dms`, `func-premium`, `func-stream`, `func-theo-tools` untouched. **Frontend** (the DMS remote subscribing to the Web PubSub DMS-change signal → delegated `dms_delta` on ping) follows as a `vault-dms` FE package under the DMS/Codex regime after the backend lands.
- **Contracts.** New Theo API Spec rows for `dms_notifications` / `dms_subscribe` (+ the timer); Theo Azure Postgres Schema row for `dms_change_subscriptions`; Golden Handler §6 family entry. All PROPOSED until their VEP lands DEPLOYED. Graph subscription endpoints are a Golden Handler §4 allowed delta under the verbatim Walter authorization above.
- **Completion gate (per microstep).** VEP Codex-APPROVED → Walter runs the migration (`pgadmin_vault`) → Claude Code deploys the handlers to `vaultgpt-func-chat` + verifies the receiver's validation handshake + a live subscription create → Role-C updates the API Spec + Schema + Golden Handler rows to DEPLOYED. External prerequisites (Walter): admin-consent applied (done 2026-07-19); the func-chat notification endpoint publicly reachable for Graph's handshake.

---

## 8. Open decisions (Walter) — Decision Register seed

| id | Decision | Status (2026-06-26) |
|---|---|---|
| **D-1** | Mirror source + deployment home for `theo_*` handlers. | **RESOLVED.** Mirror the `corporate-reporting/reference-artifacts/handlers/` Family-B handlers (auth + shape); handlers deploy to the shared Azure Functions app; Walter copy-pastes complete handlers into the Azure UI. |
| **D-2** | Legacy chat backend disposition. | **RESOLVED.** Not used / not mirrored — `chat_proxy`, `chat_storage_*`, and early tables are excluded; build fresh on the Reporting pattern. Physical decommission is a separate Walter ops task. |
| **D-4** | Model gateway infra. | **RESOLVED (setup in progress).** Anthropic Claude via Azure AI Foundry; HF-T1 is the sole credential holder + swap point; built fresh (no `chat_proxy` reuse). Azure-side connection walkthrough in §11. |
| **D-5** | Persistence backing. | **RESOLVED.** Azure Postgres (`theo_*`, RLS) for structured data + Azure Blob for artifact-version / knowledge content (pointer-in-Postgres). *Sub-item still open:* the Azure AI Search resource for RAG indexing (B6) — confirm/provision. |
| **D-3** | Foundry-Claude **ZDR** posture before any client-PII traffic. | **RESOLVED (2026-06-28).** Walter has contractually confirmed Anthropic zero-data-retention; live client-PII traffic — including B7 memory distillation + history-RAG — may proceed. |
| **D-6** | First authorized tool-dispatch endpoint (Tool Manifest empty at v0.1). | **OPEN.** Adding an endpoint to the authorized set is a governance change requiring explicit Walter direction. Gates B5. |
| **D-7** | Memory distillation policy (option C): trigger, extraction model, retention + salience, and user memory controls. | **RESOLVED (2026-06-28).** Distill on conversation idle/close (not per-turn); extraction via the same Foundry-Claude gateway (a cheap pass emitting ≤N stable items as JSON); store durable facts/preferences only (never transient content); user can view/edit/delete every item (Claude-style; delete is permanent); scope user-global by default, project-scoped when the chat is in a project; ownership-only RLS. Gates lifted for B7. |
| **D-8** | Attachment upload mechanism + max file size + allowed content types + retention. | **RESOLVED (2026-06-28).** Upload via a short-lived, single-blob, owner-scoped **write SAS** (direct-to-Blob); the finalize handler reads the blob's actual size/type and enforces caps (client cannot misdeclare). **Limits:** native-read (PDF/image) **≤10 MB**; extract-class (Excel/Word/PPT/CSV/TXT) **≤50 MB**. **Allowed types** = a closed ingestion-class allow-list — native: `application/pdf`, `image/png|jpeg|webp|gif`; extract: `.xlsx/.xls/.docx/.pptx`, `text/csv`, `text/plain`; `.doc/.ppt/.vsdx` stored-only in v1 (converter follow-on B8g). **Retention:** indefinite, user-deletable; no auto-TTL. Gates lifted for B8b–B8e. |

Remaining open items are **PRE-LAND** for their tiers: the AI-Search sub-item of D-5 gates B6 **and the B7b history-RAG index**; D-6 gates B5 (and, when triggered, the B8f spreadsheet read-tool). **D-3 (ZDR), D-7 (memory distillation policy), and D-8 (attachment upload mechanism + limits) are RESOLVED (2026-06-28)** — B7 distillation + system-prompt injection and B8b–B8e attachments are no longer gated. No tier proceeds on a guessed decision.

---

## 9. Acceptance criteria — 1B "done"

1. Every 1A surface is backed by a real handler behind the unchanged service boundary — no rendered-surface change.
2. Chat runs through the **real model gateway** (HF-T1), never a direct browser→model call; the gateway is the sole credential holder + swap point.
3. Conversations, messages, projects, knowledge, artifacts (versioned), and settings **persist** under `theo_*` with RLS; survive reload; scoped to the signed-in user.
4. `app_key`/`app_context` persist on the conversation and drive tool-dispatch.
5. Tool-dispatch reads/writes Corporate Reporting **only** through the published `reporting_*` API, **as the signed-in user**, validated against the canonical Spec — never direct table access, never a forked copy.
6. RAG retrieval returns real, RLS-scoped sources injected at system-prompt assembly.
7. Every `theo_*` element is DEPLOYED-classified; the three Theo authority docs reflect deployed reality.
8. No change to `reporting_*` handlers/tables/contracts; no browser storage; ownership-only RLS unless Walter authorized otherwise.

---

## 10. Microstep cadence (per tier microstep)

Pass 1 (Claude Code VEP: GCR + Rule Anchors + feature id + arch/boundary reconciliation + **Gap Register** PROCEED/PRE-LAND/ESCALATE/NO-GAPS + schema grounding + contract grounding + handler grounding with a verbatim Primary Reference + Walter-executable SQL + deterministic curls + mechanical-lint PASS) → **Pass 2** Codex APPROVED/REJECTED → **Pass 3** Walter executes the SQL + deploys the handler; **Claude Code runs the golden curls** (token via `az account get-access-token`) and the SELECT-only verification under `codex_reporting_ro`, capturing evidence under `.local/` → **Pass 4** Role-C updates Theo API Spec / Schema / Golden Handler Standard to DEPLOYED reality.

## 11. Azure AI Foundry → Claude connection setup (HF-T1 prerequisite)

Grounded in Microsoft Learn, *Deploy and use Claude models in Microsoft Foundry* (updated 2026-06-12) + *Claude models in Microsoft Foundry*. Values in `<angle brackets>` are tenant-specific — Walter fills them from his subscription; everything else is the documented procedure. This is the Azure-side prerequisite for the HF-T1 gateway (Tier B3).

**Architecture decision baked in:** the HF-T1 gateway authenticates the *user* via Easy Auth for identity/RLS, but calls Foundry using the **Function app's own managed identity** (keyless) — the gateway is the sole model-credential holder; the user's token is never used for the model call, and no model key ever reaches the browser.

### Part A — One-time Azure setup (Walter, in the portal)
> **Discovery 2026-06-26 (Claude Code, `az`):** the subscription has **no Foundry (AIServices) resource** today — the only Cognitive Services account is `Vaultgpt` (kind **OpenAI**, **UK South**, RG `Vault-Tax`), which **cannot serve Claude**. A **new Foundry resource in East US 2 / Sweden Central** must be created. **Data-residency note (feeds D-3):** Claude-in-Foundry inference is Anthropic-hosted in US regions, not UK South — confirm residency/ZDR acceptability before any client-PII traffic.
1. **Subscription/region check.** Need a paid pay-as-you-go Azure subscription in a supported billing region. Claude in Foundry deploys **Global Standard (serverless)** only, in **East US 2** or **Sweden Central**. (CSP and credit-only subscriptions are unsupported.)
2. **Marketplace access.** Partner models require Azure **Marketplace** subscription permission; need **Contributor** or **Owner** on the resource group to deploy.
3. **Create a Microsoft Foundry project** in East US 2 or Sweden Central (or use the `Azure-Samples/claude` starter kit's `azd up`, which provisions account + project + deployment + Entra wiring with no keys).
4. **Deploy the Claude model** from the Foundry portal (e.g. `claude-sonnet-4-6` or `claude-opus-4-6`), choosing a **deployment name** (it can differ from the model id) — note it; HF-T1 sends it as `model`.
5. **Capture the endpoint:** base `https://<resource-name>.services.ai.azure.com/anthropic`; Messages URI `https://<resource-name>.services.ai.azure.com/anthropic/v1/messages`.

### Part B — Keyless wiring for the gateway Function (Walter)
6. **Enable the Function app's managed identity** (system-assigned) — this is the gateway's model credential.
7. **Assign RBAC:** grant that managed identity the **`Cognitive Services User`** role on the Foundry resource. (This is the role the docs require for Entra/keyless calls; 403 = this role missing.)
8. No API key is stored. (API-key auth via `x-api-key` exists as a fallback, but keyless managed identity is the chosen posture.)

### Part C — Golden curl to validate the Foundry endpoint (Claude Code runs this)
**Claude Code executes this** from the live `az` session (Walter does not paste tokens). It validates the Foundry connection directly (bypasses our handler), using the documented Entra scope `https://ai.azure.com/.default`. Prerequisite: Walter has completed Part A (model deployed) and granted the **signed-in user** (`wmansfield@vault-tax.com`) **`Cognitive Services User`** on the Foundry resource so the user-token test can call the endpoint (the Function's managed identity from Part B is for the handler's own calls in Tier B3). Claude Code captures the command + response under `.local/`.
```sh
az login   # interactive, once per session
TOKEN=$(az account get-access-token --scope "https://ai.azure.com/.default" --query accessToken -o tsv)
curl -sS -X POST "https://<resource-name>.services.ai.azure.com/anthropic/v1/messages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "<deployment-name>",
    "max_tokens": 256,
    "messages": [{ "role": "user", "content": "Reply with the single word: ok" }],
    "stream": false
  }'
```
- 200 + a Messages-API JSON body ⇒ endpoint + RBAC good. 401 ⇒ wrong/expired token or wrong scope (must be `https://ai.azure.com/.default`). 403 ⇒ `Cognitive Services User` not assigned. 404 ⇒ wrong `<resource-name>` or `<deployment-name>`.
- **VERIFIED 2026-06-26 (Claude Code):** `POST https://vaultgpt-foundry.services.ai.azure.com/anthropic/v1/messages`, model `claude-sonnet-4-6`, `anthropic-version: 2023-06-01`, Bearer token scope `https://ai.azure.com/.default` → **HTTP 200**, body `content:[{type:"text",text:"ok"}]`, `stop_reason:"end_turn"`, `usage` present, `inference_geo:"not_available"`. Resource `vaultgpt-foundry` / project `vault-theo` / RG `Vault-Origin` / sub `Vault-GPT` / **Sweden Central**. Evidence: `.local/theo_b0_foundry_connection_test.txt`. **B0 connection proven.**
- **B1 prerequisite (carry-forward):** the §11 Part C test used the *signed-in user's* token (Owner sufficed). The HF-T1 handler calls Foundry with the **Function app's managed identity**, a different principal — so before B1 deploy, that managed identity MUST be granted **`Cognitive Services User`** on `vaultgpt-foundry`.
- The HF-T1 **handler** endpoint (`POST /api/theo/message`) is validated by a separate golden curl whose token is acquired against the **app's** user scope (`az account get-access-token --scope "api://<app-id>/access_as_user"`) for Easy Auth — the handler then calls Foundry with its managed identity internally.

### Part D — How HF-T1 uses it (gateway design, authored in Tier B3)
- Inbound: Easy Auth `x-ms-client-principal` → resolve Entra OID (user identity, for persistence + RLS), exactly the Reporting Family-B pattern.
- Outbound to model: acquire a token via `DefaultAzureCredential` for scope `https://ai.azure.com/.default` (the Function's managed identity), `POST` to the `/anthropic/v1/messages` endpoint with `anthropic-version: 2023-06-01`, body in the standard Anthropic Messages shape (system prompt assembled from `theo_user_settings` + project instructions + RAG), and return `content[]` filtered to text (artifact markers preserved).
- Model swap = change the deployment name / endpoint by configuration; no contract change.

### Open: D-3 ZDR
Claude-in-Foundry inference runs on **Anthropic-hosted** infrastructure (not Azure regional), so **zero-data-retention must be contractually confirmed before any client-PII traffic** flows through HF-T1. This gates B3 go-live with real client data; dev/test with non-PII prompts can proceed earlier.

---

*End of THEO PHASE 1B — BACKEND EXECUTION PLAN (DRAFT v0.3, pending Codex Pass-2 + Walter approval).*
