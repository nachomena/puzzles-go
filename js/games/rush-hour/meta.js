/* Datos mínimos de Rush Hour para el selector y el menú de niveles: se cargan sin el motor ni la interfaz. */
import { levelSummary } from '../../core/stats.js';

export default Object.freeze({
  id: 'rush-hour',
  name: 'Rush Hour',
  icon: 'car',
  storageKey: 'puzzlesgo.rushhour.v1',
  /** `target` es el nivel del generador: más alto = más movimientos para sacar el coche rojo. */
  levels: Object.freeze({
    starter: Object.freeze({ name: 'Principiante', target: 1 }),
    junior:  Object.freeze({ name: 'Fácil',        target: 2 }),
    expert:  Object.freeze({ name: 'Medio',        target: 3 }),
    master:  Object.freeze({ name: 'Difícil',      target: 4 }),
    wizard:  Object.freeze({ name: 'Experto',      target: 5 })
  }),
  levelOrder: Object.freeze(['starter', 'junior', 'expert', 'master', 'wizard']),
  /** Bajo cada nivel, el récord de tiempo y la partida con menos movimientos. */
  levelMeta: (L, stats) => [levelSummary(stats[L]), stats[L]?.bestMoves ? `${stats[L].bestMoves} mov.` : ''].filter(Boolean).join(' · ')
});
