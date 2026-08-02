// ArtifactPanel — versioned side panel (VA-T1 L496–523).
import { C, SANS, MONO } from "../theme";
import { Formatted } from "../lib/markdown";
import { IcClose } from "./icons";
import type { Artifact } from "../types";

export interface ArtifactPanelProps {
  artifact: Artifact;
  openVersion: number;   // < 0 ⇒ latest
  onSelectVersion: (v: number) => void;
  onCopy: () => void;
  copied: boolean;
  onClose: () => void;
}

export function ArtifactPanel({ artifact, openVersion, onSelectVersion, onCopy, copied, onClose }: ArtifactPanelProps) {
  const vi = openVersion < 0 ? artifact.versions.length - 1 : openVersion;
  const cur = artifact.versions[vi];
  return (
    <aside className="vo-panel" style={{ flex: "0 0 46%", minWidth: 380, borderLeft: `1px solid ${C.line}`, background: C.card, display: "flex", flexDirection: "column" }}>
      <div style={{ height: 52, borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px 0 16px", flexShrink: 0 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{artifact.title}</div>
          <div style={{ fontSize: 11.5, color: C.ink3 }}>{artifact.type}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {artifact.versions.length > 1 && (
            <select value={vi} onChange={(e) => onSelectVersion(Number(e.target.value))} style={{ fontFamily: SANS, fontSize: 12.5, border: `1px solid ${C.line2}`, borderRadius: 8, padding: "4px 6px", color: C.ink2, background: "#fff" }}>
              {artifact.versions.map((_, i) => <option key={i} value={i}>v{i + 1}</option>)}
            </select>
          )}
          <button className="vo-ghost" onClick={onCopy} style={{ background: "none", border: `1px solid ${C.line2}`, borderRadius: 8, padding: "5px 10px", fontSize: 12.5, cursor: "pointer", color: C.ink2, fontFamily: SANS }}>{copied ? "Copied" : "Copy"}</button>
          <button className="vo-ghost" onClick={onClose} title="Close" style={{ background: "none", border: "none", cursor: "pointer", color: C.ink2, padding: 5, display: "flex", borderRadius: 8 }}><IcClose s={18} /></button>
        </div>
      </div>
      <div className="vo-scroll" style={{ flex: 1, overflowY: "auto" }}>
        {artifact.type === "html" ? (
          <iframe title={artifact.title} sandbox="allow-scripts" srcDoc={cur.content} style={{ width: "100%", height: "100%", border: "none", background: "#fff" }} />
        ) : artifact.type === "code" ? (
          <pre style={{ margin: 0, padding: 20, fontFamily: MONO, fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word", color: C.ink }}>{cur.content}</pre>
        ) : (
          <div style={{ padding: "22px 24px", fontSize: 14.5, color: C.ink }}><Formatted text={cur.content} /></div>
        )}
      </div>
    </aside>
  );
}
