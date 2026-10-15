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

/**
 * iOS, en la app de la pantalla de inicio con barra de estado translúcida, a veces calcula la ventana
 * más corta que la pantalla (le resta la barra de estado) y no dibuja nada en la franja de abajo que
 * queda fuera. Mide esa franja y la deja en --viewport-gap: como ya cubre el indicador de inicio, se
 * descuenta del margen inferior (--safe-bottom en css/tokens.css) en vez de sumarse a él.
 * Solo en modo app: en el navegador la diferencia es la de sus barras, que sí ocupan sitio.
 */
export function fixStandaloneViewport(){
  const standalone = navigator.standalone || matchMedia('(display-mode: standalone)').matches;
  if (!standalone) return;
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100lvh;visibility:hidden;pointer-events:none';
  document.body.appendChild(probe);
  const update = () => {
    const gap = Math.max(0, Math.round(probe.getBoundingClientRect().height - window.innerHeight));
    document.documentElement.style.setProperty('--viewport-gap', gap + 'px');
  };
  update();
  window.addEventListener('resize', update);
}
