/* Generador de KenKen: cuadrado latino al azar, jaulas al azar con una operación cada una, y se
   queda si tiene una sola solución. */
import { latin, partition, evaluate, countSolutions } from './cages.js';
import { randInt } from '../../../lib/random.js';

/** Por nivel: lado, tamaños de jaula posibles y operaciones. */
export const LEVEL_RULES = Object.freeze({
  1: { n: 4, sizes: [1, 2, 2, 2, 3], ops: ['+', '-'] },
  2: { n: 5, sizes: [1, 2, 2, 3, 3], ops: ['+', '-', '*'] },
  3: { n: 6, sizes: [1, 2, 2, 3, 3, 4], ops: ['+', '-', '*', '/'] },
  4: { n: 6, sizes: [2, 2, 3, 3, 4], ops: ['+', '-', '*', '/'] },
  5: { n: 7, sizes: [2, 2, 3, 3, 4], ops: ['+', '-', '*', '/'] }
});

/** Operación al azar que valga para esos números. */
function opFor(vals, ops){
  if (vals.length === 1) return '';
  const ok = ops.filter(op => evaluate(op, vals) !== null && !(op === '-' && evaluate(op, vals) === 0));
  return ok[randInt(ok.length)] ?? '+';
}

/**
 * Reto del nivel `target`: { level, n, cages: [{cells, op, target}], solution }.
 * Cede a menudo para no bloquear (ver core/generator-worker.js).
 */
export function* generate(target){
  const { n, sizes, ops } = LEVEL_RULES[target];
  for (let attempt = 0; attempt < 3000; attempt++){
    const solution = latin(n), { cages: parts } = partition(n, sizes);
    // con jaulas de más de una casilla, una suelta solo si el nivel las permite
    if (!sizes.includes(1) && parts.some(c => c.length === 1)) continue;
    const cages = parts.map(cells => {
      const vals = cells.map(i => solution[i]), op = opFor(vals, ops);
      return { cells: cells.slice().sort((a, b) => a - b), op, target: evaluate(op, vals) };
    });
    yield;
    if (countSolutions(n, cages) !== 1) continue;
    return { level: target, n, cages, solution };
  }
  return null;
}
