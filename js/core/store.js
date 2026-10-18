/* Persistent state of a game (settings, statistics, reserve boards and game in progress).
   It is generic: what changes between games is injected with the game definition.
   Storage is injected too, so it can be tested or swapped without touching the rest. */
import { BUFFER_CAP, MIN_RESUME_SEC } from '../config.js';

/**
 * Is this game offered to continue? Unfinished and either played for at least MIN_RESUME_SEC or with
 * something placed (`input`, set by GameController#commit).
 */
const resumable = cur => !!cur && !cur.done && ((cur.time || 0) >= MIN_RESUME_SEC || !!cur.input);
import { recordWin } from './stats.js';
import { logWin, isEntry, LOG_CAP } from './progress.js';

/** Version of the saved levels (see core/level-migration.js). */
export const LEVELS_VERSION = 2;

export class Store {
  /**
   * @param {Storage|null} storage  any object with getItem/setItem
   * @param {object} game  { storageKey, levels, levelOrder, defaultSettings, tools, isValidPuzzle(p, L), restoreSession(s) }
   */
  constructor(storage, game){
    this.storage = storage;
    this.game = game;
    this.state = {
      settings: { ...game.defaultSettings },
      stats: {},
      log: [],          // solved games, for progress (core/progress.js)
      buffers: Object.fromEntries(game.levelOrder.map(L => [L, []])),
      cur: null,
      tool: game.tools[0],
      levels: LEVELS_VERSION
    };
  }

  load(){
    try {
      const s = JSON.parse(this.storage?.getItem(this.game.storageKey) || 'null');
      if (!s) return;
      const st = this.state, g = this.game;
      Object.assign(st.settings, s.settings || {});
      st.stats = s.stats || {};
      if (Array.isArray(s.log)) st.log = s.log.filter(isEntry).slice(-LOG_CAP);
      for (const L of g.levelOrder){
        if (Array.isArray(s.buffers?.[L])) st.buffers[L] = s.buffers[L].filter(p => p && g.isValidPuzzle(p, L)).slice(0, BUFFER_CAP);
      }
      // a game that changed its levels moves the saved game to the current ones (e.g. Pentominoes)
      const cur = s.cur && g.upgradeSession ? g.upgradeSession(s.cur) : s.cur;
      if (cur && g.levels[cur.L] && cur.p) st.cur = g.restoreSession(cur);
      if (g.tools.includes(s.tool)) st.tool = s.tool;
    } catch (e){ /* corrupt data: start from scratch */ }
  }
  save(){
    const cur = this.state.cur;
    if (cur && !cur.done) cur.at = Date.now();   // for "Continue" on the picker: the last game played
    try { this.storage?.setItem(this.game.storageKey, JSON.stringify(this.state)); } catch (e){ /* no space or blocked */ }
  }

  /* ---- Board reserve ---- */
  bufferSize(L){ return this.state.buffers[L].length; }
  hasRoom(L){ return this.bufferSize(L) < BUFFER_CAP; }
  takePuzzle(L){ return this.state.buffers[L].shift() || null; }
  addPuzzle(L, p, { front = false } = {}){
    if (front) this.state.buffers[L].unshift(p);
    else this.state.buffers[L].push(p);
  }

  /* ---- Game in progress ---- */
  get hasOpenSession(){ return resumable(this.state.cur); }

  /**
   * On leaving a game that had just started (see MIN_RESUME_SEC): it is dropped and, if `keepPuzzle`,
   * its board goes back to the reserve for next time.
   */
  dropFreshSession({ keepPuzzle }){
    const cur = this.state.cur;
    if (!cur || cur.done || resumable(cur)) return;
    if (keepPuzzle){
      this.addPuzzle(cur.L, cur.p, { front: true });
      this.state.buffers[cur.L].length = Math.min(this.bufferSize(cur.L), BUFFER_CAP);
    }
    this.state.cur = null;
    this.save();
  }

  /* ---- Data for the picker and the level menu ---- */

  /** { stats, cur, log } with cur = open game or null and log = solved games (core/progress.js). */
  menuData(){ return { stats: this.state.stats, cur: this.hasOpenSession ? this.state.cur : null, log: this.state.log }; }

  /** The same, read straight from storage without loading the game. */
  static peek(storage, key){
    try {
      const s = JSON.parse(storage?.getItem(key) || 'null') || {};
      return { stats: s.stats || {}, cur: resumable(s.cur) ? s.cur : null, log: Array.isArray(s.log) ? s.log.filter(isEntry) : [] };
    } catch (e){ return { stats: {}, cur: null, log: [] }; }
  }

  /* ---- Statistics ---- */
  statsFor(L){ return this.state.stats[L] || {}; }
  totalSolved(){ return Object.values(this.state.stats).reduce((n, s) => n + (s.solved || 0), 0); }
  clearStats(){ this.state.stats = {}; this.state.log = []; this.save(); }
  /**
   * Records a win in `key` (the level, or the group the game says). It's only a record without hints.
   * Returns { record, best, prevBest, prevAvg } (see core/stats.js).
   */
  recordWin(key, time, hints, extra){
    const r = recordWin(this.state.stats, key, time, hints, extra);
    logWin(this.state.log, { key, time, hints, moves: extra?.moves, min: extra?.min });
    this.save();
    return r;
  }
}
