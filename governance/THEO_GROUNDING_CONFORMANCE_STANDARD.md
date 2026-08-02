# THEO GROUNDING CONFORMANCE STANDARD

Scope: Vault Theo only. No other project or chain is in scope.
Adoption: Immediate on issuance.
Filename / location: `governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md` in the `vault-theo` repository, alongside the other Theo governance standards.

> **Status: v0.1 DRAFT.** Adapted in the established Corporate Reporting governance shape (`REPORTING_GROUNDING_CONFORMANCE_STANDARD.md`) and retargeted to Vault Theo per `governance/THEO_ARCHITECTURE_AND_STRUCTURE.md` §0b (governance regime). Product-agnostic machinery (§1–§3, §5, §6, §8, §9, §10, §12) is preserved; the Theo-specific cores (§4 turn-type matrix, §4A sub-phase matrix, §4C pass model) are reshaped to Theo's backend (model gateway, `theo_` schema + RLS, tool-dispatch / tool manifest, RAG). The **reviewer role is Codex** (not Bolt) per the architecture doc. Companion Theo standards referenced by §4/§4A (Theo Governor, Theo Golden Handler Standard, Theo Execution Orchestration Standard, Codex Theo Review Standard, Theo API Spec, Theo Azure Postgres Schema, Theo Phase 1B Backend Plan) are authored in subsequent governance passes; until each exists this Standard's references to it are forward references.

---

## §1 Purpose and Authority

This Standard converts grounding from a behavioral instruction ("read the documents") into a structural, falsifiable artifact ("prove you read the documents this turn and prove which clauses you applied"). It exists because the single root cause of enterprise-grade build failure is the same everywhere: agents conflate *having-read-a-document-earlier* with *having-read-it-this-turn*, and governance has no enforcement artifact that distinguishes the two.

This Standard binds Claude Code and Codex as formal roles in the Vault Theo backend execution pipeline. ChatGPT is out of the formal pipeline per `governance/THEO_ARCHITECTURE_AND_STRUCTURE.md` §0b and the Theo Execution Orchestration Standard, and produces only Walter-advisory review; this Standard governs ChatGPT's advisory output only as an advisory hygiene control, never as a pipeline gate. No ChatGPT artifact — GCR-compliant or otherwise — is acceptable as input to any backend pipeline gate, and Codex MUST NOT depend on ChatGPT review or ChatGPT GCR conformance as a condition of approval or rejection.

This Standard is Vault Theo only. It does not apply to any other project, and no provision of it is to be interpreted as binding outside Vault Theo. In particular, it does not supersede, modify, or relax any Corporate Reporting authority document; Theo consumes the Corporate Reporting API as a tool surface (architecture §1.3 / §4) and never forks its tables, handlers, or specs.

A substantive turn is any turn producing a plan, Verified Evidence Pack, Implementation Package, approval, rejection, amendment, or documentation-update package. Every substantive turn from Claude Code or Codex MUST open with a Grounding Conformance Receipt (GCR) and a Rule Anchor Table per §3–§5. Purely administrative turns (as narrowly defined by §2) are exempt and MUST declare themselves as such.

Failure to comply with this Standard on a Claude Code or Codex turn renders the turn automatically invalid per §6. Invalidity is not a discretionary judgment. It is not appealable by reformatting. It is not correctable mid-thread by supplementary turns. The invalid turn MUST be reissued in full.

---

## §2 Definitions

**Turn-Type Matrix.** The published table in §4 mapping each pipeline role + turn-type combination to the set of authoritative documents that MUST be re-read on that turn.

**GCR (Grounding Conformance Receipt).** A fixed-format table opening every substantive Claude Code or Codex turn, listing each required document, the absolute file path, the tool-call invocation that read it *in this turn*, and a currency anchor proving the read reflects current HEAD.

**Rule Anchor.** A four-field record linking one specific clause of one authoritative document to the exact location in the agent's output where that clause was applied. A Rule Anchor Table is the collection of Rule Anchors for a turn.

**Currency Anchor.** A falsifiable proof that the content the agent read is the content at current HEAD of the repository. Default form: a first-20-words-plus-last-20-words snippet of the cited region captured via the same Read tool invocation listed in the GCR, pastable verbatim against HEAD. Fallback form: the git blob SHA of the file, obtained via a tool call this turn — permitted only where first-20/last-20 is impractical (cited region shorter than 40 whitespace-separated tokens, or file is binary/generated and the clause is structural not textual).

