/* Registro de partidas resueltas, para ver el progreso: una entrada por reto, la más reciente al
   final. Sin DOM. Lo guarda cada Store junto a sus estadísticas.

   entrada = { k, t, h, at, m? }
     k  clave de estadísticas (el nivel, o la que diga game.statsKey) · t  segundos · h  pistas
     at  fecha (ms) · m  movimientos (solo los juegos que los cuentan, ver controller.winExtra) */

/** Partidas que se guardan por juego (las más antiguas se van descartando). */
export const LOG_CAP = 500;

/** ¿Es una entrada válida? (para filtrar lo que se carga) */
export const isEntry = e => !!e && typeof e.k === 'string' && Number.isFinite(e.t) && Number.isFinite(e.at) && Number.isInteger(e.h);

/** Apunta una partida. Modifica `log`. */
export function logWin(log, { key, time, hints, moves, at = Date.now() }){
  const e = { k: key, t: time, h: hints, at };
  if (Number.isInteger(moves)) e.m = moves;
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
