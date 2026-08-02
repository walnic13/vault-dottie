# Dottie API Spec

Dottie backend endpoints — all **live**. All are EasyAuth-gated (shared Vault GPT API app, audience `api://4e1a1e31-5c20-4480-99e4-098901707d9e`); handlers enforce `401` via `x-ms-client-principal` and scope every query to the caller's `oid` (`created_by`). Envelope: success `{ data, meta:{timestamp,version} }`; error `{ error:{ code, message, status, timestamp } }`.

## Hosts
- **`vaultgpt-func-dottie`** (`https://vaultgpt-func-dottie.azurewebsites.net`) — classic v3, Kudu-VFS. The buffered conversation trio + `dottie_ask`.
- **`vaultgpt-func-dottie-stream`** (`https://vaultgpt-func-dottie-stream.azurewebsites.net`) — Windows **v4** sidecar (HTTP streaming), shares EP1 `ASP-VaultTax-931c`. Only `dottie_message_stream`.

Both use the in-tenant Azure OpenAI **gpt-5** deployment via client-credentials `getAadToken`, and Postgres `dottie_*` (D1 schema).

## Endpoints

### POST `/api/dottie_message` (func-dottie) — buffered send
Body `{ messages:[{role:'user'|'assistant', content:string}], conversation_id?:uuid, attachment_ids?:uuid[], system?:string, max_completion_tokens?:int }`. Injects Dottie-L1 memory + any **`attachment_ids`** (owner-scoped, ≤10, deduped/uuid-validated — Theo B8d/B8i) → gpt-5 → persists user+assistant (lazy-creates the conversation on first turn, else owner-gates). → `200 { data:{ conversation_id, role:"assistant", model, content, finish_reason, usage } }`. Errors: `400` (bad body / bad conversation_id / empty user turn / >10 attachments), `401`, `403`/`404` (owner-gate; strict all-or-nothing on attachment ownership), `429`/`502` (gpt-5 upstream), `500`.

