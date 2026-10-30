# Engineering quality and governance

## Sources: foxcyloxcy personal projects
- Commercial-affiliation: repo-local AGENTS.md and docs/PROJECT_STATUS.md, domain vocabulary, engineering-quality agent skill, safe non-live demo separation.
- document-data-extractor: personal extraction project README; reuse evidence/provenance separation as a design preference, not proof of unseen code.
- No CallableAI or employer assets, configurations, infrastructure, or proprietary implementation patterns are imported.

## Standard development rules
Strict TypeScript, small domain-driven modules, input schema validation, consistent errors, thin transport layer, tests adjacent to pure engine, typed API schemas, migrations reviewed before execution. Avoid speculative dependencies and unnecessary databases.
Use npm lockfile and reproducible installs after scaffold. CI: lint, typecheck, test, build, dependency audit; add benchmarks/property tests. Require review for changes to science data, parsers, balancing and scientific formulas.
Use explicit licensing and citation checklists for external datasets and packages. Document tests run and their outputs. No false claims of deployments, integrations or scientific accuracy.

## Scientific acceptance and traceability
Independent authoritative fixture, algorithm + dataset version, units, assumptions, derivation, explicit missing/unsupported status, conservation/dimensional checks and stable formatting for every scientific feature. Promote reference datasets through reviewed immutable versions.

## Security/scale/operations
Enforce input depth and solver complexity bounds, rate limiting, secrets hygiene, least privilege, separate environments, observability, semantic API compatibility and rollback. Cache only when normalized inputs and all version keys match.

## Agent skill governance
Local skills must not override this document; external skills require source review, licensing and collision checks before use. Do not blindly copy entire bundles. Record each accepted skill and its scope.

## Status discipline
After every milestone update docs/PROJECT_STATUS.md with date, commit, tests actually run, what is implemented vs planned, any blocked data/license requirements and next action.
