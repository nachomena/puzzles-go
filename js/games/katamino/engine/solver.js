/* Búsqueda de soluciones de un PENTA: cubrir el tablero de W × n con n pentominós
   (lib/polyomino.js, sobre el tablero más largo con las filas que sobran ya ocupadas). */
import { W, MAX_N, PIECES } from './pieces.js';
import { createPacker } from '../../../lib/polyomino.js';

const packer = createPacker({ W, H: MAX_N, shapes: PIECES.map(p => p.cells) });

/** Casillas de las filas de n en adelante. */
const beyond = n => Array.from({ length: W * (MAX_N - n) }, (_, i) => [i % W, n + ((i / W) | 0)]);

/**
 * Cuenta las soluciones (hasta `limit`).
 * @param {number[]} pieces  piezas del PENTA (tantas como filas)
 * @param {{ fixed?: {piece:number, pose:{m,r,x,y}}[], limit?: number, onSolution?: (sol) => void|boolean }} [opts]
 *   fixed: piezas ya colocadas. onSolution recibe [{ piece, pose }] de todas las piezas; si devuelve
 *   true, se para.
 * @returns {number}  0 también si las fijas se salen o se pisan
 */
export const countSolutions = (pieces, opts = {}) => {
  const n = pieces.length;
  if ((opts.fixed || []).some(({ piece, pose }) => (packer.cellsOf(piece, pose) || [[0, MAX_N]]).some(([, y]) => y >= n))) return 0;
  return packer.countSolutions(pieces, { ...opts, blocked: beyond(n) });
};

/** Primera solución que respeta las piezas `fixed`, o null. */
export const solve = (pieces, fixed = []) => packer.solve(pieces, { fixed, blocked: beyond(pieces.length) });
