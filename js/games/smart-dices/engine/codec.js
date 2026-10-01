/* Codificación compacta de una colocación completa: un byte por pieza (giro * 36 + casilla de su
   esquina), en el orden de PIECES. Las piezas iguales se guardan ordenadas por casilla. */
import { PIECES, CELLS, SIZE } from './pieces.js';

export const SLOTS = PIECES.length;

/** Primer índice de PIECES de cada tipo. */
const FIRST_OF_TYPE = PIECES.reduce((m, t, i) => (t in m ? m : { ...m, [t]: i }), {});

/** [{type, rot, r, c}] (12 piezas, cualquier orden) → array de 12 bytes. */
export function encodeArrangement(placed){
  const bytes = new Array(SLOTS);
  const byType = new Map();
  for (const p of placed){
    if (!byType.has(p.type)) byType.set(p.type, []);
    byType.get(p.type).push(p);
  }
  for (const [type, list] of byType){
    list.sort((a, b) => (a.r * SIZE + a.c) - (b.r * SIZE + b.c));
    list.forEach((p, k) => { bytes[FIRST_OF_TYPE[type] + k] = p.rot * CELLS + p.r * SIZE + p.c; });
  }
  return bytes;
}

/** 12 bytes → [{piece, type, rot, r, c}] en el orden de PIECES. */
export function decodeArrangement(bytes, offset = 0){
  return PIECES.map((type, piece) => {
    const v = bytes[offset + piece], cell = v % CELLS;
    return { piece, type, rot: (v / CELLS) | 0, r: (cell / SIZE) | 0, c: cell % SIZE };
  });
}
