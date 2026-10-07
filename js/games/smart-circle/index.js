/* Definición de Smart Circle para el registro de juegos (contrato en js/games/README.md). */
import { defineGame } from '../../core/game-definition.js';
import { generate } from './engine/generator.js';
import { PIECES, SECTORS } from './engine/pieces.js';
import { SmartCircleController } from './controller.js';
import { boardHtml, controls, help } from './templates.js';
import { LEVELS, TOOL, DEFAULT_SETTINGS, SETTINGS } from './config.js';
import meta from './meta.js';

const isPose = v => v && (v.m === 1 || v.m === -1) && Number.isInteger(v.s) && v.s >= 0 && v.s < SECTORS;

export default defineGame({
  ...meta,
  tools: Object.values(TOOL),
  defaultSettings: DEFAULT_SETTINGS,
  settings: SETTINGS,

  workerUrl: new URL('./worker.js', import.meta.url),
  generate,
  isValidPuzzle: (p, L) => Array.isArray(p.solution) && p.solution.length === PIECES.length && p.solution.every(isPose) &&
    Array.isArray(p.fixed) && Array.isArray(p.marks) && typeof p.ribsFixed === 'boolean' && p.level === LEVELS[L].target,
  restoreSession: s => {
    if (!Array.isArray(s.place) || s.place.length !== PIECES.length || !s.place.every(v => v === null || isPose(v))) return null;
    if (!Array.isArray(s.tm) || s.tm.length !== PIECES.length) s.tm = PIECES.map(() => 1);
    if (!Number.isInteger(s.ro)) s.ro = s.p.o;
    if (typeof s.sel !== 'number') s.sel = -1;
    return s;
  },
  sizeLabel: () => '',

  boardHtml: boardHtml(),
  controls: controls(),
  help: help(),
  Controller: SmartCircleController
});
