// DottieSpiral / DottieMark — Dottie's brand mark. The SAME byte-verbatim Vault wedges as Theo's
// SpiralMark/SpiralAssemble (from vault-origin/public/icon.svg), but recoloured GOLD and, in the active
// "thinking" state, animated as Dottie's signature: the spiral DECONSTRUCTS outer→seed to the fixed centre
// dot (the "Dottie number"), which then slow-heartbeats, blooms hugely, and drifts back to a glowing dot —
// the exact inverse of Theo's constructing spiral. Governed against spec/DOTTIE_DESIGN_SYSTEM.md (gold on
// ink; monochrome-gold recolour of the shared geometry). Static markup, no user input; radius/glow of the
// dot are driven in JS (reliable SVG animation). Wedge paths are in the logo's own local coordinates.
import { useEffect, useRef } from "react";

// byte-verbatim wedges (local coords) — identical geometry to SpiralMark.tsx / SpiralAssemble.tsx
const WEDGES = `<path d="m91.2 94c.2 2.5.4 5 .6 7.4.5 6.2 1 12.5 1.5 18.7.7 8.2 1.3 16.4 2 24.6.5 6.1 1 12.2 1.5 18.3.3 4.3.7 8.6 1.1 12.8.1.7 0 .9-.8.8-7.9-1-15.8-2-23.8-3-.5-.1-.7-.2-.6-.7-.3-.5-.1-1 0-1.5.6-3.9 1.2-7.9 1.8-11.8 1.9-12.2 3.8-24.4 5.7-36.6 2.1-13.5 4.2-27.1 6.3-40.6.7-4.3 1.3-8.7 2.1-13 0-.2 0-.3 0-.5 0-.1 0-.3 0-.4.1-.1.2-.2.4-.1.3.2.4.4.4.7.2 2.8.4 5.5.7 8.3.2 2.9.5 5.8.7 8.7.2 2.2.4 4.4.5 6.6.1.5.2.9-.1 1.3z" fill="#991b1e"/><path d="m88.9 68.9c-.3 2-.6 4-.9 6-.4 2.9-.9 5.8-1.4 8.8-.3 2.1-.7 4.3-1 6.4-.4 2.6-.8 5.2-1.2 7.8-.4 2.8-.9 5.6-1.3 8.5-.4 2.6-.8 5.2-1.2 7.8-.5 3.1-1 6.2-1.5 9.3-.5 2.9-.9 5.8-1.4 8.8-.6 3.6-1.1 7.2-1.7 10.8s-1.1 7.1-1.6 10.7c-.4 2.5-.8 5.1-1.2 7.6-.4 2.9-.9 5.7-1.3 8.6-.2 1-.3 2-.5 3-7.7-3.1-15.4-6.1-23.2-9.2-.3-.1-.8-.1-.5-.7.1-1 .6-1.9 1-2.8 3.8-8.9 7.5-17.9 11.3-26.8 4.1-9.6 8.1-19.2 12.2-28.8 2.9-6.8 5.7-13.6 8.6-20.3 2.1-5 4.2-9.9 6.3-14.9.1-.2.1-.6.5-.6z" fill="#991b1e" opacity=".86"/><path d="m88.9 68.9c-.8 1.5-1.4 3.1-2 4.6-2.1 4.9-4.1 9.8-6.2 14.7-1.8 4.4-3.7 8.8-5.5 13.2-1.9 4.6-3.9 9.3-5.9 13.9-1.8 4.4-3.7 8.8-5.5 13.2-1.8 4.3-3.6 8.5-5.4 12.8-1.6 3.8-3.2 7.6-4.8 11.3-1.5 3.6-3 7.1-4.5 10.7 0-.4-.4-.5-.6-.7-6.5-4.7-13.1-9.5-19.7-14.2-.4-.3-.6-.5-.2-.9.3-.9 1-1.6 1.5-2.3 3.2-4.2 6.4-8.3 9.5-12.5 7.5-9.8 15-19.7 22.5-29.5 3.2-4.2 6.5-8.5 9.7-12.7 5.4-7.1 10.8-14.1 16.2-21.2.2-.2.3-.6.7-.5.1 0 .2 0 .2.1z" fill="#991b1e" opacity=".68"/><path d="m88.8 68.7c-1.8 2.2-3.5 4.6-5.3 6.8-3.6 4.7-7.2 9.3-10.7 14-2.8 3.6-5.5 7.2-8.2 10.8-3.6 4.7-7.2 9.3-10.7 14-2.6 3.4-5.2 6.9-7.8 10.3-3.6 4.8-7.3 9.5-10.9 14.3-2.1 2.8-4.3 5.6-6.4 8.4-1.6-2-3.2-4-4.8-6-3.6-4.5-7.3-8.9-10.9-13.4-.4-.5-.3-.7.1-1 .4-.7 1.1-1.1 1.8-1.6 9.3-7.1 18.5-14.3 27.8-21.5 6.7-5.1 13.3-10.3 20-15.5 8.5-6.6 17-13.1 25.5-19.7.1-.1.2-.1.2-.2.2-.1.3-.2.5-.2.1 0 .1.1.1.2-.2.2-.3.3-.3.3z" fill="#e55c44"/><path d="m88.4 68.6c-1.2 1.2-2.6 2.1-3.9 3.1-4.8 3.7-9.6 7.5-14.5 11.2-3.3 2.6-6.6 5.1-9.9 7.7-4.8 3.7-9.6 7.5-14.5 11.2-3.3 2.5-6.6 5.1-9.9 7.6-4.8 3.7-9.6 7.5-14.5 11.2-2.8 2.1-5.5 4.3-8.3 6.4-3.3-7.6-6.7-15.3-10-22.9-.2-.5-.2-.8.3-.9 1-.6 2.2-1 3.3-1.4 8-3.3 16-6.5 23.9-9.8 9.2-3.7 18.3-7.5 27.5-11.2 6.9-2.8 13.7-5.6 20.6-8.4 3-1.2 6.1-2.5 9.1-3.7.3-.2.6-.4.8-.1z" fill="#e78625"/><path d="m88.4 68.6c-1.4.4-2.7 1-4 1.5-5.7 2.3-11.3 4.6-16.9 6.9-8 3.3-16.1 6.6-24.1 9.8-5.7 2.3-11.4 4.6-17.1 7-6.6 2.7-13.2 5.4-19.8 8.1-1.1.4-2 1-3.2 1.2-1.1-8.2-2.2-16.4-3.3-24.6 0-.5 0-.8.6-.8 1-.5 2-.4 3-.5 5.7-.6 11.4-1.2 17.2-1.9 6.1-.7 12.3-1.3 18.4-2l13.8-1.5c5.6-.6 11.2-1.2 16.7-1.8 5.1-.5 10.2-1.1 15.3-1.7 1.2-.1 2.5-.4 3.8-.3.1 0 .1.1.1.2-.2.2-.3.3-.5.4z" fill="#f7921f"/><path d="M88.85 68.05L85 68.3L69.7 70L53 71.8L39.2 73.3L20.8 75.3L3.6 77.2L.6 77.7L0 78.5L5.1 52.4L6 52.5L17.8 54.7L34.8 57.9L48.8 60.6L62.2 63.1L70.6 64.7L84 67.2L88.9 68.1Z" fill="#f89a35"/><path d="m88.9 68.1c-1.7-.1-3.3-.6-4.9-.9-4.5-.8-8.9-1.6-13.4-2.5-2.8-.5-5.6-1.1-8.4-1.6-4.5-.8-8.9-1.7-13.4-2.5-4.7-.9-9.4-1.8-14-2.7-5.7-1.1-11.3-2.1-17-3.2-3.9-.7-7.9-1.5-11.8-2.2-.3-.1-.6.1-.9-.1.3-.1.4-.4.5-.6 3.6-7.2 7.3-14.4 10.9-21.7.2-.4.4-.8.9-.3.8.1 1.4.5 2.1.9 3.7 2 7.5 4 11.2 6 4.9 2.6 9.9 5.3 14.8 7.9 3.3 1.8 6.6 3.5 9.9 5.3 4.2 2.3 8.4 4.5 12.6 6.8 3.2 1.7 6.5 3.5 9.8 5.2 3.6 1.9 7.3 3.9 10.9 5.8.1 0 .1.1.2.1 0 .1.1.2 0 .3z" fill="#fcba62"/><path d="m88.8 67.9c-1.8-.9-3.5-1.8-5.3-2.7-1.6-.9-3.2-1.8-4.8-2.6-5-2.7-10.1-5.4-15.1-8-4.6-2.5-9.2-4.9-13.9-7.4-5.2-2.8-10.5-5.6-15.7-8.4-4.6-2.5-9.2-4.9-13.9-7.4-.9-.5-1.8-1-2.7-1.5 3.7-3.7 7.4-7.4 11.1-11.1 2.2-2.2 4.3-4.3 6.5-6.5.5-.5.9-.7 1.3-.1.2.1.4.3.6.5 3.2 3.3 6.3 6.7 9.5 10 2.5 2.6 4.9 5.3 7.4 7.9 2.7 2.8 5.4 5.7 8.1 8.6 2.5 2.6 5 5.3 7.5 7.9 2.7 2.8 5.3 5.7 8 8.5 2.6 2.8 5.2 5.5 7.8 8.3.9 1 1.9 1.9 2.8 2.9.4.3.8.6.8 1.1z" fill="#ffcd05"/><path d="m88.8 67.9c-1-1.4-2.4-2.6-3.6-3.9-2.3-2.5-4.7-5-7.1-7.5-3.5-3.7-6.9-7.4-10.4-11-2.6-2.8-5.2-5.5-7.8-8.3-2.7-2.8-5.3-5.7-8-8.5-2.5-2.6-5-5.3-7.5-7.9-2.6-2.7-5.2-5.5-7.7-8.2-.1-.1-.2-.3-.3-.5 6.7-3.1 13.4-6.2 20.1-9.4.8-.4 1.6-.7 2.4-1.1.5-.3.8-.2.9.3.2.2.4.4.5.6 2.2 5 4.4 10 6.6 15 1.8 4.1 3.7 8.2 5.5 12.4 1.9 4.2 3.8 8.5 5.6 12.7 2.3 5.3 4.6 10.6 7 15.8 1.3 2.9 2.5 5.8 3.9 8.7.1.3.3.5 0 .8z" fill="#f9d232"/><path d="m88.9 67.9c-.1-.9-.6-1.6-1-2.4-2.2-5-4.4-9.9-6.5-14.9-1.7-3.9-3.5-7.9-5.3-11.8-1.9-4.3-3.8-8.6-5.6-12.9-1.8-4-3.5-7.9-5.3-11.9-1.8-4.1-3.6-8.1-5.4-12.2 8.2-.5 16.4-1.1 24.6-1.8.6 0 1 0 1.2.6.1.4.2.8.2 1.2 0 3.5.4 7 .5 10.5.2 3.9.4 7.8.6 11.8.2 3.9.4 7.9.6 11.8.2 4 .4 7.9.6 11.9.2 3.8.4 7.7.6 11.5.2 2.4.2 4.7.4 7.1 0 .6.2 1.2-.2 1.7h-.1c.1-.1.1-.1.1-.2z" fill="#f4d451"/><path d="m89.1 68.1c-.1-2.8-.2-5.6-.4-8.4-.1-.9-.1-1.9-.1-2.8-.2-1.6-.1-3.3-.2-4.9-.2-3.1-.4-6.2-.5-9.4-.1-1.8-.2-3.6-.3-5.3-.3-3.2-.3-6.5-.6-9.7-.1-1.1-.1-2.1-.1-3.2-.1-1.3-.2-2.7-.2-4-.1-3.3-.4-6.6-.5-9.9-.1-1.8-.2-3.7-.3-5.5-.1-1.3.1-2.6-.2-3.9 0-.1 0-.3.2-.3 3 1 6.1 1.9 9.1 2.9 4.7 1.5 9.5 3 14.2 4.5.6.2.9.4.7 1-.2 1-.7 2-1 3-1.8 5.3-3.6 10.6-5.5 15.9-3.7 9.9-7.1 20-10.6 30-1.1 3.2-2.2 6.5-3.4 9.7 0 .1-.1.2-.1.2-.1.1-.1.1-.2.1z" fill="#fce16e"/><path d="m89.2 67.9c.3-1.4.9-2.8 1.4-4.2 1-3 2-5.9 3.1-8.9 1.5-4.4 3.1-8.9 4.6-13.3.9-2.7 1.9-5.5 2.8-8.2 2.5-7.2 4.9-14.4 7.5-21.5.3-.9.5-1.9 1.1-2.8 2.9 2.5 5.7 4.9 8.6 7.4 3.3 2.9 6.6 5.7 9.9 8.6.6.5.9.8.2 1.4-.1.3-.3.5-.5.7-2.8 2.9-5.6 5.9-8.4 8.9-3.4 3.6-6.8 7.2-10.2 10.9-2.4 2.6-4.8 5.1-7.2 7.7-2.7 2.9-5.5 5.8-8.2 8.8-1.3 1.4-2.6 2.8-3.9 4.1-.3.2-.4.5-.8.4z" fill="#f7e38d"/><path d="m89.2 67.9c1.7-1.5 3.1-3.2 4.7-4.8.9-1 1.9-2 2.8-3 2.2-2.5 4.6-4.8 6.8-7.2 2.4-2.6 4.9-5.2 7.3-7.8 1.7-1.8 3.3-3.6 5-5.3 2.6-2.8 5.2-5.5 7.8-8.3 1.6-1.7 3.1-3.5 4.8-5.1 2.7 6.7 5.3 13.4 8 20.1.4 1 .8 2.1 1.2 3.1.2.5.1.7-.4.8-.3.3-.6.5-1 .6-5.6 2-11.2 4.1-16.8 6.2-7.1 2.6-14.2 5.2-21.3 7.9-2.6 1-5.2 1.9-7.9 2.9-.3.1-.7.4-1 .1z" fill="#f8e7a2"/><path d="m89.2 68.1c2.7-1 5.4-1.9 8.1-2.9 4.1-1.5 8.2-3 12.3-4.6 5.1-1.9 10.2-3.8 15.4-5.7 3.7-1.4 7.4-2.7 11.1-4.1.4-.1.7-.3 1.1-.4-.5 3.6-1 7.2-1.4 10.8-.6 4.6-1.2 9.3-1.8 13.9-.1.9-.5.7-1.1.6-.4.2-.7.1-1.1.1-6.5-1.1-12.9-2.2-19.4-3.3-6-1-11.9-2-17.9-3.1-1.8-.3-3.5-.5-5.3-1-.1 0-.2-.1-.2-.2v-.1z" fill="#7a3b2e"/><path d="m89.2 68.3c1.7.3 3.4.6 5 .8l10.8 1.8c3.2.6 6.4 1.1 9.7 1.7 3.9.7 7.8 1.3 11.7 2 2.2.4 4.4.8 6.6 1.1-5.7 6.1-11.4 12.2-17 18.3-.4.5-.8.7-1.2.1-.1-.1-.2-.1-.3-.2-.3-.2-.5-.4-.7-.6-2.6-2.6-5.2-5.1-7.6-7.7-5.3-5.6-10.9-11-16.4-16.5-.3-.2-.6-.4-.6-.8z" fill="#9c4f38"/><path d="m89.2 68.3c3.3 3.4 6.7 6.7 10 10.1 5 5 10 10.1 15 15.1.1.1.2.3.4.4-.3.2-.6.1-.9.1-7.1 0-14.3 0-21.4 0-.3 0-.6-.1-.8.1-.1 0-.1 0-.2 0-.2-2.2-.4-4.3-.6-6.5-.4-4.4-.7-8.8-1.1-13.2-.1-1.6-.2-3.2-.4-4.9 0-.3.1-.7-.3-.9 0-.1 0-.1 0-.2v-.1h.2c0-.1.1 0 .1 0z" fill="#c06a44"/><path d="m91.4 94.1c.3-.3.6-.2 1-.2h22.2l.2.2c-3.1 0-6.3 0-9.4 0-4.7 0-9.3 0-14 0z" fill="#7a3b2e"/>`;

