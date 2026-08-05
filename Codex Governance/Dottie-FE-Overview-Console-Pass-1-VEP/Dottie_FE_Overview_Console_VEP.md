# Dottie FE — Overview Console (pkg 3b.1) — Pass 1 Frontend Verified Evidence Pack

The first FE increment of the 9/10 governance console (DOTTIE_DESIGN_SYSTEM §6.1). Adds the **Overview** — Dottie's oversight dashboard — reading her operational L4 store through the DEPLOYED `dottie_findings_list` / `dottie_flags_list` handlers (pkg 3a.2, live 2026-08-04). A new `overview` view + nav section, a summary stat row (checks + per-verdict counts + open flags), a "Recent checks" list (findings as verdict-ruled cards) and an "Open flags" list. **Additive + FE-only:** a new `OverviewView` component + a three-layer data path (`gateway.live` → `theoClient` → `useTheoState`) + the `View` union + one nav entry; **no change to the chat, the renderer, or any existing view**; no backend/route/schema. Realises DOTTIE_MEMORY_MODEL §5 (Console → Overview = `dottie_findings` + `dottie_flags`). The dedicated Checks / Open-flags / Audit surfaces are pkg 3b.2; Workflows / Library (need `dottie_review_chains`) are pkg 3c.

**Rev 2 — Codex Pass-2 REJECT remediation (T13, stale source comments).** Codex REJECTED rev 1 (`5127f54`): three comments in files this package edits had gone stale against the actual delta — `data.ts` header ("only Dottie delta is the NAV filter … every other list verbatim") + the hidden-feature note (Artifacts "until artifacts persistence lands", now live), and the `useTheoState` `NavLoc` comment ("projects / artifacts / customize", missing `overview`). Comment-only fix (no runtime change): `data.ts` header + nav comment now describe the console-section additions + the current capability state; the `NavLoc` comment includes `overview`; and (pre-emptive) the `swapBlock` capabilities header now notes the Dottie-native console sections alongside the transplanted Theo features. Swept the edited files for other stale nav/view/capability comments — none remain.

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Pass 1 — Frontend Verified Evidence Pack
Grounding parent (source baseline): `5741a4c4476478188b122abd3a8f875eaee4e2fa` (vault-dottie, `development`)
Grounding mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD / proposed) |
| - | ------------------------------- | ------------------------------ | -------------------------------------------- |
| 1 | VISUAL AUTHORITY (binding) — `spec/DOTTIE_DESIGN_SYSTEM.md` (§6.1 the 9/10 governance console / Overview oversight dashboard; §2.4 semantic verdicts; §2.5 mono provenance; §7 shell contract) | `Read`(§123–187) this session | `744523cf905df1186d954b86519b1cdeddac539c` |
| 2 | DATA AUTHORITY (binding, Codex-APPROVED) — `spec/DOTTIE_MEMORY_MODEL.md` (§5 Console → Overview = dottie_findings + dottie_flags + dottie_review_chains) | `Read`(§5) this session | `6bcdb25b92d532536922b2057d4b854f9613d0ce` |
| 3 | FE Grounding Conformance — `governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR + Rule Anchor) | grounded; unchanged @ HEAD | `4f2f42e799be5db31e1e35e523d656ff4c1c057e` |
| 4 | FE Governor — `governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md` (§3 Component Contract Table; §4 reproduce faithfully / do not redesign) | grounded; unchanged @ HEAD | `3afec7ea4b13650ce2bf28bf32073179a35e7b24` |
| 5 | Codex FE Review — `governance/CODEX_THEO_FRONTEND_REVIEW_STANDARD.md` (Pass-2 reviewer; APPROVED/REJECTED only) | grounded; unchanged @ HEAD | `25cc488091d619d8f6642b10552df0d019a87933` |
| 6 | Golden Component Pack — `governance/THEO_GOLDEN_COMPONENT_PACK_STANDARD.md` (Primary Reference / Structural Mirror discipline) | grounded; unchanged @ HEAD | `0035a1d9fed103d07bf420b957c3727ec47fcc6b` |
| 7 | NEW — `src/theo/components/OverviewView.tsx` (the oversight dashboard: stat row + finding cards + flag rows) | `Write` this turn | proposed `9bff424c68e1e8fde2f08f6c417388e51c06f92f` |
| 8 | CHANGED — `src/theo/types.ts` (`View` += `overview`; new `Verdict`/`Finding`/`Flag` interfaces = the read-handler shapes) | `Read` + `Edit` this turn | proposed `8040e6cdbc9b9725ae1cb7dc8f1ea64bcbf2a4ec` |
| 9 | CHANGED — `src/theo/services/gateway.live.ts` (`listFindings` + `listFlags` — GET the deployed handlers, mirror `listConversations`) | `Read` + `Edit` this turn | proposed `2bcddd9d46d8997852ff8f17c2c41c0da63de65d` |
| 10 | CHANGED — `src/theo/services/theoClient.ts` (`listFindings`/`listFlags` wrappers) | `Read` + `Edit` this turn | proposed `aad415fb38e7567cc4cc57d114424e028a8d4cd2` |
| 11 | CHANGED — `src/theo/useTheoState.ts` (`findings`/`flags`/`overviewLoading` state + `loadOverview` + `applyView("overview")` + return-object expose; rev-2 NavLoc comment adds `overview`) | `Read` + `Edit` this turn | proposed `d167eaf5ecae80d497f6cdc3d9f345f012150e83` |
| 12 | CHANGED — `src/theo/components/TheoMain.tsx` (render `OverviewView` for `view==="overview"` + the header label) | `Read` + `Edit` this turn | proposed `5f57005617804540573141e958f42bee655f63d4` |
| 13 | CHANGED — `src/theo/data.ts` (`NAV` gains the `overview` entry, gated on `DOTTIE_CAPABILITIES.overview`; `chats` relabelled "Ask Dottie"; rev-2 header + nav comments updated to match) | `Read` + `Edit` this turn | proposed `a7330166d2d6280570430224afd08f032fffad8e` |
| 14 | CHANGED — `src/theo/swapBlock.ts` (`DOTTIE_CAPABILITIES.overview = true` — the read handlers are live; rev-2 header comment notes Dottie-native console sections) | `Read` + `Edit` this turn | proposed `c1d39b6f14bca6fc245df49dc0ac95437ae1b288` |
| 15 | CHANGED — `src/theo/components/icons.tsx` (adds `IcOverview` — a shield-check oversight glyph, same `SV` idiom) | `Read` + `Edit` this turn | proposed `2f8bc6040b5f5fdcdc6a470abd8a50edc3561bef` |

No ChatGPT advisory cited. No backend / route / schema / migration touched (FE-only; reads the DEPLOYED 3a.2 handlers). The gold `DottieSpiral`, the pkg-1 palette, the pkg-2 governance renderer, and every existing view (chat/projects/artifacts/customize) are unchanged.

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt" | GCR (head) |
| governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §4 | "reproduce it faithfully" | §UI-RECON — the Overview realises the §6.1 dashboard the binding spec specifies |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §4 | "do not redesign" | §UI-RECON — additive new view; no existing view/renderer/chat changed |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §3 | "Component Contract Table" | §CCT |
| spec/DOTTIE_DESIGN_SYSTEM.md | §6.1 | "oversight dashboard" | §F-P1 / OverviewView — checks-on-Theo, verdicts, open flags |
| spec/DOTTIE_DESIGN_SYSTEM.md | §2.4 | "These carry meaning and must never be swapped for the accent." | OverviewView — verdict colours (stat numbers, badges, card rules) are the semantic C tokens, never the gold accent |
| spec/DOTTIE_MEMORY_MODEL.md | §5 | "How this maps to the FE" | §F-P3 — Console → Overview reads dottie_findings + dottie_flags (the deployed 3a.2 handlers) |

---

## §F-P1 — Feature identification + UI-authority
Build the **Overview** — the first section of the 9/10 governance console (DOTTIE_DESIGN_SYSTEM §6.1: "Overview (oversight dashboard — checks-on-Theo, verdicts, open flags…)"). It is Dottie's home and her Codex-role oversight surface. The increment renders: a summary stat row (total checks + per-verdict counts + open-flag count), "Recent checks" (each finding a verdict-ruled card — badge, review target, the claim, Dottie's read, citation chips, confidence), and "Open flags" (severity-marked rows). Verdict colours are the semantic `C` tokens (§2.4, never the gold accent); provenance (sources, cites, confidence, dates) renders `MONO` (§2.5).

## §F-P2 — Architecture / boundary reconciliation
Additive, FE-only, standalone (Track 1 — the console ships independently of the Origin shell; §7.2 registration is a later mount package). The change is a **new leaf view + a data path**, wired through the existing seams:
- `types.ts`: `View` union gains `"overview"`; new `Verdict`/`Finding`/`Flag` interfaces = the exact `dottie_findings_list`/`dottie_flags_list` row shapes.
- data path (mirrors the deployed `listConversations` three-layer idiom): `gateway.live.listFindings/listFlags` (GET the deployed handlers; unconfigured harness → `[]`) → `theoClient.listFindings/listFlags` (wrappers) → `useTheoState` (`findings`/`flags`/`overviewLoading` state + `loadOverview` called from `applyView("overview")`, best-effort, keep-current-on-error).
- `TheoMain`: an additive `view==="overview"` branch renders `<OverviewView>`; the header else-branch gains the `"Overview"` label (consistent with Projects/Artifacts).
- `data.ts` `NAV`: an `overview` entry gated on the new `DOTTIE_CAPABILITIES.overview` (true — handlers live); `chats` relabelled "Ask Dottie" (§6.2 name; the `View` key `"chats"` is unchanged).
No existing component's behaviour or prop interface changes; the chat, the pkg-2 governance renderer, and every other view are byte-untouched.

## §F-P3 — Backend grounding
Reads the DEPLOYED pkg-3a.2 handlers (Codex-APPROVED `5741a4c`, deployed + registered 2026-08-04): `GET /api/dottie_findings_list` (`data.findings`) and `GET /api/dottie_flags_list?status=open` (`data.flags`). The `Finding`/`Flag` TS interfaces match the handlers' SELECT columns exactly (DOTTIE_MEMORY_MODEL §5 Console → Overview). No new route/contract; owner-scoped by EasyAuth as every `dottie_*` read.

## §F-P4 — Component-reference grounding
Primary Reference = the deployed `listConversations` three-layer idiom (`gateway.live`/`theoClient`/`useTheoState` — the fetch/parse/`data.*`/mock-fallback shape the two new gateway methods mirror) + the deployed view-switch idiom (`TheoMain` `view===` branches; `data.ts` `NAV` capability-gate). `OverviewView` is a net-new leaf component authored to the §6.1 dashboard, reusing the VA-T1 inline-style + `C`/`MONO`/`SANS` token idiom and the pkg-2 verdict visual language (badge/left-rule/cite-chip) verbatim.

## §F-P5 — Component Contract Table
See §CCT. The one net-new public interface is `OverviewView({ findings, flags, loading, onOpenConversation? })`; `Finding`/`Flag` are the read-handler contract types.

## §F-P6 — Repository & active-surface grounding
- `tsc --noEmit -p tsconfig.app.json` → **exit 0** (this turn). The `View` union extension, the `Finding`/`Flag` types across the gateway/client/state/view, and the new component all resolve; no `any`.
- `npm run build` (`vite build`) → **clean** (462 modules transformed — +1 for `OverviewView`; `dist/` emitted, index 484.33 kB). This turn.
- Visual verification (this turn): a faithful static translation of `OverviewView` + the console chrome was rendered headless at 2× and inspected — the console rail (Overview active), the stat row, verdict-ruled finding cards, cite chips, and flag rows all render per §6.1/§2.4/§2.5. Published preview: `https://claude.ai/code/artifact/c87f4f64-d81e-4c95-b1a5-874fcdad73bb`.
- Gotchas honoured: Tailwind Preflight unaffected; `import type` kept (`ReactNode`, `Finding`/`Flag`/`Verdict` type-only); no value/type import mixing; the harness (no backend) shows an empty Overview via the gateway `[]` fallback (no crash).

