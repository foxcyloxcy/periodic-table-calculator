# Scientific computation source registry

Status: **approved references for design and test planning, not a certification of imported data**.
Reviewed: 2026-10-31. Maintainer scope: personal `foxcyloxcy/periodic-table-calculator` only.

## How to use this file
Every calculation module MUST declare a `methodId`, `methodVersion`, source references (including URL and access/version date), required inputs, applicability domain, numerical representation, assumptions, and independent validation cases. Never confuse a published formula or a textbook example with a licensed, production-ready machine-readable dataset. Source versions must be pinned in the import manifest. An LLM cannot approve or override a computed result.

## Reference registry (priority is property-specific)

| ID | Reference | URL | Authorized proposed use | Verification and reuse status |
|----|-----------|-----|-------------------------|-------------------------------|
| CIAAW-SAW-2024 | CIAAW Standard Atomic Weights 2024 | https://www.ciaaw.org/atomic-weights.htm | Canonical standard atomic-weight entries, intervals, uncertainty, notes, and explicit absence | Authoritative page checked; full 118-record transcription, citation and reuse review **pending** |
| CIAAW-ABRIDGED-2024 | CIAAW Abridged Standard Atomic Weights 2024 | https://www.ciaaw.org/abridged-atomic-weights.htm | Educational conventional rounded weights, explicitly flagged approximate and uncertainty-aware | Page checked; no machine-readable dataset imported in this change |
| IUPAC-GOLD-MOLAR-MASS | IUPAC Gold Book: molar mass | https://goldbook.iupac.org/terms/view/12214/html | Meaning of molar mass and mass per amount | Definition checked; text reuse/licensing review required |
| IUPAC-GOLD-STOICH | IUPAC Gold Book: stoichiometry | https://goldbook.iupac.org/terms/view/S06026 | Definitions and coefficient-to-mole relationships | Definition checked; not a reaction/product prediction database |
| BIPM-MOLE | BIPM SI base unit: mole | https://www.bipm.org/en/si-base-units/mole | Exact Avogadro constant, entity counting, molar units | Exact SI defining constant checked |
| BIPM-SI-2026 | BIPM SI Brochure 9th ed. (2026 update) | https://www.bipm.org/en/publications/si-brochure | Unit dimensions, prefixes, conversions, rounding conventions | Source checked; BIPM states CC BY 4.0 for brochure |
| OPENSTAX-BALANCE | OpenStax Chemistry 2e §4.1 | https://openstax.org/books/chemistry-2e/pages/4-1-writing-and-balancing-chemical-equations | Known reference examples and atom-conservation method | Educational validation only; review reuse terms and avoid copying large passages |
| OPENSTAX-STOICH | OpenStax Chemistry 2e Ch.4 summary | https://openstax.org/books/chemistry-2e/pages/4-summary | Stoichiometry, limiting reagent, theoretical/actual yield distinctions | Educational validation only |
| PUBCHEM-PUG-REST | PubChem PUG REST API | https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest | Compound identity/charge/formula independent cross-check and later compound-specific data | API docs checked; usage limits, license/attribution and field definitions must be reviewed |
| NIST-WEBBOOK-SRD69 | NIST Chemistry WebBook | https://webbook.nist.gov/chemistry/guide/ | Future evaluated thermochemistry/phase-specific reference records | Guide checked; data reuse and reference-specific licensing pending |
| PERIODIC-DISPLAY-SNAPSHOT | Bowserinator Periodic-Table-JSON (secondary) | https://github.com/Bowserinator/Periodic-Table-JSON | Current UI layout, name, symbols, metadata ONLY | Imported 118-entry educational display snapshot; upstream SHA/field licenses and independent audit pending. **Not authoritative for molar-mass calculations** |

## Source policy, by kind of value

1. **Standard atomic weights**: CIAAW full table is authoritative for normal material. Abridged values may be used only for clearly labeled approximate education output. Some weights are intervals, not a single universal number. Elements without a standard atomic weight receive `no_standard_atomic_weight`, never a substituted integer mass number.
2. **Isotopes**: isotopically specified molar masses require independently validated isotope masses and isotope-abundance assumptions from a separately approved dataset. Current calculator must reject isotope syntax.
3. **Element identity**: IUPAC and CIAAW for atomic numbers/names/weight identity; the current third-party display file cannot establish scientific correctness on its own.
4. **Compound identity**: PubChem may confirm a named compound or formula but a formula string alone does not prove compound existence, structure, purity or reaction feasibility.
5. **Ionic compounds and charges**: parse user-specified ionic species and charge; use charge conservation and evidence-backed ion identities/oxidation states, not universal guessed valence.
6. **Thermodynamic values**: NIST values must be indexed by chemical identity, phase, pressure, temperature/reference state, units, uncertainty and source citation. Never extrapolate outside a model's valid range without documented method and user-visible qualification.
7. **Reaction products**: no source above permits unconditional inference of products from selecting element buttons. Prediction requires a separate curated reaction database, evidence, conditions and alternatives.

## Per-field provenance record (proposed contract)

```ts
type ReferenceRecord = {
  sourceId: string;          // source registry ID
  sourceVersion: string;     // e.g., CIAAW-2024 or a precise upstream SHA
  recordId: string;          // atomic number / compound ID / measured property
  sourceUrl: string;
  retrievedAt: string;       // ISO UTC date
  property: string;
  numericValue?: string;     // decimal string, when scalar exists
  interval?: {low: string; high: string};
  uncertainty?: {value: string; kind: string};
  unit?: string;
  status: 'verified' | 'secondary_unverified' | 'not_applicable' | 'missing';
  notes?: string[];
};
```

Store source snapshots and their SHA-256 hashes in a reviewed import manifest. Do not fetch remote sources per request in the hot calculation path. Versioned reference updates require code review and independent validation.

## Publication and license gate
Confirm each data provider's redistribution and API-use permissions, attribution requirements, commercial-use allowances, rate limits and per-field rights before vendoring or exposing content. Link the original references. The fact that a page can be viewed publicly does not establish permission to redistribute an entire dataset. Licensing review is **open**, not complete.
