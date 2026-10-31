# Periodic Table Calculator

A personal, explainable chemistry calculator built with Next.js 15 and TypeScript. The application includes a **clickable, searchable 118-element periodic table** with element details and a deterministic client-side molar-mass calculation engine. When a formula has a verified compound record, the results show a preferred name, common names, and its PubChem source. Unverified or ambiguous names are explicitly marked. It does **not** predict chemical reactions.

> **Status:** Source code and a reproducible lockfile are committed. The initial calculator passed CI; the new 118-element feature passed GitHub Actions validation (npm ci, typecheck, lint, tests and build) in [run 41143805722](https://github.com/foxcyloxcy/periodic-table-calculator/actions/runs/41143805722). Chemical atomic weights now come from an official CIAAW 2024 full/abridged snapshot (84 eligible values and 34 unavailable); other element metadata remain secondary and are not fully audited. See [Project Status](docs/PROJECT_STATUS.md).

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

All implementation milestones are now merged into `main`. The default branch is the recommended local starting point:

```bash
git switch main
git pull --ff-only
```

Install and start the development server:

```bash
npm ci
npm run dev
```

Visit **http://localhost:3000/periodic-table-calculator/** in your browser. No API key or database is required for the current calculation route.

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

### Expanded grade and condition-aware properties

Search **304L stainless steel**, **316 stainless steel** or **316L stainless steel** for exact supplier-sourced elemental mass-percent ranges. The grade cards also show sourced density, minimum strengths, elastic modulus and temperature-qualified thermal conductivity, with narrow audited unit conversion. Unverified melting ranges are explicitly unavailable, not invented. A Chromium browser suite exercises real UI behavior and separately attempts live PubChem/Wikidata access. See [expanded grade-property methodology](docs/EXPANDED_GRADE_PROPERTIES.md).

### Detailed source-backed material profiles

Compound search results can load PubChem structural descriptors (e.g. XLogP, topological polar surface area and hydrogen-bond counts), clearly labeled **computed, not measured**. Wikidata material density statements display supported quantities and any reference temperature, pressure and phase qualifiers (missing conditions are explicitly identified). A curated **304 stainless steel (UNS S30400, long-products)** profile shows supplier-published chromium/nickel percentage ranges and maximum impurity levels, with the specific source row linked. Generic steel and mixtures never inherit grade-specific mass percentages. See [Material Profiles](docs/MATERIAL_PROFILES.md).

### Unified chemistry and materials search

The search now checks three evidence sources: the local periodic table for element identity, **PubChem** for compound names/formulas, and **Wikidata** for material classes and verified mixture/alloy categories. For example, `steel` is identified as an alloy from its Wikidata P279 classification, but does **not** receive a fabricated fixed chemical formula. Search `caffeine` to retrieve a PubChem formula and compute elemental mass percentages using CIAAW values. `milk` is treated as a variable material/food, not a pure compound. The browser may return partial results when one source is unavailable. See [Unified Material Search](docs/UNIFIED_MATERIAL_SEARCH.md).

### Search by everyday material name

A separate **Search material** field accepts names such as `sugar` and queries the live [PubChem PUG REST service](https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest) for candidate identities and molecular formulas. Select a PubChem record to populate the calculator. For **table sugar (sucrose)**, PubChem documents `C12H22O11` ([CID 5988](https://pubchem.ncbi.nlm.nih.gov/compound/5988)). The app calculates atom counts, molar mass and elemental mass-percent composition **from its CIAAW dataset**—not stored result lookup. A generic term may refer to multiple substances or mixtures. Browsers must be able to reach PubChem; failures are shown, not silently replaced by fabricated records. See [material search documentation](docs/MATERIAL_LOOKUP.md).

### Search possible compound names from a formula

For a formula such as `C2H6O`, PubChem's live formula search identifies possible compounds including **ethanol** (CID 702) and **dimethyl ether** (CID 8254). These are structural isomers, so the formula alone does not identify one compound. Their molar mass is dynamically calculated from the same formula and CIAAW weights, while identity is sourced independently. The app displays candidate names and links instead of guessing.

The chemical formula input also accepts lowercased entries like `c2h6o` and `feso4` through chemically valid capitalization. It does not blindly uppercase letters: `Co` and `CO` mean different things; ambiguous `co` prompts the user to choose. See [formula identity and case policy](docs/FORMULA_ISOMERS_AND_CASE.md).

### Formula suggestions and element-click editor

Repeating an element click now increments the atom count, such as FeSO → FeSO2 → FeSO3 → FeSO4. Entering FeSOOOO offers FeSO4 as a suggestion for confirmation. Nearby reviewed formulas may also be suggested, with warnings if they change composition. Unknown symbols cannot be assigned invented atomic weights; plausible nearby recognized element spellings may be suggested for explicit confirmation. **The example formulas are not hardcoded numerical results.** See [Formula Assistance](docs/FORMULA_ASSISTANCE.md).

### Verified compound names

Enter `FeSO4`: the calculator dynamically computes its molar mass and displays **iron(II) sulfate** (commonly **ferrous sulfate**), linked to [PubChem CID 24393](https://pubchem.ncbi.nlm.nih.gov/compound/24393). `Fe2(SO4)3` shows **iron(III) sulfate**, also called **ferric sulfate**. Other curated records include `H2O`, `CaCO3`, and `Na2CO3`.

The formula parser and mass calculator remain independent of naming. Since a chemical formula may correspond to multiple substances, the app does **not** invent a compound name for every valid formula. For example, `C2H6O` is deliberately shown as **name not verified**; its molar mass still calculates. See [compound naming design and sources](docs/COMPOUND_NAMING.md).

### Example calculation

Click an element to inspect it, search by element name, symbol or number, filter by family, or add its symbol to the formula input. A selected symbol does not imply any chemical reaction. Enter `Ca(OH)2`, select **Calculate**, and the result is computed from the element counts and rounded atomic weights:

```text
Ca(OH)2 = Ca × 1 + O × 2 + H × 2
         = 40.078 + 2(15.999) + 2(1.008)
         = 74.092 g/mol
```

Results are illustrative educational calculations using an abridged reference dataset. Precision, uncertainty, isotopic variation and dataset licensing require further verification before scientific/production claims.

### Static-browser calculations

The browser calls `calculateMolarMass(formula)` from `src/lib/chemistry/calculator.ts`, producing computed values and explanation steps without a server. There is no POST API on GitHub Pages.

## Current limits

- The periodic table shows all **118 elements**. It uses a versioned secondary metadata snapshot; details are educational and not independently field-audited.
- The calculator now uses **84 eligible CIAAW 2024 abridged standard atomic weights** and rejects 34 elements without a standard atomic weight.
- Supports nested parentheses; rejects hydration dots, ionic charges, isotope notation and reaction equations.
- Chemical names are verified only for reviewed formulas; naming all possible compounds is not possible from elemental counts alone.
- Reaction prediction/balancing, stoichiometry, thermodynamics, user accounts and deployment are not implemented.
- A formula does not prove a reaction will occur.
- No server-side rate limiter or scientific accuracy certification yet; do not publish as a production chemistry authority.

## Project architecture

```text
src/app/                             Next.js UI
src/components/PeriodicTable.tsx      Clickable responsive 118-element explorer
src/lib/chemistry/periodic-table.json Pinned 118-element educational metadata
src/lib/chemistry/periodic-table.ts   Search and lookup functions
src/lib/chemistry/calculator.ts       Pure chemistry computation
src/lib/chemistry/elements.ts         CIAAW-sourced reference weight interface
src/lib/chemistry/calculator.test.ts  Parser and calculation tests
src/lib/chemistry/ciaaw-2024.json       Official CIAAW 2024 reference snapshot
src/lib/chemistry/ciaaw-2024.test.ts    118-element and 84-weight integrity tests
.github/workflows/ci.yml             Validation workflow
docs/                                 Contracts, roadmap, implementation status
AGENTS.md                             Developer / coding-agent instructions
```

The calculation kernel is intentionally independent of the UI and database so it can be reused by APIs or additional applications, profiled, and scaled later.

## Validation evidence

GitHub Actions run [41142432367](https://github.com/foxcyloxcy/periodic-table-calculator/actions/runs/41142432367) passed install, typecheck, lint, tests and build. The workflow generated and committed `package-lock.json`. A subsequent [reproducible-install run 41142580534](https://github.com/foxcyloxcy/periodic-table-calculator/actions/runs/41142580534) passed `npm ci`, typecheck, lint, unit tests and production build with read-only workflow permissions.

## Periodic-table dataset provenance

The 118-element display snapshot was normalized from [Bowserinator/Periodic-Table-JSON](https://github.com/Bowserinator/Periodic-Table-JSON) on 2026-10-31. The upstream file includes an unrecognized proposed 119th element; our ingestion deliberately **filters to officially recognized atomic numbers 1–118**. Group and position coordinates were retained from source. Radioactive/synthetic isotope mass numbers are **not** shown as standard atomic weights. Values present in the display snapshot remain labeled secondary/approximate. See [periodic table provenance](docs/PERIODIC_TABLE_DATA.md).

## Scientific computation references and implementation plan

The project's canonical source registry is [docs/SCIENTIFIC_REFERENCES.md](docs/SCIENTIFIC_REFERENCES.md) with a machine-readable companion [docs/reference-sources.json](docs/reference-sources.json). All planned formulas, prerequisites, failure conditions, and independent scientific tests are specified in [docs/COMPUTATION_METHODS.md](docs/COMPUTATION_METHODS.md). The implementation order and acceptance gates are in [docs/IMPLEMENTATION_SEQUENCE.md](docs/IMPLEMENTATION_SEQUENCE.md).

These documents **specify** references and algorithms, but do not mean those calculation engines or scientific datasets have been imported or certified yet. Reference records marked `approvedForRuntime: false` cannot be silently used as production computation inputs.

## GitHub Pages deployment

The project is configured for static export and a GitHub Pages Actions workflow. See [deployment guide](docs/GITHUB_PAGES_DEPLOYMENT.md) for activation, URL, limitations and deployment verification. All prerequisite PRs are merged into `main`. Pages publishing is **blocked until the repository owner enables GitHub Pages**: Settings → Pages → Source: GitHub Actions, then Actions → Deploy GitHub Pages → Run workflow. The static build and 33 tests passed but site creation was denied (`Resource not accessible by integration`); see the deployment guide. Do not assume the public URL is live.

## Scientific references

- [CIAAW abridged standard atomic weights](https://www.ciaaw.org/abridged-atomic-weights.htm)
- [CIAAW full standard atomic weights](https://www.ciaaw.org/atomic-weights.htm)

**Note:** These are references for auditing values and uncertainty, not proof that the bundled educational dataset has passed a complete independent provenance/license audit.

## Development notes

Read [AGENTS.md](AGENTS.md), [Project Status](docs/PROJECT_STATUS.md), [Architecture](docs/ARCHITECTURE.md), [Domain](docs/DOMAIN.md), [Calculation Contract](docs/CALCULATION_CONTRACT.md), [Roadmap](docs/ROADMAP.md), and [Engineering Standards](docs/ENGINEERING_STANDARDS.md) before implementation. Keep measured tests/deployments separate from plans.
