/* Partida de Akari: tocar una casilla blanca alterna marca → bombilla → vacía. */
import { GameController } from '../../core/game-controller.js';
import { bindCellDrag } from '../../ui/cell-drag.js';
import { AkariBoard } from './board-view.js';
import { isBlack, sights } from './engine/light.js';
import { evaluate, isSolved, findMistake, findHint } from './rules.js';

/** Tras cada toque (0 vacía, 1 bombilla, 2 marca): vacía → marca → bombilla → vacía. */
const NEXT = [2, 0, 1];

export class AkariController extends GameController {
  constructor(deps){
    super(deps);
    this.board = new AkariBoard(deps.screen.querySelector('.board'));
    bindCellDrag(this.board.root, {
      cellAt: (x, y) => this.board.cellAt(x, y),
      cellSize: () => this.board.cellSize(),
      enabled: () => this.active,
      onStart: i => this.toggle(i),
      onEnter: () => {},
      onEnd: () => {}
    });
  }

  get #see(){ const p = this.session.p; return this.cache?.p === p ? this.cache.see : (this.cache = { p, see: sights(p.n, p.cells) }).see; }

  /* ---------- Pasos de la plantilla ---------- */

  createSession(L, puzzle){ return { L, p: puzzle, marks: new Array(puzzle.n * puzzle.n).fill(0), time: 0, done: false, hints: 0 }; }
  mountBoard(){ const p = this.session.p; this.board.build(p.n, p.cells); }
  renderBoard(){
    const s = this.session, { light, clash, over } = evaluate(s.p.n, s.p.cells, s.marks, this.#see);
    this.board.render({ marks: s.marks, light, clash: this.settings.errors ? clash : null, over: this.settings.errors ? over : null });
  }
  snapshot(){ return { marks: this.session.marks.slice() }; }
  restore(snap){ this.session.marks = snap.marks.slice(); }
  hasInput(){ return this.session.marks.some(Boolean); }
  clearInput(){ this.session.marks.fill(0); }
  isSolved(){ const s = this.session; return isSolved(s.p.n, s.p.cells, s.marks); }
  onSetting(){ this.board.invalidate(); }
  celebrate(){ this.board.celebrate(); }

  toggle(i){
    const s = this.session;
    if (!this.active || i < 0 || isBlack(s.p.cells[i])) return;
    const before = this.snapshot(), from = s.marks[i];
    s.marks[i] = NEXT[from];
    this.recordTap(i, before, from === 0 ? 'mark' : from === 2 ? 'piece' : null);
    this.commit(true);
  }

  findMistake(){
    const s = this.session, i = findMistake(s.marks, s.p.solution);
    return i >= 0 ? { cell: i, message: s.marks[i] === 1 ? 'Aquí no va una bombilla' : 'Aquí sí va una bombilla' } : null;
  }
  showMistake({ cell }){ this.board.flash(cell); }
  giveHint(){
    const s = this.session, i = findHint(s.marks, s.p.solution);
    if (i < 0) return false;
    this.record();
    s.marks[i] = 1;
    this.commit(true);
    this.board.flash(i);
    return true;
  }
}
