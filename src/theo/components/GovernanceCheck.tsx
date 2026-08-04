// GovernanceCheck — the governance component (DOTTIE_DESIGN_SYSTEM §3, the core). One component
// renders every substantive Dottie answer and every check; it is the same across all surfaces (§6).
// It is fed a parsed [[CHECK]] payload (lib/check.ts) and draws the §3 anatomy, top to bottom:
//   1 Byline (Dottie · independent) + verdict badge / My-read tag
//   2 Claim under review (adjudication only)
//   3 Lead line
//   4 Support — left-ruled, monospace eyebrows (Authority / What it says / How it applies) + cites
//   5 Conclusion callout — colour-keyed to the verdict, neutral gold for a direct position
//   6 Flags (assumption / risk)
//   7 Confidence — a mono meter + label
//   8 Documentation expected — dashed mono chips
// Intensity is implicit in the payload (R-INTENSITY §4): a verdict → "Grounded + verdict"; no
// verdict → "Grounded" (My read). Light lookups never reach here — they carry no [[CHECK]] block
// and render as plain markdown upstream. Inline-style / token idiom (VA-T1); provenance in MONO
// (§2.5), gold for provenance eyebrows only, semantic colours never swapped for the accent (§2.4).
import { C, MONO, SANS } from "../theme";
import type { CheckData, Verdict } from "../lib/check";

const MICRO = { fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase" as const };

function verdictMeta(v: Verdict): { label: string; color: string; bg: string } {
  if (v === "concur") return { label: "Concur", color: C.concur, bg: C.concurBg };
  if (v === "caution") return { label: "Caution", color: C.caution, bg: C.cautionBg };
  return { label: "Challenge", color: C.challenge, bg: C.challengeBg };
}

function VerdictBadge({ v }: { v: Verdict }) {
  const m = verdictMeta(v);
  return (
    <span style={{ ...MICRO, display: "inline-flex", alignItems: "center", gap: 5, color: m.color,
      background: m.bg, border: `1px solid ${m.color}`, borderRadius: 999, padding: "3px 9px", letterSpacing: ".1em" }}>
      <span aria-hidden="true" style={{ fontSize: 11 }}>⚖</span>{m.label}
    </span>
  );
}

function MyReadTag() {
  return (
    <span style={{ ...MICRO, color: C.coral, background: C.coralSoft, border: `1px solid ${C.coral}`,
      borderRadius: 999, padding: "3px 9px", letterSpacing: ".1em" }}>My read</span>
  );
}

function CiteChip({ text }: { text: string }) {
  return (
    <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.info, background: C.infoBg,
      border: `1px solid ${C.info}`, borderRadius: 6, padding: "1px 7px", whiteSpace: "nowrap" }}>{text}</span>
  );
}

export function GovernanceCheck({ data }: { data: CheckData }) {
  const v = data.verdict;
  const cm = v ? verdictMeta(v) : null;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.line2}`, borderRadius: 14,
      padding: "15px 17px 16px", margin: "4px 0 14px", fontFamily: SANS, color: C.ink, maxWidth: 720 }}>

      {/* 1 — Byline */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 11 }}>
        <span style={{ ...MICRO, color: C.ink3, letterSpacing: ".12em" }}>
          Dottie <span style={{ color: C.coral }}>·</span> independent
        </span>
        <span style={{ flex: 1 }} />
        {v ? <VerdictBadge v={v} /> : <MyReadTag />}
      </div>

      {/* 2 — Claim under review (adjudication only) */}
      {data.claim && (
        <div style={{ background: C.inset, borderLeft: `3px solid ${C.line}`, borderRadius: 8,
          padding: "9px 12px", marginBottom: 12 }}>
          <div style={{ ...MICRO, color: C.ink3, marginBottom: 4 }}>
            reviewing{data.claim.source ? ": " : ""}<span style={{ color: C.ink2, textTransform: "none", letterSpacing: 0 }}>{data.claim.source}</span>
          </div>
          <div style={{ fontSize: 13.5, color: C.ink2, fontStyle: "italic", lineHeight: 1.5 }}>“{data.claim.text}”</div>
        </div>
      )}

      {/* 3 — Lead */}
      <div style={{ fontSize: 15, fontWeight: 650, lineHeight: 1.45, color: C.ink, marginBottom: data.support.length ? 13 : 0 }}>
        {data.lead}
      </div>

      {/* 4 — Support (left-ruled, mono eyebrows) */}
      {data.support.length > 0 && (
        <div style={{ borderLeft: `2px solid ${C.line2}`, paddingLeft: 14, display: "flex", flexDirection: "column", gap: 11 }}>
          {data.support.map((s, i) => (
            <div key={i}>
              {s.label && <div style={{ ...MICRO, color: C.coral, marginBottom: 4 }}>{s.label}</div>}
              {s.body && <div style={{ fontSize: 13.5, lineHeight: 1.6, color: C.ink2 }}>{s.body}</div>}
              {s.cites && s.cites.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: s.body ? 6 : 0 }}>
                  {s.cites.map((c, j) => <CiteChip key={j} text={c} />)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 5 — Conclusion callout (verdict-keyed, or neutral gold for a direct position) */}
      {data.conclusion && (
        <div style={{ marginTop: 14, background: cm ? cm.bg : C.coralSoft,
          border: `1px solid ${cm ? cm.color : C.coral}`, borderRadius: 10, padding: "11px 13px" }}>
          <div style={{ ...MICRO, color: cm ? cm.color : C.coral, marginBottom: 5 }}>Conclusion</div>
          <div style={{ fontSize: 14, lineHeight: 1.55, color: C.ink }}>{data.conclusion}</div>
        </div>
      )}

      {/* 6 — Flags */}
      {data.flags.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          {data.flags.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 8, fontSize: 12.5, lineHeight: 1.5, color: C.ink2 }}>
              <span aria-hidden="true" style={{ color: C.caution, flexShrink: 0 }}>⚑</span>
              <span>{f}</span>
            </div>
          ))}
        </div>
      )}

      {/* 7 — Confidence meter */}
      {data.confidence && (
        <div style={{ marginTop: 13, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ ...MICRO, color: C.ink3 }}>Confidence</span>
          {typeof data.confidence.level === "number" && (
            <span style={{ position: "relative", width: 84, height: 5, background: C.line2, borderRadius: 3, overflow: "hidden" }}>
              <span style={{ position: "absolute", inset: 0, width: `${Math.round(data.confidence.level * 100)}%`,
                background: cm ? cm.color : C.coral, borderRadius: 3 }} />
            </span>
          )}
          <span style={{ fontFamily: MONO, fontSize: 12, color: C.ink2, fontVariantNumeric: "tabular-nums" }}>{data.confidence.label}</span>
        </div>
      )}

      {/* 8 — Documentation expected (dashed mono chips) */}
      {data.docs.length > 0 && (
        <div style={{ marginTop: 13 }}>
          <div style={{ ...MICRO, color: C.ink3, marginBottom: 6 }}>Documentation expected</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {data.docs.map((d, i) => (
              <span key={i} style={{ fontFamily: MONO, fontSize: 11.5, color: C.ink2,
                border: `1px dashed ${C.line}`, borderRadius: 6, padding: "2px 8px" }}>{d}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
