/* Controlador base de una partida (patrón plantilla).
   Resuelve lo común a todos los juegos: historial, cronómetro, reinicio, victoria,
   herramientas y cabecera. Cada juego hereda y rellena los pasos marcados como "abstractos". */
import { HISTORY_LIMIT, HINT_COOLDOWN_SEC, TIMING } from '../config.js';
import { History } from './history.js';
import { hintWait } from './hint-cooldown.js';
import { formatTime } from '../lib/format.js';
import { statsRows, winDetail } from './stats.js';

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
  /**
   * Primer error del jugador frente a la solución: { message, ... } o null.
   * La pista lo señala antes de dar ningún paso nuevo (igual en todos los juegos).
   */
  findMistake(){ return null; }
  /** Señala en el tablero el error que devolvió findMistake (p. ej. un destello). */
  showMistake(mistake){}
  /** Avanza un paso hacia la solución (sin errores en el tablero). Devuelve true si lo dio. */
  giveHint(){ return false; }
  /** Recalcula lo derivado tras un cambio (p. ej. X automáticas). */
  normalize(){}
  /** Aviso al reiniciar (los juegos sin deshacer no deben ofrecerlo). */
  get resetMessage(){ return 'Tablero vacío. Puedes deshacerlo.'; }
  /** Reacciona a un ajuste cambiado. */
  onSetting(key){}
  /** Animación de victoria. */
  celebrate(){}
  /** Acciones propias del juego: { nombre: (el) => void }, para los [data-action] de su pantalla. */
  get actions(){ return {}; }
  /** Teclado (opcional). Devuelve true si consumió la tecla. */
  onKey(e){ return false; }
  /**
   * "Siguiente tablero" propio del juego: true = ya ha empezado otro, false = no hay más (se vuelve
   * al menú), null = el siguiente tablero generado del mismo nivel (lo normal).
   */
  next(){ return null; }

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
    this.hud.setHintWait(this.hintWait);
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
    this.hud.setHintWait(this.hintWait);
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
    this.notify(this.resetMessage);
  }

  /** Segundos de juego que faltan para la próxima pista. */
  get hintWait(){ return this.session ? hintWait(this.session, HINT_COOLDOWN_SEC) : 0; }

  /**
   * Pista con límite: una cada HINT_COOLDOWN_SEC de juego. Anula el récord de la partida.
   * Si hay algo mal puesto se señala eso; si no, se avanza un paso.
   */
  hint(){
    if (!this.active) return;
    const wait = this.hintWait;
    if (wait > 0){ this.notify(`Próxima pista en ${formatTime(wait)}`); return; }
    const mistake = this.findMistake();
    if (mistake){
      this.notify(mistake.message);
      this.showMistake(mistake);
    } else if (!this.giveHint()) return;
    const s = this.session;
    s.hints++;
    s.hintAt = s.time;
    this.store.save();
    this.hud.setHintWait(this.hintWait);
  }

  #checkWin(){
    const s = this.session;
    if (s.done || !this.isSolved()) return;
    s.done = true;
    // las estadísticas van por nivel, salvo que el juego las agrupe de otra forma (p. ej. por tablero)
    const key = this.game.statsKey?.(s) ?? s.L;
    const name = this.game.statsName?.(s) ?? statsRows(this.game).find(r => r.key === key)?.name ?? this.game.levels[s.L].name;
    const result = this.store.recordWin(key, s.time, s.hints);
    this.render();
    this.celebrate();
    const detail = winDetail(result, { time: s.time, hints: s.hints, name });
    setTimeout(() => this.onWin({ time: formatTime(s.time), detail }), TIMING.winOverlayDelayMs);
  }
}
