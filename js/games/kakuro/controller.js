/* Partida de Kakuro: como el Sudoku (core/digit-grid-controller.js), con casillas negras y tramos. */
import { DigitGridController } from '../../core/digit-grid-controller.js';
import { t } from '../../i18n/index.js';
import { KakuroBoard } from './board-view.js';
import { peersOf, conflicts, findHint } from './rules.js';

export class KakuroController extends DigitGridController {
  constructor(deps){ super(deps, new KakuroBoard(deps.screen.querySelector('.board'))); }

  get n(){ return this.session.p.n; }
  get digits(){ return 9; }
  /** Un número puede salir muchas veces: su tecla no se apaga nunca. */
  get digitCap(){ return Infinity; }
  /** Las negras quedan fijas (−1); las blancas, libres. */
  givensOf(p){
    if (this.givensFor !== p){ this.givensFor = p; this.givens = p.white.map(w => w ? 0 : -1); }
    return this.givens;
  }
  conflicts(values){ const p = this.session.p; return conflicts(p.n, p.runs, values); }
  peersOf(i){ return this.peers[i]; }
  hintFor(values){ return findHint(this.session.p, values); }
  isSolved(){ const { p, values } = this.session; return p.white.every((w, i) => !w || values[i] === p.solution[i]); }
  findMistake(){
    const { p, values } = this.session, cell = values.findIndex((v, i) => p.white[i] && v > 0 && v !== p.solution[i]);
    return cell >= 0 ? { cell, message: t('play.wrongNumber') } : null;
  }
  /** Las negras no se seleccionan. */
  select(i){ if (i < 0 || this.session.p.white[i]) super.select(i); }
  mountBoard(){
    const p = this.session.p;
    this.peers = peersOf(p.n, p.runs);
    this.board.build(p);
  }
}
