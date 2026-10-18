/* Light Up rules on what the player places: marks[i] = 0 nothing, 1 bulb, 2 "not here" mark.
   Pure functions, no DOM. */
import { isBlack, around, sights, lit } from './engine/light.js';

const bulbsOf = marks => marks.map(m => m === 1 ? 1 : 0);

/**
 * Light, bulbs that see each other and numbers that can't be met: with more bulbs than the count, or
 * with fewer and no room for the missing ones (the remaining neighbouring cells are already lit or
 * marked with a dot). `over` marks those numbers.
 */
export function evaluate(n, cells, marks, see = sights(n, cells)){
  const bulbs = bulbsOf(marks), light = lit(n, cells, bulbs, see);
  const clash = new Uint8Array(n * n), over = new Uint8Array(n * n);
  bulbs.forEach((b, i) => { if (b && see[i].some(j => bulbs[j])) clash[i] = 1; });
  cells.forEach((v, i) => {
    if (!(v >= 0 && v <= 4)) return;
    const near = around(n, i), have = near.filter(j => bulbs[j]).length;
    const room = near.filter(j => !isBlack(cells[j]) && !bulbs[j] && !light[j] && marks[j] !== 2).length;
    if (have > v || have + room < v) over[i] = 1;
  });
  return { light, clash, over };
}

/** Solved: everything lit, no clashes and each number with its exact bulbs. */
export function isSolved(n, cells, marks){
  const bulbs = bulbsOf(marks), { light, clash } = evaluate(n, cells, marks);
  return cells.every((v, i) => isBlack(v) || light[i]) && !clash.some(Boolean) &&
    cells.every((v, i) => !(v >= 0 && v <= 4) || around(n, i).filter(j => bulbs[j]).length === v);
}

/** First cell that contradicts the solution (it is unique): an extra bulb or a mark where one goes. */
export const findMistake = (marks, solution) => marks.findIndex((m, i) => (m === 1 && !solution[i]) || (m === 2 && solution[i]));

/** A missing bulb of the solution, or -1. */
export const findHint = (marks, solution) => solution.findIndex((b, i) => b && marks[i] !== 1);
