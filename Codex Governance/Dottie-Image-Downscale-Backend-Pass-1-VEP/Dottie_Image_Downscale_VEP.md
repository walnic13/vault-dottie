# Dottie Attachment Image Downscale — Pass-1 VEP (fit the model's per-image limit in dottie_message_stream)

Paired with the Codex-APPROVED + DEPLOYED Theo image-downscale fix (`Theo-Backend-Image-Downscale-Pass-1-VEP`). Applies the **same guard** to Dottie's attachment injection: `dottie_message_stream`'s `buildAttachmentParts` injects a native image as a full `input_image` data URI, capped only by a 14MB byte budget — so a 7–8MB phone photo passes the budget and is sent full-size to gpt-5, risking an upstream failure ("couldn't reach the assistant"), the same class of bug Walter hit on Theo. **Fix (one file):** downscale a large image (long edge > `IMAGE_MAX_EDGE` 1568px, or bytes > ~3.75MB) + re-encode before building the data URI; small images inject unchanged; the budget now counts the **post-resize** bytes. Uses `jimp` (pure-JS, **lazy-required**, **pinned `jimp@0.22.12`** — v1.x renamed the API). Text-extract path + native-PDF `input_file` path untouched; resize failure degrades to a note (never throws).

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Verified Evidence Pack (backend handler modification; no migration; no schema)
Grounding parent (source baseline): `87cd5cd32bd165c2b98f0f1f65b23d7cd1201202` (vault-dottie, `development`)
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD) |
| - | ------------------------------- | ------------------------------ | --------------------------------- |
| 1 | GOVERNING VISION — `governance/VAULT_MEMORY_ARCHITECTURE.md` (§A Amendment 9 — Dottie full agent on gpt-5) | `Read` this turn | `3afda098df614b11adc8a7cdcf28d0f9a3f47011` |
| 2 | Backend Governor — `governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md` (§3 Never-Guess; §4 Schema Reality Lock) | `Read`/`Grep("Never-Guess")` this turn | `e44cdd85d3d0e5df332dc754cdec731e2e68022e` |
| 3 | Grounding Conformance — `governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR; §5 Rule Anchor) | `Read` this turn | `7c0d902bdff3b6c0af475b483e31ed796214e57b` |
| 4 | Golden Handler — `governance/THEO_GOLDEN_HANDLER_STANDARD.md` (§4 EXACT mirror / allowed delta; §5.5 deploy) | `Read`/`Grep("EXACT mirror")` this turn | `f8f0e5ea36447502e35fb87b373c94e376f05cbb` |
| 5 | Execution Orchestration — `governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md` (§1D ordered pass; §1E deploy-after-Codex) | `Read` this turn | `565559b699c1309f8e750b0dbbac859c13d807c8` |
| 6 | **SIBLING FIX (Codex-APPROVED + DEPLOYED) — Theo image downscale** — `vault-theo/Codex Governance/Theo-Backend-Image-Downscale-Pass-1-VEP/proposed-app/src/functions/theo_message_stream.js` (`prepareImageForModel` + the image-branch guard this mirrors; jimp@0.22.12 pin) | `Read`(full) this turn | `9ca598785f8a65604badaa4ac6f3129ecf9ada49` |
| 7 | **MODIFIED HANDLER (proposed, committed at this package's HEAD) — `dottie_message_stream`** — `Codex Governance/Dottie-D2-Stream-Backend-Pass-1-VEP/proposed-app/src/functions/dottie_message_stream.js` | `Read`(full) + `Edit` this turn; `node --check` PASS | `f7c3086653513f27489d487393b3351be4c0748f` (base @HEAD before this package = deployed Pkg-3: `2c4edac55d36ba8b93913d738dbcd0911e1ff3b2`) |
| 8 | **DEPENDENCY MANIFEST (proposed, reviewed deploy artifact) — the sidecar `package.json` now declaring the PINNED `jimp: "0.22.12"`** (alongside `@azure/functions` + `pg`) — `Codex Governance/Dottie-D2-Stream-Backend-Pass-1-VEP/proposed-app/package.json`. The whole-app v4 `config-zip` deploy `npm install`s from THIS manifest, so the reviewed artifact carries jimp — no manual/unreviewed dep delta at deploy. | `Read` + `Edit` this turn | `4e8f54419b48170778ae8a65598c3e1254962c30` |

No ChatGPT advisory cited. No `reporting_*` / `theo_*` object touched. No migration; no schema; no write SQL by Claude.

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt" | GCR (head) |
| governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §3 | "Never-Guess" | §3 — jimp PINNED `@0.22.12`; the v0.x API is verified, not assumed |
| governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §4 | "Schema Reality Lock" | §2 — no schema/DB/contract change |
| governance/THEO_GOLDEN_HANDLER_STANDARD.md | §4 | "EXACT mirror" | §4 — only the image branch + the new helper/consts change; the fix mirrors the approved Theo package |
| governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md | §1D | "ordered, non-skippable" | §7 — Codex → v4 zip deploy (handler + jimp) → golden test with a real large image |

---

## §1 — Feature
`buildAttachmentParts` gains an image-downscale guard mirroring the approved Theo fix. A large image (long edge > `IMAGE_MAX_EDGE`, or bytes > `IMAGE_RESIZE_THRESHOLD_BYTES` ≈ 3.75MB) is resized (long edge → 1568px) + re-encoded (PNG kept when small, else JPEG q82) before the `input_image` data URI is built; small images inject unchanged. The per-message native budget is charged the **post-resize** bytes (a resized photo no longer over-counts against later attachments). PDF `input_file` and the extract-class `input_text` paths are unchanged.

## §2 — Architecture & boundary
**One file, additive.** Base `2c4edac5` (deployed Pkg-3) → proposed `f7c30866` (git-diffable). Additions: (a) two consts `IMAGE_MAX_EDGE` / `IMAGE_RESIZE_THRESHOLD_BYTES`; (b) `prepareImageForModel` (lazy `require("jimp")`, resize-when-oversized, returns `{data, mediaType}` or null); (c) the `native` branch computes `dataUri` + `injectBytes` per type (image → resized; PDF → as-is), then the SAME budget check + push. No endpoint / route / streaming / contract change; no DB/schema/migration; no `theo_*`/`reporting_*`. **Schema/Infra Reality Lock — SATISFIED** (no schema; the only infra is the `jimp@0.22.12` dep added at deploy). Fail-closed: resize failure → a note; the turn never throws.

## §3 — jimp pin + gpt-5 note (Never-Guess)
`jimp` is **PINNED `@0.22.12`** (v0.x) **in the reviewed `proposed-app/package.json`** (GCR row 8) — so the whole-app `config-zip` deploy `npm install`s exactly that version and the deploy artifact carries it (no manual/unreviewed dependency delta). A bare `npm install jimp` pulls v1.x, whose API differs (named import `const { Jimp } = require("jimp")`, `getBufferAsync`→`getBuffer`, moved `MIME_*`, changed resize signatures) — the helper uses the v0.x API, so an unpinned install would throw for every non-GIF image (the pdf-parse pin lesson). The v0.x pin was **verified** against the exact calls (`Jimp.read`, `Jimp.MIME_JPEG`/`MIME_PNG`, `scaleToFit(1568,1568)`, `quality(82)`, `getBufferAsync`) when the sibling Theo package deployed. gpt-5's per-image limit is higher than Claude's ~5MB, but a full 7–8MB photo still risks an upstream/payload failure; resizing to a 1568 long edge (typically <1MB) removes the risk and is well within gpt-5's vision handling (it tiles at 512px anyway). `data:` URI + `input_image` shape unchanged (only the bytes shrink; PNG→JPEG possible on re-encode).

## §4 — The change + Structural Mirror (Golden §4)
`node --check` PASS. Route/method/streaming envelope unchanged.

| Region | Classification | Notes |
| ------ | -------------- | ----- |
| everything but the image-downscale additions | **EXACT** | byte-identical to the deployed Pkg-3 base |
| consts `IMAGE_MAX_EDGE` / `IMAGE_RESIZE_THRESHOLD_BYTES` (same `parseInt` idiom as the sibling `ATTACH_*` consts) | **ALLOWED DELTA (additive)** | §1 |
| `prepareImageForModel` (lazy jimp@0.22.12; resize-when-oversized; JPEG/PNG; fail→null) | **EXACT MIRROR** of the approved Theo `prepareImageForModel` (GCR row 6) | §1/§3 |
| `native` branch: image → `prepareImageForModel` then data URI; PDF unchanged; budget on `injectBytes` (post-resize for images) | **ALLOWED DELTA (the fix)** | §1 — PDF/`input_file` + extract paths byte-stable |

No DEVIATION rows.

## §5 — Golden test (Golden §5.3; Claude runs post-deploy, via the live Dottie streaming path as `wmansfield@vault-tax.com`)
| # | Step | Expect |
| - | ---- | ------ |
| G1 | Upload a **real 7–8MB photo** + a Dottie turn "what's in this image?" | `200` stream; Dottie describes the image — **no "couldn't reach the assistant"** |
| G2 | Small image (<1MB, <1568px) | `200`; injected as-is (not re-encoded) |
| G3 | Large PNG screenshot | `200`; downscaled (PNG kept if small, else JPEG) |
| G4 | PDF (regression) | `200`; still `input_file`, unchanged |
| G5 | Text/Excel (regression) | `200`; extracted-text path unchanged |

## §6 — Gap Register
**PROCEED.**
- **(G-1) `jimp@0.22.12` on func-dottie-stream (new dep).** Pure-JS, no native binary; lazy-required; PINNED (v1.x API break). Added to the sidecar package at deploy. Disclosed, PROCEED.
- **(G-2) Budget on post-resize bytes.** Images now charge the injected (resized) size against the 14MB native budget — more accurate; PDFs unchanged. PROCEED.
- **(G-3) Theo/Dottie parity.** This is the paired fix to the approved Theo package (same helper, same behavior, gpt-5 data-URI shape). PROCEED.
- **(G-4) No schema/migration/keys/route/contract.** PROCEED.

## §7 — Deploy plan (ordered; §1D)
1. Codex Pass-2 → APPROVED/REJECTED.
2. Claude **v4 zip-deploys the sidecar** to `vaultgpt-func-dottie-stream` (whole-app `config-zip`, per the D2-Stream authority — NOT per-fn Kudu-VFS): stage `proposed-app` + `npm install --omit=dev` — which installs `@azure/functions` + `pg` + **`jimp@0.22.12`** straight from the reviewed `package.json` (GCR row 8), so no dependency is added by hand — then zip the whole app (incl. `node_modules`), `config-zip` deploy, restart.
3. Claude runs §5 golden tests via the live Dottie streaming path (incl. a real 7–8MB photo — not claimed fixed until green).

## Codex activation note (Walter forwards)

```
Codex is activated for Pass-2 review of the Dottie attachment image-downscale fix (paired with the APPROVED +
DEPLOYED Theo image-downscale), vault-dottie, "Codex Governance/Dottie-Image-Downscale-Backend-Pass-1-VEP/
Dottie_Image_Downscale_VEP.md". Open with a governance-bound GCR + Rule Anchor Table. BACKEND HANDLER
MODIFICATION — one file (dottie_message_stream.js), additive; NO migration/schema/contract change. Applies the
same guard as the approved Theo package to Dottie's buildAttachmentParts: a large native image (long edge >1568px
or >~3.75MB) is downscaled + re-encoded before the input_image data URI is built; small images unchanged; the
14MB native budget now charges post-resize bytes. Review: (1) prepareImageForModel is an EXACT MIRROR of the
approved Theo helper (GCR row 6), lazy-requiring jimp PINNED @0.22.12 (v0.x — v1.x renamed the API; verified
when Theo deployed). (2) only the image branch + helper/consts change; PDF input_file + extract-class input_text
paths byte-stable (base 2c4edac5 -> proposed f7c30866). (3) Schema Reality Lock: no schema/DB/contract change;
only infra is the jimp dep. (4) fail-closed: resize failure -> a note, never a thrown turn. (5) golden test uses a
REAL 7-8MB photo. node --check PASS. Deploy = v4 whole-app zip to func-dottie-stream (jimp@0.22.12 pinned in the
package). Emit APPROVED or REJECTED only.
```
