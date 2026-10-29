# Puzzles Go

Logic puzzles as an installable web app that works offline, in Spanish and English (the phone's language, or
the one chosen in the picker settings). Every game with difficulties uses the same three: Easy, Hard and Expert.

- **Star Battle** 10×10, 2 stars.
- **Sudoku** 9×9. Expert always requires X-Wing or Swordfish.
- **Kakuro** from 6×6 to 12×12: sums in black cells and runs with no repeated numbers.
- **Loop** from 5×5 to 10×10: a single loop between the dots following the numbers in the cells.
- **Gears** (an original game) from 5×5 to 8×8: gears on a hexagonal panel that carry the crank's turn to the lock, in a single chain with no cycles, with numbers that count the surrounding gears.
- **Killer Sudoku** 9×9 with sum cages. Easy has one-cell cages and 16 given numbers; Hard needs locked candidates, pairs or triples; Expert always requires the rule of 45.
- **Dice**: 12 pieces that form 4 die faces with sums per row and column.
- **Circuit**: 10 double-sided pieces that join the dots with paths on an 8×4 board.
- **Circle**: 10 double-sided ball pieces that fill a round board of 3 rings without crossing its ribs (in Hard and Expert you also have to find where the ribs go).
- **Hexagon**: 12 double-sided stroke-shaped pieces that fill the gaps between the pegs of a hexagonal board.
- **Fit**: 12 ball pieces of 4, 5 and 6 balls that fill a 10×6 board; from 9 to 3 pieces placed at the start.
- **Pentominoes**: fill a 5-column board with pentominoes; each puzzle adds a piece and a row. 512 puzzles in 5 series, spread over Easy, Hard and Expert and picked from a table; solved ones are marked.
- **Gridlock**: slide cars and trucks on a 6×6 board until the red one gets out; levels by minimum moves (from 8 to more than 30).
- **Trail**: a path through every cell that touches the numbers in order (from 6×6 to 7×7).
- **Bridges**: join islands with bridges of 1 or 2 that don't cross (from 7×7 to 10×10).
- **Calcudoku**: 1 to N with no repeats per row and column, with cages of sums, differences, products and quotients (from 5×5 to 7×7).
- **Light Up**: bulbs that light the whole board without seeing each other (from 7×7 to 10×10).
- **Binary** (the 0h h1 rules): red and blue, never three equal in a row, half and half in each line and no two equal rows or columns (from 8×8 to 12×12).
- **Peg Solitaire**: the classic of jumping balls until one is left, on the English (33) or European (37) board, chosen in Settings.

Every board is generated on the device, has a single solution and its level is guaranteed by a logic solver that
uses human techniques.

Published with GitHub Pages. On iPhone: open in Safari → Share → "Add to Home Screen".

Progress is stored on the device and kept across updates: when there is a new version, the app says so
("A new version is available · Update") and there is no need to add it to the home screen again (deleting the
icon also deletes its progress).

## Development

