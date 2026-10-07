/* Las soluciones precalculadas (solutions-data.js): una por grupo de simetría, que se expande a
   las 12 versiones giradas y volteadas del tablero. */
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

/** Clave de las casillas que ocupa una pieza (igual para posturas que se ven igual). */
export const placeKey = (p, cells) => p + ':' + cells.slice().sort((a, b) => a - b).join();

let all = null, index = null;
/**
 * Todas las soluciones: [{ poses, owner, key, pieceKeys }]. `poses[p]` es la postura de la pieza p
 * ({ m, r, tu, tv }); `key` identifica la solución y `pieceKeys[p]` la colocación de cada pieza.
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

/** Índices de las soluciones en las que la pieza está justo así colocada. */
export function withPiece(key){ allSolutions(); return index.get(key) || []; }
