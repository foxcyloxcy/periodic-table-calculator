# Reference-data audit — initial MVP
Reviewed: 2026-10-31
Status: **partial verification, not a production scientific certification**.

## Primary references
- CIAAW, **Abridged Standard Atomic Weights 2024**: https://www.ciaaw.org/abridged-atomic-weights.htm
- CIAAW, **Standard Atomic Weights 2024**: https://www.ciaaw.org/atomic-weights.htm

## Benchmark elements checked
The current educational dataset uses approximately these CIAAW abridged values, where appropriate:
| Symbol | Current value | CIAAW abridged context |
|---|---:|---|
| H | 1.008 | 1.0080 ± 0.0002 |
| C | 12.011 | 12.011 ± 0.002 |
| O | 15.999 | 15.999 ± 0.001 |
| Ca | 40.078 | 40.078 ± 0.004 |
| Al | 26.982 | 26.982 ± 0.001 |
| S | 32.06 | 32.06 ± 0.02 |

The calculator uses conventional rounded numbers, not propagated source uncertainties. Molar masses from ordinary terrestrial atomic weights are approximate, not exactly measured constants; isotopic composition can vary.

## Current computed fixtures
- H2O: 2×1.008 + 15.999 = 18.015 g/mol
- CO2: 12.011 + 2×15.999 = 44.009 g/mol
- Ca(OH)2: 40.078 + 2×(15.999+1.008) = 74.092 g/mol
- Al2(SO4)3: 2×26.982 + 3×(32.06 + 4×15.999) = 342.132 g/mol

## Remaining audit gates
- Compare **every** element entry to a pinned CIAAW dataset, including each source's provenance, license/attribution, precision, interval and uncertainty.
- Build 118-element metadata without inventing conventional atomic weights for radioactive/synthetic elements for which none is specified.
- Add independent external fixture review and higher precision/uncertainty policy before production scientific claims.
- Ensure API response provenance identifies dataset citation and uncertainty limitations rather than claiming experimental-grade precision.

## 2026-10-31 CIAAW full/abridged import
The original 28-element runtime table is superseded in the feature branch by `src/lib/chemistry/ciaaw-2024.json`, parsed from both official CIAAW 2024 pages. The import preserves standard availability, scalar/interval classification, abridged numeric value/uncertainty, source edition and notes. Integrity tests cover 118 identities, 84 eligible/34 unavailable, and representative revised 2024 values. **Automated structural verification does not equal an independent manual field-by-field audit or confirmed redistribution license.** Exact SI molar mass interpretation, interval propagation and significant-figure policy remain future improvements. See `docs/GITHUB_PAGES_DEPLOYMENT.md`.
