# NumPy Nebula: Reboot the Colony Ship

NumPy Nebula is a browser-based educational game for beginner data science learners. Players repair a damaged colony ship by writing real Python and NumPy in a guided console, then reading the results through a live array inspector and ship-map progression system.

## What is in the prototype

- Real in-browser Python + NumPy execution through Pyodide
- Seven guided sectors covering the beginner NumPy core
- Mission validators that reward actual array operations instead of hand-entered outputs
- A live array inspector for `shape`, `dtype`, `ndim`, `size`, and rendered values
- Browser-testing hooks: `window.render_game_to_text()` and `window.advanceTime(ms)`
- GitHub Pages deployment workflow and regression CI workflow

## Run locally

Static app only:

```powershell
python -m http.server 4173
```

Then open [http://127.0.0.1:4173](http://127.0.0.1:4173).

## Install dev dependencies

Regression tests use Playwright:

```powershell
npm install
npx playwright install chromium
```

## Run regression coverage

```powershell
npm run test:regression
```

This script starts a local static server, waits for Pyodide + NumPy, verifies the testing hooks, solves all seven sectors in-browser, checks progression, reset behavior, and inspector sync, and fails on console or page errors.

## Architecture notes

- `index.html`: static shell and UI regions
- `styles.css`: layout, mission panels, onboarding, and visual styling
- `app.js`: UI state, Pyodide execution, progression, inspector rendering, and testing hooks
- `missions.js`: sector content, validators, and expected NumPy concepts
- `scripts/regression-check.js`: end-to-end browser regression coverage

## Contributor guidance

- Keep the player writing real NumPy, not pseudo-commands or drag-and-drop blocks.
- Treat `window.render_game_to_text()` and `window.advanceTime(ms)` as stable public test hooks.
- When adding or editing missions, update the authored content and validator together.
- Prefer teaching-oriented feedback over terse error states.
- Re-run `npm run test:regression` after any mission, execution, or UI state change.

## Deployment

The repo includes GitHub Actions workflows for:

- regression CI: `.github/workflows/regression.yml`
- GitHub Pages deployment: `.github/workflows/deploy-pages.yml`

On pushes to `main`, the Pages workflow publishes the static app using `index.html`, `app.js`, `missions.js`, and `styles.css`.
