/* Los desafíos: filas de piezas en las que el PENTA n usa las n primeras (datos en sets-data.js). */
import { SETS } from './sets-data.js';
import { PIECES } from './pieces.js';

const BY_NAME = Object.fromEntries(PIECES.map((p, i) => [p.name, i]));

/** Bloques de un desafío: [{ from, to, rows: [{ label, pieces: number[] }] }]. */
export const blocksOf = L => (SETS[L] || []).map(b => ({
  from: b.from, to: b.to,
  rows: b.rows.map(([label, s]) => ({ label, pieces: [...s].map(c => BY_NAME[c]) }))
}));

const BLOCKS = Object.fromEntries(Object.keys(SETS).map(L => [L, blocksOf(L)]));

/** Fila de un desafío por su etiqueta, con su bloque: { block, index, row } o null. */
export function findRow(L, label){
  for (const block of BLOCKS[L] || []){
    const index = block.rows.findIndex(r => r.label === label);
    if (index >= 0) return { block, index, row: block.rows[index] };
  }
  return null;
}

/** Tablero de un PENTA: { label, n, pieces } o null si no existe. */
export function penta(L, label, n){
  const f = findRow(L, label);
  if (!f || n < f.block.from || n > f.block.to) return null;
  return { label, n, pieces: f.row.pieces.slice(0, n) };
}

/**
 * El PENTA que sigue: el siguiente de la misma fila o, al acabarla, el primero de la fila siguiente.
 * Devuelve { label, n, pieces, sameRow } o null si era el último del desafío.
 */
export function nextPenta(L, label, n){
  const f = findRow(L, label);
  if (!f) return null;
  if (n < f.block.to) return { ...penta(L, label, n + 1), sameRow: true };
  const blocks = BLOCKS[L], all = blocks.flatMap(b => b.rows.map(row => ({ b, row })));
  const k = all.findIndex(x => x.row === f.row) + 1;
  if (k >= all.length) return null;
  const { b, row } = all[k];
  return { ...penta(L, row.label, b.from), sameRow: false };
}

export { BLOCKS };
