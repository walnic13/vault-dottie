# Dottie Restore-Splash Contain — Pass 1 Frontend VEP (fix the full-screen flash when a compact instance cold-opens)

> From Walter's dev-SWA review 2026-08-05: launching a SECOND app into the Origin 3rd panel makes the whole screen flash — the new app momentarily takes over the entire screen, then settles. **Root cause (grounded):** `ChatView`'s cold-open `RestoringSplash` (the quiet neutral hold shown while the restore decision resolves) rendered `position:fixed; inset:0; zIndex:2147483000` **portaled to `document.body`** — a full-VIEWPORT cover at max z-index. When a fresh Dottie instance mounts in a compact right-panel tab, its cold-open `restoring` hold blanketed the ENTIRE screen (over the 9/10 + the other panel tab) until restore resolved → the flash. **Fix:** the splash renders **contained** — `position:absolute; inset:0` within `ChatView`'s already-`relative` root — so it covers only this instance's chat area (still hides the greeting flash) and never the whole viewport. FE-only; one function; no backend/schema/route.

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Pass 1 — Frontend Verified Evidence Pack (cold-open restore-hold containment)
Grounding parent (source baseline): `86d6598df8fc4d1fd23fb99d0b7aea7c1fcdd32e` (vault-dottie, `development`)
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

Currency labelling: CODE-BEARING package — at the review HEAD the changed file's blob IS the proposed blob; the base is cited at the PARENT commit `86d6598` and the proposed is the review-HEAD blob (anchored to the blob SHA).

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (unchanged: @ HEAD; changed: base @ parent → proposed @ review HEAD) |
| - | ------------------------------- | ------------------------------ | -------------------------------------------- |
| 1 | VISUAL/ARCH AUTHORITY — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/spec/DOTTIE_DESIGN_SYSTEM.md` (§7 renders into shell-owned slots, must not draw shell chrome; §6.3 compact right-panel form) | `Read`(§6.3, §7) this turn | `744523cf905df1186d954b86519b1cdeddac539c` |
| 2 | FE Grounding Conformance — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR + Rule Anchor) | grounded; unchanged @ HEAD | `4f2f42e799be5db31e1e35e523d656ff4c1c057e` |
| 3 | FE Governor — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md` (reproduce faithfully / no redesign) | grounded; unchanged @ HEAD | `b6ef105fea53533f45d0e907da223616a61c51dd` |
| 4 | Codex FE Review — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/CODEX_THEO_FRONTEND_REVIEW_STANDARD.md` (Pass-2; APPROVED/REJECTED only) | grounded; unchanged @ HEAD | `25cc488091d619d8f6642b10552df0d019a87933` |
| 5 | CHANGED — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/src/theo/components/ChatView.tsx` (`RestoringSplash` contained; the now-unused `createPortal` import removed) | `Read`(§408–432, §576–587) + `Edit` this turn | base @ parent `86d6598` `7114decfd56b3228662c90e0c34a1c0c0b340e44` → proposed @ review HEAD `55d37898bd2ecac086c4841a0e80245237475dc9` |

No ChatGPT advisory cited. No backend / route / schema / migration.

## Rule Anchor Table

| Source doc (absolute path) | Clause id | Verbatim clause text (read this turn) | Applied in output at |
| -------------------------- | --------- | ------------------------------------- | -------------------- |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/spec/DOTTIE_DESIGN_SYSTEM.md | §7 | "must not draw shell chrome" | §1 — the cold-open hold is contained to Dottie's own surface; it must not blanket the shell (the 9/10 + other panels) it does not own |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/spec/DOTTIE_DESIGN_SYSTEM.md | §6.3 | "Must be fully usable at tab width" | §1 — the compact right-panel form must behave correctly; a full-viewport cold-open cover breaks that |

---

## §1 — Feature
`ChatView`'s `RestoringSplash` is the quiet neutral hold shown while `useTheoState`'s cold-open restore decision resolves (so no new-chat greeting flashes before a restore lands; Walter 2026-07-28 "the app should just open … without any interference"). It rendered `position:fixed; inset:0; zIndex:2147483000` **portaled to `document.body`** — deliberately full-viewport so it also covered a standalone app's own top bar. But every mount shares this: when a fresh Dottie instance mounts in a **compact right-panel tab** (Origin's 3rd panel), its `restoring` hold blanketed the WHOLE screen — over the 9/10 console and any other open panel tab — until restore resolved, so launching a second panel app flashed the entire app (DOTTIE §7 "must not draw shell chrome"; §6.3 "Must be fully usable at tab width"). Fix: the splash renders **contained** — `position:absolute; inset:0; zIndex:40` (no portal) within `ChatView`'s root, which is **already `position:relative`** (`§578`). It now covers only this instance's chat area — the greeting is still hidden (it lives in that area) — in every mount: the panel tab covers just the 440px panel; the 9/10 console covers just the 9/10; standalone covers the main. No prop/threading needed; the containment falls out of the existing relative root.

