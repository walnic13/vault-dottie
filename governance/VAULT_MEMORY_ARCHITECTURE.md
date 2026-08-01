# Vault Origin — Memory Architecture & Theo Agent Model (Governed Vision Doc)

**Status:** DESIGN AUTHORITY · plan-only (not an implementation specification). This is the governing shape of Vault's memory system, agent behaviour, and access control. Implementation choices follow FROM this document but must not silently rewrite it; changes to the model are made by amending this doc (dated), not by divergent code.

**Provenance:** memorialised by Walter (co-authored with Claude) 2026-07-31; formalised here with the six governing amendments from the Walter + Claude Code architecture review of the same date (§A). Supersedes the raw memory note [[project_vault_memory_architecture]] where they differ.

**Scope:** Vault-wide — spans Theo (vault-theo), Origin shell (vault-origin), the model-callable tools (vault-theo-tools), and the Shared Project Workspace (SPW). Housed in vault-theo governance as the primary build home; cited cross-repo like the other governance authorities.

**Current state (2026-07-31):** Layer 1 (personal memory) partially exists as `theo_user_memory` (distilled profile + cross-chat history-RAG). SharePoint Graph permissions govern file/area access today. **No** architecture yet exists for shared project memory (L1.5), cross-Vault knowledge (L3), agent participation in group chats (two-Theo), the role/expectation layer (L2), the access-policy engine, or governance (L4). SPW Phase 1–2 (roles + publish + attributed threads) is a nascent L1.5.

---

## §A — Governing amendments (authoritative decisions; these control)

These six decisions from the 2026-07-31 review govern the model below; where the memorialisation text conflicts, these win.

1. **Central, fail-closed access-policy engine — MANDATORY FOUNDATIONAL COMPONENT, built FIRST (ahead of even the L1.5 schema).** Access is a multi-dimensional matrix (role × information-type × SharePoint-Graph permissions × layer × lowest-participant-in-room). It MUST route through a single, audited `canRead(user, context, item)` decision that every read in the system calls — never per-feature access logic (that drifts and becomes unauditable at scale). This mirrors the discipline of the SPW `theo_conversation_access` one-classifier. **Fail-closed:** any untagged, ambiguous, or unresolvable item is treated as maximally restrictive. The engine's read interface is specified BEFORE the L1.5 schema because it constrains the schema. See §4.

2. **Tag work is split into two components with different lifecycles.** (a) **Tag Guard** — security-critical WRITE-TIME enforcement: only appropriately-authorised users may apply a given information-type tag (an associate cannot write a "governance sign-off" tag), untagged writes to tag-required fields are rejected, fail-closed. Ships with **Stage 1**, folded into the access-policy engine's write path. (b) **Governance pattern detection ("Dottie", L4)** — the observational layer (tag drift, review-chain integrity, systemic patterns). Remains **Stage 6**. This removes the "Dottie exists but only partially" confusion. See §5 / §4B.

3. **Six Plates is an OPTIONAL LENS, not the L1 schema.** Six Plates is Walter's personal operating framework, developed alongside Vault Origin — a candidate *feature inside* Vault Origin, **not a foundational architectural commitment of it.** The L1 substrate is schema-flexible (user-controlled). **Work-awareness is the DEFAULT for everyone** (current work state, projects, professional context live in the substrate regardless). **Life-integration is OPT-IN** (the plates lens). L2 plate-modulation is conditional (plate-aware only for users who enabled + shared plate signals; everyone else gets a professional assistant on standard signals). Reconcile with the built `theo_user_memory`: default = substrate, Six Plates a lens over it (additive, not replacement) — this reconciliation is a **Stage-0 precondition**, resolved against the deployed structure and fed back here as an amendment if it changes the substrate shape. See §6.

4. **Layer 2 is BEHAVIOUR-SHAPING, not content-rewriting.** A prompt-and-policy layer that shapes how Theo attends to / presents / prioritises information for the reading user. Everyone sees the SAME facts; different roles get different framing, emphasis, and Theo behaviour. It is NOT per-user regeneration of the underlying content. See §1 (L2).

