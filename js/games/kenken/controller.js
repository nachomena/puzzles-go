/* Partida de KenKen: como el Sudoku (core/digit-grid-controller.js), sin cajas pero con jaulas. */
import { DigitGridController } from '../../core/digit-grid-controller.js';
import { KenKenBoard } from './board-view.js';
import { peers, conflicts, findHint } from './rules.js';

export class KenKenController extends DigitGridController {
  constructor(deps){ super(deps, new KenKenBoard(deps.screen.querySelector('.board'))); }

  get n(){ return this.session.p.n; }
  /** No hay números puestos al empezar: las jaulas de una casilla también las escribe el jugador. */
  givensOf(p){ return this.zeros?.length === p.n * p.n ? this.zeros : (this.zeros = new Array(p.n * p.n).fill(0)); }
  conflicts(values){ const p = this.session.p; return conflicts(p.n, p.cages, values); }
  peersOf(i){ return peers(this.n, i); }
  hintFor(values, solution){ const p = this.session.p; return findHint(p.n, p.cages, values, solution); }
  mountBoard(){ const p = this.session.p; this.board.build(p.n, p.cages); }
}
