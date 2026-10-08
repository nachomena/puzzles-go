/* Definición de Hashi para el registro de juegos (contrato en js/games/README.md). */
import { defineGame } from '../../core/game-definition.js';
import { generate } from './engine/generator.js';
import { edgesOf } from './engine/graph.js';
import { HashiController } from './controller.js';
import { boardHtml, controls, help } from './templates.js';
import { LEVELS, TOOL, DEFAULT_SETTINGS, SETTINGS } from './config.js';
import meta from './meta.js';

const isIsland = (s, p) => s && Number.isInteger(s.x) && Number.isInteger(s.y) && s.x >= 0 && s.y >= 0 &&
  s.x < p.w && s.y < p.h && Number.isInteger(s.n) && s.n >= 1 && s.n <= 8;
const isBridges = (a, len) => Array.isArray(a) && a.length === len && a.every(v => v === 0 || v === 1 || v === 2);

export default defineGame({
  ...meta,
  tools: Object.values(TOOL),
  defaultSettings: DEFAULT_SETTINGS,
  settings: SETTINGS,

  workerUrl: new URL('./worker.js', import.meta.url),
  generate,
  isValidPuzzle: (p, L) => Number.isInteger(p.w) && Array.isArray(p.islands) && p.islands.every(s => isIsland(s, p)) &&
    isBridges(p.solution, edgesOf(p).length) && p.level === LEVELS[L].target,
  restoreSession: s => isBridges(s.val, edgesOf(s.p).length) ? s : null,
  sizeLabel: p => `${p.w}×${p.h}`,

  boardHtml: boardHtml(),
  controls: controls(),
  help: help(),
  Controller: HashiController
});
