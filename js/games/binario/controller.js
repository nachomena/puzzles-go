/* Partida de Binario: tocar una casilla alterna rojo → azul → vacía. Las dadas no se cambian. */
import { GameController } from '../../core/game-controller.js';
import { bindCellDrag } from '../../ui/cell-drag.js';
import { BinarioBoard } from './board-view.js';
import { evaluate, isSolved, findMistake, findHint, HINT_WHY } from './rules.js';

export class BinarioController extends GameController {
  constructor(deps){
    super(deps);
    this.board = new BinarioBoard(deps.screen.querySelector('.board'));
    bindCellDrag(this.board.root, {
      cellAt: (x, y) => this.board.cellAt(x, y),
      cellSize: () => this.board.cellSize(),
      enabled: () => this.active,
      onStart: i => this.toggle(i),
      onEnter: () => {},
      onEnd: () => {}
    });
  }

  /* ---------- Pasos de la plantilla ---------- */

  createSession(L, puzzle){ return { L, p: puzzle, g: puzzle.givens.slice(), time: 0, done: false, hints: 0 }; }
  mountBoard(){ const p = this.session.p; this.board.build(p.n, p.givens); }
  renderBoard(){
    const s = this.session;
    this.board.render({ g: s.g, bad: this.settings.errors ? evaluate(s.p.n, s.g) : null });
  }
  snapshot(){ return { g: this.session.g.slice() }; }
  restore(snap){ this.session.g = snap.g.slice(); }
  hasInput(){ const s = this.session; return s.g.some((v, i) => v !== s.p.givens[i]); }
  clearInput(){ this.session.g = this.session.p.givens.slice(); }
  isSolved(){ const s = this.session; return isSolved(s.p.n, s.g); }
  onSetting(){ this.board.invalidate(); }
  celebrate(){ this.board.celebrate(); }

  /** Un toque: vacía → rojo → azul → vacía. Llegar al azul con dos toques seguidos se deshace de una vez. */
  toggle(i){
    const s = this.session;
    if (!this.active || i < 0) return;
    if (s.p.givens[i]){ this.board.flash(i); return; }
    const before = this.snapshot(), from = s.g[i];
    s.g[i] = (from + 1) % 3;
    this.recordTap(i, before, from === 0 ? 'mark' : from === 1 ? 'piece' : null);
    this.commit(true);
  }

  findMistake(){
    const s = this.session, i = findMistake(s.g, s.p.solution);
    return i >= 0 ? { cell: i, message: 'Este color no va aquí' } : null;
  }
  showMistake({ cell }){ this.board.flash(cell); }
  giveHint(){
    const s = this.session, hint = findHint(s.p.n, s.g, s.p.solution);
    if (!hint) return false;
    this.record();
    s.g[hint.i] = hint.v;
    this.commit(true);
    this.board.flash(hint.i);
    this.notify(HINT_WHY[hint.why]);
    return true;
  }
}
