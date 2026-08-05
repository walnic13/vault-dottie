# Dottie remoteEntry.js no-cache — Pass 1 Frontend VEP (fixes "App module unavailable" on update)

> From Walter's dev-SWA review 2026-08-05: pressing "Update" sometimes shows **"App module unavailable — the 'dottie' module could not be loaded"** in Origin, self-healing after a couple hard refreshes. **Root cause (grounded, not guessed):** the Dottie SWA serves the Module-Federation manifest `assets/remoteEntry.js` with `Cache-Control: public, must-revalidate, max-age=30` (Azure SWA default). `remoteEntry.js` has a **stable URL** but points at **content-hashed** chunks; after a Dottie redeploy the old chunks are deleted (e.g. `__federation_shared_react-CsUMYuEf.js` now 404s), so for up to 30 s the browser serves the **stale cached manifest** referencing dead chunk hashes → the federation import fails → "App module unavailable" until the manifest revalidates. **Fix:** serve `remoteEntry.js` `Cache-Control: no-cache` (always revalidate — the standard MF policy for the manifest); the hashed chunks stay long-cached. One `routes` header rule in `staticwebapp.config.json`; no app code.

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Pass 1 — Frontend Verified Evidence Pack (SWA deploy-config header; no app code)
Grounding parent (source baseline): `caabf0b32babb5c778c494224efef5fc1457cc82` (vault-dottie, `development`)
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD / proposed) |
| - | ------------------------------- | ------------------------------ | -------------------------------------------- |
| 1 | VISUAL/ARCH AUTHORITY — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/spec/DOTTIE_DESIGN_SYSTEM.md` (§7 Origin shell contract — Dottie is a federated remote the shell consumes) | `Read`(§141–164) this turn | `744523cf905df1186d954b86519b1cdeddac539c` |
| 2 | FE Grounding Conformance — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR + Rule Anchor) | grounded; unchanged @ HEAD | `4f2f42e799be5db31e1e35e523d656ff4c1c057e` |
| 3 | FE Governor — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md` (reproduce faithfully / no redesign) | grounded; unchanged @ HEAD | `3afec7ea4b13650ce2bf28bf32073179a35e7b24` |
| 4 | Codex FE Review — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/CODEX_THEO_FRONTEND_REVIEW_STANDARD.md` (Pass-2; APPROVED/REJECTED only) | grounded; unchanged @ HEAD | `25cc488091d619d8f6642b10552df0d019a87933` |
| 5 | CHANGED — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/staticwebapp.config.json` (adds a `routes` rule: `/assets/remoteEntry.js` → `Cache-Control: no-cache`) | `Read`(full) + `Edit` this turn | base @HEAD `f3890dd401b257bdfa0559eed65e31a1d73e3fe7` → proposed `85ce62af49a16b8854ab5fc72e5027bbd4b0611d` |

No ChatGPT advisory cited. No backend / route (app) / schema / migration; no app source. A deploy-config header only.

## Rule Anchor Table

| Source doc (absolute path) | Clause id | Verbatim clause text (read this turn) | Applied in output at |
| -------------------------- | --------- | ------------------------------------- | -------------------- |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/spec/DOTTIE_DESIGN_SYSTEM.md | §7 | "Dottie renders **into** shell-owned slots and must not draw shell chrome" | §1 — Dottie is a federated remote the Origin shell consumes; its `remoteEntry.js` manifest must load reliably |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/spec/DOTTIE_DESIGN_SYSTEM.md | §7.2 | "The 9/10 console then works via the existing pool with no new shell machinery." | §1 — the pool loads `dottieApp` from `remoteEntry.js`; the no-cache header keeps that manifest current post-redeploy |

---

## §1 — Feature
Eliminate the transient "App module unavailable" that Origin shows for `dottie` shortly after a Dottie redeploy. Dottie is a federated remote (DOTTIE §7/§7.2); Origin loads it from `assets/remoteEntry.js`, the MF manifest. Because the manifest URL is stable but its referenced chunks are content-hashed, a stale cached manifest (Azure default `max-age=30`) can point at chunk hashes that a newer deploy has deleted (verified: `__federation_shared_react-CsUMYuEf.js` → 404), so the import fails until revalidation. Serving `remoteEntry.js` with `Cache-Control: no-cache` makes the browser always revalidate the manifest (efficient 304s when unchanged), so a redeploy is picked up immediately and the manifest is never stale — while the hashed chunks remain long-cached (they are immutable per hash).

