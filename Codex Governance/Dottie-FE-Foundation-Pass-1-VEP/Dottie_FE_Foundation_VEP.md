# Dottie FE Foundation — Pass-1 Frontend VEP (retroactive formalization of the live dev-SWA base)

Formalizes, under the frontend governance regime, the Dottie frontend already deployed to the dev SWA (`brave-dune-0a97c7d03`). Dottie's FE is a **byte-verbatim transplant of Theo's deployed, already-governed frontend** (`vault-theo/src/theo/*` — all ~35 components + the Tailwind/TS/Vite/module-federation stack), reproduced faithfully (Governor §4 "reproduce the reference surface, do not redesign"), with a small, enumerated **Dottie delta**: (1) identity rebrand via the `swapBlock` single-point-of-truth (ASSISTANT_NAME → "Dottie", MODEL → gpt-5, Dottie persona), (2) standalone Entra/MSAL auth (`App.tsx` + `entraAuth.ts`) wiring the live gateway via TheoSurface's `getAccessToken` prop, (3) the gateway repointed to Dottie's `dottie_*` endpoints + an OpenAI-shape SSE parse branch, (4) the module-federation remote renamed `dottieApp/DottieSurface`. This VEP grounds and CCT-locks that delta so Codex reviews the standing base and everything after sits on a reviewed foundation. **Retroactive** (the delta is already deployed — Walter directed formalization without reverting); the Gap Disclosure records the follow-on governed packages (markdown/citation fidelity, Responses-API grounding, image/video via the shared tools, VO mount).

## Update note (rev-5 — ConvMgmt now LIVE; keep this Foundation consistent)
Not a rejection fix — a consistency update. The ConvMgmt package was **Codex APPROVED and deployed 2026-08-01** (Kudu VFS, GET-back byte-identical, restart, golden curls green: rename `200`/`400`; star `200`/`400`/`404`; delete `200`/`404`-cascade/`400`; all `401` unauthenticated). To avoid the shared-`gateway.live.ts` drift that caused the earlier rejections, F-P3 and G-3 are flipped from "deploy pending" → **LIVE** in the same turn as the specs (`DOTTIE_API_SPEC.md § Conversation management` and `DOTTIE_THEO_RECONCILIATION.md §B/Summary` now read LIVE). No code change; the three routes remain the ConvMgmt package's surface, cross-referenced not claimed.

