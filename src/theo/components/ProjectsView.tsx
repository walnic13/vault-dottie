// ProjectsView — VA-T1 L380–401. Owns its scroll container (identical pixels).
// B4f: each project card gains hover-revealed manage actions — Rename (edit-in-place on the card's
// name) and Delete (native confirm). Managing projects lives on the grid (the Claude idiom); chat
// management lives on the recents rail + project home. No backend change: rename → theo_update_project
// {id, name} (deployed B4a), delete → theo_delete_project {id} (deployed B4a).
import { useState } from "react";
import { C, SANS } from "../theme";
import { IcProjects } from "./icons";
import { InputBox } from "./ui";
import { InlineEdit, RowActions } from "./RowManage";
import type { NpDraft, Project } from "../types";

export interface ProjectsViewProps {
  projects: Project[];
  npOpen: boolean;
  np: NpDraft;
  onNpChange: (next: NpDraft) => void;
  onToggleNp: () => void;
  onCreate: () => void;
  onOpenProject: (id: string) => void;
  onRenameProject: (id: string, name: string) => void;   // B4f
  onDeleteProject: (id: string) => void;                  // B4f
}

export function ProjectsView({ projects, npOpen, np, onNpChange, onToggleNp, onCreate, onOpenProject, onRenameProject, onDeleteProject }: ProjectsViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);   // B4f: card whose name is being edited in place
  return (
    <div className="vo-scroll" style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "26px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <p style={{ color: C.ink2, fontSize: 14, margin: 0 }}>Workspaces that bundle chats, knowledge and instructions.</p>
          <button className="vo-new" onClick={onToggleNp} style={{ background: C.coral, color: "#fff", border: "none", borderRadius: 9, padding: "8px 14px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>{npOpen ? "Cancel" : "+ New project"}</button>
        </div>
        {npOpen && (<div style={{ background: C.card, border: `1px solid ${C.line2}`, borderRadius: 14, padding: 18, marginBottom: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <InputBox value={np.name} onChange={(v) => onNpChange({ ...np, name: v })} placeholder="Project name" />
          <InputBox value={np.desc} onChange={(v) => onNpChange({ ...np, desc: v })} placeholder="Short description" />
          <InputBox value={np.instructions} onChange={(v) => onNpChange({ ...np, instructions: v })} placeholder="Custom instructions for this project (optional)" rows={2} />
          <div><button className="vo-new" onClick={onCreate} style={{ background: C.coral, color: "#fff", border: "none", borderRadius: 9, padding: "9px 18px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>Create project</button></div>
        </div>)}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
          {projects.map((p) => {
            const editing = editingId === p.id;
            return (<div key={p.id} className="vo-card" onClick={() => { if (!editing) onOpenProject(p.id); }} style={{ position: "relative", background: C.card, border: `1px solid ${C.line2}`, borderRadius: 14, padding: 18, cursor: "pointer", transition: "all .15s" }}>
              {/* B4f: hover-revealed manage actions (top-right). B5a: OWNER-ONLY — a shared-with-me
                  project (isOwner=false) is read-only, so no rename/delete affordance. Editing suppresses open. */}
              {p.isOwner && (
                <div style={{ position: "absolute", top: 12, right: 12 }}>
                  <RowActions
                    renameTitle="Rename project" deleteTitle="Delete project"
                    onRename={() => setEditingId(p.id)}
                    onDelete={() => { if (window.confirm(`Delete project "${p.name}"? Its chats are kept but no longer linked to this project.`)) onDeleteProject(p.id); }}
                  />
                </div>
              )}
              <div style={{ color: C.coral, marginBottom: 10 }}><IcProjects s={20} /></div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, paddingRight: 44 }}>
                <InlineEdit
                  value={p.name} editing={editing}
                  onCommit={(next) => { setEditingId(null); if (next !== p.name) onRenameProject(p.id, next); }}
                  onCancel={() => setEditingId(null)}
                  inputStyle={{ fontWeight: 600, fontSize: 15 }}
                />
              </div>
              <div style={{ fontSize: 13, color: C.ink2, lineHeight: 1.5, marginBottom: 14, minHeight: 38 }}>{p.desc}</div>
              <div style={{ fontSize: 12, color: C.ink3, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span>{p.knowledge.length} docs · {p.updated}</span>
                {/* B5a/B5c/B5d: sharing badge. Owner → 'Shared' when the project is group-visible OR has
                    ≥1 invited member (B5d memberCount, so a privately-shared project badges too). Non-owner:
                    an explicit invite (B5c sharedWithMe, even on a private project) → 'Shared with you'; a
                    group-visible project someone else owns → 'Shared with the team'. */}
                {(p.visibility === "group" || p.sharedWithMe || (p.isOwner && p.memberCount > 0)) && (
                  <span style={{ fontSize: 11, color: C.coralDk, background: C.coralSoft, borderRadius: 999, padding: "2px 9px", fontWeight: 600 }}>
                    {p.isOwner ? "Shared" : p.sharedWithMe ? "Shared with you" : "Shared with the team"}
                  </span>
                )}
              </div>
            </div>);
          })}
        </div>
      </div>
    </div>
  );
}