No build step: HTML, CSS and native ES modules. The only dependency is Playwright, for the browser tests (the app
doesn't use it).

```sh
npm install        # Playwright and the pre-commit hook (.githooks)
npm start          # local server at http://localhost:8000 (modules don't load over file://)
npm test           # engine, rules and infrastructure tests (node:test)
npm run test:e2e   # browser tests (Playwright): every game, actions and offline use
npm run check      # syntax and imports of all the JS, lint and sw.js up to date
npm run lint       # ESLint alone
```

`sw.js` is not edited by hand: on commit, the pre-commit hook (`scripts/build-sw.mjs`) writes the list of files
cached for offline play and a `VERSION` that is the fingerprint of their content, so every published change reaches
the iPhone on its own. `npm run build:sw` does the same by hand.

ESLint (`eslint.config.js`) only looks for errors (unused or undefined names, unreachable code…), not style:
the code is formatted by hand, with the basics in `.editorconfig` (2 spaces, UTF-8, final newline).

GitHub Actions (`.github/workflows/ci.yml`) runs `check`, `test` and `test:e2e` on every push and pull request.

Each game's CSS (`css/games/<id>.css`) loads when the game opens; what several games share goes in
`css/components.css`. The fonts in `fonts/` are a subset of Archivo and Archivo Black with only the characters the
app uses (`python3 scripts/build-fonts.py` rebuilds them).

All visible text lives in `js/i18n/es.js` and `js/i18n/en.js` (same keys, checked by `tests/i18n.test.js`) and is
used with `t()`. Code, comments and docs are in English. Game names avoid trademarks; the `storageKey` of some games
keeps its old name so saved progress isn't lost.

## Structure

```
index.html              shell: game picker, level menu, shared overlays and icon sprite
css/
  tokens.css            colours, fonts and sizes (CSS variables)
  base.css · components.css · menu.css · play.css · overlays.css · progress.css
  games/<id>.css        each game's own styles (loaded when it opens)
js/
  main.js               entry point
  config.js             shared constants (timings, history, supply)
  app/app.js            shell: navigation, action dispatch, timer, keyboard
  i18n/                 languages: es.js and en.js (every text, with the same keys) and t()
  core/                 generic infrastructure, unaware of any game
    game-definition.js    contract every game fulfils
    game-controller.js    base controller (template method): history, win, timer…
    store.js              persistent state per game (injectable storage)
    puzzle-supply.js      supply of boards per level, generated in the background
    runners.js            generation strategies: Web Worker or main thread
    generator-worker.js   shared worker loop
    history.js            undo / redo
  ui/                   reusable views: grid board, header, menus, overlays, dragging…
  lib/                  pure utilities (bits, grid, random, formatting, DOM)
  games/
    catalog.js          catalogue: picker data + lazy loading of each game
    star-battle/        engine, rules, controller, view, templates and definition
    sudoku/             likewise
tests/                  node:test tests
  e2e/                  browser tests (Playwright)
scripts/                data, sw.js and font generators; JS check
```

The 6,288 valid Dice arrangements are precomputed in `js/games/dice/engine/arrangements-data.js`
(`node scripts/build-dice-arrangements.mjs` regenerates them).

The 358 valid Circuit arrangements are in `js/games/circuit/engine/arrangements-data.js`
(`node scripts/build-circuit-arrangements.mjs` regenerates them).

The 274 Circle solutions (with the ribs in their starting position; the others are the same ones turned) are in
`js/games/circle/engine/solutions-data.js`, generated by `node scripts/build-circle-solutions.mjs`.

The 8,124 Hexagon solutions are stored as 677, one per group of solutions that are the same one turned or flipped, in
`js/games/hexagon/engine/solutions-data.js` (`node scripts/build-hexagon-solutions.mjs`, about 3 minutes).

The 512 Pentominoes puzzles (rows of pieces, with a checked solution and the difficulty measured by the number of
solutions) are in `js/games/pentominoes/engine/sets-data.js`, generated by `node scripts/build-pentomino-sets.mjs`
(about 20 seconds).

The piece games (Dice, Circuit, Circle, Hexagon and Fit) sit together in the picker, in a "Pieces" row that expands
(`group` in their `meta.js`).

The Kakuro Expert puzzles (12×12) also come precomputed, in `js/games/kakuro/engine/bank-data.js`
(`node scripts/build-kakuro-bank.mjs`, a few minutes); each one comes in 4 versions (transposed and with the numbers
swapped for 10 − n), which keep the single solution.

The Gears puzzles of every level come precomputed in `js/games/gears/engine/bank-data.js`
(`node scripts/build-gears-bank.mjs`, about 15 minutes): on the computer the solver proves the single solution without
the phone's step limit, and Expert ends up with fewer numbers. Each one comes in 2 versions (upside down, or turned
half a turn with the crank and the lock swapped).

The Gridlock puzzles of the Hard and Expert levels, which would take several seconds to generate on the spot, are
precomputed in `js/games/gridlock/engine/bank-data.js` (`node scripts/build-gridlock-bank.mjs`, see the script). The
other levels and games are generated on the device.

The app icons come from `icons/icon.svg`: `node scripts/make-icons.cjs` regenerates the PNGs.

How to add a new game: [js/games/README.md](js/games/README.md).
