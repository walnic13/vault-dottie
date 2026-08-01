// Inline artifact card rendered inside an assistant message — VA-T1 L255–265.
import { C } from "../theme";
import { IcDoc } from "./icons";
import type { Artifact } from "../types";

export function ArtifactCard({ artifact, onOpen }: { artifact: Artifact | undefined; onOpen: () => void }) {
  if (!artifact) return null;
  return (
    <div onClick={onOpen} style={{ display: "flex", alignItems: "center", gap: 12, background: C.card, border: `1px solid ${C.line2}`, borderRadius: 12, padding: "12px 14px", cursor: "pointer", margin: "4px 0 14px", maxWidth: 420 }}>
      <span style={{ color: C.coral }}><IcDoc s={22} /></span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{artifact.title}</div>
        <div style={{ fontSize: 12, color: C.ink3 }}>{artifact.type} · {artifact.versions.length > 1 ? `v${artifact.versions.length} · ` : ""}Click to open</div>
      </div>
    </div>
  );
}
