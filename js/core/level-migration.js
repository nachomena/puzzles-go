/* Moves a game's saved data from its old levels to the current ones (core/levels.js): statistics,
   game log and the game in progress. It runs once, at startup, before anything is read; Store saves
   the version (`levels`) so it isn't repeated. Reserve boards are dropped: others get generated. */
import { LEVELS_VERSION } from './store.js';

/** Merges the statistics of two levels that become one: games are added up and the best record is kept. */
export function mergeStats(a, b){
  const min = (x, y) => x == null ? y ?? null : y == null ? x : Math.min(x, y);
  const out = { solved: (a.solved || 0) + (b.solved || 0), best: min(a.best, b.best),
    sum: (a.sum || 0) + (b.sum || 0), timed: (a.timed || 0) + (b.timed || 0) };
  const moves = min(a.bestMoves, b.bestMoves);
  if (moves != null) out.bestMoves = moves;
  return out;
}

/** A game's saved data (already parsed) with the current levels. `map`: old id → new id. */
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

/** Migrates, if needed, the saved data of every game whose levels changed. */
export function migrateLevels(storage, metas){
  for (const meta of metas){
    if (!meta.oldLevels) continue;
    try {
      const raw = storage?.getItem(meta.storageKey);
      if (!raw) continue;
      const s = JSON.parse(raw);
      if (!s || typeof s !== 'object' || s.levels >= LEVELS_VERSION) continue;
      storage.setItem(meta.storageKey, JSON.stringify(migrateData(s, meta.oldLevels)));
    } catch (e){ /* corrupt data: Store will start from scratch */ }
  }
}
