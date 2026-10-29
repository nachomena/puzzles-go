/* Circuit definition for the game registry (contract in js/games/README.md). */
import { defineGame } from '../../core/game-definition.js';
import { generate } from './engine/generator.js';
import { PIECES } from './engine/pieces.js';
import { arrangements, lookKey } from './engine/arrangements.js';
import { CircuitController } from './controller.js';
import { boardHtml, controls, help } from './templates.js';
import { LEVELS, TOOL, DEFAULT_SETTINGS, SETTINGS } from './config.js';
import meta from './meta.js';

/** Is the solution one of the valid placements? (A board saved before the pieces changed isn't.) */
const isArrangement = sol => Array.isArray(sol) && sol.length === PIECES.length &&
  sol.every(s => s && Number.isInteger(s.piece) && Number.isInteger(s.cell)) &&
  arrangements().some(a => sol.every(s => a.keys.has(lookKey(s))));

export default defineGame({
  ...meta,
  confirmReset: false,
  tools: Object.values(TOOL),
  defaultSettings: DEFAULT_SETTINGS,
  settings: SETTINGS,

  workerUrl: new URL('./worker.js', import.meta.url),
  generate,
  isValidPuzzle: (p, L) => isArrangement(p.solution) &&
    Array.isArray(p.dots) && Array.isArray(p.fixed) && p.show && p.level === LEVELS[L].target,
  restoreSession: s => {
    if (!isArrangement(s.p?.solution)) return null;
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
  Controller: CircuitController
});
