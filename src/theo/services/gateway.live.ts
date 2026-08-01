// 1B LIVE gateway. Calls the deployed server-side Theo model gateway
// (POST `${VITE_FUNCTIONS_URL}/api/theo_message`; HF-T1 Foundry-Claude broker). The gateway holds
// the model credential server-side — the browser never sees a model key. The call is CROSS-ORIGIN
// to the Functions app (mirroring Origin's reporting clients: absolute base URL + Bearer, NOT a
// same-origin `/api/*` proxy — Origin's SWA has none), so the user's Entra access token is attached
// as `Authorization: Bearer` for the Functions app's EasyAuth. That is the SAME token Origin already
// mints for reporting (`api://<app-id>/access_as_user`) — golden-curl-verified 200 against the
// deployed handler. NO browser storage (1A handover §2.5).
//
// Until a live backend is configured (no `VITE_FUNCTIONS_URL` and no `configureGateway` token/base),
// this delegates to the in-repo 1A mock so the standalone vault-theo dev harness keeps working.
import type {
  Artifact, ArtifactSummary, AttachmentUpload, ConversationAttachment, ConversationDetail, ConversationSummary, FileDownload, InlineImage, InlineImageItem, InlineVideo, GatewayRequest, GatewayResponse,
  KDraft, Knowledge, NpDraft, Person, Project, ProjectMember, PublishedConversation,
} from "../types";
import {
  sendMessage as mockSend, listConversations as mockList, getConversation as mockGet,
  listProjectConversations as mockListProjectConversations,
  listProjects as mockListProjects, createProject as mockCreateProject,
  updateProjectInstructions as mockUpdateProjectInstructions,
  updateProjectDescription as mockUpdateProjectDescription, deleteProject as mockDeleteProject,
  listProjectKnowledge as mockListProjectKnowledge, addProjectKnowledge as mockAddProjectKnowledge,
  addProjectKnowledgeFile as mockAddProjectKnowledgeFile,
  removeProjectKnowledge as mockRemoveProjectKnowledge,
  setConversationProject as mockSetConversationProject, setConversationStarred as mockSetConversationStarred,
  renameProject as mockRenameProject,
  renameConversation as mockRenameConversation, deleteConversation as mockDeleteConversation,
  persistArtifact as mockPersistArtifact, listServerArtifacts as mockListServerArtifacts,
  getServerArtifact as mockGetServerArtifact,
  setProjectVisibility as mockSetProjectVisibility,
  shareProject as mockShareProject, unshareProject as mockUnshareProject,
  listProjectMembers as mockListProjectMembers, listPeople as mockListPeople,
  publishConversation as mockPublishConversation, unpublishConversation as mockUnpublishConversation,
  listPublishedProjectConversations as mockListPublishedProjectConversations,
} from "./gateway.mock";

type TokenProvider = () => Promise<string | null>;

function normalizeBase(v: unknown): string {
  return typeof v === "string" ? v.replace(/\/+$/, "") : "";
}

let tokenProvider: TokenProvider | null = null;
let apiBase: string = normalizeBase((import.meta.env as Record<string, unknown>).VITE_FUNCTIONS_URL);
// B9: the STREAMING endpoint (theo_message_stream) lives on a SEPARATE sidecar Function App
// (vaultgpt-func-stream), distinct from the monolith `apiBase`. It has its own base URL — set at
// build via VITE_STREAM_FUNCTIONS_URL or injected at mount via configureGateway({ streamBaseUrl }).
// Used ONLY by sendMessageStream; all other calls (attachments, recents, reload, projects,
// non-streaming chat) stay on `apiBase`. When unset, streaming degrades to the non-streaming monolith path.
let streamBase: string = normalizeBase((import.meta.env as Record<string, unknown>).VITE_STREAM_FUNCTIONS_URL);
// VA-T8 voice (G-APIBASE Pass-3 resolution): the dictation + read-aloud handlers
// (theo_transcribe_audio / theo_synthesize_speech) live on the dedicated `vaultgpt-func-chat` app
// (Claude-deployable per DR-T7), NOT the monolith `apiBase` (which hosts theo_message). Its base URL
// is baked via VITE_CHAT_FUNCTIONS_URL (or injected via configureGateway), mirroring `streamBase` for
// the func-stream sidecar. Used ONLY by the two voice calls; falls back to `apiBase` when unset.
let chatBase: string = normalizeBase((import.meta.env as Record<string, unknown>).VITE_CHAT_FUNCTIONS_URL);
// Projects Phase C: file-backed project knowledge (theo_add_project_knowledge_file) lives on the
// dedicated `vaultgpt-func-projects` app (Claude-deployable per DR-T12; run-from-package per DR-T13),
// NOT the monolith `apiBase`. Baked via VITE_PROJECTS_FUNCTIONS_URL (or injected via configureGateway),
// mirroring streamBase/chatBase; defaults to the known func-projects host so the call never falls back
// to `apiBase` (which does not host the endpoint). Used ONLY by addProjectKnowledgeFile.
const DEFAULT_PROJECTS_BASE = "https://vaultgpt-func-projects.azurewebsites.net";
let projectsBase: string = normalizeBase((import.meta.env as Record<string, unknown>).VITE_PROJECTS_FUNCTIONS_URL) || DEFAULT_PROJECTS_BASE;

// Configured once by the federated TheoSurface mount with the Origin shell's token provider (and,
// optionally, the monolith Functions base URL and the streaming sidecar base URL). Supplying a token
// provider switches this gateway mock → live.
export function configureGateway(opts: { getAccessToken?: TokenProvider | null; baseUrl?: string | null; streamBaseUrl?: string | null; chatBaseUrl?: string | null; projectsBaseUrl?: string | null }): void {
  if (opts.getAccessToken !== undefined) tokenProvider = opts.getAccessToken;
  if (opts.baseUrl != null) apiBase = normalizeBase(opts.baseUrl);
  if (opts.streamBaseUrl != null) streamBase = normalizeBase(opts.streamBaseUrl);
  if (opts.chatBaseUrl != null) chatBase = normalizeBase(opts.chatBaseUrl);
  if (opts.projectsBaseUrl != null) projectsBase = normalizeBase(opts.projectsBaseUrl);
}

// True once a live backend is wired (token provider or a Functions base URL). Attachments require it.
function isLive(): boolean {
  return Boolean(apiBase || tokenProvider);
}
export function attachmentsAvailable(): boolean {
  return isLive();
}