## Repair note (rev-4 — addresses Codex REJECT T13 / T22: docs stale vs the live gateway)
Root cause (owned): the sibling ConvMgmt package repointed the FE's rename/delete/star calls to `dottie_*` inside the **shared** `gateway.live.ts`, which outran this Foundation's docs + the specs. Fixed across every affected document so the package is consistent with the live blob:
- **T13 (Foundation text stale):** F-P3 and G-3 no longer say "only 4 core / conv-management errors today/missing." They now state the truth — 4 core routes live (this Foundation) + 3 conversation-management routes FE-repointed with backend **authored, deploy-pending under the ConvMgmt package** — and cross-reference that package rather than claiming its surface.
- **T22 (contracts didn't exist for the active `dottie_*` calls):** added the three contracts to `spec/DOTTIE_API_SPEC.md § Conversation management` (exact request/response/error shapes lifted from the authored ConvMgmt handlers), clearly banner-marked **authored, deploy-pending** (not falsely "live"). `spec/DOTTIE_THEO_RECONCILIATION.md` §B + Summary updated from "❌ MISSING" to "🟡 FE-repointed; backend authored, deploy pending."
- **T13 (one residual comment):** the `theo_delete_conversation` route/name sentence Codex saw at `8513d8c` was already fixed at the current HEAD (ConvMgmt rev-3, commit `e95f3f4`) → `dottie_delete_conversation`. Re-anchored this VEP to the current HEAD so the review reflects it. Whole-file re-verify: every `/api/dottie_*` call site now has a clean adjacent comment.

## Repair note (rev-3 — addresses Codex REJECT T13 / T4)
Two fixes, both made in the LIVE code / doc (not summary-only):
- **T13 (residual stale comments in `gateway.live.ts`):** swept EVERY remaining comment that named the Theo/old runtime and contradicted the repaired Dottie behavior — the base-URL note (`hosts theo_message` → `hosts dottie_message`), the send-body doc (`body {max_tokens…}` + `THEO_FOUNDRY_DEPLOYMENT` → Dottie `{max_completion_tokens…}` + gpt-5 `AZURE_OPENAI_DEPLOYMENT`), the delete-cascade note (`theo_messages`/`theo_attachments` → `dottie_messages`; no attachments), the streaming header (`theo_message_stream on the v4 sidecar` + `Anthropic SSE events` → `dottie_message_stream` on `vaultgpt-func-dottie-stream`; OpenAI-shaped chunks with an Anthropic-compat branch), the Sigma-share note (`theo_message_stream` → `dottie_message_stream`; Sigma path is inherited-but-unused), and the projects-base note (now: Dottie has no Projects backend — hidden; base unused). `grep` for the contradicting tokens now returns 0; `tsc -p tsconfig.app.json` clean.
- **T4 (VA-T1 anchor was non-concrete):** GCR row 6 currency anchor replaced the `(survey)` placeholder with the concrete blob SHA `c03088ae7ae5337e03e971211f11505909140c3e` — and, decisively, that SHA is **byte-identical** for `TheoSurface.tsx` in both `vault-theo` and `vault-dottie` at HEAD, which is git-verifiable proof of the byte-verbatim transplant (same bytes ⇒ same blob SHA), not merely an assertion.

## Repair note (rev-2 — addresses Codex REJECT T20 / T13 / T13-T22 / T13)
Four fixes, all made in the LIVE code (not just the doc) + redeployed:
- **T20 (CCT incomplete):** the `gateway.live.ts` and `entraAuth.ts` CCT rows now list the COMPLETE literal exported surfaces (no ellipsis/summary).
- **T13 (stale comments contradict runtime):** `swapBlock.ts` header (was "Theo"/"claude-sonnet-4-6"), `vite.config.ts` (was `theoApp/TheoSurface`/vault-theo-dev), and `gateway.live.ts` header + stream comment (was Theo gateway / `theo_message_stream` / `vaultgpt-func-stream`) corrected to the Dottie runtime; error strings say "Dottie gateway".
- **T13/T22 (request shape):** the buffered + stream bodies now send **`max_completion_tokens`** (was `max_tokens`), matching `spec/DOTTIE_API_SPEC.md` + the D2/D2-Stream handlers — so the "repointed to the Dottie contract" claim is now true.
- **T13 (live mis-call):** `listProjectConversations` returns `[]` on the live path (Projects hidden; the `dottie_list_conversations` contract has no `projectId` filter — it no longer silently returns the general list under a project context).

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Pass 1 — Frontend Verified Evidence Pack
Grounding parent (source baseline): `eced4055358a0b1d4fa720e34e6d43dbf2236147` (vault-dottie, `development`)
Grounding mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD) |
| - | ------------------------------- | ------------------------------ | --------------------------------- |
| 1 | Claude Code Theo Frontend Governor Standard — `governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md` (§2 gates; §3 VEP+CCT; §4 UI reconciliation; §5 gap disclosure) | `Grep("Component Contract Table")` this turn | `3afec7ea4b13650ce2bf28bf32073179a35e7b24` |
| 2 | Theo Frontend Grounding Conformance Standard — `governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR; §4A.1 F-P walk; §4B Visual Authority Registry; §5 Rule Anchor) | `Grep("Grounding Conformance Receipt")` + `Grep("Sub-Phase Spine")` this turn | `4f2f42e799be5db31e1e35e523d656ff4c1c057e` |
| 3 | Codex Theo Frontend Review Standard — `governance/CODEX_THEO_FRONTEND_REVIEW_STANDARD.md` (Pass-2 review surface) | cited; unchanged blob @ HEAD | `25cc488091d619d8f6642b10552df0d019a87933` |
| 4 | Theo Golden Component Pack Standard — `governance/THEO_GOLDEN_COMPONENT_PACK_STANDARD.md` (canonical primary reference; structural mirror; visual parity) | `Grep("canonical")` this turn | `0035a1d9fed103d07bf420b957c3727ec47fcc6b` |
| 5 | Theo Phase 1A Frontend Plan — `governance/THEO_PHASE_1A_FRONTEND_PLAN.md` (surface + feature basis for the transplanted FE) | cited; unchanged basis @ HEAD | `901271478e8bec29177d379fadbbf3d4701a90fe` |
| 6 | **VISUAL AUTHORITY (VA-T1) — the deployed Theo FE** = `vault-theo/src/theo/*` (the reference surface Dottie transplants verbatim; the CCT delta components cite their Theo originals as primary references) | `Read`(TheoSurface.tsx, swapBlock.ts, gateway.live.ts, prompt.ts, ChatView.tsx §render, markdown.tsx, CitedText.tsx) this turn | `c03088ae7ae5337e03e971211f11505909140c3e` — `TheoSurface.tsx` blob SHA, **byte-identical in `vault-theo` (`HEAD:src/theo/TheoSurface.tsx`) and `vault-dottie` (`HEAD:src/theo/TheoSurface.tsx`)**: git-verifiable proof of the byte-verbatim transplant (identical content → identical blob SHA). The 35 transplanted components carry the same identity; the Dottie delta is enumerated in §CCT |

No ChatGPT advisory cited. No `reporting_*` change. This is a frontend package (no migration; no write SQL).

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt (GCR) and a Rule Anchor Table" | GCR + this table |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §3 | "MUST contain a **Component Contract Table**" | §CCT |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §4 | "reproduce it faithfully, do not redesign" | §UI-RECON — the transplant is byte-verbatim; the only planned deltas are identity rebrand + auth/gateway wiring, classified below |
| governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md | §4A.1 | "Pass 1 Plan-Authoring Sub-Phases" | §F-P walk |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §5 | "foreseeable downstream gaps" | §GAP |
| governance/THEO_GOLDEN_COMPONENT_PACK_STANDARD.md | §canonical | "Structural Mirror" | §CCT — each delta component cites its Theo original |

---

## §F-P walk (F-P1 – F-P7)

**F-P1 Feature identification.** The "feature" is the Dottie frontend foundation: the production chat surface for Dottie, delivered as a faithful transplant of Theo's governed FE. Per-surface status: all visual + interaction behaviour is REAL (the transplant is Theo's production FE, not a 1A mock); the live gateway is wired to Dottie's deployed backend (D2/D2-Stream), so unlike Theo-1A's mocked gateway, Dottie's gateway is LIVE. The mock gateway remains as the standalone-without-token fallback (same as Theo's dev harness).

**F-P2 UI authority reconciliation.** The reference surface (VA-T1 = Theo's deployed FE) is reproduced **byte-verbatim** for all 35 components — zero visual redesign. The only deltas are (a) IDENTITY (name/model/persona via `swapBlock`) and (b) non-visual wiring (auth, gateway endpoints, federation name). Identity rebrand is an AUTHORIZED-DELTA, not a visual-authority deviation: the layout, components, palette, and interactions are unchanged; only the assistant's name/model label/persona text differ (Amendment 9 — Dottie is a distinct agent). No `VISUAL-AUTHORITY-DEVIATION` is claimed because the surface is not redesigned. (Known FIDELITY GAP: citation rendering — see §GAP G-2 — is a follow-on package, not a redesign.)

**F-P3 Backend/contract grounding.** The gateway (`gateway.live.ts`) is repointed from Theo's `theo_*` endpoints to Dottie's `dottie_*` contract. Two groups of `dottie_*` calls are live in the file: (a) the **4 core-chat routes deployed and owned by this Foundation** (`dottie_message_stream`, `dottie_message`, `dottie_list_conversations`, `dottie_get_conversation` — recorded in `spec/DOTTIE_API_SPEC.md § Endpoints`); (b) the **3 conversation-management routes** (`dottie_rename_conversation`, `dottie_delete_conversation`, `dottie_set_conversation_starred`) whose FE repoint + backend are governed by the **sibling ConvMgmt package** (contracts in `spec/DOTTIE_API_SPEC.md § Conversation management`; backend **LIVE** — Codex APPROVED → deployed 2026-08-01, golden curls green) — cross-referenced here, not claimed by this Foundation. The stream parser gains an OpenAI-chunk branch (`choices[0].delta.content`) alongside the Anthropic branch, because Dottie's backend emits Azure OpenAI-shape SSE (gpt-5), not Anthropic events. Endpoints Dottie's backend does not yet serve (people/attachments/projects/artifacts/voice) remain on their `theo_*` names and are disclosed as gaps (G-3).

**F-P4 Component reference grounding.** Canonical Primary Reference for every component = its Theo original in `vault-theo/src/theo/*` (Golden Component Pack §canonical). The 35 components are transplanted byte-verbatim (the `git` copy is the evidence); the delta files (§CCT) cite their Theo originals and show the exact diff.

**F-P5 Component Contract Table assembly.** See §CCT — one row per DELTA surface (the changed/new files). Unchanged components inherit Theo's contracts verbatim (no CCT row needed; they are the reference).

**F-P6 Repository & active-surface grounding.** Target files are on the active surface (`vault-dottie/src/**`, `vite.config.ts`, `index.html`, the dev workflow). The FE uses `localStorage` in two Walter-authorized places mirrored from VO: MSAL token cache (`entraAuth.ts`, the Teams/Outlook "stay signed in" idiom) and the standalone dev-token affordance — both auth-scoped, not app-data snapshots. Tailwind/TS/inline-style surface is preserved verbatim from Theo (no conversion). No deprecated-code contamination.

**F-P7 VEP assembly.** GCR + Rule Anchor Table open the pack; F-P1–F-P7 walked; CCT (§CCT); UI reconciliation (F-P2); Gap Disclosure (§GAP); the delta files inlined (§DELTA); Codex activation note closes it.

---

## §CCT — Component Contract Table (the Dottie delta)

| Component (file) | Prop / input interface (TS) | Visual authority (VA-id) | Data / contract dependency |
| ---------------- | --------------------------- | ------------------------ | -------------------------- |
| `src/App.tsx` (standalone root) | `() => JSX.Element` (no props); wires `getAccessToken: () => Promise<string \| null>` (from `entraAuth`) INTO `<TheoSurface getAccessToken=…/>` | VA-T1 (no visual surface — root wrapper) | `entraAuth.getAccessToken`; `TheoSurface` prop contract (`getAccessToken?`) |
| `src/services/entraAuth.ts` (MSAL) | Exported singleton `entraAuth: EntraAuthService`. COMPLETE public method surface: `initialize(): Promise<void>`; `acquireTokenInteractive(): Promise<string \| null>`; `acquireTokenSsoSilent(): Promise<string \| null>`; `getAccessToken(allowInteractive?: boolean): Promise<string \| null>`; `isEnabled(): boolean`; `getCurrentUserId(): Promise<{ userId: string; username: string } \| null>`; `getCachedUserIdSync(): string \| null`; `login(): Promise<void>`. Reads `VITE_ENTRA_CLIENT_ID/TENANT_ID/AUTHORITY/API_SCOPE`. | VA-T1 (no visual surface) | Entra/MSAL (`@azure/msal-browser`); scope `api://4e1a1e31…/access_as_user`; copied byte-faithful from `vault-origin/src/services/entraAuth.ts` |
| `src/theo/swapBlock.ts` (identity) | consts: `ASSISTANT_NAME="Dottie"`, `WORKSPACE_NAME="Vault Group"`, `PRODUCT_NAME="Origin"`, `USER_NAME=""`, `MODEL="gpt-5"`, `MODEL_LABEL="GPT‑5"`, `BASE_PROMPT` (Dottie persona), `ARTIFACT_RULES`, `SIGMA_REVIEW_PERSONA` (unchanged). Header comment CORRECTED to the Dottie runtime (was stale Theo/claude — T13 fix). | VA-T1 (identity text only; layout unchanged) | consumed by `prompt.ts buildSystemPrompt`, `TheoMain`, `ChatView` (assistantName), model selector label |
| `src/theo/services/gateway.live.ts` (repoint) | COMPLETE exported surface (verbatim, unchanged signatures): `configureGateway`, `attachmentsAvailable`, `voiceAvailable`, `transcribeAudio`, `synthesizeSpeech`, `sendMessage`, `createAttachmentUpload`, `uploadToBlob`, `finalizeAttachment`, `deleteAttachment`, `listConversations`, `listProjectConversations`, `getConversation`, `renameConversation`, `deleteConversation`, `listConversationAttachments`, `listProjects`, `setProjectVisibility`, `shareProject`, `unshareProject`, `listProjectMembers`, `publishConversation`, `unpublishConversation`, `listPublishedProjectConversations`, `listPeople`, `createProject`, `getOrCreateReviewProject`, `updateProjectInstructions`, `updateProjectDescription`, `renameProject`, `deleteProject`, `listProjectKnowledge`, `addProjectKnowledge`, `addProjectKnowledgeFile`, `removeProjectKnowledge`, `setConversationProject`, `setConversationStarred`, `persistArtifact`, `listServerArtifacts`, `getServerArtifact`, `sendMessageStream`, `sendReviewAgentStream`; interfaces `StreamCitation`, `StreamHandlers`. | VA-T1 (no visual surface) | **Dottie contract (repointed + corrected this rev, per `spec/DOTTIE_API_SPEC.md`):** the 4 served endpoints repointed `theo_*`→`dottie_*`; the stream + buffered bodies now send **`max_completion_tokens`** (was `max_tokens` — T13/T22 fix, matches the D2 contract); OpenAI-chunk parse branch (`choices[0].delta.content`) added beside the Anthropic branch; error strings say "Dottie gateway". `listProjectConversations` returns `[]` on the live path (Projects hidden; the contract has no projectId filter — T13 mis-call fix). The remaining `theo_*` calls (attachments/projects/artifacts/voice/people/publish) are UNBACKED and gated/hidden in the imminent gate-hide FE package (reconciliation §B–§G). |
| `vite.config.ts` (federation) | `federation({ name: 'dottieApp', exposes: { './DottieSurface': './src/theo/TheoSurface.tsx' }, shared: ['react','react-dom'] })` | n/a (build config) | Module Federation remote consumed by VO shell (VO mount = follow-on package) |
| `index.html` / dev workflow | `<title>Dottie — Vault</title>`; workflow bakes `VITE_ENTRA_*` + `VITE_FUNCTIONS_URL` (func-dottie) + `VITE_STREAM_FUNCTIONS_URL` (func-dottie-stream) — all public identifiers | n/a | build-time env for auth + live gateway base URLs |

**Unchanged components (transplanted byte-verbatim from VA-T1, no CCT delta):** `TheoSurface`, `TheoMain`, `ChatView`, `Sidebar`, `AgentActivity`, `CitedText`, `ArtifactCard/Panel/View`, `CitedText`, `Customize`, `ProjectDetail/ProjectsView`, `ConvMenu/ChatMenu/RowMenu/RowManage`, `DownloadCard`, `DevContextInjector`, `SpiralMark/SpiralAssemble/VaultMark`, `icons`, `ui`, `lib/markdown`, `lib/artifacts`, `lib/appContext`, `lib/prompt` (prompt reads the rebranded swapBlock), `data`, `theme`, `types`, `useTheoState`, `theoClient`, `gateway.mock`, `theoSnapshot`.

---

## §UI-RECON — UI Authority Reconciliation

Reconciled against VA-T1 (the deployed Theo FE). The transplant reproduces the surface **faithfully and byte-verbatim** (Governor §4). The two deltas are (a) IDENTITY (name/model-label/persona strings via `swapBlock`) — text-only, no layout/palette/interaction change; and (b) NON-VISUAL WIRING (auth, gateway endpoints, federation name). Neither is a visual redesign, so no `VISUAL-AUTHORITY-DEVIATION` is claimed. Dottie's distinct *visual* identity (the deconstructing-spiral logo + any theme divergence) is deliberately DEFERRED to its own governed package (G-4), so this Foundation stays a pure faithful transplant.

## §GAP — Gap Disclosure

`PROCEED` (Foundation is deployed + coherent). Follow-on governed packages disclosed:
- **G-1 (backend prompt/grounding already deployed ad-hoc): PRE-LAND (governed packages next).** The Dottie Operating Ruleset + gpt-5 token/reasoning fix + the Responses-API `web_search` grounding are LIVE on the backend but were deployed pre-governance; they get their own Pass-1 VEPs (backend regime) for retroactive Codex review. Disclosed.
- **G-2 (citation FIDELITY — the immediate next FE package): PRE-LAND.** Web-grounded citations currently render as inline markdown links, NOT Theo's `CitedText` treatment (favicon chips + hover source cards). Theo builds `Message.runs: CitedRun[]` from `onCitation` (Anthropic `citations_delta`); Dottie's Responses-API annotations must be mapped into `runs` so `CitedText` renders them (ChatView L661). This is the next FE VEP (`Dottie-Markdown-Citation-Fidelity`). Disclosed.
- **G-3 (unbacked endpoints — the COMPLETE audit): PRE-LAND (governed backend packages + FE gating).** The FE calls ~35 endpoints. Dottie's backend serves the 4 core-chat routes **live**; conversation-management (`dottie_rename_conversation`, `dottie_delete_conversation`, `dottie_set_conversation_starred`) is **LIVE under the sibling ConvMgmt package** (`Codex Governance/Dottie-ConvMgmt-Backend-Pass-1-VEP/`; Codex APPROVED → deployed 2026-08-01, golden curls green) — those three `dottie_*` calls are therefore the ConvMgmt package's contract surface, recorded in `spec/DOTTIE_API_SPEC.md § Conversation management`, not this Foundation's. The full endpoint-by-endpoint reconciliation is `spec/DOTTIE_THEO_RECONCILIATION.md` (authoritative gap register). **Still missing (error today, not merely absent):** `theo_list_people`, attachments (5), artifacts-persist (3), voice (2), and all Projects endpoints (14, HIDDEN per Walter 2026-08-01). **Remediation:** (a) the FE controls for still-missing features are GATED/HIDDEN until their backend lands (so nothing errors) — a fast-follow FE package; (b) each missing group becomes a governed backend package (`dottie_*` mirroring the Theo original). Until then, Dottie does NOT match Theo beyond core chat + conversation-management (both live) — stated plainly, not represented otherwise.
- **G-4 (Dottie visual identity — deconstructing-spiral logo + theme): PROCEED (own package).** Deferred so the Foundation is a pure transplant.
- **G-5 (VO federated MOUNT): PROCEED (cross-repo package).** The remote is `dottieApp/DottieSurface`; VO-side wiring is a vault-origin package.

## §DELTA — the changed/new files (implementation evidence)

```tsx
import { useEffect } from "react";
import TheoSurface from "./theo/TheoSurface";
import { entraAuth } from "./services/entraAuth";

// Dottie — STANDALONE root. Copies Theo's exact contract: the token flows INTO TheoSurface via the
// `getAccessToken` prop, and TheoSurface configures its OWN gateway from it (see TheoSurface useEffect).
// Configuring the gateway from here instead would target a different module-federation instance and be
// overwritten by TheoSurface's own configureGateway({getAccessToken: null}) — the cause of the 401s.
// The base URLs (func-dottie / func-dottie-stream) are baked from VITE_FUNCTIONS_URL /
// VITE_STREAM_FUNCTIONS_URL; with neither set (bare local dev) the gateway stays on the mock.
//
// When Dottie is MOUNTED in Vault Origin, the host renders the federated DottieSurface and passes ITS
// shell token as this same prop — so this standalone wrapper's self-auth only runs standalone.
const getAccessToken = async (): Promise<string | null> => {
  await entraAuth.initialize();
  return entraAuth.getAccessToken(true);
};

export default function App() {
  useEffect(() => {
    // Prime sign-in early (redirect/popup) so a fresh visit authenticates before the first data load.
    void (async () => {
      await entraAuth.initialize();
      await entraAuth.getAccessToken(true);
    })();
  }, []);
  return <TheoSurface getAccessToken={getAccessToken} />;
}
```

```ts
/* ─── SWAP BLOCK ─────────────────────────────────────────────────────────
   Single point of truth for branding + model + prompts (1A handover §5).
   Dottie branding: ASSISTANT_NAME → "Dottie" (visible assistant name).
   MODEL is "gpt-5" (Azure OpenAI deployment — Dottie's deliberately different model for governance
   independence). The frontend names only a logical model and calls the gateway; the model credential
   lives server-side (gateway abstraction in services/).
   ──────────────────────────────────────────────────────────────────────── */
