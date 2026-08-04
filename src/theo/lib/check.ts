// Governance-component payload — the structured body of a [[CHECK]]...[[/CHECK]] block
// (DOTTIE_DESIGN_SYSTEM §3 anatomy / §4 intensities). Dottie emits this JSON for a substantive
// or adjudication answer; the renderer (GovernanceCheck) draws the component from it. A light
// lookup carries no block. parseCheck is intentionally forgiving: any shape it cannot trust
// becomes null, and the renderer falls back to plain markdown for a completed-but-unparseable
// block (R-COMPONENT stays a floor, not a crash surface). (A still-open opener mid-stream is
// suppressed by splitChecks and shown as text once final — see lib/artifacts.ts.)

// The three semantic verdicts (§2.4). Absent/null verdict = the "Grounded" intensity ("My read");
// a present verdict = the "Grounded + verdict" adjudication intensity.
export type Verdict = "concur" | "caution" | "challenge";

export interface CheckSupport {
  label: string; // monospace eyebrow — e.g. "Authority", "What it says", "How it applies"
  body: string; // the prose under the eyebrow
  cites?: string[]; // optional citation chips (IRC §…, Treas. Reg. §…) — rendered mono, info-tinted
}

export interface CheckConfidence {
  level?: number; // 0..1 fill for the meter; omitted → meter hidden, label only
  label: string; // "high" | "fact-dependent" | "low" | …
}

export interface CheckClaim {
  source?: string; // the review target ref — e.g. "Theo · §1446(f) answer"
  text: string; // the assertion being judged
}

export interface CheckData {
  verdict: Verdict | null;
  claim: CheckClaim | null;
  lead: string;
  support: CheckSupport[];
  conclusion: string;
  flags: string[];
  confidence: CheckConfidence | null;
  docs: string[];
}

const VERDICTS: Verdict[] = ["concur", "caution", "challenge"];

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}
function strArr(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "") : [];
}

// Parse the raw [[CHECK]] block body into a trusted CheckData, or null if it cannot be trusted.
// The one hard requirement is a non-empty `lead` (there is no component without a position to
// state); everything else is normalised to a safe default so a partial payload still renders.
export function parseCheck(raw: string): CheckData | null {
  let obj: unknown;
  try {
    obj = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!obj || typeof obj !== "object") return null;
  const o = obj as Record<string, unknown>;

  const lead = str(o.lead).trim();
  if (!lead) return null;

  const verdict = typeof o.verdict === "string" && (VERDICTS as string[]).includes(o.verdict)
    ? (o.verdict as Verdict)
    : null;

  let claim: CheckClaim | null = null;
  if (o.claim && typeof o.claim === "object") {
    const c = o.claim as Record<string, unknown>;
    const text = str(c.text).trim();
    if (text) claim = { text, source: str(c.source).trim() || undefined };
  }

  const support: CheckSupport[] = Array.isArray(o.support)
    ? o.support
        .filter((s): s is Record<string, unknown> => !!s && typeof s === "object")
        .map((s) => ({ label: str(s.label).trim(), body: str(s.body).trim(), cites: strArr(s.cites) }))
        .filter((s) => s.label !== "" || s.body !== "")
    : [];

  let confidence: CheckConfidence | null = null;
  if (o.confidence && typeof o.confidence === "object") {
    const cf = o.confidence as Record<string, unknown>;
    const label = str(cf.label).trim();
    const level = typeof cf.level === "number" && Number.isFinite(cf.level)
      ? Math.max(0, Math.min(1, cf.level))
      : undefined;
    if (label || level !== undefined) confidence = { label: label || "—", level };
  }

  return {
    verdict,
    claim,
    lead,
    support,
    conclusion: str(o.conclusion).trim(),
    flags: strArr(o.flags),
    confidence,
    docs: strArr(o.docs),
  };
}
