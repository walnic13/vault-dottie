# Dottie ↔ Theo Feature-Parity Ledger

**Purpose.** The single durable reconciliation of *what Theo has* against *what Dottie replicates* — so the "build Dottie by replicating all of Theo's features" program is a checklist on disk, not something anyone has to remember. Living doc: update the **Status** / **Phase** columns as packages land.

**Governing principle — "replicate Theo exactly" = FEATURE parity, not byte-identity.** Dottie has different tables (`dottie_*`), a different model (in-tenant **gpt-5**, not Theo's Foundry-Claude — observer independence), its own layered memory, and a distinct FE identity. So a Dottie handler is the *faithful structural mirror* of its Theo sibling with **documented allowed-deltas** for exactly those axes (table/column names, the model call, the persona). Byte-identity applies only to the shared envelope/plumbing helpers, which Dottie copies verbatim from the Theo primary reference. This is the Golden Handler discipline: EXACT where it can be, ALLOWED-DELTA where identity/model/schema force a change, and every claim in a VEP must match the code.

**Authority.** [[VAULT_MEMORY_ARCHITECTURE.md]] §A Amendment 9 (Dottie = full independent agent). This ledger is a planning/reconciliation artifact, not an authority standard; it does not override the governance standards.

**Legend — Status:** ✅ DONE (deployed+verified) · 🔵 IN-REVIEW (Codex Pass-2) · 🟡 PLANNED (has a phase) · ⚪ DEFERRED (later, low priority) · ⛔ N/A (deliberately not replicated — reason given).

---

## 1. Conversation core

| Theo capability | Theo surface | Dottie status | Dottie phase | Adaptation vs Theo |
| --- | --- | --- | --- | --- |
| Send turn → model → persist user+assistant, lazy-create conversation | `theo_message` | ✅ DONE (deployed+verified) | **D2** | `dottie_message` on func-dottie; gpt-5 (not Claude); Dottie-L1 injection; no app_key/app_context/citations/attachments |
| List conversations (restore-on-reopen order) | `theo_list_conversations` | ✅ DONE | **D2** | `dottie_list_conversations`; drops project/publish columns |
| Get one conversation + messages | `theo_get_conversation` | ✅ DONE | **D2** | `dottie_get_conversation`; drops SPW `conversation_access`/publish/media |
| **Streaming** send (real-time SSE, not buffered) | `theo_message_stream` (v4 sidecar `vaultgpt-func-stream`) | ✅ DONE (deployed+verified) | **D2-Stream** | `dottie_message_stream` on new v4 sidecar `vaultgpt-func-dottie-stream`; gpt-5 `chat/completions` `stream:true`; OpenAI-shape SSE; 45-chunk stream + persistence-parity verified |
| Last-opened restore ordering | `theo_get/list` `last_opened_at` | ✅ DONE | **D2** | present in D1 schema + list/get |
| Star / pin a conversation | `theo_star_conversation` + `starred` col | 🟡 PLANNED | D2b | `starred` column already in D1; needs the toggle handler |
| Rename a conversation | `theo_rename_conversation` | 🟡 PLANNED | D2b | title update handler |
| Delete a conversation | `theo_delete_conversation` | 🟡 PLANNED | D2b | owner-scoped delete + cascade |
| Empty-turn guard | stream/message guard | ✅ (built into D2/D2-Stream) | D2 | non-empty last-user-message check present |

## 2. Memory

| Theo capability | Theo surface | Dottie status | Dottie phase | Adaptation vs Theo |
| --- | --- | --- | --- | --- |
| L1 personal memory — distilled profile injected each turn | `theo_user_memory` + injection | 🟡 PLANNED (read wired in D2) | **D3** | **Dottie-L1** = `dottie_user_memory` (consensual 1:1, SEPARATE from Theo's L1 — never crosses); read-injection already in D2; **write/CRUD + distillation timer = D3** |
| Auto-distillation of memory from conversations | distill timer | 🟡 PLANNED | **D3** | Dottie-L1 distiller (own timer) |
| History-RAG — recall from past conversations | `theo-messages` Azure AI Search (B7b-2) | ⚪ DEFERRED | D-RAG | needs an embed+search index for `dottie_messages`; second-opinion quality benefit — later |
| Multi-layer memory (level / firm / governance) | — (Theo has only L1) | 🟡 PLANNED | **D5** | **Dottie-L2** (level) + **Dottie-L3** (firm/governance) — Dottie-specific, no Theo equivalent |
| Engine-gated reads of the SHARED memory (L1.5/L2/L3) | access-policy engine `theo_can_read` / `theo_get_project_context_item` | 🟡 PLANNED | **D5** | Dottie READS Theo's shared layers via the engine, never duplicates; NEVER reads Theo's L1 |

## 3. Attachments & media

| Theo capability | Theo surface | Dottie status | Dottie phase | Adaptation vs Theo |
| --- | --- | --- | --- | --- |
| File attachments (PDF/image native; Office/CSV/TXT extract) | `theo_*` attachments (B8), blob `theo-content` | ⚪ DEFERRED | D-Attach | second-opinion "review this doc" is a strong use case → likely worth adding; own `dottie-content` container |
| Reload parity (message_seq chips) | B8i `message_seq` | ⚪ DEFERRED | D-Attach | with attachments |
| Media persist / re-sign on read (SAS) | media resign | ⛔ N/A (until attachments) | — | only if attachments land |

## 4. Projects & sharing

| Theo capability | Theo surface | Dottie status | Dottie phase | Adaptation vs Theo |
| --- | --- | --- | --- | --- |
| Projects CRUD + knowledge + conv↔project wiring | `theo_*` projects (B4) | ⛔ N/A | — | Dottie is personal + governance, not a project workspace; **intentionally omitted** (this is why D2 gates on `created_by`, not SPW `conversation_access`) |
| Shared Project Workspace (roster/presence/visibility) | SPW (B5) | ⛔ N/A | — | no project-sharing in Dottie |

## 5. Tools & grounding

| Theo capability | Theo surface | Dottie status | Dottie phase | Adaptation vs Theo |
| --- | --- | --- | --- | --- |
| General-chat tool-loop | `func-theo-tools` tool-loop | ⚪ DEFERRED | D-Tools | a governance/second-opinion tool-loop (own `dottie-tools` app) could add real value; later |
| Web search / web fetch | server tools (dynamic filter) | ⚪ DEFERRED | D-Tools | useful for second-opinion fact-checks; later |
| find_image / find_video | `theo_find_image` / `theo_find_video` | ⛔ N/A | — | not core to governance/second-opinion |
| Tool-activity live UI | tool-activity stream | ⚪ DEFERRED | D-Tools | with tool-loop |

## 6. Interaction & UX (frontend)

| Theo capability | Theo surface | Dottie status | Dottie phase | Adaptation vs Theo |
| --- | --- | --- | --- | --- |
| Chat console (send/stream/history) | Theo FE | ✅ DONE (dev SWA) | **D4** | Dottie console on brave-dune; streaming + history + composer; DISTINCT ink/serif/gold identity |
| "Watch it work" live-thinking UI | adaptive thinking panel | 🟡 PARTIAL | D4 | logo animates + "thinking…" while streaming; richer thinking panel later |
| Streaming status words | B9-FE status words | 🟡 PARTIAL | D4 | "thinking…" present; playful status words later |
| Markdown rendering | Theo FE (react-markdown) | 🟡 PARTIAL | D4 | markdown-lite (bold/code/lists/paras) shipped; full react-markdown a fine-tune |
| Voice I/O — dictation (Whisper STT) + read-aloud | `func-chat` Whisper | ⚪ DEFERRED | D-Voice | copy after core FE |
| Logo / branding animation | Spiral of Theodorus (constructing) | ✅ DONE | D4 | **DottieSpiral** — full shell + centre dot; DECONSTRUCTS outer→dot then rebuilds; wedge geometry byte-verbatim |
| Mobile layout | Theo FE mobile | 🟡 PARTIAL | D4b | responsive (sidebar collapses <720px); mobile-dominant polish later |
| Federated remote mounted in VO shell | Theo remote in vault-origin | 🟡 NEXT | **D4-mount** | client is federation-ready (`window.__DOTTIE_CONFIG__`); VO-side mount (module-federation remote + app rail) is the follow-on cross-repo step |
| Login gate (employees only) | `vault-origin` employeeId gate | ✅ (inherited via VO host) | D4 | VO host gates; Dottie mounts inside |

## 7. Notifications & platform

| Theo capability | Theo surface | Dottie status | Dottie phase | Adaptation vs Theo |
| --- | --- | --- | --- | --- |
| Web Push chat notifications | `push_subscriptions` + sender (VAPID) | ⚪ DEFERRED | D-Push | copy the pattern with `dottie_*` subscriptions |
| Operating Ruleset (anti-hallucination, real-time gate) | Theo Operating Ruleset v1.2 | 🟡 PLANNED | **D5** | **Dottie Observational Ruleset** — governance-observer variant (also the anti-hallucination/uncertainty discipline for the second-opinion role) |
| Own Function App on EP1 (keyless MI) | `func-*` apps | ✅ DONE | D0 | `vaultgpt-func-dottie` (+ `vaultgpt-func-dottie-stream` at D2-Stream deploy) |
| Postgres schema + RLS + exists-helpers | `theo_*` tables | ✅ DONE | **D1** | `dottie_conversations`/`dottie_messages`/`dottie_user_memory` (+ RLS + `_exists_unscoped`) |

## 8. Dottie-only extensions (no Theo equivalent)

| Capability | Dottie phase | Note |
| --- | --- | --- |
| Second-opinion mode (substantive advice, not just mechanical governance) | D2 (persona) → matures D5 | `DOTTIE_SYSTEM_PROMPT` already frames it |
| Governance observation of the shared record (L1.5/L2/L3 drift, review-chain integrity, access anomalies) | **D5** | observational only; does NOT gate (write-time Tag Guard already gates in the engine) |
| Dottie-L2 / Dottie-L3 layered memory | **D5** | level + firm/governance layers |

---

## Build order (current)

**D0** infra ✅ · **D1** schema ✅ · **D2** conversation trio 🔵 · **D2-Stream** streaming 🔵 · **D3** Dottie-L1 CRUD + distillation 🟡 · **D4** FE console (distinct identity + deconstructing-spiral logo + SSE + federated mount) 🟡 · **D5** Dottie-L2/L3 + engine-gated shared-memory reads + Observational Ruleset 🟡 · then the deferred limbs (attachments, tools, voice, push, history-RAG) as prioritised.

_Last updated: 2026-08-01. **D2 trio + D2-Stream are APPROVED, DEPLOYED, and golden-curl-verified against live gpt-5.** D2 on func-dottie (Kudu-VFS; needed POSTGRES_CONNECTION_STRING + pg module added at deploy); D2-Stream on the new v4 sidecar func-dottie-stream (MI + KV grant + EasyAuth v2 + app settings mirrored; zip-deployed). Endpoints recorded in `DOTTIE_API_SPEC.md` (Role-C, G-APISPEC closed). Backend parity for conversation core is COMPLETE. Next: D3 (Dottie-L1 write/distillation) and D4 (FE console + deconstructing-spiral logo + federated mount)._
