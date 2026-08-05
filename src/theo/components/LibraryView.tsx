// LibraryView — "Library & Sources", the dedicated governance-console surface (DOTTIE_DESIGN_SYSTEM §6.1):
// the authorities Dottie relies on and the documents she has asked for, aggregated across every check. Derived
// entirely from the deployed dottie_findings store (authorities[] + docs_expected[], loaded via loadOverview);
// no new backend. Citations render MONO in the info token (§2.5/§2.4); a count shows how many checks lean on each.
import { C, MONO, SANS } from "../theme";
import type { Finding } from "../types";

interface Tally { name: string; count: number }

// Count occurrences of each string across the findings' arrays, ranked by frequency then name.
function tally(rows: string[][]): Tally[] {
  const m = new Map<string, number>();
  for (const arr of rows) for (const s of arr) {
    const k = (s || "").trim();
    if (k) m.set(k, (m.get(k) || 0) + 1);
  }
  return [...m.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

const MICRO = { fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase" as const };

export interface LibraryViewProps {
  findings: Finding[];
  loading: boolean;
}

export function LibraryView({ findings, loading }: LibraryViewProps) {
  const authorities = tally(findings.map((f) => f.authorities));
  const docs = tally(findings.map((f) => f.docs_expected));

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "8px 4px 40px", fontFamily: SANS, color: C.ink }}>
      <div style={{ fontSize: 13, color: C.ink3, lineHeight: 1.5 }}>
        The authorities Dottie relies on and the documents she has asked for — aggregated across every check.
      </div>

      {/* Authorities cited */}
      <div style={{ ...MICRO, color: C.ink2, letterSpacing: ".12em", margin: "26px 0 12px" }}>Authorities cited</div>
      {loading && authorities.length === 0 ? (
        <div style={{ fontSize: 13, color: C.ink3, padding: "8px 2px" }}>Loading…</div>
      ) : authorities.length === 0 ? (
        <div style={{ fontSize: 13, color: C.ink3, lineHeight: 1.6, padding: "8px 2px" }}>
          No authorities yet. The IRC §§, Treasury Regs and rulings Dottie cites in her checks collect here.
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {authorities.map((a) => (
            <span key={a.name} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: MONO, fontSize: 12,
              color: C.info, background: C.infoBg, border: `1px solid ${C.info}`, borderRadius: 8, padding: "4px 10px" }}>
              {a.name}
              <span style={{ color: C.ink3, fontVariantNumeric: "tabular-nums" }}>{a.count}</span>
            </span>
          ))}
        </div>
      )}

      {/* Documents expected */}
      <div style={{ ...MICRO, color: C.ink2, letterSpacing: ".12em", margin: "26px 0 12px" }}>Documents expected</div>
      {docs.length === 0 ? (
        <div style={{ fontSize: 13, color: C.ink3, lineHeight: 1.6, padding: "8px 2px" }}>
          {loading ? "Loading…" : "No documents requested yet. When a conclusion needs support (an executed PSA, a partnership agreement …), it appears here."}
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {docs.map((d) => (
            <span key={d.name} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: MONO, fontSize: 12,
              color: C.ink2, border: `1px dashed ${C.line}`, borderRadius: 8, padding: "4px 10px" }}>
              {d.name}
              <span style={{ color: C.ink3, fontVariantNumeric: "tabular-nums" }}>{d.count}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
