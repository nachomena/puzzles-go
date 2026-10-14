/* Definición de Binario para el registro de juegos (contrato en js/games/README.md). */
import { defineGame } from '../../core/game-definition.js';
import { generate } from './engine/generator.js';
import { BinarioController } from './controller.js';
import { controls, help } from './templates.js';
import { LEVELS, TOOL, DEFAULT_SETTINGS, SETTINGS } from './config.js';
import meta from './meta.js';

const isList = (a, len, ok) => Array.isArray(a) && a.length === len && a.every(ok);
const isSide = n => Number.isInteger(n) && n >= 4 && n <= 14 && n % 2 === 0;

export default defineGame({
  ...meta,
  tools: Object.values(TOOL),
  defaultSettings: DEFAULT_SETTINGS,
  settings: SETTINGS,

  workerUrl: new URL('./worker.js', import.meta.url),
  generate,
  isValidPuzzle: (p, L) => isSide(p.n) && isList(p.givens, p.n * p.n, v => v === 0 || v === 1 || v === 2) &&
    isList(p.solution, p.n * p.n, v => v === 1 || v === 2) && p.givens.every((v, i) => !v || v === p.solution[i]) &&
    p.level === LEVELS[L].target,
  restoreSession: s => isList(s.g, s.p.n * s.p.n, v => v === 0 || v === 1 || v === 2) && s.p.givens.every((v, i) => !v || s.g[i] === v) ? s : null,
  sizeLabel: p => `${p.n}×${p.n}`,
  boardClass: 'board--binario',

  controls: controls(),
  help: help(),
  Controller: BinarioController
});