// Auth headers for a live cross-origin call (Bearer = the shell's user identity token, not a model key).
async function authHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (tokenProvider) {
    const token = await tokenProvider();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

// ── Voice I/O (VA-T8 / API §2.11) — dictation + read-aloud through the deployed func-chat handlers
// (theo_transcribe_audio / theo_synthesize_speech), reached via `apiBase` + `authHeaders()` exactly
// like the other theo_* calls (theo_create_attachment_upload, also func-chat-hosted). No mock: voice
// requires a live backend (the composer gates the controls on `voiceAvailable()` = isLive()). Bytes
// travel base64 in/out of the JSON envelope; nothing is persisted in the browser (media APIs only). ──
export function voiceAvailable(): boolean {
  return isLive();
}
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const s = String(reader.result || "");
      const comma = s.indexOf(",");                 // strip the "data:<type>;base64," prefix
      resolve(comma >= 0 ? s.slice(comma + 1) : s);
    };
    reader.onerror = () => reject(new Error("Failed to read the audio recording."));
    reader.readAsDataURL(blob);
  });
}
function base64ToBlob(b64: string, contentType: string): Blob {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: contentType });
}
export async function transcribeAudio(input: { blob: Blob; contentType: string }): Promise<{ text: string }> {
  const headers = await authHeaders();
  const audio_base64 = await blobToBase64(input.blob);
  const voiceBase = chatBase || apiBase;   // voice lives on func-chat (chatBase); apiBase fallback
  const res = await fetch(`${voiceBase}/api/theo_transcribe_audio`, {
    method: "POST",
    credentials: "same-origin",
    headers,
    body: JSON.stringify({ audio_base64, content_type: input.contentType }),
  });
  let json: { data?: { text?: string }; error?: { message?: string } } | null = null;
  try { json = await res.json(); } catch { throw new Error(`Transcription returned a non-JSON response (HTTP ${res.status}).`); }
  if (!res.ok) throw new Error(json?.error?.message || `Transcription error (HTTP ${res.status}).`);
  return { text: typeof json?.data?.text === "string" ? json.data.text : "" };
}
export async function synthesizeSpeech(input: { text: string; voice?: string }): Promise<{ blob: Blob; contentType: string }> {
  const headers = await authHeaders();
  const voiceBase = chatBase || apiBase;   // voice lives on func-chat (chatBase); apiBase fallback
  const res = await fetch(`${voiceBase}/api/theo_synthesize_speech`, {
    method: "POST",
    credentials: "same-origin",
    headers,
    body: JSON.stringify({ text: input.text, ...(input.voice ? { voice: input.voice } : {}) }),
  });
  let json: { data?: { audio_base64?: string; content_type?: string }; error?: { message?: string } } | null = null;
  try { json = await res.json(); } catch { throw new Error(`Speech synthesis returned a non-JSON response (HTTP ${res.status}).`); }
  if (!res.ok) throw new Error(json?.error?.message || `Speech synthesis error (HTTP ${res.status}).`);
  const b64 = json?.data?.audio_base64;
  if (!b64) throw new Error("Speech synthesis returned no audio.");
  const contentType = json?.data?.content_type || "audio/mpeg";
  return { blob: base64ToBlob(b64, contentType), contentType };
}

export async function sendMessage(req: GatewayRequest, opts?: { signal?: AbortSignal }): Promise<GatewayResponse> {
  // No live backend wired (standalone dev harness) → preserve the 1A mock behavior unchanged.
  if (!apiBase && !tokenProvider) {
    return mockSend(req);
  }

  const headers = await authHeaders();

  // GatewayRequest {model, max_tokens, system, messages, conversation_id?, app_key?, app_context?,
  // attachment_ids?} → body {max_tokens, system, messages, conversation_id?, app_key?, app_context?,
  // attachment_ids?}. The handler injects the configured model (THEO_FOUNDRY_DEPLOYMENT); the client's
  // `model` is unused. conversation_id (B3a) appends to an existing thread; attachment_ids (B8d) inject
  // the owner-scoped attachments into the upstream user turn.
  const res = await fetch(`${apiBase}/api/theo_message`, {
    method: "POST",
    credentials: "same-origin",
    headers,
    signal: opts?.signal,   // stop-generating: also cancels the non-streaming one-shot fallback path
    body: JSON.stringify({
      max_tokens: req.max_tokens,
      system: req.system,
      messages: req.messages,
      ...(req.conversation_id ? { conversation_id: req.conversation_id } : {}),
      ...(req.app_key != null ? { app_key: req.app_key } : {}),
      ...(req.app_context != null ? { app_context: req.app_context } : {}),
      ...(req.attachment_ids && req.attachment_ids.length ? { attachment_ids: req.attachment_ids } : {}),
    }),
  });

  let json:
    | { data?: { content?: GatewayResponse["content"]; conversation_id?: string }; error?: { message?: string } }
    | null = null;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Theo gateway returned a non-JSON response (HTTP ${res.status}).`);
  }

  // Non-2xx → surface the handler's `{ error: { message } }` (the existing chat error state shows it).
  if (!res.ok) {
    throw new Error(json?.error?.message || `Theo gateway error (HTTP ${res.status}).`);
  }

  // Success envelope `{ data: { content: [{type:"text", text}], conversation_id, … }, meta }`.
  const content = json?.data?.content;
  if (!Array.isArray(content)) {
    throw new Error("Theo gateway response missing data.content[].");
  }
  const conversation_id = typeof json?.data?.conversation_id === "string" ? json.data.conversation_id : undefined;
  return { content, conversation_id };
}

// ── B8e attachment upload handshake (B8b/B8c endpoints) ───────────────────────────────────
// 1) create → owner-scoped write SAS; 2) PUT bytes straight to Blob (SAS is the auth — no Bearer,
// cross-origin to blob.core.windows.net, requires the storage account's CORS to allow PUT from the
// SWA origin); 3) finalize → the server reads the actual size/type, extracts text for extract-class,
// and inserts the owner-scoped row. Unconfigured dev harness → attachments unavailable (clear error).

export async function createAttachmentUpload(filename: string, contentType: string): Promise<AttachmentUpload> {
  if (!isLive()) throw new Error("Attachments are unavailable in the standalone preview.");
  const headers = await authHeaders();
  const res = await fetch(`${apiBase}/api/theo_create_attachment_upload`, {
    method: "POST",
    credentials: "same-origin",
    headers,
    body: JSON.stringify({ filename, content_type: contentType }),
  });
  let json: { data?: AttachmentUpload; error?: { message?: string } } | null = null;
  try { json = await res.json(); } catch { throw new Error(`Attachment upload init returned a non-JSON response (HTTP ${res.status}).`); }
  if (!res.ok) throw new Error(json?.error?.message || `Attachment upload init failed (HTTP ${res.status}).`);
  const data = json?.data;
  if (!data || !data.attachmentId || !data.upload?.uploadUrl) {
    throw new Error("Attachment upload init response missing data.upload.uploadUrl.");
  }
  return data;
}

export async function uploadToBlob(upload: AttachmentUpload["upload"], body: Blob): Promise<void> {
  // PUT directly to Blob using the SAS URL. No Authorization header — the SAS query is the credential.
  const res = await fetch(upload.uploadUrl, {
    method: "PUT",
    headers: { ...upload.requiredHeaders },
    body,
  });
  if (!res.ok) {
    throw new Error(`Direct-to-Blob upload failed (HTTP ${res.status}).`);
  }
}

export async function finalizeAttachment(
  attachmentId: string,
  filename: string,
  conversationId?: string | null
): Promise<{ id: string }> {
  if (!isLive()) throw new Error("Attachments are unavailable in the standalone preview.");
  const headers = await authHeaders();
  const res = await fetch(`${apiBase}/api/theo_finalize_attachment`, {
    method: "POST",
    credentials: "same-origin",
    headers,
    body: JSON.stringify({
      attachment_id: attachmentId,
      filename,
      ...(conversationId ? { conversation_id: conversationId } : {}),
    }),
  });
  let json: { data?: { attachment?: { id?: string } }; error?: { message?: string } } | null = null;
  try { json = await res.json(); } catch { throw new Error(`Attachment finalize returned a non-JSON response (HTTP ${res.status}).`); }
  if (!res.ok) throw new Error(json?.error?.message || `Attachment finalize failed (HTTP ${res.status}).`);
  const id = json?.data?.attachment?.id;
  if (typeof id !== "string") throw new Error("Attachment finalize response missing data.attachment.id.");
  return { id };
}

export async function deleteAttachment(id: string): Promise<void> {
  if (!isLive()) return; // nothing persisted in the standalone preview
  const headers = await authHeaders();
  await fetch(`${apiBase}/api/theo_delete_attachment`, {
    method: "POST",
    credentials: "same-origin",
    headers,
    body: JSON.stringify({ id }),
  });
  // Best-effort: a failed cleanup of an abandoned attachment is non-fatal to the UI.
}

// B3b — list the signed-in user's conversations (newest-first; backs Recents). Unconfigured → mock.
export async function listConversations(limit?: number): Promise<ConversationSummary[]> {
  if (!apiBase && !tokenProvider) {
    return mockList(limit);
  }
  const headers = await authHeaders();
  const query = limit != null ? `?limit=${encodeURIComponent(String(limit))}` : "";
  const res = await fetch(`${apiBase}/api/theo_list_conversations${query}`, {
    method: "GET",
    credentials: "same-origin",
    headers,
  });

  let json: { data?: { conversations?: ConversationSummary[] }; error?: { message?: string } } | null = null;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Theo gateway returned a non-JSON response (HTTP ${res.status}).`);
  }
  if (!res.ok) {
    throw new Error(json?.error?.message || `Theo gateway error (HTTP ${res.status}).`);
  }
  return Array.isArray(json?.data?.conversations) ? json.data.conversations : [];
}

