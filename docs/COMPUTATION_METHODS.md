# Computation methods and scientific acceptance criteria

Status: method specifications and test fixtures for future implementation; only the original neutral formula parser / molar-mass subset currently exists. This file is not proof that the new operations have shipped.

Each method has immutable ID, numerical algorithm, required source IDs, domain of validity, explainable trace, rejection cases and independent tests. The calculation engine returns results, never fixed lookup answers.

## CHEM-001 — Chemical formula composition
**Input:** unambiguous species formula, optional phase / ionic charge / isotopic labels in future grammar.
**Algorithm:** tokenization and recursive descent to abstract syntax tree; flatten exact nonnegative integer atom counts with checked arithmetic. Current neutral parser supports parenthesis groups only.
**Future hydrates:** explicit `·` component separator and multiplicity (e.g. `CuSO4·5H2O`), not a decimal point. Formula must distinguish hydrate stoichiometry from molecular identity. Example atom counts: Cu=1, S=1, O=9, H=10.
**Future ions:** parse separately encoded terminal charge (`SO4^2-`, `NH4^+`) without conflating formula digit 4 with charge. Preserve ionic identity and total charge.
**Invariants:** per-element counts agree with parsed AST; invalid symbols, zero multiplier, empty group, overflow, unsupported notation reject explicitly.
**References:** IUPAC nomenclature concepts; OpenStax chemical formulas; element identity CIAAW/IUPAC. Grammar and syntax are project-defined/versioned, not copied from an unvalidated external parser.

## CHEM-002 — Standard-composition molar mass
**Required:** formula atom counts `n_i`, approved elemental reference molar-mass coefficients `M_i` in g/mol and data policy.
**Method:** `M(formula) = sum_i(n_i * M_i)`.
**Output:** per-element count, selected reference weight, contribution, total g/mol, data version, precision, assumptions and (when available) range/uncertainty.
**Reference selection:** CIAAW-SAW-2024 for authoritative interval/fixed weights; CIAAW-ABRIDGED-2024 for labeled educational approximations. Under the 2019 SI definition, exact proportionality between relative atomic weight and molar mass needs careful attention to molar-mass constant rather than falsely claiming that every numeric g/mol value is physically exact; use explicit conventional approximations for introductory output.
**Unsupported:** element without a standard atomic weight unless a specifically identified isotope dataset/model is selected; no guessing.
**Example fixtures (abridged educational values):** H2O=18.015 g/mol; CO2=44.009 g/mol; Ca(OH)2=74.092 g/mol; Al2(SO4)3=342.132 g/mol. These are computation checks, not hardcoded production returns.

## CHEM-003 — Element mass fraction
**Input:** species formula, reviewed source weights.
**Method:** `massFraction_i = n_i * M_i / M(formula)`; percentage `100 * massFraction_i`.
**Invariants:** nonnegative weights, mass fraction sum ~= 1 within documented numerical tolerance; all inputs share one source policy/version.
**Unsupported:** ambiguous isotopic enrichment or missing reference weights.

## CHEM-004 — Ionic charge and empirical neutral formula
**Required:** explicit cation and anion identities and **known** integer ionic charge magnitudes `p > 0`, `q > 0`.
**Method:** `g=gcd(p,q)`, cation subscript `q/g`, anion subscript `p/g`, preserving polyatomic ion boundaries.
**Invariants:** `cationCount * p - anionCount * q = 0`; total coefficients minimal positive integers. Example: Al³⁺ + O²⁻ => Al2O3; Ca²⁺ + NO3⁻ => Ca(NO3)2.
**Rule:** if an element can form several ions (e.g. Fe²⁺ / Fe³⁺) demand a selected oxidation state or a known species; never choose arbitrarily. Charge balance is not proof a particular compound forms under given conditions.
**References:** IUPAC charge terminology, OpenStax ionic formula examples.

## CHEM-005 — Balanced chemical equation
**Required:** user-specified full reactants and products with parsed elemental compositions and ionic charges. No product guessing.
**Method:** build stoichiometric incidence matrix (element conservation rows and charge row), solve homogeneous nullspace via exact rational / integer arithmetic, derive smallest positive integer coefficients (GCD normalization), then independently verify conservation.
**Invariants:** each element and total charge conserved, all coefficients positive integers, no species substituted, reactant/product identity unchanged. Return unsupported or ambiguous if no physically meaningful positive solution or underdetermined alternative solutions.
**Example:** `Fe + O2 -> Fe2O3` => `4Fe + 3O2 -> 2Fe2O3`. Verify Fe=4 and O=6 on both sides. A balanced equation still does not prove reaction feasibility.
**References:** OPENSTAX-BALANCE, IUPAC-GOLD-STOICH.

## CHEM-006 — Amount of substance
**Input:** mass `m`, mass unit, valid molar mass `M`.
**Method:** `n=m/M`; `m=n*M`; `N=n*N_A` for specified entity. Use `N_A = 6.02214076 × 10^23 mol^-1` exact per BIPM.
**Invariants:** quantity must identify entity and unit; nonnegative valid sample amount; numerical units consistent.
**Reference:** BIPM-MOLE, BIPM-SI-2026.

## CHEM-007 — Limiting reagent / theoretical yield
**Input:** validated balanced equation, per-reactant available moles (or convertible quantities), selected target product; explicit excess or all limiting-reactant quantities.
**Method:** `reactionExtentMax = min_i(availableMoles_i / reactantCoefficient_i)`; `theoreticalProductMoles = productCoefficient * reactionExtentMax`; multiply by product molar mass for mass yield.
**Actual yield:** only computed from measured product; `percentYield = actual / theoretical * 100`.
**Invariants:** no negative amounts; product mass and consumed reactants consistent with atom conservation and selected stoichiometry; limits and assumptions disclosed.
**Example:** `2H2 + O2 -> 2H2O`; with 4.032 g H2 (2 mol) and >=31.998 g O2 (>=1 mol), theoretical water approximately 36.030 g using educational masses. Yield must be labeled theoretical, not measured.
**References:** IUPAC-GOLD-STOICH, OPENSTAX-STOICH.

## CHEM-008 — Future thermodynamics (not in next implementation)
**Inputs:** referenced phase-specific `Δ_f H°`, `S°` and appropriate temperatures/pressure/model validity.
**Example expressions:** `Δ_r H° = Σν(products)Δ_f H° - Σν(reactants)Δ_f H°`, `Δ_r G° = Δ_r H° - TΔ_r S°` when all inputs share a compatible reference state.
**Must reject:** missing property, incompatible reference state, unavailable phase or out-of-range empirical model.
**Reference:** NIST-WEBBOOK-SRD69; additional formal model citation and license approval required.

## Output trace for every method
Return `methodId`, `methodVersion`, normalized units/inputs, equation, evaluated substitutions, numerical value and unit, source IDs and data versions, source assumptions, warnings, precision/range when supported, and explicit `computed|invalid|unsupported|insufficient_input|ambiguous` status.

## Test architecture
- One independent benchmark fixture from trusted references per simple operation, then boundary, randomized/property-based and differential tests for broader coverage.
- Conservation of atoms/charge and dimensional consistency as **invariants**, not merely example outputs.
- Unsupported chemistry and insufficient conditions must have explicit negative tests.
- CI runs validation against pinned immutable data; changes to weights, precision or solver methods require intentional golden-fixture review, never automatic silent approvals.
