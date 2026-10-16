/* Datos mínimos de Slitherlink para el selector y el menú de niveles: se cargan sin el motor ni la interfaz. */
export default Object.freeze({
  id: 'slitherlink',
  name: 'Slitherlink',
  icon: 'slither',
  storageKey: 'puzzlesgo.slitherlink.v1',
  /** `target` es el nivel del generador (engine/generator.js): tablero más grande y más técnicas. */
  levels: Object.freeze({
    easy:   Object.freeze({ name: 'Fácil',   target: 1 }),
    medium: Object.freeze({ name: 'Medio',   target: 2 }),
    hard:   Object.freeze({ name: 'Difícil', target: 3 }),
    expert: Object.freeze({ name: 'Experto', target: 4 })
  }),
  levelOrder: Object.freeze(['easy', 'medium', 'hard', 'expert'])
});
