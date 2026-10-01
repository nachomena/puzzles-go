/* Definición del Sudoku para el registro de juegos (contrato en js/games/README.md). */
import { defineGame } from '../../core/game-definition.js';
import { generate } from './engine/generator.js';
import { CELLS } from './engine/grid.js';
import { SudokuController } from './controller.js';
import { controls, help } from './templates.js';
import { LEVELS, TOOL, DEFAULT_SETTINGS, SETTINGS } from './config.js';
import meta from './meta.js';

const isGrid = g => Array.isArray(g) && g.length === CELLS;

export default defineGame({
  ...meta,
  tools: Object.values(TOOL),
  defaultSettings: DEFAULT_SETTINGS,
  settings: SETTINGS,

  workerUrl: new URL('./worker.js', import.meta.url),
  generate,
  isValidPuzzle: (p, L) => isGrid(p.givens) && isGrid(p.solution) && p.level === LEVELS[L].target,
  restoreSession: s => {
    if (!isGrid(s.values) || !isGrid(s.p.givens)) return null;
    if (!isGrid(s.notes)) s.notes = new Array(CELLS).fill(0);
    if (typeof s.sel !== 'number') s.sel = -1;
    return s;
  },
  sizeLabel: () => '9×9',
  boardClass: 'board--sudoku',

  controls: controls(),
  help: help(),
  Controller: SudokuController
});
