# Periodic Table Calculator

An evidence-backed, explainable chemistry calculation platform. **Status: architecture/planning only; no application or validated calculation engine is implemented yet.**

## Product promise
Select elements or enter substances/formulas, choose a supported calculation, provide required amounts and conditions, and receive a reproducible result with equation, substituted steps, units, assumptions, reference provenance, and confidence/limitation status.

Element selection alone cannot establish reaction products. Never equate formula balancing with reaction prediction. Never fabricate a product, numerical result, or reference source.

## Required reading
- [AGENTS.md](AGENTS.md) — contributor and coding-agent contract
- [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md) — verified built/not-built status and next work
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — modular architecture and scaling strategy
- [docs/DOMAIN.md](docs/DOMAIN.md) — authoritative chemistry concepts
- [docs/CALCULATION_CONTRACT.md](docs/CALCULATION_CONTRACT.md) — deterministic inputs/outputs and correctness policy
- [docs/ROADMAP.md](docs/ROADMAP.md) — staged delivery and acceptance gates
- [docs/ENGINEERING_STANDARDS.md](docs/ENGINEERING_STANDARDS.md) — quality, security, deployment, and governance

## Proposed stack (not installed)
Next.js + TypeScript web UI; isolated typed calculation modules; PostgreSQL only for persistent provenance, users, and history when needed. Avoid introducing distributed services, AI calls, or databases into the synchronous calculation path without measured need.

## Repository policy
Build narrow vertical slices; test against trusted chemistry reference values and conservation laws; store immutable formula/data provenance; version public API contracts. CI, hosted deployment, and live scientific data ingestion must be proven before being called complete.
