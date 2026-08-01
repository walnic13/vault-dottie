# CLAUDE CODE — THEO BACKEND GOVERNOR STANDARD

Scope: Vault Theo backend. Binds Claude Code's authoring behavior in the Theo backend pipeline.
Filename / location: `governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md`.

> **Status: v0.1 DRAFT — lean Governor.** This standard names Claude Code's operational obligations for Theo backend work and points at the truth owners. It is deliberately lean: the grounding machinery (GCR, Rule Anchor Table, grounding modes, invalidity triggers, sub-phase matrix, pass model, mechanical lint) lives in `governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md` ("the Conformance Standard") and is not restated here. The substantive backend truth owners (DDL, endpoint contracts, handler patterns) are the Theo spec docs in `spec/` (Theo API Spec, Theo Azure Postgres Schema) and `governance/THEO_GOLDEN_HANDLER_STANDARD.md`, authored through Phase 1B. The architecture/boundary truth owner is `governance/THEO_ARCHITECTURE_AND_STRUCTURE.md`. The **reviewer is Codex**. Reporting-specific Governor bulk (seed-load rules, Graph-delegation families, Tier-3 mapping, vision registries) is intentionally NOT carried; it is reintroduced only if and when a Theo feature requires it, by a Walter-approved governance amendment.

---

## §1 Authority and Relationship

1. Where this Standard and the Conformance Standard appear to conflict on grounding format, modes, invalidity, sub-phases, passes, or the lint, **the Conformance Standard governs**; this Standard's references to those topics are pointers.
2. Where this Standard and a substantive truth owner (Theo API Spec, Theo Azure Postgres Schema, Theo Golden Handler Standard, architecture doc) conflict on the matter that document owns, **that document governs**. Detection of conflict is a halt + Role-C trigger (§7).
3. Walter is the sole execution and exemption authority. Exemptions are explicit, scoped, dated, recorded.

## §2 Local Grounding Workflow (Pass 1 spine)

Before emitting any governed backend output, Claude Code completes the bootstrap (sync `development`; classify the working tree; record HEAD SHA), reads the Conformance Standard §3/§4/§4A for the turn type, and walks the §4A.1 sub-phases P1–P8 in order, anchoring each in the Rule Anchor Table. Sub-phase identity is declared in the GCR (`Sub-phase Track`). No sub-phase is skipped; an inapplicable sub-phase is marked explicit `N/A` with a one-line reason.

## §3 Never-Guess Rule

Claude Code MUST NOT assert any schema object, column, policy, function, endpoint contract, status code, or external-system behavior that it has not read this turn in the governing document or established by read-only SQL evidence. DEPLOYED vs PROPOSED is a classification, not an assumption (§4). Unknown ⇒ halt and obtain evidence, never infer.

## §4 Schema Reality Lock (P3)

Every `theo_` table/column/policy/function referenced by a microstep is classified **DEPLOYED** (present in the Theo Azure Postgres Schema and confirmed) or **PROPOSED** (this microstep introduces it). Conventions are fixed by the architecture doc §5.1/§5.2 (`theo_` prefix; `created_by text NOT NULL` = Entra OID; `id uuid` PK; server-managed timestamps; per-table SECURITY DEFINER existence helper; RLS ENABLED with four separate SELECT/INSERT/UPDATE/DELETE policies keyed on `auth.uid()`; ownership default). The Theo Azure Postgres Schema is the DEPLOYED-state truth owner.

## §5 Pre-Plan Contract Evidence (P4)

For each in-scope endpoint, cite the Theo API Spec entry and confirm the route-naming convention `theo_<operation>_<entity>`. For any consumed Corporate Reporting endpoint, cite the Theo Tool Manifest entry (which points at the canonical Corporate Reporting API Spec); **never** fork the Reporting spec and **never** access `reporting_*` tables directly (architecture §0a/§1.3/§4.3; Conformance §6 item 20 / §10 T40).

## §6 SQL and Authorization Discipline

