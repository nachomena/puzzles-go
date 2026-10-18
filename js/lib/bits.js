/* Generic bit mask operations. */

export const popcount = x => { let c = 0; while (x){ x &= x - 1; c++; } return c; };

/** Index (from 0) of the lowest bit. */
export const lowBit = x => 31 - Math.clz32(x & -x);

/** Indices (from 0) of the set bits. */
export function bitIndices(x){
  const out = [];
  while (x){ out.push(lowBit(x)); x &= x - 1; }
  return out;
}

/**
 * Walks the combinations of `k` elements of `arr` (small k) without creating new arrays:
 * `fn` always receives the same working array. If `fn` returns true it stops and returns true.
 */
export function someCombination(arr, k, fn){
  const acc = [];
  const rec = start => {
    if (acc.length === k) return fn(acc);
    for (let i = start; i <= arr.length - (k - acc.length); i++){
      acc.push(arr[i]);
      if (rec(i + 1)) return true;
      acc.pop();
    }
    return false;
  };
  return rec(0);
}
