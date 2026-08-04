# Dottie FE — "Checks on Theo" surface + traceability (pkg 3b.2) — Pass 1 Frontend Verified Evidence Pack

The second FE increment of the 9/10 governance console (DOTTIE_DESIGN_SYSTEM §6.1). Adds the dedicated **Checks on Theo** surface — the full, verdict-filterable log of every check Dottie has made (richer than the Overview's recent-checks strip: each card shows the conclusion + documentation-expected, and clicks through to the source turn) — and **traceability** (clicking a finding opens the conversation where Dottie made it, via the existing `selectRecent`). Reads the same DEPLOYED `dottie_findings_list` handler as the Overview (pkg 3a.2); no new backend. To share the card vocabulary it extracts the finding/flag render primitives from `OverviewView` (pkg 3b.1) into a shared `FindingCard.tsx` — a behaviour-identical refactor that also threads the new `onOpen`. **Additive + FE-only:** a new `ChecksView` + shared `FindingCard` + the `View` union + one nav entry; no change to the chat, the pkg-2 renderer, the backend, or any route/schema. Open-flags / Audit surfaces + Overview-as-default-landing are pkg 3b.3; Workflows / Library (need `dottie_review_chains`) are pkg 3c.

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Pass 1 — Frontend Verified Evidence Pack
Grounding parent (source baseline): `80e1cf742e852f31d0aa01e75473c5f957acd708` (vault-dottie, `development`)
Grounding mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD / proposed) |
| - | ------------------------------- | ------------------------------ | -------------------------------------------- |
| 1 | VISUAL AUTHORITY (binding) — `spec/DOTTIE_DESIGN_SYSTEM.md` (§6.1 the console sections incl. "Checks on Theo"; §2.4 semantic verdicts; §2.5 mono provenance) | `Read`(§123–187) this session | `744523cf905df1186d954b86519b1cdeddac539c` |
| 2 | DATA AUTHORITY (binding, Codex-APPROVED) — `spec/DOTTIE_MEMORY_MODEL.md` (§2.4 dottie_findings; §5 Console surfaces read the store) | `Read`(§2.4/§5) this session | `6bcdb25b92d532536922b2057d4b854f9613d0ce` |
| 3 | FE Grounding Conformance — `governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR + Rule Anchor) | grounded; unchanged @ HEAD | `4f2f42e799be5db31e1e35e523d656ff4c1c057e` |
| 4 | FE Governor — `governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md` (§3 CCT; §4 reproduce faithfully / do not redesign) | grounded; unchanged @ HEAD | `3afec7ea4b13650ce2bf28bf32073179a35e7b24` |
| 5 | Codex FE Review — `governance/CODEX_THEO_FRONTEND_REVIEW_STANDARD.md` (Pass-2 reviewer; APPROVED/REJECTED only) | grounded; unchanged @ HEAD | `25cc488091d619d8f6642b10552df0d019a87933` |
| 6 | Golden Component Pack — `governance/THEO_GOLDEN_COMPONENT_PACK_STANDARD.md` (Primary Reference / Structural Mirror) | grounded; unchanged @ HEAD | `0035a1d9fed103d07bf420b957c3727ec47fcc6b` |
| 7 | PRIOR (APPROVED 3b.1) — `src/theo/components/OverviewView.tsx` (the finding/flag cards this package extracts to the shared primitive) | `Read` + `Edit` (refactor) this turn | base @HEAD `9bff424c68e1e8fde2f08f6c417388e51c06f92f` → proposed `0e8ec22a9eae2c5ac520c47d52f219dfb6465b9b` |
| 8 | NEW — `src/theo/components/FindingCard.tsx` (shared `FindingCard`/`FlagRow` + helpers, extracted from 3b.1 OverviewView; `FindingCard` gains `onOpen`/`detail`) | `Write` this turn | proposed `f58cc5e81a27d70fec100a0d27df9a338d4317a9` |
| 9 | NEW — `src/theo/components/ChecksView.tsx` (the full findings log + verdict-filter tabs + click-through) | `Write` this turn | proposed `b4572dc5d46d3e9be64e284ca7568cae629afdc2` |
| 10 | CHANGED — `src/theo/types.ts` (`View` += `checks`) | `Edit` this turn | proposed `766a4288abe6e41094e3396f17ea5a531198a1a1` |
| 11 | CHANGED — `src/theo/components/TheoMain.tsx` (render `ChecksView`; header label; wire `onOpenConversation = t.selectRecent` on both console views) | `Edit` this turn | proposed `20f077094643968bbd632e1f396ea0c29edbc492` |
| 12 | CHANGED — `src/theo/useTheoState.ts` (`applyView("checks") → loadOverview`; `currentLoc` maps `checks`; NavLoc comment) | `Edit` this turn | proposed `950e713180bd4eea3a6b533ee81700146f58ad3a` |
| 13 | CHANGED — `src/theo/data.ts` (`NAV` gains `checks`, gated on `DOTTIE_CAPABILITIES.overview`; nav comment) | `Edit` this turn | proposed `f9094b6dfa01cf808d05461c59e8b78fc5dd260b` |
| 14 | CHANGED — `src/theo/components/icons.tsx` (adds `IcChecks` — a clipboard-check glyph, same `SV` idiom) | `Edit` this turn | proposed `f7ce1780bbd6f78f62a9984c3b4d4d2eb7be5b36` |

No ChatGPT advisory cited. No backend / route / schema / migration touched (FE-only; reads the DEPLOYED 3a.2 handler). The gold `DottieSpiral`, pkg-1 palette, pkg-2 renderer, `swapBlock` capabilities, and every non-console view are unchanged.

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt" | GCR (head) |
| governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §4 | "reproduce it faithfully" | §UI-RECON — realises the §6.1 "Checks on Theo" section |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §4 | "do not redesign" | §UI-RECON — additive; the OverviewView change is a behaviour-identical extract |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §3 | "Component Contract Table" | §CCT |
| spec/DOTTIE_DESIGN_SYSTEM.md | §6.1 | "Checks on Theo" | §F-P1 / ChecksView — the dedicated section |
| spec/DOTTIE_DESIGN_SYSTEM.md | §2.4 | "These carry meaning and must never be swapped for the accent." | ChecksView + FindingCard — verdict colours (badges, filter tabs, card rules) are the semantic C tokens, never the gold accent |

---

## §F-P1 — Feature identification + UI-authority
Build the **Checks on Theo** surface — a §6.1 console section: the full log of Dottie's checks, filterable by verdict (All / Concur / Caution / Challenge, with live counts), each a verdict-ruled `FindingCard` in `detail` mode (adds the colour-keyed conclusion callout + documentation-expected chips) that **clicks through to the source conversation**. It is her Codex-role audit view. Verdict colours are the semantic `C` tokens (§2.4); provenance is `MONO` (§2.5).

## §F-P2 — Architecture / boundary reconciliation
Additive, FE-only, standalone. Reads the SAME deployed `dottie_findings_list` handler the Overview already uses — no new gateway/handler/route/schema. Wiring, all through existing seams:
- Extract: the finding/flag render primitives move from `OverviewView` (3b.1) into a shared `components/FindingCard.tsx`; `OverviewView` now imports them (behaviour identical — same JSX/styles) and threads `onOpen`. `FindingCard` gains two optional props: `onOpen?` (click-through when the finding links a conversation) and `detail?` (show conclusion + docs, used by Checks; Overview omits for density).
- `ChecksView`: a new leaf view — verdict-filter tabs (`useState<Filter>`) + the filtered findings list of `FindingCard … detail`.
- `types.ts`: `View` += `"checks"`. `data.ts` `NAV`: a `checks` entry gated on the existing `DOTTIE_CAPABILITIES.overview` (same handler; no new capability flag). `TheoMain`: an additive `view==="checks"` render branch + header label; `onOpenConversation = t.selectRecent` wired on both console views. `useTheoState`: `applyView("checks")` reuses `loadOverview` (loads findings+flags), `currentLoc` maps `checks` as a top-level view.
No existing behaviour/prop/DOM changes except the additive branches; the `OverviewView` diff is a pure extract (no visual/behaviour change) plus passing `onOpen`.

## §F-P3 — Backend grounding
Reads the DEPLOYED `dottie_findings_list` (pkg 3a.2, Codex-APPROVED `5741a4c`, live 2026-08-04) — the same call the Overview makes; `Finding` shape unchanged. Traceability opens a conversation via the deployed `selectRecent` (`dottie_get_conversation`). No new route/contract.

## §F-P4 — Component-reference grounding
Primary Reference = the APPROVED 3b.1 `OverviewView` finding/flag cards (extracted verbatim into `FindingCard`) + the deployed view-switch/nav idiom (`TheoMain` branches; `data.ts` capability-gate). The `detail` additions (conclusion callout + docs chips) reuse the pkg-2 governance-component vocabulary (colour-keyed callout, dashed mono docs chips) verbatim.

## §F-P5 — Component Contract Table
See §CCT. Net-new public interfaces: `FindingCard({ f, onOpen?, detail? })`, `FlagRow({ fl })` (both exported from the shared module), and `ChecksView({ findings, loading, onOpenConversation? })`.

## §F-P6 — Repository & active-surface grounding
- `tsc --noEmit -p tsconfig.app.json` → **exit 0** (this turn). The `View` extension, the shared-module extraction, and `ChecksView` all resolve; no `any`.
- `npm run build` (`vite build`) → **clean** (464 modules transformed — +2 for `FindingCard` + `ChecksView`; `dist/` emitted). This turn.
- Visual grounding: **no separate render was produced for 3b.2** — deliberately, because every visual is a proven primitive: the `FindingCard`/`FlagRow` are the APPROVED 3b.1 cards (rendered + inspected in the 3b.1 Overview preview, byte-identical here bar the additive `onOpen`/`detail`), the `detail` conclusion callout + docs chips are the APPROVED pkg-2 governance-component elements (rendered + inspected in the pkg-2 preview), and the verdict-filter tabs are standard `C`-token pills. tsc + build confirm they compose without error.
- Gotchas honoured: Tailwind Preflight unaffected; `import type` kept (`Finding`/`Flag`/`Verdict`/`ReactNode` type-only); `useState` imported into `ChecksView`; the harness (no backend) shows an empty Checks via the gateway `[]` fallback.

## §F-P7 — VEP assembly
This pack (GCR + Rule Anchor Table + F-P walk + UI-RECON + CCT + GAP + DELTA + CODEX). Mechanical lint PASS.

## §UI-RECON — AUTHORIZED build (realises the visual authority; not a redesign)
`ChecksView` **implements** the binding §6.1 "Checks on Theo" section; the `FindingCard` extract is a behaviour-identical refactor of the APPROVED 3b.1 cards. Verdict colours are the semantic `C` tokens (§2.4 — badges, filter tabs, card rules, callout; never the gold accent, which appears only on the neutral "All" active tab); provenance is `MONO` (§2.5). Purely additive — no existing view, the chat, the renderer, or the backend is touched (§4 "do not redesign"). No VISUAL-AUTHORITY-DEVIATION rows.

## §CCT — Component Contract Table
| Component (file) | Prop / input interface (TS) | Visual authority (VA-id) | Data / contract dependency |
| --- | --- | --- | --- |
| `FindingCard` / `FlagRow` (`components/FindingCard.tsx`) | `FindingCard({ f: Finding; onOpen?: (conversationId: string) => void; detail?: boolean })` — clickable iff `onOpen && f.conversation_id`; `detail` adds conclusion + docs. `FlagRow({ fl: Flag })`. Both read-only | DOTTIE_DESIGN_SYSTEM §2.4 (verdict colours) / §2.5 (mono) / pkg-2 callout | consumes `Finding`/`Flag` only |
| `ChecksView` (`components/ChecksView.tsx`) | `{ findings: Finding[]; loading: boolean; onOpenConversation?: (conversationId: string) => void }` — internal `useState<Filter>` (all\|concur\|caution\|challenge) | DOTTIE_DESIGN_SYSTEM §6.1 (Checks on Theo) | consumes `Finding[]` only |
| `OverviewView` (`components/OverviewView.tsx`) | **props unchanged** (`OverviewViewProps`); refactored to import `FindingCard`/`FlagRow`/`MICRO` from the shared module + passes `onOpen={onOpenConversation}` — no visual/behaviour change | DOTTIE_DESIGN_SYSTEM §6.1 | unchanged |
| `TheoMain` (`components/TheoMain.tsx`) | **`TheoMainProps` unchanged**; additive `view==="checks"` render + header label; `onOpenConversation={t.selectRecent}` on both console views | DOTTIE_DESIGN_SYSTEM §6.1 | unchanged (`t` prop) |
| `useTheoState` / `data.ts` / `types.ts` / `icons.tsx` | `View` += `"checks"`; `applyView`/`currentLoc` gain `checks` (additive; return object unchanged); `NAV` += `checks` `NavItem` (gated on `DOTTIE_CAPABILITIES.overview`); `IcChecks` net-new icon | DOTTIE_DESIGN_SYSTEM §6.1 | via the existing `loadOverview` |

## §GAP — Gap Disclosure
**PROCEED.**
- **G-1 — Open-flags / Audit surfaces + Overview-as-landing = pkg 3b.3.** This increment adds Checks + traceability. The dedicated **Open flags** surface (with a resolve action — needs a `dottie_flag_resolve` write handler, backend) and **Audit trail**, plus making Overview the console's default landing + a console-first rail, are pkg 3b.3. Disclosed.
- **G-2 — Workflows / Library = pkg 3c.** Need `dottie_review_chains` (§2.4 / build-order 3). Disclosed.
- **G-3 — Checks shows the stored finding fields.** A card renders what 3a.1 persists (verdict, claim, lead, conclusion, authorities, docs, confidence, flags); the Authority/What-it-says/How-it-applies support *bodies* are not stored (only the flattened cites), so the full 3-part narrative is not reconstructed here — the conclusion + cites + docs are. Cosmetic scope, not a defect. Disclosed.
- **G-4 — Click-through reuses `selectRecent`.** Opening a finding's conversation switches to Ask Dottie with that thread (via the deployed `dottie_get_conversation`); a finding with a null/`conversation:`-synthetic `conversation_id` is non-clickable. Disclosed.
- **G-5 — Deploy + eyeball.** Lands on `development` → dev SWA; populated by real adjudication turns. Disclosed.

## §DELTA — changed files (before → after evidence)
All 8 files git-diffable base→proposed (GCR rows 7–14). NEW: `FindingCard.tsx`, `ChecksView.tsx`. CHANGED (all additive/refactor): `OverviewView.tsx` (imports the shared primitives instead of local copies — behaviour-identical — + passes `onOpen`), `types.ts` (`View` += checks), `TheoMain.tsx` (+import +label +render branch +onOpen wiring), `useTheoState.ts` (applyView/currentLoc checks + comment), `data.ts` (+checks NavItem + comment), `icons.tsx` (+IcChecks). No existing function/prop/DOM of any non-console view changed; no backend.

## §CODEX — activation (Walter forwards)

```
Codex is activated for Pass-2 FRONTEND review of the Dottie "Checks on Theo" surface + traceability (FE pkg 3b.2),
vault-dottie, "Codex Governance/Dottie-FE-Checks-Surface-Pass-1-VEP/Dottie_FE_Checks_Surface_VEP.md" @ commit <HEAD>. Open
your Pass-2 with a governance-bound GCR + Rule Anchor Table; hard-gate; emit only APPROVED or REJECTED. Second increment of
the 9/10 console (spec/DOTTIE_DESIGN_SYSTEM §6.1 "Checks on Theo"): the full verdict-filterable check log + click-through to
the source turn, reading the SAME deployed dottie_findings_list handler as the Overview (no new backend). AUTHORIZED build
that realises the visual authority; does NOT redesign it. Review: (1) ADDITIVE + FE-only — a new ChecksView + a shared
FindingCard extracted from the APPROVED 3b.1 OverviewView (behaviour-identical refactor: OverviewView base 9bff424c ->
proposed 0e8ec22a imports the shared primitives + passes onOpen; no visual/behaviour change) + the View union += checks +
one nav entry; NO change to the chat, the pkg-2 renderer, the backend, or any route/schema. (2) §2.4 — verdict colours are
the semantic C tokens (badges, filter tabs, card rules, the detail conclusion callout), never the gold accent (which is
only the neutral "All" active tab). (3) reads the deployed dottie_findings_list (Finding shape unchanged); traceability
opens a conversation via the deployed selectRecent/dottie_get_conversation. (4) Checks renders the stored finding fields;
the support bodies aren't persisted (only flattened cites) so the 3-part narrative isn't reconstructed — conclusion + cites
+ docs are (§GAP G-3). (5) Open-flags/Audit + Overview-as-landing = 3b.3; Workflows/Library = 3c (§GAP). No separate render
for 3b.2 — every visual is a proven primitive (3b.1 cards + pkg-2 callout + token pills); tsc -p tsconfig.app.json exit 0 +
npm run build clean (464 modules). Mechanical lint PASS. Emit APPROVED or REJECTED only.
```