## §F-P7 — VEP assembly
This pack (GCR + Rule Anchor Table + F-P walk + UI-RECON + CCT + GAP + DELTA + CODEX). Mechanical lint PASS.

## §UI-RECON — AUTHORIZED build (realises the visual authority; not a redesign)
The Overview **implements** the binding DOTTIE_DESIGN_SYSTEM §6.1 oversight dashboard — it does not redesign the authority. Every colour/typography choice traces to the system: verdict colours are the semantic `C` tokens used only for meaning (§2.4 — never the gold accent); all provenance is `MONO` (§2.5); the card/badge/cite-chip language is the pkg-2 governance-component vocabulary reused. It is **purely additive** — no existing view, the chat, or the renderer is touched (§4 "do not redesign"). No VISUAL-AUTHORITY-DEVIATION rows.

## §CCT — Component Contract Table
| Component (file) | Prop / input interface (TS) | Visual authority (VA-id) | Data / contract dependency |
| --- | --- | --- | --- |
| `OverviewView` (`components/OverviewView.tsx`) | `{ findings: Finding[]; flags: Flag[]; loading: boolean; onOpenConversation?: (conversationId: string) => void }` — read-only render; `onOpenConversation` reserved (unwired this increment) | DOTTIE_DESIGN_SYSTEM §6.1 (oversight dashboard) / §2.4 (verdict colours) / §2.5 (mono) | consumes `Finding[]`/`Flag[]` only |
| `types.ts` `Finding`/`Flag`/`Verdict` | `type Verdict = "concur"\|"caution"\|"challenge"`; `interface Finding { id; target_ref; target_kind: "theo_answer"\|"workpaper"\|"context_item"\|"conversation"; verdict: Verdict; confidence_level: number\|null; confidence_label: string\|null; claim_source: string\|null; claim_text: string\|null; lead: string\|null; conclusion: string\|null; authorities: string[]; flags: string[]; docs_expected: string[]; conversation_id: string\|null; created_at: string }`; `interface Flag { id; finding_id: string\|null; flag_type: string; severity: "low"\|"medium"\|"high"; target_ref: string\|null; summary: string\|null; status: "open"\|"resolved"; created_at: string; resolved_at: string\|null }`; `View` gains `"overview"` | — (contract types = the 3a.2 read-handler rows) | none — pure types |
| `gateway.live` / `theoClient` (`services/*`) | added `listFindings(limit?): Promise<Finding[]>` + `listFlags(status?: "open"\|"resolved"\|"all", limit?): Promise<Flag[]>`; **no existing signature changed** | DOTTIE_MEMORY_MODEL §5 | GET the deployed `dottie_findings_list`/`dottie_flags_list` |
| `useTheoState` (`useTheoState.ts`) | **prop-less hook; return object gains `findings`/`flags`/`overviewLoading`** (additive); `applyView` gains an `overview` branch | DOTTIE_DESIGN_SYSTEM §6.1 | via `theoClient` |
| `TheoMain` (`components/TheoMain.tsx`) | **`TheoMainProps` unchanged**; additive `view==="overview"` render branch + header label | DOTTIE_DESIGN_SYSTEM §6.1 | unchanged (`t` prop) |
| `data.ts` `NAV` / `swapBlock` `DOTTIE_CAPABILITIES` / `icons` | `NAV` gains an `overview` `NavItem` (gated on `DOTTIE_CAPABILITIES.overview`, additive key); `chats` label → "Ask Dottie"; `IcOverview` net-new icon | DOTTIE_DESIGN_SYSTEM §6.1/§6.2 | none |

