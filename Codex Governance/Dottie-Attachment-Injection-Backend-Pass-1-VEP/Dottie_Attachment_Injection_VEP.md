# Dottie Attachment Injection — Pass-1 VEP (B8d/B8i read-path in the send handlers)

Fixes a live FE bug (Walter-reported): Dottie can't read an attached file ("I can't see the attachment yet"), and the attachment chip vanishes on reload. **Root cause:** the send handlers (`dottie_message` buffered + `dottie_message_stream` streaming) received `attachment_ids` from the FE but **ignored them entirely** — no content injection into gpt-5 (so the model never sees the file), no `message_seq` linkage (so a reloaded thread has nothing to rehydrate). The attachment *CRUD* (create/finalize/list/delete) was live, but the *read-path* (Theo's B8d) + *reload link* (B8i) were never built. This package adds them to both handlers.

**Mirrors Theo B8d/B8i structure** (model-agnostic, ports verbatim): the `attachment_ids` validation (array, dedup, `≤ATTACH_MAX_COUNT`, uuid), the **owner-scoped fetch** (`WHERE id = ANY($1) AND created_by = $2`, strict all-or-nothing `404`), the MI-bearer blob read, the **native-vs-extract dispatch** (`ingestion_class='extract'` beats a native media type), the **conversation-scoped** injection (each turn's attachments spliced onto its own user message keyed by `message_seq`; current turn at `lastUserIndex`) — matching Theo's *current* live behavior, not the older per-turn baseline — and the **B8i `message_seq` UPDATE** (`SET conversation_id, message_seq … WHERE id = ANY() AND created_by AND conversation_id IS NULL`).

**Adapted for gpt-5** (the only real delta — Claude content blocks have no gpt-5 equivalent): the stream handler uses the **Responses API** (`{type:input_image, image_url}` / `{type:input_file, file_data}` / `{type:input_text}`); the buffered handler uses **chat/completions** (`{type:image_url, image_url:{url}}` / `{type:text}`; native PDF has no chat/completions content part → a note, since the streaming path reads PDFs via `input_file`). `cache_control` is dropped (gpt-5 has none). Full injection, no budget truncation (matching current Theo). **No migration** (`dottie_attachments` already has `message_seq` + `conversation_id`). One **infra** step: grant the `func-dottie-stream` MI Storage Blob Data Contributor (func-dottie's MI already has it).

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Verified Evidence Pack (backend handler modification; no migration)
Grounding parent (source baseline): `94db6e85e42855efb9e53d0356d7d8fb943bcf85` (vault-dottie, `development`)
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD) |
| - | ------------------------------- | ------------------------------ | --------------------------------- |
| 1 | GOVERNING VISION — `governance/VAULT_MEMORY_ARCHITECTURE.md` (§A Amendment 9 — Dottie full agent on gpt-5) | `Read`(§A9) this turn | `3afda098df614b11adc8a7cdcf28d0f9a3f47011` |
| 2 | Backend Governor — `governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md` (§3 Never-Guess; §4 Schema/Infra Reality Lock) | `Grep("Never-Guess")` this turn | `e44cdd85d3d0e5df332dc754cdec731e2e68022e` |
| 3 | Grounding Conformance — `governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR; §5 Rule Anchor) | `Grep("MUST open with a Grounding Conformance Receipt")` this turn | `7c0d902bdff3b6c0af475b483e31ed796214e57b` |
| 4 | Golden Handler — `governance/THEO_GOLDEN_HANDLER_STANDARD.md` (§4 EXACT mirror / allowed delta; §5.1 Structural Mirror) | `Grep("EXACT mirror")` this turn | `f8f0e5ea36447502e35fb87b373c94e376f05cbb` |
| 5 | Execution Orchestration — `governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md` (§1D ordered pass; §1E deploy-after-Codex) | `Grep("ordered, non-skippable")` this turn | `565559b699c1309f8e750b0dbbac859c13d807c8` |
| 6 | DEPLOYED SCHEMA — `spec/DOTTIE_AZURE_POSTGRES_SCHEMA.md` (§6 `dottie_attachments` — the `message_seq` + `conversation_id` columns this UPDATE writes; already deployed) | `Read`(§6) this turn | `53ee66d1f2192163463bf4de40407652b6913e8c` |
| 7 | **STRUCTURAL REFERENCE — Theo B8d/B8i (deployed)** — `vault-theo/Codex Governance/Theo-1B-B8k-Attachment-Persistence-Fix-Pass-1-VEP/theo_message_stream.LIVE.js` (the fetch/dispatch/message_seq structure mirrored) | `Read`(full) this turn | `b264ec5957b6fffb782fd8e3f7fd27caa202aa6d` |
| 8 | **STRUCTURAL REFERENCE — Theo current-live conversation-scoped** — `vault-theo/Codex Governance/Theo-SPW-Phase2b3e-Member-Project-Knowledge-Pass-1-VEP/handlers/theo_message_stream.js` (the conversation-scoped `rowsBySeq` splice this matches) | `Read`(§1060–1167) this turn | `76d69204047f60d2d3c1b6ee55b467b33468261f` |
| 9 | **MODIFIED HANDLER (proposed, committed at HEAD; = deployed D2-Stream base + this package's additive attachment block) — `dottie_message_stream`** (Responses API) | `Read`(full) this turn; `Codex Governance/Dottie-D2-Stream-Backend-Pass-1-VEP/proposed-app/src/functions/dottie_message_stream.js` | `bfa55379bb9a150e1a6f82c420a02ae4a5398aee` |
| 10 | **MODIFIED HANDLER (proposed, committed at HEAD; = deployed D2 base + this package's additive attachment block) — `dottie_message`** (chat/completions) | `Read`(full) this turn; `Codex Governance/Dottie-D2-Conversation-Handlers-Pass-1-VEP/dottie_message.index.js` | `423b07c03565053b8d9e60bb07fe93d0da955b1d` |

No ChatGPT advisory cited. No `reporting_*` / `theo_*` object touched. Backend handler package (no migration; no write SQL by Claude).

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt" | GCR (head) |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §4 | "Schema Reality Lock" | §3 — writes only DEPLOYED `dottie_attachments` columns |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §3 | "Never-Guess" | §4 — the func-dottie-stream MI gap is az-VERIFIED |
| governance/THEO_GOLDEN_HANDLER_STANDARD.md | §4 | "EXACT mirror" | §5 — the fetch/dispatch/message_seq structure mirrors Theo B8d; content-blocks are the allowed gpt-5 delta |
| governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md | §1D | "ordered, non-skippable" | §8 — Codex → infra → deploy → golden test |

---

## §1 — Feature
Both send handlers now honor `attachment_ids`. On send: validate the ids; fetch the conversation's prior attachments (keyed by `message_seq`) + this turn's ids (owner-scoped, strict-404); read each attachment's content via the Function MI (native image/PDF bytes, or the `.extracted.md` text for extract-class); splice content parts onto each attachment's own user turn (attachments first, user text last); send to gpt-5; and on persist, link this turn's attachments (`conversation_id` + `message_seq = baseSeq`) so a reloaded thread rehydrates the chips.

## §2 — Architecture & boundary
Conversation-scoped injection mirroring current Theo. Owner-scoped throughout (`created_by = $oid` on every query; the connection role bypasses RLS). Blob content read server-side via the Function's system-assigned MI (`getManagedIdentityAccessToken("https://storage.azure.com/")` + `x-ms-version` GET), the same technique as the dottie attachment CRUD handlers. Native-vs-extract dispatch honors finalize's `ingestion_class` (extract-class never falls back to a native block). Per-attachment blob-read failures degrade to a text note (never fail the turn); a not-owned/absent id is a strict `404`. No `theo_*`/`reporting_*` object touched; no route/function.json change; the existing envelope/SSE/persist/gpt-5-call are otherwise unchanged. **gpt-5 content-format divergence between the two handlers is intrinsic** (they call different APIs): stream = Responses API parts; buffered = chat/completions parts.

## §3 — Schema Reality Lock (Governor §4) — SATISFIED, no migration
The `message_seq` UPDATE + the attachment fetch read/write only DEPLOYED `dottie_attachments` columns: `id, filename, content_type, byte_size, blob_container, blob_path, ingestion_class, extracted_text_path, conversation_id, message_seq, created_by, created_at` (schema doc §6, GCR row 6; deployed + RO-verified 2026-08-01 — `message_seq` and `conversation_id` are already present). No DDL, no migration.

## §4 — Infra Reality Lock (Governor §3) — az-VERIFIED
Blob reads need the Function MI to hold Storage Blob Data Contributor on `vaultgptdottiestore`. Verified live:
- **`vaultgpt-func-dottie` MI (`86c251f4…`)** — HAS the role (granted in the attachments deploy). The buffered `dottie_message` runs here → ready.
- **`vaultgpt-func-dottie-stream` MI (`6aa9a6b9-760b-4570-929a-7e08605d99a5`)** — **NO role on `vaultgptdottiestore`** (az-verified). The streaming `dottie_message_stream` runs here → the deploy step GRANTS it Storage Blob Data Contributor (a prerequisite; without it every stream attachment degrades to "could not be loaded"). `IDENTITY_ENDPOINT`/`IDENTITY_HEADER` are injected by Azure on both apps. `DOTTIE_BLOB_ACCOUNT`/`DOTTIE_BLOB_CONTAINER` already set on func-dottie; the stream app defaults to `vaultgptdottiestore`/`dottie-content` (matching).

## §5 — The change + Structural Mirror (Golden §4/§5.1)
Both handlers gain an additive attachment-injection block; everything else is byte-identical to their deployed D2 / D2-Stream state — the proposed handlers committed at HEAD (GCR rows 9–10) differ from the deployed base only by this block (git-diffable base→HEAD). Per handler, the additions are: (a) constants + MI/blob helpers (`requestBinary`, `getManagedIdentityAccessToken`, `encodeBlobPath`, `blobUrlFor`, `downloadBlobBinary`, `downloadBlobText`) + `buildAttachmentParts`; (b) `attachment_ids` validation + `lastUserIndex`; (c) the conversation-scoped `rowsBySeq` fetch + splice into `messagesForUpstream` (used as the gpt-5 `input`/`messages`); (d) the B8i `message_seq` UPDATE in persistence.

| Region | Classification | Notes |
| ------ | -------------- | ----- |
| `attachment_ids` validation (array/dedup/`≤10`/uuid/require-user-turn); owner-scoped fetch SQL (`id = ANY … AND created_by`; strict-404); conversation-scoped `rowsBySeq` (prior `message_seq` + current `lastUserIndex`); native-vs-extract dispatch; MI-bearer blob read; the B8i `message_seq` UPDATE | **EXACT MIRROR (structure)** | ports verbatim from deployed Theo B8d/B8i (GCR rows 7–8) — model-agnostic |
| **content-block shapes** — `buildAttachmentParts`: **stream** → `{type:input_image, image_url:"data:…"}` / `{type:input_file, filename, file_data:"data:…"}` / `{type:input_text}` (Responses API); **buffered** → `{type:image_url, image_url:{url:"data:…"}}` / `{type:text}` (chat/completions; native PDF → a note); `cache_control` dropped | **ALLOWED DELTA (gpt-5 adaptation)** | Claude `{type:image/document/text}` blocks have no gpt-5 equivalent; the two Dottie handlers call different gpt-5 APIs, so their part shapes differ intrinsically |
| budgets — full injection, no truncation | **ALLOWED DELTA (matches current Theo)** | current Theo removed the caps (Walter-directed); Dottie matches |

`node --check` passes both handlers. No route/function.json change.

## §6 — Golden test (Golden §5.3; Claude runs post-deploy)
Authenticated az bearer (aud `api://4e1a1e31…`). Reuse the deployed attachment CRUD to seed a real file:
| # | Step | Expect |
| - | ---- | ------ |
| C1 | create+PUT+finalize a `.txt`/`.docx` (extract-class) → get its `attachment_id`; `dottie_message_stream` with `{messages:[{user:"summarise the attached file"}], attachment_ids:[<id>]}` | `200` stream; the answer **references the file's actual content** (not "I can't see it") |
| C2 | `dottie_get_conversation` / `dottie_list_conversation_attachments?conversationId=<C1 conv>` | the attachment row has `message_seq` set (non-NULL) and `conversation_id` = the conversation → **reload rehydrates the chip** |
| C3 | an **image** attachment (png) via `dottie_message` (buffered) | `200`; the answer describes the image (chat/completions `image_url` path) |
| C4 | a **PDF** via `dottie_message_stream` | `200`; the answer reads the PDF (Responses-API `input_file`) — **verify Azure gpt-5 accepts inline base64 PDF; if it 400s, route native PDF through extraction (documented fallback)** |
| C5 | `attachment_ids` with a not-owned/absent uuid | `404 NOT_FOUND` (strict) |
| C6 | send with no `attachment_ids` | unchanged behavior (messages sent as plain strings) |
| C7 | Walter FE smoke test: attach a Word doc, ask Dottie to read it | Dottie reads it; the chip survives reload |

## §7 — Gap Register
**PROCEED** (grounded; schema present; infra gap az-verified + closed at deploy).
- **G-PDF-BUFFERED: DISCLOSED.** The buffered (chat/completions) path can't send a native PDF as a content part (no chat/completions equivalent) → it injects a note directing to the streaming view. The streaming path (the live FE default) reads PDFs via `input_file`. Acceptable; disclosed.
- **G-PDF-AZURE: VERIFY-AT-DEPLOY.** Whether Azure gpt-5 accepts inline base64 `input_file` PDFs is verified in C4; if not, native PDFs route through extraction (a one-branch change) — I will NOT claim PDF works until C4 is green (the "verify, don't overclaim" discipline).
- **G-APISPEC: PRE-LAND (Role-C).** `spec/DOTTIE_API_SPEC.md` gains an `attachment_ids` note on the send endpoints post-deploy. Disclosed.

## §8 — Deploy plan (ordered; §1D)
1. Codex Pass-2 → APPROVED/REJECTED. 2. **Infra:** grant the `func-dottie-stream` MI (`6aa9a6b9…`) Storage Blob Data Contributor on `vaultgptdottiestore` (func-dottie already has it). 3. Claude Kudu-VFS deploys `dottie_message` (func-dottie) + `dottie_message_stream` (func-dottie-stream) — PUT `index.js`, GET-back byte-identical, restart. 4. Claude runs §6 golden tests (incl. the PDF verify C4). 5. Role-C: API-spec `attachment_ids` note. 6. Walter FE smoke test (C7).

## Codex activation note (Walter forwards)

```
Codex is activated for Pass-2 review of Dottie Attachment Injection (B8d/B8i in dottie_message +
dottie_message_stream), vault-dottie, "Codex Governance/Dottie-Attachment-Injection-Backend-Pass-1-VEP/
Dottie_Attachment_Injection_VEP.md". Open with a governance-bound GCR + Rule Anchor Table. HANDLER
MODIFICATION (no migration — dottie_attachments already has message_seq + conversation_id; one infra grant:
func-dottie-stream MI → Storage Blob Data Contributor, az-verified absent). Fixes a live bug: the send
handlers ignored attachment_ids (model couldn't read files; chip vanished on reload). Review: (1) the fetch/
strict-404/native-vs-extract/conversation-scoped-message_seq/B8i-UPDATE structure is an EXACT mirror of the
deployed Theo B8d/B8i (§5, GCR rows 7-8); the ONLY delta is the gpt-5 content-block shapes (stream = Responses
API input_image/input_file/input_text; buffered = chat/completions image_url/text; cache_control dropped) —
intrinsic because the two handlers call different gpt-5 APIs. (2) Schema Reality Lock — writes only deployed
dottie_attachments columns; no DDL. (3) Infra Reality Lock — the func-dottie-stream MI grant (az-verified).
(4) fail-closed (strict-404 for not-owned; blob-read failure degrades to a note). (5) golden test incl. the
Azure-gpt-5-PDF verify (C4) — PDF is NOT claimed working until that's green. node --check passes both. Emit
APPROVED or REJECTED only.
```
