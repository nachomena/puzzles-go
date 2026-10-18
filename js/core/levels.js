/* The three difficulty levels, the same in every game: Easy, Hard and Expert. Each game only says
   which level of its generator (`target`) it uses for each one. Peg Solitaire has its own (they aren't
   difficulties but boards that are chosen). */
import { t } from '../i18n/index.js';

export const LEVEL_ORDER = Object.freeze(['easy', 'hard', 'expert']);

/** A game's levels from the generator `target` of each one: { easy: 2, hard: 4, expert: 5 }. */
export const difficulty = targets =>
  Object.freeze(Object.fromEntries(LEVEL_ORDER.map(L => [L, Object.freeze({ name: t(`levels.${L}`), target: targets[L] })])));

/**
 * Old levels (old id → new id), to move statistics, the game log and the game in progress
 * (see core/level-migration.js). When two levels become one, the best of both is kept.
 */
export const OLD_LEVELS = Object.freeze({
  /** Beginner · Easy · Medium · Hard · Expert (the `expert` id used to be Medium). */
  five: Object.freeze({ starter: 'easy', junior: 'easy', expert: 'hard', master: 'hard', wizard: 'expert' }),
  /** Easy · Medium · Hard · Expert. */
  four: Object.freeze({ easy: 'easy', medium: 'hard', hard: 'hard', expert: 'expert' }),
  /** Sudoku: Easy · Medium · Hard (the old Hard is now Expert). */
  three: Object.freeze({ easy: 'easy', medium: 'hard', hard: 'expert' })
});
