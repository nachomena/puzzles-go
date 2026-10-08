/* Reglas de Zip sobre el camino del jugador (lista de casillas desde el 1). Funciones puras. */
import { adjacent } from './engine/path.js';

/** Número (0 = el 1) de cada casilla, o -1. */
export const labels = (n, nums) => {
  const out = new Int16Array(n * n).fill(-1);
  nums.forEach((c, k) => { out[c] = k; });
  return out;
};

/** Cuántos números lleva ya el camino (el siguiente que toca es ese). */
export const reached = (path, label) => path.reduce((k, c) => k + (label[c] >= 0 ? 1 : 0), 0);

/** ¿Se puede alargar el camino a la casilla `c`? Vecina del final, libre y, si es un número, el que toca. */
export function canExtend(n, path, label, c){
  if (!path.length || path.includes(c) || !adjacent(n, path[path.length - 1], c)) return false;
  return label[c] < 0 || label[c] === reached(path, label);
}

/** Resuelto: pasa por todas las casillas y acaba en el último número. */
export const isSolved = (n, nums, path) => path.length === n * n && path[path.length - 1] === nums[nums.length - 1];

/** Primera casilla del camino que no coincide con la solución (es única), o -1. */
export const firstMistake = (path, solution) => path.findIndex((c, k) => c !== solution[k]);
