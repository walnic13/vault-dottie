# Dottie Distillation Engine — automatic Dottie-L1 personal memory — Pass-1 VEP

Builds **`dottie_distill_memory`** — the timer that automatically distils **Dottie-L1** (`dottie_user_memory`) personal memory from idle Dottie conversations, so Dottie is a *personal* check (knows the individual) not a stranger. **Byte-faithful mirror** of the deployed Theo **B7** distiller (`theo_distill_memory` — the PRIMARY REFERENCE) with three swaps: (1) tables → `dottie_*` (Dottie-L1 is **user-scoped** — no `scope`/`project_id`), (2) the model call → in-tenant Azure OpenAI **gpt-5** via the deployed `dottie_ask` pattern (`getAadToken` client-credentials + `/openai/deployments/{gpt-5}/chat/completions`, `max_completion_tokens`, `choices[0].message.content`) instead of Theo's Foundry Claude — governance-observer model independence (Amendment 8), and (3) the extraction prompt reworded for Dottie's governance/second-opinion 1:1 framing. Personal memory is **AUTOMATIC** (Vault Memory Arch **Amendment 10** — no consent gate). Dottie-L1 is **SEPARATE** from Theo's L1 (never crosses); no `theo_*` object is touched. **Includes a migration** (`dottie_conversations.last_distilled_at` watermark + `dottie_due_conversations` SECURITY DEFINER scan helper) — **Walter-run** (DB writes are Walter-only).

## Grounding Conformance Receipt
Role: Claude Code
Turn Type: Verified Evidence Pack (backend implementation package — timer handler + migration)
Grounding parent (source baseline): `9e23e5e51e597b1285ab622890f50ef936013a72` (vault-dottie, `development`); currency anchors below are tip-independent blob SHAs.
Grounding Mode: Full Baseline Grounding
Pass: Pass 1
Sub-phase Track: N/A

| # | Document (name + absolute path) | Read tool invocation this turn | Currency anchor (blob SHA @ HEAD / proposed) |
| - | ------------------------------- | ------------------------------ | -------------------------------------------- |
| 1 | GOVERNING VISION — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/VAULT_MEMORY_ARCHITECTURE.md` (§A Amendment 8 Dottie impl / Amendment 9 Dottie's own layered memory / **Amendment 10 personal memory is AUTOMATIC, not consensual**) | `Read`(§A) this turn | `38086aa5307421a3708ceca863aa7b9f95398fbd` |
| 2 | Backend Governor — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md` (§3 Never-Guess; §4 Schema Reality Lock; §8 VEP format + Gap Register) | `Grep("Never-Guess")` + `Grep("Schema Reality Lock")` this turn | `e44cdd85d3d0e5df332dc754cdec731e2e68022e` |
| 3 | Grounding Conformance — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md` (§3 GCR; §5 Rule Anchor) | `Grep("MUST open with a Grounding Conformance Receipt")` this turn | `7c0d902bdff3b6c0af475b483e31ed796214e57b` |
| 4 | Golden Handler — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/THEO_GOLDEN_HANDLER_STANDARD.md` (§2 primary reference; §4 EXACT-mirror / allowed deltas; §5.1 Structural Mirror Table; §5.5 Kudu-VFS deploy) | `Grep("Structural Mirror Table")` this turn | `f8f0e5ea36447502e35fb87b373c94e376f05cbb` |
| 5 | Execution Orchestration — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md` (§1D ordered pass; §1E deploy-after-Codex-APPROVED; migrations Walter-only) | `Grep("ordered, non-skippable")` this turn | `565559b699c1309f8e750b0dbbac859c13d807c8` |
| 6 | DESIGN AUTHORITY — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/spec/DOTTIE_MEMORY_MODEL.md` (§2.1 Dottie-L1 automatic; §7 build order — distiller; INV-1/INV-2 separateness) | `Read`(§2.1/§7) this turn | `80dd66f83f6f4870dddb764d1bd98b067fa83359` |
| 7 | **PRIMARY REFERENCE (DEPLOYED)** — `theo_distill_memory` handler + function.json on `vaultgpt-func-projects` (B7 RLS-Fix) — the timer + due-scan + set_config + extract + insert + watermark pattern. Inlined VERBATIM as `PRIMARY_REFERENCE.theo_distill_memory.index.js` / `.function.json` (byte-identical, diff-verified) + `PRIMARY_REFERENCE.b7d2_migration.sql` | `Read`(full) this turn | index.js `a9fe40b34ea8cbe204ace29af5838b65066bd6c3`; function.json `fe5890b2f7582bfe131f08fa6d1c2222afcae729`; b7d2 `f86ee9c5ec5d29f5568d0c33cd0c5678f1d0b499` |
| 8 | SCHEMA (CHANGED) — `c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/spec/DOTTIE_AZURE_POSTGRES_SCHEMA.md` (dottie_conversations/messages/user_memory as-built; + D3 addenda documented; "consensual"→"personal (automatic — Amendment 10)") | `Grep` + `Edit` this turn | base @HEAD `36c77d127195bc17900991e654cb015c8e602896` → proposed `9f9f5197cb7069475d7b8b261f9567b071396e58` |
| 9 | DEPLOYED FACT — `vaultgpt-func-dottie` (EP1, Node v4, SystemAssigned MI; EasyAuth shared audience; **timer triggers supported**) + `Vaultgpt` Azure OpenAI `gpt-5` (the "Vault GPT API" SP granted Cognitive Services OpenAI User); `POSTGRES_CONNECTION_STRING` + `AAD_*` + `AZURE_OPENAI_*` app settings set (dottie_ask deployed) | prior-session `az` + the deployed dottie_ask | live Azure state (§3) |

