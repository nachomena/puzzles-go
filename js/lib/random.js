/** Random integer in [0, n). */
export const randInt = n => (Math.random() * n) | 0;

/** Random element of a non-empty array. */
export const pick = arr => arr[randInt(arr.length)];

/** In-place Fisher–Yates. Returns the same array. */
export function shuffle(a){
  for (let i = a.length - 1; i > 0; i--){
    const j = randInt(i + 1), t = a[i];
    a[i] = a[j]; a[j] = t;
  }
  return a;
}
