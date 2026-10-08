/* Piezas de casillas (poliominós) y búsqueda de soluciones para llenar un tablero con ellas.
   Sin DOM. Lo usan Katamino (5 × n) e IQ Puzzler Pro (11 × 5).

   Una pieza colocada es { m, r, x, y }: m = cara (0, 1 = volteada), r = giro de 90° en sentido
   horario (0..3) y (x, y) la esquina superior izquierda de su caja. */

/**
 * Casillas [x, y] de una forma con cara `m` y giro `r`, desde la esquina de su caja y en orden de
 * lectura, con su ancho y alto.
 */
export function orientCells(cells, m, r){
  let out = cells.map(([x, y]) => [m ? -x : x, y]);
  for (let k = 0; k < r; k++) out = out.map(([x, y]) => [-y, x]);
  const minX = Math.min(...out.map(c => c[0])), minY = Math.min(...out.map(c => c[1]));
  out = out.map(([x, y]) => [x - minX, y - minY]).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  return { cells: out, w: Math.max(...out.map(c => c[0])) + 1, h: Math.max(...out.map(c => c[1])) + 1 };
}

/** Orientaciones distintas de una forma: [{ m, r, cells, w, h }] (las repetidas por simetría se quitan). */
export function orientationsOf(cells){
  const seen = new Set(), out = [];
  for (let m = 0; m < 2; m++) for (let r = 0; r < 4; r++){
    const o = orientCells(cells, m, r), key = JSON.stringify(o.cells);
    if (!seen.has(key)){ seen.add(key); out.push({ m, r, ...o }); }
  }
  return out;
}

/**
 * Buscador de soluciones para llenar un tablero de W × H (hasta 60 casillas) con piezas.
 * Rellena siempre la primera casilla libre, en orden de lectura (`order: 'rows'`) o por columnas
 * (`'columns'`): conviene recorrer primero el lado corto del tablero. El tablero va en dos enteros de
 * 30 bits.
 * @param {{ W: number, H: number, shapes: number[][][], order?: 'rows'|'columns' }} o
 *   shapes: casillas [x, y] de cada pieza
 */
export function createPacker({ W, H, shapes, order = 'rows' }){
  const SIZE = W * H, HALF = 30, FULL = (1 << HALF) - 1;
  if (SIZE > 2 * HALF) throw new Error('Tablero demasiado grande');
  const index = order === 'columns' ? (x, y) => x * H + y : (x, y) => y * W + x;
  const bitLo = i => i < HALF ? 1 << i : 0, bitHi = i => i < HALF ? 0 : 1 << (i - HALF);
  const orientations = shapes.map(orientationsOf);

  // Colocaciones que tienen su primera casilla (en el orden de relleno) en i
  const AT = Array.from({ length: SIZE }, () => []);
  orientations.forEach((list, piece) => list.forEach(o => {
    for (let y = 0; y + o.h <= H; y++) for (let x = 0; x + o.w <= W; x++){
      const idx = o.cells.map(([a, b]) => index(x + a, y + b));
      let lo = 0, hi = 0;
      for (const c of idx){ lo |= bitLo(c); hi |= bitHi(c); }
      AT[Math.min(...idx)].push({ piece, pose: Object.freeze({ m: o.m, r: o.r, x, y }), lo, hi });
    }
  }));

  /** Casillas [x, y] de una pieza colocada, o null si se sale del tablero. */
  const cellsOf = (piece, { m, r, x, y }) => {
    const o = orientCells(shapes[piece], m, r);
    if (x < 0 || y < 0 || x + o.w > W || y + o.h > H) return null;
    return o.cells.map(([a, b]) => [x + a, y + b]);
  };

  /**
   * Cuenta las soluciones (hasta `limit`).
   * @param {number[]} pieces  piezas que hay que colocar (las fijas incluidas)
   * @param {object} [opts]
   *   fixed: [{ piece, pose }] ya colocadas · limit · onSolution([{ piece, pose }]) → true para parar
   *   blocked: casillas [x, y] que no hay que llenar (p. ej. las filas que sobran)
   *   random: () => número en [0, 1) para recorrer las colocaciones en otro orden
   * @returns {number}  0 también si las fijas se salen o se pisan
   */
  function countSolutions(pieces, { fixed = [], limit = Infinity, onSolution, blocked = [], random } = {}){
    let lo = 0, hi = 0;
    const take = ([x, y]) => {
      const c = index(x, y);
      if ((lo & bitLo(c)) || (hi & bitHi(c))) return false;
      lo |= bitLo(c); hi |= bitHi(c);
      return true;
    };
    for (const c of blocked) take(c);
    const want = new Uint8Array(shapes.length), chosen = new Array(shapes.length).fill(null);
    for (const p of pieces) want[p] = 1;
    for (const { piece, pose } of fixed){
      const cells = cellsOf(piece, pose);
      if (!want[piece] || !cells || !cells.every(take)) return 0;
      want[piece] = 0;
      chosen[piece] = pose;
    }
    let count = 0, stop = false;
    const search = (lo, hi) => {
      // primera casilla libre: el bit más bajo a 0
      let i;
      if (lo !== FULL) i = 31 - Math.clz32(~lo & (lo + 1));
      else if (hi !== FULL) i = HALF + 31 - Math.clz32(~hi & (hi + 1));
      else {
        count++;
        if (onSolution && onSolution(pieces.map(piece => ({ piece, pose: { ...chosen[piece] } })))) stop = true;
        if (count >= limit) stop = true;
        return;
      }
      const list = random ? rotated(AT[i], random) : AT[i];
      for (let k = 0, n = list.length; k < n; k++){
        const pl = list[k];
        if (!want[pl.piece] || (lo & pl.lo) || (hi & pl.hi)) continue;
        want[pl.piece] = 0;
        chosen[pl.piece] = pl.pose;
        search(lo | pl.lo, hi | pl.hi);
        want[pl.piece] = 1;
        if (stop) return;
      }
    };
    // los bits que no son casillas cuentan como llenos: tablero lleno = las dos mitades a FULL
    if (SIZE <= HALF){ lo |= FULL & ~((1 << SIZE) - 1); hi = FULL; }
    else hi |= FULL & ~((1 << (SIZE - HALF)) - 1);
    search(lo, hi);
    return count;
  }

  /** La lista empezando en un punto al azar (para soluciones distintas cada vez). */
  const rotated = (list, random) => { const k = (random() * list.length) | 0; return list.slice(k).concat(list.slice(0, k)); };

  /** Primera solución que respeta las piezas `fixed`, o null. */
  function solve(pieces, opts = {}){
    let found = null;
    countSolutions(pieces, { ...opts, limit: 1, onSolution: sol => { found = sol; return true; } });
    return found;
  }

  return { W, H, orientations, cellsOf, countSolutions, solve };
}
