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
 * iOS, en la app de la pantalla de inicio con barra de estado translúcida, calcula la ventana más
 * corta que la pantalla (le resta la barra de estado) mientras la página no pase de ese alto: lo fijo
 * abajo flota por encima del borde y la franja de abajo queda sin dibujar. En las pantallas más altas
 * que la ventana (p. ej. la tabla de Katamino) llega hasta el borde. Así que, si hay hueco, la página
 * mide como mínimo la pantalla entera (clase has-viewport-gap, css/base.css).
 * El hueco se guarda en --viewport-gap y no vuelve a bajar aunque la ventana crezca: con la barra ya en
 * el borde, la franja cubre el indicador de inicio y se descuenta del margen (--safe-bottom, css/tokens.css).
 * Solo en modo app: en el navegador la diferencia es la de sus barras, que sí ocupan sitio.
 */
export function fixStandaloneViewport(){
  const standalone = navigator.standalone || matchMedia('(display-mode: standalone)').matches;
  if (!standalone) return;
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100lvh;visibility:hidden;pointer-events:none';
  document.body.appendChild(probe);
  let gap = 0;
  const update = () => {
    const now = Math.round(probe.getBoundingClientRect().height - window.innerHeight);
    if (now <= gap) return;
    gap = now;
    document.documentElement.style.setProperty('--viewport-gap', gap + 'px');
    document.documentElement.classList.add('has-viewport-gap');
  };
  update();
  window.addEventListener('resize', update);
}
