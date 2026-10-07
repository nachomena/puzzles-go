/* Solucionador exacto de Smart Circle: llena las 48 casillas con las 10 piezas sin cruzar los
   nervios. Sirve para precalcular todas las soluciones (scripts/build-circle-solutions.mjs) y para
   comprobarlas en las pruebas. */
import { PIECES, CELLS, SECTORS, RINGS, cell, cellsOf, crossesRib, poses } from './pieces.js';

/**
 * @param {number[]} ribs  nervios (ver ribsAt)
 * @param {(poses: {m:number,s:number}[]) => void} onSolution  postura de cada pieza, en orden de PIECES
 */
export function solveAll(ribs, onSolution){
  const options = PIECES.map((_, p) => poses(p)
    .map(pose => ({ pose, cells: cellsOf(p, pose) }))
    .filter(o => !crossesRib(o.cells, ribs)));
  const byCell = Array.from({ length: CELLS }, () => []);
  options.forEach((os, p) => os.forEach(o => { for (const c of o.cells) byCell[c].push({ p, ...o }); }));
  // se rellena sector a sector, de dentro afuera
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
