# Periodic Table Calculator

A personal, explainable chemistry calculator built with Next.js 15 and TypeScript. The first implemented vertical slice **parses supported neutral chemical formulas and calculates molar mass dynamically**, with elemental contributions and the formula used. It does **not** predict reactions or currently provide a clickable 118-element table.

> **Status:** MVP source code and lockfile are committed; GitHub Actions has passed installation, type checking, lint, unit tests and build. The complete scientific dataset and production validation remain pending. See [Project Status](docs/PROJECT_STATUS.md).

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

Enter `Ca(OH)2`, select **Calculate**, and the result is computed from the element counts and rounded atomic weights:

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

- Only a small **abridged 28-element** atomic-weight dataset is bundled.
- Supports nested parentheses; rejects hydration dots, ionic charges, isotope notation and reaction equations.
- Clickable full periodic table, reaction prediction/balancing, stoichiometry, thermodynamics, user accounts and deployment are not implemented.
- A formula does not prove a reaction will occur.
- No server-side rate limiter or scientific accuracy certification yet; do not publish as a production chemistry authority.

## Project architecture

```text
src/app/                             Next.js UI
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

GitHub Actions run [41142432367](https://github.com/foxcyloxcy/periodic-table-calculator/actions/runs/41142432367) passed install, typecheck, lint, tests and build. The workflow generated and committed `package-lock.json`. Reproducible `npm ci` CI validation is being checked separately; don't treat it as passed until its workflow succeeds.

## Scientific references

- [CIAAW abridged standard atomic weights](https://www.ciaaw.org/abridged-atomic-weights.htm)
- [CIAAW full standard atomic weights](https://www.ciaaw.org/atomic-weights.htm)

**Note:** These are references for auditing values and uncertainty, not proof that the bundled educational dataset has passed a complete independent provenance/license audit.

## Development notes

Read [AGENTS.md](AGENTS.md), [Project Status](docs/PROJECT_STATUS.md), [Architecture](docs/ARCHITECTURE.md), [Domain](docs/DOMAIN.md), [Calculation Contract](docs/CALCULATION_CONTRACT.md), [Roadmap](docs/ROADMAP.md), and [Engineering Standards](docs/ENGINEERING_STANDARDS.md) before implementation. Keep measured tests/deployments separate from plans.