- **Read-only grounding SQL** (local) is `SELECT`-only; no write SQL, migrations, or side-effecting functions locally.
- **Walter-executable SQL** (migrations, seeds, writes) is authored copy/paste-ready, targeted at Walter, and is never executed by Claude Code. Migration files carry no top-level transaction-control; handler-execution SQL follows the Theo Golden Handler Standard SQL rules.
- **Post-migration verification** is read-only `SELECT`-only (V1–Vn), run only after a Walter execution confirmation.
- Governed SQL blocks contain no prohibited psql meta-commands (Conformance §10 T26).
- **Authorization boundary:** Claude Code plans and hands off; Walter executes all database writes and migrations. Claude Code never writes or migrates the database. **Deployment:** Walter deploys, except the scoped exception (Theo Execution Orchestration Standard §1E, DR-T7; Walter-granted 2026-07-04) under which Claude Code MAY deploy handler/function code to the designated dedicated Theo Function Apps (`vaultgpt-func-chat`, `vaultgpt-func-theo-tools`, and the streaming sidecar `vaultgpt-func-stream`) after a Codex-APPROVED VEP; the monolith `vaultgpt-func-premium` remains READ-ONLY / never written by Claude Code (extended 2026-07-17 by DR-T10/DR-T11), EXCEPT the narrow DR-T14 carve-out (2026-07-24) under which Claude Code MAY deploy the Projects-domain knowledge handlers `theo_add_project_knowledge`/`theo_remove_project_knowledge`, and the narrow DR-T15 carve-out (2026-07-25) under which Claude Code MAY deploy the chat-read handler `theo_get_conversation` (media-persistence read), to premium via surgical Kudu VFS after a Codex-APPROVED VEP.

## §7 Golden Curl + Handler Discipline (P5/P7, I2/I4)

Handler structure, the canonical Primary Reference selection, Allowed Deltas, the Structural Mirror Table, and curl determinism are owned by `governance/THEO_GOLDEN_HANDLER_STANDARD.md`. Claude Code selects exactly one canonical Primary Reference handler + function.json (no composite), inlines them full-verbatim in the turn, emits the Structural Mirror Table, and emits deterministic golden curls for every in-scope endpoint.

## §8 VEP Format and Gap Register (P8, P2.5)

A Verified Evidence Pack opens with the GCR + Rule Anchor Table (Conformance §3/§5) and contains, at minimum: feature identification; architecture & boundary reconciliation; **Gap Register** (proactive disclosure of foreseeable downstream gaps with a `PROCEED` / `PRE-LAND` / `ESCALATE` pivot, or a verbatim `NO-GAPS` certification); schema grounding (DEPLOYED/PROPOSED); contract grounding; handler grounding; Walter-executable SQL; deterministic curls; and the mechanical-lint PASS block (Conformance §10 T24). The Gap Register vocabulary is closed: `PROCEED` / `PRE-LAND` / `ESCALATE` / `NO-GAPS` — no invented variants.

## §9 Implementation Package Approval Contract (I1–I6)

An Implementation Package is emitted only against a Codex-APPROVED VEP for the microstep, opens with the GCR + Rule Anchor Table, and contains the structural mirror, any Walter-executable migration SQL, the deterministic curl set, and the parity checklist (truth owner: Theo Golden Handler Standard).

## §10 Reviewer Directive (handoff to Codex)

A deterministic note forwarding a package to Codex opens with a single grounding directive naming the **Codex Theo Review Standard** first; a second-line Conformance §4 classification pointer is permitted. The note never conditions approval on ChatGPT review.

## §11 Verbatim-Edit Handoff / Pending Role-C (E3 / F-E2 analog)

On detecting documentation drift against deployed reality, or any change to a governed document, Claude Code halts substantive work and emits a Role-C Verbatim-Edit Handoff (exact before/after text for each edit) for Codex to execute; Claude Code does not silently edit governed documents mid-turn.

## §12 Branch / Commit / Push Discipline

Claude Code authors on a dedicated `vault-theo` dev/feature branch. Commit, push, branch creation/deletion, and merge require their normal per-package Walter authorization. Read-only git (`status`/`log`/`diff`/`fetch`/`pull --ff-only`) is always permitted.
