# Vault Memory Amendment 10 — personal memory is AUTOMATIC, not consensual — Pass 1 VEP (governance correction)

> Walter-directed correction (2026-08-06): the **"consensual"** framing of Dottie-L1 (an implied opt-in for a personal memory to *exist*) was an **error**. Neither Theo nor Dottie has consent-gated personal memory — **both distil a personal memory automatically from conversations, no opt-in**. This records the correction as **Amendment 10** in the memory-architecture authority (both `VAULT_MEMORY_ARCHITECTURE.md` copies) and propagates it downstream to `DOTTIE_MEMORY_MODEL.md`. It does **not** touch the separate Six-Plates *life-integration* opt-in (Amendment 3) — a different concept. It unblocks the Dottie-L1 memory build to be **automatic** (distiller + injection + CRUD, mirroring Theo). A future **incognito mode** (per-user/per-session opt-out) is the escape hatch — out of scope now. Docs-only; no source/backend/schema/route.

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Pass 1 — Verified Evidence Pack (governance correction; docs-only Amendment 10)
Grounding parent (source baseline): vault-theo `development` `42723bf177c42759ab7ca3efa4e82cf7de69a5c2`; vault-dottie `development` `10eab7df7bfaf7deb684f1a032dc7f01430dd421`
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

Currency labelling: CODE/DOC-BEARING — at the review HEAD the changed files' blobs ARE the proposed blobs; base cited at the parent commit, proposed at review-HEAD (anchored to blob SHAs).

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (base @ parent → proposed @ review HEAD) |
| - | ------------------------------- | ------------------------------ | -------------------------------------------- |
| 1 | FE Grounding Conformance — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR + Rule Anchor) | grounded; unchanged @ HEAD | `4f2f42e799be5db31e1e35e523d656ff4c1c057e` |
| 2 | FE Governor — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md` (Walter-directed governance edits) | grounded; unchanged @ HEAD | `b6ef105fea53533f45d0e907da223616a61c51dd` |
| 3 | Codex FE Review — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/CODEX_THEO_FRONTEND_REVIEW_STANDARD.md` (Pass-2; APPROVED/REJECTED only) | grounded; unchanged @ HEAD | `25cc488091d619d8f6642b10552df0d019a87933` |
| 4 | CHANGED — AUTHORITY — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-theo/governance/VAULT_MEMORY_ARCHITECTURE.md` (adds Amendment 10; appends the correction pointer to Amendment 9; corrects the two derived "consensual" mentions §120/§138) | `Read`(§31–36, 120, 138) + `Edit` this turn | base @ parent `42723bf` `3afda098df614b11adc8a7cdcf28d0f9a3f47011` → proposed @ review HEAD `38086aa5307421a3708ceca863aa7b9f95398fbd` |
| 5 | CHANGED — AUTHORITY MIRROR — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/VAULT_MEMORY_ARCHITECTURE.md` (identical mirror of row 4 — same base + proposed blob) | `Edit` this turn | base @ parent `10eab7d` `3afda098df614b11adc8a7cdcf28d0f9a3f47011` → proposed @ review HEAD `38086aa5307421a3708ceca863aa7b9f95398fbd` |
| 6 | CHANGED — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/spec/DOTTIE_MEMORY_MODEL.md` (INV-2, §2.1 header + automatic clause + plate-defer, §3 (the plate-defer propagated — Codex re-issue), §7 step 1, §8 O-DOTTIE-L1-CONSENT → resolved) | `Read`(full, incl. §3) + `Edit` this turn | base @ parent `10eab7d` `6bcdb25b92d532536922b2057d4b854f9613d0ce` → proposed @ review HEAD `80dd66f83f6f4870dddb764d1bd98b067fa83359` |

No ChatGPT advisory cited. No source / backend / route / schema / migration — governance docs only.

## Rule Anchor Table

| Source doc (absolute path) | Clause id | Verbatim clause text (read this turn) | Applied in output at |
| -------------------------- | --------- | ------------------------------------- | -------------------- |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-theo/governance/VAULT_MEMORY_ARCHITECTURE.md | Amendment 9 | "Dottie's own 1:1 layer is **SEPARATE and consensual**" | §1 — Amendment 10 corrects the "consensual" qualifier (an error); the SEPARATE invariant is retained, automatic replaces consensual |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-theo/governance/VAULT_MEMORY_ARCHITECTURE.md | Amendment 3 | "Life-integration is OPT-IN" | §1 — the Six-Plates life-integration opt-in (Amendment 3) is a DIFFERENT concept and is explicitly left untouched |

---

## §1 — Change
Amendment 10 (2026-08-06, Walter-directed) records that the "consensual" framing of **Dottie-L1** was an error. **Both** Theo and Dottie build personal memory **automatically** from conversations (`theo_user_memory` / `dottie_user_memory`), with **no opt-in-to-exist gate**. The SEPARATENESS invariant is retained (Dottie-L1 never crosses Theo's L1; Dottie never reads Theo's L1 — Rule 1 inviolable); only the *opt-in* qualifier is removed. A future **incognito mode** (per-user/per-session opt-out) is deferred. The change is append-only in the amendment log (Amendment 9 preserved as its dated 2026-08-01 record + a correction pointer; Amendment 10 added; the two derived summaries corrected). Downstream, `DOTTIE_MEMORY_MODEL.md` INV-2 / §2.1 / §7 / §8 now read "automatic," and O-DOTTIE-L1-CONSENT is **resolved → automatic**. The separate Six-Plates *life-integration* opt-in (Amendment 3) is untouched. This unblocks the Dottie-L1 build (distiller + injection + CRUD, automatic) and defers the plates column (unused prep) per Walter 2026-08-06.

## §2 — Boundary
Three governance docs (two of them the same authority + its identical mirror; one downstream spec). No source, backend, schema, migration, or route. Not a redesign — a Walter-acknowledged error correction, recorded via the standard append-only amendment convention (matching the doc's existing "(BROADENED by Amendment 9)" pointers).

## §3 — Verification (this turn, local)
Sweep confirms every substantive "consensual" qualifier on Dottie-L1 is now corrected (INV-2 / §2.1 / §8 read "automatic, not consensual"); the only residual "consensual" is Amendment 9's dated record (with the Amendment-10 pointer) + Amendment 10's own correction text. The two `VAULT_MEMORY_ARCHITECTURE.md` copies are byte-identical (same base `3afda098` → same proposed `38086aa5`). No source built (docs-only).

## §GAP — Gap Disclosure
**PROCEED.**
- **G-1 — Append-only amendment.** Amendment 9's body keeps the word "consensual" as its dated 2026-08-01 record; Amendment 10 explicitly supersedes it + an inline pointer is added (standard convention). Disclosed.
- **G-2 — Plates deferred.** §7 step 1 / §2.1 now defer the plate column (Walter 2026-08-06); the build starts at the distiller. Disclosed.
- **G-3 — Incognito mode future.** The escape hatch is named but out of scope. Disclosed. PROCEED.

## §DELTA — changed files
Three docs. `vault-theo` + `vault-dottie` `VAULT_MEMORY_ARCHITECTURE.md` (`3afda098`→`38086aa5`, identical): + Amendment 10; Amendment 9 correction pointer; §120/§138 "consensual"→"automatic — Amendment 10". `DOTTIE_MEMORY_MODEL.md` (`6bcdb25b`→`80dd66f8`): INV-2 + §2.1 (header/automatic/plate-defer) + **§3 (plate-defer propagated — Codex re-issue: §3 no longer states the lens lives "as plate on dottie_user_memory"; it now reads "will live … when built; not present today")** + §7 step 1 + §8 corrected to automatic. No other bytes.

## §CODEX — activation (Walter forwards)

```
Codex is activated for Pass-2 review of Vault Memory Amendment 10 (governance correction), vault-dottie,
"Codex Governance/Vault-Memory-Amendment-10-Automatic-Not-Consensual-Pass-1-VEP/Vault_Memory_Amendment_10_VEP.md" @ commit
<HEAD> (vault-dottie) + <HEAD> (vault-theo). Open Pass-2 with a governance-bound GCR + Rule Anchor Table; hard-gate; emit only
APPROVED or REJECTED. Docs-only. Walter-directed correction (2026-08-06): the "consensual" framing of Dottie-L1 was an error;
neither Theo nor Dottie has consent-gated personal memory — both distil automatically, no opt-in-to-exist. Records Amendment 10
in VAULT_MEMORY_ARCHITECTURE (both identical copies: vault-theo authority + vault-dottie mirror, same base 3afda098 -> same
proposed 38086aa5): adds Amendment 10; appends a correction pointer to Amendment 9 (preserved as its dated record, append-only);
corrects the two derived "consensual" mentions to "automatic — Amendment 10". Downstream DOTTIE_MEMORY_MODEL (6bcdb25b ->
bb8b1280): INV-2 / §2.1 (header + automatic clause + plate-defer) / §7 step 1 / §8 O-DOTTIE-L1-CONSENT resolved -> automatic.
The SEPARATENESS invariant is retained (Dottie-L1 never crosses Theo's L1; Rule 1 inviolable) — only the opt-in qualifier is
removed. The separate Six-Plates life-integration opt-in (Amendment 3) is explicitly untouched. A future incognito mode is the
escape hatch, out of scope now. Unblocks the automatic Dottie-L1 build (distiller + injection + CRUD) and defers the plate
column. Mechanical lint PASS. Emit APPROVED or REJECTED only.
```

*End of Vault Memory Amendment 10 Pass-1 VEP.*
