/* Partida de Sudoku: seleccionar casilla y luego número, con modo lápiz para notas. */
import { GameController } from '../../core/game-controller.js';
import { bindCellDrag } from '../../ui/cell-drag.js';
import { SudokuBoard } from './board-view.js';
import { CELLS, SIZE, bit } from './engine/grid.js';
import { TOOL } from './config.js';
import { conflicts, isSolved, digitCounts, clearNoteAround, findHint } from './rules.js';

const ARROWS = { ArrowUp: -SIZE, ArrowDown: SIZE, ArrowLeft: -1, ArrowRight: 1 };

export class SudokuController extends GameController {
  constructor(deps){
    super(deps);
    this.board = new SudokuBoard(deps.screen.querySelector('.board'));
    this.keypad = deps.screen.querySelector('[data-keypad]');
    this.keys = [...this.keypad.querySelectorAll('[data-digit]')];
    bindCellDrag(this.board.root, {
      cellAt: (x, y) => this.board.cellAt(x, y),
      cellSize: () => this.board.cellSize(),
      enabled: () => this.active,
      onStart: i => this.select(i),
      onEnter: () => {},
      onEnd: () => {}
    });
  }

  /* ---------- Pasos de la plantilla ---------- */

  createSession(L, puzzle){
    return { L, p: puzzle, values: puzzle.givens.slice(), notes: new Array(CELLS).fill(0), sel: -1, time: 0, done: false, hints: 0 };
  }
  mountBoard(){ this.board.build(); }
  renderBoard(){
    const s = this.session, { values, notes, sel } = s;
    this.board.render({
      values, notes, sel,
      givens: s.p.givens,
      bad: this.settings.errors ? conflicts(values) : null,
      same: this.settings.sameDigit && sel >= 0 ? values[sel] : 0
    });
    const counts = digitCounts(values);
    this.keys.forEach(k => k.classList.toggle('is-done', counts[k.dataset.digit] >= SIZE));
    this.keypad.classList.toggle('is-pencil', this.tool === TOOL.PENCIL);
  }
  snapshot(){ return { v: this.session.values.slice(), n: this.session.notes.slice() }; }
  restore(snap){ this.session.values = snap.v; this.session.notes = snap.n; }
  hasInput(){
    const s = this.session;
    return s.values.some((v, i) => v !== s.p.givens[i]) || s.notes.some(Boolean);
  }
  clearInput(){
    const s = this.session;
    s.values = s.p.givens.slice();
    s.notes = s.notes.map(() => 0);
  }
  isSolved(){ return isSolved(this.session.values, this.session.p.solution); }
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
    if (/^[1-9]$/.test(e.key)){ this.input(Number(e.key)); return true; }
    if (['Backspace', 'Delete', '0'].includes(e.key)){ this.erase(); return true; }
    if (e.key in ARROWS){ this.#move(ARROWS[e.key]); return true; }
    if (e.key === 'n' || e.key === 'l'){ this.setTool(this.tool === TOOL.PEN ? TOOL.PENCIL : TOOL.PEN); return true; }
    return false;
  }

  /* ---------- Entrada ---------- */

  #editable(i){ return i >= 0 && !this.session.p.givens[i]; }

  select(i){
    this.session.sel = i;
    this.render();
  }
  #move(delta){
    const s = this.session, from = s.sel < 0 ? 0 : s.sel;
    const r = ((from / SIZE) | 0), c = from % SIZE;
    const nr = (r + (Math.abs(delta) === SIZE ? Math.sign(delta) : 0) + SIZE) % SIZE;
    const nc = (c + (Math.abs(delta) === 1 ? delta : 0) + SIZE) % SIZE;
    this.select(s.sel < 0 ? 0 : nr * SIZE + nc);
  }

  /** Coloca el dígito d en la casilla i (limpiando notas si procede). */
  #place(i, d){
    const s = this.session;
    s.values[i] = d;
    s.notes[i] = 0;
    if (this.settings.autoNotes) clearNoteAround(s.notes, i, d);
  }

  input(d){
    const s = this.session;
    if (!this.active) return;
    if (s.sel < 0){ this.notify('Elige una casilla'); return; }
    if (!this.#editable(s.sel)) return;
    const i = s.sel;
    if (this.tool === TOOL.PENCIL){
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

  giveHint(){
    const s = this.session, hint = findHint(s.values, s.p.solution);
    if (!hint) return false;
    if (hint.type === 'wrong'){
      this.notify('Este número no va aquí');
      s.sel = hint.cell;
      this.render();
    } else {
      this.record();
      this.#place(hint.cell, hint.digit);
      s.sel = hint.cell;
      this.commit(true);
    }
    this.board.flash(hint.cell);
    return true;
  }
}
