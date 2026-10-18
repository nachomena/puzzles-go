/* Datos mínimos de Star Battle para el selector y el menú de niveles: se cargan sin el motor ni la interfaz del juego. */
import { difficulty, LEVEL_ORDER } from '../../core/levels.js';
import { t } from '../../i18n/index.js';

export default Object.freeze({
  id: 'star-battle',
  name: t('games.star-battle.name'),
  /** Frase corta bajo el nombre en el selector. */
  tagline: t('games.star-battle.tagline'),
  icon: 'star',
  storageKey: 'starbattlego.v2',   // clave antigua: conserva partidas y estadísticas
  /** `target` es el nivel del solucionador lógico que exige el tablero. */
  levels: difficulty({ easy: 1, hard: 2, expert: 3 }),
  levelOrder: LEVEL_ORDER
});
