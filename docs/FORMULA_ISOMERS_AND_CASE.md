# Formula ambiguity, compound identities, and lowercase typing

## Problem
The molar mass of C2H6O is computed from its atoms, but that molecular formula does not identify one compound. PubChem documents at least ethanol (CID 702) and dimethyl ether (CID 8254), both with the same molecular formula, different structures and properties.

## Official source and implementation
PubChem PUG REST docs: https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest

Formula search:
`GET https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/fastformula/C2H6O/cids/JSON?MaxRecords=8`
Property fetch:
`GET https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{ids}/property/MolecularFormula,Title/JSON`
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
