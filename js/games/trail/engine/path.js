/* Trail: a path that goes through every cell of an N × N board exactly once and touches the numbers in
   order (it starts at 1 and ends at the last). No DOM.
   Cell i = row * N + column. A puzzle is { n, nums: [cell of 1, of 2, …] }. */

export const neighbours = (n, i) => {
  const r = (i / n) | 0, c = i % n, out = [];
  if (r > 0) out.push(i - n);
  if (c < n - 1) out.push(i + 1);
  if (r < n - 1) out.push(i + n);
  if (c > 0) out.push(i - 1);
  return out;
};
export const adjacent = (n, a, b) => neighbours(n, a).includes(b);

/** Random path through the whole board (with Warnsdorff's rule and backtracking). */
export function randomPath(n, random = Math.random){
  const size = n * n, seen = new Uint8Array(size), path = [];
  const freeDeg = i => neighbours(n, i).filter(j => !seen[j]).length;
  let budget = 20000;
  const go = i => {
    seen[i] = 1; path.push(i);
    if (path.length === size) return true;
    if (--budget < 0) return false;
    // cells with the fewest free exits first (so no lone gaps are left); ties at random
    const next = neighbours(n, i).filter(j => !seen[j]).map(j => [freeDeg(j) + random() * .9, j]).sort((a, b) => a[0] - b[0]);
    for (const [, j] of next) if (go(j)) return true;
    seen[i] = 0; path.pop();
    return false;
  };
  // with an odd side, a path through every cell can only start on the "even" cells
  // (like the cells of one colour on a chessboard, which has one more)
  const starts = [...Array(size).keys()].filter(i => n % 2 === 0 || (((i / n) | 0) + i % n) % 2 === 0);
  return go(starts[Math.floor(random() * starts.length)]) ? path : null;
}

/**
 * Counts paths that solve the puzzle (up to `limit`). `prefix`: the start already fixed (optional).
 * Pruning: the free cells must stay connected to each other and to the end of the path, and no free
 * cell can be left with a single exit unless it is the last number.
 */
export function countPaths(n, nums, { limit = 2, onPath } = {}){
  const size = n * n, label = new Int16Array(size).fill(-1);
  nums.forEach((c, k) => { label[c] = k; });
  const last = nums[nums.length - 1], seen = new Uint8Array(size), path = [];
  let count = 0, stop = false, visited = 0;
  const stack = new Int32Array(size), mark = new Uint32Array(size);
  let stamp = 0;

  /** Are all the free cells still connected to the head of the path? */
  const connected = head => {
    stamp++;
    let top = 0, reach = 0;
    stack[top++] = head; mark[head] = stamp;
    while (top){
      const c = stack[--top];
      for (const d of neighbours(n, c)) if (!seen[d] && mark[d] !== stamp){ mark[d] = stamp; reach++; stack[top++] = d; }
    }
    return reach === size - visited;
  };

  const go = (cell, nextNum) => {
    seen[cell] = 1; visited++; path.push(cell);
    if (visited === size){
      if (cell === last){ count++; onPath?.(path.slice()); if (count >= limit) stop = true; }
    } else if (cell !== last && connected(cell)){
      // free cells with no way out: if any (other than the end) only has one free exit plus the
      // head, the path has to go there now
      let forced = -1, ok = true;
      for (const d of neighbours(n, cell)){
        if (seen[d]) continue;
        let free = 0;
        for (const e of neighbours(n, d)) if (!seen[e]) free++;
        if (free === 0 && d !== last){ ok = d === last; if (!ok) break; }
        if (free <= 1 && d !== last){ if (forced >= 0 && forced !== d){ ok = false; break; } forced = d; }
      }
      if (ok){
        const options = forced >= 0 ? [forced] : neighbours(n, cell);
        for (const d of options){
          if (seen[d]) continue;
          const k = label[d];
          if (k >= 0 && k !== nextNum) continue;   // a number out of order
          go(d, k >= 0 ? nextNum + 1 : nextNum);
          if (stop) break;
        }
      }
    }
    seen[cell] = 0; visited--; path.pop();
  };
  go(nums[0], 1);
  return count;
}
