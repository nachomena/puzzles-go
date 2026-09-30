/** Reduce la fuente de `el` para que quepa en una línea dentro de su contenedor. */
export function fitToWidth(el){
  if (!el || !el.offsetParent) return;
  el.style.fontSize = '';
  const parent = el.parentElement;
  const avail = parent.clientWidth - parseFloat(getComputedStyle(parent).paddingLeft) * 2;
  const base = parseFloat(getComputedStyle(el).fontSize);
  if (el.scrollWidth > avail) el.style.fontSize = Math.floor(base * avail / el.scrollWidth) + 'px';
}

/** Mantiene el ajuste al cambiar el tamaño o al terminar de cargar las fuentes. */
export function keepFitted(el){
  const fit = () => fitToWidth(el);
  window.addEventListener('resize', fit);
  document.fonts?.ready?.then(fit);
  fit();
  return fit;
}