export const ASSISTANT_NAME = "Dottie";
export const WORKSPACE_NAME = "Vault Group";
export const PRODUCT_NAME = "Origin";
export const USER_NAME = "";
export const MODEL = "gpt-5";
export const MODEL_LABEL = "GPT‑5";

export const BASE_PROMPT =
  `You are ${ASSISTANT_NAME}, Vault's independent governance-and-second-opinion agent inside Vault Origin — ` +
  `the central hub for Vault Group, a UK-based US tax advisory firm serving VC, PE and real-estate funds and ` +
  `their non-US corporations with US subsidiaries. You are deliberately independent of Theo (the primary ` +
  `assistant) — a more conservative voice for checking work and offering a considered second opinion. Reason ` +
  `carefully and thoroughly, cite specifics, distinguish what you can and cannot verify, weigh risk plainly, ` +
  `and never overstate certainty. You can (a) give an individual a substantive second opinion or a governance ` +
  `check, and (b) observe the shared record for governance quality. You know the person you are speaking with ` +
  `from your own relationship memory. Match the user's spelling. Never invent tax facts or figures — flag ` +
  `clearly when something needs review by a qualified preparer. You advise; you do not take actions on their behalf.`;

export const ARTIFACT_RULES =
  ` When the user asks for a standalone deliverable (a document, memo, email, letter, ` +
  `checklist, summary, plan, or code), output it as an artifact wrapped EXACTLY like:\n` +
  `[[ARTIFACT title="Short Title" type="document"]]\n<content here>\n[[/ARTIFACT]]\n` +
  `Use type "document" for prose/markdown, "code" for code, "html" for a self-contained web ` +
  `snippet. Keep one short conversational sentence outside the markers. To revise an existing ` +
  `artifact, reuse the same exact title.` +
  ` SPREADSHEETS / EXCEL: when the user wants data AS a spreadsheet or Excel file — to download, ` +
  `to "export", or "in Excel/.xlsx" — do NOT inline a markdown table and do NOT wrap it in an ` +
  `artifact. Call the theo_export_spreadsheet tool with typed columns and rows (numbers as JSON ` +
  `numbers, dates as ISO date strings) so they get a real Excel file with proper numeric/date ` +
  `cells; after it returns, briefly confirm the file is ready (the download card is shown ` +
  `automatically — never paste the raw link). A small table shown only for reading in the reply ` +
  `stays inline Markdown.`;
