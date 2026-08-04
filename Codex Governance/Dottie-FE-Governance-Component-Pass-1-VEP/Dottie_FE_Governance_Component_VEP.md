# Dottie FE — Governance Component / Adaptive Renderer — Pass 1 Frontend Verified Evidence Pack

The second FE package of #4 (the Dottie design upgrade). Builds **the governance component (the core)** — one component that renders every substantive Dottie answer and every check, per the binding `spec/DOTTIE_DESIGN_SYSTEM.md` §3 (anatomy) / §4 (three intensities) / §9 (R-RENDERER). The message renderer becomes "Theo's markdown renderer **plus** the governance blocks": a substantive/adjudication answer carries a `[[CHECK]]…[[/CHECK]]` block whose structured body the renderer draws as the component; a light lookup carries no block and renders as plain markdown. Adds the semantic **verdict / inset** tokens to the central `C` object (the deferred pkg-1 §GAP G-1 tokens), a forgiving parser (`lib/check.ts`), the new `GovernanceCheck` component, a `[[CHECK]]` split in `splitAssistant`, and the render branch in `renderAssistant`. **FE-only; no backend/route/schema/migration.** The paired backend package (Dottie's system prompt emits the `[[CHECK]]` block) is pkg 2b — disclosed §GAP G-1.

**Rev 2 — Codex Pass-2 REJECT remediation (T13).** Codex REJECTED rev 1 (`75e293e`): the pack/comments said a "malformed or half-streamed block falls back to plain markdown / never blanks the turn," but `splitChecks` suppressed a dangling opener *unconditionally*, so a **never-closed** block (truncated stream, or an opener at turn start) could be **permanently hidden** — contradicting the stated fallback boundary. Fixed by making the suppression **streaming-aware**: a still-open opener is suppressed **only while the turn is actively streaming** (mid-arrival — the component pops in on `[[/CHECK]]`); once content is **final**, an unclosed opener renders as **plain text** — never permanently hidden. This threads a `streaming` flag `ChatView → renderAssistant → splitAssistant → splitChecks` (adds `ChatView.tsx` to the package) and corrects the source comments + this pack to match the implemented behaviour.

