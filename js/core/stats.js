/* Estadísticas de un juego, sin DOM: récord y media. Funciones puras para poder probarlas;
   Store las usa para guardar, y los menús y la pantalla de victoria para mostrarlas.

   stats[key] = { solved, best, sum, timed, bestMoves? }   key = nivel (o lo que diga game.statsKey)
     solved  partidas resueltas · best  mejor tiempo sin pistas
     sum / timed  suma de tiempos y cuántas la forman (las victorias de antes de guardar la suma no cuentan)
     bestMoves  menos movimientos sin pistas (solo los juegos que los cuentan, ver controller.winExtra) */
import { formatTime } from '../lib/format.js';

/** Filas de estadísticas de un juego: sus niveles, o las que declare meta.statsRows. */
export const statsRows = meta => meta.statsRows ?? meta.levelOrder.map(L => ({ key: L, name: meta.levels[L].name }));

/** Tiempo medio en segundos (redondeado) o null. */
export const average = st => st?.timed ? Math.round(st.sum / st.timed) : null;

/**
 * Apunta una victoria. Modifica `stats`. `extra.moves`: movimientos de la partida, si el juego los cuenta.
 * @returns {{ record: boolean, best: number|null, prevBest: number|null, prevAvg: number|null }}
 */
export function recordWin(stats, key, time, hints, extra = {}){
  const st = stats[key] || (stats[key] = { solved: 0, best: null });
  const prevBest = st.best, prevAvg = average(st);
  st.solved++;
  st.sum = (st.sum || 0) + time;
  st.timed = (st.timed || 0) + 1;
  const record = !hints && (!st.best || time < st.best);
  if (record) st.best = time;
  if (!hints && Number.isInteger(extra.moves) && !(st.bestMoves <= extra.moves)) st.bestMoves = extra.moves;
  return { record, best: st.best, prevBest, prevAvg };
}

/**
 * Texto bajo un nivel del menú: el récord; si solo se ha resuelto con pistas (que no dan récord), cuántas
 * veces y el tiempo medio, para que el tiempo no desaparezca.
 */
export function levelSummary(st){
  if (st?.best) return `Récord ${formatTime(st.best)}`;
  if (!st?.solved) return '';
  const avg = average(st);
  return `${st.solved} ${st.solved === 1 ? 'resuelto' : 'resueltos'} con pistas` + (avg != null ? ` · ${formatTime(avg)}` : '');
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