// B4e — a project's conversations (theo_list_conversations?projectId; owner-scoped, B4d). Backs the
// per-project chat list in the project home. Unconfigured harness → mock (empty).
export async function listProjectConversations(projectId: string): Promise<ConversationSummary[]> {
  if (!apiBase && !tokenProvider) {
    return mockListProjectConversations(projectId);
  }
  const headers = await authHeaders();
  const res = await fetch(`${apiBase}/api/theo_list_conversations?projectId=${encodeURIComponent(projectId)}`, {
    method: "GET",
    credentials: "same-origin",
    headers,
  });
  let json: { data?: { conversations?: ConversationSummary[] }; error?: { message?: string } } | null = null;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Theo gateway returned a non-JSON response (HTTP ${res.status}).`);
  }
  if (!res.ok) {
    throw new Error(json?.error?.message || `Theo gateway error (HTTP ${res.status}).`);
  }
  return Array.isArray(json?.data?.conversations) ? json.data.conversations : [];
}

// B3b — fetch one conversation + its ordered messages (with persisted citations; backs reload). Unconfigured → mock.
export async function getConversation(id: string): Promise<ConversationDetail> {
  if (!apiBase && !tokenProvider) {
    return mockGet(id);
  }
  const headers = await authHeaders();
  const res = await fetch(`${apiBase}/api/theo_get_conversation?conversationId=${encodeURIComponent(id)}`, {
    method: "GET",
    credentials: "same-origin",
    headers,
  });

  let json: { data?: ConversationDetail; error?: { message?: string } } | null = null;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Theo gateway returned a non-JSON response (HTTP ${res.status}).`);
  }
  if (!res.ok) {
    throw new Error(json?.error?.message || `Theo gateway error (HTTP ${res.status}).`);
  }
  if (!json?.data?.conversation || !Array.isArray(json.data.messages)) {
    throw new Error("Theo gateway response missing data.conversation/messages.");
  }
  return json.data;
}

// B4f: rename a conversation (theo_rename_conversation {id, title}; deployed B4f). Owner-scoped;
// returns the server-confirmed { id, title }. Unconfigured dev harness → mock (echoes trimmed title).
export async function renameConversation(id: string, title: string): Promise<{ id: string; title: string }> {
  if (!apiBase && !tokenProvider) return mockRenameConversation(id, title);
  const headers = await authHeaders();
  const res = await fetch(`${apiBase}/api/theo_rename_conversation`, {
    method: "POST",
    credentials: "same-origin",
    headers,
    body: JSON.stringify({ id, title }),
  });
  let json: { data?: { conversation?: { id?: string; title?: string } }; error?: { message?: string } } | null = null;
  try { json = await res.json(); } catch { throw new Error(`Theo gateway returned a non-JSON response (HTTP ${res.status}).`); }
  if (!res.ok) throw new Error(json?.error?.message || `Theo gateway error (HTTP ${res.status}).`);
  const c = json?.data?.conversation;
  if (!c || typeof c.id !== "string" || typeof c.title !== "string") {
    throw new Error("Theo gateway response missing data.conversation.");
  }
  return { id: c.id, title: c.title };
}

// B4f: delete a conversation permanently (theo_delete_conversation {id}; deployed B4f). Owner-scoped;
// theo_messages cascade, theo_attachments.conversation_id → NULL. Unconfigured dev harness → mock no-op.
export async function deleteConversation(id: string): Promise<void> {
  if (!apiBase && !tokenProvider) return mockDeleteConversation(id);
  const headers = await authHeaders();
  const res = await fetch(`${apiBase}/api/theo_delete_conversation`, {
    method: "POST",
    credentials: "same-origin",
    headers,
    body: JSON.stringify({ id }),
  });
  if (!res.ok) {
    let json: { error?: { message?: string } } | null = null;
    try { json = await res.json(); } catch { /* non-JSON error body */ }
    throw new Error(json?.error?.message || `Theo gateway error (HTTP ${res.status}).`);
  }
}

// B8i — list a conversation's persisted attachments (reload parity). Owner-scoped; each row carries
// `message_seq` so the reload path can rehydrate chips on the matching user turn. Unconfigured dev
// harness → no persisted attachments (empty), mirroring the mock thread having none.
export async function listConversationAttachments(conversationId: string): Promise<ConversationAttachment[]> {
  if (!apiBase && !tokenProvider) {
    return [];
  }
  const headers = await authHeaders();
  const res = await fetch(
    `${apiBase}/api/theo_list_conversation_attachments?conversationId=${encodeURIComponent(conversationId)}`,
    {
      method: "GET",
      credentials: "same-origin",
      headers,
    }
  );

  let json: { data?: { attachments?: ConversationAttachment[] }; error?: { message?: string } } | null = null;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Theo gateway returned a non-JSON response (HTTP ${res.status}).`);
  }
  if (!res.ok) {
    throw new Error(json?.error?.message || `Theo gateway error (HTTP ${res.status}).`);
  }
  return Array.isArray(json?.data?.attachments) ? json.data.attachments : [];
}

// ── B4c projects + project-knowledge (theo_*_project / theo_*_project_knowledge; API Spec §2.2) ──
// Live CRUD for the Projects surface. Every call is owner-scoped server-side (created_by = the
// signed-in user); the browser attaches the same Bearer as the chat calls. Unconfigured dev harness
// → the in-memory mock (gateway.mock), mirroring the chat/recents fallbacks. The deployed rows carry
// name/description/instructions/app_key/timestamps (projects) and title/source_type/content/created_at
// (knowledge); these mappers project them onto the FE Project/Knowledge shapes with NO surface change.
// theo_list_projects intentionally omits knowledge (loaded per-project via listProjectKnowledge).
interface RawProject {
  id: string;
  name: string;
  description?: string | null;
  instructions?: string | null;
  app_key?: string | null;
  visibility?: string | null;   // B5a: 'private' | 'group'
  is_owner?: boolean;           // B5a: theo_list_projects computes (created_by = caller)
  shared_with_me?: boolean;     // B5c: theo_list_projects computes (a theo_project_members row for the caller)
  member_count?: number;        // B5d: owner-gated invitee count (0 for non-owner rows)
  created_at?: string;
  updated_at?: string;
}
interface RawKnowledge {
  id: string;
  project_id: string;
  title: string;
  source_type?: string;
  content?: string | null;
  created_at?: string;
}

// updated_at (ISO) → the FE `updated` display string (mirrors the mock's "just now"/"2d ago" idiom).
function relTime(iso?: string): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const diff = Date.now() - t;
  const min = 60000, hour = 3600000, day = 86400000;
  if (diff < min) return "just now";
  if (diff < hour) return `${Math.max(1, Math.floor(diff / min))}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return new Date(t).toLocaleDateString();
}

function toProject(r: RawProject): Project {
  return {
    id: r.id,
    name: r.name,
    desc: r.description ?? "",
    instructions: r.instructions ?? "",
    knowledge: [],                 // loaded per-project via listProjectKnowledge (list omits it)
    updated: relTime(r.updated_at),
    // B5a: default private/owned when a handler omits them (create/update return no visibility yet →
    // a freshly-created project is private and owned by the caller).
    visibility: r.visibility === "group" ? "group" : "private",
    isOwner: r.is_owner !== false,
    sharedWithMe: r.shared_with_me === true,   // B5c: only true when list computes a membership row
    memberCount: typeof r.member_count === "number" ? r.member_count : 0,   // B5d: owner-gated invitee count
  };
}