**Rev 3 — Codex Pass-2 REJECT remediation (T13, residual comment).** Codex REJECTED rev 2 (`a4cb293`): the comment at the `renderAssistant` `check` branch (`TheoMain.tsx`) still said "a malformed/half-streamed block falls back to plain markdown" — but after rev 2 that branch only ever receives a **fully-closed** block (`splitChecks` emits a `check` part only on a complete `[[CHECK]]…[[/CHECK]]` match); a still-open/never-closed block is handled upstream in `splitChecks` (suppressed while streaming, text branch when final) and never reaches the parse/fallback. Comment-only fix: the `check`-branch comment now states it always receives a fully-closed block, its fallback covers only the **completed-but-unparseable** case, and points to `splitChecks` for the still-open path. No runtime change (rev 2's behaviour was already correct — only the comment overstated it).

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Pass 1 — Frontend Verified Evidence Pack
Grounding parent (source baseline): `a4cb293cec26714b1f035fbe5410f2f42329948a` (vault-dottie, `development` — rev-2 HEAD Codex reviewed; this rev-3 comment-only remediation lands on top)
Grounding mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD / proposed blob SHA) |
| - | ------------------------------- | ------------------------------ | ---------------------------------------------------- |
| 1 | VISUAL AUTHORITY (binding) — `spec/DOTTIE_DESIGN_SYSTEM.md` (§2.4 semantic verdicts; §2.5 mono provenance; §3 component anatomy; §4 three intensities / R-INTENSITY; §5 anti-patterns; §9 R-RENDERER) | `Read`(§44–121, §181–204) this turn | `744523cf905df1186d954b86519b1cdeddac539c` |
| 2 | FE Grounding Conformance — `governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR + Rule Anchor) | grounded (prior-turn Read, unchanged @ HEAD) | `4f2f42e799be5db31e1e35e523d656ff4c1c057e` |
| 3 | FE Governor — `governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md` (§3 Component Contract Table; §4 reproduce faithfully / do not redesign) | grounded (prior-turn Read, unchanged @ HEAD) | `3afec7ea4b13650ce2bf28bf32073179a35e7b24` |
| 4 | Codex FE Review — `governance/CODEX_THEO_FRONTEND_REVIEW_STANDARD.md` (Pass-2 reviewer; APPROVED/REJECTED only) | grounded (prior-turn Read, unchanged @ HEAD) | `25cc488091d619d8f6642b10552df0d019a87933` |
| 5 | Golden Component Pack — `governance/THEO_GOLDEN_COMPONENT_PACK_STANDARD.md` (Primary Reference / Structural Mirror discipline) | grounded (prior-turn Read, unchanged @ HEAD) | `0035a1d9fed103d07bf420b957c3727ec47fcc6b` |
| 6 | CHANGED — `src/theo/theme.ts` (adds `inset` + 8 semantic verdict tokens to `C`; §2.4/§2.1 values) | `Read` + `Edit` (rev 1); unchanged in rev 2 | proposed `dd31705dc2e49961a2a319906bd4169d26568b1c` |
| 7 | CHANGED — `src/theo/lib/artifacts.ts` (`AssistantPart` gains `check`; `splitAssistant(content, streaming)` + new `splitChecks(segment, streaming)` parse `[[CHECK]]…[[/CHECK]]`; dangling opener suppressed only while streaming) | `Edit` this turn (rev 2) | proposed `5b169ff910752683e7a03d31376692abb6df488a` |
| 8 | NEW — `src/theo/lib/check.ts` (`CheckData`/`Verdict`/`CheckSupport`/`CheckClaim`/`CheckConfidence` types + forgiving `parseCheck`; header comment corrected rev 2) | `Edit` this turn (rev 2) | proposed `53fd892efab9541299efe2106c7ed3d3162fcb96` |
| 9 | NEW — `src/theo/components/GovernanceCheck.tsx` (the §3 anatomy component) | `Write` (rev 1); unchanged in rev 2 | proposed `46a6ffa9a0904661019865590293d4bc5ec6508c` |
| 10 | CHANGED — `src/theo/components/TheoMain.tsx` (`renderAssistant(content, streaming)` gains the `check` branch → `GovernanceCheck`, markdown fallback; rev-3 corrects the branch comment to say it always receives a fully-closed block) | `Read` + `Edit` this turn (rev 3, comment-only) | proposed `5774d7869deaee11f438809b2bc7d52725c8d1b2` |
| 11 | CHANGED — `src/theo/components/ChatView.tsx` (`renderAssistant` prop type gains optional `streaming`; call site passes `loading && i === messages.length - 1`) | `Read` + `Edit` this turn (rev 2) | proposed `1e7b4898a8c44d9b3f96c6f2db213ef6560ef145` |

No ChatGPT advisory cited. No backend / route / schema / migration touched (FE-only). The gold `DottieSpiral.tsx` (Logo-Mark VEP) and the pkg-1 dark palette are unchanged. `renderAssistant` is the single render seam — used directly for plain assistant turns (now with the streaming flag) and passed as `renderText` into `CitedText` (`ChatView.tsx:660`), so the `check` branch covers cited and non-cited answers alike.

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt" | GCR (head) |
| governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §4 | "reproduce it faithfully" | §UI-RECON — builds the §3/§4 component the binding spec specifies; no invented anatomy |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §4 | "do not redesign" | §UI-RECON — realises the design authority; the [[CHECK]] mechanism is an implementation choice, disclosed §GAP G-2 |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §3 | "Component Contract Table" | §CCT |
| spec/DOTTIE_DESIGN_SYSTEM.md | §3 | "it is not optional chrome" | §F-P1 / GovernanceCheck — the §3 anatomy is the component, not optional chrome (R-COMPONENT) |
| spec/DOTTIE_DESIGN_SYSTEM.md | §4 | "verdict badge appears only when adjudicating a claim" | GovernanceCheck — verdict badge iff data.verdict; else My-read tag (R-INTENSITY) |
| spec/DOTTIE_DESIGN_SYSTEM.md | §9 | "A supported answer renders the structure inline; a light lookup renders plain markdown" | §F-P2 / renderAssistant — check part → component; else markdown |
| spec/DOTTIE_DESIGN_SYSTEM.md | §2.4 | "These carry meaning and must never be swapped for the accent." | theme.ts — verdict tokens are separate keys from coral (gold); conclusion/badge/meter use verdict colours, gold only for the neutral direct-position callout + provenance eyebrows |
| spec/DOTTIE_DESIGN_SYSTEM.md | §2.5 | "provenance renders here" | GovernanceCheck — byline, eyebrows, cites, verdict label, confidence, docs all MONO |
| spec/DOTTIE_DESIGN_SYSTEM.md | §5 | "No plain-prose substantive answers" | §GAP G-1 — the renderer is the FE floor; the backend emit (pkg 2b) makes substantive answers carry the block |

---

## §F-P1 — Feature identification + UI-authority
Build **the governance component** (`DOTTIE_DESIGN_SYSTEM` §3, "the core") — one component that renders every substantive Dottie answer and every check, travelling unchanged across surfaces (§6). R-COMPONENT (§3): the support / confidence / flags structure *forces* Dottie to show her work — it is the component, not optional chrome. The anatomy is realised top-to-bottom exactly as §3 lists: (1) byline `Dottie · independent` + verdict badge / `My read` tag; (2) claim-under-review inset (adjudication only); (3) lead; (4) left-ruled support with monospace eyebrows (Authority / What it says / How it applies) + citation chips; (5) conclusion callout (verdict-keyed, neutral gold for a direct position); (6) flags; (7) confidence meter; (8) documentation-expected chips.

## §F-P2 — Architecture / boundary reconciliation
FE-only, standalone (Track 1 — the console ships independently; no Origin shell change). The renderer becomes "markdown **plus** governance blocks" (§9 R-RENDERER) via a `[[CHECK]]…[[/CHECK]]` protocol that mirrors the **deployed** `[[ARTIFACT]]…[[/ARTIFACT]]` protocol already in `lib/artifacts.ts`:
- `splitAssistant(content, streaming)` now splits each text segment on `[[CHECK]]` into interleaved `text` / `check` parts (after the existing artifact-sentinel split), so ordering with prose + artifacts is preserved. The `streaming` flag governs only the mid-arrival suppression of a not-yet-closed opener (below); it defaults `false`.
- `renderAssistant(content, streaming)` (`TheoMain`) gains a `check` branch: `parseCheck(body)` → `GovernanceCheck`; on any parse failure it falls back to `Formatted` (plain markdown), so a completed-but-malformed block never blanks the turn. `ChatView` passes `streaming = loading && i === messages.length - 1` at the direct call site; the `CitedText` path calls with one arg (streaming defaults `false` — the correctness-safe path, and cited answers are Light by construction anyway).
- **Streaming / never-hidden guarantee (rev-2 fix):** a still-open `[[CHECK]]` opener is suppressed **only while `streaming`** (the component pops in on `[[/CHECK]]`, no raw-JSON flash); when content is **final** an unclosed opener renders as plain **text** — a truncated/never-closed block is shown, never permanently hidden.
- **Intensity is implicit in the payload** (R-INTENSITY §4): a present `verdict` → *Grounded + verdict* (badge + optional claim); `verdict: null` → *Grounded* (`My read`); **no `[[CHECK]]` block at all → *Light*** (plain markdown, the existing path, unchanged).
No new component is wired into any layout; `GovernanceCheck` is rendered only inside the assistant-turn body. No prop-interface change to any existing component except the additive `check` case (no signature change).

## §F-P3 — Backend grounding
N/A for this package — no backend/route/schema/contract touched. The **contract** the FE renders against is the `[[CHECK]]` block body, whose schema is `CheckData` (`lib/check.ts`). The producer of that block is the paired backend package **pkg 2b** (Dottie's system prompt), disclosed §GAP G-1; until 2b lands, live answers carry no block and render Light (correct, not broken).

## §F-P4 — Component-reference grounding
Primary Reference = the **deployed** `lib/artifacts.ts` `[[ARTIFACT]]` protocol + `renderAssistant` at the grounding parent (the parse/split/render idiom this package extends) and the binding `DOTTIE_DESIGN_SYSTEM` §3/§4 anatomy. `GovernanceCheck` is a net-new component authored to the §3 spec (no prior component to mirror byte-for-byte); it reuses the VA-T1 inline-style + `C`/`MONO`/`SANS` token idiom verbatim and the `DownloadCard`/`ArtifactCard` structural conventions (inline-style card, token colours, mono provenance).

## §F-P5 — Component Contract Table
See §CCT. The one net-new public interface is `GovernanceCheck({ data: CheckData })`; the `CheckData` shape is the FE↔backend contract (full TS in §CCT).

## §F-P6 — Repository & active-surface grounding
- `tsc --noEmit -p tsconfig.app.json` → **exit 0** (rev 2, this turn). New types (`CheckData` et al.), the `AssistantPart` `check` union member, the `flatMap` return typing, and the optional `streaming` params on `splitAssistant`/`renderAssistant`/the `ChatView` prop all resolve; no `any`.
- `npm run build` (`vite build`) → **clean** (461 modules transformed; `dist/` emitted). Rev 2, this turn.
- Visual verification (this turn): a faithful static translation of `GovernanceCheck`'s inline styles was rendered headless at 2× and inspected at all three intensities (Light / Grounded / Grounded+verdict) — hierarchy, mono provenance, verdict-vs-accent colour separation, callout keying, confidence meter, and docs chips all render as the §3 spec requires. Published preview: `https://claude.ai/code/artifact/2e4725c3-7cfc-4737-878f-01bc5d69eaf8`.
- Gotchas honoured: Tailwind Preflight unaffected; `import type` idiom kept (`CheckData`/`Verdict` imported type-only into `GovernanceCheck`); no value/type import mixing; regex `lastIndex` reset before each `splitChecks` pass (module-level `RegExp` reuse safe).

