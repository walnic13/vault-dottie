# Dottie Format Directive — Pass-1 VEP (rich-Markdown output; match Theo's formatting richness)

Fixes a live FE bug (Walter-reported, with screenshot): Dottie's responses render as plain prose — no bold, headings, or bullets — while Theo's are richly formatted. **Root cause (confirmed): the FE renderer is not at fault.** `src/theo/lib/markdown.tsx` `Formatted` (react-markdown + remark-gfm) is deployed and fully styles headings/bold/lists/tables; the deployed bundle contains it. The cause is one sentence in `DOTTIE_SYSTEM_PROMPT` (embedded in both send handlers): *"Use headings, **bold**, bullet lists, and tables when they aid scanning, **not by default**."* Claude (Theo) formats richly regardless; **gpt-5 obeys "not by default" literally → plain output.** This package replaces that sentence with a "format richly by default" directive so gpt-5's output matches Theo's richness (a later package re-voices formatting for Dottie's own identity — Walter). **Prompt-string change only** — no logic, SQL, route, or schema change. This package's SOLE delta is the TONE AND FORMAT directive sentence (§2 BEFORE/AFTER); the two handler files at HEAD **also carry the separately-Codex-APPROVED attachment-injection package** (Theo B8d/B8i; Codex APPROVED this session), which is out of scope for this review and covered by its own approval. Because both deltas live in the same two files, the eventual deploy ships them together — covered by both approvals.

**Empirically validated (this turn):** with the new directive supplied as the system prompt, a normal question ("Give me a concise overview of Modern Family" — no user-side "format in markdown") returned `**bold** labels + nested bullet lists` (`**` ≥2, `- ` bullets present) — vs. the plain colon-labels the old directive produced. gpt-5 CAN format richly (proven); the old directive was suppressing it.

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Verified Evidence Pack (backend prompt-string change; no migration)
Grounding parent (source baseline): `206484667a61ec5280cdae5d261db03b3be1a831` (vault-dottie, `development`)
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD) |
| - | ------------------------------- | ------------------------------ | --------------------------------- |
| 1 | GOVERNING VISION — `governance/VAULT_MEMORY_ARCHITECTURE.md` (§A Amendment 9 — Dottie full agent; deliberately on gpt-5) | `Read`(§A9) this turn | `3afda098df614b11adc8a7cdcf28d0f9a3f47011` |
| 2 | Backend Governor — `governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md` (§3 Never-Guess) | `Grep("Never-Guess")` this turn | `e44cdd85d3d0e5df332dc754cdec731e2e68022e` |
| 3 | Grounding Conformance — `governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR; §5 Rule Anchor) | `Grep("MUST open with a Grounding Conformance Receipt")` this turn | `7c0d902bdff3b6c0af475b483e31ed796214e57b` |
| 4 | Execution Orchestration — `governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md` (§1D ordered pass; §1E deploy-after-Codex) | `Grep("ordered, non-skippable")` this turn | `565559b699c1309f8e750b0dbbac859c13d807c8` |
| 5 | AUTHORITY — `governance/DOTTIE_OPERATING_RULESET.md` (the TONE AND FORMAT directive this changes; committed at HEAD carrying the new "format richly by default" directive) | `Read`(TONE AND FORMAT) this turn | `3b4354e5008728d129f6ce6996e1ed3225b56903` |
| 6 | **MODIFIED HANDLER (proposed, committed at HEAD) — `dottie_message`** (buffered; `DOTTIE_SYSTEM_PROMPT` embeds the ruleset). Carries this package's TONE AND FORMAT directive swap (§2) + the separately-APPROVED attachment injection | `Read`(full) this turn; `Codex Governance/Dottie-D2-Conversation-Handlers-Pass-1-VEP/dottie_message.index.js` | `423b07c03565053b8d9e60bb07fe93d0da955b1d` |
| 7 | **MODIFIED HANDLER (proposed, committed at HEAD) — `dottie_message_stream`** (streaming; same `DOTTIE_SYSTEM_PROMPT`). Carries this package's directive swap (§2) + the separately-APPROVED attachment injection | `Read`(full) this turn; `Codex Governance/Dottie-D2-Stream-Backend-Pass-1-VEP/proposed-app/src/functions/dottie_message_stream.js` | `bfa55379bb9a150e1a6f82c420a02ae4a5398aee` |

No ChatGPT advisory cited. No `reporting_*` / `theo_*` object touched. Backend prompt-string change (no migration; no write SQL).

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt" | GCR (head) |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §3 | "Never-Guess" | §3 — the fix is empirically validated (curl), not assumed |
| governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md | §1D | "ordered, non-skippable" | §7 — Codex → deploy → verify |

---

## §1 — Feature
The `TONE AND FORMAT` directive in `DOTTIE_SYSTEM_PROMPT` (the leading system instruction the send handlers prepend: `effectiveSystem = [DOTTIE_SYSTEM_PROMPT, memoryBlock, systemPrompt]`) is changed from a "not by default" formatting stance to a "rich by default" one, in all three places the text lives: the two send handlers' embedded copy and the `DOTTIE_OPERATING_RULESET.md` authority.

## §2 — The change (exact; the ONLY change)
Replace, in `governance/DOTTIE_OPERATING_RULESET.md` + `dottie_message.index.js` + `dottie_message_stream.js` (identical substring in all three):

BEFORE:
```
Use headings, **bold**, bullet lists, and tables when they aid scanning, not by default.
```
AFTER:
```
Format richly in clean Markdown by default: use ## / ### headings to structure any multi-part answer, **bold** for key terms and inline labels, bullet or numbered lists for enumerations, and tables for comparisons. Give even short answers light structure (a bold lead line, a few bullets); reserve a single unbroken paragraph only for a genuinely one-line reply.
```
(No backticks in the replacement — `DOTTIE_SYSTEM_PROMPT` is a backtick-delimited template literal; the directive uses `## / ###` in plain text. `node --check` passes for both handlers.) Relative to the deployed D2 / D2-Stream state, THIS package's only prompt delta is the directive swap; the handler files at HEAD (GCR rows 6–7) additionally carry the separately-Codex-APPROVED attachment injection (its own package/approval). This package introduces no envelope, SQL, blob, gpt-5-call, or route change.

