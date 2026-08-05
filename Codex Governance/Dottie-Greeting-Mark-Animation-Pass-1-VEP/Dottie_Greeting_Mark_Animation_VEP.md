# Dottie Greeting Mark Animation — Pass 1 Frontend VEP

> From Walter's dev-SWA review 2026-08-05: the fresh-chat greeting mark should animate as Dottie's signature — full logo → **deconstruct to the centre dot** (the thinking animation) → dot heartbeat + bloom → pause → the logo reforms and holds. **The animation already exists** (`DottieSpiral` — its own doc: "the spiral DECONSTRUCTS outer→seed to the fixed centre dot… slow-heartbeats, blooms hugely, and drifts back… the exact inverse of Theo's constructing spiral"), but the greeting rendered `DottieMark variant="building"` — and `DottieMark` never reads `variant`, so it showed the **static** mark. Fix: the greeting uses `DottieSpiral` (a **one-shot** that ends on the logo, `decorative` a11y), plus `DottieSpiral` gains `loop`/`decorative` options. FE-only; no backend/route/schema.

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Pass 1 — Frontend Verified Evidence Pack (greeting mark animation wiring)
Grounding parent (source baseline): `5b6e944a9ce5d94cbed708853e405dbb2357f57d` (vault-dottie, `development`)
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

