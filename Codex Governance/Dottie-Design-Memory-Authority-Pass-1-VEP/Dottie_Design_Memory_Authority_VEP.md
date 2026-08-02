# Dottie Design System + Memory Model — Authority Establishment (Pass-1 VEP)

Submits **two DRAFT authority documents** for Codex Pass-2 so they become binding Dottie authority (Walter-directed: "Codex-review them"). Both are **design/spec authority docs — no code, no migration, no deploy.** Once approved they are the **grounding basis** every future Codex-governed Dottie package references (FE packages → the design system; backend/memory packages → the memory model), exactly as prior Dottie FE packages grounded against "VA-T1 = Theo's transplanted FE" and backend packages ground against `VAULT_MEMORY_ARCHITECTURE.md`.

**Doc 1 — `spec/DOTTIE_DESIGN_SYSTEM.md` (visual authority).** Establishes Dottie's dark governance-console identity: tokens (ink + gold + monospace provenance, committed single theme), the governance component anatomy, the three answer intensities (claim-to-adjudicate rule), the four surfaces, and the Origin shell contract. **It SUPERSEDES, for Dottie only, the "byte-verbatim transplant of Theo's FE (VA-T1)" basis** — Dottie now has her own visual authority; Theo's FE governance is unaffected. Grounded in the validated design (three Walter-approved concept mockups) + the real Origin shell (`vault-origin/src/shell/*`, cross-repo).

