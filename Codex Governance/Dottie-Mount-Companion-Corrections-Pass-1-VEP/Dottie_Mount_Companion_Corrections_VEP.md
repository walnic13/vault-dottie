# Dottie Mount Companion Corrections — Pass 1 Frontend VEP (vault-dottie side of Batch A)

> Two small vault-dottie corrections surfaced by Walter's Origin dev-SWA review of the Dottie mount (2026-08-05), companion to the Origin-side visual corrections (vault-origin `3a66ca3`). **(1) CRITICAL — client-cache isolation:** Dottie's `localStorage` snapshot prefix was `vault-theo:v1:` (copied from Theo); mounted in the same Origin page origin the two agents shared one `localStorage`, so Dottie's cold-open cache read **Theo's** recents/last-conversation. Re-namespaced to `vault-dottie:v1:` → full isolation (read, write, foreign-purge). **(2) panel-mode dark ground:** `TheoMain` painted no background, so in `mode="panel"` (the Origin mount) Origin's light showed through the 9/10; it now paints `C.bg` (`#0C0F14`, DOTTIE §2.1 `--ink`). Faithful — no redesign. **FE-only; no backend/schema/route change.**

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Pass 1 — Frontend Verified Evidence Pack (client-cache isolation + panel-mode ground)
Grounding parent (source baseline): `f41806e6578cfd0076e996ab060ff70afb9e1e88` (vault-dottie, `development`)
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD / proposed) |
| - | ------------------------------- | ------------------------------ | -------------------------------------------- |
| 1 | VISUAL AUTHORITY — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/spec/DOTTIE_DESIGN_SYSTEM.md` (§2.1 `--ink` ground; §2 P2 committed dark identity) | `Read`(§17–54) this turn | `744523cf905df1186d954b86519b1cdeddac539c` |
| 2 | FE Grounding Conformance — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR + Rule Anchor) | grounded; unchanged @ HEAD | `4f2f42e799be5db31e1e35e523d656ff4c1c057e` |
| 3 | FE Governor — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md` (reproduce faithfully / do not redesign) | grounded; unchanged @ HEAD | `3afec7ea4b13650ce2bf28bf32073179a35e7b24` |
| 4 | Codex FE Review — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/CODEX_THEO_FRONTEND_REVIEW_STANDARD.md` (Pass-2 reviewer; APPROVED/REJECTED only) | grounded; unchanged @ HEAD | `25cc488091d619d8f6642b10552df0d019a87933` |
| 5 | CHANGED — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/src/theo/services/theoSnapshot.ts` (the localStorage snapshot cache; `PREFIX` re-namespaced) | `Read`(full) + `Edit` this turn | base @HEAD `d653da7632135a09d71c26c6c5f077060aca74dc` → proposed `fd7f079c8b95c7a764a7e08f175e3aa34defc241` |
| 6 | CHANGED — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/src/theo/components/TheoMain.tsx` (the main view; root paints `C.bg` in both modes) | `Read`(§35–110) + `Edit` this turn | base @HEAD `0150b85d58b21c689b55800a3b056e4d76e929b7` → proposed `c420af97ff0c61e4fd585d490d3c1032275a1ac4` |

No ChatGPT advisory cited. No backend / route / schema / migration.

## Rule Anchor Table

| Source doc (absolute path) | Clause id | Verbatim clause text (read this turn) | Applied in output at |
| -------------------------- | --------- | ------------------------------------- | -------------------- |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/spec/DOTTIE_DESIGN_SYSTEM.md | §2.1 | "#0C0F14" | §2 — TheoMain paints `C.bg` (`#0C0F14`) in panel mode |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/spec/DOTTIE_DESIGN_SYSTEM.md | §2 P2 | "We never dilute the dark identity to blend in." | §2 — the 9/10 fills Dottie's dark ground when mounted in Origin |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/spec/DOTTIE_DESIGN_SYSTEM.md | §7 | "Dottie is a shell-slot app, never draws shell chrome" | §1 — Dottie renders into her slots; she must be isolated from Theo's cache |

---

## §1 — Feature
Two corrections to Dottie's federated surface, both surfaced when the mount was reviewed live in Origin:

**(1) Client-cache isolation (CRITICAL).** `theoSnapshot.ts` is Dottie's per-principal `localStorage` instant-paint seed (recents / last-opened conversation / self). Its namespace `PREFIX` was `vault-theo:v1:` — copied verbatim from Theo. Theo and Dottie both mount as federated remotes into the **same Origin page origin**, so they share one `localStorage`; keyed under the same prefix + same signed-in `oid`, Dottie's `getCachedRecents()` / `getCachedConversation()` read **Theo's** entries → Dottie's cold-open painted Theo's last conversation. (Bidirectional: Dottie's `set*` would also stomp Theo's cache.) Fix: `PREFIX = 'vault-dottie:v1:'` — the one constant every op keys off (`nsKey`, and `bindPrincipal`'s foreign-purge `keep`/`drop`), so reads, writes, and the purge are now fully isolated to Dottie's namespace. Theo's `vault-theo:v1:*` is never read or touched. Backend was never involved (Dottie = func-dottie / `dottie_*` RLS; Theo = `theo_*`) — this is a client-cache display seed only.

