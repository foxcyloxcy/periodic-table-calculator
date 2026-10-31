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

## 2026-10-31 — Reference planning milestone
- Committed `docs/SCIENTIFIC_REFERENCES.md`, `docs/reference-sources.json`, `docs/COMPUTATION_METHODS.md`, `docs/IMPLEMENTATION_SEQUENCE.md`; linked them from developer entry points.
- Verified official online reference pages for CIAAW 2024 standard and abridged weights, IUPAC Gold Book molar mass and stoichiometry, BIPM SI mole definition, OpenStax balancing/stoichiometry, PubChem API documentation and NIST WebBook reference scope.
- This PR is **documentation and implementation planning only**. It does not expand the runtime 28-element mass dataset, implement ionic/hydrate/balance/stoichiometry, complete third-party licensing checks, or independently certify all 118 element properties.
- Next action: implement Gate A from IMPLEMENTATION_SEQUENCE.md with a human-reviewed CIAAW weight import, explicit intervals/uncertainties, independently checked complete-source metadata, and scientific audit tests; only then Gate B computation expansion.

## Computation reference documentation CI verification
GitHub Actions run https://github.com/foxcyloxcy/periodic-table-calculator/actions/runs/41144205343 completed successfully: npm ci, typecheck, ESLint, Vitest and Next.js production build. This only validates software integration for the documentation branch, not scientific data completeness or licensing approval.

## 2026-10-31 — CIAAW Gate A implementation and GitHub Pages preparation
- Official CIAAW full and abridged 2024 HTML tables imported into `src/lib/chemistry/ciaaw-2024.json`: 118 records, 84 numeric abridged standard weights with uncertainty and 34 unavailable. Full-table scalar vs interval retained. Official source links and retrieval date embedded.
- `elements.ts` now uses the CIAAW reference dataset; molar-mass calculation availability expands from 28 to 84 elements. Formula parser continues to reject unsupported/unknown elements.
- Periodic table weight display uses official CIAAW abridged values rather than the secondary display snapshot.
- GitHub Pages static export enabled and GitHub Actions deployment workflow created. Browser now executes the same pure calculator directly; the POST API route was removed because Pages cannot host it.
- Further manual per-element independent audit and redistribution/attribution review remain open. Other display properties are not scientifically certified; uncertainty is displayed but not propagated into final molar mass.
- Not deployed yet: Settings → Pages must use GitHub Actions and dependent PRs must merge to main.
- Read `docs/GITHUB_PAGES_DEPLOYMENT.md`; CI validation is pending.

## GitHub Pages deployment attempt — 2026-10-31
- PRs #1–#5 merged to `main`. GitHub Pages Actions run 41146278069 passed npm ci, typecheck, lint, 33 Vitest tests and static Next.js export, then failed at configure-pages because no Pages site exists.
- Second run 41146380803 repeated a successful build, but `enablement: true` failed to create the Pages site with `Resource not accessible by integration`. The attempted auto-enable option was reverted.
- **Site is NOT live**. Owner action required: Settings → Pages → Build and deployment → Source → GitHub Actions. Then use Actions → Deploy GitHub Pages → Run workflow and verify URL.
- The code and CIAAW 2024 source snapshot are committed to `main`; 118 records, 84 abridged standard atomic weights, 34 without standard weights. Independent per-field audit and licensing review still pending; UI secondary properties remain informational.

## 2026-10-31 — Verified compound naming milestone
- Added a separate PubChem-backed chemical name resolver with systematic/common names and source citations for five curated formula spellings: FeSO4, Fe2(SO4)3, H2O, CaCO3, Na2CO3.
- `calculateMolarMass()` now returns a verified or unresolved compound identity annotation without allowing the naming registry to affect numerical mass computation.
- UI shows preferred name, common names, PubChem citation and limitations, or clearly states that the name is not verified.
- Added naming tests for Fe(II)/Fe(III), unresolved isomers/unsupported hydrate syntax, and independent numerical calculation behavior.
- Naming all possible chemicals requires an independently reviewed compound identity dataset with charge/hydrate/isomer distinctions; no guessed names or oxidation states.
- Feature branch pending CI and merge/deploy verification. See `docs/COMPOUND_NAMING.md`.

