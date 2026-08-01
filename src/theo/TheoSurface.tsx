// TheoSurface — Pass B federated root (VA-T4; VA-T2 §3A.5). The single Module-Federation-exposed
// surface (`theoApp/TheoSurface`). It owns the one `useTheoState` tree and renders two mountable
// regions — the nav (Sidebar → Origin 1/10 section) and the main view (TheoMain → Origin 9/10
// landing / right panel). When the Origin shell provides DOM slots it PORTALS each region into its
// slot (one state tree, no cross-mount sync — §3A.5); standalone (vault-theo-dev harness) it renders
// the faithful Pass-A inline layout. App-context arrives in-process via the `appContext` prop
// (App Host §6A / VA-T3 §4 — never postMessage); context-only, no app-data fetch.
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { C, SANS } from "./theme";
import { WORKSPACE_NAME, PRODUCT_NAME } from "./swapBlock";
import { NAV } from "./data";
import { Sidebar } from "./components/Sidebar";
import { TheoMain } from "./components/TheoMain";
import { DevContextInjector } from "./components/DevContextInjector";
import { useTheoState } from "./useTheoState";
import { theoClient } from "./services/theoClient";
import { resolvePrincipal } from "./services/theoSnapshot";
import type { AppContext, NavState } from "./types";

const STYLE_BLOCK = `
  * { box-sizing: border-box; }
  textarea::placeholder, input::placeholder { color: ${C.ink3}; }
  .vo-scroll::-webkit-scrollbar { width: 10px; }
  .vo-scroll::-webkit-scrollbar-thumb { background: ${C.line2}; border-radius: 8px; border: 3px solid transparent; background-clip: padding-box; }
  .vo-row:hover { background: rgba(0,0,0,0.04); }
  .vo-nav:hover { background: rgba(0,0,0,0.04); }
  .vo-send:hover:not(:disabled) { background: ${C.coralDk}; }
  .vo-new:hover { background: ${C.coralDk}; }
  .vo-chip:hover { background: ${C.coralSoft}; border-color: ${C.coral}; }
  .vo-card:hover { border-color: ${C.coral}; box-shadow: 0 4px 18px rgba(40,38,31,.07); }
  .vo-ghost:hover { background: rgba(0,0,0,0.04); }
  .vo-actions { opacity: 0; transition: opacity .12s; }
  .vo-row:hover .vo-actions, .vo-card:hover .vo-actions, .vo-actions:focus-within { opacity: 1; }
  button:focus-visible, textarea:focus-visible, input:focus-visible { outline: 2px solid ${C.coral}; outline-offset: 2px; }
  textarea:focus, input:focus { outline: none; }
  @keyframes vo-bounce { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-4px);opacity:1} }
  @media (prefers-reduced-motion: reduce){ * { animation: none !important; transition: none !important; } }
  @media (max-width: 767.98px){ .vo-standalone .vo-aside{ display:none !important; } .vo-panel{ position:absolute !important; inset:0 !important; width:100% !important; min-width:0 !important; flex:none !important; z-index:20; } }
  @media (max-width: 767.98px){ [data-theo-suppress-narrow-header="1"] > header{ display:none !important; } }
  @media (hover: none){ .vo-actions{ opacity:1 !important; } }
`;

// The dev context-injector shows in the standalone harness when running `vite dev`
// (import.meta.env.DEV) OR when `?devctx` is present on the deployed dev-SWA harness (which
// serves a production build where DEV is false). It is never rendered in the Origin mount
// (that uses the portal branch), so it stays excluded from the real product.
function showDevInjector(): boolean {
  if (import.meta.env.DEV) return true;
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("devctx");
}

export interface TheoSurfaceProps {
  // Inbound app-context from the Origin shell (in-process; App Host §6A). Absent ⇒ standalone/none.
  appContext?: AppContext;
  // Shell-provided DOM slots for the hosted mount. When both present, nav + main are portaled into
  // them (Origin 1/10 + 9/10). When absent, TheoSurface renders the standalone inline layout.
  navSlot?: HTMLElement | null;
  mainSlot?: HTMLElement | null;
  // Origin shell's Entra token provider. When supplied, the chat gateway goes live (Bearer-auth to
  // the deployed model gateway); when absent (standalone harness), the gateway stays on the 1A mock.
  getAccessToken?: () => Promise<string | null>;
  // Apps Phase B / B1 (VA-T6 §4.1). Optional host signals; both absent ⇒ current behaviour.
  // suppressNarrowHeader: when true, TheoMain hides its own 54px header on narrow viewports so the
  // Origin host owns the single mobile top bar. newChatNonce: bumping this value (host "New chat"
  // button) starts a fresh chat via the existing useTheoState newChat().
  suppressNarrowHeader?: boolean;
  newChatNonce?: number;
  // Fired when the user picks a NAV DESTINATION from the portaled nav (a recent, New chat, or a nav
  // view). The host uses this to dismiss its mobile ☰ drawer on selection (VO1 §10B "selecting a Theo
  // destination … dismisses the drawer"). Management-only actions (rename/delete/star/add-to-project),
  // search, and section toggles deliberately do NOT fire it. No-op when absent (standalone).
  onNavigate?: () => void;
  // Nav-History seam (VEP-1). onNavState: fired when Theo's internal location changes, reporting
  // { depth, title } so the host can drive its browser-history sentinel + mobile Back/title (VEP-2).
  // backNonce: bumping this value (host Back) pops one internal nav level via useTheoState.goBack().
  // Both optional — a host that does not wire them (or the standalone harness) is unaffected.
  onNavState?: (s: NavState) => void;
  backNonce?: number;
}

