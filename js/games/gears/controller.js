/* Partida de Engranajes: tocar un hueco alterna punto → engranaje → vacío; "Girar" mueve la manivela y
   todo lo que ya está unido a ella. */
import { GameController } from '../../core/game-controller.js';
import { GearsBoardView } from './board-view.js';
import { evaluate, isSolved, findMistake, findHint } from './rules.js';

/** Tras cada toque (0 vacío, 1 engranaje, 2 punto): vacío → punto → engranaje → vacío. */
const NEXT = [2, 0, 1];

export class GearsController extends GameController {
  constructor(deps){
    super(deps);
    this.view = new GearsBoardView(deps.screen);
    this.view.root.addEventListener('pointerdown', e => {
      if (e.button > 0) return;
      const i = this.view.socketAt(e);
      if (i >= 0){ e.preventDefault(); this.toggle(i); }
    });
  }

  /* ---------- Pasos de la plantilla ---------- */

  createSession(L, puzzle){ return { L, p: puzzle, marks: new Array(puzzle.w * puzzle.h).fill(0), time: 0, done: false, hints: 0 }; }
  mountBoard(){ this.view.build(this.session.p); }
  renderBoard(){
    const s = this.session;
    this.view.render({ marks: s.marks, ...evaluate(s.p, s.marks), showErrors: this.settings.errors });
  }
  snapshot(){ return { marks: this.session.marks.slice() }; }
  restore(snap){ this.session.marks = snap.marks.slice(); }
  hasInput(){ return this.session.marks.some(Boolean); }
  clearInput(){ this.session.marks.fill(0); }
  isSolved(){ const s = this.session; return isSolved(s.p, s.marks); }
  celebrate(){ this.view.celebrate(); }
  get actions(){ return { turn: () => this.turn() }; }

  /** ¿Se puede tocar el hueco i? (no los de la manivela, el cerrojo, los fijos ni los números) */
  #free(i){ const p = this.session.p; return i !== p.crank && i !== p.lock && !p.fixed.includes(i) && p.clues[i] === undefined; }

  toggle(i){
    const s = this.session;
    if (!this.active || !this.#free(i)) return;
    const before = this.snapshot(), from = s.marks[i];
    s.marks[i] = NEXT[from];
    this.recordTap(i, before, from === 0 ? 'mark' : from === 2 ? 'piece' : null);
    this.commit(true);
  }

  /** Gira la manivela y dice qué falta para abrir el cerrojo. */
  turn(){
    if (!this.active) return;
    const { p, marks } = this.session, a = evaluate(p, marks);
    this.view.turn();
    if (a.jam) return this.notify('Se atasca: hay un círculo de engranajes');
    if (!a.on.has(p.lock)) return this.notify('El cerrojo aún no está unido a la manivela');
    if ([p.lock, ...p.fixed].some(i => a.spin[i] !== p.spin[i])) return this.notify('Algo gira hacia el lado contrario de su flecha');
    if (a.on.size !== a.gears.reduce((t, g) => t + g, 0)) return this.notify('Sobran engranajes sueltos');
    this.notify('El cerrojo gira, pero algún número no cuadra');
  }

  findMistake(){
    const s = this.session, i = findMistake(s.p, s.marks);
    return i >= 0 ? { cell: i, message: s.marks[i] === 1 ? 'Aquí no va un engranaje' : 'Aquí sí va un engranaje' } : null;
  }
  showMistake({ cell }){ this.view.flash(cell); }
  giveHint(){
    const s = this.session, i = findHint(s.p, s.marks);
    if (i < 0) return false;
    this.record();
    s.marks[i] = 1;
    this.commit(true);
    this.view.flash(i);
    return true;
  }
}
