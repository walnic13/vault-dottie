// AuditView — "Audit trail", the dedicated governance-console surface (DOTTIE_DESIGN_SYSTEM §6.1): a terse,
// chronological event log of Dottie's governance activity — every check she recorded and every flag she raised,
// newest first. Distinct from Checks-on-Theo (rich, verdict-filtered cards): this is the time-ordered ledger.
// Derived from the same deployed dottie_findings/dottie_flags store (loaded via loadOverview); no new backend.
// Verdict dots use the semantic C tokens (§2.4); timestamps render MONO (§2.5). Read-only.
import { C, MONO, SANS } from "../theme";
import type { Finding, Flag } from "../types";
import { verdictMeta, severityColor } from "./FindingCard";

interface AuditEvent {
  id: string;
  at: string;
  kind: "check" | "flag";
  color: string;
  label: string; // the mono eyebrow (verdict / flag type)
  text: string;  // the human line
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export interface AuditViewProps {
  findings: Finding[];
  flags: Flag[];
  loading: boolean;
}

export function AuditView({ findings, flags, loading }: AuditViewProps) {
  const events: AuditEvent[] = [
    ...findings.map((f): AuditEvent => {
      const m = verdictMeta(f.verdict);
      const target = f.claim_source || f.target_ref;
      return { id: "c" + f.id, at: f.created_at, kind: "check", color: m.color, label: m.label,
        text: `Recorded a ${m.label.toLowerCase()} check${target ? ` on ${target}` : ""}${f.claim_text ? ` — “${f.claim_text}”` : (f.lead ? ` — ${f.lead}` : "")}` };
    }),
    ...flags.map((fl): AuditEvent => ({
      id: "f" + fl.id, at: fl.created_at, kind: "flag", color: severityColor(fl.severity),
      label: fl.flag_type.replace(/_/g, " "),
      text: `Raised a flag${fl.summary ? `: ${fl.summary}` : ` (${fl.flag_type.replace(/_/g, " ")})`}` }),
    ),
  ].sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "8px 4px 40px", fontFamily: SANS, color: C.ink }}>
      <div style={{ fontSize: 13, color: C.ink3, lineHeight: 1.5 }}>
        A time-ordered ledger of Dottie's governance activity — every check recorded and flag raised, newest first.
      </div>

      <div style={{ marginTop: 20 }}>
        {loading && events.length === 0 ? (
          <div style={{ fontSize: 13, color: C.ink3, padding: "8px 2px" }}>Loading…</div>
        ) : events.length === 0 ? (
          <div style={{ fontSize: 13, color: C.ink3, lineHeight: 1.6, padding: "8px 2px" }}>
            No activity yet. Dottie's checks and flags appear here as she makes them.
          </div>
        ) : (
          <div style={{ borderLeft: `1px solid ${C.line2}`, marginLeft: 6, display: "flex", flexDirection: "column", gap: 2 }}>
            {events.map((e) => (
              <div key={e.id} style={{ display: "flex", gap: 12, padding: "9px 0 9px 18px", position: "relative" }}>
                <span aria-hidden="true" style={{ position: "absolute", left: -4, top: 13, width: 7, height: 7, borderRadius: 999,
                  background: e.kind === "check" ? e.color : C.bg, border: `1.5px solid ${e.color}` }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, lineHeight: 1.5, color: C.ink2 }}>{e.text}</div>
                  <div style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: e.color, marginTop: 3 }}>
                    {e.kind === "check" ? "check" : "flag"} · {e.label}
                  </div>
                </div>
                <span style={{ fontFamily: MONO, fontSize: 11, color: C.ink3, flexShrink: 0, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{fmtDateTime(e.at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
