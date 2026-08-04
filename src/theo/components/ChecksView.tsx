// ChecksView — "Checks on Theo", the dedicated governance-console surface (DOTTIE_DESIGN_SYSTEM §6.1): the full,
// filterable log of every check Dottie has made, richer than the Overview's recent-checks strip (each card shows
// the conclusion + documentation-expected, and clicks through to the source turn). Reads the same deployed
// dottie_findings store as the Overview; the finding card is the shared ./FindingCard primitive. Verdict filter
// tabs use the semantic C tokens (§2.4). Read-only; inline-style idiom.
import { useState } from "react";
import { C, SANS } from "../theme";
import type { Finding, Verdict } from "../types";
import { FindingCard, MICRO, verdictMeta } from "./FindingCard";

type Filter = "all" | Verdict;

export interface ChecksViewProps {
  findings: Finding[];
  loading: boolean;
  onOpenConversation?: (conversationId: string) => void;
}

export function ChecksView({ findings, loading, onOpenConversation }: ChecksViewProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const counts = { all: findings.length, concur: 0, caution: 0, challenge: 0 };
  for (const f of findings) counts[f.verdict]++;
  const shown = filter === "all" ? findings : findings.filter((f) => f.verdict === filter);

  const tabs: { key: Filter; label: string; color?: string }[] = [
    { key: "all", label: "All" },
    { key: "concur", label: "Concur", color: C.concur },
    { key: "caution", label: "Caution", color: C.caution },
    { key: "challenge", label: "Challenge", color: C.challenge },
  ];

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "8px 4px 40px", fontFamily: SANS, color: C.ink }}>
      <div style={{ fontSize: 13, color: C.ink3, lineHeight: 1.5 }}>
        Every check Dottie has run on a claim — her independent read on Theo's answers, documents, and assertions.
      </div>

      {/* Verdict filter tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
        {tabs.map((t) => {
          const active = filter === t.key;
          const c = t.color || C.coral;
          return (
            <button key={t.key} onClick={() => setFilter(t.key)} style={{
              ...MICRO, letterSpacing: ".1em", display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer",
              background: active ? (t.color ? verdictMeta(t.key as Verdict).bg : C.coralSoft) : "transparent",
              color: active ? c : C.ink3, border: `1px solid ${active ? c : C.line2}`, borderRadius: 999, padding: "5px 12px", fontFamily: MICRO.fontFamily,
            }}>
              {t.label}
              <span style={{ color: active ? c : C.ink3, fontVariantNumeric: "tabular-nums" }}>{counts[t.key]}</span>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 18 }}>
        {loading && findings.length === 0 ? (
          <div style={{ fontSize: 13, color: C.ink3, padding: "8px 2px" }}>Loading…</div>
        ) : shown.length === 0 ? (
          <div style={{ fontSize: 13, color: C.ink3, lineHeight: 1.6, padding: "8px 2px" }}>
            {findings.length === 0
              ? "No checks yet. Dottie records a check each time she adjudicates a claim — ask her to review one of Theo's answers."
              : "No checks with this verdict."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {shown.map((f) => <FindingCard key={f.id} f={f} onOpen={onOpenConversation} detail />)}
          </div>
        )}
      </div>
    </div>
  );
}
