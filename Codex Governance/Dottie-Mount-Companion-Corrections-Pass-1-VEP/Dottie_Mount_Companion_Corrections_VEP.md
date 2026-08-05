# Dottie Mount Companion Corrections — Pass 1 Frontend VEP (vault-dottie side of Batch A) — re-issue

> Two small vault-dottie corrections surfaced by Walter's Origin dev-SWA review of the Dottie mount (2026-08-05), companion to the Origin-side visual corrections (vault-origin `3a66ca3`). **(1) CRITICAL — client-cache isolation:** Dottie's `localStorage` snapshot prefix was `vault-theo:v1:` (copied from Theo); mounted in the same Origin page origin the two agents shared one `localStorage`, so Dottie's cold-open cache read **Theo's** recents/last-conversation. Re-namespaced to `vault-dottie:v1:` → full isolation (read, write, foreign-purge). **(2) panel-mode dark ground:** `TheoMain` painted no background, so in `mode="panel"` (the Origin mount) Origin's light showed through the 9/10; it now paints `C.bg` (`#0C0F14`, DOTTIE §2.1 `--ink`). **Re-issue (Codex REJECT on `58e8282`):** (a) the browser-storage authority for Dottie's `localStorage` is now recorded — this package **amends the FE Governor §3** to add the **Walter-authorized (2026-08-05) Dottie Snapshot Storage Exception** (the prior exception was Theo-scoped, "any other repo/surface … prohibited"); (b) the GCR currency labels are corrected (a code-bearing review commit's `@HEAD` blobs ARE the proposed blobs). Faithful — no redesign. **FE + one governance-doc amendment; no backend/schema/route.**

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Pass 1 — Frontend Verified Evidence Pack (re-issue: client-cache isolation + panel ground + storage-authority amendment)
Grounding parent (source baseline): the two source files trace to `f41806e6578cfd0076e996ab060ff70afb9e1e88` (parent of the code commit `58e8282`); the FE Governor amendment this turn is on top of the current dev HEAD `5cb6fb9509fdd0719c89f8726dd6e6199120830b` (vault-dottie, `development`).
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

Currency labelling: this is a CODE-BEARING package — at the review HEAD the changed files' blobs ARE the proposed blobs. So for changed rows the base blob is cited at its PARENT commit and the proposed blob is the review-HEAD blob (anchored to the blob SHA, not the commit). Unchanged grounding docs are cited at HEAD.

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (unchanged: blob @ HEAD; changed: base @ parent → proposed @ review HEAD) |
| - | ------------------------------- | ------------------------------ | -------------------------------------------- |
| 1 | VISUAL AUTHORITY — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/spec/DOTTIE_DESIGN_SYSTEM.md` (§2.1 `--ink` ground; §2 P2 committed dark identity) | `Read`(§17–54) this turn | `744523cf905df1186d954b86519b1cdeddac539c` |
| 2 | FE Grounding Conformance — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR + Rule Anchor) | grounded; unchanged @ HEAD | `4f2f42e799be5db31e1e35e523d656ff4c1c057e` |
| 3 | CHANGED + AUTHORITY — FE Governor — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md` (§3 browser-storage rule — **amended this turn to add the Walter-authorized Dottie Snapshot Storage Exception**; this is the storage authority for row 5) | `Read`(§37) + `Edit` this turn | base @ parent `5cb6fb9` `3afec7ea4b13650ce2bf28bf32073179a35e7b24` → proposed @ review HEAD `f455da9f50b63900c182c2335e713aa4a70048c5` |
| 4 | Codex FE Review — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/CODEX_THEO_FRONTEND_REVIEW_STANDARD.md` (Pass-2 reviewer; APPROVED/REJECTED only) | grounded; unchanged @ HEAD | `25cc488091d619d8f6642b10552df0d019a87933` |
| 5 | CHANGED — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/src/theo/services/theoSnapshot.ts` (the localStorage snapshot cache; `PREFIX` re-namespaced) | `Read`(full) + `Edit` prior turn (58e8282) | base @ parent `f41806e` `d653da7632135a09d71c26c6c5f077060aca74dc` → proposed @ review HEAD `fd7f079c8b95c7a764a7e08f175e3aa34defc241` |
| 6 | CHANGED — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/src/theo/components/TheoMain.tsx` (root paints `C.bg` — this package's line) | `Read`(§35–110) + `Edit` prior turn (58e8282) | base @ parent `f41806e` `0150b85d58b21c689b55800a3b056e4d76e929b7` → proposed @ review HEAD `fdd5c4d1ea601728eb928d62cc14b3807fcf8a48` (see §DELTA: this package's `background: C.bg` was `c420af9` @ 58e8282; the sibling `color: C.ink` is the APPROVED text-color package `5b6e944`, not claimed here) |

No ChatGPT advisory cited. No backend / route / schema / migration.

## Rule Anchor Table

| Source doc (absolute path) | Clause id | Verbatim clause text (read this turn) | Applied in output at |
| -------------------------- | --------- | ------------------------------------- | -------------------- |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §3 | "as the governed Theo replica, MAY use `sessionStorage` or `localStorage`" | §1(1) — the Dottie Snapshot Storage Exception authorizes Dottie's per-principal `localStorage` snapshot |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §3 | "namespaced per authenticated principal `vault-dottie:v1:<oid>:*`" | §1(1) — the `PREFIX` re-namespace realizes the authorized Dottie namespace + the foreign-app purge |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/spec/DOTTIE_DESIGN_SYSTEM.md | §2.1 | "#0C0F14" | §1(2) — TheoMain paints `C.bg` (`#0C0F14`) in panel mode |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/spec/DOTTIE_DESIGN_SYSTEM.md | §2 P2 | "We never dilute the dark identity to blend in." | §1(2) — the 9/10 fills Dottie's dark ground when mounted in Origin |

---

## §1 — Feature
Two corrections to Dottie's federated surface (both surfaced when the mount was reviewed live in Origin), plus the governance amendment that authorizes (1):

**(1) Client-cache isolation (CRITICAL) — now authorized.** `theoSnapshot.ts` is Dottie's per-principal `localStorage` instant-paint seed (recents / last-opened conversation / self). Its namespace `PREFIX` was `vault-theo:v1:` — copied verbatim from Theo. Theo and Dottie both mount as federated remotes into the **same Origin page origin**, so they share one `localStorage`; keyed under the same prefix + same signed-in `oid`, Dottie's `getCachedRecents()` / `getCachedConversation()` read **Theo's** entries → Dottie's cold-open painted Theo's last conversation. Fix: `PREFIX = 'vault-dottie:v1:'` — the one constant every op keys off (`nsKey`, and `bindPrincipal`'s foreign-purge `keep`/`drop`), so reads, writes, and the purge are now fully isolated to Dottie's namespace. **Authority (the Codex REJECT):** Dottie's `localStorage` use was previously grounded only against the Theo-scoped Snapshot Storage Exception, which ends "any other repo/surface … remains prohibited." This package **amends FE Governor §3** to record the **Dottie Snapshot Storage Exception (Walter-authorized 2026-08-05)** — same BINDING constraints as Theo's, scoped to `vault-dottie` `src/theo/`, namespace `vault-dottie:v1:<oid>:*`, with the added at-rest requirement that mount purges BOTH foreign-principal AND foreign-app (`vault-theo:v1:`) namespaces (which is exactly what this `PREFIX` fix + the existing `bindPrincipal` purge now do across the two co-hosted agents). Backend was never involved (Dottie = func-dottie / `dottie_*` RLS) — this is a client-cache display seed only.

