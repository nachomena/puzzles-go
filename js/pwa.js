/** Registra el service worker para jugar sin conexión (solo en http/https). */
export function registerServiceWorker(url = 'sw.js'){
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  const register = () => navigator.serviceWorker.register(url).catch(() => {});
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register);
}
