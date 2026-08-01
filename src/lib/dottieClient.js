// dottieClient — the Dottie backend client. Talks to the buffered trio on func-dottie and the streaming
// sidecar on func-dottie-stream. Configuration is INJECTED BY THE VAULT ORIGIN HOST when Dottie is mounted
// as a federated remote (window.__DOTTIE_CONFIG__ = { apiBase, streamBase, getToken }). Standalone (dev SWA),
// it falls back to the public function hosts + an optional dev bearer in localStorage('dottie_dev_token')
// so the frame can be exercised without the shell. No secrets are baked in.

const DEFAULTS = {
  apiBase: "https://vaultgpt-func-dottie.azurewebsites.net/api",
  streamBase: "https://vaultgpt-func-dottie-stream.azurewebsites.net/api",
};

function cfg() {
  const injected = (typeof window !== "undefined" && window.__DOTTIE_CONFIG__) || {};
  return {
    apiBase: injected.apiBase || DEFAULTS.apiBase,
    streamBase: injected.streamBase || DEFAULTS.streamBase,
    getToken: injected.getToken,
  };
}

async function authToken() {
  const c = cfg();
  if (typeof c.getToken === "function") {
    try { return await c.getToken(); } catch { return null; }
  }
  // dev fallback: a bearer the developer pasted for standalone testing
  if (typeof localStorage !== "undefined") return localStorage.getItem("dottie_dev_token") || null;
  return null;
}

export function isHostMounted() {
  return !!(typeof window !== "undefined" && window.__DOTTIE_CONFIG__ && typeof window.__DOTTIE_CONFIG__.getToken === "function");
}

async function authHeaders(extra) {
  const t = await authToken();
  const h = { ...(extra || {}) };
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

export class DottieAuthError extends Error {}

async function jsonOrThrow(res) {
  if (res.status === 401) throw new DottieAuthError("Not authenticated");
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = (body && body.error && body.error.message) || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return body && body.data;
}

export async function listConversations(limit = 50) {
  const c = cfg();
  const res = await fetch(`${c.apiBase}/dottie_list_conversations?limit=${limit}`, { headers: await authHeaders() });
  const data = await jsonOrThrow(res);
  return (data && data.conversations) || [];
}

export async function getConversation(conversationId) {
  const c = cfg();
  const res = await fetch(`${c.apiBase}/dottie_get_conversation?conversationId=${encodeURIComponent(conversationId)}`, { headers: await authHeaders() });
  return jsonOrThrow(res);
}

/**
 * Stream a turn from dottie_message_stream. Relays gpt-5 tokens as they arrive.
 * @param messages  chat history [{role, content}] ending in the new user turn
 * @param opts      { conversationId?, onDelta(text), onMeta({conversation_id,model}), onError(msg), signal }
 * @returns         the final { text, conversationId, model }
 */
export async function streamMessage(messages, opts = {}) {
  const c = cfg();
  const headers = await authHeaders({ "Content-Type": "application/json", Accept: "text/event-stream" });
  const body = JSON.stringify({ messages, ...(opts.conversationId ? { conversation_id: opts.conversationId } : {}) });
  const res = await fetch(`${c.streamBase}/dottie_message_stream`, { method: "POST", headers, body, signal: opts.signal });

  if (res.status === 401) throw new DottieAuthError("Not authenticated");
  if (!res.ok || !res.body) {
    const err = await res.json().catch(() => null);
    throw new Error((err && err.error && err.error.message) || `Stream failed (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let text = "";
  let conversationId = opts.conversationId || null;
  let model = null;

  const handleEvent = (raw) => {
    // an SSE event block: optional "event: <name>" + one or more "data:" lines
    let evName = null;
    const dataLines = [];
    for (const line of raw.split("\n")) {
      if (line.startsWith("event:")) evName = line.slice(6).trim();
      else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
    }
    const payload = dataLines.join("\n");
    if (payload === "" ) return;
    if (evName === "vault_meta") {
      try { const m = JSON.parse(payload); if (m.conversation_id) conversationId = m.conversation_id; if (m.model) model = m.model; if (opts.onMeta) opts.onMeta(m); } catch { /* ignore */ }
      return;
    }
    if (evName === "vault_error") {
      try { const m = JSON.parse(payload); if (opts.onError) opts.onError(m.message || "Stream interrupted"); } catch { if (opts.onError) opts.onError("Stream interrupted"); }
      return;
    }
    if (payload === "[DONE]") return;
    // default: an OpenAI chat.completion chunk
    try {
      const json = JSON.parse(payload);
      if (typeof json.model === "string" && !model) model = json.model;
      const choice = Array.isArray(json.choices) && json.choices.length > 0 ? json.choices[0] : null;
      const piece = choice && choice.delta && typeof choice.delta.content === "string" ? choice.delta.content : "";
      if (piece) { text += piece; if (opts.onDelta) opts.onDelta(piece, text); }
    } catch { /* prompt_filter / keepalive chunks — ignore */ }
  };

  // read loop; SSE events are separated by a blank line ("\n\n")
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf("\n\n")) !== -1) {
      const chunk = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      if (chunk.trim() !== "") handleEvent(chunk);
    }
  }
  if (buf.trim() !== "") handleEvent(buf);

  return { text, conversationId, model };
}
