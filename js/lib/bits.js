/* Operaciones genéricas con máscaras de bits. */

export const popcount = x => { let c = 0; while (x){ x &= x - 1; c++; } return c; };

/** Índice (desde 0) del bit más bajo. */
export const lowBit = x => 31 - Math.clz32(x & -x);

/** Índices (desde 0) de los bits encendidos. */
export function bitIndices(x){
  const out = [];
  while (x){ out.push(lowBit(x)); x &= x - 1; }
  return out;
}

/**
 * Recorre las combinaciones de `k` elementos de `arr` (k pequeño) sin crear arrays nuevos:
 * `fn` recibe siempre el mismo array de trabajo. Si `fn` devuelve true se detiene y devuelve true.
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
