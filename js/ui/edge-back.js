/* Volver deslizando desde el borde izquierdo, como en la navegación del móvil: el dedo arrastra una
   flecha y, si se suelta pasada la mitad del recorrido, se vuelve atrás. */
const EDGE = 20;          // px desde el borde donde empieza el gesto
const TRIGGER = .3;       // fracción del ancho que hay que recorrer
const MAX_PULL = 90;      // px que se mueve la flecha como mucho

/**
 * @param {{ enabled: () => boolean, onBack: () => void }} o
 */
export function bindEdgeBack({ enabled, onBack }){
  const tip = document.createElement('div');
  tip.className = 'edge-back';
  tip.setAttribute('aria-hidden', 'true');
  tip.innerHTML = '<svg viewBox="0 0 24 24"><use href="#i-back"/></svg>';
  document.body.appendChild(tip);
  let g = null;

  const show = (dx, armed) => {
    tip.style.transform = `translate(${Math.min(dx, MAX_PULL) - 56}px, -50%)`;
    tip.classList.toggle('is-armed', armed);
  };
  const end = fire => {
    if (!g) return;
    const armed = g.armed && g.started;
    g = null;
    tip.classList.remove('is-on', 'is-armed');
    tip.style.transform = '';
    if (fire && armed) onBack();
  };

  // El toque en el borde es del gesto: no llega a los tableros (no empieza a arrastrar una pieza)
  document.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch' && e.clientX <= EDGE && enabled()) e.stopPropagation();
  }, true);

  document.addEventListener('touchstart', e => {
    const t = e.touches[0];
    if (e.touches.length !== 1 || t.clientX > EDGE || !enabled()) return;
    g = { x: t.clientX, y: t.clientY, started: false, armed: false };
    tip.style.top = `${t.clientY}px`;
  }, { passive: true, capture: true });

  document.addEventListener('touchmove', e => {
    if (!g) return;
    const t = e.touches[0], dx = t.clientX - g.x, dy = t.clientY - g.y;
    if (!g.started){
      if (Math.abs(dy) > 12 && Math.abs(dy) > dx){ end(false); return; }   // es un desplazamiento vertical
      if (dx < 10) return;
      g.started = true;
      tip.classList.add('is-on');
    }
    g.armed = dx > window.innerWidth * TRIGGER;
    show(dx, g.armed);
  }, { passive: true, capture: true });

  document.addEventListener('touchend', () => end(true), { capture: true });
  document.addEventListener('touchcancel', () => end(false), { capture: true });
}
