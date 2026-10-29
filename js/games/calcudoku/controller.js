/* Calcudoku game: like Sudoku (core/digit-grid-controller.js), with no boxes but with cages. */
import { DigitGridController } from '../../core/digit-grid-controller.js';
import { CalcudokuBoard } from './board-view.js';
import { peers, conflicts, findHint } from './rules.js';

export class CalcudokuController extends DigitGridController {
  constructor(deps){ super(deps, new CalcudokuBoard(deps.screen.querySelector('.board'))); }

  get n(){ return this.session.p.n; }
  /** No numbers are given at the start: the player writes even the one-cell cages. */
  givensOf(p){ return this.zeros?.length === p.n * p.n ? this.zeros : (this.zeros = new Array(p.n * p.n).fill(0)); }
  conflicts(values){ const p = this.session.p; return conflicts(p.n, p.cages, values); }
  peersOf(i){ return peers(this.n, i); }
  hintFor(values, solution){ const p = this.session.p; return findHint(p.n, p.cages, values, solution); }
  mountBoard(){ const p = this.session.p; this.board.build(p.n, p.cages, { tint: this.settings.tint }); }
  onSetting(key){ if (key === 'tint') this.mountBoard(); else super.onSetting(key); }
}
