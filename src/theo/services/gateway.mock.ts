// 1A MOCK gateway. NO network call, NO credential, NO browser→Anthropic/Foundry call
// (FE Governor §6; 1A handover §2.2/§6). Returns a deterministic stub reply in the
// STANDARD ANTHROPIC MESSAGES API shape, so the real Foundry-backed gateway (1B) drops in
// behind this contract with no surface change. The real gateway is a vault-theo server-side
// endpoint (e.g. POST /api/theo/message) holding Foundry creds via Entra managed identity.
import type {
  Artifact, ArtifactSummary, ConversationDetail, ConversationSummary, GatewayRequest, GatewayResponse,
  KDraft, Knowledge, NpDraft, Person, Project, ProjectMember, PublishedConversation,
} from "../types";
import { INIT_PROJECTS, RECENTS } from "../data";

export async function sendMessage(req: GatewayRequest): Promise<GatewayResponse> {
  const last = [...req.messages].reverse().find((m) => m.role === "user")?.content ?? "";
  await new Promise<void>((r) => setTimeout(r, 450)); // simulate latency so the loading state shows
  const wantsArtifact = /\b(draft|email|letter|memo|checklist|table|summary|plan|template|code)\b/i.test(last);
  let text =
    `This is a mock reply from the Theo 1A gateway stub — no live model is wired yet; this in-repo ` +
    `mock exercises the surface against the standard Messages API contract.\n\n` +
    `You said: "${last.slice(0, 240)}"`;
  if (wantsArtifact) {
    text =
      `Drafted below — open it in the side panel. Ask again with the same request to create a v2.\n\n` +
      `[[ARTIFACT title="Mock Deliverable" type="document"]]\n` +
      `# Mock Deliverable\n\n` +
      `A mock artifact from the 1A gateway stub, exercising the Artifacts side panel and versioning.\n\n` +
      `- Replace this with a real Foundry-Claude response in 1B.\n` +
      `- The \`[[ARTIFACT]]\` marker protocol is preserved exactly.\n` +
      `[[/ARTIFACT]]`;
  }
  return { content: [{ type: "text", text }] };
}

// B3b read fallbacks for the standalone dev harness (no Functions backend). listConversations
// surfaces the static RECENTS seed as read-only summaries so the Recents rail is unchanged;
// getConversation returns an empty transcript (the mock has no persistence).
export async function listConversations(limit?: number): Promise<ConversationSummary[]> {
  const n = typeof limit === "number" && limit > 0 ? limit : 50;
  return RECENTS.slice(0, n).map((title, i) => ({
    id: `mock-${i}`, title, model: null, project_id: null, app_key: null,
    created_at: "", updated_at: "", last_opened_at: null, starred: false,
  }));
}

// B4e: a project's conversations (theo_list_conversations?projectId). The standalone harness has no
// project-linked conversations (the RECENTS seed carries project_id:null), so it returns empty.
export async function listProjectConversations(projectId: string): Promise<ConversationSummary[]> {
  void projectId;
  return [];
}

export async function getConversation(id: string): Promise<ConversationDetail> {
  return {
    conversation: {
      id, title: "Mock conversation", model: null, project_id: null, app_key: null,
      created_at: "", updated_at: "", last_opened_at: null, starred: false, app_context: null,
    },
    messages: [],
  };
}

// B4f: rename/delete a conversation. The standalone harness has no persistent conversations (Recents
// comes from the static RECENTS seed), so rename echoes the trimmed title and delete is a no-op — the
// caller's optimistic local update reflects the change until the next mock listConversations.
export async function renameConversation(id: string, title: string): Promise<{ id: string; title: string }> {
  return { id, title: title.trim() };
}

export async function deleteConversation(id: string): Promise<void> {
  void id;
  return;
}

// ── B4c projects fallback for the standalone dev harness (no Functions backend) ──────────────
// In-memory projects store (seeded from the reference), previously held in theoClient. gateway.live
// delegates here when no live backend is wired, mirroring the chat/recents mock fallbacks; the
// live handlers (theo_*_project / theo_*_project_knowledge) replace it when a token/base is present.
// B5a: seed projects are private + owned by the local harness user.
let mockProjects: Project[] = INIT_PROJECTS.map((p) => ({ ...p, knowledge: p.knowledge.slice(), visibility: "private" as const, isOwner: true, sharedWithMe: false, memberCount: 0 }));
// B5c: per-project membership store (harness). Keyed by project id → member OIDs the owner invited.
const mockMembers: Record<string, string[]> = {};

function cloneProject(p: Project): Project {
  return { ...p, knowledge: p.knowledge.slice() };
}

export async function listProjects(): Promise<Project[]> {
  // B5d: reflect the harness member store as the owner-gated memberCount (all harness projects are owned).
  return mockProjects.map((p) => ({ ...cloneProject(p), memberCount: (mockMembers[p.id] ?? []).length }));
}

export async function createProject(d: NpDraft): Promise<Project> {
  const id = "p" + Date.now().toString(36);
  const p: Project = {
    id, name: d.name.trim(), desc: d.desc.trim() || "New project.",
    instructions: d.instructions.trim(), knowledge: [], updated: "just now",
    visibility: "private", isOwner: true, sharedWithMe: false, memberCount: 0,
  };
  mockProjects = [p, ...mockProjects];
  return cloneProject(p);
}

