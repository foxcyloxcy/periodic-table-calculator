# Formula ambiguity, compound identities, and lowercase typing

## Problem
The molar mass of C2H6O is computed from its atoms, but that molecular formula does not identify one compound. PubChem documents at least ethanol (CID 702) and dimethyl ether (CID 8254), both with the same molecular formula, different structures and properties.

## Official source and implementation
PubChem PUG REST docs: https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest

Formula search:
`GET https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/fastformula/C2H6O/cids/JSON?MaxRecords=8`
Property fetch:
`GET https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{ids}/property/MolecularFormula,Title,Charge,IsotopeAtomCount/JSON`
Canonical records: https://pubchem.ncbi.nlm.nih.gov/compound/702 and https://pubchem.ncbi.nlm.nih.gov/compound/8254

A tested browser-side adapter retrieves a limited number of exact-formula compound candidates. User-facing names and CID links come from PubChem at query time; we do not maintain a fixed C2H6O → ethanol or ether lookup. The CIAAW atomic-weight engine computes molar masses separately, independent of identity.

**Important:** the first eight CIDs are only a candidate subset, not an exhaustive set of isomers. Isotope/charge and hydrate formula matching is outside the present parser. Network and API-rate errors must be explicit and must never turn into guessed compounds.

## Case handling
Chemical symbols are case-sensitive: `CO` represents carbon + oxygen, while `Co` is cobalt. Forcing every typed letter to uppercase is scientifically wrong, so the UI accepts lowercase and uppercase entries, then reconstructs valid element-symbol casing from the CIAAW-supported element list.

- `c2h6o` → `C2H6O` (one supported interpretation)
- `feso4` → `FeSO4` (one supported interpretation)
- `co` → offers `CO` and `Co`; user must choose
- Correct case `Co` and `CO` is preserved.
- Invalid sequences remain invalid; there are no invented element symbols or numeric results.

Use bounded case candidate exploration and existing parser validation. Never treat lowercase normalization as chemical identification. For ambiguous candidates, make no numeric calculation until the user chooses.

## Verification
`src/lib/chemistry/formula-identity.test.ts` covers multiple independent PubChem isomers, source record links, equal formula-derived mass, rejected unsupported grammar, API failures, lowercase parsing, and Co/CO ambiguity.

Browser interactions with live PubChem and GitHub Pages CORS remain integration checks beyond mocked unit tests; no API secrets are required.

## 2026-11-08 — Formula ordering and clear controls

Live PubChem requests confirmed that `fastformula/NaCl` returns CID 5234,
whose documented molecular formula is `ClNa` and title is Sodium Chloride.
The old exact string comparison discarded this valid candidate. The adapter
now compares the existing parser's exact per-element integer counts, independent
of element order or explicit count-one spelling. Counts are never reduced to
empirical ratios. This establishes candidate compatibility only: all compatible
structures remain separate, with source CIDs and explicit user selection.

The formula property request also retrieves `Charge` and `IsotopeAtomCount`.
Only explicitly neutral, non-isotopic records with supported formulas qualify;
missing metadata, malformed formulas, charged records and isotope records are
excluded. This changes identity discovery only, with no change to CIAAW weights,
scientific calculation algorithms, or the curated naming registry.

The results show live identity candidates without first displaying a contradictory
“compound name not verified” local-catalog banner. Curated documented names still
appear where available. Lookup failures and timeouts remain visible; a timeout
ends loading while retaining the independently computed mass.

`Clear` beside the chemical formula empties the formula, calculation, selected
identity, errors, suggestions and capitalization choices, then focuses the input.
The material search has its own `Clear`, which empties its query/results/errors
and cancels an in-flight search without allowing its late response to restore
results or errors. Clearing either field does not reset the periodic table.

Regression coverage includes NaCl/ClNa/Na1Cl1, exact-count and metadata exclusions,
invalid input, multiple isomers, desktop/mobile formula clearing, ambiguous-case
clearing, search cancellation, lookup timeout, and a separate live NaCl smoke test.
