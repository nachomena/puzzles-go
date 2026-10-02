/* Datos mínimos del Solitario para el selector y el menú: se cargan sin el motor ni la interfaz. */
export default Object.freeze({
  id: 'peg-solitaire',
  name: 'Solitario',
  tagline: 'Salta y retira bolas hasta dejar solo una',
  icon: 'peg',
  storageKey: 'puzzlesgo.pegsolitaire.v1',
  /** Una sola partida: el tablero (inglés o europeo) se elige en Ajustes. */
  levels: Object.freeze({
    classic: Object.freeze({ name: 'Partida', target: 1, desc: 'Tablero inglés o europeo, en Ajustes' })
  }),
  levelOrder: Object.freeze(['classic'])
});
