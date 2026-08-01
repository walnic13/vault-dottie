# THEO PHASE 1A — FRONTEND HANDOVER PACK
**Version: 0.1 — for Claude Code**
**Repo: `vault-theo` · dedicated development branch only**
**Reads with: `THEO_ARCHITECTURE_AND_STRUCTURE.md` (the foundation; rules and boundaries live there)**

---

## 0. What this pack is

This pack hands Claude Code a **complete, working visual surface** and asks it to **productionise** that surface inside `vault-theo` — not to design or regenerate it. The look is already settled and approved; the engineering task is to lift it into a real repo, wire its seams to contracts, and add the one thing the surface doesn't yet have (app-context awareness).

Two files in this pack:

1. **`theo-frontend-reference.jsx`** — the **definitive surface**. This is the exact, approved Claude-for-Teams replica: sidebar (Chats / Projects / Artifacts / Customize), live chat, Projects with instructions + knowledge, versioned Artifacts in a side panel, Customize style/instructions. **Reproduce this surface faithfully. Do not redesign it.**
2. **This handover guide** — how to productionise the reference: repo placement, the contract seams, the gateway swap, the app-context layer, the 1A↔1B boundary, and acceptance criteria.

### 0.1 Fidelity note (important — low risk)

The reference has **zero external style dependencies**: no Tailwind, no web fonts, no CSS framework. It uses inline styles, one vanilla `<style>` block, a JS colour object (`C`), and **system font stacks** (`SANS` / `SERIF` / `MONO`). It imports only `react`. Consequence: it renders near-identically in any React 18 environment. Preserve this property — **do not** convert the styling to Tailwind or a CSS-in-JS library during 1A. Keep the inline-style approach so the approved surface is reproduced exactly. Refactoring the styling system is explicitly out of scope for 1A.

---

## 1. Repo placement & boundary (BINDING)

- All 1A work lands in **`vault-theo`**, on its **dedicated dev branch** only.
- `vault-origin`: additive change only — the context-broadcast wiring (§4) and the Theo surface mount point. No refactor of existing Origin behaviour without explicit Walter approval.
- `corporate-reporting`: **do not touch.** 1A frontend needs nothing from it. (App-action tools are a 1B concern.)

Full boundary rules: `THEO_ARCHITECTURE_AND_STRUCTURE.md` §1.

---

## 2. Productionisation steps

### 2.1 Lift the reference into the repo

- Bring `theo-frontend-reference.jsx` into `vault-theo` as the Theo surface. Component is currently `VaultOriginShell`; rename to your repo convention (e.g. `TheoShell`).
- You **may** split the monolith into components (`Sidebar`, `ChatView`, `ProjectsView`, `ProjectDetail`, `ArtifactsView`, `Customize`, `ArtifactPanel`, shared `Formatted`/icons) for maintainability — **provided the rendered surface is unchanged.** Splitting is encouraged; visual drift is not. If in doubt, keep it monolithic for 1A and split in a later refactor.
- Keep the **SWAP BLOCK** at the top intact and centralised (see §5).

### 2.2 The gateway seam (replace the sandbox fetch)

The reference calls the model **directly** from the browser:

```js
// reference, lines ~197–203 — sandbox-only
const res = await fetch("https://api.anthropic.com/v1/messages", { ... });
```

This worked only in the artifact sandbox. **In `vault-theo`, replace it with a call to the vault-theo server-side gateway** — a `vault-theo` backend endpoint (e.g. `POST /api/theo/message`) that holds Foundry credentials via **Entra managed identity (keyless)** and brokers the model call. The browser never holds a credential and never calls Anthropic/Foundry directly.

- In 1A the gateway can be a **mock/stub** returning canned or proxied responses so the surface is fully exercised; the real gateway is 1B.
- The request/response contract the frontend codes against is the **standard Anthropic Messages API shape** (so nothing changes when the real Foundry-backed gateway lands behind it). Preserve the existing response handling: `data.content` → filter `type === "text"` → join.
- Preserve the artifact-marker parsing (`parseArtifacts`, the `[[ARTIFACT ...]]` protocol) exactly — it's how the side panel populates.

Gateway rationale and properties: `THEO_ARCHITECTURE_AND_STRUCTURE.md` §2.

### 2.3 Contracts vs mocks