**Attachment injection (as-built).** Conversation-scoped: each turn's attachments render on its own user message (the current turn's at the last user turn); extract-class → stored extracted text, native image → image block, native PDF → a text note on this buffered path (read natively via `input_file` on the streaming path). A **shared per-message budget** (extract ≤ 100 000 chars — tuned below gpt-5's empty-completion zone; native ≤ 14 MB), allocated **current-turn-first**, truncates/omits over-budget content with a `[…truncated]` / omission note so a large file (e.g. a bloated Excel export) cannot blow the gpt-5 input. On send, the sent attachments are linked to the conversation (`message_seq`) so a reopened thread rehydrates its chips (B8i).

### GET `/api/dottie_list_conversations` (func-dottie)
Query `?limit=` (1..200, default 50). → `200 { data:{ conversations:[{id,title,model,created_at,updated_at,last_opened_at,starred}] } }` ordered `last_opened_at DESC NULLS LAST, updated_at DESC`. `401`, `500`.

### GET `/api/dottie_get_conversation` (func-dottie)
Query `?conversationId=uuid`. → `200 { data:{ conversation, messages:[{id,seq,role,content,model,created_at}] } }` (seq order); stamps `last_opened_at`. `400`, `401`, `403`/`404` (owner-gate via `dottie_conversation_exists_unscoped`), `500`.

### POST `/api/dottie_message_stream` (func-dottie-stream) — streaming send (SSE)
Same body as `dottie_message` (incl. `attachment_ids`; native PDFs are read via `input_file` here, and the conversation-scoped injection + shared 100 000-char / 14 MB current-turn-first budget are identical). → `200 text/event-stream`: the upstream gpt-5 SSE relayed verbatim (OpenAI chunk shape `data: {choices:[{delta:{content}}]}` … `data: [DONE]`), then a final `event: vault_meta\ndata: {conversation_id, model}`. On stream end the full turn is persisted to `dottie_*` (identical to the buffered path). Pre-stream failures are clean JSON errors (`400`/`401`/`403`/`404`/`429`/`502`/`500`); mid-stream upstream error → `event: vault_error`; post-stream persistence failure → `vault_meta {persisted:false}` (answer already delivered).

**Tools (gpt-5 Responses API).** `tools` = the built-in server-side `web_search` (internet grounding, cited) **plus** — when `THEO_TOOLS_SCOPE` is configured — the model-callable **`find_image` / `find_video`** function tools (Media-Tools package, LIVE 2026-08-02). On a media call the handler runs a **bounded tool loop** (≤ `DOTTIE_MAX_TOOL_TURNS`, default 8): it dispatches to the deployed **func-theo-tools** (`theo_find_image` / `theo_find_video`) with a **client-credentials** bearer for `THEO_TOOLS_SCOPE` (aud `api://4e1a1e31…` — the same AAD app; Dottie has no user token to forward, so the tool runs under Dottie's app identity), feeds the result back as a `function_call_output` on `input`, and re-opens the turn. SSE frames the FE renders: `event: tool` / `event: tool_result {name, ok}` (activity), `event: vault_image {url, title, source, pageUrl, license, creator, images[]}` (proxy blob-SAS gallery), `event: vault_video {videoUrl, embedUrl, title, thumbnail, source, duration, date}` (youtube-nocookie embed or thumbnail card). The model is instructed not to paste URLs. **Media is stream-only** (not persisted; a reloaded thread rehydrates text but not the media — a disclosed follow-up).

## Conversation management (func-dottie) — **LIVE** (ConvMgmt package)
> Deployed to `vaultgpt-func-dottie` 2026-08-01 (Kudu VFS, GET-back byte-identical, app restarted) after Codex Pass-2 APPROVED. Golden curls green: rename `200`/empty-title `400`; star `200`/unknown-field `400`/absent-uuid `404`; delete `200`/get-after-delete `404` (cascade)/bad-id `400`; all three `401` unauthenticated. Contracts (owner-scoped; standard envelope):

### POST `/api/dottie_rename_conversation` (func-dottie)
Body `{ id:uuid, title:string (1..200, trimmed, non-empty) }`. Owner-scoped `UPDATE dottie_conversations SET title, updated_at=now()`. → `200 { data:{ conversation:{ id, title, … } } }`. `400` (bad/empty/oversized title or bad `id`), `401`, `403`/`404` (owner-gate via `dottie_conversation_exists_unscoped`), `500`.

### POST `/api/dottie_delete_conversation` (func-dottie)
Body `{ id:uuid }`. Owner-scoped `DELETE FROM dottie_conversations` (its `dottie_messages` CASCADE per the D1 FK; Dottie has no attachments). → `200 { data:{ deleted:true, id } }`. `400`, `401`, `403`/`404` (owner-gate), `500`.

### POST `/api/dottie_set_conversation_starred` (func-dottie)
Body `{ conversation_id:uuid, starred:boolean }` (strict — unknown keys → `400`). Owner-scoped `UPDATE dottie_conversations SET starred` only — deliberately does **not** touch `updated_at`, so starring never re-orders Recents. → `200 { data:{ conversation_id, starred } }`. `400`, `401`, `403`/`404` (owner-gate), `500`.

## People roster (func-dottie) — **LIVE** (ListPeople package)
### GET `/api/dottie_list_people` (func-dottie)
No body. Read-only delegated Microsoft Graph **OBO**: exchanges the caller's bearer (aud `api://4e1a1e31…`) for a Graph token via the shared API app's client credentials, then reads the "Vault Staff" group members + live presence + 48×48 photos. → `200 { data:{ people:[{ id (Entra OID), displayName, email, jobTitle, availability, activity, photo (data: URI|null), isSelf }], self } }` (self first, then alphabetical). `401` (no identity / no bearer), `403` (Graph/OBO forbidden), `500` (missing OBO config / unexpected). Presence + photos best-effort (null on failure; never fail the roster). Deployed 2026-08-01 (Kudu VFS, GET-back byte-identical); golden curls green: authenticated `200` (roster of 9, self `isSelf:true` first, photo+presence populated); unauthenticated `401`; CORS preflight `200` for the dev-SWA origin. **FE un-gated** (`DOTTIE_CAPABILITIES.people = true`) + deployed to dev SWA 2026-08-01.

## Attachments (func-dottie) — **LIVE** (Attachments-Schema + Attachments-Handlers packages)
> Files attached to a chat live in Azure Blob (`dottie-content` on `vaultgptdottiestore`); `dottie_attachments` holds the pointer + metadata. SAS is hand-rolled (user-delegation via the Function MI; no `@azure/storage-blob`). Deployed 2026-08-01 (Kudu VFS + `xlsx`/`mammoth`/`officeparser`/`pdf-parse@1.1.1`); golden-curl round-trip green.
### POST `/api/dottie_create_attachment_upload` (func-dottie)
Body `{ filename, content_type }` (allow-list; native ≤10 MB: pdf/png/jpeg/webp/gif; extract ≤50 MB: xlsx/xls/xlsm/xlsb/docx/pptx/csv/txt). → `201 { data:{ attachmentId, filename, contentType, ingestionClass, maxBytes, upload:{ account, container, blobKey, blobUrl, uploadUrl(SAS 15-min `cw`), method:"PUT", requiredHeaders:{ "x-ms-blob-type":"BlockBlob", "Content-Type" }, expiresAt } } }`. `400 BAD_REQUEST|INVALID_REQUEST|UNSUPPORTED_MEDIA_TYPE`, `401`, `500`. No SQL.
### POST `/api/dottie_finalize_attachment` (func-dottie)
Body `{ attachment_id, filename, conversation_id? }`. HEADs the blob for the authoritative content-type+size (anti-misdeclaration), enforces allow-list + cap, extracts text for extract-class (or PDF > `DOTTIE_PDF_NATIVE_MAX_BYTES`, default 3 MB) into a `.extracted.md` sibling (best-effort), INSERTs `dottie_attachments` (owner-gating any `conversation_id`). → `201 { data:{ attachment:{ id, conversation_id, filename, content_type, byte_size, blob_container, blob_path, ingestion_class, extracted_text_path, created_at } } }`. `400`/`401`/`404`/`502 STORAGE_ERROR`/`403`(42501)/`409`(23505)/`500`.
### POST `/api/dottie_delete_attachment` (func-dottie)
Body `{ id }`. Owner-scoped `DELETE … RETURNING blob_path`; 0 rows → `dottie_attachment_exists_unscoped` → `403`/`404`; best-effort MI blob delete after commit. → `200 { data:{ deleted:true, id } }`.
### GET `/api/dottie_list_conversation_attachments` (func-dottie)
Query `?conversationId=uuid`. Owner-gates the conversation, then its rows `{ id, filename, content_type, byte_size, ingestion_class, message_seq, created_at }` (blob paths **not** projected) ordered `message_seq ASC NULLS LAST, created_at ASC`. → `200 { data:{ attachments:[…] } }`. `400`/`401`/`403`/`404`/`500`.

## Artifacts persistence (func-dottie) — **LIVE** (Artifacts-Schema + Artifacts-Handlers packages)
> Persisted `[[ARTIFACT]]` deliverables. Content lives in Azure Blob (`dottie-content` on `vaultgptdottiestore`, key `artifacts/{oid}/{artifactId}/v{n}.txt`, written server-side via the Function MI bearer — no SAS); `dottie_artifacts` (metadata + `current_version`) + `dottie_artifact_versions` (immutable Blob-pointer rows) hold the rest. No `project_id` (Dottie has no Projects). Deployed 2026-08-01; golden-curl round-trip green.
### POST `/api/dottie_upsert_artifact` (func-dottie)
Body `{ title (≤200, non-blank), type ∈ {document,code,html}, content (≤1 MiB utf8), conversation_id? (uuid) }`. Title-keyed owner-scoped upsert (case-insensitive): reused title → new version at `current_version+1`; new title → create at v1. Writes the version blob, inserts the version row, bumps the parent pointer/type. → `201` (created) / `200` (new version) `{ data:{ artifact:{ id, conversation_id, title, type, current_version, created_at, updated_at, version_number } } }`. `400 BAD_REQUEST|INVALID_REQUEST`, `401`, `404` (conversation not owned), `403`(42501), `500`; ROLLBACK + best-effort orphan-blob delete on failure.
### GET `/api/dottie_list_artifacts` (func-dottie)
Query `?conversationId=?`. → `200 { data:{ artifacts:[{ id, conversation_id, title, type, current_version, created_at, updated_at }] } }` ordered `updated_at DESC, id DESC` LIMIT 500 — **metadata only, no content**. `401`/`400`/`403`/`500`.
### GET `/api/dottie_get_artifact` (func-dottie)
Query `?artifactId=uuid`. Owner-gated (`403`/`404` via `dottie_artifact_exists_unscoped`), then all versions ASCENDING with each version's Blob content hydrated (a failed blob read degrades to `content:""`). → `200 { data:{ artifact:{ …, versions:[{ version_number, content, byte_size, content_type, created_at }] } } }`. `401`/`400`/`403`/`404`/`500`.

## Notes
- `dottie_ask` (POST `/api/dottie_ask`, func-dottie) — the original stateless gpt-5 round-trip (Stage-0 frame). Superseded for chat by `dottie_message`.
- Dottie-L1 memory WRITE/CRUD + distillation is Phase D3 (the read-injection is live but degrades to empty until D3 populates `dottie_user_memory`).
- No project-sharing (SPW), history-RAG, or extended thinking — see `DOTTIE_THEO_PARITY_LEDGER.md`. (Attachments are LIVE — see § Attachments above; web-search grounding is live via the streaming path.)

_Recorded 2026-08-01 after D2 + D2-Stream deploy + golden curls (Role-C, satisfying the G-APISPEC gap in both packages). Conversation-management trio added 2026-08-01 after the ConvMgmt package deploy + golden curls (Role-C). `dottie_list_people` added 2026-08-01 after the ListPeople package deploy + golden curls (Role-C)._
