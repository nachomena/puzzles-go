/* Hexagon game: drag pieces onto the board, tap to pick and again to rotate 60°, and flip the picked one
   with a button. With the piece picked, the places where it fits as it is rotated are marked; tapping one
   shows it there and tapping it again places it. */
import { GameController } from '../../core/game-controller.js';
import { t } from '../../i18n/index.js';
import { HexagonBoardView } from './board-view.js';
import { PIECES, pointsOf, cellsOf } from './engine/pieces.js';
import { fits, isSolved, findHint, findMistake, occupancy } from './rules.js';
import { pointXY } from './piece-svg.js';
import { FitSpots } from '../../ui/fit-spots.js';

const DRAG_THRESHOLD = 6;
const samePose = (a, b) => a.m === b.m && a.r === b.r && a.tu === b.tu && a.tv === b.tv;

/** Centre (on screen) of a piece with a pose. */
const centerOf = (piece, pose) => {
  const pts = pointsOf(piece, pose).map(pointXY);
  return [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
};

/**
 * Translations (even, in doubled coordinates) that bring point `q` near (U, V), from the nearest to the
 * farthest.
 */
function nearShifts(q, U, V, radius = 1){
  const a0 = Math.round((U - q[0]) / 2), b0 = Math.round((V - q[1]) / 2), out = [];
  for (let a = a0 - radius; a <= a0 + radius; a++) for (let b = b0 - radius; b <= b0 + radius; b++){
    const [x, y] = pointXY([q[0] + 2 * a, q[1] + 2 * b]), [px, py] = pointXY([U, V]);
    out.push({ tu: 2 * a, tv: 2 * b, d: Math.hypot(x - px, y - py) });
  }
  return out.sort((s, t) => s.d - t.d);
}

export class HexagonController extends GameController {
  constructor(deps){
    super(deps);
    this.view = new HexagonBoardView(deps.screen);
    this.spots = new FitSpots(samePose);
    this.#bindPointer(deps.screen.querySelector('.wrap'));
  }

  #isFixed(piece){ return this.session.p.fixed.includes(piece); }

  /* ---------- Template steps ---------- */

  createSession(L, puzzle){
    const place = PIECES.map(() => null);
    for (const p of puzzle.fixed) place[p] = { ...puzzle.solution[p] };
    return { L, p: puzzle, place, tm: PIECES.map(() => 0), tr: PIECES.map(() => 0), sel: -1, time: 0, done: false, hints: 0 };
  }
  mountBoard(){ this.view.build(); }
  renderBoard(){
    const s = this.session, spots = this.spots.update(this.#fittingSpots());
    this.view.render({
      place: s.place, tm: s.tm, tr: s.tr, fixed: s.p.fixed, sel: s.sel,
      spots: spots.map(pose => { const [x, y] = centerOf(s.sel, pose); return { x, y }; }),
      chosenSpot: this.spots.chosenIndex, chosen: this.spots.chosen
    });
  }

  /** Places where the picked piece fits, as it is rotated and flipped (if the setting is on). */
  #fittingSpots(){
    const s = this.session, piece = s.sel;
    if (!this.settings.spots || !this.active || piece < 0 || this.#isFixed(piece)) return [];
    const cur = s.place[piece], m = cur ? cur.m : s.tm[piece], r = cur ? cur.r : s.tr[piece], out = [];
    for (let tu = -14; tu <= 14; tu += 2) for (let tv = -14; tv <= 14; tv += 2){
      const pose = { m, r, tu, tv };
      if ((!cur || !samePose(cur, pose)) && fits(s.place, piece, pose)) out.push(pose);
    }
    return out;
  }

  /** Tapping a marked place: the first time the piece is shown there; the second, it is placed. */
  #tapSpot(i){
    const s = this.session;
    if (s.sel < 0) return;
    const pose = this.spots.tap(i);
    if (pose) this.drop(s.sel, pose); else this.render();
  }
  onSetting(){ this.spots.clear(); }
  snapshot(){ return { place: this.session.place.map(p => p && { ...p }) }; }
  restore(snap){ this.session.place = snap.place; }
  hasInput(){ return this.session.place.some((pose, p) => pose && !this.#isFixed(p)); }
  clearInput(){
    const s = this.session;
    s.place = s.place.map((pose, p) => this.#isFixed(p) ? pose : null);
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
    // whatever is in its place goes back to the tray
    const grid = occupancy(s.place);
    for (const c of cellsOf(hint.piece, hint.pose)){
      const other = grid[c];
      if (other >= 0 && other !== hint.piece) this.#toTray(other);
    }
    s.place[hint.piece] = { ...hint.pose };
    s.sel = hint.piece;
    this.commit(true);
    this.view.flash(hint.piece);
    return true;
  }

  /* ---------- Piece actions ---------- */

  #toTray(piece){
    const s = this.session, pose = s.place[piece];
    s.tm[piece] = pose.m; s.tr[piece] = pose.r; s.place[piece] = null;
  }

  /** New side or rotation: in the tray, nothing else; on the board, in the nearest gap where it fits. */
  #reorient(piece, m, r, failMsg){
    const s = this.session, pose = s.place[piece];
    if (!pose){ s.tm[piece] = m; s.tr[piece] = r; this.store.save(); this.render(); return; }
    const [cx, cy] = centerOf(piece, pose), [nx, ny] = centerOf(piece, { m, r, tu: 0, tv: 0 });
    // translation that leaves the piece's centre where it was (and the ones around it)
    const v = (cy - ny) / (Math.sqrt(3) / 4), u = 2 * (cx - nx) - v / 2;
    const next = nearShifts([0, 0], u, v, 2).map(t => ({ m, r, tu: t.tu, tv: t.tv })).find(p => fits(s.place, piece, p));
    if (!next){ this.notify(failMsg); return; }
    s.place[piece] = next;
    this.commit(true);
  }

  /** First tap: pick the piece; if it was already picked, rotate it 60°. */
  tap(piece){
    const s = this.session;
    if (!this.active || this.#isFixed(piece)) return;
    this.spots.clear();
    if (s.sel !== piece){ s.sel = piece; this.render(); return; }
    const pose = s.place[piece], m = pose ? pose.m : s.tm[piece], r = ((pose ? pose.r : s.tr[piece]) + 1) % 6;
    this.#reorient(piece, m, r, t('play.noRotate'));
  }

  /** Flips the picked piece over. */
  flip(){
    const s = this.session, piece = s.sel;
    if (!this.active || piece < 0 || this.#isFixed(piece)) return;
    this.spots.clear();
    const pose = s.place[piece], m = 1 - (pose ? pose.m : s.tm[piece]), r = pose ? pose.r : s.tr[piece];
    this.#reorient(piece, m, r, t('play.noFlip'));
  }

  /** Drops the piece with pose `pose` (or off the board if it is null). */
  drop(piece, pose){
    const s = this.session;
    if (!this.active || this.#isFixed(piece)) return;
    this.spots.clear();
    s.sel = piece;
    if (!pose){
      if (s.place[piece]){ this.#toTray(piece); this.commit(true); } else this.render();
      return;
    }
    if (!fits(s.place, piece, pose)){ this.render(); return; }
    s.place[piece] = pose;
    this.commit(true);
  }

  /** Pose the piece would land in if its point k ends up under the finger (null off the board). */
  #poseUnder(piece, k, m, r, clientX, clientY){
    const at = this.view.boardAt(clientX, clientY);
    if (!at.inside) return null;
    const q = pointsOf(piece, { m, r, tu: 0, tv: 0 })[k];
    const t = nearShifts(q, ...at.doubled)[0];
    return { m, r, tu: t.tu, tv: t.tv };
  }

  /** Drag: over the board it shows where the piece would land (grey if it doesn't fit); off it, it follows the finger. */
  #bindPointer(el){
    let drag = null;
    el.addEventListener('pointerdown', e => {
      if (drag || !this.active) return;
      const spot = e.target.closest('[data-spot]');
      if (spot){ e.preventDefault(); this.#tapSpot(Number(spot.dataset.spot)); return; }
      const target = e.target.closest('[data-piece]');
      if (!target){
        // tapping the board outside the pieces drops the picked one
        if (e.target.closest('[data-hx-board]') && this.session.sel >= 0){ this.session.sel = -1; this.spots.clear(); this.render(); }
        return;
      }
      const piece = Number(target.dataset.piece);
      if (this.#isFixed(piece)) return;
      const k = Number(e.target.closest('[data-k]')?.dataset.k ?? 0);
      e.preventDefault();
      try { el.setPointerCapture(e.pointerId); } catch (_){}
      drag = { id: e.pointerId, piece, k, x: e.clientX, y: e.clientY, moved: false };
    });
    el.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < DRAG_THRESHOLD) return;
      const s = this.session, pose = s.place[drag.piece];
      const m = pose ? pose.m : s.tm[drag.piece], r = pose ? pose.r : s.tr[drag.piece];
      if (!drag.moved){ drag.moved = true; this.view.lift(drag.piece, true); }
      drag.pose = this.#poseUnder(drag.piece, drag.k, m, r, e.clientX, e.clientY);
      if (drag.pose){
        this.view.ghostAt(-1);
        this.view.preview(drag.piece, drag.pose, fits(s.place, drag.piece, drag.pose));
      } else {
        this.view.preview(-1);
        this.view.ghostAt(drag.piece, m, r, e.clientX, e.clientY);
      }
    });
    const end = (e, cancelled) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag;
      drag = null;
      try { el.releasePointerCapture(d.id); } catch (_){}
      this.view.preview(-1);
      this.view.ghostAt(-1);
      this.view.lift(d.piece, false);
      if (cancelled){ this.render(); return; }
      if (d.moved) this.drop(d.piece, d.pose);
      else this.tap(d.piece);
    };
    el.addEventListener('pointerup', e => end(e, false));
    el.addEventListener('pointercancel', e => end(e, true));
    el.addEventListener('contextmenu', e => { if (e.target.closest('[data-piece]')) e.preventDefault(); });
  }
}
