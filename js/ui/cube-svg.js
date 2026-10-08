/* Piezas hechas de cubitos, en SVG con unidades de casilla (Smart Circuit).
   `cells` son las casillas [x, y] de la pieza. */

/** Cuerpo de la pieza: una casilla redondeada por celda y puentes entre celdas vecinas. */
export function cubeBody(cells, { gap, radius }){
  const set = new Set(cells.map(([x, y]) => `${x},${y}`));
  let out = '';
  for (const [x, y] of cells){
    out += `<rect x="${x + gap}" y="${y + gap}" width="${1 - 2 * gap}" height="${1 - 2 * gap}" rx="${radius}"/>`;
    if (set.has(`${x + 1},${y}`)) out += `<rect x="${x + .5}" y="${y + gap}" width="1" height="${1 - 2 * gap}"/>`;
    if (set.has(`${x},${y + 1}`)) out += `<rect x="${x + gap}" y="${y + .5}" width="${1 - 2 * gap}" height="1"/>`;
    // donde se juntan cuatro casillas de la misma pieza (bloque 2×2) se rellena el centro
    if (set.has(`${x + 1},${y}`) && set.has(`${x},${y + 1}`) && set.has(`${x + 1},${y + 1}`)) out += `<rect x="${x + .5}" y="${y + .5}" width="1" height="1"/>`;
  }
  return out;
}

/**
 * Bisel de cada cubito: cuatro trapecios entre el borde del cubito y su cara (claros arriba y a la
 * izquierda, oscuros abajo y a la derecha) y la cara un poco hundida. Hacia una casilla vecina de la
 * misma pieza el cubito llega hasta el borde, así la unión se ve como una junta entre dos cubos.
 * Los colores van en el CSS (.cube-bevel--top, --left, --bottom, --right, --face).
 */
export function cubeBevels(cells, { gap, bevel }){
  const set = new Set(cells.map(([x, y]) => `${x},${y}`));
  const out = { top: '', left: '', bottom: '', right: '', face: '' };
  const quad = (...p) => `M${p.map(([a, b]) => `${+a.toFixed(3)} ${+b.toFixed(3)}`).join('L')}Z`;
  for (const [x, y] of cells){
    const x0 = x + (set.has(`${x - 1},${y}`) ? 0 : gap), x1 = x + 1 - (set.has(`${x + 1},${y}`) ? 0 : gap);
    const y0 = y + (set.has(`${x},${y - 1}`) ? 0 : gap), y1 = y + 1 - (set.has(`${x},${y + 1}`) ? 0 : gap);
    const i0 = x0 + bevel, i1 = x1 - bevel, j0 = y0 + bevel, j1 = y1 - bevel;
    out.top    += quad([x0, y0], [x1, y0], [i1, j0], [i0, j0]);
    out.left   += quad([x0, y0], [i0, j0], [i0, j1], [x0, y1]);
    out.bottom += quad([x0, y1], [i0, j1], [i1, j1], [x1, y1]);
    out.right  += quad([x1, y0], [x1, y1], [i1, j1], [i1, j0]);
    out.face   += quad([i0, j0], [i1, j0], [i1, j1], [i0, j1]);
  }
  return Object.entries(out).map(([k, d]) => `<path class="cube-bevel--${k}" d="${d}"/>`).join('');
}
