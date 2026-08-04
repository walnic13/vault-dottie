// OverviewView — the 9/10 governance-console Overview (DOTTIE_DESIGN_SYSTEM §6.1): Dottie's oversight home,
// rendering her operational L4 store (the deployed dottie_findings/dottie_flags read handlers). Top: a summary
// stat row (total checks + per-verdict counts + open flags). Then "Recent checks on Theo" (findings as compact
// verdict cards, click-through to the source turn) and "Open flags". Read-only; no chrome the shell owns.
// The finding/flag render primitives are shared with the Checks surface (./FindingCard, pkg 3b.2).
import type { ReactNode } from "react";
import { C, SANS } from "../theme";
import type { Finding, Flag } from "../types";
import { FindingCard, FlagRow, MICRO } from "./FindingCard";

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div style={{ flex: "1 1 120px", minWidth: 110, background: C.card, border: `1px solid ${C.line2}`, borderRadius: 12, padding: "13px 15px" }}>
      <div style={{ fontSize: 26, fontWeight: 650, lineHeight: 1, color: color || C.ink, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div style={{ ...MICRO, color: C.ink3, marginTop: 7 }}>{label}</div>
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
  onResolveFlag?: (flagId: string, status: "open" | "resolved") => void;
}

export function OverviewView({ findings, flags, loading, onOpenConversation, onResolveFlag }: OverviewViewProps) {
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
          {findings.slice(0, 20).map((f) => <FindingCard key={f.id} f={f} onOpen={onOpenConversation} />)}
        </div>
      )}

      {/* Open flags */}
      <SectionLabel>Open flags</SectionLabel>
      {openFlags.length === 0 ? (
        <Empty text={loading ? "Loading…" : "No open flags."} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {openFlags.slice(0, 20).map((fl) => <FlagRow key={fl.id} fl={fl} onResolve={onResolveFlag} />)}
        </div>
      )}
    </div>
  );
}