const O = { x: 88.94, y: 68.06 };
const U = 108.84 / Math.sqrt(17);
const TH17 = (85.7 * Math.PI) / 180;
const DOT_R = 4.42; // +30% of the original 3.4

function tailPoints(n: number): Record<number, { x: number; y: number }> {
  const P: Record<number, { x: number; y: number }> = {};
  let th = TH17;
  for (let k = 17; k <= n; k += 1) {
    const r = U * Math.sqrt(k);
    P[k] = { x: O.x + r * Math.cos(th), y: O.y + r * Math.sin(th) };
    th -= Math.atan(1 / Math.sqrt(k));
  }
  return P;
}
function bounds(n: number): [number, number, number, number] {
  const P = tailPoints(n);
  const xs = [0, 135];
  const ys = [-2, 196];
  Object.values(P).forEach((p) => { xs.push(p.x); ys.push(p.y); });
  xs.push(O.x); ys.push(O.y);
  const pad = 8;
  return [Math.min(...xs) - pad, Math.min(...ys) - pad, (Math.max(...xs) - Math.min(...xs)) + 2 * pad, (Math.max(...ys) - Math.min(...ys)) + 2 * pad];
}
const VB = bounds(17).join(" "); // logo-only frame

// monochrome-gold ramp — richly gold throughout (no muddy olive end, no near-white core), so the mark
// reads gold on both the dark console and the current cream surface
const GOLD = ["#a06d16", "#bd8a2a", "#cc9b3e", "#d7ab54", "#e2bb6b", "#edcb82"];
function goldAt(j: number): string {
  const x = Math.max(0, Math.min(1, j)) * (GOLD.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  const a = (GOLD[i].match(/\w\w/g) as string[]).map((h) => parseInt(h, 16));
  const b = (GOLD[Math.min(i + 1, GOLD.length - 1)].match(/\w\w/g) as string[]).map((h) => parseInt(h, 16));
  return `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * f)).join(",")})`;
}

const PATHS = WEDGES.match(/<path[^>]*\/>/g) ?? [];
const NW = PATHS.length; // 18
// gold recolour keyed by reveal order (o=0 = seed/core, brightest); dissolve order = seed→out
const GOLD_WEDGES = PATHS.map((p, i) => {
  const d = (p.match(/\sd="([^"]*)"/) || [])[1] || "";
  const o = (NW - 1) - i;
  const j = o / (NW - 1);
  return { d, o, fill: goldAt(1 - j * 0.82), op: (1 - 0.14 * j).toFixed(3) };
});
const STATIC_MARKUP = GOLD_WEDGES.map((w) => `<path d="${w.d}" fill="${w.fill}" opacity="${w.op}"/>`).join("");
const ANIM_MARKUP = GOLD_WEDGES.map((w) => `<path class="w" data-o="${w.o}" d="${w.d}" fill="${w.fill}" opacity="${w.op}"/>`).join("");

// Static identity mark (replaces VaultMark). Gold spiral with a fixed glowing centre dot.
export function DottieMark({ size = 40 }: { size?: number; variant?: "static" | "building" }) {
  const dot = `<circle cx="${O.x}" cy="${O.y}" r="${DOT_R}" fill="#EBC97D" style="filter:drop-shadow(0 0 ${(size * 0.03).toFixed(1)}px rgba(235,201,125,.7))"/>`;
  const svg = `<svg width="${size}" height="${size}" viewBox="${VB}" preserveAspectRatio="xMidYMid meet">${STATIC_MARKUP}${dot}</svg>`;
  return <span aria-hidden style={{ display: "inline-block", width: size, height: size, lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

// Active "thinking" mark (replaces SpiralAssemble). Deconstruct outer→seed → dot heartbeat + huge slow
// bloom + drift back to a glowing dot → rebuild → loop. Reduced-motion holds the finished gold mark.
export function DottieSpiral({ size = 22 }: { size?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const ws = Array.from(host.querySelectorAll<SVGElement>(".w")).sort(
      (a, b) => Number(a.getAttribute("data-o")) - Number(b.getAttribute("data-o")),
    ); // seed→out
    const dotEl = host.querySelector<SVGCircleElement>(".dot");
    if (ws.length === 0) return;
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { ws.forEach((w) => { w.style.opacity = "1"; }); return; }
    const n = ws.length;
    const STEP = 150;
    const BLOOM_MS = 12000;
    const PAUSE = 500;
    ws.forEach((w) => { w.style.transition = "opacity 0.24s ease-out"; });
    const base = ws.map((w) => Number(w.getAttribute("opacity") || "1"));
    const KF: [number, number][] = [[0, 1], [0.1, 1.55], [0.2, 1], [0.3, 1.55], [0.4, 1], [0.7, 5.6], [1, 1]];
    const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const scaleAt = (f: number) => {
      for (let i = 1; i < KF.length; i += 1) {
        if (f <= KF[i][0]) { const a = KF[i - 1]; const b = KF[i]; return a[1] + (b[1] - a[1]) * ease((f - a[0]) / (b[0] - a[0])); }
      }
      return 1;
    };
    let timers: number[] = [];
    let raf = 0;
    const startBloom = () => {
      if (!dotEl) return;
      const t0 = performance.now();
      const tick = (now: number) => {
        const f = Math.min(1, (now - t0) / BLOOM_MS);
        const s = scaleAt(f);
        dotEl.setAttribute("r", (DOT_R * s).toFixed(2));
        const gp = 1 + 0.3 * Math.sin(now / 520);
        const blur = (3 + (s - 1) * 3.4) * gp;
        dotEl.style.filter = `drop-shadow(0 0 ${blur.toFixed(1)}px rgba(235,201,125,${Math.min(0.95, 0.4 + (s - 1) * 0.11).toFixed(2)}))`;
        if (f < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const run = () => {
      timers.forEach((t) => window.clearTimeout(t));
      timers = [];
      if (raf) cancelAnimationFrame(raf);
      if (dotEl) { dotEl.setAttribute("r", String(DOT_R)); dotEl.style.filter = ""; }
      // deconstruct outer→seed
      ws.forEach((w, i) => { const back = n - 1 - i; timers.push(window.setTimeout(() => { w.style.opacity = "0"; }, back * STEP)); });
      const gone = n * STEP;
      timers.push(window.setTimeout(startBloom, gone)); // dot sequence starts as the spiral reaches it
      const rb = gone + BLOOM_MS; // rebuild after the full dot sequence
      ws.forEach((w, i) => { timers.push(window.setTimeout(() => { w.style.opacity = String(base[i]); }, rb + i * STEP)); });
      timers.push(window.setTimeout(run, rb + n * STEP + PAUSE));
    };
    run();
    return () => { timers.forEach((t) => window.clearTimeout(t)); if (raf) cancelAnimationFrame(raf); };
  }, []);
  const dot = `<circle class="dot" cx="${O.x}" cy="${O.y}" r="${DOT_R}" fill="#EBC97D"/>`;
  const svg = `<svg width="${size}" height="${size}" viewBox="${VB}" preserveAspectRatio="xMidYMid meet">${ANIM_MARKUP}${dot}</svg>`;
  return (
    <span
      ref={ref}
      role="status"
      aria-label="Thinking"
      style={{ display: "inline-block", width: size, height: size, lineHeight: 0 }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
