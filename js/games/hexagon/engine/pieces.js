/* Hexagon pieces and board (a peg-board packing puzzle).
   The board's pegs form a triangular lattice (19 pegs, plus a ring of imaginary pegs on the edge). The
   pieces are strokes that go through the midpoints between two neighbouring pegs: the board has 72 of
   those points and the 12 pieces fill all of them.
   Coordinates: "doubled" axial (u, v) = sum of the two pegs of each midpoint, with
   x = (u + v / 2) / 2 · d and y = v / 2 · d · √3/2 (d = distance between pegs).
   The 12 pieces were found by a computer search: cuts of the board into 12 strokes, kept for their number
   of solutions. */

/** The pieces (A … L): midpoints each one covers, in a reference pose. */
export const PIECES = Object.freeze([
  { id: 'A', hue: 'yellow', pts: [[0, 1], [0, 3], [1, 1], [1, 2]] },
  { id: 'B', hue: 'orange', pts: [[0, 3], [1, 2], [2, 1], [3, 1]] },
  { id: 'C', hue: 'red', pts: [[0, 5], [1, 4], [2, 3], [3, 1], [3, 2]] },
  { id: 'D', hue: 'maroon', pts: [[1, 1], [1, 2], [1, 3], [2, 1], [3, 1]] },
  { id: 'E', hue: 'pink', pts: [[0, 1], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5]] },
  { id: 'F', hue: 'purple', pts: [[0, 1], [1, 1], [1, 2], [2, 1], [3, 0], [3, 1]] },
  { id: 'G', hue: 'navy', pts: [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5]] },
  { id: 'H', hue: 'blue', pts: [[0, 1], [0, 3], [1, 1], [1, 2], [1, 3], [2, 1], [2, 3]] },
  { id: 'I', hue: 'sky', pts: [[1, 2], [1, 3], [2, 1], [2, 3], [3, 0], [3, 1], [3, 2]] },
  { id: 'J', hue: 'aqua', pts: [[1, 2], [2, 1], [3, 1], [3, 2], [3, 3], [4, 1], [5, 1]] },
  { id: 'K', hue: 'green', pts: [[1, 4], [2, 3], [3, 2], [3, 3], [3, 4], [4, 1], [4, 3]] },
  { id: 'L', hue: 'lime', pts: [[0, 1], [0, 3], [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [2, 1]] }
].map(p => Object.freeze({ ...p, pts: Object.freeze(p.pts.map(q => Object.freeze(q))) })));

const ring = (u, v) => Math.max(Math.abs(u), Math.abs(v), Math.abs(u + v));

/** The board's pegs (rings 0 to 2), in axial coordinates. */
export const POSTS = [];
/** The board's midpoints, in order: between pegs up to ring 3, without the edge ones. */
export const POINTS = [];
for (let u = -3; u <= 3; u++) for (let v = -3; v <= 3; v++){
  if (ring(u, v) > 3) continue;
  if (ring(u, v) <= 2) POSTS.push([u, v]);
  for (const [du, dv] of [[1, 0], [0, 1], [-1, 1]]){
    const a = [u + du, v + dv];
    if (ring(...a) > 3 || (ring(u, v) === 3 && ring(...a) === 3)) continue;
    POINTS.push([2 * u + du, 2 * v + dv]);
  }
}
export const CELLS = POINTS.length;
const INDEX = new Map(POINTS.map((p, i) => [p.join(), i]));
export const pointIndex = (u, v) => INDEX.get(u + ',' + v) ?? -1;

/** 60° rotation and mirror of the lattice (they work the same in doubled coordinates). */
export const rot60 = ([u, v]) => [-v, u + v];
export const mirror = ([u, v]) => [v, u];

/** Points of a piece in a pose { m: 0|1 (side), r: 0..5 (rotation), tu, tv (translation, even) }. */
export function pointsOf(piece, { m, r, tu, tv }){
  return PIECES[piece].pts.map(p => {
    let q = m ? mirror(p) : p;
    for (let k = 0; k < r; k++) q = rot60(q);
    return [q[0] + tu, q[1] + tv];
  });
}

/** Cells (POINTS indices) of a piece in a pose, or null if it goes off the board. */
export function cellsOf(piece, pose){
  const cells = pointsOf(piece, pose).map(([u, v]) => pointIndex(u, v));
  return cells.includes(-1) ? null : cells;
}

/** Pairs of joined points of a piece (neighbours in the midpoint lattice). */
const NEAR = new Set(['1,0', '-1,0', '0,1', '0,-1', '1,-1', '-1,1']);
export function bonds(piece){
  const pts = PIECES[piece].pts, out = [];
  for (let a = 0; a < pts.length; a++) for (let b = a + 1; b < pts.length; b++)
    if (NEAR.has((pts[a][0] - pts[b][0]) + ',' + (pts[a][1] - pts[b][1]))) out.push([a, b]);
  return out;
}

let placements = null;
/** Every distinct placement of each piece on the board: [[{ pose, cells, key }]]. */
export function allPlacements(){
  if (placements) return placements;
  placements = PIECES.map((_, p) => {
    const seen = new Set(), out = [];
    for (let m = 0; m < 2; m++) for (let r = 0; r < 6; r++) for (let tu = -14; tu <= 14; tu += 2) for (let tv = -14; tv <= 14; tv += 2){
      const pose = { m, r, tu, tv }, cells = cellsOf(p, pose);
      if (!cells) continue;
      const key = cells.slice().sort((a, b) => a - b).join();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ pose, cells, key });
    }
    return out;
  });
  return placements;
}

/** Symmetries of the board (6 rotations × 2 sides) as permutations of the cells. */
export const SYMMETRIES = (() => {
  const out = [];
  for (let m = 0; m < 2; m++) for (let r = 0; r < 6; r++){
    out.push(POINTS.map(p => {
      let q = m ? mirror(p) : p;
      for (let k = 0; k < r; k++) q = rot60(q);
      return pointIndex(q[0], q[1]);
    }));
  }
  return out;
})();