## Rule Anchor Table

| Source doc (absolute path) | Clause id | Verbatim clause text | Applied in output at |
| -------------------------- | --------- | -------------------- | -------------------- |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §3 | "MUST open with a Grounding Conformance Receipt" | GCR (head) |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/THEO_GROUNDING_CONFORMANCE_STANDARD.md | §5 | "Rule Anchor Table" | this table |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §3 | "Never-Guess" | §3 — tables/model idiom mirrored from the deployed Theo B7 handler + dottie_ask; nothing invented |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/CLAUDE_CODE_THEO_BACKEND_GOVERNOR_STANDARD.md | §4 | "Schema Reality Lock" | §3 — reuses only deployed/provisioned dottie_* tables + provisioned infra; new objects are additive |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/THEO_GOLDEN_HANDLER_STANDARD.md | §5.1 | "Structural Mirror Table" | §5 — the handler mirror table |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/THEO_GOLDEN_HANDLER_STANDARD.md | §2 | "deployed `function.json` file as the canonical Primary Reference" | §5 — primary reference = theo_distill_memory index.js AND function.json (both inlined verbatim) |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/VAULT_MEMORY_ARCHITECTURE.md | Amendment 10 | "both distill a personal memory automatically from conversations" | §1 — the distiller is AUTOMATIC (no consent gate), the same posture for both agents |
| c:/Users/WalterMansfield/Vault Group LLP/Innovate - Documents/Tax Workpapers Project/2026/vault-dottie/governance/THEO_EXECUTION_ORCHESTRATION_STANDARD.md | §1D | "ordered, non-skippable" | §GAP — Codex → Walter migration → Claude deploy → verify |

## Walter Authorization (quoted verbatim, predating this VEP)

> "you can do both and the governance regime should be mirrored from our current stnadard as you suggest." — Walter, 2026-08-01 (the `vault-dottie` repo + `vaultgpt-func-dottie` app + mirrored governance).

The func-dottie deploy authority stands from `dottie_ask` (the same app). **DB migrations remain Walter-only:** the migration in this package is authored here and **run by Walter** as `pgadmin_vault` (exactly as the deployed D1 / Attachments / Findings schemas were). The handler deploys to `vaultgpt-func-dottie` only after this VEP is Codex-APPROVED AND the migration is run.

---

## §1 — Feature + design
`dottie_distill_memory` — a **timer** handler on `vaultgpt-func-dottie` (`"0 */15 * * * *"`, every 15 min). Each tick:
1. Acquires a Cognitive Services token via `getAadToken("https://cognitiveservices.azure.com/.default")` (client-credentials; byte-identical to the deployed `dottie_ask`).
2. Cross-owner due-scan: `SELECT id, created_by FROM public.dottie_due_conversations($idle,$batch)` — the SECURITY DEFINER helper (runs as owner → bypasses RLS; the timer has no signed-in user). Returns only ids + owner ids.
3. For each due conversation: `set_config` that owner's context; read `dottie_messages` (ordered by `seq`,`created_at`); read existing `dottie_user_memory` (top 100 by salience — **no scope filter**, Dottie-L1 is user-scoped); build transcript + existing-memory list.
4. Call **gpt-5** (`/openai/deployments/{gpt-5}/chat/completions`, `max_completion_tokens`) with the extraction system prompt + `EXISTING MEMORY + TRANSCRIPT`; parse a JSON fact-array from `choices[0].message.content`.
5. `INSERT` each fact into `dottie_user_memory (created_by, kind, content, source_conversation_id, salience)` (**no `scope`/`project_id`** — Dottie-L1), clamp salience 0–10, cap at MAX_FACTS; `UPDATE dottie_conversations SET last_distilled_at = now()` watermark. Per-conversation `BEGIN/COMMIT`; on failure `ROLLBACK` + still watermark (no hot-loop).