## 2026-10-31 — Formula entry assistance
- Added repeated-click subscript editor, reviewed formula suggestions and explicit user confirmation for repeated raw symbols (FeSOOOO → FeSO4).
- Similar known formulas are presented as alternatives, not automatic corrections. Valid but unnamed formulas still compute; unknown symbols cannot produce mass results.
- Added Vitest tests and docs/FORMULA_ASSISTANCE.md. CI/deploy must be verified before calling this release live.

## 2026-10-31 — PubChem material-name search milestone
- Added live browser-based PubChem PUG REST search with a bounded, user-submitted name→CID→formula flow. All candidate records show PubChem sources, not hardcoded numeric results.
- For supported PubChem formulas, the existing CIAAW engine computes atom counts, molar masses and elemental mass percentages. Unsupported chemical grammar/unknown elements remain explicit, no fictitious mass.
- Search can show up to 8 candidate identities; generic sugar names may be ambiguous and foods/mixtures are not represented as one formula by default.
- UI integration, automated mocking tests, responsive views and docs/MATERIAL_LOOKUP.md added. CI and production deployment must pass separately before marking this feature live.

## 2026-10-31 — Formula name ambiguity and input case handling
- Added browser-side PubChem fastformula search for source-linked compound candidates (max eight). C2H6O is not uniquely identifiable: ethanol (CID 702) and dimethyl ether (CID 8254) are distinct structures with the same elemental composition and molar mass.
- Added case-aware formula correction so typed lowercased formulas can be normalized to recognized symbols, while ambiguous Co vs CO prompts explicit choice. Unverified formulas remain unverified, with no guessed names.
- Added Vitest tests, UI and docs/FORMULA_ISOMERS_AND_CASE.md. CI and deploy verification pending at initial commit.

## 2026-10-31 — Unified materials discovery milestone
- Added a single search covering exact element matches from local dataset, PubChem compound identity/formula records, and Wikidata material taxonomy through P31/P279 statements.
- Results distinguish source-backed compounds from alloy/mixture/broad-material categories. Steel via Q11427 → Q907347 → Q37756 is an alloy, with **no universal chemical formula or fixed elemental proportions**. Milk is treated as a variable food/material class.
- Added bounded requests, explicit unclassified/partial-source results, independently calculated CIAAW molar mass and elemental percentages for eligible pure compounds, and source links.
- Tests and docs/UNIFIED_MATERIAL_SEARCH.md added. CI and GitHub Pages publish must be verified before claiming the release is live.

### Unified search release verification (2026-10-31)
- PR #10 merged to `main` at commit `c904c1e33510fee160211ed9af769208aeb1afc7`.
- CI passed with reproducible install, TypeScript, ESLint, Vitest and production static build: https://github.com/foxcyloxcy/periodic-table-calculator/actions/runs/41196746215
- GitHub Pages deployment succeeded: https://github.com/foxcyloxcy/periodic-table-calculator/actions/runs/41196813490
- Published HTML inspected at https://foxcyloxcy.github.io/periodic-table-calculator/ and unified search UI was present. Live mobile/browser-to-PubChem/Wikidata form interactions were not separately automated; client CORS and provider availability remain operational risks.
- Not yet implemented: exhaustive materials coverage, grade-specific percentage composition for mixtures/alloys, full material properties and validated experimental conditions.

## 2026-10-31 — detailed material profiles milestone (feature branch)
- Added data model for source-linked physical/computed property values, contextual conditions and grade-specific mass-percent ranges.
- Dynamic PubChem CID descriptor lookup uses PUG REST and labels values as **computed molecular descriptors**, not physical measurements. Wikidata P2054 density extraction preserves unit plus source-provided temperature, pressure and phase qualifiers; missing conditions are explicitly marked.
- Source-specific 304 stainless steel UNS S30400 long-products composition limits reference thyssenkrupp Materials NA; no universal formula or calculated iron remainder is claimed for generic steel.
- Added regression tests, UI and docs/MATERIAL_PROFILES.md. Awaiting CI and Pages deployment verification before release claim.

