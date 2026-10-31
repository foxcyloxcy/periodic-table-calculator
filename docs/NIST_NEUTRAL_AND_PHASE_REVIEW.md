# Systematic neutral-atom and condition-aware phase review

Review date: 2026-10-31. This is **non-destructive**: no values are replaced in `periodic-table.json`, the CIAAW dataset, the chemistry calculator, material search or profiles.

## Source scope, editions and verification standard

1. **NIST compiled electronic configurations (H through U, Z 1–92)**, https://www.nist.gov/pml/atomic-reference-data-electronic-structure-calculations/atomic-reference-data-electronic-8 . A 92-row neutral-atom ground-configuration table sourced from NIST's Atomic Physics Division has been reviewed, checked for exact atomic number/symbol continuity and imported in `nist-neutral-configurations.json` as a compact citation-bearing comparison snapshot. This specific webpage is **not** a raw direct export from NIST ASD 5.12, so comparisons must not be described as a per-level 2024 ASD query.
2. **NIST Atomic Spectra Database 5.12**, https://www.nist.gov/pml/atomic-spectra-database , last content update November 2024, is the newer critically evaluated ground-state reference for future independent entry-level confirmation. https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html is its ground states/ionization form. The first 92 comparison values derive from the compiled NIST table above, not directly from version 5.12.
3. **RSC element records**, https://periodic-table.rsc.org/ , queried individually for 39 sample elements: atomic numbers 1–36 plus I (53), Hg (80), and Og (118). The `State at 20°C` fact is an explicit **20 °C** phase label without source-provided pressure. Numerical Pauling electronegativities, where reported, are a relative scale and not temperature-conditioned bulk measurements. `rsc-element-property-checks.json` stores only minimal source-comparison values and URLs; original complete pages are not redistributed.

## Outcome

- NIST compiled neutral ground state: **92/92 numeric electron-occupancy representations match** current display metadata after removal of insignificant spacing/leading asterisk. This confirms *cross-source string agreement*; it does not certify every configuration as experimentally observed.
- Elements 93–118 are **not covered** by this particular 92-row NIST table. A value for any of those 26 MUST NOT be extrapolated or shown as NIST-verified. Later transuranic/superheavy elements require their own critically evaluated, often model-dependent evidence.
- RSC phase at 20 °C: **39/39 display labels agree**. This does **not** establish phase at arbitrary temperature or pressure or exclude allotropes. Og is **theoretical**, even if the secondary labels match.
- RSC Pauling values: **Hg discrepancy**: existing `Hg` displays 2.0 while RSC lists 1.9. Our prior representative review also recorded **Au discrepancy**: current/PubChem 2.54 versus RSC 2.4. Neither value is automatically replaced. Retain each separate source and decide corrections only through scientific review.
- Missing RSC electronegativity values are labeled **unavailable** rather than assigned 0.

## How to read the UI

Element detail now includes `Systematic neutral-atom and reference-condition review` with separate current/source values, source link and status for configuration, phase and electronegativity. Other 118-element educational fields and all calculations remain intact. Unreviewed records clearly show **not covered** and the need for review.

## Scientific uncertainty and future audit

NIST ASD 5.12 gives critically evaluated data, but spectroscopy state assignment and neutral configuration versus ionic/excited configurations must not be conflated. For superheavy elements, use explicit predicted/theoretical flags with model information. RSC is a trustworthy scientific reference for cross-checking but isn't a substitution for primary phase diagram data that states sample/allotrope, pressure and temperature. The source did not specify pressure; never invent 1 atm.

Future work: automate bounded retrieval and cross-check of NIST ASD 5.12 neutral ground states where available; scrutinize remaining elements and predicted cases individually; expand phase checks to remaining RSC entries with careful source terms and field-by-field validation; investigate electonegativity differences in source methodology, adopted scale and measured quantities; review attribution and redistribution permission before broader imports or republication.

## Release/testing

Unit regression tests validate all 92 NIST identities and configurations, 39 RSC references and no modification of the molar-mass calculation. Browser E2E tests verify the source evidence, the Hg conflict and Og theoretical case. CI execution and deployment evidence belong in docs/PROJECT_STATUS.md.
