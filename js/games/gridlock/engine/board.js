/* Gridlock: a 6 × 6 board with cars (2 cells) and trucks (3), which only move along their direction.
   The red car (0) has to get out through the exit on the right of its row. No DOM.

   A board is { cars: [{ len, dir, line }] } and a state, the position of each vehicle: `pos[i]` is the
   column (if horizontal, dir 'h') or the row (if vertical, 'v') of its first cell. The other
   coordinate, `line`, is fixed. A move slides a vehicle any distance: it counts as one. */

export const N = 6, EXIT_ROW = 2;

/** Cells (indices row * N + column) of a vehicle in a position. */
export function cellsOfCar(car, p){
  const out = [];
  for (let k = 0; k < car.len; k++) out.push(car.dir === 'h' ? car.line * N + p + k : (p + k) * N + car.line);
  return out;
}

/** Which vehicle covers each cell (-1 = free). */
export function occupancy(cars, pos, grid = new Int8Array(N * N)){
  grid.fill(-1);
  cars.forEach((car, i) => { for (const c of cellsOfCar(car, pos[i])) grid[c] = i; });
  return grid;
}

/** How far vehicle i can go: { min, max } of its position. */
export function range(cars, pos, i, grid = occupancy(cars, pos)){
  const car = cars[i], at = k => car.dir === 'h' ? car.line * N + k : k * N + car.line;
  let min = pos[i], max = pos[i];
  while (min > 0 && grid[at(min - 1)] < 0) min--;
  while (max + car.len < N && grid[at(max + car.len)] < 0) max++;
  return { min, max };
}

/** Solved: the red car touches the exit (it reaches the last column). */
export const isSolved = (cars, pos) => pos[0] + cars[0].len === N;

/**
 * State walk. Each state is stored as a number: the positions (0..4) in base 5.
 * `each(code, fn)` calls fn(code) for each state one move away.
 */
function walker(cars){
  const n = cars.length, pow = cars.map((_, i) => 5 ** i), cur = new Array(n), grid = new Int8Array(N * N);
  // per vehicle: the cells of its line (in order) and the ones it covers in each position
  const line = cars.map(car => Array.from({ length: N }, (_, k) => car.dir === 'h' ? car.line * N + k : k * N + car.line));
  const cells = cars.map((car, i) => Array.from({ length: N - car.len + 1 }, (_, p) => line[i].slice(p, p + car.len)));
  const len = cars.map(c => c.len);
  const encode = pos => pos.reduce((k, p, i) => k + p * pow[i], 0);
  const decode = code => { for (let i = 0; i < n; i++) cur[i] = Math.floor(code / pow[i]) % 5; return cur; };
  const each = (code, fn) => {
    decode(code);
    grid.fill(-1);
    for (let i = 0; i < n; i++){ const cs = cells[i][cur[i]]; for (let k = 0; k < cs.length; k++) grid[cs[k]] = i; }
    for (let i = 0; i < n; i++){
      const L = line[i], at = cur[i];
      let min = at, max = at;
      while (min > 0 && grid[L[min - 1]] < 0) min--;
      while (max + len[i] < N && grid[L[max + len[i]]] < 0) max++;
      for (let p = min; p <= max; p++) if (p !== at) fn(code + (p - at) * pow[i], i, p);
    }
  };
  const solved = code => (code % 5) + len[0] === N;
  return { encode, decode, each, solved };
}

/**
 * Shortest solution from `pos` (breadth-first search): [{ car, to }] or null if it has none.
 * `limit`: maximum number of states to visit.
 */
export function solve(cars, pos, limit = 300000){
  if (isSolved(cars, pos)) return [];
  const w = walker(cars), start = w.encode(pos), prev = new Map([[start, null]]);
  let frontier = [start];
  while (frontier.length && prev.size < limit){
    const next = [];
    for (const code of frontier){
      let goal = -1;
      w.each(code, (t, car, to) => {
        if (goal >= 0 || prev.has(t)) return;
        prev.set(t, { from: code, car, to });
        if (w.solved(t)) goal = t; else next.push(t);
      });
      if (goal >= 0){
        const path = [];
        for (let s = goal; prev.get(s); s = prev.get(s).from) path.unshift({ car: prev.get(s).car, to: prev.get(s).to });
        return path;
      }
    }
    frontier = next;
  }
  return null;
}

/**
 * The states reachable from `pos` (moves can be undone) and the distance of each to the nearest
 * solution. Returns { max, size, pick(d) } — max: the largest distance (-1 if it can't be solved);
 * pick(d): positions of a random state at distance d — or null if the group of states goes over `limit`.
 */
export function distances(cars, pos, limit = 30000){
  const w = walker(cars), codes = [w.encode(pos)], index = new Map([[codes[0], 0]]);
  for (let q = 0; q < codes.length; q++){
    let over = false;
    w.each(codes[q], t => {
      if (over || index.has(t)) return;
      if (codes.length >= limit){ over = true; return; }
      index.set(t, codes.length); codes.push(t);
    });
    if (over) return null;
  }
  // from all the solved states backwards
  const dist = new Float64Array(codes.length).fill(Infinity);
  let frontier = [], max = -1;
  codes.forEach((c, k) => { if (w.solved(c)){ dist[k] = 0; frontier.push(c); max = 0; } });
  for (let d = 1; frontier.length; d++){
    const next = [];
    for (const c of frontier) w.each(c, t => { const k = index.get(t); if (dist[k] === Infinity){ dist[k] = d; next.push(t); } });
    if (next.length) max = d;
    frontier = next;
  }
  return {
    max, size: codes.length,
    pick(d){
      const ks = [];
      dist.forEach((v, k) => { if (v === d) ks.push(k); });
      return ks.length ? w.decode(codes[ks[(Math.random() * ks.length) | 0]]).slice() : null;
    }
  };
}
