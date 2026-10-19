/* Pentominoes definition for the game registry (contract in js/games/README.md). */
import { defineGame } from '../../core/game-definition.js';
import { generate } from './engine/generator.js';
import { PIECES, cellsOf } from './engine/pieces.js';
import { challenge } from './engine/sets.js';
import { PentominoesController } from './controller.js';
import { renderPicker } from './picker.js';
import { boardHtml, controls, help } from './templates.js';
import { LEVELS, TOOL, DEFAULT_SETTINGS, SETTINGS } from './config.js';
import meta, { challengeKey, rowName, piecesName } from './meta.js';

/** Puzzle `n` of row `label` of a set, with the set recorded (for the statistics), or null. */
const puzzleOf = (part, label, n) => { const p = challenge(part, label, n); return p && { ...p, part }; };

const isPose = (v, p, n) => v && (v.m === 0 || v.m === 1) && Number.isInteger(v.r) && v.r >= 0 && v.r < 4 &&
  Number.isInteger(v.x) && Number.isInteger(v.y) && !!cellsOf(p, v, n);
const isTrayList = (a, ok) => Array.isArray(a) && a.length === PIECES.length && a.every(ok);

export default defineGame({
  ...meta,
  confirmReset: false,
  tools: Object.values(TOOL),
  defaultSettings: DEFAULT_SETTINGS,
  settings: SETTINGS,
  /** Statistics per puzzle: that's how it's known which are solved and the record of each one. */
  statsKey: s => challengeKey(s.p.part, s.p.label, s.p.n),
  statsName: s => `${rowName(s.p.part, s.p.label)} · ${piecesName(s.p.n)}`,
  /** Choosing a level opens its puzzle table instead of starting a game. */
  picker: {
    render: renderPicker,
    /** Board of the puzzle tapped in the table (data-part, data-row, data-n). */
    puzzle: (L, { part, row, n }) => LEVELS[L].parts.includes(part) ? puzzleOf(part, row, Number(n)) : null,
    same: (cur, p) => cur.p.part === p.part && cur.p.label === p.label && cur.p.n === p.n
  },

  workerUrl: new URL('./worker.js', import.meta.url),
  generate,
  isValidPuzzle: (p, L) => p.level === LEVELS[L].target,
  restoreSession: s => {
    const p = LEVELS[s.L]?.parts.includes(s.p?.part) && puzzleOf(s.p.part, s.p.label, s.p.n);
    if (!p || !Array.isArray(s.place) || s.place.length !== PIECES.length) return null;
    if (!s.place.every((v, piece) => v === null || (p.pieces.includes(piece) && isPose(v, piece, p.n)))) return null;
    s.p = p;
    if (!isTrayList(s.tm, v => v === 0 || v === 1)) s.tm = PIECES.map(() => 0);
    if (!isTrayList(s.tr, v => Number.isInteger(v) && v >= 0 && v < 4)) s.tr = PIECES.map(() => 0);
    if (typeof s.sel !== 'number') s.sel = -1;
    return s;
  },
  sizeLabel: p => `${rowName(p.part, p.label)} · ${piecesName(p.n)}`,

  boardHtml: boardHtml(),
  controls: controls(),
  help: help(),
  Controller: PentominoesController
});