5. **Mixed-room texture is INTENDED, not a limitation.** The lowest-access-participant filter (Rule 3) means the shared record in a mixed-level room is Factual/Technical-dominant; Deliberative / Governance / Commercial content lives in whispers or level-scoped side-threads — which are FIRST-CLASS mechanics, not exceptions. This mirrors how real professional-services meetings run (a common floor + private context). The L1.5 schema reflects this. See §3 / §8.

6. **Reconcile with SPW so we never run two parallel authorization models.** SPW's Creator/Owner/Member → the L1.5 role dimension (clarify how firm role-hierarchy interacts with per-project ownership); SPW **publish** → the Rule-2 promote mechanic; the SPW **Decision Log** → an L1.5 information-type. See §10.

7. **(Amendment, 2026-07-31 — Walter-directed) The firm-role rank hierarchy is `partner > director > senior manager > manager > associate > preparer`.** **`director` is its own rank BETWEEN partner and senior manager** (more access than a senior manager, less than a partner) — not a synonym for either. Access rules that reference "partner + senior manager" therefore include `director` (it sits above SM). Non-fee-earner / unmapped titles (e.g. Administrative Assistant) resolve to NULL = least-privileged (fail-closed). Firm role is sourced by mapping the Entra/Graph `jobTitle` (§9 firm-role source VEP); the deployed Vault Staff titles ground the mapping. See §1 (L2), §3.

8. **(Amendment, 2026-08-01 — Walter-directed) Dottie (the L4 governance observer) — implementation model + priority.** Dottie runs on **in-tenant Azure OpenAI** — the existing `Vaultgpt` resource (uksouth; RG `Vault-Tax`; endpoint `https://vaultgpt.openai.azure.com/`), on a **robust GPT-5-class reasoning deployment** (recommended **`gpt-5`**; **`gpt-5-pro`** available for maximum reasoning depth — governance QC is deliberately depth-over-speed, and is on-demand not latency-critical), reached **keyless via Dottie's managed identity** (`Cognitive Services OpenAI User`). This is a **deliberately different model from Theo's Claude** — governance-observer independence (the QC model is not the model that produced the content, so no correlated blind spots). Dottie is a **first-class separate product**: repo **`vault-dottie`**, function app **`vaultgpt-func-dottie`** (shared EP1 plan, SystemAssigned MI, EasyAuth on the shared audience `api://4e1a1e31-5c20-4480-99e4-098901707d9e`), and a **Theo-derived federated-remote FE mounted in the Vault Origin shell** (like DMS / Sigma). **Priority is pulled FORWARD from Stage 6** — this AMENDS the Stage-6 timing in Amendment 2 / §5 / §10: Dottie's **scaffold** (the Azure OpenAI API connection + the FE frame) is built **now, in parallel with Stage 1** (which produces the L1.5 data Dottie will observe); its **observational ruleset** (tag-drift, review-chain integrity, systemic-pattern detection over L1.5/L2/L3) is **fine-tuned as those layers populate** — frame-first, tune-later. UNCHANGED: the Amendment-2 split holds — the security-critical **Tag Guard is already live** (Stage-0 §7.2); Dottie stays the **OBSERVATIONAL** layer and **NEVER reads L1** (Rule 1 inviolable, §7). See §5 / §10. *(BROADENED by Amendment 9 — Dottie is no longer observational-only; the L1 invariant is refined there.)*

