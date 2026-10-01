/* Datos mínimos de Smart Circuit para el selector y el menú de niveles: se cargan sin el motor ni la interfaz. */
export default Object.freeze({
  id: 'smart-circuit',
  name: 'Smart Circuit',
  tagline: '10 piezas · une los puntos con caminos',
  icon: 'circuit',
  storageKey: 'puzzlesgo.smartcircuit.v1',
  /** `target` es el nivel del generador; las pistas siguen el cuadernillo original. */
  levels: Object.freeze({
    starter: Object.freeze({ name: 'Principiante', target: 1, desc: 'Ves los caminos y algunas piezas' }),
    junior:  Object.freeze({ name: 'Fácil',        target: 2, desc: 'Ves la silueta de todas las piezas' }),
    expert:  Object.freeze({ name: 'Medio',        target: 3, desc: 'Ves la forma de los caminos' }),
    master:  Object.freeze({ name: 'Difícil',      target: 4, desc: 'Algunas piezas con punto colocadas' }),
    wizard:  Object.freeze({ name: 'Experto',      target: 5, desc: 'Solo los puntos' })
  }),
  levelOrder: Object.freeze(['starter', 'junior', 'expert', 'master', 'wizard'])
});
