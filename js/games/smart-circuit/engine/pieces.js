/* Las 10 piezas de Smart Circuit (doble cara) y la geometría del tablero.
   Cada cara: casillas [x, y] relativas, salidas del camino por casilla (N/E/S/W, hacia la casilla
   vecina, sea de la misma pieza o de otra) y casillas con punto. Las piezas rectangulares de una
   sola fila (dominós y rectas de 3) también se pueden colocar por su cara lisa.
   Datos extraídos de las soluciones del cuadernillo original (ver tests/smart-circuit.test.js). */

export const W = 8, H = 4, CELLS = W * H;

export const PIECES = [
  { faces: [
      { cells: [[0,0],[1,0]], ports: ["E","EW"], dots: [[0,0]] },
      { cells: [[0,0],[0,1]], ports: ["","EW"], dots: [] }
    ], blank: true },
  { faces: [
      { cells: [[0,0],[1,0]], ports: ["E","SW"], dots: [[0,0]] },
      { cells: [[0,0],[1,0]], ports: ["EW","EW"], dots: [] }
    ], blank: true },
  { faces: [
      { cells: [[0,0],[0,1],[1,0]], ports: ["ES","NS","W"], dots: [[1,0]] },
      { cells: [[0,0],[0,1],[1,0]], ports: ["ES","NS","EW"], dots: [] }
    ], blank: false },
  { faces: [
      { cells: [[0,0],[0,1],[1,1]], ports: ["ES","EN","EW"], dots: [] },
      { cells: [[0,0],[0,1],[1,1]], ports: ["E","EW","EW"], dots: [[0,0]] }
    ], blank: false },
  { faces: [
      { cells: [[0,0],[1,0],[2,0]], ports: ["E","EW","EW"], dots: [[0,0]] },
      { cells: [[0,0],[1,0],[2,0]], ports: ["ES","EW","EW"], dots: [] }
    ], blank: true },
  { faces: [
      { cells: [[0,0],[0,1],[0,2]], ports: ["","S","EN"], dots: [[0,1]] },
      { cells: [[0,0],[0,1],[0,2]], ports: ["","SW","NS"], dots: [] }
    ], blank: true },
  { faces: [
      { cells: [[0,0],[1,0],[1,1],[2,1]], ports: ["","","EW","NW"], dots: [] },
      { cells: [[0,0],[0,1],[1,1],[1,2]], ports: ["","EW","SW","N"], dots: [[1,2]] }
    ], blank: false },
  { faces: [
      { cells: [[0,0],[0,1],[1,0],[1,1]], ports: ["ES","EN","NW","EW"], dots: [] },
      { cells: [[0,0],[0,1],[1,0],[1,1]], ports: ["EN","E","EW","EW"], dots: [[0,1]] }
    ], blank: false },
  { faces: [
      { cells: [[0,0],[1,0],[1,1],[2,0]], ports: ["","ES","NS","SW"], dots: [] },
      { cells: [[0,0],[0,1],[0,2],[1,1]], ports: ["ES","NS","NS","ES"], dots: [] }
    ], blank: false },
  { faces: [
      { cells: [[0,0],[0,1],[0,2],[1,0]], ports: ["ES","NS","EN","EW"], dots: [] },
      { cells: [[0,0],[0,1],[1,0],[2,0]], ports: ["ES","EN","EW","NW"], dots: [] }
    ], blank: false }
];

export const DIRS = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
export const DIR_BIT = { N: 1, E: 2, S: 4, W: 8 };
export const OPPOSITE = { 1: 4, 2: 8, 4: 1, 8: 2 };
