/* Bridges generator: a group of islands joined by bridges is grown (each new island comes out of an
   existing one, in a straight line and without crossing any bridge) and sometimes one more bridge is
   added between two islands that see each other. Each island's number is its bridge count. It is kept
   if it has a single solution. */
import { solve } from './graph.js';
import { randInt } from '../../../lib/random.js';

/** Per level: board size and how many islands. */
export const LEVEL_RULES = Object.freeze({
  1: { w: 6, h: 6, islands: [8, 11] },
  2: { w: 7, h: 7, islands: [12, 15] },
  3: { w: 8, h: 8, islands: [15, 19] },
  4: { w: 9, h: 9, islands: [19, 24] },
  5: { w: 10, h: 10, islands: [24, 30] }
});

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function grow(w, h, target){
  const grid = new Int16Array(w * h).fill(-1);   // -1 free, -2 bridge, ≥0 island
  const islands = [], bridges = [];               // bridges: { a, b, n }
  const add = (x, y) => { grid[y * w + x] = islands.length; islands.push({ x, y }); return islands.length - 1; };
  add(randInt(w), randInt(h));
  for (let tries = 0; islands.length < target && tries < 4000; tries++){
    const a = randInt(islands.length), { x, y } = islands[a], [dx, dy] = DIRS[randInt(4)];
    const len = 2 + randInt(Math.max(w, h) - 2);
    const tx = x + dx * len, ty = y + dy * len;
    if (tx < 0 || ty < 0 || tx >= w || ty >= h || grid[ty * w + tx] !== -1) continue;
    let ok = true;
    for (let k = 1; k < len; k++) if (grid[(y + dy * k) * w + x + dx * k] !== -1){ ok = false; break; }
    // the new island must not end up right next to another (they read badly)
    for (const [ex, ey] of DIRS){ const nx = tx + ex, ny = ty + ey; if (nx >= 0 && ny >= 0 && nx < w && ny < h && grid[ny * w + nx] >= 0 && !(nx === x + dx * (len - 1) && ny === y + dy * (len - 1))) ok = false; }
    if (!ok) continue;
    for (let k = 1; k < len; k++) grid[(y + dy * k) * w + x + dx * k] = -2;
    const b = add(tx, ty);
    bridges.push({ a, b, n: 1 + randInt(2) });
  }
  // some extra bridges between islands that see each other (they make cycles, as in real puzzles)
  for (let i = 0; i < islands.length; i++) for (const [dx, dy] of [[1, 0], [0, 1]]){
    if (Math.random() > .3) continue;
    const { x, y } = islands[i];
    for (let k = 1; ; k++){
      const nx = x + dx * k, ny = y + dy * k;
      if (nx >= w || ny >= h) break;
      const v = grid[ny * w + nx];
      if (v === -2) break;
      if (v >= 0){
        if (k > 1 && !bridges.some(e => (e.a === i && e.b === v) || (e.a === v && e.b === i))){
          for (let j = 1; j < k; j++) grid[(y + dy * j) * w + x + dx * j] = -2;
          bridges.push({ a: i, b: v, n: 1 + randInt(2) });
        }
        break;
      }
    }
  }
  const num = islands.map(() => 0);
  for (const e of bridges){ num[e.a] += e.n; num[e.b] += e.n; }
  return { w, h, islands: islands.map((s, i) => ({ ...s, n: num[i] })) };
}

/**
 * Puzzle of level `target`: { level, w, h, islands: [{x, y, n}], solution: bridges per span }.
 * Yields often so it doesn't block (see core/generator-worker.js).
 */
export function* generate(target){
  const { w, h, islands: [min, max] } = LEVEL_RULES[target];
  for (let attempt = 0; attempt < 2000; attempt++){
    const p = grow(w, h, min + randInt(max - min + 1));
    yield;
    if (p.islands.length < min) continue;
    const r = solve(p);
    yield;
    if (r.count !== 1) continue;
    return { level: target, ...p, solution: r.solution };
  }
  return null;
}
