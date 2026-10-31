# Unified chemical and material search

## Purpose
A single search field accepts a name and distinguishes **chemical elements, PubChem compound candidates, Wikidata-typed mixtures, alloys and broader material classes**. The output is source-linked and never invents a molecular formula or composition for a real-world sample.

## Data providers and authority
- **Elements:** the project's existing 118-element metadata snapshot with CIAAW 2024 standard atomic weights; https://www.ciaaw.org/atomic-weights.htm
- **Chemical compounds:** NIH PubChem PUG REST name/CID lookup and `MolecularFormula,Title` properties; https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest. Source for chemical identity/formula, not for the molar mass.
- **Material classification:** Wikidata MediaWiki API `wbsearchentities`, `wbgetentities`, and relationships **P31** (instance of) and **P279** (subclass of). https://www.wikidata.org/wiki/Wikidata:Data_access. Wikidata structured data is licensed CC0: https://www.wikidata.org/wiki/Wikidata:Licensing

## Resolution
1. Look for an exact element name/symbol in the local dataset.
2. Request PubChem candidate CIDs and their documented formula/title. For eligible formulas, compute atom counts, molar mass and mass-percent contributions using our own deterministic CIAAW engine.
3. Search Wikidata for **exact matching labels** and retrieve relevant P31/P279 class relationships, following up to three directed class edges (bounded by request limits).
4. Assign a source-evidenced type only if its class lineage contains Wikidata **Q37756 (alloy), Q169336 (mixture), Q214609 (material), Q2095 (food)**. Missing taxonomy shows `classification not verified`; **descriptive text alone cannot promote a record to a scientific category**.
5. For mixtures and alloys, show a link to the Wikidata record, description, classification evidence, and a notice that composition varies by sample/grade. **Never calculate a universal molecular mass, percent composition or fixed formula for a variable material**.
6. The user explicitly chooses a PubChem record to transfer its formula into the existing calculator. No automatic choice based on search ranking.
7. Both lookups use `Promise.allSettled`: if either service fails, keep any independent partial results and show which source is unavailable. Limit search results and request sizes to protect public APIs.

## Grounded examples
- `gold`: periodic-table element Au with CIAAW provenance
- `caffeine`: PubChem compound, formula C8H10N4O2, atom counts and derived composition
- `steel`: Wikidata item Q11427; P279 ferroalloy Q907347 → alloy Q37756. **No universal chemical formula**.
- `milk`: Wikidata Q8495, linked via type hierarchy to a food/material class. **No universal chemical formula**.
- `sugar`: PubChem may identify sucrose, but 'sugar' is also a family of carbohydrates; not a guaranteed unique substance in food samples.
- `concrete`, `gasoline`: if the provider has suitable records, present evidence and avoid a single fixed formula.

## Scientific and data limits
- Only PubChem formulas supported by the current neutral, non-isotopic parser and CIAAW element weights receive numerical results.
- The taxonomy is community-maintained; a missing or unreliable Wikidata statement is not evidence of absence. Records can be incomplete or inaccurate. Always expose the source and class path.
- Category and identity are distinct: a real-world specimen could be a formulation, a mixture, an alloy or a pure compound depending on its description and grade.
- This milestone does not calculate actual recipe, formulation, alloy composition, uncertainty or elemental fractions from a specific industrial sample. Future work requires grade-specific primary source data and composition ranges.
- Both providers are requested from the user's browser. Access depends on cross-origin requests, API uptime and rate limits. A later managed cache/proxy may be necessary for broad deployment.
- This search is discovery, not chemical reaction prediction; no LLM asserts chemical identity.

## Test and deployment evidence
Unit tests use mocked network responses and verify steel alloy classification through P279, milk classification conservatively, exact-label filtering, CIAAW-derived caffeine composition, no results, and partial provider errors. Also run npm ci, typecheck, lint, unit tests, and Next.js static build. Browser API integration and mobile accessibility require separate validation.