function toKnowledge(r: RawKnowledge): Knowledge {
  return { id: r.id, title: r.title, content: r.content ?? "", source_type: r.source_type === "file" ? "file" : "text" };
}

export async function listProjects(): Promise<Project[]> {
  if (!apiBase && !tokenProvider) return mockListProjects();
  const headers = await authHeaders();
  const res = await fetch(`${projectsBase}/api/theo_list_projects`, { method: "GET", credentials: "same-origin", headers });
  let json: { data?: { projects?: RawProject[] }; error?: { message?: string } } | null = null;
  try { json = await res.json(); } catch { throw new Error(`Theo gateway returned a non-JSON response (HTTP ${res.status}).`); }
  if (!res.ok) throw new Error(json?.error?.message || `Theo gateway error (HTTP ${res.status}).`);
  const arr = json?.data?.projects;
  return Array.isArray(arr) ? arr.map(toProject) : [];
}

// B5a: set project visibility (theo_set_project_visibility; owner-only server-side). The handler returns
// only { id, visibility }; useTheoState applies it onto the held Project. Unconfigured harness → mock.
export async function setProjectVisibility(id: string, visibility: string): Promise<{ id: string; visibility: string }> {
  if (!apiBase && !tokenProvider) return mockSetProjectVisibility(id, visibility);
  const headers = await authHeaders();
  const res = await fetch(`${projectsBase}/api/theo_set_project_visibility`, {
    method: "POST",
    credentials: "same-origin",
    headers,
    body: JSON.stringify({ id, visibility }),
  });
  let json: { data?: { project?: { id?: string; visibility?: string } }; error?: { message?: string } } | null = null;
  try { json = await res.json(); } catch { throw new Error(`Theo gateway returned a non-JSON response (HTTP ${res.status}).`); }
  if (!res.ok) throw new Error(json?.error?.message || `Theo gateway error (HTTP ${res.status}).`);
  const p = json?.data?.project;
  if (!p || typeof p.visibility !== "string") throw new Error("Theo gateway response missing data.project.visibility.");
  return { id: p.id ?? id, visibility: p.visibility };
}

// B5c: invite a specific Vault user to a project (theo_share_project; owner-only server-side). memberOid
// is an Entra object id (the identity theo_list_people returns). Idempotent server-side. Unconfigured → mock.
export async function shareProject(projectId: string, memberOid: string): Promise<void> {
  if (!apiBase && !tokenProvider) return mockShareProject(projectId, memberOid);
  const headers = await authHeaders();
  const res = await fetch(`${projectsBase}/api/theo_share_project`, {
    method: "POST",
    credentials: "same-origin",
    headers,
    body: JSON.stringify({ project_id: projectId, member_oid: memberOid }),
  });
  let json: { error?: { message?: string } } | null = null;
  try { json = await res.json(); } catch { throw new Error(`Theo gateway returned a non-JSON response (HTTP ${res.status}).`); }
  if (!res.ok) throw new Error(json?.error?.message || `Theo gateway error (HTTP ${res.status}).`);
}

// B5c: revoke a member (theo_unshare_project; owner-only; idempotent). Unconfigured → mock.
export async function unshareProject(projectId: string, memberOid: string): Promise<void> {
  if (!apiBase && !tokenProvider) return mockUnshareProject(projectId, memberOid);
  const headers = await authHeaders();
  const res = await fetch(`${projectsBase}/api/theo_unshare_project`, {
    method: "POST",
    credentials: "same-origin",
    headers,
    body: JSON.stringify({ project_id: projectId, member_oid: memberOid }),
  });
  let json: { error?: { message?: string } } | null = null;
  try { json = await res.json(); } catch { throw new Error(`Theo gateway returned a non-JSON response (HTTP ${res.status}).`); }
  if (!res.ok) throw new Error(json?.error?.message || `Theo gateway error (HTTP ${res.status}).`);
}

interface RawMember { project_id?: string; member_oid?: string; invited_by?: string; created_at?: string }
function toMember(r: RawMember): ProjectMember {
  return { memberOid: r.member_oid ?? "", invitedBy: r.invited_by ?? "", createdAt: r.created_at ?? "" };
}

// B5c: list a project's members (theo_list_project_members?projectId; owner-only server-side). Unconfigured → mock.
export async function listProjectMembers(projectId: string): Promise<ProjectMember[]> {
  if (!apiBase && !tokenProvider) return mockListProjectMembers(projectId);
  const headers = await authHeaders();
  const res = await fetch(`${projectsBase}/api/theo_list_project_members?projectId=${encodeURIComponent(projectId)}`, {
    method: "GET",
    credentials: "same-origin",
    headers,
  });
  let json: { data?: { members?: RawMember[] }; error?: { message?: string } } | null = null;
  try { json = await res.json(); } catch { throw new Error(`Theo gateway returned a non-JSON response (HTTP ${res.status}).`); }
  if (!res.ok) throw new Error(json?.error?.message || `Theo gateway error (HTTP ${res.status}).`);
  const arr = json?.data?.members;
  return Array.isArray(arr) ? arr.filter((m) => typeof m.member_oid === "string" && m.member_oid).map(toMember) : [];
}

// SPW Phase 2: publish a conversation to its linked project (theo_publish_conversation; conversation-
// owner-only server-side; requires the conversation be project-linked). Idempotent. Unconfigured → mock.
export async function publishConversation(conversationId: string): Promise<void> {
  if (!apiBase && !tokenProvider) return mockPublishConversation(conversationId);
  const headers = await authHeaders();
  const res = await fetch(`${projectsBase}/api/theo_publish_conversation`, {
    method: "POST",
    credentials: "same-origin",
    headers,
    body: JSON.stringify({ conversation_id: conversationId }),
  });
  let json: { error?: { message?: string } } | null = null;
  try { json = await res.json(); } catch { throw new Error(`Theo gateway returned a non-JSON response (HTTP ${res.status}).`); }
  if (!res.ok) throw new Error(json?.error?.message || `Theo gateway error (HTTP ${res.status}).`);
}

// SPW Phase 2: revert a published conversation to private (theo_unpublish_conversation; owner-only;
// idempotent). Unconfigured → mock.
export async function unpublishConversation(conversationId: string): Promise<void> {
  if (!apiBase && !tokenProvider) return mockUnpublishConversation(conversationId);
  const headers = await authHeaders();
  const res = await fetch(`${projectsBase}/api/theo_unpublish_conversation`, {
    method: "POST",
    credentials: "same-origin",
    headers,
    body: JSON.stringify({ conversation_id: conversationId }),
  });
  let json: { error?: { message?: string } } | null = null;
  try { json = await res.json(); } catch { throw new Error(`Theo gateway returned a non-JSON response (HTTP ${res.status}).`); }
  if (!res.ok) throw new Error(json?.error?.message || `Theo gateway error (HTTP ${res.status}).`);
}

interface RawPublishedConversation {
  id?: string; title?: string | null; created_by?: string;
  created_at?: string; updated_at?: string;
  published_at?: string | null; published_by?: string | null;
}
function toPublishedConversation(r: RawPublishedConversation): PublishedConversation {
  return {
    id: r.id ?? "",
    title: typeof r.title === "string" ? r.title : null,
    created_by: r.created_by ?? "",
    created_at: r.created_at ?? "",
    updated_at: r.updated_at ?? "",
    published_at: typeof r.published_at === "string" ? r.published_at : null,
    published_by: typeof r.published_by === "string" ? r.published_by : null,
  };
}

