// Markdown rendering for the Theo surface.
// - `Formatted` renders full block markdown (CommonMark + GFM: headings, ordered/nested lists,
//   tables, fenced code, blockquotes, horizontal rules, rich inline) via react-markdown, styled in
//   the VA-T1 token system (theme `C`/`MONO`) so it reads as the same surface, just polished.
//   Cited (web-grounded) answers also render their body through `Formatted` (CitedText appends the
//   citation chips after the block), so structured cited answers get the same fidelity as plain ones.
// XSS-safe: markdown only, NO raw HTML (no rehype-raw), so model output cannot inject markup.
import type { CSSProperties } from "react";
import Markdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { C, MONO } from "../theme";

const inlineCode: CSSProperties = { background: "#fff", border: `1px solid ${C.line}`, borderRadius: 5, padding: "1px 5px", fontSize: "0.9em", fontFamily: MONO };
const codeBlockBox: CSSProperties = { margin: "10px 0", padding: "12px 14px", background: C.bubble, border: `1px solid ${C.line2}`, borderRadius: 10, overflowX: "auto", fontFamily: MONO, fontSize: 13, lineHeight: 1.5 };
const cell: CSSProperties = { border: `1px solid ${C.line2}`, padding: "6px 10px", textAlign: "left", verticalAlign: "top" };

// Element → styled component map. VA-T1 tokens; inline-style idiom (no CSS framework classes).
const MD: Components = {
  h1: ({ children }) => <div style={{ fontWeight: 650, fontSize: 21, lineHeight: 1.3, margin: "20px 0 10px" }}>{children}</div>,
  h2: ({ children }) => <div style={{ fontWeight: 650, fontSize: 18, lineHeight: 1.3, margin: "18px 0 8px" }}>{children}</div>,
  h3: ({ children }) => <div style={{ fontWeight: 650, fontSize: 15.5, margin: "14px 0 6px" }}>{children}</div>,
  h4: ({ children }) => <div style={{ fontWeight: 650, fontSize: 14, color: C.ink2, margin: "12px 0 6px" }}>{children}</div>,
  p: ({ children }) => <p style={{ margin: "0 0 12px", lineHeight: 1.65 }}>{children}</p>,
  ul: ({ children }) => <ul style={{ margin: "8px 0 12px", paddingLeft: 22, lineHeight: 1.6 }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ margin: "8px 0 12px", paddingLeft: 22, lineHeight: 1.6 }}>{children}</ol>,
  li: ({ children }) => <li style={{ margin: "4px 0" }}>{children}</li>,
  a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: C.coral, textDecoration: "underline" }}>{children}</a>,
  strong: ({ children }) => <strong style={{ fontWeight: 650 }}>{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  del: ({ children }) => <del>{children}</del>,
  hr: () => <hr style={{ border: "none", borderTop: `1px solid ${C.line2}`, margin: "18px 0" }} />,
  blockquote: ({ children }) => <blockquote style={{ margin: "10px 0", padding: "4px 14px", borderLeft: `3px solid ${C.line2}`, color: C.ink2 }}>{children}</blockquote>,
  pre: ({ children }) => <pre style={codeBlockBox}>{children}</pre>,
  code: ({ className, children }) => {
    const isBlock = /(^|\s)language-/.test(className || "") || String(children).includes("\n");
    return isBlock ? <code className={className} style={{ fontFamily: MONO }}>{children}</code> : <code style={inlineCode}>{children}</code>;
  },
  table: ({ children }) => <div style={{ overflowX: "auto", margin: "10px 0" }}><table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13.5 }}>{children}</table></div>,
  th: ({ children }) => <th style={{ ...cell, background: C.bubble, fontWeight: 650 }}>{children}</th>,
  td: ({ children }) => <td style={cell}>{children}</td>,
  // Inline image display (Theo emits a markdown image to SHOW the user something). https-only
  // (defense-in-depth over react-markdown's default urlTransform); max-width caps it to the bubble.
  img: ({ src, alt }) =>
    typeof src === "string" && src.startsWith("https://")
      ? <img src={src} alt={alt || ""} style={{ maxWidth: "100%", height: "auto", borderRadius: 8, margin: "8px 0" }} />
      : null,
};

export function Formatted({ text }: { text: string }) {
  // overflowWrap guards against long unbroken tokens (URLs, hashes) breaking the bubble width.
  return (
    <div style={{ overflowWrap: "anywhere" }}>
      <Markdown remarkPlugins={[remarkGfm]} components={MD}>{text}</Markdown>
    </div>
  );
}
