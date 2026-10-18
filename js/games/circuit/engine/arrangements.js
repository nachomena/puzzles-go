/* The precomputed valid placements (arrangements-data.js), with what is needed to check at once which
   placements meet some clues. */
import { COUNT, DATA } from './arrangements-data.js';
import { PIECES, CELLS, W } from './pieces.js';
import { orient } from './solver.js';

/**
 * Orientation of a piece with a side and a rotation (any of the 4 rotations: the player may leave a
 * symmetric piece turned 180°, which isn't among the distinct orientations).
 */
const memo = new Map();
export function orientation(piece, face, rot){
  const k = (piece * 4 + face) * 4 + rot;
  if (!memo.has(k)) memo.set(k, orient(piece, face, rot));
  return memo.get(k);
}

/** Cells, exits and dots covered by a piece placed with its anchor cell. */
export function footprint({ piece, face, rot, cell }){
  const o = orientation(piece, face, rot);
  const ax = cell % W - o.cells[0][0], ay = ((cell / W) | 0) - o.cells[0][1];
  const cells = o.cells.map(([x, y]) => (ay + y) * W + ax + x);
  return { cells, masks: o.masks, dots: [...o.dots].map(k => cells[k]) };
}

/** Visual key of a placed piece: two pieces that look the same in the same place share a key. */
export function lookKey(p){
  const f = footprint(p);
  return f.cells.map((c, k) => `${c}:${f.masks[k]}${f.dots.includes(c) ? '*' : ''}`).sort().join(',');
}

function decodeBase64(b64){
  if (typeof atob === 'function'){
    const bin = atob(b64), out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  return Uint8Array.from(Buffer.from(b64, 'base64'));
}

let cache = null;

/** List of placements: { pieces, mask, dots, regions, keys }. */
export function arrangements(){
  if (cache) return cache;
  const bytes = decodeBase64(DATA), list = [];
  for (let k = 0; k < COUNT; k++){
    const pieces = PIECES.map((_, piece) => {
      const v = (bytes[(k * PIECES.length + piece) * 2] << 8) | bytes[(k * PIECES.length + piece) * 2 + 1];
      const cell = v % CELLS, fr = (v / CELLS) | 0;
      return { piece, face: (fr / 4) | 0, rot: fr % 4, cell };
    });
    const mask = new Array(CELLS).fill(0), regions = new Array(CELLS).fill(-1), dots = [];
    for (const p of pieces){
      const f = footprint(p);
      f.cells.forEach((c, i) => { mask[c] = f.masks[i]; regions[c] = p.piece; });
      dots.push(...f.dots);
    }
    dots.sort((a, b) => a - b);
    // outline of the pieces regardless of which piece it is: each cell → first cell of its piece
    const firstOf = {};
    regions.forEach((r, c) => { if (!(r in firstOf)) firstOf[r] = c; });
    list.push({
      pieces, mask, dots, regions,
      dotsKey: dots.join(','), maskKey: mask.join(','), regionKey: regions.map(r => firstOf[r]).join(','),
      keys: new Set(pieces.map(lookKey))
    });
  }
  return (cache = list);
}

/**
 * Placements that meet the clues.
 * @param {{ dots: number[], masks?: boolean, regions?: boolean, fixed?: object[] }} clues
 *   `masks` / `regions` = true means "equal to those of `ref`" (the puzzle's solution).
 */
export function matching(clues, ref){
  const fixedKeys = (clues.fixed || []).map(lookKey);
  const dotsKey = [...clues.dots].sort((a, b) => a - b).join(',');
  return arrangements().filter(a =>
    a.dotsKey === dotsKey &&
    (!clues.masks || a.maskKey === ref.maskKey) &&
    (!clues.regions || a.regionKey === ref.regionKey) &&
    fixedKeys.every(k => a.keys.has(k)));
}
