/* Datos mínimos de Smart Dices para el selector y el menú de niveles: se cargan sin el motor ni la interfaz. */
export default Object.freeze({
  id: 'smart-dices',
  name: 'Smart Dices',
  tagline: '12 piezas · 4 dados · sumas de filas y columnas',
  icon: 'dice',
  storageKey: 'puzzlesgo.smartdices.v1',
  /** `target` es el nivel del generador (más alto = menos pistas). */
  levels: Object.freeze({
    starter: Object.freeze({ name: 'Principiante', target: 1, desc: 'Varias piezas puestas y todas las sumas' }),
    junior:  Object.freeze({ name: 'Fácil',        target: 2, desc: 'Menos piezas y menos sumas' }),
    expert:  Object.freeze({ name: 'Medio',        target: 3, desc: 'Pocas piezas y dos sumas' }),
    master:  Object.freeze({ name: 'Difícil',      target: 4, desc: 'Pocas piezas y casi sin sumas' }),
    wizard:  Object.freeze({ name: 'Experto',      target: 5, desc: 'Una o dos piezas y una o dos sumas' })
  }),
  levelOrder: Object.freeze(['starter', 'junior', 'expert', 'master', 'wizard'])
});
