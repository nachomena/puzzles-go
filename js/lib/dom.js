export const byId = id => document.getElementById(id);

/** Añade una hoja de estilos y espera a que cargue; si falla sigue igual (mejor sin estilos que sin juego). */
export function loadStylesheet(href){
  const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href });
  return new Promise(resolve => {
    link.onload = link.onerror = () => resolve();
    document.head.appendChild(link);
  });
}

/** Reinicia una animación CSS aunque la clase ya estuviera puesta. */
export function restartAnimation(el, className){
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}

/** Acceso a localStorage que nunca lanza (modo privado, cookies bloqueadas…). */
export function safeStorage(){
  try { return window.localStorage; } catch (e){ return null; }
}