## §3 — Why (Governor §3 Never-Guess — validated, not assumed)
- The FE renderer is rich + deployed: `Formatted` maps `h1–h4` (bold/sized), `ul/ol/li` (bulleted, indented), `strong` (fontWeight 650), `table`, `code`, etc. via react-markdown; the live dev-SWA bundle contains the markdown AST code. So plain output is NOT a render bug.
- gpt-5 CAN format richly: a curl to `dottie_message` with a user turn saying "Format in markdown" returned `# heading`, `**bold**`, `- bullets`. The old system directive ("not by default") was suppressing it in normal turns — gpt-5 follows the letter of the prompt where Claude does not.
- Post-change validation (this turn): the AFTER directive as the system prompt, on a normal question with NO user-side formatting ask, returned bold labels + nested bullet lists (`**` count ≥2, `- ` bullets). This is the Theo-level richness the `Formatted` renderer draws.

## §4 — Boundary
Prompt-string content only. No `theo_*`/`reporting_*` touched; no migration; no route/function.json change; no gpt-5-call parameter change. The anti-hallucination / grounding / materiality / show-your-work discipline of `DOTTIE_SYSTEM_PROMPT` is untouched — only the formatting sentence changes. Deployed via Kudu VFS to the two send handlers.

## §5 — Gap Register
**PROCEED.**
- **G-IDENTITY: PROCEED (later package).** This matches Theo's output richness; a later package re-voices formatting for Dottie's own identity (Walter: "tweak later when we customise Dottie"). Disclosed.
- **G-ATTACH-INJECT: DISCLOSED + APPROVED (separate package, co-resident in these files).** The attachment-injection package (Theo B8d/B8i in both send handlers) is a distinct package that Codex APPROVED this session; its code is co-resident in the two handler files at HEAD (GCR rows 6–7). It is out of scope for THIS review (directive sentence only) and covered by its own approval. Because both deltas live in the same files, the deploy ships them together — covered by both approvals. Disclosed so scope is clear.

## §6 — Deploy plan (ordered; §1D)
1. Codex Pass-2 → APPROVED/REJECTED. 2. Claude Kudu-VFS updates `dottie_message` (func-dottie) + `dottie_message_stream` (func-dottie-stream) — PUT the HEAD `index.js` (which carries this directive swap AND the already-APPROVED attachment injection; deployed together, covered by both approvals), GET-back byte-identical, restart. 3. Claude verifies: a curl to `dottie_message_stream` (+ buffered) on a normal question returns rich markdown (bold/bullets/headings). 4. Role-C: the ruleset change is the authority record; no API-spec/reconciliation change (formatting, not an endpoint). 5. Walter eyeballs the dev-SWA FE render.

## Codex activation note (Walter forwards)

```
Codex is activated for Pass-2 review of Dottie Format Directive, vault-dottie,
"Codex Governance/Dottie-Format-Directive-Pass-1-VEP/Dottie_Format_Directive_VEP.md". Open with a
governance-bound GCR + Rule Anchor Table. PROMPT-STRING CHANGE ONLY (no migration, no route/schema/logic
change; this package's sole delta is the directive sentence — the handler files at HEAD also carry the separately-APPROVED attachment injection, out of scope here and covered by its own approval). Fixes a live FE
bug: Dottie renders plain prose while Theo renders rich markdown. Root cause is one sentence in
DOTTIE_SYSTEM_PROMPT ("...not by default") that gpt-5 obeys literally (Claude ignores it) — the FE Formatted
renderer is rich + deployed. Review: (1) the ONLY change is the TONE AND FORMAT sentence (§2 before/after),
in the two handlers' embedded DOTTIE_SYSTEM_PROMPT + DOTTIE_OPERATING_RULESET.md; the replacement uses no
backticks (template-literal safe) and node --check passes. (2) No other handler bytes change. (3) The fix is
empirically validated (curl: normal question → bold + bullets). (4) deploy plan (Kudu VFS + verify). Emit
APPROVED or REJECTED only.
```