**Canonical Primary Reference.** Exactly one named deployed handler file and exactly one named deployed function.json file for each implementation package, selected per the Theo Golden Handler Standard. Composite selections (two handlers contributing different portions of the target pattern) are prohibited.

**Substantive Turn.** Any turn that changes, or requests change to, a plan, a VEP, an implementation package, an approval state, a rejection state, or a documentation amendment. All other Claude Code and Codex turns are administrative. The administrative exemption is narrow and MUST NOT be invoked on any turn producing any of the above outputs.

**Full Baseline Grounding.** A grounding mode requiring broad document-level review of all authority documents required for a new feature/microstep plan, phase-boundary transition, first governed turn after a governance-document change, unresolved drift event, or any turn for which the applicable turn type cannot be safely classified.

**Targeted Current-Turn Grounding.** A grounding mode requiring current-turn Read invocations for the exact documents and sections governing the specific turn. Targeted grounding does not permit memory reliance, prior-turn citation in place of current reads, or unanchored rule application. It permits section/range reads where the turn does not require Full Baseline Grounding.

**Delta Grounding.** A grounding mode permitted only when a prior plan or package has been rejected or modified on specific narrow grounds, and the current turn revises only those affected sections under an express delta rule. Delta Grounding must cite the rule authorizing delta treatment and must not be used for execution handoffs, deployment handoffs, SQL handoffs, or sequencing advancement unless an explicit standard says otherwise.

---

## §3 Grounding Conformance Receipt Format

Every substantive Claude Code or Codex turn MUST open with a table of the form:

```
GROUNDING CONFORMANCE RECEIPT
Role: <Claude Code | Codex>
Turn Type: <from §4 matrix>
Turn issued against HEAD: <git rev-parse HEAD captured this turn>
Grounding Mode: <Full Baseline Grounding | Targeted Current-Turn Grounding | Delta Grounding>
Pass: <Pass 1 | Pass 3 | Pass 4>
Sub-phase Track: <P1-P8 | I1-I6 | E1-E3 | N/A>

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor |
| - | ------------------------------- | ------------------------------ | --------------- |
| 1 | ...                             | Read(file_path=..., offset=..., limit=...) | first-20: "..." ... last-20: "..." |
| 2 | ...                             | ...                            | ...             |
```

The declared grounding mode must be supported by the turn type and by the applicable role standard. If the grounding mode is Targeted Current-Turn Grounding or Delta Grounding, the GCR must cite the clause authorizing that narrower mode.

Rules:

1. Each row MUST correspond to a document required for the declared turn-type per §4. No row may be omitted on the grounds of "already in context" or "previously read."
2. The Read tool invocation MUST be a real tool call executed during this turn. Claimed reads without a tool-call record in this turn's transcript are automatically invalid.
3. The Currency Anchor MUST be independently verifiable. Default is first-20/last-20 per §8. Blob SHA is accepted only as fallback under the conditions in §2 and §8.
4. No row may cite a prior-turn read. Phrases like "captured in prior turn," "previously inlined," "as established above" are prohibited inside the GCR.
5. If the turn is administrative, the GCR is replaced by a single line: `GCR: administrative turn — no substantive output; §4 re-read not required.` Invoking this exemption on a turn that changes any of the items enumerated in §2 is itself an automatic invalidity trigger.
6. Full-document reads are not required by this Standard unless the applicable role standard or turn type expressly requires Full Baseline Grounding.
7. For Targeted Current-Turn Grounding, each GCR row MUST identify the specific section, line range, or cited region read this turn, and the Rule Anchor Table MUST tie every relied-on rule to a current-turn read.
8. For Delta Grounding, the GCR MUST identify the rejected or modified prior artifact, the specific affected sections, and the rule authorizing delta treatment.

---

## §4 Turn-Type Matrix (Authoritative, Vault Theo Backend Pipeline Only)

