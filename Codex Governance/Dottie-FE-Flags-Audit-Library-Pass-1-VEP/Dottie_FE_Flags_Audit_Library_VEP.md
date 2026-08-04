# Dottie FE — Open flags · Audit trail · Library & Sources (pkg 3b.3) — Pass 1 Frontend Verified Evidence Pack

The third FE increment of the 9/10 governance console (DOTTIE_DESIGN_SYSTEM §6.1). Adds the three remaining **read-only** console sections, completing every §6.1 section that reads the findings/flags store:
- **Open flags** (`FlagsView`) — the flags Dottie has raised, filterable by status (Open / Resolved / All); the flag row is the shared `FlagRow`.
- **Audit trail** (`AuditView`) — a terse, time-ordered ledger of her governance activity (every check + flag as an event, newest first), distinct from the rich Checks cards.
- **Library & Sources** (`LibraryView`) — the authorities she cites and the documents she has asked for, aggregated (with counts) across every check.
All three are **derived entirely from the deployed `dottie_findings`/`dottie_flags` store** (no new backend). **Additive + FE-only:** three new leaf views + the `View` union + three nav entries + three icons. One small, disclosed data change: `loadOverview` now fetches `listFlags("all")` (was `"open"`) so the Flags surface can filter by status — the Overview display is unchanged (it still filters open client-side). Workflows (needs `dottie_review_chains`) is pkg 3c; the flag **resolve action** (needs a `dottie_flag_resolve` write handler) + Overview-as-default-landing are follow-ups.

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Pass 1 — Frontend Verified Evidence Pack
Grounding parent (source baseline): `321f8b57102730cc62e7073ef8aa5a98dc717500` (vault-dottie, `development`)
Grounding mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD / proposed) |
| - | ------------------------------- | ------------------------------ | -------------------------------------------- |
| 1 | VISUAL AUTHORITY (binding) — `spec/DOTTIE_DESIGN_SYSTEM.md` (§6.1 the console sections: Open flags, Audit trail, Library & Sources; §2.4 semantic verdicts; §2.5 mono provenance) | `Read`(§123–187) this session | `744523cf905df1186d954b86519b1cdeddac539c` |
| 2 | DATA AUTHORITY (binding, Codex-APPROVED) — `spec/DOTTIE_MEMORY_MODEL.md` (§2.4 dottie_findings/dottie_flags; §5 Console surfaces read the store) | `Read`(§2.4/§5) this session | `6bcdb25b92d532536922b2057d4b854f9613d0ce` |
| 3 | FE Grounding Conformance — `governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR + Rule Anchor) | grounded; unchanged @ HEAD | `4f2f42e799be5db31e1e35e523d656ff4c1c057e` |
| 4 | FE Governor — `governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md` (§3 CCT; §4 reproduce faithfully / do not redesign) | grounded; unchanged @ HEAD | `3afec7ea4b13650ce2bf28bf32073179a35e7b24` |
| 5 | Codex FE Review — `governance/CODEX_THEO_FRONTEND_REVIEW_STANDARD.md` (Pass-2 reviewer; APPROVED/REJECTED only) | grounded; unchanged @ HEAD | `25cc488091d619d8f6642b10552df0d019a87933` |
| 6 | Golden Component Pack — `governance/THEO_GOLDEN_COMPONENT_PACK_STANDARD.md` (Primary Reference / Structural Mirror) | grounded; unchanged @ HEAD | `0035a1d9fed103d07bf420b957c3727ec47fcc6b` |
| 7 | NEW — `src/theo/components/FlagsView.tsx` (Open-flags surface: status tabs + FlagRow list) | `Write` this turn | proposed `dd624c35e8c06b144533b267a95099cd743a5ef7` |
| 8 | NEW — `src/theo/components/AuditView.tsx` (chronological check/flag event ledger) | `Write` this turn | proposed `47cf3bf798a0aee08d134913dbf1cbb1def35133` |
| 9 | NEW — `src/theo/components/LibraryView.tsx` (authorities + docs aggregated across findings) | `Write` this turn | proposed `8f8b054c65c3ad5ed54f64f5e3c40a732212e861` |
| 10 | CHANGED — `src/theo/types.ts` (`View` += `flags`\|`audit`\|`library`) | `Edit` this turn | proposed `9d6421119b9329dffcd8b23399f0b63ac9966d5c` |
| 11 | CHANGED — `src/theo/components/icons.tsx` (adds `IcFlag`/`IcAudit`/`IcLibrary`, same `SV` idiom) | `Edit` this turn | proposed `77bb1da137ef8c56de802245dca4305a24a980bc` |
| 12 | CHANGED — `src/theo/data.ts` (`NAV` += the three sections, gated on `DOTTIE_CAPABILITIES.overview`; nav comment) | `Edit` this turn | proposed `ee43d14b8c6cdcb7c121ff22dc126fca8d9e645c` |
| 13 | CHANGED — `src/theo/useTheoState.ts` (`applyView` loads console data for the three views; `currentLoc` maps them; **`loadOverview` now fetches `listFlags("all")`**; NavLoc + loadOverview comments) | `Edit` this turn | proposed `767433f5d22a324a0b751c06a6f41a06d8f56c1b` |
| 14 | CHANGED — `src/theo/components/TheoMain.tsx` (render the three views; header labels) | `Edit` this turn | proposed `1a13d15ef2860c7f50533dcfda4252a39860385b` |

No ChatGPT advisory cited. No backend / route / schema / migration touched (FE-only; reads the DEPLOYED 3a.2 handlers). The gold `DottieSpiral`, pkg-1 palette, pkg-2 renderer, `swapBlock` capabilities, the deployed gateway/handlers, and every non-console view are unchanged.

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt" | GCR (head) |
| governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §4 | "reproduce it faithfully" | §UI-RECON — realises the §6.1 Open-flags / Audit / Library sections |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §4 | "do not redesign" | §UI-RECON — additive new views; no existing view/renderer/backend changed |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §3 | "Component Contract Table" | §CCT |
| spec/DOTTIE_DESIGN_SYSTEM.md | §6.1 | "Audit trail" | §F-P1 / AuditView — the dedicated section |
| spec/DOTTIE_DESIGN_SYSTEM.md | §2.4 | "These carry meaning and must never be swapped for the accent." | the three views — verdict/severity colours (flag markers, audit dots, tabs) are the semantic C tokens, never the gold accent |

---

## §F-P1 — Feature identification + UI-authority
Complete the read-only §6.1 console sections: **Open flags** (status-filterable flag list), **Audit trail** (time-ordered check/flag ledger), **Library & Sources** (authorities + documents aggregated across checks). Verdict/severity colours are the semantic `C` tokens (§2.4 — flag markers, audit dots, filter tabs); provenance (citations, timestamps, eyebrows) is `MONO` (§2.5).

## §F-P2 — Architecture / boundary reconciliation
Additive, FE-only, standalone. All three read the SAME deployed store the Overview/Checks already use — **no new gateway/handler/route/schema**. Wiring through existing seams:
- Three new leaf views (`FlagsView`/`AuditView`/`LibraryView`), each consuming `findings`/`flags` from state; `FlagsView` reuses the shared `FlagRow`, `AuditView`/`LibraryView` derive from `findings`/`flags` (event merge + tally).
- `types.ts` `View` += `"flags"|"audit"|"library"`; `data.ts` `NAV` += three entries (all gated on the existing `DOTTIE_CAPABILITIES.overview` — same handlers); `icons.tsx` += `IcFlag`/`IcAudit`/`IcLibrary`; `TheoMain` += three additive render branches + header labels; `useTheoState` `applyView` loads console data for the three views + `currentLoc` maps them.
- **One disclosed data change:** `loadOverview` now calls `listFlags("all")` (was `"open"`), so the Flags surface can show Resolved/All. The **Overview display is unchanged** — it already filters `status === "open"` client-side, so its open-flags count/list are identical; the extra (resolved) rows only feed the new Flags surface. No prop-interface change to any component; no other existing behaviour/DOM change beyond the additive branches.

## §F-P3 — Backend grounding
Reads the DEPLOYED `dottie_findings_list` + `dottie_flags_list` (pkg 3a.2, Codex-APPROVED `5741a4c`, live 2026-08-04). `dottie_flags_list` already supports `?status=open|resolved|all` (its `status` param, deployed); `loadOverview` now passes `all`. No new route/contract; `Finding`/`Flag` shapes unchanged.

## §F-P4 — Component-reference grounding
Primary Reference = the APPROVED 3b.1/3b.2 console views + the shared `FindingCard`/`FlagRow` primitives (reused verbatim by `FlagsView`; `verdictMeta`/`severityColor` reused by `AuditView`) + the deployed view-switch/nav idiom. `LibraryView`'s tally + `AuditView`'s event merge are plain derivations over `Finding`/`Flag` arrays.

## §F-P5 — Component Contract Table
See §CCT. Net-new interfaces: `FlagsView({ flags, loading })`, `AuditView({ findings, flags, loading })`, `LibraryView({ findings, loading })`.

## §F-P6 — Repository & active-surface grounding
- `tsc --noEmit -p tsconfig.app.json` → **exit 0** (this turn). The `View` extension, the three views, and the `loadOverview` `listFlags("all")` call all resolve; no `any`; no unused imports.
- `npm run build` (`vite build`) → **clean** (467 modules transformed — +3 for the three views; `dist/` emitted). This turn.
- Visual verification (this turn): a faithful static render of the three surfaces was produced headless at 2× and inspected — the Flags status tabs + severity-marked rows, the Audit timeline (verdict-colour dots — filled for checks, hollow-ring for flag events — + mono eyebrow + timestamp), and the Library authority/doc chips with counts all render per §6.1/§2.4/§2.5. Published preview: `https://claude.ai/code/artifact/c407112f-8bfd-4ca7-90d4-95e7020c81d9`.
- Gotchas honoured: Tailwind Preflight unaffected; `import type` kept; the unused `Verdict` import was removed from `AuditView`; the harness (no backend) shows empty surfaces via the gateway `[]` fallback.

