# Dottie FE Markdown Lists — Pass-1 Frontend VEP (renderer asserts its own list markers; Preflight-proof)

Fixes a live FE bug (Walter-reported, screenshot): Dottie's answers render as flat, unstructured prose — enumerations show as **indented text with no bullet/number markers** (screenshot: "Format highlights:" followed by marker-less indented sub-items). Walter: *"there must be markdown syntax that the system prompt is not understanding … is there a better way to design the formatting."* **Root cause (deterministic, not the model):** the markdown renderer `src/theo/lib/markdown.tsx` `Formatted` (react-markdown) styles `ul`/`ol` with `paddingLeft: 22` — the marker gutter — but **never asserts `list-style-type`**. The transplanted `src/index.css` pulls in Tailwind **Preflight** (`@tailwind base`), whose base reset sets `ol, ul, menu { list-style: none; margin: 0; padding: 0 }`. With no explicit `listStyleType` on the element, Preflight's `list-style: none` wins → the `<li>`s indent (padding applies) but render **no markers**. This is the "better way" Walter asked for: a self-contained renderer must assert its own list styling instead of depending on ambient host CSS to restore markers (Theo escapes this only because it is viewed **mounted** in vault-origin, where host CSS supplies markers; Dottie standalone has nothing to lean on). The fix adds `listStyleType` + `listStylePosition` to the `ul`/`ol` renderers so lists render identically standalone **or** mounted.

