/* ─── SWAP BLOCK ─────────────────────────────────────────────────────────
   Single point of truth for branding + model + prompts (1A handover §5).
   Dottie branding: ASSISTANT_NAME → "Dottie" (visible assistant name).
   MODEL is "gpt-5" (Azure OpenAI deployment — Dottie's deliberately different model for governance
   independence). The frontend names only a logical model and calls the gateway; the model credential
   lives server-side (gateway abstraction in services/).
   ──────────────────────────────────────────────────────────────────────── */
export const ASSISTANT_NAME = "Dottie";

// ── Dottie capability gates ──────────────────────────────────────────────
// Which Dottie capabilities are live: the transplanted Theo features her backend serves yet, PLUS the
// Dottie-native governance-console sections (Overview, pkg 3b). The FE is a byte-verbatim Theo transplant,
// so every transplanted control is present; a feature stays `false` until its `dottie_*` backend lands
// (flip to `true` in the SAME governed package that ships that backend). Projects stays `false`
// indefinitely (Walter 2026-08-01: hidden for now). Single source of truth, consumed by data.ts (NAV
// filter), gateway.live.ts (attachments/voice predicates + short-circuits for unbacked list calls),
// and ConvMenu.tsx (Add-to-project item). Authoritative gap register: spec/DOTTIE_THEO_RECONCILIATION.md.
export const DOTTIE_CAPABILITIES = {
  overview: true,              // pkg 3b — the 9/10 Overview console (dottie_findings/flags read handlers LIVE, deployed 2026-08-04)
  projects: false,             // §B/§E — hidden indefinitely (no Projects/SPW backend)
  people: true,                // §C — dottie_list_people LIVE (ListPeople package; deployed + golden curls green 2026-08-01)
  attachments: true,           // §D — dottie attachments LIVE (4 handlers + dottie-content blob; deployed + golden-curl round-trip green 2026-08-01)
  artifactsPersistence: true,  // §F — dottie artifacts persistence LIVE (Artifacts packages; deployed + golden-curl round-trip green 2026-08-01)
  voice: false,                // §G — dottie voice (transcribe/synthesize) not built yet
} as const;

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
