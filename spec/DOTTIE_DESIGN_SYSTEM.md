# Dottie Design System — Visual Authority (v0.1 DRAFT)

**Status:** DRAFT for Walter's confirmation. Once confirmed, this document is **Dottie's visual authority** and the grounding basis for every governed Dottie frontend package. It **supersedes, for Dottie, the "byte-verbatim transplant of Theo's FE (VA-T1)" basis** — Dottie now has her own design language. Theo's chat *mechanics* are still reused (see §9); Theo's *look* is not.

**Authored:** 2026-08-02 (Walter-directed). **Reviewer:** Codex (Dottie FE governance). **Repo:** `vault-dottie`.

**Program context — Dottie is a spoke, not the hub.** Dottie is the conversational face of the **L4 governance layer** of the Vault memory architecture (`vault-theo/governance/VAULT_MEMORY_ARCHITECTURE.md`, §A Amendments 8/9), which itself serves the larger **Projects program** (two-Theo: personal "better half" in Orbit + Project-Theo moderating each project; the cross-agent TODO tool; SPW Phase 3). This design system governs Dottie's *look*; her *memory persistence* (Dottie-L1/L2/L3 + Six-Plates lens + governance-findings store, and reading Theo's shared L1.5/L2/L3 via the live access-policy engine, never L1) is defined in `spec/DOTTIE_MEMORY_MODEL.md`.

---

## 1. Purpose & principle

Dottie is Vault's **independent governance agent** — the check on Theo. Theo (male) executes; Dottie verifies that Theo did what he said, sets him straight, and is the backbone keeping Vault on the rails. She is detailed, structured, always supports her conclusions, follows governance, expects documentation, and does not make assumptions. She runs on **gpt-5** — deliberately independent of Theo's Claude.

The design exists to make that legible at a glance. Two principles govern everything below:

- **P1 — She looks like a console, not a chatbot.** A dark, precise, auditable surface (ink + gold + monospace provenance), *committed to one theme* across every surface. Uniformity is the brand: the instant she appears — standalone, inside Theo, in a workflow, in Orbit — people know it's the checker.
- **P2 — The contrast is the signal.** When her dark surface docks inside light/warm Theo (or any Vault app), the contrast itself says "the checker is now looking." We never dilute the dark identity to blend in.

---

## 2. Design tokens

Single source of truth for the FE (`:root` custom properties). Values are authoritative; components reference tokens, never raw hex.

### 2.1 Colour — ground & structure
| Token | Value | Use |
| --- | --- | --- |
| `--ink` | `#0C0F14` | app ground (cool near-black, slight blue bias — chosen, not pure black) |
| `--ink-2` | `#0A0D12` | rail / deepest ground |
| `--panel` | `#141922` | cards, raised surfaces |
| `--panel-2` | `#1A2029` | hover / active row |
| `--inset` | `#10151C` | insets, quote boxes, claim boxes |
| `--line` | `#252E3B` | primary hairline border |
| `--line-2` | `#1D2530` | secondary / quiet divider |

### 2.2 Colour — text
| Token | Value | Use |
| --- | --- | --- |
| `--tx` | `#E7ECF3` | primary text |
| `--tx-mut` | `#96A0AE` | secondary / metadata |
| `--tx-faint` | `#68717F` | labels, timestamps, faint UI |

### 2.3 Colour — accent (gold)
| Token | Value | Use |
| --- | --- | --- |
| `--gold` | `#D7B15C` | the single accent — authority / seal; quiet nod to Vault's warm-sand Spiral. **Not** the default teal-on-black. |
| `--gold-hi` | `#EBC97D` | hover / emphasis |
| `--gold-dim` | `rgba(215,177,92,.14)` | accent wash / tag background |

The accent is used sparingly: active states, the primary action, provenance-label eyebrows, the ✎/⚖ marks. It is **not** a semantic status colour.

### 2.4 Colour — semantic verdicts (separate from accent)
These carry meaning and must never be swapped for the accent.
| Token | Value | Meaning |
| --- | --- | --- |
| `--concur` | `#5FBE90` | Concur / supported / approved |
| `--caution` | `#E4AC4E` | Caution / needs support |
| `--challenge` | `#E0776C` | Challenge / unsupported / reject |
| `--info` | `#6EA8FE` | citation chips, neutral reference |

