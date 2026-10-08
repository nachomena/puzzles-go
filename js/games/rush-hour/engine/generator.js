/* Generador de Rush Hour. De todos los estados a los que se llega desde una colocación de vehículos
   se elige uno que necesite tantos movimientos como pide el nivel. Para los niveles difíciles se va
   mejorando la colocación poco a poco (añadir, quitar o mover un vehículo) mientras no empeore. */
import { N, EXIT_ROW, occupancy, cellsOfCar, distances, solve } from './board.js';
import { BANK } from './bank-data.js';
import { randInt } from '../../../lib/random.js';

/** Movimientos mínimos por nivel [desde, hasta]. */
export const LEVEL_RULES = Object.freeze({
  1: { moves: [4, 7] },
  2: { moves: [8, 13] },
  3: { moves: [14, 20] },
  4: { moves: [21, 29] },
  5: { moves: [30, 60] }
});

/** Un vehículo al azar que quepa en la colocación (o null). */
function randomCar(cars, pos){
  const grid = occupancy(cars, pos);
  for (let tries = 0; tries < 60; tries++){
    const len = Math.random() < .25 ? 3 : 2, dir = Math.random() < .5 ? 'h' : 'v', line = randInt(N);
    // nada horizontal en la fila de salida: se apartaría del rojo sin más
    if (dir === 'h' && line === EXIT_ROW) continue;
    const car = { len, dir, line }, p = randInt(N - len + 1);
    if (cellsOfCar(car, p).every(c => grid[c] < 0)) return { car, p };
  }
  return null;
}

function randomBoard(){
  const cars = [{ len: 2, dir: 'h', line: EXIT_ROW }], pos = [randInt(3)];
  for (let k = 8 + randInt(4); k > 0; k--){
    const r = randomCar(cars, pos);
    if (r){ cars.push(r.car); pos.push(r.p); }
  }
  return { cars, pos };
}

/** Un cambio pequeño: añadir, quitar o mover un vehículo (nunca el rojo). */
function mutate({ cars, pos }){
  const c = cars.slice(), p = pos.slice(), roll = Math.random();
  if (roll < .35 && c.length < 15){
    const r = randomCar(c, p);
    if (r){ c.push(r.car); p.push(r.p); }
  } else if (roll < .6 && c.length > 6){
    const i = 1 + randInt(c.length - 1);
    c.splice(i, 1); p.splice(i, 1);
  } else if (c.length > 1){
    const i = 1 + randInt(c.length - 1), car = c.splice(i, 1)[0], keep = p.splice(i, 1)[0];
    const r = randomCar(c, p);
    if (r){ c.push(r.car); p.push(r.p); } else { c.push(car); p.push(keep); }
  }
  return { cars: c, pos: p };
}

/** Un vehículo en texto ("2h20" = largo 2, horizontal, fila 2, columna 0) → { car, p }. */
const decodeCar = s => ({ car: { len: Number(s[0]), dir: s[1], line: Number(s[2]) }, p: Number(s[3]) });

/** Reto ya calculado (bank-data.js), con los vehículos en otro orden para que cambien los colores. */
export function fromBank(target){
  const list = BANK[target], s = list[randInt(list.length)];
  const all = s.match(/.{4}/g).map(decodeCar), red = all.shift();
  for (let i = all.length - 1; i > 0; i--){ const j = randInt(i + 1); [all[i], all[j]] = [all[j], all[i]]; }
  const cars = [red.car, ...all.map(a => a.car)], pos = [red.p, ...all.map(a => a.p)];
  return { level: target, cars, pos, min: solve(cars, pos).length };
}

/**
 * Reto del nivel `target`: { level, cars, pos, min } (min = movimientos mínimos).
 * Cede a menudo para no bloquear (ver core/generator-worker.js).
 */
export function* generate(target){
  if (BANK[target]?.length){ yield; return fromBank(target); }
  return yield* generateLive(target);
}

/** Lo mismo pero calculándolo en el momento (lo usa también scripts/build-rush-hour-bank.mjs). */
export function* generateLive(target){
  const [lo, hi] = LEVEL_RULES[target].moves;
  let best = null, bestMax = -1;
  for (let step = 0; step < 4000; step++){
    // cada tanto se empieza de cero, por si se atasca
    const fresh = !best || step % 120 === 0, cand = fresh ? randomBoard() : mutate(best);
    const d = distances(cand.cars, cand.pos);
    yield;
    if (!d || d.max < 0) continue;
    if (d.max >= lo){
      const want = Math.min(d.max, hi);
      return { level: target, cars: cand.cars, pos: d.pick(want), min: want };
    }
    if (fresh || d.max >= bestMax){ best = cand; bestMax = d.max; }
  }
  return null;
}
