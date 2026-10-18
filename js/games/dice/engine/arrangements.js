/* Every valid placement, precomputed (arrangements-data.js), with an index to count at once how many
   meet some clues. */
import { COUNT, DATA } from './arrangements-data.js';
import { decodeArrangement, SLOTS } from './codec.js';
import { PIECE_TYPES, shape, DIE_ROWS, DIE_COLS, SIZE } from './pieces.js';
import { diceValues } from './solver.js';

/** "Canonical" rotation of each (type, rotation): the first one giving the same shape and dots. */
const CANON = PIECE_TYPES.map((_, type) => {
  const keys = [0, 1, 2, 3].map(rot => JSON.stringify(shape(type, rot)));
  return keys.map(k => keys.indexOf(k));
});
export const canonicalRot = (type, rot) => CANON[type][rot];

/** Key of a placed piece; two equal pieces in the same place and shape have the same key. */
export const placementKey = ({ type, rot, r, c }) => `${type}:${canonicalRot(type, rot)}:${r * SIZE + c}`;

function decodeBase64(b64){
  if (typeof atob === 'function'){
    const bin = atob(b64), out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  return Uint8Array.from(Buffer.from(b64, 'base64'));
}

let cache = null;

/** Decoded placements, with their dice and sums, and the key → placements index. */
export function arrangements(){
  if (cache) return cache;
  const bytes = decodeBase64(DATA), list = [], index = new Map();
  for (let k = 0; k < COUNT; k++){
    const pieces = decodeArrangement(bytes, k * SLOTS);
    const dice = diceValues(pieces);
    const keys = new Set(pieces.map(placementKey));
    list.push({
      pieces, dice, keys,
      rows: DIE_ROWS.map(([a, b]) => dice[a] + dice[b]),
      cols: DIE_COLS.map(([a, b]) => dice[a] + dice[b])
    });
    for (const key of keys){
      if (!index.has(key)) index.set(key, []);
      index.get(key).push(k);
    }
  }
  return (cache = { list, index });
}

/**
 * Placements that meet the clues (up to `limit`).
 * @param {{type,rot,r,c}[]} fixed  placed pieces
 * @param {{ rows: (number|null)[], cols: (number|null)[] }} arrows
 */
export function matching(fixed, arrows, limit = Infinity){
  const { list, index } = arrangements();
  const keys = fixed.map(placementKey);
  // it starts from the shortest list in the index
  let candidates = null;
  for (const key of keys){
    const l = index.get(key) || [];
    if (!candidates || l.length < candidates.length) candidates = l;
  }
  const out = [];
  for (const k of candidates ?? list.keys()){
    const a = list[k];
    if (!keys.every(key => a.keys.has(key))) continue;
    if (arrows.rows.some((s, i) => s != null && a.rows[i] !== s)) continue;
    if (arrows.cols.some((s, i) => s != null && a.cols[i] !== s)) continue;
    out.push(a);
    if (out.length >= limit) break;
  }
  return out;
}
