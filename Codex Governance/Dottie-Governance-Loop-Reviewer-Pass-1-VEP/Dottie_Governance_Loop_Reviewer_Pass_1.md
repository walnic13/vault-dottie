# Dottie FE — Governance Loop Reviewer Side (Phase 1b) — Pass 1 FE VEP (CODE-BEARING)

> Reviewer: **Codex** (frontend). **Code-bearing** — 5 vault-dottie FE files. Phase 1b of the Vault Governance Loop (Codex-APPROVED contract, vault-origin `3dcd976`): Dottie's REVIEWER side. On a new governance note threaded by the shell into `app_context.governance_claim` (App Host §6D(4)), Dottie adjudicates each note item via the DEPLOYED `dottie_adjudicate` (②), injects each returned `[[CHECK]]` message as an assistant turn (the existing render path → `GovernanceCheck`), assembles the `GovernanceVerdictSet`, and offers a "Return to Theo" affordance that hands it back via `onRequestAgentHandoff({ target_agent:'theo' })`. Advisory. Reuses the deployed renderer + ② engine — no new render contract, no backend change.

## Grounding Conformance Receipt

```
Role: Claude Code
Turn Type: Pass 1 — delta-evidence pack (code-bearing; Governance Loop reviewer side); re-issue 2 — post-deploy review-arm-guard hardening (found in dev-SWA loop verification)
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A
Grounding parent (source baseline): vault-dottie development 67e77806dd58b6bba977691bd5d0736b6a79f303 (prior rejected push 9ccc058 → this re-issue; + authority: vault-origin loop contract 3dcd976, Codex-APPROVED)
```
The reviewed artifact is the CHILD commit adding this package + the 5 source edits; its commit SHA + this VEP's own blob are reviewer-stamped (self-contained `.md`). The 5 changed source files' proposed blobs are concrete (below).

Delta basis (rejection-correction): prior push `9ccc058` REJECTED on §6D(3) app-aware-only isolation — `governanceVerdictSet` was not cleared on `newChat()` / switch-to-general, and the "Return to Theo" button was gated only on the (possibly stale) verdict set. Correction (2 files): (1) `newChat()` now clears `governanceVerdictSet` + `governanceBusy` — and since `setAgentMode` funnels through `newChat()` (useTheoState `:1300`), switching to general (or any fresh chat) drops the set; (2) the TheoMain button is additionally gated on `t.agentMode === "app-aware"` (defense-in-depth — general mode never shows it). New blobs: `useTheoState.ts` `b568392d79d641584764decf71bcef49e0413d82`, `TheoMain.tsx` `b3fc7180f21aebbdf4c07cc743c0002816c61dcb`. The other 3 files are unchanged.

Delta 2 (post-deploy verification hardening — `useTheoState.ts` only, `b568392`→`adcca5c`): dev-SWA loop verification (2026-08-08) surfaced a spurious **"Couldn't open that project"** toast in app-aware review mode. Cause: Dottie's *transplanted* review-project arm (`getOrCreateReviewProject`→`startInProject`) — a Theo feature — runs on review launch, but Dottie has **no Projects backend** (`DOTTIE_CAPABILITIES.projects: false`), so `startInProject` fail-closes. Fix: guard the arm — `if (!DOTTIE_CAPABILITIES.projects) { setReviewProject(null); return; }` (import `DOTTIE_CAPABILITIES`). The governance loop keys off `currentRid` + `governance_claim`, not `reviewProject`, so skipping the arm is safe; Theo (projects:true) is unaffected. Not part of the original reviewer feature — a pre-existing replica artifact surfaced by the loop.