**Personal memory is AUTOMATIC** (Amendment 10) — no consent gate. Dottie-L1 is **SEPARATE** from Theo's L1 (INV-1/INV-2); the handler reads/writes only `dottie_*`. Tunables (app settings, safe defaults): `DOTTIE_DISTILL_IDLE_MINUTES=30`, `DOTTIE_DISTILL_BATCH=20`, `DOTTIE_DISTILL_MAX_FACTS=8`, `DOTTIE_DISTILL_MAX_TOKENS=1024`.

## §2 — Architecture & boundary
A server-side batch (no user identity) reading across owners via the SECURITY DEFINER helper, then writing each owner's memory under that owner's `set_config` context (isolation holds — exactly the deployed Theo B7 model). **Boundary:** only `dottie_*` tables (`dottie_due_conversations`, `dottie_conversations`, `dottie_messages`, `dottie_user_memory`); one AAD token call + one in-tenant Azure OpenAI call; runs on `vaultgpt-func-dottie`; self-contained (Node built-ins + `pg`). No `theo_*`/`reporting_*` object touched; never reads Theo's L1. **Not a redesign** — the deployed Theo B7 engine, mirrored to Dottie's user-scoped store on gpt-5.

## §3 — Schema Reality Lock (deployed grounding)
Nothing invented (Governor §3/§4):
- **The engine** (`getAadToken`/`requestUrl`/`parseJsonSafe`, the timer/due-scan/set_config/extract/insert/watermark flow) — byte-faithful to the deployed **`theo_distill_memory`** (B7 RLS-Fix; primary reference, GCR row 7).
- **The gpt-5 call** (`/openai/deployments/{gpt-5}/chat/completions`, `max_completion_tokens`, `choices[0].message.content`) — byte-identical to the deployed **`dottie_ask`**.
- **The tables** — the DEPLOYED `dottie_conversations` / `dottie_messages` / `dottie_user_memory` (D1, verified in `DOTTIE_AZURE_POSTGRES_SCHEMA.md`), user-scoped, RLS `_own`.
- **The new objects** (`dottie_conversations.last_distilled_at` + scan index + `dottie_due_conversations` SECURITY DEFINER helper) — additive, mirroring Theo B7's `b7d2_migration.sql`, with the Dottie D1 REVOKE-PUBLIC hardening on the helper. **Walter-run migration.**
- **Provisioned infra:** `vaultgpt-func-dottie` (EP1, timer-capable) + `Vaultgpt` gpt-5 + `POSTGRES_CONNECTION_STRING`/`AAD_*`/`AZURE_OPENAI_*` app settings (all live from `dottie_ask`). New app settings for tunables are optional (defaults apply).

## §4 — Migration (Walter-run)
`dottie_distill_migration.sql` (idempotent; no top-level BEGIN/COMMIT): `ALTER TABLE dottie_conversations ADD COLUMN IF NOT EXISTS last_distilled_at timestamptz NULL`; the partial scan index; `CREATE OR REPLACE FUNCTION dottie_due_conversations(int,int) … SECURITY DEFINER SET search_path=public` + REVOKE-PUBLIC / GRANT authenticated. Byte-faithful to Theo `b7d2_migration.sql` (identifiers + the Dottie REVOKE-PUBLIC hardening). Run by Walter as `pgadmin_vault` on `vaultgpt-postgres-prod` before deploy.