9. **(Amendment, 2026-08-01 — Walter-directed) Dottie is a FULL independent agent, not only the L4 observer.** Broadening Amendment 2 / Amendment 8 / §5: Dottie is Theo's **independent governance-and-second-opinion sibling**, on **gpt-5** (a deliberately different model from Theo's Claude — genuine independence, not the same brain twice). It is **MULTI-USE**: (a) a **personal check / second opinion** an individual consults on a substantive issue ("is this position sound? what do you think?") — **NOT only mechanical governance**; and (b) an **embedded process-governance** layer that observes the shared record understanding firm **levels / roles / factors**. Dottie has its **OWN full layered memory** — mirroring THIS architecture with Dottie's own instances, in its own `dottie_*` schema: **Dottie-L1** = a **consensual 1:1 relationship** with the individual (what they share WITH Dottie, their role, patterns, issues raised); **Dottie-L2** = level / role / expectation awareness; **Dottie-L3** = firm / process / governance knowledge. **L1 INVARIANT REFINED (governs §7 Rule 1):** "Dottie never reads L1" means Dottie never reads **Theo's** L1 — the individual's private personal-assistant memory (life, Six-Plates, private notes) stays **private to Theo**. Dottie's own 1:1 layer is **SEPARATE and consensual**; the two personal memories **never cross**. Dottie additionally **OBSERVES** the shared record (Theo's L1.5 / L2 / L3) through the **access-policy engine** (`theo_can_read`, with rights) — it **reads, never duplicates**. **Implementation:** heavily **Theo-derived** (the layered memory architecture + the conversation / streaming backend + the FE) but with **Dottie's own data (`dottie_*`), own model (gpt-5), and a DISTINCT FE identity**. `dottie_ask` (the deployed connection) and all Dottie infra stand. See §5 / §7 (Rule 1) / Amendment 8.

---

## §1 — The layered memory model

Vault's memory is layered. Each layer has a distinct purpose, schema, and access rule. **No osmosis:** information moves between layers only through explicit, user-initiated actions or rights-filtered queries — never automatically.

**Layer 1 — Personal** *(partially exists: `theo_user_memory`)*
- **What:** each individual's private clone — everything they permit Theo to know about them (habits, preferences, current work state, private reflections, commitments, wins/losses).
- **Schema:** a **flexible, user-controlled substrate** (AMENDMENT 3). Work-awareness is default for all; the **Six Plates** lens (§6) is an optional overlay for users who opt into life-integration.
- **Access:** the individual only. Not visible to any other user, not to Dottie (L4), not to any project or firm layer. **Inviolable** (Rule 1) — any leak collapses the trust model.
- **Home:** Orbit (the chat app). Each user's Personal Theo lives here.

**Layer 1.5 — Project Context** *(new)*
- **What:** shared engagement memory — decisions, technical positions, workpaper content, review comments, TODOs, client correspondence, sign-offs. The engagement's memory, not any individual's.
- **Schema:** by information-type (§3) and project entities (client, engagement, workpaper, position, decision, …). Reconciled with SPW (AMENDMENT 6 / §10).
- **Access:** rights-filtered by **role × information-type**, on top of SharePoint Graph (Rule 5), via the access-policy engine (§4). Every item is tagged with its type (Tag Guard enforces the tag at write time, §5).
- **Home:** Theo → Projects. Each project has its own persistent L1.5 scope.

**Layer 2 — Role & Expectation** *(new)*
- **What:** level-appropriate standards, templates, guidance, expectations per Vault role ("this is what a senior manager does with an ambiguous position"). Shared by everyone at a level.
- **Nature (AMENDMENT 4):** **behaviour-shaping** — a prompt-and-policy layer applied on read that shapes how Theo attends to / frames / prioritises shared information for the reading user. NOT content-rewriting; everyone sees the same facts, differently framed.
- **Schema:** by role (partner, **director**, senior manager, manager, associate, India preparer, …) × activity type (review, sign-off, escalation, drafting, …). Firm-role rank hierarchy (most → least access; AMENDMENT 7): **partner > director > senior manager > manager > associate > preparer**; unmapped/non-fee-earner (e.g. admin) = NULL = least-privileged.
- **Home:** firm-wide substrate, applied on read. Six-Plates-literate *only* for opt-in users (§6).

**Layer 3 — Vault Knowledge Graph** *(new)*
- **What:** the firm's cross-project substrate — historical positions, precedent, client entity structures/relationships across engagements, firm technical guidance, engagement metadata (who's on what, deadlines, statuses), people & expertise.
- **Schema:** a graph connecting clients, engagements, positions, people, precedent.
- **Access:** read-only substrate; every query rights-filtered through the engine (§4). From a collective chat, filtered to the **lowest-access participant present** (Rule 3) — Theo surfaces only what all participants can see (AMENDMENT 5 / §8).
- **Home:** firm-wide, queryable by any Theo (personal or project) with the caller's rights applied.

