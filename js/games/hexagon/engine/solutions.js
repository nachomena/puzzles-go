/* The precomputed solutions (solutions-data.js): one per symmetry group, expanded to the board's 12
   rotated and flipped versions. */
import { COUNT, PIECE_COUNT, DATA } from './solutions-data.js';
import { CELLS, SYMMETRIES, allPlacements } from './pieces.js';

function decodeBase64(b64){
  if (typeof atob === 'function'){
    const bin = atob(b64), out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  return Uint8Array.from(Buffer.from(b64, 'base64'));
}

/** Key of the cells a piece covers (the same for poses that look the same). */
export const placeKey = (p, cells) => p + ':' + cells.slice().sort((a, b) => a - b).join();

let all = null, index = null;
/**
 * Every solution: [{ poses, owner, key, pieceKeys }]. `poses[p]` is the pose of piece p
 * ({ m, r, tu, tv }); `key` identifies the solution and `pieceKeys[p]` the placement of each piece.
 */
export function allSolutions(){
  if (all) return all;
  const pl = allPlacements(), bytes = decodeBase64(DATA);
  const lookup = pl.map(ps => new Map(ps.map((o, i) => [o.key, i])));
  const seen = new Set();
  all = []; index = new Map();
  for (let s = 0; s < COUNT; s++){
    const owner = new Int8Array(CELLS);
    for (let p = 0; p < PIECE_COUNT; p++) for (const c of pl[p][bytes[s * PIECE_COUNT + p]].cells) owner[c] = p;
    for (const perm of SYMMETRIES){
      const t = new Int8Array(CELLS);
      owner.forEach((p, c) => { t[perm[c]] = p; });
      const key = t.join();
      if (seen.has(key)) continue;
      seen.add(key);
      const cellsBy = Array.from({ length: PIECE_COUNT }, () => []);
      t.forEach((p, c) => cellsBy[p].push(c));
      const poses = cellsBy.map((cells, p) => pl[p][lookup[p].get(cells.join())].pose);
      const pieceKeys = cellsBy.map((cells, p) => placeKey(p, cells));
      const i = all.push({ poses, owner: t, key, pieceKeys }) - 1;
      for (const k of pieceKeys){ if (!index.has(k)) index.set(k, []); index.get(k).push(i); }
    }
  }
  return all;
}

/** Indices of the solutions where the piece is placed exactly like this. */
export function withPiece(key){ allSolutions(); return index.get(key) || []; }
