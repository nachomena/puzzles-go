/* Solucionador exacto de Smart Hexagon: llena los 72 puntos del tablero con las 12 piezas,
   eligiendo siempre el punto con menos opciones. Se usa para precalcular todas las soluciones
   (scripts/build-hexagon-solutions.mjs, unos 3 minutos). */
import { PIECES, CELLS, allPlacements } from './pieces.js';

/** Llama a onSolution(índice de colocación de cada pieza) por cada solución. Devuelve cuántas hay. */
export function solveAll(onSolution){
  const pl = allPlacements();
  const byCell = Array.from({ length: CELLS }, () => []);
  pl.forEach((ps, p) => ps.forEach((o, i) => { for (const c of o.cells) byCell[c].push([p, i, o.cells]); }));
  const filled = new Uint8Array(CELLS), used = new Uint8Array(PIECES.length), chosen = new Array(PIECES.length);
  const free = (cells) => { for (const c of cells) if (filled[c]) return false; return true; };
  let count = 0;
  (function rec(){
    let best = -1, bestN = Infinity;
    for (let c = 0; c < CELLS; c++){
      if (filled[c]) continue;
      let n = 0;
      for (const [p, , cells] of byCell[c]) if (!used[p] && free(cells)) n++;
      if (n < bestN){ bestN = n; best = c; if (!n) return; }
    }
    if (best < 0){ count++; onSolution?.(chosen.slice()); return; }
    for (const [p, i, cells] of byCell[best]){
      if (used[p] || !free(cells)) continue;
      used[p] = 1; chosen[p] = i; for (const c of cells) filled[c] = 1;
      rec();
      used[p] = 0; for (const c of cells) filled[c] = 0;
    }
  })();
  return count;
}
