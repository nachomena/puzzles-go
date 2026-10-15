/* Killer Sudoku: un Sudoku 9 × 9 dividido en jaulas; los números de cada jaula suman lo que dice y
   no se repiten dentro de ella. Sin DOM. Casilla i = fila * 9 + columna.
   Una jaula es { cells: [i…] (ordenadas), sum }.
   Además de las jaulas, la regla del 45 da "grupos de suma": casillas que, sin ser una jaula, suman
   algo conocido porque una fila, columna o caja suma siempre 45. */
import { CELLS, SIZE, ROWS, COLS, BOXES, rowOf, colOf, boxOf } from '../../sudoku/engine/grid.js';
import { shuffle, randInt } from '../../../lib/random.js';

const neighbours = i => {
  const r = rowOf(i), c = colOf(i), out = [];
  if (r) out.push(i - SIZE);
  if (r < SIZE - 1) out.push(i + SIZE);
  if (c) out.push(i - 1);
  if (c < SIZE - 1) out.push(i + 1);
  return out;
};

/**
 * Divide el tablero en jaulas unidas de los tamaños de `sizes` (al azar de la lista) sin repetir
 * número de `solution` dentro de una jaula. Las casillas que se quedan solas se unen a una jaula
 * vecina que no tenga su número; si no se puede, devuelve null.
 */
export function partition(solution, sizes){
  const owner = new Int16Array(CELLS).fill(-1), cages = [];
  for (const start of shuffle([...Array(CELLS).keys()])){
    if (owner[start] >= 0) continue;
    const want = sizes[randInt(sizes.length)], cells = [start];
    let used = 1 << solution[start];
    owner[start] = cages.length;
    while (cells.length < want){
      const opts = cells.flatMap(neighbours).filter(j => owner[j] < 0 && !(used & (1 << solution[j])));
      if (!opts.length) break;
      const j = opts[randInt(opts.length)];
      owner[j] = cages.length; cells.push(j); used |= 1 << solution[j];
    }
    cages.push(cells);
  }
  // casillas sueltas: a la jaula vecina más pequeña que admita su número
  for (let k = 0; k < cages.length; k++){
    if (cages[k].length !== 1) continue;
    const i = cages[k][0];
    const host = neighbours(i).map(j => owner[j]).filter(o => o !== k && cages[o].length > 0 &&
      !cages[o].some(j => solution[j] === solution[i])).sort((a, b) => cages[a].length - cages[b].length)[0];
    if (host === undefined) return null;
    cages[host].push(i); owner[i] = host; cages[k] = [];
  }
  return cages.filter(c => c.length).map(cells => ({ cells: cells.sort((a, b) => a - b), sum: cells.reduce((t, i) => t + solution[i], 0) }));
}

/** ¿Las jaulas cubren cada casilla una sola vez? */
export function coversBoard(cages){
  const seen = new Uint8Array(CELLS);
  for (const { cells } of cages) for (const i of cells){ if (seen[i]) return false; seen[i] = 1; }
  return seen.every(Boolean);
}

/** ¿Comparten fila, columna o caja? */
export const sees = (a, b) => rowOf(a) === rowOf(b) || colOf(a) === colOf(b) || boxOf(a) === boxOf(b);

/**
 * Grupos de suma de la regla del 45 para las regiones dadas (cada región: casillas de k unidades
 * enteras, que suman 45·k). Para cada región:
 *   - "dentro": las casillas de la región que son de jaulas que se salen de ella suman
 *     45·k − (lo que suman las jaulas que caben enteras);
 *   - "fuera": las casillas de esas mismas jaulas que quedan fuera suman (lo que suman esas jaulas) −
 *     (lo que suman las de dentro).
 * Solo se quedan los grupos de 1 a `maxCells` casillas. `owner[i]` = índice de la jaula de i.
 */
export function sumGroups(cages, regions, maxCells){
  const owner = new Int16Array(CELLS);
  cages.forEach((c, k) => c.cells.forEach(i => { owner[i] = k; }));
  const out = [], seen = new Set();
  const add = (cells, sum) => {
    if (!cells.length || cells.length > maxCells) return;
    const key = cells.slice().sort((a, b) => a - b).join(',');
    // un grupo que es justo una jaula no aporta nada
    if (seen.has(key) || cages.some(c => c.cells.join(',') === key)) return;
    seen.add(key);
    out.push({ cells: key.split(',').map(Number), sum });
  };
  for (const { cells, units } of regions){
    const inRegion = new Set(cells);
    const touching = [...new Set(cells.map(i => owner[i]))];
    let whole = 0, partSum = 0;
    const inside = [], outside = [];
    for (const k of touching){
      const cage = cages[k];
      if (cage.cells.every(i => inRegion.has(i))){ whole += cage.sum; continue; }
      partSum += cage.sum;
      for (const i of cage.cells) (inRegion.has(i) ? inside : outside).push(i);
    }
    const insideSum = 45 * units - whole;
    add(inside, insideSum);
    add(outside, partSum - insideSum);
  }
  return out;
}

/** Regiones de una unidad (filas, columnas y cajas). */
export const UNIT_REGIONS = [...ROWS, ...COLS, ...BOXES].map(cells => ({ cells, units: 1 }));

/** Regiones de dos y tres filas o columnas seguidas, y franjas de cajas. */
export const BAND_REGIONS = (() => {
  const out = [];
  for (const lines of [ROWS, COLS]) for (const span of [2, 3]) for (let a = 0; a + span <= SIZE; a++){
    out.push({ cells: lines.slice(a, a + span).flat(), units: span });
  }
  for (let b = 0; b < SIZE; b += 3){
    for (const pair of [[b, b + 1], [b + 1, b + 2]]) out.push({ cells: pair.flatMap(k => BOXES[k]), units: 2 });
    for (const pair of [[b / 3, b / 3 + 3], [b / 3 + 3, b / 3 + 6]]) out.push({ cells: pair.flatMap(k => BOXES[k]), units: 2 });
  }
  return out;
})();
