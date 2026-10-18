/* Reglas de Binario sobre lo que pone el jugador: g[i] = 0 vacía, 1 rojo, 2 azul (con las casillas
   dadas incluidas). Funciones puras, sin DOM. */
import { lines, nextDeduction, lookahead } from './engine/grid.js';
import { t } from '../../i18n/index.js';

/** Casillas que rompen una regla: tres iguales seguidos, más de la mitad de un color, líneas iguales. */
export function evaluate(n, g){
  const bad = new Uint8Array(n * n), { rows, cols, all } = lines(n), half = n / 2;
  for (const line of all){
    for (let k = 0; k + 2 < n; k++){
      const v = g[line[k]];
      if (v && v === g[line[k + 1]] && v === g[line[k + 2]]) bad[line[k]] = bad[line[k + 1]] = bad[line[k + 2]] = 1;
    }
    for (const v of [1, 2]) if (line.filter(i => g[i] === v).length > half) for (const i of line) if (g[i] === v) bad[i] = 1;
  }
  for (const group of [rows, cols]){
    for (let x = 0; x < n; x++) for (let y = x + 1; y < n; y++){
      const a = group[x], b = group[y];
      if (a.every((i, k) => g[i] && g[i] === g[b[k]])) for (const i of [...a, ...b]) bad[i] = 1;
    }
  }
  return bad;
}

/** Resuelto: todo lleno sin romper ninguna regla. */
export const isSolved = (n, g) => g.every(Boolean) && !evaluate(n, g).some(Boolean);

/** Primera casilla con un color que no es el de la solución (es única), o -1. */
export const findMistake = (g, solution) => g.findIndex((v, i) => v && v !== solution[i]);

/** Por qué va así, para la pista. */
export const HINT_WHY = Object.freeze({
  trio: t('games.binario.why.trio'),
  half: t('games.binario.why.half'),
  unique: t('games.binario.why.unique'),
  look: t('games.binario.why.look'),
  none: t('games.binario.why.none')
});

/**
 * Pista: una casilla que se deduce del tablero (sin errores): { i, v, why } con why una clave de
 * HINT_WHY. Si no hay deducción a la vista, una casilla vacía de la solución. null si está lleno.
 */
export function findHint(n, g, solution){
  const d = nextDeduction(n, g);
  if (d && !d.bad) return d;
  const look = lookahead(n, g);
  if (look) return { ...look, why: 'look' };
  const i = g.indexOf(0);
  return i < 0 ? null : { i, v: solution[i], why: 'none' };
}
