/* Datos mínimos de Rush Hour para el selector y el menú de niveles: se cargan sin el motor ni la interfaz. */
import { difficulty, LEVEL_ORDER, OLD_LEVELS } from '../../core/levels.js';
import { levelSummary } from '../../core/stats.js';

export default Object.freeze({
  id: 'rush-hour',
  name: 'Rush Hour',
  /** Frase corta bajo el nombre en el selector. */
  tagline: 'Saca el coche rojo',
  icon: 'car',
  storageKey: 'puzzlesgo.rushhour.v1',
  /** `target` es el nivel del generador: más alto = más movimientos para sacar el coche rojo. */
  levels: difficulty({ easy: 2, hard: 4, expert: 5 }),
  levelOrder: LEVEL_ORDER,
  /** Niveles de antes, para pasar récords y partidas (core/level-migration.js). */
  oldLevels: OLD_LEVELS.five,
  /** Bajo cada nivel, el récord de tiempo y la partida con menos movimientos. */
  levelMeta: (L, stats) => [levelSummary(stats[L]), stats[L]?.bestMoves ? `${stats[L].bestMoves} mov.` : ''].filter(Boolean).join(' · ')
});
