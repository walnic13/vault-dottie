# Dottie Memory Model — persistence design (v0.1 DRAFT)

**Status:** **APPROVED — Codex Pass-2 (2026-08-02, rev-2), binding.** Defines how Dottie's memory persists, incorporating the Vault memory-layer architecture and the Six Plates. **Grounded in the governing authority** `vault-theo/governance/VAULT_MEMORY_ARCHITECTURE.md` (§5 layers, §7.5 Six-Plates lens, §A **Amendment 8** = Dottie is L4, **Amendment 9** = Dottie's own layered memory). This spec is *downstream* of that authority — it must not silently rewrite it; where it needs a new architectural decision it is flagged as an Open Question for the authority.

**Context:** Dottie is a **spoke of the Projects program**, not a standalone product. She is the **L4 governance layer** made conversational. Her memory is deliberately *separate* from Theo's and is governed by hard invariants.

---

## 1. Invariants (non-negotiable — from the authority)

- **INV-1 — Dottie NEVER reads Theo's L1** (Personal Theo memory). Inviolable. Personal Theos are outside surveillance on principle (authority §5/§7 Rule 1).
- **INV-2 — Dottie-L1 is a SEPARATE 1:1 memory** with the individual (Amendment 9; **automatic, not consensual — Amendment 10, 2026-08-06**). It never crosses into Theo's L1 and Theo never reads it. Two independent personal memories, by design. (The separateness is the invariant; the earlier "consensual/opt-in" qualifier was an error — see Amendment 10.)
- **INV-3 — Dottie READS Theo's shared layers through the access-policy engine, never duplicating them — but only what the engine serves TODAY.** **Live today: L1.5 only** — one Project Context item at a time via `theo_get_project_context_item` (the deployed composed read: `theo_can_read` classifier + Rule-5 Graph reachability + firm-role lowest-participant), caller-from-claim, fail-closed. **L2 / L3 are RESERVED fail-closed** in the deployed classifier until those schemas + layer-specific read handlers land — Dottie's L2/L3 reads are a **future** capability, not live. She never queries Theo's tables directly and never copies any layer into her own store.
- **INV-4 — Dottie is observational at L4, not gating.** Write-time enforcement is the Tag Guard (already live in the engine). Dottie *observes* (drift, review-chain integrity, access anomalies, systemic patterns); she does not block writes.
- **INV-5 — Life-plate state never leaves L1.** The Six-Plates life lens (opt-in) is readable only by the individual's own agent; L3/L4 do NOT read plate state (authority §4). Applies to Dottie's L1 exactly as to Theo's.

---

## 2. Dottie's own layers

Dottie mirrors the layer *shape* but holds her own governance-flavoured stores.

