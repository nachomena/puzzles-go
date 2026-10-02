/* Arrastrar y tocar piezas. Un toque (sin moverse) gira la pieza; un arrastre la lleva con el
   dedo a tamaño de tablero y, al soltar, avisa de dónde ha caído. */
const DRAG_THRESHOLD = 6;

/**
 * @param {HTMLElement} root  contenedor de tablero y bandeja
 * @param {object} o
 * @param {(piece:number) => boolean} o.canMove
 * @param {() => number} o.cellSize           px de una casilla del tablero
 * @param {(piece:number) => void} o.onTap
 * @param {(piece:number, rect:DOMRect) => void} o.onDrop   rect = posición final de la pieza
 */
export function bindPieceDrag(root, { canMove, cellSize, onTap, onDrop }){
  let drag = null;

  root.addEventListener('pointerdown', e => {
    const el = e.target.closest('[data-piece]');
    if (!el || drag) return;
    const piece = Number(el.dataset.piece);
    if (!canMove(piece)) return;
    e.preventDefault();
    try { root.setPointerCapture(e.pointerId); } catch (_){}
    const rect = el.getBoundingClientRect();
    drag = { id: e.pointerId, piece, el, x: e.clientX, y: e.clientY,
      fx: (e.clientX - rect.left) / rect.width, fy: (e.clientY - rect.top) / rect.height, ghost: null };
  });

  root.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.ghost){
      if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < DRAG_THRESHOLD) return;
      // Empieza el arrastre: una copia de la pieza a tamaño de tablero sigue al dedo
      const cell = cellSize(), g = drag.el.cloneNode(true);
      const w = Number(getComputedStyle(drag.el).getPropertyValue('--w')), h = Number(getComputedStyle(drag.el).getPropertyValue('--h'));
      g.classList.remove('is-tray');
      g.classList.add('is-ghost');
      Object.assign(g.style, { width: w * cell + 'px', height: h * cell + 'px', left: '0', top: '0' });
      // dentro de la pantalla del juego, para que herede sus colores (variables CSS)
      (root.closest('.screen') || document.body).appendChild(g);
      drag.el.classList.add('is-lifted');
      drag.ghost = g;
      drag.gw = w * cell; drag.gh = h * cell;
    }
    const left = e.clientX - drag.fx * drag.gw, top = e.clientY - drag.fy * drag.gh;
    drag.ghost.style.transform = `translate(${left}px, ${top}px)`;
    drag.rect = { left, top, width: drag.gw, height: drag.gh, right: left + drag.gw, bottom: top + drag.gh };
  });

  const finish = (e, cancelled) => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag;
    drag = null;
    d.ghost?.remove();
    d.el.classList.remove('is-lifted');
    if (cancelled) return;
    if (!d.ghost) onTap(d.piece);
    else if (d.rect) onDrop(d.piece, d.rect);
  };
  root.addEventListener('pointerup', e => finish(e, false));
  root.addEventListener('pointercancel', e => finish(e, true));
  root.addEventListener('contextmenu', e => { if (e.target.closest('[data-piece]')) e.preventDefault(); });
}
