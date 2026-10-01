/* Definición de Smart Dices para el registro de juegos (contrato en js/games/README.md). */
import { defineGame } from '../../core/game-definition.js';
import { generate } from './engine/generator.js';
import { PIECES } from './engine/pieces.js';
import { SmartDicesController } from './controller.js';
import { boardHtml, controls, help } from './templates.js';
import { LEVELS, TOOL, DEFAULT_SETTINGS, SETTINGS } from './config.js';
import meta from './meta.js';

const isArrows = a => a && [a.rows, a.cols].every(l => Array.isArray(l) && l.length === 2);

export default defineGame({
  ...meta,
  tools: Object.values(TOOL),
  defaultSettings: DEFAULT_SETTINGS,
  settings: SETTINGS,

  workerUrl: new URL('./worker.js', import.meta.url),
  generate,
  isValidPuzzle: (p, L) => Array.isArray(p.solution) && p.solution.length === PIECES.length &&
    Array.isArray(p.fixed) && isArrows(p.arrows) && p.level === LEVELS[L].target,
  restoreSession: s => {
    if (!Array.isArray(s.place) || s.place.length !== PIECES.length) return null;
    if (!Array.isArray(s.trot)) s.trot = PIECES.map(() => 0);
    return s;
  },
  sizeLabel: () => '4 dados',

  boardHtml: boardHtml(),
  controls: controls(),
  help: help(),
  Controller: SmartDicesController
});