export default function TheoSurface({ appContext, navSlot, mainSlot, getAccessToken, suppressNarrowHeader, newChatNonce, onNavigate, onNavState, backNonce }: TheoSurfaceProps) {
  const t = useTheoState();
  const { ingestAppContext, loadRecents, loadProjects, loadGalleryArtifacts, loadPeople } = t;

  // Wire the live model gateway to the shell's token provider (mock → live), then load Recents,
  // Projects, the Artifacts gallery, and the roster (theo_list_people — supplies the signed-in user's
  // name for the greeting + system prompt, and pre-warms the invite picker). configureGateway is
  // synchronous, so the subsequent list calls run against the live gateway when a provider is present
  // (mock fallback otherwise). All loaders are useCallback-stable. loadPeople is best-effort.
  useEffect(() => {
    theoClient.configureGateway({ getAccessToken: getAccessToken ?? null });
    // Confirm the current principal from the live token (bind + purge foreign namespaces) BEFORE the
    // two CACHE-SEEDING loaders run — no prior-principal snapshot may be read before confirmation
    // (Theo Snapshot Storage Exception §2). The non-caching loaders need no gate.
    void (async () => {
      await resolvePrincipal(getAccessToken ?? null);
      void loadRecents();
      void loadPeople();
    })();
    void loadProjects();
    void loadGalleryArtifacts();
  }, [getAccessToken, loadRecents, loadProjects, loadGalleryArtifacts, loadPeople]);

  // Sync inbound app-context into state (context-only; no fetch — VA-T3 §2.4).
  useEffect(() => {
    if (appContext) ingestAppContext(appContext);
  }, [appContext, ingestAppContext]);

  // Apps Phase B / B1: host-driven new chat. When the Origin host bumps `newChatNonce` (its top-bar
  // "New chat" button), start a fresh chat via the existing in-memory newChat(). A ref holds the
  // latest newChat so the trigger effect keys only on the nonce (initial mount is a no-op).
  const newChatRef = useRef(t.newChat);
  useEffect(() => { newChatRef.current = t.newChat; });
  const lastNonceRef = useRef<number | undefined>(newChatNonce);
  useEffect(() => {
    if (newChatNonce === undefined || lastNonceRef.current === newChatNonce) return;
    lastNonceRef.current = newChatNonce;
    newChatRef.current();
  }, [newChatNonce]);

  // Nav-History seam (VEP-1). Report Theo's internal nav state to the host whenever it changes, so the
  // host can arm its browser-history sentinel + render the mobile Back/title (VEP-2). A ref holds the
  // latest callback so the effect keys only on the reported values (not the callback identity).
  const onNavStateRef = useRef(onNavState);
  useEffect(() => { onNavStateRef.current = onNavState; });
  useEffect(() => {
    onNavStateRef.current?.({ depth: t.navDepth, title: t.navContextTitle });
  }, [t.navDepth, t.navContextTitle]);

  // Nav-History seam (VEP-1): host-driven Back. When the host bumps `backNonce` (its mobile Back / a
  // consumed hardware-Back), pop one internal nav level via goBack(). Same nonce-diff idiom as
  // newChatNonce (ref-held handler; initial mount is a no-op).
  const goBackRef = useRef(t.goBack);
  useEffect(() => { goBackRef.current = t.goBack; });
  const lastBackNonceRef = useRef<number | undefined>(backNonce);
  useEffect(() => {
    if (backNonce === undefined || lastBackNonceRef.current === backNonce) return;
    lastBackNonceRef.current = backNonce;
    goBackRef.current();
  }, [backNonce]);

  // A nav DESTINATION was chosen — run Theo's handler, then signal the host so it can dismiss its
  // mobile drawer (VO1 §10B). Only destinations are wrapped; management/search/toggles are not.
  const nav = (
    <Sidebar
      collapsed={t.collapsed} onToggleCollapse={t.toggleCollapse} view={t.view}
      onNavigate={(k) => { t.go(k); onNavigate?.(); }} nav={NAV}
      search={t.search} onSearch={t.setSearch} recents={t.recents}
      onSelectRecent={(id) => { t.selectRecent(id); onNavigate?.(); }}
      onRenameRecent={t.renameConversation} onDeleteRecent={t.deleteConversation}
      projects={t.projects} onToggleStar={t.setConversationStarred} onAddToProject={t.addConversationToProject}
      onNewChat={() => { t.newChat(); onNavigate?.(); }} workspaceName={WORKSPACE_NAME} productName={PRODUCT_NAME}
      fluid={!!(navSlot && mainSlot)}
    />
  );

  // Hosted: Origin provides the 1/10 nav slot + 9/10 main slot. Portal each region in; one state tree.
  if (navSlot && mainSlot) {
    return (
      <>
        <style>{STYLE_BLOCK}</style>
        {createPortal(nav, navSlot)}
        {createPortal(<TheoMain t={t} mode="panel" suppressNarrowHeader={suppressNarrowHeader} />, mainSlot)}
      </>
    );
  }

  // Standalone (vault-theo-dev harness): faithful Pass-A inline layout + DEV-only context injector.
  return (
    <div className="vo-standalone" style={{ height: "100vh", width: "100%", display: "flex", fontFamily: SANS, color: C.ink, background: C.bg, overflow: "hidden" }}>
      <style>{STYLE_BLOCK}</style>
      {nav}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TheoMain t={t} mode="full" suppressNarrowHeader={suppressNarrowHeader} />
      </main>
      {showDevInjector() && <DevContextInjector onInject={ingestAppContext} />}
    </div>
  );
}