## §F-P7 — VEP assembly
This pack (GCR + Rule Anchor Table + F-P walk + UI-RECON + CCT + GAP + DELTA + CODEX). Mechanical lint PASS.

## §UI-RECON — AUTHORIZED build (realises the visual authority; not a redesign)
`GovernanceCheck` **implements** the binding `DOTTIE_DESIGN_SYSTEM` §3/§4 anatomy — it does not deviate from or redesign the authority. Every part, order, and colour rule traces to the spec: verdict colours are separate `C` keys used only for meaning (§2.4 — never the gold accent; gold appears only on provenance eyebrows and the neutral direct-position callout); all provenance is `MONO` (§2.5); the verdict badge appears iff adjudicating (§4 R-INTENSITY); the `My read` tag rides grounded-non-verdict answers (§4 locked micro-decision, Walter 2026-08-02). The **one implementation choice** is the transport mechanism — a `[[CHECK]]` block mirroring the deployed `[[ARTIFACT]]` protocol — disclosed §GAP G-2. No VISUAL-AUTHORITY-DEVIATION rows.

## §CCT — Component Contract Table
| Component (file) | Prop / input interface (TS) | Visual authority (VA-id) | Data / contract dependency |
| --- | --- | --- | --- |
| `GovernanceCheck` (`components/GovernanceCheck.tsx`) | `{ data: CheckData }` — read-only render of the parsed payload; no callbacks, no state | DOTTIE_DESIGN_SYSTEM §3 (anatomy) / §4 (intensity) / §2.4 (verdict colours) / §2.5 (mono) | consumes `CheckData` only; no gateway/state/props from the host |
| `check.ts` types (`lib/check.ts`) | `type Verdict = "concur"\|"caution"\|"challenge"`; `interface CheckSupport { label: string; body: string; cites?: string[] }`; `interface CheckConfidence { level?: number; label: string }`; `interface CheckClaim { source?: string; text: string }`; `interface CheckData { verdict: Verdict\|null; claim: CheckClaim\|null; lead: string; support: CheckSupport[]; conclusion: string; flags: string[]; confidence: CheckConfidence\|null; docs: string[] }`; `parseCheck(raw: string): CheckData \| null` | — (contract type; the FE↔backend `[[CHECK]]` schema) | none — pure parse; `null` on any untrusted shape (only `lead` is required) |
| `artifacts.ts` `AssistantPart` / `splitAssistant` (`lib/artifacts.ts`) | `AssistantPart.kind` union gains `"check"` (value = raw JSON body); `splitAssistant(content: string, streaming = false): AssistantPart[]` (added optional trailing param, back-compatible); new module-private `splitChecks(segment: string, streaming: boolean): AssistantPart[]` | DOTTIE_DESIGN_SYSTEM §9 (renderer = markdown + governance blocks) | none — pure string parse |
| `TheoMain` `renderAssistant` (`components/TheoMain.tsx`) | **prop interface unchanged** (`TheoMainProps`); local `renderAssistant(content: string, streaming = false)` gains an additive `part.kind === "check"` branch + forwards `streaming` | DOTTIE_DESIGN_SYSTEM §9 | unchanged (same `t`/`mode` props) |
| `ChatView` `renderAssistant` prop (`components/ChatView.tsx`) | prop type widened `(content: string) => ReactNode` → `(content: string, streaming?: boolean) => ReactNode`; direct call site passes `loading && i === messages.length - 1`; `CitedText renderText` path unchanged | DOTTIE_DESIGN_SYSTEM §9 | unchanged (same message/loading state) |
| `theme.ts` `C` (`theme.ts`) | exported token object — **adds** `inset` (`#10151C`) + `concur`/`caution`/`challenge`/`info` + `concurBg`/`cautionBg`/`challengeBg`/`infoBg`; **no key removed or renamed**; `SANS`/`MONO` unchanged | DOTTIE_DESIGN_SYSTEM §2.1 (inset) / §2.4 (verdicts + tints) | none — pure design tokens |

