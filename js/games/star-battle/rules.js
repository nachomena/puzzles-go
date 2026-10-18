/* Game rules on the player's marks. Pure functions, no DOM. */
import { MARK } from './config.js';
import { adjacency, rowOf, colOf } from '../../lib/grid.js';
import { pick } from '../../lib/random.js';

/** An automatic X counts as an X for the player. */
export const effectiveMark = v => v === MARK.AUTO_X ? MARK.X : v;

/** Star or trial star: both count the same for the rules. */
export const isStar = v => v === MARK.STAR || v === MARK.TRY;

/** Tap cycle: empty → X → star → empty. A trial star becomes a star. */
const CYCLE = { [MARK.EMPTY]: MARK.X, [MARK.X]: MARK.STAR, [MARK.STAR]: MARK.EMPTY, [MARK.TRY]: MARK.STAR };
export const nextMark = v => CYCLE[effectiveMark(v)];

/** Recomputes the automatic X marks around every star, trial ones too (mutates `marks`). */
export function applyAutoX(marks, N, enabled){
  for (let i = 0; i < marks.length; i++) if (marks[i] === MARK.AUTO_X) marks[i] = MARK.EMPTY;
  if (!enabled) return;
  const { n8 } = adjacency(N);
  for (let i = 0; i < marks.length; i++) if (isStar(marks[i])){
    for (const j of n8[i]) if (marks[j] === MARK.EMPTY) marks[j] = MARK.AUTO_X;
  }
}

/**
 * Looks for stars that break some rule.
 * Returns { bad: Uint8Array, anyBad, solved }.
 */
export function analyze(marks, { N, K, regions }){
  const bad = new Uint8Array(N * N);
  const rowCount = new Array(N).fill(0), colCount = new Array(N).fill(0), regCount = new Array(N).fill(0);
  const { n8 } = adjacency(N);
  let total = 0;
  for (let i = 0; i < marks.length; i++) if (isStar(marks[i])){
    total++; rowCount[rowOf(N, i)]++; colCount[colOf(N, i)]++; regCount[regions[i]]++;
  }
  for (let i = 0; i < marks.length; i++) if (isStar(marks[i])){
    const overflow = rowCount[rowOf(N, i)] > K || colCount[colOf(N, i)] > K || regCount[regions[i]] > K;
    if (overflow || n8[i].some(j => isStar(marks[j]))) bad[i] = 1;
  }
  const anyBad = bad.some(Boolean);
  return { bad, anyBad, solved: total === N * K && !anyBad };
}

/** Does the board have anything the player placed (X or star)? */
export const hasPlayerInput = marks => marks.some(v => v === MARK.X || isStar(v));

/** Hint: first fix mistakes; if there are none, place a missing star. */
/** First mistake: a star where it doesn't go, or an X where a star does go. */
export function findMistake(marks, solution){
  const sol = new Set(solution);
  const wrongStar = marks.findIndex((v, i) => isStar(v) && !sol.has(i));
  if (wrongStar >= 0) return { type: 'wrong-star', cell: wrongStar };
  const wrongX = marks.findIndex((v, i) => v === MARK.X && sol.has(i));
  if (wrongX >= 0) return { type: 'missing-star', cell: wrongX };
  return null;
}

export function findHint(marks, solution){
  const mistake = findMistake(marks, solution);
  if (mistake) return mistake;
  const missing = solution.filter(i => marks[i] !== MARK.STAR);
  if (!missing.length) return null;
  return { type: 'place-star', cell: pick(missing) };
}
