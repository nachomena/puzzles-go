/* Generador de Sudokus con dificultad garantizada por el solucionador lógico.
   Se parte de un tablero completo al azar y se "excava": se quitan pistas mientras el
   tablero siga resolviéndose con las técnicas permitidas (resolver por lógica ya implica
   solución única). La lógica es monótona: quitar pistas nunca lo hace más fácil. */
import { CELLS } from './grid.js';
import { randomSolution } from './exact-solver.js';
import { logic } from './logic-solver.js';
import { shuffle } from '../../../lib/random.js';

/** Parejas de casillas simétricas respecto al centro (giro de 180°) y casillas sueltas. */
const PAIRS = [], SINGLES = [];
for (let i = 0; i < CELLS; i++){
  SINGLES.push([i]);
  if (i <= CELLS - 1 - i) PAIRS.push(i === CELLS - 1 - i ? [i] : [i, CELLS - 1 - i]);
}

/**
 * Quita grupos de pistas mientras el tablero se resuelva con técnicas de `level`
 * sin bajar de `minClues`. Muta `puzzle`; devuelve cuántos grupos quitó.
 */
function* dig(puzzle, solution, groups, level, minClues = 0){
  let clues = puzzle.filter(Boolean).length, removed = 0;
  for (const g of shuffle(groups.slice())){
    if (!puzzle[g[0]] || clues - g.length < minClues) continue;
    g.forEach(i => puzzle[i] = 0);
    if (logic(puzzle, level).solved){ clues -= g.length; removed++; }
    else g.forEach(i => puzzle[i] = solution[i]);
    yield 1;
  }
  return removed;
}

/**
 * Estrategia de cada nivel: recibe un tablero completo, lo excava y devuelve true si el
 * resultado es del nivel pedido.
 */
const STRATEGIES = {
  // Fácil: solo singles y bastantes pistas.
  1: function* (p, sol){
    yield* dig(p, sol, PAIRS, 1, 34);
    return true;
  },
  // Medio: primero mínimo para singles (casilla a casilla); toda pista que se quite después
  // exige técnicas de nivel 2.
  2: function* (p, sol){
    yield* dig(p, sol, PAIRS, 1);
    yield* dig(p, sol, SINGLES, 1);
    return (yield* dig(p, sol, SINGLES, 2)) > 0;
  },
  // Difícil: se excava permitiendo X-Wing y Swordfish; vale si las técnicas de nivel 2 no bastan.
  3: function* (p, sol){
    yield* dig(p, sol, PAIRS, 3);
    return !logic(p, 2).solved;
  }
};
const ATTEMPTS = { 1: 5, 2: 100, 3: 2000 };

/**
 * Genera un Sudoku del nivel objetivo (1 fácil, 2 medio, 3 difícil).
 * Cede (yield) a menudo para poder repartir el trabajo. Devuelve
 * { level, givens, solution } o null si no lo consigue.
 */
export function* generate(target){
  const strategy = STRATEGIES[target];
  for (let attempt = 0; attempt < ATTEMPTS[target]; attempt++){
    const solution = randomSolution(); yield 0;
    const givens = solution.slice();
    // La estrategia propone; el calificador confirma que el nivel inferior no basta.
    if ((yield* strategy(givens, solution)) && (target === 1 || !logic(givens, target - 1).solved)){
      return { level: target, givens, solution };
    }
  }
  return null;
}
