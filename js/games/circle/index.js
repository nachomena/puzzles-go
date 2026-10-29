/* Circle definition for the game registry (contract in js/games/README.md). */
import { defineGame } from '../../core/game-definition.js';
import { generate } from './engine/generator.js';
import { PIECES, SECTORS, CELLS, cellsOf } from './engine/pieces.js';
import { CircleController } from './controller.js';
import { boardHtml, controls, help } from './templates.js';
import { LEVELS, TOOL, DEFAULT_SETTINGS, SETTINGS } from './config.js';
import meta from './meta.js';

const isPose = v => v && (v.m === 1 || v.m === -1) && Number.isInteger(v.s) && v.s >= 0 && v.s < SECTORS;
/** Does the solution fill the board exactly? (A board saved before the pieces changed doesn't.) */
const fillsBoard = sol => {
  if (!Array.isArray(sol) || sol.length !== PIECES.length || !sol.every(isPose)) return false;
  return new Set(sol.flatMap((pose, p) => cellsOf(p, pose))).size === CELLS;
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
    Array.isArray(p.fixed) && Array.isArray(p.marks) && typeof p.ribsFixed === 'boolean' && p.level === LEVELS[L].target,
  restoreSession: s => {
    if (!fillsBoard(s.p?.solution)) return null;
    if (!Array.isArray(s.place) || s.place.length !== PIECES.length || !s.place.every(v => v === null || isPose(v))) return null;
    if (!Array.isArray(s.tm) || s.tm.length !== PIECES.length) s.tm = PIECES.map(() => 1);
    if (!Number.isInteger(s.ro)) s.ro = s.p.o;
    if (typeof s.sel !== 'number') s.sel = -1;
    return s;
  },
  sizeLabel: () => '',

  boardHtml: boardHtml(),
  controls: controls(),
  help: help(),
  Controller: CircleController
});
