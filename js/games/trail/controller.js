/* Trail game: drag from the 1 to draw the path cell by cell. Going back over the path itself trims it;
   tapping a cell on the path makes it end there. */
import { GameController } from '../../core/game-controller.js';
import { t } from '../../i18n/index.js';
import { bindCellDrag } from '../../ui/cell-drag.js';
import { TrailBoardView } from './board-view.js';
import { labels, canExtend, isSolved, firstMistake } from './rules.js';

export class TrailController extends GameController {
  constructor(deps){
    super(deps);
    this.view = new TrailBoardView(deps.screen);
    let before = null;
    bindCellDrag(this.view.grid.root, {
      cellAt: (x, y) => this.view.cellAt(x, y),
      cellSize: () => this.view.cellSize(),
      enabled: () => this.active,
      onStart: i => { before = this.snapshot(); this.#start(i); this.commit(false); },
      onEnter: cells => { for (const c of cells) if (!this.#step(c)) break; this.commit(false); },
      onEnd: () => {
        if (before && before.path.join() !== this.session.path.join()) this.history.record(before);
        before = null;
        this.commit(true);
      }
    });
  }

  get #label(){ const s = this.session; return this.labelCache?.p === s.p ? this.labelCache.l : (this.labelCache = { p: s.p, l: labels(s.p.n, s.p.nums) }).l; }

  /** Start dragging at `i`: on the 1 (if there is no path), on the path (it is trimmed there) or next to the end. */
  #start(i){
    const s = this.session, k = s.path.indexOf(i);
    if (!s.path.length){ if (i === s.p.nums[0]) s.path = [i]; return; }
    if (k >= 0){ s.path = s.path.slice(0, k + 1); return; }
    this.#step(i);
  }

  /** Step to cell c: back (trims), or forward if possible. false if it can't go on. */
  #step(c){
    const s = this.session, path = s.path, k = path.indexOf(c);
    if (!path.length) return false;
    if (k >= 0){ s.path = path.slice(0, k + 1); return true; }
    if (!canExtend(s.p.n, path, this.#label, c)) return false;
    path.push(c);
    return true;
  }

  /* ---------- Template steps ---------- */

  createSession(L, puzzle){ return { L, p: puzzle, path: [], time: 0, done: false, hints: 0 }; }
  mountBoard(){ const p = this.session.p; this.view.build(p.n, p.nums); }
  renderBoard(){ this.view.render({ path: this.session.path }); }
  snapshot(){ return { path: this.session.path.slice() }; }
  restore(snap){ this.session.path = snap.path.slice(); }
  sameAs(snap){ return snap.path.join() === this.session.path.join(); }
  hasInput(){ return this.session.path.length > 1; }
  clearInput(){ this.session.path = []; }
  isSolved(){ const s = this.session; return isSolved(s.p.n, s.p.nums, s.path); }
  celebrate(){ this.view.celebrate(); }

  findMistake(){
    const s = this.session, k = firstMistake(s.path, s.p.solution);
    return k >= 0 ? { index: k, message: t('games.trail.detour') } : null;
  }
  showMistake({ index }){ this.view.flash(this.session.path[index]); }
  /** Hint: extends the path (correctly) up to the next number. */
  giveHint(){
    const s = this.session, sol = s.p.solution, label = this.#label;
    let end = Math.max(1, s.path.length);
    if (end >= sol.length) return false;
    this.record();
    do end++; while (end < sol.length && label[sol[end - 1]] < 0);
    s.path = sol.slice(0, end);
    this.commit(true);
    this.view.flash(sol[end - 1]);
    return true;
  }
}
