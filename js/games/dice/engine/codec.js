/* Compact encoding of a complete placement: one byte per piece (rotation * 36 + cell of its corner), in
   PIECES order. Equal pieces are stored sorted by cell. */
import { PIECES, CELLS, SIZE } from './pieces.js';

export const SLOTS = PIECES.length;

/** First PIECES index of each type. */
const FIRST_OF_TYPE = PIECES.reduce((m, t, i) => (t in m ? m : { ...m, [t]: i }), {});

/** [{type, rot, r, c}] (12 pieces, any order) → array of 12 bytes. */
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

/** 12 bytes → [{piece, type, rot, r, c}] in PIECES order. */
export function decodeArrangement(bytes, offset = 0){
  return PIECES.map((type, piece) => {
    const v = bytes[offset + piece], cell = v % CELLS;
    return { piece, type, rot: (v / CELLS) | 0, r: (cell / SIZE) | 0, c: cell % SIZE };
  });
}
