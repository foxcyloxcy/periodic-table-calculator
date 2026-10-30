# Scalable architecture

## Start as a modular monolith
- apps/web: Next.js UI with accessible 118-element periodic table, guided substance/formula input, conditional forms and derivation cards.
- apps/api or Next route handlers: validation, request sizing, rate limiting, auth when needed and response formatting; no chemistry business logic.
- packages/chem-core: pure, deterministic parsers and calculation algorithms. No network, AI, database or UI imports.
- packages/chem-models: typed species, formula AST, quantities, units, status, error and derivation contracts.
- packages/chem-data: curated versioned element properties and optional reaction/thermochemistry datasets with importers and licensing metadata.
- packages/chem-explanations: render calculation traces and cited assumptions from structured core output; optional AI only rephrases, never alters values.
- packages/test-fixtures: independent reference cases, invariants, difficult/negative inputs.

These are proposed boundaries, not currently created directories.

## Processing
UI → schema validation → normalize chemical identity/units → choose supported operation/model → resolve versioned reference records → compute → independently validate conservation/dimensions → serialize typed result with provenance → UI.

## Scaling rules
- Stateless, side-effect-free synchronous calculations; cache safe results by normalized canonical input + operation/algorithm/data versions and policy.
- Avoid premature persistent calculation storage; add Postgres for history/accounts/reference provenance when required. Prefer immutable reference snapshots; separate ingestion from serving.
- Bound input length, nesting depth, integer coefficients, solver complexity and request wall time to mitigate denial of service.
- Add asynchronous jobs only for expensive calculations; return job IDs with idempotency, cancellation, quotas and retention.
- Scale web/API independently only after benchmarks show pressure; isolate computational workloads as workers only if needed.
- Collect latency p50/p95/p99, operation, support status, error category and dataset version; no secrets or unnecessary personal information in logs.
- Use API versioning, typed schemas, request IDs, health checks, rollback, preview deployments and reproducible dataset upgrades.

## Data strategy
Do not treat PubChem/NIST/IUPAC as interchangeable. Version and license-check each actual data source; record citation, access date, license, units and validity domain. Avoid remote APIs in the hot path for basic calculations. Never claim all 118 elements share a single stable precise atomic weight.

## Security
Strict validation, CSP, dependency scanning, no sensitive secrets in browser, least privilege for DB, safe logging, bounded compute, CI/branch protection, separate preview/prod config. No arbitrary user-supplied code execution.

## Deployment
Next.js on Vercel is a candidate; no deployment claim. Compute-intensive symbolic solvers may need separate compute after profiling. Keep providers replaceable behind adapters.