| # | Document / file (absolute path) | Read this turn | Currency (blob) |
| - | ------------------------------- | -------------- | --------------- |
| 1 | AUTHORITY — Vault Governance Loop Contract §GL4/§GL6/§GL7 (Codex-APPROVED) — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-origin/Codex Governance/VO-AH-Vault-Governance-Loop-Contract-Pass-1/VO_AH_Vault_Governance_Loop_Contract_Pass_1.md` | `Read` this turn | `3dcd976284a825e4079ec6344225e7f459cd2264` |
| 2 | DEPLOYED verdict shape — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/src/theo/lib/check.ts` (`CheckData`/`parseCheck` — one verdict item) | grounded; unchanged | `53fd892efab9541299efe2106c7ed3d3162fcb96` |
| 3 | DEPLOYED check engine (②) — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/Codex Governance/Dottie-Adjudicate-Backend-Pass-1-VEP/dottie_adjudicate.index.js` (the endpoint the reviewer calls per item) | grounded (deployed + golden-curl-verified this session) | `a3ad1ceaa7fbbba1f6bee4ea41f9a57742a90d5c` |
| 4 | Reporting FE Governor — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/corporate-reporting/frontend/governance/CLAUDE_CODE_REPORTING_FRONTEND_GOVERNOR_STANDARD.md` | grounded; unchanged | `74303aa34c7ed1e7a82099612f07edfc253f50fe` |
| 5 | Codex FE Review — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/corporate-reporting/frontend/governance/CODEX_REPORTING_FRONTEND_REVIEW_STANDARD.md` | grounded; unchanged | `8732c728fc54b53af2d388ea9e733a798c91de9a` |

### Code currency (base @ grounding parent `67e7780` → proposed @ review HEAD)
| Source file (absolute path) | Base blob | Proposed blob |
| --------------------------- | --------- | ------------- |
| `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/src/theo/services/gateway.live.ts` | `a3f95d5324be7e832d1dafe2c77cb299274238cf` | `69063f7586e0fcf79366c9303f51ecc3e7cb45f4` |
| `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/src/theo/services/theoClient.ts` | `f83e728b6617d58b0bf3423e9dab658647e2337a` | `42d1d9c2986e54e65b8257b501fefe6f36842208` |
| `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/src/theo/useTheoState.ts` | `8aa18758a2a8b30749246a9341f4261aff95f1cf` | `adcca5c87fd10961394f5b9cf41f71a9e95269d8` (re-issue: `newChat()` clears the verdict set; re-issue 2: review-arm guarded off when `projects` capability is false) |
| `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/src/theo/TheoSurface.tsx` | `c45bb669490ab1eefdfed786b291b73cb102fb09` | `22df56b69c9ae62e07a2bea81799b929bdd1b9c0` |
| `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/src/theo/components/TheoMain.tsx` | `e7b8c38d1486a429137cc398b66058da537811e8` | `b3fc7180f21aebbdf4c07cc743c0002816c61dcb` (re-issue: button gated on app-aware) |

## Rule Anchor Table

| Source doc (absolute path) | Clause id | Verbatim clause text (read this turn) | Applied in output at |
| -------------------------- | --------- | ------------------------------------- | -------------------- |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-origin/Codex Governance/VO-AH-Vault-Governance-Loop-Contract-Pass-1/VO_AH_Vault_Governance_Loop_Contract_Pass_1.md | §GL7 | "Dottie runs `dottie_adjudicate` per item" | `useTheoState` governance effect loops the note items, calling `theoClient.adjudicate` per `control_id` |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-origin/Codex Governance/VO-AH-Vault-Governance-Loop-Contract-Pass-1/VO_AH_Vault_Governance_Loop_Contract_Pass_1.md | §GL4 | "a verdict *set* is a list of them" | the effect injects each item's `[[CHECK]]` as an assistant turn (rendered by the existing `GovernanceCheck` path) |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-origin/Codex Governance/VO-AH-Vault-Governance-Loop-Contract-Pass-1/VO_AH_Vault_Governance_Loop_Contract_Pass_1.md | §GL5 | "target_agent: 'theo'" | the "Return to Theo" button calls `onRequestAgentHandoff({ target_agent: 'theo', claim: verdictSet })` |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-origin/Codex Governance/VO-AH-Vault-Governance-Loop-Contract-Pass-1/VO_AH_Vault_Governance_Loop_Contract_Pass_1.md | §GL4 | "cleared` is advisory" | the verdict set's `cleared` drives only a header hint (cleared/changes); nothing authoritative is mutated |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/src/theo/lib/check.ts | header | "the structured body of a [[CHECK]]...[[/CHECK]] block" | each item's verdict is the deployed `CheckData`, parsed by the existing `parseCheck`/`GovernanceCheck` |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/corporate-reporting/frontend/governance/CLAUDE_CODE_REPORTING_FRONTEND_GOVERNOR_STANDARD.md | §1.1A | "Mandatory repo-visible package" | §PERSISTENCE — committed + pushed this turn |

