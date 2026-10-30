# Periodic Table Calculator

A personal, explainable chemistry calculator built with Next.js 15 and TypeScript. The application includes a **clickable, searchable 118-element periodic table** with element details and a separate deterministic molar-mass calculation engine. It does **not** predict chemical reactions.

> **Status:** Source code and a reproducible lockfile are committed. The initial calculator passed CI; the new 118-element feature has its own pending validation. Element metadata is sourced from a pinned secondary snapshot and has not completed an independent field-by-field scientific audit. See [Project Status](docs/PROJECT_STATUS.md).

## Local development

### Requirements

- Node.js **22 LTS** and npm (npm 10+ recommended)
- Git
- Network access to the npm registry for first installation

### Clone and run

```bash
git clone https://github.com/foxcyloxcy/periodic-table-calculator.git
cd periodic-table-calculator
```

The implementation currently lives on the **feature branch**, not `main`. Until the pull requests are merged:

```bash
git fetch origin
git switch feat/m1-formula-mass-calculator
```

Install and start the development server:

```bash
npm ci
npm run dev
```

Visit **http://localhost:3000** in your browser. No API key or database is required for the current calculation route.

The committed `package-lock.json` pins dependency versions. Use `npm ci` for reproducible installation; use `npm install` only when intentionally updating dependencies, and commit the updated lockfile.

### Run checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Production mode (after a successful build):

```bash
npm run start
```

### Example calculation

Click an element to inspect it, search by element name, symbol or number, filter by family, or add its symbol to the formula input. A selected symbol does not imply any chemical reaction. Enter `Ca(OH)2`, select **Calculate**, and the result is computed from the element counts and rounded atomic weights:

```text
Ca(OH)2 = Ca × 1 + O × 2 + H × 2
         = 40.078 + 2(15.999) + 2(1.008)
         = 74.092 g/mol
```

Results are illustrative educational calculations using an abridged reference dataset. Precision, uncertainty, isotopic variation and dataset licensing require further verification before scientific/production claims.

### API

```bash
curl -s -X POST http://localhost:3000/api/v1/calculate \
  -H 'Content-Type: application/json' \
  -d '{"operation":"molar_mass","formula":"H2O"}'
```

Response contains status, formula, composition, numeric mass, units, per-element calculation steps, dataset version, source description, and assumptions. Invalid input returns HTTP 400; unsupported formula or elements return HTTP 422.

## Current limits

- The periodic table shows all **118 elements**. It uses a versioned secondary metadata snapshot; details are educational and not independently field-audited.\n- Only a separate **abridged 28-element** atomic-weight dataset is currently enabled for molar-mass calculations.
- Supports nested parentheses; rejects hydration dots, ionic charges, isotope notation and reaction equations.
- Reaction prediction/balancing, stoichiometry, thermodynamics, user accounts and deployment are not implemented.
- A formula does not prove a reaction will occur.
- No server-side rate limiter or scientific accuracy certification yet; do not publish as a production chemistry authority.

## Project architecture

```text
src/app/                             Next.js UI\nsrc/components/PeriodicTable.tsx      Clickable responsive 118-element explorer\nsrc/lib/chemistry/periodic-table.json Pinned 118-element educational metadata\nsrc/lib/chemistry/periodic-table.ts   Search and lookup functions
src/app/api/v1/calculate/route.ts     Validated HTTP boundary
src/lib/chemistry/calculator.ts       Pure chemistry computation
src/lib/chemistry/elements.ts         Version-tagged abridged atomic weights
src/lib/chemistry/calculator.test.ts  Parser and calculation tests
.github/workflows/ci.yml             Validation workflow
docs/                                 Contracts, roadmap, implementation status
AGENTS.md                             Developer / coding-agent instructions
```

The calculation kernel is intentionally independent of the UI and database so it can be reused by APIs or additional applications, profiled, and scaled later.

## Validation evidence

GitHub Actions run [41142432367](https://github.com/foxcyloxcy/periodic-table-calculator/actions/runs/41142432367) passed install, typecheck, lint, tests and build. The workflow generated and committed `package-lock.json`. A subsequent [reproducible-install run 41142580534](https://github.com/foxcyloxcy/periodic-table-calculator/actions/runs/41142580534) passed `npm ci`, typecheck, lint, unit tests and production build with read-only workflow permissions.

## Periodic-table dataset provenance\n\nThe 118-element display snapshot was normalized from [Bowserinator/Periodic-Table-JSON](https://github.com/Bowserinator/Periodic-Table-JSON) on 2026-10-31. The upstream file includes an unrecognized proposed 119th element; our ingestion deliberately **filters to officially recognized atomic numbers 1–118**. Group and position coordinates were retained from source. Radioactive/synthetic isotope mass numbers are **not** shown as standard atomic weights. Values present in the display snapshot remain labeled secondary/approximate. See [periodic table provenance](docs/PERIODIC_TABLE_DATA.md).\n\n## Scientific references

- [CIAAW abridged standard atomic weights](https://www.ciaaw.org/abridged-atomic-weights.htm)
- [CIAAW full standard atomic weights](https://www.ciaaw.org/atomic-weights.htm)

**Note:** These are references for auditing values and uncertainty, not proof that the bundled educational dataset has passed a complete independent provenance/license audit.

## Development notes

Read [AGENTS.md](AGENTS.md), [Project Status](docs/PROJECT_STATUS.md), [Architecture](docs/ARCHITECTURE.md), [Domain](docs/DOMAIN.md), [Calculation Contract](docs/CALCULATION_CONTRACT.md), [Roadmap](docs/ROADMAP.md), and [Engineering Standards](docs/ENGINEERING_STANDARDS.md) before implementation. Keep measured tests/deployments separate from plans.
