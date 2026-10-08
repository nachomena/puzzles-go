/* Definición de Katamino para el registro de juegos (contrato en js/games/README.md). */
import { defineGame } from '../../core/game-definition.js';
import { generate } from './engine/generator.js';
import { PIECES, cellsOf } from './engine/pieces.js';
import { penta } from './engine/sets.js';
import { KataminoController } from './controller.js';
import { renderPicker } from './picker.js';
import { boardHtml, controls, help } from './templates.js';
import { LEVELS, TOOL, DEFAULT_SETTINGS, SETTINGS } from './config.js';
import meta, { pentaKey, rowName } from './meta.js';

const isPose = (v, p, n) => v && (v.m === 0 || v.m === 1) && Number.isInteger(v.r) && v.r >= 0 && v.r < 4 &&
  Number.isInteger(v.x) && Number.isInteger(v.y) && !!cellsOf(p, v, n);
const isTrayList = (a, ok) => Array.isArray(a) && a.length === PIECES.length && a.every(ok);

export default defineGame({
  ...meta,
  tools: Object.values(TOOL),
  defaultSettings: DEFAULT_SETTINGS,
  settings: SETTINGS,
  /** Estadísticas por PENTA: así se sabe cuáles están resueltos y el récord de cada uno. */
  statsKey: s => pentaKey(s.L, s.p.label, s.p.n),
  statsName: s => `${rowName(s.p.label)} · PENTA ${s.p.n}`,
  /** Al elegir un desafío se abre su tabla de PENTAS en vez de empezar una partida. */
  picker: {
    render: renderPicker,
    /** Tablero del PENTA tocado en la tabla (data-row, data-n). */
    puzzle: (L, { row, n }) => penta(L, row, Number(n)),
    same: (cur, p) => cur.p.label === p.label && cur.p.n === p.n
  },

  workerUrl: new URL('./worker.js', import.meta.url),
  generate,
  isValidPuzzle: (p, L) => p.level === LEVELS[L].target,
  restoreSession: s => {
    const p = penta(s.L, s.p?.label, s.p?.n);
    if (!p || !Array.isArray(s.place) || s.place.length !== PIECES.length) return null;
    if (!s.place.every((v, piece) => v === null || (p.pieces.includes(piece) && isPose(v, piece, p.n)))) return null;
    s.p = p;
    if (!isTrayList(s.tm, v => v === 0 || v === 1)) s.tm = PIECES.map(() => 0);
    if (!isTrayList(s.tr, v => Number.isInteger(v) && v >= 0 && v < 4)) s.tr = PIECES.map(() => 0);
    if (typeof s.sel !== 'number') s.sel = -1;
    return s;
  },
  sizeLabel: p => `${rowName(p.label)} · PENTA ${p.n}`,

  boardHtml: boardHtml(),
  controls: controls(),
  help: help(),
  Controller: KataminoController
});
