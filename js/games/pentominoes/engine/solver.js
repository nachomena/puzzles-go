/* Solution search for a puzzle: cover the W × n board with n pentominoes (lib/polyomino.js, on the
   longest board with the spare rows already taken). */
import { W, MAX_N, PIECES } from './pieces.js';
import { createPacker } from '../../../lib/polyomino.js';

const packer = createPacker({ W, H: MAX_N, shapes: PIECES.map(p => p.cells) });

/** Cells of the rows from n onwards. */
const beyond = n => Array.from({ length: W * (MAX_N - n) }, (_, i) => [i % W, n + ((i / W) | 0)]);

/**
 * Counts the solutions (up to `limit`).
 * @param {number[]} pieces  the puzzle's pieces (as many as rows)
 * @param {{ fixed?: {piece:number, pose:{m,r,x,y}}[], limit?: number, onSolution?: (sol) => void|boolean }} [opts]
 *   fixed: pieces already placed. onSolution receives [{ piece, pose }] of every piece; if it returns
 *   true, it stops.
 * @returns {number}  also 0 if the fixed ones go off the board or overlap
 */
export const countSolutions = (pieces, opts = {}) => {
  const n = pieces.length;
  if ((opts.fixed || []).some(({ piece, pose }) => (packer.cellsOf(piece, pose) || [[0, MAX_N]]).some(([, y]) => y >= n))) return 0;
  return packer.countSolutions(pieces, { ...opts, blocked: beyond(n) });
};

/** First solution that respects the `fixed` pieces, or null. */
export const solve = (pieces, fixed = []) => packer.solve(pieces, { fixed, blocked: beyond(pieces.length) });
