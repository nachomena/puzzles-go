/* Datos mínimos de Slitherlink para el selector y el menú de niveles: se cargan sin el motor ni la interfaz. */
import { difficulty, LEVEL_ORDER, OLD_LEVELS } from '../../core/levels.js';

export default Object.freeze({
  id: 'slitherlink',
  name: 'Slitherlink',
  /** Frase corta bajo el nombre en el selector. */
  tagline: 'Un solo lazo entre los puntos',
  icon: 'slither',
  storageKey: 'puzzlesgo.slitherlink.v1',
  /** `target` es el nivel del generador (engine/generator.js): tablero más grande y más técnicas. */
  levels: difficulty({ easy: 1, hard: 3, expert: 4 }),
  levelOrder: LEVEL_ORDER,
  /** Niveles de antes, para pasar récords y partidas (core/level-migration.js). */
  oldLevels: OLD_LEVELS.four
});
