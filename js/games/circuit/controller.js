/* Circuit game: drag pieces onto the board, tap to pick/rotate and flip. */
import { GameController } from '../../core/game-controller.js';
import { t } from '../../i18n/index.js';
import { bindPieceDrag } from '../../ui/piece-drag.js';
import { CircuitBoardView } from './board-view.js';
import { PIECES, W, H } from './engine/pieces.js';
import { orient, faceCount } from './engine/solver.js';
import { fits, isSolved, findHint, findMistake, occupancy, cellsOf, brokenEnds } from './rules.js';

export class CircuitController extends GameController {
  constructor(deps){
    super(deps);
    this.view = new CircuitBoardView(deps.screen);
    bindPieceDrag(deps.screen.querySelector('.wrap'), {
      canMove: piece => this.active && !this.#isFixed(piece),
      cellSize: () => this.view.cellSize(),
      onTap: piece => this.tap(piece),
      onDrop: (piece, rect) => this.drop(piece, this.view.cellFor(rect)),
      ghost: (el, piece) => {
        const s = this.session, pos = s.place[piece];
        return this.view.ghostFor(piece, pos || { face: s.tface[piece], rot: s.trot[piece] });
      }
    });
  }

  #isFixed(piece){ return this.session.p.fixed.includes(piece); }

  /* ---------- Template steps ---------- */

  createSession(L, puzzle){
    const place = PIECES.map(() => null);
    for (const piece of puzzle.fixed){
      const s = puzzle.solution[piece], o = orient(piece, s.face, s.rot);
      place[piece] = { face: s.face, rot: s.rot, x: s.cell % W - o.cells[0][0], y: ((s.cell / W) | 0) - o.cells[0][1] };
    }
    return { L, p: puzzle, place, tface: PIECES.map(() => 0), trot: PIECES.map(() => 0), sel: -1, time: 0, done: false, hints: 0 };
  }
  mountBoard(){ this.view.build(this.session.p); }
  renderBoard(){
    const s = this.session;
    this.view.render({
      place: s.place, tface: s.tface, trot: s.trot, fixed: s.p.fixed, sel: s.sel,
      broken: this.settings.errors ? brokenEnds(s.place) : null
    });
  }
  snapshot(){ return { place: this.session.place.map(p => p && { ...p }) }; }
  restore(snap){ this.session.place = snap.place; }
  hasInput(){ const s = this.session; return s.place.some((pos, piece) => pos && !this.#isFixed(piece)); }
  clearInput(){
    const s = this.session;
    s.place = s.place.map((pos, piece) => this.#isFixed(piece) ? pos : null);
    s.sel = -1;
  }
  isSolved(){ return isSolved(this.session.place, this.session.p.solution); }
  get resetMessage(){ return t('play.clearedShort'); }
  celebrate(){ this.session.sel = -1; this.renderBoard(); this.view.celebrate(); }
  get actions(){ return { flip: () => this.flip() }; }

  findMistake(){
    const s = this.session, m = findMistake(s.place, s.p.solution, s.p.fixed);
    return m && { ...m, message: t('play.wrongPiece') };
  }
  showMistake({ piece }){ this.session.sel = piece; this.render(); this.view.flash(piece); }
  giveHint(){
    const s = this.session, hint = findHint(s.place, s.p.solution);
    if (!hint) return false;
    // Whatever is in its place goes back to the tray
    const grid = occupancy(s.place);
    for (const i of cellsOf(hint.piece, hint.pos).cells){
      const other = grid[i];
      if (other >= 0 && other !== hint.piece) this.#toTray(other);
    }
    s.place[hint.piece] = hint.pos;
    s.sel = hint.piece;
    this.commit(true);
    this.view.flash(hint.piece);
    return true;
  }

  /* ---------- Piece actions ---------- */

  #toTray(piece){
    const s = this.session, pos = s.place[piece];
    s.tface[piece] = pos.face; s.trot[piece] = pos.rot; s.place[piece] = null;
  }

  /** Places a new side or rotation, in the tray or on the board (readjusting so it doesn't stick out). */
  #reorient(piece, face, rot, failMsg){
    const s = this.session, pos = s.place[piece];
    if (!pos){ s.tface[piece] = face; s.trot[piece] = rot; this.store.save(); this.render(); return; }
    const o = orient(piece, face, rot), clamp = (v, size, max) => Math.max(0, Math.min(max - size, v));
    const next = [{ face, rot, x: pos.x, y: pos.y }, { face, rot, x: clamp(pos.x, o.w, W), y: clamp(pos.y, o.h, H) }]
      .find(p => fits(s.place, piece, p));
    if (!next){ this.notify(failMsg); return; }
    s.place[piece] = next;
    this.commit(true);
  }

  /** First tap: pick the piece; if it was already picked, rotate it 90°. */
  tap(piece){
    const s = this.session;
    if (!this.active || this.#isFixed(piece)) return;
    if (s.sel !== piece){ s.sel = piece; this.render(); return; }
    const pos = s.place[piece];
    const face = pos ? pos.face : s.tface[piece], rot = ((pos ? pos.rot : s.trot[piece]) + 1) % 4;
    this.#reorient(piece, face, rot, t('play.noRotate'));
  }

  /** Flips the picked piece (straight ones also go through the blank side). */
  flip(){
    const s = this.session, piece = s.sel;
    if (!this.active || piece < 0 || this.#isFixed(piece)) return;
    const pos = s.place[piece];
    const face = ((pos ? pos.face : s.tface[piece]) + 1) % faceCount(piece), rot = pos ? pos.rot : s.trot[piece];
    this.#reorient(piece, face, rot, t('play.noFlip'));
  }

  /** Drops a piece: on a board cell (if it fits) or off it (it goes back to the tray). */
  drop(piece, cell){
    const s = this.session;
    if (!this.active || this.#isFixed(piece)) return;
    s.sel = piece;
    const cur = s.place[piece];
    if (!cell){
      if (cur){ this.#toTray(piece); this.commit(true); } else this.render();
      return;
    }
    const pos = { face: cur ? cur.face : s.tface[piece], rot: cur ? cur.rot : s.trot[piece], x: cell.x, y: cell.y };
    if (cur && cur.x === pos.x && cur.y === pos.y){ this.render(); return; }
    if (!fits(s.place, piece, pos)){ this.render(); return; }
    s.place[piece] = pos;
    this.commit(true);
  }
}
