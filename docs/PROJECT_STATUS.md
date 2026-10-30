# Project status and handoff
Reviewed: 2026-10-31

## Intent
Interactive periodic table → select an element or enter a chemical substance → choose a supported calculation → supply quantities and conditions → receive computed result, formula, substitutions, assumptions, provenance and limitations.

## Verified from repository inspection
- main contained a planning README at review time.
- No package.json or AGENTS.md was found on main at the initial inspection; the six docs referenced by README were missing. They were added on the documentation branch.
- This implementation branch adds a Next.js UI, typed calculator API, chemical formula parser, 28-element rounded reference dataset, benchmark/negative unit tests and a GitHub Actions CI workflow. These are committed source files; execution and deployment have NOT been verified.
- Reference architecture was compared against foxcyloxcy/Commercial-affiliation (AGENTS.md, docs/PROJECT_STATUS.md, docs/DOMAIN.md, local engineering-quality skill) and foxcyloxcy/document-data-extractor (README). No employer repositories are used as architectural sources.

## Decisions
- Deterministic, stateless chemistry core; scientific datasets and reaction evidence versioned independently.
- Modular monolith for MVP; scale horizontally later; do not prematurely split microservices.
- Element-selection alone cannot infer reactants/products.
- Typed and explainable result schema with explicit validity/support status.
- No AI in numerical authority path.

## Not built
118-element periodic table, robust source-backed all-elements dataset, scientific licensing review, advanced parser (hydrates/ions/isotopes), equation balancing, persistence, rate limiting, monitoring and deployment. CI configuration and tests exist but have not yet been run.

## Next task
Run npm install, typecheck, lint, Vitest and production build; commit generated package-lock and move CI to npm ci. Fix any failures. Independently verify atomic-weight source/license and expand to 118-element metadata before any production-science claims. Then extend grammar for hydrates/isotopes/ions and equation balancing.

## Completion evidence to add later
Date, PR and SHA; actual command logs; test/reference fixture count; validated sources/license; environment and deployment URLs; production rollout status; blockers.