## §GAP — Gap Disclosure
**PROCEED.**
- **G-1 — Paired backend emit is pkg 2b (this FE is inert-until-emitted, not broken).** This package is the FE renderer only. It renders a `[[CHECK]]` block into the governance component; **nothing emits that block on live answers until pkg 2b** updates Dottie's system prompt (`dottie_message_stream`) to emit the structured block for substantive/adjudication answers. Until 2b lands, live answers carry no block and render Light (plain markdown) — the correct, non-regressing state (this realises the deferred pkg-1 §GAP G-1 renderer). R-COMPONENT ("no plain-prose substantive answers", §5) is fully satisfied only once 2b lands; the FE is the floor that makes the structure renderable. Disclosed.
- **G-2 — Transport mechanism is a chosen `[[CHECK]]` protocol.** The FE↔backend contract for the structured payload is a `[[CHECK]]{json}[[/CHECK]]` block mirroring the **deployed** `[[ARTIFACT]]` protocol in `lib/artifacts.ts` (same NUL-free, render-time-parsed, graceful-fallback idiom). The design system specifies the *anatomy*, not the transport; this is an implementation choice, byte-consistent with the existing codebase. `CheckData` (§CCT) is the schema pkg 2b must emit. Disclosed.
- **G-3 — Streaming + malformed-block behaviour (rev-2 corrected).** Three bounded, deliberate paths: (a) a **completed but unparseable** block (`[[CHECK]]…[[/CHECK]]` present, `parseCheck` returns `null`) falls back to `Formatted` — renders the raw body as markdown text, never blanks. (b) A **still-open** opener (no `[[/CHECK]]` yet) is suppressed **only while the turn is actively streaming** (`streaming` true) — the text before it renders and the component pops in when the closer arrives (no raw-JSON flash). (c) Once the content is **final** (`streaming` false — every committed message, and the streaming turn after completion), an unclosed opener renders as plain **text** — so a truncated/never-closed block (or one that opens the turn) is **shown, never permanently hidden**. This corrects the rev-1 unconditional suppression Codex flagged (T13). Disclosed.
- **G-4 — Token additions.** `theme.ts` `C` gains `inset` + 8 verdict keys (the tokens pkg-1 §GAP G-1 deferred to "added with pkg 2"). Additive only; no pkg-1 value changed. Disclosed §CCT.
- **G-5 — Deploy + eyeball.** Lands on `development` → dev SWA `brave-dune-0a97c7d0`; Walter eyeballs (note: no visible change on live answers until pkg 2b — the published preview is the target). Disclosed.