## §2 — Architecture & boundary
One ACTIVE file, `ChatView.tsx`: `RestoringSplash` switches from `createPortal(<div position:fixed inset:0 zIndex:2147483000>, document.body)` to an inline `<div position:absolute inset:0 zIndex:40>`; the now-unused `import { createPortal } from "react-dom"` is removed; the guard `if (typeof document === "undefined") return null` is dropped (no `document` access remains). The mark, background (`C.bg`), and the `{restoring && <RestoringSplash />}` gate are unchanged. No new file/component/prop/route/backend/schema/dependency. **Not a redesign** — the same cold-open hold, contained to the surface it belongs to instead of the whole viewport.

## §3 — Verification (this turn, local)
`tsc --noEmit -p tsconfig.app.json` → **exit 0** (the removed `createPortal` import leaves no unused-symbol error). `npm run build` → **clean** (DottieSurface federated chunk emits). This turn. Behaviour: launching a second app into the Origin 3rd panel no longer flashes the whole screen — the new instance's cold-open hold stays within its own panel tab.

## §CCT — Component Contract Table
| Component (file) | Prop / input interface (TS) | Visual authority (VA-id) | Data / contract dependency |
| --- | --- | --- | --- |
| `ChatView` (`ChatView.tsx`) | `ChatViewProps` unchanged (incl. `restoring?: boolean`); internal `RestoringSplash` render swaps `position:fixed`+`document.body` portal → `position:absolute` inline within the existing `position:relative` root | DOTTIE_DESIGN_SYSTEM §7 / §6.3 | none (presentational cold-open hold) |

## §GAP — Gap Disclosure
**PROCEED.**
- **G-1 — Greeting still hidden.** The greeting lives inside `ChatView`'s root, which the contained splash still fully covers, so the anti-flash intent is preserved. Disclosed.
- **G-2 — All mounts contained.** The 9/10 console + standalone cold-open now also contain to their surface (they previously covered the whole viewport incl. the rail); this is equal-or-better (no rail/panel blanket) and hides the same greeting. Disclosed.
- **G-3 — Deploy + eyeball.** Lands on `development` → brave-dune, verified mounted in Origin. PROCEED.

## §DELTA — changed files (before → after evidence)
One file (GCR row 5). `ChatView.tsx` (`7114decf`→`55d37898`): `RestoringSplash` `position:fixed`+`document.body` portal → contained `position:absolute inset:0 zIndex:40`; removed the now-unused `createPortal` import + the `typeof document` guard. No other bytes changed.

## §CODEX — activation (Walter forwards)

```
Codex is activated for Pass-2 FRONTEND review of the Dottie Restore-Splash Contain, vault-dottie,
"Codex Governance/Dottie-Restore-Splash-Contain-Pass-1-VEP/Dottie_Restore_Splash_Contain_VEP.md" @ commit <HEAD>. Open Pass-2
with a governance-bound GCR + Rule Anchor Table; hard-gate; emit only APPROVED or REJECTED. FE-only, no backend/schema/route.
Walter dev-SWA: launching a 2nd app into the Origin 3rd panel flashed the whole screen. Root cause: ChatView's cold-open
RestoringSplash rendered position:fixed inset:0 zIndex:2147483000 portaled to document.body — a full-VIEWPORT cover; a fresh
Dottie instance in a compact right-panel tab blanketed the ENTIRE screen during its cold-open restore hold. Fix: render it
CONTAINED — position:absolute inset:0 zIndex:40 (no portal) within ChatView's already-relative root — so it covers only this
instance's chat area (still hides the greeting) and never the whole viewport (DOTTIE §7 "must not draw shell chrome"; §6.3 "Must
be fully usable at tab width"). Removed the now-unused createPortal import + the typeof-document guard. One ACTIVE file;
ChatViewProps unchanged; not a redesign (same hold, contained). tsc exit 0 + vite build clean. Mechanical lint PASS. Emit
APPROVED or REJECTED only.
```

*End of Dottie Restore-Splash Contain Pass-1 Frontend VEP.*
