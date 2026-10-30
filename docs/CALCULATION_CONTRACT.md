# Chemistry calculation correctness contract

## Operations, release order
1. Formula parsing and composition; molar mass and mass fraction.
2. Equation balancing with exact rational arithmetic and conservation/charge checks.
3. Stoichiometry and limiting reagent, provided fully specified substances, balanced equation and quantities.
4. Solution, acid/base and gas-law calculations only with explicit applicability assumptions.
5. Reaction discovery and thermodynamics only with evidence-backed curated rules/data and condition validation.

## Proposed API
POST /api/v1/calculate
Input: { operation, substances[], equation?, quantities[], conditions?, options? }.
Each quantity: { speciesId, value, unit }; conditions use typed units; do not accept ambiguous unitless physical values.
Success: { status:"computed", operation, canonicalInput, result:{value,unit,precision?,uncertainty?}, equation?, steps:[{formula,substitution,computedValue,unit,explanation}], assumptions:[], warnings:[], references:[{dataset,version,source,recordId}], engineVersion, requestId }.
Non-success: {status:"invalid"|"insufficient_input"|"ambiguous"|"unsupported", code, message, requiredInputs?, candidateModels?, requestId}. Do not return fake numeric zero.

## Numerical rules
- Use explicit unit conversions and dimensional checks.
- Formula lexer/parser must support parentheses, nested groups and hydration syntax by explicit grammar; reject invalid elements and malformed strings. Isotope/charge support must be versioned and tested before enabling.
- Mass calculations use stated atomic-weight policy; report rounding/precision, not unjustified exactness.
- Balance using integer/rational linear algebra and verify each atom and total charge independently; never assume unique reaction from balancing alone.
- For thermodynamic numbers, track phase, T, P, standard-state conventions, source and allowed extrapolation range. Do not quietly extrapolate.
- For yield, distinguish theoretical vs actual yield and require explicit limiting reagent logic.
- No LLM interpolation or formula generation in authoritative math.

## Example accepted (known specified reaction)
H2 + 1/2 O2 → H2O; given 4 g of H2 and excess O2, compute n(H2)=4/2.016 mol and m(H2O)=n×18.015 g, subject to referenced atomic-weight values and significant figures. This is a fixture illustrating formulas, not a cached result.

## Required independent tests
- H2O, CO2, Ca(OH)2, Al2(SO4)3, CuSO4·5H2O formula composition/molar-mass cases.
- Parenthesis depth, unknown symbols, zero/negative counts, charge notation and malformed formulas rejected appropriately.
- Reaction conservation, charge, coefficient normalization, redox counterexamples, underdetermined/ambiguous equations.
- Input units, precision, very large values, low magnitude, numeric overflow and deterministic results for same inputs/data version.
- Property-based atom/charge conservation and round-trip parsing; differential checks against trusted known reference examples.

## Output truthfulness
Always identify computed, externally sourced, assumed and unavailable quantities. Show the exact mathematical method and substituted values. “Unknown” is a valid scientific outcome.
