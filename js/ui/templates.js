/* Piezas de marcado comunes a las pantallas de juego. Cada juego compone la suya con ellas. */

export const svgIcon = name => `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${name}"/></svg>`;

/** Botón de icono con acción. `attrs` añade atributos extra (p. ej. data-tool). */
export const iconButton = (action, iconName, label, { cls = 'icon-btn', attrs = '' } = {}) =>
  `<button class="${cls}" data-action="${action}" ${attrs} aria-label="${label}">${svgIcon(iconName)}</button>`;

/** Selector segmentado de herramientas: [{ tool, icon, label }]. */
export const toolPicker = (tools, label = 'Herramienta') =>
  `<div class="segmented" role="radiogroup" aria-label="${label}">` +
  tools.map(t => `<button data-action="tool" data-tool="${t.tool}" role="radio" aria-label="${t.label}">${svgIcon(t.icon)}</button>`).join('') +
  `</div>`;

export const hud = () =>
  `<div class="hud"><span data-hud="level"></span><span class="hud__time" data-hud="time">0:00</span><span data-hud="size"></span></div>`;

export const board = (extraClass = '') =>
  `<div class="board ${extraClass}" role="grid" aria-label="Tablero">` +
  `<div class="board__cells" data-board-cells></div>` +
  `<svg class="board__lines" data-board-lines preserveAspectRatio="none"></svg></div>`;

export const undoRedo = () =>
  `<div class="toolbar__group">${iconButton('undo', 'undo', 'Deshacer')}${iconButton('redo', 'redo', 'Rehacer')}</div>`;

/** Barra inferior fija: volver, pista, ajustes, ayuda. */
export const dock = () =>
  `<nav class="dock">` +
  iconButton('back', 'back', 'Volver') +
  `<button class="icon-btn hint-btn" data-action="hint" aria-label="Pista">${svgIcon('hint')}<span class="hint-btn__wait" data-hud="hint-wait"></span></button>` +
  iconButton('open', 'gear', 'Ajustes', { attrs: 'data-target="settings"' }) +
  iconButton('open', 'help', 'Cómo se juega', { attrs: 'data-target="help"' }) +
  `</nav>`;

/**
 * Pantalla de juego completa: cabecera, tablero, lo propio del juego y barra inferior.
 * `boardHtml` sustituye al tablero estándar si el juego necesita otro marco (p. ej. flechas alrededor).
 */
export const playScreen = ({ id, name, boardClass = '', boardHtml = null, controls }) =>
  `<section id="play-${id}" class="screen" data-game="${id}" aria-label="${name}">` +
  `<div class="wrap wrap--game">${hud()}${boardHtml ?? board(boardClass)}${controls}${dock()}</div></section>`;
