# Compound names and chemical identity (MVP)

## User goal
When a user calculates `FeSO4`, show the **preferred name iron(II) sulfate** and the common name **ferrous sulfate**, in addition to the computed molar mass, formula, and calculation steps.

## Core distinction
- **Numeric mass calculation**: derives stoichiometric composition from the formula and CIAAW atomic weights; independent of naming data.
- **Compound identity**: a separate *evidence-backed annotation* from PubChem or later reviewed sources, not a mathematical consequence of element counts.
- **Unknowns**: a chemical formula may map to structural isomers, hydrates, different oxidation states, or multiple substances. The engine must show `Name not verified` rather than assert an identity.
- **Phase/solvent matters**: `HCl` alone is not enough to call a sample 'hydrochloric acid' (aqueous hydrogen chloride); `FeSO4` is anhydrous iron(II) sulfate, not ferrous sulfate heptahydrate.
- **Does not prove reaction**: a formula/name match does not establish a chemical reaction or that the selected elements form the named compound.

## Current curated records
| Input | Preferred name | Other common name | Reference |
|---|---|---|---|
| FeSO4 | Iron(II) sulfate | Ferrous sulfate | https://pubchem.ncbi.nlm.nih.gov/compound/24393 |
| Fe2(SO4)3 | Iron(III) sulfate | Ferric sulfate | https://pubchem.ncbi.nlm.nih.gov/compound/24826 |
| H2O | Water | — | https://pubchem.ncbi.nlm.nih.gov/compound/962 |
| CaCO3 | Calcium carbonate | — | https://pubchem.ncbi.nlm.nih.gov/compound/10112 |
| Na2CO3 | Sodium carbonate | Soda ash | https://pubchem.ncbi.nlm.nih.gov/compound/10340 |

Only exact normalized input-formula spellings are recognized. Names are not deduced from elemental composition, and equivalents with different ordering require future structural identity normalization; `FeO4S` remains unresolved intentionally. PubChem is used for names, **not** for calculating our molar masses.

## Implementation interface
`resolveCompoundName(formula)` returns `{status:'verified',preferredName,commonNames,source,sourceId,sourceUrl,note}` or `{status:'unresolved',note}`.

The result is part of `calculateMolarMass` so later operation modules can consistently attach identity annotations. Future modules must reuse the same resolver and only apply a name if their underlying species identity contract supports it.

## Next expansion gates
1. Import/validate a larger authorized compound registry with exact formula, CID, structure identifier, charge, hydrate state, aliases, provenance, source version, and ambiguity index.
2. Add verified rule-based ionic nomenclature only when ion identities, oxidation numbers and charges are **explicitly determined**. Never infer variable-valence metals from simple formula matching without a validated ion model.
3. Distinguish molecular formula, empirical formula, structure, isotope, hydration and phase; support multiple candidate compounds or unresolved status.
4. Test isomers (e.g. C2H6O), different compound formulas sharing composition, ion/hydrate ambiguity, source aliases and non-unique identity.
5. Include source attribution and dataset provenance in calculation output; preserve source link and confidence boundary in UI.

## Scientific sources and limitations
- PubChem: https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest
- PubChem formula searching alone does not distinguish molecular structure, stereochemistry, charge, or isotope status: https://pubchem.ncbi.nlm.nih.gov/docs/structure-search
- The registry entries were manually chosen from published PubChem names/compounds; they are **not** a proof of chemical identity for a user sample.
- No live API call is needed: GitHub Pages uses a statically bundled reviewed name registry. Update records only after source review.
