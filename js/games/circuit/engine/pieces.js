/* The 10 Circuit pieces (double-sided) and the board geometry.
   Each side: relative cells [x, y], path exits per cell (N/E/S/W, towards the neighbouring cell, of the
   same piece or another) and cells with a dot. The rectangular one-row pieces (dominoes and the straight
   three) can also be placed on their blank side.
   The two sides of each piece were found by a computer search (scripts/build-circuit-arrangements.mjs
   counts the placements they allow). */

export const W = 6, H = 5, CELLS = W * H;

export const PIECES = [
  { faces: [
      { cells: [[0,0],[1,0]], ports: ["EW","SW"], dots: [] },
      { cells: [[0,0],[1,0]], ports: ["E","EW"], dots: [[0,0]] }
    ], blank: true },
  { faces: [
      { cells: [[0,0],[1,0]], ports: ["S","NS"], dots: [[0,0]] },
      { cells: [[0,0],[0,1]], ports: ["S","NW"], dots: [[0,0]] }
    ], blank: true },
  { faces: [
      { cells: [[0,0],[1,0]], ports: ["E","SW"], dots: [[0,0]] },
      { cells: [[0,0],[0,1]], ports: ["NS","NS"], dots: [] }
    ], blank: true },
  { faces: [
      { cells: [[0,0],[0,1],[0,2]], ports: ["ES","NE","EW"], dots: [] },
      { cells: [[0,0],[0,1],[0,2]], ports: ["NS","NS","N"], dots: [[0,2]] }
    ], blank: true },
  { faces: [
      { cells: [[0,0],[0,1],[1,1]], ports: ["W","EW","NW"], dots: [[0,0]] },
      { cells: [[1,0],[0,1],[1,1]], ports: ["NE","NE","EW"], dots: [] }
    ], blank: false },
  { faces: [
      { cells: [[0,0],[0,1],[1,1]], ports: ["NE","E","EW"], dots: [[0,1]] },
      { cells: [[0,0],[1,0],[1,1]], ports: ["ES","SW","NS"], dots: [] }
    ], blank: false },
  { faces: [
      { cells: [[1,0],[0,1],[1,1]], ports: ["NS","NE","NW"], dots: [] },
      { cells: [[0,0],[0,1],[1,1]], ports: ["SW","NS","NS"], dots: [] }
    ], blank: false },
  { faces: [
      { cells: [[1,0],[0,1],[1,1],[1,2]], ports: ["S","NS","NS","NS"], dots: [[1,0]] },
      { cells: [[0,0],[1,0],[2,0],[1,1]], ports: ["S","ES","EW","NS"], dots: [[0,0]] }
    ], blank: false },
  { faces: [
      { cells: [[1,0],[2,0],[0,1],[1,1]], ports: ["SW","S","EW","NW"], dots: [[2,0]] },
      { cells: [[1,0],[0,1],[1,1],[0,2]], ports: ["NS","EW","NW","EW"], dots: [] }
    ], blank: false },
  { faces: [
      { cells: [[0,0],[0,1],[0,2],[1,2]], ports: ["NS","NS","NE","EW"], dots: [] },
      { cells: [[1,0],[1,1],[0,2],[1,2]], ports: ["NS","NS","EW","NW"], dots: [] }
    ], blank: false }
];

export const DIRS = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
export const DIR_BIT = { N: 1, E: 2, S: 4, W: 8 };
export const OPPOSITE = { 1: 4, 2: 8, 4: 1, 8: 2 };
