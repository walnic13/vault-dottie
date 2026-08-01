# Dottie API Spec

Live Dottie backend endpoints. All are EasyAuth-gated (shared Vault GPT API app, audience `api://4e1a1e31-5c20-4480-99e4-098901707d9e`); handlers enforce `401` via `x-ms-client-principal` and scope every query to the caller's `oid` (`created_by`). Envelope: success `{ data, meta:{timestamp,version} }`; error `{ error:{ code, message, status, timestamp } }`.

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

## Notes
- `dottie_ask` (POST `/api/dottie_ask`, func-dottie) — the original stateless gpt-5 round-trip (Stage-0 frame). Superseded for chat by `dottie_message`.
- Dottie-L1 memory WRITE/CRUD + distillation is Phase D3 (the read-injection is live but degrades to empty until D3 populates `dottie_user_memory`).
- No project-sharing (SPW), attachments, history-RAG, web-tools, or extended thinking — see `DOTTIE_THEO_PARITY_LEDGER.md`.

_Recorded 2026-08-01 after D2 + D2-Stream deploy + golden curls (Role-C, satisfying the G-APISPEC gap in both packages)._
