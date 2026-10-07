/* Partida de Smart Dices: arrastrar piezas de la bandeja al tablero y tocar para girarlas. La última
   pieza tocada queda elegida y, con "Mostrar dónde cabe", se marcan los sitios donde cabe tal como está. */
import { GameController } from '../../core/game-controller.js';
import { DicesBoardView } from './board-view.js';
import { bindPieceDrag } from '../../ui/piece-drag.js';
import { PIECES, SIZE, shape } from './engine/pieces.js';
import { evaluate, fits, isSolved, findHint, findMistake, occupancy, cellsOf } from './rules.js';
import { FitSpots } from '../../ui/fit-spots.js';

const samePos = (a, b) => a.rot === b.rot && a.r === b.r && a.c === b.c;

export class SmartDicesController extends GameController {
  constructor(deps){
    super(deps);
    this.view = new DicesBoardView(deps.screen);
    this.spots = new FitSpots(samePos);
    this.#bindSpots(deps.screen.querySelector('.board'));
    bindPieceDrag(deps.screen.querySelector('.wrap'), {
      canMove: piece => this.active && !this.#isFixed(piece),
      cellSize: () => this.view.cellSize(),
      onTap: piece => { this.session.sel = piece; this.rotate(piece); },
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
    return { L, p: puzzle, place, trot: PIECES.map(() => 0), sel: -1, time: 0, done: false, hints: 0 };
  }
  mountBoard(){ this.view.build(this.session.p); }
  renderBoard(){
    const s = this.session, spots = this.spots.update(this.#fittingSpots());
    this.view.render({
      place: s.place, trot: s.trot, fixed: s.p.fixed, sel: s.sel ?? -1,
      status: this.settings.errors ? evaluate(s.place, s.p.arrows) : null,
      spots: spots.map(pos => {
        const sh = shape(PIECES[s.sel], pos.rot), n = sh.cells.length;
        return { x: pos.c + sh.cells.reduce((t, q) => t + q[1], 0) / n + .5, y: pos.r + sh.cells.reduce((t, q) => t + q[0], 0) / n + .5 };
      }),
      chosenSpot: this.spots.chosenIndex, chosen: this.spots.chosen
    });
  }

  /** Sitios donde cabe la pieza elegida, tal como está girada (si el ajuste está activo). */
  #fittingSpots(){
    const s = this.session, piece = s.sel ?? -1;
    if (!this.settings.spots || !this.active || piece < 0 || this.#isFixed(piece)) return [];
    const cur = s.place[piece], rot = cur ? cur.rot : s.trot[piece], out = [];
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++){
      const pos = { rot, r, c };
      if ((!cur || !samePos(cur, pos)) && fits(s.place, piece, pos)) out.push(pos);
    }
    return out;
  }

  /** Toques en el tablero: en un punto, mirar o colocar ahí la pieza; en un hueco, soltarla. */
  #bindSpots(board){
    board.addEventListener('pointerdown', e => {
      const s = this.session;
      if (!this.active) return;
      const spot = e.target.closest('[data-spot]');
      if (spot){
        e.preventDefault();
        const pos = this.spots.tap(Number(spot.dataset.spot));
        if (pos) this.drop(s.sel, pos); else this.render();
        return;
      }
      if (!e.target.closest('[data-piece]') && s.sel >= 0){ s.sel = -1; this.spots.clear(); this.render(); }
    });
  }
  onSetting(){ this.spots.clear(); }

  snapshot(){ return { place: this.session.place.map(p => p && { ...p }), trot: this.session.trot.slice() }; }
  restore(snap){ this.session.place = snap.place; this.session.trot = snap.trot; }
  hasInput(){ const s = this.session; return s.place.some((pos, piece) => pos && !s.p.fixed.includes(piece)); }
  clearInput(){
    const s = this.session;
    s.place = s.place.map((pos, piece) => s.p.fixed.includes(piece) ? pos : null);
  }
  isSolved(){ return isSolved(this.session.place, this.session.p.arrows); }
  /** Aquí no hay botón de deshacer: el aviso no lo ofrece. */
  get resetMessage(){ return 'Tablero vacío.'; }
  celebrate(){ this.view.celebrate(); }

  findMistake(){
    const s = this.session, m = findMistake(s.place, s.p.solution, s.p.fixed);
    return m && { ...m, message: 'Esta pieza no va aquí' };
  }
  showMistake({ piece }){ this.view.flash(piece); }
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
    this.spots.clear();
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
    this.spots.clear();
    s.sel = piece;
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