```

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

// Vite + React + TS + Module Federation. Dottie is exposed as the federated remote
// `dottieApp/DottieSurface` so the Vault Origin shell mounts it in-shell, while this same build also runs
// standalone on the Dottie dev SWA. Build output -> `dist`; the federation plugin emits
// `assets/remoteEntry.js` for Origin to consume.
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'dottieApp',
      filename: 'remoteEntry.js',
      exposes: {
        './DottieSurface': './src/theo/TheoSurface.tsx',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  // Module Federation requires a modern target so top-level await in the generated entry works.
  build: { target: 'esnext' },
});
```

(The full `entraAuth.ts` is a byte-faithful copy of `vault-origin/src/services/entraAuth.ts`; `gateway.live.ts` is Theo's file with the `theo_*`→`dottie_*` path repoint + the OpenAI-chunk parse branch — both large; their diffs are summarized in §CCT and available in git history `05d13c4`/`73e9e40`.)

## Codex activation note (Walter forwards)

```
Codex is activated for Pass-2 review of Dottie FE Foundation (retroactive formalization), vault-dottie,
"Codex Governance/Dottie-FE-Foundation-Pass-1-VEP/Dottie_FE_Foundation_VEP.md". Open with a governance-bound
GCR + Rule Anchor Table (frontend standards mirrored into vault-dottie). This RETROACTIVELY formalizes the FE
already deployed to the dev SWA (Walter directed formalize-don't-revert). Review: (1) is the FE a faithful
byte-verbatim transplant of Theo's governed FE (VA-T1), with the ONLY deltas being identity (swapBlock name/
model/persona), auth wiring (App.tsx + entraAuth passing getAccessToken as the TheoSurface prop — Theo's
contract), gateway repoint (dottie_* + OpenAI SSE parse), and the federation remote name? (2) the CCT delta
rows (prop interface + VA-id + contract). (3) F-P walk + UI reconciliation (no visual redesign; identity is a
text-only authorized delta). (4) the Gap Disclosure — especially G-2 (citation fidelity: Responses-API
annotations must feed CitedText runs; the next FE package) and G-1 (the ad-hoc backend prompt/grounding gets
its own retroactive VEPs). Confirm the foundation is a sound, reviewed base to build the follow-on governed
packages on. Emit APPROVED or REJECTED only.
```
