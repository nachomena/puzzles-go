/* Partida de Rush Hour: arrastrar cada vehículo por su carril hasta sacar el coche rojo.
   Un movimiento es deslizar un vehículo (cualquier distancia); se puede deshacer y rehacer. */
import { GameController } from '../../core/game-controller.js';
import { RushHourBoardView } from './board-view.js';
import { range, isSolved, solve } from './engine/board.js';

const DRAG_THRESHOLD = 4;

export class RushHourController extends GameController {
  constructor(deps){
    super(deps);
    this.view = new RushHourBoardView(deps.screen);
    this.#bindPointer(deps.screen.querySelector('[data-rh-board]'));
  }

  /* ---------- Pasos de la plantilla ---------- */

  createSession(L, puzzle){
    return { L, p: puzzle, pos: puzzle.pos.slice(), moves: 0, time: 0, done: false, hints: 0 };
  }
  mountBoard(){ this.view.build(this.session.p.cars); }
  renderBoard(){ const s = this.session; this.view.render({ pos: s.pos, moves: s.moves, min: s.p.min }); }
  snapshot(){ return { pos: this.session.pos.slice(), moves: this.session.moves }; }
  restore(snap){ this.session.pos = snap.pos.slice(); this.session.moves = snap.moves; }
  hasInput(){ return this.session.moves > 0; }
  clearInput(){ const s = this.session; s.pos = s.p.pos.slice(); s.moves = 0; }
  isSolved(){ return isSolved(this.session.p.cars, this.session.pos); }
  get resetMessage(){ return 'Vuelta a empezar. Puedes deshacerlo.'; }
  celebrate(){ this.view.celebrate(); }

  /** Pista: el siguiente movimiento de la solución más corta desde donde está el tablero. */
  giveHint(){
    const s = this.session, path = solve(s.p.cars, s.pos);
    if (!path || !path.length) return false;
    this.#move(path[0].car, path[0].to);
    this.view.flash(path[0].car);
    return true;
  }

  #move(i, to){
    const s = this.session;
    if (s.pos[i] === to) return;
    this.record();
    s.pos[i] = to;
    s.moves++;
    this.commit(true);
  }

  /** Arrastrar: el vehículo sigue al dedo por su carril, sin atravesar a los demás; al soltar, encaja. */
  #bindPointer(el){
    let drag = null;
    el.addEventListener('pointerdown', e => {
      const target = e.target.closest('[data-car]');
      if (!target || drag || !this.active) return;
      e.preventDefault();
      try { el.setPointerCapture(e.pointerId); } catch (_){}
      const s = this.session, i = Number(target.dataset.car), car = s.p.cars[i];
      drag = { id: e.pointerId, i, h: car.dir === 'h', x: e.clientX, y: e.clientY, from: s.pos[i],
        ...range(s.p.cars, s.pos, i), cell: this.view.cellSize(), at: s.pos[i], moved: false };
    });
    el.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag.h ? e.clientX - drag.x : e.clientY - drag.y;
      if (!drag.moved && Math.abs(d) < DRAG_THRESHOLD) return;
      drag.moved = true;
      drag.at = Math.max(drag.min, Math.min(drag.max, drag.from + d / drag.cell));
      this.view.place(drag.i, drag.at);
      this.view.els[drag.i].classList.add('is-dragging');
    });
    const end = e => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag;
      drag = null;
      this.view.els[d.i].classList.remove('is-dragging');
      this.#move(d.i, Math.round(d.at));
      this.renderBoard();
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  }
}
