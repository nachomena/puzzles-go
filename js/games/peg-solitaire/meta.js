/* Datos mínimos del Solitario para el selector y el menú: se cargan sin el motor ni la interfaz. */
import { t } from '../../i18n/index.js';

export default Object.freeze({
  id: 'peg-solitaire',
  name: t('games.peg-solitaire.name'),
  /** Frase corta bajo el nombre en el selector. */
  tagline: t('games.peg-solitaire.tagline'),
  icon: 'peg',
  storageKey: 'puzzlesgo.pegsolitaire.v1',
  /** Un solo nivel, así que no hay menú: se entra directo a la partida. El tablero se elige en Ajustes. */
  levels: Object.freeze({
    classic: Object.freeze({ name: t('games.peg-solitaire.level'), target: 1 })
  }),
  levelOrder: Object.freeze(['classic']),
  /** Las estadísticas van por tablero, no por nivel (ver index.js#statsKey). */
  statsRows: Object.freeze([
    Object.freeze({ key: 'english', name: t('games.peg-solitaire.english') }),
    Object.freeze({ key: 'european', name: t('games.peg-solitaire.european') })
  ])
});
