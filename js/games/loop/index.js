/* Loop definition for the game registry (contract in js/games/README.md). */
import { defineGame } from '../../core/game-definition.js';
import { generate, LEVEL_RULES } from './engine/generator.js';
import { geometry } from './engine/grid.js';
import { SlitherController } from './controller.js';
import { boardHtml, controls, help } from './templates.js';
import { LEVELS, TOOL, DEFAULT_SETTINGS, SETTINGS } from './config.js';
import meta from './meta.js';

const isMarks = (a, len, max) => Array.isArray(a) && a.length === len && a.every(v => Number.isInteger(v) && v >= 0 && v <= max);

export default defineGame({
  ...meta,
  tools: Object.values(TOOL),
  defaultSettings: DEFAULT_SETTINGS,
  settings: SETTINGS,

  workerUrl: new URL('./worker.js', import.meta.url),
  generate,
  isValidPuzzle: (p, L) => p.level === LEVELS[L].target && p.n === LEVEL_RULES[p.level].n &&
    Array.isArray(p.clues) && p.clues.length === p.n * p.n && p.clues.every(c => Number.isInteger(c) && c >= -1 && c <= 3) &&
    isMarks(p.solution, geometry(p.n).E, 1),
  restoreSession: s => isMarks(s.e, geometry(s.p.n).E, 2) ? s : null,
  sizeLabel: p => `${p.n}×${p.n}`,

  boardHtml: boardHtml(),
  controls: controls(),
  help: help(),
  Controller: SlitherController
});
