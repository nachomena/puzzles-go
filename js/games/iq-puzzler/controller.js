/* Partida de IQ Puzzler Pro (arrastrar, girar y voltear: core/grid-pieces-controller.js).
   Las piezas que trae el reto están fijas; hay una sola solución. */
import { GridPiecesController } from '../../core/grid-pieces-controller.js';
import { IqPuzzlerBoardView } from './board-view.js';
import { W, H, PIECES, orient, cellsOf } from './engine/pieces.js';
import { fits, isSolved, findMistake, findHint } from './rules.js';

export class IqPuzzlerController extends GridPiecesController {
  constructor(deps){ super(deps, new IqPuzzlerBoardView(deps.screen)); }

  isFixed(piece){ return this.session.p.fixed.includes(piece); }
  boardSize(){ return { W, H }; }
  orient(piece, m, r){ return orient(piece, m, r); }
  fits(place, piece, pose){ return fits(place, piece, pose); }

  /* ---------- Pasos de la plantilla ---------- */

  createSession(L, puzzle){
    const place = PIECES.map((_, p) => puzzle.fixed.includes(p) ? { ...puzzle.solution[p] } : null);
    return this.baseSession(L, puzzle, PIECES.length, place);
  }
  mountBoard(){ this.view.build(); }
  renderBoard(){
    const s = this.session;
    this.view.render({ place: s.place, tm: s.tm, tr: s.tr, fixed: s.p.fixed, sel: s.sel });
  }
  isSolved(){ return isSolved(this.session.place); }

  findMistake(){
    const s = this.session, m = findMistake(s.place, s.p.solution, s.p.fixed);
    return m && { ...m, message: 'Esta pieza no va aquí' };
  }
  showMistake({ piece }){ this.session.sel = piece; this.render(); this.view.flash(piece); }
  giveHint(){
    const s = this.session, hint = findHint(s.place, s.p.solution);
    if (!hint) return false;
    this.placeAt(hint.piece, hint.pose, cellsOf);
    s.sel = hint.piece;
    this.commit(true);
    this.view.flash(hint.piece);
    return true;
  }
}
