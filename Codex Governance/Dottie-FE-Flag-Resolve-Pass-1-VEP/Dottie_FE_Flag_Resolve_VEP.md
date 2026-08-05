# Dottie FE — Flag Resolve action — Pass 1 Frontend Verified Evidence Pack

The FE half of the flag-resolve loose end: a **Resolve / Re-open** button on each flag row, calling the DEPLOYED `dottie_flag_resolve` handler (Codex-APPROVED `c7dbef7`, deployed to `func-dottie` + verified this turn). Adds `gateway.live.resolveFlag` → `theoClient.resolveFlag` → `useTheoState.resolveFlag` (optimistic: flip the flag in state, persist, resync on error), and threads an optional `onResolve` into the shared `FlagRow` (a resolved flag shows a ✓ + strikethrough + a Re-open button). Wired into **both** the Open-flags surface and the Overview open-flags list. **Additive + FE-only:** new gateway/client/state method + one shared-component prop + prop threading; no new component/view/route/schema; no change to the chat or the renderer.

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Pass 1 — Frontend Verified Evidence Pack
Grounding parent (source baseline): `c7dbef7c79292d7afd7f1d90423aca90c589e3fd` (vault-dottie, `development`)
Grounding mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD / proposed) |
| - | ------------------------------- | ------------------------------ | -------------------------------------------- |
| 1 | VISUAL AUTHORITY (binding) — `spec/DOTTIE_DESIGN_SYSTEM.md` (§6.1 Open flags; §2.4 semantic verdicts; §2.5 mono provenance) | `Read`(§123–187) this session | `744523cf905df1186d954b86519b1cdeddac539c` |
| 2 | FE Grounding Conformance — `governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR + Rule Anchor) | grounded; unchanged @ HEAD | `4f2f42e799be5db31e1e35e523d656ff4c1c057e` |
| 3 | FE Governor — `governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md` (§3 CCT; §4 reproduce faithfully / do not redesign) | grounded; unchanged @ HEAD | `3afec7ea4b13650ce2bf28bf32073179a35e7b24` |
| 4 | Codex FE Review — `governance/CODEX_THEO_FRONTEND_REVIEW_STANDARD.md` (Pass-2 reviewer; APPROVED/REJECTED only) | grounded; unchanged @ HEAD | `25cc488091d619d8f6642b10552df0d019a87933` |
| 5 | **CONTRACT (DEPLOYED handler) — `dottie_flag_resolve`** — `Codex Governance/Dottie-Flag-Resolve-Backend-Pass-1-VEP/dottie_flag_resolve.index.js` (POST `{flag_id, status}` → owner-scoped UPDATE; returns `data.flag`) — deployed + GET-back-verified this turn | `Read`(full) this turn | deployed `c1f6fb3f4ea49b00c0c2086fa5c4c50d7629238e` |
| 6 | CHANGED — `src/theo/services/gateway.live.ts` (`resolveFlag` — POST the deployed handler, mirror `renameConversation`) | `Read` + `Edit` this turn | proposed `a3f95d5324be7e832d1dafe2c77cb299274238cf` |
| 7 | CHANGED — `src/theo/services/theoClient.ts` (`resolveFlag` wrapper) | `Edit` this turn | proposed `f83e728b6617d58b0bf3423e9dab658647e2337a` |
| 8 | CHANGED — `src/theo/useTheoState.ts` (`resolveFlag` optimistic handler + return-object expose) | `Edit` this turn | proposed `f0cacff307564ea5b206b2727e66268aaddee08f` |
| 9 | CHANGED — `src/theo/components/FindingCard.tsx` (`FlagRow` gains optional `onResolve` → Resolve/Re-open button + resolved styling) | `Edit` this turn | proposed `e7086d38f47476794d4b596882f58b27df674d68` |
| 10 | CHANGED — `src/theo/components/FlagsView.tsx` (`onResolve` prop → `FlagRow`) | `Edit` this turn | proposed `ea6824ccaaa33b4dd719d865d1b9f9c69bf52c77` |
| 11 | CHANGED — `src/theo/components/OverviewView.tsx` (`onResolveFlag` prop → the open-flags `FlagRow`) | `Edit` this turn | proposed `7ffa8ff958e29f1071172c4c5d100b17dcbe8ce1` |
| 12 | CHANGED — `src/theo/components/TheoMain.tsx` (wire `onResolve/onResolveFlag = t.resolveFlag` on both surfaces) | `Edit` this turn | proposed `0150b85d58b21c689b55800a3b056e4d76e929b7` |

No ChatGPT advisory cited. No backend / route / schema / migration (reads the DEPLOYED handler). The pkg-1 palette, pkg-2 renderer, and every other view are unchanged.

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt" | GCR (head) |
| governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §4 | "reproduce it faithfully" | §UI-RECON — a token-styled action button; no redesign |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §4 | "do not redesign" | §UI-RECON — additive prop + button; **open** rows unchanged when no `onResolve`; resolved-row styling is unconditional on `status === "resolved"` (§F-P2/§CCT) |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §3 | "Component Contract Table" | §CCT |
| spec/DOTTIE_DESIGN_SYSTEM.md | §2.4 | "These carry meaning and must never be swapped for the accent." | the Resolve button + resolved ✓ use `C.concur` (resolved = supported/closed), not the gold accent |

---

## §F-P1 — Feature identification + UI-authority
A **Resolve** action on the Open-flags surface (§6.1): each open flag gets a `C.concur` "Resolve" pill; a resolved flag shows a ✓, strikethrough summary, dimmed row, and a "Re-open" pill. Concur-green carries the "resolved/supported" meaning (§2.4), never the gold accent.

## §F-P2 — Architecture / boundary reconciliation
Additive, FE-only. The data path mirrors the deployed `renameConversation` POST idiom: `gateway.live.resolveFlag(flagId, status)` (POST `dottie_flag_resolve`, unconfigured harness → `null`) → `theoClient.resolveFlag` → `useTheoState.resolveFlag` (optimistic: `setFlags` flips the row's `status`/`resolved_at` immediately, then `theoClient.resolveFlag`; on error `void loadOverview()` resyncs to server truth). The shared `FlagRow` gains an optional `onResolve?` prop; `FlagsView` (via `onResolve`) and `OverviewView` (via `onResolveFlag`) thread `t.resolveFlag` through `TheoMain`. When `onResolve` is absent, **only the Resolve/Re-open button is suppressed**; the **resolved-row styling** (✓ icon, `C.concur`, strikethrough summary, dimmed row) is **unconditional** — it keys on `status === "resolved"`, so any resolved flag renders resolved regardless of `onResolve`. This is a new visual for resolved rows, which only exist once the resolve action is used (in 3b.3 no flag was resolvable, so every row was open-styled); an open row is byte-identical to 3b.3. No new component/view; no prop-interface change beyond the additive optional props; the return object gains `resolveFlag`.

## §F-P3 — Backend grounding
Calls the DEPLOYED `dottie_flag_resolve` (GCR row 5; Codex-APPROVED `c7dbef7`, Kudu-VFS-deployed + GET-back-verified `c1f6fb3f` + liveness 401 this turn): POST `{ flag_id, status }` → `data.flag`. Owner-scoped by EasyAuth. No new route/contract.

## §F-P4 — Component-reference grounding
Primary Reference = the deployed `renameConversation`/`starred` POST gateway idiom (fetch/parse/`data.*`/error) + the 3b.1/3b.3 `FlagRow`. The resolved styling reuses the `C.concur` semantic token (pkg-2/3b vocabulary).

## §F-P5 — Component Contract Table
See §CCT. Net-new: `resolveFlag` on the gateway/client/state; `FlagRow`'s optional `onResolve`; `FlagsView.onResolve` / `OverviewView.onResolveFlag`.

## §F-P6 — Repository & active-surface grounding
- `tsc --noEmit -p tsconfig.app.json` → **exit 0** (this turn). No `any`; `resolveFlag` typed `(flagId, "open"|"resolved") → Promise<Flag|null>`.
- `npm run build` (`vite build`) → **clean** (467 modules; no new module — additive to existing files; `dist/` emitted). This turn.
- Visual grounding: the Resolve/Re-open button + resolved styling reuse proven `C`-token pill/row primitives (looked at across pkg-2/3b.1/3b.3); a dedicated render was not produced for this one-button delta. tsc + build confirm composition.
- Gotchas honoured: Tailwind Preflight unaffected; `import type` kept; optimistic update reverts via `loadOverview` on failure (no silent divergence).

## §F-P7 — VEP assembly
This pack (GCR + Rule Anchor Table + F-P walk + UI-RECON + CCT + GAP + DELTA + CODEX). Mechanical lint PASS.

## §UI-RECON — AUTHORIZED build (realises the visual authority; not a redesign)
A token-styled action on the existing flag row — realises the §6.1 Open-flags resolve affordance; not a redesign. Concur-green = resolved (§2.4, not the gold accent). Additive: absent `onResolve` only the button is suppressed; the resolved-row styling (✓/strikethrough/dim) is an unconditional visual for `status === "resolved"` rows (§F-P2/§CCT). An open row is unchanged from 3b.3. No VISUAL-AUTHORITY-DEVIATION rows.

## §CCT — Component Contract Table
| Component (file) | Prop / input interface (TS) | Visual authority (VA-id) | Data / contract dependency |
| --- | --- | --- | --- |
| `gateway.live` / `theoClient` (`services/*`) | added `resolveFlag(flagId: string, status: "open"\|"resolved"): Promise<Flag \| null>`; **no existing signature changed** | — | POST the deployed `dottie_flag_resolve` (`data.flag`) |
| `useTheoState` (`useTheoState.ts`) | **prop-less hook; return object gains `resolveFlag`** (additive); optimistic `setFlags` + resync-on-error | DOTTIE_DESIGN_SYSTEM §6.1 | via `theoClient.resolveFlag` |
| `FlagRow` (`components/FindingCard.tsx`) | `FlagRow({ fl: Flag; onResolve?: (flagId: string, status: "open"\|"resolved") => void })` — **additive optional prop**; the Resolve/Re-open **button** renders only when `onResolve` given; the **resolved-row styling** (✓/strikethrough/dim) is **UNCONDITIONAL** for `status === "resolved"` (independent of `onResolve`) | DOTTIE_DESIGN_SYSTEM §2.4 (concur token) | consumes `Flag` |
| `FlagsView` / `OverviewView` (`components/*`) | `FlagsView` += optional `onResolve`; `OverviewView` += optional `onResolveFlag`; both thread to `FlagRow` — no other prop change | DOTTIE_DESIGN_SYSTEM §6.1 | unchanged |
| `TheoMain` (`components/TheoMain.tsx`) | **`TheoMainProps` unchanged**; passes `t.resolveFlag` to both surfaces | DOTTIE_DESIGN_SYSTEM §6.1 | unchanged (`t` prop) |

## §GAP — Gap Disclosure
**PROCEED.**
- **G-1 — Optimistic, resync-on-error.** The row flips immediately; the server call persists; on failure `loadOverview` restores server truth. `resolved_at` is display-only in the surfaces (a resolved flag drops out of the Open filter), so the client keeps the existing `resolved_at` optimistically and the next `loadOverview` carries the server timestamp. Disclosed.
- **G-2 — Resolve wired on Open-flags + Overview.** Both use the shared `FlagRow`; the Checks/Audit/Library surfaces don't render flags, so they're untouched. Disclosed.
- **G-3 — Deploy + eyeball.** Lands on `development` → dev SWA against the deployed handler.

## §DELTA — changed files (before → after evidence)
All 7 files git-diffable base→proposed (GCR rows 6–12). CHANGED (all additive): `gateway.live.ts`/`theoClient.ts` (+`resolveFlag`), `useTheoState.ts` (+optimistic handler +expose), `FindingCard.tsx` (`FlagRow` += optional `onResolve` + resolved styling), `FlagsView.tsx`/`OverviewView.tsx` (+optional resolve prop threaded), `TheoMain.tsx` (+wire `t.resolveFlag`). No existing signature/prop-interface changed; the button is gated on `onResolve`, and the only unconditional DOM delta is the resolved-row styling for `status === "resolved"` rows (open rows unchanged from 3b.3); no backend.

## §CODEX — activation (Walter forwards)

```
Codex is activated for Pass-2 FRONTEND review of the Dottie flag-resolve action, vault-dottie,
"Codex Governance/Dottie-FE-Flag-Resolve-Pass-1-VEP/Dottie_FE_Flag_Resolve_VEP.md" @ commit <HEAD>. Open your Pass-2 with a
governance-bound GCR + Rule Anchor Table; hard-gate; emit only APPROVED or REJECTED. The FE half of the flag-resolve loose
end: a Resolve/Re-open button on each flag row calling the DEPLOYED dottie_flag_resolve handler (Codex-APPROVED c7dbef7,
Kudu-VFS-deployed + GET-back-verified c1f6fb3f this turn). AUTHORIZED build; not a redesign. Review: (1) ADDITIVE + FE-only
— gateway.live.resolveFlag (mirrors the deployed renameConversation POST idiom) -> theoClient -> useTheoState.resolveFlag
(optimistic setFlags, resync via loadOverview on error) + FlagRow gains an OPTIONAL onResolve prop (with no onResolve the
button is suppressed but the resolved-row styling (✓/strikethrough/dim) is UNCONDITIONAL for status="resolved" rows; an
open row is byte-identical to 3b.3) threaded from FlagsView/OverviewView via TheoMain (t.resolveFlag); no new component/view/
route/schema, no prop-interface change beyond additive optional props, return object += resolveFlag. (2) §2.4 — the Resolve
button + resolved ✓ use C.concur (resolved=supported/closed), never the gold accent. (3) reads the deployed handler (POST
{flag_id,status} -> data.flag); owner-scoped by EasyAuth. (4) optimistic + resync-on-error (§GAP G-1). tsc -p
tsconfig.app.json exit 0 + npm run build clean (467 modules). Mechanical lint PASS. Emit APPROVED or REJECTED only.
```
