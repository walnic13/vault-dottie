# Dottie FE Gate/Hide — Pass-1 Frontend VEP (hide Projects + gate every unbacked control)

Makes the transplanted Dottie FE **honest**: because the FE is a byte-verbatim transplant of Theo's FE, every Theo control is present and calls its endpoint — but Dottie's backend only serves core chat + conversation-management (rename/delete/star), so the controls whose `dottie_*` backend does not exist yet **error the moment they're used** (the exact "delete errored / features that error when clicked" class Walter flagged). This package introduces **one declarative capability object** (`DOTTIE_CAPABILITIES` in `swapBlock.ts` — the existing single-point-of-truth for Dottie divergence) and consumes it at the minimal set of sites so each unbacked control is **hidden/short-circuited** until its backend lands. Scope (authoritative gap register `spec/DOTTIE_THEO_RECONCILIATION.md`): **Projects** hidden indefinitely (Walter 2026-08-01), **People / attachments / artifacts-persistence / voice** hidden until their `dottie_*` backend ships — then each un-gates via a **one-line flip in the SAME governed package that ships that backend** (no throwaway work). The VA-T1 chat surface is unchanged: no layout/palette/interaction redesign, and the local in-reply `[[ARTIFACT]]` render (text-parsed) is deliberately preserved.

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Pass 1 — Frontend Verified Evidence Pack
Grounding parent (source baseline): `953088d43ce8bbedbba7778c88ce1a745a94897f` (vault-dottie, `development`)
Grounding mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD) |
| - | ------------------------------- | ------------------------------ | --------------------------------- |
| 1 | Claude Code Theo Frontend Governor Standard — `governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md` (§2 gates; §3 VEP+CCT; §4 UI reconciliation; §5 gap disclosure) | `Grep("Component Contract Table")` this turn | `3afec7ea4b13650ce2bf28bf32073179a35e7b24` |
| 2 | Theo Frontend Grounding Conformance Standard — `governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR; §4A.1 F-P walk; §4B Visual Authority Registry; §5 Rule Anchor) | `Grep("Grounding Conformance Receipt")` this turn | `4f2f42e799be5db31e1e35e523d656ff4c1c057e` |
| 3 | Codex Theo Frontend Review Standard — `governance/CODEX_THEO_FRONTEND_REVIEW_STANDARD.md` (Pass-2 review surface) | cited; unchanged blob @ HEAD | `25cc488091d619d8f6642b10552df0d019a87933` |
| 4 | Theo Golden Component Pack Standard — `governance/THEO_GOLDEN_COMPONENT_PACK_STANDARD.md` (canonical primary reference; structural mirror; visual parity) | `Grep("canonical")` this turn | `0035a1d9fed103d07bf420b957c3727ec47fcc6b` |
| 5 | Theo Phase 1A Frontend Plan — `governance/THEO_PHASE_1A_FRONTEND_PLAN.md` (surface + feature basis for the transplanted FE) | cited; unchanged basis @ HEAD | `901271478e8bec29177d379fadbbf3d4701a90fe` |
| 6 | Dottie ↔ Theo Reconciliation — `spec/DOTTIE_THEO_RECONCILIATION.md` (authoritative gap register; §A live, §B–§G the gated/hidden surfaces) | `Read` this turn | `34f415cfe7c5d8f4cb5f8329fab68b1732a14831` |
| 7 | **VISUAL AUTHORITY (VA-T1) — the deployed Theo FE** = `vault-theo/src/theo/*` (the reference surface Dottie transplants verbatim; the gated controls are VA-T1 originals whose visibility is now capability-conditioned) | `Read`(data.ts, swapBlock.ts, gateway.live.ts §predicates+lists, ConvMenu.tsx, ChatView.tsx §composer, useTheoState.ts §loaders) this turn | `c03088ae7ae5337e03e971211f11505909140c3e` — `TheoSurface.tsx` blob SHA, **byte-identical in `vault-theo` (`HEAD:src/theo/TheoSurface.tsx`) and `vault-dottie` (`HEAD:src/theo/TheoSurface.tsx`)**: git-verifiable proof of the byte-verbatim transplant (identical content → identical blob SHA). The gated components carry the same VA-T1 identity; the Dottie delta is enumerated in §CCT |

No ChatGPT advisory cited. No `reporting_*` change. This is a frontend package (no migration; no write SQL).

## Rule Anchor Table

| Source doc (repo-relative path) | Clause id | Verbatim clause text | Applied in output at |
| ------------------------------- | --------- | -------------------- | -------------------- |
| governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt (GCR) and a Rule Anchor Table" | GCR + this table |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §3 | "MUST contain a **Component Contract Table**" | §CCT |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §4 | "reproduce it faithfully, do not redesign" | §UI-RECON — gating unbacked controls is feature availability, NOT a visual redesign; the chat surface is untouched |
| governance/THEO_FRONTEND_GROUNDING_CONFORMANCE_STANDARD.md | §4A.1 | "Pass 1 Plan-Authoring Sub-Phases" | §F-P walk |
| governance/CLAUDE_CODE_THEO_FRONTEND_GOVERNOR_STANDARD.md | §5 | "foreseeable downstream gaps" | §GAP |
| governance/THEO_GOLDEN_COMPONENT_PACK_STANDARD.md | §canonical | "Structural Mirror" | §CCT — each gated component cites its Theo original; only the gate condition is added |

---

## §F-P walk (F-P1 – F-P7)

**F-P1 Feature identification.** The "feature" is honest capability-gating of the Dottie FE: hide/short-circuit every transplanted control whose `dottie_*` backend is not live, so nothing errors when clicked. Per-surface status: the CHAT surface (core chat + rename/delete/star) is LIVE and untouched; the gated surfaces (Projects nav + secondary project controls, Artifacts nav + persistence, paperclip/attachments, mic + read-aloud voice, people roster) are transplanted-but-unbacked and now conditioned on `DOTTIE_CAPABILITIES`.

**F-P2 UI authority reconciliation.** See §UI-RECON. The reference surface (VA-T1) is unchanged in layout/palette/interaction; the ONLY delta is that five feature areas are conditionally hidden. This is an AUTHORIZED-DELTA (feature availability gating, expressly directed by Walter 2026-08-01 "gate/hide until the backend lands, so nothing errors" and grounded in the reconciliation §B–§G), NOT a `VISUAL-AUTHORITY-DEVIATION` — no component is redesigned; hidden controls reappear byte-identical when their capability flips true.

**F-P3 Backend/contract grounding.** No new backend contract. This package REMOVES premature calls to endpoints Dottie does not serve: `theo_list_projects` (projectsBase), `theo_list_people`, `theo_list_artifacts` / `theo_upsert_artifact` (apiBase) — each short-circuited in `gateway.live.ts` to a benign empty/no-op (the same `[]`-return pattern already approved for `listProjectConversations`), and the `attachmentsAvailable()` / `voiceAvailable()` predicates now return `false` (they were `isLive()` = `true` in the Origin mount, which is why the paperclip + mic showed and would error). The live gateway's 7 served `dottie_*` routes are unaffected.

**F-P4 Component reference grounding.** Canonical Primary Reference for every touched file = its Theo original in `vault-theo/src/theo/*` (Golden Component Pack §canonical). Each delta is additive-guard-only (a `DOTTIE_CAPABILITIES.*` check) over the byte-verbatim transplant; §CCT enumerates the exact guard per file.

**F-P5 Component Contract Table assembly.** See §CCT — one row per DELTA file (`swapBlock.ts`, `data.ts`, `gateway.live.ts`, `ConvMenu.tsx`). Unchanged components inherit Theo's contracts verbatim (no CCT row needed).

**F-P6 Repository & active-surface grounding.** Target files are on the active surface (`vault-dottie/src/theo/**`). No deprecated-code contamination; the gate is a single declarative object consumed at ~4 sites, not scattered `import.meta.env` checks. `tsc -p tsconfig.app.json` clean; `npm run build` clean (bundle shrank — gated dead paths tree-shaken).

**F-P7 VEP assembly.** GCR + Rule Anchor Table open the pack; F-P1–F-P7 walked; CCT (§CCT); UI reconciliation (§UI-RECON); Gap Disclosure (§GAP); the delta files inlined (§DELTA); Codex activation note closes it.

---

## §UI-RECON — UI Authority Reconciliation

VA-T1 is Theo's deployed FE. This package makes **no visual redesign**: no component's markup, layout, palette, spacing, or interaction is altered. The delta is purely **feature availability** — five transplanted surfaces are hidden because their Dottie backend is not live:

| Surface | VA-T1 control (file:anchor) | Gate applied | Classification |
| ------- | --------------------------- | ------------ | -------------- |
| Projects (nav + view) | `data.ts` NAV `projects`; `TheoMain.tsx` `view==="projects"` branch | NAV entry filtered out (view branch unreachable) | AUTHORIZED-DELTA (hidden indefinitely, Walter) |
| Projects (secondary) | `ConvMenu.tsx` "Add to project" item; publish item | "Add to project" hidden on `!projects`; publish already dark (`canPublish` needs a project) | AUTHORIZED-DELTA |
| Artifacts persistence | `data.ts` NAV `artifacts`; gallery loaders | NAV entry filtered out; `listServerArtifacts`/`persistArtifact` short-circuit | AUTHORIZED-DELTA (in-reply `[[ARTIFACT]]` render PRESERVED — local, text-parsed) |
| Attachments | `ChatView.tsx` paperclip/paste/drag-drop (all honor `attachmentsAvailable`) | predicate → `false` | AUTHORIZED-DELTA |
| Voice | `ChatView.tsx` mic + read-aloud (honor `voiceAvailable`) | predicate → `false` | AUTHORIZED-DELTA |
| People | `useTheoState.ts` greeting/bylines (already degrade to empty) | `listPeople` → `[]` (no 404); greeting falls back to time-of-day | AUTHORIZED-DELTA |

No `VISUAL-AUTHORITY-DEVIATION` is claimed. Each gate is a single boolean check; flipping the capability true restores the VA-T1 control byte-identically.

---

## §CCT — Component Contract Table (the Dottie gate/hide delta)

| Component (file) | Prop / input interface (TS) | Visual authority (VA-id) | Data / contract dependency |
| ---------------- | --------------------------- | ------------------------ | -------------------------- |
| `src/theo/swapBlock.ts` (NEW export) | Adds `export const DOTTIE_CAPABILITIES = { projects:false, people:false, attachments:false, artifactsPersistence:false, voice:false } as const;` — all other exports (`ASSISTANT_NAME`, `MODEL`, `BASE_PROMPT`, `ARTIFACT_RULES`, …) unchanged. | VA-T1 (config; no visual surface) | Single source of truth; consumed by `data.ts`, `gateway.live.ts`, `ConvMenu.tsx`. Each flag mirrors a reconciliation section (§B/§C/§D/§F/§G). |
| `src/theo/data.ts` (NAV filter) | `NAV: NavItem[]` now = `ALL_NAV.filter(...)` dropping `projects` unless `DOTTIE_CAPABILITIES.projects` and `artifacts` unless `DOTTIE_CAPABILITIES.artifactsPersistence`. `ALL_NAV` holds the verbatim VA-T1 four entries (`chats`/`projects`/`artifacts`/`customize`); every other export (`STYLES`, `RECENTS`, `STARTERS`, `REVIEW_STARTERS`, `REVIEW_APP_STARTERS`, `INIT_PROJECTS`) unchanged. | VA-T1 (nav list; `chats`+`customize` always shown) | `DOTTIE_CAPABILITIES`; consumed by `Sidebar.tsx` (renders every `NAV` item) + `TheoMain.tsx` view branches (hidden branch becomes unreachable) |
| `src/theo/services/gateway.live.ts` (capability short-circuits) | Signatures UNCHANGED. Guards added: `attachmentsAvailable()` → `DOTTIE_CAPABILITIES.attachments && isLive()`; `voiceAvailable()` → `DOTTIE_CAPABILITIES.voice && isLive()`; `listProjects()` returns `[]` when `!projects`; `listPeople()` returns `[]` when `!people`; `listServerArtifacts()` returns `[]` when `!artifactsPersistence`; `persistArtifact()` returns `{ id:"", currentVersion:1 }` (no-op) when `!artifactsPersistence`. `getServerArtifact` left as-is (only reachable via the now-hidden gallery). Imports `DOTTIE_CAPABILITIES` from `../swapBlock`. | VA-T1 (no visual surface) | `DOTTIE_CAPABILITIES`; same `[]`-return idiom already approved for `listProjectConversations`. Callers (`useTheoState` loaders on mount; the best-effort post-send `persistArtifact` loop, whose return is ignored + `.catch`-wrapped) are UNCHANGED — no VA-T1 component edited. |
| `src/theo/components/ConvMenu.tsx` (menu-item gate) | `ConvMenuItems({...})` prop interface UNCHANGED. The "Add to project" `<button>` is now wrapped `{DOTTIE_CAPABILITIES.projects && (…)}`; Star / Rename / Delete / publish items unchanged (publish already gated on `onTogglePublish && canPublish`). Imports `DOTTIE_CAPABILITIES` from `../swapBlock`. | VA-T1 (shared conv menu, header + row) | `DOTTIE_CAPABILITIES`; the item's `onAddToProject` → `theo_set_conversation_project` (unbacked) is now unreachable |

---

## §GAP — Gap Disclosure

`PROCEED` (gate is deployable + coherent; the chat surface is untouched and the gated calls are provably removed). Follow-on packages disclosed:
- **G-1 (un-gate on backend landing): PRE-LAND (per-package).** Each subsequent backend package (dottie_list_people; attachments; artifacts-persistence; voice) flips its `DOTTIE_CAPABILITIES.*` flag `true` in the SAME package that ships + golden-curls that backend — a one-line change bundled with the FE repoint, not a separate FE round. Projects stays `false` indefinitely (Walter). Disclosed.
- **G-2 (Projects permanence): PROCEED.** Projects/SPW are hidden with no committed re-enable date; if Walter later scopes a Dottie Projects backend it becomes its own program. The gate is reversible (`projects:true`) but the backend + `theo_*`→`dottie_*` repoint would be required first. Disclosed.
- **G-3 (people greeting degradation): PROCEED (acceptable).** With `people:[]` the greeting falls back to time-of-day and chat bylines stay single-author — VA-T1-faithful, no error. The first-name greeting returns when `dottie_list_people` lands. Disclosed.
- **G-4 (citation fidelity / Dottie logo / VO mount): PROCEED (own packages).** Unchanged by this package; tracked separately (reconciliation §H + FE Foundation §GAP G-2/G-4/G-5).

---

## §DELTA — the changed files (implementation evidence)

Four files, all on `development` @ the grounding parent's child commit. Each delta is an additive `DOTTIE_CAPABILITIES` guard over the byte-verbatim VA-T1 transplant — no signature, layout, or interaction change.

### `src/theo/swapBlock.ts` — the capability object (new export, verbatim)
```ts
// ── Dottie capability gates ──────────────────────────────────────────────
// Which transplanted Theo features Dottie's backend actually serves yet. The FE is a byte-verbatim
// Theo transplant, so every control is present; a feature stays `false` until its `dottie_*` backend
// lands (flip to `true` in the SAME governed package that ships that backend). Projects stays `false`
// indefinitely (Walter 2026-08-01: hidden for now). Single source of truth, consumed by data.ts (NAV
// filter), gateway.live.ts (attachments/voice predicates + short-circuits for unbacked list calls),
// and ConvMenu.tsx (Add-to-project item). Authoritative gap register: spec/DOTTIE_THEO_RECONCILIATION.md.
export const DOTTIE_CAPABILITIES = {
  projects: false,             // §B/§E — hidden indefinitely (no Projects/SPW backend)
  people: false,               // §C — dottie_list_people not built yet
  attachments: false,          // §D — dottie attachments (5 handlers + blob) not built yet
  artifactsPersistence: false, // §F — dottie artifacts persistence (3 handlers) not built yet
  voice: false,                // §G — dottie voice (transcribe/synthesize) not built yet
} as const;
```

### `src/theo/data.ts` — NAV filter (the only delta; all other lists verbatim)
```ts
export const NAV: NavItem[] = ALL_NAV.filter(
  (n) =>
    (n.key !== "projects" || DOTTIE_CAPABILITIES.projects) &&
    (n.key !== "artifacts" || DOTTIE_CAPABILITIES.artifactsPersistence),
);
```

### `src/theo/services/gateway.live.ts` — capability short-circuits (signatures unchanged)
```ts
export function attachmentsAvailable(): boolean {
  return DOTTIE_CAPABILITIES.attachments && isLive();
}
export function voiceAvailable(): boolean {
  return DOTTIE_CAPABILITIES.voice && isLive();
}
// listProjects():        if (!DOTTIE_CAPABILITIES.projects) return [];
// listPeople():          if (!DOTTIE_CAPABILITIES.people) return [];
// listServerArtifacts(): if (!DOTTIE_CAPABILITIES.artifactsPersistence) return [];
// persistArtifact():     if (!DOTTIE_CAPABILITIES.artifactsPersistence) return { id: "", currentVersion: 1 };
```

### `src/theo/components/ConvMenu.tsx` — "Add to project" gated
```tsx
{DOTTIE_CAPABILITIES.projects && (
  <button style={item("proj")} onMouseEnter={() => setHover("proj")} onMouseLeave={() => setHover(null)}
    onClick={() => setView("projects")}>
    <IcProjects s={16} /> Add to project <span style={{ marginLeft: "auto", color: C.ink3, paddingLeft: 12 }}>›</span>
  </button>
)}
```

---

## §CODEX — activation

Codex: please open your Pass-2 with a governance-bound GCR + Rule Anchor Table per the Codex Theo Frontend Review Standard, hard-gate this package, and return APPROVED or REJECTED only. This is a frontend feature-gating package (no backend, no migration, no write SQL); the gates are additive `DOTTIE_CAPABILITIES` checks over the byte-verbatim VA-T1 transplant, expressly directed by Walter and grounded in `spec/DOTTIE_THEO_RECONCILIATION.md`.
