# THEO PHASE 1A — FRONTEND EXECUTION PLAN

Scope: Vault Theo frontend, Phase 1A. The **governed phase plan** that decomposes 1A into microsteps (passes) and is the authority Pass-1 Frontend VEPs ground against at F-P1 (feature identification).
Filename / location: `governance/THEO_PHASE_1A_FRONTEND_PLAN.md`.

> **Status: v0.1 — LIVING DOCUMENT.** Sits on `governance/THEO_ARCHITECTURE_AND_STRUCTURE.md` §8.5 (production-order deliverable #2) and is the F-P1 authority named in `governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md` §4 / §4A.1. It defines the **governed 1A scope + pass sequence**; it does NOT restate *how* to productionise the surface — that engineering contract is VA-T3 (`THEO_1A_FRONTEND_HANDOVER.md`). Updated after each pass completes (architecture §8.4). Reviewer = Codex.

---

## §1 Purpose and relationship to the other 1A authorities

Phase 1A builds the **complete** Claude-for-Teams replica surface — every surface fully clickable and interactive — running against **mocked contracts** and in-memory state (architecture §8.2). This plan is where each 1A microstep is **sourced** (not inferred): a Pass-1 Frontend VEP's F-P1 cites the pass entry in §3 below.

- **VA-T1** `frontend/theo-frontend-reference.jsx` — the definitive surface to reproduce faithfully (the substrate).
- **VA-T2** `THEO_ARCHITECTURE_AND_STRUCTURE.md` — boundaries, gateway, context contract, `theo_` schema, 1A/1B seam (the why).
- **VA-T3** `THEO_1A_FRONTEND_HANDOVER.md` — the productionisation engineering contract (the how).
- **This plan** — the governed scope + pass sequence (the what/when).

## §2 Per-surface scope — real-in-1A vs true-in-1B (BINDING; mirrors VA-T3 §3)

Every surface is **built and fully interactive in 1A**. No surface is deferred. Per surface: "real in 1A" (all visual + interaction behaviour) vs "true in 1B" (persistence, RLS, retrieval, live gateway).

| Surface | Real in 1A | True in 1B |
|---|---|---|
| Chats | Full chat UI, composer, streaming-style loading, markdown rendering, starters, greeting | Live Foundry-Claude via real gateway; conversation persistence + reload |
| Recents | List, search-filter, click | Real conversation history from `theo_conversations` |
| Projects | Create, list, open, edit instructions, add/remove knowledge, "start chat in project" | Persistence; knowledge RAG retrieval (Azure AI Search) replacing full-text inject |
| Project knowledge | Add/remove/list, injected into mock system prompt | Indexed + top-k retrieval at system-prompt assembly seam, RLS-scoped |
| Artifacts | Marker-parsed, versioned (reuse title → v2…), gallery, side panel (doc/code/html), copy | Persistence (Blob + Postgres index) surviving reload |
| Customize | Style presets, custom instructions, save feedback, fed into system prompt | Persisted to `theo_user_settings`, applied server-side |
| App-context chip | Received from Origin, shown in header, carried on conversation | Drives 1B tool-dispatch (Theo reads app via its API as the user) |

## §3 Pass sequence (the microsteps; each is sourced here at F-P1)

Phase 1A is delivered in governed passes. Each pass runs the full loop: Pass-1 Frontend VEP → Codex Pass 2 → Pass 3 implementation + Walter SWA acceptance → (Role-C if drift). Passes are ordered; later passes build on merged earlier ones.

| Pass | Microstep | Scope (VA-T3 refs) | Touches | Status |
|------|-----------|--------------------|---------|--------|
| **Pass A** | Productionise the shell | Lift + componentize into `TheoShell` (faithful); single service/contracts module; **mocked gateway** abstraction (no direct browser→model call); no browser storage; SWAP BLOCK Theo-branded (surgical). VA-T3 §2.1/§2.2/§2.3/§2.5/§5 | `vault-theo` only | **Done** — merged + Walter SWA-accepted |
| **Pass B** | Theo-in-Origin mount + app-context | Mount Theo **inside the Origin shell** (architecture §3A; VA-T3 §4): Theo nav as a permanent collapsible 1/10 section (below Vault Files, above Vault Origin Apps); Theo main as the Origin 9/10 landing surface; app-sidebar stacking; in-app right-hand Theo panel via a 9/10 "Open Theo" toggle (VS Code idiom); in-shell **Module Federation** (no iframe, App Host Contract §1A) — decompose the Pass-A `TheoShell` into mountable nav + main surfaces and expose them as federated module(s). App-context: Origin broadcasts `{app_key, app_context}` in-process via `AppHostContext`; Theo carries it on the conversation and surfaces the anchor (presentational, no app-data fetch). VA-T3 §2.4/§4; architecture §3A | `vault-theo` + `vault-origin` (additive) | **Done** — merged + Walter SWA-accepted (vault-theo Pass B decomposition/federation + vault-origin VO-AH-Theo persistent mount) |
| **Pass C** | Acceptance & polish | Keyboard/focus a11y polish; assemble Pass-3 Visual Acceptance Evidence; confirm 1A "done" against §5 (VA-T3 §7). | `vault-theo` | **Done** — merged + Walter SWA-accepted 2026-06-25 (shell reskin + per-column header, hosted nav-fit, nav-controls width cap, warm 9/10 landing, left-panel accordion, auth-logo aspect) |
| **Apps Phase B — B1** | Mobile chrome contract (TheoSurface) | Add two OPTIONAL props to the federated `theoApp/TheoSurface` remote so the Vault Origin mobile shell owns a single top bar and can trigger Theo new-chat: `suppressNarrowHeader?: boolean` (TheoMain suppresses its own main-view header on narrow viewports ≤767.98px so the Origin host bar is the single mobile header — VISUAL-AUTHORITY-DEVIATION, VA-T6 §4.1) and `newChatNonce?: number` (on change calls the existing in-memory `useTheoState` `newChat()`). Additive + backward-compatible (absent ⇒ current behaviour); wide-viewport surface unchanged; no gateway / tool-dispatch / app-context change. VA-T4 (§3A mount model, unchanged) + VA-T6 (§4.1 narrow hosted surface). | `vault-theo` (Vault Origin host consumes the props in the separate package B2) | Planned |

**Sourcing rule (F-P1):** a Pass-1 Frontend VEP MUST cite its pass row here. New passes are added to this table by a Role-C update before their VEP is authored; a pass is never inferred.

## §4 Backend-dependency classification (per surface; 1A)

All 1A surfaces build against **mocked contracts** behind the single service module (VA-T3 §2.3). Per `spec/THEO_API_SPEC.md` §2, every contract is `1A-contract` (mock/in-memory) with a named `1B-deployed` backing (`theo_*` handlers, authored in Phase 1B). **No 1A surface has a real backend dependency**; nothing in 1A may block on a deployed endpoint. **No `corporate-reporting` dependency in 1A** (app-action tools are 1B; architecture §1.3/§4).

## §5 Acceptance criteria — 1A "done" (VA-T3 §7)

1. Full surface renders in `vault-theo`, visually faithful to VA-T1.
2. Every surface interactive: chat (mock gateway), Projects CRUD + knowledge, Artifacts create/version/panel, Customize.
3. Every backend-bound call through a **single service/contracts module** (no scattered inline fetches), each mocked.
4. The model call through a **gateway abstraction** (mock in 1A), never a direct browser→Anthropic/Foundry call.
5. The **app-context chip** receives `{app_key, app_context}` from Origin and displays the anchor; value carried on the conversation.
6. No browser storage; no Tailwind conversion; no Reporting changes.
7. SWAP BLOCK intact and centralised.
8. Theo is **mounted in the Origin shell** per architecture §3A: nav as a permanent collapsible 1/10 section (below Vault Files, above Vault Origin Apps), main as the Origin 9/10 landing surface, an in-app right-hand Theo panel, via in-shell Module Federation (no iframe).

These map across the passes: Pass A delivers 1, 2, 3, 4, 6, 7; Pass B delivers 5 and 8; Pass C confirms the whole and produces Visual Acceptance Evidence.

## §6 Boundaries / guardrails (BINDING — VA-T3 §6; FE Governor §6)

No direct browser→model call (gateway abstraction only); no `localStorage`/`sessionStorage`; no Tailwind/CSS-in-JS conversion of the surface; no `corporate-reporting` or `reporting_*` change; `vault-origin` changes are additive only (Pass B); no real persistence/RAG/RLS/live gateway in 1A (Phase 1B); no surface redesign — reproduce VA-T1 faithfully.

## §7 Living-document discipline

This plan is updated after each pass completes (status column; new passes; per-surface refinements) via Role-C, in step with the Phase 1B plan and the three authority docs (Theo API Spec, Theo Azure Postgres Schema, Theo Golden Handler Standard) as 1B lands (architecture §8.4/§8.5).