Tints for badge/callout backgrounds: `--concur-bg rgba(95,190,144,.12)`, `--caution-bg rgba(228,172,78,.13)`, `--challenge-bg rgba(224,119,108,.13)`, citation `rgba(110,168,254,.10)`.

### 2.5 Type
| Role | Stack | Notes |
| --- | --- | --- |
| Sans (UI/body) | `"Inter", ui-sans-serif, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` | clean grotesque; carries reading + chrome |
| **Mono (provenance)** | `ui-monospace, "SF Mono", "Cascadia Code", "Consolas", monospace` | **all** provenance renders here: citations, refs, confidence, timestamps, verdict labels, eyebrows. This is the single strongest "auditable" cue. |

Scale (px): body 14 / 13.5; leads 14; small 12–12.5; micro-labels 9.5–11 uppercase with `letter-spacing:.12–.16em`. Numerals use `font-variant-numeric: tabular-nums`.

### 2.6 Radii & motion
Radii: `--r 10px`, `--r-lg 14px`. Motion is minimal and purposeful (e.g. a 400ms slot slide on dock reveal); always guard `@media (prefers-reduced-motion: reduce)`.

---

## 3. The governance component (the core)

One component renders every substantive Dottie answer and every check. It travels unchanged across all surfaces (§6). Anatomy, top to bottom — parts marked *(conditional)* appear only in the relevant intensity (§4):

1. **Byline** — `Dottie · independent` (the `independent` cue is always present). *(conditional)* a **verdict badge** and/or a `My read` tag sit here.
2. **Claim under review** *(conditional — adjudication only)* — an inset box quoting the assertion being judged, with a `reviewing: <source>` ref (e.g. `Theo · §1446(f) answer`).
3. **Lead line** — the answer/position in one bold sentence.
4. **Support** *(substantive answers)* — a left-ruled argument block with monospace eyebrows:
   - **Authority** → the precise cites (`IRC §…`, `Treas. Reg. §…`) as citation chips.
   - **What it says** → what the authority provides.
   - **How it applies (to these facts)** → the application.
5. **Conclusion** — a bordered callout; colour-keyed to the verdict when adjudicating (challenge/caution/concur), neutral (gold) for a direct position.
6. **Flags** *(conditional)* — assumption / risk flags (`⚑ One assumption to confirm: …`).
7. **Confidence** — a mono meter + label (`high` / `fact-dependent` / `low` …).
8. **Documentation expected** *(conditional)* — dashed mono chips of the support Dottie needs before the conclusion can be relied on.

**Rule R-COMPONENT:** the support/confidence/flags structure *forces* Dottie to show her work — it is not optional chrome. A surface that renders her answers as plain prose is non-conformant (she would drift into "Theo in the dark").

---

## 4. The three intensities (adaptive renderer)

The same surface answers at one of three intensities, selected by **whether there is a claim to adjudicate** — not by which surface she's on.

| Intensity | When | Renders |
| --- | --- | --- |
| **Light** | general lookup, image/video, casual | plain conversational answer; **no** support scaffolding. Image/video result cards live here. |
| **Grounded** | a direct substantive opinion ("how does §1446(f) apply to us?") | the governance component **without** a verdict badge — a `My read` tag, full support, confidence, assumption flags. It is *her position*, supported — not a judgment on anyone. |
| **Grounded + verdict** | adjudicating an external claim — Theo's answer, a document assertion, "is this right?" | the full component **with** a verdict badge (Concur / Caution / Challenge) + claim-under-review. |

**Rule R-INTENSITY:** the grounding structure rides **every substantive answer**; the **verdict badge appears only when adjudicating a claim.** "Checking Theo" is therefore not a separate feature — it is the adjudication intensity pointed at a review target (§7.3).

Locked micro-decisions (Walter, 2026-08-02): keep the `My read` tag on grounded-non-verdict answers; a video result card is acceptable for light lookups; the verdict badge sits inline in the byline (not a separate banner).

---

## 5. Anti-patterns

- No light/blend-in variant to match a host surface (violates P2).
- No verdict colour used as the accent, or vice-versa (§2.3/2.4).
- No plain-prose substantive answers (violates R-COMPONENT).
- No AI-default dark look (lone acid-green/teal on black; purple gradients; emoji as section markers; everything centered; rounded-lg everywhere). The committed look is cool-ink + gold + monospace provenance.
- Dottie never draws shell chrome she doesn't own (§7).

---

## 6. Surfaces (four homes, one system)

