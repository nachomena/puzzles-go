/* Bridges rules on the player's bridges (`val[k]` = 0, 1 or 2 on span k). Pure functions. */
import { connected } from './engine/graph.js';

/** Bridges of each island. */
export const counts = (islands, edges, val) => {
  const out = islands.map(() => 0);
  edges.forEach((e, k) => { out[e.a] += val[k]; out[e.b] += val[k]; });
  return out;
};

/** Can a bridge be placed on span k? (not if it crosses one that already has bridges) */
export const blockedBy = (edges, val, k) => edges[k].cross.find(j => val[j] > 0) ?? -1;

/** Solved: every island with its number of bridges and all of them connected. */
export function isSolved(islands, edges, val){
  const c = counts(islands, edges, val);
  return islands.every((s, i) => c[i] === s.n) && connected(islands, edges, val);
}

/** Span with more bridges than in the solution (it is unique), or -1. */
export const findMistake = (val, solution) => val.findIndex((v, k) => v > solution[k]);

/** Span missing bridges compared with the solution, or -1. */
export const findHint = (val, solution) => val.findIndex((v, k) => v < solution[k]);

