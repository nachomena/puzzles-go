/* Light Up definition for the game registry (contract in js/games/README.md). */
import { defineGame } from '../../core/game-definition.js';
import { generate } from './engine/generator.js';
import { LightUpController } from './controller.js';
import { controls, help } from './templates.js';
import { LEVELS, TOOL, DEFAULT_SETTINGS, SETTINGS } from './config.js';
import meta from './meta.js';

const isList = (a, len, ok) => Array.isArray(a) && a.length === len && a.every(ok);

export default defineGame({
  ...meta,
  tools: Object.values(TOOL),
  defaultSettings: DEFAULT_SETTINGS,
  settings: SETTINGS,

  workerUrl: new URL('./worker.js', import.meta.url),
  generate,
  isValidPuzzle: (p, L) => Number.isInteger(p.n) && isList(p.cells, p.n * p.n, v => Number.isInteger(v) && v >= -1 && v <= 5) &&
    isList(p.solution, p.n * p.n, v => v === 0 || v === 1) && p.level === LEVELS[L].target,
  restoreSession: s => isList(s.marks, s.p.n * s.p.n, v => v === 0 || v === 1 || v === 2) ? s : null,
  sizeLabel: p => `${p.n}×${p.n}`,
  boardClass: 'board--light-up',

  controls: controls(),
  help: help(),
  Controller: LightUpController
});
