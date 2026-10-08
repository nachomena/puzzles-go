/* Partida de Katamino: arrastrar pentominós al tablero, tocar para elegir y otra vez para girar,
   y voltear la elegida con un botón. Al resolver un PENTA, el siguiente de la fila conserva las
   piezas puestas: el tablero crece una fila y llega una pieza nueva. */
import { GameController } from '../../core/game-controller.js';
import { bindPieceDrag } from '../../ui/piece-drag.js';
import { KataminoBoardView } from './board-view.js';
import { W, PIECES, orient } from './engine/pieces.js';
import { nextPenta } from './engine/sets.js';
import { fits, isSolved, check, hintFrom } from './rules.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export class KataminoController extends GameController {
  constructor(deps){
    super(deps);
    this.view = new KataminoBoardView(deps.screen);
    bindPieceDrag(deps.screen.querySelector('.wrap'), {
      canMove: () => this.active,
      cellSize: () => this.view.cellSize(),
      onTap: piece => this.tap(piece),
      onDrop: (piece, rect) => this.drop(piece, this.view.cellFor(rect)),
      ghost: (el, piece) => {
        const s = this.session, pose = s.place[piece];
        return this.view.ghostFor(piece, pose || { m: s.tm[piece], r: s.tr[piece] });
      }
    });
  }

  get #n(){ return this.session.p.n; }

  /* ---------- Pasos de la plantilla ---------- */

  createSession(L, puzzle){
    return { L, p: puzzle, place: PIECES.map(() => null), tm: PIECES.map(() => 0), tr: PIECES.map(() => 0), sel: -1, time: 0, done: false, hints: 0 };
  }
  mountBoard(){ this.view.build(this.#n); }
  renderBoard(){
    const s = this.session;
    this.view.render({ pieces: s.p.pieces, place: s.place, tm: s.tm, tr: s.tr, sel: s.sel });
  }
  snapshot(){ return { place: this.session.place.map(p => p && { ...p }) }; }
  restore(snap){ this.session.place = snap.place; }
  hasInput(){ return this.session.place.some(Boolean); }
  clearInput(){
    const s = this.session;
    s.place.forEach((pose, piece) => { if (pose) this.#toTray(piece); });
    s.sel = -1;
  }
  isSolved(){ return isSolved(this.session.place, this.session.p.pieces); }
  get resetMessage(){ return 'Tablero vacío.'; }
  celebrate(){ this.session.sel = -1; this.renderBoard(); this.view.celebrate(); }
  get actions(){ return { flip: () => this.flip() }; }

  /**
   * Siguiente PENTA: en la misma fila se quedan las piezas (el tablero crece una fila); al acabar
   * la fila, se empieza la siguiente con el tablero vacío. false si era el último del desafío.
   */
  next(){
    const s = this.session;
    if (!s) return false;
    const nx = nextPenta(s.L, s.p.label, s.p.n);
    if (!nx) return false;
    const { sameRow, ...puzzle } = nx;
    this.begin(s.L, puzzle);
    if (sameRow){
      const t = this.session;
      t.place = s.place.map(p => p && { ...p });
      t.tm = s.tm.slice(); t.tr = s.tr.slice();
      this.store.save();
    }
    return true;
  }

  /* ---------- Pistas: no hay una única solución, se busca una que respete lo puesto ---------- */

  findMistake(){
    const s = this.session, res = check(s.place, s.p.pieces);
    this.solution = res.solution || null;
    if (res.solution) return null;
    return res.mistake >= 0
      ? { piece: res.mistake, message: 'Esta pieza no va aquí' }
      : { piece: -1, message: 'Así no se puede completar: quita alguna pieza' };
  }
  showMistake({ piece }){
    if (piece < 0) return;
    this.session.sel = piece; this.render(); this.view.flash(piece);
  }
  giveHint(){
    const s = this.session, hint = this.solution && hintFrom(s.place, s.p.pieces, this.solution);
    if (!hint) return false;
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

  /**
   * Nueva cara o giro: en la bandeja, sin más; en el tablero, alrededor del mismo centro y, si no
   * cabe ahí, en el hueco más cercano.
   */
  #reorient(piece, m, r, failMsg){
    const s = this.session, pose = s.place[piece], n = this.#n;
    if (!pose){ s.tm[piece] = m; s.tr[piece] = r; this.store.save(); this.render(); return; }
    const a = orient(piece, pose.m, pose.r), b = orient(piece, m, r);
    const cx = pose.x + a.w / 2, cy = pose.y + a.h / 2;
    const x0 = Math.round(cx - b.w / 2), y0 = Math.round(cy - b.h / 2), tries = [];
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) tries.push({ dx, dy });
    tries.sort((p, q) => Math.hypot(p.dx, p.dy) - Math.hypot(q.dx, q.dy));
    const next = tries.map(({ dx, dy }) => ({ m, r, x: x0 + dx, y: y0 + dy })).find(p => fits(s.place, piece, p, n));
    if (!next){ this.notify(failMsg); return; }
    s.place[piece] = next;
    this.commit(true);
  }

  /** Primer toque: elegir la pieza; si ya estaba elegida, girarla 90°. */
  tap(piece){
    const s = this.session;
    if (!this.active) return;
    if (s.sel !== piece){ s.sel = piece; this.render(); return; }
    const pose = s.place[piece];
    const m = pose ? pose.m : s.tm[piece], r = ((pose ? pose.r : s.tr[piece]) + 1) % 4;
    this.#reorient(piece, m, r, 'No cabe girada aquí');
  }

  /** Da la vuelta a la pieza elegida. */
  flip(){
    const s = this.session, piece = s.sel;
    if (!this.active || piece < 0) return;
    const pose = s.place[piece];
    // voltear en espejo horizontal sin cambiar el giro aparente
    const m = 1 - (pose ? pose.m : s.tm[piece]), r = pose ? pose.r : s.tr[piece];
    this.#reorient(piece, m, (4 - r) % 4, 'No cabe volteada aquí');
  }

  /** Suelta una pieza: en el tablero (si cabe; pegada al borde si asoma un poco) o fuera, a la bandeja. */
  drop(piece, cell){
    const s = this.session, n = this.#n;
    if (!this.active) return;
    s.sel = piece;
    const cur = s.place[piece];
    if (!cell){
      if (cur){ this.#toTray(piece); this.commit(true); } else this.render();
      return;
    }
    const m = cur ? cur.m : s.tm[piece], r = cur ? cur.r : s.tr[piece], o = orient(piece, m, r);
    const pose = { m, r, x: clamp(cell.x, 0, W - o.w), y: clamp(cell.y, 0, n - o.h) };
    if (cur && cur.x === pose.x && cur.y === pose.y){ this.render(); return; }
    if (!fits(s.place, piece, pose, n)){ this.render(); return; }
    s.place[piece] = pose;
    this.commit(true);
  }
}