Dottie is a **first-class Vault app** that renders her content into slots the Origin shell owns. Two content **forms**, chosen by the width of the slot:

### 6.1 Full form — the 9/10 governance console
Her home. Sections (rendered in the **1/10 app-menu**, per §7): **Overview** (oversight dashboard — checks-on-Theo, verdicts, open flags, the governance/workflow queue = her Codex-role), **Checks on Theo**, **Workflows**, **Ask Dottie**, **Library & Sources**, **Open flags**, **Audit trail**. Main content in the 9/10 pane.

### 6.2 Ask Dottie — the adaptive chat
Theo's chat *shape* (user bubbles right, open assistant answers, composer with modes + attachments) in Dottie's skin, driving the §4 intensities. Composer modes let the user steer intensity (Second opinion · Check Theo · Image · Video) but the default is adaptive. Reachable full-screen (console) or compact (right-panel tab).

### 6.3 Compact form — the right-panel tab (incl. the "check inside Theo")
At ~360–440px: **Ask Dottie chat + the check-card**, no 1/10 menu (that panel belongs to the 9/10-selected app). "Run Dottie's check inside Theo" **is** this form pointed at a review target (§7.3) — a scaled-down governance component, not a bespoke drawer. Must be fully usable at tab width.

### 6.4 Orbit presence (future)
An agent presence in Orbit, mirroring Theo's. Same identity + component. Design pass pending.

---

## 7. Origin shell contract (grounded in `vault-origin/src/shell/`)

Dottie renders **into** shell-owned slots and must not draw shell chrome. Grounded findings and the contract:

### 7.1 What the shell owns (Dottie must not reimplement)
- **Perm rail** (`AppRail.tsx`, ~48px, desktop) — Dottie's launcher icon.
- **1/10 app-menu** (`ShellLeftPanel.tsx`) — single-context; shown when Dottie's rail icon is selected, **collapsed by re-clicking the active icon** (VS-Code disappear). Dottie's nav lives *here* in full form; the shell toggles it.
- **9/10 pool** (`mountedAppIds` + `WorkspaceTabs.tsx`) — hide-not-unmount, closeable tab, app back-stack. Dottie's console gets this **for free** once registered.
- **Right panel + its tabs** (`RightPanelTabs.tsx`) — creation / switch / close (`✕`).
- **Breakpoint** (`useIsNarrowViewport.ts`, `max-width:767.98px`) — desktop vs phone.

### 7.2 Registering Dottie (the "free" 9/10 console)
Add to `productRegistry.ts` (`PRODUCTS`), add `MOUNT_DESCRIPTORS['dottie']` + a `loadRemote` case in `RemoteModuleMount.tsx`, and a `dottieApp` entry in `vite.config.ts` `REMOTE_ENTRIES`. The 9/10 console then works via the existing pool with no new shell machinery.

### 7.3 The gaps — Origin shell work (a SEPARATE governed track, not Dottie's repo)
Grounded reality: **today the right panel is chat-only** — `RightPanelTabs` tabs are conversations (`kind:'dm'|'channel'`) and the body only renders `ChatDockPanel`; Theo's right presence is a *separate* bespoke 440px portal-slot dock, **not** a right-panel tab. So "Dottie shares the right panel as her own tab" requires Origin to:
- **G1 — Generalize the right panel from chat-only to app-capable:** extend the tab model so a tab can be an *app* (not just a conversation), render Dottie's remote in the panel body, and give tabs a product-icon path.
- **G2 — Reconcile the columns:** Theo's app-mode dock (a 440px portal column) and the chat panel are separate today; three simultaneous 440px columns (Theo + chat + Dottie) is untenable. Decide that the right panel becomes the shared app-capable host (Dottie shares/replaces the chat column) rather than a third column.
- **G3 — The review-target contract:** when Dottie is a right-panel tab beside an ops-app (e.g. Sigma) or Theo, the shell must hand her **what she is reviewing** — the active 9/10 app's artifact or Theo's latest answer. This is the core integration seam and must be an explicit contract the shell passes to her mount.
- **G4 — Dual-surface state:** if Dottie must appear in the 9/10 **and** a right tab sharing state, follow Theo's mount-once / two-stable-portal-slots pattern (`TheoMount.tsx`); independent instances will not share state. Respect the R1 rule: portal host elements stay mounted (hide via CSS), never unmount.

