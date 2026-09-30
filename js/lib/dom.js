export const byId = id => document.getElementById(id);

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
