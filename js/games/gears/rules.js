/* Reglas de Engranajes sobre lo que pone el jugador (0 nada, 1 engranaje, 2 punto). Sin DOM. */
import { drive, touching, satisfies } from './engine/board.js';

/** Engranajes que hay ahora: los fijos (manivela, cerrojo y los de flecha) y los del jugador. */
export function gearsOf(p, marks){
  const g = marks.map(m => m === 1 ? 1 : 0);
  for (const i of [p.crank, p.lock, ...p.fixed]) g[i] = 1;
  return g;
}

/** Estado para pintar: lo unido a la manivela, si se atasca y cuántos engranajes toca cada número. */
export function evaluate(p, marks){
  const g = gearsOf(p, marks), d = drive(p.w, p.h, g, p.crank);
  const counts = {};
  for (const k of Object.keys(p.clues)) counts[k] = touching(p.w, p.h, g, Number(k));
  return { gears: g, on: new Set(d.comp), spin: d.spin, jam: d.jam, counts };
}

export const isSolved = (p, marks) => satisfies(p, gearsOf(p, marks));

/** Primer error: un engranaje donde no va, o un punto donde sí va uno. −1 si no hay. */
export const findMistake = (p, marks) => marks.findIndex((m, i) => (m === 1 && !p.solution[i]) || (m === 2 && p.solution[i]));

/** Pista: un engranaje de la solución que falta (el más cercano a lo que ya está unido a la manivela). */
export function findHint(p, marks){
  const { on } = evaluate(p, marks), missing = p.solution.map((v, i) => v && marks[i] !== 1 && i !== p.crank && i !== p.lock && !p.fixed.includes(i) ? i : -1).filter(i => i >= 0);
  if (!missing.length) return -1;
  const w = p.w, near = i => [...on].some(j => Math.abs(((j / w) | 0) - ((i / w) | 0)) <= 1 && Math.abs((j % w) - (i % w)) <= 1);
  return missing.find(near) ?? missing[0];
}
