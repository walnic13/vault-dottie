# Dottie ↔ Theo — Complete FE↔Backend Reconciliation (endpoint-level truth)

**Why this exists.** The Dottie FE is a byte-verbatim transplant of Theo's FE, so **every** Theo feature/button is present and calls its endpoint. Dottie's backend serves core chat (live) + conversation-management (live); the rest is still missing. So features whose backend doesn't exist **error the moment they're used**. This is the authoritative, endpoint-by-endpoint audit so gaps are KNOWN, not stumbled into. It supersedes the looser `DOTTIE_THEO_PARITY_LEDGER.md` gap lists.

**Legend — Backend status:** ✅ LIVE (dottie_* deployed) · ❌ MISSING (FE calls it, no Dottie backend → ERRORS) · ⛔ N/A (not for Dottie).
**Disposition:** BUILD (own `dottie_*`) · REUSE (call an existing shared Theo endpoint) · DECIDE (needs Walter's scope call) · N/A.

## A. Core chat — ✅ LIVE (4)
| FE call | Dottie backend | Status |
| --- | --- | --- |
| `dottie_message_stream` (POST, stream) | func-dottie-stream | ✅ LIVE (+ web_search grounding) |
| `dottie_message` (POST) | func-dottie | ✅ LIVE |
| `dottie_list_conversations` (GET) | func-dottie | ✅ LIVE |
| `dottie_get_conversation` (GET) | func-dottie | ✅ LIVE |

## B. Conversation management — ✅ LIVE (ConvMgmt package, deployed 2026-08-01)
The FE calls the `dottie_*` routes below; the handlers are deployed to func-dottie (Codex Pass-2 APPROVED → Kudu VFS deploy, GET-back byte-identical, restart → golden curls green). Contracts + curl matrix in `DOTTIE_API_SPEC.md § Conversation management`.
| FE call (now) | Backend | Status |
| --- | --- | --- |
| `dottie_rename_conversation` (POST) | ConvMgmt package | ✅ LIVE (rename `200`; empty-title `400`) |
| `dottie_delete_conversation` (POST) | ConvMgmt package | ✅ LIVE (delete `200`; get-after `404` cascade) |
| `dottie_set_conversation_starred` (POST) | ConvMgmt package | ✅ LIVE (star `200`; absent-uuid `404`) |
| `theo_publish_conversation` / `theo_unpublish_conversation` | — | ⛔ N/A — HIDE (no SPW in Dottie) |
| `theo_set_conversation_project` | — | ⛔ N/A — HIDE (Projects hidden) |

## C. People / roster — ✅ backend LIVE (ListPeople package, deployed 2026-08-01)
| FE call (now) | Backend | Status |
| --- | --- | --- |
| `dottie_list_people` (GET) | ListPeople package (Graph OBO; func-dottie) | ✅ backend LIVE (golden curls green: `200` roster of 9, self first; `401` unauth). FE un-gate (`DOTTIE_CAPABILITIES.people`) lands with gate/hide. |

## D. Attachments — ❌ MISSING (5)
| FE call | What breaks | Disposition |
| --- | --- | --- |
| `theo_create_attachment_upload` / `theo_finalize_attachment` / `theo_delete_attachment` / `theo_list_conversation_attachments` | File upload / PDF+image analysis — the paperclip errors | BUILD `dottie_*` attachments + `dottie-content` blob (mirror Theo B8) |

## E. Projects — ❌ MISSING (14) — **DECISION NEEDED**
| FE calls | What breaks | Disposition |
| --- | --- | --- |
| `theo_create_project`, `theo_update_project`, `theo_delete_project`, `theo_list_projects`, `theo_list_project_conversations`, `theo_add_project_knowledge(+_file)`, `theo_list_project_knowledge`, `theo_remove_project_knowledge`, `theo_list_project_members`, `theo_share_project`, `theo_unshare_project`, `theo_set_project_visibility`, `theo_get_or_create_review_project` | The **Projects** tab + all project features error | **DECIDED (Walter 2026-08-01): HIDE Projects for now** — not visible in the UI (gate the Projects nav + project controls); may add the capability later. No backend build now. |

## F. Artifacts — ❌ MISSING (3)
| FE call | What breaks | Disposition |
| --- | --- | --- |
| `theo_list_artifacts`, `theo_get_artifact`, `theo_upsert_artifact` | Artifact **persistence** errors (the [[ARTIFACT]] rendering in a reply still works — it's text-parsed; only saving/gallery needs backend) | BUILD `dottie_*` artifacts (mirror Theo) |

## G. Voice I/O — ❌ MISSING (2)
| FE call | What breaks | Disposition |
| --- | --- | --- |
| `theo_transcribe_audio`, `theo_synthesize_speech` | Mic dictation + read-aloud error | BUILD `dottie_*` voice or REUSE func-chat (Whisper) |

## H. Grounding / tools
| Capability | Status | Disposition |
| --- | --- | --- |
| Web search (internet grounding) | ✅ LIVE (gpt-5 Responses-API `web_search`, server-side, cited) | done (citation *fidelity* → CitedText is the next FE package) |
| Image fetch (`find_image`) | ❌ not wired | BUILD/REUSE func-theo-tools `theo_find_image` (SerpAPI; built for reuse) via a gpt-5 function-call |
| Video fetch (`find_video`) | ❌ not wired | REUSE func-theo-tools `theo_find_video` |
| `sigma_review_agent_stream` | ⛔ N/A | Sigma-specific |

## Summary
- **Live:** 4 core-chat endpoints + web-search grounding + conversation-management (rename/delete/star — ConvMgmt package) + people roster (`dottie_list_people` — ListPeople package; FE un-gate lands with gate/hide).
- **Missing & errors today:** attachments (5), artifacts-persist (3), voice (2), image/video tools.
- **DECIDED:** Projects (14) + publish/SPW → HIDE in the UI (revisit later). Everything else → BUILD every missing `dottie_*` backend now, replicating from Theo (Walter 2026-08-01).

**Honest status: Dottie does NOT yet fully match Theo at the backend — core chat + grounding + conversation-management are live; people, attachments, artifacts, voice, and image/video are still to build.** Closing this is a sequenced set of governed backend packages (each `dottie_*` mirroring the Theo original), tracked here. The FE controls for still-missing features should be **gated/hidden** until their backend lands, so nothing errors.

_Reconciled 2026-08-01 by direct FE-gateway grep vs deployed func-dottie functions; conv-management moved to LIVE 2026-08-01 after the ConvMgmt package deploy + golden curls._
