/* Controlador base de una partida (patrón plantilla).
   Resuelve lo común a todos los juegos: historial, cronómetro, reinicio, victoria,
   herramientas y cabecera. Cada juego hereda y rellena los pasos marcados como "abstractos". */
import { HISTORY_LIMIT, TIMING } from '../config.js';
import { History } from './history.js';
import { formatTime, plural } from '../lib/format.js';

export class GameController {
  /**
   * @param {object} deps
   * @param {object} deps.game  definición del juego (ver js/games/README.md)
   * @param {import('./store.js').Store} deps.store
   * @param {import('../ui/game-hud.js').GameHud} deps.hud
   * @param {(msg:string) => void} deps.notify
   * @param {(result:{time:string, detail:string}) => void} deps.onWin
   */
  constructor({ game, store, hud, notify, onWin }){
    Object.assign(this, { game, store, hud, notify, onWin });
    this.history = new History(HISTORY_LIMIT);
  }

  get session(){ return this.store.state.cur; }
  get settings(){ return this.store.state.settings; }
  get tool(){ return this.store.state.tool; }
  get active(){ return !!this.session && !this.session.done; }

  /* ---------- Pasos abstractos (cada juego los implementa) ---------- */

  /** Partida nueva sobre un tablero. */
  createSession(L, puzzle){ throw new Error('createSession no implementado'); }
  /** Monta el tablero en el DOM. */
  mountBoard(){}
  /** Pinta el tablero con el estado actual. */
  renderBoard(){}
  /** Copia del estado editable (para deshacer). */
  snapshot(){ throw new Error('snapshot no implementado'); }
  restore(snap){ throw new Error('restore no implementado'); }
  /** ¿El estado actual equivale a la instantánea? */
  sameAs(snap){ return false; }
  /** ¿Hay algo que el jugador haya puesto? (para reiniciar) */
  hasInput(){ return false; }
  /** Vacía lo que puso el jugador. */
  clearInput(){}
  /** ¿Está resuelto el tablero? */
  isSolved(){ return false; }
  /** Pista: corrige un error o avanza un paso. */
  hint(){}
  /** Recalcula lo derivado tras un cambio (p. ej. X automáticas). */
  normalize(){}
  /** Reacciona a un ajuste cambiado. */
  onSetting(key){}
  /** Animación de victoria. */
  celebrate(){}
  /** Acciones propias del juego: { nombre: (el) => void }, para los [data-action] de su pantalla. */
  get actions(){ return {}; }
  /** Teclado (opcional). Devuelve true si consumió la tecla. */
  onKey(e){ return false; }

  /* ---------- Ciclo de vida ---------- */

  begin(L, puzzle){
    this.store.state.cur = this.createSession(L, puzzle);
    this.history.clear();
    this.store.save();
  }

  /** Monta la partida actual. Devuelve false si no hay partida. */
  mount(){
    const s = this.session;
    if (!s) return false;
    this.hud.setHeader(this.game.levels[s.L].name, this.game.sizeLabel(s.p));
    this.mountBoard();
    this.render();
    return true;
  }

  render(){
    const s = this.session;
    if (!s) return;
    this.renderBoard();
    this.hud.setHistory(this.history.canUndo && !s.done, this.history.canRedo && !s.done);
    this.hud.setTool(this.tool);
    this.hud.setTime(this.settings.timer ? formatTime(s.time) : '');
  }

  /** Aplica las consecuencias de un cambio. `final` = fin de la acción del jugador. */
  commit(final){
    this.normalize();
    this.render();
    if (final){ this.store.save(); this.#checkWin(); }
  }

  /** Guarda el estado actual en el historial antes de modificarlo. */
  record(){ this.history.record(this.snapshot()); }

  applySettings(key){
    if (!this.session) return;
    this.onSetting(key);
    this.normalize();
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

  /* ---------- Acciones comunes ---------- */

  undo(){ this.#travel(cur => this.history.undo(cur)); }
  redo(){ this.#travel(cur => this.history.redo(cur)); }
  #travel(step){
    if (!this.active) return;
    const target = step(this.snapshot());
    if (!target) return;
    this.restore(target);
    this.commit(true);
  }

  setTool(tool){
    if (!this.game.tools.includes(tool)) return;
    this.store.state.tool = tool;
    this.store.save();
    this.render();
  }

  reset(){
    if (!this.active || !this.hasInput()) return;
    this.record();
    this.clearInput();
    this.commit(true);
    this.notify('Tablero vacío. Puedes deshacerlo.');
  }

  /** Cuenta una pista usada (anula el récord de la partida). */
  countHint(){ this.session.hints++; }

  #checkWin(){
    const s = this.session;
    if (s.done || !this.isSolved()) return;
    s.done = true;
    const levelName = this.game.levels[s.L].name;
    const { record, best } = this.store.recordWin(s.L, s.time, s.hints);
    this.render();
    this.celebrate();
    const detail = record
      ? `Nuevo récord en ${levelName}.`
      : (s.hints ? `Con ${plural(s.hints, 'pista')}.` : '') + (best ? ` Récord: ${formatTime(best)}.` : '');
    setTimeout(() => this.onWin({ time: formatTime(s.time), detail }), TIMING.winOverlayDelayMs);
  }
}
