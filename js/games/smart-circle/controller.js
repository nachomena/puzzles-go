/* Partida de Smart Circle: arrastrar piezas alrededor del tablero (moverlas de sector es girarlas),
   tocarlas para voltearlas y, en los niveles difíciles, girar los nervios. */
import { GameController } from '../../core/game-controller.js';
import { CircleBoardView } from './board-view.js';
import { PIECES, SECTORS, cellsOf, crossesRib, ribsAt } from './engine/pieces.js';
import { fits, isSolved, findHint, findMistake, occupancy, blockedBy } from './rules.js';
import { nearestShift } from './piece-svg.js';
import { plural } from '../../lib/format.js';

const DRAG_THRESHOLD = 6;
/** Hasta qué distancia del centro (radio del tablero = 1) se considera que se suelta en el tablero. */
const BOARD_REACH = 1.12;

export class SmartCircleController extends GameController {
  constructor(deps){
    super(deps);
    this.view = new CircleBoardView(deps.screen);
    this.#bindPointer(deps.screen.querySelector('.wrap'));
  }

  #isFixed(piece){ return this.session.p.fixed.includes(piece); }

  /* ---------- Pasos de la plantilla ---------- */

  createSession(L, puzzle){
    const place = PIECES.map(() => null);
    for (const p of puzzle.fixed) place[p] = { ...puzzle.solution[p] };
    return { L, p: puzzle, place, tm: PIECES.map(() => 1), ro: this.#startRibs(puzzle), sel: -1, time: 0, done: false, hints: 0 };
  }

  /** Orientación inicial de los nervios: la del reto si se ven; si no, otra válida al azar. */
  #startRibs(p){
    if (p.ribsFixed) return p.o;
    const fixedOk = ro => p.fixed.every(q => !crossesRib(cellsOf(q, p.solution[q]), ribsAt(ro)));
    const options = [...Array(SECTORS).keys()].filter(ro => ro !== p.o && fixedOk(ro));
    return options.length ? options[(Math.random() * options.length) | 0] : p.o;
  }

  mountBoard(){ this.view.build(this.session.p); }
  renderBoard(){
    const s = this.session;
    this.view.render({ place: s.place, tm: s.tm, fixed: s.p.fixed, sel: s.sel, ro: s.ro });
  }
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
  get actions(){ return { 'turn-ribs': () => this.turnRibs() }; }

  findMistake(){
    const s = this.session, m = findMistake(s.place, s.p.solution, s.p.fixed);
    return m && { ...m, message: 'Esta pieza no va aquí' };
  }
  showMistake({ piece }){ this.session.sel = piece; this.render(); this.view.flash(piece); }
  giveHint(){
    const s = this.session, hint = findHint(s.place, s.p.solution, { ro: s.ro, o: s.p.o, marks: s.p.marks });
    if (!hint) return false;
    if (hint.ro !== undefined){
      this.#setRibs(hint.ro);
      this.notify('Así van los nervios');
      return true;
    }
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

  /* ---------- Acciones ---------- */

  #toTray(piece){
    const s = this.session;
    s.tm[piece] = s.place[piece].m;
    s.place[piece] = null;
  }

  /** Coloca los nervios en `ro`; las piezas movibles que quedan cruzadas vuelven a la bandeja. */
  #setRibs(ro){
    const s = this.session;
    s.ro = ro;
    const out = blockedBy(s.place, ro).filter(p => !this.#isFixed(p));
    out.forEach(p => this.#toTray(p));
    this.commit(true);
    return out.length;
  }

  /** Gira los nervios un sector (saltando las posiciones que cruzarían una pieza fija). */
  turnRibs(){
    const s = this.session;
    if (!this.active || s.p.ribsFixed) return;
    for (let step = 1; step <= SECTORS; step++){
      const ro = (s.ro + step) % SECTORS;
      if (s.p.fixed.some(p => crossesRib(cellsOf(p, s.place[p]), ribsAt(ro)))) continue;
      const n = this.#setRibs(ro);
      if (n) this.notify(`${plural(n, 'pieza')} ${n === 1 ? 'vuelve' : 'vuelven'} a la bandeja`);
      return;
    }
  }

  /** Tocar una pieza le da la vuelta (girarla no hace falta: basta moverla alrededor del tablero). */
  tap(piece){
    const s = this.session;
    if (!this.active || this.#isFixed(piece)) return;
    s.sel = piece;
    this.flip(piece);
  }

  /** Da la vuelta a una pieza; en el tablero, buscando el hueco más cercano en el que quepa. */
  flip(piece){
    const s = this.session, pose = s.place[piece];
    if (!pose){ s.tm[piece] = -s.tm[piece]; this.render(); return; }
    // la nueva cara, centrada en el mismo sitio: el sector de la bola 0 se mantiene y se prueba alrededor
    const m = -pose.m, d0 = PIECES[piece].balls[0][1], s0 = pose.m * d0 + pose.s - m * d0;
    for (const d of [0, 1, -1, 2, -2, 3, -3]){
      const next = { m, s: nearestShift(s0 + d) };
      if (fits(s.place, piece, next, s.ro)){ s.place[piece] = next; this.commit(true); return; }
    }
    this.render();
    this.notify('No cabe volteada aquí');
  }

  /** Suelta la pieza con la postura `pose` (o fuera del tablero si es null). */
  drop(piece, pose){
    const s = this.session;
    if (!this.active || this.#isFixed(piece)) return;
    s.sel = piece;
    if (!pose){
      if (s.place[piece]){ this.#toTray(piece); this.commit(true); } else this.render();
      return;
    }
    if (!fits(s.place, piece, pose, s.ro)){ this.render(); return; }
    s.place[piece] = pose;
    this.commit(true);
  }

  /** Postura con la que caería la pieza si la bola k queda bajo el dedo. */
  #poseUnder(piece, k, m, clientX, clientY){
    const at = this.view.polarAt(clientX, clientY);
    if (at.r > BOARD_REACH) return null;
    const d = PIECES[piece].balls[k][1];
    return { m, s: nearestShift(at.sector - m * d) };
  }

  /**
   * Arrastrar: la pieza sigue al dedo y, sobre el tablero, se ve dónde quedaría (en gris si no
   * cabe). Un toque sin arrastrar le da la vuelta.
   */
  #bindPointer(el){
    let drag = null;
    el.addEventListener('pointerdown', e => {
      const target = e.target.closest('[data-piece]');
      if (!target || drag || !this.active) return;
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
      const s = this.session, m = s.place[drag.piece]?.m ?? s.tm[drag.piece];
      if (!drag.moved){ drag.moved = true; this.view.lift(drag.piece, true); }
      const pose = this.#poseUnder(drag.piece, drag.k, m, e.clientX, e.clientY);
      drag.pose = pose;
      if (pose){
        this.view.ghostAt(-1);
        this.view.preview(drag.piece, pose, fits(s.place, drag.piece, pose, s.ro));
      } else {
        this.view.preview(-1);
        this.view.ghostAt(drag.piece, m, e.clientX, e.clientY);
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
      if (cancelled) { this.render(); return; }
      if (d.moved) this.drop(d.piece, d.pose);
      else this.tap(d.piece);
    };
    el.addEventListener('pointerup', e => end(e, false));
    el.addEventListener('pointercancel', e => end(e, true));
    el.addEventListener('contextmenu', e => { if (e.target.closest('[data-piece]')) e.preventDefault(); });
  }
}