## §1 — Feature / sourcing
Phase 1b of the Governance Loop: Dottie's reviewer side, realized for the Sigma exception-clearance gate. No backend change (calls the DEPLOYED ②); no new render (reuses the DEPLOYED `parseCheck`/`GovernanceCheck` chat path). The inbound note arrives via `app_context.governance_claim` (+ `governance_nonce`) — the FE-B shell channel; the outbound verdict rides the P1a-wired `onRequestAgentHandoff` return seam.

## §CCT — Component Change Table
API dependency: **`dottie_adjudicate`** (DEPLOYED ②, blob `a3ad1ce`, golden-curl-verified) — the only new call; POST `{ review_id, claim:{ kind:'exception_clearance', control_id } }` → `{ data:{ message, verdict_payload } }`.

| File | Change | Signature / shape (verbatim) | Classification |
|---|---|---|---|
| `gateway.live.ts` | new `adjudicate` client (mirrors `sendMessage`: `authHeaders` → `fetch(${apiBase}/api/dottie_adjudicate)` → envelope unwrap) | `adjudicate(reviewId: string, claim: { kind; control_id; theo_assessment?; preparer_response? }, opts?): Promise<{ message: string; verdict: unknown \| null; control_id: string }>` | ADDITIVE |
| `theoClient.ts` | import `adjudicate as gatewayAdjudicate` + façade passthrough | `adjudicate(reviewId, claim, opts) { return gatewayAdjudicate(reviewId, claim, opts); }` | ADDITIVE |
| `useTheoState.ts` | derive `govClaim`/`govNonce` off `reviewAc`; `governanceVerdictSet`/`governanceBusy` state; nonce-guarded effect (mirrors `reviewArmRef`) that adjudicates each item, injects `[[CHECK]]` turns via `setMessages`, assembles the set; expose both on the hook return. **Re-issue: `newChat()` now clears `governanceVerdictSet`+`governanceBusy`** (and `setAgentMode` funnels through `newChat()`, so switch-to-general clears it too — §6D(3) isolation) | effect keyed on `[govNonce]`; reads `governance_claim`/`governance_nonce` from `effectiveAppContext.app_context` (general mode blanks it); verdict set dropped on any thread reset | ALLOWED DELTA (new derived state + effect + clear-on-reset; no existing behaviour changed) |
| `TheoSurface.tsx` | add optional `onRequestAgentHandoff` prop; pass to `TheoMain` at BOTH render sites (panel + standalone) | `onRequestAgentHandoff?: (handoff: { target_agent: string; claim: Record<string, unknown> }) => void;` | ADDITIVE (optional) |
| `TheoMain.tsx` | add optional `onRequestAgentHandoff` prop; render the "Return to Theo" header affordance. **Re-issue: gated on `t.governanceVerdictSet` AND `t.agentMode === "app-aware"`** (disabled while `t.governanceBusy`) — general mode never shows it | button `onClick` → `onRequestAgentHandoff({ target_agent:'theo', claim: t.governanceVerdictSet })` | ADDITIVE (optional) |

**No existing behaviour changes.** General mode blanks `effectiveAppContext` so the effect never runs; a surface with no `onRequestAgentHandoff` (standalone) hides the button; the deployed chat/`[[CHECK]]` render path is reused verbatim.

