/* Definición de Zip para el registro de juegos (contrato en js/games/README.md). */
import { defineGame } from '../../core/game-definition.js';
import { generate } from './engine/generator.js';
import { adjacent } from './engine/path.js';
import { ZipController } from './controller.js';
import { controls, help } from './templates.js';
import { LEVELS, TOOL, DEFAULT_SETTINGS, SETTINGS } from './config.js';
import meta from './meta.js';

const isCellList = (a, n) => Array.isArray(a) && a.every(c => Number.isInteger(c) && c >= 0 && c < n * n);
/** Camino válido: casillas distintas, cada una vecina de la anterior, empezando en el 1. */
const isPath = (path, p) => isCellList(path, p.n) && new Set(path).size === path.length &&
  (path.length === 0 || path[0] === p.nums[0]) && path.every((c, k) => k === 0 || adjacent(p.n, path[k - 1], c));

export default defineGame({
  ...meta,
  tools: Object.values(TOOL),
  defaultSettings: DEFAULT_SETTINGS,
  settings: SETTINGS,

  workerUrl: new URL('./worker.js', import.meta.url),
  generate,
  isValidPuzzle: (p, L) => Number.isInteger(p.n) && isCellList(p.nums, p.n) && isCellList(p.solution, p.n) &&
    p.solution.length === p.n * p.n && p.level === LEVELS[L].target,
  restoreSession: s => isPath(s.path, s.p) ? s : null,
  sizeLabel: p => `${p.n}×${p.n}`,
  boardClass: 'board--zip',

  controls: controls(),
  help: help(),
  Controller: ZipController
});
