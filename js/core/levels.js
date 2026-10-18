/* Los tres niveles de dificultad, iguales en todos los juegos: Fácil, Difícil y Experto. Cada juego solo dice
   qué nivel de su generador (`target`) usa en cada uno. Katamino y el Solitario tienen los suyos (no son
   dificultades sino tableros que se eligen). */
import { t } from '../i18n/index.js';

export const LEVEL_ORDER = Object.freeze(['easy', 'hard', 'expert']);

/** Niveles de un juego a partir del `target` del generador de cada uno: { easy: 2, hard: 4, expert: 5 }. */
export const difficulty = targets =>
  Object.freeze(Object.fromEntries(LEVEL_ORDER.map(L => [L, Object.freeze({ name: t(`levels.${L}`), target: targets[L] })])));

/**
 * Niveles de antes (id viejo → id nuevo), para pasar las estadísticas, el registro y la partida en curso
 * (ver core/level-migration.js). Al juntar dos niveles en uno se queda lo mejor de los dos.
 */
export const OLD_LEVELS = Object.freeze({
  /** Principiante · Fácil · Medio · Difícil · Experto (el id `expert` era el Medio). */
  five: Object.freeze({ starter: 'easy', junior: 'easy', expert: 'hard', master: 'hard', wizard: 'expert' }),
  /** Fácil · Medio · Difícil · Experto. */
  four: Object.freeze({ easy: 'easy', medium: 'hard', hard: 'hard', expert: 'expert' }),
  /** Sudoku: Fácil · Medio · Difícil (el Difícil de antes es el Experto). */
  three: Object.freeze({ easy: 'easy', medium: 'hard', hard: 'expert' })
});
