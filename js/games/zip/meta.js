/* Datos mínimos de Zip para el selector y el menú de niveles: se cargan sin el motor ni la interfaz. */
export default Object.freeze({
  id: 'zip',
  name: 'Zip',
  icon: 'zip',
  storageKey: 'puzzlesgo.zip.v1',
  /** `target` es el nivel del generador: tablero más grande y menos números cuanto más alto. */
  levels: Object.freeze({
    starter: Object.freeze({ name: 'Principiante', target: 1 }),
    junior:  Object.freeze({ name: 'Fácil',        target: 2 }),
    expert:  Object.freeze({ name: 'Medio',        target: 3 }),
    master:  Object.freeze({ name: 'Difícil',      target: 4 }),
    wizard:  Object.freeze({ name: 'Experto',      target: 5 })
  }),
  levelOrder: Object.freeze(['starter', 'junior', 'expert', 'master', 'wizard'])
});
