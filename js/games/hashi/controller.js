/* Partida de Hashi: deslizar desde una isla hacia otra (o tocar el hueco entre las dos) añade un
   puente; con dos, el siguiente toque los quita. Dos toques seguidos en una isla quitan todos sus
   puentes. Los puentes no pueden cruzarse. */
import { GameController } from '../../core/game-controller.js';
import { HashiBoardView } from './board-view.js';
import { edgesOf } from './engine/graph.js';
import { counts, blockedBy, isSolved, findMistake, findHint } from './rules.js';

const SWIPE = .4;   // casillas que hay que deslizar para que cuente como dirección
const DOUBLE_MS = 350;   // tiempo entre dos toques para que cuenten como doble

export class HashiController extends GameController {
  constructor(deps){
    super(deps);
    this.view = new HashiBoardView(deps.screen);
    this.#bindPointer(this.view.root);
  }

  get edges(){ const p = this.session.p; return this.cache?.p === p ? this.cache.edges : (this.cache = { p, edges: edgesOf(p) }).edges; }

  /* ---------- Pasos de la plantilla ---------- */

  createSession(L, puzzle){ return { L, p: puzzle, val: new Array(edgesOf(puzzle).length).fill(0), time: 0, done: false, hints: 0 }; }
  mountBoard(){ this.view.build(this.session.p, this.edges); }
  renderBoard(){
    const s = this.session;
    this.view.render({ val: s.val, counts: counts(s.p.islands, this.edges, s.val), showErrors: this.settings.errors });
  }
  snapshot(){ return { val: this.session.val.slice() }; }
  restore(snap){ this.session.val = snap.val.slice(); }
  hasInput(){ return this.session.val.some(Boolean); }
  clearInput(){ this.session.val.fill(0); }
  isSolved(){ const s = this.session; return isSolved(s.p.islands, this.edges, s.val); }
  celebrate(){ this.view.celebrate(); }

  findMistake(){
    const k = findMistake(this.session.val, this.session.p.solution);
    return k >= 0 ? { edge: k, message: 'Aquí sobra un puente' } : null;
  }
  showMistake({ edge }){ this.view.flashEdge(edge); }
  giveHint(){
    const s = this.session, k = findHint(s.val, s.p.solution);
    if (k < 0) return false;
    this.record();
    s.val[k] = s.p.solution[k];
    this.commit(true);
    this.view.flashEdge(k);
    return true;
  }

  /** Un puente más en el tramo k (de 2 vuelve a 0). */
  cycle(k){
    const s = this.session;
    if (!this.active || k < 0) return;
    const next = (s.val[k] + 1) % 3;
    if (next > 0 && blockedBy(this.edges, s.val, k) >= 0){ this.notify('Se cruza con otro puente'); return; }
    this.record();
    s.val[k] = next;
    this.commit(true);
  }

  /** Quita todos los puentes de la isla i. */
  clearIsland(i){
    const s = this.session;
    if (!this.active) return;
    const ks = this.edges.flatMap((e, k) => (e.a === i || e.b === i) && s.val[k] ? [k] : []);
    if (!ks.length) return;
    this.record();
    for (const k of ks) s.val[k] = 0;
    this.commit(true);
  }

  /** Tramo que sale de la isla i en la dirección (dx, dy), o -1. */
  #edgeFrom(i, dx, dy){
    const isl = this.session.p.islands;
    return this.edges.findIndex(e => {
      if (e.a !== i && e.b !== i) return false;
      const o = isl[e.a === i ? e.b : e.a], me = isl[i];
      return Math.sign(o.x - me.x) === dx && Math.sign(o.y - me.y) === dy;
    });
  }

  /**
   * Tramo que se toca en el punto (casillas con decimales): el que pasa más cerca, de los que van por
   * ahí (si dos se cruzan, gana aquel sobre cuya raya se toca). -1 si ninguno queda a menos de media casilla.
   */
  #edgeAt({ x, y }){
    const isl = this.session.p.islands;
    let best = -1, bestD = .5;
    this.edges.forEach((e, k) => {
      const a = isl[e.a], b = isl[e.b], h = e.dir === 'h';
      const along = h ? x - .5 : y - .5, lo = Math.min(h ? a.x : a.y, h ? b.x : b.y), hi = Math.max(h ? a.x : a.y, h ? b.x : b.y);
      if (along < lo || along > hi) return;
      const d = Math.abs(h ? y - (a.y + .5) : x - (a.x + .5));
      if (d < bestD){ best = k; bestD = d; }
    });
    return best;
  }

  /** Lo que haría soltar ahora: { edge, to } del tramo hacia donde se arrastra (edge -1 si no hay). */
  #target(island, start, now){
    const dx = now.x - start.x, dy = now.y - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE) return { edge: -1, to: -1 };
    const horizontal = Math.abs(dx) > Math.abs(dy);
    const edge = this.#edgeFrom(island, horizontal ? Math.sign(dx) : 0, horizontal ? 0 : Math.sign(dy));
    if (edge < 0) return { edge: -1, to: -1 };
    const e = this.edges[edge];
    return { edge, to: e.a === island ? e.b : e.a };
  }

  /** Vista previa del arrastre: el puente que quedaría, o una raya recta hasta el dedo. */
  #preview(d, now){
    const s = this.session, isl = s.p.islands[d.island], t = this.#target(d.island, d.start, now);
    if (t.edge >= 0){
      const count = (s.val[t.edge] + 1) % 3;
      this.view.preview({ from: d.island, edge: t.edge, to: t.to, count, bad: count > 0 && blockedBy(this.edges, s.val, t.edge) >= 0 });
      return;
    }
    // sin isla en esa dirección: la raya sigue al dedo en línea recta (en el eje del movimiento)
    const dx = now.x - (isl.x + .5), dy = now.y - (isl.y + .5), horizontal = Math.abs(dx) > Math.abs(dy);
    this.view.preview({ from: d.island, edge: -1, point: horizontal ? { x: now.x, y: isl.y + .5 } : { x: isl.x + .5, y: now.y } });
  }

  #bindPointer(el){
    let drag = null, lastTap = null;
    el.addEventListener('pointerdown', e => {
      if (drag || !this.active) return;
      const island = e.target.closest('[data-island]'), hit = e.target.closest('[data-edge],[data-bridge]');
      if (!island && !hit) return;
      e.preventDefault();
      try { el.setPointerCapture(e.pointerId); } catch (_){}
      const start = this.view.toCell(e.clientX, e.clientY);
      drag = { id: e.pointerId, island: island ? Number(island.dataset.island) : -1, edge: island ? -1 : this.#edgeAt(start), start };
    });
    el.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id || drag.island < 0) return;
      this.#preview(drag, this.view.toCell(e.clientX, e.clientY));
    });
    const end = e => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag;
      drag = null;
      this.view.preview(null);
      if (e.type === 'pointercancel') return;
      if (d.island >= 0){
        const t = this.#target(d.island, d.start, this.view.toCell(e.clientX, e.clientY));
        if (t.edge >= 0){ lastTap = null; this.cycle(t.edge); return; }
        // un toque sin deslizar: si es el segundo seguido en la misma isla, la vacía
        const now = performance.now();
        if (lastTap && lastTap.island === d.island && now - lastTap.at < DOUBLE_MS){ lastTap = null; this.clearIsland(d.island); }
        else lastTap = { island: d.island, at: now };
      } else { lastTap = null; this.cycle(d.edge); }
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  }
}
