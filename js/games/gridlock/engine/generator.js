/* Gridlock generator. From all the states reachable from a placement of vehicles, it picks one that
   needs as many moves as the level asks for. For the hard levels the placement is improved little by
   little (adding, removing or moving a vehicle) as long as it doesn't get worse. */
import { N, EXIT_ROW, occupancy, cellsOfCar, distances, solve } from './board.js';
import { BANK } from './bank-data.js';
import { randInt } from '../../../lib/random.js';

/** Minimum moves per level [from, to]. */
export const LEVEL_RULES = Object.freeze({
  1: { moves: [4, 7] },
  2: { moves: [8, 13] },
  3: { moves: [14, 20] },
  4: { moves: [21, 29] },
  5: { moves: [30, 60] }
});

/** A random vehicle that fits in the placement (or null). */
function randomCar(cars, pos){
  const grid = occupancy(cars, pos);
  for (let tries = 0; tries < 60; tries++){
    const len = Math.random() < .25 ? 3 : 2, dir = Math.random() < .5 ? 'h' : 'v', line = randInt(N);
    // nothing horizontal on the exit row: it would simply move out of the red one's way
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

/** A small change: add, remove or move a vehicle (never the red one). */
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

/** A vehicle as text ("2h20" = length 2, horizontal, row 2, column 0) → { car, p }. */
const decodeCar = s => ({ car: { len: Number(s[0]), dir: s[1], line: Number(s[2]) }, p: Number(s[3]) });

/** Precomputed puzzle (bank-data.js), with the vehicles in another order so the colours change. */
export function fromBank(target){
  const list = BANK[target], s = list[randInt(list.length)];
  const all = s.match(/.{4}/g).map(decodeCar), red = all.shift();
  for (let i = all.length - 1; i > 0; i--){ const j = randInt(i + 1); [all[i], all[j]] = [all[j], all[i]]; }
  const cars = [red.car, ...all.map(a => a.car)], pos = [red.p, ...all.map(a => a.p)];
  return { level: target, cars, pos, min: solve(cars, pos).length };
}

/**
 * Puzzle of level `target`: { level, cars, pos, min } (min = minimum moves).
 * Yields often so it doesn't block (see core/generator-worker.js).
 */
export function* generate(target){
  if (BANK[target]?.length){ yield; return fromBank(target); }
  return yield* generateLive(target);
}

/** The same but computed on the spot (also used by scripts/build-gridlock-bank.mjs). */
export function* generateLive(target){
  const [lo, hi] = LEVEL_RULES[target].moves;
  let best = null, bestMax = -1;
  for (let step = 0; step < 4000; step++){
    // every so often it starts from scratch, in case it gets stuck
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
