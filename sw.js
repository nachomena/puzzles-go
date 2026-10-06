// Sube la versión cuando publiques cambios para que el iPhone descargue la nueva
const VERSION = 'pzg-v35';
const FILES = [
  './', './index.html', './manifest.webmanifest',
  './css/base.css', './css/components.css', './css/games/peg-solitaire.css', './css/games/smart-circuit.css', './css/games/smart-dices.css',
  './css/games/star-battle.css', './css/games/sudoku.css', './css/menu.css', './css/overlays.css',
  './css/play.css', './css/tokens.css', './js/app/app.js', './js/boot-check.js', './js/config.js',
  './js/core/game-controller.js', './js/core/game-definition.js', './js/core/generator-worker.js',
  './js/core/hint-cooldown.js', './js/core/history.js', './js/core/puzzle-supply.js', './js/core/runners.js',
  './js/core/stats.js', './js/core/store.js', './js/games/catalog.js',
  './js/games/peg-solitaire/board-view.js', './js/games/peg-solitaire/config.js',
  './js/games/peg-solitaire/controller.js', './js/games/peg-solitaire/engine/generator.js',
  './js/games/peg-solitaire/engine/rules.js', './js/games/peg-solitaire/index.js',
  './js/games/peg-solitaire/meta.js', './js/games/peg-solitaire/templates.js',
  './js/games/peg-solitaire/worker.js', './js/games/smart-circuit/board-view.js',
  './js/games/smart-circuit/config.js', './js/games/smart-circuit/controller.js',
  './js/games/smart-circuit/engine/arrangements-data.js', './js/games/smart-circuit/engine/arrangements.js',
  './js/games/smart-circuit/engine/generator.js', './js/games/smart-circuit/engine/pieces.js',
  './js/games/smart-circuit/engine/solver.js', './js/games/smart-circuit/index.js',
  './js/games/smart-circuit/meta.js', './js/games/smart-circuit/piece-svg.js',
  './js/games/smart-circuit/rules.js', './js/games/smart-circuit/templates.js',
  './js/games/smart-circuit/worker.js', './js/games/smart-dices/board-view.js',
  './js/games/smart-dices/config.js', './js/games/smart-dices/controller.js',
  './js/games/smart-dices/engine/arrangements-data.js', './js/games/smart-dices/engine/arrangements.js',
  './js/games/smart-dices/engine/codec.js', './js/games/smart-dices/engine/generator.js',
  './js/games/smart-dices/engine/pieces.js', './js/games/smart-dices/engine/solver.js',
  './js/games/smart-dices/index.js', './js/games/smart-dices/meta.js', './js/games/smart-dices/rules.js',
  './js/games/smart-dices/templates.js', './js/games/smart-dices/worker.js',
  './js/games/star-battle/board-view.js', './js/games/star-battle/config.js',
  './js/games/star-battle/controller.js', './js/games/star-battle/engine/bits.js',
  './js/games/star-battle/engine/exact-solver.js', './js/games/star-battle/engine/generator.js',
  './js/games/star-battle/engine/index.js', './js/games/star-battle/engine/logic-solver.js',
  './js/games/star-battle/engine/regions.js', './js/games/star-battle/index.js',
  './js/games/star-battle/meta.js', './js/games/star-battle/rules.js', './js/games/star-battle/templates.js',
  './js/games/star-battle/worker.js', './js/games/sudoku/board-view.js', './js/games/sudoku/config.js',
  './js/games/sudoku/controller.js', './js/games/sudoku/engine/exact-solver.js',
  './js/games/sudoku/engine/generator.js', './js/games/sudoku/engine/grid.js',
  './js/games/sudoku/engine/index.js', './js/games/sudoku/engine/logic-solver.js',
  './js/games/sudoku/index.js', './js/games/sudoku/meta.js', './js/games/sudoku/rules.js',
  './js/games/sudoku/templates.js', './js/games/sudoku/worker.js', './js/lib/bits.js', './js/lib/dom.js',
  './js/lib/format.js', './js/lib/grid.js', './js/lib/iter.js', './js/lib/random.js', './js/main.js',
  './js/pwa.js', './js/ui/cell-drag.js', './js/ui/confirm-dialog.js', './js/ui/fit-text.js',
  './js/ui/game-hud.js', './js/ui/grid-board.js', './js/ui/hub-view.js', './js/ui/level-menu.js',
  './js/ui/overlays.js', './js/ui/piece-drag.js', './js/ui/settings-panel.js', './js/ui/templates.js',
  './js/ui/toast.js',
  './fonts/archivo-black.woff2', './fonts/archivo.woff2',
  './icons/icon.svg', './icons/apple-touch-icon.png', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png'
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
