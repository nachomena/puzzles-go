/* Soft colour for each cage of a Killer Sudoku or Calcudoku board, so its areas can be told apart at a glance.
   Neighbouring cages never share a colour (DSATUR colouring over the cages that touch). No DOM. */

/** Hues of the palette (degrees): blue, green, orange, pink, violet, teal. Low saturation and dark, like the board. */
const HUES = [215, 150, 35, 330, 275, 185];

/**
 * @param {ArrayLike<number>} owner  cage index of each cell of an n × n board
 * @param {number} n
 * @returns {string[]}  CSS colour of each cage
 */
export function cageTints(owner, n){
  const count = Math.max(-1, ...owner) + 1, touch = Array.from({ length: count }, () => new Set());
  for (let i = 0; i < n * n; i++){
    const a = owner[i], right = i % n < n - 1 ? owner[i + 1] : a, below = i + n < n * n ? owner[i + n] : a;
    if (right !== a){ touch[a].add(right); touch[right].add(a); }
    if (below !== a){ touch[a].add(below); touch[below].add(a); }
  }
  // most constrained cage first (DSATUR) with backtracking, so a cage with many neighbours always finds a colour
  const pick = new Array(count).fill(-1), used = new Array(HUES.length).fill(0);
  const taken = k => new Set([...touch[k]].map(o => pick[o]));
  const paint = left => {
    if (!left) return true;
    let best = -1, bestTaken = null;
    for (let k = 0; k < count; k++){
      if (pick[k] >= 0) continue;
      const t = taken(k);
      if (best < 0 || t.size > bestTaken.size || (t.size === bestTaken.size && touch[k].size > touch[best].size)){ best = k; bestTaken = t; }
    }
    // a free colour, the least used one first so they are spread out
    const free = HUES.map((_, h) => h).filter(h => !bestTaken.has(h)).sort((x, y) => used[x] - used[y]);
    for (const h of free){
      pick[best] = h; used[h]++;
      if (paint(left - 1)) return true;
      pick[best] = -1; used[h]--;
    }
    return false;
  };
  paint(count);
  // (a board that can't be coloured with six colours doesn't exist with cages of a grid; this keeps a colour anyway)
  for (let k = 0; k < count; k++) if (pick[k] < 0) pick[k] = 0;
  return pick.map(h => `hsl(${HUES[h]} 16% 26%)`);
}
