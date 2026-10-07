/* Partida de Smart Hexagon: arrastrar piezas al tablero, tocar para elegir y otra vez para girar
   60°, y voltear la elegida con un botón. Con la pieza elegida se marcan los sitios donde cabe tal
   como está girada; tocar uno la muestra ahí y tocarlo otra vez la coloca. */
import { GameController } from '../../core/game-controller.js';
import { HexagonBoardView } from './board-view.js';
import { PIECES, pointsOf, cellsOf } from './engine/pieces.js';
import { fits, isSolved, findHint, findMistake, occupancy } from './rules.js';
import { pointXY } from './piece-svg.js';

const DRAG_THRESHOLD = 6;
const samePose = (a, b) => a.m === b.m && a.r === b.r && a.tu === b.tu && a.tv === b.tv;

/** Centro (en pantalla) de una pieza con una postura. */
const centerOf = (piece, pose) => {
  const pts = pointsOf(piece, pose).map(pointXY);
  return [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
};

/**
 * Traslaciones (pares, en coordenadas dobles) que llevan el punto `q` cerca de (U, V), de la más
 * cercana a la más lejana.
 */
function nearShifts(q, U, V, radius = 1){
  const a0 = Math.round((U - q[0]) / 2), b0 = Math.round((V - q[1]) / 2), out = [];
  for (let a = a0 - radius; a <= a0 + radius; a++) for (let b = b0 - radius; b <= b0 + radius; b++){
    const [x, y] = pointXY([q[0] + 2 * a, q[1] + 2 * b]), [px, py] = pointXY([U, V]);
    out.push({ tu: 2 * a, tv: 2 * b, d: Math.hypot(x - px, y - py) });
  }
  return out.sort((s, t) => s.d - t.d);
}

export class SmartHexagonController extends GameController {
  constructor(deps){
    super(deps);
    this.view = new HexagonBoardView(deps.screen);
    this.#bindPointer(deps.screen.querySelector('.wrap'));
  }

  #isFixed(piece){ return this.session.p.fixed.includes(piece); }

  /* ---------- Pasos de la plantilla ---------- */

  createSession(L, puzzle){
    const place = PIECES.map(() => null);
    for (const p of puzzle.fixed) place[p] = { ...puzzle.solution[p] };
    return { L, p: puzzle, place, tm: PIECES.map(() => 0), tr: PIECES.map(() => 0), sel: -1, time: 0, done: false, hints: 0 };
  }
  mountBoard(){ this.view.build(); }
  renderBoard(){
    const s = this.session;
    this.spots = this.#fittingSpots();
    if (this.chosen && !this.spots.some(p => samePose(p, this.chosen))) this.chosen = null;
    this.view.render({
      place: s.place, tm: s.tm, tr: s.tr, fixed: s.p.fixed, sel: s.sel,
      spots: this.spots.map(pose => { const [x, y] = centerOf(s.sel, pose); return { x, y, on: !!this.chosen && samePose(pose, this.chosen) }; }),
      chosen: this.chosen
    });
  }

  /** Sitios donde cabe la pieza elegida, tal como está girada y volteada (si el ajuste está activo). */
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

  /** Tocar un sitio marcado: la primera vez se ve ahí la pieza; la segunda se coloca. */
  #tapSpot(i){
    const s = this.session, pose = this.spots?.[i];
    if (!pose || s.sel < 0) return;
    if (this.chosen && samePose(this.chosen, pose)){ this.chosen = null; this.drop(s.sel, pose); return; }
    this.chosen = pose;
    this.render();
  }
  onSetting(){ this.chosen = null; }
  snapshot(){ return { place: this.session.place.map(p => p && { ...p }) }; }
  restore(snap){ this.session.place = snap.place; }
  hasInput(){ return this.session.place.some((pose, p) => pose && !this.#isFixed(p)); }
  clearInput(){
    const s = this.session;
    s.place = s.place.map((pose, p) => this.#isFixed(p) ? pose : null);
    s.sel = -1;
  }
  isSolved(){ return isSolved(this.session.place, this.session.p.solution); }
  get resetMessage(){ return 'Tablero vacío.'; }
  celebrate(){ this.session.sel = -1; this.renderBoard(); this.view.celebrate(); }
  get actions(){ return { flip: () => this.flip() }; }

  findMistake(){
    const s = this.session, m = findMistake(s.place, s.p.solution, s.p.fixed);
    return m && { ...m, message: 'Esta pieza no va aquí' };
  }
  showMistake({ piece }){ this.session.sel = piece; this.render(); this.view.flash(piece); }
  giveHint(){
    const s = this.session, hint = findHint(s.place, s.p.solution);
    if (!hint) return false;
    // lo que ocupe su sitio vuelve a la bandeja
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

  /* ---------- Acciones de piezas ---------- */

  #toTray(piece){
    const s = this.session, pose = s.place[piece];
    s.tm[piece] = pose.m; s.tr[piece] = pose.r; s.place[piece] = null;
  }

  /** Nueva cara o giro: en la bandeja, sin más; en el tablero, en el hueco más cercano que quepa. */
  #reorient(piece, m, r, failMsg){
    const s = this.session, pose = s.place[piece];
    if (!pose){ s.tm[piece] = m; s.tr[piece] = r; this.store.save(); this.render(); return; }
    const [cx, cy] = centerOf(piece, pose), [nx, ny] = centerOf(piece, { m, r, tu: 0, tv: 0 });
    // traslación que deja el centro de la pieza donde estaba (y las de alrededor)
    const v = (cy - ny) / (Math.sqrt(3) / 4), u = 2 * (cx - nx) - v / 2;
    const next = nearShifts([0, 0], u, v, 2).map(t => ({ m, r, tu: t.tu, tv: t.tv })).find(p => fits(s.place, piece, p));
    if (!next){ this.notify(failMsg); return; }
    s.place[piece] = next;
    this.commit(true);
  }

  /** Primer toque: elegir la pieza; si ya estaba elegida, girarla 60°. */
  tap(piece){
    const s = this.session;
    if (!this.active || this.#isFixed(piece)) return;
    this.chosen = null;
    if (s.sel !== piece){ s.sel = piece; this.render(); return; }
    const pose = s.place[piece], m = pose ? pose.m : s.tm[piece], r = ((pose ? pose.r : s.tr[piece]) + 1) % 6;
    this.#reorient(piece, m, r, 'No cabe girada aquí');
  }

  /** Da la vuelta a la pieza elegida. */
  flip(){
    const s = this.session, piece = s.sel;
    if (!this.active || piece < 0 || this.#isFixed(piece)) return;
    this.chosen = null;
    const pose = s.place[piece], m = 1 - (pose ? pose.m : s.tm[piece]), r = pose ? pose.r : s.tr[piece];
    this.#reorient(piece, m, r, 'No cabe volteada aquí');
  }

  /** Suelta la pieza con la postura `pose` (o fuera del tablero si es null). */
  drop(piece, pose){
    const s = this.session;
    if (!this.active || this.#isFixed(piece)) return;
    this.chosen = null;
    s.sel = piece;
    if (!pose){
      if (s.place[piece]){ this.#toTray(piece); this.commit(true); } else this.render();
      return;
    }
    if (!fits(s.place, piece, pose)){ this.render(); return; }
    s.place[piece] = pose;
    this.commit(true);
  }

  /** Postura con la que caería la pieza si su punto k queda bajo el dedo (null fuera del tablero). */
  #poseUnder(piece, k, m, r, clientX, clientY){
    const at = this.view.boardAt(clientX, clientY);
    if (!at.inside) return null;
    const q = pointsOf(piece, { m, r, tu: 0, tv: 0 })[k];
    const t = nearShifts(q, ...at.doubled)[0];
    return { m, r, tu: t.tu, tv: t.tv };
  }

  /** Arrastrar: sobre el tablero se ve dónde quedaría la pieza (en gris si no cabe); fuera, sigue al dedo. */
  #bindPointer(el){
    let drag = null;
    el.addEventListener('pointerdown', e => {
      if (drag || !this.active) return;
      const spot = e.target.closest('[data-spot]');
      if (spot){ e.preventDefault(); this.#tapSpot(Number(spot.dataset.spot)); return; }
      const target = e.target.closest('[data-piece]');
      if (!target){
        // tocar el tablero fuera de las piezas suelta la elegida
        if (e.target.closest('[data-sh-board]') && this.session.sel >= 0){ this.session.sel = -1; this.chosen = null; this.render(); }
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