**(2) Panel-mode dark ground.** `TheoMain`'s root `<div>` set layout but no `background`. Standalone, Dottie's dark comes from the outer `.vo-standalone` wrapper (`background: C.bg`) in `TheoSurface`; in `mode="panel"` (the Origin mount) only `TheoMain` is portaled, so Origin's light showed through the 9/10. Fix: the root paints `background: C.bg` (`#0C0F14`, DOTTIE §2.1 `--ink`) — a no-op in `mode="full"` (the wrapper is already that colour) and fills the 9/10 dark in `mode="panel"`.

## §2 — Architecture & boundary
Two ACTIVE source files + one governance-doc amendment; no new file, component, prop, route, backend, schema, or dependency. `theoSnapshot.ts`: one constant + its comment (the exported API — `getCachedRecents`/`setCachedRecents`/`getCachedConversation`/`bindPrincipal`/`resolvePrincipal` — unchanged in shape/behaviour; only the namespace string changes). `TheoMain.tsx`: one added `background: C.bg` on the existing root style. FE Governor §3: appends the Walter-authorized Dottie Snapshot Storage Exception clause (records the authority; no other governance change). **Not a redesign** — Dottie's committed dark identity (DOTTIE §2 P2) is realized in the hosted panel exactly as standalone; the isolation restores the per-principal + per-app security boundary the module needs, now under an explicit Dottie authority.

## §3 — Verification (this turn, local)
- `tsc --noEmit -p tsconfig.app.json` → **exit 0** (code state at `58e8282`, re-confirmed this turn; the governor amendment is docs-only).
- `npm run build` (`vite build`) → **clean**; the federated `__federation_expose_DottieSurface` chunk emits.
- Behavioural: after deploy, Dottie reads her empty `vault-dottie:v1:<oid>:*` namespace (no Theo bleed) and purges any `vault-theo:v1:` keys on mount; the 9/10 panel renders on Dottie's `#0C0F14` ground. Best eyeballed on the dev SWA mounted in Origin (§GAP).