## §GAP — Gap Disclosure
**PROCEED.**
- **G-1 — Dedicated surfaces are pkg 3b.2.** This increment is the **Overview** dashboard only (which already surfaces recent checks + open flags inline). The dedicated **Checks on Theo** / **Open flags** / **Audit trail** sections (§6.1) — with filtering, per-finding detail, resolve actions — are pkg 3b.2. `onOpenConversation` is the reserved seam for opening a finding's source turn. Disclosed.
- **G-2 — Workflows / Library = pkg 3c.** The **Workflows** (governance queue) section needs `dottie_review_chains` (§2.4 / build-order 3), and **Library & Sources** is a later section — both pkg 3c, not in this increment's nav. Disclosed.
- **G-3 — Standalone nav still carries chat chrome; Overview is not yet the default landing.** In standalone mode the existing `Sidebar` still shows the New-chat button + Recents below the console sections, and the initial `view` remains `"chats"`. Making Overview the console's default landing + a console-first rail is a small follow-up (3b.2). This increment is additive so the working chat is undisturbed. Disclosed.
- **G-4 — Interim target labels.** A finding card shows `claim_source` / `target_ref` as written by 3a.2's interim derivation (until the Origin review-target contract, §7.3 G3). Cosmetic; resolves when that lands. Disclosed.
- **G-5 — Deploy + eyeball.** Lands on `development` → dev SWA `brave-dune-0a97c7d0`; the Overview populates from real findings once adjudication turns run. Disclosed.

