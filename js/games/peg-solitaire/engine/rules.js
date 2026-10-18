/* Peg Solitaire rules on a 7×7 grid. Pure functions, no DOM.
   Cell i = row * 7 + column. `balls[i]` is the id of the ball in hole i, or -1 if it is empty (also on
   the cells that aren't holes). */
export const N = 7;
export const CENTER = 24;

/**
 * Boards. The European (French) one adds 4 holes in the inner corners. With the centre empty it can't be
 * finished with a single ball, so it starts with the hole above the centre empty.
 */
export const BOARDS = Object.freeze({
  english:  Object.freeze({ start: CENTER }),
  european: Object.freeze({ start: 10 })
});

export const isBoard = b => Object.hasOwn(BOARDS, b);

/** Is cell (r, c) a hole of that board? */
export function isHole(board, r, c){
  if (r < 0 || c < 0 || r >= N || c >= N) return false;
  const dr = Math.abs(r - 3), dc = Math.abs(c - 3);
  return dr <= 1 || dc <= 1 || (board === 'european' && dr === 2 && dc === 2);
}

/** The board's holes, in reading order. */
export function holes(board){
  const out = [];
  for (let i = 0; i < N * N; i++) if (isHole(board, (i / N) | 0, i % N)) out.push(i);
  return out;
}

/** Starting position: one ball per hole (ids in reading order) except the starting one. */
export function startBalls(board){
  const balls = new Array(N * N).fill(-1);
  holes(board).forEach((i, id) => { if (i !== BOARDS[board].start) balls[i] = id; });
  return balls;
}

const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]];

/** Possible jumps of the ball at `from`: [{ over, to }]. */
export function movesFrom(board, balls, from){
  if (balls[from] < 0) return [];
  const r = (from / N) | 0, c = from % N, out = [];
  for (const [dr, dc] of DIRS){
    const r2 = r + 2 * dr, c2 = c + 2 * dc;
    if (!isHole(board, r2, c2)) continue;
    const over = (r + dr) * N + c + dc, to = r2 * N + c2;
    if (balls[over] >= 0 && balls[to] < 0) out.push({ over, to });
  }
  return out;
}

/** Is there any jump left on the board? */
export const anyMove = (board, balls) => balls.some((b, i) => b >= 0 && movesFrom(board, balls, i).length > 0);

export const countBalls = balls => balls.reduce((n, b) => n + (b >= 0), 0);

/** Jump from `from` to `to` if it is valid: { over } or null. */
export function jumpOver(board, balls, from, to){
  return movesFrom(board, balls, from).find(m => m.to === to) || null;
}
