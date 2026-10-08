/* Definición de Rush Hour para el registro de juegos (contrato en js/games/README.md). */
import { defineGame } from '../../core/game-definition.js';
import { generate } from './engine/generator.js';
import { N, occupancy } from './engine/board.js';
import { RushHourController } from './controller.js';
import { boardHtml, controls, help } from './templates.js';
import { LEVELS, TOOL, DEFAULT_SETTINGS, SETTINGS } from './config.js';
import meta from './meta.js';

const isCar = c => c && (c.len === 2 || c.len === 3) && (c.dir === 'h' || c.dir === 'v') && Number.isInteger(c.line) && c.line >= 0 && c.line < N;
/** Posiciones válidas: dentro del tablero y sin solaparse. */
const isLayout = (cars, pos) => Array.isArray(pos) && pos.length === cars.length &&
  pos.every((p, i) => Number.isInteger(p) && p >= 0 && p + cars[i].len <= N) &&
  [...occupancy(cars, pos)].filter(v => v >= 0).length === cars.reduce((n, c) => n + c.len, 0);

export default defineGame({
  ...meta,
  tools: Object.values(TOOL),
  defaultSettings: DEFAULT_SETTINGS,
  settings: SETTINGS,

  workerUrl: new URL('./worker.js', import.meta.url),
  generate,
  isValidPuzzle: (p, L) => Array.isArray(p.cars) && p.cars.every(isCar) && isLayout(p.cars, p.pos) &&
    Number.isInteger(p.min) && p.level === LEVELS[L].target,
  restoreSession: s => {
    if (!isLayout(s.p.cars, s.pos)) return null;
    if (!Number.isInteger(s.moves)) s.moves = 0;
    return s;
  },
  sizeLabel: p => `${p.min} mov.`,

  boardHtml: boardHtml(),
  controls: controls(),
  help: help(),
  Controller: RushHourController
});
