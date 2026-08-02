// DEV-only app-context injector (Pass B; GREENFIELD). Simulates Origin's in-process
// app-context broadcast (App Host §6A / VA-T3 §4) so the standalone vault-theo-dev SWA can
// exercise the app-context chip WITHOUT the Origin host. Rendered by TheoSurface only in the
// standalone harness branch — under `vite dev`, or via `?devctx` on the deployed dev SWA (a
// production build). Never in the Origin mount (portal branch), so it stays out of the real
// product. Mirrors the idiom of Origin's DevFolderPickTest. No browser storage; no fetch.
import { useState } from "react";
import { C, SANS } from "../theme";
import type { AppContext } from "../types";

const SAMPLES: { label: string; ctx: AppContext }[] = [
  { label: "Reporting · Workpaper", ctx: { app_key: "reporting", app_context: { workpaper_id: "wp_demo_001", period_id: "FY2024" } } },
  { label: "Reporting (no anchor)", ctx: { app_key: "reporting", app_context: null } },
  { label: "Origin (clear)", ctx: { app_key: null, app_context: null } },
];

export function DevContextInjector({ onInject }: { onInject: (ctx: AppContext) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "fixed", bottom: 12, right: 12, zIndex: 50, fontFamily: SANS }}>
      {open && (
        <div style={{ background: "#fff", border: `1px solid ${C.line2}`, borderRadius: 10, padding: 10, marginBottom: 8, boxShadow: "0 4px 18px rgba(40,38,31,.12)" }}>
          <div style={{ fontSize: 11, color: C.ink3, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>Dev · inject app-context</div>
          {SAMPLES.map((s) => (
            <button key={s.label} onClick={() => onInject(s.ctx)} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: "5px 6px", fontSize: 12.5, color: C.ink, cursor: "pointer", fontFamily: SANS, borderRadius: 6 }}>{s.label}</button>
          ))}
        </div>
      )}
      <button onClick={() => setOpen((v) => !v)} title="Dev: inject app-context" style={{ background: C.ink, color: "#fff", border: "none", borderRadius: 999, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontFamily: SANS }}>DEV ctx</button>
    </div>
  );
}
