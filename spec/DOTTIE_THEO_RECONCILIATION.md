# Dottie ↔ Theo — Complete FE↔Backend Reconciliation (endpoint-level truth)

**Why this exists.** The Dottie FE is a byte-verbatim transplant of Theo's FE, so **every** Theo feature/button is present and calls its endpoint. But Dottie's backend only serves the core chat. So features whose backend doesn't exist **error the moment they're used** (e.g. delete conversation). This is the authoritative, endpoint-by-endpoint audit so gaps are KNOWN, not stumbled into. It supersedes the looser `DOTTIE_THEO_PARITY_LEDGER.md` gap lists.

**Legend — Backend status:** ✅ LIVE (dottie_* deployed) · ❌ MISSING (FE calls it, no Dottie backend → ERRORS) · ⛔ N/A (not for Dottie).
**Disposition:** BUILD (own `dottie_*`) · REUSE (call an existing shared Theo endpoint) · DECIDE (needs Walter's scope call) · N/A.

## A. Core chat — ✅ LIVE (4)
| FE call | Dottie backend | Status |
| --- | --- | --- |
| `dottie_message_stream` (POST, stream) | func-dottie-stream | ✅ LIVE (+ web_search grounding) |
| `dottie_message` (POST) | func-dottie | ✅ LIVE |
| `dottie_list_conversations` (GET) | func-dottie | ✅ LIVE |
| `dottie_get_conversation` (GET) | func-dottie | ✅ LIVE |

## B. Conversation management — ❌ MISSING (these error today)
| FE call (Theo name) | What breaks | Disposition |
| --- | --- | --- |
| `theo_delete_conversation` | **Delete chat errors** (Walter hit this) | BUILD `dottie_delete_conversation` |
| `theo_rename_conversation` | Rename errors | BUILD `dottie_rename_conversation` |
| `theo_set_conversation_starred` | Star/pin errors | BUILD `dottie_set_conversation_starred` (col already in D1) |
| `theo_publish_conversation` / `theo_unpublish_conversation` | SPW publish — errors | DECIDE (Dottie has no SPW → likely N/A; hide the control) |
| `theo_set_conversation_project` | Assign-to-project — errors | DECIDE (tied to Projects, §E) |

## C. People / roster — ❌ MISSING
| FE call | What breaks | Disposition |
| --- | --- | --- |
| `theo_list_people` | Greeting name + invite picker (best-effort; degrades) | REUSE Theo's (shared org roster) or BUILD `dottie_list_people` |

## D. Attachments — ❌ MISSING (5)
| FE call | What breaks | Disposition |
| --- | --- | --- |
| `theo_create_attachment_upload` / `theo_finalize_attachment` / `theo_delete_attachment` / `theo_list_conversation_attachments` | File upload / PDF+image analysis — the paperclip errors | BUILD `dottie_*` attachments + `dottie-content` blob (mirror Theo B8) |

## E. Projects — ❌ MISSING (14) — **DECISION NEEDED**
| FE calls | What breaks | Disposition |
| --- | --- | --- |
| `theo_create_project`, `theo_update_project`, `theo_delete_project`, `theo_list_projects`, `theo_list_project_conversations`, `theo_add_project_knowledge(+_file)`, `theo_list_project_knowledge`, `theo_remove_project_knowledge`, `theo_list_project_members`, `theo_share_project`, `theo_unshare_project`, `theo_set_project_visibility`, `theo_get_or_create_review_project` | The **Projects** tab + all project features error | **DECIDE:** does Dottie have Projects? Earlier design said Dottie = personal + governance, no project-sharing (SPW N/A). If NO → hide the Projects tab; if YES → a large backend build (mirror Theo B4/B5) |

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
- **Live:** 4 core-chat endpoints + web-search grounding.
- **Missing & errors today:** conversation-management (delete/rename/star), people, attachments (5), artifacts-persist (3), voice (2), image/video tools.
- **Decision needed:** Projects (14 endpoints) and publish/SPW — does Dottie have them, or hide the controls?

**Honest status: Dottie does NOT yet match Theo at the backend — only core chat + grounding work.** Closing this is a sequenced set of governed backend packages (each `dottie_*` mirroring the Theo original), tracked here. The FE controls for missing features should be **gated/hidden** until their backend lands, so nothing errors.

_Reconciled 2026-08-01 by direct FE-gateway grep vs deployed func-dottie functions._
