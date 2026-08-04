// VA-T1 palette + font stacks, preserved verbatim from the reference surface
// (theo-frontend-reference.jsx). Inline-style approach kept per 1A handover §0.1/§6.
// Dottie governance-console palette — realises the binding DOTTIE_DESIGN_SYSTEM §2 (dark ink + gold accent +
// monospace provenance; committed single theme, P1/P2). The token KEYS are kept (VA-T1 inline-style idiom —
// components reference `C.*`, never raw hex), so recolouring the values here flips the whole surface to
// Dottie's dark identity centrally. `coral*` is retained as the ACCENT key name but now carries GOLD values
// (§2.3): coral=gold, coralDk=gold-hi (hover brightens on dark), coralSoft/coralTint=gold-dim wash.
export const C = {
  bg: "#0C0F14", sidebar: "#0A0D12", bubble: "#1A2029", card: "#141922", panel2: "#1A2029", inset: "#10151C",
  ink: "#E7ECF3", ink2: "#96A0AE", ink3: "#68717F",
  line: "#252E3B", line2: "#1D2530",
  coral: "#D7B15C", coralDk: "#EBC97D", coralSoft: "rgba(215,177,92,.14)", coralTint: "rgba(215,177,92,.14)",
  // Semantic verdict tokens (DOTTIE_DESIGN_SYSTEM §2.4) — MEANING colours, never swapped for the gold accent.
  // Used by the governance component (badges, conclusion callout, confidence, flags). Bg tints for callouts.
  concur: "#5FBE90", caution: "#E4AC4E", challenge: "#E0776C", info: "#6EA8FE",
  concurBg: "rgba(95,190,144,.12)", cautionBg: "rgba(228,172,78,.13)", challengeBg: "rgba(224,119,108,.13)", infoBg: "rgba(110,168,254,.10)",
} as const;

export const SANS = '"Inter",ui-sans-serif,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif';
export const SERIF = 'ui-serif,Georgia,"Times New Roman",serif';
export const MONO = 'ui-monospace,"SF Mono","Cascadia Code","Consolas",monospace';
