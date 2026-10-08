/* Reglas de Hashi sobre los puentes del jugador (`val[k]` = 0, 1 o 2 en el tramo k). Funciones puras. */
import { connected } from './engine/graph.js';

/** Puentes de cada isla. */
export const counts = (islands, edges, val) => {
  const out = islands.map(() => 0);
  edges.forEach((e, k) => { out[e.a] += val[k]; out[e.b] += val[k]; });
  return out;
};

/** ¿Se puede poner algún puente en el tramo k? (no si cruza uno que ya tiene puentes) */
export const blockedBy = (edges, val, k) => edges[k].cross.find(j => val[j] > 0) ?? -1;

/** Resuelto: cada isla con su número de puentes y todas unidas. */
export function isSolved(islands, edges, val){
  const c = counts(islands, edges, val);
  return islands.every((s, i) => c[i] === s.n) && connected(islands, edges, val);
}

/** Tramo con más puentes que en la solución (es única), o -1. */
export const findMistake = (val, solution) => val.findIndex((v, k) => v > solution[k]);

/** Tramo al que le faltan puentes respecto a la solución, o -1. */
export const findHint = (val, solution) => val.findIndex((v, k) => v < solution[k]);

