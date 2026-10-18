/* Swipe back from the left edge, as in the phone's navigation: the finger drags an arrow and, if it
   is released past half the way, it goes back. */
const EDGE = 20;          // px from the edge where the gesture starts
const TRIGGER = .3;       // fraction of the width that has to be covered

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

  // the arrow stops at the same edge as the back button of the bottom bars (.back-pill)
  const stopAt = () => {
    const max = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--content-max')) || 560;
    return Math.max(14, window.innerWidth / 2 - max / 2 + 14);
  };
  const show = (dx, armed) => {
    tip.style.transform = `translate(${Math.min(dx - 56, stopAt())}px, -50%)`;
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

  // A touch on the edge belongs to the gesture: it doesn't reach the boards (it doesn't start dragging a piece)
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
      if (Math.abs(dy) > 12 && Math.abs(dy) > dx){ end(false); return; }   // it is a vertical scroll
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
