/* Datos mínimos de Slitherlink para el selector y el menú de niveles: se cargan sin el motor ni la interfaz. */
import { difficulty, LEVEL_ORDER, OLD_LEVELS } from '../../core/levels.js';
import { t } from '../../i18n/index.js';

export default Object.freeze({
  id: 'slitherlink',
  name: t('games.slitherlink.name'),
  /** Frase corta bajo el nombre en el selector. */
  tagline: t('games.slitherlink.tagline'),
  icon: 'slither',
  storageKey: 'puzzlesgo.slitherlink.v1',
  /** `target` es el nivel del generador (engine/generator.js): tablero más grande y más técnicas. */
  levels: difficulty({ easy: 1, hard: 3, expert: 4 }),
  levelOrder: LEVEL_ORDER,
  /** Niveles de antes, para pasar récords y partidas (core/level-migration.js). */
  oldLevels: OLD_LEVELS.four
});
