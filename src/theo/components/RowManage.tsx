// B4f management affordances — small, reusable presentational pieces shared by the three list
// surfaces (Projects grid cards, Sidebar recents, project-home chat rows). No new backend, no
// browser storage; wiring goes through the existing `theoClient` handlers (rename/delete).
//
// Two pieces:
//  • RowActions — the hover-revealed ✎ (rename) / 🗑 (delete) icon buttons. Wrapped in a
//    `.vo-actions` span (opacity 0 → 1 on row/card hover or focus-within; rule in TheoSurface
//    STYLE_BLOCK). Every click stopPropagation so it never triggers the row/card's own onClick
//    (open project / open chat).
//  • InlineEdit — edit-in-place: renders the label normally, or a focused input while editing.
//    Enter/blur commits a non-blank trimmed value; Escape cancels. A one-shot guard makes commit
//    and cancel mutually exclusive so an Escape-then-blur can't double-fire (commit after cancel).
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";
import { C, SANS } from "../theme";
import { IcCompose, IcTrash } from "./icons";

const stop = (e: MouseEvent) => e.stopPropagation();

export function RowActions({ onRename, onDelete, renameTitle = "Rename", deleteTitle = "Delete" }: {
  onRename: () => void;
  onDelete: () => void;
  renameTitle?: string;
  deleteTitle?: string;
}) {
  const btn: CSSProperties = { background: "none", border: "none", cursor: "pointer", color: C.ink3, borderRadius: 6, padding: 4, display: "flex" };
  return (
    <span className="vo-actions" style={{ display: "inline-flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
      <button className="vo-ghost" title={renameTitle} aria-label={renameTitle} style={btn}
        onClick={(e) => { stop(e); onRename(); }}><IcCompose s={14} /></button>
      <button className="vo-ghost" title={deleteTitle} aria-label={deleteTitle} style={btn}
        onClick={(e) => { stop(e); onDelete(); }}><IcTrash s={14} /></button>
    </span>
  );
}

// The input is a child component mounted ONLY while editing, so its draft state seeds fresh from
// `initial` on each edit and autofocus/select runs once on mount.
function EditInput({ initial, onCommit, onCancel, style, allowEmpty = false }: {
  initial: string;
  onCommit: (next: string) => void;
  onCancel: () => void;
  style?: CSSProperties;
  allowEmpty?: boolean;                                         // B4g: description may be cleared to ""; rename stays non-blank
}) {
  const [v, setV] = useState(initial);
  const ref = useRef<HTMLInputElement>(null);
  const done = useRef(false);                                   // one-shot: commit XOR cancel, once
  useEffect(() => { const el = ref.current; if (el) { el.focus(); el.select(); } }, []);
  const finish = (fn: () => void) => { if (done.current) return; done.current = true; fn(); };
  // Commit a trimmed value; blank commits only when allowEmpty (else it cancels — keeps rename non-blank).
  const commit = () => finish(() => { const t = v.trim(); if (t || allowEmpty) onCommit(t); else onCancel(); });
  const cancel = () => finish(onCancel);
  return (
    <input
      ref={ref}
      value={v}
      onClick={stop}
      onChange={(e) => setV(e.target.value)}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") { e.preventDefault(); commit(); }
        else if (e.key === "Escape") { e.preventDefault(); cancel(); }
      }}
      onBlur={commit}
      style={{ font: "inherit", fontFamily: SANS, color: C.ink, background: C.card, border: `1px solid ${C.coral}`, borderRadius: 7, padding: "3px 7px", width: "100%", ...style }}
    />
  );
}

export function InlineEdit({ value, editing, onCommit, onCancel, labelStyle, inputStyle, allowEmpty = false }: {
  value: string;
  editing: boolean;
  onCommit: (next: string) => void;
  onCancel: () => void;
  labelStyle?: CSSProperties;
  inputStyle?: CSSProperties;
  allowEmpty?: boolean;                                         // B4g: pass-through so a cleared value commits ""
}) {
  return editing
    ? <EditInput initial={value} onCommit={onCommit} onCancel={onCancel} style={inputStyle} allowEmpty={allowEmpty} />
    : <span style={labelStyle}>{value}</span>;
}
