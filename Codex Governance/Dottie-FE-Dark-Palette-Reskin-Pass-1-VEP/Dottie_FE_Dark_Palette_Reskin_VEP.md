# Dottie FE — Dark-Palette Reskin (realise the governance-console identity) — Pass 1 Frontend Verified Evidence Pack

The first FE package of #4 (the Dottie design upgrade). Flips the transplanted cream/coral surface (VA-T1) to Dottie's **dark governance-console identity** by recolouring the central `C` theme object + the global `STYLE_BLOCK` + the residual hard-coded light fills, per the binding `spec/DOTTIE_DESIGN_SYSTEM.md` §2. Palette-only: **no structural/prop/layout change, no new components, no backend/route/schema.** This is the foundation the governance-component renderer (pkg 2) and the Overview console (pkg 3+) build on. The gold `DottieMark`/`DottieSpiral` (Logo-Mark VEP) are already correct and untouched.

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Pass 1 — Frontend Verified Evidence Pack
Grounding parent (source baseline): `85bcdde1e1d49bda4e6a7317cdcc3eca8a15d18e` (vault-dottie, `development`)
Grounding mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD) |
| - | ------------------------------- | ------------------------------ | --------------------------------- |
| 1 | VISUAL AUTHORITY (binding) — `spec/DOTTIE_DESIGN_SYSTEM.md` (§1 P1/P2; §2 tokens; §5 anti-patterns; §9 reuse; §10 governance) | `Read`(full) this turn | `744523cf905df1186d954b86519b1cdeddac539c` |
| 2 | FE Grounding Conformance — `governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR + Rule Anchor) | `Grep`("MUST open with a Grounding Conformance Receipt") this turn | `4f2f42e799be5db31e1e35e523d656ff4c1c057e` |
| 3 | FE Governor — `governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md` (§3 Component Contract Table; §4 reproduce faithfully / do not redesign) | `Grep`("do not redesign") this turn | `3afec7ea4b13650ce2bf28bf32073179a35e7b24` |
| 4 | Codex FE Review — `governance/CODEX_THEO_FRONTEND_REVIEW_STANDARD.md` (Pass-2 reviewer; APPROVED/REJECTED only) | `Grep`("only \`APPROVED\`") this turn | `25cc488091d619d8f6642b10552df0d019a87933` |
| 5 | Golden Component Pack — `governance/THEO_GOLDEN_COMPONENT_PACK_STANDARD.md` (Primary Reference / Structural Mirror discipline) | `Read` this turn | `0035a1d9fed103d07bf420b957c3727ec47fcc6b` |
| 6 | CHANGED — `src/theo/theme.ts` (the `C` recolour: dark ground/panel/text/line + gold accent; font stacks) | `Read` + `Edit` this turn | `9590b6a332d3bf0aecc12ea1df856f5226e54fe6` |
| 7 | CHANGED — `src/theo/TheoSurface.tsx` (`STYLE_BLOCK`: hovers → panel-2, card shadow → dark) | `Read` + `Edit` this turn | `2009f1c9ba8142ea2e20b3b843f509ccd1fa33e3` |
| 8 | CHANGED — `src/theo/components/ChatView.tsx` (white surfaces → panel; gold-button glyphs → dark; warm shadows → dark) | `Read` + `Edit` this turn | `65b2ea7cd4e5f9fe44758f1e2bc7fc2091a075a7` |
| 9 | CHANGED — `src/theo/components/Sidebar.tsx` (search bg → panel; new-chat + avatar text → dark-on-gold) | `Edit` this turn | `38703bc580da216e1b66f154186da8ac9832d579` |
| 10 | CHANGED — `src/theo/lib/markdown.tsx` (inline-code bg → panel) | `Edit` this turn | `acb9b5dc3f50a3870ad5fefacaf1a69d23a3df30` |
| 11 | CHANGED — `src/theo/components/ArtifactPanel.tsx` (version select + iframe bg → panel) | `Edit` this turn | `f8cbf27134276656387aeb55a05cd4b261993f0f` |
| 12 | CHANGED — `src/theo/components/DevContextInjector.tsx` (dev card bg + button → dark/gold; shadow → dark) | `Edit` this turn | `468664f6af644ac0c782a791560f9897427afcb9` |
| 13 | CHANGED — `src/theo/components/ProjectsView.tsx` (create/new-project buttons → dark-on-gold) | `Edit` this turn | `959283c01a81651a3975b756bed55d6f9f5e3d01` |
| 14 | CHANGED — `src/theo/components/Customize.tsx` (Save button → dark-on-gold) | `Edit` this turn | `d1b7ee007dff3339cc51e2dd9235127b7b6fdc39` |
| 15 | CHANGED — `src/theo/components/ProjectDetail.tsx` (surfaces → panel; visibility button → dark-on-gold) | `Edit` this turn | `4667831695e1222f82817ae87307b41fc43c6e41` |
| 16 | CHANGED — `src/theo/components/CitedText.tsx` (popover shadow → dark) | `Edit` this turn | `f6d254b83df5887de650b69dd98e4ebff98c875b` |
| 17 | CHANGED — `src/theo/components/DownloadCard.tsx` (download button text → dark-on-gold) | `Edit` this turn | `88443e0c0929f4bc637bf3df0bc2c84950ce759d` |

No ChatGPT advisory cited. No backend / route / schema / migration touched (FE-only). The gold `DottieSpiral.tsx` (Logo-Mark VEP) is unchanged.

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt" | GCR (head) |
| governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §4 | "reproduce it faithfully" | §UI-RECON — realises the binding design system, does not redesign it |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §4 | "do not redesign" | §UI-RECON — palette recolour only; no structure/layout/prop change |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §3 | "Component Contract Table" | §CCT |
| spec/DOTTIE_DESIGN_SYSTEM.md | §1 | "She looks like a console, not a chatbot" | §F-P1 — the dark identity the reskin realises |
| spec/DOTTIE_DESIGN_SYSTEM.md | §2 | "components reference tokens, never raw hex" | §UI-RECON — recolours the central `C` token object (the token layer), so components keep referencing `C.*`, not raw hex |
| spec/DOTTIE_DESIGN_SYSTEM.md | §5 | "No AI-default dark look" | §F-P1 — cool-ink + gold + mono provenance, not lone-acid-green/teal-on-black |
| spec/DOTTIE_DESIGN_SYSTEM.md | §10 | "Codex reviews FE packages for conformance to this system" | §CODEX — Pass-2 conformance review |

---

## §F-P1 — Feature identification + UI-authority
Realise the dark governance-console **identity** (`DOTTIE_DESIGN_SYSTEM` §2): the whole existing Dottie surface (Ask-Dottie chat + all reachable views) flips from cream/coral to cool-ink ground + gold accent + monospace provenance. "She looks like a console, not a chatbot" — the contrast is the brand (§1 P1/P2). Not the "No AI-default dark look" (§5): the committed cool-ink `#0C0F14` + gold `#D7B15C`, not teal-on-black.

