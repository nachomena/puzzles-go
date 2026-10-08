/**
 * Registra el service worker para jugar sin conexión (solo en http/https).
 * `onUpdate` se llama cuando una versión nueva toma el control: basta con recargar para usarla,
 * sin reinstalar la app (borrar el icono de la pantalla de inicio borra también el progreso).
 */
export function registerServiceWorker({ url = 'sw.js', onUpdate } = {}){
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  const sw = navigator.serviceWorker, hadController = !!sw.controller;
  // la primera instalación también toma el control, pero eso no es una versión nueva
  sw.addEventListener('controllerchange', () => { if (hadController) onUpdate?.(); });
  const register = () => sw.register(url).then(reg => {
    // la app de la pantalla de inicio puede seguir abierta días: al volver a ella se busca otra versión
    document.addEventListener('visibilitychange', () => { if (!document.hidden) reg.update().catch(() => {}); });
  }).catch(() => {});
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register);
}

/** Pide que el navegador no borre los datos guardados aunque falte espacio (si lo permite). */
export function requestPersistentStorage(){
  try {
    navigator.storage?.persisted?.().then(done => done || navigator.storage.persist()).catch(() => {});
  } catch (e){ /* sin soporte */ }
}
