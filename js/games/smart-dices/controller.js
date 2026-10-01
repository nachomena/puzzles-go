/* Partida de Smart Dices: arrastrar piezas de la bandeja al tablero y tocar para girarlas. */
import { GameController } from '../../core/game-controller.js';
import { DicesBoardView } from './board-view.js';
import { bindPieceDrag } from './piece-drag.js';
import { PIECES, SIZE, shape } from './engine/pieces.js';
import { evaluate, fits, isSolved, findHint, occupancy, cellsOf } from './rules.js';

export class SmartDicesController extends GameController {
  constructor(deps){
    super(deps);
    this.view = new DicesBoardView(deps.screen);
    bindPieceDrag(deps.screen.querySelector('.wrap'), {
      canMove: piece => this.active && !this.#isFixed(piece),
      cellSize: () => this.view.cellSize(),
      onTap: piece => this.rotate(piece),
      onDrop: (piece, rect) => this.drop(piece, this.view.cellFor(rect))
    });
  }

  #isFixed(piece){ return this.session.p.fixed.includes(piece); }

  /* ---------- Pasos de la plantilla ---------- */

  createSession(L, puzzle){
    const place = PIECES.map(() => null);
    for (const piece of puzzle.fixed){
      const { rot, r, c } = puzzle.solution[piece];
      place[piece] = { rot, r, c };
    }
    return { L, p: puzzle, place, trot: PIECES.map(() => 0), time: 0, done: false, hints: 0 };
  }
  mountBoard(){ this.view.build(this.session.p); }
  renderBoard(){
    const s = this.session;
    this.view.render({
      place: s.place, trot: s.trot, fixed: s.p.fixed,
      status: this.settings.errors ? evaluate(s.place, s.p.arrows) : null
    });
  }
  snapshot(){ return { place: this.session.place.map(p => p && { ...p }), trot: this.session.trot.slice() }; }
  restore(snap){ this.session.place = snap.place; this.session.trot = snap.trot; }
  hasInput(){ const s = this.session; return s.place.some((pos, piece) => pos && !s.p.fixed.includes(piece)); }
  clearInput(){
    const s = this.session;
    s.place = s.place.map((pos, piece) => s.p.fixed.includes(piece) ? pos : null);
  }
  isSolved(){ return isSolved(this.session.place, this.session.p.arrows); }
  celebrate(){ this.view.celebrate(); }

  giveHint(){
    const s = this.session, hint = findHint(s.place, s.p.solution, s.p.fixed);
    if (!hint) return false;
    this.record();
    // Lo que ocupe su sitio vuelve a la bandeja
    const grid = occupancy(s.place);
    for (const i of cellsOf(hint.piece, hint.pos).cells){
      const other = grid[i];
      if (other >= 0 && other !== hint.piece){ s.trot[other] = s.place[other].rot; s.place[other] = null; }
    }
    s.place[hint.piece] = hint.pos;
    this.commit(true);
    this.view.flash(hint.piece);
    return true;
  }

  /* ---------- Acciones de piezas ---------- */

  /** Gira 90°: en la bandeja siempre; en el tablero, si cabe (se reajusta para no salirse). */
  rotate(piece){
    const s = this.session;
    if (!this.active || this.#isFixed(piece)) return;
    const pos = s.place[piece];
    if (!pos){ s.trot[piece] = (s.trot[piece] + 1) % 4; this.store.save(); this.render(); return; }
    const rot = (pos.rot + 1) % 4, sh = shape(PIECES[piece], rot);
    const clamp = (v, size) => Math.max(0, Math.min(SIZE - size, v));
    const candidates = [{ rot, r: pos.r, c: pos.c }, { rot, r: clamp(pos.r, sh.h), c: clamp(pos.c, sh.w) }];
    const next = candidates.find(p => fits(s.place, piece, p));
    if (!next){ this.notify('No cabe girada aquí'); return; }
    this.record();
    s.place[piece] = next;
    this.commit(true);
  }

  /** Suelta una pieza: en una casilla del tablero (si cabe) o fuera (vuelve a la bandeja). */
  drop(piece, cell){
    const s = this.session;
    if (!this.active || this.#isFixed(piece)) return;
    const cur = s.place[piece];
    if (!cell){
      if (!cur) return;
      this.record();
      s.trot[piece] = cur.rot;
      s.place[piece] = null;
      this.commit(true);
      return;
    }
    const pos = { rot: cur ? cur.rot : s.trot[piece], r: cell.r, c: cell.c };
    if (cur && cur.r === pos.r && cur.c === pos.c) return;
    if (!fits(s.place, piece, pos)){ this.render(); return; }
    this.record();
    s.place[piece] = pos;
    this.commit(true);
  }
}
