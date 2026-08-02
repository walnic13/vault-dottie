# VAULT THEO — ARCHITECTURE & STRUCTURE FOUNDATION
**Version: 0.1 — DRAFT for Walter review**
**Status: Foundation authority for `vault-theo`. Both the Theo Phase 1A Frontend Plan and the Theo Phase 1B Backend Plan sit on top of this document.**

---

## 0. Purpose and Authority

This document is the architecture and structure foundation for **Vault Theo** — the Claude-powered assistant layer that rides the **Vault Origin** surface and becomes app-aware as each Vault app opens within Origin.

It is NOT a schema authority, an API spec, or a handler standard. Those three governed documents (the Theo API Spec, the Theo Azure Postgres Schema, the Theo Golden Handler Standard) are authored and maintained during **Phase 1B** in the established Corporate Reporting governance shape. This document defines the boundaries, seams, and contracts those later documents must respect.

In any conflict between this document and a downstream governed document on a matter the downstream document owns (schema truth, contract truth, handler-pattern truth), the downstream document governs once it exists. Until it exists, this document is the grounding authority.

### 0a. Relationship to existing Vault authority documents

- This document does NOT replace, restate, or override the **Corporate Reporting** authority documents (Azure Postgres Schema — Reporting Section, Reporting Backend API Spec, Reporting Golden Handler Pack Standard).
- Theo tables are a **net-new, additively-namespaced** layer (`theo_` prefix) in the shared `vaultgpt` Azure Postgres instance.
- Theo MUST NOT read or write Corporate Reporting tables directly. Theo interacts with Corporate Reporting **exclusively through its published API**, executed as the signed-in user, honouring deployed RLS. (See §3 and §4.)
- Legacy early-Theo tables (`conversations`, `chat_messages`, `theo_users`, etc.) are NOT preserved. They are handled by a separate, non-blocking decommissioning workstream (see §7).

### 0b. Governance regime

`vault-theo` adopts the existing Vault governance regime without modification:

- **Claude Code** authors work, confined to a dedicated development branch of the `vault-theo` repository.
- **Codex** reviews Claude Code's work.
- **ChatGPT** acts as Walter's informal advisor, reviewing both Claude Code and Codex output and providing Walter a deterministic per-turn note to the relevant LLM.
- **Walter** holds authority. No deviation from the governed documents without explicit Walter approval.

---

## 1. Repository Boundary Model

Three repositories are in scope. The boundary between them is binding; Claude Code's per-repo authority is stated explicitly so it does not modify out-of-scope code.

### 1.1 `vault-theo` (NEW — primary build target)

Owns the entire assistant layer:

- The **model gateway** (§2).
- Conversation / project / artifact / settings **persistence** (`theo_` schema; §5).
- The **tool-dispatch layer** (§4).
- **RAG** retrieval (§6).
- The **frontend** — the full Claude-for-Teams replica surface plus the app-context layer.

Claude Code operates here freely, on its dedicated dev branch, under the governance regime.

### 1.2 `vault-origin` (EXISTING — minimal, additive change only)

Owns the surface everything launches from. Theo's only requirement of Origin is the **context-broadcast** (§3): as an app opens or the active anchor changes, Origin tells Theo `app_key` + `app_context`. Origin also hosts the Theo surface within the Origin shell.

Claude Code may make **additive** changes here only — the context-broadcast wiring and the Theo surface mount point. No refactoring of existing Origin behaviour without explicit Walter approval.

### 1.3 `corporate-reporting` (EXISTING — near read-only)

Owns its governed API. Theo's only requirement of Reporting is a **tool manifest** (§4.2) declaring which `reporting_*` endpoints Theo may call.

Claude Code's authority here is **near-zero**: it may add a tool-manifest declaration if and only if Walter directs it, and it MUST NOT alter any `reporting_*` table, RLS policy, helper, or handler. Corporate Reporting's authority regime is preserved intact.

---

## 2. The Model Gateway Seam

### 2.1 Why a gateway exists

Browser-direct calls to a model endpoint only worked inside the artifact sandbox (no credential, CORS-blocked otherwise). Production requires a **server-side gateway** in `vault-theo` that holds credentials and brokers every model call. This is non-negotiable for an enterprise build.

### 2.2 Binding properties