**Layer 4 — Governance ("Dottie")** *(new; scaffold pulled forward, observational ruleset tuned as layers populate — §A Amendment 8)*
- **What:** a governance/QC GATE, not knowledge — asks governance questions of information passing through: tag consistency, review chains, appropriate access, systemic patterns.
- **Split (AMENDMENT 2):** the security-critical **write-time tag enforcement is NOT Dottie** — it ships Stage 1 as "Tag Guard" in the engine's write path (§5). Dottie is the later **observational** pattern-detection layer.
- **Access:** Dottie reads L1.5, L2, L3 for governance checks. **Dottie NEVER reads L1** — Personal Theos are outside its surveillance surface, on principle.
- **Schema:** rules + pattern detection.

---

## §2 — The two-Theo model in collective chats

When a user enters a project chat, **two Theo instances are active and remain distinct:**

- **The Project Theo** — a first-class participant in the collective chat, with its own persistent identity per project. It facilitates, takes notes, manages TODOs, summarises, documents, and moderates toward consensus (SPW Phase 3). It is the interface to L1.5: everything it writes into the chat is structured + tagged into the Project Context.
- **The user's Personal Theo (L1)** — travels with the user into the chat as a private **companion**. Whispers privately about their state, their (opt-in) plates, their private notes on this engagement. Does NOT merge with the Project Theo and does NOT absorb project data unless the user explicitly promotes it (Rule 2). It reads the chat transiently to comment, but must not persist project content into L1.

Each participant thus has two Theos: the shared facilitator + their private companion. This mirrors how an experienced professional works — bringing their own judgment and memory into a meeting, and contributing to the meeting's shared record deliberately.

*(This supersedes an earlier "one shared Project Theo" idea — the two-Theo split is better.)*

---

## §3 — Information types (L1.5 tagging)

Every L1.5 item is tagged with exactly one type; type determines access alongside role (via the engine, §4). Tag integrity is enforced at write time by **Tag Guard** (§5).

| Type | Content | Access |
|------|---------|--------|
| **Factual** | client data, source documents, entity structures, factual positions | broad |
| **Technical** | tax analysis, workpaper mechanics, positions taken, calculations | by role |
| **Deliberative** | review comments, in-progress technical debate, disagreements | participants + levels above |
| **Governance** | sign-offs, QC checkpoints, risk assessments | sign-off authority only |
| **Commercial** | fees, margins, client-relationship/BD notes | partner + director + senior manager only |
| **Personnel** | performance observations, staffing decisions, individual struggles | very restricted, need-to-know |

An associate cannot tag their own commentary as "governance sign-off" (Tag Guard rejects it, §5). Tag drift within an engagement is a governance smell Dottie flags (L4; scaffold pulled forward — §A Amendment 8). Per AMENDMENT 5, expect the shared room to be **Factual/Technical-dominant**, with Deliberative/Governance/Commercial living in whispers or level-scoped side-threads (§8).

---

## §4 — The access-policy engine (AMENDMENT 1 — foundational, built first)

A single, audited **`canRead(user, context, item) → allow | deny`** through which EVERY read in the system passes. There is no per-feature access logic anywhere else.

- **Inputs (the matrix):** the user's firm role + per-project role; the item's information-type tag (§3); SharePoint Graph permissions (Rule 5); the memory layer; and, for a collective-chat query, the lowest-access participant present (Rule 3).
- **Fail-closed:** untagged / ambiguous / unresolvable ⇒ deny (maximally restrictive). A mis-tag over-restricts; it never leaks.
- **Write path:** the same engine hosts **Tag Guard** (§5) — write-time enforcement that a given tag may only be applied by an authorised role, and tag-required fields cannot be written untagged.
- **Auditable:** a single decision point makes "why can/can't X see Y?" answerable and testable.
- **Sequencing:** the engine's read/write **interface is specified before the L1.5 schema** — the schema is shaped by what the engine must evaluate.