## §F-P7 — VEP assembly
This pack (GCR + Rule Anchor Table + F-P walk + UI-RECON + CCT + GAP + DELTA + CODEX). Mechanical lint PASS.

## §UI-RECON — AUTHORIZED build (realises the visual authority; not a redesign)
The three views **implement** the binding §6.1 Open-flags / Audit-trail / Library-&-Sources sections. Verdict/severity colours are the semantic `C` tokens (§2.4 — flag ⚑ markers, audit event dots, status/verdict filter tabs; never the gold accent, which appears only on a neutral active "All" tab); provenance is `MONO` (§2.5). Purely additive — no existing view, the chat, the renderer, or the backend is touched (§4 "do not redesign"); the sole non-new change is the `loadOverview` `listFlags("all")` widening, disclosed §F-P2/§GAP G-1 (Overview display unchanged). No VISUAL-AUTHORITY-DEVIATION rows.

## §CCT — Component Contract Table
| Component (file) | Prop / input interface (TS) | Visual authority (VA-id) | Data / contract dependency |
| --- | --- | --- | --- |
| `FlagsView` (`components/FlagsView.tsx`) | `{ flags: Flag[]; loading: boolean }` — internal `useState<"open"\|"resolved"\|"all">`; renders shared `FlagRow` | DOTTIE_DESIGN_SYSTEM §6.1 (Open flags) / §2.4 | consumes `Flag[]` only |
| `AuditView` (`components/AuditView.tsx`) | `{ findings: Finding[]; flags: Flag[]; loading: boolean }` — merges to a sorted `AuditEvent[]`, read-only | DOTTIE_DESIGN_SYSTEM §6.1 (Audit trail) / §2.4 | consumes `Finding[]`/`Flag[]` only |
| `LibraryView` (`components/LibraryView.tsx`) | `{ findings: Finding[]; loading: boolean }` — tallies `authorities[]` + `docs_expected[]`, read-only | DOTTIE_DESIGN_SYSTEM §6.1 (Library & Sources) / §2.5 | consumes `Finding[]` only |
| `useTheoState` (`useTheoState.ts`) | **prop-less hook; return object unchanged** (`findings`/`flags`/`overviewLoading` already exposed since 3b.1); `applyView` loads console data for `flags`/`audit`/`library`; `currentLoc` maps them; `loadOverview` now fetches `listFlags("all")` (behaviour: fetches all statuses; Overview display unchanged) | DOTTIE_DESIGN_SYSTEM §6.1 | via `theoClient.listFlags("all")` (deployed) |
| `TheoMain` / `data.ts` / `types.ts` / `icons.tsx` | **`TheoMainProps` unchanged**; additive `flags`/`audit`/`library` render branches + header labels; `View` += 3; `NAV` += 3 (gated on `DOTTIE_CAPABILITIES.overview`); 3 net-new icons | DOTTIE_DESIGN_SYSTEM §6.1 | unchanged |