**(2) Panel-mode dark ground.** `TheoMain`'s root `<div>` set layout but no `background`. Standalone, Dottie's dark comes from the outer `.vo-standalone` wrapper (`background: C.bg`) in `TheoSurface`; in `mode="panel"` (the Origin mount) only `TheoMain` is portaled, so Origin's light showed through the 9/10. Fix: the root paints `background: C.bg` (`#0C0F14`, DOTTIE §2.1 `--ink`) — a no-op in `mode="full"` (the wrapper is already that colour) and fills the 9/10 dark in `mode="panel"`.

## §2 — Architecture & boundary
Two ACTIVE files edited; no new file, component, prop, route, backend, schema, or dependency. `theoSnapshot.ts`: one constant + its comment (the exported API — `getCachedRecents`/`setCachedRecents`/`getCachedConversation`/`bindPrincipal`/`resolvePrincipal` — is unchanged in shape/behaviour; only the namespace string changes). `TheoMain.tsx`: one added `background: C.bg` on the existing root style (C already imported; used elsewhere in the file). **Not a redesign** — Dottie's committed dark identity (DOTTIE §2 P2) is realized in the hosted panel exactly as standalone; the isolation restores the per-principal security boundary the module already documents (Exception §2) but which the copied prefix defeated across the two co-hosted agents.

## §3 — Verification (this turn, local)
- `tsc --noEmit -p tsconfig.app.json` → **exit 0**.
- `npm run build` (`vite build`) → **clean**; the federated `__federation_expose_DottieSurface` chunk emits. This turn.
- Behavioural: after deploy, Dottie reads her empty `vault-dottie:v1:<oid>:*` namespace (no Theo bleed); the 9/10 panel renders on Dottie's `#0C0F14` ground. Best eyeballed on the dev SWA mounted in Origin (§GAP).

## §CCT — Component Contract Table
| Component (file) | Prop / input interface (TS) | Visual authority (VA-id) | Data / contract dependency |
| --- | --- | --- | --- |
| `theoSnapshot` (`theoSnapshot.ts`) | module (no component/props); exported functions unchanged; internal `const PREFIX` `'vault-theo:v1:'` → `'vault-dottie:v1:'` | n/a (client cache) | `localStorage` only; no backend |
| `TheoMain` (`TheoMain.tsx`) | `TheoMainProps` unchanged (`{ t; mode: "full"\|"panel"; suppressNarrowHeader? }`); root style adds `background: C.bg` | DOTTIE_DESIGN_SYSTEM §2.1 `--ink` / §2 P2 | none (presentational) |

## §GAP — Gap Disclosure
**PROCEED.**
- **G-1 — Companion to the Origin corrections.** This is the vault-dottie half of Batch A; the Origin half (breadcrumb/1-10-chrome/rail/icon) is vault-origin `3a66ca3`. The 9/10 dark needs BOTH (Origin stops overriding + Dottie paints). Disclosed.
- **G-2 — Existing shared-namespace cache is abandoned, not migrated.** After deploy Dottie reads the fresh `vault-dottie:v1:` namespace; any pre-existing `vault-theo:v1:` entries are simply ignored by Dottie (and remain Theo's). No migration needed (it is a revalidated seed). Disclosed.
- **G-3 — Deploy + eyeball.** Lands on `development` → dev SWA, verified mounted in Origin. PROCEED.

## §DELTA — changed files (before → after evidence)
Two files, git-diffable base→proposed (GCR rows 5–6). `theoSnapshot.ts` (`d653da76`→`fd7f079c`): `PREFIX` `'vault-theo:v1:'`→`'vault-dottie:v1:'` + comment. `TheoMain.tsx` (`0150b85d`→`c420af97`): root style `+ background: C.bg`. No other bytes changed.

## §CODEX — activation (Walter forwards)

```
Codex is activated for Pass-2 FRONTEND review of the Dottie Mount Companion Corrections, vault-dottie,
"Codex Governance/Dottie-Mount-Companion-Corrections-Pass-1-VEP/Dottie_Mount_Companion_Corrections_VEP.md" @ commit <HEAD>.
Open Pass-2 with a governance-bound GCR + Rule Anchor Table; hard-gate; emit only APPROVED or REJECTED. Companion (vault-dottie
half) to the Origin visual corrections (vault-origin 3a66ca3). TWO edits, both FE-only, no backend/schema/route: (1) CRITICAL
isolation — theoSnapshot.ts PREFIX 'vault-theo:v1:' → 'vault-dottie:v1:'. Theo + Dottie mount into the same Origin page origin
and share one localStorage; the copied prefix made Dottie's cold-open cache read Theo's recents/last-conversation. The single
constant keys nsKey() + bindPrincipal()'s foreign-purge, so the change isolates read, write, and purge into Dottie's namespace;
exported API shape/behaviour unchanged; backend never involved (Dottie=func-dottie/dottie_* RLS). (2) TheoMain.tsx root paints
background: C.bg (#0C0F14, DOTTIE §2.1 --ink) so mode="panel" fills Dottie's dark ground in the Origin 9/10 (no-op in
mode="full" — the .vo-standalone wrapper already paints it). Review: (1) no redesign — Dottie's committed dark identity
(DOTTIE §2 P2) realized in-panel as standalone; isolation restores the per-principal boundary the module documents (Exception
§2) but the copied prefix defeated. (2) additive/minimal — two ACTIVE files, one constant + one style property; no new
component/prop/route/dependency. (3) tsc -p tsconfig.app.json exit 0 + vite build clean (DottieSurface federated chunk emits).
Mechanical lint PASS. Emit APPROVED or REJECTED only.
```

*End of Dottie Mount Companion Corrections Pass-1 Frontend VEP.*
