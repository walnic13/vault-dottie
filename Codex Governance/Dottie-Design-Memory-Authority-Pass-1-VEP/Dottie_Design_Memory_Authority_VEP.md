# Dottie Memory Model — Authority re-review (rev-2; T13/T22 engine-scope fix)

**Prior pass = split verdict.** `spec/DOTTIE_DESIGN_SYSTEM.md` was **APPROVED (Codex Pass-2, 2026-08-02)** and is now **binding** Dottie visual authority (status flipped in the doc) — **out of scope for this re-review.** `spec/DOTTIE_MEMORY_MODEL.md` was **REJECTED (T13/T22)** for overstating the live access-engine scope. This rev-2 submits **only the corrected memory model** for re-review.

**The fix (T13/T22 — grounded, not guessed).** The doc claimed Dottie reads Theo's **L1.5 / L2 / L3** through the "already-live" engine and wired build-step 4 to `theo_get_project_context_item` for "L1.5/L2/L3 context." The **deployed contract is narrower** (`vault-theo/spec/THEO_API_SPEC.md` §2.19; `VAULT_MEMORY_ARCHITECTURE.md` §7.3/§7.4): `theo_get_project_context_item` reads a **single L1.5 Project Context item**, and the `theo_can_read` classifier **reserves L2 and L3 fail-closed** until those schemas + read handlers land. Corrected to split **LIVE today (L1.5 only, single-item)** from **FUTURE (L2/L3, reserved fail-closed)** at every occurrence: INV-3, §2.2 (Dottie-L2), §2.3 (Dottie-L3), §4 (engine-gated reads — now two explicit subsections), §5 (FE mapping), §7 (build-step 4), + a live-engine authority cross-reference (§9). No other change; the invariants, layer purposes, findings store, plates lens, and TODO-tool design are unchanged.

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Pass 1 re-review — authority-document establishment (design/spec; no code, no migration, no deploy)
Grounding parent (source baseline): `1c8ef07c814df9965c68bb91a736059c6992c0aa` (vault-dottie, `development`)
Grounding Mode: Full Baseline Grounding
Pass: Pass 1 (rev-2)
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD) |
| - | ------------------------------- | ------------------------------ | --------------------------------- |
| 1 | GOVERNING AUTHORITY — `governance/VAULT_MEMORY_ARCHITECTURE.md` (§5 L4=Dottie; §7.3/§7.4 the engine's reserved-L2/L3 scope; §7.5 Six-Plates; §A Amendments 3/4/8/9) — the authority the memory model is downstream of | `Read`(§5/§7.3-4/§7.5/§A) this turn | `3afda098df614b11adc8a7cdcf28d0f9a3f47011` |
| 2 | Backend Governor — `governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md` (§3 Never-Guess — the fix is grounded in the deployed engine contract, not asserted) | `Grep("Never-Guess")` this turn | `e44cdd85d3d0e5df332dc754cdec731e2e68022e` |
| 3 | Grounding Conformance — `governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR; §5 Rule Anchor) | `Grep("MUST open with a Grounding Conformance Receipt")` this turn | `7c0d902bdff3b6c0af475b483e31ed796214e57b` |
| 4 | **LIVE ENGINE AUTHORITY (the scope source) — `vault-theo/spec/THEO_API_SPEC.md` §2.19** (`theo_get_project_context_item` = single L1.5 item; L2/L3 reserved fail-closed) — cross-repo; the deployed contract the correction is grounded in | `Read`(§2.19) this turn | `a09026267cd15161038c5b42a3d54953d39aafaa` (vault-theo HEAD `b5318cf`) |
| 5 | CURRENT Dottie schema — `spec/DOTTIE_AZURE_POSTGRES_SCHEMA.md` (`dottie_user_memory` = Dottie-L1 today, no plate) | `Read` this turn | `53ee66d1f2192163463bf4de40407652b6913e8c` |
| 6 | **RE-REVIEW TARGET (corrected) — `spec/DOTTIE_MEMORY_MODEL.md`** (Doc 2; live-L1.5-vs-future-L2/L3 split applied) | `Read`(full) this turn | `d4ce4b3d7b42d1b884a9d4fa845a29f773d55c84` |
| 7 | APPROVED last pass (context only, NOT re-reviewed) — `spec/DOTTIE_DESIGN_SYSTEM.md` (binding visual authority; status flipped) | cited; unchanged in substance @ HEAD | `744523cf905df1186d954b86519b1cdeddac539c` |

No ChatGPT advisory cited. No `reporting_*` / `theo_*` / `dottie_*` runtime object touched. Design/spec authority doc only (no migration, no write SQL, no route/handler/schema change, no deploy).

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt" | GCR (head) |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §3 | "Never-Guess" | §1/§2 — the L1.5-live / L2-L3-reserved split is grounded in THEO_API_SPEC §2.19 (GCR row 4), not assumed |
| governance/VAULT_MEMORY_ARCHITECTURE.md | §5 | "Governance = \"Dottie\"" | §2 — Dottie is L4; her memory downstream of the authority, no rewrite |

---

## §1 — What this re-review covers
Only `spec/DOTTIE_MEMORY_MODEL.md` (GCR row 6). The Design System (GCR row 7) is already APPROVED + binding; it is not re-reviewed. No code/migration/deploy — the doc is authority for future Codex-governed Dottie backend packages, which build the `dottie_*` stores + the plate column against it later.

## §2 — The correction (blocking finding resolved)
The T13/T22 overstatement is removed. The memory model now states, at every occurrence:
- **LIVE today — L1.5 only.** Dottie reads Theo's L1.5 Project Context via the deployed `theo_get_project_context_item` — **one item at a time** (`theo_can_read` + Rule-5 Graph reachability + firm-role lowest-participant), fail-closed. Explicitly: **no bulk L1.5/L2/L3 context fetch.**
- **FUTURE — L2 / L3.** The deployed `theo_can_read` classifier **reserves L2 and L3 fail-closed** until those schemas + read handlers (or engine extensions) exist; Dottie's L2/L3 reads are a downstream capability, not live.
This is grounded in the deployed contract (GCR row 4, `THEO_API_SPEC.md` §2.19) and the authority's own §7.3/§7.4 (GCR row 1). Build-step 4 is retitled "Engine-gated **L1.5** reads"; §2.2/§2.3 mark Theo-L2/L3 reads as future/reserved; the Open Questions (O-L2/O-L3-SPLIT) already scoped these as downstream. No invariant, store, or plates-lens design changed.

## §3 — Boundary
Design/spec authority only. The `dottie_findings`/`flags`/`review_chains` tables and the Dottie-L1 `plate` column remain **design, not built** — they land via their own Codex-governed backend packages grounding against this doc.

## §4 — Gap Register
**PROCEED.** The blocking finding is resolved and grounded; the doc is internally consistent and downstream-faithful to the authority.
- **G-SECONDARY-DONE.** The activation note no longer presents the grounding-parent SHA as a "review HEAD" (Codex secondary cleanup): the grounding parent (`1c8ef07…`) is labelled as such in the GCR, and the activation note references the VEP by path + blob, not a bare "HEAD" that reads as the reviewed head.
- **G-CROSSREPO: DISCLOSED.** Row 4 is a `vault-theo` cross-repo anchor (the deployed engine contract), same posture as prior Dottie cross-repo refs; blob `a0902626…` is what Codex itself cited.

## §CODEX — activation
```
Codex — Dottie Memory Model, Authority re-review (rev-2). Open with a governance-bound GCR + Rule Anchor
Table, hard-gate, APPROVED/REJECTED only. Repo vault-dottie, branch development; grounding parent
1c8ef07c814df9965c68bb91a736059c6992c0aa (this is the GROUNDING PARENT, not the review head — review the
package at current development HEAD). VEP: Codex Governance/Dottie-Design-Memory-Authority-Pass-1-VEP/
Dottie_Design_Memory_Authority_VEP.md. Re-review target: spec/DOTTIE_MEMORY_MODEL.md blob
d4ce4b3d7b42d1b884a9d4fa845a29f773d55c84 (GCR row 6). Prior pass split: DOTTIE_DESIGN_SYSTEM.md APPROVED +
now binding (blob 744523cf, GCR row 7 — NOT re-reviewed). This rev-2 resolves the sole blocking finding
(T13/T22 live-engine overstatement): the doc now splits LIVE (L1.5 only, single item via
theo_get_project_context_item — THEO_API_SPEC §2.19, GCR row 4) from FUTURE (L2/L3 reserved fail-closed in
theo_can_read), at INV-3/§2.2/§2.3/§4/§5/§7 + a live-engine cross-ref. No code/migration/deploy; no other
change. APPROVED or REJECTED only.
```