## §2 — Architecture & boundary
One deploy-config file (`staticwebapp.config.json`): a `routes` entry mapping `/assets/remoteEntry.js` → `Cache-Control: no-cache`. No app source/component/route/backend/schema/dependency change; `navigationFallback` + `globalHeaders` unchanged. Applies to both the dev (brave-dune) and prod (black-stone) Dottie SWAs on their respective deploys (same repo config). **Not a redesign** — a caching-header correction for reliable federated-remote loading.

## §3 — Verification (this turn, local)
`node -e JSON.parse(...)` → **valid JSON**. Root cause reproduced live this turn: `curl -sI …/assets/remoteEntry.js` → `Cache-Control: public, must-revalidate, max-age=30`; the chunk it referenced (`__federation_shared_react-CsUMYuEf.js`) → **404** (a newer deploy's hash differs). Post-deploy verification (§GAP): `curl -sI` the Dottie SWA `remoteEntry.js` → expect `Cache-Control: no-cache`; pressing "Update" in Origin then loads Dottie without the "App module unavailable" transient.

## §CCT — Component Contract Table
| Component (file) | Prop / input interface (TS) | Visual authority (VA-id) | Data / contract dependency |
| --- | --- | --- | --- |
| `staticwebapp.config.json` (deploy config) | n/a — SWA config; adds `routes[0]` = `{ route: "/assets/remoteEntry.js", headers: { "Cache-Control": "no-cache" } }` | n/a (deploy config) | none (static hosting header) |

No app component/prop/DOM change.

## §GAP — Gap Disclosure
**PROCEED.**
- **G-1 — Deploy to take effect.** The header applies once the config deploys (brave-dune on push; black-stone on the dev→main promotion). Verify with `curl -sI` post-deploy (§3). Disclosed.
- **G-2 — Same latent issue on the Theo/DMS remotes.** `theo`/`dms` `remoteEntry.js` carry the same Azure-default `max-age=30`; they hit the transient less (less frequent redeploys). Fixing them is the same one-line header in their repos — a recommended follow-up, out of scope here (separate repos). Disclosed.
- **G-3 — Hashed chunks unaffected.** Only the manifest becomes no-cache; the content-hashed chunks stay long-cached (immutable). Disclosed.

## §DELTA — changed files (before → after evidence)
One file (GCR row 5). `staticwebapp.config.json` (`f3890dd`→`85ce62af`): adds the `routes` array with the single `/assets/remoteEntry.js` → `Cache-Control: no-cache` rule. No other bytes changed.

## §CODEX — activation (Walter forwards)

```
Codex is activated for Pass-2 FRONTEND review of the Dottie remoteEntry.js no-cache fix, vault-dottie,
"Codex Governance/Dottie-RemoteEntry-NoCache-Pass-1-VEP/Dottie_RemoteEntry_NoCache_VEP.md" @ commit <HEAD>. Open Pass-2 with a
governance-bound GCR + Rule Anchor Table; hard-gate; emit only APPROVED or REJECTED. Deploy-config header only, no app code.
Root cause (grounded): Origin's "App module unavailable" for dottie shortly after a Dottie redeploy = the SWA serves the MF
manifest assets/remoteEntry.js with Azure-default Cache-Control: public, must-revalidate, max-age=30; the manifest URL is
stable but points at content-hashed chunks, so a stale cached manifest references chunk hashes a newer deploy deleted (verified
live: __federation_shared_react-CsUMYuEf.js → 404), failing the import until revalidation. Fix: staticwebapp.config.json adds a
routes rule /assets/remoteEntry.js → Cache-Control: no-cache (always revalidate the manifest — standard MF policy); hashed
chunks stay long-cached. Review: (1) one config file; navigationFallback + globalHeaders unchanged; valid JSON. (2) not a
redesign — caching correction for reliable federated-remote loading (DOTTIE §7/§7.2). (3) applies to both dev + prod Dottie
SWAs on deploy. (4) Theo/DMS remotes carry the same latent default — recommended follow-up in their repos (G-2). Post-deploy:
curl -sI remoteEntry.js → Cache-Control: no-cache. Mechanical lint PASS. Emit APPROVED or REJECTED only.
```

*End of Dottie remoteEntry.js no-cache Pass-1 Frontend VEP.*
