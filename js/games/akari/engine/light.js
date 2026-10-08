/* Akari (Light Up): en un tablero de N × N con casillas negras (algunas con un número), pon bombillas
   en las blancas para que todas queden iluminadas. Una bombilla alumbra su fila y su columna hasta
   la primera negra; dos bombillas no pueden verse; una negra con número tiene exactamente esas
   bombillas a su lado. Sin DOM.
   Un reto es { n, cells }: cells[i] = -1 blanca, 5 negra sin número, 0..4 negra con número. */

export const WHITE = -1, BLACK = 5;
export const isBlack = v => v >= 0;

/** Vecinas en cruz. */
export const around = (n, i) => {
  const r = (i / n) | 0, c = i % n, out = [];
  if (r) out.push(i - n); if (r < n - 1) out.push(i + n); if (c) out.push(i - 1); if (c < n - 1) out.push(i + 1);
  return out;
};

/** Casillas blancas que ve la casilla i (en su fila y columna, hasta una negra), sin contarla a ella. */
export function sight(n, cells, i){
  const out = [], r = (i / n) | 0, c = i % n;
  for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]){
    for (let y = r + dr, x = c + dc; y >= 0 && x >= 0 && y < n && x < n; y += dr, x += dc){
      if (isBlack(cells[y * n + x])) break;
      out.push(y * n + x);
    }
  }
  return out;
}

/** Vista de cada casilla, calculada una vez. */
export const sights = (n, cells) => cells.map((v, i) => isBlack(v) ? [] : sight(n, cells, i));

/** Qué casillas quedan iluminadas con estas bombillas (bulbs[i] = 1). */
export function lit(n, cells, bulbs, see = sights(n, cells)){
  const out = new Uint8Array(n * n);
  bulbs.forEach((b, i) => { if (b){ out[i] = 1; for (const j of see[i]) out[j] = 1; } });
  return out;
}

/**
 * Cuenta soluciones (hasta `limit`). Elige la casilla sin luz con menos sitios desde los que se le
 * podría dar luz y prueba cada uno (los anteriores quedan prohibidos para no contar dos veces la misma).
 */
export function countSolutions(n, cells, { limit = 2, onSolution } = {}){
  const size = n * n, see = sights(n, cells);
  const state = new Int8Array(size);   // 0 libre, 1 bombilla, -1 prohibida (en blancas)
  let count = 0;
  const numbered = cells.map((v, i) => v >= 0 && v <= 4 ? i : -1).filter(i => i >= 0);

  const canBulb = i => !isBlack(cells[i]) && state[i] === 0 && !see[i].some(j => state[j] === 1);
  const numbersOk = () => numbered.every(b => {
    let on = 0, maybe = 0;
    for (const j of around(n, b)){ if (state[j] === 1) on++; else if (canBulb(j)) maybe++; }
    return on <= cells[b] && on + maybe >= cells[b];
  });

  const go = () => {
    if (count >= limit || !numbersOk()) return;
    // casilla sin luz con menos opciones
    let best = -1, bestOpts = null;
    for (let i = 0; i < size; i++){
      if (isBlack(cells[i]) || state[i] === 1 || see[i].some(j => state[j] === 1)) continue;
      const opts = [i, ...see[i]].filter(canBulb);
      if (!opts.length) return;
      if (!bestOpts || opts.length < bestOpts.length){ best = i; bestOpts = opts; if (opts.length === 1) break; }
    }
    if (best < 0){
      // todo iluminado: los números tienen que estar exactos
      if (numbered.every(b => around(n, b).filter(j => state[j] === 1).length === cells[b])){
        count++; onSolution?.(state.map(v => v === 1 ? 1 : 0));
      }
      return;
    }
    const banned = [];
    for (const o of bestOpts){
      state[o] = 1;
      go();
      state[o] = -1;      // en las ramas siguientes esta ya no lleva bombilla
      banned.push(o);
      if (count >= limit) break;
    }
    for (const o of banned) state[o] = 0;
  };
  go();
  return count;
}