**This is one of the two independent formatting bugs, and the one that could not be fixed by the (separate) system-prompt Format-Directive package.** The Format-Directive package makes gpt-5 *emit* `##`/`**`/`-` markdown; this package makes emitted `-`/`1.` lists *render their markers*. Neither is sufficient alone — emitting bullets that render marker-less still looks flat. This package is renderer-only (no prompt, no backend, no route, no schema change).

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Pass 1 — Frontend Verified Evidence Pack
Grounding parent (source baseline): `6d97e075d9ea47e07a2f79dbe74792cc03a84546` (vault-dottie, `development`)
Grounding mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD) |
| - | ------------------------------- | ------------------------------ | --------------------------------- |
| 1 | Claude Code Theo Frontend Governor Standard — `governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md` (§2 gates; §3 VEP+CCT; §4 UI reconciliation / "do not redesign"; §5 gap disclosure) | `Grep("Component Contract Table")` this turn | `3afec7ea4b13650ce2bf28bf32073179a35e7b24` |
| 2 | Theo Frontend Grounding Conformance Standard — `governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR; §4A.1 F-P walk; §4B Visual Authority Registry; §5 Rule Anchor) | `Grep("Grounding Conformance Receipt")` this turn | `4f2f42e799be5db31e1e35e523d656ff4c1c057e` |
| 3 | Codex Theo Frontend Review Standard — `governance/CODEX_THEO_FRONTEND_REVIEW_STANDARD.md` (Pass-2 review surface) | cited; unchanged blob @ HEAD | `25cc488091d619d8f6642b10552df0d019a87933` |
| 4 | Theo Golden Component Pack Standard — `governance/THEO_GOLDEN_COMPONENT_PACK_STANDARD.md` (canonical primary reference; structural mirror; visual parity) | `Grep("canonical")` this turn | `0035a1d9fed103d07bf420b957c3727ec47fcc6b` |
| 5 | Theo Phase 1A Frontend Plan — `governance/THEO_PHASE_1A_FRONTEND_PLAN.md` (surface + feature basis for the transplanted FE) | cited; unchanged basis @ HEAD | `901271478e8bec29177d379fadbbf3d4701a90fe` |
| 6 | Dottie ↔ Theo Reconciliation — `spec/DOTTIE_THEO_RECONCILIATION.md` (authoritative gap register; render-parity delta recorded here on landing via Role-C) | `Read` this turn | `b211c46efe18e4fb89e2a2210847e2d8c90b6210` |
| 7 | **VISUAL AUTHORITY (VA-T1) — the deployed Theo markdown renderer** = `vault-theo/src/theo/lib/markdown.tsx` (the reference `Formatted` surface Dottie transplants verbatim; the `ul`/`ol` marker contract this package makes Preflight-proof) | `Read`(full) this turn (`vault-dottie/src/theo/lib/markdown.tsx` @ grounding parent, byte-identical transplant) | `b5e6ebde8bb9a7e0f08427148b64de63d6cd1754` — `markdown.tsx` blob SHA at **`vault-theo` `HEAD:src/theo/lib/markdown.tsx`** (the stable VA-T1 reference). **Byte-identical in `vault-dottie` at the grounding parent (`6d97e075:src/theo/lib/markdown.tsx` = `b5e6ebde…`)**: git-verifiable proof of the byte-verbatim transplant. This package commits the single additive delta (explicit `listStyleType`/`listStylePosition` on `ul`/`ol`) on top of that parent, so vault-dottie's blob at THIS package's commit intentionally differs — the disclosed change enumerated in §CCT/§DELTA |

No ChatGPT advisory cited. No `reporting_*` / `theo_*` / `dottie_*` backend object touched. Frontend package (no migration; no write SQL; no route change).

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt (GCR) and a Rule Anchor Table" | GCR + this table |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §3 | "MUST contain a **Component Contract Table**" | §CCT |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §4 | "reproduce it faithfully, do not redesign" | §UI-RECON — asserting the renderer's own documented list-marker contract restores VA-T1's intended rendering; it is NOT a redesign (no markup/layout/palette/interaction change) |
| governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md | §4A.1 | "Pass 1 Plan-Authoring Sub-Phases" | §F-P walk |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §5 | "foreseeable downstream gaps" | §GAP |
| governance/THEO_GOLDEN_COMPONENT_PACK_STANDARD.md | §canonical | "Structural Mirror" | §CCT — the touched component cites its Theo original; only the marker assertion is added |

---

## §F-P walk (F-P1 – F-P7)

**F-P1 Feature identification.** The "feature" is render-correctness of the transplanted markdown surface: make `Formatted` assert its own list markers so ordered/unordered lists render bullets/numbers regardless of ambient CSS. Walter-directed ("match theo style first"). Scope is exactly one file (`src/theo/lib/markdown.tsx`), two element renderers (`ul`, `ol`).

**F-P2 UI authority reconciliation.** See §UI-RECON. VA-T1 is Theo's deployed `Formatted` renderer, whose documented contract renders lists **bulleted/indented** (module docstring line 2: *"headings, ordered/nested lists, tables …"*; the `paddingLeft: 22` on `ul`/`ol` is the reserved marker gutter). The byte-verbatim transplant loses those markers **only** when run standalone under Tailwind Preflight, which resets `list-style: none`. Restoring the markers moves Dottie's rendered output **toward** VA-T1's intended appearance — an AUTHORIZED-DELTA (render-parity restoration, expressly directed by Walter), NOT a `VISUAL-AUTHORITY-DEVIATION`.

**F-P3 Backend/contract grounding.** None. No endpoint, no `dottie_*`/`theo_*` call, no data contract touched. Pure client-side CSS-property assertion on two react-markdown element renderers.

**F-P4 Component reference grounding.** Canonical Primary Reference = the Theo original `vault-theo/src/theo/lib/markdown.tsx` (Golden Component Pack §canonical), proven byte-identical to Dottie's (GCR row 7, blob `b5e6ebde…`). The delta is additive-only: two CSS properties added to the existing inline-style objects on `ul`/`ol`; every other element renderer (`h1`–`h4`, `p`, `li`, `a`, `strong`, `em`, `del`, `hr`, `blockquote`, `pre`, `code`, `table`, `th`, `td`, `img`) is untouched.

**F-P5 Component Contract Table assembly.** See §CCT — one row (`markdown.tsx`). The `Formatted` prop interface (`{ text: string }`) is UNCHANGED.

**F-P6 Repository & active-surface grounding.** Target file is on the active surface (`vault-dottie/src/theo/lib/markdown.tsx`). Preflight-active verified: `tailwind.config.js` declares no `corePlugins` key (Preflight on by default) and `src/index.css:1` is `@tailwind base`. Preflight's `ol, ul, menu { list-style: none }` is documented Tailwind v3 base-reset behavior. Preflight-vulnerability audit of the whole renderer: headings render as `<div>` (not `<h*>`, so Preflight's heading reset never applies) with explicit inline `fontWeight`/`fontSize`; `strong` carries inline `fontWeight: 650`; `a` carries inline `color`/`textDecoration`; `blockquote`/`table`/`code` carry inline styles — **lists were the ONLY Preflight casualty** (the sole element relying on a UA default that Preflight strips). `tsc -p tsconfig.app.json` clean (exit 0).

**F-P7 VEP assembly.** GCR + Rule Anchor Table open the pack; F-P1–F-P7 walked; §UI-RECON; §CCT; §GAP; §DELTA inlines the exact before/after; §CODEX activation closes it.

---

## §UI-RECON — UI Authority Reconciliation

VA-T1 is Theo's deployed `Formatted` renderer. This package makes **no visual redesign**: no markup, layout, palette, spacing, or interaction is altered, and no other element renderer changes. The single delta restores a rendering the VA-T1 renderer already intends:

| Surface | VA-T1 contract (file:anchor) | Change applied | Classification |
| ------- | ---------------------------- | -------------- | -------------- |
| Markdown lists | `markdown.tsx` `ul`/`ol` renderers — `paddingLeft: 22` marker gutter; module docstring "ordered/nested lists" | add `listStyleType` (`disc`/`decimal`) + `listStylePosition: "outside"` so markers render in the existing gutter regardless of Tailwind Preflight | AUTHORIZED-DELTA (render-parity restoration; Walter-directed "match theo style") |

No `VISUAL-AUTHORITY-DEVIATION` is claimed: the change adds no new visual vocabulary — `disc` bullets + `decimal` numbers are the standard list markers the `Formatted` renderer was designed to show (and shows when mounted). It brings standalone Dottie into parity with the VA-T1 renderer's intent; it does not diverge from it.

---

## §CCT — Component Contract Table (the render-parity delta)

| Component (file) | Prop / input interface (TS) | Visual authority (VA-id) | Data / contract dependency |
| ---------------- | --------------------------- | ------------------------ | -------------------------- |
| `src/theo/lib/markdown.tsx` (`MD.ul` / `MD.ol` renderers) | `Formatted({ text }: { text: string })` — UNCHANGED. `MD.ul` inline style gains `listStyleType: "disc", listStylePosition: "outside"`; `MD.ol` gains `listStyleType: "decimal", listStylePosition: "outside"`. Existing props on both (`margin: "8px 0 12px", paddingLeft: 22, lineHeight: 1.6`) retained verbatim. All other `MD.*` element renderers unchanged. | VA-T1 (`markdown.tsx`, byte-identical transplant blob `b5e6ebde…`) | None (client-side render only). Consumed wherever `Formatted` renders (chat replies, cited answers) — no caller edited. |

---

## §GAP — Gap Disclosure

`PROCEED` (deployable + self-contained; one file, two properties, `tsc` clean; no backend/contract dependency).
- **G-1 (reconciliation register entry): PRE-LAND (Role-C on landing).** `spec/DOTTIE_THEO_RECONCILIATION.md` has no render-parity section today; on deploy a Role-C entry records this standalone-Preflight render-parity fix so the register stays the authoritative divergence log. Disclosed.
- **G-2 (Theo carries the same latent standalone bug): PROCEED (out of scope).** Theo's byte-identical renderer would also drop markers if viewed standalone; it is masked because Theo is viewed mounted in vault-origin (host CSS restores markers). Fixing Theo is a separate vault-theo governed package (not Walter-requested here); Dottie is the surface Walter is viewing standalone. Disclosed, not actioned.
- **G-3 (system-prompt Format Directive is the paired fix): PROCEED (separate package).** This package makes emitted lists render markers; the Format-Directive package (backend prompt-string, awaiting Codex) makes gpt-5 emit richer markdown. Both are required for the full "match Theo richness" outcome; each is independently correct and independently deployable. Disclosed.
- **G-4 (nested-list marker variety): PROCEED (acceptable).** All `ul` levels render `disc` (no auto UA `circle`/`square` cascade). This matches a clean single-marker style and the VA-T1 renderer sets no per-depth marker; if depth-varied markers are later desired it is a cosmetic follow-on. Disclosed.

---

## §DELTA — the changed file (implementation evidence)

One file, on `development` @ the grounding parent's child commit. Additive-only: two CSS properties per list renderer over the byte-verbatim VA-T1 transplant.

### `src/theo/lib/markdown.tsx` — assert list markers (before → after)

BEFORE (Preflight strips `list-style`; markers vanish standalone):
```tsx
ul: ({ children }) => <ul style={{ margin: "8px 0 12px", paddingLeft: 22, lineHeight: 1.6 }}>{children}</ul>,
ol: ({ children }) => <ol style={{ margin: "8px 0 12px", paddingLeft: 22, lineHeight: 1.6 }}>{children}</ol>,
```

AFTER (renderer asserts its own markers; renders identically standalone or mounted):
```tsx
// listStyleType/Position are asserted explicitly so bullets/numbers render regardless of ambient
// CSS. Tailwind Preflight (`@tailwind base`) resets `ul,ol { list-style: none }`; without these the
// markers vanish when the surface runs standalone (mounted hosts happen to restore them). Self-contained.
ul: ({ children }) => <ul style={{ margin: "8px 0 12px", paddingLeft: 22, lineHeight: 1.6, listStyleType: "disc", listStylePosition: "outside" }}>{children}</ul>,
ol: ({ children }) => <ol style={{ margin: "8px 0 12px", paddingLeft: 22, lineHeight: 1.6, listStyleType: "decimal", listStylePosition: "outside" }}>{children}</ol>,
```

No other line in the file changes. `tsc -p tsconfig.app.json` exit 0.

---

## §DEPLOY — plan (ordered; deploy-after-Codex)

1. Codex Pass-2 → APPROVED/REJECTED. 2. Claude builds (`npm run build`) + deploys the SWA bundle per the Dottie FE dev-SWA workflow. 3. Claude/Walter verify a list-bearing reply renders bullets/numbers standalone. 4. Role-C: add the render-parity entry to `spec/DOTTIE_THEO_RECONCILIATION.md` (G-1). 5. Walter FE eyeball.

## §CODEX — activation

Codex: please open your Pass-2 with a governance-bound GCR + Rule Anchor Table per the Codex Theo Frontend Review Standard, hard-gate this package, and return APPROVED or REJECTED only. This is a frontend render-correctness package (no backend, no migration, no write SQL, no route change). The single delta adds `listStyleType`/`listStylePosition` to the `ul`/`ol` renderers in `src/theo/lib/markdown.tsx` so lists render their markers under Tailwind Preflight (`@tailwind base` resets `list-style: none`; the renderer never re-asserted it). It is an additive render-parity restoration over the byte-verbatim VA-T1 transplant (GCR row 7, blob `b5e6ebde…` identical in both repos), expressly directed by Walter ("match Theo style"); `tsc -p tsconfig.app.json` is clean.
