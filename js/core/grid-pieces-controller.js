/* A game of pieces on a grid (Pentominoes, Fit): drag from the tray to the board, tap to pick
   and again to rotate 90°, and flip the picked one with a button.
   A placed piece is { m, r, x, y } (lib/polyomino.js); in the tray its side and rotation are kept.

   The subclass provides the view (render, cellFor, cellSize, ghostFor, flash, celebrate) and:
     boardSize() → { W, H }   orient(piece, m, r) → { w, h }   fits(place, piece, pose)
     isFixed(piece)           (none by default) */
import { GameController } from './game-controller.js';
import { t } from '../i18n/index.js';
import { bindPieceDrag } from '../ui/piece-drag.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export class GridPiecesController extends GameController {
  constructor(deps, view){
    super(deps);
    this.view = view;
    bindPieceDrag(deps.screen.querySelector('.wrap'), {
      canMove: piece => this.active && !this.isFixed(piece),
      cellSize: () => this.view.cellSize(),
      onTap: piece => this.tap(piece),
      onDrop: (piece, rect) => this.drop(piece, this.view.cellFor(rect)),
      ghost: (el, piece) => {
        const s = this.session, pose = s.place[piece];
        return this.view.ghostFor(piece, pose || { m: s.tm[piece], r: s.tr[piece] });
      }
    });
  }

  isFixed(piece){ return false; }

  /** Game with `count` pieces, all in the tray; `place` lets it start with some already placed. */
  baseSession(L, puzzle, count, place = new Array(count).fill(null)){
    return { L, p: puzzle, place, tm: new Array(count).fill(0), tr: new Array(count).fill(0), sel: -1, time: 0, done: false, hints: 0 };
  }

  /* ---------- Template steps ---------- */

  snapshot(){ return { place: this.session.place.map(p => p && { ...p }) }; }
  restore(snap){ this.session.place = snap.place; }
  hasInput(){ return this.session.place.some((pose, piece) => pose && !this.isFixed(piece)); }
  clearInput(){
    const s = this.session;
    s.place.forEach((pose, piece) => { if (pose && !this.isFixed(piece)) this.toTray(piece); });
    s.sel = -1;
  }
  get resetMessage(){ return t('play.clearedShort'); }
  celebrate(){ this.session.sel = -1; this.renderBoard(); this.view.celebrate(); }
  get actions(){ return { flip: () => this.flip() }; }

  /* ---------- Piece actions ---------- */

  toTray(piece){
    const s = this.session, pose = s.place[piece];
    s.tm[piece] = pose.m; s.tr[piece] = pose.r; s.place[piece] = null;
  }

  /** Places a piece (e.g. a hint): whatever is in its spot goes back to the tray. */
  placeAt(piece, pose, cellsOf){
    const s = this.session, target = new Set(cellsOf(piece, pose));
    s.place.forEach((other, p) => {
      if (other && p !== piece && !this.isFixed(p) && cellsOf(p, other).some(c => target.has(c))) this.toTray(p);
    });
    s.place[piece] = { ...pose };
  }

  /**
   * New side or rotation: in the tray, nothing else; on the board, around the same centre and, if it
   * doesn't fit there, in the nearest free spot.
   */
  #reorient(piece, m, r, failMsg){
    const s = this.session, pose = s.place[piece];
    if (!pose){ s.tm[piece] = m; s.tr[piece] = r; this.store.save(); this.render(); return; }
    const a = this.orient(piece, pose.m, pose.r), b = this.orient(piece, m, r);
    const cx = pose.x + a.w / 2, cy = pose.y + a.h / 2;
    const x0 = Math.round(cx - b.w / 2), y0 = Math.round(cy - b.h / 2), tries = [];
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) tries.push({ dx, dy });
    tries.sort((p, q) => Math.hypot(p.dx, p.dy) - Math.hypot(q.dx, q.dy));
    const next = tries.map(({ dx, dy }) => ({ m, r, x: x0 + dx, y: y0 + dy })).find(p => this.fits(s.place, piece, p));
    if (!next){ this.notify(failMsg); return; }
    s.place[piece] = next;
    this.commit(true);
  }

  /** First tap: pick the piece; if it was already picked, rotate it 90°. */
  tap(piece){
    const s = this.session;
    if (!this.active || this.isFixed(piece)) return;
    if (s.sel !== piece){ s.sel = piece; this.render(); return; }
    const pose = s.place[piece];
    const m = pose ? pose.m : s.tm[piece], r = ((pose ? pose.r : s.tr[piece]) + 1) % 4;
    this.#reorient(piece, m, r, t('play.noRotate'));
  }

  /** Flips (mirrors, without changing the apparent rotation) the picked piece. */
  flip(){
    const s = this.session, piece = s.sel;
    if (!this.active || piece < 0 || this.isFixed(piece)) return;
    const pose = s.place[piece];
    const m = 1 - (pose ? pose.m : s.tm[piece]), r = pose ? pose.r : s.tr[piece];
    this.#reorient(piece, m, (4 - r) % 4, t('play.noFlip'));
  }

  /** Drops a piece: on the board (if it fits; snapped to the edge if it sticks out a little) or off it, to the tray. */
  drop(piece, cell){
    const s = this.session, { W, H } = this.boardSize();
    if (!this.active || this.isFixed(piece)) return;
    s.sel = piece;
    const cur = s.place[piece];
    if (!cell){
      if (cur){ this.toTray(piece); this.commit(true); } else this.render();
      return;
    }
    const m = cur ? cur.m : s.tm[piece], r = cur ? cur.r : s.tr[piece], o = this.orient(piece, m, r);
    const pose = { m, r, x: clamp(cell.x, 0, W - o.w), y: clamp(cell.y, 0, H - o.h) };
    if (cur && cur.x === pose.x && cur.y === pose.y){ this.render(); return; }
    if (!this.fits(s.place, piece, pose)){ this.render(); return; }
    s.place[piece] = pose;
    this.commit(true);
  }
}