// SPW Phase 2: the conversations PUBLISHED to a project (theo_list_project_conversations?projectId;
// visible to any participant server-side). Unconfigured → mock. Distinct from listProjectConversations
// (the caller's OWN chats in a project, theo_list_conversations?projectId).
export async function listPublishedProjectConversations(projectId: string): Promise<PublishedConversation[]> {
  if (!apiBase && !tokenProvider) return mockListPublishedProjectConversations(projectId);
  const headers = await authHeaders();
  const res = await fetch(`${projectsBase}/api/theo_list_project_conversations?projectId=${encodeURIComponent(projectId)}`, {
    method: "GET",
    credentials: "same-origin",
    headers,
  });
  let json: { data?: { conversations?: RawPublishedConversation[] }; error?: { message?: string } } | null = null;
  try { json = await res.json(); } catch { throw new Error(`Theo gateway returned a non-JSON response (HTTP ${res.status}).`); }
  if (!res.ok) throw new Error(json?.error?.message || `Theo gateway error (HTTP ${res.status}).`);
  const arr = json?.data?.conversations;
  return Array.isArray(arr) ? arr.filter((c) => typeof c.id === "string" && c.id).map(toPublishedConversation) : [];
}

interface RawPerson {
  id?: string; displayName?: string; email?: string | null; jobTitle?: string | null;
  availability?: string | null; activity?: string | null; photo?: string | null; isSelf?: boolean;
}
function toPerson(r: RawPerson): Person {
  return {
    id: r.id ?? "",
    displayName: typeof r.displayName === "string" && r.displayName ? r.displayName : "(unknown)",
    email: typeof r.email === "string" ? r.email : null,
    jobTitle: typeof r.jobTitle === "string" ? r.jobTitle : null,
    availability: typeof r.availability === "string" ? r.availability : null,
    activity: typeof r.activity === "string" ? r.activity : null,
    photo: typeof r.photo === "string" ? r.photo : null,
    isSelf: r.isSelf === true,
  };
}

// B5c: the Vault Staff roster + presence (theo_list_people; §2.9) — the invite picker's source. Delegated
// Graph OBO server-side; the FE sends only the bearer. Unconfigured harness → mock (empty roster).
export async function listPeople(): Promise<Person[]> {
  if (!apiBase && !tokenProvider) return mockListPeople();
  const headers = await authHeaders();
  const res = await fetch(`${apiBase}/api/theo_list_people`, { method: "GET", credentials: "same-origin", headers });
  let json: { data?: { people?: RawPerson[] }; error?: { message?: string } } | null = null;
  try { json = await res.json(); } catch { throw new Error(`Theo gateway returned a non-JSON response (HTTP ${res.status}).`); }
  if (!res.ok) throw new Error(json?.error?.message || `Theo gateway error (HTTP ${res.status}).`);
  const arr = json?.data?.people;
  return Array.isArray(arr) ? arr.filter((p) => typeof p.id === "string" && p.id).map(toPerson) : [];
}

export async function createProject(d: NpDraft): Promise<Project> {
  if (!apiBase && !tokenProvider) return mockCreateProject(d);
  const headers = await authHeaders();
  const res = await fetch(`${projectsBase}/api/theo_create_project`, {
    method: "POST",
    credentials: "same-origin",
    headers,
    body: JSON.stringify({ name: d.name.trim(), description: d.desc.trim(), instructions: d.instructions.trim() }),
  });
  let json: { data?: { project?: RawProject }; error?: { message?: string } } | null = null;
  try { json = await res.json(); } catch { throw new Error(`Theo gateway returned a non-JSON response (HTTP ${res.status}).`); }
  if (!res.ok) throw new Error(json?.error?.message || `Theo gateway error (HTTP ${res.status}).`);
  const p = json?.data?.project;
  if (!p) throw new Error("Theo gateway response missing data.project.");
  return toProject(p);
}

// Get-or-create a project keyed to an external ref (host app + source_ref) — the deployed
// theo_get_or_create_review_project (idempotent; 201 create / 200 existing). Mirrors createProject's
// fetch/toProject idiom. Used to map a Sigma review (source_ref = sigma_review_id) to one Theo project.
export async function getOrCreateReviewProject(appKey: string, sourceRef: string, name: string): Promise<Project> {
  const headers = await authHeaders();
  const res = await fetch(`${projectsBase}/api/theo_get_or_create_review_project`, {
    method: "POST",
    credentials: "same-origin",
    headers,
    body: JSON.stringify({ app_key: appKey, source_ref: sourceRef, name: name.trim() }),
  });
  let json: { data?: { project?: RawProject }; error?: { message?: string } } | null = null;
  try { json = await res.json(); } catch { throw new Error(`Theo gateway returned a non-JSON response (HTTP ${res.status}).`); }
  if (!res.ok) throw new Error(json?.error?.message || `Theo gateway error (HTTP ${res.status}).`);
  const p = json?.data?.project;
  if (!p) throw new Error("Theo gateway response missing data.project.");
  return toProject(p);
}

export async function updateProjectInstructions(id: string, instructions: string): Promise<Project> {
  if (!apiBase && !tokenProvider) return mockUpdateProjectInstructions(id, instructions);
  const headers = await authHeaders();
  const res = await fetch(`${projectsBase}/api/theo_update_project`, {
    method: "POST",
    credentials: "same-origin",
    headers,
    body: JSON.stringify({ id, instructions }),
  });
  let json: { data?: { project?: RawProject }; error?: { message?: string } } | null = null;
  try { json = await res.json(); } catch { throw new Error(`Theo gateway returned a non-JSON response (HTTP ${res.status}).`); }
  if (!res.ok) throw new Error(json?.error?.message || `Theo gateway error (HTTP ${res.status}).`);
  const p = json?.data?.project;
  if (!p) throw new Error("Theo gateway response missing data.project.");
  return toProject(p);
}

// B4g: edit the project description (theo_update_project {id, description}; deployed B4a). Reuses the
// generalized update handler — only `description` is sent (may be "" to clear). Returns the mapped Project.
export async function updateProjectDescription(id: string, description: string): Promise<Project> {
  if (!apiBase && !tokenProvider) return mockUpdateProjectDescription(id, description);
  const headers = await authHeaders();
  const res = await fetch(`${projectsBase}/api/theo_update_project`, {
    method: "POST",
    credentials: "same-origin",
    headers,
    body: JSON.stringify({ id, description }),
  });
  let json: { data?: { project?: RawProject }; error?: { message?: string } } | null = null;
  try { json = await res.json(); } catch { throw new Error(`Theo gateway returned a non-JSON response (HTTP ${res.status}).`); }
  if (!res.ok) throw new Error(json?.error?.message || `Theo gateway error (HTTP ${res.status}).`);
  const p = json?.data?.project;
  if (!p) throw new Error("Theo gateway response missing data.project.");
  return toProject(p);
}

// B4f: rename a project (theo_update_project {id, name}; deployed B4a). Reuses the generalized
// update handler — only `name` is sent. Returns the mapped Project (name/desc/instructions/updated).
export async function renameProject(id: string, name: string): Promise<Project> {
  if (!apiBase && !tokenProvider) return mockRenameProject(id, name);
  const headers = await authHeaders();
  const res = await fetch(`${projectsBase}/api/theo_update_project`, {
    method: "POST",
    credentials: "same-origin",
    headers,
    body: JSON.stringify({ id, name }),
  });
  let json: { data?: { project?: RawProject }; error?: { message?: string } } | null = null;
  try { json = await res.json(); } catch { throw new Error(`Theo gateway returned a non-JSON response (HTTP ${res.status}).`); }
  if (!res.ok) throw new Error(json?.error?.message || `Theo gateway error (HTTP ${res.status}).`);
  const p = json?.data?.project;
  if (!p) throw new Error("Theo gateway response missing data.project.");
  return toProject(p);
}

