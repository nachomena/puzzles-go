/* Reglas del solitario (peg solitaire) sobre una rejilla de 7×7. Funciones puras, sin DOM.
   Casilla i = fila * 7 + columna. `balls[i]` es el id de la bola en el agujero i, o -1 si está
   vacío (también en las casillas que no son agujero). */
export const N = 7;
export const CENTER = 24;

/**
 * Tableros. El europeo (francés) añade 4 agujeros en las esquinas interiores. Con el centro vacío
 * no se puede terminar con una sola bola, así que empieza con vacío el agujero de encima del centro.
 */
export const BOARDS = Object.freeze({
  english:  Object.freeze({ name: 'Inglés',  start: CENTER }),
  european: Object.freeze({ name: 'Europeo', start: 10 })
});

export const isBoard = b => Object.hasOwn(BOARDS, b);

/** ¿La casilla (r, c) es un agujero de ese tablero? */
export function isHole(board, r, c){
  if (r < 0 || c < 0 || r >= N || c >= N) return false;
  const dr = Math.abs(r - 3), dc = Math.abs(c - 3);
  return dr <= 1 || dc <= 1 || (board === 'european' && dr === 2 && dc === 2);
}

/** Agujeros del tablero, en orden de lectura. */
export function holes(board){
  const out = [];
  for (let i = 0; i < N * N; i++) if (isHole(board, (i / N) | 0, i % N)) out.push(i);
  return out;
}

/** Posición inicial: una bola por agujero (ids en orden de lectura) salvo el de inicio. */
export function startBalls(board){
  const balls = new Array(N * N).fill(-1);
  holes(board).forEach((i, id) => { if (i !== BOARDS[board].start) balls[i] = id; });
  return balls;
}

const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]];

/** Saltos posibles de la bola en `from`: [{ over, to }]. */
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

/** ¿Queda algún salto en el tablero? */
export const anyMove = (board, balls) => balls.some((b, i) => b >= 0 && movesFrom(board, balls, i).length > 0);

export const countBalls = balls => balls.reduce((n, b) => n + (b >= 0), 0);

/** Salto de `from` a `to` si es válido: { over } o null. */
export function jumpOver(board, balls, from, to){
  return movesFrom(board, balls, from).find(m => m.to === to) || null;
}
