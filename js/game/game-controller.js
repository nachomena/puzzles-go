/* Lógica de la partida en curso: coordina estado, reglas, historial y vistas. */
import { LEVELS, MARK, TOOL, HISTORY_LIMIT, TIMING } from '../config.js';
import { createSession } from './store.js';
import { History } from './history.js';
import { analyze, applyAutoX, effectiveMark, nextMark, hasPlayerInput, findHint } from './rules.js';
import { formatTime, plural } from '../lib/format.js';

const HINT_MESSAGES = {
  'wrong-star': 'Esta estrella no va aquí',
  'missing-star': 'Aquí sí va una estrella'
};

export class GameController {
  /**
   * @param {object} deps
   * @param {import('./store.js').Store} deps.store
   * @param {import('../ui/board-view.js').BoardView} deps.board
   * @param {import('../ui/game-hud.js').GameHud} deps.hud
   * @param {(msg:string) => void} deps.notify
   * @param {(result:{time:string, detail:string}) => void} deps.onWin
   */
  constructor({ store, board, hud, notify, onWin }){
    Object.assign(this, { store, board, hud, notify, onWin });
    this.history = new History(HISTORY_LIMIT);
    this.stroke = null;  // trazo en curso: { value, before }
  }

  get session(){ return this.store.state.cur; }
  get settings(){ return this.store.state.settings; }
  get active(){ return !!this.session && !this.session.done; }

  /* ---------- Ciclo de vida ---------- */

  begin(L, puzzle){
    this.store.state.cur = createSession(L, puzzle);
    this.history.clear();
    this.store.save();
  }

  /** Monta el tablero de la partida actual. Devuelve false si no hay partida. */
  mount(){
    const s = this.session;
    if (!s) return false;
    this.hud.setHeader(LEVELS[s.L].name, s.p);
    this.board.build(s.p, { tint: this.settings.tint });
    this.render();
    return true;
  }

  render(){
    const s = this.session;
    if (!s) return;
    const { bad } = analyze(s.marks, s.p);
    this.board.render(s.marks, s.hl, this.settings.errors ? bad : null);
    this.hud.setHistory(this.history.canUndo && !s.done, this.history.canRedo && !s.done);
    this.hud.setTool(this.store.state.tool);
    this.hud.setTime(this.settings.timer ? formatTime(s.time) : '');
  }

  /** Aplica las consecuencias de un cambio. `final` = fin de la acción del jugador. */
  #commit(final){
    applyAutoX(this.session.marks, this.session.p.N, this.settings.autoX);
    this.render();
    if (final){ this.store.save(); this.#checkWin(); }
  }

  /** Un ajuste ha cambiado mientras se juega. */
  applySettings(key){
    if (!this.session) return;
    if (key === 'tint') this.board.build(this.session.p, { tint: this.settings.tint });
    this.board.invalidate();
    applyAutoX(this.session.marks, this.session.p.N, this.settings.autoX);
    this.render();
  }

  /** Un segundo de juego. */
  tick(){
    const s = this.session;
    if (!this.active) return;
    s.time++;
    if (this.settings.timer) this.hud.setTime(formatTime(s.time));
    if (s.time % TIMING.autosaveEverySec === 0) this.store.save();
  }

  /* ---------- Historial ---------- */

  #snapshot(){ return { m: this.session.marks.slice(), h: this.session.hl.slice() }; }
  #restore(snap){ this.session.marks = snap.m; this.session.hl = snap.h; }
  #sameAs(snap){
    const s = this.session;
    return snap.m.every((v, i) => effectiveMark(v) === effectiveMark(s.marks[i]) && snap.h[i] === s.hl[i]);
  }

  undo(){ this.#travel(cur => this.history.undo(cur)); }
  redo(){ this.#travel(cur => this.history.redo(cur)); }
  #travel(step){
    if (!this.active) return;
    const target = step(this.#snapshot());
    if (!target) return;
    this.#restore(target);
    this.#commit(true);
  }

  /* ---------- Herramientas ---------- */

  setTool(tool){
    this.store.state.tool = tool;
    this.store.save();
    this.render();
  }

  /** Empieza un trazo en la casilla i: su valor decide qué hace el resto del arrastre. */
  pressCell(i){
    const s = this.session, before = this.#snapshot();
    let value;
    if (this.store.state.tool === TOOL.STAR){
      const next = nextMark(s.marks[i]);
      s.marks[i] = next;
      value = next === MARK.EMPTY ? 0 : 1;   // arrastrar pone X o las quita
    } else {
      value = s.hl[i] ? 0 : 1;
      s.hl[i] = value;
    }
    this.stroke = { value, before };
    this.#commit(false);
  }

  dragOver(cells){
    if (!this.stroke) return;
    const { marks, hl } = this.session, { value } = this.stroke;
    let changed = false;
    for (const i of cells){
      if (this.store.state.tool === TOOL.BRUSH){
        if (hl[i] !== value){ hl[i] = value; changed = true; }
      } else if (value === 1 && effectiveMark(marks[i]) === MARK.EMPTY){
        marks[i] = MARK.X; changed = true;
      } else if (value === 0 && marks[i] === MARK.X){
        marks[i] = MARK.EMPTY; changed = true;
      }
    }
    if (changed) this.#commit(false);
  }

  release(){
    if (!this.stroke) return;
    const { before } = this.stroke;
    this.stroke = null;
    if (!this.#sameAs(before)) this.history.record(before);
    this.#commit(true);
  }

  /* ---------- Acciones ---------- */

  reset(){
    const s = this.session;
    if (!this.active || !hasPlayerInput(s.marks, s.hl)) return;
    this.history.record(this.#snapshot());
    s.marks = s.marks.map(() => MARK.EMPTY);
    s.hl = s.hl.map(() => 0);
    this.#commit(true);
    this.notify('Tablero vacío. Puedes deshacerlo.');
  }

  hint(){
    const s = this.session;
    if (!this.active) return;
    const hint = findHint(s.marks, s.p.solution);
    if (!hint) return;
    s.hints++;
    if (hint.type === 'place-star'){
      this.history.record(this.#snapshot());
      s.marks[hint.cell] = MARK.STAR;
      this.#commit(true);
    } else {
      this.notify(HINT_MESSAGES[hint.type]);
      this.store.save();
    }
    this.board.flash(hint.cell);
  }

  #checkWin(){
    const s = this.session;
    if (s.done || !analyze(s.marks, s.p).solved) return;
    s.done = true;
    const { record, best } = this.store.recordWin(s.L, s.time, s.hints);
    this.render();
    this.board.celebrate();
    const detail = record
      ? `Nuevo récord en ${LEVELS[s.L].name}.`
      : (s.hints ? `Con ${plural(s.hints, 'pista')}.` : '') + (best ? ` Récord: ${formatTime(best)}.` : '');
    setTimeout(() => this.onWin({ time: formatTime(s.time), detail }), TIMING.winOverlayDelayMs);
  }
}