export async function deleteProject(id: string): Promise<void> {
  if (!apiBase && !tokenProvider) return mockDeleteProject(id);
  const headers = await authHeaders();
  const res = await fetch(`${projectsBase}/api/theo_delete_project`, {
    method: "POST",
    credentials: "same-origin",
    headers,
    body: JSON.stringify({ id }),
  });
  if (!res.ok) {
    let json: { error?: { message?: string } } | null = null;
    try { json = await res.json(); } catch { /* non-JSON error body */ }
    throw new Error(json?.error?.message || `Theo gateway error (HTTP ${res.status}).`);
  }
}

export async function listProjectKnowledge(projectId: string): Promise<Knowledge[]> {
  if (!apiBase && !tokenProvider) return mockListProjectKnowledge(projectId);
  const headers = await authHeaders();
  const res = await fetch(`${projectsBase}/api/theo_list_project_knowledge?projectId=${encodeURIComponent(projectId)}`, {
    method: "GET",
    credentials: "same-origin",
    headers,
  });
  let json: { data?: { knowledge?: RawKnowledge[] }; error?: { message?: string } } | null = null;
  try { json = await res.json(); } catch { throw new Error(`Theo gateway returned a non-JSON response (HTTP ${res.status}).`); }
  if (!res.ok) throw new Error(json?.error?.message || `Theo gateway error (HTTP ${res.status}).`);
  const arr = json?.data?.knowledge;
  return Array.isArray(arr) ? arr.map(toKnowledge) : [];
}

export async function addProjectKnowledge(projectId: string, k: KDraft): Promise<Knowledge> {
  if (!apiBase && !tokenProvider) return mockAddProjectKnowledge(projectId, k);
  const headers = await authHeaders();
  const res = await fetch(`${projectsBase}/api/theo_add_project_knowledge`, {
    method: "POST",
    credentials: "same-origin",
    headers,
    body: JSON.stringify({ project_id: projectId, title: k.title.trim(), content: k.content.trim() }),
  });
  let json: { data?: { knowledge?: RawKnowledge }; error?: { message?: string } } | null = null;
  try { json = await res.json(); } catch { throw new Error(`Theo gateway returned a non-JSON response (HTTP ${res.status}).`); }
  if (!res.ok) throw new Error(json?.error?.message || `Theo gateway error (HTTP ${res.status}).`);
  const item = json?.data?.knowledge;
  if (!item) throw new Error("Theo gateway response missing data.knowledge.");
  return toKnowledge(item);
}

// Projects Phase C: turn an already-uploaded+finalized attachment into a FILE-backed knowledge item.
// Runs against the dedicated `vaultgpt-func-projects` app (projectsBase), not the monolith apiBase.
export async function addProjectKnowledgeFile(projectId: string, attachmentId: string, title?: string): Promise<Knowledge> {
  if (!apiBase && !tokenProvider) return mockAddProjectKnowledgeFile(projectId, attachmentId, title);
  const headers = await authHeaders();
  const body: Record<string, unknown> = { project_id: projectId, attachment_id: attachmentId };
  if (title && title.trim()) body.title = title.trim();
  const res = await fetch(`${projectsBase}/api/theo_add_project_knowledge_file`, {
    method: "POST",
    credentials: "same-origin",
    headers,
    body: JSON.stringify(body),
  });
  let json: { data?: { knowledge?: RawKnowledge }; error?: { message?: string } } | null = null;
  try { json = await res.json(); } catch { throw new Error(`Theo gateway returned a non-JSON response (HTTP ${res.status}).`); }
  if (!res.ok) throw new Error(json?.error?.message || `Theo gateway error (HTTP ${res.status}).`);
  const item = json?.data?.knowledge;
  if (!item) throw new Error("Theo gateway response missing data.knowledge.");
  return toKnowledge(item);
}

export async function removeProjectKnowledge(knowledgeId: string): Promise<void> {
  if (!apiBase && !tokenProvider) return mockRemoveProjectKnowledge(knowledgeId);
  const headers = await authHeaders();
  const res = await fetch(`${projectsBase}/api/theo_remove_project_knowledge`, {
    method: "POST",
    credentials: "same-origin",
    headers,
    body: JSON.stringify({ knowledge_id: knowledgeId }),
  });
  if (!res.ok) {
    let json: { error?: { message?: string } } | null = null;
    try { json = await res.json(); } catch { /* non-JSON error body */ }
    throw new Error(json?.error?.message || `Theo gateway error (HTTP ${res.status}).`);
  }
}

// B4d: link a conversation to a project (theo_set_conversation_project). Owner-scoped, idempotent
// set-once server-side; the FE calls it once after a project chat's first turn returns a
// conversation_id. Unconfigured dev harness → mock no-op (no persistent conversations to tag).
export async function setConversationProject(conversationId: string, projectId: string): Promise<void> {
  if (!apiBase && !tokenProvider) return mockSetConversationProject(conversationId, projectId);
  const headers = await authHeaders();
  const res = await fetch(`${projectsBase}/api/theo_set_conversation_project`, {
    method: "POST",
    credentials: "same-origin",
    headers,
    body: JSON.stringify({ conversation_id: conversationId, project_id: projectId }),
  });
  if (!res.ok) {
    let json: { error?: { message?: string } } | null = null;
    try { json = await res.json(); } catch { /* non-JSON error body */ }
    throw new Error(json?.error?.message || `Theo gateway error (HTTP ${res.status}).`);
  }
}

export async function setConversationStarred(conversationId: string, starred: boolean): Promise<void> {
  if (!apiBase && !tokenProvider) return mockSetConversationStarred(conversationId, starred);
  const headers = await authHeaders();
  const res = await fetch(`${apiBase}/api/theo_set_conversation_starred`, {
    method: "POST",
    credentials: "same-origin",
    headers,
    body: JSON.stringify({ conversation_id: conversationId, starred }),
  });
  if (!res.ok) {
    let json: { error?: { message?: string } } | null = null;
    try { json = await res.json(); } catch { /* non-JSON error body */ }
    throw new Error(json?.error?.message || `Theo gateway error (HTTP ${res.status}).`);
  }
}

// ── B4h artifacts persistence (theo_upsert/list/get_artifact; API Spec §2.3) ─────────────────
// Owner-scoped server-side; version content lives in Blob (the row holds the pointer). Unconfigured
// dev harness → the in-memory mock (empty gallery). Deployed rows carry id/title/type/current_version
// /timestamps (+ versions[{version_number,content,byte_size,content_type,created_at}] on get); these
// mappers project them onto the FE ArtifactSummary / Artifact shapes.
interface RawArtifact {
  id: string;
  title: string;
  type: string;
  current_version?: number;
  updated_at?: string;
  versions?: { version_number: number; content?: string | null; byte_size?: number | null; content_type?: string | null; created_at?: string }[];
}

function toArtifactType(t: string): Artifact["type"] {
  return t === "code" || t === "html" ? t : "document";
}

function toArtifactSummary(r: RawArtifact): ArtifactSummary {
  return {
    id: r.id,
    title: r.title,
    type: toArtifactType(r.type),
    currentVersion: typeof r.current_version === "number" ? r.current_version : 1,
    updated: relTime(r.updated_at),
  };
}

// theo_get_artifact → the in-memory Artifact shape (versions ordered ascending; content from Blob).
function toArtifact(r: RawArtifact): Artifact {
  const versions = Array.isArray(r.versions) ? r.versions : [];
  return {
    id: r.id,
    title: r.title,
    type: toArtifactType(r.type),
    versions: versions.map((v) => ({ content: v.content ?? "", ts: v.created_at ? Date.parse(v.created_at) || v.version_number : v.version_number })),
  };
}

