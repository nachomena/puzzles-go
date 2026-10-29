/* Dice definition for the game registry (contract in js/games/README.md). */
import { defineGame } from '../../core/game-definition.js';
import { generate } from './engine/generator.js';
import { PIECES, CELLS, footprint } from './engine/pieces.js';
import { DiceController } from './controller.js';
import { boardHtml, controls, help } from './templates.js';
import { LEVELS, TOOL, DEFAULT_SETTINGS, SETTINGS } from './config.js';
import meta from './meta.js';

const isArrows = a => a && [a.rows, a.cols].every(l => Array.isArray(l) && l.length === 2);
/** Does the solution use the current pieces and fill the board? (A board saved before the pieces changed doesn't.) */
const fillsBoard = sol => {
  if (!Array.isArray(sol) || sol.length !== PIECES.length) return false;
  const seen = new Set();
  for (const [i, p] of sol.entries()){
    const f = p?.type === PIECES[i] && footprint(p.type, p.rot, p.r, p.c);
    if (!f) return false;
    f.cells.forEach(c => seen.add(c));
  }
  return seen.size === CELLS;
};

export default defineGame({
  ...meta,
  confirmReset: false,
  tools: Object.values(TOOL),
  defaultSettings: DEFAULT_SETTINGS,
  settings: SETTINGS,

  workerUrl: new URL('./worker.js', import.meta.url),
  generate,
  isValidPuzzle: (p, L) => fillsBoard(p.solution) &&
    Array.isArray(p.fixed) && isArrows(p.arrows) && p.level === LEVELS[L].target,
  restoreSession: s => {
    if (!fillsBoard(s.p?.solution)) return null;
    if (!Array.isArray(s.place) || s.place.length !== PIECES.length) return null;
    if (!Array.isArray(s.trot)) s.trot = PIECES.map(() => 0);
    return s;
  },
  sizeLabel: () => '',   // it is always 4 dice: it adds nothing to the header

  boardHtml: boardHtml(),
  controls: controls(),
  help: help(),
  Controller: DiceController
});
