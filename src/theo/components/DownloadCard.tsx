// DownloadCard — VA-T9. The in-chat affordance for a tool-produced downloadable file (first producer:
// the general-chat tool-loop's theo_export_spreadsheet → event: vault_export; API §2.10/§2.12, DR-T11).
// Renders INSIDE the assistant turn directly after the reply body (parallel to ArtifactCard): a
// coral-tint spreadsheet-glyph tile + filename + "Excel spreadsheet · <size>" subtitle + a filled-coral
// Download button that is a real <a href download target="_blank" rel="noopener noreferrer">. No expiry
// text (Walter-approved; expiresAt rides in the payload for a later re-mint enhancement). Zero-dependency
// inline-style (the VA-T1/VA-T5/VA-T7/VA-T8 idiom); no Tailwind, no browser storage.
import { C, SANS } from "../theme";
import type { FileDownload } from "../types";

// Human-readable byte size (mirrors ChatView's formatSize).
function formatSize(bytes?: number): string {
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Friendly file-kind label from the content type (spreadsheet is the only producer today).
function kindLabel(contentType?: string): string {
  if (typeof contentType === "string" && contentType.includes("spreadsheet")) return "Excel spreadsheet";
  return "File";
}

function IcGrid({ s = 20 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
    </svg>
  );
}
function IcDownload({ s = 15 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
    </svg>
  );
}

export function DownloadCard({ download }: { download: FileDownload }) {
  if (!download || !download.downloadUrl || !download.filename) return null;
  const sub = [kindLabel(download.contentType), formatSize(download.byteSize)].filter(Boolean).join(" · ");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 13, background: C.card,
      border: `1px solid ${C.line2}`, borderRadius: 12, padding: "13px 15px", margin: "4px 0 14px", maxWidth: 430 }}>
      <span style={{ width: 38, height: 38, borderRadius: 9, background: C.coralTint, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center", color: C.coral }}>
        <IcGrid s={20} />
      </span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {download.filename}
        </div>
        <div style={{ fontSize: 12, color: C.ink3, marginTop: 1 }}>{sub}</div>
      </div>
      <a href={download.downloadUrl} download={download.filename} target="_blank" rel="noopener noreferrer"
        aria-label={`Download ${download.filename}`}
        style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6, background: C.coral,
          color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600,
          cursor: "pointer", fontFamily: SANS, textDecoration: "none" }}>
        <IcDownload s={15} /> Download
      </a>
    </div>
  );
}
