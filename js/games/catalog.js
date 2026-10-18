/* Game catalogue. The picker only needs the meta.js data; the rest of the game (engine, controller,
   templates and its `css` stylesheet) loads when it is first opened.
   To add a game: create its folder (see README.md) and add its entry here. */
import starBattle from './star-battle/meta.js';
import sudoku from './sudoku/meta.js';
import killerSudoku from './killer-sudoku/meta.js';
import kakuro from './kakuro/meta.js';
import loop from './loop/meta.js';
import gears from './gears/meta.js';
import dice from './dice/meta.js';
import circuit from './circuit/meta.js';
import circle from './circle/meta.js';
import hexagon from './hexagon/meta.js';
import fit from './fit/meta.js';
import pentominoes from './pentominoes/meta.js';
import gridlock from './gridlock/meta.js';
import trail from './trail/meta.js';
import bridges from './bridges/meta.js';
import calcudoku from './calcudoku/meta.js';
import lightUp from './light-up/meta.js';
import binary from './binary/meta.js';
import pegSolitaire from './peg-solitaire/meta.js';

export const CATALOG = [
  { meta: starBattle, load: () => import('./star-battle/index.js'), css: 'css/games/star-battle.css' },
  { meta: sudoku,     load: () => import('./sudoku/index.js') },
  { meta: killerSudoku, load: () => import('./killer-sudoku/index.js'), css: 'css/games/killer-sudoku.css' },
  { meta: kakuro,       load: () => import('./kakuro/index.js'), css: 'css/games/kakuro.css' },
  { meta: loop,  load: () => import('./loop/index.js'), css: 'css/games/loop.css' },
  { meta: gears,        load: () => import('./gears/index.js'), css: 'css/games/gears.css' },
  { meta: dice,   load: () => import('./dice/index.js'), css: 'css/games/dice.css' },
  { meta: circuit, load: () => import('./circuit/index.js'), css: 'css/games/circuit.css' },
  { meta: circle,  load: () => import('./circle/index.js'), css: 'css/games/circle.css' },
  { meta: hexagon, load: () => import('./hexagon/index.js'), css: 'css/games/hexagon.css' },
  { meta: fit,    load: () => import('./fit/index.js'), css: 'css/games/fit.css' },
  { meta: pentominoes,     load: () => import('./pentominoes/index.js'), css: 'css/games/pentominoes.css' },
  { meta: gridlock,     load: () => import('./gridlock/index.js'), css: 'css/games/gridlock.css' },
  { meta: trail,          load: () => import('./trail/index.js'), css: 'css/games/trail.css' },
  { meta: bridges,        load: () => import('./bridges/index.js'), css: 'css/games/bridges.css' },
  { meta: calcudoku,       load: () => import('./calcudoku/index.js'), css: 'css/games/calcudoku.css' },
  { meta: lightUp,        load: () => import('./light-up/index.js'), css: 'css/games/light-up.css' },
  { meta: binary,      load: () => import('./binary/index.js'), css: 'css/games/binary.css' },
  { meta: pegSolitaire, load: () => import('./peg-solitaire/index.js'), css: 'css/games/peg-solitaire.css' }
];
