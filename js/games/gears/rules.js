/* Gears rules on what the player places (0 nothing, 1 gear, 2 dot). No DOM. */
import { drive, touching, satisfies } from './engine/board.js';

/** Gears there are now: the fixed ones (crank, lock and the ones with an arrow) and the player's. */
export function gearsOf(p, marks){
  const g = marks.map(m => m === 1 ? 1 : 0);
  for (const i of [p.crank, p.lock, ...p.fixed]) g[i] = 1;
  return g;
}

/** State to draw: what is connected to the crank, whether it jams and how many gears each number touches. */
export function evaluate(p, marks){
  const g = gearsOf(p, marks), d = drive(p.w, p.h, g, p.crank);
  const counts = {};
  for (const k of Object.keys(p.clues)) counts[k] = touching(p.w, p.h, g, Number(k));
  return { gears: g, on: new Set(d.comp), spin: d.spin, jam: d.jam, counts };
}

export const isSolved = (p, marks) => satisfies(p, gearsOf(p, marks));

/** First mistake: a gear where it doesn't go, or a dot where one does go. −1 if there is none. */
export const findMistake = (p, marks) => marks.findIndex((m, i) => (m === 1 && !p.solution[i]) || (m === 2 && p.solution[i]));

/** Hint: a missing gear of the solution (the closest to what is already connected to the crank). */
export function findHint(p, marks){
  const { on } = evaluate(p, marks), missing = p.solution.map((v, i) => v && marks[i] !== 1 && i !== p.crank && i !== p.lock && !p.fixed.includes(i) ? i : -1).filter(i => i >= 0);
  if (!missing.length) return -1;
  const w = p.w, near = i => [...on].some(j => Math.abs(((j / w) | 0) - ((i / w) | 0)) <= 1 && Math.abs((j % w) - (i % w)) <= 1);
  return missing.find(near) ?? missing[0];
}
