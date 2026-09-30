/** Entero aleatorio en [0, n). */
export const randInt = n => (Math.random() * n) | 0;

/** Elemento aleatorio de un array no vacío. */
export const pick = arr => arr[randInt(arr.length)];

/** Fisher–Yates in situ. Devuelve el mismo array. */
export function shuffle(a){
  for (let i = a.length - 1; i > 0; i--){
    const j = randInt(i + 1), t = a[i];
    a[i] = a[j]; a[j] = t;
  }
  return a;
}
