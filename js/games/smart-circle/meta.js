/* Datos mínimos de Smart Circle para el selector y el menú de niveles: se cargan sin el motor ni la interfaz. */
export default Object.freeze({
  id: 'smart-circle',
  name: 'Smart Circle',
  icon: 'circle',
  storageKey: 'puzzlesgo.smartcircle.v1',
  /** Grupo del selector de juegos (ver ui/hub-view.js); dentro se muestra con su nombre corto. */
  group: 'smart',
  shortName: 'Circle',
  /** `target` es el nivel del generador; las pistas siguen el cuadernillo original. */
  levels: Object.freeze({
    starter: Object.freeze({ name: 'Principiante', target: 1 }),
    junior:  Object.freeze({ name: 'Fácil',        target: 2 }),
    expert:  Object.freeze({ name: 'Medio',        target: 3 }),
    master:  Object.freeze({ name: 'Difícil',      target: 4 }),
    wizard:  Object.freeze({ name: 'Experto',      target: 5 })
  }),
  levelOrder: Object.freeze(['starter', 'junior', 'expert', 'master', 'wizard'])
});