## §GAP — Gap Register
**PROCEED.**
- **G-1 — Reviewer side only.** The note's `items` (control_ids) are assembled by Theo (Phase 1c, `sigma_get_review` fetch); this package consumes them. If a note arrives with no items, no verdicts are produced (empty set; `cleared:false` guard `verdicts.length > 0`). Disclosed.
- **G-2 — Reuses DEPLOYED engine + render.** `dottie_adjudicate` (②) is deployed + golden-curl-verified; `parseCheck`/`GovernanceCheck` render the `[[CHECK]]` as they do for chat. No backend/render change. Disclosed.
- **G-3 — Advisory.** `cleared`/verdicts drive only UI; nothing authoritative is mutated in Sigma (matches Loop §GL1 + First-Check advisory stance). PROCEED.
- **G-4 — Env-var fix is a promotion concern.** The prod `VITE_DOTTIE_FUNCTIONS_URL`→`VITE_FUNCTIONS_URL` fix lives in `azure-static-web-apps-main.yml` (a `main`-branch workflow); per the two-SWA pattern it is applied on `main` at promotion, NOT carried by a dev→main app promotion. Out of scope here; tracked for promotion. Disclosed.
- **G-5 — Verify on dev-SWA (Pass-3).** Full loop (Theo note → Dottie verdicts → Return to Theo) is exercised once Phase 1c lands; Walter verifies the co-landed set on the dev-SWA. `tsc` clean. PROCEED.
- **G-6 — Codex re-issue (§6D(3) app-aware isolation).** Prior push `9ccc058` left `governanceVerdictSet` uncleared on `newChat()` / switch-to-general, with the Return-to-Theo button gated only on the stale set. Fixed: `newChat()` clears the set + busy flag (and `setAgentMode`→`newChat()` covers the general switch), and the button is additionally gated on `t.agentMode === "app-aware"`. So the verdict set + affordance exist ONLY in app-aware mode for the current thread; a fresh chat or general switch drops them. `tsc` clean; lint PASS. PROCEED.

## §PERSISTENCE — Governor §1.1A
Committed + pushed to `development` this turn: the 5 FE files + this VEP under `Codex Governance/Dottie-Governance-Loop-Reviewer-Pass-1-VEP/`. No unrelated files; no Class B `.xlsx`.

## Mechanical lint
`node tools/lint_microstep_submission.mjs "Codex Governance/Dottie-Governance-Loop-Reviewer-Pass-1-VEP/Dottie_Governance_Loop_Reviewer_Pass_1.md" --repo-root .` — expect PASS.

## §CODEX — activation (Walter forwards)

```
Codex is activated for Pass-2 FRONTEND review of the Dottie Governance Loop Reviewer Side (Phase 1b, code-bearing),
"vault-dottie/Codex Governance/Dottie-Governance-Loop-Reviewer-Pass-1-VEP/Dottie_Governance_Loop_Reviewer_Pass_1.md"
committed at vault-dottie development <HEAD> + corporate-reporting f928152. Open Pass-2 with a governance-bound GCR +
Rule Anchor Table; hard-gate; emit only APPROVED or REJECTED. CODE-BEARING (5 FE files; base @ 67e7780 → proposed
blobs). Realizes the Sigma exception-clearance gate reviewer side of the Codex-APPROVED Governance Loop contract
(vault-origin 3dcd976). On a new governance note in app_context.governance_claim (+governance_nonce; FE-B channel),
useTheoState adjudicates each item via the DEPLOYED dottie_adjudicate (②, a3ad1ce), injects each [[CHECK]] as an
assistant turn (existing parseCheck/GovernanceCheck path — no new render), assembles the GovernanceVerdictSet, and a
"Return to Theo" header button hands it back via the P1a-wired onRequestAgentHandoff (target_agent:'theo'). Review:
(1) app-aware only — general mode blanks effectiveAppContext so the effect never runs; nonce-guarded (fires once per
hand-off, mirrors reviewArmRef); (2) verdict item = the deployed CheckData (no new render contract); (3) advisory —
cleared/verdicts drive only UI, nothing mutated in Sigma; (4) additive/optional — standalone (no onRequestAgentHandoff)
hides the button; deployed chat path unchanged; (5) new call is dottie_adjudicate only (deployed+verified); no backend/
schema change; tsc clean. Env-var fix (main.yml) is a promotion concern, out of scope here. The VEP's own blob is
reviewer-stamped; the 5 source blobs are concrete. Emit APPROVED or REJECTED only.
```

*End of Dottie Governance Loop Reviewer Side (Phase 1b) Pass-1 FE VEP.*
