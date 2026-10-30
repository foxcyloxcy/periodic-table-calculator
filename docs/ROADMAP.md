# Milestones with evidence gates

## M0 — Foundation
Document contracts and architecture, review dataset usage rights, choose atomic-weight policy, set up workspace + strict TS + lint + CI + Vitest + dependency scanning. Done when checks actually run and are recorded.

## M1 — Trusted elemental foundation
Accessible periodic table for all 118 elements; verified properties with per-field provenance and missing-value semantics; parser + molar-mass + mass percent API and UI; authoritative fixtures, precision policy, negative tests. Done only after independently verified benchmark calculations.

## M2 — Balancing + stoichiometry
Formula/charge-aware exact balancing; explicit reactant/product input; limiting reagents, yield and conversions with traces. Fuzz tests, conservation checks and bounds against pathological input.

## M3 — Reaction explorer
Curated reaction records with applicability conditions, provenance and product alternatives. No arbitrary product prediction. Conditional result statuses, unsupported/ambiguous UI, model-specific tests and source review.

## M4 — Additional chemistry
Solutions, pH, gas laws and thermodynamics as separate independently validated plugins; phase/state/equilibrium assumptions mandatory where applicable.

## M5 — Production readiness
Accessibility/mobile/SEO, observability and alerting, performance and load testing, rate limits, operational runbooks, preview + production separation, backups only if persistent data is introduced.

## Non-goals until validated
Unrestricted reaction synthesis, laboratory safety recommendations, AI as sole chemistry authority, universal conditions prediction, large distributed microservice platform.

## PR acceptance
Small vertical changes, architecture contract preserved, relevant benchmark evidence, updated documentation, CI pass, security review, clearly stated unsupported cases.

## Detailed scientific calculation execution plan
See [SCIENTIFIC_REFERENCES.md](SCIENTIFIC_REFERENCES.md), [COMPUTATION_METHODS.md](COMPUTATION_METHODS.md), and [IMPLEMENTATION_SEQUENCE.md](IMPLEMENTATION_SEQUENCE.md). In particular, scientific-data field review and source licensing are **gates**, not follow-up paperwork. The 118-element display milestone is not equivalent to a certified all-elements molar-mass engine.
