// Calcula todas las soluciones de Smart Circle con los nervios en la posición de partida y las
// guarda en js/games/smart-circle/engine/solutions-data.js (las demás orientaciones son las mismas
// giradas). Uso: node scripts/build-circle-solutions.mjs   (menos de un segundo)
import { writeFileSync } from 'node:fs';
import { solveAll } from '../js/games/smart-circle/engine/solver.js';
import { ribsAt, PIECES } from '../js/games/smart-circle/engine/pieces.js';

const bytes = [];
// 1 byte por pieza, en orden de PIECES: cara (0 = derecha, 1 = reflejada) * 16 + giro
const count = solveAll(ribsAt(0), chosen => bytes.push(...chosen.map(({ m, s }) => (m < 0 ? 16 : 0) + s)));
const b64 = Buffer.from(Uint8Array.from(bytes)).toString('base64');
writeFileSync(new URL('../js/games/smart-circle/engine/solutions-data.js', import.meta.url),
`/* Generado por scripts/build-circle-solutions.mjs — no editar a mano.
   ${count} soluciones con los nervios en la posición de partida (ribsAt(0)); por pieza (en orden de
   PIECES) 1 byte: cara (0 derecha, 1 reflejada) * 16 + giro. */
export const COUNT = ${count};
export const PIECE_COUNT = ${PIECES.length};
export const DATA = '${b64}';
`);
console.log(`${count} soluciones, ${b64.length} caracteres`);
