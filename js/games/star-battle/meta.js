/* Datos mínimos de Star Battle para el selector y el menú de niveles: se cargan sin el motor ni la interfaz del juego. */
export default Object.freeze({
  id: 'star-battle',
  name: 'Star Battle',
  icon: 'star',
  storageKey: 'starbattlego.v2',   // clave antigua: conserva partidas y estadísticas
  /** `target` es el nivel del solucionador lógico que exige el tablero. */
  levels: Object.freeze({
    easy:   Object.freeze({ name: 'Fácil',   target: 1 }),
    hard:   Object.freeze({ name: 'Difícil', target: 2 }),
    expert: Object.freeze({ name: 'Experto', target: 3 })
  }),
  levelOrder: Object.freeze(['easy', 'hard', 'expert'])
});