- The gateway is the **only** component that holds model credentials.
- Authentication to Foundry is **Entra managed identity (keyless)** → the Foundry Claude endpoint (`https://<resource>.services.ai.azure.com/anthropic/v1/messages`).
- The request/response shape is the **standard Anthropic Messages API**. This is the seam's most valuable property: tool wiring, streaming, and prompt caching are identical to direct Anthropic, so nothing in the frontend or tool layer is Foundry-specific.
- The gateway is the **model swap point**. Foundry-Claude today; a future in-house or alternative model later, behind the same internal contract, by configuration change — no frontend or tool-layer change.

### 2.3 Confirmed capability — live web access

Foundry-hosted Claude exposes the server-side **`web_search` and `web_fetch`** tools (confirmed: Anthropic Foundry announcement, Feb 2026, lists web search and fetch, code execution, citations, vision, tool use, prompt caching as supported). Theo can browse live without a separate search integration.

### 2.4 Carried constraints (state explicitly; do not let them surprise 1B)

- **Inference locus:** in the current preview, Foundry-Claude inference runs on Anthropic-hosted infrastructure, not Azure-tenant-native. This is a commercial/billing integration, not regional in-tenant inference.
- **Region:** Foundry-Claude is East US 2 / Sweden Central only — no UK region at time of writing.
- **ZDR:** zero-data-retention is *available* but MUST be confirmed contractually for the production posture before client-PII traffic flows.
- **SDKs:** Python, TypeScript, C#, Java, PHP support Foundry; Go and Ruby do not.

---

## 3. The Origin → Theo App-Context Contract (CONTEXT-ONLY)

### 3.1 Committed decision

Theo awareness of the active app is **context-only**. Origin broadcasts the **anchor**, never the payload. Theo, to know anything about what the anchor points to, **reads through the app's API as the signed-in user** (§4).

### 3.2 Contract shape

- **Origin → Theo:** `app_key text` (which app; `NULL` = Origin-level general chat) plus `app_context jsonb` (the deeper anchor, e.g. `{"workpaper_id": "...", "period_id": "..."}`). No client data in the broadcast.
- The anchor is persisted on the conversation (`theo_conversations.app_key`, `theo_conversations.app_context`) so a thread "remembers" the context it was opened in.
- `app_context` is **opaque jsonb** by design: Reporting can carry `{workpaper_id, period_id}`; a future app carries its own shape; no schema change per app.

### 3.3 Rationale (enterprise posture)

- **No data duplication.** Theo holds no copy of client data; the app remains the single source of truth.
- **RLS enforced for free.** Every read is a real API call as the user, so deployed row-level security applies on every read with no re-implementation.
- **Singular audit story.** Every read Theo performs is an attributable API call on the governed path — no snapshot lane bypassing the authority regime.
- **Principle-consistent.** Matches "Theo acts through the app's contract," the same way a human user would.

### 3.4 Accepted tradeoffs (deliberate, not surprises)

- Each grounded answer costs a **tool round-trip**; latency depends on the app API.
- Theo's reach equals the **published endpoint set**. If no `reporting_get_*` exists for a thing, Theo cannot see it until one does.
- **Optimisation lever for later:** short-TTL, still-RLS-scoped caching at the gateway — does not compromise the model. Out of scope for Phase 1.

---

## 3A. Origin Host & Mount Model (Theo-in-Origin)

Theo is hosted **inside the Vault Origin shell** (§1.2), not as a standalone destination. The standalone `vault-theo` SWA is a development harness; the production surface is Theo mounted in Origin. This model is BINDING.

### 3A.1 Default landing surface
At the Origin root (no app open), **Theo is the landing surface**: Theo's main view occupies the Origin 9/10 content panel, replacing the prior static welcome placeholder.

### 3A.2 Theo navigation as a permanent shell section
Theo's navigation (Chats / Projects / Artifacts / Customize, search, recents) mounts as a **permanent, collapsible section in the Origin 1/10 left panel**, positioned **below the Vault Files section and above the Vault Origin Apps section**, collapsible like the other shell sections.

### 3A.3 App selection
When a product is opened from Vault Origin Apps, that app's sidebar mounts **below the Theo section** (still above Vault Origin Apps), and the app takes over the 9/10 content panel as its landing page.

### 3A.4 In-app Theo access (VS Code idiom)
While an app owns the 9/10, Theo remains reachable via an **"Open Theo" control at the top of the 9/10**; activating it opens Theo's chat as a **resizable right-hand split panel** within the 9/10 (the app on the left, Theo on the right).

