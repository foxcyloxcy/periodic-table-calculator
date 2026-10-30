# Initial executable slice
Next.js App Router + pure deterministic TypeScript calculation module, API route and a minimal interactive entry form. Presently only formula molar mass is available; no interactive 118-element table, balances, reactions or production-grade reference ingest.
The current local element-weight dataset includes only 28 named elements; unsupported elements correctly error out. Hydrates, isotope notation, charge and phase suffixes intentionally reject pending explicit grammar.
The data version is illustrative, not externally verified or suitable for high-precision experimental use. Before release, pin a source-backed all-elements table (handle unstable/no-standard-weight elements explicitly), document licensing, source and precision and re-run independent benchmarks.
API POST /api/v1/calculate with {operation:'molar_mass',formula:'Ca(OH)2'}; success outputs computed mass, contribution steps, assumptions and dataset metadata; 400 on invalid JSON/schema; 422 on unsupported/invalid formulas.
No rate limiter yet (planned before public deployment); server-side formula bounds are active. No database in hot calculation path.
