// Sube la versión cuando publiques cambios para que el iPhone descargue la nueva
const VERSION = 'sbg-v2';
const FILES = [
  './', './index.html', './manifest.webmanifest',
  './css/tokens.css', './css/base.css', './css/components.css', './css/menu.css', './css/game.css', './css/overlays.css',
  './js/main.js', './js/config.js', './js/pwa.js',
  './js/lib/dom.js', './js/lib/format.js', './js/lib/grid.js', './js/lib/random.js',
  './js/engine/index.js', './js/engine/bits.js', './js/engine/exact-solver.js', './js/engine/logic-solver.js',
  './js/engine/regions.js', './js/engine/generator.js', './js/engine/worker.js',
  './js/game/store.js', './js/game/rules.js', './js/game/history.js', './js/game/runners.js',
  './js/game/puzzle-supply.js', './js/game/game-controller.js',
  './js/ui/board-view.js', './js/ui/cell-drag.js', './js/ui/fit-text.js', './js/ui/game-hud.js',
  './js/ui/icons.js', './js/ui/menu-view.js', './js/ui/overlays.js', './js/ui/settings-panel.js', './js/ui/toast.js',
  './fonts/archivo-black.woff2', './fonts/archivo.woff2',
  './icons/apple-touch-icon.png', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Red primero para la página (así ves las actualizaciones) y caché si no hay conexión
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate'){
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone(); caches.open(VERSION).then(c => c.put('./index.html', copy));
      return res;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
