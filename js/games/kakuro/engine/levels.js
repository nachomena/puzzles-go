/* Niveles del Kakuro: lado, parte de casillas negras, técnicas del solucionador (engine/logic-solver.js)
   y tramo más largo. Lo usan el generador y las pistas. */
export const LEVEL_RULES = Object.freeze({
  1: { n: 6,  black: .2,  logic: 1, maxRun: 5 },
  2: { n: 8,  black: .26, logic: 1, maxRun: 7 },
  3: { n: 10, black: .28, logic: 2, maxRun: 8 },
  4: { n: 12, black: .3,  logic: 2, maxRun: 9 }
});
