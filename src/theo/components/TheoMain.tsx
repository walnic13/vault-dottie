// TheoMain — Pass B extract of the TheoShell 9/10 main region (VA-T1 main; VA-T2 §3A.1/§3A.4).
// The view-switched header chrome + active view + ArtifactPanel + renderAssistant. Presentational:
// all state/handlers come from useTheoState via the `t` prop (owned by TheoSurface), so this same
// surface renders identically as the 9/10 landing (mode "full") and as the in-app right panel
// (mode "panel"). Faithful reproduction — no redesign. Adds the app-context chip (Pass B).
// B4f: forwards the project rename/delete handlers to ProjectsView and the chat rename/delete
// handlers to ProjectDetail (management affordances; deployed B4a/B4f backends).
import type { ReactNode } from "react";
import { C } from "../theme";
import { ASSISTANT_NAME, PRODUCT_NAME, MODEL_LABEL } from "../swapBlock";
import { STYLES, STARTERS, REVIEW_STARTERS, REVIEW_APP_STARTERS } from "../data";
import { IcBack, IcClose, IcShare } from "./icons";
import { Formatted } from "../lib/markdown";
import { splitAssistant } from "../lib/artifacts";
import { appContextLabel } from "../lib/appContext";
import { ArtifactCard } from "./ArtifactCard";
import { ChatView } from "./ChatView";
import { ChatMenu } from "./ChatMenu";
import { ProjectsView } from "./ProjectsView";
import { ProjectDetail } from "./ProjectDetail";
import { ArtifactsView } from "./ArtifactsView";
import { Customize } from "./Customize";
import { ArtifactPanel } from "./ArtifactPanel";
import type { useTheoState } from "../useTheoState";

export interface TheoMainProps {
  t: ReturnType<typeof useTheoState>;
  mode: "full" | "panel"; // "full" = 9/10 landing; "panel" = in-app right-docked panel (Origin host)
  // Apps Phase B / B1 (VA-T6 §4.1): when true, this main view's own 54px header is hidden on
  // narrow viewports (≤767.98px) so the Origin host provides the single mobile top bar (no stacked
  // double header). CSS-only, applied via the STYLE_BLOCK media rule in TheoSurface. Wide unchanged.
  suppressNarrowHeader?: boolean;
}

