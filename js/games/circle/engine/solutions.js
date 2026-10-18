/* The precomputed solutions (solutions-data.js), in any orientation of the ribs: turning the board or
   turning all the pieces by the same amount is equivalent, so adding the rotation is enough. */
import { COUNT, PIECE_COUNT, DATA } from './solutions-data.js';
import { CELLS, SECTORS, cellsOf } from './pieces.js';

function decodeBase64(b64){
  if (typeof atob === 'function'){
    const bin = atob(b64), out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  return Uint8Array.from(Buffer.from(b64, 'base64'));
}

let base = null;
/** Solutions with the ribs in the starting position: list of poses per piece. */
export function baseSolutions(){
  if (base) return base;
  const bytes = decodeBase64(DATA);
  base = [];
  for (let i = 0; i < COUNT; i++){
    base.push(Array.from({ length: PIECE_COUNT }, (_, p) => {
      const v = bytes[i * PIECE_COUNT + p];
      return { m: v & 16 ? -1 : 1, s: v & 15 };
    }));
  }
  return base;
}

/** Poses of a solution turned `o` sectors. */
export const rotate = (poses, o) => poses.map(({ m, s }) => ({ m, s: (s + o) % SECTORS }));

/** Which piece covers each cell with those poses. */
export function ownerOf(poses){
  const owner = new Int8Array(CELLS).fill(-1);
  poses.forEach((pose, p) => { if (pose) for (const c of cellsOf(p, pose)) owner[c] = p; });
  return owner;
}

/** Key of the cells a piece covers (it doesn't depend on the exact pose if they look the same). */
export const placeKey = (p, pose) => p + ':' + cellsOf(p, pose).slice().sort((a, b) => a - b).join();

let all = null, index = null;
/**
 * Every solution in the 16 orientations: [{ o, poses, owner, key, pieceKeys }].
 * `key` identifies the placement of all the pieces; `pieceKeys[p]`, that of each piece.
 */
export function allSolutions(){
  if (all) return all;
  all = [];
  index = new Map();
  for (let o = 0; o < SECTORS; o++) for (const poses of baseSolutions()){
    const r = rotate(poses, o), owner = ownerOf(r), pieceKeys = r.map((pose, p) => placeKey(p, pose));
    const i = all.push({ o, poses: r, owner, key: owner.join(), pieceKeys }) - 1;
    for (const k of pieceKeys){ if (!index.has(k)) index.set(k, []); index.get(k).push(i); }
  }
  return all;
}

/** Indices of the solutions where the piece is placed exactly like this. */
export function withPiece(key){ allSolutions(); return index.get(key) || []; }
