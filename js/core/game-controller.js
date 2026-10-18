/* Base controller of a game (template method pattern).
   Handles what all games share: history, timer, restart, win, tools and header. Each game
   inherits and fills in the steps marked as "abstract". */
import { HISTORY_LIMIT, HINT_COOLDOWN_SEC, TIMING } from '../config.js';
import { History } from './history.js';
import { hintWait } from './hint-cooldown.js';
import { formatTime } from '../lib/format.js';
import { statsRows, winDetail } from './stats.js';
import { winStrip } from './progress.js';
import { t } from '../i18n/index.js';

export class GameController {
  /**
   * @param {object} deps
   * @param {object} deps.game  game definition (see js/games/README.md)
   * @param {import('./store.js').Store} deps.store
   * @param {import('../ui/game-hud.js').GameHud} deps.hud
   * @param {(msg:string) => void} deps.notify
   * @param {(result:{time:string, detail:string, strip:object|null}) => void} deps.onWin  strip: see core/progress.js#winStrip
   */
  constructor({ game, store, hud, notify, onWin }){
    Object.assign(this, { game, store, hud, notify, onWin });
    this.history = new History(HISTORY_LIMIT);
  }

  get session(){ return this.store.state.cur; }
  get settings(){ return this.store.state.settings; }
  get tool(){ return this.store.state.tool; }
  get active(){ return !!this.session && !this.session.done; }

  /* ---------- Abstract steps (each game implements them) ---------- */

  /** New game on a board. */
  createSession(L, puzzle){ throw new Error('createSession not implemented'); }
  /** Mounts the board in the DOM. */
  mountBoard(){}
  /** Draws the board with the current state. */
  renderBoard(){}
  /** Copy of the editable state (for undo). */
  snapshot(){ throw new Error('snapshot not implemented'); }
  restore(snap){ throw new Error('restore not implemented'); }
  /** Is the current state equal to the snapshot? */
  sameAs(snap){ return false; }
  /** Is there anything the player has placed? (for restart) */
  hasInput(){ return false; }
  /** Clears what the player placed. */
  clearInput(){}
  /** Is the board solved? */
  isSolved(){ return false; }
  /**
   * The player's first mistake against the solution: { message, ... } or null.
   * The hint points it out before giving any new step (the same in every game).
   */
  findMistake(){ return null; }
  /** Shows on the board the mistake returned by findMistake (e.g. a flash). */
  showMistake(mistake){}
  /** Moves one step towards the solution (with no mistakes on the board). Returns true if it did. */
  giveHint(){ return false; }
  /** Recomputes derived state after a change (e.g. automatic X marks). */
  normalize(){}
  /** Message on restart (games without undo shouldn't offer it). */
  get resetMessage(){ return t('play.cleared'); }
  /** Reacts to a changed setting. */
  onSetting(key){}
  /** Win animation. */
  celebrate(){}
  /** Extra win data for the statistics, e.g. { moves, min } (see core/stats.js and core/progress.js). */
  winExtra(){ return undefined; }
  /** The game's own actions: { name: (el) => void }, for the [data-action] on its screen. */
  get actions(){ return {}; }
  /** Keyboard (optional). Returns true if it consumed the key. */
  onKey(e){ return false; }
  /**
   * The game's own "Next board": true = another one has already started, false = there are no more
   * (back to the menu), null = the next generated board of the same level (the usual case).
   */
  next(){ return null; }

  /* ---------- Life cycle ---------- */

  begin(L, puzzle){
    this.store.state.cur = this.createSession(L, puzzle);
    this.history.clear();
    this.store.save();
  }

  /** Mounts the current game. Returns false if there is none. */
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

  /** Applies the consequences of a change. `final` = end of the player's action. */
  commit(final){
    this.normalize();
    this.render();
    if (final){
      this.session.input = this.hasInput();   // a game with something placed is offered to continue (Store)
      this.store.save();
      this.#checkWin();
    }
  }

  /** Saves the current state in the history before changing it. */
  record(){ this.history.record(this.snapshot()); }

  /**
   * History of a tap on a cell that goes empty → mark → piece (star, bulb).
   * `before`: snapshot from before the tap. `step`: 'mark' if it put the mark on an empty cell,
   * 'piece' if it swapped that mark for the piece, null otherwise. A 'piece' right after the 'mark'
   * on the same cell isn't recorded separately, so undo empties the cell instead of leaving the mark.
   */
  recordTap(cell, before, step){
    const t = this.markTap;
    if (!(step === 'piece' && t?.cell === cell && t.stamp === this.history.stamp)) this.history.record(before);
    this.markTap = step === 'mark' ? { cell, stamp: this.history.stamp } : null;
  }

  applySettings(key){
    if (!this.session) return;
    this.onSetting(key);
    this.normalize();
    this.render();
  }

  /** One second of play. */
  tick(){
    const s = this.session;
    if (!this.active) return;
    s.time++;
    if (this.settings.timer) this.hud.setTime(formatTime(s.time));
    this.hud.setHintWait(this.hintWait);
    if (s.time % TIMING.autosaveEverySec === 0) this.store.save();
  }

  /* ---------- Common actions ---------- */

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

  /** Seconds of play left until the next hint. */
  get hintWait(){ return this.session ? hintWait(this.session, HINT_COOLDOWN_SEC) : 0; }

  /**
   * Rate-limited hint: one every HINT_COOLDOWN_SEC of play. It voids the game's record.
   * If something is wrong it points that out; otherwise it takes one step.
   */
  hint(){
    if (!this.active) return;
    const wait = this.hintWait;
    if (wait > 0){ this.notify(t('play.nextHint', { time: formatTime(wait) })); return; }
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
    // statistics go per level, unless the game groups them differently (e.g. per board)
    const key = this.game.statsKey?.(s) ?? s.L;
    const name = this.game.statsName?.(s) ?? statsRows(this.game).find(r => r.key === key)?.name ?? this.game.levels[s.L].name;
    const result = this.store.recordWin(key, s.time, s.hints, this.winExtra());
    this.render();
    this.celebrate();
    const detail = winDetail(result, { time: s.time, hints: s.hints, name });
    const strip = winStrip(this.store.state.log);
    setTimeout(() => this.onWin({ time: formatTime(s.time), detail, strip }), TIMING.winOverlayDelayMs);
  }
}
