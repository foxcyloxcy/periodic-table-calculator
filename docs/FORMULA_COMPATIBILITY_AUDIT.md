# Formula compatibility audit — 2026-11-08

## Scope and outcome

This milestone fixes compatibility across user notation, the existing atom-count parser, PubChem lookups and the result display. It preserves CIAAW 2024 weights and mass arithmetic, all 118 element identities and the five reviewed local naming annotations. It adds no runtime compound-answer table.

The previous NaCl fix shipped in PR #16 (merge `91cb5fe`), with 101 unit tests, nine deterministic browser tests and two live-provider tests passing. Release evidence: https://github.com/foxcyloxcy/periodic-table-calculator/pull/16.

## Supported and explicit unsupported cases

| Input class | Behaviour |
|---|---|
| H2O / H₂O | Same parsed atom counts and calculated mass; copied subscript digits are normalized and the result retains the original input |
| Ca(OH)2 / Ca(OH)₂ / nested parentheses | Parsed with existing grouping arithmetic; exact expanded counts are serialized for live identity search |
| NaCl / ClNa / Na1Cl1 | Same composition; no dependence on input element order |
| C2H6O | Multiple source-backed candidates remain separate user choices |
| co | Cobalt and carbon + oxygen remain distinct capitalization choices |
| CuSO4·5H2O / decimal or dotted notation | Explicit unsupported explanation; hydration water is never discarded |
| NH4+ / SO₄²⁻ / superscript isotope labels | Explicit unsupported explanation; no token deletion or fabricated neutral-species calculation |
| Square brackets / reaction equations | Explicit unsupported explanation |
| TcO2 | Recognized element without a standard atomic weight, requiring separately supported isotope calculations |
| Invalid syntax / unknown symbols | Invalid input, distinct from an unavailable provider or a valid formula with no returned identity |

## Formatting and identity method

`FORMULA-NOTATION-1`: trim outer whitespace and convert only Unicode subscript digits ₀–₉ to ASCII 0–9. No broad Unicode compatibility folding, superscript conversion, internal whitespace deletion or automatic charge/isotope removal. Chemical symbol capitalization is preserved; the separate bounded case-choice flow remains in place. `inputFormula` records the original trimmed entry and `formula` records the accepted normalized spelling.

`FORMULA-IDENTITY-COMPOSITION-2`: parse supported formulas with the same bounded neutral-formula parser used by mass calculation; serialize absolute atom counts in Hill order (C then H then remaining symbols when carbon is present, otherwise alphabetical). Request PubChem fastformula, fetch at most eight returned IDs with MolecularFormula, Title, Charge and IsotopeAtomCount, then compare exact counts. Never reduce counts to empirical ratios or infer structure/phase from composition. The expanded query is bounded to 128 characters. Numeric parser caps and nesting limits remain enforced.

Both formula and name search require explicit zero total charge and zero isotope-labelled atoms before computing standard-composition mass for a remote candidate. Unsupported name-search candidates retain their source identity/formula, with null numeric fields and a specific limitation. Missing metadata is not treated as zero. Records must match requested CIDs; duplicate IDs/rows are collapsed. Unreadable provider schemas are unavailable responses, not evidence that a compound does not exist.

Sources: NIH PubChem PUG REST https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest (MolecularFormula is documented in Hill order, with formal charge), and the unchanged CIAAW 2024 calculation dataset. Reference registry: `docs/reference-sources.json`.

## Published reference corpus

The test-only snapshot contains 20 PubChem identity records and 43 deliberate input spellings. Every record preserves its actual retrieval URL, CID, title, formula, charge and isotope count. All 20 retrievals succeeded. The snapshot is used only by tests and is not imported by production modules. It contains no stored molecular weights or precomputed runtime answers.

