// Shared conversation-menu items (Conversation-Star program). One source of the Star / Rename /
// Add to project / Delete list, used by BOTH the header title dropdown (ChatMenu) and the sidebar
// row ellipsis menu (RowMenu) so they never drift. The trigger + open/close + click-outside live in
// the callers; this renders the item buttons. "Add to project" DRILLS IN (replaces the menu content
// in place with a back header + scrollable project list) rather than opening a side flyout — the menu
// is anchored in a narrow sidebar/drawer with no horizontal room on either side (desktop or mobile).
// Drill-in stays within the same popover width and scrolls for many projects. Hover is state (no
// global CSS). Reuses VA-T1 tokens/icons + the deployed conversation handlers via callbacks.
import { useState } from "react";
import type { CSSProperties } from "react";
import { C, SANS } from "../theme";
import { IcStar, IcCompose, IcTrash, IcProjects, IcShare } from "./icons";
import type { ConversationSummary, Project } from "../types";

export function ConvMenuItems({ conversation, projects, onToggleStar, onAddToProject, onDelete, onStartRename, close, published, canPublish, onTogglePublish }: {
  conversation: ConversationSummary;
  projects: Project[];
  onToggleStar: (id: string, starred: boolean) => void;
  onAddToProject: (id: string, projectId: string) => void;
  onDelete: (id: string) => void;
  onStartRename: () => void;
  close: () => void;
  // SPW 2c-iii-fe (VA-T12 B): the publish toggle. OPTIONAL because only the chat-header menu (ChatMenu)
  // holds the open conversation's owner/published state; the sidebar row menu (RowMenu) passes none, so
  // the item renders ONLY in the header (gated on onTogglePublish && canPublish below).
  published?: boolean;                                       // current publish_to_project state
  canPublish?: boolean;                                      // owner AND project-linked → the item is shown
  onTogglePublish?: (id: string, publish: boolean) => void;  // publish (true) / unpublish (false)
}) {
  const [view, setView] = useState<"main" | "projects">("main");
  const [hover, setHover] = useState<string | null>(null);
  const starred = !!conversation.starred;
  const inProject = conversation.project_id != null;
  const title = (conversation.title || "").trim() || "this chat";

  const item = (key: string, danger = false): CSSProperties => ({
    display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 12px",
    background: hover === key ? C.coralTint : "none", border: "none", cursor: "pointer",
    fontSize: 13.5, color: danger ? C.coralDk : C.ink, fontFamily: SANS, textAlign: "left", borderRadius: 8, whiteSpace: "nowrap",
  });

  // Drill-in: the project list replaces the menu content in place (same popover width; no side flyout).
  if (view === "projects") {
    return (
      <>
        <button style={{ ...item("back"), fontWeight: 600 }} onMouseEnter={() => setHover("back")} onMouseLeave={() => setHover(null)}
          onClick={() => setView("main")}>
          <span style={{ color: C.ink3, display: "flex", fontSize: 16, lineHeight: 1 }}>‹</span> Add to project
        </button>
        <div style={{ height: 1, background: C.line2, margin: "6px 4px" }} />
        <div style={{ maxHeight: 280, overflowY: "auto" }}>
          {projects.length === 0 && <div style={{ padding: "8px 12px", fontSize: 12.5, color: C.ink3 }}>No projects yet</div>}
          {projects.map((p) => {
            const cur = conversation.project_id === p.id;
            const disabled = inProject && !cur;
            return (
              <button key={p.id} disabled={disabled}
                title={disabled ? "This chat is already in a project" : undefined}
                style={{ ...item(`p:${p.id}`), opacity: disabled ? 0.5 : 1, cursor: disabled ? "default" : "pointer" }}
                onMouseEnter={() => setHover(`p:${p.id}`)} onMouseLeave={() => setHover(null)}
                onClick={() => { if (disabled) return; close(); if (!cur) onAddToProject(conversation.id, p.id); }}>
                <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                {cur && <span style={{ flexShrink: 0, color: C.coralDk, paddingLeft: 12 }}>✓</span>}
              </button>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <>
      <button style={item("star")} onMouseEnter={() => setHover("star")} onMouseLeave={() => setHover(null)}
        onClick={() => { close(); onToggleStar(conversation.id, !starred); }}>
        <IcStar s={16} filled={starred} /> {starred ? "Unstar" : "Star"}
      </button>
      <button style={item("rename")} onMouseEnter={() => setHover("rename")} onMouseLeave={() => setHover(null)}
        onClick={() => { close(); onStartRename(); }}>
        <IcCompose s={16} /> Rename
      </button>
      <button style={item("proj")} onMouseEnter={() => setHover("proj")} onMouseLeave={() => setHover(null)}
        onClick={() => setView("projects")}>
        <IcProjects s={16} /> Add to project <span style={{ marginLeft: "auto", color: C.ink3, paddingLeft: 12 }}>›</span>
      </button>
      {/* SPW 2c-iii-fe (VA-T12 B): publish/unpublish this conversation to its project. Only the header
          menu passes onTogglePublish + canPublish (owner + project-linked), so this is hidden in the
          sidebar row menu and on a non-owner / non-project chat. */}
      {onTogglePublish && canPublish && (
        <button style={item("publish")} onMouseEnter={() => setHover("publish")} onMouseLeave={() => setHover(null)}
          onClick={() => { close(); onTogglePublish(conversation.id, !published); }}>
          <IcShare s={16} /> {published ? "Unpublish" : "Publish to project"}
        </button>
      )}
      <div style={{ height: 1, background: C.line2, margin: "6px 4px" }} />
      <button style={item("del", true)} onMouseEnter={() => setHover("del")} onMouseLeave={() => setHover(null)}
        onClick={() => { close(); if (window.confirm(`Delete chat "${title}"? This permanently removes the conversation and its messages.`)) onDelete(conversation.id); }}>
        <IcTrash s={16} /> Delete
      </button>
    </>
  );
}
