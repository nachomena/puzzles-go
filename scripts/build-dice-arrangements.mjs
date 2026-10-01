// Enumera todas las colocaciones válidas de Smart Dices (las 12 piezas formando 4 caras de dado)
// y las guarda en js/games/smart-dices/engine/arrangements-data.js.
// Uso: node scripts/build-dice-arrangements.mjs   (tarda unos segundos; solo hace falta si cambian las piezas)
import { writeFileSync } from 'node:fs';
import { solve } from '../js/games/smart-dices/engine/solver.js';
import { PIECES } from '../js/games/smart-dices/engine/pieces.js';
import { encodeArrangement, SLOTS } from '../js/games/smart-dices/engine/codec.js';

const out = [];
const t0 = Date.now();
const res = solve({}, { limit: Infinity, onSolution: placed => out.push(encodeArrangement(placed)) });
const bytes = Uint8Array.from(out.flat());
const b64 = Buffer.from(bytes).toString('base64');
writeFileSync(new URL('../js/games/smart-dices/engine/arrangements-data.js', import.meta.url),
`/* Generado por scripts/build-dice-arrangements.mjs — no editar a mano.
   ${res.count} colocaciones válidas; ${SLOTS} bytes por colocación (giro * 36 + casilla de cada pieza, en el orden de PIECES). */
export const COUNT = ${res.count};
export const DATA = '${b64}';
`);
console.log(`${res.count} colocaciones, ${bytes.length} bytes (${b64.length} en base64), ${Date.now() - t0} ms; piezas por colocación: ${PIECES.length}`);
