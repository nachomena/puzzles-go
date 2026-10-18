/* Peg Solitaire configuration. */
import meta from './meta.js';
import { t } from '../../i18n/index.js';

export const LEVELS = meta.levels;

/** No tools: tap a ball and then the hole it jumps to (or drag it). */
export const TOOL = Object.freeze({ MOVE: 'move' });

export const DEFAULT_SETTINGS = Object.freeze({ board: 'english', timer: true });

export const SETTINGS = Object.freeze([
  { key: 'board', title: t('games.peg-solitaire.board'), desc: t('games.peg-solitaire.boardDesc'),
    options: [{ value: 'english', label: `${t('games.peg-solitaire.english')} (33)` }, { value: 'european', label: `${t('games.peg-solitaire.european')} (37)` }] },
  { key: 'timer',  title: t('settings.timer'), desc: t('settings.timerDesc') }
]);