### 3A.5 Mount mechanism (BINDING)
Theo mounts **in-shell via Module Federation** — never an iframe, never a separate embedded site (Vault Origin App Host Contract §1A). Theo exposes its mountable surfaces (navigation section + main/chat view) as federated module(s) the Origin shell consumes, receiving the shell `AppHostContext`. The model call still routes through the Theo gateway (§2); hosting in Origin changes neither the gateway nor the context-only app-context contract (§3).

## 4. The Tool-Dispatch Model

### 4.1 Anchoring principle

**An app's API is Theo's tool surface for that app.** When Theo is "inside" Corporate Reporting, its tools are literally the published `reporting_*` endpoints, called as the signed-in user, honouring the same RLS. Each new Vault app becomes Theo-capable by publishing a tool manifest over its existing API — no bespoke integration per app.

### 4.2 Three tool tiers

1. **Built-in Foundry tools** — `web_search`, `web_fetch`, code execution. Travel with the model; no integration to build. Available regardless of app context.
2. **App-action tools** — the published endpoints of the currently-anchored app, expressed as a **tool manifest** (which endpoints Theo may call, their inputs, their semantics). Reporting publishes which `reporting_*` endpoints are Theo-callable. Dispatched through the gateway as the signed-in user.
3. **RAG retrieval** — Azure AI Search over the tax corpus and over project knowledge (§6).

### 4.3 Binding rules

- Theo NEVER accesses another app's tables directly. All app reads/writes go through that app's published, RLS-governed API.
- The tool-dispatch contract is defined **once** in `vault-theo`; each app plugs in by publishing a manifest.
- Tool availability is **context-scoped**: the app-action tier reflects the current `app_key`. Origin-level chat exposes built-in + RAG tiers only.

---

## 5. The `theo_` Schema Authority Header

Full DDL is authored in Phase 1B in the Theo Azure Postgres Schema document. This section fixes the **conventions and the structural table set** so 1B has a settled target and 1A can build against contracts shaped to it.

### 5.1 Naming conventions (BINDING)

- All Theo tables use the **`theo_` prefix**, plural snake_case nouns.
- Canonical ownership column: **`created_by text NOT NULL`**, storing the authenticated **Entra OID** of the row creator. (Consistent with current Corporate Reporting house style; the legacy early-Theo `user_id` convention is NOT carried forward.)
- Primary key: `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` (except registry/settings tables keyed on a natural text identifier).
- Timestamps: `created_at timestamptz NOT NULL DEFAULT now()`, `updated_at timestamptz NOT NULL DEFAULT now()` (server-managed; client-supplied `updated_at` ignored). Immutable tables OMIT `updated_at`.
- SECURITY DEFINER existence helper per table that supports update/delete: `theo_<entity>_exists_unscoped(uuid)` → boolean, for 403/404 discrimination.

### 5.2 RLS baseline (BINDING)

- RLS ENABLED on every Theo table.
- Four separate policies per table (SELECT / INSERT / UPDATE / DELETE). No `FOR ALL`. No `USING (true)`.
- Policies target `authenticated` and key on `auth.uid()` (= the Entra OID in `created_by`), session context set per request via `set_config('request.jwt.claim.sub', ...)` etc.
- Default family: ownership-based (`created_by = auth.uid()`). Membership/sharing models, if ever needed, are introduced by explicit Walter-authorized schema update.

### 5.3 Structural table set (1B finalises DDL)

| Table | Purpose | Notes |
|-------|---------|-------|
| `theo_conversations` | Chat thread | Carries `app_key text NULL`, `app_context jsonb NULL`, `project_id uuid NULL`, `title`, `model`. The app-context primitive lives here. |
| `theo_messages` | Turn within a thread | `conversation_id` FK ON DELETE CASCADE; `role`, `content`, `model`, ordering key. Immutable — no `updated_at`. |
| `theo_projects` | Project (instructions + knowledge scope) | `name`, `instructions`, optional `app_key` scope. |
| `theo_project_knowledge` | Knowledge source under a project | `project_id` FK ON DELETE CASCADE; source pointer/title/type. RAG-indexed (§6). |
| `theo_artifacts` | Artifact record | Optional `conversation_id` / `project_id`; `title`, `type`, current-version pointer. |
| `theo_artifact_versions` | Versioned artifact content | `artifact_id` FK ON DELETE CASCADE; `version_number`, `content`. Immutable version rows. |
| `theo_user_settings` | Per-user style + custom instructions (Customize surface) | Text PK = Entra OID. Prepended to system prompt. |
| `theo_apps` / `theo_app_tools` *(candidate)* | Registry of apps + Theo-callable endpoints | Backs the tool manifest (§4.2). May start as config rather than tables; 1B decides. |

