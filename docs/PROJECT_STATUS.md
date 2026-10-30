# Project status and handoff
Reviewed: 2026-10-31 — interactive periodic table feature branch

## Intent
Interactive periodic table → select an element or enter a chemical substance → choose a supported calculation → supply quantities and conditions → receive computed result, formula, substitutions, assumptions, provenance and limitations.

## Verified from repository inspection
- main contained a planning README at review time.
- No package.json or AGENTS.md was found on main at the initial inspection; the six docs referenced by README were missing. They were added on the documentation branch.
- This implementation branch adds a Next.js UI, typed calculator API, chemical formula parser, 28-element rounded reference dataset, benchmark/negative unit tests and a GitHub Actions CI workflow. These are committed source files; execution and deployment have NOT been verified.
- Reference architecture was compared against foxcyloxcy/Commercial-affiliation (AGENTS.md, docs/PROJECT_STATUS.md, docs/DOMAIN.md, local engineering-quality skill) and foxcyloxcy/document-data-extractor (README). No employer repositories are used as architectural sources.

## New milestone: interactive 118-element explorer (PR #3)
- Implemented pinned 118-element secondary metadata snapshot, normalized table coordinates, searchable/filterable UI, selectable property panels, and append-to-formula action.
- 34 elements without a standard atomic weight are explicitly null, not a radioactive isotope mass number. Display metadata is not used by the separate 28-element molar-mass calculator.
- Integrity, positioning, missing-standard-weight, and search tests added; CI run https://github.com/foxcyloxcy/periodic-table-calculator/actions/runs/41143805722 **passed** npm ci, typecheck, ESLint, Vitest and Next.js production build. No browser E2E or live deployment verified.
- Full field-by-field CIAAW and PubChem/NIST data audit is NOT complete. See docs/PERIODIC_TABLE_DATA.md. UI browser/accessibility verification and deployment are pending.

## Decisions
- Deterministic, stateless chemistry core; scientific datasets and reaction evidence versioned independently.
- Modular monolith for MVP; scale horizontally later; do not prematurely split microservices.
- Element-selection alone cannot infer reactants/products.
- Typed and explainable result schema with explicit validity/support status.
- No AI in numerical authority path.

## Not built
full independently audited all-elements dataset, scientific licensing review, advanced parser (hydrates/ions/isotopes), equation balancing, persistence, rate limiting, monitoring and deployment. CI checks **have run and passed** (GitHub Actions run 41142432367: install, typecheck, ESLint, Vitest and production build). The dependency lockfile was generated and committed by that workflow. A follow-up run [41142580534](https://github.com/foxcyloxcy/periodic-table-calculator/actions/runs/41142580534) **also passed** `npm ci`, typecheck, lint, tests and production build with read-only workflow permissions.

## Next task
Independently audit the remaining atomic-weight source values/licensing/uncertainty, extend to all 118 element metadata, then develop advanced grammar and reaction balancing with scientific benchmarks.

## Completion evidence to add later
Documentation branch PR #1; implementation PR #2. CI evidence: https://github.com/foxcyloxcy/periodic-table-calculator/actions/runs/41142432367 (successful verification of install/typecheck/lint/tests/build; GitHub bot committed package-lock.json). `docs/REFERENCE_DATA_AUDIT.md` records a partial CIAAW benchmark audit; full provenance/licensing/uncertainty still pending. Not deployed.
