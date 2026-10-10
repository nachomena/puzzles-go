/** Reduce la fuente de `el` para que quepa en una línea junto a sus hermanos dentro del contenedor. */
export function fitToWidth(el){
  if (!el || !el.offsetParent) return;
  el.style.fontSize = '';
  const parent = el.parentElement, cs = getComputedStyle(parent);
  let avail = parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  for (const sib of parent.children) if (sib !== el) avail -= sib.offsetWidth + (parseFloat(cs.columnGap) || 0);
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

/**
 * Tamaño común para los nombres (.level__name) de una lista: el más largo ocupa como mucho
 * `fill` del ancho disponible de su fila, sin pasar del tamaño que marca el CSS.
 */
export function fitNames(list, fill = .82){
  if (!list || !list.offsetParent) return;
  list.style.removeProperty('--name-size');
  const range = document.createRange();
  let size = Infinity;
  for (const name of list.querySelectorAll('.level__name')){
    const row = name.closest('.level'), icon = row.querySelector('.game-card__icon, .level__spark');
    const avail = row.clientWidth - (icon ? icon.offsetWidth + (parseFloat(getComputedStyle(row).columnGap) || 0) : 0);
    range.selectNodeContents(name);
    const width = range.getBoundingClientRect().width, base = parseFloat(getComputedStyle(name).fontSize);
    if (width > 0) size = Math.min(size, base * Math.min(1, avail * fill / width));
  }
  if (size < Infinity) list.style.setProperty('--name-size', Math.floor(size) + 'px');
}

/** Mantiene el ajuste de una lista al cambiar el tamaño o al terminar de cargar las fuentes. */
export function keepNamesFitted(list){
  const fit = () => fitNames(list);
  window.addEventListener('resize', fit);
  document.fonts?.ready?.then(fit);
  return fit;
}
