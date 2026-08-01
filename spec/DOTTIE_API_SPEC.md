# Dottie API Spec

Dottie backend endpoints — all **live**. All are EasyAuth-gated (shared Vault GPT API app, audience `api://4e1a1e31-5c20-4480-99e4-098901707d9e`); handlers enforce `401` via `x-ms-client-principal` and scope every query to the caller's `oid` (`created_by`). Envelope: success `{ data, meta:{timestamp,version} }`; error `{ error:{ code, message, status, timestamp } }`.

## Hosts
- **`vaultgpt-func-dottie`** (`https://vaultgpt-func-dottie.azurewebsites.net`) — classic v3, Kudu-VFS. The buffered conversation trio + `dottie_ask`.
- **`vaultgpt-func-dottie-stream`** (`https://vaultgpt-func-dottie-stream.azurewebsites.net`) — Windows **v4** sidecar (HTTP streaming), shares EP1 `ASP-VaultTax-931c`. Only `dottie_message_stream`.

Both use the in-tenant Azure OpenAI **gpt-5** deployment via client-credentials `getAadToken`, and Postgres `dottie_*` (D1 schema).

## Endpoints

### POST `/api/dottie_message` (func-dottie) — buffered send
Body `{ messages:[{role:'user'|'assistant', content:string}], conversation_id?:uuid, system?:string, max_completion_tokens?:int }`. Injects Dottie-L1 memory → gpt-5 → persists user+assistant (lazy-creates the conversation on first turn, else owner-gates). → `200 { data:{ conversation_id, role:"assistant", model, content, finish_reason, usage } }`. Errors: `400` (bad body / bad conversation_id / empty user turn), `401`, `403`/`404` (owner-gate), `429`/`502` (gpt-5 upstream), `500`.

### GET `/api/dottie_list_conversations` (func-dottie)
Query `?limit=` (1..200, default 50). → `200 { data:{ conversations:[{id,title,model,created_at,updated_at,last_opened_at,starred}] } }` ordered `last_opened_at DESC NULLS LAST, updated_at DESC`. `401`, `500`.

### GET `/api/dottie_get_conversation` (func-dottie)
Query `?conversationId=uuid`. → `200 { data:{ conversation, messages:[{id,seq,role,content,model,created_at}] } }` (seq order); stamps `last_opened_at`. `400`, `401`, `403`/`404` (owner-gate via `dottie_conversation_exists_unscoped`), `500`.

### POST `/api/dottie_message_stream` (func-dottie-stream) — streaming send (SSE)
Same body as `dottie_message`. → `200 text/event-stream`: the upstream gpt-5 SSE relayed verbatim (OpenAI chunk shape `data: {choices:[{delta:{content}}]}` … `data: [DONE]`), then a final `event: vault_meta\ndata: {conversation_id, model}`. On stream end the full turn is persisted to `dottie_*` (identical to the buffered path). Pre-stream failures are clean JSON errors (`400`/`401`/`403`/`404`/`429`/`502`/`500`); mid-stream upstream error → `event: vault_error`; post-stream persistence failure → `vault_meta {persisted:false}` (answer already delivered).

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

## Notes
- `dottie_ask` (POST `/api/dottie_ask`, func-dottie) — the original stateless gpt-5 round-trip (Stage-0 frame). Superseded for chat by `dottie_message`.
- Dottie-L1 memory WRITE/CRUD + distillation is Phase D3 (the read-injection is live but degrades to empty until D3 populates `dottie_user_memory`).
- No project-sharing (SPW), attachments, history-RAG, web-tools, or extended thinking — see `DOTTIE_THEO_PARITY_LEDGER.md`.

_Recorded 2026-08-01 after D2 + D2-Stream deploy + golden curls (Role-C, satisfying the G-APISPEC gap in both packages). Conversation-management trio added 2026-08-01 after the ConvMgmt package deploy + golden curls (Role-C). `dottie_list_people` added 2026-08-01 after the ListPeople package deploy + golden curls (Role-C)._
