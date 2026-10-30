# Periodic table source, fidelity and review policy
Last imported: 2026-10-31
Status: 118 metadata records checked for completeness, unique atomic number/symbol, and non-overlapping grid positions. **Not an independent scientific field-level audit.**

## Snapshot origin
- Source file: https://github.com/Bowserinator/Periodic-Table-JSON/blob/master/PeriodicTableJSON.json
- Upstream project README: https://github.com/Bowserinator/Periodic-Table-JSON (states data may be used in projects; downstream must review upstream provenance and usage terms before commercial redistribution)
- Reference authority for **standard atomic weights**: CIAAW 2024 https://www.ciaaw.org/atomic-weights.htm
- Pinned project snapshot: `src/lib/chemistry/periodic-table.json`, 118 entries
- Snapshot provenance label: `bowserinator-snapshot-2026-10-31`. This is a calendar snapshot label, not an upstream source commit hash (a future ingestion improvement must pin that SHA).
- The upstream source currently contains an **unrecognized 119th entry** for Ununennium. That record was explicitly excluded because the recognized table currently contains 118 elements.

## Display vs calculation values
- `approximateAtomicWeight` is **secondary-source presentation data only**. It must never be used as an authoritative molar-mass input until independently verified and approved through the chemistry-core reference rules.
- For 34 elements without an established standard atomic weight (e.g. Tc, Pm, Po, transuranics), `approximateAtomicWeight` is null. The original source's integer isotope mass number must never silently appear as a standard atomic weight.
- The existing molar-mass engine keeps its separately versioned 28-element educational weight map. Unsupported elements fail explicitly.
- Properties such as electronegativity, electron configuration, phase, category and periodic-table coordinates are curated upstream and may include modeled, uncertain, unknown or nomenclature-dependent values. Avoid representing them as experimentally certified.
- Source property definitions and units must be reviewed before displaying further numeric fields.

## Current validation
- 118 unique numbered elements, H→Og;
- no 119th element;
- unique placement per grid coordinate;
- no-standard-weight flags tested;
- search by name/symbol/atomic number/category;
- UI is keyboard-operable and scrollable.

## Outstanding before scientific release
1. Pin upstream commit SHA and record upstream license/attribution for each field.
2. Verify all element identity and periodic positions against IUPAC.
3. Audit every weight against CIAAW including intervals, uncertainties, standard-weight availability and review year; do not equate simple atomic masses with conventional standard weights.
4. Audit other numeric fields against PubChem/NIST primary references with units, temperature/pressure basis and uncertainty.
5. Add field-specific evidence status to the data model and a systematic update process.
6. Complete accessibility and browser/mobile interaction testing; unit/CI tests alone do not prove UX quality.
