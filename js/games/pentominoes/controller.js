/* Pentominoes game (drag, rotate and flip: core/grid-pieces-controller.js). On solving a puzzle, the
   next one in the row starts with an empty board, one more row and a new piece. */
import { GridPiecesController } from '../../core/grid-pieces-controller.js';
import { t } from '../../i18n/index.js';
import { PentominoesBoardView } from './board-view.js';
import { W, PIECES, orient } from './engine/pieces.js';
import { nextChallenge } from './engine/sets.js';
import { fits, isSolved, check, hintFrom } from './rules.js';

export class PentominoesController extends GridPiecesController {
  constructor(deps){ super(deps, new PentominoesBoardView(deps.screen)); }

  get #n(){ return this.session.p.n; }
  boardSize(){ return { W, H: this.#n }; }
  orient(piece, m, r){ return orient(piece, m, r); }
  fits(place, piece, pose){ return fits(place, piece, pose, this.#n); }

  /* ---------- Template steps ---------- */

  createSession(L, puzzle){ return this.baseSession(L, puzzle, PIECES.length); }
  mountBoard(){ this.view.build(this.#n); }
  renderBoard(){
    const s = this.session;
    this.view.render({ pieces: s.p.pieces, place: s.place, tm: s.tm, tr: s.tr, sel: s.sel });
  }
  isSolved(){ return isSolved(this.session.place, this.session.p.pieces); }

  /**
   * Next puzzle, with an empty board: the next one in the row or, at the end of it, the first of the
   * next row. false if it was the last of the set.
   */
  next(){
    const s = this.session;
    if (!s) return false;
    const puzzle = nextChallenge(s.p.part, s.p.label, s.p.n);
    if (!puzzle) return false;
    this.begin(s.L, { ...puzzle, part: s.p.part });
    return true;
  }

  /* ---------- Hints: there isn't a single solution, look for one that respects what is placed ---------- */

  findMistake(){
    const s = this.session, res = check(s.place, s.p.pieces);
    this.solution = res.solution || null;
    if (res.solution) return null;
    return res.mistake >= 0
      ? { piece: res.mistake, message: t('play.wrongPiece') }
      : { piece: -1, message: t('games.pentominoes.stuck') };
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
