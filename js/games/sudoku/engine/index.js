/* API pública del motor de Sudoku (sin DOM: se usa en la página y en el worker). */
export { generate } from './generator.js';
export { logic, grade, nextSingle, TECHNIQUES, MAX_LEVEL } from './logic-solver.js';
export { countSolutions, isComplete } from './exact-solver.js';
export * as grid from './grid.js';
