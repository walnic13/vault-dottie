// Artifact-marker parsing + versioned upsert — ported verbatim from VA-T1 (L109-130).
// The VA-T1 surface uses a U+0000 (NUL) sentinel to mark artifact placeholders inside the
// cleaned text. We build that sentinel at runtime via String.fromCharCode(0) so this source
// stays clean ASCII (no embedded control byte) while remaining byte-faithful at runtime.
// The `[[ARTIFACT ...]]` protocol and the NUL sentinels are preserved EXACTLY (1A handover
// §2.2). Do not alter.
import type { Artifact, ArtifactBlock } from "../types";

const NUL = String.fromCharCode(0);

// pull [[ARTIFACT ...]]...[[/ARTIFACT]] blocks; return text with NUL+n+NUL sentinels + blocks
export function parseArtifacts(text: string): { clean: string; blocks: ArtifactBlock[] } {
  const blocks: ArtifactBlock[] = [];
  const re = /\[\[ARTIFACT([^\]]*)\]\]\s*([\s\S]*?)\s*\[\[\/ARTIFACT\]\]/g;
  const clean = text.replace(re, (_m, attrs: string, body: string) => {
    const t = (attrs.match(/title="([^"]*)"/) || [])[1] || "Untitled";
    const ty = ((attrs.match(/type="([^"]*)"/) || [])[1] || "document") as ArtifactBlock["type"];
    blocks.push({ title: t.trim(), type: ty, content: body.trim() });
    return NUL + (blocks.length - 1) + NUL;
  }).trim();
  return { clean, blocks };
}

export function upsert(arr: Artifact[], b: ArtifactBlock): { next: Artifact[]; id: string } {
  const i = arr.findIndex((a) => a.title.toLowerCase() === b.title.toLowerCase());
  if (i >= 0) {
    const next = arr.slice();
    next[i] = { ...next[i], type: b.type, versions: [...next[i].versions, { content: b.content, ts: Date.now() }] };
    return { next, id: next[i].id };
  }
  const id = "a" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  return { next: [{ id, title: b.title, type: b.type, versions: [{ content: b.content, ts: Date.now() }] }, ...arr], id };
}

// Remap the ordinal placeholders (NUL+n+NUL) emitted by parseArtifacts to durable id
// placeholders (NUL+"A:"+artifactId+NUL), using the ids returned from upsert.
export function remapToIds(clean: string, ids: string[]): string {
  const re = new RegExp(NUL + "(\\d+)" + NUL, "g");
  return clean.replace(re, (_m, i: string) => NUL + "A:" + ids[Number(i)] + NUL);
}

// Strip id placeholders from text destined for the model context (so the artifact ref markup
// never leaks back into a subsequent prompt).
export function stripArtifactRefs(content: string): string {
  const re = new RegExp(NUL + "A:[^" + NUL + "]+" + NUL, "g");
  return content.replace(re, "");
}

export interface AssistantPart {
  kind: "text" | "artifact" | "check";
  value: string; // text content; artifact id when kind === "artifact"; raw JSON body when kind === "check"
}

// Governance-component protocol (Dottie): a substantive/adjudication answer carries a
// [[CHECK]]{json}[[/CHECK]] block whose body is the structured governance payload (verdict,
// claim, lead, support[], conclusion, flags, confidence, docs). The block is rendered inline
// as the governance component; a light lookup carries no block and renders as plain markdown.
// Parsed at render time (not stored separately like artifacts) so the raw markup rides in the
// message text and degrades gracefully — a malformed/half-streamed block stays visible as text.
const CHECK_RE = /\[\[CHECK\]\]\s*([\s\S]*?)\s*\[\[\/CHECK\]\]/g;

// Split stored assistant content into ordered text/artifact/check parts for rendering.
export function splitAssistant(content: string): AssistantPart[] {
  const splitter = new RegExp("(" + NUL + "A:[^" + NUL + "]+" + NUL + ")");
  const matcher = new RegExp("^" + NUL + "A:([^" + NUL + "]+)" + NUL + "$");
  return content
    .split(splitter)
    .filter((p) => p !== "")
    .flatMap((p): AssistantPart[] => {
      const m = p.match(matcher);
      if (m) return [{ kind: "artifact", value: m[1] }];
      return splitChecks(p);
    })
    .filter((p) => p.kind !== "text" || p.value !== "");
}

// Split one text segment on [[CHECK]]...[[/CHECK]] into interleaved text/check parts. The check
// part's value is the raw block body (JSON string); the renderer parses + falls back to text on
// any parse failure, so an unclosed or malformed block never blanks the turn.
function splitChecks(segment: string): AssistantPart[] {
  const out: AssistantPart[] = [];
  let last = 0;
  CHECK_RE.lastIndex = 0;
  let mm: RegExpExecArray | null;
  while ((mm = CHECK_RE.exec(segment)) !== null) {
    if (mm.index > last) out.push({ kind: "text", value: segment.slice(last, mm.index) });
    out.push({ kind: "check", value: mm[1] });
    last = mm.index + mm[0].length;
  }
  // Suppress a dangling, still-unclosed [[CHECK]] opener (the block is mid-stream): render only the
  // text before it, so the component pops in when [[/CHECK]] arrives rather than flashing raw JSON.
  const tail = segment.slice(last);
  const open = tail.indexOf("[[CHECK]]");
  if (open >= 0) {
    if (open > 0) out.push({ kind: "text", value: tail.slice(0, open) });
  } else if (tail !== "") {
    out.push({ kind: "text", value: tail });
  }
  return out.length ? out : [{ kind: "text", value: segment }];
}
