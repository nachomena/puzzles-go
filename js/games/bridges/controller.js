/* Bridges game: swiping from one island towards another (or tapping the gap between them) adds a
   bridge; with two, the next tap removes them. Two taps in a row on an island remove all its bridges.
   Bridges can't cross. */
import { GameController } from '../../core/game-controller.js';
import { t } from '../../i18n/index.js';
import { BridgesBoardView } from './board-view.js';
import { edgesOf } from './engine/graph.js';
import { counts, blockedBy, isSolved, findMistake, findHint } from './rules.js';

const SWIPE = .4;   // cells to swipe for it to count as a direction
const DOUBLE_MS = 350;   // time between two taps for them to count as a double tap

export class BridgesController extends GameController {
  constructor(deps){
    super(deps);
    this.view = new BridgesBoardView(deps.screen);
    this.#bindPointer(this.view.root);
  }

  get edges(){ const p = this.session.p; return this.cache?.p === p ? this.cache.edges : (this.cache = { p, edges: edgesOf(p) }).edges; }

  /* ---------- Template steps ---------- */

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
    return k >= 0 ? { edge: k, message: t('games.bridges.extraBridge') } : null;
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

  /** One more bridge on span k (from 2 it goes back to 0). */
  cycle(k){
    const s = this.session;
    if (!this.active || k < 0) return;
    const next = (s.val[k] + 1) % 3;
    if (next > 0 && blockedBy(this.edges, s.val, k) >= 0){ this.notify(t('games.bridges.crosses')); return; }
    this.record();
    s.val[k] = next;
    this.commit(true);
  }

  /** Removes all the bridges of island i. */
  clearIsland(i){
    const s = this.session;
    if (!this.active) return;
    const ks = this.edges.flatMap((e, k) => (e.a === i || e.b === i) && s.val[k] ? [k] : []);
    if (!ks.length) return;
    this.record();
    for (const k of ks) s.val[k] = 0;
    this.commit(true);
  }

  /** Span leaving island i in direction (dx, dy), or -1. */
  #edgeFrom(i, dx, dy){
    const isl = this.session.p.islands;
    return this.edges.findIndex(e => {
      if (e.a !== i && e.b !== i) return false;
      const o = isl[e.a === i ? e.b : e.a], me = isl[i];
      return Math.sign(o.x - me.x) === dx && Math.sign(o.y - me.y) === dy;
    });
  }

  /**
   * Span touched at the point (cells with decimals): the closest one among those running there (if two
   * cross, the one whose line is touched wins). -1 if none is within half a cell.
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

  /** What releasing now would do: { edge, to } of the span being dragged towards (edge -1 if none). */
  #target(island, start, now){
    const dx = now.x - start.x, dy = now.y - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE) return { edge: -1, to: -1 };
    const horizontal = Math.abs(dx) > Math.abs(dy);
    const edge = this.#edgeFrom(island, horizontal ? Math.sign(dx) : 0, horizontal ? 0 : Math.sign(dy));
    if (edge < 0) return { edge: -1, to: -1 };
    const e = this.edges[edge];
    return { edge, to: e.a === island ? e.b : e.a };
  }

  /** Drag preview: the bridge that would be placed, or a straight line to the finger. */
  #preview(d, now){
    const s = this.session, isl = s.p.islands[d.island], t = this.#target(d.island, d.start, now);
    if (t.edge >= 0){
      const count = (s.val[t.edge] + 1) % 3;
      this.view.preview({ from: d.island, edge: t.edge, to: t.to, count, bad: count > 0 && blockedBy(this.edges, s.val, t.edge) >= 0 });
      return;
    }
    // no island in that direction: the line follows the finger in a straight line (along the movement's axis)
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
        // a tap without swiping: if it is the second in a row on the same island, it clears it
        const now = performance.now();
        if (lastTap && lastTap.island === d.island && now - lastTap.at < DOUBLE_MS){ lastTap = null; this.clearIsland(d.island); }
        else lastTap = { island: d.island, at: now };
      } else { lastTap = null; this.cycle(d.edge); }
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  }
}
