// System-prompt assembly + greeting — ported verbatim from VA-T1 (L84–107).
// In 1A this feeds the mock gateway; in 1B it feeds the real gateway / system-prompt
// assembly seam unchanged.
import type { Project, StyleKey } from "../types";
import { BASE_PROMPT, ARTIFACT_RULES, USER_NAME } from "../swapBlock";
import { STYLES } from "../data";

// Sigma app-level review persona (#5 v2). Prepended by buildSystemPrompt when app_key==='sigma', so
// app-level Sigma chat (general chat path) reasons as the K-1 review assistant. FE-composed behavioral
// guidance (same mechanism as project instructions / style) — NOT the server-side Operating Ruleset,
// which the chat handler prepends unchanged. A specific fund's review is driven by the review agent's
// own server-side ruleset (this text is not sent on review-agent turns).
export const SIGMA_REVIEW_PERSONA =
  "You are Theo, operating as the Vault Sigma K-1 review assistant. Sigma reviews partnership (Form 1065) Schedule K-1 tax workpapers — one fund per period, built from a four-workbook set: (1) Input Sheets (trial balance + supporting schedules), (2) Output (Schedule K-1s, Schedule K, M-1, and the Balance Sheet / Schedule L — the client deliverable), (3) Tables (lookup/rate tables), and (4) Data Connection (the GoSystems import synthesis). The workflow: an Axiom kickoff (prior-year issues, PFIC, carried interest, special allocations) is signed off to start; Sigma runs a catalog of deterministic controls; the preparer clears each exception (explains it, and you re-verify with the tools before it is resolved); the review is submitted to the reviewer (Jake); the reviewer signs off; the review is then ready for the client. The core assurance is that the output Schedule L ties to the input trial balance — every output line pulls from the TB, so the totals reconcile by construction; a break means an override, a broken link, or a hardcode. Deterministic tools do ALL arithmetic and cite the exact cells; you orchestrate, judge, and explain — you never compute figures yourself and never fabricate a number, cell, or control result. When a specific fund's review is open you drive it with those tools and give cell-cited verdicts. Here, at the app level with no fund open yet, orient the reviewer: explain what the controls check, walk through the workflow, advise what to look at first, and point them to open a fund from the worklist to begin. Be rigorous, specific, and concise; if unsure, say so rather than guess.";

export function buildSystemPrompt(styleKey: StyleKey, custom: string, project: Project | null, userName?: string, appKey?: string | null): string {
  let p = BASE_PROMPT + (STYLES.find((s) => s.key === styleKey)?.mod || "") + ARTIFACT_RULES;
  if (appKey === "sigma") p = SIGMA_REVIEW_PERSONA + "\n\n" + p;
  // Personalization: tell Theo who it is working with (the signed-in Vault user's display name, from
  // theo_list_people isSelf). Presentational context only — Theo may address the user by name.
  if (userName && userName.trim()) p += ` You are speaking with ${userName.trim()}.`;
  if (custom.trim()) p += " Standing guidance from the team: " + custom.trim();
  if (project) {
    p += `\n\nYou are working inside the project "${project.name}". Project instructions: ${project.instructions || "(none)"}.`;
    // Project KNOWLEDGE is no longer concatenated client-side. Phase D RAG replaces the interim
    // concatenation + per-item cap: D1/D2a index knowledge on ingest, and D3 retrieves the
    // query-relevant, project-scoped items server-side into the system prompt (theo_message_stream,
    // via the project_id sent on send). Large knowledge sets now scale without blowing the prompt.
  }
  return p;
}

export function greeting(name?: string): string {
  const h = new Date().getHours();
  const part = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  // Prefer the signed-in user's first name (theo_list_people isSelf); fall back to the static
  // USER_NAME, then to the bare time-of-day greeting. Matches the Claude "Good evening, <name>" home.
  const who = (name && name.trim()) || USER_NAME;
  return who ? `${part}, ${who}` : part;
}