**§4B — build sequencing of enforcement vs governance:** the security-critical enforcement (engine + Tag Guard + fail-closed defaults) ships with **Stage 1**; the observational governance (Dottie, L4) had been slotted at **Stage 6** but its scaffold is now pulled forward to build in parallel with Stage 1 (§A Amendment 8), with the observational ruleset tuned as the layers populate. There is never a window where the access model relies on an unbacked auto-tagger.

---

## §5 — Tag Guard vs Dottie (AMENDMENT 2)

- **Tag Guard (Stage 1, in the engine write-path, security-critical):** validates tags at write time — enforces that certain tags can only be applied by users with appropriate authority; rejects untagged writes to tag-required fields; fail-closed. Runtime enforcement, not pattern detection.
- **Dottie (L4 + full independent agent):** watches for tag drift, review-chain integrity, appropriate-access anomalies, and systemic governance patterns; AND (Amendment 9) is a multi-use personal check / second-opinion agent with its own layered memory. Reads Theo's L1.5/L2/L3 (via the engine), never Theo's L1; has its own consensual Dottie-L1 1:1. *(Priority pulled forward from Stage 6; scaffold + FE built now in parallel with Stage 1; the observational ruleset tuned as L1.5/L2/L3 populate. See §A Amendment 8 + Amendment 9.)*

Keeping these separate prevents the "Dottie exists but only partially" confusion and ensures the write-time security control is present from the first shippable stage.

---

## §6 — L1 substrate + Six Plates as an optional lens (AMENDMENT 3)

- **The L1 substrate is schema-flexible** (user-controlled key-value / graph memory), NOT six fixed domains. It supports multiple lens overlays.
- **Six Plates is an OPTIONAL lens** — a candidate feature, not a foundational commitment. It overlays organisation + check-in mechanics for users who opt into life-integration. The six domains (for reference): **Body · Inner Life · Close Others · Wider Belonging · Work & Craft · Material World**; each plate has a per-user **mode** (active / settled / delegated / developing); within a plate: **things** (live concerns) and **touches** (actions).
- **Work-awareness is default for everyone:** current work state / projects / professional context live in the substrate regardless of the plates lens. Everyone gets a work-aware Personal Theo; only opt-in users get a life-aware one.
- **L2 modulation is conditional:** Theo tempers work pressure on plate signals ONLY for users who enabled + shared them; everyone else gets a professional assistant on standard signals (calendar load, deadline pressure, hours worked). L3/L4 never read plate state.
- **Reconciliation with `theo_user_memory`:** default position — `theo_user_memory` is the substrate; Six Plates is an additive lens over it, not a replacement. This reconciliation **MUST be resolved as part of the Stage 0 design task** (against the actually-deployed structure), and its outcome fed back into this document as a dated amendment if it changes the substrate shape. It is a Stage-0 precondition, not a check to remember.

---

## §7 — Cross-layer rules

1. **L1 is inviolable.** Nothing reads L1 except the individual and their own Personal Theo. Not Dottie, not the firm, not other users. Ever. *(Refined by §A Amendment 9: "Not Dottie" = Dottie never reads **Theo's** L1 — the individual's private personal-assistant memory. Dottie has its OWN separate, consensual 1:1 layer (Dottie-L1) with the individual; the two personal memories never cross.)*
2. **Personal ↔ Project is one-way.** A user may voluntarily **promote** content from their Personal Theo into the Project Context ("Theo, add this to the workpaper notes"). Nothing flows the other way without the user's explicit action. *(SPW `publish` is this promote mechanic — AMENDMENT 6.)*
3. **Cross-Vault queries from a collective chat are filtered to the lowest-access participant.** The Project Theo surfaces only what all participants can see (AMENDMENT 5 makes this the intended texture — §8).
4. **Whisper channels** carry level-appropriate private context in collective chats. When information genuinely can't be shared with the full room (partner-only BD, sensitive personnel context), Theo whispers privately to the appropriate user rather than broadcasting inappropriately or suppressing entirely. Whispers/side-threads are **first-class** (§8).
5. **SharePoint Graph permissions are the file/area substrate.** All memory-layer access operates ON TOP of existing SharePoint Graph permissions, never around them. If a user can't see a file in SharePoint, they can't see it through Theo either.