// B5a: set project visibility (mock; owner-only in the harness — all seed/created projects are owned).
export async function setProjectVisibility(id: string, visibility: string): Promise<{ id: string; visibility: string }> {
  const v = visibility === "group" ? "group" : "private";
  mockProjects = mockProjects.map((p) => (p.id === id ? { ...p, visibility: v, updated: "just now" } : p));
  return { id, visibility: v };
}

// B5c: per-member invite (mock; owner-only in the harness). Idempotent add/remove of a member OID.
export async function shareProject(projectId: string, memberOid: string): Promise<void> {
  const cur = mockMembers[projectId] ?? [];
  if (!cur.includes(memberOid)) mockMembers[projectId] = [...cur, memberOid];
}
export async function unshareProject(projectId: string, memberOid: string): Promise<void> {
  mockMembers[projectId] = (mockMembers[projectId] ?? []).filter((m) => m !== memberOid);
}
export async function listProjectMembers(projectId: string): Promise<ProjectMember[]> {
  return (mockMembers[projectId] ?? []).map((oid) => ({ memberOid: oid, invitedBy: "local-harness", createdAt: "" }));
}
// Harness roster is empty (no Graph in the standalone dev harness); the live endpoint supplies the roster.
export async function listPeople(): Promise<Person[]> {
  return [];
}

export async function updateProjectInstructions(id: string, instructions: string): Promise<Project> {
  mockProjects = mockProjects.map((p) => (p.id === id ? { ...p, instructions, updated: "just now" } : p));
  const found = mockProjects.find((p) => p.id === id);
  if (!found) throw new Error("Project not found.");
  return cloneProject(found);
}

// B4g: edit the project description (theo_update_project {id, description}). Mirrors updateProjectInstructions.
export async function updateProjectDescription(id: string, description: string): Promise<Project> {
  mockProjects = mockProjects.map((p) => (p.id === id ? { ...p, desc: description, updated: "just now" } : p));
  const found = mockProjects.find((p) => p.id === id);
  if (!found) throw new Error("Project not found.");
  return cloneProject(found);
}

// B4f: rename a project (theo_update_project {id, name}). Mirrors updateProjectInstructions.
export async function renameProject(id: string, name: string): Promise<Project> {
  mockProjects = mockProjects.map((p) => (p.id === id ? { ...p, name: name.trim(), updated: "just now" } : p));
  const found = mockProjects.find((p) => p.id === id);
  if (!found) throw new Error("Project not found.");
  return cloneProject(found);
}

export async function deleteProject(id: string): Promise<void> {
  mockProjects = mockProjects.filter((p) => p.id !== id);
}

export async function listProjectKnowledge(projectId: string): Promise<Knowledge[]> {
  const p = mockProjects.find((x) => x.id === projectId);
  return p ? p.knowledge.slice() : [];
}

export async function addProjectKnowledge(projectId: string, k: KDraft): Promise<Knowledge> {
  const item: Knowledge = { id: "k" + Date.now().toString(36), title: k.title.trim(), content: k.content.trim(), source_type: "text" };
  mockProjects = mockProjects.map((p) => (p.id === projectId ? { ...p, knowledge: [...p.knowledge, item] } : p));
  return { ...item };
}

export async function addProjectKnowledgeFile(projectId: string, _attachmentId: string, title?: string): Promise<Knowledge> {
  const item: Knowledge = { id: "k" + Date.now().toString(36), title: (title && title.trim()) || "Uploaded file", content: "(mock) extracted file text", source_type: "file" };
  mockProjects = mockProjects.map((p) => (p.id === projectId ? { ...p, knowledge: [...p.knowledge, item] } : p));
  return { ...item };
}

export async function removeProjectKnowledge(knowledgeId: string): Promise<void> {
  mockProjects = mockProjects.map((p) => ({ ...p, knowledge: p.knowledge.filter((k) => k.id !== knowledgeId) }));
}

// B4d: the standalone harness has no persistent conversations to tag — a no-op keeps the surface
// working (mock conversations come from the static RECENTS seed, which carries no project link).
export async function setConversationProject(conversationId: string, projectId: string): Promise<void> {
  void conversationId; void projectId;   // no persistent conversations to tag in the standalone harness
  return;
}

// SPW Phase 2: publish/unpublish + list published conversations. The standalone harness has no
// persistent/published conversations, so publish/unpublish are no-ops and the list returns empty.
export async function publishConversation(conversationId: string): Promise<void> {
  void conversationId;
  return;
}
export async function unpublishConversation(conversationId: string): Promise<void> {
  void conversationId;
  return;
}
export async function listPublishedProjectConversations(projectId: string): Promise<PublishedConversation[]> {
  void projectId;
  return [];
}

export async function setConversationStarred(conversationId: string, starred: boolean): Promise<void> {
  void conversationId; void starred;   // no persistent conversations to star in the standalone harness
  return;
}

// ── B4h artifacts persistence fallback (standalone dev harness) ──────────────────────────────
// The harness has no backend, so persist is a no-op (returns a stub id) and the gallery is empty.
// Live theo_upsert/list/get_artifact replace these when a token/base is present (gateway.live).
export async function persistArtifact(input: { title: string; type: string; content: string; conversationId?: string | null }): Promise<{ id: string; currentVersion: number }> {
  void input;
  return { id: "srv" + Date.now().toString(36), currentVersion: 1 };
}
export async function listServerArtifacts(): Promise<ArtifactSummary[]> {
  return [];
}
export async function getServerArtifact(id: string): Promise<Artifact> {
  // Never reached in the harness (the gallery is empty); a clear stub keeps the type honest.
  return { id, title: "Artifact", type: "document", versions: [{ content: "", ts: 0 }] };
}
