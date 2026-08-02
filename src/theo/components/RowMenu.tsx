// Recents/chat-row ellipsis (⋮) menu (Conversation-Star program). Replaces the old pencil+trash
// RowActions on the sidebar recents rows with a Claude-style ⋮ that opens the shared conversation
// menu (Star / Rename / Add to project / Delete — ConvMenuItems). Lives inside a `.vo-actions` span
// (hover-revealed like the old RowActions) but is forced visible while open. Rename delegates to the
// caller (the row's existing edit-in-place). Click-outside closes; every click stops propagation so
// the row's own select-on-click never fires. "Add to project" drills in within the popover (no side
// flyout) — there is no horizontal room in the narrow sidebar/drawer on desktop or mobile.
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { C } from "../theme";
import { IcMore } from "./icons";
import { ConvMenuItems } from "./ConvMenu";
import type { ConversationSummary, Project } from "../types";

export function RowMenu({ conversation, projects, onStartRename, onDelete, onToggleStar, onAddToProject }: {
  conversation: ConversationSummary;
  projects: Project[];
  onStartRename: () => void;
  onDelete: (id: string) => void;
  onToggleStar: (id: string, starred: boolean) => void;
  onAddToProject: (id: string, projectId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const surface: CSSProperties = {
    position: "absolute", top: "calc(100% + 4px)", right: 0, width: 240, maxWidth: "calc(100vw - 20px)", boxSizing: "border-box",
    background: C.bg, border: `1px solid ${C.line2}`, borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.14)", padding: 6, zIndex: 60,
  };

  return (
    <span ref={wrapRef} className="vo-actions" style={{ position: "relative", display: "inline-flex", alignItems: "center", flexShrink: 0, opacity: open ? 1 : undefined }} onClick={(e) => e.stopPropagation()}>
      <button className="vo-ghost" title="Chat options" aria-label="Chat options"
        style={{ background: "none", border: "none", cursor: "pointer", color: C.ink3, borderRadius: 6, padding: 4, display: "flex" }}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}>
        <IcMore s={16} />
      </button>
      {open && (
        <div style={surface}>
          <ConvMenuItems
            conversation={conversation} projects={projects}
            onToggleStar={onToggleStar} onAddToProject={onAddToProject} onDelete={onDelete}
            onStartRename={onStartRename} close={() => setOpen(false)}
          />
        </div>
      )}
    </span>
  );
}
