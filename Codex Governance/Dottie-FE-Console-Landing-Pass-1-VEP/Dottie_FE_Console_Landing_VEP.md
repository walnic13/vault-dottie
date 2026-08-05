# Dottie FE — Console landing (time-defined hybrid) — Pass 1 Frontend Verified Evidence Pack

Makes the **Overview** Dottie's cold-open **home** (DOTTIE_DESIGN_SYSTEM §6.1: "Her home"), on a time-defined hybrid Walter set (2026-08-05): cold-open **restores the last chat ONLY when it is fresh** — last-touched within the **4-hour** staleness window (the same "not visited in 4 hours" window Theo uses); a **stale** chat (>4h) or **no recent chat** lands on the **Overview console** instead of a greeting. **One file, one effect** — the cold-open restore effect in `useTheoState` — a deliberate **behaviour change** to the landing (not additive). **FE-only; no new component/view/route/schema.**

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Pass 1 — Frontend Verified Evidence Pack
Grounding parent (source baseline): `47a3d52d329b57907d883b61181f4eb6ded8441f` (vault-dottie, `development`)
Grounding mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD / proposed) |
| - | ------------------------------- | ------------------------------ | -------------------------------------------- |
| 1 | VISUAL AUTHORITY (binding) — `spec/DOTTIE_DESIGN_SYSTEM.md` (§6.1 the 9/10 console; Overview is "Her home") | `Read`(§123–187) this session | `744523cf905df1186d954b86519b1cdeddac539c` |
| 2 | FE Grounding Conformance — `governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR + Rule Anchor) | grounded; unchanged @ HEAD | `4f2f42e799be5db31e1e35e523d656ff4c1c057e` |
| 3 | FE Governor — `governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md` (§3 CCT; §4 reproduce faithfully / do not redesign) | grounded; unchanged @ HEAD | `3afec7ea4b13650ce2bf28bf32073179a35e7b24` |
| 4 | Codex FE Review — `governance/CODEX_THEO_FRONTEND_REVIEW_STANDARD.md` (Pass-2 reviewer; APPROVED/REJECTED only) | grounded; unchanged @ HEAD | `25cc488091d619d8f6642b10552df0d019a87933` |
| 5 | CHANGED — `src/theo/useTheoState.ts` (the cold-open restore effect: fresh<4h → restore last chat; stale>4h / no recent chat → `applyView("overview")`) | `Read` + `Edit` this turn | base @HEAD `f0cacff307564ea5b206b2727e66268aaddee08f` → proposed `ae513878d5cb2e34ed6b96dad3da0b7dd420397c` |

No ChatGPT advisory cited. No backend / route / schema / migration. Everything else — every view, the chat, the pkg-2 renderer, the console surfaces — is unchanged.

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt" | GCR (head) |
| governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §4 | "do not redesign" | §UI-RECON — a landing-target rule change; no view/DOM redesign |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §3 | "Component Contract Table" | §CCT |
| spec/DOTTIE_DESIGN_SYSTEM.md | §6.1 | "Her home" | §F-P1 — cold-open lands on the Overview (her home) when there is no fresh chat |

---

## §F-P1 — Feature identification + UI-authority
Realise the console **home** (§6.1: the 9/10 console is "Her home"): on cold-open, when there is nothing fresh to resume, Dottie opens on the **Overview** rather than a chat/greeting. "Nothing fresh" is **time-defined** (Walter 2026-08-05): the last chat must be *last-touched within 4 hours* to be restored; beyond that window it is stale.

## §F-P2 — Architecture / boundary reconciliation
FE-only, one effect. The existing cold-open restore effect (`useTheoState`) gated on `recentsLoaded` is rewritten:
- **Unchanged:** already in a chat / composing → keep current view + drop the `restoring` gate. A **fresh** last chat (last-touched within 4h) → `selectRecent(recentsList[0].id)` restores it, then drop the gate (splash lands on the chat — same as before).
- **Changed (the landing rule):** a **stale** last chat (>4h) **or no recent chat** → `applyView("overview")` (lands on the Overview + loads the dashboard) + drop the gate — where the prior code (i) on **desktop** always restored even a stale chat (the transplanted "never-expire"), and (ii) on **mobile-stale / no-recents** dropped to a **greeting**. Now all "nothing fresh" paths land on the Overview, on desktop + mobile.
`applyView` is the existing hoisted view-switch (`setView` + `loadOverview` for console views); the snapshot instant-paint only accelerates the *restore* path (`selectRecent` reads the cached conversation) — it never forces a chat on mount, so the Overview path is clean. No new component/view/route/schema; no prop-interface change.

## §F-P3 — Backend grounding
N/A — no backend/route/contract. The Overview's data load is the existing deployed `loadOverview` (findings/flags handlers).

## §F-P4 — Component-reference grounding
Primary Reference = the existing restore effect (the `didRestoreRef`/`recentsLoaded`/`selectRecent`/`restoring`-gate idiom) + the existing `applyView` view-switch. The 4h window reuses the same `4 * 60 * 60 * 1000` staleness constant the prior mobile cap used.

## §F-P6 — Repository & active-surface grounding
- `tsc --noEmit -p tsconfig.app.json` → **exit 0** (this turn). `applyView` (hoisted function) resolves in the effect closure; `Date.now()`/`Date.parse` are browser APIs (FE, not a workflow script); no `any`.
- `npm run build` (`vite build`) → **clean** (467 modules; no new module; `dist/` emitted). This turn.
- Behavioural note: the landing decision is time-sensitive; it should be eyeballed on the dev SWA — (a) reopen within 4h of a chat → lands on that chat; (b) reopen after >4h, or a fresh/empty account → lands on Overview. tsc + build confirm compilation; the timing behaviour is verified live (§GAP G-2).

## §F-P7 — VEP assembly
This pack (GCR + Rule Anchor Table + F-P walk + UI-RECON + CCT + GAP + DELTA + CODEX). Mechanical lint PASS.

## §UI-RECON — AUTHORIZED landing rule (not a redesign)
This changes **which view cold-open lands on**, per Walter's explicit 2026-08-05 direction — it is not a visual redesign (no view/DOM/token change). It **deliberately supersedes** the transplanted desktop-"never-expire" restore behaviour **for Dottie's landing** (Dottie is a console; her home is the Overview, not a chat). Disclosed as a behaviour change (§F-P2/§GAP); the fresh-chat restore path is unchanged. No VISUAL-AUTHORITY-DEVIATION rows.

## §CCT — Component Contract Table
| Component (file) | Prop / input interface (TS) | Visual authority (VA-id) | Data / contract dependency |
| --- | --- | --- | --- |
| `useTheoState` (`useTheoState.ts`) | **prop-less hook; return object unchanged.** The cold-open restore effect's **behaviour** changes: fresh<4h → restore last chat (unchanged); stale>4h / no-recents → `applyView("overview")` (was: desktop-restore-stale / mobile-or-empty-greeting). Same effect + deps; no new state | DOTTIE_DESIGN_SYSTEM §6.1 | via existing `selectRecent` / `applyView`→`loadOverview` (deployed) |

## §GAP — Gap Disclosure
**PROCEED.**
- **G-1 — Supersedes the prior desktop-never-expire (for Dottie's landing).** The 2026-07-28 "desktop never refreshes; always restore" rule is replaced for Dottie by the 2026-08-05 time-defined hybrid (fresh<4h restore, else Overview), on Walter's explicit direction. A stale desktop chat now lands on Overview instead of restoring. Disclosed.
- **G-2 — Timing verified live.** The 4h decision is time-sensitive and best confirmed on the dev SWA (reopen-within-4h → chat; reopen-after-4h / empty → Overview). Disclosed.
- **G-3 — Fresh restore + snapshot unchanged.** The fresh-chat restore path, the `restoring` splash, and the snapshot instant-paint are unchanged (the snapshot only accelerates the restore path). Disclosed.
- **G-4 — Deploy + eyeball.** Lands on `development` → dev SWA.

## §DELTA — changed files (before → after evidence)
One file, git-diffable base→proposed (GCR row 5). `useTheoState.ts` — the cold-open restore effect: the `recentsList.length === 0` early-return + the desktop-never-expire / mobile-4h-greeting branch are replaced by a single `fresh = lastTouched within 4h` test → fresh restores the last chat (unchanged), else `applyView("overview")`. Same effect signature + dependency array; no new state, prop, or component.

## §CODEX — activation (Walter forwards)

```
Codex is activated for Pass-2 FRONTEND review of the Dottie console landing (time-defined hybrid), vault-dottie,
"Codex Governance/Dottie-FE-Console-Landing-Pass-1-VEP/Dottie_FE_Console_Landing_VEP.md" @ commit <HEAD>. Open your Pass-2
with a governance-bound GCR + Rule Anchor Table; hard-gate; emit only APPROVED or REJECTED. Makes the Overview Dottie's
cold-open home (DOTTIE_DESIGN_SYSTEM §6.1 "Her home") on a time-defined hybrid Walter set 2026-08-05. This is a deliberate
BEHAVIOUR CHANGE to the cold-open restore effect (NOT additive) — disclose accordingly. Review: (1) ONE file, one effect
(useTheoState cold-open restore). UNCHANGED: already-in-a-chat/composing keeps current + drops the gate; a FRESH last chat
(last-touched within 4h) restores via selectRecent (same as before). CHANGED (the landing rule): a STALE chat (>4h) or NO
recent chat now lands on applyView("overview") + drops the gate — where before, desktop always restored even a stale chat
(transplanted never-expire) and mobile-stale/no-recents dropped to a greeting. (2) it SUPERSEDES the 2026-07-28 desktop-
never-expire for Dottie's landing, per Walter's explicit 2026-08-05 direction (§GAP G-1) — Dottie is a console; her home is
Overview. (3) FE-only; no new component/view/route/schema; return object + effect deps unchanged; the snapshot only
accelerates the restore path (never forces a chat on mount), so the Overview path is clean (§GAP G-3). (4) the 4h timing is
verified live on the dev SWA (§GAP G-2). tsc -p tsconfig.app.json exit 0 + npm run build clean (467 modules). Mechanical
lint PASS. Emit APPROVED or REJECTED only.
```
