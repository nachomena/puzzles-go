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

/** Botón de volver con texto (a dónde se vuelve), a la izquierda de las barras de abajo. */
export const backPill = (label, attrs = '') =>
  `<button class="back-pill" data-action="back"${attrs ? ' ' + attrs : ''}>${svgIcon('back')}<span>${label}</span></button>`;

/** Barra inferior fija: a la izquierda, volver; a la derecha, pista (si el juego la tiene), ajustes, ayuda y reiniciar. */
export const dock = ({ hint = true, back = 'Menú' } = {}) =>
  `<nav class="dock">` + backPill(back) +
  `<div class="dock__actions">` +
  (hint ? `<button class="icon-btn hint-btn" data-action="hint" aria-label="Pista">${svgIcon('hint')}<span class="hint-btn__wait" data-hud="hint-wait"></span></button>` : '') +
  iconButton('open', 'gear', 'Ajustes', { attrs: 'data-target="settings"' }) +
  iconButton('open', 'help', 'Cómo se juega', { attrs: 'data-target="help"' }) +
  iconButton('reset', 'reset', 'Reiniciar la partida') +
  `</div></nav>`;

/**
 * Pantalla de juego completa: cabecera, tablero, lo propio del juego y barra inferior.
 * `boardHtml` sustituye al tablero estándar si el juego necesita otro marco (p. ej. flechas alrededor).
 */
export const playScreen = ({ id, name, boardClass = '', boardHtml = null, controls, hint = true, back = 'Menú' }) =>
  `<section id="play-${id}" class="screen" data-game="${id}" aria-label="${name}">` +
  `<div class="wrap wrap--game">${hud()}<div class="play-fit">${boardHtml ?? board(boardClass)}</div>${controls}${dock({ hint, back })}</div></section>`;

/**
 * Barra de herramientas y teclado de números del 1 al n (Sudoku, KenKen): reiniciar, número o lápiz,
 * goma, deshacer y rehacer.
 */
/**
 * Notas de lápiz de una casilla (Sudoku, KenKen): la cifra k en su hueco si está en `mask`. La del
 * número resaltado (`same`) va destacada, como las casillas con ese número.
 */
export const notesHtml = (mask, n, same = 0, cls = '') =>
  `<span class="sd-notes${cls ? ' ' + cls : ''}">` +
  Array.from({ length: n }, (_, k) => mask & (1 << k) ? `<i${k + 1 === same ? ' class="is-same"' : ''}>${k + 1}</i>` : '<i></i>').join('') +
  '</span>';

export const digitControls = n =>
  `<div class="toolbar">` +
  toolPicker([
    { tool: 'pen', icon: 'number', label: 'Escribir número' },
    { tool: 'pencil', icon: 'pencil', label: 'Anotar candidatos' }
  ]) +
  `<div class="toolbar__group">` +
  iconButton('erase', 'erase', 'Borrar casilla') +
  iconButton('undo', 'undo', 'Deshacer') +
  iconButton('redo', 'redo', 'Rehacer') +
  `</div></div>` +
  `<div class="keypad" data-keypad style="--keys:${n}">` +
  Array.from({ length: n }, (_, k) => k + 1).map(d => `<button class="keypad__key" data-action="digit" data-digit="${d}" aria-label="${d}">${d}</button>`).join('') +
  `</div>`;
