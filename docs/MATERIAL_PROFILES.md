# Sourced material property profiles — scientific contract

## Implemented scope (2026-10-31)
A unified search result may include **source-attributed molecular descriptors, reported density statements and specific alloy-grade composition constraints**. Each value is typed, has a source URL, units, method, and context. No mixtures, industrial grades or food products are assigned universal molecular formulas or precise elemental percentages without a source-defined specification.

## Data sources
1. **PubChem computed compound descriptors** — official PUG REST property API: https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest. The user can explicitly load XLogP, TPSA, hydrogen-bond donor/acceptor counts, and rotatable-bond counts per PubChem CID. These are **computed descriptors**, not measured melting points, densities or thermal properties. Values and units come from the endpoint's documented field meaning. Temperature and pressure are not experimental settings for these 2D descriptors.
2. **Wikidata material reported density (P2054)** — https://www.wikidata.org/wiki/Property:P2054. The property requests temperature P2076 and phase P515 as qualifiers (pressure P2077 optional). Only recognized quantity units (kg/m³ or g/cm³) are shown; unsupported units are skipped. Qualifiers are displayed explicitly, with the original Wikidata Q identifier until a sourced unit/phase-label resolver is added. Missing qualifiers display **not specified**, never assumed "20 °C", "room temperature", or "1 atm". Wikidata values are *community reported*, not independently laboratory certified or automatically validated against original publications. Always inspect the linked statement before using experimentally.
3. **304 stainless steel / UNS S30400 long products** — published grade chemistry limits from thyssenkrupp Materials North America: https://www.thyssenkrupp-materials-na.com/materials/stainless-steel/chemical-composition-1.html. The **304** row (not `304 Project 70+`) gives chromium 18–20 mass %, nickel 8–12 mass %, with specified maxima for C, Mn, Si, S and P. These are **grade specification limits**, not a measured batch, composition midpoint, or source of "Fe remainder" actual mass %. Steel with no specified grade **must not** inherit these limits.

## Reliability and limits
- The source registry for grade specifications is intentionally small, versioned and explicitly named by alloy/UNS; users can search for 304 stainless steel or UNS S30400. Unlike PubChem lookups, **industrial composition specifications are curated source records**; hardcoding values with provenance is appropriate when a public API does not provide validated ranges. Numerical formula calculations remain independent.
- Supplier limits must not be treated as a unique formula, as each limit may be independent and extrema need not coincide. No molar mass or mass fraction of generic steel is calculated.
- PubChem computed descriptors are not equal to experimental phase-specific properties. NIST/WebBook experimental thermodynamic properties are future work requiring temperature, pressure, phase, source citation and uncertainty.
- Wikidata P2054 claims do not carry automatic certification. Verify original references, sample/phase and units, and surface missing qualifiers.
- Data from third parties may have redistribution/attribution terms; full legal and scientific provenance audit is pending. Avoid copying full proprietary datasheets into the repo.
- Browser fetches remain network and CORS dependent, and tests use mock responses; real-device integration remains a separate gate.

## Evidence / test requirements
- Grade-specific 304 composition matches a named supplier row; generic steel gets no grade profile.
- A PubChem CID can load molecular descriptors with correct provenance and calculated/experimental distinction; unavailable properties are omitted.
- Wikidata density preserves recognized units, temperature/phase/pressure qualifier identifiers; missing qualifiers are not synthesized.
- Invalid records and unsupported units are rejected.
- Type checking, lint, unit tests, Next.js static export, GitHub Pages deployment and published page inspection recorded in docs/PROJECT_STATUS.md after verification.
