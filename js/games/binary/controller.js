/* Binary game: tapping a cell cycles red → blue → empty. The given ones can't be changed. */
import { GameController } from '../../core/game-controller.js';
import { t } from '../../i18n/index.js';
import { bindCellDrag } from '../../ui/cell-drag.js';
import { BinaryBoard } from './board-view.js';
import { evaluate, isSolved, findMistake, findHint, HINT_WHY } from './rules.js';

export class BinaryController extends GameController {
  constructor(deps){
    super(deps);
    this.board = new BinaryBoard(deps.screen.querySelector('.board'));
    bindCellDrag(this.board.root, {
      cellAt: (x, y) => this.board.cellAt(x, y),
      cellSize: () => this.board.cellSize(),
      enabled: () => this.active,
      onStart: i => this.toggle(i),
      onEnter: () => {},
      onEnd: () => {}
    });
  }

  /* ---------- Template steps ---------- */

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

  /** A tap: empty → red → blue → empty. Every tap is a step: undoing blue goes back to red. */
  toggle(i){
    const s = this.session;
    if (!this.active || i < 0) return;
    if (s.p.givens[i]){ this.board.flash(i); return; }
    this.record();
    s.g[i] = (s.g[i] + 1) % 3;
    this.commit(true);
  }

  findMistake(){
    const s = this.session, i = findMistake(s.g, s.p.solution);
    return i >= 0 ? { cell: i, message: t('games.binary.wrongColor') } : null;
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
