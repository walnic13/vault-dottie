# Dottie Governance-Block Emit — Pass-1 VEP (teach DOTTIE_SYSTEM_PROMPT to emit the [[CHECK]] block)

The backend half of #4 FE pkg 2 — the paired **emit** for the Codex-APPROVED governance-component renderer (`Dottie-FE-Governance-Component-Pass-1-VEP` @ `161ecdd`). The FE renders a `[[CHECK]]…[[/CHECK]]` block as the §3 governance component but nothing emits one on live answers yet. This package adds ONE section to `DOTTIE_SYSTEM_PROMPT` in `dottie_message_stream` instructing gpt-5 to emit its answer as a single `[[CHECK]]{json}[[/CHECK]]` block (matching the APPROVED FE `CheckData` contract) **when the reply is a substantive tax/governance position or an adjudication**, and to stay in **plain Markdown for light exchanges** (the Light intensity). **System-prompt string only — no code logic, no schema, no migration, no dependency, no route/streaming/contract change.** The model's text deltas already stream through verbatim (`response.output_text.delta` → SSE `choices[].delta.content`, `dottie_message_stream.js:983-986`), the same passthrough the deployed `[[ARTIFACT]]` protocol relies on, so the block reaches the FE untouched.

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Verified Evidence Pack (backend handler system-prompt modification; no migration; no schema; no dependency)
Grounding parent (source baseline): `161ecdd1531389431a0171788aa75ad1533a9369` (vault-dottie, `development`)
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD / proposed) |
| - | ------------------------------- | ------------------------------ | -------------------------------------------- |
| 1 | GOVERNING VISION — `governance/VAULT_MEMORY_ARCHITECTURE.md` (§A Amendment 9 — Dottie full agent on gpt-5) | grounded; unchanged @ HEAD since APPROVED image package | `3afda098df614b11adc8a7cdcf28d0f9a3f47011` |
| 2 | Backend Governor — `governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md` (§3 Never-Guess; §4 Schema Reality Lock) | `Grep`("Schema Reality Lock"/"Never-Guess") this turn | `e44cdd85d3d0e5df332dc754cdec731e2e68022e` |
| 3 | Grounding Conformance — `governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR; §5 Rule Anchor) | grounded; unchanged @ HEAD (quote re-verified literal) | `7c0d902bdff3b6c0af475b483e31ed796214e57b` |
| 4 | Golden Handler — `governance/THEO_GOLDEN_HANDLER_STANDARD.md` (§4 EXACT mirror / allowed delta; §5.5 deploy) | grounded; unchanged @ HEAD (quote re-verified literal) | `f8f0e5ea36447502e35fb87b373c94e376f05cbb` |
| 5 | Execution Orchestration — `governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md` (§1D ordered pass; §1E deploy-after-Codex) | grounded; unchanged @ HEAD (quote re-verified literal) | `565559b699c1309f8e750b0dbbac859c13d807c8` |
| 6 | VISUAL AUTHORITY (the anatomy the emit fills) — `spec/DOTTIE_DESIGN_SYSTEM.md` (§3 component anatomy; §4 three intensities / R-INTENSITY; §9 R-RENDERER) | `Read`(§44–121, §181–204) this session | `744523cf905df1186d954b86519b1cdeddac539c` |
| 7 | **CONTRACT (Codex-APPROVED FE pkg 2) — the `CheckData` schema the block must match** — `src/theo/lib/check.ts` | `Read`(full) this session; authored pkg 2 | `53fd892efab9541299efe2106c7ed3d3162fcb96` |
| 8 | **MODIFIED HANDLER (proposed) — `dottie_message_stream`** — `Codex Governance/Dottie-D2-Stream-Backend-Pass-1-VEP/proposed-app/src/functions/dottie_message_stream.js` (`DOTTIE_SYSTEM_PROMPT` gains the [[CHECK]]-emit section; verbatim text passthrough at `:983-986` confirmed) | `Read` + `Edit` this turn; `node --check` PASS | proposed `c8bc9a295e268547aed220073ad64c3f9f263353` (base @HEAD = deployed image-downscale `f7c3086653513f27489d487393b3351be4c0748f`) |

No ChatGPT advisory cited. No `reporting_*` / `theo_*` object touched. No migration; no schema; no write SQL; no dependency change (`proposed-app/package.json` untouched). No route / method / streaming-envelope change.

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt" | GCR (head) |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §3 | "Never-Guess" | §3 — the emit shape is grounded in the deployed SHOW YOUR WORK section + the APPROVED FE `CheckData` contract, not invented |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §4 | "Schema Reality Lock" | §2 — no schema/DB/contract/dependency change; system-prompt string only |
| governance/THEO_GOLDEN_HANDLER_STANDARD.md | §4 | "EXACT mirror" | §4 — everything but the appended `DOTTIE_SYSTEM_PROMPT` section is byte-identical to the deployed base |
| governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md | §1D | "ordered, non-skippable" | §7 — Codex → config-zip deploy → live golden test |

---

## §1 — Feature
`DOTTIE_SYSTEM_PROMPT` gains one section, **STRUCTURED GOVERNANCE OUTPUT — THE [[CHECK]] BLOCK**, appended after TONE AND FORMAT. It instructs gpt-5: when the reply is a substantive tax/governance **position** or an **adjudication** of a claim, emit EXACTLY ONE `[[CHECK]]{json}[[/CHECK]]` block and nothing else, with fields matching the APPROVED FE `CheckData` (GCR row 7): `verdict` (concur/caution/challenge when adjudicating, null for a direct position) · `claim{source,text}` (adjudication only) · `lead` · `support[{label,body,cites}]` with labels Authority / What it says / How it applies · `conclusion` · `flags[]` · `confidence{level,label}` · `docs[]`. For a **light exchange** (casual/general lookup, greeting, image/video request, small talk) it must NOT emit a block — plain Markdown as before. This makes the intensity selection (DESIGN_SYSTEM §4 / R-INTENSITY) the model's job: verdict present → Grounded+verdict; verdict null → Grounded ("My read"); no block → Light. It restates the existing anti-fabrication discipline INSIDE the block (never fabricate a cite; unverifiable → say so + lower confidence).

## §2 — Architecture & boundary (Schema Reality Lock — SATISFIED)
**One file, one additive string section.** Base `f7c30866` (deployed image-downscale) → proposed `c8bc9a29` (git-diffable). The ONLY change is text appended inside the `DOTTIE_SYSTEM_PROMPT` template literal. **No code path changes:** no new function/const, no tool, no branch, no route/method, no SSE-envelope change, no DB/schema/migration, no dependency (`package.json` untouched), no `theo_*`/`reporting_*`. The block is plain model text — it rides the existing verbatim text-delta passthrough (`:983-986`), exactly like the deployed `[[ARTIFACT]]` protocol; the backend does no `[[…]]` parsing (that is FE-side). `node --check` PASS. Schema Reality Lock: nothing touches schema/DB/contract — the `CheckData` "contract" is the FE render shape (GCR row 7), and this package emits toward it; it does not define or migrate any store.

## §3 — Never-Guess (the emit shape is grounded, not invented)
The block schema is **not** a new invention: (a) its fields are the deployed `DOTTIE_SYSTEM_PROMPT` **SHOW YOUR WORK (AUDITABLE)** chain already in the base file ("the authority (precise cite) → what it says → how it applies to these facts → the conclusion … Mark confidence (high / fact-dependent / low) … assume-and-flag") plus the **SECOND OPINION & GOVERNANCE** verdict framing ("what you agree with, what you would challenge, what is missing, the risk"); (b) the field names/types are the **Codex-APPROVED** FE `CheckData` (GCR row 7, `check.ts` @ `53fd892`) — `verdict`∈{concur,caution,challenge}|null, `claim{source,text}`, `lead`, `support[{label,body,cites?}]`, `conclusion`, `flags[]`, `confidence{level,label}`, `docs[]`. The FE parser is forgiving by design (APPROVED pkg 2): a completed-but-unparseable block falls back to plain markdown, so a malformed emission degrades safely rather than blanking. No specific authority, rate, or date is asserted by this package.

## §4 — The change + Structural Mirror (Golden §4)
`node --check` PASS. Route / method / streaming envelope unchanged.

| Region | Classification | Notes |
| ------ | -------------- | ----- |
| everything but the `DOTTIE_SYSTEM_PROMPT` addition | **EXACT** | byte-identical to the deployed image-downscale base `f7c30866` |
| the appended STRUCTURED GOVERNANCE OUTPUT — THE [[CHECK]] BLOCK section (system-prompt text) | **ALLOWED DELTA (additive)** | §1 — instruction only; fields mirror the APPROVED FE `CheckData` (§3) |

No DEVIATION rows.

## §5 — Golden test (Golden §5.3; Claude runs post-deploy via the live Dottie streaming path as `wmansfield@vault-tax.com`)
| # | Step | Expect |
| - | ---- | ------ |
| G1 | A substantive tax turn ("how does §1446(f) apply if our selling partner is a foreign LP?") | `200` stream; the assistant text contains exactly one valid `[[CHECK]]…[[/CHECK]]` block that `JSON.parse`s; on the dev SWA it renders as the governance component (Grounded / My-read) |
| G2 | An adjudication turn ("Theo says no withholding because the partnership is US-based — is that right?") | `200`; a `[[CHECK]]` block with a non-null `verdict` + `claim`; renders with a verdict badge + claim-under-review |
| G3 | A casual turn ("morning, how are you?") | `200`; **no** `[[CHECK]]` block — plain Markdown (Light) |
| G4 | An image request ("find me a picture of the Golden Gate bridge") | `200`; media tool fires (`vault_image`), **no** `[[CHECK]]` block (Light) |
| G5 | Regression: attachments / web-search / todo tools | `200`; unchanged behaviour (no envelope change) |

## §6 — Gap Register
**PROCEED.**
- **(G-1) Model compliance is probabilistic.** gpt-5 is instructed, not guaranteed, to emit the block for every substantive turn and to keep it valid JSON. Mitigations: the APPROVED FE parser falls back to plain markdown on any parse failure (never blanks — pkg 2 rev 2), and a substantive answer that omits the block still renders as correct plain-markdown prose (no regression vs today). Not claimed reliable until §5 golden is green. Disclosed, PROCEED.
- **(G-2) No progressive reveal while the block streams.** Because the whole governance answer is inside one block and the FE suppresses a still-open block while streaming (APPROVED pkg 2), a long substantive turn shows the spinner until `[[/CHECK]]` closes, then the component pops in. Acceptable; a future refinement (emit a short plain lead before the block) is a possible later package. Disclosed, PROCEED.
- **(G-3) FE↔backend contract parity.** The emitted fields are the Codex-APPROVED `CheckData` (GCR row 7); any future contract change must move both halves together. Disclosed, PROCEED.
- **(G-4) No schema/migration/dependency/route/keys/contract.** System-prompt string only. PROCEED.

## §7 — Deploy plan (ordered; §1D)
1. Codex Pass-2 → APPROVED/REJECTED.
2. Claude **config-zips the sidecar** to `vaultgpt-func-dottie-stream` (whole-app v4 `config-zip`, per the D2-Stream authority): stage `proposed-app` + `npm install --omit=dev` (installs the UNCHANGED `@azure/functions` + `pg` + `jimp@0.22.12` from the reviewed `package.json` — no dependency delta), zip the whole app, `config-zip` deploy, restart.
3. Claude runs §5 golden tests via the live Dottie streaming path (substantive → block; casual → no block) — not claimed done until green + the dev-SWA governance component renders.

## Codex activation note (Walter forwards)

```
Codex is activated for Pass-2 review of the Dottie governance-block EMIT (the backend pair for the APPROVED FE
governance-component renderer @ 161ecdd), vault-dottie, "Codex Governance/Dottie-Governance-Emit-Backend-Pass-1-VEP/
Dottie_Governance_Emit_VEP.md". Open with a governance-bound GCR + Rule Anchor Table; hard-gate; emit only APPROVED
or REJECTED. BACKEND HANDLER MODIFICATION — one file (dottie_message_stream.js), SYSTEM-PROMPT STRING ONLY; NO code
logic / schema / migration / dependency / route / streaming change. It appends one section to DOTTIE_SYSTEM_PROMPT
instructing gpt-5 to emit its answer as a single [[CHECK]]{json}[[/CHECK]] block (fields = the Codex-APPROVED FE
CheckData contract, check.ts @ 53fd892) WHEN the reply is a substantive tax/governance position or an adjudication,
and to stay plain Markdown for light exchanges (the Light intensity). Review: (1) additive prompt text only; base
f7c30866 (deployed image-downscale) -> proposed c8bc9a29; everything else byte-identical (Golden §4 EXACT). (2)
Schema Reality Lock: no schema/DB/contract/dependency change (package.json untouched). (3) Never-Guess: the block
fields are grounded in the deployed SHOW YOUR WORK + SECOND OPINION sections of the same prompt AND the APPROVED FE
CheckData — not invented; no authority/rate/date asserted. (4) the block rides the existing verbatim text-delta
passthrough (:983-986), same as the deployed [[ARTIFACT]] protocol; the FE parses it and falls back to markdown on
any malformed emission (never blanks). (5) intensity is the model's choice per DESIGN_SYSTEM §4/R-INTENSITY: verdict
-> Grounded+verdict; null -> Grounded; no block -> Light. node --check PASS. Deploy = v4 whole-app config-zip to
func-dottie-stream (no dep delta). Golden test uses REAL live turns (substantive -> block; casual -> no block).
Emit APPROVED or REJECTED only.
```
