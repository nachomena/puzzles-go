/* Figura pequeña para la ayuda de un juego: un ejemplo dibujado (SVG) con una línea que lo explica.
   Los colores salen de las clases .hf-* (css/overlays.css), los mismos del juego. */

/** Marcado de la figura: `svg` es el dibujo y `caption` lo que se ve en él. */
export const helpFigure = (svg, caption) =>
  `<figure class="help-fig">${svg}<figcaption>${caption}</figcaption></figure>`;

/** Una casilla cuadrada de lado 1 en (x, y), con un poco de hueco: para cuadrículas de ejemplo. */
export const hfCell = (x, y, cls) => `<rect class="${cls}" x="${x + .04}" y="${y + .04}" width=".92" height=".92" rx=".1"/>`;

/** Texto centrado en la casilla (x, y). */
export const hfText = (x, y, text, cls = 'hf-num') => `<text class="${cls}" x="${x + .5}" y="${y + .5}" dy=".35em" text-anchor="middle">${text}</text>`;
