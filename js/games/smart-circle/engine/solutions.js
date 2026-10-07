/* Las soluciones precalculadas (solutions-data.js), en cualquier orientación de los nervios: girar
   el tablero o girar todas las piezas lo mismo es equivalente, así que basta sumar el giro. */
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
/** Soluciones con los nervios en la posición de partida: lista de posturas por pieza. */
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

/** Posturas de una solución girada `o` sectores. */
export const rotate = (poses, o) => poses.map(({ m, s }) => ({ m, s: (s + o) % SECTORS }));

/** Qué pieza ocupa cada casilla con esas posturas. */
export function ownerOf(poses){
  const owner = new Int8Array(CELLS).fill(-1);
  poses.forEach((pose, p) => { if (pose) for (const c of cellsOf(p, pose)) owner[c] = p; });
  return owner;
}

/** Clave de las casillas que ocupa una pieza (no depende de la postura exacta si se ven igual). */
export const placeKey = (p, pose) => p + ':' + cellsOf(p, pose).slice().sort((a, b) => a - b).join();

let all = null, index = null;
/**
 * Todas las soluciones en las 16 orientaciones: [{ o, poses, owner, key, pieceKeys }].
 * `key` identifica la colocación de todas las piezas; `pieceKeys[p]`, la de cada pieza.
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

/** Índices de las soluciones en las que la pieza está justo así colocada. */
export function withPiece(key){ allSolutions(); return index.get(key) || []; }
