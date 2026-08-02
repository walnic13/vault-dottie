// THE single service / contracts boundary (FE Governor §6.2; 1A handover §2.3).
// Every backend-bound call routes through here. Chat → gateway (mock in the standalone harness,
// live model gateway when a token/base is configured). B4c: projects + project-knowledge are now
// live `theo_*` calls (with the same mock fallback), replacing the 1A in-memory store; artifacts /
// settings stay in-memory pending their own tiers. Browser storage only via the Theo Snapshot Storage
// Exception (Governor item 3): the per-principal instant-paint snapshot in ./theoSnapshot.
import type {
  AppContext, Artifact, ArtifactBlock, ArtifactSummary, ConversationAttachment, ConversationDetail, ConversationSummary, GatewayRequest, GatewayResponse,
  KDraft, Knowledge, NpDraft, Person, Project, ProjectMember, PublishedConversation, Settings,
} from "../types";
import { parseArtifacts, remapToIds, upsert } from "../lib/artifacts";
import {
  sendMessage as gatewaySend, sendMessageStream as gatewaySendStream,
  sendReviewAgentStream as gatewaySendReviewAgentStream, configureGateway as gatewayConfigure,
  listConversations as gatewayList, getConversation as gatewayGet,
  listProjectConversations as gatewayListProjectConversations,
  listConversationAttachments as gatewayListConvAttachments,
  createAttachmentUpload as gatewayCreateUpload, uploadToBlob as gatewayUploadToBlob,
  finalizeAttachment as gatewayFinalize, deleteAttachment as gatewayDeleteAttachment,
  attachmentsAvailable as gatewayAttachmentsAvailable,
  listProjects as gatewayListProjects, createProject as gatewayCreateProject,
  getOrCreateReviewProject as gatewayGetOrCreateReviewProject,
  updateProjectInstructions as gatewayUpdateProjectInstructions,
  updateProjectDescription as gatewayUpdateProjectDescription, deleteProject as gatewayDeleteProject,
  listProjectKnowledge as gatewayListProjectKnowledge, addProjectKnowledge as gatewayAddProjectKnowledge,
  addProjectKnowledgeFile as gatewayAddProjectKnowledgeFile,
  removeProjectKnowledge as gatewayRemoveProjectKnowledge,
  setConversationProject as gatewaySetConversationProject, setConversationStarred as gatewaySetConversationStarred,
  renameProject as gatewayRenameProject,
  renameConversation as gatewayRenameConversation, deleteConversation as gatewayDeleteConversation,
  persistArtifact as gatewayPersistArtifact, listServerArtifacts as gatewayListServerArtifacts,
  getServerArtifact as gatewayGetServerArtifact,
  setProjectVisibility as gatewaySetProjectVisibility,
  shareProject as gatewayShareProject, unshareProject as gatewayUnshareProject,
  listProjectMembers as gatewayListProjectMembers, listPeople as gatewayListPeople,
  publishConversation as gatewayPublishConversation, unpublishConversation as gatewayUnpublishConversation,
  listPublishedProjectConversations as gatewayListPublishedProjectConversations,
  voiceAvailable as gatewayVoiceAvailable, transcribeAudio as gatewayTranscribeAudio, synthesizeSpeech as gatewaySynthesizeSpeech,
  type StreamHandlers,
} from "./gateway.live";

let artifacts: Artifact[] = [];
let settings: Settings = { styleKey: "normal", custom: "" };
let appContext: AppContext = { app_key: null, app_context: null };