## §CCT — Component Contract Table
| Component (file) | Prop / input interface (TS) | Visual authority (VA-id) | Data / contract dependency |
| --- | --- | --- | --- |
| `theoSnapshot` (`theoSnapshot.ts`) | module (no component/props); exported functions unchanged; internal `const PREFIX` `'vault-theo:v1:'` → `'vault-dottie:v1:'` | n/a (client cache) | `localStorage` only; authorized by FE Governor §3 Dottie Snapshot Storage Exception; no backend |
| `TheoMain` (`TheoMain.tsx`) | `TheoMainProps` unchanged (`{ t; mode: "full"\|"panel"; suppressNarrowHeader? }`); root style adds `background: C.bg` (sibling `color: C.ink` is the separate APPROVED package `5b6e944`) | DOTTIE_DESIGN_SYSTEM §2.1 `--ink` / §2 P2 | none (presentational) |

## §GAP — Gap Disclosure
**PROCEED.**
- **G-1 — Storage authority recorded (was the REJECT).** Dottie's `localStorage` is now authorized by the FE Governor §3 Dottie Snapshot Storage Exception (Walter-authorized 2026-08-05), amended in this package (GCR row 3). No missing-authority gap remains. Disclosed.
- **G-2 — TheoMain shared with the text-color package.** `TheoMain`'s current root carries this package's `background: C.bg` AND the APPROVED text-color package's `color: C.ink` (`5b6e944`). This package claims only the background line; the currency row + §DELTA make the split explicit. Disclosed.
- **G-3 — Companion to the Origin corrections.** vault-dottie half of Batch A; the Origin half is vault-origin `3a66ca3`. Disclosed.
- **G-4 — Existing shared-namespace cache is abandoned, not migrated.** After deploy Dottie reads the fresh `vault-dottie:v1:` namespace and purges foreign keys; no migration needed (revalidated seed). Disclosed. PROCEED.

## §DELTA — changed files (before → after evidence)
Three files. **`governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md`** (`3afec7ea`→`f455da9f`): §3 appends the Walter-authorized Dottie Snapshot Storage Exception clause (Dottie surface, `vault-dottie:v1:<oid>:*`, foreign-principal + foreign-app purge, same BINDING constraints); the closing sentence now reads "any surface not named in these two exceptions (Theo, Dottie) … prohibited". **`theoSnapshot.ts`** (`d653da76`→`fd7f079c`): `PREFIX` `'vault-theo:v1:'`→`'vault-dottie:v1:'` + comment. **`TheoMain.tsx`** (`0150b85d`→`fdd5c4d1`): this package added `background: C.bg` to the root style (the intermediate blob at commit `58e8282` was `c420af97`); the current blob `fdd5c4d1` additionally carries `color: C.ink` from the separately-APPROVED text-color package `5b6e944` — not claimed here. No other bytes changed.

## §CODEX — activation (Walter forwards)

```
Codex is activated for Pass-2 FRONTEND review of the Dottie Mount Companion Corrections RE-ISSUE, vault-dottie,
"Codex Governance/Dottie-Mount-Companion-Corrections-Pass-1-VEP/Dottie_Mount_Companion_Corrections_VEP.md" @ commit <HEAD>.
Open Pass-2 with a governance-bound GCR + Rule Anchor Table; hard-gate; emit only APPROVED or REJECTED. Re-issue addressing the
two REJECT gates on 58e8282. Scope: two FE source files (unchanged since 58e8282) + one governance-doc amendment; no
backend/schema/route. FIX 1 (currency): GCR changed rows now cite base @ parent -> proposed @ review-HEAD (a code-bearing
commit's @HEAD blobs ARE the proposed blobs); anchored to blob SHAs. FIX 2 (storage authority): Dottie's localStorage was
grounded only against the Theo-scoped Snapshot Storage Exception ("any other repo/surface prohibited"). This package AMENDS FE
Governor §3 to record the Walter-authorized (2026-08-05) Dottie Snapshot Storage Exception — same BINDING constraints as Theo's,
scoped to vault-dottie src/theo/, namespace vault-dottie:v1:<oid>:*, mount purges BOTH foreign-principal AND foreign-app
(vault-theo:v1:) namespaces. The two original edits stand: (1) theoSnapshot.ts PREFIX 'vault-theo:v1:'->'vault-dottie:v1:'
(isolates Dottie's cold-open cache from Theo — they share one Origin-page localStorage), now authorized by the new exception;
(2) TheoMain root paints background: C.bg (#0C0F14, DOTTIE §2.1) so mode="panel" fills the 9/10 dark. NOTE: TheoMain also carries
color: C.ink from the separately-APPROVED text-color package 5b6e944 — the currency row + §DELTA split the attribution; this
package claims only the background line. tsc exit 0 + vite build clean. Mechanical lint PASS. Emit APPROVED or REJECTED only.
```

*End of Dottie Mount Companion Corrections Pass-1 Frontend VEP (re-issue).*
