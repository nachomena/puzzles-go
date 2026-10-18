export const byId = id => document.getElementById(id);

/** Adds a stylesheet and waits for it to load; if it fails it carries on (better no styles than no game). */
export function loadStylesheet(href){
  const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href });
  return new Promise(resolve => {
    link.onload = link.onerror = () => resolve();
    document.head.appendChild(link);
  });
}

/** Restarts a CSS animation even if the class was already set. */
export function restartAnimation(el, className){
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}

/** Access to localStorage that never throws (private mode, blocked cookies…). */
export function safeStorage(){
  try { return window.localStorage; } catch (e){ return null; }
}
