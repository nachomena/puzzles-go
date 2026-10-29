/* Soft colour for each cage of a Killer Sudoku or Calcudoku board, so its areas can be told apart at a glance.
   Neighbouring cages never share a colour (greedy colouring over the cages that touch). No DOM. */

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
  const pick = new Array(count).fill(-1), used = new Array(HUES.length).fill(0);
  for (let k = 0; k < count; k++){
    const taken = new Set([...touch[k]].map(o => pick[o]));
    // a free colour for this cage, the least used one first so they are spread out (if all six are around it, the least used)
    const order = HUES.map((_, h) => h).sort((a, b) => used[a] - used[b]);
    pick[k] = order.find(h => !taken.has(h)) ?? order[0];
    used[pick[k]]++;
  }
  return pick.map(h => `hsl(${HUES[h]} 16% 26%)`);
}
