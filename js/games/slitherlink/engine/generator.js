/* Generador de Slitherlink: una zona de casillas al azar, de una pieza, sin agujeros y sin esquinas que se
   toquen solo en diagonal; su borde es el lazo. Se ponen todos los números y se quitan mientras el tablero
   se siga resolviendo con las técnicas del nivel (resolver por lógica ya implica solución única); con las
   del nivel anterior no tiene que bastar. */
import { loopOf, cluesOf } from './grid.js';
import { logic } from './logic-solver.js';
import { shuffle, randInt } from '../../../lib/random.js';

/** Por nivel: lado del tablero y técnicas del solucionador. */
export const LEVEL_RULES = Object.freeze({
  1: { n: 5,  logic: 1 },
  2: { n: 7,  logic: 2 },
  3: { n: 8,  logic: 3 },
  4: { n: 10, logic: 3 }
});

/** Zona de casillas (1 = dentro) que crece desde una casilla hasta `want` sin agujeros ni pellizcos. */
export function region(n, want){
  const inside = new Uint8Array(n * n);
  const nb = i => { const r = (i / n) | 0, c = i % n, o = []; if (r) o.push(i - n); if (r < n - 1) o.push(i + n); if (c) o.push(i - 1); if (c < n - 1) o.push(i + 1); return o; };
  const at = (r, c) => r < 0 || c < 0 || r >= n || c >= n ? 0 : inside[r * n + c];
  // ¿quedan pellizcos (dos de dentro que solo se tocan en diagonal) en las esquinas de i?
  const pinched = i => {
    const r = (i / n) | 0, c = i % n;
    for (const [dr, dc] of [[0, 0], [0, 1], [1, 0], [1, 1]]){
      const a = at(r + dr - 1, c + dc - 1), b = at(r + dr - 1, c + dc), d = at(r + dr, c + dc - 1), e = at(r + dr, c + dc);
      if ((a && e && !b && !d) || (b && d && !a && !e)) return true;
    }
    return false;
  };
  // ¿lo de fuera sigue de una pieza y tocando el borde? (si no, habría un agujero)
  const outsideOk = () => {
    const seen = new Uint8Array(n * n), stack = [];
    for (let i = 0; i < n * n; i++){
      const r = (i / n) | 0, c = i % n;
      if (!inside[i] && (r === 0 || c === 0 || r === n - 1 || c === n - 1)){ seen[i] = 1; stack.push(i); }
    }
    while (stack.length){ const i = stack.pop(); for (const j of nb(i)) if (!inside[j] && !seen[j]){ seen[j] = 1; stack.push(j); } }
    for (let i = 0; i < n * n; i++) if (!inside[i] && !seen[i]) return false;
    return true;
  };
  inside[randInt(n * n)] = 1;
  let count = 1, fails = 0;
  while (count < want && fails < 200){
    const front = [];
    for (let i = 0; i < n * n; i++) if (!inside[i] && nb(i).some(j => inside[j])) front.push(i);
    if (!front.length) break;
    const i = front[randInt(front.length)];
    inside[i] = 1;
    if (pinched(i) || !outsideOk()){ inside[i] = 0; fails++; continue; }
    count++;
  }
  return inside;
}

/** Quita números (−1) mientras se resuelva con `level`. Muta `clues`. */
function* dig(n, clues, level){
  for (const i of shuffle([...clues.keys()])){
    const c = clues[i];
    clues[i] = -1;
    if (!logic(n, clues, level).solved) clues[i] = c;
    if (i % 6 === 0) yield;
  }
}

/**
 * Reto del nivel `target` (1 fácil … 4 experto): { level, n, clues (−1 = sin número), solution (1 = línea) }.
 * Cede a menudo (ver core/generator-worker.js). null si no lo consigue.
 */
export function* generate(target){
  const { n, logic: level } = LEVEL_RULES[target];
  for (let attempt = 0; attempt < 300; attempt++){
    const inside = region(n, Math.round(n * n * (.45 + Math.random() * .15)));
    const solution = loopOf(n, inside), clues = cluesOf(n, solution);
    yield;
    if (!logic(n, clues, level).solved) continue;
    yield* dig(n, clues, level);
    if (level > 1 && logic(n, clues, level - 1).solved) continue;
    return { level: target, n, clues, solution };
  }
  return null;
}
