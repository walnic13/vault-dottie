// Customize — VA-T1 L458–475. Owns its scroll container (identical pixels).
import { C, SANS } from "../theme";
import { InputBox } from "./ui";
import type { Style, StyleKey } from "../types";

export interface CustomizeProps {
  styles: Style[];
  styleKey: StyleKey;
  onSelectStyle: (k: StyleKey) => void;
  custom: string;
  onCustomChange: (s: string) => void;
  onSave: () => void;
  saved: boolean;
  productName: string;
}

export function Customize({ styles, styleKey, onSelectStyle, custom, onCustomChange, onSave, saved, productName }: CustomizeProps) {
  return (
    <div className="vo-scroll" style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "26px 24px" }}>
        <p style={{ color: C.ink2, fontSize: 14, marginTop: 0, marginBottom: 22 }}>Set how the assistant responds. Applies to your chats across {productName}.</p>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Writing style</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 28 }}>
          {styles.map((s) => { const on = styleKey === s.key; return (<button key={s.key} onClick={() => onSelectStyle(s.key)} style={{ textAlign: "left", cursor: "pointer", background: on ? C.coralSoft : C.card, border: `1.5px solid ${on ? C.coral : C.line2}`, borderRadius: 12, padding: "13px 15px", fontFamily: SANS }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{s.label}</div><div style={{ fontSize: 12.5, color: C.ink2 }}>{s.desc}</div>
          </button>); })}
        </div>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Custom instructions</div>
        <div style={{ fontSize: 13, color: C.ink2, marginBottom: 10 }}>Standing context for the team — entity conventions, tone, what to always flag.</div>
        <InputBox value={custom} onChange={onCustomChange} placeholder="e.g. Always use British spelling. Treat all client and fund names as confidential. Flag any cross-border withholding trigger." rows={4} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14 }}>
          <button onClick={onSave} className="vo-new" style={{ background: C.coral, color: "#fff", border: "none", borderRadius: 9, padding: "9px 18px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>Save</button>
          {saved && <span style={{ fontSize: 13, color: C.coralDk }}>Saved — active in your next message.</span>}
        </div>
      </div>
    </div>
  );
}