---

## §8 — Mixed-room texture (AMENDMENT 5)

The lowest-access-participant filter (Rule 3) is deliberate, not a compromise. In a mixed-level room:
- the **shared record is Factual/Technical-dominant** (the common floor all participants share);
- **Deliberative / Governance / Commercial** content lives in **whispers** (Rule 4) or **level-scoped side-threads**, designed as first-class mechanics.

This mirrors real professional-services meetings: the partner holds private context, the associate contributes to shared work product, the room has a common floor. The L1.5 schema is designed expecting this distribution — whisper/side-thread mechanics are built as citizens, not exceptions.

**Routing decision-maker (default):** **Theo makes the initial routing decision** — shared record vs whisper/side-thread — based on the content's information-type tag (§3) and the audience present in the room, and the **human writer may override in either direction** ("actually, broadcast this" / "no, keep this in the whisper"). Theo proposes by policy; the human retains final say.

---

## §9 — SPW reconciliation (AMENDMENT 6)

SPW already shipped a nascent L1.5 access model; it evolves INTO this architecture (never a second parallel authorization system):
- SPW **Creator / Owner / Member** → the L1.5 **role dimension** (with an explicit account of how firm role-hierarchy interacts with per-project ownership).
- SPW **publish** → the **Rule-2 promote** mechanic.
- SPW **Decision Log** → an L1.5 **information-type** (and the centrepiece of Project-Theo moderation, SPW Phase 3).
- SPW `theo_conversation_access` (the one audited classifier) → the seed/precedent for the §4 access-policy engine.

See [[project_theo_shared_project_workspace]] for the SPW build state.

---

## §10 — Build order

Do not build all layers at once. Each stage delivers standalone value.

0. **(Foundational, precedes Stage 1)** the **access-policy engine** interface + fail-closed defaults + **Tag Guard** write-path (AMENDMENT 1/2). The L1.5 schema is specified after the engine interface.
1. **Project Theo as facilitator + Project Context (L1.5)** — collective chat with structured, tagged memory + TODO tools. No cross-project awareness yet. *(Stage-1 limbs already lined up: the cross-Theo TODO tool + SPW Phase 3 moderation/Decision Log.)*
2. **Rights-filtered access within L1.5** — information typing + role-based visibility (through the engine).
3. **Personal Theo joins collective chats as companion** — the two-Theo model activated.
4. **Vault Knowledge Graph (L3)** as read-only substrate — cross-project precedent queries, filtered.
5. **Whisper channels** — level-appropriate private nudges/context in collective chats.
6. **Dottie (L4)** governance — pattern detection, tag-integrity observation, review-chain enforcement. *(Scaffold — Azure-OpenAI API connection + FE frame — pulled forward to build NOW in parallel with Stage 1; observational ruleset tuned as the layers populate. See §A Amendment 8.)*

Stage 1 alone (a project chat with a facilitating agent taking structured, access-controlled notes + tasks) already beats most professional-services workflows.

---

## §11 — What is not yet specified

To be designed in subsequent phases, layer by layer, in the build order above:
- The `canRead` engine's concrete interface signature + policy representation (Stage 0, first).
- Concrete L1.5 (Project Context) entity/relation schemas.
- The Vault Knowledge Graph (L3) structure + query interface.
- Dottie's (L4) rule set + pattern-detection specifics.
- The whisper-channel UI + interaction pattern.
- How L2 (Role/Expectation) content is authored, versioned, updated.
- How plate modes + check-in mechanics surface in Orbit's UI (opt-in).
- The mechanics of "promoting" content from Personal Theo to Project Context.
- **The mechanics of the Personal Theo's transient read of collective-chat content** — how transient reading is implemented without persistence to L1 (context-window handling, preventing the model from retaining content it shouldn't, audit logging of transient reads), and how the Rule-2 one-way boundary is enforced **at runtime** rather than by prompt-based convention.

---

*This document represents the shape of the design as agreed. Implementation follows from it but must not silently rewrite it. Amendments are dated and made here. For the reasoning behind the six governing amendments, see the 2026-07-31 Walter + Claude Code review.*
