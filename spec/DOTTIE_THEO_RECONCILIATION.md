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
| `dottie_list_people` (GET) | ListPeople package (Graph OBO; func-dottie) | ✅ LIVE end-to-end (backend golden curls green: `200` roster of 9, self first; `401` unauth). FE un-gated (`DOTTIE_CAPABILITIES.people = true`); **FE gateway repointed `theo_list_people`→`dottie_list_people` 2026-08-01** (corrected a flip-without-repoint bug where the FE was still calling `theo_list_people`). |

## D. Attachments — ✅ LIVE (Attachments-Schema + Attachments-Handlers packages, deployed 2026-08-01)
| FE call (now) | Backend | Status |
| --- | --- | --- |
| `dottie_create_attachment_upload` / `dottie_finalize_attachment` / `dottie_delete_attachment` / `dottie_list_conversation_attachments` | `dottie_attachments` table + `dottie-content` blob (`vaultgptdottiestore`); Attachments packages | ✅ LIVE — deployed + backend golden-curl round-trip green (create→SAS PUT→finalize/extract→list→delete; 400/404/401 fail-closed). FE un-gated (`DOTTIE_CAPABILITIES.attachments = true`); **FE gateway repointed the 4 `theo_*` attachment routes → `dottie_*` 2026-08-01** (corrected a flip-without-repoint bug where the FE still called `theo_*` and would 404 on real upload). |

## E. Projects — ❌ MISSING (14) — **DECISION NEEDED**
| FE calls | What breaks | Disposition |
| --- | --- | --- |
| `theo_create_project`, `theo_update_project`, `theo_delete_project`, `theo_list_projects`, `theo_list_project_conversations`, `theo_add_project_knowledge(+_file)`, `theo_list_project_knowledge`, `theo_remove_project_knowledge`, `theo_list_project_members`, `theo_share_project`, `theo_unshare_project`, `theo_set_project_visibility`, `theo_get_or_create_review_project` | The **Projects** tab + all project features error | **DECIDED (Walter 2026-08-01): HIDE Projects for now** — not visible in the UI (gate the Projects nav + project controls); may add the capability later. No backend build now. |

## F. Artifacts — ✅ LIVE (Artifacts-Schema + Artifacts-Handlers packages, deployed 2026-08-01)
| FE call (now) | Backend | Status |
| --- | --- | --- |
| `dottie_upsert_artifact` / `dottie_list_artifacts` / `dottie_get_artifact` | `dottie_artifacts` + `dottie_artifact_versions` + `dottie-content` blob (MI-token; no SAS); Artifacts packages | ✅ LIVE — deployed + golden-curl round-trip green (upsert v1→v2 version bump + type-change; list metadata-only; get versions ASC content-hydrated from Blob; 400/404/401 fail-closed). FE un-gated (`DOTTIE_CAPABILITIES.artifactsPersistence = true`). |

## G. Voice I/O — ❌ MISSING (2)
| FE call | What breaks | Disposition |
| --- | --- | --- |
| `theo_transcribe_audio`, `theo_synthesize_speech` | Mic dictation + read-aloud error | BUILD `dottie_*` voice or REUSE func-chat (Whisper) |

## H. Grounding / tools
| Capability | Status | Disposition |
| --- | --- | --- |
| Web search (internet grounding) | ✅ LIVE (gpt-5 Responses-API `web_search`, server-side, cited) | done (citation *fidelity* → CitedText is the next FE package) |
| Image fetch (`find_image`) | ✅ LIVE (Media-Tools package, deployed 2026-08-02) | gpt-5 Responses-API function tool + bounded tool loop in `dottie_message_stream`, reusing deployed func-theo-tools `theo_find_image` via a **client-credentials** call (Dottie has no user token to forward — app-identity ALLOWED DELTA vs Theo's user-delegated forward). Emits `event: vault_image` (proxy blob-SAS URLs + gallery) the transplanted FE already renders. Golden green: `tool_result{ok:true}` (G-AUTH), gallery + caption, no URL pasted. |
| Video fetch (`find_video`) | ✅ LIVE (Media-Tools package, deployed 2026-08-02) | same loop; reuses deployed func-theo-tools `theo_find_video`; emits `event: vault_video` (`youtube-nocookie` embed + thumbnail). Golden green. |
| `sigma_review_agent_stream` | ⛔ N/A | Sigma-specific |

## I. FE render parity — ✅ LIVE (Markdown-Lists package, deployed 2026-08-02)
| Concern | Status | Disposition |
| --- | --- | --- |
| Markdown list markers standalone | ✅ FIXED (dev SWA `brave-dune-0a97c7d03`) | `src/theo/lib/markdown.tsx` `Formatted` now asserts `listStyleType` (`disc`/`decimal`) + `listStylePosition: "outside"` on `ul`/`ol`. Tailwind Preflight (`@tailwind base`) resets `list-style: none`; the byte-verbatim transplant relied on ambient host CSS to restore markers, which standalone Dottie lacks — so enumerations rendered marker-less. The renderer now supplies its own markers, rendering identically standalone or mounted. Render-parity restoration over VA-T1, not a redesign. **Paired with the backend Format-Directive package** (makes gpt-5 *emit* rich Markdown); both are required for full Theo-level richness. Theo carries the same latent standalone gap (masked by its VO mount) — a separate vault-theo package if ever needed. |

## Summary
- **Live:** 4 core-chat endpoints + web-search grounding + conversation-management (rename/delete/star — ConvMgmt) + people roster (`dottie_list_people`) + attachments (create/finalize/delete/list + `dottie-content` blob) + **artifacts persistence (upsert/list/get + versions + `dottie-content` blob — Artifacts packages, FE un-gated)**. FE gate/hide package deployed (Projects nav hidden; voice controls gated) so nothing errors on click; the Artifacts nav is now un-hidden (`artifactsPersistence = true`).
- **Missing & errors today:** voice (2). *(image/video tools LANDED 2026-08-02 — Media-Tools package.)*
- **DECIDED:** Projects (14) + publish/SPW → HIDE in the UI (revisit later). Everything else → BUILD every missing `dottie_*` backend now, replicating from Theo (Walter 2026-08-01).

**Honest status: core chat + grounding + conversation-management + people roster + attachments + artifacts persistence + image/video tools are LIVE; only voice is still to build.** Closing the rest is a sequenced set of governed backend packages (each `dottie_*` mirroring the Theo original), tracked here. The FE controls for still-missing features stay **gated/hidden** until their backend lands, so nothing errors.

_Reconciled 2026-08-01 by direct FE-gateway grep vs deployed func-dottie functions; conv-management moved to LIVE 2026-08-01 after the ConvMgmt package deploy + golden curls. §I FE render-parity (Markdown list markers) added 2026-08-02 after the Markdown-Lists FE package deploy + bundle verification._