| Role | Turn-type | Grounding mode | Documents required in GCR |
|------|-----------|----------------|---------------------------|
| Claude Code | Verified Evidence Pack (backend plan) | Full Baseline Grounding | Claude Code Theo Governor Standard; Theo API Spec; Theo Azure Postgres Schema; Theo Golden Handler Standard; Theo Execution Orchestration Standard; Theo Grounding Conformance Standard; Codex Theo Review Standard; Theo Phase 1B Backend Plan; Theo Architecture and Structure; every primary reference artifact cited in the pack |
| Claude Code | Materially revised backend plan | Full Baseline Grounding unless expressly limited by Codex rejection scope | Same as Verified Evidence Pack (backend plan), plus the rejected or prior plan being revised |
| Claude Code | Codex-rejection correction / delta-evidence pack | Delta Grounding | Claude Code Theo Governor Standard sections governing rejection/delta treatment; Codex Theo Review Standard sections governing the rejection; Theo Grounding Conformance Standard; the rejected pack; the inbound Codex rejection; documents and sections affected by the correction |
| Claude Code | Implementation Package | Full Baseline Grounding | Claude Code Theo Governor Standard; Theo API Spec; Theo Azure Postgres Schema; Theo Golden Handler Standard; Theo Execution Orchestration Standard; Theo Grounding Conformance Standard; Codex Theo Review Standard; the approved VEP this package implements; every primary reference artifact cited in the pack |
| Claude Code | Migration execution handoff (theo_ schema) | Targeted Current-Turn Grounding | Claude Code Theo Governor Standard sections governing migration execution handoff, Walter database-write authority, and SQL targeted at Walter; Theo Azure Postgres Schema sections governing migration-file rules and target schema (RLS baseline per architecture §5.2); Theo Execution Orchestration Standard role/executor sections; Theo Grounding Conformance Standard; the Codex-approved VEP/plan section containing the approved migration SQL |
| Claude Code | Walter-executable SQL handoff | Targeted Current-Turn Grounding | Claude Code Theo Governor Standard sections governing SQL targeted at Walter and Walter execution authority; Theo Azure Postgres Schema sections governing the affected schema objects; Theo Golden Handler Standard SQL sections if handler or validation SQL is in scope; Theo Execution Orchestration Standard role/executor sections; Theo Grounding Conformance Standard; the approved plan/package/migration authority that authorizes the SQL |
| Claude Code | Post-migration verification report | Targeted Current-Turn Grounding | Claude Code Theo Governor Standard sections governing post-migration read-only verification; Theo Azure Postgres Schema sections for affected tables/functions/policies; Theo Grounding Conformance Standard; approved VEP/plan verification checklist; Walter execution confirmation message |
| Claude Code | Documentation-update package | Targeted Current-Turn Grounding | Claude Code Theo Governor Standard documentation-update sections; Theo API Spec if edited; Theo Azure Postgres Schema if edited; Theo Execution Orchestration Standard if edited; Theo Phase 1B Backend Plan if edited; Theo Grounding Conformance Standard; target documents being edited |
| Claude Code | Response to Codex note | Targeted Current-Turn Grounding unless the response is a new/revised plan or implementation package | Claude Code Theo Governor Standard sections necessary for the required response; the Codex note itself cited by message anchor; Theo Grounding Conformance Standard; any affected authority sections |
| Codex | Plan approval review | Targeted Current-Turn Grounding against review authorities and pack under review | Codex Theo Review Standard; Claude Code Theo Governor Standard; Theo Golden Handler Standard; Theo API Spec; Theo Azure Postgres Schema; Theo Execution Orchestration Standard; Theo Grounding Conformance Standard; the pack under review |
| Codex | Role-C documentation-update execution | Targeted Current-Turn Grounding | Codex Theo Review Standard documentation-update sections; Theo Execution Orchestration Standard; Theo Grounding Conformance Standard; target documents being edited; the inbound Claude Code / Walter note authorizing edits |
| Codex | Rejection | Targeted Current-Turn Grounding | Codex Theo Review Standard; Theo Grounding Conformance Standard; the invalid pack with the specific trigger cited |

ChatGPT advisory turns are not listed: they are outside this matrix by design.

Any turn-type not listed MUST be declared administrative per §2 or MUST halt pending Walter authorization. A turn that instructs Walter to execute SQL, deploy code, validate runtime behavior, accept/reject an artifact, update documentation, or advance sequencing is never administrative.

---

## §4A Microstep-Phase-to-Required-Read Matrix (Authoritative)

§4 classifies turns at the turn-type level. Within a single substantive turn — especially a Verified Evidence Pack turn or an Implementation Package turn — Claude Code executes several operational sub-phases in sequence. This §4A enumerates those sub-phases and names the authority sections that MUST be read in each. It does not weaken §4; it refines §4 by specifying which sections inside the §4-listed documents are required reads per sub-phase.