## §F-P2 — Architecture / boundary reconciliation
FE-only, standalone (Track 1 — the console ships independently; needs no Origin shell change yet). No new component, no layout/DOM change, no prop-interface change, no route/backend/schema/migration. The change is a **central token recolour**: `theme.ts`'s `C` object (the token layer every inline style already references) is recoloured, so the surface flips centrally; the `STYLE_BLOCK` (scrollbars/hover/focus, which interpolate `C.*`) follows automatically, with its two hard-coded light values (row hovers, card shadow) recoloured; and the residual per-component hard-coded light fills (white surfaces → `C.card`; white glyphs on the gold accent → `C.bg` for contrast; warm `rgba(40,38,31,…)` shadows → dark) are swept so no surface stays light-on-dark.

## §F-P3 — Backend grounding
N/A — no backend/route/schema/contract touched. `gateway.live.ts` / `theoClient` unchanged.

## §F-P4 — Component-reference grounding
Primary Reference = the **current deployed Dottie FE at the grounding parent** (each changed file's pre-edit blob, git-diffable) + the binding `DOTTIE_DESIGN_SYSTEM` §2 tokens. The change is a colour-value substitution over the existing structure (Structural Mirror: structure byte-identical, values recoloured).

## §F-P5 — Component Contract Table
See §CCT. No prop/input interface changes — the reskin is value-only.

## §F-P6 — Repository & active-surface grounding
- `tsc --noEmit -p tsconfig.app.json` → **exit 0** (this turn). The one net-new token key (`panel2`) + all recolours are type-safe; inline styles referencing `C.bg`/`C.card`/`C.panel2` all resolve.
- `npm run build` (`vite build`) → **clean** (459 modules transformed, built in ~5.3s; `dist/` emitted). This turn.
- Gotchas honoured: Tailwind Preflight unaffected (no reliance on UA defaults introduced; existing list-marker asserts intact); `import type` idiom unchanged; no value/type import mixing added.

## §F-P7 — VEP assembly
This pack (GCR + Rule Anchor Table + F-P walk + UI-RECON + CCT + GAP + DELTA + CODEX). Mechanical lint PASS.

## §UI-RECON — AUTHORIZED-DELTA (not a VISUAL-AUTHORITY-DEVIATION)
This reskin is an **AUTHORIZED-DELTA that realises the binding `DOTTIE_DESIGN_SYSTEM`** — it does not deviate from or redesign the visual authority; it *implements* it, superseding the VA-T1 transplant basis exactly as the design system §3/§10 directs ("reproduce it faithfully"; "do not redesign"). Token-layer note (§2 "components reference tokens, never raw hex"): the FE's token layer is the central `C` object consumed by inline styles; recolouring `C` in place keeps every component referencing tokens (`C.*`), not raw hex — the design system's intent. A future refinement to a `:root` CSS-var layer is a possible later package (disclosed §GAP), not required to realise the dark identity. No VISUAL-AUTHORITY-DEVIATION rows.

## §CCT — Component Contract Table
| Component (file) | Prop / input interface (TS) | Visual authority (VA-id) | Data / contract dependency |
| --- | --- | --- | --- |
| `theme.ts` `C` / `SANS` / `MONO` | exported token object — values recoloured + **one added key `panel2` (`#1A2029`, dark hover/active surface, consumed by `STYLE_BLOCK`)**; no key removed or renamed; `SANS`/`MONO` shape unchanged | DOTTIE_DESIGN_SYSTEM §2 (dark tokens + font stacks) | none — pure design tokens |
| `TheoSurface.tsx` `STYLE_BLOCK` | none (global CSS string; props unchanged) | DOTTIE_DESIGN_SYSTEM §2 (scrollbar/hover/focus on dark) | none |
| `Sidebar` / `ChatView` / `TheoMain` / `ProjectsView` / `ProjectDetail` / `Customize` / `ArtifactPanel` / `CitedText` / `DownloadCard` / `DevContextInjector` / `markdown` | **prop interfaces unchanged** — colour values only | DOTTIE_DESIGN_SYSTEM §2 (ground/panel/text/line/gold; dark-on-gold for accent fills) | unchanged (same gateway/state props) |

## §GAP — Gap Disclosure
**PROCEED.**
- **G-1 — Renderer + console are follow-up packages.** This package is palette-only. The governance component / adaptive renderer (§3/§4) lands in **pkg 2** (`markdown`/`renderAssistant` — the R-RENDERER change); the 9/10 Overview console + surfaces (§6.1) + composer modes (§6.2) land in **pkg 3+**. The verdict/panel/inset tokens the renderer needs are added with pkg 2 (not pre-added here). Disclosed.
- **G-2 — Token-layer form.** Recoloured `C` in place (the existing token object) rather than introducing a `:root` CSS-var layer; both satisfy §2 ("components reference tokens, never raw hex"). A CSS-var migration is an optional later refinement. Disclosed.
- **G-3 — Deliberately-kept whites.** The image-overlay close button + "Open original ↗" link (`ChatView`, rendered on a dark image backdrop) and the user-avatar initials tone remain light — correct on their dark/image grounds, not surfaces. Disclosed.
- **G-4 — Orphaned Theo marks.** `VaultMark.tsx`/`SpiralMark.tsx`/`SpiralAssemble.tsx` remain in-tree (tree-shaken; not referenced) — inherited from the transplant, unrelated to this recolour. Disclosed.
- **G-5 — Deploy + eyeball.** Lands on `development` → dev SWA `brave-dune-0a97c7d0`; Walter eyeballs the dark surface before any prod promotion. Disclosed.

## §DELTA — changed files (before → after evidence)
All 12 files are git-diffable base→proposed at HEAD (GCR rows 6–17). Representative:
- `theme.ts` — `C`: `bg #FAF9F5→#0C0F14`, `sidebar #F0EEE6→#0A0D12`, `bubble #EDEAE0→#1A2029`, `card #FFFFFF→#141922`, +`panel2 #1A2029`; `ink #28261F→#E7ECF3`, `ink2/#ink3`, `line/#line2` → dark; `coral #D97757→#D7B15C` (gold), `coralDk→#EBC97D` (gold-hi), `coralSoft/coralTint → gold-dim wash`; `SANS`/`MONO` aligned to the §2.5 stacks.
- `TheoSurface.tsx` — `STYLE_BLOCK`: `.vo-row/.vo-nav/.vo-ghost:hover background rgba(0,0,0,.04) → ${C.panel2}`; card-hover shadow `rgba(40,38,31,.07) → rgba(0,0,0,.5)`; the `${C.coral*}` interpolations recolour to gold automatically.
- component files — hard-coded `#fff` surfaces → `C.card`; `#fff` glyphs on `C.coral` accent fills → `C.bg` (dark-on-gold contrast); `rgba(40,38,31,…)` shadows → `rgba(0,0,0,…)`.

## §CODEX — activation (Walter forwards)

```
Codex is activated for Pass-2 FRONTEND review of the Dottie dark-palette reskin, vault-dottie,
"Codex Governance/Dottie-FE-Dark-Palette-Reskin-Pass-1-VEP/Dottie_FE_Dark_Palette_Reskin_VEP.md" @ commit
<HEAD>. Open your Pass-2 with a governance-bound GCR + Rule Anchor Table; hard-gate; emit only APPROVED or
REJECTED. This is the first FE package of #4: it realises the binding spec/DOTTIE_DESIGN_SYSTEM §2 dark
governance-console palette over the existing surface — an AUTHORIZED-DELTA (realises the visual authority; does
NOT redesign). Review: (1) palette-ONLY — no prop/layout/DOM/structure change, no new component, no
backend/route/schema (FE-only); the change is a central recolour of theme.ts `C` (the token layer every inline
style references) + the STYLE_BLOCK + the residual hard-coded light fills. (2) §2 "components reference tokens,
never raw hex" is honoured by recolouring the central `C` token object in place (components keep referencing
`C.*`); a `:root` CSS-var layer is a disclosed optional later refinement (§GAP G-2). (3) accent contrast: white
glyphs on the gold accent fill became dark (`C.bg`) for legibility; image-overlay whites deliberately kept (§GAP
G-3). (4) the governance-component renderer + the Overview console are disclosed follow-up packages (§GAP G-1) —
this package is the identity foundation only. (5) tsc -p tsconfig.app.json exit 0 + npm run build clean (§F-P6).
DottieSpiral (logo) unchanged. Mechanical lint PASS. Emit APPROVED or REJECTED only.
```
