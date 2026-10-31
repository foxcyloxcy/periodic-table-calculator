# Expanded grade properties and browser validation

## Supported grade references
- Chemical composition limits for **304, 304L, 316 and 316L long products** come from thyssenkrupp Materials North America: https://www.thyssenkrupp-materials-na.com/materials/stainless-steel/chemical-composition-1.html. These are *independent published ranges and maxima*, never measured batch values. Existing 304 keeps its own source row.
- Reference physical/mechanical properties for 304/304L: https://www.azom.com/article.aspx?ArticleID=965
- Reference properties for 316/316L: https://www.azom.com/article.aspx?ArticleID=863

## Property treatment
The app labels each value with a **source, grade, typical/minimum status, unit and measurement context**. Density, elastic modulus and strength values are published reference summaries, not grade-specific laboratory certifications. Thermal conductivity at 100 °C and 500 °C are displayed as separate published points: **no interpolation or extrapolation**. Specific heat is a reference over a 0–100 °C range, not a value at arbitrary temperature. Test temperature for the mechanical reference table is not specified and remains **not specified** in the UI.

Unit conversion supports a narrow audited set: kg/m³ ↔ g/cm³ and MPa ↔ GPa. Original provenance and conditions remain unchanged. No melting temperature or melting range is shown when its precise provenance, grade and material state have not been independently verified. This is a *visible unavailable state*, not a guessed number.

AZoM's referenced property summaries are third-party published facts. Before expanding ingestion or redistribution, review any dataset licensing restrictions and original product/standard applicability.

## Browser end-to-end verification
- Playwright configuration: playwright.config.cjs and e2e/material-profiles.spec.cjs
- CI: .github/workflows/e2e.yml (Chromium, static export served under the actual GitHub Pages subpath).
- Deterministic mocked routes cover 316 grade visibility, filtering and density conversion, and a caffeine PubChem property result.
- A distinct **live** browser smoke checks that the user's browser can reach PubChem and Wikidata; provider availability and CORS remain external dependencies. Its CI step is non-blocking so an external outage cannot silently be mislabeled a regression. A failure must still be documented and addressed.
- Unit tests cover grade separation, source values, reference temperatures and dimensional conversions.

This milestone expands only known reference grade families. It does not implement arbitrary temperature interpolation, sample-specific density, steel heat-treatment inference, corrosion lifetime or exhaustive material indexing.
