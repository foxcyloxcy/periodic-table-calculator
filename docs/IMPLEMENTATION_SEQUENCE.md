# Scientific computation milestones and implementation order

Current status: **plan**; existing implementation supports 118-element educational display and a 28-element neutral-formula molar-mass calculator, not all calculations listed here.

## Gate A — Approve data and computational source policy
1. Introduce machine-readable `reference_sources.json` manifest with source ID, URL, published version, SHA or immutable identifier, retrieval date, attribution/license status, scientific scope and review approval.
2. Review CIAAW-2024 atomic weights: all 118 elements, scalar/interval/uncertainty/no-standard-weight status. Manually compare import against authoritative table (two-person review or equivalent independent checks).
3. Distinguish isotope mass from standard atomic weight; keep missing standards null. Update UI display and calculator without using secondary display-source masses for computation.
4. Explicitly choose educational approximate numeric policy vs uncertainty-aware/range mode. Document round-off and significant figures.
5. Test 118 unique identities, all CIAAW statuses and source-version outputs; run library license review. **Exit:** audited dataset with evidence, not guessed weights.

## Gate B — Expand formula and molar-mass core
1. Replace existing 28-element weight table with reviewed provenance-backed records for every element with approved standard weights.
2. Maintain same deterministic calculation interface where possible; add typed `unsupported` result when a standard weight is missing.
3. Implement mass fractions and trace input, formula AST, atomic-weight record per term, output units, source version, rounding policy.
4. Reference-test examples and random compositions; compare against independent published compound examples (PubChem for cross-check only).
5. **Exit:** full reference coverage for eligible elements, no replacement values for elements without standards, tests and CI green.

## Gate C — Ionic and hydrate formula grammar
1. Adopt explicit published syntax contract and parser AST covering parentheses, hydrates, charges, and explicitly selected ion oxidation states.
2. Separate charge from atom count; avoid accidental interpretations such as `Fe3+` being three Fe atoms.
3. Derive neutral ionic empirical formulas by integer charge arithmetic only when charges are specified and supported.
4. Test nested groups, water of crystallization, ion charges, multivalent metals, invalid/ambiguous inputs and mass consistency.
5. **Exit:** independent unit/property tests, transparent explanation for each subscript, no guessed compound identity.

## Gate D — Balancing with exact integer/rational math
1. Parse **both** reactants and products; establish stoichiometric atom+charge matrix.
2. Solve exact rational nullspace to minimal positive whole-number vector, then independently assert every atom and total charge conserved.
3. Return ambiguous/unsupported for incompatible equations and underdetermined families, not invented species.
4. Test combustion, decomposition, multielement compounds, ionic equations, impossible balance and bounded solver performance.
5. **Exit:** validated conservation across independent reference fixtures and adversarial inputs.

## Gate E — Stoichiometry and limiting reagents
1. Convert amounts with units, derive mole ratios from validated reaction coefficients and compute limiting extent.
2. Calculate theoretical yields and distinguish actual measured yield and percent yield; show assumptions and per-step substitutions.
3. Add tests with multiple limiting reagents, excess, zeros, incompatible units, precision/uncertainty and product selection.
4. **Exit:** independent textbook examples, property-based mass/charge balance, safe limits, performance and CI.

## Gate F — Expanded domains, later
Only after the previous gates: solution chemistry, gas laws, thermodynamics from NIST, then condition-aware evidence-backed reaction catalog. No generic “select elements and predict products” feature without a curated dataset and independent scientific validation.

## PR review evidence required
- Code paths changed, source URL/version/license, exact scientific test fixtures, test command log, typecheck/lint/build status, data-diff, precision impacts, negative cases, user-visible limitations, rollback plan, and docs/PROJECT_STATUS.md update.
- Documented uncertainty must not be silently dropped.
- Never promote a new reference dataset just because CI compiles.
