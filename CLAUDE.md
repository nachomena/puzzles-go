# Notes for Claude

## How we work
- Work directly on `main`. Don't commit or push until the user gives the ok ("ok push").
- Reply to the user in Spanish. Code, comments, docs and commit messages are in English.
- After every change to the app, publish the test version at https://claude.ai/artifact/RFYwytBGfBy6QTfJCuxYEy
  (`index.html` with the changed files in `files`, always including `sw.js`).
- Before pushing: `npm run build:sw`, `npm run check`, `npm test` and `npx playwright test`.
- Tidy CSS with no duplication: shared styles go in `css/components.css`, each game's in `css/games/<id>.css`.
- No visible text in the code: it goes in `js/i18n/es.js` and `js/i18n/en.js` (same keys) and is used with `t()`.
- Game names without trademarks (Gridlock, Pentominoes, Calcudoku, Fit, Dice…). Ids, folders and classes use the
  new names; the `storageKey` values don't change, so saved progress isn't lost.

## For later
- **Store apps with Capacitor**: the same web app inside an iOS and Android app (`npx cap sync` after each change).
  Google Play: $25 once (new personal account: closed test with 12 people for 14 days). App Store: $99 a year,
  built on a Mac or in the cloud. Android only: TWA (PWABuilder or Bubblewrap). For now we keep the web app until
  it is solid.
- **Before publishing to the stores**: publish a privacy policy, add `fonts/OFL.txt` (the Archivo license) and check
  that "Puzzles Go" is not a registered trademark.
- **Export and import progress** in Settings, so the app can be reinstalled without losing it.
- **Custom domain** on GitHub Pages.
