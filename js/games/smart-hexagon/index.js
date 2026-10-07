/* Definición de Smart Hexagon para el registro de juegos (contrato en js/games/README.md). */
import { defineGame } from '../../core/game-definition.js';
import { generate } from './engine/generator.js';
import { PIECES, cellsOf } from './engine/pieces.js';
import { SmartHexagonController } from './controller.js';
import { boardHtml, controls, help } from './templates.js';
import { LEVELS, TOOL, DEFAULT_SETTINGS, SETTINGS } from './config.js';
import meta from './meta.js';

const isPose = (v, p) => v && (v.m === 0 || v.m === 1) && Number.isInteger(v.r) && v.r >= 0 && v.r < 6 &&
  Number.isInteger(v.tu) && Number.isInteger(v.tv) && !!cellsOf(p, v);
const isTrayList = (a, ok) => Array.isArray(a) && a.length === PIECES.length && a.every(ok);

export default defineGame({
  ...meta,
  tools: Object.values(TOOL),
  defaultSettings: DEFAULT_SETTINGS,
  settings: SETTINGS,

  workerUrl: new URL('./worker.js', import.meta.url),
  generate,
  isValidPuzzle: (p, L) => Array.isArray(p.solution) && p.solution.length === PIECES.length &&
    p.solution.every(isPose) && Array.isArray(p.fixed) && p.level === LEVELS[L].target,
  restoreSession: s => {
    if (!Array.isArray(s.place) || s.place.length !== PIECES.length || !s.place.every((v, p) => v === null || isPose(v, p))) return null;
    if (!isTrayList(s.tm, v => v === 0 || v === 1)) s.tm = PIECES.map(() => 0);
    if (!isTrayList(s.tr, v => Number.isInteger(v) && v >= 0 && v < 6)) s.tr = PIECES.map(() => 0);
    if (typeof s.sel !== 'number') s.sel = -1;
    return s;
  },
  sizeLabel: () => '',

  boardHtml: boardHtml(),
  controls: controls(),
  help: help(),
  Controller: SmartHexagonController
});
