# Material name lookup — PubChem PUG REST

## Goal
Users may enter familiar material or chemical names such as **sugar**, **sucrose**, **water**, or **ethanol** and review documented substance candidates, their chemical formulas, elemental atom counts, calculated molar masses and mass percentages. Search candidates must be **source-linked** and **user-selected**, never treated as proof a physical material sample is pure.

## Sources
- PubChem PUG REST API (official documentation): https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest
- PubChem Sucrose: https://pubchem.ncbi.nlm.nih.gov/compound/5988 — CID 5988, C12H22O11, synonyms include sugar/table sugar.
- CIAAW full and abridged standard atomic weights, 2024: https://www.ciaaw.org/atomic-weights.htm and https://www.ciaaw.org/abridged-atomic-weights.htm
- See `docs/SCIENTIFIC_REFERENCES.md` and `docs/REFERENCE_DATA_AUDIT.md` for source and uncertainty limitations.

## Architecture and provenance
1. User searches a **material name**. This is separate from the existing periodic-table *element* search and from the formula input.
2. Browser queries `/rest/pug/compound/name/{encoded}/cids/JSON` to resolve the supplied name or synonym into CIDs (max 8 accepted).
3. Browser queries `/rest/pug/compound/cid/{ids}/property/MolecularFormula,Title/JSON`; each candidate preserves PubChem CID and a direct reference URL. The API determines candidate formulas; no per-material formula/result map is bundled.
4. Our deterministic `calculateMolarMass` parses each returned formula, derives its composition, and sums the versioned **CIAAW 2024** element weights; mass fraction per element is `100 * (atomCount * atomicWeight) / molarMass`. These results are **computed**, never copied from PubChem's molecular-weight field.
5. Show **all returned candidates up to eight**, not an assumed unique chemical identity. Clicking a candidate transfers its formula to the existing calculator and preserves the source identity annotation.
6. If no match, unsupported formula grammar (ions, hydrates, isotope specifiers), lacking CIAAW weight or failed network/CORS/rate limit, show an explicit error/unsupported state. No invented values.

## Important chemistry distinction
Searching **sugar** resolves PubChem's commonly used term for **sucrose (table sugar)**, formula **C12H22O11**. However, 'sugar' can also refer to glucose, fructose and a whole class of carbohydrates, and **food products** may be mixtures with no single chemical formula. Search results are **possible interpretations**, not confirmation of actual sample identity or composition.

## GitHub Pages constraints
GitHub Pages is static and has no server-side proxy. The client calls PubChem directly from the browser. This needs a live connection to PubChem and cross-origin browser access; network or policy blocks are reported explicitly. Request count is bounded (one lookup to find CIDs, one property lookup) and only user-initiated submissions are performed, not keystroke-by-keystroke queries. If public browsing or rate limits become inadequate, a separate cached backend/proxy with proper usage-policy review will be needed. Never add keys to a client bundle.

## Test and acceptance criteria
- Mocked PubChem lookup returns sucrose CID 5988 and formula C12H22O11. Independent parser counts C=12, H=22, O=11, and mass-percent contributions sum to 100%.
- Multiple CIDs yield multiple explicit options.
- Unknown terms, invalid input, 429 and unsupported formulas are handled without unsupported numerical claims.
- Unit tests, TypeScript, lint and static build pass. Live-browser cross-origin checks are a separate integration requirement.
- Full compound-database coverage, language synonyms and distinguishing all isomers or mixtures remain out of scope.
