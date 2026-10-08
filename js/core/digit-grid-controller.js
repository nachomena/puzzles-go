/* Partida de números en una cuadrícula de N × N (Sudoku, KenKen): elegir casilla y luego número, con
   lápiz para notas, goma, teclado físico y deshacer.

   La subclase da el tablero (`board`, con build/render/flash/celebrate/cellAt/cellSize/invalidate) y:
     n                         lado (y dígitos del 1 al n)
     givensOf(puzzle)          números fijos del reto (0 = casilla libre)
     conflicts(values)         Uint8Array con 1 en las casillas repetidas
     peersOf(i)                casillas que ven a i (para limpiar notas)
     hintFor(values, solution) → { cell, digit } o null */
import { GameController } from './game-controller.js';
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

  /* ---------- Pasos de la plantilla ---------- */

  createSession(L, puzzle){
    const givens = this.givensOf(puzzle);
    return { L, p: puzzle, values: givens.slice(), notes: new Array(givens.length).fill(0), sel: -1, time: 0, done: false, hints: 0 };
  }
  /** Lo que la subclase pase de más al tablero (p. ej. las jaulas del KenKen). */
  boardExtras(){ return {}; }
  renderBoard(){
    const s = this.session, { values, notes, sel } = s, n = this.n;
    this.board.render({
      values, notes, sel,
      givens: this.givensOf(s.p),
      bad: this.settings.errors ? this.conflicts(values) : null,
      same: this.settings.sameDigit && sel >= 0 ? values[sel] : 0,
      ...this.boardExtras()
    });
    const counts = new Array(n + 1).fill(0);
    for (const v of values) if (v) counts[v]++;
    // el teclado puede traer más números que el tablero (KenKen de distintos tamaños)
    this.keypad.style.setProperty('--keys', n);
    this.#keys.forEach(k => { k.hidden = Number(k.dataset.digit) > n; k.classList.toggle('is-done', counts[k.dataset.digit] >= n); });
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
    if (Number.isInteger(d) && d >= 1 && d <= this.n){ this.input(d); return true; }
    if (['Backspace', 'Delete', '0'].includes(e.key)){ this.erase(); return true; }
    const arrows = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
    if (e.key in arrows){ this.#move(...arrows[e.key]); return true; }
    if (e.key === 'n' || e.key === 'l'){ this.setTool(this.tool === PEN ? PENCIL : PEN); return true; }
    return false;
  }

  /* ---------- Entrada ---------- */

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

  /** Coloca el dígito d en la casilla i (limpiando notas si procede). */
  #place(i, d){
    const s = this.session;
    s.values[i] = d;
    s.notes[i] = 0;
    if (this.settings.autoNotes) for (const p of this.peersOf(i)) s.notes[p] &= ~bit(d);
  }

  input(d){
    const s = this.session;
    if (!this.active) return;
    if (s.sel < 0){ this.notify('Elige una casilla'); return; }
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
    return cell >= 0 ? { cell, message: 'Este número no va aquí' } : null;
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
