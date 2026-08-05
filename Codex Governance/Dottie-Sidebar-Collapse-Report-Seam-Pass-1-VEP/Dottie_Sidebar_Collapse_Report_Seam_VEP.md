# Dottie Sidebar-Collapse Report Seam — Pass 1 Frontend VEP (remote side of the 1/10 icon-strip collapse)

> From Walter's dev-SWA review 2026-08-05: the Dottie 1/10 panel should collapse **like Theo**, and — separately — the **"Toggle sidebar" button** should reduce the 1/10 panel to **icon-strip width** (slightly wider than the icons). Two behaviours: (1) the full VS-Code disappear-collapse **already exists** (Origin `ShellFrame` `panelCollapsed` — re-clicking the active rail icon; DOTTIE §7 "collapsed by re-clicking the active icon … the shell toggles it"). (2) The **icon-strip** reduce is **new**: Dottie's own "Toggle sidebar" button flips her internal `Sidebar` `collapsed` (270 → 58px `railW`), but mounted in Origin the host panel width stays fixed, so the 58px icon-strip sits inside a wide dark panel (the gap Walter sees). Fixing (2) needs the host to know Dottie is collapsed, so it can shrink the 1/10 panel to icon-strip width. **This package is the REMOTE side**: `TheoSurface` gains an optional `onSidebarCollapsed(collapsed)` seam, fired when the internal collapse toggles — mirroring the existing `onNavState` reporting idiom. The Origin side (host consumes it → panel width) is a companion vault-origin package. FE-only; no backend/route/schema.

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Pass 1 — Frontend Verified Evidence Pack (host↔remote collapse-report seam; remote side)
Grounding parent (source baseline): `d2563c5af13f85686a1bb5af1b264ff341a921f4` (vault-dottie, `development`)
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD / proposed) |
| - | ------------------------------- | ------------------------------ | -------------------------------------------- |
| 1 | VISUAL/ARCH AUTHORITY — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/spec/DOTTIE_DESIGN_SYSTEM.md` (§7 Origin shell contract — the 1/10 app-menu; collapse; the shell toggles it) | `Read`/`Grep`(§7, lines 143–176) this turn | `744523cf905df1186d954b86519b1cdeddac539c` |
| 2 | FE Grounding Conformance — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR + Rule Anchor) | grounded; unchanged @ HEAD | `4f2f42e799be5db31e1e35e523d656ff4c1c057e` |
| 3 | FE Governor — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md` (reproduce faithfully / no redesign) | grounded; unchanged @ HEAD | `3afec7ea4b13650ce2bf28bf32073179a35e7b24` |
| 4 | Codex FE Review — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/CODEX_THEO_FRONTEND_REVIEW_STANDARD.md` (Pass-2; APPROVED/REJECTED only) | grounded; unchanged @ HEAD | `25cc488091d619d8f6642b10552df0d019a87933` |
| 5 | PRIMARY REFERENCE / CHANGED — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/src/theo/TheoSurface.tsx` (the single federated surface; adds `onSidebarCollapsed` seam mirroring `onNavState`) | `Read`(full) + `Edit` this turn | base @HEAD `2009f1c9ba8142ea2e20b3b843f509ccd1fa33e3` → proposed `d11b2271a5da69c101906948c9022e960a5eed98` |

No ChatGPT advisory cited. No backend / route / schema / migration; one ACTIVE source file.

## Rule Anchor Table

| Source doc (absolute path) | Clause id | Verbatim clause text (read this turn) | Applied in output at |
| -------------------------- | --------- | ------------------------------------- | -------------------- |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/spec/DOTTIE_DESIGN_SYSTEM.md | §7 | "Dottie renders **into** shell-owned slots and must not draw shell chrome" | §1 — the remote reports its collapse and never sizes/draws the panel itself; the shell (which owns the 1/10 slot) does |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/spec/DOTTIE_DESIGN_SYSTEM.md | §7 | "collapsed by re-clicking the active icon" | §1 — the full VS-Code disappear-collapse (ask 1) already exists shell-side; this seam adds the icon-strip width response (ask 2) |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/spec/DOTTIE_DESIGN_SYSTEM.md | §7 | "the shell toggles it" | §1 — the shell owns the 1/10 panel; the remote's seam only reports `collapsed` so the shell can size it |

---

## §1 — Feature
Dottie's internal `Sidebar` has a "Toggle sidebar" button that flips `collapsed` (its own `railW = collapsed ? 58 : 270`). Standalone that just narrows her rail; mounted in Origin, the host owns the 1/10 panel width, so a collapsed 58px rail sits inside a wider dark panel (the empty gap in Walter's review). To let the host shrink the panel to icon-strip width when Dottie is collapsed, the surface must **report** its collapse to the host. This package adds an optional `onSidebarCollapsed?(collapsed: boolean)` prop to `TheoSurfaceProps`, fired whenever the internal `t.collapsed` changes — the exact ref-held idiom already used for `onNavState` (report internal nav state to the host). The host-side response (panel → icon-strip width) is a **separate vault-origin package**; this remote change is inert until a host wires the callback (and standalone is unaffected). The full disappear-collapse (ask 1) is already shell-owned (DOTTIE §7 "collapsed by re-clicking the active icon"; Origin `panelCollapsed`) and is untouched here.

