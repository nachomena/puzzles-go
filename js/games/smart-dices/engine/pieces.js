/* Las 12 piezas del juego y las caras de dado válidas.
   El tablero es de 6×6 posiciones de punto: 2×2 dados de 3×3. Casilla i = fila * 6 + columna. */

export const SIZE = 6, DIE = 3, CELLS = SIZE * SIZE;

/** Formas base: celdas [fila, col] y puntos negros [fila, col]. `count` = piezas iguales. */
export const PIECE_TYPES = [
  { id: 'long',   cells: [[0, 0], [0, 1], [0, 2], [0, 3]], dots: [[0, 0], [0, 3]], count: 1 },
  { id: 'bar3-1', cells: [[0, 0], [0, 1], [0, 2]], dots: [[0, 0]], count: 1 },
  { id: 'bar3-2', cells: [[0, 0], [0, 1], [0, 2]], dots: [[0, 0], [0, 2]], count: 1 },
  { id: 'bar2-1', cells: [[0, 0], [0, 1]], dots: [[0, 0]], count: 1 },
  { id: 'bar2-2', cells: [[0, 0], [0, 1]], dots: [[0, 0], [0, 1]], count: 1 },
  { id: 'bar2-0', cells: [[0, 0], [0, 1]], dots: [], count: 4 },
  { id: 'sq-2',   cells: [[0, 0], [0, 1], [1, 0], [1, 1]], dots: [[0, 0], [1, 1]], count: 1 },
  { id: 'sq-1',   cells: [[0, 0], [0, 1], [1, 0], [1, 1]], dots: [[0, 0]], count: 1 },
  { id: 'rect',   cells: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]], dots: [[1, 1]], count: 1 }
];

/** Las 12 piezas concretas: índice de pieza → índice de tipo. */
export const PIECES = PIECE_TYPES.flatMap((t, type) => Array.from({ length: t.count }, () => type));

/** Gira [fila, col] 90° en sentido horario `rot` veces y normaliza para empezar en (0, 0). */
function rotate(points, rot, refPoints = points){
  let pts = points.map(p => p.slice()), ref = refPoints.map(p => p.slice());
  for (let k = 0; k < rot; k++){
    const h = Math.max(...ref.map(p => p[0]));
    pts = pts.map(([r, c]) => [c, h - r]);
    ref = ref.map(([r, c]) => [c, h - r]);
  }
  const minR = Math.min(...ref.map(p => p[0])), minC = Math.min(...ref.map(p => p[1]));
  return pts.map(([r, c]) => [r - minR, c - minC]);
}

/** Forma de un tipo con un giro (0..3): celdas y puntos relativos a su esquina superior izquierda. */
export function shape(type, rot){
  const t = PIECE_TYPES[type];
  const cells = rotate(t.cells, rot), dots = rotate(t.dots, rot, t.cells);
  const key = p => p[0] * 10 + p[1];
  cells.sort((a, b) => key(a) - key(b));
  dots.sort((a, b) => key(a) - key(b));
  return {
    cells, dots,
    h: Math.max(...cells.map(p => p[0])) + 1,
    w: Math.max(...cells.map(p => p[1])) + 1
  };
}

/** Celdas del tablero (índices) y puntos que ocupa una pieza en (r, c) con giro rot, o null si se sale. */
export function footprint(type, rot, r, c){
  const s = shape(type, rot);
  if (r < 0 || c < 0 || r + s.h > SIZE || c + s.w > SIZE) return null;
  return {
    cells: s.cells.map(([a, b]) => (r + a) * SIZE + c + b),
    dots: s.dots.map(([a, b]) => (r + a) * SIZE + c + b)
  };
}

/* ---------- Dados ---------- */

/** Dado (0..3, de izquierda a derecha y de arriba abajo) de cada casilla, y posición dentro del dado. */
export const dieOf = i => ((((i / SIZE) | 0) / DIE) | 0) * 2 + (((i % SIZE) / DIE) | 0);
export const posInDie = i => (((i / SIZE) | 0) % DIE) * DIE + (i % SIZE) % DIE;

const mask = (...pos) => pos.reduce((m, p) => m | (1 << p), 0);
/** Patrones válidos (máscara de 9 bits dentro del dado) → valor. Incluye todos los giros. */
export const FACES = new Map([
  [mask(4), 1],
  [mask(0, 8), 2], [mask(2, 6), 2],
  [mask(0, 4, 8), 3], [mask(2, 4, 6), 3],
  [mask(0, 2, 6, 8), 4],
  [mask(0, 2, 4, 6, 8), 5],
  [mask(0, 3, 6, 2, 5, 8), 6], [mask(0, 1, 2, 6, 7, 8), 6]
]);

/** Filas y columnas de dados: [dado, dado]. Fila 0 = arriba, columna 0 = izquierda. */
export const DIE_ROWS = [[0, 1], [2, 3]];
export const DIE_COLS = [[0, 2], [1, 3]];
