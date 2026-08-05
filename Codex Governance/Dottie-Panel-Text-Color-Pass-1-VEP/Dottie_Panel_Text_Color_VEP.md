# Dottie Panel-Mode Text Colour — Pass 1 Frontend VEP

> One-property follow-up to the mount companion (`58e8282`), from Walter's Origin dev-SWA review 2026-08-05: mounted in Origin's 9/10, Dottie's text (e.g. the `Good evening, {name}` greeting `<h1>`, which sets no colour) inherited Origin's light-theme text colour instead of Dottie's. The companion painted the panel-mode background (`C.bg`); this adds the matching **foreground** so all of Dottie's 9/10 text defaults to her ink (`C.ink` = `#E7ECF3`) — her committed dark identity (DOTTIE §2 P1/P2), not Origin's inherited colour. FE-only; one style property on the existing `TheoMain` root.

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Pass 1 — Frontend Verified Evidence Pack (panel-mode text colour)
Grounding parent (source baseline): `58e828208f269ac122f655f9abbef7f5d12d66ec` (vault-dottie, `development`)
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD / proposed) |
| - | ------------------------------- | ------------------------------ | -------------------------------------------- |
| 1 | VISUAL AUTHORITY — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/spec/DOTTIE_DESIGN_SYSTEM.md` (§2 P1/P2 committed dark ink identity) | `Read`(§17–54) this turn | `744523cf905df1186d954b86519b1cdeddac539c` |
| 2 | FE Grounding Conformance — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR + Rule Anchor) | grounded; unchanged @ HEAD | `4f2f42e799be5db31e1e35e523d656ff4c1c057e` |
| 3 | FE Governor — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md` (reproduce faithfully / no redesign) | grounded; unchanged @ HEAD | `3afec7ea4b13650ce2bf28bf32073179a35e7b24` |
| 4 | Codex FE Review — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/CODEX_THEO_FRONTEND_REVIEW_STANDARD.md` (Pass-2; APPROVED/REJECTED only) | grounded; unchanged @ HEAD | `25cc488091d619d8f6642b10552df0d019a87933` |
| 5 | CHANGED — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/src/theo/components/TheoMain.tsx` (root now sets `color: C.ink` alongside `background: C.bg`) | `Read`(§35–110) + `Edit` this turn | base @HEAD `c420af97ff0c61e4fd585d490d3c1032275a1ac4` → proposed `fdd5c4d1ea601728eb928d62cc14b3807fcf8a48` |

No ChatGPT advisory cited. No backend / route / schema / migration.

## Rule Anchor Table

| Source doc (absolute path) | Clause id | Verbatim clause text (read this turn) | Applied in output at |
| -------------------------- | --------- | ------------------------------------- | -------------------- |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/spec/DOTTIE_DESIGN_SYSTEM.md | §2 P1 | "ink + gold + monospace provenance" | §1 — Dottie's text is her ink, committed across surfaces |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/spec/DOTTIE_DESIGN_SYSTEM.md | §2 P2 | "We never dilute the dark identity to blend in." | §1 — mounted in Origin, Dottie's text must be her ink, not Origin's inherited colour |

---

## §1 — Feature
Mounted in Origin's 9/10, `TheoMain` is portaled without the standalone `.vo-standalone` wrapper (which sets `color: C.ink`), so text that sets no explicit colour — notably the greeting `<h1>` in `ChatView` — inherited Origin's light-theme text colour (wrong on Dottie's dark ground; e.g. the `Good evening, Walter` greeting rendered in an inherited warm tone rather than Dottie's near-white ink). Fix: the `TheoMain` root now sets `color: C.ink` (`#E7ECF3`) alongside the companion's `background: C.bg` — so every 9/10 text element defaults to Dottie's ink (elements that set their own colour, e.g. the gold accent, are unaffected). No-op in `mode="full"` (the wrapper already sets it).

## §2 — Architecture & boundary
One ACTIVE file, one added style property on the existing root `<div>` (C already imported/used). No new file/component/prop/route/backend/schema/dependency. Not a redesign — realizes Dottie's committed ink identity (DOTTIE §2 P1/P2) in the hosted panel exactly as standalone; only text that was inheriting Origin's colour is corrected.

## §3 — Verification (this turn, local)
`tsc --noEmit -p tsconfig.app.json` → exit 0. `npm run build` → clean (DottieSurface federated chunk emits). This turn.

## §CCT — Component Contract Table
| Component (file) | Prop / input interface (TS) | Visual authority (VA-id) | Data / contract dependency |
| --- | --- | --- | --- |
| `TheoMain` (`TheoMain.tsx`) | `TheoMainProps` unchanged; root style adds `color: C.ink` (was `background: C.bg` only) | DOTTIE_DESIGN_SYSTEM §2 (committed dark ink) | none (presentational) |

## §GAP — Gap Disclosure
**PROCEED.**
- **G-1 — Companion follow-up.** Pairs with `58e8282` (which set the panel background). Background + foreground together make the mounted 9/10 fully Dottie-themed. Disclosed.
- **G-2 — Nav unaffected.** The 1/10 nav (Sidebar) is portaled separately and already sets its own colours (correct in the mount); this changes only the 9/10 (TheoMain) default text colour. Disclosed.
- **G-3 — Deploy + eyeball.** Lands on `development` → brave-dune; verified mounted in Origin. PROCEED.

## §DELTA — changed files (before → after evidence)
One file (GCR row 5). `TheoMain.tsx` (`c420af97`→`fdd5c4d1`): root style `+ color: C.ink`. No other bytes changed.

## §CODEX — activation (Walter forwards)

```
Codex is activated for Pass-2 FRONTEND review of the Dottie Panel-Mode Text Colour fix, vault-dottie,
"Codex Governance/Dottie-Panel-Text-Color-Pass-1-VEP/Dottie_Panel_Text_Color_VEP.md" @ commit <HEAD>. Open Pass-2 with a
governance-bound GCR + Rule Anchor Table; hard-gate; emit only APPROVED or REJECTED. One-property follow-up to the mount
companion (58e8282). FE-only, no backend/schema/route: TheoMain root now sets color: C.ink (#E7ECF3) alongside the companion's
background: C.bg, so mounted in Origin's 9/10 Dottie's text (e.g. the greeting <h1>, which sets no colour) defaults to her ink
instead of inheriting Origin's light-theme colour (DOTTIE §2 P1/P2 committed dark ink). No-op in mode="full" (the
.vo-standalone wrapper already sets color). One ACTIVE file, one added style property; no new component/prop/route/dependency;
not a redesign. tsc -p tsconfig.app.json exit 0 + vite build clean. Mechanical lint PASS. Emit APPROVED or REJECTED only.
```

*End of Dottie Panel-Mode Text Colour Pass-1 Frontend VEP.*
