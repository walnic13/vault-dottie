# Dottie FE Logo Mark — Pass-1 Frontend VEP (DottieMark / DottieSpiral; gold, deconstruct)

Implements Dottie's brand mark per the **binding** design system (`spec/DOTTIE_DESIGN_SYSTEM.md`, Codex-APPROVED). New `DottieSpiral.tsx` exports **`DottieMark`** (static identity mark) + **`DottieSpiral`** (active "thinking" mark), and the transplanted warm Theo marks (`VaultMark` / `SpiralAssemble`) are swapped out at every call site in `ChatView.tsx` + `Sidebar.tsx`. **The geometry is byte-verbatim from Theo's `SpiralMark`/`SpiralAssemble`** (the shared Vault wedges from `vault-origin/public/icon.svg`) — Dottie only **recolours it monochrome-gold** and, in the thinking state, **animates it as her signature deconstruct**: the spiral dissolves outer→seed to the fixed centre dot (the "Dottie number", +30% size), which slow-heartbeats, blooms to ~5.6×, and drifts back to a glowing dot, then rebuilds — the exact inverse of Theo's *constructing* spiral (Walter-approved concept, iterated + locked). Dot radius/glow are driven in JS (reliable SVG animation). **Final tuning per Walter's dev-SWA review:** the gold ramp is **rich all-gold end-to-end** (no muddy olive tail; the core is a solid gold, not near-white, so it holds on today's cream surface as well as the dark console it's designed for), and render sizes are bumped (welcome/splash 40→64, thinking/message avatar 22→30, sidebar 20→24). Locked geometry/params: STEP 150, BLOOM 12 s, swell 5.6×, dot r 4.42. `tsc -p tsconfig.app.json` + `npm run build` clean.

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Pass 1 — Frontend Verified Evidence Pack
Grounding parent (source baseline): `546fd21c4a8d83d346e487761f51fec7be9dab73` (vault-dottie, `development`)
Grounding mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD) |
| - | ------------------------------- | ------------------------------ | --------------------------------- |
| 1 | Claude Code Theo Frontend Governor — `governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md` (§3 VEP+CCT; §4 UI authority) | `Grep("Component Contract Table")` this turn | `3afec7ea4b13650ce2bf28bf32073179a35e7b24` |
| 2 | Theo Frontend Grounding Conformance — `governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR; §4A.1 F-P walk; §5 Rule Anchor) | `Grep("Grounding Conformance Receipt")` this turn | `4f2f42e799be5db31e1e35e523d656ff4c1c057e` |
| 3 | Codex Theo Frontend Review — `governance/CODEX_THEO_FRONTEND_REVIEW_STANDARD.md` (Pass-2 surface) | cited; unchanged @ HEAD | `25cc488091d619d8f6642b10552df0d019a87933` |
| 4 | Theo Golden Component Pack — `governance/THEO_GOLDEN_COMPONENT_PACK_STANDARD.md` (§canonical primary reference; structural mirror) | `Grep("canonical")` this turn | `0035a1d9fed103d07bf420b957c3727ec47fcc6b` |
| 5 | **VISUAL AUTHORITY (binding) — `spec/DOTTIE_DESIGN_SYSTEM.md`** (Codex-APPROVED; §1 P1/P2 gold-on-ink identity; §2.3 gold accent; the mark logo direction) — the authority this mark realises | `Read`(§1/§2) this turn | `744523cf905df1186d954b86519b1cdeddac539c` |
| 6 | **PRIMARY REFERENCE (geometry) — `src/theo/components/SpiralMark.tsx`** (byte-verbatim Vault wedges; the static mark Dottie recolours) | `Read`(full) this turn | `404f9463022646c8f21af6cf72f39c76778bddd8` |
| 7 | **PRIMARY REFERENCE (animation) — `src/theo/components/SpiralAssemble.tsx`** (the same wedges + generated tail; the reveal-order / breathing loop Dottie inverts) | `Read`(full) this turn | `b460afa1a5fc438e95fbf6fbc280a9a3be9cc218` |
| 8 | **NEW COMPONENT — `src/theo/components/DottieSpiral.tsx`** (exports `DottieMark` + `DottieSpiral`; final gold ramp + params) | `Read`(full) this turn | `2dd0df3dc82b9cd2d484d229dbb6e15e459d4617` |
| 9 | **SWAP — `src/theo/components/ChatView.tsx`** (VaultMark→DottieMark ×3, SpiralAssemble→DottieSpiral ×2; sizes bumped) | `Read`(§imports/§L427/600/649/744) this turn | `d92045658c3f73b8783931d2c95efccd82a12fff` |
| 10 | **SWAP — `src/theo/components/Sidebar.tsx`** (VaultMark→DottieMark ×1; size bumped) | `Read`(§imports/§L59) this turn | `107a982b7c010f3cc64208a80ff6ff0d53845421` |

No ChatGPT advisory cited. No `reporting_*` change; no backend/route/schema/migration. Frontend component package (no write SQL).

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt (GCR) and a Rule Anchor Table" | GCR + this table |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §3 | "MUST contain a **Component Contract Table**" | §CCT |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §4 | "reproduce it faithfully, do not redesign" | §UI-RECON — the mark realises the binding design system (Dottie's own visual authority); geometry is byte-verbatim, only colour + deconstruct are Dottie's authorised identity |
| governance/THEO_GOLDEN_COMPONENT_PACK_STANDARD.md | §canonical | "Structural Mirror" | §CCT — DottieMark/DottieSpiral mirror SpiralMark/SpiralAssemble geometry; gold recolour + deconstruct + JS dot are the enumerated deltas |
| governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md | §4A.1 | "Pass 1 Plan-Authoring Sub-Phases" | §F-P walk |

---

## §F-P walk (F-P1 – F-P7)
**F-P1 Feature.** Dottie's brand mark: a monochrome-gold recolour of the shared Vault Spiral-of-Theodorus, static (`DottieMark`, identity) + animated (`DottieSpiral`, thinking = deconstruct→dot-bloom→rebuild).
**F-P2 UI authority reconciliation.** See §UI-RECON. Realises the **binding** `DOTTIE_DESIGN_SYSTEM.md` (GCR row 5). AUTHORIZED-DELTA (Dottie's own visual authority replaces the transplanted Theo mark for Dottie), NOT a `VISUAL-AUTHORITY-DEVIATION`.
**F-P3 Backend/contract grounding.** None — pure client-side SVG. No endpoint/data change.
**F-P4 Component reference grounding.** Canonical Primary Reference = `SpiralMark.tsx` (GCR row 6) + `SpiralAssemble.tsx` (GCR row 7). Dottie reuses their **exact wedge geometry, apex `O`, unit `U`, `tailPoints`/`bounds`, and reveal-order (`data-o`) machinery**; the deltas are (a) monochrome-gold recolour keyed by reveal order, (b) deconstruct-lead + JS-driven dot bloom, (c) the +30% glowing centre dot. §CCT enumerates them.
**F-P5 CCT.** See §CCT — DottieMark, DottieSpiral (new), and the two swap files.
**F-P6 Repository & active-surface grounding.** Active surface `vault-dottie/src/theo/**`. `tsc -p tsconfig.app.json` exit 0; `npm run build` clean (459 modules). `VaultMark.tsx`/`SpiralAssemble.tsx` become orphaned (tree-shaken; disclosed §GAP).
**F-P7 VEP assembly.** GCR + Rule Anchor; F-P walk; §UI-RECON; §CCT; §GAP; §DELTA; §CODEX.

## §UI-RECON — UI Authority Reconciliation
The visual authority for Dottie is now `DOTTIE_DESIGN_SYSTEM.md` (binding), which supersedes the "byte-verbatim transplant of Theo's FE" basis **for Dottie**. This mark realises that authority: her identity is the **gold** Vault spiral with the deconstruct signature. Swapping `VaultMark`→`DottieMark` and `SpiralAssemble`→`DottieSpiral` at every call site is that realisation, not a redesign of Theo — Theo's own marks are untouched, and the geometry is byte-identical. Classification: **AUTHORIZED-DELTA** (Walter-directed identity + binding design system). No `VISUAL-AUTHORITY-DEVIATION`.

## §CCT — Component Contract Table
| Component (file) | Prop / input interface (TS) | Visual authority (VA-id) | Data / contract dependency |
| ---------------- | --------------------------- | ------------------------ | -------------------------- |
| `DottieMark` (`src/theo/components/DottieSpiral.tsx`, NEW export) | `DottieMark({ size = 40 }: { size?: number; variant?: "static" \| "building" })` — renders the gold-recoloured byte-verbatim wedges (`STATIC_MARKUP`) + a fixed glowing centre `<circle r=4.42>` (+30%). `variant` accepted for drop-in parity with `VaultMark` (no motion either way). | `DOTTIE_DESIGN_SYSTEM.md` §2 (gold #D7B15C/#EBC97D on ink) | none (static SVG). Replaces `VaultMark` at identical call sites. |
| `DottieSpiral` (`src/theo/components/DottieSpiral.tsx`, NEW export) | `DottieSpiral({ size = 22 }: { size?: number })` — same wedges as `ANIM_MARKUP` + a `.dot`; `useEffect` loop: deconstruct outer→seed (`data-o`, STEP 150) → JS rAF dot bloom (heartbeat → 5.6× swell → drift, `KF`/`scaleAt`, glow via drop-shadow) → rebuild seed→out → PAUSE → loop. `prefers-reduced-motion` holds the finished gold mark. Cleanup clears timers + rAF. | `DOTTIE_DESIGN_SYSTEM.md` §1 P1/P2 + the deconstruct concept | none. Replaces `SpiralAssemble` (thinking state). |
| `ChatView` (`src/theo/components/ChatView.tsx`) | `ChatView` prop interface UNCHANGED. Delta: import line now `import { DottieSpiral, DottieMark } from "./DottieSpiral";`; `<VaultMark …>`→`<DottieMark …>` (L427 `size={64} variant="static"`, L600 `size={64} variant="building"`, L649 `size={30}`) and `<SpiralAssemble size={22} />`→`<DottieSpiral size={30} />` (L649 loading branch, L744). | VA-T1 chat surface unchanged except the mark identity | consumes DottieMark/DottieSpiral |
| `Sidebar` (`src/theo/components/Sidebar.tsx`) | `Sidebar` prop interface UNCHANGED. Delta: `import { DottieMark } from "./DottieSpiral";`; `<VaultMark size={20} />`→`<DottieMark size={24} />` (L59, workspace/product header). | VA-T1 sidebar unchanged except the mark | consumes DottieMark |

## §GAP — Gap Disclosure
`PROCEED` (deployable; `tsc`+build clean; identity per the binding authority).
- **G-1 (orphaned Theo marks): PROCEED.** `VaultMark.tsx` + `SpiralAssemble.tsx` are no longer referenced by the Dottie FE (tree-shaken from the bundle). Left in place (harmless); `SpiralMark`/`SpiralAssemble` remain the cited geometry primary reference. A later cleanup may delete them. Disclosed.
- **G-2 (icons.tsx comment): PROCEED (cosmetic).** A stale comment in `icons.tsx` still names VaultMark/SpiralAssemble; comment-only, no runtime effect. Disclosed.
- **G-3 (Walter dev-SWA verify): PRE-LAND.** Landed on `development`→dev SWA (`brave-dune-0a97c7d03`); Walter eyeballs the static mark (header/sidebar/avatar) + the thinking animation (send a message) before any prod promotion.

## §DELTA — the changed files (implementation evidence)
`DottieSpiral.tsx` (new) is the full component (GCR row 8, blob `7127260…`) — the byte-verbatim `WEDGES`, the shared `O`/`U`/`tailPoints`/`bounds`/`VB`, the `goldAt` ramp + reveal-order recolour, `DottieMark` (static), and `DottieSpiral` (the deconstruct + JS dot-bloom loop, params locked with Walter: STEP 150, BLOOM 12 s, swell 5.6×, dot r 4.42). The swaps are the import + JSX-tag substitutions enumerated in §CCT (ChatView blob `15af0f1…`, Sidebar blob `46882a1…`). No other lines change.

## §CODEX — activation
```
Codex — Dottie FE Logo Mark Pass-1 VEP. Open your Pass-2 with a governance-bound GCR + Rule Anchor Table
per the Codex Theo Frontend Review Standard, hard-gate, APPROVED/REJECTED only. vault-dottie @ development
HEAD 546fd21c4a8d83d346e487761f51fec7be9dab73. VEP: Codex Governance/Dottie-FE-Logo-Mark-Pass-1-VEP/
Dottie_FE_Logo_Mark_VEP.md. Frontend component package (no backend/route/schema/migration). Realises the
BINDING spec/DOTTIE_DESIGN_SYSTEM.md (GCR row 5, blob 744523c). New DottieSpiral.tsx (blob 2dd0df3d) exports
DottieMark (static gold identity) + DottieSpiral (thinking = deconstruct outer→seed + JS-driven dot bloom +
rebuild); geometry is byte-verbatim from SpiralMark/SpiralAssemble (GCR rows 6/7) — deltas are gold recolour,
deconstruct-lead, and the +30% glowing dot (§CCT). VaultMark→DottieMark / SpiralAssemble→DottieSpiral swapped
at all call sites in ChatView (blob d9204565) + Sidebar (blob 107a982b); prop interfaces unchanged. tsc -p
tsconfig.app.json + npm run build clean. APPROVED or REJECTED only.
```
