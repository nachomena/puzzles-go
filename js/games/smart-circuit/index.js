/* Definición de Smart Circuit para el registro de juegos (contrato en js/games/README.md). */
import { defineGame } from '../../core/game-definition.js';
import { generate } from './engine/generator.js';
import { PIECES } from './engine/pieces.js';
import { SmartCircuitController } from './controller.js';
import { boardHtml, controls, help } from './templates.js';
import { LEVELS, TOOL, DEFAULT_SETTINGS, SETTINGS } from './config.js';
import meta from './meta.js';

export default defineGame({
  ...meta,
  tools: Object.values(TOOL),
  defaultSettings: DEFAULT_SETTINGS,
  settings: SETTINGS,

  workerUrl: new URL('./worker.js', import.meta.url),
  generate,
  isValidPuzzle: (p, L) => Array.isArray(p.solution) && p.solution.length === PIECES.length &&
    Array.isArray(p.dots) && Array.isArray(p.fixed) && p.show && p.level === LEVELS[L].target,
  restoreSession: s => {
    if (!Array.isArray(s.place) || s.place.length !== PIECES.length) return null;
    if (!Array.isArray(s.tface)) s.tface = PIECES.map(() => 0);
    if (!Array.isArray(s.trot)) s.trot = PIECES.map(() => 0);
    if (typeof s.sel !== 'number') s.sel = -1;
    return s;
  },
  sizeLabel: () => '',

  boardHtml: boardHtml(),
  controls: controls(),
  help: help(),
  Controller: SmartCircuitController
});
