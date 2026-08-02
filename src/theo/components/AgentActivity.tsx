// AgentActivity — the Claude-Code-style live agent view for tool-driven agents (VA-T7). Two consumers:
//   1. the Sigma K-1 review agent (`sigma_review_agent_stream`) — mode="review".
//   2. the general-chat tool-loop (`theo_message_stream`, DR-T11) — mode="chat"; first tool
//      `theo_export_spreadsheet` (→ the VA-T9 download card renders after the answer).
// Faithful reproduction of the VA-T7 reference (artifacts/theo-agent-activity-reference.jsx) — no
// redesign. RUNNING: a live panel streaming reasoning + each tool call the instant it fires (status
// dots), a live token count, and a blend running-verb (general chat: playful while only thinking →
// context-aware once a tool fires). DONE: collapses to a one-line summary; tool calls persist as chips.
// Mounted ABOVE the assistant answer body (ChatView). Zero-dependency, inline-style; no browser storage.
import { useEffect, useRef, useState } from "react";
import { C, SANS, MONO } from "../theme";
import type { AgentToolCall } from "../types";

const GREEN = "#4f7a4a";
const RED = "#B23A2E";

// General-chat header verb: a plain "Thinking…" while running (the specific tool shows in its own
// row below; the playful animated status lives in the host's StatusLine beneath the panel). The
// DONE state uses a factual summary.
function chatDoneLabel(tools: AgentToolCall[]): string {
  if (!tools.length) return "Done";
  const names = [...new Set(tools.map((t) => t.name))];
  if (names.length === 1) return names[0] === "theo_export_spreadsheet" ? "Used the spreadsheet export tool" : `Used ${names[0]}`;
  return `Used ${tools.length} tools`;
}

export interface AgentActivityProps {
  running: boolean;
  reasoning: string;
  tools: AgentToolCall[];
  fund?: string;                       // review context (Sigma); absent ⇒ general chat
  mode?: "review" | "chat";            // selects the label family (default: "review" when fund set, else "chat")
  tokens?: number;                     // live output-token count for the header (hidden when falsy)
  streaming?: boolean;                 // VA-T7 two-mode toggle: text is actively streaming ⇒ hide the
                                       // live token count while running (the text is the signal). The
                                       // count shows during silent "processing" stretches and at DONE.
  defaultOpen?: boolean;
}

// A single tool-call row inside the activity panel.
function ToolRow({ name, input, status }: AgentToolCall) {
  const dot = status === "done" ? GREEN : status === "fail" ? RED : C.coral;
  const label =
    input && typeof input === "object" && Object.keys(input as Record<string, unknown>).length
      ? `${name}(${Object.values(input as Record<string, unknown>).map((v) => (typeof v === "string" ? v : JSON.stringify(v))).join(", ")})`
      : `${name}()`;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0", fontFamily: MONO, fontSize: 12 }}>
      <span aria-hidden style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0, ...(status === "running" ? { animation: "vaPulse 1s infinite" } : {}) }} />
      <span style={{ color: C.ink2 }}>→</span>
      <span style={{ color: C.ink, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={label}>{label}</span>
      {status === "done" && <span style={{ color: GREEN }}>✓</span>}
      {status === "fail" && <span style={{ color: RED }}>✕</span>}
    </div>
  );
}

// Persistent tool chips on a finished message. Deduped by name with a count.
function ToolChips({ tools }: { tools: AgentToolCall[] }) {
  const counts = tools.reduce<Record<string, number>>((m, t) => { m[t.name] = (m[t.name] || 0) + 1; return m; }, {});
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, marginBottom: 4 }}>
      {Object.entries(counts).map(([name, n]) => (
        <span key={name} style={{ fontFamily: MONO, fontSize: 11, color: C.ink2, background: C.card, border: `1px solid ${C.line}`, borderRadius: 999, padding: "2px 9px" }}>
          {name}{n > 1 ? ` ×${n}` : ""}
        </span>
      ))}
    </div>
  );
}

export function AgentActivity({ running, reasoning, tools, fund, mode, tokens, streaming, defaultOpen }: AgentActivityProps) {
  const [open, setOpen] = useState(defaultOpen ?? running);
  const kind: "review" | "chat" = mode ?? (fund && fund.trim() ? "review" : "chat");

  const fundLabel = fund && fund.trim() ? fund.trim() : "the workbook set";
  const label =
    kind === "chat"
      ? (running ? "Thinking…" : chatDoneLabel(tools))
      : (running ? `Reviewing ${fundLabel}…` : `Checked ${fundLabel} · ${tools.length} tool${tools.length === 1 ? "" : "s"}`);

  // Stream the thinking in a FIXED-HEIGHT region that auto-scrolls to the newest text while running,
  // so the header (verb + live token count) stays pinned/visible and the reasoning "advances" (newest
  // in view) instead of growing unbounded and pushing the count off-screen.
  const reasoningRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { const el = reasoningRef.current; if (el && running) el.scrollTop = el.scrollHeight; }, [reasoning, running]);

  return (
    <div>
      <style>{"@keyframes vaSpin{to{transform:rotate(360deg)}}@keyframes vaBlink{50%{opacity:0}}@keyframes vaPulse{50%{opacity:.35}}"}</style>
      <div style={{ border: `1px solid ${C.line}`, borderRadius: 10, background: C.sidebar, marginBottom: 10, overflow: "hidden" }}>
        <button
          type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
          style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", padding: "8px 12px", background: "transparent", border: "none", cursor: "pointer", fontFamily: SANS }}
        >
          {running
            ? <span aria-hidden style={{ width: 12, height: 12, border: `2px solid ${C.line}`, borderTopColor: C.coral, borderRadius: "50%", animation: "vaSpin .8s linear infinite", flexShrink: 0 }} />
            : <span aria-hidden style={{ color: GREEN, fontSize: 13 }}>✓</span>}
          <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: C.ink2 }}>{label}</span>
          {typeof tokens === "number" && tokens > 0 && !(running && streaming) && (
            <span style={{ fontFamily: MONO, fontSize: 12, color: C.ink3, fontVariantNumeric: "tabular-nums" }}>{tokens.toLocaleString()} tokens</span>
          )}
          <span aria-hidden style={{ color: C.ink3, fontSize: 12 }}>{open ? "▾" : "▸"}</span>
        </button>
        {open && (
          <div style={{ padding: "2px 12px 10px 12px" }}>
            {reasoning && (
              <div ref={reasoningRef} style={{ fontFamily: SANS, fontSize: 12.5, fontStyle: "italic", color: C.ink3, marginBottom: 8, lineHeight: 1.5, whiteSpace: "pre-wrap", maxHeight: 180, overflowY: "auto" }}>
                {reasoning}{running && <span aria-hidden style={{ borderRight: `2px solid ${C.coral}`, marginLeft: 1, animation: "vaBlink 1s step-end infinite" }}>&nbsp;</span>}
              </div>
            )}
            {tools.map((t, i) => <ToolRow key={i} {...t} />)}
          </div>
        )}
      </div>
      {!running && tools.length > 0 && <ToolChips tools={tools} />}
    </div>
  );
}
