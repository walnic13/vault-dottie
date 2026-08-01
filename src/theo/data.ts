// Seed data + static lists — ported verbatim from VA-T1 (L90–153).
import type { NavItem, Style, Project } from "./types";
import { IcChat, IcProjects, IcArtifacts, IcCustomize } from "./components/icons";

export const NAV: NavItem[] = [
  { key: "chats", label: "Chats", Icon: IcChat },
  { key: "projects", label: "Projects", Icon: IcProjects },
  { key: "artifacts", label: "Artifacts", Icon: IcArtifacts },
  { key: "customize", label: "Customize", Icon: IcCustomize },
];

export const STYLES: Style[] = [
  { key: "normal", label: "Normal", desc: "Default responses", mod: "" },
  { key: "concise", label: "Concise", desc: "Brief and direct", mod: " Keep replies brief and direct." },
  { key: "explanatory", label: "Explanatory", desc: "Thorough and educational", mod: " Give thorough, educational answers that explain the reasoning." },
  { key: "formal", label: "Formal", desc: "Client-ready tone", mod: " Maintain a formal, client-ready professional tone." },
];

export const RECENTS: string[] = [
  "Q2 K-1 status — Da Vinci Capital", "FIRPTA certificate mechanics",
  "Client update — HFL onboarding", "1446(f) withholding summary", "Luxembourg SCA classification",
];

export const STARTERS: string[] = [
  "Draft a client onboarding email", "Make a 1446(f) withholding checklist", "Summarise a K-1 engagement status",
];

// Review-assistant action pills — shown on the landing when Theo is armed with a Sigma review context
// (reviewMode). Each is a plain prompt sent via onSend, routed to sigma_review_agent_stream.
export const REVIEW_STARTERS: string[] = [
  "Walk me through the exceptions", "Explain a control", "Draft an attestation", "Check the Sch L tie-out", "Summarize for Jake",
];

// App-level Sigma review-assistant pills (#5 v2) — shown when Sigma is open but no fund/review is armed
// (sigmaMode && !reviewMode). Orienting/guidance prompts (general chat, not a specific review).
export const REVIEW_APP_STARTERS: string[] = [
  "How does a K-1 review work?", "What do the controls check?", "Walk me through kickoff → review → sign-off", "What should I look at first?",
];

// B5a/B5c/B5d: the harness seed omits visibility/isOwner/sharedWithMe/memberCount; gateway.mock adds all four on load.
export const INIT_PROJECTS: Omit<Project, "visibility" | "isOwner" | "sharedWithMe" | "memberCount">[] = [
  { id: "p1", name: "Da Vinci Capital — 2025 K-1s", desc: "Engagement workspace for the 2025 K-1 cycle.", updated: "2d ago",
    instructions: "Treat all entity names as confidential. Default to US partnership tax framing. Flag any 1446(f) trigger.",
    knowledge: [
      { id: "k1", title: "Fund structure", content: "Da Vinci Fund III LP, Delaware. 2 US blocker corps. 41 LPs across US, UK, Lux. GP: Da Vinci Capital GP LLC." },
      { id: "k2", title: "Open items", content: "Investor allocation schedule pending final close adjustments. One LP transfer in Q3 may trigger 1446(f) review." },
    ] },
  { id: "p2", name: "HFL Fund Administration", desc: "Guernsey administrator partnership — shared reference and briefings.", updated: "5d ago",
    instructions: "HFL is Vault's closest partner. Keep tone collaborative and client-ready.",
    knowledge: [{ id: "k3", title: "Relationship", content: "HFL is a Guernsey fund administrator. Data exchanged via agreed spec. Joint onboarding checklist in use." }] },
  { id: "p3", name: "FIRPTA & 1446(f) Reference", desc: "Standing reference for withholding and certificate mechanics.", updated: "1w ago",
    instructions: "Always cite the governing section. Never state a withholding rate without confirming the fact pattern.",
    knowledge: [{ id: "k4", title: "Scope", content: "Covers FIRPTA certificates, 1445 and 1446(f) withholding mechanics, and partnership transfer reporting." }] },
];
