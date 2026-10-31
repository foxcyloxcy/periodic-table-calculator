# Independent review of secondary element properties

Checked: 2026-10-31. Scope: **six sampled elements**, not certification of all 118. Existing element JSON, CIAAW atomic weights and molar-mass calculation behavior remain unchanged.

## Evidence and methodology

The six representative element records H, C, O, Fe, Au, Og were checked against the [Royal Society of Chemistry individual element pages](https://periodic-table.rsc.org/) for: electron configurations of neutral atoms, Pauling electronegativity and published phase/state at **20 °C**. RSC phase fact boxes did **not specify pressure**, so the app does not assert 1 atm or 100 kPa. Electron-config notation is compared after harmless whitespace and leading model-asterisk normalization; spin-orbit/heavy-element physical interpretation still needs independent primary-level review.

The RSC is an independent professional scientific publisher rather than an original experimental paper. Comparisons to RSC **are cross-source agreement checks**, not independent primary-experiment verification. For a critical primary-evaluated atomic reference, [NIST ASD version 5.12](https://www.nist.gov/pml/atomic-spectra-database) provides critically evaluated atomic energy levels and ground states (last data content update November 2024). Direct NIST neutral ground-state entry-by-entry comparisons are the **next review stage**; they are not falsely marked completed here. Pauling electronegativity is an empirical relative scale, not an element's invariant experimentally measured thermodynamic property.

### Reviewed cases
- Hydrogen: https://periodic-table.rsc.org/element/1/hydrogen
- Carbon: https://periodic-table.rsc.org/element/6/carbon
- Oxygen: https://periodic-table.rsc.org/element/8/oxygen
- Iron: https://periodic-table.rsc.org/element/26/iron
- Gold: https://periodic-table.rsc.org/element/79/gold
- Oganesson: https://periodic-table.rsc.org/element/118/oganesson

### Known source disagreement: Gold
The repository's gold electronegativity is **2.54** on the Pauling scale. The RSC gold page reports **2.4**; [PubChem's Pauling table](https://pubchem.ncbi.nlm.nih.gov/periodic-table/electronegativity/) independently reports **2.54**. This is a real **source disagreement**, NOT grounds to silently choose or overwrite the stored value. The UI shows both numbers and opens the original source. A scientific reviewer should establish dataset provenance, reference conventions, whether historical adopted values differ, and whether a source-specific display is preferable before changing any data.

### Oganesson warning
RSC displays “Solid” at 20 °C but has no experimentally determined phase transition temperature for Og. Only a few atoms have been synthesized. Even if the table labels agree, **matching a theoretical value is not experimental confirmation of a bulk solid**. Both phase and configuration remain flagged `theoretical`, and the electronegativity value is `unavailable`.

## Audit quality controls
- `independent-property-review.ts` is an **additive** source-comparison registry, showing display value, source value, comparison status, exact source URL, review date and reference conditions per property.
- Unreviewed elements remain **pending**; no success status is copied across all 118 by inference.
- Existing all-element provenance flags and the IUPAC/CIAAW read-only monitoring workflow are preserved.
- No calculations, element identities, atomic weights, secondary metadata or compound/material profiles have been rewritten.
- Unit regression tests assert six explicit source records, Au discrepancy, Og theoretical status and unchanged calculator behavior.

## Next verification batches
1. Ground-state configurations: systematically cross-check NIST ASD neutral atoms with state/ion/term notation and its evaluation status. Do not conflate theoretical configurations for superheavy elements with measured ground states.
2. Phase: identify the particular allotrope, pressure, temperature and whether predicted or observed; reject an unqualified claim that every solid/gas snapshot is a universal phase.
3. Electronegativity: specify named scale, method/version, record missing values and source disagreement, and conduct a per-record cross-source comparison with explicit tolerance and review signoff.
4. Validate external data licenses before bulk-importing RSC, NIST or PubChem tables. Linking individual sources with brief reference data is not an automatic blanket permission to republish entire datasets.
