/* Piezas y tablero de Smart Circle (clon de IQ Circle de SmartGames).
   El tablero tiene 3 anillos de 16 agujeros: casilla = anillo * 16 + sector (anillo 0 = el de
   dentro, de bolas pequeñas; 2 = el de fuera, de bolas grandes). El sector 0 está a la derecha y
   los sectores avanzan en el sentido de las agujas del reloj.
   Cada pieza es una lista de bolas [anillo, sector relativo]: la pieza se coloca girándola (sumar
   un desplazamiento al sector) y, como tiene dos caras, también reflejada (cambiar el signo).
   Las 10 piezas se han sacado de las 120 soluciones del cuadernillo original. */
export const RINGS = 3;
export const SECTORS = 16;
export const CELLS = RINGS * SECTORS;

export const cell = (ring, sector) => ring * SECTORS + (((sector % SECTORS) + SECTORS) % SECTORS);
export const ringOf = c => (c / SECTORS) | 0;
export const sectorOf = c => c % SECTORS;

/** Las piezas, en el orden del cuadernillo (SG 311-A … J). `hue`: color de cada una. */
export const PIECES = Object.freeze([
  { id: 'A', name: 'Amarilla',    hue: 'yellow', balls: [[1, 0], [2, 0], [2, 1]] },
  { id: 'B', name: 'Naranja',     hue: 'orange', balls: [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1]] },
  { id: 'C', name: 'Roja',        hue: 'red',    balls: [[1, 0], [1, 1], [2, 0], [2, 1], [2, 2]] },
  { id: 'D', name: 'Rosa',        hue: 'pink',   balls: [[0, 0], [0, 1], [1, 0], [1, 15], [2, 15]] },
  { id: 'E', name: 'Lila',        hue: 'purple', balls: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [2, 1]] },
  { id: 'F', name: 'Azul',        hue: 'blue',   balls: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [2, 15]] },
  { id: 'G', name: 'Celeste',     hue: 'sky',    balls: [[1, 0], [2, 0], [2, 1], [2, 15]] },
  { id: 'H', name: 'Turquesa',    hue: 'teal',   balls: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1]] },
  { id: 'I', name: 'Verde',       hue: 'green',  balls: [[0, 0], [0, 1], [1, 0], [2, 0], [2, 15]] },
  { id: 'J', name: 'Lima',        hue: 'lime',   balls: [[0, 0], [1, 0], [1, 1], [2, 1]] }
].map(p => Object.freeze({ ...p, balls: Object.freeze(p.balls.map(b => Object.freeze(b))) })));

/**
 * Nervios: separan dos agujeros vecinos del anillo de fuera. El nervio k está entre el sector k y
 * el k + 1. Siempre van en este patrón (huecos de 3, 2, 4, 4 y 3 sectores); al girar el tablero se
 * desplazan todos a la vez: `ribsAt(o)`.
 */
export const RIB_PATTERN = Object.freeze([0, 3, 5, 9, 13]);
export const ribsAt = o => RIB_PATTERN.map(k => (k + o) % SECTORS);

/** Bola k de la pieza con postura { m: ±1 (cara), s: giro en sectores } → casilla. */
export const ballCell = (piece, k, { m, s }) => {
  const [ring, d] = PIECES[piece].balls[k];
  return cell(ring, m * d + s);
};

/** Casillas de una pieza en una postura (en el orden de sus bolas). */
export const cellsOf = (piece, pose) => PIECES[piece].balls.map((_, k) => ballCell(piece, k, pose));

/** ¿Une la pieza dos bolas de fuera a ambos lados de un nervio? (no se puede: el nervio lo impide) */
export function crossesRib(cells, ribs){
  const set = new Set(cells);
  return ribs.some(k => set.has(cell(2, k)) && set.has(cell(2, k + 1)));
}

/** Pares de bolas unidas de una pieza (vecinas en el tablero): [[k1, k2], …]. */
export function bonds(piece){
  const balls = PIECES[piece].balls, out = [];
  for (let a = 0; a < balls.length; a++) for (let b = a + 1; b < balls.length; b++){
    const [ra, da] = balls[a], [rb, db] = balls[b];
    const dd = (((da - db) % SECTORS) + SECTORS) % SECTORS;
    if ((ra === rb && (dd === 1 || dd === SECTORS - 1)) || (da === db && Math.abs(ra - rb) === 1)) out.push([a, b]);
  }
  return out;
}

/** Todas las posturas distintas de una pieza (las que ocupan las mismas casillas cuentan una vez). */
export function poses(piece){
  const seen = new Set(), out = [];
  for (const m of [1, -1]) for (let s = 0; s < SECTORS; s++){
    const key = cellsOf(piece, { m, s }).slice().sort((a, b) => a - b).join();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ m, s });
  }
  return out;
}
