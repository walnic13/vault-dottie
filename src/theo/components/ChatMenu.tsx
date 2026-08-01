// Chat-header title + dropdown menu (Conversation-Star program). Claude-style: the active
// conversation's title sits top-left with a chevron; clicking opens the shared conversation menu
// (Star / Rename / Add to project / Delete — see ConvMenuItems). Rename is edit-in-place (the title
// becomes an input). Only rendered for a saved conversation (an id exists). Click-outside closes.
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { C, SANS } from "../theme";
import { IcStar, IcChevron } from "./icons";
import { ConvMenuItems } from "./ConvMenu";
import type { ConversationSummary, Project } from "../types";

function RenameInput({ initial, onCommit, onCancel }: { initial: string; onCommit: (next: string) => void; onCancel: () => void }) {
  const [v, setV] = useState(initial);
  const ref = useRef<HTMLInputElement>(null);
  const done = useRef(false);
  useEffect(() => { const el = ref.current; if (el) { el.focus(); el.select(); } }, []);
  const finish = (fn: () => void) => { if (done.current) return; done.current = true; fn(); };
  const commit = () => finish(() => { const t = v.trim(); if (t) onCommit(t); else onCancel(); });
  const cancel = () => finish(onCancel);
  return (
    <input
      ref={ref}
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={commit}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") { e.preventDefault(); commit(); } else if (e.key === "Escape") { e.preventDefault(); cancel(); } }}
      style={{ fontSize: 15, fontWeight: 600, color: C.ink, fontFamily: SANS, border: `1px solid ${C.line2}`, borderRadius: 8, padding: "3px 8px", maxWidth: 360, background: C.bg }}
    />
  );
}

export function ChatMenu({ conversation, projects, onRename, onDelete, onToggleStar, onAddToProject, published, canPublish, onTogglePublish }: {
  conversation: ConversationSummary;
  projects: Project[];
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onToggleStar: (id: string, starred: boolean) => void;
  onAddToProject: (id: string, projectId: string) => void;
  // SPW 2c-iii-fe (VA-T12 B): passed straight to ConvMenuItems — the header menu is the only surface
  // that supplies these (it holds the open conversation's owner/published state), so the publish item
  // appears here and not in the sidebar row menu.
  published?: boolean;
  canPublish?: boolean;
  onTogglePublish?: (id: string, publish: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const title = (conversation.title || "").trim() || "New chat";
  const starred = !!conversation.starred;

  if (editing) {
    return <RenameInput initial={title} onCommit={(next) => { setEditing(false); if (next !== title) onRename(conversation.id, next); }} onCancel={() => setEditing(false)} />;
  }

  const surface: CSSProperties = {
    position: "absolute", top: "calc(100% + 4px)", left: 0, width: 264, maxWidth: "calc(100vw - 20px)", boxSizing: "border-box",
    background: C.bg, border: `1px solid ${C.line2}`, borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.14)", padding: 6, zIndex: 60,
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        title={title}
        style={{ display: "flex", alignItems: "center", gap: 6, background: open ? C.coralTint : "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 8, fontSize: 15, fontWeight: 600, color: C.ink, fontFamily: SANS, maxWidth: 380 }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</span>
        {starred && <span style={{ color: C.coralDk, display: "flex", flexShrink: 0 }}><IcStar s={13} filled /></span>}
        <span style={{ color: C.ink3, display: "flex", flexShrink: 0 }}><IcChevron s={16} /></span>
      </button>
      {open && (
        <div style={surface}>
          <ConvMenuItems
            conversation={conversation} projects={projects}
            onToggleStar={onToggleStar} onAddToProject={onAddToProject} onDelete={onDelete}
            onStartRename={() => setEditing(true)} close={() => setOpen(false)}
            published={published} canPublish={canPublish} onTogglePublish={onTogglePublish}
          />
        </div>
      )}
    </div>
  );
}