## §2 — Architecture & boundary
One ACTIVE file, `TheoSurface.tsx`: (a) `TheoSurfaceProps` gains `onSidebarCollapsed?: (collapsed: boolean) => void` (optional, additive — existing callers unchanged); (b) it is destructured in the component signature; (c) a ref-held reporting effect fires `onSidebarCollapsedRef.current?.(t.collapsed)` keyed on `t.collapsed` — identical pattern to the adjacent `onNavState` effect (a ref holds the latest callback so the effect keys only on the reported value). No change to `Sidebar`, `useTheoState`, the portal branch, the standalone branch, or any other prop. No new file/component/route/backend/schema/dependency. **Not a redesign** — a one-way host-report seam mirroring the existing `onNavState`/`backNonce`/`newChatNonce` host-integration seams (App Host §6A in-process, never postMessage).

## §3 — Verification (this turn, local)
`tsc --noEmit -p tsconfig.app.json` → **exit 0**. `npm run build` → **clean** (DottieSurface federated chunk emits, 345.82 kB). This turn, on `development` @ `d2563c5`. The seam is optional and standalone/unwired hosts are unaffected (the ref is undefined → the effect's optional-chain no-ops). End-to-end behaviour (panel shrinks to icon-strip) is exercised once the companion vault-origin package wires the callback + drives the panel width (§GAP G-1).

## §CCT — Component Contract Table
| Component (file) | Prop / input interface (TS) | Visual authority (VA-id) | Data / contract dependency |
| --- | --- | --- | --- |
| `TheoSurface` (`TheoSurface.tsx`) | `TheoSurfaceProps` gains `onSidebarCollapsed?: (collapsed: boolean) => void` — optional, additive; fired on internal `t.collapsed` change; all existing props (`appContext`, `navSlot`, `mainSlot`, `getAccessToken`, `suppressNarrowHeader`, `newChatNonce`, `onNavigate`, `onNavState`, `backNonce`) unchanged | DOTTIE_DESIGN_SYSTEM §7 (the shell owns the 1/10 slot; the remote renders into it) | none new — reports existing `useTheoState().collapsed`; host consumption is the companion Origin package |

## §GAP — Gap Disclosure
**PROCEED.**
- **G-1 — Host side is a companion package.** The panel actually shrinks to icon-strip width only once the vault-origin package wires `onSidebarCollapsed` through `DottieMount` → `ShellFrame` → `ShellLeftPanel` (icon-strip width when collapsed). This remote seam is a safe, inert-until-consumed precondition. Disclosed; sequenced next.
- **G-2 — Symmetric with Theo.** The identical seam is being added to vault-theo's `TheoSurface` (same component lineage) so Theo's mounted "Toggle sidebar" gets the same icon-strip behaviour (Walter: "both Dottie + Theo together"). Separate repo/package. Disclosed.
- **G-3 — Full disappear-collapse unchanged.** Ask 1 (re-click rail icon → panel gone) is already shell-owned (`panelCollapsed`); not touched here. Disclosed.

## §DELTA — changed files (before → after evidence)
One file (GCR row 5). `TheoSurface.tsx` (`2009f1c9`→`d11b2271`): adds the optional `onSidebarCollapsed` prop to `TheoSurfaceProps` (with a doc comment), destructures it in the component signature, and adds the ref-held reporting effect (keyed on `t.collapsed`) directly after the existing `onNavState` effect. No other bytes changed; `Sidebar`/portal/standalone branches untouched.

## §CODEX — activation (Walter forwards)

```
Codex is activated for Pass-2 FRONTEND review of the Dottie Sidebar-Collapse Report Seam, vault-dottie,
"Codex Governance/Dottie-Sidebar-Collapse-Report-Seam-Pass-1-VEP/Dottie_Sidebar_Collapse_Report_Seam_VEP.md" @ commit <HEAD>.
Open Pass-2 with a governance-bound GCR + Rule Anchor Table; hard-gate; emit only APPROVED or REJECTED. FE-only, no
backend/schema/route. Walter's dev-SWA review: the Dottie 1/10 panel should collapse like Theo (ask 1 — the full VS-Code
disappear-collapse ALREADY exists shell-side: Origin panelCollapsed / re-click the active rail icon; DOTTIE §7 "collapsed by
re-clicking the active icon … the shell toggles it" — untouched here), AND the "Toggle sidebar" button should reduce the 1/10
panel to icon-strip width (ask 2 — NEW). Dottie's Sidebar toggle flips internal collapsed (railW 270→58) but the host owns the
panel width, so a collapsed rail leaves a dark gap. Fix (remote side): TheoSurface gains optional onSidebarCollapsed(collapsed)
fired on internal t.collapsed change — the SAME ref-held idiom as the adjacent onNavState reporting effect. Inert until a host
wires it; standalone unaffected. The Origin side (consume it → panel width) is a companion vault-origin package (G-1); the
identical seam goes to vault-theo (G-2, "both together"). Review: not a redesign — one ACTIVE file, one additive optional prop +
one reporting effect mirroring onNavState; Sidebar/portal/standalone branches unchanged; existing callers unchanged (DOTTIE §7,
the shell owns the 1/10 slot). tsc exit 0 + vite build clean. Mechanical lint PASS. Emit APPROVED or REJECTED only.
```

*End of Dottie Sidebar-Collapse Report Seam Pass-1 Frontend VEP.*