### Material profiles release evidence — 2026-10-31
- PR #11 merged to `main`: `dc25890675391e913c44efa7dc94b7cd7f3795c0`.
- Feature CI passed: https://github.com/foxcyloxcy/periodic-table-calculator/actions/runs/41207326128 (typecheck, ESLint, Vitest and static build).
- GitHub Pages deployment completed successfully: https://github.com/foxcyloxcy/periodic-table-calculator/actions/runs/41207402241.
- Public HTML at https://foxcyloxcy.github.io/periodic-table-calculator/ showed the updated 304 stainless steel search hint. Browser click-through and live source fetch behavior were not independently exercised with automated E2E; live providers can be temporarily unavailable.
- Current data limits remain: only curated 304 UNS S30400 long-product composition ranges, selected PubChem computed descriptors, and supported Wikidata density statements where present. No exhaustive material-property registry or batch-specific calculated composition.

## 2026-10-31 — Expanded 304L / 316 / 316L grade-property and browser milestone
- Added source-specific chemistry limits for 304L UNS S30403, 316 UNS S31600, and 316L UNS S31603 using the thyssenkrupp long-products composition rows; existing 304 profile retained.
- Added explicitly sourced reference density, elastic modulus, minimum strength and elongation, and thermal conductivity at documented 100 °C and 500 °C points. Missing test temperatures remain unknown; no melting value is invented without a scoped source.
- Added typed limited dimensional conversion, grade property category filter and UI context, regression tests, Chromium Playwright static-export browser tests with mocked providers and a separate non-blocking real-provider smoke test.
- See docs/EXPANDED_GRADE_PROPERTIES.md. Pending CI/Pages execution evidence at first commit.

### Expanded grade-property release evidence — 2026-10-31
- PR #12 merged to `main`: `27ca72c1ec8bad9d34e786471d18eb3d13fa54d0`.
- Standard validation passed (npm ci, TypeScript, ESLint, Vitest, static Next.js build): https://github.com/foxcyloxcy/periodic-table-calculator/actions/runs/41209018995
- Chromium Playwright workflow passed: https://github.com/foxcyloxcy/periodic-table-calculator/actions/runs/41209018989 (deterministic grade/filter/unit conversion UI, PubChem descriptor UI, plus live PubChem/Wikidata provider smoke). Live smoke is non-blocking in workflow and happened to pass in this run; repeat when investigating external outages.
- GitHub Pages production deployment passed: https://github.com/foxcyloxcy/periodic-table-calculator/actions/runs/41209151446
- Public site https://foxcyloxcy.github.io/periodic-table-calculator/ responds. Dynamic property sections require user search/interaction and do not appear in server-rendered static initial HTML.
- Reviewed sources: thyssenkrupp Materials North America long-product composition for 304/304L/316/316L; AZoM grade-specific typical physical and mechanical tables, and thyssenkrupp Materials UK grade melting intervals (304/304L 1400–1450 °C; 316/316L 1375–1400 °C).
- No universal formula for steel, no batch-specific chemistry, no undocumented measurement temperature or arbitrary interpolation. Grade property source licensing/attribution and expanded material coverage remain future reviews.

## 2026-10-31 — source provenance and element-property audit
- Introduced an **additive**, source-linked 118-element scientific audit registry: identity, CIAAW standard atomic weight, phase, electron configuration, electronegativity and classification each have independent confidence/review flags.
- Existing 118 element entries, labels, calculator and materials search remain intact. Superheavy phase properties are flagged predicted/uncertain rather than silently rewritten; 34 elements with unavailable standard atomic weights remain explicitly unavailable.
- Added periodic read-only IUPAC and CIAAW official-source fingerprint monitoring (no silent data updates), tests and docs/ELEMENT_PROPERTY_AUDIT.md. Independent field-by-field source review and metadata reuse licensing remain open.

## 2026-10-31 — Independent secondary element-property cross-check, representative batch
- Compared H, C, O, Fe, Au and Og across RSC's published element-level phase, configuration and Pauling electronegativity references. Kept source conditions and separate per-field statuses; no broad certification of all 118 elements.
- Recorded gold's electronegativity discrepancy (project/PubChem 2.54; RSC 2.4), not an automatic overwrite. Oganesson phase/config remain theoretical, not laboratory-confirmed.
- Source and scientific limitations documented in docs/INDEPENDENT_ELEMENT_PROPERTY_REVIEW.md, including need for future NIST ASD neutral ground-state review.
- Calculator, CIAAW weights and original periodic metadata unchanged. CI and deployment evidence to be recorded separately.
