/* Generador de Engranajes: un árbol de engranajes al azar desde la manivela (a la izquierda) hasta el
   cerrojo (a la derecha); se ponen todas las pistas (todos los engranajes fijos y todos los números) y se
   quitan, primero engranajes y luego números, mientras siga habiendo una sola solución.
   Los retos salen de un banco ya calculado (bank-data.js, scripts/build-gears-bank.mjs): así empiezan al
   momento y su solución única está demostrada sin límite de pasos. Cada uno sale en 2 versiones. */
import { neighbours, drive, countSolutions } from './board.js';
import { shuffle, randInt } from '../../../lib/random.js';
import BANK from './bank-data.js';

/** Por nivel: lado, engranajes fijos (con flecha) que se dejan y parte de los huecos con número que se deja. */
export const LEVEL_RULES = Object.freeze({
  1: { w: 5, h: 5, keepFixed: 2, keepClues: .35 },
  2: { w: 6, h: 6, keepFixed: 1, keepClues: .2 },
  3: { w: 7, h: 7, keepFixed: 0, keepClues: .1 },
  4: { w: 8, h: 8, keepFixed: 0, keepClues: 0 }
});

/** Árbol al azar desde la manivela: cada engranaje nuevo toca exactamente a uno de los que ya hay. */
function randomTree(w, h, crank, lock, target){
  const nb = neighbours(w, h), gears = new Uint8Array(w * h);
  gears[crank] = 1;
  let count = 1;
  const touching = i => nb[i].reduce((t, j) => t + gears[j], 0);
  for (let guard = 0; guard < 4000 && (count < target || !gears[lock]); guard++){
    const front = [];
    for (let i = 0; i < w * h; i++) if (!gears[i] && touching(i) === 1) front.push(i);
    if (!front.length) return null;
    // cuando ya hay la mitad, si se puede llegar al cerrojo, se llega
    const i = front.includes(lock) && count >= target / 2 ? lock : front[randInt(front.length)];
    gears[i] = 1; count++;
    if (count > target * 1.6) return null;
  }
  return gears[lock] ? gears : null;
}

/** Pasos del solucionador en el teléfono (si no se generan en el banco); el script usa muchos más. */
const PHONE_BUDGET = 300000;

/**
 * Reto en texto, fila a fila: "C" manivela, "L" cerrojo, "F" engranaje fijo, "g" engranaje que pone el
 * jugador, "." hueco vacío y una cifra para un hueco con número.
 */
export function encode(p){
  let s = '';
  for (let i = 0; i < p.w * p.h; i++){
    s += i === p.crank ? 'C' : i === p.lock ? 'L' : p.fixed.includes(i) ? 'F' : p.solution[i] ? 'g' : p.clues[i] !== undefined ? String(p.clues[i]) : '.';
  }
  return s;
}

/**
 * Reto a partir de su texto. `turn` da la otra versión: con un número impar de filas, el panel al revés de
 * arriba abajo; con un número par, girado media vuelta y con la manivela y el cerrojo cambiados (la cadena
 * es la misma, así que la solución sigue siendo única).
 */
export function decode(text, level, { turn = false } = {}){
  const { w, h } = LEVEL_RULES[level], n = w * h, odd = h & 1;
  const at = i => {
    if (!turn) return text[i];
    const r = (i / w) | 0, c = i % w, ch = odd ? text[(h - 1 - r) * w + c] : text[(h - 1 - r) * w + w - 1 - c];
    return odd ? ch : ch === 'C' ? 'L' : ch === 'L' ? 'C' : ch;
  };
  const p = { level, w, h, crank: -1, lock: -1, fixed: [], clues: {}, spin: null, solution: new Array(n).fill(0) };
  for (let i = 0; i < n; i++){
    const ch = at(i);
    if (ch === 'C') p.crank = i;
    else if (ch === 'L') p.lock = i;
    else if (ch === 'F') p.fixed.push(i);
    else if (ch >= '0' && ch <= '6') p.clues[i] = Number(ch);
    if ('CLFg'.includes(ch)) p.solution[i] = 1;
  }
  p.spin = Array.from(drive(w, h, p.solution, p.crank).spin);
  return p;
}

/**
 * Reto del nivel `target`: { level, w, h, crank, lock, fixed: [i…], clues: { i: n }, spin: [sentido de cada
 * casilla en la solución], solution: [1 = engranaje] }. Cede a menudo (ver core/generator-worker.js).
 */
export function* generate(target){
  const bank = BANK[target];
  if (bank?.length){
    yield;
    return decode(bank[randInt(bank.length)], target, { turn: Math.random() < .5 });
  }
  return yield* build(target);
}

/** Genera de verdad (el script del banco lo usa con `budget` alto). */
export function* build(target, budget = PHONE_BUDGET){
  const { w, h, keepFixed, keepClues } = LEVEL_RULES[target], n = w * h;
  for (let attempt = 0; attempt < 200; attempt++){
    const crank = randInt(h) * w, lock = randInt(h) * w + w - 1;
    const sol = randomTree(w, h, crank, lock, Math.round(n * .42));
    yield;
    if (!sol) continue;
    const { spin, jam, comp } = drive(w, h, sol, crank);
    if (jam || comp.length !== sol.reduce((t, v) => t + v, 0)) continue;
    const nb = neighbours(w, h);
    const p = { level: target, w, h, crank, lock, fixed: [], clues: {}, spin: Array.from(spin), solution: Array.from(sol) };
    for (let i = 0; i < n; i++){
      if (i === crank || i === lock) continue;
      if (sol[i]) p.fixed.push(i); else p.clues[i] = nb[i].reduce((t, j) => t + sol[j], 0);
    }
    for (const i of shuffle(p.fixed.slice())){
      if (p.fixed.length <= keepFixed) break;
      p.fixed = p.fixed.filter(j => j !== i);
      if (countSolutions(p, 2, budget) !== 1) p.fixed.push(i);
      yield;
    }
    const minClues = Math.round((n - comp.length) * keepClues);
    for (const k of shuffle(Object.keys(p.clues))){
      if (Object.keys(p.clues).length <= minClues) break;
      const c = p.clues[k];
      delete p.clues[k];
      if (countSolutions(p, 2, budget) !== 1) p.clues[k] = c;
      yield;
    }
    p.fixed.sort((a, b) => a - b);
    return p;
  }
  return null;
}
