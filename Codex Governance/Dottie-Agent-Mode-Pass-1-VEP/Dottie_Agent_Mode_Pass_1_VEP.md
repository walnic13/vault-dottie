# Dottie — Agent Mode (§6D(3) app-aware vs general, right-panel) — Pass 1 Frontend VEP (CODE-BEARING)

> Reviewer: **Codex** (Pass 2). Dottie THEO-replica frontend regime; **code-bearing** — the three changed source files are committed WITH this VEP (currency base @ pre-feature parent → proposed @ review HEAD). **Parity mirror** of the Codex-**APPROVED** vault-theo Agent-Mode change (`vault-theo` `f102fff`) — Dottie is a full Theo replica ("replicate exactly = feature parity"), so the identical latched-at-launch mode logic + mode chip apply. Implements App Host **§6D(3) Agent mode** (vault-origin `docs/architecture/VAULT_ORIGIN_APP_HOST_CONTRACT.md`, dev blob `840a5a7b50592e660b35f2a6391991f2c87b9ab4`): the right-panel Dottie carries an explicit, per-tab, **launch-latched**, switchable mode — **app-aware** vs **general**. Three files: `src/theo/useTheoState.ts` (latched `agentMode` + `effectiveAppContext` threading + cold-open-restore suppression), `src/theo/TheoSurface.tsx` (= `DottieSurface`; passes the launch context into the hook), `src/theo/components/TheoMain.tsx` (the mode chip). Standalone/general Dottie is behaviourally unchanged.

## Grounding Conformance Receipt