| Named reference | Published formula | Input variants | Source |
|---|---|---|---|
| water | `H2O` | `H2O`, `H₂O`, `OH2` | [CID 962](https://pubchem.ncbi.nlm.nih.gov/compound/962) |
| sodium chloride | `ClNa` | `NaCl`, `ClNa`, `Na₁Cl₁` | [CID 5234](https://pubchem.ncbi.nlm.nih.gov/compound/5234) |
| potassium chloride | `ClK` | `KCl`, `ClK` | [CID 4873](https://pubchem.ncbi.nlm.nih.gov/compound/4873) |
| sodium bicarbonate | `CHNaO3` | `NaHCO3`, `CHNaO3` | [CID 516892](https://pubchem.ncbi.nlm.nih.gov/compound/516892) |
| calcium hydroxide | `CaH2O2` | `Ca(OH)2`, `(OH)2Ca`, `Ca(OH)₂` | [CID 6093208](https://pubchem.ncbi.nlm.nih.gov/compound/6093208) |
| magnesium hydroxide | `H2MgO2` | `Mg(OH)2`, `Mg(OH)₂` | [CID 73981](https://pubchem.ncbi.nlm.nih.gov/compound/73981) |
| aluminum sulfate | `Al2O12S3` | `Al2(SO4)3`, `Al₂(SO₄)₃` | [CID 24850](https://pubchem.ncbi.nlm.nih.gov/compound/24850) |
| ammonium sulfate | `H8N2O4S` | `(NH4)2SO4`, `H8N2SO4` | [CID 6097028](https://pubchem.ncbi.nlm.nih.gov/compound/6097028) |
| calcium carbonate | `CCaO3` | `CaCO3`, `CCaO3` | [CID 10112](https://pubchem.ncbi.nlm.nih.gov/compound/10112) |
| sulfuric acid | `H2O4S` | `H2SO4`, `SO4H2` | [CID 1118](https://pubchem.ncbi.nlm.nih.gov/compound/1118) |
| hydrogen chloride | `ClH` | `HCl`, `ClH` | [CID 313](https://pubchem.ncbi.nlm.nih.gov/compound/313) |
| sodium hydroxide | `HNaO` | `NaOH`, `HNaO` | [CID 14798](https://pubchem.ncbi.nlm.nih.gov/compound/14798) |
| ethanol | `C2H6O` | `C2H6O`, `H6C2O` | [CID 702](https://pubchem.ncbi.nlm.nih.gov/compound/702) |
| dimethyl ether | `C2H6O` | `C2H6O`, `C₂H₆O` | [CID 8254](https://pubchem.ncbi.nlm.nih.gov/compound/8254) |
| acetic acid | `C2H4O2` | `CH3COOH`, `C2H4O2` | [CID 176](https://pubchem.ncbi.nlm.nih.gov/compound/176) |
| glucose | `C6H12O6` | `C6H12O6`, `C₆H₁₂O₆` | [CID 5793](https://pubchem.ncbi.nlm.nih.gov/compound/5793) |
| sucrose | `C12H22O11` | `C12H22O11`, `C₁₂H₂₂O₁₁` | [CID 5988](https://pubchem.ncbi.nlm.nih.gov/compound/5988) |
| caffeine | `C8H10N4O2` | `C8H10N4O2`, `C₈H₁₀N₄O₂` | [CID 2519](https://pubchem.ncbi.nlm.nih.gov/compound/2519) |
| iron(II) sulfate | `FeO4S` | `FeSO4`, `FeO4S` | [CID 24393](https://pubchem.ncbi.nlm.nih.gov/compound/24393) |
| copper sulfate | `CuO4S` | `CuSO4`, `CuO4S` | [CID 24462](https://pubchem.ncbi.nlm.nih.gov/compound/24462) |

The hydrogen chloride query returns PubChem's title “Hydrochloric Acid.” That is retained as source metadata in the test fixture, without inferring an aqueous phase or promoting HCl into the local reviewed-name registry. Runtime candidates retain explicit phase/sample-identity limits.

## Verification strategy and measured local evidence

- 209 Vitest cases across 16 files passed: 43 formula variants, 20 name-to-candidate paths, existing scientific/property regressions, provider and notation failures, and explicit missing-standard-weight cases.
- One invariant test exercises 128 deterministic generated compositions across order reversal, grouping multiplication, subscript formatting, Hill serialization and equal-mass transformations. Independent arithmetic benchmarks include NaCl, H2O, Ca(OH)2, Mg(OH)2, Al2(SO4)3 and NaHCO3.
- Reference atom counts are read from flat published formulas by a separate test-only token reader, rather than deriving expected grouped results with the production group parser.
- TypeScript, source lint and production static export passed. Lint retains the existing eslint.config.mjs default-export warning. Generated .next/out artifacts were excluded from the repeat source-lint command.
- The browser suite adds full UI checks at 1280px and 390px, explicit compound selection, isomer choice, unsupported syntax without network calls, provider rate-limit/malformed/offline states, and a live grouped-formula calcium hydroxide check. Remote CI results are recorded in the PR; these new browser cases are not claimed passed until that workflow succeeds.

## Remaining boundaries and next work

This is a compatibility audit, not certification of every chemical formula or database record. PubChem's first eight CIDs are a limited subset; filtering unsupported records can omit other valid matches beyond the window. Connectivity and public API limits still apply. No hydrates, ions, isotopes, square-bracket coordination notation, balancing or reaction prediction were implemented. Missing standard atomic weights, source licensing review, uncertainty propagation and independent secondary-property verification retain their existing status.

The next chemistry expansion is the separately specified hydrate/charge grammar milestone in `docs/IMPLEMENTATION_SEQUENCE.md`, with its own scientific fixtures and acceptance gates. The compatibility corpus should expand when a new notation class or provider response shape is supported. Reference fixture refreshes require source review; no upstream update changes production weights automatically.
