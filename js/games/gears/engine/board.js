/* Engranajes: geometría y reglas del panel. Sin DOM. Panel hexagonal de filas desplazadas (las impares,
   media casilla a la derecha); casilla i = fila * W + columna.
   La manivela gira a la derecha (sentido 0); dos engranajes que se tocan giran al revés uno del otro.
   Una solución: engranajes (1) que forman una sola pieza con la manivela y el cerrojo, sin círculos (cada
   par que se toca es un contacto), con cada número igual a los engranajes que tocan su hueco y cada fijo
   (y el cerrojo) girando hacia donde dice su flecha. */

const cache = new Map();

/** Casillas vecinas (hasta 6) de cada casilla de un panel de w × h. */
export function neighbours(w, h){
  const key = w * 100 + h;
  if (!cache.has(key)){
    const out = [];
    for (let r = 0; r < h; r++) for (let c = 0; c < w; c++){
      const odd = r & 1, cand = [[r, c - 1], [r, c + 1], [r - 1, c - 1 + odd], [r - 1, c + odd], [r + 1, c - 1 + odd], [r + 1, c + odd]];
      out.push(cand.filter(([a, b]) => a >= 0 && b >= 0 && a < h && b < w).map(([a, b]) => a * w + b));
    }
    cache.set(key, out);
  }
  return cache.get(key);
}

/**
 * Lo que mueve la manivela: { comp (casillas unidas a ella), spin (sentido de cada una, −1 si no gira),
 * jam (si en esa parte hay un círculo) }.
 */
export function drive(w, h, gears, crank){
  const nb = neighbours(w, h), spin = new Int8Array(w * h).fill(-1), comp = [crank];
  spin[crank] = 0;
  let jam = false;
  for (let k = 0; k < comp.length; k++){
    const i = comp[k];
    for (const j of nb[i]) if (gears[j]){
      if (spin[j] < 0){ spin[j] = spin[i] ^ 1; comp.push(j); }
      else if (spin[j] === spin[i]) jam = true;
    }
  }
  // también un círculo de número par de engranajes: contactos de más
  let edges = 0;
  for (const i of comp) for (const j of nb[i]) if (j > i && gears[j]) edges++;
  if (edges !== comp.length - 1) jam = true;
  return { comp, spin, jam };
}

/** Cuántos engranajes tocan la casilla i. */
export const touching = (w, h, gears, i) => neighbours(w, h)[i].reduce((t, j) => t + (gears[j] ? 1 : 0), 0);

/** ¿Cumplen estos engranajes todas las reglas del reto? */
export function satisfies(p, gears){
  const { w, h, crank, lock } = p, { comp, spin, jam } = drive(w, h, gears, crank);
  if (jam || !comp.includes(lock)) return false;
  if (comp.length !== gears.reduce((t, g) => t + (g ? 1 : 0), 0)) return false;
  if ([lock, ...p.fixed].some(i => !gears[i] || spin[i] !== p.spin[i])) return false;
  return Object.entries(p.clues).every(([i, c]) => !gears[i] && touching(w, h, gears, Number(i)) === c);
}

/**
 * Cuenta soluciones (hasta `limit`), casilla a casilla, con los números y la falta de círculos como poda.
 * Si pasa de `budget` pasos se da por "más de una": nunca se toma por única una que no se ha demostrado.
 */
export function countSolutions(p, limit = 2, budget = 300000){
  const { w, h, crank, lock, fixed, clues } = p, n = w * h, nb = neighbours(w, h);
  const state = new Int8Array(n).fill(-1);   // −1 sin decidir, 0 hueco, 1 engranaje
  for (const i of [crank, lock, ...fixed]) state[i] = 1;
  for (const k of Object.keys(clues)) state[Number(k)] = 0;
  // union-find con deshacer, para ver los círculos al poner engranajes
  const parent = Int32Array.from({ length: n }, (_, i) => i), size = new Int32Array(n).fill(1), undo = [];
  const find = x => { while (parent[x] !== x) x = parent[x]; return x; };
  const unite = (a, b) => {
    a = find(a); b = find(b);
    if (a === b) return false;
    if (size[a] < size[b]) [a, b] = [b, a];
    parent[b] = a; size[a] += size[b]; undo.push(b);
    return true;
  };
  const rollback = to => { while (undo.length > to){ const b = undo.pop(); size[parent[b]] -= size[b]; parent[b] = b; } };
  const clueOk = i => {
    let g = 0, open = 0;
    for (const j of nb[i]){ if (state[j] === 1) g++; else if (state[j] < 0) open++; }
    return g <= clues[i] && g + open >= clues[i];
  };
  for (let i = 0; i < n; i++) if (state[i] === 1) for (const j of nb[i]) if (j < i && state[j] === 1 && !unite(i, j)) return 0;
  let count = 0, steps = 0;
  const go = i => {
    if (count >= limit) return;
    if (++steps > budget){ count = limit; return; }
    if (i === n){ if (satisfies(p, state.map(v => v === 1 ? 1 : 0))) count++; return; }
    if (state[i] >= 0){ go(i + 1); return; }
    for (const v of [0, 1]){
      state[i] = v;
      const mark = undo.length;
      let ok = nb[i].every(j => clues[j] === undefined || clueOk(j));
      if (ok && v === 1) for (const j of nb[i]) if (state[j] === 1 && !unite(i, j)){ ok = false; break; }
      if (ok) go(i + 1);
      rollback(mark);
      state[i] = -1;
    }
  };
  go(0);
  return count;
}