export function TheoMain({ t, mode, suppressNarrowHeader }: TheoMainProps) {
  function renderAssistant(content: string): ReactNode {
    return splitAssistant(content).map((part, i) => {
      if (part.kind === "artifact") {
        const id = part.value;
        return <ArtifactCard key={i} artifact={t.artifacts.find((a) => a.id === id)} onOpen={() => t.openArtifact(id)} />;
      }
      return part.value.trim() ? <Formatted key={i} text={part.value} /> : null;
    });
  }

  const appLabel = appContextLabel(t.appContext);

  return (
    <div data-theo-main-mode={mode} data-theo-suppress-narrow-header={suppressNarrowHeader ? "1" : undefined} style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100%" }}>
      <header style={{ height: 54, flexShrink: 0, borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px" }}>
        {t.view === "chats" ? (<>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Nav-History (VEP-1): a top-left ← Back that walks Theo's internal nav one step (chat →
                project → list → …). Shown whenever there is internal history; wired to the same goBack
                the host's mobile Back/hardware Back drive (VEP-2), so button + system Back are one behavior. */}
            {t.canGoBack && (
              <button onClick={t.goBack} title="Back"
                style={{ background: "none", border: "none", cursor: "pointer", color: C.ink2, display: "flex", padding: 0 }}>
                <IcBack s={20} />
              </button>
            )}
            {/* Conversation-Star: the active saved conversation shows its title + a dropdown menu
                (Star / Rename / Add to project / Delete), Claude-style, top-left. Hidden on a new
                unsaved chat (no conversationId). */}
            {t.conversationId && t.currentConversation && (
              <ChatMenu conversation={t.currentConversation} projects={t.projects}
                onRename={t.renameConversation} onDelete={t.deleteConversation}
                onToggleStar={t.setConversationStarred} onAddToProject={t.addConversationToProject}
                published={t.chatPublished} canPublish={t.chatCanPublish} onTogglePublish={t.togglePublishConversation} />
            )}
            {/* VEP (Theo Header Declutter): the model label is suppressed in the Origin-hosted panel
                (mode="panel") — clutter there; shown only standalone (mode="full"). VISUAL-AUTHORITY-
                DEVIATION from VA-T1, authorized by VA-T4. */}
            {mode !== "panel" && <span style={{ fontSize: 13.5, fontWeight: 600, color: C.ink2 }}>{MODEL_LABEL} <span style={{ color: C.ink3, fontSize: 11 }}>▾</span></span>}
            {t.styleKey !== "normal" && <span style={{ fontSize: 12, color: C.coralDk, background: C.coralSoft, borderRadius: 999, padding: "3px 10px" }}>{t.activeStyle.label}</span>}
            {appLabel && <span style={{ fontSize: 12, color: C.ink2, background: C.coralTint, borderRadius: 999, padding: "3px 10px" }}>{appLabel}</span>}
            {t.chatProject && <span style={{ fontSize: 12, color: C.ink2, background: C.coralTint, borderRadius: 999, padding: "3px 10px", display: "flex", alignItems: "center", gap: 6 }}>{t.chatProject.name}<span onClick={t.clearChatProject} style={{ cursor: "pointer", display: "flex" }}><IcClose s={12} /></span></span>}
            {/* SPW 2c-iii-fe (VA-T12 B): a published chat shows a "Shared in {project}" chip so the shared
                state is visible in the header (the publish/unpublish toggle lives in the title menu). */}
            {t.chatPublished && t.chatProject && <span style={{ fontSize: 12, fontWeight: 600, color: C.coralDk, background: C.coralSoft, borderRadius: 999, padding: "3px 10px", display: "flex", alignItems: "center", gap: 5 }}><IcShare s={12} /> Shared in {t.chatProject.name}</span>}
          </div>
          {/* VEP (Theo Header Declutter): the "Theo in Origin" label is suppressed in the Origin-
              hosted panel (mode="panel") and shown only standalone (mode="full"). */}
          {mode !== "panel" && <div style={{ fontSize: 12.5, color: C.ink3 }}>{ASSISTANT_NAME} in {PRODUCT_NAME}</div>}
        </>) : (<div style={{ fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", gap: 9 }}>
          {t.view === "project" && <button onClick={() => t.go("projects")} style={{ background: "none", border: "none", cursor: "pointer", color: C.ink2, display: "flex", padding: 0 }}><IcBack s={20} /></button>}
          {t.view === "projects" && "Projects"}{t.view === "artifacts" && "Artifacts"}{t.view === "customize" && "Customize"}{t.view === "project" && t.detail?.name}
        </div>)}
      </header>

      <div style={{ flex: 1, display: "flex", minHeight: 0, position: "relative" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {t.view === "chats" && (
            <ChatView
              messages={t.messages} loading={t.loading} conversationId={t.conversationId} restoring={t.restoring} error={t.error} draft={t.draft}
              attachments={t.attachments} attachmentsAvailable={t.attachmentsAvailable}
              onDraftChange={t.setDraft} onSend={t.send} onStop={t.stop}
              queuedText={t.queued} onCancelQueued={t.cancelQueued}
              onAddFiles={t.addFiles} onAddPastedText={t.addPastedText} onRemoveAttachment={t.removeAttachment}
              chatProject={t.chatProject} people={t.people}
              sharedProjectName={t.chatPublished ? (t.chatProject?.name ?? null) : null}
              assistantName={ASSISTANT_NAME} greeting={t.greeting} starters={t.reviewMode ? REVIEW_STARTERS : (t.sigmaMode ? REVIEW_APP_STARTERS : STARTERS)} renderAssistant={renderAssistant}
              reviewMode={t.reviewMode}
              sigmaMode={t.sigmaMode}
              reviewFund={typeof t.appContext.app_context?.fund_name === "string" ? (t.appContext.app_context.fund_name as string) : undefined}
              voiceAvailable={t.voiceAvailable} recording={t.recording} transcribing={t.transcribing} recordingSeconds={t.recordingSeconds}
              onStartDictation={t.startDictation} onStopDictation={t.stopDictation} onCancelDictation={t.cancelDictation}
              playingIdx={t.playingIdx} synthesizingIdx={t.synthesizingIdx} onReadAloud={t.readAloud} onStopReadAloud={t.stopReadAloud}
            />
          )}
          {t.view === "projects" && (
            <ProjectsView projects={t.projects} npOpen={t.npOpen} np={t.np} onNpChange={t.setNp} onToggleNp={t.toggleNp} onCreate={t.createProject} onOpenProject={t.openProject} onRenameProject={t.renameProject} onDeleteProject={t.deleteProject} />
          )}
          {t.view === "project" && t.detail && (
            <ProjectDetail project={t.detail} chats={t.projectChats} kdraft={t.kdraft} onKdraftChange={t.setKdraft} onAddKnowledge={t.addKnowledge} onAddKnowledgeFile={t.addKnowledgeFile} onRemoveKnowledge={t.removeKnowledge} onPatchInstructions={t.patchInstructions} onStartChat={() => t.startInProject(t.detail!.id)} onSelectChat={t.selectRecent} onRenameChat={t.renameConversation} onDeleteChat={t.deleteConversation} onPatchDescription={t.patchDescription} onSetVisibility={t.setProjectVisibility} visibilityBusy={t.visPending === t.detail.id} members={t.projectMembers} people={t.people} onShareMember={t.shareMember} onUnshareMember={t.unshareMember} memberPendingKey={t.memberPending} published={t.publishedConvs} />
          )}
          {t.view === "artifacts" && (
            <ArtifactsView artifacts={t.galleryArtifacts} onOpenArtifact={t.openGalleryArtifact} />
          )}
          {t.view === "customize" && (
            <Customize styles={STYLES} styleKey={t.styleKey} onSelectStyle={t.selectStyle} custom={t.custom} onCustomChange={t.setCustom} onSave={t.save} saved={t.saved} productName={PRODUCT_NAME} />
          )}
        </div>

        {/* B4e: the artifact panel belongs to chat/artifacts contexts — hide it on projects/customize
            so a generated deliverable doesn't linger over the project home (it re-shows on return). */}
        {t.art && (t.view === "chats" || t.view === "artifacts") && (
          <ArtifactPanel artifact={t.art} openVersion={t.openArt ? t.openArt.v : -1} onSelectVersion={t.selectVersion} onCopy={t.copyArt} copied={t.copied} onClose={t.closeArt} />
        )}
      </div>
    </div>
  );
}