`app_key` begins as a CHECK-constrained closed set; promotable to an FK'd app registry when app count warrants.

---

## 6. RAG (Retrieval)

- **Azure AI Search** (hybrid vector + BM25) over (a) the tax corpus and (b) project knowledge.
- In **1A**, Projects-knowledge retrieval runs against a **mocked contract** — the surface is fully built and exercised, retrieval returns stub results.
- In **1B**, retrieval becomes real: project knowledge indexed, top-k retrieval wired at the system-prompt assembly seam, RLS-scoped.
- Retrieval is a **tool tier** (§4.2), dispatched through the same contract as other tools.

---

## 7. Legacy Theo Decommissioning (NON-BLOCKING)

- Early-Theo tables (`conversations`, `chat_messages`, `theo_users`, etc.) are NOT preserved and NOT migrated into the new design.
- They physically persist in the shared `vaultgpt` instance. Decommissioning (leave dormant / migrate anything worth keeping / drop later) is a **separate workstream**, explicitly out of the Phase 1 critical path.
- Claude Code MUST NOT build on, migrate, or depend on these tables, and MUST NOT drop them without explicit Walter direction.

---

## 8. Deliverable Sequence & How the Plans Sit on This

### 8.1 Frontend-first, by deliberate design

The visual surface is where the requirement is actually discovered. Building it first means the backend is built **once**, against a settled shape, rather than chased. The frontend builds against **contracts**, not handlers — exactly as the Reporting API Spec is "contract truth" written before handlers exist.

### 8.2 The 1A / 1B seam (BINDING discipline)

- **Phase 1A** builds the **complete** Claude-for-Teams replica — every surface (Chats, Projects, Artifacts, Customize) plus the app-context layer — fully clickable and fully interactive, running against **mocked contracts** and in-memory state.
- **Phase 1B** makes every surface **true**: persistence, RLS, RAG, memory — standing up the backend behind the already-validated surfaces.
- **No surface is deferred.** Every surface exists and is exercised in 1A. The 1A plan marks, **per surface**, what is *real-in-1A* (all visual + interaction behaviour) versus *true-in-1B* (persistence, RLS, retrieval), so the seam is explicit rather than discovered.

### 8.3 1A frontend substrate

The two working React artifacts already produced — `VaultOriginAssistant.jsx` and the fuller `VaultOriginShell.jsx` — are the **named productionisation substrate** for 1A (warm palette, sidebar, functional Projects, marker-parsed versioned Artifacts, the Claude→Theo swap block). 1A's engineering is productionising them: real repo component structure, the gateway call replacing the in-artifact fetch, contracts replacing in-memory stand-ins, and the app-context layer added.

### 8.4 Authority docs maintained through 1B

As each 1B backend step lands, three governed documents are updated in the Reporting governance shape:

- **Theo API Spec** (contract truth)
- **Theo Azure Postgres Schema** (data truth — the `theo_` section)
- **Theo Golden Handler Standard** (implementation-pattern truth)

Both plans are **living documents**: each is updated after each step completes.

### 8.5 Production order

1. **This architecture/structure doc** (foundation) — under review.
2. **Theo Phase 1A Frontend Plan** — full-scope, every surface, mocked contracts, per-surface real-in-1A vs true-in-1B markers, the two artifacts named as substrate.
3. **Theo Phase 1B Backend Plan** — living step-by-step skeleton driving the three authority docs forward one step at a time, in the existing governance shape.

---

## 9. Open Items for Walter Before 1A Plan

1. Confirm the structural table set (§5.3) — in particular whether `theo_apps` / `theo_app_tools` start as tables or as config.
2. Confirm ZDR contractual posture is being pursued in parallel (gating client-PII traffic, not gating the 1A/1B build).
3. Confirm Origin context-broadcast can be added additively to `vault-origin` without touching existing surface behaviour.

---

*End of foundation document v0.1.*
