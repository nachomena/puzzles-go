/* Killer Sudoku: a 9 × 9 Sudoku split into cages; the numbers of each cage add up to what it says and
   don't repeat inside it. No DOM. Cell i = row * 9 + column.
   A cage is { cells: [i…] (sorted), sum }.
   Besides the cages, the 45 rule gives "sum groups": cells that, without being a cage, add up to
   something known because a row, column or box always adds up to 45. */
import { CELLS, SIZE, ROWS, COLS, BOXES, rowOf, colOf, boxOf } from '../../sudoku/engine/grid.js';
import { shuffle, randInt } from '../../../lib/random.js';

const neighbours = i => {
  const r = rowOf(i), c = colOf(i), out = [];
  if (r) out.push(i - SIZE);
  if (r < SIZE - 1) out.push(i + SIZE);
  if (c) out.push(i - 1);
  if (c < SIZE - 1) out.push(i + 1);
  return out;
};

/**
 * Splits the board into connected cages of the sizes in `sizes` (random from the list) without repeating
 * a number of `solution` inside a cage. Cells left alone join a neighbouring cage that doesn't have their
 * number; if that isn't possible, returns null.
 */
export function partition(solution, sizes){
  const owner = new Int16Array(CELLS).fill(-1), cages = [];
  for (const start of shuffle([...Array(CELLS).keys()])){
    if (owner[start] >= 0) continue;
    const want = sizes[randInt(sizes.length)], cells = [start];
    let used = 1 << solution[start];
    owner[start] = cages.length;
    while (cells.length < want){
      const opts = cells.flatMap(neighbours).filter(j => owner[j] < 0 && !(used & (1 << solution[j])));
      if (!opts.length) break;
      const j = opts[randInt(opts.length)];
      owner[j] = cages.length; cells.push(j); used |= 1 << solution[j];
    }
    cages.push(cells);
  }
  // lone cells: to the smallest neighbouring cage that accepts their number
  for (let k = 0; k < cages.length; k++){
    if (cages[k].length !== 1) continue;
    const i = cages[k][0];
    const host = neighbours(i).map(j => owner[j]).filter(o => o !== k && cages[o].length > 0 &&
      !cages[o].some(j => solution[j] === solution[i])).sort((a, b) => cages[a].length - cages[b].length)[0];
    if (host === undefined) return null;
    cages[host].push(i); owner[i] = host; cages[k] = [];
  }
  return cages.filter(c => c.length).map(cells => ({ cells: cells.sort((a, b) => a - b), sum: cells.reduce((t, i) => t + solution[i], 0) }));
}

/** Do the cages cover each cell exactly once? */
export function coversBoard(cages){
  const seen = new Uint8Array(CELLS);
  for (const { cells } of cages) for (const i of cells){ if (seen[i]) return false; seen[i] = 1; }
  return seen.every(Boolean);
}

/** Do they share a row, column or box? */
export const sees = (a, b) => rowOf(a) === rowOf(b) || colOf(a) === colOf(b) || boxOf(a) === boxOf(b);

/**
 * Sum groups of the 45 rule for the given regions (each region: cells of k whole units, which add up
 * to 45·k). For each region:
 *   - "inside": the region's cells that belong to cages sticking out of it add up to
 *     45·k − (the sum of the cages that fit entirely);
 *   - "outside": the cells of those same cages left outside add up to (the sum of those cages) −
 *     (the sum of the inside ones).
 * Only groups of 1 to `maxCells` cells are kept. `owner[i]` = index of i's cage.
 */
export function sumGroups(cages, regions, maxCells){
  const owner = new Int16Array(CELLS);
  cages.forEach((c, k) => c.cells.forEach(i => { owner[i] = k; }));
  const out = [], seen = new Set();
  const add = (cells, sum) => {
    if (!cells.length || cells.length > maxCells) return;
    const key = cells.slice().sort((a, b) => a - b).join(',');
    // a group that is exactly a cage adds nothing
    if (seen.has(key) || cages.some(c => c.cells.join(',') === key)) return;
    seen.add(key);
    out.push({ cells: key.split(',').map(Number), sum });
  };
  for (const { cells, units } of regions){
    const inRegion = new Set(cells);
    const touching = [...new Set(cells.map(i => owner[i]))];
    let whole = 0, partSum = 0;
    const inside = [], outside = [];
    for (const k of touching){
      const cage = cages[k];
      if (cage.cells.every(i => inRegion.has(i))){ whole += cage.sum; continue; }
      partSum += cage.sum;
      for (const i of cage.cells) (inRegion.has(i) ? inside : outside).push(i);
    }
    const insideSum = 45 * units - whole;
    add(inside, insideSum);
    add(outside, partSum - insideSum);
  }
  return out;
}

/** Regions of one unit (rows, columns and boxes). */
export const UNIT_REGIONS = [...ROWS, ...COLS, ...BOXES].map(cells => ({ cells, units: 1 }));

/** Regions of two and three consecutive rows or columns, and bands of boxes. */
export const BAND_REGIONS = (() => {
  const out = [];
  for (const lines of [ROWS, COLS]) for (const span of [2, 3]) for (let a = 0; a + span <= SIZE; a++){
    out.push({ cells: lines.slice(a, a + span).flat(), units: span });
  }
  for (let b = 0; b < SIZE; b += 3){
    for (const pair of [[b, b + 1], [b + 1, b + 2]]) out.push({ cells: pair.flatMap(k => BOXES[k]), units: 2 });
    for (const pair of [[b / 3, b / 3 + 3], [b / 3 + 3, b / 3 + 6]]) out.push({ cells: pair.flatMap(k => BOXES[k]), units: 2 });
  }
  return out;
})();
