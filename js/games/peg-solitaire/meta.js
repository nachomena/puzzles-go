/* Minimal Peg Solitaire data for the picker and the menu: loaded without the engine or the interface. */
import { t } from '../../i18n/index.js';

export default Object.freeze({
  id: 'peg-solitaire',
  name: t('games.peg-solitaire.name'),
  /** Short line under the name in the picker. */
  tagline: t('games.peg-solitaire.tagline'),
  icon: 'peg',
  storageKey: 'puzzlesgo.pegsolitaire.v1',
  /** A single level, so there is no menu: it goes straight into the game. The board is chosen in Settings. */
  levels: Object.freeze({
    classic: Object.freeze({ name: t('games.peg-solitaire.level'), target: 1 })
  }),
  levelOrder: Object.freeze(['classic']),
  /** Statistics go per board, not per level (see index.js#statsKey). */
  statsRows: Object.freeze([
    Object.freeze({ key: 'english', name: t('games.peg-solitaire.english') }),
    Object.freeze({ key: 'european', name: t('games.peg-solitaire.european') })
  ])
});
