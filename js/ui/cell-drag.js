/* Entrada táctil genérica sobre una rejilla: tocar y arrastrar.
   Interpola entre eventos para no saltarse casillas en arrastres rápidos.
   Salir de la rejilla termina el trazo: al volver a entrar sin soltar no se sigue marcando. */

/**
 * @param {HTMLElement} el
 * @param {object} o
 * @param {(x:number, y:number) => number} o.cellAt  índice de casilla o -1
 * @param {() => number} o.cellSize                 px por casilla
 * @param {() => boolean} o.enabled
 * @param {(i:number) => void} o.onStart
 * @param {(cells:number[]) => void} o.onEnter      casillas nuevas recorridas
 * @param {() => void} o.onEnd
 */
export function bindCellDrag(el, { cellAt, cellSize, enabled, onStart, onEnter, onEnd }){
  const SAMPLES_PER_CELL = 3;
  let drag = null;

  el.addEventListener('pointerdown', e => {
    if (drag || !enabled()) return;
    const i = cellAt(e.clientX, e.clientY);
    if (i < 0) return;
    e.preventDefault();
    try { el.setPointerCapture(e.pointerId); } catch (_){}
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, last: i };
    onStart(i);
  });

  el.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const step = cellSize() / SAMPLES_PER_CELL;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    const n = Math.max(1, Math.ceil(Math.hypot(dx, dy) / step));
    const entered = [];
    let left = false;
    for (let k = 1; k <= n; k++){
      const i = cellAt(drag.x + dx * k / n, drag.y + dy * k / n);
      if (i < 0){ left = true; break; }
      if (i === drag.last) continue;
      drag.last = i;
      entered.push(i);
    }
    drag.x = e.clientX; drag.y = e.clientY;
    if (entered.length) onEnter(entered);
    if (left) finish();
  });

  const finish = () => {
    try { el.releasePointerCapture(drag.id); } catch (_){}
    drag = null;
    onEnd();
  };
  const end = e => { if (drag && e.pointerId === drag.id) finish(); };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
  el.addEventListener('contextmenu', e => e.preventDefault());
}
