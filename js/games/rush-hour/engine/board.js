/* Rush Hour: tablero de 6 × 6 con coches (2 casillas) y camiones (3), que solo se mueven en su
   dirección. Hay que sacar el coche rojo (el 0) por la salida de la derecha de su fila. Sin DOM.

   Un tablero es { cars: [{ len, dir, line }] } y un estado, la posición de cada vehículo: `pos[i]`
   es la columna (si va en horizontal, dir 'h') o la fila (en vertical, 'v') de su primera casilla.
   La otra coordenada, `line`, es fija. Un movimiento desliza un vehículo cualquier distancia: cuenta
   como uno. */

export const N = 6, EXIT_ROW = 2;

/** Casillas (índices fila * N + columna) de un vehículo en una posición. */
export function cellsOfCar(car, p){
  const out = [];
  for (let k = 0; k < car.len; k++) out.push(car.dir === 'h' ? car.line * N + p + k : (p + k) * N + car.line);
  return out;
}

/** Qué vehículo ocupa cada casilla (-1 = libre). */
export function occupancy(cars, pos, grid = new Int8Array(N * N)){
  grid.fill(-1);
  cars.forEach((car, i) => { for (const c of cellsOfCar(car, pos[i])) grid[c] = i; });
  return grid;
}

/** Hasta dónde puede ir el vehículo i: { min, max } de su posición. */
export function range(cars, pos, i, grid = occupancy(cars, pos)){
  const car = cars[i], at = k => car.dir === 'h' ? car.line * N + k : k * N + car.line;
  let min = pos[i], max = pos[i];
  while (min > 0 && grid[at(min - 1)] < 0) min--;
  while (max + car.len < N && grid[at(max + car.len)] < 0) max++;
  return { min, max };
}

/** Resuelto: el coche rojo toca la salida (llega a la última columna). */
export const isSolved = (cars, pos) => pos[0] + cars[0].len === N;

/**
 * Recorrido de estados. Cada estado se guarda como un número: las posiciones (0..4) en base 5.
 * `each(code, fn)` llama a fn(código) por cada estado a un movimiento.
 */
function walker(cars){
  const n = cars.length, pow = cars.map((_, i) => 5 ** i), cur = new Array(n), grid = new Int8Array(N * N);
  // por vehículo: las casillas de su línea (en orden) y las que ocupa en cada posición
  const line = cars.map(car => Array.from({ length: N }, (_, k) => car.dir === 'h' ? car.line * N + k : k * N + car.line));
  const cells = cars.map((car, i) => Array.from({ length: N - car.len + 1 }, (_, p) => line[i].slice(p, p + car.len)));
  const len = cars.map(c => c.len);
  const encode = pos => pos.reduce((k, p, i) => k + p * pow[i], 0);
  const decode = code => { for (let i = 0; i < n; i++) cur[i] = Math.floor(code / pow[i]) % 5; return cur; };
  const each = (code, fn) => {
    decode(code);
    grid.fill(-1);
    for (let i = 0; i < n; i++){ const cs = cells[i][cur[i]]; for (let k = 0; k < cs.length; k++) grid[cs[k]] = i; }
    for (let i = 0; i < n; i++){
      const L = line[i], at = cur[i];
      let min = at, max = at;
      while (min > 0 && grid[L[min - 1]] < 0) min--;
      while (max + len[i] < N && grid[L[max + len[i]]] < 0) max++;
      for (let p = min; p <= max; p++) if (p !== at) fn(code + (p - at) * pow[i], i, p);
    }
  };
  const solved = code => (code % 5) + len[0] === N;
  return { encode, decode, each, solved };
}

/**
 * Solución más corta desde `pos` (búsqueda en anchura): [{ car, to }] o null si no tiene.
 * `limit`: máximo de estados que visitar.
 */
export function solve(cars, pos, limit = 300000){
  if (isSolved(cars, pos)) return [];
  const w = walker(cars), start = w.encode(pos), prev = new Map([[start, null]]);
  let frontier = [start];
  while (frontier.length && prev.size < limit){
    const next = [];
    for (const code of frontier){
      let goal = -1;
      w.each(code, (t, car, to) => {
        if (goal >= 0 || prev.has(t)) return;
        prev.set(t, { from: code, car, to });
        if (w.solved(t)) goal = t; else next.push(t);
      });
      if (goal >= 0){
        const path = [];
        for (let s = goal; prev.get(s); s = prev.get(s).from) path.unshift({ car: prev.get(s).car, to: prev.get(s).to });
        return path;
      }
    }
    frontier = next;
  }
  return null;
}

/**
 * Los estados a los que se llega desde `pos` (los movimientos se pueden deshacer) y la distancia de
 * cada uno a la solución más cercana. Devuelve { max, size, pick(d) } — max: la mayor distancia
 * (-1 si no se puede resolver); pick(d): posiciones de un estado al azar a distancia d — o null si
 * el grupo de estados pasa de `limit`.
 */
export function distances(cars, pos, limit = 30000){
  const w = walker(cars), codes = [w.encode(pos)], index = new Map([[codes[0], 0]]);
  for (let q = 0; q < codes.length; q++){
    let over = false;
    w.each(codes[q], t => {
      if (over || index.has(t)) return;
      if (codes.length >= limit){ over = true; return; }
      index.set(t, codes.length); codes.push(t);
    });
    if (over) return null;
  }
  // desde todos los estados resueltos hacia atrás
  const dist = new Float64Array(codes.length).fill(Infinity);
  let frontier = [], max = -1;
  codes.forEach((c, k) => { if (w.solved(c)){ dist[k] = 0; frontier.push(c); max = 0; } });
  for (let d = 1; frontier.length; d++){
    const next = [];
    for (const c of frontier) w.each(c, t => { const k = index.get(t); if (dist[k] === Infinity){ dist[k] = d; next.push(t); } });
    if (next.length) max = d;
    frontier = next;
  }
  return {
    max, size: codes.length,
    pick(d){
      const ks = [];
      dist.forEach((v, k) => { if (v === d) ks.push(k); });
      return ks.length ? w.decode(codes[ks[(Math.random() * ks.length) | 0]]).slice() : null;
    }
  };
}
