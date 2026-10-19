/* Markup pieces shared by the game screens. Each game builds its own with them. */
import { t } from '../i18n/index.js';

export const svgIcon = name => `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${name}"/></svg>`;

/** Icon inside a line of text (the help). */
export const inlineIcon = (name, cls = '') => svgIcon(name).replace('<svg', `<svg class="inline-icon${cls ? ' ' + cls : ''}"`);

/** Icon button with an action. `attrs` adds extra attributes (e.g. data-tool). */
export const iconButton = (action, iconName, label, { cls = 'icon-btn', attrs = '' } = {}) =>
  `<button class="${cls}" data-action="${action}" ${attrs} aria-label="${label}">${svgIcon(iconName)}</button>`;

/** Segmented tool picker: [{ tool, icon, label }]. */
export const toolPicker = (tools, label = t('common.tool')) =>
  `<div class="segmented" role="radiogroup" aria-label="${label}">` +
  tools.map(t => `<button data-action="tool" data-tool="${t.tool}" role="radio" aria-label="${t.label}">${svgIcon(t.icon)}</button>`).join('') +
  `</div>`;

export const hud = () =>
  `<div class="hud"><span data-hud="level"></span><span class="hud__time" data-hud="time">0:00</span><span data-hud="size"></span></div>`;

export const board = (extraClass = '') =>
  `<div class="board ${extraClass}" role="grid" aria-label="${t('common.board')}">` +
  `<div class="board__cells" data-board-cells></div>` +
  `<svg class="board__lines" data-board-lines preserveAspectRatio="none"></svg></div>`;

export const undoRedo = () =>
  `<div class="toolbar__group">${iconButton('undo', 'undo', t('common.undo'))}${iconButton('redo', 'redo', t('common.redo'))}</div>`;

/** Back button with text (where it goes back to), on the left of the bottom bars. */
export const backPill = (label, attrs = '') =>
  `<button class="back-pill" data-action="back"${attrs ? ' ' + attrs : ''}>${svgIcon('back')}<span>${label}</span></button>`;

/** Fixed bottom bar: back on the left; on the right, hint (if the game has it), settings, help and restart. */
export const dock = ({ hint = true, back = t('common.menu') } = {}) =>
  `<nav class="dock glass">` + backPill(back) +
  `<div class="dock__actions">` +
  (hint ? `<button class="icon-btn hint-btn" data-action="hint" aria-label="${t('common.hint')}">${svgIcon('hint')}<span class="hint-btn__wait" data-hud="hint-wait"></span></button>` : '') +
  iconButton('open', 'gear', t('common.settings'), { attrs: 'data-target="settings"' }) +
  iconButton('open', 'help', t('common.help'), { attrs: 'data-target="help"' }) +
  iconButton('reset', 'reset', t('common.reset')) +
  `</div></nav>`;

/**
 * Full game screen: header, board, the game's own controls and bottom bar.
 * `boardHtml` replaces the standard board if the game needs another frame (e.g. arrows around it).
 */
export const playScreen = ({ id, name, boardClass = '', boardHtml = null, controls, hint = true, back = t('common.menu') }) =>
  `<section id="play-${id}" class="screen" data-game="${id}" aria-label="${name}">` +
  `<div class="wrap wrap--game">${hud()}<div class="play-fit">${boardHtml ?? board(boardClass)}</div>${controls}${dock({ hint, back })}</div></section>`;

/**
 * Pencil notes of a cell (Sudoku, Calcudoku): digit k in its slot if it is in `mask`. The one of the
 * highlighted number (`same`) stands out, like the cells with that number.
 */
export const notesHtml = (mask, n, same = 0, cls = '') =>
  `<span class="sd-notes${cls ? ' ' + cls : ''}">` +
  Array.from({ length: n }, (_, k) => mask & (1 << k) ? `<i${k + 1 === same ? ' class="is-same"' : ''}>${k + 1}</i>` : '<i></i>').join('') +
  '</span>';

/**
 * Toolbar and number keypad from 1 to n (Sudoku, Calcudoku): restart, number or pencil, eraser,
 * undo and redo.
 */
export const digitControls = n =>
  `<div class="toolbar">` +
  toolPicker([
    { tool: 'pen', icon: 'number', label: t('common.pen') },
    { tool: 'pencil', icon: 'pencil', label: t('common.pencil') }
  ]) +
  `<div class="toolbar__group">` +
  iconButton('erase', 'erase', t('common.erase')) +
  iconButton('undo', 'undo', t('common.undo')) +
  iconButton('redo', 'redo', t('common.redo')) +
  `</div></div>` +
  `<div class="keypad" data-keypad style="--keys:${n}">` +
  Array.from({ length: n }, (_, k) => k + 1).map(d => `<button class="keypad__key" data-action="digit" data-digit="${d}" aria-label="${d}">${d}</button>`).join('') +
  `</div>`;