§4A is binding on Claude Code. Codex MAY use §4A to verify that a submitted VEP or Implementation Package shows evidence of each required sub-phase read; Codex is not required to re-execute the sub-phases.

### §4A.1 Plan-authoring sub-phases (applies to Verified Evidence Pack turns)

| # | Sub-phase | Purpose | Authority sections required as Targeted Current-Turn reads within the Full Baseline set |
|---|-----------|---------|----------------------------------------------------------------------------------------|
| P1 | Feature identification | Locate the microstep in the governed plan. | Theo Phase 1B Backend Plan feature entry for the target microstep; Theo Execution Orchestration Standard role vocabulary; Theo Execution Orchestration Standard Decision Register (for any in-scope entries). |
| P2 | Architecture & boundary reconciliation | Confirm no conflict with the Theo architecture authorities and binding boundaries. | Theo Architecture and Structure §1 (repository boundary), §2 (model gateway seam), §3 (Origin→Theo context-only contract), §4 (tool-dispatch model), §5 (theo_ schema conventions + RLS baseline), §6 (RAG); Claude Code Theo Governor Standard Never-Guess sections. Condition: applicable to every VEP turn. |
| P2.5 | Gap disclosure (proactive) | Disclose foreseeable downstream gaps and record the pivot decision (`PROCEED` / `PRE-LAND` / `ESCALATE`) or the verbatim `NO-GAPS` certification. | Claude Code Theo Governor Standard Gap Register section; Theo Phase 1B Backend Plan feature entries for the current and named adjacent steps; Theo Execution Orchestration Standard Decision Register; any Schema / API Spec / external-system-contract section whose current-turn read surfaced a gap. Condition: applicable to every VEP turn; `NO-GAPS` is the correct output when no foreseeable gap is surfaced. |
| P3 | Schema grounding | Establish DEPLOYED vs PROPOSED schema truth for every theo_ table, column, policy, function referenced by the microstep. | Theo Azure Postgres Schema sections governing the affected objects (theo_ prefix, ownership column `created_by`, RLS baseline per architecture §5.1/§5.2); Claude Code Theo Governor Standard Schema Reality Lock and Never-Guess sections. |
| P4 | Contract grounding | Confirm existing endpoint contracts and propose-only deltas; for Reporting-API tool calls, confirm against the (referenced, not forked) Corporate Reporting API Spec via the Theo Tool Manifest. | Theo API Spec endpoint entry for each affected operation; Theo Tool Manifest entry for any consumed `reporting_*` endpoint; Claude Code Theo Governor Standard Pre-Plan Contract Evidence section; route-naming convention `theo_<operation>_<entity>`. |
| P5 | Handler grounding | Select the single canonical Primary Reference handler and function.json per the Theo Golden Handler Standard. | Theo Golden Handler Standard canonical-primary-reference selection; Allowed Deltas; Structural Mirror Table; the named deployed handler file (full verbatim inline required per §6 T9); the named deployed function.json file (full verbatim inline required). |
| P6 | SQL grounding | Produce Walter-executable SQL for the microstep, copy/paste ready. | Theo Golden Handler Standard SQL-grounding sections; Claude Code Theo Governor Standard Read-Only SQL and Walter-executable SQL sections; Theo Azure Postgres Schema migration-file rules. |
| P7 | Curl grounding | Produce deterministic golden curls for every endpoint in scope. | Theo Golden Handler Standard curl sections; Claude Code Theo Governor Standard Golden Curl Standards and Curl Determinism sections. |
| P8 | VEP assembly | Assemble all evidence into the Verified Evidence Pack format. | Claude Code Theo Governor Standard VEP Format section; Theo Grounding Conformance Standard §3 and §5 (GCR + Rule Anchor Table open the pack). |

### §4A.2 Implementation-Package sub-phases (applies to post-approval Implementation Package turns)

