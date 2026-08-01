# Vault Theo — Governance (README / Index)

This folder holds Vault Theo's governance standards, adapted from the established Corporate Reporting governance regime per `THEO_ARCHITECTURE_AND_STRUCTURE.md` §0b. **Status: v0.1 — in-progress port.**

## Regime (architecture §0b)

- **Claude Code** authors work, confined to a dedicated `vault-theo` development branch.
- **Codex** reviews Claude Code's work (the reviewer role; replaces Corporate Reporting's "Bolt").
- **ChatGPT** is Walter-advisory only — out of the formal pipeline; never a gate.
- **Walter** holds authority; no deviation without explicit Walter approval.

## Two layers (why some things are copied and some are new)

1. **Process / "shape" standards** — product-agnostic; **adapted (forked + retargeted)** from Corporate Reporting into `THEO_*` standards here. Retargeting: reviewer Bolt→Codex; repo/doc paths → Theo; `reporting_*` → `theo_`; Reporting-specific registries → Theo content.
2. **Authoritative spec docs** — split by ownership:
   - **Theo's own backend** (`theo_` schema, gateway, tool-dispatch, RAG) → **NEW** lean docs in `../spec/` (Theo API Spec, Theo Azure Postgres Schema, Theo Golden Handler Standard), authored through Phase 1B.
   - **The Corporate Reporting API Theo *calls*** → **referenced, not forked**. A small `../spec/THEO_TOOL_MANIFEST.md` names the Theo-callable `reporting_*` subset and points at the canonical Corporate Reporting API Spec. Theo never forks or duplicates Reporting's tables/handlers/specs (architecture §0a/§1.3/§4.3).

## Standard set

| Standard | Status |
|----------|--------|
| `THEO_GROUNDING_CONFORMANCE_STANDARD.md` (backend) | **v0.1 landed** (this pass) |
| `../tools/lint_microstep_submission.mjs` (mechanical lint, T24/T25) | **v0.1 landed** (this pass; parses this folder's conformance §4A) |
| `THEO_ARCHITECTURE_AND_STRUCTURE.md` (foundation, VA-T2) + `../frontend/theo-frontend-reference.jsx` (VA-T1) + `THEO_1A_FRONTEND_HANDOVER.md` (VA-T3) | **landed byte-preserving** (jsx sha256 verified `fe473eed…f2a`) |
| `THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md` | **v0.1 landed** (pass 2) |
| `CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md` / `..._FRONTEND_GOVERNOR_STANDARD.md` | **v0.1 landed (lean)** (pass 2) |
| `CODEX_THEO_BACKEND_REVIEW_STANDARD.md` / `..._FRONTEND_REVIEW_STANDARD.md` | **v0.1 landed (lean)** (pass 3) |
| `CHATGPT_THEO_INFORMAL_REVIEW_STANDARD.md` (out-of-pipeline advisor) | **v0.1 landed** (pass 4) |
| `THEO_GOLDEN_HANDLER_STANDARD.md` / `THEO_GOLDEN_COMPONENT_PACK_STANDARD.md` | **v0.1 landed** (pass 3) |
| `THEO_EXECUTION_ORCHESTRATION_STANDARD.md` | **v0.1 landed** (pass 4) |
| `THEO_FEATURE_LIFECYCLE_MAP_STANDARD.md` | **v0.1 landed (pointer-only)** (pass 4) |
| `../spec/THEO_AZURE_POSTGRES_SCHEMA.md` (data truth) | **v0.1 skeleton landed**; DDL finalized in 1B |
| `../spec/THEO_API_SPEC.md` (contract truth) | **v0.1 skeleton landed**; deployed contracts finalized in 1B |
| `../spec/THEO_TOOL_MANIFEST.md` (Reporting-API pointer) | **v0.1 skeleton landed** (empty authorized set) |
| `THEO_PHASE_1A_FRONTEND_PLAN.md` | **v0.1 landed (living)** — governed 1A scope + pass sequence (F-P1 authority) |
| `THEO_PHASE_1B_BACKEND_PLAN.md` | authored through Phase 1B |

## Mechanical lint usage

```
node tools/lint_microstep_submission.mjs <submission.md> --repo-root .
```
Exit `0` = PASS, `1` = FAIL (violations printed), `2` = usage. It parses `governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md` §4A at runtime and resolves doc aliases to the Theo file paths in its `DOC_ALIASES` map.

## Build sequence (remaining)

1. ✅ Backend conformance standard + mechanical lint (pass 1).
2. ✅ Frontend conformance standard (pass 2).
3. ✅ Governor standards — backend + frontend, lean (pass 2).
4. ✅ Codex review standards — backend + frontend, lean (pass 3).
5. ✅ Golden Handler / Golden Component standards (pass 3).
6. ✅ Execution Orchestration + Lifecycle Map (pass 4).
7. ✅ Spec docs (`../spec/`) — **v0.1 skeletons** scaffolded (schema header, API contract surface, tool manifest); DDL / deployed contracts authored through Phase 1B. (Content/truth docs, not a governance pass; the schema skeleton is reconciled against the canonical architecture doc on byte-preserving delivery.)

**Governance regime complete** as of pass 4: conformance (BE+FE), Governors (BE+FE), Codex review (BE+FE), ChatGPT informal review (advisory), Golden Handler/Component, Execution Orchestration, Lifecycle Map, mechanical lint, bootstrap. The canonical reference pack (VA-T1/T2/T3) has **landed byte-preserving** (jsx sha256 verified). Remaining work is the Phase-1A frontend build and the Phase-1B-authored spec docs.

The conformance standard's references to standards not yet authored are **forward references** until each lands.
