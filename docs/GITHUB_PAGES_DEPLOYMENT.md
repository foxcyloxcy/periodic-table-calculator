# GitHub Pages and scientific data deployment

## GitHub Pages feasibility
This repo is public, so it can be hosted as a static GitHub Pages site. Intended URL after successful publishing: https://foxcyloxcy.github.io/periodic-table-calculator/

GitHub Pages does not run Node.js or Next.js POST API routes. The calculator now calls the same pure deterministic TypeScript math in the browser. No scientific answers are hardcoded and no API key or database is required. Future auth, persistent accounts, paid external services or server-only calculations need a separately hosted backend.

## CI/CD flow
- `next.config.ts` sets `output: 'export'`, `basePath: '/periodic-table-calculator'`, unoptimized static images, and `trailingSlash: true`.
- `.github/workflows/ci.yml` checks npm ci, typecheck, lint, tests and build.
- `.github/workflows/deploy-pages.yml` runs on `main` and uploads the generated `out/` directory using official GitHub Pages Actions. A `.nojekyll` marker is added for Next assets.
- Deployment is intentionally main-only; feature PRs validate but never publish.

## Activate Pages
1. Merge all upstream PRs in dependency order (#1, #2, #3, #4, then the CIAAW/Pages PR) after reviewing test results.
2. Visit repository **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. Open **Actions → Deploy GitHub Pages** and confirm a successful run on `main`. Use **Run workflow** if necessary after Pages source has been configured.
4. Check https://foxcyloxcy.github.io/periodic-table-calculator/ and validate assets, element selection and molar mass with test inputs.

If GitHub Pages settings, billing, or permissions block publishing, the site is *deployment-ready source*, not live.

## Local run
```bash
git clone https://github.com/foxcyloxcy/periodic-table-calculator.git
cd periodic-table-calculator
git fetch origin
git switch feat/ciaaw-weights-github-pages
npm ci
npm run dev
```
Visit http://localhost:3000/periodic-table-calculator/. To verify export, run `npm run build` and inspect `out/`.

## Scientific source audit
The official CIAAW full and abridged standard atomic weight HTML tables were independently fetched and parsed by atomic number, symbol and name on 2026-10-31.
- 118 records total; 84 supported abridged numeric values with uncertainty; 34 unavailable standard weights.
- Full-table interval and reported value forms are preserved distinctly; an interval must not be silently converted into an exact single value.
- Official full table: https://www.ciaaw.org/atomic-weights.htm
- Official abridged table: https://www.ciaaw.org/abridged-atomic-weights.htm
- Records are bundled as `src/lib/chemistry/ciaaw-2024.json` (immutable runtime snapshot for this release).
- The calculator computes approximate educational molar masses using CIAAW abridged values and does **not** propagate atomic-weight uncertainties to final answers. These outputs should not be labeled exact.
- Other periodic-table property fields remain secondary-source and require field-level auditing.
- Complete independent manual per-entry review, redistribution/attribution conditions, and independent numeric benchmarking beyond current tests are not certified by automated parsing. Do not claim a full externally audited scientific release.

## API migration
The previous `POST /api/v1/calculate` route was removed to make the site exportable. If an API is needed later, keep the core pure and deploy a thin validated HTTP adapter separately, with a different service URL and explicit versioning.
