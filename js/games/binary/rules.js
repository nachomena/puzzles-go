/* Binary rules on what the player places: g[i] = 0 empty, 1 red, 2 blue (given cells included).
   Pure functions, no DOM. */
import { lines, nextDeduction, lookahead } from './engine/grid.js';
import { t } from '../../i18n/index.js';

/** Cells that break a rule: three of the same in a row, more than half of one colour, equal lines. */
export function evaluate(n, g){
  const bad = new Uint8Array(n * n), { rows, cols, all } = lines(n), half = n / 2;
  for (const line of all){
    for (let k = 0; k + 2 < n; k++){
      const v = g[line[k]];
      if (v && v === g[line[k + 1]] && v === g[line[k + 2]]) bad[line[k]] = bad[line[k + 1]] = bad[line[k + 2]] = 1;
    }
    for (const v of [1, 2]) if (line.filter(i => g[i] === v).length > half) for (const i of line) if (g[i] === v) bad[i] = 1;
  }
  for (const group of [rows, cols]){
    for (let x = 0; x < n; x++) for (let y = x + 1; y < n; y++){
      const a = group[x], b = group[y];
      if (a.every((i, k) => g[i] && g[i] === g[b[k]])) for (const i of [...a, ...b]) bad[i] = 1;
    }
  }
  return bad;
}

/** Solved: everything filled without breaking any rule. */
export const isSolved = (n, g) => g.every(Boolean) && !evaluate(n, g).some(Boolean);

/** First cell with a colour that isn't the solution's (it is unique), or -1. */
export const findMistake = (g, solution) => g.findIndex((v, i) => v && v !== solution[i]);

/** Why it goes like this, for the hint. */
export const HINT_WHY = Object.freeze({
  trio: t('games.binary.why.trio'),
  half: t('games.binary.why.half'),
  unique: t('games.binary.why.unique'),
  look: t('games.binary.why.look'),
  none: t('games.binary.why.none')
});

/**
 * Hint: a cell deduced from the board (without mistakes): { i, v, why } with why a key of HINT_WHY.
 * If there is no deduction in sight, an empty cell from the solution. null if it is full.
 */
export function findHint(n, g, solution){
  const d = nextDeduction(n, g);
  if (d && !d.bad) return d;
  const look = lookahead(n, g);
  if (look) return { ...look, why: 'look' };
  const i = g.indexOf(0);
  return i < 0 ? null : { i, v: solution[i], why: 'none' };
}
