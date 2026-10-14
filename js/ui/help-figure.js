/* Figura pequeña para la ayuda de un juego: un ejemplo dibujado (SVG) con una línea que lo explica.
   Los colores salen de las clases .hf-* (css/overlays.css), los mismos del juego. */

/** Marcado de la figura: `svg` es el dibujo y `caption` lo que se ve en él. */
export const helpFigure = (svg, caption) =>
  `<figure class="help-fig">${svg}<figcaption>${caption}</figcaption></figure>`;

/** Una casilla cuadrada de lado 1 en (x, y), con un poco de hueco: para cuadrículas de ejemplo. */
export const hfCell = (x, y, cls) => `<rect class="${cls}" x="${x + .04}" y="${y + .04}" width=".92" height=".92" rx=".1"/>`;

/** Texto centrado en la casilla (x, y). */
export const hfText = (x, y, text, cls = 'hf-num') => `<text class="${cls}" x="${x + .5}" y="${y + .5}" dy=".35em" text-anchor="middle">${text}</text>`;

/* Dibujos de los gestos de los juegos de piezas (en unidades de 24, como los iconos). */

/** La pieza de cada juego, en la mitad izquierda del dibujo de arrastrar. */
const PIECES = {
  squares: '<path d="M3 4h4.5v10h5v4.5H3z"/><path d="M3 9h4.5M3 14h4.5M7.5 14v4.5"/>',
  balls: '<circle cx="5.5" cy="6" r="2.3"/><circle cx="5.5" cy="11" r="2.3"/><circle cx="5.5" cy="16" r="2.3"/><circle cx="10.5" cy="16" r="2.3"/>',
  circuit: '<rect x="2.5" y="6" width="11" height="11" rx="2"/><path d="M2.5 11.5h4a3 3 0 0 1 3 3V17"/>',
  hexagon: '<path d="M5.60 5.10L8.28 6.65L8.28 9.75L5.60 11.30L2.92 9.75L2.92 6.65ZM8.28 9.75L10.97 11.30L10.97 14.40L8.28 15.95L5.60 14.40L5.60 11.30Z"/>',
  dice: '<rect x="2.5" y="6" width="11" height="11" rx="2"/><circle cx="5.5" cy="9" r=".9"/><circle cx="8" cy="11.5" r=".9"/><circle cx="10.5" cy="14" r=".9"/>',
  rings: '<circle cx="5" cy="15.5" r="2.8"/><circle cx="9.5" cy="10" r="2.1"/><circle cx="12.6" cy="5.6" r="1.4"/>'
};
const ARROW = '<path d="M15.5 11.5h6M19 9l2.5 2.5L19 14"/>';

const GESTURE_ART = {
  // girar: una pieza cuadrada con una flecha de un cuarto de vuelta sobre su esquina
  turn: '<rect x="3.5" y="9" width="10.5" height="10.5" rx="1.5"/><path d="M12.5 4.5a7.5 7.5 0 0 1 7 7"/><path d="M17.3 9.8l2.2 1.9 1.9-2.2"/>',
  flip: '<path d="M12 3v18M8.5 7.5L4 12l4.5 4.5zM15.5 7.5L20 12l-4.5 4.5z"/>'
};

/**
 * Tira de gestos para los juegos de piezas: un dibujo y una palabra por gesto. El de arrastrar
 * ('drag') dibuja la pieza del juego: `piece` es una clave de PIECES.
 * @param {{ icon: 'drag'|'turn'|'flip', text: string, piece?: string }[]} items
 */
export const gestureStrip = items =>
  `<div class="help-gestures" aria-hidden="true">` +
  items.map(({ icon, text, piece = 'squares' }) => `<div><svg viewBox="0 0 24 24">${icon === 'drag' ? PIECES[piece] + ARROW : GESTURE_ART[icon]}</svg><span>${text}</span></div>`).join('') +
  `</div>`;
