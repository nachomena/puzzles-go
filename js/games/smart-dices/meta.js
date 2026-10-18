/* Datos mínimos de Smart Dices para el selector y el menú de niveles: se cargan sin el motor ni la interfaz. */
import { difficulty, LEVEL_ORDER, OLD_LEVELS } from '../../core/levels.js';
import { t } from '../../i18n/index.js';

export default Object.freeze({
  id: 'smart-dices',
  name: t('games.smart-dices.name'),
  /** Frase corta bajo el nombre en el selector. */
  tagline: t('games.smart-dices.tagline'),
  icon: 'dice',
  storageKey: 'puzzlesgo.smartdices.v1',
  /** Grupo del selector de juegos (ver ui/hub-view.js). */
  group: 'smart',
  /** `target` es el nivel del generador (más alto = menos pistas). */
  levels: difficulty({ easy: 2, hard: 4, expert: 5 }),
  levelOrder: LEVEL_ORDER,
  /** Niveles de antes, para pasar récords y partidas (core/level-migration.js). */
  oldLevels: OLD_LEVELS.five
});
