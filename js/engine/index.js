/* API pública del motor (sin dependencias del DOM: se usa en la página y en el worker). */
export { generate, runToEnd } from './generator.js';
export { solve } from './exact-solver.js';
export { logic, grade } from './logic-solver.js';
