// Calcula todas las soluciones de Smart Hexagon y guarda una por cada grupo de soluciones que son
// la misma girada o volteada (el tablero tiene 12 simetrías) en
// js/games/smart-hexagon/engine/solutions-data.js. Uso: node scripts/build-hexagon-solutions.mjs
// (unos 3 minutos; solo hace falta si cambian las piezas).
import { writeFileSync } from 'node:fs';
import { solveAll } from '../js/games/smart-hexagon/engine/solver.js';
import { PIECES, CELLS, SYMMETRIES, allPlacements } from '../js/games/smart-hexagon/engine/pieces.js';

const pl = allPlacements(), reps = new Map();
const t0 = Date.now();
const total = solveAll(chosen => {
  const owner = new Int8Array(CELLS);
  chosen.forEach((i, p) => { for (const c of pl[p][i].cells) owner[c] = p; });
  // representante: la versión simétrica con la lista de dueños más pequeña
  let best = null;
  for (const perm of SYMMETRIES){
    const t = new Int8Array(CELLS);
    owner.forEach((p, c) => { t[perm[c]] = p; });
    const k = t.join();
    if (best === null || k < best) best = k;
  }
  if (!reps.has(best)) reps.set(best, chosen);
});
const bytes = [...reps.values()].flat();
const b64 = Buffer.from(Uint8Array.from(bytes)).toString('base64');
writeFileSync(new URL('../js/games/smart-hexagon/engine/solutions-data.js', import.meta.url),
`/* Generado por scripts/build-hexagon-solutions.mjs — no editar a mano.
   ${total} soluciones en total; aquí ${reps.size}, una por grupo de soluciones iguales giradas o
   volteadas. Por pieza (en orden de PIECES) 1 byte: índice de su colocación en allPlacements(). */
export const TOTAL = ${total};
export const COUNT = ${reps.size};
export const PIECE_COUNT = ${PIECES.length};
export const DATA = '${b64}';
`);
console.log(`${total} soluciones, ${reps.size} distintas, ${b64.length} caracteres, ${Date.now() - t0} ms`);
