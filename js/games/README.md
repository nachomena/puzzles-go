# Adding a game

Each game lives in its own folder and plugs into the app with a definition. The shell (`js/app/app.js`) knows
nothing about any particular game: picker, level menu, settings, help, background generation, history, timer,
statistics and win screen are shared.

## Steps

1. Create `js/games/<id>/` with, at least:
   - `meta.js` — light data: `id`, `name`, `icon`, `storageKey`, `levels` and `levelOrder`.
     The picker and the level menu are drawn from this alone; the rest of the game is imported when it opens,
     in the background, and starts generating boards.
   - `engine/` — pure engine (no DOM) with `generate(target)`: a **generator function** that yields often and
     returns `{ level, ...board }` or `null`. `level` is the board's real level.
   - `worker.js` — two lines: `serveGenerator(generate)` (see `core/generator-worker.js`).
   - `controller.js` — a class that **extends `GameController`** (`core/game-controller.js`) and implements its
     steps: `createSession`, `mountBoard`, `renderBoard`, `snapshot`, `restore`, `hasInput`, `clearInput`,
     `isSolved`, `hint` and, if needed, `normalize`, `onSetting`, `celebrate`, `actions` and `onKey`. Undo,
     restart, timer and win are inherited.
   - `templates.js` — markup for the controls under the board and for the help. It uses the pieces in
     `ui/templates.js` (`iconButton`, `toolPicker`, `undoRedo`…). Buttons declare what they do with
     `data-action="…"`: the shell handles the shared actions and the game's own go in `actions`.
   - `index.js` — `export default defineGame({ ...meta, ... })` with every field of the contract
     (`core/game-definition.js`). `defineGame` fails at startup if any is missing.
     Optional: `hint: false` removes the hint button. In `settings`, a setting with `options`
     (`[{ value, label }]`) is shown as a drop-down instead of a switch.
     Statistics go per level; to group them another way, declare `statsRows` in `meta.js` (`[{ key, name }]`) and
     `statsKey(session)` in `index.js` (e.g. Peg Solitaire, per board), and if needed `statsName(session)` for the
     win text.
     Games with fixed puzzles picked one by one (e.g. Pentominoes): `picker` in `index.js` (`render(L, data)` draws
     a level's table with `data-action="pick-puzzle"` buttons, `puzzle(L, dataset)` gives the tapped board and
     `same(session, puzzle)` says whether it is the open game), and in `meta.js` `levelMeta(L, stats)`,
     `sessionLabel(session)` and `resumeLabel(session)` for the menu (and, if needed, `menuLabel` for the title above
     the levels). If a game changes its levels, `upgradeSession(cur)` in `meta.js` converts the saved game to the
     current ones before loading it (see `core/store.js`).
     The controller can define `next()` for the "Next board" button (see `core/game-controller.js`).
     To put a game inside a picker group (e.g. the piece games), set `group` and optionally `shortName` (its name
     inside the group) in `meta.js`; the groups are in `ui/hub-view.js#GROUPS`.
2. Add `{ meta, load: () => import('./<id>/index.js'), css: 'css/games/<id>.css' }` to `CATALOG` in
   `js/games/catalog.js`.
3. If it needs styles, create `css/games/<id>.css` (loaded when the game opens, with its code; without styles, drop
   `css`). Anything used by more than one game goes in `css/components.css`: a game's sheet may not be loaded.
4. New icons: add a `<symbol id="i-…">` to the sprite in `index.html`.
5. Texts: everything visible (name, picker tagline, settings, help, notices) goes in `js/i18n/es.js` and
   `js/i18n/en.js`, under `games.<id>`, and is used with `t('games.<id>.…')` (`js/i18n/index.js`). Both files must
   have the same keys (`tests/i18n.test.js`).
6. `sw.js` updates itself on commit (file list and version, see `scripts/build-sw.mjs`).
7. Tests in `tests/<id>.test.js`.

## Reusable

- `ui/grid-board.js` — N×N board with walls between regions, incremental repaint, flash, win wave and
  `cellAt(x, y)`. Star Battle and Sudoku extend it.
- `ui/cell-drag.js` — tap and drag over a grid.
- `ui/piece-drag.js` — drag pieces from a tray to a board of cells, and tap them.
- `core/grid-pieces-controller.js` — a game of pieces on a grid (drag, rotate, flip, fixed pieces): Pentominoes, Fit.
- `core/digit-grid-controller.js` and `ui/templates.js#digitControls` — numbers on a grid with keypad, pencil and
  eraser: Sudoku, Calcudoku.
- `lib/polyomino.js` — polyomino orientations and a solution search to fill a board (Pentominoes, Fit).
- `ui/cube-svg.js` — pieces made of bevelled little cubes (Circuit).
- `lib/bits.js` — `popcount`, `bitIndices`, `someCombination`.