## §DELTA — changed files (before → after evidence)
All 9 files git-diffable base→proposed (GCR rows 7–15). NEW: `OverviewView.tsx`. CHANGED (all additive): `types.ts` (`View` += overview; +Finding/Flag/Verdict), `gateway.live.ts` (+listFindings/listFlags after listConversations), `theoClient.ts` (+2 wrappers + imports), `useTheoState.ts` (+state +loadOverview +applyView branch +expose +import), `TheoMain.tsx` (+import +header label +render branch), `data.ts` (+overview NavItem +capability gate; chats→"Ask Dottie"), `swapBlock.ts` (+overview:true), `icons.tsx` (+IcOverview). No existing function/prop/DOM of any other view changed.

## §CODEX — activation (Walter forwards)

```
Codex is activated for Pass-2 FRONTEND review of the Dottie Overview console (FE pkg 3b.1), vault-dottie,
"Codex Governance/Dottie-FE-Overview-Console-Pass-1-VEP/Dottie_FE_Overview_Console_VEP.md" @ commit <HEAD>. Open your
Pass-2 with a governance-bound GCR + Rule Anchor Table; hard-gate; emit only APPROVED or REJECTED. This is the first
increment of the 9/10 governance console (spec/DOTTIE_DESIGN_SYSTEM §6.1): the Overview oversight dashboard reading the
DEPLOYED 3a.2 dottie_findings_list/dottie_flags_list handlers (DOTTIE_MEMORY_MODEL §5 Console->Overview). An AUTHORIZED
build that realises the visual authority; it does NOT redesign it. Review: (1) ADDITIVE + FE-only — a new OverviewView +
a three-layer data path (gateway.live -> theoClient -> useTheoState) mirroring the deployed listConversations idiom + the
View union + one nav entry; NO change to the chat, the pkg-2 renderer, or any existing view/prop/DOM; no backend/route/
schema. (2) §2.4 — verdict colours are the semantic C tokens (stat numbers, badges, card left-rules), never the gold
accent; §2.5 — provenance (sources/cites/confidence/dates) is MONO. (3) Finding/Flag TS interfaces match the 3a.2 read-
handler SELECT columns exactly (§CCT). (4) capability-gated nav (DOTTIE_CAPABILITIES.overview=true, handlers live); chats
relabelled "Ask Dottie" (§6.2), View key unchanged. (5) dedicated Checks/Flags/Audit surfaces = 3b.2, Workflows/Library =
3c, Overview-as-default-landing + console-first rail = 3b.2 (§GAP). tsc -p tsconfig.app.json exit 0 + npm run build clean
(§F-P6). DottieSpiral + pkg-1 palette + pkg-2 renderer unchanged. Mechanical lint PASS. Emit APPROVED or REJECTED only.
```
