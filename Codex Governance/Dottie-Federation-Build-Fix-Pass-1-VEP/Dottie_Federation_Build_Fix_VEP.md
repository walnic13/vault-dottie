# Dottie Federation Build Fix — Pass-1 VEP (delete the stale vite.config.js shadowing the federation config)

Step 1 of the Origin mount (#5): make Dottie's build actually emit the federated `remoteEntry.js`. **Root cause:** vault-dottie has TWO Vite configs — `vite.config.js` (an old scaffold: `plugins:[react()]`, NO federation) and `vite.config.ts` (the intended config with `@originjs/vite-plugin-federation` exposing `dottieApp/DottieSurface`). Vite resolves `vite.config.js` **before** `vite.config.ts`, so every build has silently used the scaffold and **ignored federation entirely** — producing a single monolithic `index-*.js` with no `remoteEntry.js`, which is why both SWAs 404 the remote and Origin cannot mount Dottie. **Fix (one deletion):** remove `vite.config.js` so Vite uses `vite.config.ts`. **Verified locally:** after removal, `vite build` emits `assets/remoteEntry.js` + `__federation_expose_DottieSurface` + `__federation_fn_import` + `__federation_shared_react`/`react-dom` + code-split index chunks — matching the working vault-theo remote build byte-for-shape. No source/behaviour change to the app itself; the standalone SWA build still emits `index.html` + its chunks.

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Verified Evidence Pack (FE build-config fix; file deletion; no runtime source change)
Grounding parent (source baseline): `cc180fce0229a90accce8c21e71c58b8ca61dc1b` (vault-dottie, `development`)
Grounding mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD) |
| - | ------------------------------- | ------------------------------ | --------------------------------- |
| 1 | VISUAL/ARCH AUTHORITY (binding) — `spec/DOTTIE_DESIGN_SYSTEM.md` (§7.2 Registering Dottie — the federated 9/10 console; §9 the FE is a federated remote) | `Read`(§141–163) this session | `744523cf905df1186d954b86519b1cdeddac539c` |
| 2 | FE Grounding Conformance — `governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR + Rule Anchor) | grounded; unchanged @ HEAD | `4f2f42e799be5db31e1e35e523d656ff4c1c057e` |
| 3 | FE Governor — `governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md` (§3 CCT; §4 reproduce faithfully / do not redesign) | grounded; unchanged @ HEAD | `3afec7ea4b13650ce2bf28bf32073179a35e7b24` |
| 4 | Codex FE Review — `governance/CODEX_THEO_FRONTEND_REVIEW_STANDARD.md` (Pass-2 reviewer; APPROVED/REJECTED only) | grounded; unchanged @ HEAD | `25cc488091d619d8f6642b10552df0d019a87933` |
| 5 | **WORKING REFERENCE — vault-theo `vite.config.ts`** (the deployed federated remote `theoApp/TheoSurface`; identical plugin/target shape Dottie's `.ts` mirrors — the pattern that DOES emit `remoteEntry.js`) | `Read`(full) this turn | vault-theo `21361223de005e4ca794c6feb4dd903162e18bb6` |
| 6 | KEPT (now-active) — `vite.config.ts` (the federation config: `@originjs/vite-plugin-federation`, `name:'dottieApp'`, exposes `./DottieSurface → ./src/theo/TheoSurface.tsx`, `shared:[react,react-dom]`, `build.target:'esnext'`) | `Read`(full) this turn | `c2b91d0c17c988231cd4d427bf532c5bd5b26b47` |
| 7 | **DELETED — `vite.config.js`** (the stale scaffold: `plugins:[react()]`, `build.outDir:'dist'`, NO federation — the file that shadowed the `.ts` and suppressed the remote) | `Read`(full) + delete this turn | `4f726176e09d9c7901692826ba09ee579eae3c9c` (removed) |

No ChatGPT advisory cited. No backend / route / schema / migration. No app source change — a build-config file deletion only.

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt" | GCR (head) |
| governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §4 | "do not redesign" | §2 — deletes a shadowing config; no app source/behaviour change |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §3 | "Component Contract Table" | §CCT |
| spec/DOTTIE_DESIGN_SYSTEM.md | §7.2 | "no new shell machinery" | §1 — the fix restores the federated remote the §7.2 registration consumes |

---

## §1 — Feature
Make the Dottie build emit its federated remote. Deleting `vite.config.js` lets Vite resolve `vite.config.ts` (the only config with `@originjs/vite-plugin-federation`), so `vite build` produces `assets/remoteEntry.js` (+ `__federation_expose_DottieSurface`, `__federation_fn_import`, shared react/react-dom chunks). The SWA `staticwebapp.config.json` already excludes `/assets/*` from the SPA fallback, so `/assets/remoteEntry.js` will serve (it currently 404s only because the file was never built). This is the artifact §7.2 registration (`dottieApp` in Origin's `remotes` map) consumes.

## §2 — Architecture & boundary
One file **deleted** (`vite.config.js`); `vite.config.ts` unchanged and now authoritative. No app source, component, route, backend, schema, or dependency change. Vite config resolution order (`.js` before `.ts`) is the documented cause: the newer `.ts` (federation, added 2026-08-01 17:18) never took effect because the older `.js` (12:05, the pre-federation scaffold) won resolution. Both configs targeted `dist`; the surviving `.ts` defaults `outDir` to `dist` (the `.js` set it explicitly — same result). **Not a redesign** (§4): the app's source + standalone behaviour are unchanged; only the build now additionally emits the remote.

## §3 — Verification (this turn, local)
`rm vite.config.js && vite build` → `dist/assets/` now contains: `remoteEntry.js` (1.60 kB), `__federation_expose_DottieSurface-*.js` (345 kB — the exposed surface), `__federation_fn_import-*.js`, `__federation_shared_react-*.js` + `react-dom`, plus code-split `index-*.js` chunks + `index.html` (standalone entry intact). Before the deletion the same `vite build` emitted only `index.html` + one monolithic `index-*.js` + css — no federation output. Matches the vault-theo working-remote build shape (GCR row 5), differing only in the exposed name (`DottieSurface` vs `TheoSurface`).

## §CCT — Component Contract Table
| Component (file) | Prop / input interface (TS) | Visual authority (VA-id) | Data / contract dependency |
| --- | --- | --- | --- |
| `vite.config.js` (DELETED) | n/a — build config removed | — | none |
| `vite.config.ts` (KEPT, now authoritative) | build config; `federation({ name:'dottieApp', filename:'remoteEntry.js', exposes:{ './DottieSurface':'./src/theo/TheoSurface.tsx' }, shared:['react','react-dom'] })`, `build.target:'esnext'` | DOTTIE_DESIGN_SYSTEM §7.2/§9 (federated remote) | emits the remote Origin's `dottieApp` maps to |

No app component/prop/DOM change.

## §GAP — Gap Disclosure
**PROCEED.**
- **G-1 — Redeploy required.** After Codex approval, the dev + prod SWAs must rebuild (push to `development`, then the dev→main promotion) so `remoteEntry.js` is actually served. Until redeploy, the SWAs still serve the old monolith. Disclosed.
- **G-2 — Origin registration is the next step.** This only makes the remote *exist*; wiring `dottieApp` into Origin's `remotes` map + the App Host (productRegistry / mount descriptor / rail icon, below Theo/above Sigma) is the next #5 package (vault-origin, VO-AH). Disclosed.
- **G-3 — Standalone unaffected.** The `.ts` build still emits `index.html` + chunks; the standalone dev/prod SWA keeps working (verified §3). Disclosed.
- **G-4 — No source/schema/backend/dependency change.** File deletion only. PROCEED.

## §DELTA — changed files (before → after evidence)
One deletion. `vite.config.js` (`4f726176`, the `plugins:[react()]` scaffold) removed; `vite.config.ts` (`c2b91d0c`, federation) untouched and now the resolved config. Verified: build output flips from a no-federation monolith to the full federation output (§3).

## §CODEX — activation (Walter forwards)

```
Codex is activated for Pass-2 FRONTEND review of the Dottie federation build fix, vault-dottie,
"Codex Governance/Dottie-Federation-Build-Fix-Pass-1-VEP/Dottie_Federation_Build_Fix_VEP.md" @ commit <HEAD>. Open your
Pass-2 with a governance-bound GCR + Rule Anchor Table; hard-gate; emit only APPROVED or REJECTED. Step 1 of #5 (Origin
mount): make Dottie emit its federated remoteEntry.js. ROOT CAUSE: two Vite configs — vite.config.js (old scaffold, no
federation) + vite.config.ts (federation, exposes dottieApp/DottieSurface). Vite resolves .js before .ts, so every build
used the scaffold and produced a monolith with NO remoteEntry (both SWAs 404 it; Origin can't mount). FIX: delete
vite.config.js so Vite uses vite.config.ts. Review: (1) ONE file deleted (vite.config.js, blob 4f726176); vite.config.ts
(c2b91d0c) unchanged + now authoritative; no app source/component/route/backend/schema/dependency change. (2) VERIFIED
locally (§3): post-deletion vite build emits assets/remoteEntry.js + __federation_expose_DottieSurface + __federation_fn_
import + shared react/react-dom + code-split index chunks + index.html (standalone intact) — matching the working vault-
theo remote build (GCR row 5), differing only in the exposed name. (3) staticwebapp.config.json already excludes /assets/*
from the SPA fallback so remoteEntry.js will serve. (4) redeploy (dev push + dev->main) needed to actually serve it (§GAP
G-1); Origin App Host registration is the next package (§GAP G-2). Not a redesign — build config only. Mechanical lint
PASS. Emit APPROVED or REJECTED only.
```
