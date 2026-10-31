# Agent and developer contract

Read in order: README.md, docs/PROJECT_STATUS.md, docs/DOMAIN.md, docs/ARCHITECTURE.md, docs/CALCULATION_CONTRACT.md, docs/SCIENTIFIC_REFERENCES.md, docs/COMPUTATION_METHODS.md, docs/IMPLEMENTATION_SEQUENCE.md, docs/ENGINEERING_STANDARDS.md, docs/ROADMAP.md.

## Mission
Build an explainable chemistry calculator, not a generative answer engine. All numeric outputs must be computed by tested deterministic algorithms using versioned scientific reference values. Element selections are not proof of a chemical reaction.

## Non-negotiables
- Distinguish element, atom, substance, compound, mixture, equation, reaction, phase, conditions and amount. Do not silently turn elemental symbols into reactant molecular formulas.
- No fixed result lookup as a substitute for a general algorithm; curated reference constants, reaction records and validated rules are permitted if sourced and versioned.
- Never guess a reaction, thermodynamic value, oxidation state, product, or missing condition. Distinguish unsupported, ambiguous, invalid and numerically calculated outcomes.
- Preserve canonical units, dimensional consistency, significant figure policy, uncertainty when supported, provenance, algorithm and dataset versions, normalized inputs, assumptions and derivation steps.
- Validate inputs and computational limits server-side. Keep credentials server-side. Never let an LLM author an authoritative scientific result.
- Write unit, invariant, property-based, benchmark and negative tests before claiming scientific correctness.
- Maintain documented API contracts; reject unrecognized formula tokens, invalid charge, mass/quantity, or unsupported reaction models.
- Prefer narrow vertical slices and modular monolith first; add queues, worker services, caches or databases to the hot calculation path only with demonstrated demand.
- No deploy or production migrations without explicit authorization. Never claim a build, test, release, or source ingestion succeeded without actual evidence.

## Working agreement
For each change, record design rationale, files, tests executed/results, blockers, commits and next task in docs/PROJECT_STATUS.md. Add ADRs for consequential decisions. Check changes against existing modules and skills before adding dependencies. Avoid unreviewed external agent skills. Keep chemistry fixtures and provenance auditable.

## Mandatory computation reference governance
Use `docs/reference-sources.json` as the machine-readable index and `docs/SCIENTIFIC_REFERENCES.md` for scope and licensing review. Implement scientific algorithms only against the contract in `docs/COMPUTATION_METHODS.md`; follow acceptance gates in `docs/IMPLEMENTATION_SEQUENCE.md`. Every calculation module must identify source IDs, dataset/method version, assumptions and scientific benchmark results. A source marked `approvedForRuntime: false` is not approval to import its values into authoritative calculation paths. Never copy external page output as canned backend result.

## Compound names
Read `docs/COMPOUND_NAMING.md` before changing compound identity or formula-to-name resolution. A formula does not uniquely determine chemical identity. Names must be sourced and return a verified/unresolved status; never guess names using atomic composition alone. Compound identification is independent of mass calculation and must not affect numeric results. Do not infer aqueous acid naming from an anhydrous formula or treat hydrates as their anhydrous counterparts.

## Material identification searches
Before modifying external material-name lookup, read docs/MATERIAL_LOOKUP.md. PubChem returns candidate identity, name and formula only; calculations must remain pure and use CIAAW values. Never assume a food/mixture has one molecular formula, silently select a search candidate, fabricate a remote record or rely on PubChem's stored molecular weight for the authoritative result. Respect query limits, failures and provenance.

## Formula identity and capitalization safety
Read docs/FORMULA_ISOMERS_AND_CASE.md. Molecular formulas do not uniquely determine compounds. Show source-backed isomer candidates from PubChem, never select one by fiat. Do not uppercase all chemical symbols or treat Co and CO as equivalent. Case-insensitive user input must be resolved only into valid formula spellings, with user choice when ambiguous.

## Material discovery and taxonomy
Read docs/UNIFIED_MATERIAL_SEARCH.md before changing unified search. Differentiate element, compound candidate, verified mixture, alloy and broad material class. Wikidata taxonomy requires a traceable P31/P279 class path. A material description or a compound match does not establish a sample's actual formulation or a universal formula; never invent elemental fractions for mixtures or alloys. Keep independently sourced partial results when a provider fails.

## Verified material profiles and conditions
Read docs/MATERIAL_PROFILES.md. Properties MUST identify whether computed or measured/reported, units, source and original reference conditions (phase, temperature, pressure). Unknown conditions stay unknown. Supplier grade chemistry limits are ranges/maximum percentages, never a unique formula, sample composition or molar mass. Do not inherit 304 steel composition for ungraded steel. Independent external review and licensing remain necessary.
