// FindingCard / FlagRow — the shared render primitives for Dottie's governance-findings store, used by both
// the Overview (§6.1 dashboard) and the Checks-on-Theo surface. A finding renders as a verdict-ruled card
// (badge · review target · claim · Dottie's read · citation chips · confidence); a flag as a severity-marked
// row. Extracted from OverviewView (pkg 3b.1) so the Checks surface reuses the exact same vocabulary — verdict
// colours are the semantic C tokens (§2.4, never the gold accent), provenance is MONO (§2.5). Inline-style idiom.
import { C, MONO } from "../theme";
import type { Finding, Flag, Verdict } from "../types";

export const MICRO = { fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase" as const };

export function verdictMeta(v: Verdict): { label: string; color: string; bg: string } {
  if (v === "concur") return { label: "Concur", color: C.concur, bg: C.concurBg };
  if (v === "caution") return { label: "Caution", color: C.caution, bg: C.cautionBg };
  return { label: "Challenge", color: C.challenge, bg: C.challengeBg };
}

export function severityColor(s: Flag["severity"]): string {
  return s === "high" ? C.challenge : s === "medium" ? C.caution : C.ink3;
}

// "3 Aug" — compact, locale-stable enough for a governance log.
export function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function VerdictBadge({ v }: { v: Verdict }) {
  const m = verdictMeta(v);
  return (
    <span style={{ ...MICRO, display: "inline-flex", alignItems: "center", gap: 5, color: m.color, background: m.bg,
      border: `1px solid ${m.color}`, borderRadius: 999, padding: "2px 8px", letterSpacing: ".1em" }}>
      <span aria-hidden="true" style={{ fontSize: 10 }}>⚖</span>{m.label}
    </span>
  );
}

// A finding card. When `onOpen` is given AND the finding links a conversation, the card is clickable
// (opens that source turn — traceability from a check back to where Dottie made it). `detail` shows the
// conclusion + documentation-expected chips (the Checks surface); the Overview omits them for density.
export function FindingCard({ f, onOpen, detail }: { f: Finding; onOpen?: (conversationId: string) => void; detail?: boolean }) {
  const m = verdictMeta(f.verdict);
  const headline = f.claim_text || f.lead || f.target_ref;
  const clickable = !!(onOpen && f.conversation_id);
  return (
    <div
      onClick={clickable ? () => onOpen!(f.conversation_id!) : undefined}
      role={clickable ? "button" : undefined}
      title={clickable ? "Open the conversation where Dottie made this check" : undefined}
      style={{ background: C.card, border: `1px solid ${C.line2}`, borderLeft: `3px solid ${m.color}`, borderRadius: 12,
        padding: "12px 14px", cursor: clickable ? "pointer" : "default" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 7 }}>
        <VerdictBadge v={f.verdict} />
        {f.claim_source && <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.ink3 }}>{f.claim_source}</span>}
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: MONO, fontSize: 11, color: C.ink3, fontVariantNumeric: "tabular-nums" }}>{fmtDate(f.created_at)}</span>
      </div>
      {headline && <div style={{ fontSize: 14, lineHeight: 1.5, color: C.ink, marginBottom: f.lead && f.lead !== headline ? 5 : 0 }}>{headline}</div>}
      {f.lead && f.lead !== headline && <div style={{ fontSize: 13, lineHeight: 1.5, color: C.ink2 }}>{f.lead}</div>}
      {detail && f.conclusion && (
        <div style={{ marginTop: 9, background: m.bg, border: `1px solid ${m.color}`, borderRadius: 8, padding: "8px 11px" }}>
          <div style={{ ...MICRO, color: m.color, marginBottom: 4 }}>Conclusion</div>
          <div style={{ fontSize: 13, lineHeight: 1.5, color: C.ink }}>{f.conclusion}</div>
        </div>
      )}
      {(f.authorities.length > 0 || f.confidence_label) && (
        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginTop: 9 }}>
          {f.authorities.slice(0, detail ? 12 : 4).map((a, i) => (
            <span key={i} style={{ fontFamily: MONO, fontSize: 11, color: C.info, background: C.infoBg, border: `1px solid ${C.info}`, borderRadius: 6, padding: "1px 6px", whiteSpace: "nowrap" }}>{a}</span>
          ))}
          {f.confidence_label && <span style={{ ...MICRO, color: C.ink3, marginLeft: "auto" }}>conf · {f.confidence_label}</span>}
        </div>
      )}
      {detail && f.docs_expected.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 9 }}>
          {f.docs_expected.map((d, i) => (
            <span key={i} style={{ fontFamily: MONO, fontSize: 11, color: C.ink2, border: `1px dashed ${C.line}`, borderRadius: 6, padding: "1px 7px" }}>{d}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// A flag row. When `onResolve` is given it renders a Resolve (open→resolved) / Re-open (resolved→open) button.
export function FlagRow({ fl, onResolve }: { fl: Flag; onResolve?: (flagId: string, status: "open" | "resolved") => void }) {
  const resolved = fl.status === "resolved";
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: C.card, border: `1px solid ${C.line2}`, borderRadius: 10, padding: "10px 13px", opacity: resolved ? 0.7 : 1 }}>
      <span aria-hidden="true" style={{ color: resolved ? C.concur : severityColor(fl.severity), flexShrink: 0, marginTop: 1 }}>{resolved ? "✓" : "⚑"}</span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 13, lineHeight: 1.45, color: C.ink2, textDecoration: resolved ? "line-through" : "none" }}>{fl.summary || fl.flag_type.replace(/_/g, " ")}</div>
        <div style={{ ...MICRO, color: C.ink3, marginTop: 4 }}>{fl.flag_type.replace(/_/g, " ")} · {fl.severity}</div>
      </div>
      {onResolve && (
        <button onClick={() => onResolve(fl.id, resolved ? "open" : "resolved")}
          title={resolved ? "Re-open this flag" : "Mark this flag resolved"}
          style={{ ...MICRO, letterSpacing: ".08em", flexShrink: 0, cursor: "pointer", background: "transparent",
            color: resolved ? C.ink3 : C.concur, border: `1px solid ${resolved ? C.line2 : C.concur}`, borderRadius: 999, padding: "3px 10px", fontFamily: MICRO.fontFamily }}>
          {resolved ? "Re-open" : "Resolve"}
        </button>
      )}
      <span style={{ fontFamily: MONO, fontSize: 11, color: C.ink3, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{fmtDate(fl.created_at)}</span>
    </div>
  );
}
