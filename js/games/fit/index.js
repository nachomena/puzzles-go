/* Fit definition for the game registry (contract in js/games/README.md). */
import { defineGame } from '../../core/game-definition.js';
import { generate } from './engine/generator.js';
import { PIECES, CELLS, cellsOf } from './engine/pieces.js';
import { FitController } from './controller.js';
import { boardHtml, controls, help } from './templates.js';
import { LEVELS, TOOL, DEFAULT_SETTINGS, SETTINGS } from './config.js';
import meta from './meta.js';

const isPose = (v, p) => v && (v.m === 0 || v.m === 1) && Number.isInteger(v.r) && v.r >= 0 && v.r < 4 &&
  Number.isInteger(v.x) && Number.isInteger(v.y) && !!cellsOf(p, v);
/** Does the solution fill the board exactly? (A board saved before the pieces changed doesn't.) */
const fillsBoard = sol => {
  if (!Array.isArray(sol) || sol.length !== PIECES.length || !sol.every(isPose)) return false;
  const seen = new Set();
  sol.forEach((pose, piece) => cellsOf(piece, pose).forEach(c => seen.add(c)));
  return seen.size === CELLS;
};
const isTrayList = (a, ok) => Array.isArray(a) && a.length === PIECES.length && a.every(ok);

export default defineGame({
  ...meta,
  confirmReset: false,
  tools: Object.values(TOOL),
  defaultSettings: DEFAULT_SETTINGS,
  settings: SETTINGS,

  workerUrl: new URL('./worker.js', import.meta.url),
  generate,
  isValidPuzzle: (p, L) => fillsBoard(p.solution) && Array.isArray(p.fixed) && p.level === LEVELS[L].target,
  restoreSession: s => {
    if (!fillsBoard(s.p?.solution)) return null;
    if (!Array.isArray(s.place) || s.place.length !== PIECES.length || !s.place.every((v, p) => v === null || isPose(v, p))) return null;
    if (!isTrayList(s.tm, v => v === 0 || v === 1)) s.tm = PIECES.map(() => 0);
    if (!isTrayList(s.tr, v => Number.isInteger(v) && v >= 0 && v < 4)) s.tr = PIECES.map(() => 0);
    if (typeof s.sel !== 'number') s.sel = -1;
    return s;
  },
  sizeLabel: () => '',

  boardHtml: boardHtml(),
  controls: controls(),
  help: help(),
  Controller: FitController
});
