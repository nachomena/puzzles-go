# Notes for Claude

## How we work
- Work directly on `main`. Don't commit or push until the user gives the ok ("ok push").
- Reply to the user in Spanish. Code, comments, docs and commit messages are in English.
- After every change to the app, publish the test version at https://claude.ai/artifact/RFYwytBGfBy6QTfJCuxYEy
  (`index.html` with the changed files in `files`, always including `sw.js`).
- Before pushing: `npm run build:sw`, `npm run check`, `npm test` and `npx playwright test`.
- Tidy CSS with no duplication: shared styles go in `css/components.css`, each game's in `css/games/<id>.css`.
- No visible text in the code: it goes in `js/i18n/es.js` and `js/i18n/en.js` (same keys) and is used with `t()`.
- Game names without trademarks (Gridlock, Pentominoes, Calcudoku, Fit, Dice…). Ids, folders, classes and `storageKey`s
  (`puzzlesgo.<id>.v1`) use the new names. (The old keys were renamed on purpose, dropping the progress saved under them.)

## For later
- **Store apps with Capacitor**: the same web app inside an iOS and Android app (`npx cap sync` after each change).
  Google Play: $25 once (new personal account: closed test with 12 people for 14 days). App Store: $99 a year,
  built on a Mac or in the cloud. Android only: TWA (PWABuilder or Bubblewrap). For now we keep the web app until
  it is solid.
- **Before publishing to the stores**: publish a privacy policy and check that "Puzzles Go" is not a registered
  trademark.
- **Custom domain** on GitHub Pages.
