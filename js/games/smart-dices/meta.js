/* Datos mínimos de Smart Dices para el selector y el menú de niveles: se cargan sin el motor ni la interfaz. */
export default Object.freeze({
  id: 'smart-dices',
  name: 'Smart Dices',
  icon: 'dice',
  storageKey: 'puzzlesgo.smartdices.v1',
  /** Grupo del selector de juegos (ver ui/hub-view.js); dentro se muestra con su nombre corto. */
  group: 'smart',
  shortName: 'Dices',
  /** `target` es el nivel del generador (más alto = menos pistas). */
  levels: Object.freeze({
    starter: Object.freeze({ name: 'Principiante', target: 1 }),
    junior:  Object.freeze({ name: 'Fácil',        target: 2 }),
    expert:  Object.freeze({ name: 'Medio',        target: 3 }),
    master:  Object.freeze({ name: 'Difícil',      target: 4 }),
    wizard:  Object.freeze({ name: 'Experto',      target: 5 })
  }),
  levelOrder: Object.freeze(['starter', 'junior', 'expert', 'master', 'wizard'])
});
