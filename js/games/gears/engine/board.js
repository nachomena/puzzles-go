/* Gears: geometry and rules of the panel. No DOM. A hexagonal panel of offset rows (odd ones half a cell
   to the right); cell i = row * W + column.
   The crank turns clockwise (direction 0); two touching gears turn opposite to each other.
   A solution: gears (1) that form a single piece with the crank and the lock, with no circles (each
   touching pair is a contact), with each number equal to the gears touching its slot and each fixed one
   (and the lock) turning the way its arrow says. */

const cache = new Map();

/** Neighbouring cells (up to 6) of each cell of a w × h panel. */
export function neighbours(w, h){
  const key = w * 100 + h;
  if (!cache.has(key)){
    const out = [];
    for (let r = 0; r < h; r++) for (let c = 0; c < w; c++){
      const odd = r & 1, cand = [[r, c - 1], [r, c + 1], [r - 1, c - 1 + odd], [r - 1, c + odd], [r + 1, c - 1 + odd], [r + 1, c + odd]];
      out.push(cand.filter(([a, b]) => a >= 0 && b >= 0 && a < h && b < w).map(([a, b]) => a * w + b));
    }
    cache.set(key, out);
  }
  return cache.get(key);
}

/**
 * What the crank moves: { comp (cells connected to it), spin (direction of each one, −1 if it doesn't
 * turn), jam (whether that part has a circle) }.
 */
export function drive(w, h, gears, crank){
  const nb = neighbours(w, h), spin = new Int8Array(w * h).fill(-1), comp = [crank];
  spin[crank] = 0;
  let jam = false;
  for (let k = 0; k < comp.length; k++){
    const i = comp[k];
    for (const j of nb[i]) if (gears[j]){
      if (spin[j] < 0){ spin[j] = spin[i] ^ 1; comp.push(j); }
      else if (spin[j] === spin[i]) jam = true;
    }
  }
  // also a circle of an even number of gears: extra contacts
  let edges = 0;
  for (const i of comp) for (const j of nb[i]) if (j > i && gears[j]) edges++;
  if (edges !== comp.length - 1) jam = true;
  return { comp, spin, jam };
}

/** How many gears touch cell i. */
export const touching = (w, h, gears, i) => neighbours(w, h)[i].reduce((t, j) => t + (gears[j] ? 1 : 0), 0);

/** Do these gears meet all the puzzle's rules? */
export function satisfies(p, gears){
  const { w, h, crank, lock } = p, { comp, spin, jam } = drive(w, h, gears, crank);
  if (jam || !comp.includes(lock)) return false;
  if (comp.length !== gears.reduce((t, g) => t + (g ? 1 : 0), 0)) return false;
  if ([lock, ...p.fixed].some(i => !gears[i] || spin[i] !== p.spin[i])) return false;
  return Object.entries(p.clues).every(([i, c]) => !gears[i] && touching(w, h, gears, Number(i)) === c);
}

/**
 * Counts solutions (up to `limit`), cell by cell, pruning with the numbers and the lack of circles.
 * If it goes over `budget` steps it counts as "more than one": one that hasn't been proven is never
 * taken as unique.
 */
export function countSolutions(p, limit = 2, budget = 300000){
  const { w, h, crank, lock, fixed, clues } = p, n = w * h, nb = neighbours(w, h);
  const state = new Int8Array(n).fill(-1);   // −1 undecided, 0 empty, 1 gear
  for (const i of [crank, lock, ...fixed]) state[i] = 1;
  for (const k of Object.keys(clues)) state[Number(k)] = 0;
  // union-find with undo, to spot circles when placing gears
  const parent = Int32Array.from({ length: n }, (_, i) => i), size = new Int32Array(n).fill(1), undo = [];
  const find = x => { while (parent[x] !== x) x = parent[x]; return x; };
  const unite = (a, b) => {
    a = find(a); b = find(b);
    if (a === b) return false;
    if (size[a] < size[b]) [a, b] = [b, a];
    parent[b] = a; size[a] += size[b]; undo.push(b);
    return true;
  };
  const rollback = to => { while (undo.length > to){ const b = undo.pop(); size[parent[b]] -= size[b]; parent[b] = b; } };
  const clueOk = i => {
    let g = 0, open = 0;
    for (const j of nb[i]){ if (state[j] === 1) g++; else if (state[j] < 0) open++; }
    return g <= clues[i] && g + open >= clues[i];
  };
  for (let i = 0; i < n; i++) if (state[i] === 1) for (const j of nb[i]) if (j < i && state[j] === 1 && !unite(i, j)) return 0;
  let count = 0, steps = 0;
  const go = i => {
    if (count >= limit) return;
    if (++steps > budget){ count = limit; return; }
    if (i === n){ if (satisfies(p, state.map(v => v === 1 ? 1 : 0))) count++; return; }
    if (state[i] >= 0){ go(i + 1); return; }
    for (const v of [0, 1]){
      state[i] = v;
      const mark = undo.length;
      let ok = nb[i].every(j => clues[j] === undefined || clueOk(j));
      if (ok && v === 1) for (const j of nb[i]) if (state[j] === 1 && !unite(i, j)){ ok = false; break; }
      if (ok) go(i + 1);
      rollback(mark);
      state[i] = -1;
    }
  };
  go(0);
  return count;
}