## §DELTA — changed files (before → after evidence)
All 6 files are git-diffable base→proposed (GCR rows 6–11; blob SHAs listed). theme.ts + GovernanceCheck.tsx are the rev-1 blobs (committed at `75e293e`, unchanged in rev 2); artifacts.ts / check.ts / TheoMain.tsx / ChatView.tsx carry the rev-2 change.
- `theme.ts` — `C` **+** `inset:"#10151C"`, `concur:"#5FBE90"`, `caution:"#E4AC4E"`, `challenge:"#E0776C"`, `info:"#6EA8FE"`, `concurBg/cautionBg/challengeBg/infoBg` tints. No existing key touched.
- `lib/artifacts.ts` — `AssistantPart.kind` gains `"check"`; `splitAssistant(content, streaming = false)` maps artifact-sentinel parts as before but routes text parts through new `splitChecks(segment, streaming)` (regex `\[\[CHECK\]\]\s*([\s\S]*?)\s*\[\[\/CHECK\]\]`), which interleaves `text`/`check` parts; a trailing unclosed opener is suppressed **only when `streaming`** (`const open = streaming ? tail.indexOf("[[CHECK]]") : -1`), else the tail renders as text — never permanently hidden.
- `lib/check.ts` — NEW: the `CheckData` type family + `parseCheck` (JSON.parse in try/catch; requires non-empty `lead`; normalises verdict to the 3 values or `null`; coerces claim/support/confidence/flags/docs to safe defaults; returns `null` on any untrusted shape). Rev-2: header comment corrected to state the accurate fallback boundary.
- `components/GovernanceCheck.tsx` — NEW: the §3 anatomy, inline-style/token idiom, `MONO` provenance, verdict-keyed callouts, confidence meter (`tabular-nums`), dashed docs chips.
- `components/TheoMain.tsx` — `renderAssistant(content, streaming = false)` gains `if (part.kind === "check") { const data = parseCheck(part.value); return data ? <GovernanceCheck …/> : <Formatted …/> }` and forwards `streaming` to `splitAssistant`.
- `components/ChatView.tsx` — `renderAssistant` prop type widened to `(content: string, streaming?: boolean) => ReactNode`; the direct (non-cited) call site passes `loading && i === messages.length - 1`. No other change.