| # | Sub-phase | Purpose | Authority sections required as Targeted Current-Turn reads within the Full Baseline set |
|---|-----------|---------|----------------------------------------------------------------------------------------|
| I1 | Approval-state confirmation | Confirm the inbound VEP has a Codex APPROVED state for this microstep. | Codex Theo Review Standard approval-process section; the approved VEP for this microstep; Claude Code Theo Governor Standard Implementation Package Approval Contract. |
| I2 | Structural mirror | Emit the Structural Mirror Table per the Theo Golden Handler Standard, tying every handler region to the canonical primary reference. | Theo Golden Handler Standard Structural Mirror section; Claude Code Theo Governor Standard Golden Handler enforcement section; the canonical Primary Reference handler and function.json files. |
| I3 | Deployment-SQL handoff | Produce any migration SQL targeted at Walter. | Claude Code Theo Governor Standard Walter-executable SQL sections; Theo Azure Postgres Schema migration-file rules. |
| I4 | Golden curls (deterministic) | Emit the full deterministic curl set for the implemented endpoints. | Claude Code Theo Governor Standard Golden Curl and Curl Determinism sections; Theo Golden Handler Standard curl sections. |
| I5 | Parity checklist | Emit the parity checklist per the Theo Golden Handler Standard parity section. | Theo Golden Handler Standard parity-checklist section. |
| I6 | Approval contract emission | Assemble the Implementation Package per the Governor Approval Contract and emit. | Claude Code Theo Governor Standard Implementation Package Approval Contract; this Standard §3 and §5 (GCR + Rule Anchor Table open the package). |

### §4A.3 Post-approval Claude Code sub-phases (migration execution handoff, SQL handoff, verification report)

| # | Sub-phase | Purpose | Authority sections required as Targeted Current-Turn reads |
|---|-----------|---------|-----------------------------------------------------------|
| E1 | Migration execution handoff | Emit the Walter-executable migration artifact. | Claude Code Theo Governor Standard Walter-executable SQL sections; the approved plan's migration SQL section; Theo Azure Postgres Schema migration-file rules. |
| E2 | Post-migration verification | Run read-only V1–Vn SQL and produce the verification report. | Claude Code Theo Governor Standard post-migration read-only verification section; Theo Azure Postgres Schema sections for the affected objects; the approved VEP's verification checklist. |
| E3 | Pending Role-C handoff | If documentation drift against deployed reality is detected, emit the Deterministic Note to Codex per the Verbatim-Edit Handoff requirement. | Claude Code Theo Governor Standard Verbatim-Edit Handoff and Pending Role-C Handoff sections; target documents that require Role-C edits. |

### §4A.4 Rule

For any substantive Claude Code turn, the GCR per §3 MUST reflect at minimum the authority sections listed in the sub-phase rows that apply to the turn. §4A does not add new documents beyond those required by §4; it localizes the reads within those documents to the sub-phase actually executed. Where a sub-phase lists a section as required, reliance on memory or prior-turn reading of that section is automatically invalid per §6 T3, T15, and §10 T25.

---

## §4B Authority-Clause Mapping Table (Read-Only, Append-Only) — Theo starter

§4B is an auditable cross-reference linking high-drift clauses of the Claude Code Theo Governor Standard to the canonical document sections that own the underlying truth. It is READ-ONLY (records where truth lives) and APPEND-ONLY (rows may be added; none deleted/renumbered without a Walter-approved governance change).

This table is a **Theo starter**: it is populated as the companion Theo standards (Governor, Golden Handler, Execution Orchestration, Codex Review) are authored. Until a row exists, the document named as truth owner in §4 / §4A governs directly. Adding a row is a governance change requiring Walter approval and a Role-C landing.

| # | Claude Code Theo Governor Standard clause | Topic | Canonical truth owner (document + section) | Drift-resolution rule |
|---|---------------------------------------------|-------|---------------------------------------------|-----------------------|
| M1 | GCR / Rule Anchor / grounding modes / invalidity triggers (Governor pointer) | GCR format, grounding modes, invalidity | This Standard §2, §3, §5, §6, §8, §10 | This Standard governs; the Governor pointer is non-authoritative. |
| M2 | Architecture & boundary authority (Governor pointer) | Repo boundary, gateway, context-only contract, tool-dispatch, theo_ schema/RLS, RAG | `governance/THEO_ARCHITECTURE_AND_STRUCTURE.md` §1–§6 | The architecture doc governs until a downstream governed document (Theo API Spec / Schema / Golden Handler Standard) exists and owns the matter (architecture §0). |

Drift-detection rule (binding on Claude Code and Codex): any governed output that contradicts a row's canonical truth owner is invalid per §6 T13. Detection triggers Claude Code halt and a Role-C handoff.

---

## §4C Multi-Pass Discipline (Authoritative Pass Enumeration)

The Vault Theo backend pipeline executes every microstep through a sequence of distinct **review passes**. A pass is the complete enactment of a governance role against the microstep's artifacts. Passes are ordered, non-skippable, and non-substitutable.

