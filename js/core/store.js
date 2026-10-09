/* Estado persistente de un juego (ajustes, estadísticas, tableros en reserva y partida en curso).
   Es genérico: lo que cambia entre juegos se inyecta con la definición del juego.
   El almacenamiento también se inyecta para poder probarlo o cambiarlo sin tocar el resto. */
import { BUFFER_CAP, MIN_RESUME_SEC } from '../config.js';

/**
 * ¿Se ofrece seguir esta partida? Sin terminar y, o jugada al menos MIN_RESUME_SEC, o con algo puesto
 * (`input`, lo apunta GameController#commit).
 */
const resumable = cur => !!cur && !cur.done && ((cur.time || 0) >= MIN_RESUME_SEC || !!cur.input);
import { recordWin } from './stats.js';

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
  get hasOpenSession(){ return resumable(this.state.cur); }

  /**
   * Al salir de una partida recién empezada (ver MIN_RESUME_SEC): se descarta y, si `keepPuzzle`, su
   * tablero vuelve a la reserva para la próxima vez.
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

  /* ---- Datos para el selector y el menú de niveles ---- */

  /** { stats, cur } con cur = partida abierta o null. */
  menuData(){ return { stats: this.state.stats, cur: this.hasOpenSession ? this.state.cur : null }; }

  /** Lo mismo leído directamente del almacenamiento, sin cargar el juego. */
  static peek(storage, key){
    try {
      const s = JSON.parse(storage?.getItem(key) || 'null') || {};
      return { stats: s.stats || {}, cur: resumable(s.cur) ? s.cur : null };
    } catch (e){ return { stats: {}, cur: null }; }
  }

  /* ---- Estadísticas ---- */
  statsFor(L){ return this.state.stats[L] || {}; }
  totalSolved(){ return Object.values(this.state.stats).reduce((n, s) => n + (s.solved || 0), 0); }
  clearStats(){ this.state.stats = {}; this.save(); }
  /**
   * Registra una victoria en `key` (el nivel, o el grupo que diga el juego). Solo es récord sin pistas.
   * Devuelve { record, best, prevBest, prevAvg } (ver core/stats.js).
   */
  recordWin(key, time, hints, extra){
    const r = recordWin(this.state.stats, key, time, hints, extra);
    this.save();
    return r;
  }
}
