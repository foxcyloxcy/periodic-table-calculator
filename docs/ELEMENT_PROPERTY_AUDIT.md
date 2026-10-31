# Element property verification and revision policy

Reviewed: 2026-10-31. Scope: personal Element Calculator, 118 officially recognized elements.

## Official upstream references
- Element identity: [IUPAC periodic table](https://iupac.org/what-we-do/periodic-table-of-elements/). As of this audit, the recognized list runs from 1 through 118 (Og). Names 113, 115, 117 and 118 were approved in 2016. New-element rumors and synthesis attempts do **not** authorize adding a new identity.
- Standard atomic weights: [CIAAW Standard Atomic Weights 2024](https://www.ciaaw.org/atomic-weights.htm) and [abridged weights](https://www.ciaaw.org/abridged-atomic-weights.htm). The in-repo CIAAW-2024 copy retains 84 supported abridged weights and 34 unavailable standard weights.
- Secondary display metadata: [Bowserinator Periodic-Table-JSON](https://github.com/Bowserinator/Periodic-Table-JSON). Existing phase, electron configuration, electronegativity and element category display values are **not independently verified field-by-field**.

## Applied improvements
- `src/lib/chemistry/element-audit.ts` creates an explicit audit record for **every element** and attaches metadata for identity, standard atomic weight, phase, electron configuration, electronegativity and classification.
- Each property identifies its source, edition, review date, confidence, review status and caveat. Existing fields are not rewritten or removed.
- Superheavy elements (Z 104–118) receive a **predicted_or_uncertain** flag on their phase; superheavy electron configurations are explained as model-dependent. An existing snapshot `Solid` label for oganesson must not be treated as experimental confirmation of a solid phase.
- Weight entries with unavailable standard weights remain unavailable. No mass numbers are substituted and the calculation engine is unchanged.
- UI shows the individual confidence level and the review backlog rather than a misleading one-size-fits-all badge.

## What `official_reference_checked` means
It means the **source edition and status** have been reviewed, **not** that every decimal has been manually re-transcribed and independently certified. Keep the remaining audit status honest. The entire CIAAW-2024 import still needs systematic row-by-row comparison, ideally with separate reproducible source extraction and a scientific reviewer.

## Change control for new elements or new property editions
1. Inspect IUPAC's formal discovery/naming recognition and official latest chart. Do not add 119+ on the basis of laboratory proposals alone.
2. Compare CIAAW revision/edition and identify changed values, uncertainties, intervals, and missing-record status. Store old and new snapshots and independently review all changed entries.
3. Track per-property primary references, phase and test conditions; explicitly separate predicted vs measured.
4. Add tests for scientific regression and period/group placements. Keep changes isolated to reference updates, **never silently alter calculator values**.
5. Require source licensing, scientific validation, and CI review before deploying new reference data.

## Automated source check (monitor only)
`.github/workflows/element-reference-watch.yml` fetches the official IUPAC/CIAAW reference pages on schedule or manual dispatch and saves a **timestamped source fingerprint manifest** as a GitHub Actions artifact. HTML changes indicate **review needed**, not a confirmed scientific data change. The workflow never commits data, adds elements, or modifies calculations. Review the latest artifact against the prior run; no 'all values verified' label should arise from network success.

## Open independent verification backlog
- Compare every standard atomic weight, reported uncertainty, interval and note to the live official CIAAW table.
- Verify displayed electron configurations, electronegativities, phase at documented conditions and category definitions using authoritative primary sources for each field.
- Replace model-dependent/ambiguous properties with qualified data models only after evidence review. Add meaningful state-specific reference conditions.
- Audit license/attribution of the secondary metadata dataset.
- Establish review cadences and scientific sign-off for future reference changes.

## Tests
`src/lib/chemistry/element-audit.test.ts` asserts complete coverage, source links, no unrecognized 119, flags for superheavy properties, the absence of unofficial standard weights and that the calculator remains independent.