| Pass | Name | Actor | Primary artifacts reviewed | Governing section |
|------|------|-------|----------------------------|-------------------|
| Pass 1 | **Claude Code internal VEP pass** | Claude Code | Verified Evidence Pack — GCR per §3, Rule Anchor Table per §5, sub-phase walk per §4A.1 P1–P8, Gap Register, plan body | Claude Code Theo Governor Standard (Local Grounding Workflow, VEP Format, Gap Register); this Standard §3, §4A.1, §5 |
| Pass 2 | **Codex plan review pass** | Codex (reviewer role) | The submitted VEP against the Codex Theo Review Standard rubric; detects unmet grounding, missing sub-phases, missing Gap Register, unanchored classifications, any §6 automatic invalidity | `CODEX_THEO_BACKEND_REVIEW_STANDARD.md`; this Standard §6, §10 |
| Pass 3 | **Walter execution + verification pass** | Walter (execution authority) + Claude Code (verification authority) | `theo_` migration execution against the approved SQL artifact; Claude Code read-only verification report (V1–Vn SELECT-only) | Claude Code Theo Governor Standard (Authorization Boundary, Post-Migration RO Verification, sequencing); this Standard §4A.3 (E1–E3) |
| Pass 4 | **Role-C documentation-update pass** | Claude Code (Role-C variant) + Codex (Role-C review) | Verbatim documentation edits to Governor, this Standard, Theo Phase 1B Plan, Theo API Spec, Theo Azure Postgres Schema, or other governed Theo docs | Claude Code Theo Governor Standard (Verbatim-Edit Handoff, Role-C discipline); `CODEX_THEO_BACKEND_REVIEW_STANDARD.md` Role-C Variant |

**Pass ordering and non-bypass rule (BINDING):**

1. Pass 1 is executed by Claude Code before any plan leaves Claude Code's turn. A plan without a completed Pass 1 cannot be submitted to Codex.
2. Pass 2 is executed by Codex against the Pass 1 output. Walter does not stand in for Codex. A plan without a recorded Pass 2 approval cannot proceed to execution.
3. Pass 3 executes only against a Pass 2-approved plan. Walter does not execute a migration that has not been Codex-approved; Claude Code does not run verification without a Walter execution confirmation.
4. Pass 4 is a standalone pass invoked for documentation updates, with its own Claude Code Role-C authoring + Codex Role-C review. Pass 4 does not substitute for Pass 1 on a microstep plan, and Pass 1 does not substitute for Pass 4 on a documentation edit.

**Non-substitution rule:** no pass may be skipped, merged, or re-labelled. ChatGPT advisory review is Walter-advisory only and MUST NOT be cited as one of the four passes.

**Relationship to §4A sub-phases:** §4A sub-phases (P1–P8, I1–I6, E1–E3) are the internal grammar of a pass, not passes themselves. Pass 1 walks P1–P8; the Implementation Package I1–I6 walk executes inside Pass 1 and re-anchors into Pass 2; Pass 3 walks E1–E3. The pass axis and the sub-phase axis are orthogonal and both govern the turn.

---

## §5 Rule Anchor Table

Every substantive Claude Code or Codex turn MUST include, after the GCR, a Rule Anchor Table:

```
RULE ANCHORS
| # | Source doc | Clause id | Verbatim clause text | Applied in output at |
| - | ---------- | --------- | -------------------- | -------------------- |
| 1 | Theo Golden Handler Standard | §[n] Allowed Deltas | "<verbatim substring, no paraphrase>" | §[n] mirror table rows ... |
| 2 | ... | ... | ... | ... |
```

Rules:

1. Every rule the agent relied on to justify a structural choice, classification, or approval MUST appear. "Relied on" is expansive: if the agent made a decision the clause governs, the clause is anchored.
2. Verbatim Clause Text MUST be a direct substring of the source doc as read this turn. No paraphrase. No ellipsis longer than four words. No summary.
3. Applied-In MUST cite an exact section, row, or line in the agent's own output. "Throughout" is prohibited.
4. Over-anchoring is preferred to under-anchoring. Rejection for under-anchoring is allowed; rejection for over-anchoring is not.
5. Every structural classification (EXACT, ALLOWED DELTA, DEVIATION, APPROVED, REJECTED, DEPLOYED, PROPOSED, NOT_IMPLEMENTED) MUST be backed by at least one Rule Anchor. Unanchored classification is automatically invalid.

---

## §6 Automatic Invalidity Rules (Claude Code and Codex)