1A builds against **contracts**, with state in-memory / mocked. The contracts to define (thin, request/response only — they become 1B's API Spec):

- **Chat:** send message → assistant reply (Messages API shape, via the gateway).
- **Projects:** list / create / patch instructions / add + remove knowledge.
- **Artifacts:** create (from markers) / list / fetch version. Versioning by reused title.
- **Settings (Customize):** read / write style preset + custom instructions.

Keep the reference's in-memory implementations as the 1A mock layer, but **route them through a single contracts/services module** (not scattered inline), so 1B can swap each mock for a real call with no surface change. This is the most important structural move in 1A: **isolate every backend-bound call behind a service boundary now.**

### 2.4 The app-context layer (the one genuinely new piece)

The reference is app-unaware. Theo on the Origin surface must know which app + anchor is open (context-only — see architecture §3).

- Accept an inbound context from Origin: `app_key` (string | null) + `app_context` (opaque object, e.g. `{ workpaper_id, period_id }`). NULL = Origin-level general chat.
- Persist it onto the conversation model (1A: in-memory; 1B: `theo_conversations.app_key` / `app_context`).
- **Surface it visually** by reusing the existing header-chip idiom: the reference already renders a removable **project chip** in the chat header (reference ~line 337). Render an **app-context chip** the same way (e.g. "Corporate Reporting · Workpaper") so the user sees what Theo is anchored to.
- 1A does **not** fetch app data. Theo reading the workpaper is a 1B tool-dispatch concern (Theo calls the Reporting API as the user). In 1A the chip is presentational + carried on the conversation.

### 2.5 No browser storage

Per the artifact environment and enterprise posture: **no `localStorage` / `sessionStorage`.** All 1A state is React state / in-memory. Persistence is 1B (Postgres).

---

## 3. Per-surface scope — real-in-1A vs true-in-1B

Every surface is **built and fully interactive in 1A.** This table marks what is genuinely working in 1A versus what only becomes durable/real in 1B. (No surface is deferred.)

| Surface | Real in 1A (build now) | True in 1B (backend) |
|---|---|---|
| **Chats** | Full chat UI, composer, streaming-style loading, markdown rendering, starters, greeting | Live Foundry-Claude via real gateway; conversation persistence + reload |
| **Recents** | List, search-filter, click | Real conversation history from `theo_conversations` |
| **Projects** | Create, list, open, edit instructions, add/remove knowledge, "start chat in project" | Persistence; knowledge **RAG retrieval** (Azure AI Search) replacing full-text inject |
| **Project knowledge** | Add/remove/list, injected into mock system prompt | Indexed + top-k retrieval at system-prompt assembly seam, RLS-scoped |
| **Artifacts** | Marker-parsed from replies, versioned (reuse title → v2…), gallery, side panel (doc/code/html), copy | Persistence (versioned in Blob, indexed in Postgres) surviving reload |
| **Customize** | Style presets, custom instructions, save feedback, fed into system prompt | Persisted to `theo_user_settings`, applied server-side |
| **App-context chip** | Received from Origin, shown in header, carried on conversation | Drives 1B tool-dispatch (Theo reads app via its API as the user) |

---

## 4. Origin-side additive work (`vault-origin`)

Theo is hosted **inside the Origin shell** as the default landing surface, not a standalone destination (architecture §3A). The additive `vault-origin` work is:

- **Theo navigation section (1/10):** a permanent, collapsible Theo section in the Origin left panel, **below Vault Files and above Vault Origin Apps**, holding Theo's navigation (Chats / Projects / Artifacts / Customize, search, recents).
- **Theo landing surface (9/10):** Theo's main view as the Origin root landing content (replacing the static welcome placeholder). When an app is opened, the app takes the 9/10 and its sidebar stacks below the Theo section.
- **In-app Theo panel:** an "Open Theo" control at the top of the 9/10 that opens Theo's chat as a resizable **right-hand split panel** while an app owns the 9/10 (the VS Code idiom).
- **Context-broadcast (in-process):** Origin passes `{ app_key, app_context }` to the mounted Theo surface via the shell `AppHostContext` (in-process props), never cross-origin `postMessage` (App Host Contract §1A). `app_key` reflects the active app (`NULL` = Origin-level general chat); `app_context` is the opaque anchor. Context-only — 1A does not fetch app data (§2.4).
- **Mount mechanism:** in-shell Module Federation (no iframe); the Origin shell consumes the Theo federated surface(s). No refactor of existing Origin behaviour beyond these additive mounts.

### 4.1 Narrow-viewport (mobile) hosted behavior (Walter-approved 2026-07-08)

This refines the hosted mount for narrow (mobile / phone) viewports, consistent with the landed Origin shell authority VO1 §2B / §10B / §12 (`corporate-reporting` VA-F1). It is realised by the Vault Origin shell responsive foundation (Origin-side) plus a narrow-viewport CSS adaptation of the Theo surface. The wide-viewport surface (VA-T1) is reproduced unchanged; the narrow rules are additive.

- **Single-column reflow.** Below a narrow-viewport breakpoint (a phone-width threshold aligned to the Origin shell breakpoint), Theo's hosted surface presents as a single full-width column: the 9/10 main view fills the viewport and Theo's nav is reached through the Origin shell's off-canvas drawer (Origin owns the drawer; Theo's nav is portaled into it). Theo's own `.vo-aside` hide rule applies only to the standalone dev harness, never to the hosted nav.
- **Host-owned mobile top bar (single header).** On narrow viewports the Vault Origin shell provides the single top bar (menu + Vault brand + one-tap new-chat); to avoid a stacked double header, Theo's own main-view header is suppressed on narrow viewports (≤767.98px) when the host sets the `suppressNarrowHeader` signal on the hosted surface. This is a viewport adaptation of VA-T1, not a redesign: the wide-viewport header is unchanged; the driving vision authority is the landed VO1 §2B / §10B / §12 and the installable-app / Claude-app mobile direction of VO1 §2C.
- **Artifact viewer as a full-screen overlay.** The versioned artifact panel, which docks beside the chat on the desktop, presents as a full-screen overlay over the chat on narrow viewports rather than a side-by-side pane (there is no room for two panes on a phone). Closing it returns to the chat.
- **Touch-first affordances.** Hover-revealed manage affordances (recents rename/delete, card actions) are presented as always-visible / tap-reachable on touch input, since touch has no hover state.
- **Faithful wide surface.** On wide viewports the VA-T1 surface is reproduced exactly; the narrow-viewport rules do not alter the wide rendered surface. This is a viewport adaptation of VA-T1, not a redesign; the driving vision authority is the landed VO1 §2B / §10B / §12.

