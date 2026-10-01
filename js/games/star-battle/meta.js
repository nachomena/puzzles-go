/* Datos mínimos de Star Battle para el selector y el menú de niveles: se cargan sin el motor ni la interfaz del juego. */
export default Object.freeze({
  id: 'star-battle',
  name: 'Star Battle',
  tagline: '10×10 · 2 estrellas por fila, columna y región',
  icon: 'star',
  storageKey: 'starbattlego.v2',   // clave antigua: conserva partidas y estadísticas
  /** `target` es el nivel del solucionador lógico que exige el tablero. */
  levels: Object.freeze({
    easy:   Object.freeze({ name: 'Fácil',   target: 1, desc: 'Solo reglas básicas' }),
    hard:   Object.freeze({ name: 'Difícil', target: 2, desc: 'Razonar con varias regiones' }),
    expert: Object.freeze({ name: 'Experto', target: 3, desc: 'Necesita probar hipótesis' })
  }),
  levelOrder: Object.freeze(['easy', 'hard', 'expert'])
});
