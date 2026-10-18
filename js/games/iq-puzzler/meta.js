/* Datos mínimos de Puzzler Pro para el selector y el menú de niveles: se cargan sin el motor ni la interfaz. */
import { difficulty, LEVEL_ORDER, OLD_LEVELS } from '../../core/levels.js';
import { t } from '../../i18n/index.js';

export default Object.freeze({
  id: 'iq-puzzler',
  name: t('games.iq-puzzler.name'),
  /** Frase corta bajo el nombre en el selector. */
  tagline: t('games.iq-puzzler.tagline'),
  icon: 'iqpuzzler',
  storageKey: 'puzzlesgo.iqpuzzler.v1',
  /** Grupo del selector de juegos (ver ui/hub-view.js). */
  group: 'smart',
  /** `target` es el nivel del generador (más alto = menos piezas puestas, como en el cuadernillo). */
  levels: difficulty({ easy: 2, hard: 4, expert: 5 }),
  levelOrder: LEVEL_ORDER,
  /** Niveles de antes, para pasar récords y partidas (core/level-migration.js). */
  oldLevels: OLD_LEVELS.five
});
