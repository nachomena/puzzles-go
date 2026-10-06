/* Estadísticas de un juego, sin DOM: récord, media y racha de días. Funciones puras para poder
   probarlas; Store las usa para guardar y la pantalla de estadísticas para mostrarlas.

   stats[key] = { solved, best, sum, timed }   key = nivel (o lo que diga game.statsKey)
     solved  partidas resueltas · best  mejor tiempo sin pistas
     sum / timed  suma de tiempos y cuántas la forman (las victorias de antes de guardar la suma no cuentan)
   streak = { last, count, best }   último día con una victoria ("aaaa-mm-dd"), racha actual y mejor racha */
import { formatTime } from '../lib/format.js';

export const emptyStreak = () => ({ last: null, count: 0, best: 0 });

/** Filas de estadísticas de un juego: sus niveles, o las que declare meta.statsRows. */
export const statsRows = meta => meta.statsRows ?? meta.levelOrder.map(L => ({ key: L, name: meta.levels[L].name }));

/** Día local "aaaa-mm-dd". */
export const dayKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const dayBefore = key => { const [y, m, d] = key.split('-').map(Number); return dayKey(new Date(y, m - 1, d - 1)); };

/** Tiempo medio en segundos (redondeado) o null. */
export const average = st => st?.timed ? Math.round(st.sum / st.timed) : null;

/** Racha vigente: cuenta si la última victoria fue hoy o ayer. */
export const currentStreak = (streak, today = dayKey()) =>
  streak && (streak.last === today || streak.last === dayBefore(today)) ? streak.count : 0;

/**
 * Apunta una victoria. Modifica `stats` y `streak`.
 * @returns {{ record: boolean, best: number|null, prevBest: number|null, prevAvg: number|null }}
 */
export function recordWin(stats, streak, key, time, hints, today = dayKey()){
  const st = stats[key] || (stats[key] = { solved: 0, best: null });
  const prevBest = st.best, prevAvg = average(st);
  st.solved++;
  st.sum = (st.sum || 0) + time;
  st.timed = (st.timed || 0) + 1;
  const record = !hints && (!st.best || time < st.best);
  if (record) st.best = time;
  if (streak.last !== today){
    streak.count = streak.last === dayBefore(today) ? streak.count + 1 : 1;
    streak.last = today;
    streak.best = Math.max(streak.best || 0, streak.count);
  }
  return { record, best: st.best, prevBest, prevAvg };
}

/** "12 s" / "1:05 min". */
const duration = s => s < 60 ? `${s} s` : `${formatTime(s)} min`;

/** Frase que compara el tiempo con la media anterior, o '' si aún no hay media. */
export function versusAverage(time, prevAvg){
  if (prevAvg == null) return '';
  const diff = prevAvg - time;
  if (Math.abs(diff) < 1) return 'Igual que tu media.';
  return `${duration(Math.abs(diff))} más ${diff > 0 ? 'rápido' : 'lento'} que tu media.`;
}

/** Texto bajo el tiempo en la pantalla de victoria. */
export function winDetail({ record, best, prevBest, prevAvg }, { time, hints, name }){
  const vs = versusAverage(time, prevAvg);
  if (record) return `Nuevo récord en ${name}` + (prevBest ? ` (antes ${formatTime(prevBest)}).` : '.') + (vs ? ` ${vs}` : '');
  return [hints ? `Con ${hints} ${hints === 1 ? 'pista' : 'pistas'}.` : '', best ? `Récord: ${formatTime(best)}.` : '', vs]
    .filter(Boolean).join(' ');
}