Currency labelling: this is a CODE-BEARING package — at the review HEAD the changed files' blobs ARE the proposed blobs. So for changed rows the base blob is cited at the PARENT commit `5b6e944` and the proposed blob is the review-HEAD blob (anchored to the blob SHA, not the commit). Unchanged grounding docs are cited at HEAD.

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (unchanged: blob @ HEAD; changed: base @ parent 5b6e944 → proposed @ review HEAD) |
| - | ------------------------------- | ------------------------------ | -------------------------------------------- |
| 1 | VISUAL AUTHORITY — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/spec/DOTTIE_DESIGN_SYSTEM.md` (§2 identity — the gold mark / signature) | `Read`(§17–54) this turn | `744523cf905df1186d954b86519b1cdeddac539c` |
| 2 | FE Grounding Conformance — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR + Rule Anchor) | grounded; unchanged @ HEAD | `4f2f42e799be5db31e1e35e523d656ff4c1c057e` |
| 3 | FE Governor — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md` (reproduce faithfully / no redesign) | grounded; unchanged @ HEAD | `3afec7ea4b13650ce2bf28bf32073179a35e7b24` |
| 4 | Codex FE Review — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/CODEX_THEO_FRONTEND_REVIEW_STANDARD.md` (Pass-2; APPROVED/REJECTED only) | grounded; unchanged @ HEAD | `25cc488091d619d8f6642b10552df0d019a87933` |
| 5 | PRIMARY REFERENCE / CHANGED — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/src/theo/components/DottieSpiral.tsx` (the signature deconstruct→bloom→rebuild mark; + `loop`/`decorative`) | `Read`(full) + `Edit` prior turn | base @ parent `5b6e944`: `2dd0df3dc82b9cd2d484d229dbb6e15e459d4617` → proposed @ review HEAD `569963f3e27057e864a47259e90650b2dec8e419` |
| 6 | CHANGED — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/src/theo/components/ChatView.tsx` (greeting mark: static `DottieMark variant="building"` → animated `DottieSpiral` one-shot; **+ delta reissue #2: the restore-hold comment corrected — it claimed a COLD decision lifts to the greeting w/ the animated mark, but useTheoState pkg 3b/§6.1 sends a STALE/no-recent open to the Overview console, never the greeting; T13 fix**) | `Read`(§404–421) + `Edit` this turn | base @ parent `5b6e944`: `1e7b4898a8c44d9b3f96c6f2db213ef6560ef145` → proposed @ review HEAD `7114decfd56b3228662c90e0c34a1c0c0b340e44` |

No ChatGPT advisory cited. No backend / route / schema / migration.

## Rule Anchor Table

| Source doc (absolute path) | Clause id | Verbatim clause text (read this turn) | Applied in output at |
| -------------------------- | --------- | ------------------------------------- | -------------------- |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/spec/DOTTIE_DESIGN_SYSTEM.md | §2 P1 | "ink + gold + monospace provenance" | §1 — Dottie's gold signature mark animates on the greeting |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/spec/DOTTIE_DESIGN_SYSTEM.md | §2 P2 | "We never dilute the dark identity to blend in." | §1 — the branded deconstruct animation is Dottie's identity moment |

---

## §1 — Feature
The fresh-chat greeting mark now animates as Dottie's signature. `DottieSpiral` already implements the exact sequence Walter described (deconstruct outer→seed to the centre dot → heartbeat + huge bloom → drift back → rebuild), but the greeting rendered `DottieMark variant="building"` — and `DottieMark({ size })` never destructures/uses `variant`, so it rendered the **static** mark (dead-prop; no animation). Fix: the greeting renders `<DottieSpiral size={64} loop={false} decorative />` — the signature sequence **once**, holding the reformed gold logo (per "then the logo should show"), non-looping so it is a one-time flourish, `decorative` (aria-hidden — the greeting `<h1>` conveys meaning). `DottieSpiral` gains `loop` (default `true` = the perpetual thinking use, unchanged) and `decorative` (default `false` = the live thinking indicator's `role="status"`/`aria-label`, unchanged). Honours `prefers-reduced-motion` (holds the finished mark) as before.

## §2 — Architecture & boundary
Two ACTIVE files. `DottieSpiral.tsx`: two optional props (`loop`, `decorative`) gating the existing loop timer + the aria attributes; the animation itself is unchanged; effect dep adds `loop`. `ChatView.tsx`: one JSX element swapped (greeting mark) — the cold-open hold (`DottieMark variant="static"`) + the message avatar (`DottieMark size=30`) are unchanged; `DottieSpiral`/`DottieMark` were already imported. No new file/component/route/backend/schema/dependency. **Not a redesign** — it wires Dottie's existing signature mark (governed against DOTTIE §2) to the greeting where a dead `variant` prop had left it static.

## §3 — Verification (this turn, local)
`tsc --noEmit -p tsconfig.app.json` → exit 0. `npm run build` → clean (DottieSurface federated chunk emits). This turn. Behaviour eyeballed on the dev SWA: the greeting plays the deconstruct→bloom→rebuild once and holds the gold logo; thinking indicators (loop default) unchanged.

## §CCT — Component Contract Table
| Component (file) | Prop / input interface (TS) | Visual authority (VA-id) | Data / contract dependency |
| --- | --- | --- | --- |
| `DottieSpiral` (`DottieSpiral.tsx`) | `{ size?: number; loop?: boolean; decorative?: boolean }` (was `{ size?: number }`) — `loop` default true, `decorative` default false; both additive, existing callers unchanged | DOTTIE_DESIGN_SYSTEM §2 (gold signature mark) | none (presentational) |
| `ChatView` greeting (`ChatView.tsx`) | no prop change; the greeting mark element `DottieMark variant="building"` → `DottieSpiral size={64} loop={false} decorative` | DOTTIE_DESIGN_SYSTEM §2 | none |

## §GAP — Gap Disclosure
**PROCEED.**
- **G-1 — One-shot, holds the logo.** `loop={false}` runs the sequence once then holds the reformed mark (matches "then the logo should show"); the perpetual loop remains the thinking-indicator default. Disclosed.
- **G-2 — Timing reuses the thinking animation.** The deconstruct/bloom timings are `DottieSpiral`'s existing constants (Walter: "the animation we use for thinking"); if the one-shot duration wants tuning it is a later constant tweak. Disclosed.
- **G-3 — Deploy + eyeball.** Lands on `development` → brave-dune; verified mounted in Origin. PROCEED.

## §DELTA — changed files (before → after evidence)
Two files (GCR rows 5–6). `DottieSpiral.tsx` (`2dd0df3d`→`569963f3`): + `loop`/`decorative` props gating the loop timer + aria; animation unchanged. `ChatView.tsx` (`1e7b4898`→`7114decf`): greeting mark element swapped to `DottieSpiral`, **and (delta reissue #2, T13 fix) the restore-hold comment corrected. It previously claimed a COLD cold-open decision "lifts to the greeting, whose `DottieSpiral` mark then animates" — but the runtime (useTheoState pkg 3b / §6.1, lines 296–307: `applyView("overview")`) sends a STALE (>4h) or no-recent open to the Overview console, never the greeting. The comment now reads: the hold lifts to whatever the gate resolves — a FRESH last chat (≤4h) restored, else the Overview console — never a greeting; the greeting's animated one-shot is a separate fresh-new-chat moment.** No other bytes changed.

## §CODEX — activation (Walter forwards)

```
Codex is activated for Pass-2 FRONTEND review of the Dottie Greeting Mark Animation, vault-dottie,
"Codex Governance/Dottie-Greeting-Mark-Animation-Pass-1-VEP/Dottie_Greeting_Mark_Animation_VEP.md" @ commit <HEAD>. Open
Pass-2 with a governance-bound GCR + Rule Anchor Table; hard-gate; emit only APPROVED or REJECTED. FE-only, no
backend/schema/route. The fresh-chat greeting mark was static: it rendered DottieMark variant="building", but DottieMark never
reads `variant` (dead prop) so no animation played. DottieSpiral ALREADY implements Dottie's signature deconstruct→dot
heartbeat+bloom→rebuild (its own doc: the inverse of Theo's constructing spiral). Fix: (1) ChatView greeting renders
<DottieSpiral size={64} loop={false} decorative /> — the sequence ONCE, holding the reformed gold logo (Walter: "then the
logo should show"), decorative=aria-hidden (the <h1> conveys meaning). (2) DottieSpiral gains loop (default true = the
unchanged perpetual thinking use) + decorative (default false = the unchanged role="status"/aria-label); animation unchanged,
prefers-reduced-motion still holds the finished mark. Review: not a redesign — wires the existing governed signature mark
(DOTTIE §2) to the greeting; two ACTIVE files; additive optional props, existing callers unchanged; cold-open hold + message
avatar (DottieMark) unchanged. tsc exit 0 + vite build clean. Mechanical lint PASS. Emit APPROVED or REJECTED only.
```

*End of Dottie Greeting Mark Animation Pass-1 Frontend VEP.*