Any of the following renders the turn automatically invalid. The reviewer MUST reject without further review of substantive content.

1. GCR absent.
2. GCR row missing a tool-call invocation for any required document.
3. GCR row citing a prior-turn read.
4. Currency Anchor missing, malformed, or not independently verifiable.
5. Rule Anchor Table absent.
6. Structural classification made without a supporting Rule Anchor.
7. Rule Anchor quoting text not present in the cited document at current HEAD.
8. Administrative-turn exemption invoked on a turn producing substantive output per §2.
9. Primary reference artifact cited without full verbatim source inline *in this turn*.
10. Composite primary reference (two handlers contributing to one pattern).
11. "Omitted for context-window" or equivalent phrase applied to any required artifact.
12. New-domain helper classified as ALLOWED DELTA without either an EXACT mirror against a deployed handler containing that helper, or a Walter authorization quoted verbatim in the pack and predating the VEP.
13. Doc-vs-runtime drift surfaced in the turn without a prior Walter decision resolving it.
14. Grounding mode absent from the GCR.
15. Targeted Current-Turn Grounding claimed but a relied-on rule is not read and anchored this turn.
16. Delta Grounding claimed outside a narrow authorized delta correction.
17. A migration execution handoff, Walter-executable SQL handoff, post-migration verification report, or post-approval implementation-governance handoff classified as administrative.
18. A turn requiring Full Baseline Grounding emitted with only Targeted Current-Turn Grounding or Delta Grounding.
19. A governed SQL block contains a prohibited psql meta-command (`\echo`, `\set`, `\i`, `\include`, `\copy`, `\gset`, `\gx`, `\timing`, `\connect`, `\c`, `\q`, `\watch`, shell escapes such as `\!`, or equivalent), unless the block is explicitly labelled as a psql script and a governing standard expressly permits psql-script delivery for that context.
20. Theo MUST NOT read or write Corporate Reporting tables directly (architecture §0a/§1.3/§4.3): any governed output that proposes direct `reporting_*` table or RLS access, rather than a call to the published Corporate Reporting API via the Theo Tool Manifest, is automatically invalid.

---

## §7 Relationship to Existing Standards

This Standard is additive and Vault Theo only. It does not supersede, modify, or relax any requirement in the Claude Code Theo Governor Standard, Codex Theo Review Standard, Theo Golden Handler Standard, Theo Execution Orchestration Standard, Theo API Spec, Theo Azure Postgres Schema, or any Corporate Reporting authority document. Where this Standard imposes a stricter gate than an existing standard, the stricter gate governs. Where any existing standard imposes a stricter gate, the existing standard governs.

---

## §8 Currency Anchor Verification Detail

Default form:

```
first-20: "<exactly 20 whitespace-separated tokens from the start of the cited region>"
last-20:  "<exactly 20 whitespace-separated tokens from the end of the cited region>"
```

Both snippets MUST be directly recoverable by the reviewer via a Grep or Read against HEAD. If the file has moved or been renamed since the read, the GCR is invalid and the turn MUST be reissued.

Fallback form (blob SHA): permitted only when the cited region is fewer than 40 whitespace-separated tokens, or when the clause is structural (e.g., schema definition) rather than prose. The SHA MUST be obtained by a tool call this turn (e.g., `git rev-parse HEAD:<path>`). Claimed SHAs without a tool-call record are invalid.

---

## §9 Enforcement Responsibilities

- **Claude Code** enforces this Standard against its own output before emission, and against every inbound Codex message it responds to.
- **Codex** enforces this Standard against every inbound Claude Code plan or package as a hard gate, and against its own output before emission.
- **ChatGPT** is out of the formal backend pipeline and is not bound by this Standard as a pipeline gate. No ChatGPT artifact is acceptable as input to any backend pipeline gate, and Codex MUST NOT condition approval on ChatGPT review.
- **Walter** is not bound by this Standard in his own messages and is the sole authority who may grant exemptions. Exemptions MUST be explicit, scoped, dated, and recorded.

---

## §10 Consolidated Automatic Rejection Triggers

