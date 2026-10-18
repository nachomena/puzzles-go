/* Kakuro definition for the game registry (contract in js/games/README.md). */
import { defineGame } from '../../core/game-definition.js';
import { generate } from './engine/generator.js';
import { LEVEL_RULES } from './engine/levels.js';
import { KakuroController } from './controller.js';
import { help } from './templates.js';
import { digitControls } from '../../ui/templates.js';
import { LEVELS, TOOL, DEFAULT_SETTINGS, SETTINGS } from './config.js';
import meta from './meta.js';

const isGrid = (g, n, min, max) => Array.isArray(g) && g.length === n * n && g.every(v => Number.isInteger(v) && v >= min && v <= max);
const isRun = (r, n) => r && Array.isArray(r.cells) && r.cells.length >= 2 && Number.isInteger(r.sum) && Number.isInteger(r.clue) &&
  r.cells.every(i => Number.isInteger(i) && i >= 0 && i < n * n);

export default defineGame({
  ...meta,
  tools: Object.values(TOOL),
  defaultSettings: DEFAULT_SETTINGS,
  settings: SETTINGS,

  workerUrl: new URL('./worker.js', import.meta.url),
  generate,
  isValidPuzzle: (p, L) => p.level === LEVELS[L].target && p.n === LEVEL_RULES[p.level].n &&
    isGrid(p.white, p.n, 0, 1) && isGrid(p.solution, p.n, 0, 9) && Array.isArray(p.runs) && p.runs.every(r => isRun(r, p.n)),
  restoreSession: s => {
    const n = s.p.n;
    if (!isGrid(s.values, n, -1, 9)) return null;
    if (!Array.isArray(s.notes) || s.notes.length !== n * n) s.notes = new Array(n * n).fill(0);
    if (typeof s.sel !== 'number') s.sel = -1;
    return s;
  },
  sizeLabel: p => `${p.n}×${p.n}`,
  boardClass: 'board--digits board--kakuro',

  controls: digitControls(9),
  help: help(),
  Controller: KakuroController
});
