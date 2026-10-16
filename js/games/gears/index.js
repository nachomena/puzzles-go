/* Definición de Engranajes para el registro de juegos (contrato en js/games/README.md). */
import { defineGame } from '../../core/game-definition.js';
import { generate, LEVEL_RULES } from './engine/generator.js';
import { GearsController } from './controller.js';
import { boardHtml, controls, help } from './templates.js';
import { LEVELS, TOOL, DEFAULT_SETTINGS, SETTINGS } from './config.js';
import meta from './meta.js';

const isList = (a, len, ok) => Array.isArray(a) && a.length === len && a.every(ok);
const isCell = (v, n) => Number.isInteger(v) && v >= 0 && v < n;

function isValidPuzzle(p, L){
  const rule = LEVEL_RULES[p.level], n = p.w * p.h;
  return p.level === LEVELS[L].target && !!rule && p.w === rule.w && p.h === rule.h &&
    isCell(p.crank, n) && isCell(p.lock, n) && Array.isArray(p.fixed) && p.fixed.every(i => isCell(i, n)) &&
    !!p.clues && typeof p.clues === 'object' && Object.entries(p.clues).every(([i, c]) => isCell(Number(i), n) && Number.isInteger(c) && c >= 0 && c <= 6) &&
    isList(p.spin, n, v => v >= -1 && v <= 1) && isList(p.solution, n, v => v === 0 || v === 1);
}

export default defineGame({
  ...meta,
  tools: Object.values(TOOL),
  defaultSettings: DEFAULT_SETTINGS,
  settings: SETTINGS,

  workerUrl: new URL('./worker.js', import.meta.url),
  generate,
  isValidPuzzle,
  restoreSession: s => isList(s.marks, s.p.w * s.p.h, v => v === 0 || v === 1 || v === 2) ? s : null,
  sizeLabel: p => `${p.w}×${p.h}`,

  boardHtml: boardHtml(),
  controls: controls(),
  help: help(),
  Controller: GearsController
});