// Persist (create-or-add-version, keyed by title server-side). Best-effort caller; returns id + version.
export async function persistArtifact(input: { title: string; type: string; content: string; conversationId?: string | null }): Promise<{ id: string; currentVersion: number }> {
  if (!apiBase && !tokenProvider) return mockPersistArtifact(input);
  const headers = await authHeaders();
  const res = await fetch(`${apiBase}/api/theo_upsert_artifact`, {
    method: "POST",
    credentials: "same-origin",
    headers,
    body: JSON.stringify({
      title: input.title,
      type: input.type,
      content: input.content,
      ...(input.conversationId ? { conversation_id: input.conversationId } : {}),
    }),
  });
  let json: { data?: { artifact?: { id?: string; current_version?: number } }; error?: { message?: string } } | null = null;
  try { json = await res.json(); } catch { throw new Error(`Theo gateway returned a non-JSON response (HTTP ${res.status}).`); }
  if (!res.ok) throw new Error(json?.error?.message || `Theo gateway error (HTTP ${res.status}).`);
  const a = json?.data?.artifact;
  if (!a || typeof a.id !== "string") throw new Error("Theo gateway response missing data.artifact.");
  return { id: a.id, currentVersion: typeof a.current_version === "number" ? a.current_version : 1 };
}

export async function listServerArtifacts(): Promise<ArtifactSummary[]> {
  if (!apiBase && !tokenProvider) return mockListServerArtifacts();
  const headers = await authHeaders();
  const res = await fetch(`${apiBase}/api/theo_list_artifacts`, { method: "GET", credentials: "same-origin", headers });
  let json: { data?: { artifacts?: RawArtifact[] }; error?: { message?: string } } | null = null;
  try { json = await res.json(); } catch { throw new Error(`Theo gateway returned a non-JSON response (HTTP ${res.status}).`); }
  if (!res.ok) throw new Error(json?.error?.message || `Theo gateway error (HTTP ${res.status}).`);
  const arr = json?.data?.artifacts;
  return Array.isArray(arr) ? arr.map(toArtifactSummary) : [];
}

export async function getServerArtifact(id: string): Promise<Artifact> {
  if (!apiBase && !tokenProvider) return mockGetServerArtifact(id);
  const headers = await authHeaders();
  const res = await fetch(`${apiBase}/api/theo_get_artifact?artifactId=${encodeURIComponent(id)}`, { method: "GET", credentials: "same-origin", headers });
  let json: { data?: { artifact?: RawArtifact }; error?: { message?: string } } | null = null;
  try { json = await res.json(); } catch { throw new Error(`Theo gateway returned a non-JSON response (HTTP ${res.status}).`); }
  if (!res.ok) throw new Error(json?.error?.message || `Theo gateway error (HTTP ${res.status}).`);
  const a = json?.data?.artifact;
  if (!a || typeof a.id !== "string") throw new Error("Theo gateway response missing data.artifact.");
  return toArtifact(a);
}

// ── B9 streaming chat (theo_message_stream on the v4 sidecar) ───────────────────────────────
// Calls the streaming endpoint and invokes `handlers` as Anthropic SSE events arrive: text deltas
// (the live answer), thinking deltas (collapsible panel), citations, and the final app-level
// `vault_meta` event (the conversation id). Pre-stream failures arrive as a normal JSON error body
// (the handler returns JSON before committing to the stream) and are thrown with the server message,
// exactly like the non-streaming path; a mid-stream `vault_error` is thrown too. Unconfigured dev
// harness (no live backend) → falls back to the non-streaming mock and emits the whole reply once.
export interface StreamCitation { url?: string; title?: string; cited_text?: string }
export interface StreamHandlers {
  onText: (delta: string) => void;
  onThinking?: (delta: string) => void;
  onCitation?: (c: StreamCitation) => void;
  onMeta?: (meta: { conversation_id?: string; model?: string }) => void;
  // VA-T7 review-agent activity (sigma_review_agent_stream only): a tool call fired (`tool`) and its
  // completion (`tool_result`). Additive/optional — the general chat path never invokes them.
  onTool?: (t: { name: string; input: unknown }) => void;
  onToolResult?: (t: { name: string; ok: boolean }) => void;
  // DR-T11 tool-loop: a downloadable tool result (theo_export_spreadsheet et al.) arrived as the
  // additive `event: vault_export` SSE frame. General chat only; additive — absent = no download card.
  onExport?: (d: FileDownload) => void;
  // FindImage inline display: theo_find_image → `event: vault_image`. Additive; general chat only.
  onImage?: (img: InlineImage) => void;
  // FindVideo inline display: theo_find_video → `event: vault_video`. Additive; general chat only.
  onVideo?: (v: InlineVideo) => void;
  // DR-T11 tool-loop live activity (VA-T7 "live token count"): the running CUMULATIVE output-token
  // count for the activity-panel header, streamed by the backend as `event: vault_tokens` — a char/4
  // estimate between turns that SNAPS to the authoritative usage total at each turn boundary. An
  // absolute value (set it, do not sum). Best-effort; general chat.
  onTokens?: (t: { tokens: number }) => void;
}

