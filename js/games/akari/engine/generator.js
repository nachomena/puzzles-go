/* Generador de Akari: casillas negras al azar (simétricas, como en los retos de verdad), unas
   bombillas que lo iluminan todo, todos los números y luego se quitan números mientras la solución
   siga siendo única. */
import { WHITE, BLACK, isBlack, around, sights, countSolutions } from './light.js';
import { shuffle, randInt } from '../../../lib/random.js';

/** Por nivel: lado, proporción de negras y qué parte de los números se quita como mucho. */
export const LEVEL_RULES = Object.freeze({
  1: { n: 7, black: .22, remove: .25 },
  2: { n: 7, black: .2, remove: .6 },
  3: { n: 8, black: .2, remove: 1 },
  4: { n: 10, black: .2, remove: .7 },
  5: { n: 10, black: .18, remove: 1 }
});

function board(n, ratio){
  const cells = new Array(n * n).fill(WHITE);
  const want = Math.round(n * n * ratio);
  for (let k = 0; k < want * 3 && cells.filter(isBlack).length < want; k++){
    const i = randInt(n * n), j = n * n - 1 - i;   // simetría de giro de 180°
    cells[i] = BLACK; cells[j] = BLACK;
  }
  return cells;
}

/** Bombillas que lo iluminan todo: en casillas sin luz, en orden al azar. */
function bulbsFor(n, cells){
  const see = sights(n, cells), bulbs = new Array(n * n).fill(0), on = new Uint8Array(n * n);
  for (const i of shuffle([...Array(n * n).keys()])){
    if (isBlack(cells[i]) || on[i]) continue;
    bulbs[i] = 1; on[i] = 1;
    for (const j of see[i]) on[j] = 1;
  }
  return bulbs;
}

/**
 * Reto del nivel `target`: { level, n, cells, solution: bombillas (1/0 por casilla) }.
 * Cede a menudo para no bloquear (ver core/generator-worker.js).
 */
export function* generate(target){
  const { n, black, remove } = LEVEL_RULES[target];
  for (let attempt = 0; attempt < 500; attempt++){
    const base = board(n, black), solution = bulbsFor(n, base);
    // todas las negras con su número
    const cells = base.map((v, i) => isBlack(v) ? around(n, i).filter(j => solution[j]).length : WHITE);
    yield;
    if (countSolutions(n, cells) !== 1) continue;
    const blacks = shuffle(cells.map((v, i) => isBlack(v) ? i : -1).filter(i => i >= 0));
    let removed = 0;
    for (const b of blacks){
      if (removed >= Math.round(blacks.length * remove)) break;
      const keep = cells[b];
      cells[b] = BLACK;
      if (countSolutions(n, cells) !== 1) cells[b] = keep; else removed++;
      yield;
    }
    return { level: target, n, cells, solution };
  }
  return null;
}
