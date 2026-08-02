# Dottie Attachment Injection — Golden-Test Hardening (Pass-1 VEP, both send handlers)

Consolidates every runtime defect and mirror-fidelity fix to the attachment read-path that **live golden testing surfaced** (the approved attachment-injection package's own deploy/verify step). Static review + `node --check` could not catch any of these — each is a runtime behaviour. **This VEP SUPERSEDES `Codex Governance/Dottie-Attachment-Injection-Buffered-Defectfix-Pass-1-VEP/…` (buffered blob `b58152…`), folding those three runtime fixes together with the attachment-budget restoration into the current `@HEAD` bytes of both handlers.** Deployed to func-dottie / func-dottie-stream (Kudu VFS; deployed == committed, GET-back verified); submitted here so the live bytes are Codex-blessed before the attachment-injection package is closed.

**Scope of the deltas vs the originally-approved handler blobs:**
- **`dottie_message` (buffered v3)**: `423b07c0…` (approved) → `2d5e53fa…` (`@HEAD`). Four changes: three runtime defect fixes + the extract-budget restoration.
- **`dottie_message_stream` (streaming v4)**: `bfa55379…` (approved) → `460681e9…` (`@HEAD`). One change: the extract-budget restoration (the stream handler had none of the buffered runtime defects — it was already protocol-aware, imported `http`, and `context.error` is valid in its v4 model).

## The fixes

**A — buffered runtime defects (three; `dottie_message` only).**
1. `context.error(…)` → `context.log.error(…)` (×3). `context.error` is a **v4** idiom; this is a **v3** handler where it is `undefined` → `TypeError` crashed the whole message (500) on ANY attachment use. Aligned to the handler's own v3 idiom (4 pre-existing `context.log.error` calls).
2. `requestUrl()` made protocol-aware. It hardcoded `https.request` + port 443, so the managed-identity token endpoint (`IDENTITY_ENDPOINT` = an `http://localhost:<port>` address) failed with `EPROTO … wrong version number`. Fixed to `const lib = url.protocol === "http:" ? http : https;` + port `80/443` — identical to the sibling `requestBinary()`. (Latent in D2 because `requestUrl` had only ever hit HTTPS endpoints.)
3. Added `const http = require("http");` — referenced by `requestBinary()` and the `requestUrl` fix but never imported (latent `ReferenceError`).

**B — attachment extract budget restored (both handlers).** The attachment injection shipped with *"Full injection (no budget truncation), matching current Theo"* — a **mirror error**: Theo DOES budget (`ATTACH_NATIVE_BUDGET_BYTES`, `ATTACH_EXTRACT_BUDGET_CHARS`, truncating extract with `…[truncated]`). Without it, a real Excel's bloated CSV extract (SheetJS emits the whole stray used-range) blew the gpt-5 input; gpt-5 (a reasoning model) then returned an **empty completion** and the stream handler swallowed it → the live "(no response)" Walter reported (reproduced with a 4MB attachment). Restored Theo's budget structure with **two ALLOWED DELTAs** (Golden Handler §4), both empirically validated (§5):
- **Value: 100000 chars, not Theo's 200000.** gpt-5 returns empty at ~200K injected chars but works at ~120K (Claude/Theo tolerates 200K). Tuned below the gpt-5 failure zone.
- **Shape: one SHARED TOTAL budget across all turns, allocated current-turn-first, assembled sequentially.** The conversation-scoped injection re-injects every prior turn's attachments each message, so Theo's per-`buildAttachmentParts`-call budget would still let N turns × the same large file blow the input (Walter's exact repro: same file across 3 turns → all "(no response)"). The shared `{nativeBytes, extractChars}` accumulator is threaded through every turn's `buildAttachmentParts`, allocated to the current user turn first (so the file being asked about keeps its content; only oldest re-injected copies truncate), and the assembly is sequential (was `Promise.all`) so the shared counter is race-free.

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Verified Evidence Pack (backend handler defect-fix; no migration)
Grounding parent (source baseline): `a0cb912eb5058f34c68d774e6fde7eb86090096d` (vault-dottie, `development`)
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD) |
| - | ------------------------------- | ------------------------------ | --------------------------------- |
| 1 | GOVERNING VISION — `governance/VAULT_MEMORY_ARCHITECTURE.md` (§A Amendment 9 — Dottie full agent on gpt-5) | `Read`(§A9) this turn | `3afda098df614b11adc8a7cdcf28d0f9a3f47011` |
| 2 | Backend Governor — `governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md` (§3 Never-Guess — every fix validated by golden curl + App-Insights exception, not inferred) | `Grep("Never-Guess")` this turn | `e44cdd85d3d0e5df332dc754cdec731e2e68022e` |
| 3 | Grounding Conformance — `governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR; §5 Rule Anchor) | `Grep("MUST open with a Grounding Conformance Receipt")` this turn | `7c0d902bdff3b6c0af475b483e31ed796214e57b` |
| 4 | Golden Handler — `governance/THEO_GOLDEN_HANDLER_STANDARD.md` (§4 EXACT mirror / ALLOWED DELTA — budget structure mirrors Theo; value + shared-total are validated deltas) | `Grep("EXACT mirror")` this turn | `f8f0e5ea36447502e35fb87b373c94e376f05cbb` |
| 5 | Execution Orchestration — `governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md` (§1D ordered pass; §1E deploy-after-Codex — defects found during the approved package's verify step) | `Grep("ordered, non-skippable")` this turn | `565559b699c1309f8e750b0dbbac859c13d807c8` |
| 6 | **BUDGET MIRROR SOURCE — Theo `theo_message_stream` (primary reference)** — `Codex Governance/Dottie-D2-Stream-Backend-Pass-1-VEP/PRIMARY_REFERENCE.theo_message_stream.js` (the `ATTACH_*_BUDGET` structure fix B mirrors; §383–436 `buildAttachmentBlocks`) | `Read`(§383–436) this turn | `2939303ffa2d1164ed2987aa0052ae34f3ed07f3` |
| 7 | **MODIFIED HANDLER (proposed, committed at HEAD) — `dottie_message`** (buffered v3) — supersedes approved `423b07c0…` and the interim defect-fix `b58152…` | `Read`(full) this turn; `Codex Governance/Dottie-D2-Conversation-Handlers-Pass-1-VEP/dottie_message.index.js` | `2d5e53fa8efc91601c4b63bc4f03b5c96d91dc5c` |
| 8 | **MODIFIED HANDLER (proposed, committed at HEAD) — `dottie_message_stream`** (streaming v4) — supersedes approved `bfa55379…` | `Read`(full) this turn; `Codex Governance/Dottie-D2-Stream-Backend-Pass-1-VEP/proposed-app/src/functions/dottie_message_stream.js` | `460681e93703d7c264c84607fec6f397833fefbd` |

No ChatGPT advisory cited. No `reporting_*` / `theo_*` object touched. Backend defect-fix (no migration; no write SQL; no route/function.json/schema change; no gpt-5-call parameter change).

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt" | GCR (head) |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §3 | "Never-Guess" | §5 — each fix validated by a live golden curl + App-Insights exception |
| governance/THEO_GOLDEN_HANDLER_STANDARD.md | §4 | "EXACT mirror" | §6 — budget structure mirrors Theo; value (100K) + shared-total are the validated ALLOWED DELTAs |
| governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md | §1D | "ordered, non-skippable" | §8 — defects found in verify; fix re-reviewed before the package is closed |

---

## §5 — Golden test evidence (post-fix, live; all PASS)
| # | Test | Result |
| - | ---- | ------ |
| G1 | Normal question → rich Markdown (format directive) | PASS — 5 `##`/`###`, 5 `**bold**`, 15 bullets |
| G2 | Buffered read of an extract-class doc (`text/plain`) — 3 canary facts | PASS — `BLUE-HERON-42` / `GBP 73,412` / `ZX9-QQ-7788` quoted verbatim |
| G3 | B8i `message_seq` linkage — `dottie_list_conversation_attachments` after send | PASS — attachment returned for the conversation (chip survives reload) |
| G4 | C4 — native PDF via `input_file` on the stream path | PASS — gpt-5 quoted the PDF canary + "File type received: PDF" |
| G5 | Real 28 KB Excel workbook via stream (extract-class) | PASS — read + summarised |
| G6 | **Oversized attachment (4 MB) — the "(no response)" repro** | Before: empty 200. **After budget: responds** (describes the file, truncated) |
| G7 | **Cross-turn: same large file across 2 turns (Walter's screenshot scenario)** | Before: "(no response)". **After: both turns respond** (turn 2 notes truncation) |
| G8 | Buffered/stream regression — normal message + small Excel post-fix | PASS — no regression |

App-Insights corroboration (Never-Guess): `TypeError: context.error is not a function at buildAttachmentParts (…:266)`; `storage token … Error: write EPROTO … wrong version number`; the "(no response)" cases were fast (~1 s) HTTP-200 streams with zero content deltas (gpt-5 empty completion swallowed).

## §6 — Golden Handler mirror note (ALLOWED DELTA)
Fix B mirrors Theo's `buildAttachmentBlocks` budget structure (GCR row 6, §383–436): per-message `nativeBytes`/`extractChars` accumulators, `remaining` clip with `…[truncated]`, omit-with-note past budget. Two deltas, both classified ALLOWED-DELTA and empirically validated (§5 G6/G7), because Dottie is gpt-5 not Claude and uses conversation-scoped re-injection:
1. `ATTACH_EXTRACT_BUDGET_CHARS = 100000` (Theo 200000) — gpt-5 returns empty ≥ ~200K injected chars; 120K works (G6/G7).
2. Budget is a **shared total across turns**, current-turn-first, sequential assembly (Theo's is per-call) — required because the conversation-scoped injection re-injects every prior turn's attachments, so a per-call cap does not bound the actual upstream payload. Content-block shapes remain the per-handler gpt-5 shapes already approved (stream `input_text`/`input_file`/`input_image`; buffered `text`/`image_url`).

## §7 — Gap Register
**PROCEED.** Fixes deployed (Kudu VFS; deployed == committed `2d5e53fa` / `460681e9`, GET-back verified) to complete the approved package's verify step; submitted here for Codex re-review of the consolidated delta before the attachment-injection package is marked closed.
- **G-SWALLOW: DISCLOSED (follow-up, not this package).** The stream handler still swallows an empty/error upstream into a silent 200 ("(no response)") rather than surfacing a user-facing error. The budget prevents the common trigger (oversized extract); surfacing upstream errors is a separate robustness improvement, disclosed.
- **G-EXCEL-RANGE: DISCLOSED (optional enhancement).** Trimming the SheetJS extraction to the actual data range at finalize (vs the stray used-range) would shrink Excel extracts at the source; the budget already bounds the injected payload, so this is an optimisation, not a fix.

## §8 — Deploy status (ordered; §1D)
1. Defects found in the approved package's golden-test (verify) step. 2. Fixed + `node --check` + redeployed to both apps (Kudu VFS, GET-back byte-identical). 3. Golden tests re-run — all PASS (§5), incl. the "(no response)" repro now resolved + Walter's live FE re-test of the real Excel confirmed working. 4. **Codex Pass-2 re-review of this consolidated delta.** 5. On APPROVED: attachment-injection package closed; Role-C API-spec `attachment_ids` note; (the superseded buffered-defectfix VEP folds into this).

## §CODEX — activation
```
Codex — Dottie Attachment-Injection GOLDEN-TEST HARDENING, Pass-2 (both handlers). Open with a
governance-bound GCR + Rule Anchor Table, hard-gate, APPROVED/REJECTED only. vault-dottie @ development
HEAD a0cb912eb5058f34c68d774e6fde7eb86090096d. VEP: Codex Governance/
Dottie-Attachment-Injection-GoldenTest-Hardening-Pass-1-VEP/Dottie_Attachment_Injection_GoldenTest_Hardening_VEP.md.
SUPERSEDES the Dottie-Attachment-Injection-Buffered-Defectfix VEP (folds it in). Reviews two files'
deltas vs their approved blobs: dottie_message (buffered) 423b07c0 -> 2d5e53fa8efc91601c4b63bc4f03b5c96d91dc5c
(GCR row 7); dottie_message_stream 460681e93703d7c264c84607fec6f397833fefbd (GCR row 8). Buffered: three
runtime fixes (context.error->context.log.error x3 [v4 idiom in v3]; requestUrl protocol-aware [was https-only
-> EPROTO on http:// MI endpoint]; require("http")). BOTH: restore Theo's attachment extract budget (mirror
GCR row 6 §383-436) with two validated ALLOWED DELTAs — 100000 chars not 200000 (gpt-5 returns empty at ~200K),
and a shared-total-across-turns current-turn-first sequential budget (conversation-scoped re-injection makes
Theo's per-call cap insufficient). No SQL/route/function.json/schema/model-call change. node --check passes both;
deployed == committed (GET-back verified); all golden tests PASS incl. the "(no response)" repro resolved and
Walter's live FE re-test of the real Excel confirmed. APPROVED or REJECTED only.
```
