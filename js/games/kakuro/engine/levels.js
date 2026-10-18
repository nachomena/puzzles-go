/* Kakuro levels: side, share of black cells, solver techniques (engine/logic-solver.js) and longest
   run. Used by the generator and the hints. */
export const LEVEL_RULES = Object.freeze({
  1: { n: 6,  black: .2,  logic: 1, maxRun: 5 },
  2: { n: 8,  black: .26, logic: 1, maxRun: 7 },
  3: { n: 10, black: .28, logic: 2, maxRun: 8 },
  4: { n: 12, black: .3,  logic: 2, maxRun: 9 }
});
