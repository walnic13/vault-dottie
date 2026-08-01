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
  kind: "text" | "artifact";
  value: string; // text content, or artifact id when kind === "artifact"
}

// Split stored assistant content into ordered text/artifact parts for rendering.
export function splitAssistant(content: string): AssistantPart[] {
  const splitter = new RegExp("(" + NUL + "A:[^" + NUL + "]+" + NUL + ")");
  const matcher = new RegExp("^" + NUL + "A:([^" + NUL + "]+)" + NUL + "$");
  return content
    .split(splitter)
    .filter((p) => p !== "")
    .map((p) => {
      const m = p.match(matcher);
      return m ? { kind: "artifact" as const, value: m[1] } : { kind: "text" as const, value: p };
    });
}
