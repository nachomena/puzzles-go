/* Log of solved games, to show progress: one entry per puzzle, the most recent at the end.
   No DOM. Each Store saves it next to its statistics.

   entry = { k, t, h, at, m? }
     k  statistics key (the level, or whatever game.statsKey says) · t  seconds · h  hints
     at  date (ms) · m  moves and mm  the puzzle's minimum (only games that count them, see
     controller.winExtra) */

import { statsRows } from './stats.js';
import { t } from '../i18n/index.js';

/** Games kept per game (the oldest are dropped). */
export const LOG_CAP = 500;

/** Is it a valid entry? (to filter what is loaded) */
export const isEntry = e => !!e && typeof e.k === 'string' && Number.isFinite(e.t) && Number.isFinite(e.at) && Number.isInteger(e.h);

/** Records a game. Modifies `log`. */
export function logWin(log, { key, time, hints, moves, min, at = Date.now() }){
  const e = { k: key, t: time, h: hints, at };
  if (Number.isInteger(moves)) e.m = moves;
  if (Number.isInteger(moves) && Number.isInteger(min)) e.mm = min;
  log.push(e);
  if (log.length > LOG_CAP) log.splice(0, log.length - LOG_CAP);
}

/**
 * What the win screen draws: the last recorded game among the previous `n` with its key and no
 * hints. { times, today, hints, avg } or null if there is no earlier one to compare it with.
 */
export function winStrip(log, n = 20){
  const cur = log[log.length - 1];
  if (!cur) return null;
  const times = log.slice(0, -1).filter(e => e.k === cur.k && !e.h).slice(-n).map(e => e.t);
  if (!times.length) return null;
  return { times, today: cur.t, hints: cur.h, avg: Math.round(times.reduce((s, t) => s + t, 0) / times.length) };
}

/* ---------- Analysis (progress screens) ---------- */

const DAY = 864e5;

/** Games without hints (the only ones that count for record, average and trend). */
export const clean = entries => entries.filter(e => !e.h);

/** Average time in seconds (rounded), or null. */
export const meanTime = entries => entries.length ? Math.round(entries.reduce((s, e) => s + e.t, 0) / entries.length) : null;

/** Best time without hints, or null. */
export const bestTime = entries => { const c = clean(entries); return c.length ? Math.min(...c.map(e => e.t)) : null; };

/** Periods of a level's screen: the last 20, the last 3 months or all. */
export const RANGES = Object.freeze({ last20: t('progress.ranges.last20'), months3: t('progress.ranges.months3'), all: t('progress.ranges.all') });
export function inRange(entries, range, now = Date.now()){
  if (range === 'last20') return entries.slice(-20);
  if (range === 'months3') return entries.filter(e => e.at > now - 91 * DAY);
  return entries;
}

/**
 * Trend: average without hints over the last 30 days against the previous 30 (it needs
 * 3 games in each). { kind: 'faster' | 'slower' | 'same' | 'few', pct }; under 3 % is 'same'.
 */
export function trend(entries, now = Date.now()){
  const c = clean(entries);
  const recent = c.filter(e => e.at > now - 30 * DAY), before = c.filter(e => e.at <= now - 30 * DAY && e.at > now - 60 * DAY);
  if (recent.length < 3 || before.length < 3) return { kind: 'few', pct: 0 };
  const a = meanTime(recent), b = meanTime(before), ch = (a - b) / b;
  if (Math.abs(ch) < .03) return { kind: 'same', pct: 0 };
  return { kind: ch < 0 ? 'faster' : 'slower', pct: Math.round(Math.abs(ch) * 100) };
}

/** Moving average of the last `n` (each one included): [{ at, t }]. */
export const movingAverage = (entries, n = 5) =>
  entries.map((e, i) => ({ at: e.at, t: meanTime(entries.slice(Math.max(0, i - n + 1), i + 1)) }));

/** Round step for a time axis between lo and hi seconds (about 3-6 lines). */
export function timeStep(lo, hi){
  const span = Math.max(1, hi - lo);
  return [5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600].find(s => span / s <= 5) ?? 3600;
}

/** Spread of times in bands of `step` s: { start, step, counts }. */
export function histogram(times, step){
  const start = Math.floor(Math.min(...times) / step) * step, n = Math.floor((Math.max(...times) - start) / step) + 1;
  const counts = new Array(n).fill(0);
  for (const t of times) counts[Math.floor((t - start) / step)]++;
  return { start, step, counts };
}

/**
 * Rows of a game's progress screen: [{ key, name, entries, best, solved }]. By default, its
 * statistics rows (levels or meta.statsRows); a game whose keys can't be compared
 * (Pentominoes: each puzzle is played once) groups them with meta.progressRow(key) → { key, name, order }.
 */
export function progressRows(meta, stats = {}, log = []){
  if (meta.progressRow){
    const rows = new Map();
    for (const e of log){
      const r = meta.progressRow(e.k);
      if (!r) continue;
      if (!rows.has(r.key)) rows.set(r.key, { ...r, entries: [] });
      rows.get(r.key).entries.push(e);
    }
    return [...rows.values()].sort((a, b) => a.order - b.order)
      .map(({ key, name, entries }) => ({ key, name, entries, best: bestTime(entries), solved: entries.length }));
  }
  return statsRows(meta).map(({ key, name }) => {
    const entries = log.filter(e => e.k === key), st = stats[key], b = [st?.best, bestTime(entries)].filter(Boolean);
    return { key, name, entries, best: b.length ? Math.min(...b) : null, solved: st?.solved || entries.length };
  });
}

/**
 * Extra moves (games that count them, e.g. Gridlock): from the games with moves and minimum
 * recorded, { games: [{ at, extra }], perfect, avgExtra, avgMoves } or null if there are none.
 */
export function movesSummary(entries){
  const g = entries.filter(e => Number.isInteger(e.m) && Number.isInteger(e.mm));
  if (!g.length) return null;
  const extra = g.map(e => Math.max(0, e.m - e.mm));
  return {
    games: g.map((e, i) => ({ at: e.at, extra: extra[i] })),
    perfect: extra.filter(x => !x).length,
    avgExtra: extra.reduce((s, x) => s + x, 0) / g.length,
    avgMoves: g.reduce((s, e) => s + e.m, 0) / g.length
  };
}
