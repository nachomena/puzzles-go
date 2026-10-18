/* Loop game: tapping a side changes it (nothing → line → cross → nothing); dragging from dot to dot
   draws lines (or erases them, if it starts on one). */
import { GameController } from '../../core/game-controller.js';
import { t } from '../../i18n/index.js';
import { SlitherBoardView } from './board-view.js';
import { geometry } from './engine/grid.js';
import { lineCounts, crowded, isSolved, findMistake, findHint } from './rules.js';

const NEAR_DOT = .32;   // distance (in cells) for the finger to be "on" a dot
const NEAR_EDGE = .42;  // and for a tap to count as on a side
const NEXT = [1, 2, 0];  // after each state (0 nothing, 1 line, 2 cross), the next tap's

export class SlitherController extends GameController {
  constructor(deps){
    super(deps);
    this.view = new SlitherBoardView(deps.screen);
    this.#bindPointer(this.view.root);
  }

  /* ---------- Template steps ---------- */

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
    return { edge: k, message: t(s.e[k] === 1 ? 'games.loop.extraLine' : 'games.loop.missingLine') };
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

  /** Nothing → line → cross → nothing. Undoing right after the two taps leaves the side empty (recordTap). */
  cycle(k){
    if (!this.active || k < 0) return;
    const s = this.session, before = this.snapshot(), from = s.e[k];
    s.e[k] = NEXT[from];
    this.recordTap(k, before, from === 0 ? 'mark' : from === 1 ? 'piece' : null);
    this.commit(true);
  }

  /** Side closest to a point (cell coordinates), or −1. */
  #edgeAt({ x, y }){
    const { n } = this.session.p, g = geometry(n);
    let best = -1, bestD = NEAR_EDGE;
    const r = Math.round(y), c = Math.floor(x);
    if (r >= 0 && r <= n && c >= 0 && c < n && Math.abs(y - r) < bestD){ best = g.H(r, c); bestD = Math.abs(y - r); }
    const c2 = Math.round(x), r2 = Math.floor(y);
    if (c2 >= 0 && c2 <= n && r2 >= 0 && r2 < n && Math.abs(x - c2) < bestD){ best = g.Vt(r2, c2); }
    return best;
  }
  /** Dot (vertex) under the finger, or −1. */
  #dotAt({ x, y }){
    const n = this.session.p.n, r = Math.round(y), c = Math.round(x);
    if (r < 0 || c < 0 || r > n || c > n || Math.hypot(x - c, y - r) > NEAR_DOT) return -1;
    return r * (n + 1) + c;
  }
  /** Side between two neighbouring dots, or −1. */
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
      // the first side decides: if it was already a line, the drag erases; otherwise it draws
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