Until G1–G3 land in Origin, Dottie's **9/10 console ships independently** (it needs none of them); the compact right-panel-tab form is **gated on the Origin generalization**.

### 7.4 Phone / narrow
Grounded: `MobileAppBar.tsx` bottom rail pins **Orbit + Files** far-left, Theo is the first tile in the scrollable strip; the 1/10 menu becomes an **off-canvas drawer** toggled by the top-left hamburger; **there is no right panel on phone** (chat goes full-screen). Consequences:
- Dottie's **console** works on narrow via the same drawer + full-width 9/10 as any app.
- Her **compact/check form has no right panel to dock into.** Narrow behaviour = a **full-screen sheet** (reusing the full-screen-overlay machinery the chat dock already uses), plus a `MobileAppBar` tile to launch her.
- **Open problem (unsolved in Origin too):** multi-app on phone — Sigma in the main area while the user wants Theo *and* Dottie. Recommended direction (needs its own design pass, not settled): a **shell-owned invocation** — a persistent Theo/Dottie affordance the shell overlays on any ops-app, opening each as a full-screen sheet with review-target = the current app — rather than each ops-app baking its own buttons (which fragments the pattern).

---

## 8. Responsive summary

| Viewport | Console (full) | Chat/Check (compact) |
| --- | --- | --- |
| Desktop (≥768px) | 9/10 pane + 1/10 nav (shell-owned) | right-panel tab (~360–440px), gated on Origin G1–G3 |
| Phone (<768px) | full-width 9/10 + hamburger drawer nav | full-screen sheet + MobileAppBar tile; multi-app-with-ops-app is an open shell problem |

---

## 9. What is reused from Theo vs Dottie-specific

**Reused (Theo chat *mechanics*, via the existing transplant):** message list / streaming, composer, attachments (incl. the extract-budget behaviour), recents, artifacts panel, markdown rendering primitives. Cheap and familiar — no reason to rebuild.

**Dottie-specific:** the entire token set (§2, dark), the governance component (§3), the three intensities (§4), the verdict/flag/confidence/docs vocabulary, the console/Overview surfaces (§6.1), the `independent` identity cues, and the compact/check form.

**Rule R-RENDERER:** Dottie's message renderer = Theo's markdown renderer **plus** the governance blocks. A supported answer renders the structure inline; a light lookup renders plain markdown. This unification is what lets one component serve all four surfaces.

---

## 10. Governance & tracks

- This document is Dottie's **visual authority**. Every governed Dottie FE package (Pass-1 FE VEP) grounds against it (blob-anchored), the way earlier packages grounded against "VA-T1 = Theo's FE." Codex reviews FE packages for conformance to this system.
- It supersedes the transplant basis **for Dottie only**; Theo's FE governance is unaffected.
- The work splits into **three tracks**, governed independently so none blocks the others:
  1. **Dottie the app** (this system): her console, adaptive renderer, compact form — mostly `vault-dottie`.
  2. **Origin shell generalization** (§7.3 G1–G4 + §7.4 phone): right-panel app-capability, column reconciliation, review-target contract, phone invocation — `vault-origin` core, governed on that side.
  3. **This design system**: the durable reference both tracks build against.

**Sequencing:** Dottie's 9/10 console (Track 1, needs only §7.2 registration) can ship first and independently; the compact right-panel-tab form is gated on Track 2 (§7.3). The Dottie logo drops into this system once §2/§3 are confirmed — it is *placed within* the identity, not the driver of it.

---

## 11. Decisions log & open questions

**Locked (Walter, 2026-08-02):** dark, committed, uniform across surfaces; gold accent; monospace provenance; the governance component anatomy (§3); the three intensities + the claim-to-adjudicate rule (§4); `My read` tag / video card for light / verdict-inline-in-byline (§4); the four surfaces (§6); Dottie is a shell-slot app, never draws shell chrome (§7).

**Open:**
- **O1 — Origin right-panel generalization (G1–G3):** scope + design of the app-capable right panel and the review-target contract. Gates Dottie's shared-tab form.
- **O2 — Phone multi-app-with-ops-app:** the shell-owned invocation direction (§7.4) needs its own design pass.
- **O3 — Orbit presence (§6.4):** design pass pending.
- **O4 — Typeface:** current stacks are system-safe; a licensed display/UI face could be inlined later for more character (optional).
- **O5 — Dottie logo:** to be designed into this system (after §2/§3 confirmation).
