/* Partida de Katamino (arrastrar, girar y voltear: core/grid-pieces-controller.js). Al resolver un
   PENTA, el siguiente de la fila empieza con el tablero vacío, una fila más y una pieza nueva. */
import { GridPiecesController } from '../../core/grid-pieces-controller.js';
import { KataminoBoardView } from './board-view.js';
import { W, PIECES, orient } from './engine/pieces.js';
import { nextPenta } from './engine/sets.js';
import { fits, isSolved, check, hintFrom } from './rules.js';

export class KataminoController extends GridPiecesController {
  constructor(deps){ super(deps, new KataminoBoardView(deps.screen)); }

  get #n(){ return this.session.p.n; }
  boardSize(){ return { W, H: this.#n }; }
  orient(piece, m, r){ return orient(piece, m, r); }
  fits(place, piece, pose){ return fits(place, piece, pose, this.#n); }

  /* ---------- Pasos de la plantilla ---------- */

  createSession(L, puzzle){ return this.baseSession(L, puzzle, PIECES.length); }
  mountBoard(){ this.view.build(this.#n); }
  renderBoard(){
    const s = this.session;
    this.view.render({ pieces: s.p.pieces, place: s.place, tm: s.tm, tr: s.tr, sel: s.sel });
  }
  isSolved(){ return isSolved(this.session.place, this.session.p.pieces); }

  /**
   * Siguiente PENTA, con el tablero vacío: el siguiente de la fila o, al acabarla, el primero de la
   * fila siguiente. false si era el último del desafío.
   */
  next(){
    const s = this.session;
    if (!s) return false;
    const puzzle = nextPenta(s.L, s.p.label, s.p.n);
    if (!puzzle) return false;
    this.begin(s.L, puzzle);
    return true;
  }

  /* ---------- Pistas: no hay una única solución, se busca una que respete lo puesto ---------- */

  findMistake(){
    const s = this.session, res = check(s.place, s.p.pieces);
    this.solution = res.solution || null;
    if (res.solution) return null;
    return res.mistake >= 0
      ? { piece: res.mistake, message: 'Esta pieza no va aquí' }
      : { piece: -1, message: 'Así no se puede completar: quita alguna pieza' };
  }
  showMistake({ piece }){
    if (piece < 0) return;
    this.session.sel = piece; this.render(); this.view.flash(piece);
  }
  giveHint(){
    const s = this.session, hint = this.solution && hintFrom(s.place, s.p.pieces, this.solution);
    if (!hint) return false;
    s.place[hint.piece] = { ...hint.pose };
    s.sel = hint.piece;
    this.commit(true);
    this.view.flash(hint.piece);
    return true;
  }
}
