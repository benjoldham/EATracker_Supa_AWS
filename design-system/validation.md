# Executed validation — 14 October 2026

## Token naming follow-up — 15 October 2026

Renamed token properties to Figma leaf names and updated every CSS reference and the generator. A comparison against the pre-rename stylesheets confirmed identical declarations, values, aliases, selectors, theme scopes and media conditions after substituting the rename map. All custom-property references resolve; generation, formatting and `git diff --check` passed. The existing fixture-backed Chrome validation script passed all 23 layout cases again. All 23 main layout screenshots were byte-identical to their pre-rename captures (SHA-256 comparison). This follow-up did not change application JavaScript, token values or Figma source paths. Follow-up browser output is in `/private/tmp/fc26-token-rename-visual/`.

## Automated checks

- `node scripts/generate-design-tokens.cjs --check`: passed; 56 primitives, 25 semantic colours in both modes and 29 numeric Sizes tokens. The other three Sizes variables describe breakpoints and map to literal media queries.
- Static reference check across `styles.css` and `design-system/tokens.css`: every custom-property reference has a definition; no unresolved aliases.
- `git diff --check`: passed.
- Prettier checks on the shared stylesheet and both scripts: passed. Generated CSS is checked against its generator instead of formatted independently.
- Esbuild syntax parsing of `app.js`, `dashboard.js`, `login.js`, `awsClient.js`, `theme.js` and `formations.js`: passed.
- `node node_modules/typescript/bin/tsc --noEmit -p amplify/tsconfig.json`: passed.
- `npm test`: failed with the repository's pre-existing placeholder message, `Error: no test specified`. No existing application test suite is configured.

## Browser regression run

Ran `scripts/validate-design.cjs` using temporary Playwright and installed Google Chrome in headless mode, with the repository served at `http://127.0.0.1:8765`.

The AWS module, Amplify confirmation endpoints and Tesseract import were intercepted with local test fixtures. The actual HTML, CSS, theme script, Tracker, Dashboard, Login and formation scripts executed. No AWS account data was read or changed. This checks UI integration and local behaviour; it does not prove live backend or OCR functionality.

All 23 layout cases passed:

| Screens | Modes | Viewports |
| --- | --- | --- |
| Tracker | Dark and Light | 1440×4022, 390×844, 320×844 |
| Dashboard | Dark and Light | 1440×1118, 390×844, 320×844 |
| Login | Dark and Light | 1440×1118, 390×844, 320×844 |
| Tracker breakpoint boundaries | Dark | widths 768, 769, 900, 901 and 1200; height 1000 |

Verified in the runs:

- Both Google font families loaded; heading sizes switched to approved desktop/compact values; fields remained 40px tall.
- No page-level horizontal overflow, or form controls extending beyond the viewport.
- Theme toggle changed mode and restored it through the real theme script.
- Tracker's mobile table overflowed inside its scrolling wrapper.
- Player editing border, update/cancel controls and optional Rescan visibility followed existing logic.
- Player search, ex-player checkbox, every existing formation, player add/update/delete and subsequent form reload worked against fixtures.
- Dashboard rename, delete, open, empty state and create flows worked against fixtures in both themes at all three main widths.
- Login validation error, account confirmation display and confirmation completion worked against fixtures.
- Keyboard focus produced a visible outline, button hover produced the semantic overlay, and reduced-motion disabled transitions at all five intermediate widths.
- The camera dialog and its footer fit desktop and compact viewport heights when its visible state was rendered. The camera was not started.
- No uncaught page JavaScript errors during loading or those interactions.

Machine-readable results are in `validation-results.json`. To reproduce, install Playwright separately and run:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
FC26_PLAYWRIGHT_PATH=/path/to/playwright node scripts/validate-design.cjs
```

Chrome must be installed. `FC26_BASE_URL` and `FC26_VISUAL_OUTPUT` can override the server and screenshot directory. Playwright is a validation-only tool and is not added to the application's dependencies.

## Visual comparisons

Downloaded live Figma exports for Tracker `111:331`, Dashboard `110:9` and Login `112:4109`. Manually inspected those exports alongside the corresponding desktop Dark browser captures at the matching viewport dimensions above. Also inspected compact Light Tracker, compact Light Login, compact Dark editing and compact Light camera-dialog captures. These are visual inspections, not a passing pixel-diff test or a claim of exact parity.

Browser screenshots are available locally in `/private/tmp/fc26-visual/`, including desktop and compact pages, editing, confirmation and scanner states. Figma comparison images are `/private/tmp/fc26-figma-tracker.png`, `/private/tmp/fc26-figma-dashboard.png` and `/private/tmp/fc26-figma-login.png`. These temporary images are not runtime assets or repository dependencies.

The mobile header wrapping regression found during visual inspection was fixed and rechecked. Remaining differences and the source-of-truth conflicts are detailed in `README.md`: concise line-height values, responsive Login composition, native table geometry, actual data-dependent pitch rows, localhost administrative controls and theme-switch dimensions.

Live AWS/Cognito save persistence, actual sign-in, real camera capture, OCR, Safari and physical mobile devices were not tested. The application JavaScript and AWS/configuration files were not changed.