```
Role: Claude Code
Turn Type: Pass 1 — Codex-rejection correction / delta-evidence pack (code-bearing)
Grounding Mode: Delta Grounding
Pass: Pass 1
Sub-phase Track: N/A
Turn issued against HEAD: vault-dottie development 18fe4d1 (pre-feature parent) → 6474567 (proposed, unchanged)
```
Delta basis (Conformance §4 — Pass 1 rejection-correction → Delta Grounding): prior artifact = this VEP + code @ vault-dottie `6474567`, Codex Pass-2 **REJECTED** on one narrow ground — a **Dottie-specific integration regression**: the 9/10 Dottie CONSOLE mounts (in vault-origin `ShellFrame`) with `{ app_key: 'dottie', app_context: null }` (Dottie's OWN id), so the latch (`app_key ? "app-aware" : "general"`) wrongly read the console as **app-aware**, showing the mode chip and skipping the console's normal Overview landing — outside §6D(3)'s right-panel-agent scope. **Resolution (paired vault-origin fix `5cf3bcc`):** a 9/10 agent console conveys NO assisting-app context — both the Theo home and the Dottie console mounts now pass `{ app_key: null, app_context: null }`, so they latch **general** (their own console; normal landing; no chip). Only the **right-panel** agent (via the §6D broker) receives a real external `app_key` (`'sigma'`) → app-aware. The vault-dottie CODE is UNCHANGED (blobs at `6474567` — the latch is correct given the mount fix); this re-issue adds the disclosure + the paired-fix grounding. (Frontend sub-phase track = F-P1–F-P7 per Conformance §4A.1; lint P/I/E = `N/A`. Code-bearing currency: base @ `18fe4d1` → `6474567`.)

| # | Document / file (absolute path) | Read tool invocation this turn | Currency anchor |
| - | ------------------------------- | ------------------------------ | --------------- |
| 1 | AUTHORITY (cross-repo) — App Host §6D(3) — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-origin/docs/architecture/VAULT_ORIGIN_APP_HOST_CONTRACT.md` | `Read(§6D)` this turn | blob `840a5a7b50592e660b35f2a6391991f2c87b9ab4` @ vault-origin dev |
| 2 | PARITY SOURCE (APPROVED) — vault-theo Agent-Mode VEP + code — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-theo/Codex Governance/Theo-Agent-Mode-Pass-1-VEP/Theo_Agent_Mode_Pass_1_VEP.md` (the APPROVED change this mirrors) | `Read`/grounded this turn | vault-theo `f102fff` (Codex-APPROVED) |
| 2b | PAIRED FIX (resolves the REJECT) — vault-origin `ShellFrame.tsx` — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-origin/src/shell/ShellFrame.tsx` (the 9/10 agent-console mounts now pass `app_key: null`, so a console never latches app-aware) | `Edit`/grounded this turn | blob `239a5c29a1d60e3268744b772ef7bd74782b63c8` @ vault-origin `5cf3bcc` |
| 3 | Claude Code Dottie FE Governor — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md` (§6 — accept `{app_key, app_context}` from Origin; single service module) | `Grep(§6)` this turn | blob `b6ef105fea53533f45d0e907da223616a61c51dd` |
| 4 | Dottie FE Grounding Conformance — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md` (§4A.1; §4B VA-T1 app-context chip) | `Read(§4B)` this turn | blob `4f2f42e799be5db31e1e35e523d656ff4c1c057e` |
| 5 | Dottie Golden Component Pack — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/THEO_GOLDEN_COMPONENT_PACK_STANDARD.md` (§7 reproduce faithfully) | `Grep(§7)` this turn | blob `0035a1d9fed103d07bf420b957c3727ec47fcc6b` |
| 6 | Codex Dottie FE Review — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/CODEX_THEO_FRONTEND_REVIEW_STANDARD.md` (Pass-2 reviewer) | grounded; unchanged @ HEAD | blob `25cc488091d619d8f6642b10552df0d019a87933` |
| 7 | CODE — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/src/theo/useTheoState.ts` (latched agentMode + effectiveAppContext + restore suppression + switcher) | `Read`/`Edit` this turn | base `d62ed195da37020b4e323ad87962378422e73341` @ `18fe4d1` → proposed `8aa18758a2a8b30749246a9341f4261aff95f1cf` |
| 8 | CODE — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/src/theo/TheoSurface.tsx` (DottieSurface — passes launch context into useTheoState) | `Read`/`Edit` this turn | base `d11b2271a5da69c101906948c9022e960a5eed98` @ `18fe4d1` → proposed `c45bb669490ab1eefdfed786b291b73cb102fb09` |
| 9 | CODE — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/src/theo/components/TheoMain.tsx` (the §6D(3) mode chip) | `Read`/`Edit` this turn | base `fdd5c4d1ea601728eb928d62cc14b3807fcf8a48` @ `18fe4d1` → proposed `e7b8c38d1486a429137cc398b66058da537811e8` |

Currency note: full 40-char blob SHAs captured this turn. Code-bearing: rows 7–9 base @ parent `18fe4d1` → proposed @ this commit.

## Rule Anchor Table

| Source doc (path) | Clause id | Verbatim clause text (read this turn) | Applied in output at |
|-------------------|-----------|----------------------|----------------------|
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-origin/docs/architecture/VAULT_ORIGIN_APP_HOST_CONTRACT.md | §6D(3) | "The shell offering context does NOT by itself force app-aware mode; the agent owns the mode" | agentMode LATCHED at launch (init from launchAppContext), changed only by the user chip — never re-derived from live appContext |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-origin/docs/architecture/VAULT_ORIGIN_APP_HOST_CONTRACT.md | §6D(3) | "MUST NOT restore an unrelated prior or general conversation on that launch" | useTheoState restore-gate suppression |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-origin/docs/architecture/VAULT_ORIGIN_APP_HOST_CONTRACT.md | §6D(3) | "behaves exactly as a context-free launch (`app_key` treated as null)" | `effectiveAppContext` = EMPTY_APP_CONTEXT in general mode |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §6 | "Accept `{ app_key, app_context }` from Origin" | the appContext the mode governs (unchanged inbound contract) |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md | §4B VA-T1 | "app-context chip" | the mode chip is the §4B VA-T1 app-context chip made switchable |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/THEO_GOLDEN_COMPONENT_PACK_STANDARD.md | §7 | "reproduced faithfully, no redesign" | the chip reuses the VA-T1 pill idiom; ChatView greeting/starters unchanged |

## F-P1 — Feature identification
Microstep: **Dottie Agent Mode** — the vault-dottie parity mirror of the APPROVED vault-theo Agent-Mode change (`f102fff`), implementing App Host **§6D(3)**. The right-panel Dottie carries an explicit **app-aware vs general** mode, **latched at launch** (app-aware iff Origin publishes an app context at mount; general otherwise), switchable via the in-header chip; the launch-latch means a later host context update never flips the mode. Authority: §6D(3) (driving, cross-repo) + VA-T1 (app-context chip). Parity basis: Dottie is a full Theo replica; the change is byte-parallel to `f102fff` (same three files, same logic). Out of scope: any `dottie_*`/backend change (none).

## F-P2 — UI Authority Reconciliation
- **VA-T1** (replica surface — "app-context chip"): **VISUAL-AUTHORITY-MATCH**. The static app-context chip becomes a switchable mode control (app-aware coral ⇄ general neutral) in the same header pill idiom — no redesign (§7).
- **App Host §6D(3)**: implemented verbatim (Rule Anchors) — launch-latched, MUST-NOT-restore, switchable-to-general (`app_key` null).
- **Parity**: matches the APPROVED vault-theo change (`f102fff`) — same latched model, same chip. No Dottie-specific deviation.
- No VISUAL-AUTHORITY-DEVIATION. No VA-id outside Dottie §4B cited as authority (§6D(3) cited as cross-repo driving contract by path + prose).

## F-P2.5 — Gap Disclosure
**PROCEED.** (1) **Launch-latched** — `agentMode` latched once in the `useState` initialiser from `launchAppContext` (passed synchronously by `TheoSurface`/DottieSurface), changed only by the user chip; a later host context update never flips it (§6D(3)). No ingest-timing race with the restore gate. (2) **Switching mode starts a fresh chat** (`setAgentMode`→`newChat`) so the new mode lands cleanly. (3) `appContextAvailable` stays LIVE so the chip appears when context is offered (enabling the switch) without forcing app-aware. (4) No `dottie_*`/backend/dependency change; Dottie-L1 memory + governance features untouched. (5) **Console-scope (resolves the prior REJECT)**: §6D(3) mode is scoped to the RIGHT-PANEL agent. Dottie's own 9/10 CONSOLE is not a right-panel agent, so it must not latch app-aware. The paired vault-origin fix (`5cf3bcc`) makes the 9/10 agent-console mounts convey `app_key: null` (the Dottie console was `'dottie'` — its own id); the console therefore latches **general** (normal Overview landing, no mode chip). App-aware is reachable only when the right-panel agent is fed a real external `app_key` by the §6D broker. The vault-dottie latch code is unchanged and correct given this mount contract. No PRE-LAND/ESCALATE.

## F-P3 — Contract grounding
Inbound `appContext` (Governor §6) unchanged; the mode layer sits between it and the review logic. The review agent + per-review project are the deployed Dottie/Sigma paths, now keyed off `effectiveAppContext` (general → they don't engage). Single service module (`theoClient`) preserved. No new `dottie_*` call; no backend/schema/dependency change.

## F-P4 — Component reference grounding (Primary Reference)
**PRIMARY REFERENCE: the APPROVED vault-theo change (`f102fff`)** + **VA-T1** (the app-context chip). Dottie replicates it byte-parallel (same three files, same latched logic, same chip idiom; inline-style, no Tailwind, no browser storage). Not GREENFIELD; not composite.

## F-P5 — Component Contract Table

| Component (ownership) | Prop / state interface (TypeScript) | Visual authority | Data / contract dependency | Impl eligibility |
|---|---|---|---|---|
| `useTheoState(launchAppContext?: AppContext)` (ACTIVE hook) | LATCHES `agentMode: "app-aware" \| "general"` once in the `useState` initialiser from the launch context (`… .app_key ? "app-aware" : "general"`) — never recomputed from live `appContext`; memoised `effectiveAppContext = agentMode === "general" ? EMPTY_APP_CONTEXT : appContext`; exposes `agentMode`, `appContextAvailable: boolean`, `setAgentMode: (m) => void` (raw latched setter + `newChat`); swaps review consumers (`currentRid`, `hasReviewContext`, `buildSystemPrompt` app_key, stream `app_key`/`app_context`, `reviewMode`, `sigmaMode`) → `effectiveAppContext`; restore-gate branch: app-aware launch drops the gate WITHOUT restoring the last personal chat | VA-T1 | inbound `appContext` (Governor §6); no new backend | PROCEED |
| `TheoSurface` (= `DottieSurface`; ACTIVE) | calls `useTheoState(appContext)` — passes the LAUNCH context so the mode latches at mount; the existing ingest effect still threads live context DATA but never re-derives the mode | VA-T1 | the `appContext` prop (Governor §6) | PROCEED |
| `TheoMain` header (ACTIVE; the mode chip) | replaces the static `appLabel` chip with a `<button>` pill (when `t.appContextAvailable`): `t.agentMode === "app-aware" ? (appLabel ?? "App assistant") : "General"` + `⇄`, `onClick` toggles `t.setAgentMode`; app-aware = coralTint, general = neutral (`C.line`); hidden when no app context | VA-T1 — "app-context chip" | `t.agentMode`, `t.appContextAvailable`, `t.setAgentMode`, `appContextLabel(t.appContext)` | PROCEED |

## Component Structural Mirror Table (F-I2)
| Region (Dottie) | Primary Reference | Classification |
|---|---|---|
| latched `agentMode` + `effectiveAppContext` + restore suppression + switcher | vault-theo `useTheoState` (`f102fff`, APPROVED) | EXACT (byte-parallel replica) |
| `TheoSurface` → `useTheoState(appContext)` | vault-theo `TheoSurface` (`f102fff`) | EXACT |
| the mode chip | vault-theo `TheoMain` chip (`f102fff`) + VA-T1 app-context chip | EXACT (same idiom, no redesign) |
| review consumers → `effectiveAppContext` | existing `appContext` consumers | EXACT (source swapped to the mode-gated context) |

## F-P6 — Repository & active-surface grounding
Target files (Read + Edited this turn, ACTIVE): `src/theo/useTheoState.ts`, `src/theo/TheoSurface.tsx`, `src/theo/components/TheoMain.tsx`. Guardrails: single service module (`theoClient`) unchanged; inline-style, no Tailwind, no browser storage (VA-T1 idiom); no `dottie_*`/schema/dependency change; general/standalone Dottie unchanged (mode latches general with no launch context). Verified this turn: `tsc --noEmit -p tsconfig.app.json` exit 0; `npm run build` green (emits `__federation_expose_DottieSurface`).

## F-P7 — Plan / impl body
Code committed with this VEP (three files above; byte-parallel to the APPROVED vault-theo `f102fff`). On APPROVED → deploy vault-dottie dev SWA; SWA test: launch Dottie from Sigma (worklist ⇒ Sigma-assistant greeting, no personal chat; open review ⇒ review-scoped) → chip shows "Reviewing: <fund>"/"App assistant"; click → "General"; click back → app-aware; launch Dottie with no app ⇒ general (unchanged).

## Mechanical lint
Command: `node tools/lint_microstep_submission.mjs "Codex Governance/Dottie-Agent-Mode-Pass-1-VEP/Dottie_Agent_Mode_Pass_1_VEP.md" --repo-root .` — expect `PASS`, exit `0`.

## Requested action
Codex Pass-2 **re-review** (RE-ISSUE / Delta Grounding) — resolves the prior REJECT (Dottie-specific integration regression: the 9/10 Dottie console mounted `app_key:'dottie'` and wrongly latched app-aware). Code-bearing parity mirror of the APPROVED vault-theo change (`f102fff`); vault-dottie code unchanged (blobs @ `6474567`). Confirm the REJECT is resolved: (1) **Console-scope** — the paired vault-origin fix `5cf3bcc` makes the 9/10 agent-console mounts (Theo home + Dottie console) convey `app_key: null`, so a console latches **general** (normal Overview landing, no chip); app-aware is reachable only via the right-panel agent's broker-fed external `app_key` (§6D(3) right-panel scope; "context availability ≠ mode"). (2) latched-at-launch (never re-derived from live context). (3) §6D(3) verbatim — contextual default at launch, app-aware MUST-NOT-restore, switchable-to-general (`app_key` null via `effectiveAppContext`). (4) byte-parallel to the APPROVED vault-theo change. (5) no `dottie_*`/schema/dependency change; general/standalone Dottie unchanged; tsc clean; vite build green. On APPROVED, Claude Code deploys dev + hands the SWA test plan. Emit APPROVED or REJECTED only.

*End of Dottie Agent Mode Pass-1 Frontend VEP (code-bearing).*
