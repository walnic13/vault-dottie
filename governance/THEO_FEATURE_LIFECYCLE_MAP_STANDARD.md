# THEO FEATURE LIFECYCLE MAP STANDARD

Scope: Vault Theo (backend + frontend). A **pointer-only** navigation map of the Theo feature lifecycle.
Filename / location: `governance/THEO_FEATURE_LIFECYCLE_MAP_STANDARD.md`.

> **Status: v0.1 DRAFT — POINTER-ONLY.** This map originates **no rules**. Every cell cites a marker in another authoritative Theo document; where a cell and its cited source disagree, **the cited source governs**. Edits to this map are Role-C verbatim-edit handoffs. New sub-phases may only be introduced upstream by amending the Conformance Standards §4A; this map then acquires a row by Role-C landing.

---

## §1 Purpose

A single navigation surface so an actor can locate, for any point in a microstep's life, the governing document + section. It does not duplicate or restate those documents.

## §2 Pass spine (cited owner)

| Pass | Actor | Owner |
|------|-------|-------|
| Pass 1 — VEP | Claude Code | Backend Conformance §4C / Frontend Conformance §4C; Governor (BE/FE) |
| Pass 2 — review | Codex | Codex Review Standard (BE/FE); Conformance §6/§10 |
| Pass 3 — execution + verification | Walter + Claude Code | Conformance §4A.3 (E1–E3) / §4A.3 (F-E1); Governor SQL/branch sections; Orchestration §1C |
| Pass 4 — Role-C documentation | Claude Code + Codex | Governor Verbatim-Edit Handoff; Codex Review Role-C variant |

## §3 Sub-phase spine (cited owner)

| Track | Sub-phases | Owner |
|-------|-----------|-------|
| Backend plan-authoring | P1–P8 | `THEO_GROUNDING_CONFORMANCE_STANDARD.md` §4A.1 |
| Backend implementation | I1–I6 | `THEO_GROUNDING_CONFORMANCE_STANDARD.md` §4A.2 |
| Backend post-approval | E1–E3 | `THEO_GROUNDING_CONFORMANCE_STANDARD.md` §4A.3 |
| Frontend plan-authoring | F-P1–F-P7 | `THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md` §4A.1 |
| Frontend implementation | F-I1–F-I6 | `THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md` §4A.2 |
| Frontend post-approval | F-E1–F-E2 | `THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md` §4A.3 |

## §4 Inter-pass transitions (cited owner)

| Transition | Trigger | Owner |
|-----------|---------|-------|
| Pass 1 → Pass 2 | VEP complete (GCR + Rule Anchor Table + lint PASS) | Backend Conformance §10 T24; Orchestration §1D |
| Pass 2 → Pass 3 | Codex APPROVED | Codex Review Standard §3; Orchestration §1D |
| Pass 3 → Pass 4 | Drift detected on execution/verification | Governor Verbatim-Edit Handoff; Conformance §4A.3 E3 / F-E2 |
| Rejection loop | any §6/§10 trigger fires | Codex Review Standard §3 (full reissue, no patch-in-place) |

## §5 Gate / halt overlay (cited owner)

| Gate / halt | Owner |
|-------------|-------|
| Architecture & boundary reconciliation (P2 / F-P2) | Conformance §4A; architecture §1–§6 |
| Gap disclosure (P2.5 / F-P2.5) | Governor Gap Register section |
| UI Authority Reconciliation (F-P2) | Frontend Conformance §4B + Frontend Governor §4 |
| Schema Reality Lock (P3) | Backend Governor §4; Theo Azure Postgres Schema |
| No direct `reporting_*` access | Conformance §10 T40; Golden Handler §3 |
| Mechanical-lint gate (T24) | `tools/lint_microstep_submission.mjs`; Conformance §10 T24 |
| Surface-fidelity guardrails (T26) | Frontend Conformance §6 T26; Frontend Governor §6 |
| Verdict discipline (only APPROVED/REJECTED) | Codex Review Standard §3; Conformance §10 T16 |

## §6 Per-actor reading order (cited owner)

- **Claude Code (backend):** bootstrap (`CLAUDE.local.md`) → Backend Conformance §3/§4/§4A → Backend Governor → Golden Handler → spec docs (Theo API Spec, Theo Azure Postgres Schema, Theo Tool Manifest) → architecture doc.
- **Claude Code (frontend):** bootstrap → Frontend Conformance §3/§4/§4A → Frontend Governor → Golden Component Pack → Theo Phase 1A Frontend Plan → §4B Visual Authority Registry (reference pack).
- **Codex:** Codex Review Standard (BE/FE) → Conformance §6/§10 → the pack under review.
- **Walter:** Orchestration §1A/§1C → the artifact requiring execution/acceptance.
