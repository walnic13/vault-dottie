// FlagsView — "Open flags", the dedicated governance-console surface (DOTTIE_DESIGN_SYSTEM §6.1): the flags Dottie
// has raised (unsupported assumption, missing documentation, tag drift, review-chain gap), filterable by status.
// Reads the same deployed dottie_flags store as the Overview (loaded via loadOverview with status=all); the flag
// row is the shared ./FindingCard primitive. Severity colours are the semantic C tokens (§2.4). Read-only —
// a resolve action needs a dottie_flag_resolve write handler (pkg 3b.3-backend / later), disclosed in the VEP.
import { useState } from "react";
import { C, SANS } from "../theme";
import type { Flag } from "../types";
import { FlagRow, MICRO } from "./FindingCard";

type FStatus = "open" | "resolved" | "all";

export interface FlagsViewProps {
  flags: Flag[];
  loading: boolean;
}

export function FlagsView({ flags, loading }: FlagsViewProps) {
  const [status, setStatus] = useState<FStatus>("open");
  const counts = { open: 0, resolved: 0, all: flags.length };
  for (const f of flags) counts[f.status]++;
  const shown = status === "all" ? flags : flags.filter((f) => f.status === status);

  const tabs: { key: FStatus; label: string; color?: string }[] = [
    { key: "open", label: "Open", color: C.caution },
    { key: "resolved", label: "Resolved", color: C.concur },
    { key: "all", label: "All" },
  ];

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "8px 4px 40px", fontFamily: SANS, color: C.ink }}>
      <div style={{ fontSize: 13, color: C.ink3, lineHeight: 1.5 }}>
        Governance flags Dottie has raised — assumptions to confirm, documentation still needed, and other open risks.
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
        {tabs.map((t) => {
          const active = status === t.key;
          const c = t.color || C.coral;
          return (
            <button key={t.key} onClick={() => setStatus(t.key)} style={{
              ...MICRO, letterSpacing: ".1em", display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer",
              background: active ? C.panel2 : "transparent", color: active ? c : C.ink3,
              border: `1px solid ${active ? c : C.line2}`, borderRadius: 999, padding: "5px 12px", fontFamily: MICRO.fontFamily,
            }}>
              {t.label}
              <span style={{ color: active ? c : C.ink3, fontVariantNumeric: "tabular-nums" }}>{counts[t.key]}</span>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 18 }}>
        {loading && flags.length === 0 ? (
          <div style={{ fontSize: 13, color: C.ink3, padding: "8px 2px" }}>Loading…</div>
        ) : shown.length === 0 ? (
          <div style={{ fontSize: 13, color: C.ink3, lineHeight: 1.6, padding: "8px 2px" }}>
            {status === "open" ? "No open flags — nothing needs confirming right now." : status === "resolved" ? "No resolved flags." : "No flags yet. Dottie raises a flag when an adjudication rests on an unconfirmed assumption or missing document."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {shown.map((fl) => <FlagRow key={fl.id} fl={fl} />)}
          </div>
        )}
      </div>
    </div>
  );
}
