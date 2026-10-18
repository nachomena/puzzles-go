/* A game of numbers on an N × N grid (Sudoku, Calcudoku): pick a cell and then a number, with a
   pencil for notes, an eraser, physical keyboard and undo.

   The subclass provides the board (`board`, with build/render/flash/celebrate/cellAt/cellSize/invalidate) and:
     n                         side (and, unless told otherwise, digits from 1 to n)
     digits                    (optional) keypad numbers, from 1 to digits; n by default
     digitCap                  (optional) times each number appears on the board, to dim its key
     givensOf(puzzle)          the puzzle's fixed numbers (0 = free cell)
     conflicts(values)         Uint8Array with 1 in repeated cells
     peersOf(i)                cells that see i (to clear notes)
     hintFor(values, solution) → { cell, digit } or null */
import { GameController } from './game-controller.js';
import { t } from '../i18n/index.js';
import { bindCellDrag } from '../ui/cell-drag.js';

export const PEN = 'pen', PENCIL = 'pencil';
const bit = d => 1 << (d - 1);

export class DigitGridController extends GameController {
  constructor(deps, board){
    super(deps);
    this.board = board;
    this.keypad = deps.screen.querySelector('[data-keypad]');
    bindCellDrag(this.board.root, {
      cellAt: (x, y) => this.board.cellAt(x, y),
      cellSize: () => this.board.cellSize(),
      enabled: () => this.active,
      onStart: i => this.select(i),
      onEnter: () => {},
      onEnd: () => {}
    });
  }

  get #keys(){ return [...this.keypad.querySelectorAll('[data-digit]')]; }
  get digits(){ return this.n; }
  get digitCap(){ return this.n; }

  /* ---------- Template steps ---------- */

  createSession(L, puzzle){
    const givens = this.givensOf(puzzle);
    return { L, p: puzzle, values: givens.slice(), notes: new Array(givens.length).fill(0), sel: -1, time: 0, done: false, hints: 0 };
  }
  /** Whatever extra the subclass passes to the board (e.g. Calcudoku cages). */
  boardExtras(){ return {}; }
  renderBoard(){
    const s = this.session, { values, notes, sel } = s;
    this.board.render({
      values, notes, sel,
      givens: this.givensOf(s.p),
      bad: this.settings.errors ? this.conflicts(values) : null,
      same: this.settings.sameDigit && sel >= 0 ? values[sel] : 0,
      ...this.boardExtras()
    });
    const digits = this.digits, counts = new Array(digits + 1).fill(0);
    for (const v of values) if (v > 0) counts[v]++;
    // the keypad may have more numbers than the board (Calcudoku of different sizes)
    this.keypad.style.setProperty('--keys', digits);
    this.#keys.forEach(k => { k.hidden = Number(k.dataset.digit) > digits; k.classList.toggle('is-done', counts[k.dataset.digit] >= this.digitCap); });
    this.keypad.classList.toggle('is-pencil', this.tool === PENCIL);
  }
  snapshot(){ return { v: this.session.values.slice(), n: this.session.notes.slice() }; }
  restore(snap){ this.session.values = snap.v; this.session.notes = snap.n; }
  hasInput(){
    const s = this.session, g = this.givensOf(s.p);
    return s.values.some((v, i) => v !== g[i]) || s.notes.some(Boolean);
  }
  clearInput(){
    const s = this.session;
    s.values = this.givensOf(s.p).slice();
    s.notes = s.notes.map(() => 0);
  }
  isSolved(){ const s = this.session; return s.values.every((v, i) => v === s.p.solution[i]); }
  onSetting(){ this.board.invalidate(); }
  celebrate(){
    this.session.sel = -1;
    this.renderBoard();
    this.board.celebrate();
  }

  get actions(){
    return {
      tool: el => this.setTool(el.dataset.tool),
      digit: el => this.input(Number(el.dataset.digit)),
      erase: () => this.erase()
    };
  }

  onKey(e){
    if (!this.active) return false;
    const d = Number(e.key);
    if (Number.isInteger(d) && d >= 1 && d <= this.digits){ this.input(d); return true; }
    if (['Backspace', 'Delete', '0'].includes(e.key)){ this.erase(); return true; }
    const arrows = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
    if (e.key in arrows){ this.#move(...arrows[e.key]); return true; }
    if (e.key === 'n' || e.key === 'l'){ this.setTool(this.tool === PEN ? PENCIL : PEN); return true; }
    return false;
  }

  /* ---------- Input ---------- */

  #editable(i){ return i >= 0 && !this.givensOf(this.session.p)[i]; }

  select(i){
    this.session.sel = i;
    this.render();
  }
  #move(dx, dy){
    const s = this.session, n = this.n;
    if (s.sel < 0){ this.select(0); return; }
    const r = ((s.sel / n) | 0), c = s.sel % n;
    this.select(((r + dy + n) % n) * n + (c + dx + n) % n);
  }

  /** Places digit d in cell i (clearing notes if needed). */
  #place(i, d){
    const s = this.session;
    s.values[i] = d;
    s.notes[i] = 0;
    if (this.settings.autoNotes) for (const p of this.peersOf(i)) s.notes[p] &= ~bit(d);
  }

  input(d){
    const s = this.session;
    if (!this.active) return;
    if (s.sel < 0){ this.notify(t('play.pickCell')); return; }
    if (!this.#editable(s.sel)) return;
    const i = s.sel;
    if (this.tool === PENCIL){
      if (s.values[i]) return;
      this.record();
      s.notes[i] ^= bit(d);
    } else {
      this.record();
      if (s.values[i] === d) s.values[i] = 0;
      else this.#place(i, d);
    }
    this.commit(true);
  }

  erase(){
    const s = this.session;
    if (!this.active || !this.#editable(s.sel)) return;
    const i = s.sel;
    if (!s.values[i] && !s.notes[i]) return;
    this.record();
    s.values[i] = 0;
    s.notes[i] = 0;
    this.commit(true);
  }

  findMistake(){
    const s = this.session, cell = s.values.findIndex((v, i) => v && v !== s.p.solution[i]);
    return cell >= 0 ? { cell, message: t('play.wrongNumber') } : null;
  }
  showMistake({ cell }){
    this.session.sel = cell;
    this.render();
    this.board.flash(cell);
  }
  giveHint(){
    const s = this.session, hint = this.hintFor(s.values, s.p.solution);
    if (!hint) return false;
    this.record();
    this.#place(hint.cell, hint.digit);
    s.sel = hint.cell;
    this.commit(true);
    this.board.flash(hint.cell);
    return true;
  }
}
