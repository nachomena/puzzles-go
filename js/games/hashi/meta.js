/* Datos mínimos de Hashi para el selector y el menú de niveles: se cargan sin el motor ni la interfaz. */
import { difficulty, LEVEL_ORDER, OLD_LEVELS } from '../../core/levels.js';

export default Object.freeze({
  id: 'hashi',
  name: 'Hashi',
  /** Frase corta bajo el nombre en el selector. */
  tagline: 'Puentes entre islas',
  icon: 'hashi',
  storageKey: 'puzzlesgo.hashi.v1',
  /** `target` es el nivel del generador: tablero más grande y más islas cuanto más alto. */
  levels: difficulty({ easy: 2, hard: 4, expert: 5 }),
  levelOrder: LEVEL_ORDER,
  /** Niveles de antes, para pasar récords y partidas (core/level-migration.js). */
  oldLevels: OLD_LEVELS.five
});
