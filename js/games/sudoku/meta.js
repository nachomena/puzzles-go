/* Datos mínimos del Sudoku para el selector y el menú de niveles: se cargan sin el motor ni la interfaz del juego. */
export default Object.freeze({
  id: 'sudoku',
  name: 'Sudoku',
  tagline: '9×9 clásico · del 1 al 9 sin repetir',
  icon: 'grid',
  storageKey: 'puzzlesgo.sudoku.v1',
  /** `target` es el nivel del solucionador lógico que exige el tablero. */
  levels: Object.freeze({
    easy:   Object.freeze({ name: 'Fácil',   target: 1, desc: 'Basta con ver dónde va cada número' }),
    medium: Object.freeze({ name: 'Medio',   target: 2, desc: 'Pares, tríos y candidatos bloqueados' }),
    hard:   Object.freeze({ name: 'Difícil', target: 3, desc: 'Exige X-Wing o Swordfish' })
  }),
  levelOrder: Object.freeze(['easy', 'medium', 'hard'])
});