**Doc 2 — `spec/DOTTIE_MEMORY_MODEL.md` (persistence design).** Defines Dottie's memory incorporating the Vault 5-layer architecture + Six Plates: invariants (never Theo L1; Dottie-L1 separate/consensual; reads Theo L1.5/L2/L3 via the live access-policy engine, never duplicate; L4 observational not gating), Dottie-L1 (+ opt-in plates lens) / L2 / L3, the governance-findings store (`dottie_findings`/`flags`/`review_chains`), the cross-agent TODO tool, build order + open questions. **It is strictly downstream of `governance/VAULT_MEMORY_ARCHITECTURE.md` (§5, §7.5, Amendments 3/4/8/9) — it does not rewrite the authority; any new architectural decision is flagged as an Open Question for the authority, not silently made.**

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Pass 1 — Authority-document establishment VEP (design/spec; no code, no migration)
Grounding parent (source baseline): `b858f5b34e5b0e09127cbe12464a05b57cefb800` (vault-dottie, `development`)
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD) |
| - | ------------------------------- | ------------------------------ | --------------------------------- |
| 1 | GOVERNING AUTHORITY — `governance/VAULT_MEMORY_ARCHITECTURE.md` (§5 layers incl. L4=Dottie; §7.5 Six-Plates lens; §A Amendments 3/4/8/9) — the authority Doc 2 is downstream of | `Read`(§5/§7.5/§A) this turn | `3afda098df614b11adc8a7cdcf28d0f9a3f47011` |
| 2 | FE Governor — `governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md` (§3 VEP+CCT; §4 UI authority; the visual-authority frame Doc 1 now fills for Dottie) | `Grep("Component Contract Table")` this turn | `3afec7ea4b13650ce2bf28bf32073179a35e7b24` |
| 3 | FE Grounding Conformance — `governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR; §5 Rule Anchor) | `Grep("Grounding Conformance Receipt")` this turn | `4f2f42e799be5db31e1e35e523d656ff4c1c057e` |
| 4 | Codex FE Review — `governance/CODEX_THEO_FRONTEND_REVIEW_STANDARD.md` (Pass-2 surface for Doc 1) | cited; unchanged blob @ HEAD | `25cc488091d619d8f6642b10552df0d019a87933` |
| 5 | Golden Component Pack — `governance/THEO_GOLDEN_COMPONENT_PACK_STANDARD.md` (§canonical visual authority — Doc 1 becomes Dottie's canonical reference, superseding the Theo transplant) | `Grep("canonical")` this turn | `0035a1d9fed103d07bf420b957c3727ec47fcc6b` |
| 6 | Backend Governor — `governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md` (§3 Never-Guess — Doc 2 grounded in the authority + validated design + shell reading, not invented) | `Grep("Never-Guess")` this turn | `e44cdd85d3d0e5df332dc754cdec731e2e68022e` |
| 7 | Grounding Conformance — `governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR; §5 Rule Anchor) | `Grep("MUST open with a Grounding Conformance Receipt")` this turn | `7c0d902bdff3b6c0af475b483e31ed796214e57b` |
| 8 | CURRENT Dottie schema — `spec/DOTTIE_AZURE_POSTGRES_SCHEMA.md` (`dottie_user_memory` = Dottie-L1 today, no plate — the state Doc 2's §2.1/§7 build on) | `Read` this turn | `53ee66d1f2192163463bf4de40407652b6913e8c` |
| 9 | **CROSS-REPO shell grounding** — `vault-origin/src/shell/ShellFrame.tsx` (the App Host; the rail/1-10/9-10-pool/right-panel composition Doc 1 §7 grounds the shell contract in; right-panel-is-chat-only reality via `RightPanelTabs.tsx` blob `32e30cdb9c759eb266708c6ae5bb61fc8f7f30a2`) | `Read`(shell survey) this turn | `082a481ba0d00422f441db21831bd55e576584da` (vault-origin HEAD `5fe5efd`) |
| 10 | **NEW AUTHORITY — `spec/DOTTIE_DESIGN_SYSTEM.md`** (Doc 1; visual authority; supersedes VA-T1 for Dottie) | `Read`(full) this turn | `0c9ac51eb39a693ff782d714e9ffd3bd3710a48b` |
| 11 | **NEW AUTHORITY — `spec/DOTTIE_MEMORY_MODEL.md`** (Doc 2; persistence design; downstream of row 1) | `Read`(full) this turn | `eade4fa2df3ea2dd72143170de9495b71599a046` |

No ChatGPT advisory cited. No `reporting_*` / `theo_*` runtime object touched. Design/spec authority docs only (no migration, no write SQL, no route/handler/schema change).

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt (GCR) and a Rule Anchor Table" | GCR + this table |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §4 | "reproduce it faithfully, do not redesign" | §2 — the redesign is a Walter-directed, expressly-authorised establishment of a NEW visual authority for Dottie (not an unsanctioned redesign of Theo) |
| governance/THEO_GOLDEN_COMPONENT_PACK_STANDARD.md | §canonical | "Structural Mirror" | §2 — Dottie's canonical visual reference moves from Theo's FE to Doc 1; Theo chat mechanics still reused (Doc 1 §9) |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §3 | "Never-Guess" | §3 — Doc 2 is grounded in the memory authority + current schema + shell reading; new decisions are flagged Open, not asserted |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |

---

## §1 — What this establishes (and does not)
Two authority documents move from DRAFT to binding on Codex APPROVED. **Nothing is implemented by this VEP** — no component, handler, migration, or deploy. Future packages implement *against* these docs and are reviewed for conformance to them. This VEP's job is to fix the authority so implementation has a stable, reviewed target.

## §2 — Doc 1 (Design System) — grounding & supersession
- **Grounded in:** the three Walter-approved concept mockups (governance console / Ask Dottie adaptive chat / Theo-embed — validated in-session), and the **actual Origin shell** (GCR row 9): the perm-rail → single-context 1/10 (`ShellLeftPanel`) → hide-not-unmount 9/10 pool (`WorkspaceTabs`) → **chat-only** right panel (`RightPanelTabs`) composition, and the phone `MobileAppBar`/hamburger/one-breakpoint layout. The doc states the **ground truth** (right panel is chat-only today; Theo's right presence is a separate bespoke dock) and derives the shell contract + the three-track split from it.
- **Supersession (FE Governor §4 / Golden Component §canonical):** for Dottie only, Doc 1 replaces "VA-T1 = Theo's transplanted FE" as the visual authority. This is an **expressly Walter-directed** establishment ("make the FE look like a governance platform, dark"), grounded and validated — not an unsanctioned redesign. Theo's FE governance is untouched. Theo chat *mechanics* remain reused (Doc 1 §9).

## §3 — Doc 2 (Memory Model) — grounding & non-rewrite
- **Grounded in:** `VAULT_MEMORY_ARCHITECTURE.md` (GCR row 1) — §5 (L4 = Dottie), §7.5 (Six-Plates lens: NULL=default Work&Craft, opt-in life-plate; L1-only, L3/L4 never read plate state), Amendment 3 (Six Plates = opt-in lens, not schema), Amendment 4 (L2 = behaviour-shaping), Amendments 8/9 (Dottie is L4; Dottie's own L1/L2/L3, consensual Dottie-L1 separate from Theo's, reads shared layers via the engine, never L1) — and the current `dottie_user_memory` state (GCR row 8).
- **Non-rewrite discipline (Never-Guess):** Doc 2 restates the authority's invariants and designs Dottie's stores under them; every place it would make a NEW architectural call (Dottie-L2 own-vs-overlay; Dottie-L3 vs Theo-L3 boundary; Dottie-L1 consent UX; TODO-tool shape; observation runtime) it is recorded as an **Open Question routed back to the authority**, not decided here.

## §4 — Boundary
Design/spec authority only. No `theo_*`/`reporting_*`/`dottie_*` runtime object changed; no migration; no write SQL; no route/handler/function.json/schema change; no deploy. The `dottie_findings`/`flags`/`review_chains` tables and the Dottie-L1 `plate` column named in Doc 2 are **design, not built** — they land later via their own Codex-governed backend packages that ground against this doc.

## §5 — Gap Register
**PROCEED.** Both docs are internally consistent, cross-referenced, and grounded (§2/§3).
- **G-SHELL-CROSSREPO: DISCLOSED.** Row 9 anchors are `vault-origin` (sibling clone), cross-repo like the vault-theo structural refs in prior Dottie packages. If Codex cannot resolve the vault-origin clone, the shell facts in Doc 1 §7 are also self-contained prose (component names + mechanics) and can be confirmed from the map.
- **G-OPEN-QUESTIONS: PROCEED.** Each doc's Open Questions are disclosed, not blockers — they are downstream decisions the authority resolves as implementation approaches.
- **G-SPLIT: DISCLOSED.** The two docs span FE (Doc 1) and backend/memory (Doc 2) domains, submitted together as one coherent Dottie-authority pair; if Codex prefers separate verdicts, they are cleanly separable by GCR rows (Doc 1 = rows 2–5,9,10; Doc 2 = rows 1,6–8,11).

## §CODEX — activation
```
Codex — Dottie Design System + Memory Model, Authority Establishment Pass-2. Open with a governance-bound
GCR + Rule Anchor Table, hard-gate, APPROVED/REJECTED only. vault-dottie @ development HEAD
b858f5b34e5b0e09127cbe12464a05b57cefb800. VEP: Codex Governance/
Dottie-Design-Memory-Authority-Pass-1-VEP/Dottie_Design_Memory_Authority_VEP.md. Two DRAFT authority docs
for review (NO code/migration/deploy): spec/DOTTIE_DESIGN_SYSTEM.md (blob 0c9ac51, GCR row 10 — Dottie's
visual authority; SUPERSEDES the VA-T1 Theo-transplant basis for Dottie only, expressly Walter-directed;
grounded in 3 approved mockups + the real Origin shell, vault-origin/src/shell, GCR row 9) and
spec/DOTTIE_MEMORY_MODEL.md (blob eade4fa2, GCR row 11 — Dottie's persistence; strictly downstream of
governance/VAULT_MEMORY_ARCHITECTURE.md §5/§7.5/Amendments 3/4/8/9, GCR row 1; new decisions flagged Open,
not made). Review for: grounding fidelity, non-rewrite of the memory authority, internal consistency, and
whether the supersession is sound. On APPROVED both become binding; future Dottie FE/backend packages ground
against them. If you prefer separate verdicts, the docs split cleanly (see §5 G-SPLIT). APPROVED or REJECTED only.
```
