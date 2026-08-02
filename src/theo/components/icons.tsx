// Icons — ported verbatim from VA-T1 (theo-frontend-reference.jsx L39–57). The Burst mark
// (VA-T1 L39–57) is retired: Theo's identity is now the Vault logo (VaultMark / SpiralAssemble).

const SV = {
  viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round",
} as const;

export const IcCompose = ({ s = 18 }: { s?: number }) => (<svg {...SV} width={s} height={s}><path d="M12 20h9" /><path d="M16.4 3.6a2 2 0 0 1 2.8 2.8L7.6 18 3 19.5 4.5 15z" /></svg>);
export const IcChat = ({ s = 18 }: { s?: number }) => (<svg {...SV} width={s} height={s}><path d="M21 11.5a8.5 8.5 0 0 1-11.8 7.8L3 21l1.7-6.2A8.5 8.5 0 1 1 21 11.5Z" /></svg>);
export const IcProjects = ({ s = 18 }: { s?: number }) => (<svg {...SV} width={s} height={s}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /></svg>);
export const IcArtifacts = ({ s = 18 }: { s?: number }) => (<svg {...SV} width={s} height={s}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18" /></svg>);
// SPW 2c-iii-fe (VA-T12 B): the "Publish to project" / "Unpublish" menu glyph — an up-arrow out of a tray.
export const IcShare = ({ s = 18 }: { s?: number }) => (<svg {...SV} width={s} height={s}><path d="M12 15V3" /><path d="M8 7l4-4 4 4" /><path d="M4 13v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" /></svg>);
export const IcStar = ({ s = 18, filled = false }: { s?: number; filled?: boolean }) => (<svg {...SV} width={s} height={s} fill={filled ? "currentColor" : "none"}><path d="M12 3.6l2.6 5.3 5.8.9-4.2 4.1 1 5.8L12 17.9l-5.2 2.8 1-5.8L3.6 9.8l5.8-.9z" /></svg>);
export const IcChevron = ({ s = 18 }: { s?: number }) => (<svg {...SV} width={s} height={s}><path d="M6 9l6 6 6-6" /></svg>);
export const IcMore = ({ s = 18 }: { s?: number }) => (<svg {...SV} width={s} height={s} fill="currentColor" stroke="none"><circle cx="12" cy="5" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="12" cy="19" r="1.7" /></svg>);
export const IcCustomize = ({ s = 18 }: { s?: number }) => (<svg {...SV} width={s} height={s}><path d="M4 6h7" /><path d="M16 6h4" /><circle cx="13.5" cy="6" r="2" /><path d="M4 12h4" /><path d="M13 12h7" /><circle cx="10.5" cy="12" r="2" /><path d="M4 18h7" /><path d="M16 18h4" /><circle cx="13.5" cy="18" r="2" /></svg>);
export const IcSearch = ({ s = 16 }: { s?: number }) => (<svg {...SV} width={s} height={s}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>);
export const IcPanel = ({ s = 18 }: { s?: number }) => (<svg {...SV} width={s} height={s}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /></svg>);
export const IcDoc = ({ s = 18 }: { s?: number }) => (<svg {...SV} width={s} height={s}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></svg>);
export const IcBack = ({ s = 18 }: { s?: number }) => (<svg {...SV} width={s} height={s}><path d="m15 18-6-6 6-6" /></svg>);
export const IcClose = ({ s = 18 }: { s?: number }) => (<svg {...SV} width={s} height={s}><path d="M18 6 6 18M6 6l12 12" /></svg>);
export const IcTrash = ({ s = 16 }: { s?: number }) => (<svg {...SV} width={s} height={s}><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>);
// Voice controls (VA-T8): dictation mic + read-aloud speaker, in the SV idiom.
export const IcMic = ({ s = 18 }: { s?: number }) => (<svg {...SV} width={s} height={s}><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0" /><path d="M12 19v3" /></svg>);
export const IcSpeaker = ({ s = 16 }: { s?: number }) => (<svg {...SV} width={s} height={s}><path d="M11 5 6 9H3v6h3l5 4z" /><path d="M16 9a4 4 0 0 1 0 6" /><path d="M19 6.5a8 8 0 0 1 0 11" /></svg>);
