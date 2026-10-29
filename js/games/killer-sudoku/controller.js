/* Killer Sudoku game: like Sudoku (core/digit-grid-controller.js), with cages. */
import { DigitGridController } from '../../core/digit-grid-controller.js';
import { KillerBoard } from './board-view.js';
import { SIZE } from '../sudoku/engine/grid.js';
import { prepare } from './engine/logic-solver.js';
import { peersOf, conflicts, findHint } from './rules.js';

export class KillerController extends DigitGridController {
  constructor(deps){ super(deps, new KillerBoard(deps.screen.querySelector('.board'))); }

  get n(){ return SIZE; }
  givensOf(p){ return p.givens; }
  conflicts(values){ return conflicts(this.session.p.cages, values); }
  peersOf(i){ return this.peers[i]; }
  hintFor(values, solution){ const p = this.session.p; return findHint(p.cages, p.level, values, solution, this.prepared); }
  mountBoard(){
    const p = this.session.p;
    // what doesn't change during the whole game: cells that see each other (with the cage) and the solver's groups
    this.peers = peersOf(p.cages);
    this.prepared = prepare(p.cages);
    this.board.build(p.cages, { tint: this.settings.tint });
  }
  onSetting(key){ if (key === 'tint') this.mountBoard(); else super.onSetting(key); }
}