export const theoClient = {
  // ── Gateway wiring (Origin mount supplies the token provider; switches mock → live) ──
  configureGateway(opts: { getAccessToken?: (() => Promise<string | null>) | null; baseUrl?: string | null; streamBaseUrl?: string | null; chatBaseUrl?: string | null; projectsBaseUrl?: string | null }): void {
    gatewayConfigure(opts);
  },

  // ── Chat (the one network-bound call; mocked in 1A) ──────────────────────
  sendMessage(req: GatewayRequest): Promise<GatewayResponse> {
    return gatewaySend(req);
  },
  // ── B9 streaming chat (theo_message_stream sidecar) — same request shape; the reply arrives as
  // SSE deltas via the handlers (live text + thinking + citations + the final conversation id). ──
  // Stop-generating: `opts.signal` (from useTheoState's per-turn AbortController) passes straight
  // through to the gateway fetch so stop() / a chat switch can abort the in-flight stream.
  sendMessageStream(req: GatewayRequest, handlers: StreamHandlers, opts?: { signal?: AbortSignal }): Promise<void> {
    return gatewaySendStream(req, handlers, opts);
  },
  // Sigma K-1 review agent (streaming; sigma_review_agent_stream on the func-stream sidecar). Same
  // request shape as sendMessageStream (review_id + files ride in req.app_context); the reply arrives
  // as the agent's clean SSE protocol via the handlers (text/thinking deltas + tool / tool_result +
  // the final conversation id). useTheoState routes here ONLY when a complete review payload is present.
  sendReviewAgentStream(req: GatewayRequest, handlers: StreamHandlers, opts?: { signal?: AbortSignal }): Promise<void> {
    return gatewaySendReviewAgentStream(req, handlers, opts);
  },

  // ── Attachments (B8e) — one network round per file: create SAS → PUT bytes → finalize.
  // Returns the server attachment id (used as attachment_ids on the next sendMessage). The bytes
  // never transit the gateway — the browser PUTs straight to Blob via the owner-scoped SAS. ──
  attachmentsAvailable(): boolean { return gatewayAttachmentsAvailable(); },
  async uploadAttachment(input: { blob: Blob; name: string; contentType: string }): Promise<{ id: string }> {
    const up = await gatewayCreateUpload(input.name, input.contentType);
    await gatewayUploadToBlob(up.upload, input.blob);
    return gatewayFinalize(up.attachmentId, input.name);
  },
  deleteAttachment(id: string): Promise<void> { return gatewayDeleteAttachment(id); },

  // ── Voice I/O (VA-T8 / API §2.11) — dictation (transcribe an audio clip → text) + read-aloud
  // (synthesize reply text → audio). Live-only (no mock); the composer gates on voiceAvailable(). ──
  voiceAvailable(): boolean { return gatewayVoiceAvailable(); },
  transcribeAudio(input: { blob: Blob; contentType: string }): Promise<{ text: string }> {
    return gatewayTranscribeAudio(input);
  },
  synthesizeSpeech(input: { text: string; voice?: string }): Promise<{ blob: Blob; contentType: string }> {
    return gatewaySynthesizeSpeech(input);
  },

  // ── Conversation history (Recents + reload; theo_list/get_conversation in 1B) ──
  listConversations(limit?: number): Promise<ConversationSummary[]> {
    return gatewayList(limit);
  },
  getConversation(id: string): Promise<ConversationDetail> {
    return gatewayGet(id);
  },
  // B4e: a project's conversations (theo_list_conversations?projectId) — backs the project-home chat list.
  listProjectConversations(projectId: string): Promise<ConversationSummary[]> {
    return gatewayListProjectConversations(projectId);
  },
  // B8i reload parity — a conversation's persisted attachments (grouped per user turn by message_seq).
  listConversationAttachments(id: string): Promise<ConversationAttachment[]> {
    return gatewayListConvAttachments(id);
  },

  // Parse [[ARTIFACT]] blocks out of a reply, upsert them (versioned by reused title),
  // and return the display text (artifact sentinels remapped to artifact ids) + the id to open + the
  // parsed blocks (B4h: send() persists each block via theo_upsert_artifact; the persisted store is
  // keyed by title, matching this in-memory upsert).
  ingestReply(reply: string): { display: string; openId: string | null; blocks: ArtifactBlock[] } {
    const { clean, blocks } = parseArtifacts(reply);
    const ids: string[] = [];
    blocks.forEach((b) => { const r = upsert(artifacts, b); artifacts = r.next; ids.push(r.id); });
    const display = remapToIds(clean, ids);
    return { display: display || "(no response)", openId: ids.length ? ids[ids.length - 1] : null, blocks };
  },
  // B4h: clear the in-memory artifact working set — called before re-deriving a reopened thread's
  // artifacts (selectRecent re-runs ingestReply over each persisted assistant turn).
  resetArtifacts(): void { artifacts = []; },
  // B4h: merge a fetched persisted artifact (theo_get_artifact) into the in-memory store by id, so the
  // ArtifactPanel can open a gallery artifact (opened from the Artifacts tab).
  mergeArtifact(a: Artifact): void {
    const i = artifacts.findIndex((x) => x.id === a.id);
    if (i >= 0) { const c = artifacts.slice(); c[i] = a; artifacts = c; }
    else artifacts = [a, ...artifacts];
  },

  // ── Projects + project-knowledge (B4c: live theo_*_project / theo_*_project_knowledge; API Spec
  // §2.2). Owner-scoped server-side; mock fallback in the standalone harness. Each returns the
  // FE-mapped shape (gateway.live maps the deployed rows) so the surface is unchanged. ──
  listProjects(): Promise<Project[]> { return gatewayListProjects(); },
  createProject(d: NpDraft): Promise<Project> { return gatewayCreateProject(d); },
  getOrCreateReviewProject(appKey: string, sourceRef: string, name: string): Promise<Project> { return gatewayGetOrCreateReviewProject(appKey, sourceRef, name); },
  updateProjectInstructions(id: string, instructions: string): Promise<Project> {
    return gatewayUpdateProjectInstructions(id, instructions);
  },
  // B4f: rename a project (theo_update_project {id, name}; deployed B4a).
  renameProject(id: string, name: string): Promise<Project> { return gatewayRenameProject(id, name); },
  // B4g: edit the project description (theo_update_project {id, description}; deployed B4a).
  updateProjectDescription(id: string, description: string): Promise<Project> {
    return gatewayUpdateProjectDescription(id, description);
  },
  // B5a: set project visibility (theo_set_project_visibility {id, visibility}; owner-only; deployed B5a).
  setProjectVisibility(id: string, visibility: string): Promise<{ id: string; visibility: string }> {
    return gatewaySetProjectVisibility(id, visibility);
  },
  // B5c: per-member invite (theo_share_project / theo_unshare_project / theo_list_project_members;
  // owner-only; deployed B5c). memberOid = an Entra OID from the roster (listPeople).
  shareProject(projectId: string, memberOid: string): Promise<void> { return gatewayShareProject(projectId, memberOid); },
  unshareProject(projectId: string, memberOid: string): Promise<void> { return gatewayUnshareProject(projectId, memberOid); },
  listProjectMembers(projectId: string): Promise<ProjectMember[]> { return gatewayListProjectMembers(projectId); },
  // B5c: the Vault Staff roster (theo_list_people; §2.9) — the invite picker's source.
  listPeople(): Promise<Person[]> { return gatewayListPeople(); },
  deleteProject(id: string): Promise<void> { return gatewayDeleteProject(id); },
  listProjectKnowledge(projectId: string): Promise<Knowledge[]> { return gatewayListProjectKnowledge(projectId); },
  addProjectKnowledge(projectId: string, k: KDraft): Promise<Knowledge> { return gatewayAddProjectKnowledge(projectId, k); },
  addProjectKnowledgeFile(projectId: string, attachmentId: string, title?: string): Promise<Knowledge> { return gatewayAddProjectKnowledgeFile(projectId, attachmentId, title); },
  removeProjectKnowledge(knowledgeId: string): Promise<void> { return gatewayRemoveProjectKnowledge(knowledgeId); },
  // B4d: link a conversation to a project (owner-scoped, idempotent set-once). Called once after a
  // project chat's first turn returns a conversation_id (theo_conversations.project_id).
  setConversationProject(conversationId: string, projectId: string): Promise<void> {
    return gatewaySetConversationProject(conversationId, projectId);
  },
  // SPW Phase 2: publish/unpublish a conversation to its project + list a project's published
  // conversations (theo_publish/unpublish_conversation, theo_list_project_conversations; API §2.2).
  publishConversation(conversationId: string): Promise<void> { return gatewayPublishConversation(conversationId); },
  unpublishConversation(conversationId: string): Promise<void> { return gatewayUnpublishConversation(conversationId); },
  listPublishedProjectConversations(projectId: string): Promise<PublishedConversation[]> {
    return gatewayListPublishedProjectConversations(projectId);
  },
  // Conversation-Star: owner-scoped star toggle (theo_set_conversation_starred; deployed 2026-07-23).
  setConversationStarred(conversationId: string, starred: boolean): Promise<void> {
    return gatewaySetConversationStarred(conversationId, starred);
  },
  // B4f: rename / delete a conversation (theo_rename_conversation / theo_delete_conversation; deployed B4f).
  renameConversation(id: string, title: string): Promise<{ id: string; title: string }> {
    return gatewayRenameConversation(id, title);
  },
  deleteConversation(id: string): Promise<void> { return gatewayDeleteConversation(id); },

  // ── Artifacts ──
  // In-memory working set (the live thread's artifacts, keyed by client id; drives ArtifactCard + panel).
  listArtifacts(): Artifact[] { return artifacts.slice(); },
  // B4h persistence (theo_upsert/list/get_artifact; API Spec §2.3). Owner-scoped server-side; version
  // content in Blob. `persistArtifact` (best-effort during send) create-or-add-version by title;
  // `listServerArtifacts` backs the cross-chat Artifacts gallery; `getServerArtifact` fetches versions
  // + content to open a gallery artifact in the panel. Unconfigured harness → mock (empty gallery).
  persistArtifact(input: { title: string; type: string; content: string; conversationId?: string | null }): Promise<{ id: string; currentVersion: number }> {
    return gatewayPersistArtifact(input);
  },
  listServerArtifacts(): Promise<ArtifactSummary[]> { return gatewayListServerArtifacts(); },
  getServerArtifact(id: string): Promise<Artifact> { return gatewayGetServerArtifact(id); },

  // ── Settings (in-memory in 1A; theo_user_settings in 1B) ──
  readSettings(): Settings { return { ...settings }; },
  writeSettings(s: Settings): void { settings = { ...s }; },

  // ── App-context (Pass B; in-memory carry in 1A; theo_conversations.app_key/app_context in 1B) ──
  // Presentational anchor only — Origin broadcasts it in-process; Theo never fetches app data here.
  getAppContext(): AppContext { return { ...appContext }; },
  setAppContext(ctx: AppContext): void { appContext = { ...ctx }; },
};
