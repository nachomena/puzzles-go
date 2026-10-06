/* Estado persistente de un juego (ajustes, estadísticas, tableros en reserva y partida en curso).
   Es genérico: lo que cambia entre juegos se inyecta con la definición del juego.
   El almacenamiento también se inyecta para poder probarlo o cambiarlo sin tocar el resto. */
import { BUFFER_CAP } from '../config.js';
import { emptyStreak, recordWin } from './stats.js';

export class Store {
  /**
   * @param {Storage|null} storage  cualquier objeto con getItem/setItem
   * @param {object} game  { storageKey, levels, levelOrder, defaultSettings, tools, isValidPuzzle(p, L), restoreSession(s) }
   */
  constructor(storage, game){
    this.storage = storage;
    this.game = game;
    this.state = {
      settings: { ...game.defaultSettings },
      stats: {},
      streak: emptyStreak(),
      buffers: Object.fromEntries(game.levelOrder.map(L => [L, []])),
      cur: null,
      tool: game.tools[0]
    };
  }

  load(){
    try {
      const s = JSON.parse(this.storage?.getItem(this.game.storageKey) || 'null');
      if (!s) return;
      const st = this.state, g = this.game;
      Object.assign(st.settings, s.settings || {});
      st.stats = s.stats || {};
      if (s.streak) st.streak = { ...emptyStreak(), ...s.streak };
      for (const L of g.levelOrder){
        if (Array.isArray(s.buffers?.[L])) st.buffers[L] = s.buffers[L].filter(p => p && g.isValidPuzzle(p, L)).slice(0, BUFFER_CAP);
      }
      if (s.cur && g.levels[s.cur.L] && s.cur.p) st.cur = g.restoreSession(s.cur);
      if (g.tools.includes(s.tool)) st.tool = s.tool;
    } catch (e){ /* datos corruptos: se empieza de cero */ }
  }
  save(){
    try { this.storage?.setItem(this.game.storageKey, JSON.stringify(this.state)); } catch (e){ /* sin espacio o bloqueado */ }
  }

  /* ---- Reserva de tableros ---- */
  bufferSize(L){ return this.state.buffers[L].length; }
  hasRoom(L){ return this.bufferSize(L) < BUFFER_CAP; }
  takePuzzle(L){ return this.state.buffers[L].shift() || null; }
  addPuzzle(L, p, { front = false } = {}){
    if (front) this.state.buffers[L].unshift(p);
    else this.state.buffers[L].push(p);
  }

  /* ---- Partida en curso ---- */
  get hasOpenSession(){ return !!this.state.cur && !this.state.cur.done; }

  /* ---- Datos para el selector y el menú de niveles ---- */

  /** { stats, streak, cur } con cur = partida abierta o null. */
  menuData(){ return { stats: this.state.stats, streak: this.state.streak, cur: this.hasOpenSession ? this.state.cur : null }; }

  /** Lo mismo leído directamente del almacenamiento, sin cargar el juego. */
  static peek(storage, key){
    try {
      const s = JSON.parse(storage?.getItem(key) || 'null') || {};
      return { stats: s.stats || {}, streak: s.streak || emptyStreak(), cur: s.cur && !s.cur.done ? s.cur : null };
    } catch (e){ return { stats: {}, streak: emptyStreak(), cur: null }; }
  }

  /** Resumen para el selector a partir de menuData()/peek(). */
  static summarize({ stats, cur }){
    return { inProgress: !!cur, solved: Object.values(stats).reduce((n, st) => n + (st.solved || 0), 0) };
  }

  /* ---- Estadísticas ---- */
  statsFor(L){ return this.state.stats[L] || {}; }
  totalSolved(){ return Object.values(this.state.stats).reduce((n, s) => n + (s.solved || 0), 0); }
  clearStats(){ this.state.stats = {}; this.state.streak = emptyStreak(); this.save(); }
  /**
   * Registra una victoria en `key` (el nivel, o el grupo que diga el juego). Solo es récord sin pistas.
   * Devuelve { record, best, prevBest, prevAvg } (ver core/stats.js).
   */
  recordWin(key, time, hints){
    const r = recordWin(this.state.stats, this.state.streak, key, time, hints);
    this.save();
    return r;
  }
}
