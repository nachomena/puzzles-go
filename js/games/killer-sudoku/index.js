/* Definición del Killer Sudoku para el registro de juegos (contrato en js/games/README.md). */
import { defineGame } from '../../core/game-definition.js';
import { generate } from './engine/generator.js';
import { coversBoard } from './engine/cages.js';
import { CELLS } from '../sudoku/engine/grid.js';
import { KillerController } from './controller.js';
import { help } from './templates.js';
import { isGrid } from './rules.js';
import { digitControls } from '../../ui/templates.js';
import { LEVELS, TOOL, DEFAULT_SETTINGS, SETTINGS } from './config.js';
import meta from './meta.js';

const isCage = c => c && Array.isArray(c.cells) && c.cells.length >= 1 && Number.isInteger(c.sum) &&
  c.cells.every(i => Number.isInteger(i) && i >= 0 && i < CELLS);

export default defineGame({
  ...meta,
  tools: Object.values(TOOL),
  defaultSettings: DEFAULT_SETTINGS,
  settings: SETTINGS,

  workerUrl: new URL('./worker.js', import.meta.url),
  generate,
  isValidPuzzle: (p, L) => Array.isArray(p.cages) && p.cages.every(isCage) && coversBoard(p.cages) &&
    isGrid(p.givens) && isGrid(p.solution) && p.level === LEVELS[L].target,
  restoreSession: s => {
    if (!isGrid(s.values) || !isGrid(s.p.givens)) return null;
    if (!Array.isArray(s.notes) || s.notes.length !== CELLS) s.notes = new Array(CELLS).fill(0);
    if (typeof s.sel !== 'number') s.sel = -1;
    return s;
  },
  sizeLabel: () => '',   // siempre es 9×9
  boardClass: 'board--digits board--sudoku board--killer',

  controls: digitControls(9),
  help: help(),
  Controller: KillerController
});
