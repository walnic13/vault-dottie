// Shared input box — ported verbatim from the reference's `inputBox` helper (VA-T1 L239–242).
import { C, SANS } from "../theme";

export function InputBox({ value, onChange, placeholder, rows = 1 }: {
  value: string; onChange: (v: string) => void; placeholder: string; rows?: number;
}) {
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder}
      style={{ width: "100%", border: `1px solid ${C.line2}`, borderRadius: 10, padding: "10px 12px", fontFamily: SANS, fontSize: 14, color: C.ink, resize: "vertical", background: C.card, lineHeight: 1.5 }} />
  );
}
