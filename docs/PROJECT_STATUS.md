# Project status and handoff
Reviewed: 2026-10-31

## Intent
Interactive periodic table → select an element or enter a chemical substance → choose a supported calculation → supply quantities and conditions → receive computed result, formula, substitutions, assumptions, provenance and limitations.

## Verified from repository inspection
- main contained a planning README at review time.
- No package.json or AGENTS.md was found on main; the six docs referenced by README were missing.
- This branch adds planning/engineering contracts only. No backend, frontend, production deployment, scientific ingestion, benchmark execution or tests are implemented/verified by these documents.
- Reference architecture was compared against foxcyloxcy/Commercial-affiliation (AGENTS.md, docs/PROJECT_STATUS.md, docs/DOMAIN.md, local engineering-quality skill) and foxcyloxcy/document-data-extractor (README). No employer repositories are used as architectural sources.

## Decisions
- Deterministic, stateless chemistry core; scientific datasets and reaction evidence versioned independently.
- Modular monolith for MVP; scale horizontally later; do not prematurely split microservices.
- Element-selection alone cannot infer reactants/products.
- Typed and explainable result schema with explicit validity/support status.
- No AI in numerical authority path.

## Not built
Frontend, engine, parser, persistence, APIs, CI, tests, datasets, licensing verification, deployment and monitoring.

## Next task
Implement a tested vertical slice: typed element dataset with versioned provenance, robust chemical formula parser, molar-mass calculator and explanatory derivation. Establish typecheck, test and build CI. Verify atomic-weight policy and benchmark known compounds before adding reaction balancing.

## Completion evidence to add later
Date, PR and SHA; actual command logs; test/reference fixture count; validated sources/license; environment and deployment URLs; production rollout status; blockers.