export async function sendMessageStream(req: GatewayRequest, handlers: StreamHandlers, opts?: { signal?: AbortSignal }): Promise<void> {
  // Dev harness: no live backend → use the mock and emit the whole reply once (keeps the harness usable).
  if (!apiBase && !tokenProvider) {
    const res = await mockSend(req);
    const text = (res.content || []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("\n");
    if (text) handlers.onText(text);
    if (res.conversation_id) handlers.onMeta?.({ conversation_id: res.conversation_id });
    return;
  }

  // Streaming requires the sidecar base (a different host than the monolith `apiBase`). If it isn't
  // configured, degrade to the non-streaming monolith call and emit the whole reply once — chat
  // still works, just not streamed. (apiBase is NEVER used for the stream endpoint.)
  if (!streamBase) {
    const res = await sendMessage(req, opts);   // stop-generating: forward the signal so Stop cancels the one-shot fallback too
    const text = (res.content || []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("\n");
    if (text) handlers.onText(text);
    if (res.conversation_id) handlers.onMeta?.({ conversation_id: res.conversation_id });
    return;
  }

  const headers = await authHeaders();
  const resp = await fetch(`${streamBase}/api/theo_message_stream`, {
    method: "POST",
    credentials: "same-origin",
    headers,
    signal: opts?.signal,   // stop-generating: aborting rejects reader.read() with AbortError → propagates to send()'s catch
    body: JSON.stringify({
      max_tokens: req.max_tokens,
      system: req.system,
      messages: req.messages,
      ...(req.conversation_id ? { conversation_id: req.conversation_id } : {}),
      ...(req.app_key != null ? { app_key: req.app_key } : {}),
      ...(req.app_context != null ? { app_context: req.app_context } : {}),
      ...(req.attachment_ids && req.attachment_ids.length ? { attachment_ids: req.attachment_ids } : {}),
      ...(req.project_id != null ? { project_id: req.project_id } : {}),
    }),
  });

  // Pre-stream error (auth/validation/ownership/gateway) → JSON error body; surface its message.
  if (!resp.ok || !resp.body) {
    let msg = `Theo gateway error (HTTP ${resp.status}).`;
    try {
      const j = (await resp.json()) as { error?: { message?: string } };
      msg = j?.error?.message || msg;
    } catch { /* non-JSON error body */ }
    throw new Error(msg);
  }

  // Read the SSE body incrementally; dispatch one complete event (separated by a blank line) at a time.
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let sep: number;
    while ((sep = buf.indexOf("\n\n")) >= 0) {
      const evt = buf.slice(0, sep);
      buf = buf.slice(sep + 2);
      const dataLine = evt.split("\n").find((l) => l.startsWith("data:"));
      if (!dataLine) continue;
      let j: Record<string, unknown> | null = null;
      try { j = JSON.parse(dataLine.slice(5).trim()) as Record<string, unknown>; } catch { continue; }
      if (!j || typeof j !== "object") continue;

      if (evt.includes("event: vault_error")) {
        throw new Error((j.message as string) || "The model stream was interrupted.");
      }
      if (evt.includes("event: vault_meta")) {
        handlers.onMeta?.({ conversation_id: j.conversation_id as string | undefined, model: j.model as string | undefined });
        continue;
      }
      // DR-T11: a downloadable tool result → render a DownloadCard on this turn (additive; the FE
      // ignores it when no handler is wired). The payload IS the tool's `data` object.
      if (evt.includes("event: vault_export")) {
        if (typeof j.downloadUrl === "string" && typeof j.filename === "string") {
          handlers.onExport?.({
            downloadUrl: j.downloadUrl as string,
            filename: j.filename as string,
            contentType: j.contentType as string | undefined,
            byteSize: typeof j.byteSize === "number" ? (j.byteSize as number) : undefined,
            expiresAt: j.expiresAt as string | undefined,
          });
        }
        continue;
      }
      // FindImage inline display: theo_find_image → `event: vault_image`. The FE holds the exact URL
      // (from the frame) and renders it via the VA-T1 image treatment; the model no longer transcribes
      // it. Additive — absent handler = no image (safe).
      if (evt.includes("event: vault_image")) {
        if (typeof j.url === "string" && (j.url as string).startsWith("https://")) {
          handlers.onImage?.({
            url: j.url as string,
            title: j.title as string | undefined,
            source: j.source as string | undefined,
            pageUrl: j.pageUrl as string | undefined,
            license: j.license as string | undefined,
            creator: j.creator as string | undefined,
            images: Array.isArray(j.images) ? (j.images as InlineImageItem[]) : undefined,
          });
        }
        continue;
      }
      // FindVideo inline display: theo_find_video → `event: vault_video`. The FE holds the exact URL
      // (from the frame) and renders an in-chat YouTube iframe (embedUrl) or a thumbnail link-card
      // (videoUrl); the model no longer transcribes it. Additive — absent handler = no video (safe).
      if (evt.includes("event: vault_video")) {
        if (typeof j.videoUrl === "string" && (j.videoUrl as string).startsWith("https://")) {
          handlers.onVideo?.({
            videoUrl: j.videoUrl as string,
            embedUrl: j.embedUrl as string | undefined,
            title: j.title as string | undefined,
            thumbnail: j.thumbnail as string | undefined,
            source: j.source as string | undefined,
            duration: j.duration as string | undefined,
            date: j.date as string | undefined,
          });
        }
        continue;
      }
      // DR-T11 tool-loop live activity (VA-T7). Order matters: `event: tool_result` MUST be matched
      // before `event: tool` (the latter is a substring of the former).
      if (evt.includes("event: tool_result")) {
        handlers.onToolResult?.({ name: typeof j.name === "string" ? j.name : "", ok: Boolean(j.ok) });
        continue;
      }
      if (evt.includes("event: tool")) {
        handlers.onTool?.({ name: typeof j.name === "string" ? j.name : "", input: j.input });
        continue;
      }
      // DR-T11 tool-loop live activity (VA-T7): the backend streams a running CUMULATIVE output-token
      // count as `event: vault_tokens` so the header climbs live during the otherwise-silent tool_use
      // build (the payload arrives as invisible input_json_delta). Absolute value — set, don't sum.
      if (evt.includes("event: vault_tokens")) {
        if (typeof j.tokens === "number") handlers.onTokens?.({ tokens: j.tokens as number });
        continue;
      }
      if (j.type === "content_block_delta" && j.delta && typeof j.delta === "object") {
        const delta = j.delta as Record<string, unknown>;
        if (delta.type === "text_delta" && typeof delta.text === "string") handlers.onText(delta.text);
        else if (delta.type === "thinking_delta" && typeof delta.thinking === "string") handlers.onThinking?.(delta.thinking);
        else if (delta.type === "citations_delta" && delta.citation && typeof delta.citation === "object") handlers.onCitation?.(delta.citation as StreamCitation);
      }
    }
  }
}

// ── Sigma K-1 review agent (streaming) — sibling of sendMessageStream on the SAME func-stream sidecar
// (theo_message_stream + sigma_review_agent_stream share `streamBase`), different path. Consumes the
// agent's CLEAN SSE protocol (NOT the raw Anthropic frames sendMessageStream parses):
//   event: delta        {kind:'text'|'thinking', text}  → onText / onThinking
//   event: tool         {name, input}                    → onTool     (a deterministic tool fired)
//   event: tool_result  {name, ok}                       → onToolResult (that tool finished)
//   event: done         {conversation_id, model}         → onMeta
//   event: error        {message}                        → throw
// Request body { review_id, files, messages, conversation_id? }: review_id + files come from the
// conversation's app_context (Sigma supplies them when a review is open); the deployed handler requires
// a uuid review_id and files.input/files.output as { driveId, itemId }. Routing (only when a COMPLETE
// review payload is present) is decided upstream in useTheoState (hasReviewContext) — this fn assumes it.
// Pre-stream failures arrive as a JSON error body (thrown with the server message), like sendMessageStream.
export async function sendReviewAgentStream(req: GatewayRequest, handlers: StreamHandlers, opts?: { signal?: AbortSignal }): Promise<void> {
  // The review agent has no mock/degraded path: it runs the deterministic engine on func-stream. Without
  // the streaming sidecar configured (standalone dev harness), surface a clear, non-crashing message.
  if (!streamBase) {
    throw new Error("The review agent isn't available in this preview (streaming endpoint not configured).");
  }
  const ctx = (req.app_context ?? {}) as Record<string, unknown>;
  const review_id = typeof ctx.sigma_review_id === "string" ? ctx.sigma_review_id : "";
  const files = ctx.files && typeof ctx.files === "object" ? (ctx.files as Record<string, unknown>) : undefined;

  const headers = await authHeaders();
  const resp = await fetch(`${streamBase}/api/sigma_review_agent_stream`, {
    method: "POST",
    credentials: "same-origin",
    headers,
    signal: opts?.signal,   // stop-generating: aborting rejects reader.read() → propagates to send()'s catch
    body: JSON.stringify({
      review_id,
      messages: req.messages,
      ...(files ? { files } : {}),
      ...(req.conversation_id ? { conversation_id: req.conversation_id } : {}),
    }),
  });

  // Pre-stream error (auth/validation/ownership/unresolved-workbook/gateway) → JSON error body.
  if (!resp.ok || !resp.body) {
    let msg = `Review agent error (HTTP ${resp.status}).`;
    try {
      const jr = (await resp.json()) as { error?: { message?: string } };
      msg = jr?.error?.message || msg;
    } catch { /* non-JSON error body */ }
    throw new Error(msg);
  }

  // Read the SSE body incrementally; dispatch one complete event (blank-line separated) at a time.
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let sep: number;
    while ((sep = buf.indexOf("\n\n")) >= 0) {
      const evt = buf.slice(0, sep);
      buf = buf.slice(sep + 2);
      const dataLine = evt.split("\n").find((l) => l.startsWith("data:"));
      if (!dataLine) continue;
      let j: Record<string, unknown> | null = null;
      try { j = JSON.parse(dataLine.slice(5).trim()) as Record<string, unknown>; } catch { continue; }
      if (!j || typeof j !== "object") continue;

      // Order matters: match `event: error` and `event: tool_result` BEFORE the `event: tool` substring.
      if (evt.includes("event: error")) {
        throw new Error((j.message as string) || "The review stream was interrupted.");
      }
      if (evt.includes("event: delta")) {
        if (typeof j.text === "string") {
          if (j.kind === "thinking") handlers.onThinking?.(j.text);
          else handlers.onText(j.text);
        }
        continue;
      }
      if (evt.includes("event: tool_result")) {
        handlers.onToolResult?.({ name: typeof j.name === "string" ? j.name : "", ok: Boolean(j.ok) });
        continue;
      }
      if (evt.includes("event: tool")) {
        handlers.onTool?.({ name: typeof j.name === "string" ? j.name : "", input: j.input });
        continue;
      }
      if (evt.includes("event: done")) {
        handlers.onMeta?.({ conversation_id: j.conversation_id as string | undefined, model: j.model as string | undefined });
        continue;
      }
    }
  }
}
