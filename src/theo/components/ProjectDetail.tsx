// ProjectDetail — B4e project-home redesign. A project is a HOME for its chats: the primary surface
// is the project's chat list + "New chat in this project"; Project knowledge and Custom instructions
// are secondary, collapsible sections (expanded while the project has no chats yet, collapsed once it
// does — the Claude idiom). Consumes the live per-project chat list (theo_list_conversations?projectId,
// B4d) via the `chats` prop; selecting a chat reopens it (restoring the project). Knowledge/instructions
// editing is unchanged from B4c (now inside collapsibles). Tokens per VA-T1 (../theme).
// B4f: each chat row gains hover-revealed manage actions — Rename (edit-in-place) and Delete (native
// confirm) — wired to theo_rename_conversation / theo_delete_conversation (deployed B4f), same as the
// Sidebar recents rows.
import { useRef, useState } from "react";
import { C, SANS } from "../theme";
import { IcChat, IcCompose, IcDoc, IcTrash } from "./icons";
import { InputBox } from "./ui";
import { InlineEdit, RowActions } from "./RowManage";
import type { ConversationSummary, KDraft, Person, Project, ProjectMember, PublishedConversation } from "../types";

export interface ProjectDetailProps {
  project: Project;
  chats: ConversationSummary[];                 // B4e: this project's conversations (theo_list_conversations?projectId)
  kdraft: KDraft;
  onKdraftChange: (next: KDraft) => void;
  onAddKnowledge: () => void | Promise<void>;
  onAddKnowledgeFile: (file: File) => void | Promise<void>;   // Phase C: upload a file → file-backed knowledge
  onRemoveKnowledge: (kid: string) => void;
  onPatchInstructions: (text: string) => void;
  onStartChat: () => void;                       // "+ New chat in this project"
  onSelectChat: (id: string) => void;            // B4e: open an existing project chat (restores the project)
  onRenameChat: (id: string, title: string) => void;   // B4f
  onDeleteChat: (id: string) => void;                   // B4f
  onPatchDescription: (text: string) => void;           // B4g: edit the project description (theo_update_project {id, description})
  onSetVisibility: (id: string, visibility: "private" | "group") => void;   // B5a: owner-only share toggle
  visibilityBusy: boolean;   // B5a: a visibility write for this project is in flight → disable the toggle
  // B5c per-member invite (owner-only): current members, the roster picker source, and share/revoke.
  members: ProjectMember[];
  people: Person[];
  onShareMember: (projectId: string, memberOid: string) => void;
  onUnshareMember: (projectId: string, memberOid: string) => void;
  memberPendingKey: string | null;   // `${projectId}|${memberOid}` currently in flight → disable that row
  // SPW 2c-iv (VA-T12 surface C): conversations published to this project (theo_list_project_conversations).
  // Any participant sees them; a row opens the chat via onSelectChat. Empty → a muted empty state.
  published: PublishedConversation[];
}