## §CODEX — activation (Walter forwards)

```
Codex is activated for Pass-2 FRONTEND review of the Dottie governance component / adaptive renderer,
vault-dottie, "Codex Governance/Dottie-FE-Governance-Component-Pass-1-VEP/Dottie_FE_Governance_Component_VEP.md"
@ commit <HEAD>. Open your Pass-2 with a governance-bound GCR + Rule Anchor Table; hard-gate; emit only APPROVED
or REJECTED. This is FE pkg 2 of #4: it builds the governance component (spec/DOTTIE_DESIGN_SYSTEM §3 "the core")
and the adaptive renderer (§9 R-RENDERER) — an AUTHORIZED build that realises the visual authority; it does NOT
redesign it. Review: (1) FE-only — no backend/route/schema/migration; the renderer parses a [[CHECK]]…[[/CHECK]]
block (mirroring the deployed [[ARTIFACT]] protocol in lib/artifacts.ts) and draws GovernanceCheck. Degradation
(rev 2 — the fix for your T13 REJECT of 75e293e): a COMPLETED-but-unparseable block falls back to plain markdown;
a still-open opener is suppressed ONLY while actively streaming (streaming flag threaded ChatView -> renderAssistant
-> splitAssistant -> splitChecks); once FINAL an unclosed/never-closed opener renders as plain TEXT — shown, never
permanently hidden. (2) Intensity is implicit in the
payload per §4/R-INTENSITY: present verdict → Grounded+verdict (badge + claim-under-review); verdict null →
Grounded (My read tag); NO block → Light (plain markdown, existing path). (3) §2.4 — verdict colours are separate
C keys, never the gold accent; gold only on provenance eyebrows + the neutral direct-position callout. §2.5 — all
provenance renders MONO. (4) the anatomy matches §3 top-to-bottom (byline · claim · lead · Authority/What-it-
says/How-it-applies · conclusion callout · flags · confidence meter · docs-expected). (5) the PAIRED BACKEND EMIT
is pkg 2b (§GAP G-1) — this FE is inert-until-emitted, not broken; live answers render Light until 2b lands. (6)
theme.ts adds inset + 8 verdict tokens additively (the deferred pkg-1 §GAP G-1 tokens); no pkg-1 value changed
(§GAP G-4). (7) renderAssistant is the single render seam (used directly + as CitedText renderText, ChatView:660)
so the check branch covers cited + non-cited. tsc -p tsconfig.app.json exit 0 + npm run build clean (§F-P6).
DottieSpiral (logo) + pkg-1 palette unchanged. Mechanical lint PASS. Emit APPROVED or REJECTED only.
```
