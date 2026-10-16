/* Partida de Slitherlink: tocar un lado lo cambia (nada → línea → tachado → nada); arrastrar de punto a
   punto dibuja líneas (o las borra, si se empieza sobre una). */
import { GameController } from '../../core/game-controller.js';
import { SlitherBoardView } from './board-view.js';
import { geometry } from './engine/grid.js';
import { lineCounts, crowded, isSolved, findMistake, findHint } from './rules.js';

const NEAR_DOT = .32;   // distancia (en casillas) para que el dedo esté "en" un punto
const NEAR_EDGE = .42;  // y para que un toque cuente como sobre un lado
const NEXT = [1, 2, 0];  // tras cada estado (0 nada, 1 línea, 2 tachado), el del siguiente toque

export class SlitherController extends GameController {
  constructor(deps){
    super(deps);
    this.view = new SlitherBoardView(deps.screen);
    this.#bindPointer(this.view.root);
  }

  /* ---------- Pasos de la plantilla ---------- */

  createSession(L, puzzle){ return { L, p: puzzle, e: new Array(geometry(puzzle.n).E).fill(0), time: 0, done: false, hints: 0 }; }
  mountBoard(){ this.view.build(this.session.p); }
  renderBoard(){
    const { p, e } = this.session;
    this.view.render({ e, counts: lineCounts(p.n, e), crowded: crowded(p.n, e), showErrors: this.settings.errors });
  }
  snapshot(){ return { e: this.session.e.slice() }; }
  restore(snap){ this.session.e = snap.e.slice(); }
  hasInput(){ return this.session.e.some(Boolean); }
  clearInput(){ this.session.e.fill(0); }
  isSolved(){ const s = this.session; return isSolved(s.e, s.p.solution); }
  celebrate(){ this.view.celebrate(); }

  findMistake(){
    const s = this.session, k = findMistake(s.e, s.p.solution);
    if (k < 0) return null;
    return { edge: k, message: s.e[k] === 1 ? 'Esta línea sobra' : 'Aquí va una línea' };
  }
  showMistake({ edge }){ this.view.flashEdge(edge); }
  giveHint(){
    const s = this.session, h = findHint(s.p, s.e);
    if (!h) return false;
    this.record();
    s.e[h.edge] = h.value;
    this.commit(true);
    this.view.flashEdge(h.edge);
    return true;
  }

  /** Nada → línea → tachado → nada. Deshacer justo tras los dos toques deja el lado vacío (recordTap). */
  cycle(k){
    if (!this.active || k < 0) return;
    const s = this.session, before = this.snapshot(), from = s.e[k];
    s.e[k] = NEXT[from];
    this.recordTap(k, before, from === 0 ? 'mark' : from === 1 ? 'piece' : null);
    this.commit(true);
  }

  /** Lado más cercano a un punto (coordenadas de casilla), o −1. */
  #edgeAt({ x, y }){
    const { n } = this.session.p, g = geometry(n);
    let best = -1, bestD = NEAR_EDGE;
    const r = Math.round(y), c = Math.floor(x);
    if (r >= 0 && r <= n && c >= 0 && c < n && Math.abs(y - r) < bestD){ best = g.H(r, c); bestD = Math.abs(y - r); }
    const c2 = Math.round(x), r2 = Math.floor(y);
    if (c2 >= 0 && c2 <= n && r2 >= 0 && r2 < n && Math.abs(x - c2) < bestD){ best = g.Vt(r2, c2); }
    return best;
  }
  /** Punto (vértice) bajo el dedo, o −1. */
  #dotAt({ x, y }){
    const n = this.session.p.n, r = Math.round(y), c = Math.round(x);
    if (r < 0 || c < 0 || r > n || c > n || Math.hypot(x - c, y - r) > NEAR_DOT) return -1;
    return r * (n + 1) + c;
  }
  /** Lado entre dos puntos vecinos, o −1. */
  #between(a, b){
    const g = geometry(this.session.p.n);
    return g.vertEdges[a].find(e => g.edgeVerts[e].includes(b)) ?? -1;
  }

  #bindPointer(el){
    let drag = null;
    el.addEventListener('pointerdown', e => {
      if (drag || !this.active) return;
      e.preventDefault();
      try { el.setPointerCapture(e.pointerId); } catch (_){}
      const at = this.view.toCell(e.clientX, e.clientY);
      drag = { id: e.pointerId, start: at, dot: this.#dotAt(at), moved: false, mode: null };
    });
    el.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id || !this.active) return;
      const at = this.view.toCell(e.clientX, e.clientY), dot = this.#dotAt(at);
      if (dot < 0 || dot === drag.dot) return;
      const k = drag.dot >= 0 ? this.#between(drag.dot, dot) : -1;
      drag.dot = dot;
      if (k < 0) return;
      const s = this.session;
      // el primer lado decide: si ya era línea, el arrastre borra; si no, dibuja
      if (drag.mode === null){ drag.mode = s.e[k] === 1 ? 0 : 1; this.record(); }
      drag.moved = true;
      s.e[k] = drag.mode;
      this.commit(false);
    });
    const end = e => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag;
      drag = null;
      if (e.type === 'pointercancel'){ if (d.moved) this.commit(true); return; }
      if (d.moved) this.commit(true);
      else this.cycle(this.#edgeAt(d.start));
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  }
}
