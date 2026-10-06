/* Datos mínimos del Solitario para el selector y el menú: se cargan sin el motor ni la interfaz. */
export default Object.freeze({
  id: 'peg-solitaire',
  name: 'Solitario',
  tagline: 'Salta y retira bolas hasta dejar solo una',
  icon: 'peg',
  storageKey: 'puzzlesgo.pegsolitaire.v1',
  /** Un solo nivel, así que no hay menú: se entra directo a la partida. El tablero se elige en Ajustes. */
  levels: Object.freeze({
    classic: Object.freeze({ name: 'Solitario', target: 1, desc: 'Tablero inglés o europeo, en Ajustes' })
  }),
  levelOrder: Object.freeze(['classic']),
  /** Las estadísticas van por tablero, no por nivel (ver index.js#statsKey). */
  statsRows: Object.freeze([
    Object.freeze({ key: 'english', name: 'Inglés' }),
    Object.freeze({ key: 'european', name: 'Europeo' })
  ])
});
