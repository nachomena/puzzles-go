/* Reglas de Akari sobre lo que pone el jugador: marks[i] = 0 nada, 1 bombilla, 2 marca de "aquí no".
   Funciones puras, sin DOM. */
import { isBlack, around, sights, lit } from './engine/light.js';

const bulbsOf = marks => marks.map(m => m === 1 ? 1 : 0);

/** Luz, bombillas que se ven entre sí y números con más bombillas de la cuenta. */
export function evaluate(n, cells, marks, see = sights(n, cells)){
  const bulbs = bulbsOf(marks), light = lit(n, cells, bulbs, see);
  const clash = new Uint8Array(n * n), over = new Uint8Array(n * n);
  bulbs.forEach((b, i) => { if (b && see[i].some(j => bulbs[j])) clash[i] = 1; });
  cells.forEach((v, i) => { if (v >= 0 && v <= 4 && around(n, i).filter(j => bulbs[j]).length > v) over[i] = 1; });
  return { light, clash, over };
}

/** Resuelto: todo iluminado, sin choques y cada número con sus bombillas exactas. */
export function isSolved(n, cells, marks){
  const bulbs = bulbsOf(marks), { light, clash } = evaluate(n, cells, marks);
  return cells.every((v, i) => isBlack(v) || light[i]) && !clash.some(Boolean) &&
    cells.every((v, i) => !(v >= 0 && v <= 4) || around(n, i).filter(j => bulbs[j]).length === v);
}

/** Primera casilla que contradice la solución (es única): bombilla de más o marca donde va una. */
export const findMistake = (marks, solution) => marks.findIndex((m, i) => (m === 1 && !solution[i]) || (m === 2 && solution[i]));

/** Una bombilla de la solución que falta, o -1. */
export const findHint = (marks, solution) => solution.findIndex((b, i) => b && marks[i] !== 1);
