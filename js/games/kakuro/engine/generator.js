/* Generador de Kakuro: forma al azar, números al azar (con tramos que tiran a bajos o a altos) y,
   mientras el solucionador lógico se atasque, se cambian los números de un tramo atascado y se vuelve a
   probar. Se queda cuando se resuelve con las técnicas del nivel (y el nivel anterior no basta).
   El Experto (12 × 12) puede tardar demasiado en el teléfono: sale de retos ya calculados
   (bank-data.js, scripts/build-kakuro-bank.mjs), cada uno en 4 versiones. */
import { pattern, runsOf, fill, withSums } from './board.js';
import { logic } from './logic-solver.js';
import { pick, randInt } from '../../../lib/random.js';
import BANK from './bank-data.js';
import { LEVEL_RULES } from './levels.js';

export { LEVEL_RULES };

const unsolved = (white, grid) => grid ? grid.reduce((t, v, i) => t + (white[i] && !v ? 1 : 0), 0) : Infinity;

/** Reto en texto: "." negra, dígito = blanca con su número (fila a fila). */
export const encode = p => p.solution.map((v, i) => p.white[i] ? v : '.').join('');

/**
 * Reto a partir de su texto, traspuesto (filas por columnas) y con los números cambiados por 10 − d si se
 * pide: los dos cambios conservan la solución única y las técnicas que hacen falta.
 */
export function decode(text, level, { transpose = false, complement = false } = {}){
  const n = Math.round(Math.sqrt(text.length)), white = new Array(n * n), solution = new Array(n * n);
  for (let i = 0; i < n * n; i++){
    const r = (i / n) | 0, c = i % n, ch = text[transpose ? c * n + r : i];
    white[i] = ch === '.' ? 0 : 1;
    solution[i] = ch === '.' ? 0 : complement ? 10 - Number(ch) : Number(ch);
  }
  return { level, n, white, runs: withSums(runsOf(n, white), solution), solution };
}

/**
 * Reto del nivel `target`: { level, n, white, runs: [{cells, sum, dir, clue}], solution }.
 * Cede a menudo (ver core/generator-worker.js). null si no lo consigue.
 */
export function* generate(target){
  if (target === 4 && BANK.length){
    yield;
    return decode(BANK[randInt(BANK.length)], 4, { transpose: Math.random() < .5, complement: Math.random() < .5 });
  }
  return yield* build(target);
}

/** Genera de verdad (el script del banco lo usa para el Experto). */
export function* build(target){
  const { n, black, logic: level, maxRun } = LEVEL_RULES[target];
  for (let attempt = 0; attempt < 400; attempt++){
    const white = pattern(n, black, maxRun);
    if (!white) continue;
    const runs = runsOf(n, white);
    let solution = fill(n, white, runs, .8);
    if (!solution) continue;
    let r = logic(n, white, withSums(runs, solution), level), left = unsolved(white, r.grid), best = left, since = 0;
    for (let step = 0; step < 20 * n && left > 0 && since < 40; step++){
      if (step % 8 === 0) yield;
      // un tramo con alguna casilla atascada: se vacía y se rellena de otra forma
      const stuck = runs.filter(run => run.cells.some(i => !r.grid?.[i]));
      const run = pick(stuck), base = solution.slice();
      for (const i of run.cells) base[i] = 0;
      const next = fill(n, white, runs, .8, base);
      if (!next) continue;
      const r2 = logic(n, white, withSums(runs, next), level), left2 = unsolved(white, r2.grid);
      if (left2 <= left){ solution = next; r = r2; left = left2; }
      // sin mejorar en un buen rato: otra forma
      if (left < best){ best = left; since = 0; } else since++;
    }
    yield;
    if (left > 0) continue;
    const sums = withSums(runs, solution);
    if (level > 1 && logic(n, white, sums, level - 1).solved) continue;
    return { level: target, n, white: Array.from(white), runs: sums, solution };
  }
  return null;
}
