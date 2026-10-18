/* Pieces made of little cubes, in SVG with cell units (Circuit).
   `cells` are the piece's cells [x, y]. */

/** Body of the piece: one rounded square per cell and bridges between neighbouring cells. */
export function cubeBody(cells, { gap, radius }){
  const set = new Set(cells.map(([x, y]) => `${x},${y}`));
  let out = '';
  for (const [x, y] of cells){
    out += `<rect x="${x + gap}" y="${y + gap}" width="${1 - 2 * gap}" height="${1 - 2 * gap}" rx="${radius}"/>`;
    if (set.has(`${x + 1},${y}`)) out += `<rect x="${x + .5}" y="${y + gap}" width="1" height="${1 - 2 * gap}"/>`;
    if (set.has(`${x},${y + 1}`)) out += `<rect x="${x + gap}" y="${y + .5}" width="${1 - 2 * gap}" height="1"/>`;
    // where four cells of the same piece meet (a 2×2 block) the centre is filled
    if (set.has(`${x + 1},${y}`) && set.has(`${x},${y + 1}`) && set.has(`${x + 1},${y + 1}`)) out += `<rect x="${x + .5}" y="${y + .5}" width="1" height="1"/>`;
  }
  return out;
}

/**
 * Bevel of each little cube: four trapezoids between the cube's edge and its face (light on top and
 * left, dark on the bottom and right) and the face slightly sunk. Towards a neighbouring cell of the
 * same piece the cube reaches the edge, so the join looks like a seam between two cubes.
 * The colours are in the CSS (.cube-bevel--top, --left, --bottom, --right, --face).
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
