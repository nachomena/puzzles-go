/* Datos mínimos del Killer Sudoku para el selector y el menú de niveles: se cargan sin el motor ni la interfaz. */
export default Object.freeze({
  id: 'killer-sudoku',
  name: 'Killer Sudoku',
  icon: 'killer',
  storageKey: 'puzzlesgo.killersudoku.v1',
  /** `target` es el nivel del solucionador lógico que exige el tablero (ver engine/logic-solver.js). */
  levels: Object.freeze({
    easy:   Object.freeze({ name: 'Fácil',   target: 1 }),
    medium: Object.freeze({ name: 'Medio',   target: 2 }),
    hard:   Object.freeze({ name: 'Difícil', target: 3 }),
    expert: Object.freeze({ name: 'Experto', target: 4 })
  }),
  levelOrder: Object.freeze(['easy', 'medium', 'hard', 'expert'])
});
