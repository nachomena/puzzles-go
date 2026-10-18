/* Datos mínimos de Binario para el selector y el menú de niveles: se cargan sin el motor ni la interfaz. */
import { difficulty, LEVEL_ORDER, OLD_LEVELS } from '../../core/levels.js';
import { t } from '../../i18n/index.js';

export default Object.freeze({
  id: 'binario',
  name: t('games.binario.name'),
  /** Frase corta bajo el nombre en el selector. */
  tagline: t('games.binario.tagline'),
  icon: 'binario',
  storageKey: 'puzzlesgo.binario.v1',
  /** `target` es el nivel del generador: tablero más grande cuanto más alto; el último pide mirar un paso más allá. */
  levels: difficulty({ easy: 2, hard: 4, expert: 5 }),
  levelOrder: LEVEL_ORDER,
  /** Niveles de antes, para pasar récords y partidas (core/level-migration.js). */
  oldLevels: OLD_LEVELS.five
});
