/* A game's statistics, without DOM: record and average. Pure functions so they can be tested;
   Store uses them to save, and the menus and the win screen to show them.

   stats[key] = { solved, best, sum, timed, bestMoves? }   key = level (or whatever game.statsKey says)
     solved  games solved · best  best time without hints
     sum / timed  sum of times and how many make it up (wins from before the sum was saved don't count)
     bestMoves  fewest moves without hints (only games that count them, see controller.winExtra) */
import { formatTime } from '../lib/format.js';
import { t } from '../i18n/index.js';

/** A game's statistics rows: its levels, or the ones declared in meta.statsRows. */
export const statsRows = meta => meta.statsRows ?? meta.levelOrder.map(L => ({ key: L, name: meta.levels[L].name }));

/** Average time in seconds (rounded) or null. */
export const average = st => st?.timed ? Math.round(st.sum / st.timed) : null;

/**
 * Records a win. Modifies `stats`. `extra.moves`: the game's moves, if the game counts them.
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
 * Text under a level in the menu: the record; if it has only been solved with hints (which give no
 * record), how many times and the average time, so the time doesn't disappear.
 */
export function levelSummary(st){
  if (st?.best) return t('common.record', { time: formatTime(st.best) });
  if (!st?.solved) return '';
  const avg = average(st);
  return t('stats.solvedWithHints', { n: st.solved }) + (avg != null ? ` · ${formatTime(avg)}` : '');
}

/** "12 s" / "1:05 min". */
const duration = s => s < 60 ? t('stats.seconds', { n: s }) : t('stats.minutes', { time: formatTime(s) });

/** Sentence comparing the time with the previous average, or '' if there is no average yet. */
export function versusAverage(time, prevAvg){
  if (prevAvg == null) return '';
  const diff = prevAvg - time;
  if (Math.abs(diff) < 1) return t('stats.sameAsAvg');
  return t(diff > 0 ? 'stats.fasterThanAvg' : 'stats.slowerThanAvg', { d: duration(Math.abs(diff)) });
}

/** Text under the time on the win screen. */
export function winDetail({ record, best, prevBest, prevAvg }, { time, hints, name }){
  const vs = versusAverage(time, prevAvg);
  if (record) return t('stats.newRecord', { name }) + (prevBest ? t('stats.before', { time: formatTime(prevBest) }) : '.') + (vs ? ` ${vs}` : '');
  return [hints ? t('stats.withHints', { n: hints }) : '', best ? t('stats.recordWas', { time: formatTime(best) }) : '', vs]
    .filter(Boolean).join(' ');
}
