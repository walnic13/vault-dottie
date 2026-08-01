import { useCallback, useEffect, useRef, useState } from "react";
import { DottieSpiral } from "./DottieSpiral.jsx";
import { listConversations, getConversation, streamMessage, isHostMounted, DottieAuthError } from "../lib/dottieClient.js";

// Lightweight message formatter (markdown-lite: paragraphs, **bold**, `code`, - lists). Full react-markdown
// parity is a fine-tune; this keeps the frame dependency-free and robust on the SWA build.
function fmtInline(s) {
  const parts = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0, m;
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) parts.push(s.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) parts.push(<strong key={parts.length}>{tok.slice(2, -2)}</strong>);
    else parts.push(<code key={parts.length}>{tok.slice(1, -1)}</code>);
    last = m.index + tok.length;
  }
  if (last < s.length) parts.push(s.slice(last));
  return parts;
}
function Formatted({ text }) {
  const blocks = String(text || "").split(/\n{2,}/);
  return blocks.map((b, i) => {
    const lines = b.split("\n");
    const isList = lines.every((l) => /^\s*[-*]\s+/.test(l)) && lines.length > 0;
    if (isList) {
      return <ul key={i}>{lines.map((l, j) => <li key={j}>{fmtInline(l.replace(/^\s*[-*]\s+/, ""))}</li>)}</ul>;
    }
    return <p key={i}>{lines.map((l, j) => <span key={j}>{fmtInline(l)}{j < lines.length - 1 ? <br /> : null}</span>)}</p>;
  });
}

export default function Console() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]); // {role, content}
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [devToken, setDevToken] = useState("");
  const scrollRef = useRef(null);

  const hasDevToken = () => typeof localStorage !== "undefined" && !!localStorage.getItem("dottie_dev_token");

  const refreshList = useCallback(async () => {
    try { setConversations(await listConversations(100)); setNeedsAuth(false); }
    catch (e) {
      // a clean 401 (DottieAuthError) OR a cross-origin/network failure standalone both mean "no live session"
      if (e instanceof DottieAuthError || (!isHostMounted() && !hasDevToken())) setNeedsAuth(true);
    }
  }, []);

  useEffect(() => {
    // standalone with no token yet → surface the connect affordance immediately
    if (!isHostMounted() && !hasDevToken()) setNeedsAuth(true);
    refreshList();
  }, [refreshList]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, streaming]);

  const openConversation = async (id) => {
    setActiveId(id); setError(null);
    try {
      const data = await getConversation(id);
      setMessages((data.messages || []).map((m) => ({ role: m.role, content: m.content })));
    } catch (e) { if (e instanceof DottieAuthError) setNeedsAuth(true); else setError(e.message); }
  };

  const newChat = () => { setActiveId(null); setMessages([]); setError(null); };

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setError(null);
    const history = [...messages, { role: "user", content: text }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);
    try {
      const result = await streamMessage(history, {
        conversationId: activeId || undefined,
        onDelta: (_piece, full) => {
          setMessages((prev) => { const next = prev.slice(); next[next.length - 1] = { role: "assistant", content: full }; return next; });
        },
        onError: (msg) => setError(msg),
      });
      if (result.conversationId && result.conversationId !== activeId) { setActiveId(result.conversationId); }
      refreshList();
    } catch (e) {
      if (e instanceof DottieAuthError) setNeedsAuth(true);
      else setError(e.message || "Something went wrong.");
      // drop the empty assistant bubble on hard failure
      setMessages((prev) => (prev.length && prev[prev.length - 1].role === "assistant" && !prev[prev.length - 1].content ? prev.slice(0, -1) : prev));
    } finally { setStreaming(false); }
  };

  const onKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  const saveDevToken = () => { if (devToken.trim()) { localStorage.setItem("dottie_dev_token", devToken.trim()); setDevToken(""); setNeedsAuth(false); refreshList(); } };

  return (
    <div className="dc-root">
      <aside className="dc-side">
        <div className="dc-brand">
          <DottieSpiral size={30} animate={streaming} />
          <div>
            <div className="dc-brand-name">Dottie</div>
            <div className="dc-brand-sub">second opinion · governance</div>
          </div>
        </div>
        <button className="dc-newchat" onClick={newChat}>+ New conversation</button>
        <div className="dc-history">
          {conversations.length === 0 && <div className="dc-empty-hist">No conversations yet.</div>}
          {conversations.map((c) => (
            <button key={c.id} className={"dc-hist-item" + (c.id === activeId ? " active" : "")} onClick={() => openConversation(c.id)} title={c.title}>
              <span className="dc-hist-title">{c.title || "Untitled"}</span>
            </button>
          ))}
        </div>
        <div className="dc-side-foot">Dottie knows you privately (Dottie‑L1) and never reads Theo’s memory.</div>
      </aside>

      <main className="dc-main">
        {needsAuth && (
          <div className="dc-authbar">
            <span>{isHostMounted() ? "Sign in to Vault to use Dottie." : "Live data appears when Dottie is mounted in Vault Origin. For standalone testing, paste a bearer token:"}</span>
            {!isHostMounted() && (
              <span className="dc-devtok">
                <input type="password" placeholder="dev bearer token" value={devToken} onChange={(e) => setDevToken(e.target.value)} />
                <button onClick={saveDevToken}>Use</button>
              </span>
            )}
          </div>
        )}

        <div className="dc-messages" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="dc-welcome">
              <DottieSpiral size={72} animate title="Dottie" />
              <h1>Dottie</h1>
              <p>An independent, careful second opinion — and a quiet check on how the shared record is kept. Ask me to review a decision, weigh a risk, or sanity‑check your reasoning.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={"dc-msg " + m.role}>
              <div className="dc-msg-role">{m.role === "user" ? "You" : "Dottie"}</div>
              <div className="dc-msg-body">
                {m.role === "assistant" && !m.content && streaming ? <span className="dc-thinking"><DottieSpiral size={18} animate /> thinking…</span> : <Formatted text={m.content} />}
              </div>
            </div>
          ))}
          {error && <div className="dc-error">{error}</div>}
        </div>

        <div className="dc-composer">
          <textarea
            rows={1}
            placeholder="Ask Dottie for a second opinion…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={streaming}
          />
          <button className="dc-send" onClick={send} disabled={streaming || !input.trim()}>{streaming ? "…" : "Send"}</button>
        </div>
      </main>
    </div>
  );
}
