// OverviewView — the 9/10 governance-console Overview (DOTTIE_DESIGN_SYSTEM §6.1): Dottie's oversight home,
// rendering her operational L4 store (the deployed dottie_findings/dottie_flags read handlers). Top: a summary
// stat row (total checks + per-verdict counts + open flags). Then "Recent checks on Theo" (findings as compact
// verdict cards) and "Open flags". Read-only; no chrome the shell owns. Inline-style / token idiom (VA-T1);
// verdict colours are the semantic C tokens (§2.4, never the gold accent); provenance in MONO (§2.5).
import type { ReactNode } from "react";
import { C, MONO, SANS } from "../theme";
import type { Finding, Flag, Verdict } from "../types";

const MICRO = { fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase" as const };

function verdictMeta(v: Verdict): { label: string; color: string; bg: string } {
  if (v === "concur") return { label: "Concur", color: C.concur, bg: C.concurBg };
  if (v === "caution") return { label: "Caution", color: C.caution, bg: C.cautionBg };
  return { label: "Challenge", color: C.challenge, bg: C.challengeBg };
}

function severityColor(s: Flag["severity"]): string {
  return s === "high" ? C.challenge : s === "medium" ? C.caution : C.ink3;
}

// "3 Aug" / "3 Aug '26" — compact, locale-stable enough for a governance log.
function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div style={{ flex: "1 1 120px", minWidth: 110, background: C.card, border: `1px solid ${C.line2}`, borderRadius: 12, padding: "13px 15px" }}>
      <div style={{ fontSize: 26, fontWeight: 650, lineHeight: 1, color: color || C.ink, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div style={{ ...MICRO, color: C.ink3, marginTop: 7 }}>{label}</div>
    </div>
  );
}

function VerdictBadge({ v }: { v: Verdict }) {
  const m = verdictMeta(v);
  return (
    <span style={{ ...MICRO, display: "inline-flex", alignItems: "center", gap: 5, color: m.color, background: m.bg,
      border: `1px solid ${m.color}`, borderRadius: 999, padding: "2px 8px", letterSpacing: ".1em" }}>
      <span aria-hidden="true" style={{ fontSize: 10 }}>⚖</span>{m.label}
    </span>
  );
}

function FindingCard({ f }: { f: Finding }) {
  const m = verdictMeta(f.verdict);
  const headline = f.claim_text || f.lead || f.target_ref;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.line2}`, borderLeft: `3px solid ${m.color}`, borderRadius: 12, padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 7 }}>
        <VerdictBadge v={f.verdict} />
        {f.claim_source && <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.ink3 }}>{f.claim_source}</span>}
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: MONO, fontSize: 11, color: C.ink3, fontVariantNumeric: "tabular-nums" }}>{fmtDate(f.created_at)}</span>
      </div>
      {headline && <div style={{ fontSize: 14, lineHeight: 1.5, color: C.ink, marginBottom: f.lead && f.lead !== headline ? 5 : 0 }}>{headline}</div>}
      {f.lead && f.lead !== headline && <div style={{ fontSize: 13, lineHeight: 1.5, color: C.ink2 }}>{f.lead}</div>}
      {(f.authorities.length > 0 || f.confidence_label) && (
        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginTop: 9 }}>
          {f.authorities.slice(0, 4).map((a, i) => (
            <span key={i} style={{ fontFamily: MONO, fontSize: 11, color: C.info, background: C.infoBg, border: `1px solid ${C.info}`, borderRadius: 6, padding: "1px 6px", whiteSpace: "nowrap" }}>{a}</span>
          ))}
          {f.confidence_label && <span style={{ ...MICRO, color: C.ink3, marginLeft: "auto" }}>conf · {f.confidence_label}</span>}
        </div>
      )}
    </div>
  );
}

function FlagRow({ fl }: { fl: Flag }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: C.card, border: `1px solid ${C.line2}`, borderRadius: 10, padding: "10px 13px" }}>
      <span aria-hidden="true" style={{ color: severityColor(fl.severity), flexShrink: 0, marginTop: 1 }}>⚑</span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 13, lineHeight: 1.45, color: C.ink2 }}>{fl.summary || fl.flag_type.replace(/_/g, " ")}</div>
        <div style={{ ...MICRO, color: C.ink3, marginTop: 4 }}>{fl.flag_type.replace(/_/g, " ")} · {fl.severity}</div>
      </div>
      <span style={{ fontFamily: MONO, fontSize: 11, color: C.ink3, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{fmtDate(fl.created_at)}</span>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <div style={{ ...MICRO, color: C.ink2, letterSpacing: ".12em", margin: "26px 0 12px" }}>{children}</div>;
}

function Empty({ text }: { text: string }) {
  return <div style={{ fontSize: 13, color: C.ink3, lineHeight: 1.6, padding: "8px 2px" }}>{text}</div>;
}

export interface OverviewViewProps {
  findings: Finding[];
  flags: Flag[];
  loading: boolean;
  onOpenConversation?: (conversationId: string) => void;
}

export function OverviewView({ findings, flags, loading }: OverviewViewProps) {
  const counts = { concur: 0, caution: 0, challenge: 0 };
  for (const f of findings) counts[f.verdict]++;
  const openFlags = flags.filter((fl) => fl.status === "open");

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "8px 4px 40px", fontFamily: SANS, color: C.ink }}>
      <div style={{ fontSize: 13, color: C.ink3, lineHeight: 1.5 }}>
        Dottie's oversight — every check she runs on a claim, her verdicts, and the flags still open.
      </div>

      {/* Summary stat row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 11, marginTop: 18 }}>
        <StatCard label="Checks" value={findings.length} />
        <StatCard label="Concur" value={counts.concur} color={C.concur} />
        <StatCard label="Caution" value={counts.caution} color={C.caution} />
        <StatCard label="Challenge" value={counts.challenge} color={C.challenge} />
        <StatCard label="Open flags" value={openFlags.length} color={openFlags.length ? C.caution : undefined} />
      </div>

      {/* Recent checks on Theo */}
      <SectionLabel>Recent checks</SectionLabel>
      {loading && findings.length === 0 ? (
        <Empty text="Loading…" />
      ) : findings.length === 0 ? (
        <Empty text="No checks yet. Dottie records a check each time she adjudicates a claim — ask her to review one of Theo's answers, then it appears here." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {findings.slice(0, 20).map((f) => <FindingCard key={f.id} f={f} />)}
        </div>
      )}

      {/* Open flags */}
      <SectionLabel>Open flags</SectionLabel>
      {openFlags.length === 0 ? (
        <Empty text={loading ? "Loading…" : "No open flags."} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {openFlags.slice(0, 20).map((fl) => <FlagRow key={fl.id} fl={fl} />)}
        </div>
      )}
    </div>
  );
}
