/** Shrinks `el`'s font so it fits on one line next to its siblings in the container. */
export function fitToWidth(el){
  if (!el || !el.offsetParent) return;
  el.style.fontSize = '';
  const parent = el.parentElement, cs = getComputedStyle(parent);
  let avail = parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  for (const sib of parent.children) if (sib !== el) avail -= sib.offsetWidth + (parseFloat(cs.columnGap) || 0);
  const base = parseFloat(getComputedStyle(el).fontSize);
  if (el.scrollWidth > avail) el.style.fontSize = Math.floor(base * avail / el.scrollWidth) + 'px';
}

/** Keeps it fitted when the size changes or when the fonts finish loading. */
export function keepFitted(el){
  const fit = () => fitToWidth(el);
  window.addEventListener('resize', fit);
  document.fonts?.ready?.then(fit);
  fit();
  return fit;
}
