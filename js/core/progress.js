/* Registro de partidas resueltas, para ver el progreso: una entrada por reto, la más reciente al
   final. Sin DOM. Lo guarda cada Store junto a sus estadísticas.

   entrada = { k, t, h, at, m? }
     k  clave de estadísticas (el nivel, o la que diga game.statsKey) · t  segundos · h  pistas
     at  fecha (ms) · m  movimientos y mm  los mínimos del reto (solo los juegos que los cuentan, ver
     controller.winExtra) */

import { statsRows } from './stats.js';

/** Partidas que se guardan por juego (las más antiguas se van descartando). */
export const LOG_CAP = 500;

/** ¿Es una entrada válida? (para filtrar lo que se carga) */
export const isEntry = e => !!e && typeof e.k === 'string' && Number.isFinite(e.t) && Number.isFinite(e.at) && Number.isInteger(e.h);

/** Apunta una partida. Modifica `log`. */
export function logWin(log, { key, time, hints, moves, min, at = Date.now() }){
  const e = { k: key, t: time, h: hints, at };
  if (Number.isInteger(moves)) e.m = moves;
  if (Number.isInteger(moves) && Number.isInteger(min)) e.mm = min;
  log.push(e);
  if (log.length > LOG_CAP) log.splice(0, log.length - LOG_CAP);
}

/**
 * Lo que dibuja la pantalla de victoria: la última partida apuntada entre las `n` anteriores de su
 * clave sin pistas. { times, today, hints, avg } o null si no hay ninguna anterior con que compararla.
 */
export function winStrip(log, n = 20){
  const cur = log[log.length - 1];
  if (!cur) return null;
  const times = log.slice(0, -1).filter(e => e.k === cur.k && !e.h).slice(-n).map(e => e.t);
  if (!times.length) return null;
  return { times, today: cur.t, hints: cur.h, avg: Math.round(times.reduce((s, t) => s + t, 0) / times.length) };
}

/* ---------- Análisis (pantallas de progreso) ---------- */

const DAY = 864e5;

/** Partidas sin pistas (las únicas que cuentan para récord, media y tendencia). */
export const clean = entries => entries.filter(e => !e.h);

/** Tiempo medio en segundos (redondeado), o null. */
export const meanTime = entries => entries.length ? Math.round(entries.reduce((s, e) => s + e.t, 0) / entries.length) : null;

/** Mejor tiempo sin pistas, o null. */
export const bestTime = entries => { const c = clean(entries); return c.length ? Math.min(...c.map(e => e.t)) : null; };

/** Periodos de la pantalla de un nivel: las últimas 20, los últimos 3 meses o todas. */
export const RANGES = Object.freeze({ last20: 'Últimas 20', months3: '3 meses', all: 'Todo' });
export function inRange(entries, range, now = Date.now()){
  if (range === 'last20') return entries.slice(-20);
  if (range === 'months3') return entries.filter(e => e.at > now - 91 * DAY);
  return entries;
}

/**
 * Tendencia: media sin pistas de los últimos 30 días frente a la de los 30 anteriores (hacen falta
 * 3 partidas en cada uno). { kind: 'faster' | 'slower' | 'same' | 'few', pct }; menos del 3 % es 'same'.
 */
export function trend(entries, now = Date.now()){
  const c = clean(entries);
  const recent = c.filter(e => e.at > now - 30 * DAY), before = c.filter(e => e.at <= now - 30 * DAY && e.at > now - 60 * DAY);
  if (recent.length < 3 || before.length < 3) return { kind: 'few', pct: 0 };
  const a = meanTime(recent), b = meanTime(before), ch = (a - b) / b;
  if (Math.abs(ch) < .03) return { kind: 'same', pct: 0 };
  return { kind: ch < 0 ? 'faster' : 'slower', pct: Math.round(Math.abs(ch) * 100) };
}

/** Media móvil de las últimas `n` (incluida cada una): [{ at, t }]. */
export const movingAverage = (entries, n = 5) =>
  entries.map((e, i) => ({ at: e.at, t: meanTime(entries.slice(Math.max(0, i - n + 1), i + 1)) }));

/** Paso redondo para un eje de tiempos entre lo y hi segundos (unas 3-6 rayas). */
export function timeStep(lo, hi){
  const span = Math.max(1, hi - lo);
  return [5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600].find(s => span / s <= 5) ?? 3600;
}

/** Reparto de tiempos en tramos de `step` s: { start, step, counts }. */
export function histogram(times, step){
  const start = Math.floor(Math.min(...times) / step) * step, n = Math.floor((Math.max(...times) - start) / step) + 1;
  const counts = new Array(n).fill(0);
  for (const t of times) counts[Math.floor((t - start) / step)]++;
  return { start, step, counts };
}

/**
 * Filas de la pantalla de progreso de un juego: [{ key, name, entries, best, solved }]. Por defecto,
 * las de sus estadísticas (niveles o meta.statsRows); un juego cuyas claves no sirven para comparar
 * (Katamino: cada PENTA se juega una vez) agrupa con meta.progressRow(clave) → { key, name, order }.
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
 * Movimientos de más (juegos que los cuentan, p. ej. Rush Hour): de las partidas con movimientos y
 * mínimo apuntados, { games: [{ at, extra }], perfect, avgExtra, avgMoves } o null si no hay ninguna.
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
