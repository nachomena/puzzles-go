/* Reglas del juego sobre las marcas del jugador. Funciones puras, sin DOM. */
import { MARK } from './config.js';
import { adjacency, rowOf, colOf } from '../../lib/grid.js';
import { pick } from '../../lib/random.js';

/** Una X automática cuenta como X a efectos del jugador. */
export const effectiveMark = v => v === MARK.AUTO_X ? MARK.X : v;

/** Ciclo al tocar: vacía → X → estrella → vacía. */
const CYCLE = { [MARK.EMPTY]: MARK.X, [MARK.X]: MARK.STAR, [MARK.STAR]: MARK.EMPTY };
export const nextMark = v => CYCLE[effectiveMark(v)];

/** Recalcula las X automáticas alrededor de cada estrella (muta `marks`). */
export function applyAutoX(marks, N, enabled){
  for (let i = 0; i < marks.length; i++) if (marks[i] === MARK.AUTO_X) marks[i] = MARK.EMPTY;
  if (!enabled) return;
  const { n8 } = adjacency(N);
  for (let i = 0; i < marks.length; i++) if (marks[i] === MARK.STAR){
    for (const j of n8[i]) if (marks[j] === MARK.EMPTY) marks[j] = MARK.AUTO_X;
  }
}

/**
 * Busca estrellas que rompen alguna regla.
 * Devuelve { bad: Uint8Array, anyBad, solved }.
 */
export function analyze(marks, { N, K, regions }){
  const bad = new Uint8Array(N * N);
  const rowCount = new Array(N).fill(0), colCount = new Array(N).fill(0), regCount = new Array(N).fill(0);
  const { n8 } = adjacency(N);
  let total = 0;
  for (let i = 0; i < marks.length; i++) if (marks[i] === MARK.STAR){
    total++; rowCount[rowOf(N, i)]++; colCount[colOf(N, i)]++; regCount[regions[i]]++;
  }
  for (let i = 0; i < marks.length; i++) if (marks[i] === MARK.STAR){
    const overflow = rowCount[rowOf(N, i)] > K || colCount[colOf(N, i)] > K || regCount[regions[i]] > K;
    if (overflow || n8[i].some(j => marks[j] === MARK.STAR)) bad[i] = 1;
  }
  const anyBad = bad.some(Boolean);
  return { bad, anyBad, solved: total === N * K && !anyBad };
}

/** ¿Tiene el tablero algo que el jugador haya puesto (X, estrella o pintura)? */
export const hasPlayerInput = (marks, paint) =>
  marks.some(v => v === MARK.X || v === MARK.STAR) || paint.some(Boolean);

/** Pista: primero corrige errores, si no hay coloca una estrella que falte. */
export function findHint(marks, solution){
  const sol = new Set(solution);
  const wrongStar = marks.findIndex((v, i) => v === MARK.STAR && !sol.has(i));
  if (wrongStar >= 0) return { type: 'wrong-star', cell: wrongStar };
  const wrongX = marks.findIndex((v, i) => v === MARK.X && sol.has(i));
  if (wrongX >= 0) return { type: 'missing-star', cell: wrongX };
  const missing = solution.filter(i => marks[i] !== MARK.STAR);
  if (!missing.length) return null;
  return { type: 'place-star', cell: pick(missing) };
}
