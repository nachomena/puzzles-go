/* Estado persistente de la app (ajustes, estadísticas, tableros en reserva y partida en curso).
   El almacenamiento se inyecta para poder probarlo o cambiarlo sin tocar el resto. */
import { BOARD, LEVELS, LEVEL_ORDER, BUFFER_CAP, STORAGE_KEY, TOOL, DEFAULT_SETTINGS, MARK } from '../config.js';

const emptyBuffers = () => Object.fromEntries(LEVEL_ORDER.map(L => [L, []]));

const isValidPuzzle = (p, L) => p && p.N === BOARD.size && p.K === BOARD.stars && p.level === LEVELS[L].target;
const isValidSession = s => s && s.p && Array.isArray(s.marks) && LEVELS[s.L];

/** Partida nueva sobre un tablero. `hl` guarda la pintura del pincel. */
export function createSession(L, puzzle){
  const cells = puzzle.N * puzzle.N;
  return { L, p: puzzle, marks: new Array(cells).fill(MARK.EMPTY), hl: new Array(cells).fill(0), time: 0, done: false, hints: 0 };
}

export class Store {
  /** @param {Storage|null} storage cualquier objeto con getItem/setItem */
  constructor(storage, key = STORAGE_KEY){
    this.storage = storage;
    this.key = key;
    this.state = {
      settings: { ...DEFAULT_SETTINGS },
      stats: {},
      buffers: emptyBuffers(),
      cur: null,
      tool: TOOL.STAR
    };
  }

  load(){
    try {
      const s = JSON.parse(this.storage?.getItem(this.key) || 'null');
      if (!s) return;
      const st = this.state;
      Object.assign(st.settings, s.settings || {});
      st.stats = s.stats || {};
      for (const L of LEVEL_ORDER){
        if (s.buffers && Array.isArray(s.buffers[L])) st.buffers[L] = s.buffers[L].filter(p => isValidPuzzle(p, L)).slice(0, BUFFER_CAP);
      }
      if (isValidSession(s.cur)){
        st.cur = s.cur;
        if (!Array.isArray(st.cur.hl)) st.cur.hl = st.cur.marks.map(() => 0);
      }
      if (Object.values(TOOL).includes(s.tool)) st.tool = s.tool;
    } catch (e){ /* datos corruptos: se empieza de cero */ }
  }
  save(){
    try { this.storage?.setItem(this.key, JSON.stringify(this.state)); } catch (e){ /* sin espacio o bloqueado */ }
  }

  /* ---- Reserva de tableros ---- */
  bufferSize(L){ return this.state.buffers[L].length; }
  hasRoom(L){ return this.bufferSize(L) < BUFFER_CAP; }
  takePuzzle(L){ return this.state.buffers[L].shift() || null; }
  addPuzzle(L, p, { front = false } = {}){
    if (front) this.state.buffers[L].unshift(p);
    else this.state.buffers[L].push(p);
  }

  /* ---- Estadísticas ---- */
  statsFor(L){ return this.state.stats[L] || {}; }
  clearStats(){ this.state.stats = {}; this.save(); }
  /** Registra una victoria. Solo cuenta como récord si no se usaron pistas. */
  recordWin(L, time, hints){
    const st = this.state.stats[L] || (this.state.stats[L] = { solved: 0, best: null });
    st.solved++;
    const record = !hints && (!st.best || time < st.best);
    if (record) st.best = time;
    this.save();
    return { record, best: st.best };
  }
}
