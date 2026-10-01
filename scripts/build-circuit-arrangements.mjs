// Enumera todas las colocaciones válidas de Smart Circuit (las 10 piezas formando caminos de
// punto a punto) y las guarda en js/games/smart-circuit/engine/arrangements-data.js.
// Uso: node scripts/build-circuit-arrangements.mjs   (unos 2 minutos; solo si cambian las piezas)
import { writeFileSync } from 'node:fs';
import { solve } from '../js/games/smart-circuit/engine/solver.js';
import { PIECES, CELLS } from '../js/games/smart-circuit/engine/pieces.js';

const out = [];
const t0 = Date.now();
solve({}, { limit: Infinity, onSolution: placed => {
  // 2 bytes por pieza, en orden de pieza: ((cara * 4 + giro) * 32 + casilla)
  const byPiece = new Array(PIECES.length);
  for (const p of placed) byPiece[p.piece] = (p.face * 4 + p.rot) * CELLS + p.cell;
  out.push(...byPiece.flatMap(v => [v >> 8, v & 255]));
} });
const count = out.length / (2 * PIECES.length);
const b64 = Buffer.from(Uint8Array.from(out)).toString('base64');
writeFileSync(new URL('../js/games/smart-circuit/engine/arrangements-data.js', import.meta.url),
`/* Generado por scripts/build-circuit-arrangements.mjs — no editar a mano.
   ${count} colocaciones válidas; por pieza (en orden de PIECES) 2 bytes: (cara * 4 + giro) * 32 + casilla. */
export const COUNT = ${count};
export const DATA = '${b64}';
`);
console.log(`${count} colocaciones, ${b64.length} caracteres, ${Date.now() - t0} ms`);
