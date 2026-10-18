/* Star Battle's own markup: game controls and help text. */
import { toolPicker, undoRedo, svgIcon, inlineIcon } from '../../ui/templates.js';
import { t } from '../../i18n/index.js';

export const controls = () =>
  `<div class="toolbar">` +
  toolPicker([
    { tool: 'star', icon: 'star', label: t('games.star-battle.toolStar') },
    { tool: 'try', icon: 'star', label: t('games.star-battle.toolTry') }
  ]) +
  undoRedo() +
  `</div>`;

const demo = () => `
  <div class="demo" aria-hidden="true">
    <div class="cell"></div>→<div class="cell cell--x">${svgIcon('x')}</div>→<div class="cell cell--star">${svgIcon('star')}</div>→<div class="cell"></div>
  </div>`;

export const help = () => t('games.star-battle.help', { demo: demo(), try: inlineIcon('star', 'inline-icon--try') });