## §5 — Structural Mirror Table (Golden Handler §5.1)
| Element | Primary reference `theo_distill_memory` | This `dottie_distill_memory` | Delta |
| --- | --- | --- | --- |
| Trigger | timerTrigger `"0 */15 * * * *"` | timerTrigger `"0 */15 * * * *"` | EXACT |
| Token | `getFoundryToken` (Foundry, `ai.azure.com`) | `getAadToken("…cognitiveservices…")` (dottie_ask) | ALLOWED — Dottie model independence (gpt-5) |
| Model call | `${FOUNDRY_BASE}/anthropic/v1/messages` (`max_tokens`, `content[].text`) | `${AZURE_OPENAI_ENDPOINT}/openai/deployments/{gpt-5}/chat/completions` (`max_completion_tokens`, `choices[0].message.content`) | ALLOWED — gpt-5 idiom (dottie_ask) |
| Due-scan | `theo_due_conversations($1,$2)` | `dottie_due_conversations($1,$2)` | EXACT (identifier) |
| Transcript read | `theo_messages` by seq/created_at | `dottie_messages` by seq/created_at | EXACT (identifier) |
| Existing memory | `theo_user_memory WHERE created_by=$1 AND scope='user'` | `dottie_user_memory WHERE created_by=$1` | ALLOWED — Dottie-L1 is user-scoped (no `scope`) |
| Insert | `theo_user_memory (created_by, scope, project_id, kind, content, source_conversation_id, salience)` `'user',NULL` | `dottie_user_memory (created_by, kind, content, source_conversation_id, salience)` | ALLOWED — drops `scope`/`project_id` (user-scoped) |
| Watermark / set_config / BEGIN-COMMIT / error-watermark | identical | identical | EXACT |
| Extraction prompt | tax-assistant framing | governance/second-opinion 1:1 framing | ALLOWED — Dottie persona (§4 tone, not schema) |

No DEVIATIONS. Env prefixes `THEO_DISTILL_*` → `DOTTIE_DISTILL_*`.

## §GAP — Gap Register
**PROCEED.**
- **G-1 — Migration is Walter-run.** The handler's due-scan/insert depend on `last_distilled_at` + `dottie_due_conversations`; Walter runs `dottie_distill_migration.sql` (as `pgadmin_vault`) BEFORE deploy. Ordered: Codex APPROVED → Walter migration → Claude deploy → verify. Disclosed.
- **G-2 — Injection is a separate package.** This distils memory; `dottie_ask`/`dottie_message` reading `dottie_user_memory` into the gpt-5 system prompt (so Dottie USES it) is the paired **Memory Injection** package (pkg 2). Until it lands, memory accrues but is not yet applied. Disclosed.
- **G-3 — Deploy verification.** Post-deploy: confirm the timer registers (Functions portal), and after ≥1 idle window + a chat, a `dottie_user_memory` row appears for the owner (RO SQL). Disclosed. PROCEED.

## §CODEX — activation (Walter forwards)

```
Codex is activated for Pass-2 BACKEND review of the Dottie Distillation Engine, vault-dottie,
"Codex Governance/Dottie-Distillation-Engine-Pass-1-VEP/Dottie_Distillation_Engine_VEP.md" @ commit <HEAD>. Open Pass-2 with a
governance-bound GCR + Rule Anchor Table; hard-gate; emit only APPROVED or REJECTED. Backend: a timer handler
`dottie_distill_memory` + a Walter-run migration. Byte-faithful mirror of the DEPLOYED Theo B7 `theo_distill_memory` (primary
reference inlined verbatim + diff-verified byte-identical) with three ALLOWED deltas: (1) tables -> dottie_* (Dottie-L1 is
user-scoped — drops scope/project_id from the existing-memory SELECT + the INSERT), (2) model call -> in-tenant Azure OpenAI
gpt-5 via the deployed dottie_ask pattern (getAadToken client-credentials + /openai/deployments/{gpt-5}/chat/completions,
max_completion_tokens, choices[0].message.content) for governance-observer model independence (Amendment 8), (3) extraction
prompt reworded for Dottie's governance/second-opinion 1:1 framing. Personal memory is AUTOMATIC (Amendment 10 — no consent
gate); Dottie-L1 SEPARATE from Theo's L1 (INV-1/INV-2), only dottie_* touched. Migration (Walter-run as pgadmin_vault):
dottie_conversations.last_distilled_at + partial scan index + dottie_due_conversations(int,int) SECURITY DEFINER (REVOKE-PUBLIC,
EXECUTE authenticated) — byte-faithful to Theo b7d2_migration.sql. Timer + set_config per-owner context + BEGIN/COMMIT +
error-watermark all EXACT. Schema spec updated (D3 addenda documented; consensual->personal per Amendment 10). Order: Codex
APPROVED -> Walter runs migration -> Claude deploys to vaultgpt-func-dottie -> verify. Mechanical lint PASS. Emit APPROVED or
REJECTED only.
```

*End of Dottie Distillation Engine Pass-1 VEP.*
