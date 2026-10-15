/* Partida de Killer Sudoku: como el Sudoku (core/digit-grid-controller.js), con jaulas. */
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
    // lo que no cambia en toda la partida: casillas que se ven (con la jaula) y los grupos del solucionador
    this.peers = peersOf(p.cages);
    this.prepared = prepare(p.cages);
    this.board.build(p.cages);
  }
}
