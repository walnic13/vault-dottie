// CitedText — inline web-grounding citation affordance. Faithful reproduction of
// VA-T5 (artifacts/theo-citations-reference.jsx): a favicon+index chip after each
// cited claim; hover/focus opens a source card (host, title, 3-line cited_text);
// adjacent chips for multi-source claims; real <a target="_blank"> + aria-label.
// Tokens tuned to the Theo palette (../theme C). Zero-dep, inline-style (VA-T1 idiom).
// Hardenings beyond the reference: (G-1) favicon onError → inline Globe (zero-egress
// fallback); (G-2) viewport-edge collision handling for the source card.
import { useState, useRef, useLayoutEffect } from "react";
import type { ReactNode } from "react";
import { C, SANS } from "../theme";
import { Formatted } from "../lib/markdown";
import type { Citation, CitedRun } from "../types";

function hostOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); }
  catch { return ""; }
}

// External request in a locked-down frontend; degrades to the Globe fallback below
// (onError) when CSP/egress blocks it. A CSP allowlist / gateway proxy is a fast-follow.
function faviconFor(url: string): string {
  const h = hostOf(url);
  return h ? `https://www.google.com/s2/favicons?domain=${h}&sz=64` : "";
}

function Globe({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={C.ink2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
    </svg>
  );
}

function Favicon({ url, size = 13 }: { url: string; size?: number }) {
  const [err, setErr] = useState(false);
  const src = faviconFor(url);
  if (err || !src) return <Globe size={size} />;
  return (
    <img
      src={src} alt="" width={size} height={size}
      onError={() => setErr(true)}
      style={{ display: "block", borderRadius: 3, flex: "0 0 auto" }}
    />
  );
}

function CitationMarker({ index, citation }: { index: number; citation: Citation }) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<"above" | "below">("above");
  const [shiftX, setShiftX] = useState(0);
  const closeT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLSpanElement>(null);

  const host = hostOf(citation.url);
  const show = () => { if (closeT.current) clearTimeout(closeT.current); setOpen(true); };
  const hide = () => { closeT.current = setTimeout(() => setOpen(false), 80); };

  // (G-2) viewport-edge collision: shift horizontally to stay on-screen; flip below
  // when there isn't room above. Runs on open, before paint.
  useLayoutEffect(() => {
    if (!open || !wrapRef.current || !cardRef.current) return;
    const margin = 8;
    const anchor = wrapRef.current.getBoundingClientRect();
    const card = cardRef.current.getBoundingClientRect();
    const center = anchor.left + anchor.width / 2;
    const half = card.width / 2;
    let sx = 0;
    if (center - half < margin) sx = margin - (center - half);
    else if (center + half > window.innerWidth - margin) sx = (window.innerWidth - margin) - (center + half);
    setShiftX(sx);
    setPlacement(anchor.top - card.height - 11 < margin ? "below" : "above");
  }, [open]);

  const vertical = placement === "above"
    ? { bottom: "calc(100% + 7px)" as const }
    : { top: "calc(100% + 7px)" as const };

  return (
    <span ref={wrapRef} style={{ position: "relative", whiteSpace: "nowrap" }}
          onMouseEnter={show} onMouseLeave={hide}>
      <a
        href={citation.url} target="_blank" rel="noopener noreferrer"
        onFocus={show} onBlur={hide}
        aria-label={`Source ${index}: ${citation.title || host} (${host})`}
        style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          verticalAlign: "baseline", margin: "0 1px", padding: "1px 5px 1px 4px",
          height: 17, lineHeight: "15px", borderRadius: 5,
          background: open ? C.line : C.sidebar,
          border: `1px solid ${open ? C.line2 : "transparent"}`,
          textDecoration: "none", cursor: "pointer", transition: "background .12s, border-color .12s",
          position: "relative", top: -1,
        }}
      >
        <Favicon url={citation.url} />
        <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 600, color: C.ink2 }}>
          {index}
        </span>
      </a>

      {open && (
        <span ref={cardRef} role="tooltip"
          style={{
            position: "absolute", ...vertical, left: "50%",
            transform: `translateX(calc(-50% + ${shiftX}px))`, width: 300, zIndex: 40,
            background: C.card, border: `1px solid ${C.line2}`, borderRadius: 12,
            boxShadow: "0 8px 28px rgba(40,38,31,0.14)", padding: 12, textAlign: "left",
            whiteSpace: "normal", cursor: "default",
          }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
            <Favicon url={citation.url} size={15} />
            <span style={{ fontFamily: SANS, fontSize: 11.5, color: C.ink2,
                           overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {host}
            </span>
          </span>
          <span style={{ display: "block", fontFamily: SANS, fontSize: 13.5, fontWeight: 600,
                         color: C.ink, lineHeight: 1.35, marginBottom: citation.cited_text ? 7 : 0 }}>
            {citation.title || citation.url}
          </span>
          {citation.cited_text && (
            <span style={{
              display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
              overflow: "hidden", fontFamily: SANS, fontSize: 12.5, color: C.ink2,
              lineHeight: 1.45, borderLeft: `2px solid ${C.line2}`, paddingLeft: 8,
            }}>
              {citation.cited_text}
            </span>
          )}
        </span>
      )}
    </span>
  );
}

// `runs` is the assistant message mapped to ordered { text, citations[] } spans.
// Index numbering is sequential across the whole message.
// B4h: `renderText` lets the caller render a run's body through the artifact-aware assistant renderer
// (splitAssistant → ArtifactCard/Formatted) instead of plain Formatted — so a cited answer that also
// emits an artifact renders the card, not the raw `\0A:<id>\0` placeholder. Defaults to Formatted
// (unchanged behaviour for plain cited answers).
export function CitedText({ runs, startIndex = 1, renderText }: { runs: CitedRun[]; startIndex?: number; renderText?: (text: string) => ReactNode }) {
  let n = startIndex - 1;
  const body = (text: string): ReactNode => (renderText ? renderText(text) : <Formatted text={text} />);
  return (
    <div style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.7, color: C.ink }}>
      {runs.map((run, ri) => {
        const cites = run.citations || [];
        // Non-cited runs: full block markdown (lists/paragraphs/headings/links/bold), artifact-aware.
        if (cites.length === 0) return <div key={ri}>{body(run.text)}</div>;
        // Cited runs: render the body through the full block renderer so a structured web-grounded
        // answer (headings/tables/lists/code/rules) gets the same fidelity as a plain one (and any
        // artifact card renders too), then append the citation chips as a trailing row.
        return (
          <div key={ri}>
            {body(run.text)}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
              {cites.map((cit) => {
                n += 1;
                return <CitationMarker key={`${ri}-${n}`} index={n} citation={cit} />;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
