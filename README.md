# vault-dottie

**Dottie** — the **L4 governance observer** of the Vault memory architecture. A first-class, separate product that watches the shared record (L1.5 / L2 / L3, **never L1**) for tag drift, review-chain integrity, appropriate-access anomalies, and systemic governance patterns. Dottie **observes**; it does not gate — the write-time security control (the **Tag Guard**) already runs inside the access-policy engine (`vault-theo` Stage-0 §7.2).

Authority: `vault-theo/governance/VAULT_MEMORY_ARCHITECTURE.md` §5 / §A **Amendment 8** (Dottie implementation + priority pulled forward).

## Model

Runs on **in-tenant Azure OpenAI** (the `Vaultgpt` resource; keyless via managed identity) — a **deliberately different model from Theo's Claude** for governance-observer independence (the QC model is not the model that produced the content). Robust reasoning tier (GPT-5-class).

## Structure

- `/` — the **Dottie FE** (Vite/React). Deploys standalone to the dev/prod SWAs; promoted to a Theo-derived **module-federation remote** mounted in the Vault Origin shell (FE VEP).
- `/functions` — the **`vaultgpt-func-dottie`** backend (Azure Functions, Windows/Node v4, EP1, SystemAssigned MI). Self-contained handlers (Node built-ins) calling in-tenant Azure OpenAI keyless.
- `/governance` — the governance regime, **mirrored from `vault-theo`** (Codex reviews Dottie packages the same way).
- `/Codex Governance` — governed VEP packages (Pass-1 plan → Codex Pass-2 → deploy → Role-C).
- `/tools` — `lint_microstep_submission.mjs` (the VEP mechanical lint).

## Environments

| Branch | Surface | SWA |
|---|---|---|
| `development` | dev | `brave-dune-0a97c7d03.7.azurestaticapps.net` |
| `main` | prod | `black-stone-05bf4ca03.7.azurestaticapps.net` |

CI/CD: `.github/workflows/azure-static-web-apps-*.yml` (Oryx build from repo root → `dist`).

## Status

**Scaffold.** Frame-first: the SWA CI/CD + a landing surface are live; the Azure OpenAI API connection (backend VEP) and the governance console (FE VEP) are framed out next; the observational ruleset is tuned as L1.5 / L2 / L3 populate.
