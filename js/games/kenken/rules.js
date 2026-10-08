/* Reglas de KenKen sobre lo que escribe el jugador. Funciones puras, sin DOM. */
import { evaluate } from './engine/cages.js';

/** Casillas que comparten fila o columna con i. */
export const peers = (n, i) => {
  const r = (i / n) | 0, c = i % n, out = [];
  for (let k = 0; k < n; k++){ if (k !== c) out.push(r * n + k); if (k !== r) out.push(k * n + c); }
  return out;
};

/** Casillas con un número repetido en su fila o columna, o en una jaula llena que no da su resultado. */
export function conflicts(n, cages, values){
  const bad = new Uint8Array(n * n);
  for (let i = 0; i < n * n; i++) if (values[i] && peers(n, i).some(j => values[j] === values[i])) bad[i] = 1;
  for (const { cells, op, target } of cages){
    const vals = cells.map(i => values[i]);
    if (vals.every(Boolean) && evaluate(op, vals) !== target) for (const i of cells) bad[i] = 1;
  }
  return bad;
}

/** Texto de la jaula: "12×", "3−", "5" (las de una casilla, solo el número). */
export const cageLabel = ({ op, target }) => `${target}${{ '+': '+', '-': '−', '*': '×', '/': '÷', '': '' }[op]}`;

/** Pista: una casilla vacía de la jaula con menos casillas por rellenar. */
export function findHint(n, cages, values, solution){
  let best = null;
  for (const { cells } of cages){
    const empty = cells.filter(i => !values[i]);
    if (empty.length && (!best || empty.length < best.length)) best = empty;
  }
  return best ? { cell: best[0], digit: solution[best[0]] } : null;
}