| # | Trigger | Binding on |
|---|---------|-----------|
| T1 | GCR absent | Claude Code (self-gate), Codex (against inbound) |
| T2 | GCR row missing a tool-call invocation for any required doc | Claude Code, Codex |
| T3 | GCR row cites prior-turn read | Claude Code, Codex |
| T4 | Currency Anchor missing, malformed, or not independently verifiable | Claude Code, Codex |
| T5 | Rule Anchor Table absent | Claude Code, Codex |
| T6 | Structural classification without a Rule Anchor | Claude Code, Codex |
| T7 | Rule Anchor quotes text not at current HEAD | Claude Code, Codex |
| T8 | Administrative-turn exemption abused | Claude Code, Codex |
| T9 | Primary reference artifact cited without full verbatim inline this turn | Claude Code (self-gate), Codex (against inbound) |
| T10 | Composite primary reference | Claude Code, Codex |
| T11 | "Context-window" or equivalent omission phrase | Claude Code, Codex |
| T12 | New-domain / new-external-system helper classified ALLOWED DELTA without Walter authorization | Claude Code, Codex |
| T13 | Doc-vs-runtime drift in pack without prior Walter decision | Claude Code, Codex |
| T16 | Conditional or pending-correction approval | Codex (self) |
| T18 | Pack cites ChatGPT review as grounding, approval input, or pipeline authority | Codex |
| T19 | Grounding mode absent from GCR | Claude Code, Codex |
| T20 | Targeted Current-Turn Grounding claimed but a relied-on rule is not read and anchored this turn | Claude Code, Codex |
| T21 | Delta Grounding claimed outside a narrow authorized delta correction | Claude Code, Codex |
| T22 | Migration execution handoff / Walter-executable SQL handoff / post-migration verification report / post-approval implementation-governance handoff classified as administrative | Claude Code, Codex |
| T23 | Full Baseline Grounding required but only Targeted Current-Turn Grounding or Delta Grounding provided | Claude Code, Codex |
| T24 | Mechanical lint output (`tools/lint_microstep_submission.mjs`) missing, FAIL, or not independently reproducible against the committed repo root. Binding on every Claude Code VEP, Implementation Package, and Role-C Verbatim-Edit Handoff submission. Claude Code MUST run the linter against its own submission and attach the verbatim PASS output block (including exit code `0`); Codex MUST re-run the linter and reject on any discrepancy. | Claude Code (self-gate), Codex (independent re-run) |
| T25 | Sub-phase completeness failure: the §4A sub-phase track declared in the GCR requires authority sections (by name) absent from the Rule Anchor Table. Detected by the sub-phase completeness check in `tools/lint_microstep_submission.mjs`. | Claude Code, Codex |
| T26 | Prohibited psql meta-command in a governed SQL block per the Theo Golden Handler Standard, unless the block is explicitly labelled as a psql script and a governing standard expressly permits psql-script delivery for that context. | Claude Code (self-gate), Codex (against inbound) |
| T29 | Codex-review submission cites a controlling artifact, enumerated package file, or mechanical-lint target not present in the working tree at the cited HEAD on the active review branch, OR repo-visible but uncommitted/unpushed and inaccessible to Codex at the cited HEAD/branch. Codex MUST reject without opening substantive review. | Claude Code (self-gate), Codex (independent presence probe) |
| T30 | Codex-reviewable package delivered with operative review surface only under a local-only path and no Codex-accessible repo-visible package or complete inline package; OR delivered repo-visibly but lacking the controlling-artifact fields (purpose, scope, governing microstep, controlling review path, complete file list, mechanical-lint output, requested verdict); OR omitting files Codex needs to render its verdict. Codex MUST reject without opening substantive review. | Claude Code (self-gate), Codex (against inbound) |
| T40 | Direct Corporate Reporting table / RLS access proposed instead of a published-API call via the Theo Tool Manifest (architecture §0a/§1.3/§4.3). | Claude Code (self-gate), Codex (against inbound) |

Any trigger firing: REJECTED, trigger cited by number, sender reissues full new turn. No conditional approval. No "approve if fixed."

---

## §11 Adoption

Adoption is immediate on issuance of this Standard. No grandfathering. No partial compliance. As a v0.1 draft, the trigger numbering preserves the Corporate Reporting numbering for cross-reference continuity where a trigger is carried over; Theo-specific triggers (T40) are added at the bottom. Renumbering to a contiguous Theo sequence, if ever desired, is a Walter-approved governance change.

---

## §12 Operational Note — CLAUDE.local.md

`CLAUDE.local.md` is local-only to the Claude Code clone, gitignored, and outside Codex's editable governance document set. Codex MUST NOT edit or create `CLAUDE.local.md`. Walter applies the `CLAUDE.local.md` bootstrap amendment manually in the local Claude Code clone.
