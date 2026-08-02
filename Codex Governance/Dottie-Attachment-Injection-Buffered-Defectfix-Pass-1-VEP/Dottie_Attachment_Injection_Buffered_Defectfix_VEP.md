# Dottie Attachment Injection — Buffered Handler Defect-Fix (Pass-1 VEP)

Three defects in the **buffered** `dottie_message` attachment read-path, surfaced by **live golden testing** (the approved attachment-injection package's own deploy/verify step — Codex accepted "PDF verified by golden curl C4 before claimed"), that static review + `node --check` could not catch. All three are runtime-only (undefined method / wrong protocol / missing require). This VEP supersedes the buffered handler bytes approved under the format-directive + attachment-injection packages (prior buffered blob `423b07c0…` → new `b58152…`). **The streaming handler `dottie_message_stream` is UNCHANGED** (it was already correct — protocol-aware `requestUrl`, `http` required, `context.error` valid in its v4 model; its approved blob `bfa55379…` stands and is still deployed).

**The three defects + fixes (buffered v3 handler only):**
1. **`context.error(...)` → `context.log.error(...)` (×3).** `context.error` is a **v4** programming-model idiom; `dottie_message` runs the **v3** (classic function.json) model, where it is `undefined` → `TypeError: context.error is not a function` crashed the entire message with a 500 on ANY attachment use. The handler's own established idiom is `context.log.error` (4 pre-existing calls); the fix makes the 3 attachment-path calls consistent with it.
2. **`requestUrl()` made protocol-aware.** It hardcoded `https.request(...)` + port 443, so the managed-identity token endpoint (`process.env.IDENTITY_ENDPOINT`, an `http://localhost:<port>` address) failed the TLS handshake with `EPROTO … wrong version number` (HTTPS client onto a plaintext port). Fixed to `const lib = url.protocol === "http:" ? http : https;` + port `80/443` by protocol — identical to the sibling `requestBinary()` (which was already correct). Latent in D2 because `requestUrl` had only ever been used for HTTPS endpoints (the OpenAI token); the attachment MI-token call is its first `http://` use.
3. **`const http = require("http");` added.** `http` was referenced by `requestBinary()` and (after fix #2) `requestUrl()`, but never imported → latent `ReferenceError`. (Never triggered before because `requestBinary` was only ever called for HTTPS blob URLs.)

**Post-fix golden tests — ALL PASS (evidence in §5):** rich-markdown emission (format directive); buffered read of an extract-class doc (canary quoted verbatim); B8i `message_seq` linkage confirmed via `dottie_list_conversation_attachments` (chip survives reload); and **C4** — a native PDF read by gpt-5 via `input_file` on the streaming path (canary quoted). Deployed to func-dottie via Kudu VFS; deployed blob == committed blob `b58152…` (GET-back verified).

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Verified Evidence Pack (backend handler defect-fix; no migration)
Grounding parent (source baseline): `2bd6aaba28bc430ea078692d7cf94b14dd993c2e` (vault-dottie, `development`)
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD) |
| - | ------------------------------- | ------------------------------ | --------------------------------- |
| 1 | GOVERNING VISION — `governance/VAULT_MEMORY_ARCHITECTURE.md` (§A Amendment 9 — Dottie full agent on gpt-5) | `Read`(§A9) this turn | `3afda098df614b11adc8a7cdcf28d0f9a3f47011` |
| 2 | Backend Governor — `governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md` (§3 Never-Guess — every fix is empirically validated by golden curl, not inferred) | `Grep("Never-Guess")` this turn | `e44cdd85d3d0e5df332dc754cdec731e2e68022e` |
| 3 | Grounding Conformance — `governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR; §5 Rule Anchor) | `Grep("MUST open with a Grounding Conformance Receipt")` this turn | `7c0d902bdff3b6c0af475b483e31ed796214e57b` |
| 4 | Golden Handler — `governance/THEO_GOLDEN_HANDLER_STANDARD.md` (§4 allowed delta; the fixes align the handler with its own v3 idiom + sibling helper) | `Grep("EXACT mirror")` this turn | `f8f0e5ea36447502e35fb87b373c94e376f05cbb` |
| 5 | Execution Orchestration — `governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md` (§1D ordered pass; §1E deploy-after-Codex — golden testing surfaced these defects during the approved package's verify step) | `Grep("ordered, non-skippable")` this turn | `565559b699c1309f8e750b0dbbac859c13d807c8` |
| 6 | **MODIFIED HANDLER (proposed, committed at HEAD) — `dottie_message`** (buffered v3; the defect-fix delta) — supersedes the prior-approved buffered blob `423b07c03565053b8d9e60bb07fe93d0da955b1d` | `Read`(full) this turn; `Codex Governance/Dottie-D2-Conversation-Handlers-Pass-1-VEP/dottie_message.index.js` | `b58152608e8244b9966745887247f3c3d2c4e743` |

No ChatGPT advisory cited. No `reporting_*` / `theo_*` object touched. `dottie_message_stream` UNCHANGED (approved blob `bfa55379…` stands). Backend defect-fix (no migration; no write SQL; no route/function.json/schema/model-call change).

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt" | GCR (head) |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §3 | "Never-Guess" | §5 — each fix validated by a live golden curl, not asserted |
| governance/THEO_GOLDEN_HANDLER_STANDARD.md | §4 | "EXACT mirror" | §2 — fixes align the handler with its own v3 idiom + sibling `requestBinary` |
| governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md | §1D | "ordered, non-skippable" | §6 — defects found in verify; fix re-reviewed before the package is closed |

---

## §1 — Scope
Buffered `dottie_message` (v3, func-dottie) only. Three runtime defects in the attachment read-path added by the attachment-injection package. No signature, envelope, SQL, route, function.json, schema, or gpt-5-call change; the fetch / strict-404 / native-vs-extract / conversation-scoped `message_seq` / B8i structure is untouched. `dottie_message_stream` is not modified.

## §2 — The changes (exact)
```diff
- const https = require("https");
+ const https = require("https");
+ const http = require("http");

  function requestUrl(urlStr, options = {}, body = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(urlStr);
+     const lib = url.protocol === "http:" ? http : https;
-     const req = https.request(
+     const req = lib.request(
        {
          method: options.method || "GET",
          hostname: url.hostname,
-         port: url.port ? Number(url.port) : 443,
+         port: url.port ? Number(url.port) : (url.protocol === "http:" ? 80 : 443),
          ...

  // ×3 (token catch, row catch, attachment-fetch catch):
- context.error("dottie_message: …", err);
+ context.log.error("dottie_message: …", err);
```
`node --check` passes. `requestBinary()` (the sibling helper) already used the `lib = protocol==="http:" ? http : https` pattern; this makes `requestUrl` consistent.

## §3 — Why (Governor §3 — validated, not assumed)
Each defect was observed live and each fix re-verified live (§5), not inferred:
- Defect 1 exception is captured in App Insights: `TypeError: context.error is not a function at buildAttachmentParts (dottie_message/index.js:266)`.
- Defect 2 exception (after fix 1 exposed it): `storage token for attachments failed … Error: write EPROTO … wrong version number` — the classic HTTPS-onto-HTTP signature.
- Defect 3 is a static reference to an un-required module; caught while fixing #2 (whole-file `context.*` + `require` sweep).

## §4 — Boundary
No `theo_*`/`reporting_*`; no migration; no write SQL by Claude; no route/function.json/schema/model-parameter change. `dottie_message_stream` unchanged. The only behavioral change is that the buffered attachment read-path now works instead of 500-ing.

## §5 — Golden test evidence (post-fix, live)
| # | Test | Result |
| - | ---- | ------ |
| G1 | Normal question → rich Markdown emission (format directive) | PASS — 5 `##`/`###`, 5 `**bold**`, 15 `- ` bullets |
| G2 | Buffered read of an extract-class doc (`text/plain`) — 3 canary facts | PASS — model quoted `BLUE-HERON-42` / `GBP 73,412` / `ZX9-QQ-7788` verbatim |
| G3 | B8i `message_seq` linkage — `dottie_list_conversation_attachments` after send | PASS — attachment returned for the conversation (`message_seq 0`); chip survives reload |
| G4 | **C4** — native PDF via `input_file` on `dottie_message_stream` | PASS — gpt-5 replied "Exact canary code (verbatim): MAGENTA-LLAMA-77 … File type received: PDF" |

## §6 — Gap Register
**PROCEED.** The fix is deployed (Kudu VFS; deployed blob == committed `b58152…`, GET-back verified) to complete the approved package's verify step, and is submitted here for Codex re-review of the buffered delta before the attachment-injection package is marked closed. No further gaps: the three defects were the only runtime issues golden testing surfaced across all four paths (markdown / extract-doc / reload-link / PDF-native).

## §7 — Deploy status (ordered; §1D)
1. Defects found in the approved package's golden-test (verify) step. 2. Fixed + `node --check` + redeployed to func-dottie (Kudu VFS, GET-back byte-identical). 3. Golden tests re-run — all PASS (§5). 4. **Codex Pass-2 re-review of THIS buffered delta** (`423b07c0…`→`b58152…`) — APPROVED/REJECTED. 5. On APPROVED: attachment-injection package is closed; Role-C API-spec `attachment_ids` note; Walter FE smoke test.

## §CODEX — activation
```
Codex — Dottie Attachment-Injection BUFFERED defect-fix, Pass-2. Open with a governance-bound GCR +
Rule Anchor Table, hard-gate, APPROVED/REJECTED only. vault-dottie @ development HEAD
2bd6aaba28bc430ea078692d7cf94b14dd993c2e. VEP: Codex Governance/
Dottie-Attachment-Injection-Buffered-Defectfix-Pass-1-VEP/Dottie_Attachment_Injection_Buffered_Defectfix_VEP.md.
Reviews ONE file's delta: dottie_message (buffered v3) 423b07c0 -> b58152608e8244b9966745887247f3c3d2c4e743
(GCR row 6). Three runtime defect fixes surfaced by live golden testing: (1) context.error->context.log.error
×3 (v4 idiom in a v3 handler); (2) requestUrl made protocol-aware (was https-only -> EPROTO on the http://
MI endpoint), matching sibling requestBinary; (3) added require("http") (referenced, never imported). No
signature/SQL/route/function.json/schema/model-call change; the B8d/B8i structure is untouched.
dottie_message_stream UNCHANGED (approved bfa55379 stands). node --check passes; deployed blob == committed
(GET-back verified); all 4 golden tests PASS (§5, incl. C4 PDF input_file). APPROVED or REJECTED only.
```
