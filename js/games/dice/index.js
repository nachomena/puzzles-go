/* Dice definition for the game registry (contract in js/games/README.md). */
import { defineGame } from '../../core/game-definition.js';
import { generate } from './engine/generator.js';
import { PIECES } from './engine/pieces.js';
import { DiceController } from './controller.js';
import { boardHtml, controls, help } from './templates.js';
import { LEVELS, TOOL, DEFAULT_SETTINGS, SETTINGS } from './config.js';
import meta from './meta.js';

const isArrows = a => a && [a.rows, a.cols].every(l => Array.isArray(l) && l.length === 2);

export default defineGame({
  ...meta,
  confirmReset: false,
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
  sizeLabel: () => '',   // it is always 4 dice: it adds nothing to the header

  boardHtml: boardHtml(),
  controls: controls(),
  help: help(),
  Controller: DiceController
});
