/* Pasa lo guardado de un juego de sus niveles de antes a los de ahora (core/levels.js): estadísticas,
   registro de partidas y partida en curso. Se hace una vez, al arrancar, antes de leer nada; Store guarda
   la versión (`levels`) para no repetirlo. Los tableros en reserva se tiran: se generan otros. */
import { LEVELS_VERSION } from './store.js';

/** Junta las estadísticas de dos niveles que pasan a ser uno: se suman las partidas y queda el mejor récord. */
export function mergeStats(a, b){
  const min = (x, y) => x == null ? y ?? null : y == null ? x : Math.min(x, y);
  const out = { solved: (a.solved || 0) + (b.solved || 0), best: min(a.best, b.best),
    sum: (a.sum || 0) + (b.sum || 0), timed: (a.timed || 0) + (b.timed || 0) };
  const moves = min(a.bestMoves, b.bestMoves);
  if (moves != null) out.bestMoves = moves;
  return out;
}

/** Datos guardados de un juego (ya leídos) con los niveles de ahora. `map`: id viejo → id nuevo. */
export function migrateData(s, map){
  const to = k => map[k] ?? k;
  if (s.stats && typeof s.stats === 'object'){
    const out = {};
    for (const [k, st] of Object.entries(s.stats)){ const n = to(k); out[n] = out[n] ? mergeStats(out[n], st) : st; }
    s.stats = out;
  }
  if (Array.isArray(s.log)) for (const e of s.log) if (e && typeof e.k === 'string') e.k = to(e.k);
  if (s.cur && typeof s.cur.L === 'string') s.cur.L = to(s.cur.L);
  s.buffers = {};
  s.levels = LEVELS_VERSION;
  return s;
}

/** Migra, si hace falta, lo guardado de cada juego que haya cambiado de niveles. */
export function migrateLevels(storage, metas){
  for (const meta of metas){
    if (!meta.oldLevels) continue;
    try {
      const raw = storage?.getItem(meta.storageKey);
      if (!raw) continue;
      const s = JSON.parse(raw);
      if (!s || typeof s !== 'object' || s.levels >= LEVELS_VERSION) continue;
      storage.setItem(meta.storageKey, JSON.stringify(migrateData(s, meta.oldLevels)));
    } catch (e){ /* datos corruptos: Store empezará de cero */ }
  }
}
