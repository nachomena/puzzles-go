/* Zip: un camino que pasa por todas las casillas de un tablero de N × N, una sola vez, y toca los
   números en orden (empieza en el 1 y acaba en el último). Sin DOM.
   Casilla i = fila * N + columna. Un reto es { n, nums: [casilla del 1, del 2, …] }. */

export const neighbours = (n, i) => {
  const r = (i / n) | 0, c = i % n, out = [];
  if (r > 0) out.push(i - n);
  if (c < n - 1) out.push(i + 1);
  if (r < n - 1) out.push(i + n);
  if (c > 0) out.push(i - 1);
  return out;
};
export const adjacent = (n, a, b) => neighbours(n, a).includes(b);

/** Camino al azar que recorre todo el tablero (con la regla de Warnsdorff y vuelta atrás). */
export function randomPath(n, random = Math.random){
  const size = n * n, seen = new Uint8Array(size), path = [];
  const freeDeg = i => neighbours(n, i).filter(j => !seen[j]).length;
  let budget = 20000;
  const go = i => {
    seen[i] = 1; path.push(i);
    if (path.length === size) return true;
    if (--budget < 0) return false;
    // primero las casillas con menos salidas libres (así no quedan huecos sueltos); empates al azar
    const next = neighbours(n, i).filter(j => !seen[j]).map(j => [freeDeg(j) + random() * .9, j]).sort((a, b) => a[0] - b[0]);
    for (const [, j] of next) if (go(j)) return true;
    seen[i] = 0; path.pop();
    return false;
  };
  // con lado impar, un camino que pasa por todas solo puede empezar en las casillas "pares"
  // (como las de un color del tablero de ajedrez, que hay una más)
  const starts = [...Array(size).keys()].filter(i => n % 2 === 0 || (((i / n) | 0) + i % n) % 2 === 0);
  return go(starts[Math.floor(random() * starts.length)]) ? path : null;
}

/**
 * Cuenta caminos que resuelven el reto (hasta `limit`). `prefix`: el comienzo ya fijado (opcional).
 * Poda: las casillas libres deben seguir unidas entre sí y con el final del camino, y ninguna casilla
 * libre puede quedar con una sola salida salvo que sea el último número.
 */
export function countPaths(n, nums, { limit = 2, onPath } = {}){
  const size = n * n, label = new Int16Array(size).fill(-1);
  nums.forEach((c, k) => { label[c] = k; });
  const last = nums[nums.length - 1], seen = new Uint8Array(size), path = [];
  let count = 0, stop = false, visited = 0;
  const stack = new Int32Array(size), mark = new Uint32Array(size);
  let stamp = 0;

  /** ¿Siguen unidas todas las casillas libres a la cabeza del camino? */
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
      // casillas libres sin salida: si alguna (que no sea el final) solo tiene una salida libre más la
      // cabeza, el camino tiene que ir ahí ya
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
          if (k >= 0 && k !== nextNum) continue;   // un número fuera de orden
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