// A collapsible section header (caret + title) with a conditional body. Local, inline — no new dep.
function Section({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.line2}`, borderRadius: 14, marginTop: 14 }}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: "14px 18px", fontFamily: SANS, fontSize: 14, fontWeight: 600, color: C.ink, textAlign: "left" }}
      >
        <span style={{ color: C.ink3, fontSize: 12, width: 12, display: "inline-block" }}>{open ? "▾" : "▸"}</span>
        {title}
      </button>
      {open && <div style={{ padding: "0 18px 18px" }}>{children}</div>}
    </div>
  );
}

export function ProjectDetail({ project, chats, kdraft, onKdraftChange, onAddKnowledge, onAddKnowledgeFile, onRemoveKnowledge, onPatchInstructions, onStartChat, onSelectChat, onRenameChat, onDeleteChat, onPatchDescription, onSetVisibility, visibilityBusy, members, people, onShareMember, onUnshareMember, memberPendingKey, published }: ProjectDetailProps) {
  // B5a: only the owner may edit config (description / knowledge / instructions / sharing). A
  // shared-with-me project (isOwner=false) is read-only + chattable — members see the config but can't
  // change it, and chat with their own conversations.
  const isOwner = project.isOwner;
  // Adaptive default: sections start expanded while the project has no chats (setup-first), and
  // collapse once it has chats (chats-first) — until the user explicitly toggles (null = follow default).
  const hasChats = chats.length > 0;
  const [kOpen, setKOpen] = useState<boolean | null>(null);
  const [iOpen, setIOpen] = useState<boolean | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);   // B4f: chat row being renamed in place
  const [descEditing, setDescEditing] = useState(false);             // B4g: description edited in place
  const [kBusy, setKBusy] = useState(false);                         // add-knowledge POST in flight (button feedback)
  const [kFileBusy, setKFileBusy] = useState(false);                 // file upload+ingest in flight
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canAddKnowledge = kdraft.title.trim().length > 0 && kdraft.content.trim().length > 0;
  const knowledgeOpen = kOpen ?? !hasChats;
  const instructionsOpen = iOpen ?? !hasChats;

  return (
    <div className="vo-scroll" style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "26px 24px" }}>
        {/* B4g: editable project description (OWNER-only, B5a). Click to edit in place; Enter/blur saves
            (empty allowed to clear), Esc cancels. A shared-with-me project shows the description read-only. */}
        <div style={{ marginTop: 0, marginBottom: 14 }}>
          {isOwner && descEditing ? (
            <InlineEdit
              value={project.desc} editing allowEmpty
              onCommit={(next) => { setDescEditing(false); if (next !== project.desc) onPatchDescription(next); }}
              onCancel={() => setDescEditing(false)}
              inputStyle={{ fontSize: 14, color: C.ink2 }}
            />
          ) : isOwner ? (
            <p onClick={() => setDescEditing(true)} title="Edit description"
              style={{ color: project.desc ? C.ink2 : C.ink3, fontSize: 14, margin: 0, cursor: "text" }}>
              {project.desc || "Add a description…"}
            </p>
          ) : (
            project.desc ? <p style={{ color: C.ink2, fontSize: 14, margin: 0 }}>{project.desc}</p> : null
          )}
        </div>

        {/* B5a: sharing control. Owner → toggle private↔group. Member → read-only "shared with you" note. */}
        <div style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {isOwner ? (
            <>
              <span style={{ fontSize: 12.5, color: C.ink3 }}>Sharing</span>
              <button
                disabled={visibilityBusy}
                onClick={() => { if (!visibilityBusy) onSetVisibility(project.id, project.visibility === "group" ? "private" : "group"); }}
                title={project.visibility === "group" ? "Make private" : "Share with the team"}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7, cursor: visibilityBusy ? "default" : "pointer", fontFamily: SANS, fontSize: 12.5, fontWeight: 600,
                  borderRadius: 999, padding: "5px 12px", opacity: visibilityBusy ? 0.6 : 1,
                  border: `1px solid ${project.visibility === "group" ? C.coral : C.line2}`,
                  background: project.visibility === "group" ? C.coralSoft : "#fff",
                  color: project.visibility === "group" ? C.coralDk : C.ink2,
                }}
              >
                {visibilityBusy ? "Updating…" : project.visibility === "group" ? "Shared with the team — click to make private" : "Private — click to share with the team"}
              </button>
            </>
          ) : (
            <span style={{ fontSize: 12.5, color: C.coralDk, background: C.coralSoft, borderRadius: 999, padding: "5px 12px", fontWeight: 600 }}>
              {project.sharedWithMe ? "Shared with you" : "Shared with the team"} · read-only — start a chat to use its knowledge
            </span>
          )}
        </div>

        {/* B5c: per-member invite (OWNER-only). Current members (name resolved from the roster) with a
            revoke control, plus a picker of teammates not already invited (and not the owner). Members
            read the project's knowledge/instructions and chat with their own conversations (config-only
            sharing). Group-visible projects are shared team-wide, so the picker is redundant there and
            is hidden. */}
        {isOwner && project.visibility !== "group" && (
          <div style={{ marginBottom: 18, background: C.card, border: `1px solid ${C.line2}`, borderRadius: 14, padding: "14px 18px" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 10 }}>Shared with</div>
            {members.length === 0 ? (
              <p style={{ fontSize: 12.5, color: C.ink3, margin: "0 0 10px" }}>Not shared with anyone yet. Invite a teammate below.</p>
            ) : (
              <ul style={{ listStyle: "none", margin: "0 0 10px", padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                {members.map((m) => {
                  const person = people.find((p) => p.id === m.memberOid);
                  const label = person ? person.displayName : m.memberOid;
                  const busy = memberPendingKey === project.id + "|" + m.memberOid;
                  return (
                    <li key={m.memberOid} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.coralSoft, color: C.coralDk, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {label.trim().slice(0, 1).toUpperCase() || "?"}
                      </div>
                      <span style={{ flex: 1, fontSize: 13, color: C.ink2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {label}{person?.jobTitle ? <span style={{ color: C.ink3 }}> · {person.jobTitle}</span> : null}
                      </span>
                      <button
                        disabled={busy}
                        onClick={() => { if (!busy) onUnshareMember(project.id, m.memberOid); }}
                        title="Remove from project"
                        style={{ background: "none", border: "none", cursor: busy ? "default" : "pointer", color: C.ink3, borderRadius: 6, padding: 4, display: "flex", opacity: busy ? 0.5 : 1 }}
                      >
                        <IcTrash s={15} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {(() => {
              const invitable = people.filter((p) => !p.isSelf && !members.some((m) => m.memberOid === p.id));
              return (
                <select
                  value=""
                  onChange={(e) => { const oid = e.target.value; if (oid) onShareMember(project.id, oid); }}
                  disabled={invitable.length === 0}
                  aria-label="Invite a teammate to this project"
                  style={{ fontFamily: SANS, fontSize: 12.5, color: C.ink2, border: `1px solid ${C.line2}`, borderRadius: 8, padding: "6px 10px", background: "#fff", maxWidth: 320 }}
                >
                  <option value="">{invitable.length === 0 ? "No teammates to invite" : "Invite a teammate…"}</option>
                  {invitable.map((p) => (
                    <option key={p.id} value={p.id}>{p.displayName}{p.jobTitle ? ` · ${p.jobTitle}` : ""}</option>
                  ))}
                </select>
              );
            })()}
          </div>
        )}

        {/* Chats-first: the project's conversations + new-chat */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Chats in this project</div>
          <button
            className="vo-new" onClick={onStartChat}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, background: C.coral, color: "#fff", border: "none", borderRadius: 9, padding: "8px 14px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}
          >
            <IcCompose s={16} /> New chat
          </button>
        </div>

        {chats.length === 0 ? (
          <div style={{ background: C.card, border: `1px dashed ${C.line2}`, borderRadius: 14, padding: "22px 18px", textAlign: "center", color: C.ink2, fontSize: 13.5 }}>
            No chats yet — start one to use this project's knowledge and instructions.
          </div>
        ) : (
          <div style={{ background: C.card, border: `1px solid ${C.line2}`, borderRadius: 14, overflow: "hidden" }}>
            {chats.map((c) => {
              const editing = editingId === c.id;
              return (
                <div
                  key={c.id} className="vo-row" onClick={() => { if (!editing) onSelectChat(c.id); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", cursor: "pointer", borderBottom: `1px solid ${C.line}` }}
                >
                  <span style={{ color: C.ink3, display: "flex", flexShrink: 0 }}><IcChat s={16} /></span>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, color: C.ink, overflow: "hidden" }}>
                    <InlineEdit
                      value={c.title || "Untitled chat"} editing={editing}
                      onCommit={(next) => { setEditingId(null); if (next !== c.title) onRenameChat(c.id, next); }}
                      onCancel={() => setEditingId(null)}
                      labelStyle={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                      inputStyle={{ fontSize: 13.5 }}
                    />
                  </span>
                  {!editing && (
                    <RowActions
                      renameTitle="Rename chat" deleteTitle="Delete chat"
                      onRename={() => setEditingId(c.id)}
                      onDelete={() => { if (window.confirm(`Delete chat "${c.title || "Untitled chat"}"? This permanently removes the conversation and its messages.`)) onDeleteChat(c.id); }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* SPW 2c-iv (VA-T12 surface C): chats published to this project — readable/continuable by any
            participant. The author is resolved to a roster photo/name; a row opens the chat (restoring
            the project) via the same selectRecent path as the chats list. */}
        <div style={{ fontWeight: 600, fontSize: 15, margin: "22px 0 12px" }}>Shared in this project</div>
        {published.length === 0 ? (
          <div style={{ background: C.card, border: `1px dashed ${C.line2}`, borderRadius: 14, padding: "22px 18px", textAlign: "center", color: C.ink2, fontSize: 13.5 }}>
            No shared chats yet — publish a chat to this project from its title menu so the team can read and continue it.
          </div>
        ) : (
          <div style={{ background: C.card, border: `1px solid ${C.line2}`, borderRadius: 14, overflow: "hidden" }}>
            {published.map((pub) => {
              const author = people.find((p) => p.id === pub.created_by) ?? null;
              const label = author ? author.displayName : pub.created_by;
              return (
                <div
                  key={pub.id} className="vo-row" onClick={() => onSelectChat(pub.id)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", cursor: "pointer", borderBottom: `1px solid ${C.line}` }}
                >
                  {author?.photo
                    ? <img src={author.photo} alt="" style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                    : <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.coralSoft, color: C.coralDk, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{label.trim().slice(0, 1).toUpperCase() || "?"}</div>}
                  <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pub.title || "Untitled chat"}</span>
                  <span style={{ fontSize: 12, color: C.ink3, flexShrink: 0, whiteSpace: "nowrap" }}>{label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Collapsible: Project knowledge */}
        <Section title={`Project knowledge (${project.knowledge.length})`} open={knowledgeOpen} onToggle={() => setKOpen(!knowledgeOpen)}>
          <p style={{ margin: "2px 0 14px", fontSize: 12.5, color: C.ink2, lineHeight: 1.5 }}>
            Reference material Theo should always know when you chat in this project — a firm email template, a sample engagement letter, standard disclaimers, key client facts. Theo pulls it into context automatically, so you don’t have to paste it into every chat.
          </p>
          {project.knowledge.map((d) => (
            <div key={d.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: `1px solid ${C.line}` }}>
              <span style={{ color: C.ink3, marginTop: 2 }}><IcDoc s={17} /></span>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 13.5, display: "flex", alignItems: "center", gap: 6 }}>{d.title}{d.source_type === "file" && <span style={{ fontSize: 10.5, fontWeight: 700, color: C.coralDk, background: C.coralSoft, borderRadius: 999, padding: "1px 7px", flexShrink: 0 }}>File</span>}</div><div style={{ fontSize: 12.5, color: C.ink2, lineHeight: 1.45, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>{d.content}</div></div>
              {/* B5a: remove is owner-only */}
              {isOwner && <button className="vo-ghost" onClick={() => onRemoveKnowledge(d.id)} title="Remove" style={{ background: "none", border: "none", cursor: "pointer", color: C.ink3, borderRadius: 6, padding: 4, display: "flex" }}><IcTrash s={15} /></button>}
            </div>
          ))}
          {/* B5a: add-knowledge form is owner-only */}
          {isOwner && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: C.ink2 }}>Add knowledge</div>
              <InputBox value={kdraft.title} onChange={(v) => onKdraftChange({ ...kdraft, title: v })} placeholder="Title — e.g. “Standard engagement letter”" />
              <InputBox value={kdraft.content} onChange={(v) => onKdraftChange({ ...kdraft, content: v })} placeholder="Paste the text Theo should know — template wording, standard disclaimers, key client facts…" rows={3} />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  className="vo-chip"
                  disabled={!canAddKnowledge || kBusy}
                  onClick={async () => { if (!canAddKnowledge || kBusy) return; setKBusy(true); try { await onAddKnowledge(); } finally { setKBusy(false); } }}
                  style={{ background: "#fff", border: `1px solid ${C.line2}`, borderRadius: 9, padding: "8px 14px", fontSize: 13, color: C.ink, cursor: (!canAddKnowledge || kBusy) ? "default" : "pointer", opacity: (!canAddKnowledge || kBusy) ? 0.5 : 1, fontFamily: SANS }}
                >
                  {kBusy ? "Adding…" : "+ Add knowledge"}
                </button>
                {!canAddKnowledge && <span style={{ fontSize: 12, color: C.ink3 }}>Add a title and some content to save.</span>}
              </div>
              <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: C.ink2 }}>…or upload a file</div>
                <input ref={fileInputRef} type="file" style={{ display: "none" }}
                  onChange={async (e) => { const f = e.target.files?.[0]; e.currentTarget.value = ""; if (!f || kFileBusy) return; setKFileBusy(true); try { await onAddKnowledgeFile(f); } finally { setKFileBusy(false); } }} />
                <div>
                  <button className="vo-chip" disabled={kFileBusy} onClick={() => fileInputRef.current?.click()}
                    style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#fff", border: `1px solid ${C.line2}`, borderRadius: 9, padding: "8px 14px", fontSize: 13, color: C.ink, cursor: kFileBusy ? "default" : "pointer", opacity: kFileBusy ? 0.6 : 1, fontFamily: SANS }}>
                    <IcDoc s={15} /> {kFileBusy ? "Uploading…" : "Upload a file"}
                  </button>
                </div>
                <span style={{ fontSize: 12, color: C.ink3 }}>Word, Excel, PowerPoint, CSV, or TXT (and text-based PDFs). Theo reads the text into this project’s knowledge.</span>
              </div>
            </div>
          )}
          {project.knowledge.length === 0 && !isOwner && <div style={{ fontSize: 12.5, color: C.ink3, padding: "8px 0" }}>No knowledge in this project yet.</div>}
          <div style={{ fontSize: 12, color: C.ink3, marginTop: 12 }}>Everything here is available to Theo in every chat in this project.</div>
        </Section>

        {/* Collapsible: Custom instructions (owner edits; member reads) */}
        <Section title="Custom instructions" open={instructionsOpen} onToggle={() => setIOpen(!instructionsOpen)}>
          <p style={{ margin: "2px 0 14px", fontSize: 12.5, color: C.ink2, lineHeight: 1.5 }}>
            Standing directions for how Theo works in this project — tone, format, and what to assume — applied to every chat here. Example: “Draft in UK English, cite the relevant TCGA 1992 section, and always flag SDLT implications.”
          </p>
          {isOwner ? (
            <InputBox value={project.instructions} onChange={(v) => onPatchInstructions(v)} placeholder="e.g. Draft in UK English, keep a formal tone, and cite the relevant legislation." rows={4} />
          ) : (
            <p style={{ fontSize: 13.5, color: project.instructions ? C.ink2 : C.ink3, lineHeight: 1.5, margin: 0, whiteSpace: "pre-wrap" }}>{project.instructions || "No custom instructions."}</p>
          )}
        </Section>
      </div>
    </div>
  );
}
