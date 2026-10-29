/* Exact Circle solver: fills the 42 cells with the 10 pieces without crossing the ribs. Used to
   precompute every solution (scripts/build-circle-solutions.mjs) and to check them in the tests. */
import { PIECES, CELLS, SECTORS, RINGS, cell, cellsOf, crossesRib, poses } from './pieces.js';

/**
 * @param {number[]} ribs  ribs (see ribsAt)
 * @param {(poses: {m:number,s:number}[]) => void} onSolution  pose of each piece, in PIECES order
 */
export function solveAll(ribs, onSolution){
  const options = PIECES.map((_, p) => poses(p)
    .map(pose => ({ pose, cells: cellsOf(p, pose) }))
    .filter(o => !crossesRib(o.cells, ribs)));
  const byCell = Array.from({ length: CELLS }, () => []);
  options.forEach((os, p) => os.forEach(o => { for (const c of o.cells) byCell[c].push({ p, ...o }); }));
  // it fills sector by sector, from the inside out
  const order = [];
  for (let s = 0; s < SECTORS; s++) for (let r = 0; r < RINGS; r++) order.push(cell(r, s));
  const filled = new Uint8Array(CELLS), used = new Uint8Array(PIECES.length), chosen = new Array(PIECES.length);
  let count = 0;
  (function rec(){
    const e = order.find(c => !filled[c]);
    if (e === undefined){ count++; onSolution?.(chosen.slice()); return; }
    for (const o of byCell[e]){
      if (used[o.p] || o.cells.some(c => filled[c])) continue;
      used[o.p] = 1; chosen[o.p] = o.pose; for (const c of o.cells) filled[c] = 1;
      rec();
      used[o.p] = 0; for (const c of o.cells) filled[c] = 0;
    }
  })();
  return count;
}