## §GAP — Gap Disclosure
**PROCEED.**
- **G-1 — `loadOverview` now fetches all flag statuses.** Changed `listFlags("open")` → `listFlags("all")` so the Flags surface can filter Open/Resolved/All. The **Overview is display-identical** (it filters `status === "open"` client-side); only the fetched set widened. Disclosed.
- **G-2 — Flag resolve is display-only.** The Flags surface shows status but has no resolve action — that needs a `dottie_flag_resolve` write handler (backend), a small later package. Today all flags are Open (nothing resolves them yet), so Resolved/All render empty/equal-to-Open. Disclosed.
- **G-3 — Audit / Library are derived, not stored.** `AuditView` merges findings+flags into a client-side event list; `LibraryView` tallies the findings' `authorities`/`docs_expected`. No persistence of an audit log or a curated library — the store IS the source. Disclosed.
- **G-4 — Workflows = pkg 3c.** The remaining §6.1 section (Workflows / governance queue) needs `dottie_review_chains` (§2.4 / build-order 3) — a backend package, next. Overview-as-default-landing (entangled with the mount restore gate) is also deferred. Disclosed.
- **G-5 — Deploy + eyeball.** Lands on `development` → dev SWA; populated by real adjudication turns.

## §DELTA — changed files (before → after evidence)
All 8 files git-diffable base→proposed (GCR rows 7–14). NEW: `FlagsView.tsx`, `AuditView.tsx`, `LibraryView.tsx`. CHANGED (all additive except the one disclosed data widening): `types.ts` (`View` += 3), `icons.tsx` (+3 icons), `data.ts` (+3 NavItems + comment), `useTheoState.ts` (applyView/currentLoc for the 3 views + comment + `loadOverview` `listFlags("all")`), `TheoMain.tsx` (+imports +labels +3 render branches). No existing function/prop/DOM of any non-console view changed; no backend.