### 2.1 Dottie-L1 — personal 1:1 (`dottie_user_memory`)
- **Exists today** (D1 schema — mirror of Theo `theo_user_memory`, user-scoped, currently **no plate column**).
- **Purpose:** Dottie's relationship memory with the individual — their standards, review preferences, governance posture, prior second-opinions she's given them. This is what lets her be a *personal* check, not a stranger.
- **Automatic (Amendment 10, 2026-08-06):** Dottie-L1 is distilled **automatically** from conversations — the same posture as Theo, **no opt-in-to-exist**. The earlier "consensual/opt-in" framing (Amendment 9) was an **error**, corrected by Amendment 10. A future **incognito mode** (a per-user / per-session opt-out) may be added later as the escape hatch; **out of scope now**. INV-1/INV-2 unchanged: Dottie-L1 stays separate from Theo's L1; the two never cross.
- **Six-Plates lens — DEFERRED (Walter 2026-08-06).** The `plate text NULL` column + partial index (mirroring Theo's §7.5) is **NOT built now**: the plates lens is not consumed anywhere yet (even in Theo it is DDL-only/deferred), so the column is deferred until the lens is actually built. Dottie-L1 stays plate-free for now. When added: **INV-5 holds** — plate state stays L1-only, never crosses to Theo or to Dottie-L3/L4.

### 2.2 Dottie-L2 — role / level (governance framing)
- **Purpose:** level-appropriate *governance* expectations — what a partner needs from a check vs an associate (depth, tone, what to escalate). Behaviour-shaping, not content-rewriting (authority Amendment 4).
- **Not engine-readable today:** Theo's L2 is **reserved fail-closed** in the deployed classifier (no L2 schema/read handler yet), so Dottie cannot read it now. **Open question O-L2 (below):** when L2 lands, Dottie's own store vs. reading Theo's L2 via a **future** engine extension + a governance overlay. Leaning: overlay on Theo's L2 substrate (avoid a second role model) — but that is future work gated on L2 existing.

### 2.3 Dottie-L3 — firm governance knowledge + accumulated findings
- **Purpose:** her cross-engagement governance substrate — firm review standards, precedent on positions she's weighed, and the **systemic patterns she's observed over time**. This is where her L4 observation *accumulates into* knowledge.
- Read-only to callers, rights-filtered; distinct from Theo's L3 (general knowledge graph) — Dottie's L3 is *governance* knowledge. Reading **Theo's L3** for factual/precedent context is a **future** capability: L3 is **reserved fail-closed** in the deployed classifier (no L3 graph/read handler yet), so it is not available to Dottie today.

### 2.4 Dottie governance-findings store (her operational L4 memory) — `dottie_*`
The concrete data behind the console. New `dottie_*` tables (design, not yet built):
- **`dottie_findings`** — a check/verdict on an artifact or claim: `{ target_ref, target_kind (theo_answer | workpaper | context_item | conversation), verdict (concur|caution|challenge), confidence, authorities[], flags[], docs_expected[], created_by, created_at }`. Backs "Recent checks on Theo", the verdict badges, the audit trail.
- **`dottie_flags`** — open governance flags (unsupported assumption, missing documentation, tag drift, review-chain gap): `{ finding_id?, flag_type, severity, target_ref, status (open|resolved), … }`. Backs "Open flags".
- **`dottie_review_chains`** — process/workflow verdicts (her Codex-role): `{ workflow_ref, item_ref, status (pending|approved|rejected), rationale, … }`. Backs the "Governance queue".
- These are her **operational memory** — what she has checked, flagged, and decided. They are governance records (L4/L3), never personal (L1).

---

## 3. The Six Plates (incorporated)

Per authority §7.5 + Amendment 3, **Six Plates is an opt-in LENS, not a foundational schema.** The plates: **Body · Inner Life · Close Others · Wider Belonging · Work & Craft · Material World**, each with a per-user mode (active / settled / delegated / developing) governing attention.

Incorporation into Dottie:
- The lens lives **only in Dottie-L1** (§2.1), opt-in, as `plate` on `dottie_user_memory` (default Work & Craft).
- It shapes only **personal** interactions (a second opinion tempered by the person's context if they've opted in) — never governance output. **L3/L4 never read plate state** (INV-5).
- Work-awareness is default for everyone (current work/professional context lives in the substrate regardless); life-integration is the opt-in overlay — same posture as Theo (authority Amendment 3). Dottie must be **Six-Plates-literate but not Six-Plates-dependent**.

---

## 4. Engine-gated reads of Theo's shared layers (INV-3)

**Live today — L1.5 only.** Dottie reads Theo's **L1.5 Project Context** through the deployed composed read `theo_get_project_context_item` (`vault-theo/spec/THEO_API_SPEC.md` §2.19 / `VAULT_MEMORY_ARCHITECTURE.md` §7.4) — **one Project Context item at a time**, decided by `theo_can_read` + Rule-5 SharePoint Graph reachability + firm-role lowest-participant, caller-from-claim, fail-closed. There is **no bulk "L1.5/L2/L3 context" fetch**.

**Future — L2 / L3.** The deployed `theo_can_read` classifier **reserves L2 and L3 fail-closed** until those schemas + layer-specific read handlers (or engine extensions) exist. Dottie's L2/L3 reads are a **downstream capability, NOT live today**.

She never queries Theo's tables directly and never copies any layer into `dottie_*`. Her L4 observation (tag drift, review-chain integrity, access anomalies) runs **over what the engine returns** — L1.5 today, extending to L2/L3 when they land — respecting the same one policy. **She never touches L1** (INV-1) — the engine forbids it (L1 owner-only).

---

## 5. How this maps to the FE (design-system surfaces)

- **Console → Overview** = `dottie_findings` + `dottie_flags` + `dottie_review_chains` (checks-on-Theo, open flags, governance queue).
- **Second opinion (grounded intensity)** = Dottie-L1 (who she's talking to) + engine reads of Theo's **L1.5** Project Context where relevant (via `theo_get_project_context_item`; L2/L3 context is future); renders through the governance component.
- **Claim-check (verdict intensity)** = writes a `dottie_findings` row; the review-target (authority for what she's checking) comes from the shell contract (design-system §7.3 G3).
- **"Showing her work"** = the shared cross-agent **TODO tool** (below), surfaced in her console the way Theo surfaces his.

---

## 6. The shared TODO tool (cross-agent)

The authority's Stage-1 names a **cross-Theo TODO/task tool** (model-callable, housed in `vault-theo-tools` / `vaultgpt-func-theo-tools`) as foundational — "critical … for ALL of Theo," and **Dottie should use it too** (Walter). Design note: the TODO tool is **agent-neutral** (a `*_todos` store keyed by owner/project/agent + create/list/update/complete tool handlers). Theo shows his work through it inside projects; Dottie shows *her* work (checks raised, docs requested, flags to clear) through the same tool. It is built **once**, in the tools app, and both agents call it. This is a Projects-program deliverable that Dottie consumes — not a Dottie build.

---

## 7. Build order (Dottie memory) & dependencies

1. **Dottie-L1 plates lens — DEFERRED (Walter 2026-08-06).** The `plate` column is not built until the lens is actually consumed (unused prep otherwise, even in Theo). The memory build starts instead at the **distiller + injection + CRUD** (automatic personal memory, mirroring Theo B7/B7a) — what makes Dottie learn + use the individual's context.
2. **`dottie_findings` / `dottie_flags`** — her operational L4 store; unblocks the console Overview with real data.
3. **`dottie_review_chains`** — her Codex-role governance queue.
4. **Engine-gated L1.5 reads** — wire Dottie to `theo_get_project_context_item` (§7.4) for **L1.5** Project Context (single-item; no new engine work — consume the live one). L2/L3 reads wait on those layers landing + a future engine extension (reserved fail-closed today).
5. **Shared TODO tool** — Projects-program deliverable (vault-theo-tools); Dottie subscribes.

Each stage is Codex-governed (Dottie backend regime). Nothing here duplicates the access engine or touches L1.

---

## 8. Open questions (for the authority / Walter)

- **O-L2** — Dottie-L2 as its own store vs. Theo's L2 read via the engine + a governance overlay (§2.2). Leaning: overlay, no second role model.
- **O-L3-SPLIT** — boundary between Dottie-L3 (governance knowledge) and Theo's L3 (general knowledge) — when does an observed pattern become firm governance precedent, and who curates it?
- **O-DOTTIE-L1-CONSENT — RESOLVED (Amendment 10, 2026-08-06): automatic, no consent gate.** The "consensual/opt-in" framing was an error; Dottie-L1 distils automatically like Theo. A future **incognito mode** (per-user/per-session opt-out) may be added as the escape hatch — out of scope now.
- **O-TODO-SHAPE** — final schema of the agent-neutral TODO store + whether verdicts/flags feed it automatically.
- **O-OBSERVE-RUNTIME** — how Dottie's L4 observation actually runs (batch over engine reads? event-driven?) — frame-first, tune-later (Amendment 8).

---

## 9. Cross-references
- Authority: `vault-theo/governance/VAULT_MEMORY_ARCHITECTURE.md` (§5, §7.5, §A Amendments 3/4/8/9).
- Live access engine (the deployed read Dottie consumes): `vault-theo/spec/THEO_API_SPEC.md` §2.19 — `theo_get_project_context_item` reads a **single L1.5** Project Context item; L2/L3 reserved fail-closed in `theo_can_read`.
- Dottie schema (current): `spec/DOTTIE_AZURE_POSTGRES_SCHEMA.md` (`dottie_user_memory` = Dottie-L1 today).
- Dottie FE authority: `spec/DOTTIE_DESIGN_SYSTEM.md` (surfaces that consume this memory).
- Projects program: SPW Phase 3 (Project-Theo moderation + Decision Log), the cross-agent TODO tool.
