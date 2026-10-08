/* Definición de KenKen para el registro de juegos (contrato en js/games/README.md). */
import { defineGame } from '../../core/game-definition.js';
import { generate, LEVEL_RULES } from './engine/generator.js';
import { KenKenController } from './controller.js';
import { help } from './templates.js';
import { digitControls } from '../../ui/templates.js';
import { LEVELS, TOOL, DEFAULT_SETTINGS, SETTINGS } from './config.js';
import meta from './meta.js';

const MAX_N = Math.max(...Object.values(LEVEL_RULES).map(r => r.n));
const isGrid = (g, n) => Array.isArray(g) && g.length === n * n && g.every(v => Number.isInteger(v) && v >= 0 && v <= n);
const isCage = (c, n) => c && Array.isArray(c.cells) && c.cells.every(i => Number.isInteger(i) && i >= 0 && i < n * n) &&
  ['+', '-', '*', '/', ''].includes(c.op) && Number.isInteger(c.target);

export default defineGame({
  ...meta,
  tools: Object.values(TOOL),
  defaultSettings: DEFAULT_SETTINGS,
  settings: SETTINGS,

  workerUrl: new URL('./worker.js', import.meta.url),
  generate,
  isValidPuzzle: (p, L) => Number.isInteger(p.n) && Array.isArray(p.cages) && p.cages.every(c => isCage(c, p.n)) &&
    isGrid(p.solution, p.n) && p.level === LEVELS[L].target,
  restoreSession: s => {
    const n = s.p.n;
    if (!isGrid(s.values, n)) return null;
    if (!Array.isArray(s.notes) || s.notes.length !== n * n) s.notes = new Array(n * n).fill(0);
    if (typeof s.sel !== 'number') s.sel = -1;
    return s;
  },
  sizeLabel: p => `${p.n}×${p.n}`,
  boardClass: 'board--digits board--kenken',

  /** El teclado tiene tantos números como el tablero más grande; los que sobran se ocultan (CSS). */
  controls: digitControls(MAX_N),
  help: help(),
  Controller: KenKenController
});