---

## 5. The SWAP BLOCK (branding + model + endpoint)

The reference centralises swappable constants at the top (`ASSISTANT_NAME`, `WORKSPACE_NAME`, `PRODUCT_NAME`, `MODEL`, `MODEL_LABEL`, prompts). Keep this block as the single point of truth.

- The reference ships with `ASSISTANT_NAME = "Claude"` (the exact approved surface). For the Theo product, flip to `ASSISTANT_NAME = "Theo"` and `MODEL_LABEL` as desired — **one-line changes**, deliberately isolated here. Confirm with Walter whether 1A ships branded "Theo" or stays "Claude" for the visual-parity review pass.
- `MODEL` / base URL: the gateway owns the real Foundry endpoint and auth; the frontend only ever names a logical model and calls the gateway. The Anthropic base URL in the reference is sandbox-only and gets removed when §2.2 lands.

---

## 6. What NOT to do (guardrails)

- Do **not** call Anthropic/Foundry directly from the browser in productionised code — always via the gateway.
- Do **not** convert styling to Tailwind/CSS-in-JS in 1A (preserves exact surface; see §0.1).
- Do **not** use `localStorage` / `sessionStorage`.
- Do **not** touch `corporate-reporting`, or any `reporting_*` table/endpoint.
- Do **not** build real persistence/RAG/RLS in 1A — those are 1B, behind the service boundary you set up in §2.3.
- Do **not** redesign the surface. Reproduce the reference.

---

## 7. Acceptance criteria — 1A frontend "done"

1. The full surface renders in `vault-theo` and is visually faithful to `theo-frontend-reference.jsx`.
2. Every surface is interactive: chat (against mock gateway), Projects CRUD + knowledge, Artifacts create/version/panel, Customize.
3. Every backend-bound call goes through a **single service/contracts module** (no scattered inline fetches), each currently mocked.
4. The model call goes through a **gateway abstraction** (mock in 1A), never a direct browser→Anthropic call.
5. The **app-context chip** receives `{app_key, app_context}` from Origin and displays the anchor; the value is carried on the conversation.
6. No browser storage; no Tailwind conversion; no Reporting changes.
7. The SWAP BLOCK is intact and centralised.

When these hold, the surface is provably complete and the 1A↔1B seam is clean: 1B fills in the gateway, persistence, RAG, and RLS behind contracts the frontend has already validated.

---

## 8. Handover sequence reminder

- This pack covers **1A frontend only.**
- **1B Backend Plan** follows, standing up the gateway, the `theo_` schema, tool-dispatch, and RAG behind these surfaces — driving the Theo API Spec, Azure Postgres Schema, and Golden Handler Standard forward step by step, in the Reporting governance shape.
- Both plans are living documents, updated after each completed step.

---

*End of 1A frontend handover pack v0.1.*