## §CODEX — activation (Walter forwards)

```
Codex is activated for Pass-2 FRONTEND review of the Dottie Open-flags / Audit-trail / Library-&-Sources surfaces (FE pkg
3b.3), vault-dottie, "Codex Governance/Dottie-FE-Flags-Audit-Library-Pass-1-VEP/Dottie_FE_Flags_Audit_Library_VEP.md" @
commit <HEAD>. Open your Pass-2 with a governance-bound GCR + Rule Anchor Table; hard-gate; emit only APPROVED or REJECTED.
Third console increment: the three remaining read-only §6.1 sections, all DERIVED from the deployed dottie_findings/
dottie_flags store (no new backend). AUTHORIZED build that realises the visual authority; does NOT redesign it. Review:
(1) ADDITIVE + FE-only — three new leaf views (FlagsView reuses the shared FlagRow; AuditView merges findings+flags into a
time-ordered event list; LibraryView tallies authorities[]/docs_expected[]) + View union += 3 + three nav entries + three
icons; NO change to the chat, the pkg-2 renderer, the backend, or any route/schema; no prop-interface change to any
component. (2) ONE DISCLOSED DATA CHANGE (§GAP G-1): loadOverview now calls listFlags("all") instead of "open" so the Flags
surface can filter by status — the Overview is DISPLAY-IDENTICAL (it filters status==="open" client-side); only the fetched
set widened. dottie_flags_list already supports ?status=all (deployed). (3) §2.4 — verdict/severity colours are the
semantic C tokens (flag markers, audit dots, tabs), never the gold accent (only the neutral "All" active tab); §2.5 —
citations/timestamps/eyebrows are MONO. (4) flag resolve is display-only (needs a dottie_flag_resolve handler, later);
Audit/Library are derived, not stored (§GAP G-2/G-3). (5) Workflows = 3c; Overview-as-landing deferred (§GAP G-4). tsc -p
tsconfig.app.json exit 0 + npm run build clean (467 modules) (§F-P6). Mechanical lint PASS. Emit APPROVED or REJECTED only.
```
