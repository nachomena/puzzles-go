// Sube la versión cuando publiques cambios para que el iPhone descargue la nueva
const VERSION = 'pzg-v50';
const FILES = [
  './', './index.html', './manifest.webmanifest',
  './css/base.css', './css/components.css', './css/games/akari.css', './css/games/hashi.css', './css/games/iq-puzzler.css', './css/games/katamino.css', './css/games/kenken.css', './css/games/peg-solitaire.css', './css/games/rush-hour.css', './css/games/smart-circle.css', './css/games/smart-hexagon.css', './css/games/smart-circuit.css', './css/games/smart-dices.css',
  './css/games/star-battle.css', './css/games/zip.css', './css/menu.css', './css/overlays.css',
  './css/play.css', './css/tokens.css', './js/app/app.js', './js/boot-check.js', './js/config.js',
  './js/core/digit-grid-controller.js', './js/core/game-controller.js', './js/core/grid-pieces-controller.js', './js/core/game-definition.js', './js/core/generator-worker.js',
  './js/core/hint-cooldown.js', './js/core/history.js', './js/core/puzzle-supply.js', './js/core/runners.js',
  './js/core/stats.js', './js/core/progress.js', './js/core/store.js', './js/games/catalog.js',
  './js/games/iq-puzzler/board-view.js', './js/games/iq-puzzler/config.js', './js/games/iq-puzzler/controller.js',
  './js/games/iq-puzzler/engine/generator.js', './js/games/iq-puzzler/engine/pieces.js', './js/games/iq-puzzler/index.js',
  './js/games/iq-puzzler/meta.js', './js/games/iq-puzzler/piece-svg.js', './js/games/iq-puzzler/rules.js',
  './js/games/iq-puzzler/templates.js', './js/games/iq-puzzler/worker.js',
  './js/games/kenken/board-view.js', './js/games/kenken/config.js', './js/games/kenken/controller.js',
  './js/games/kenken/engine/cages.js', './js/games/kenken/engine/generator.js', './js/games/kenken/index.js',
  './js/games/kenken/meta.js', './js/games/kenken/rules.js', './js/games/kenken/templates.js', './js/games/kenken/worker.js',
  './js/games/katamino/board-view.js', './js/games/katamino/config.js', './js/games/katamino/controller.js',
  './js/games/katamino/engine/generator.js', './js/games/katamino/engine/pieces.js',
  './js/games/katamino/engine/sets-data.js', './js/games/katamino/engine/sets.js',
  './js/games/katamino/engine/solver.js', './js/games/katamino/index.js', './js/games/katamino/meta.js',
  './js/games/katamino/picker.js', './js/games/katamino/piece-svg.js', './js/games/katamino/rules.js',
  './js/games/katamino/templates.js', './js/games/katamino/worker.js',
  './js/games/rush-hour/board-view.js', './js/games/rush-hour/config.js', './js/games/rush-hour/controller.js',
  './js/games/rush-hour/engine/bank-data.js', './js/games/rush-hour/engine/board.js', './js/games/rush-hour/engine/generator.js',
  './js/games/rush-hour/index.js', './js/games/rush-hour/meta.js', './js/games/rush-hour/templates.js', './js/games/rush-hour/worker.js',
  './js/games/akari/board-view.js', './js/games/akari/config.js', './js/games/akari/controller.js',
  './js/games/akari/engine/generator.js', './js/games/akari/engine/light.js', './js/games/akari/index.js',
  './js/games/akari/meta.js', './js/games/akari/rules.js', './js/games/akari/templates.js', './js/games/akari/worker.js',
  './js/games/hashi/board-view.js', './js/games/hashi/config.js', './js/games/hashi/controller.js',
  './js/games/hashi/engine/generator.js', './js/games/hashi/engine/graph.js', './js/games/hashi/index.js',
  './js/games/hashi/meta.js', './js/games/hashi/rules.js', './js/games/hashi/templates.js', './js/games/hashi/worker.js',
  './js/games/zip/board-view.js', './js/games/zip/config.js', './js/games/zip/controller.js',
  './js/games/zip/engine/generator.js', './js/games/zip/engine/path.js', './js/games/zip/index.js',
  './js/games/zip/meta.js', './js/games/zip/rules.js', './js/games/zip/templates.js', './js/games/zip/worker.js',
  './js/games/peg-solitaire/board-view.js', './js/games/peg-solitaire/config.js',
  './js/games/peg-solitaire/controller.js', './js/games/peg-solitaire/engine/generator.js',
  './js/games/peg-solitaire/engine/rules.js', './js/games/peg-solitaire/index.js',
  './js/games/peg-solitaire/meta.js', './js/games/peg-solitaire/templates.js',
  './js/games/peg-solitaire/worker.js', './js/games/smart-circle/board-view.js', './js/games/smart-circle/config.js',
  './js/games/smart-circle/controller.js', './js/games/smart-circle/engine/generator.js',
  './js/games/smart-circle/engine/pieces.js', './js/games/smart-circle/engine/solutions-data.js',
  './js/games/smart-circle/engine/solutions.js', './js/games/smart-circle/engine/solver.js',
  './js/games/smart-circle/index.js', './js/games/smart-circle/meta.js', './js/games/smart-circle/piece-svg.js',
  './js/games/smart-circle/rules.js', './js/games/smart-circle/templates.js', './js/games/smart-circle/worker.js',
  './js/games/smart-hexagon/board-view.js', './js/games/smart-hexagon/config.js',
  './js/games/smart-hexagon/controller.js', './js/games/smart-hexagon/engine/generator.js',
  './js/games/smart-hexagon/engine/pieces.js', './js/games/smart-hexagon/engine/solutions-data.js',
  './js/games/smart-hexagon/engine/solutions.js', './js/games/smart-hexagon/engine/solver.js',
  './js/games/smart-hexagon/index.js', './js/games/smart-hexagon/meta.js', './js/games/smart-hexagon/piece-svg.js',
  './js/games/smart-hexagon/rules.js', './js/games/smart-hexagon/templates.js', './js/games/smart-hexagon/worker.js',
  './js/games/smart-circuit/board-view.js',
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
  './js/lib/format.js', './js/lib/grid.js', './js/lib/iter.js', './js/lib/polyomino.js', './js/lib/random.js', './js/main.js',
  './js/pwa.js', './js/ui/cell-drag.js', './js/ui/confirm-dialog.js', './js/ui/cube-svg.js', './js/ui/fit-text.js', './js/ui/fit-play.js', './js/ui/edge-back.js', './js/ui/win-strip.js',
  './js/ui/fit-spots.js', './js/ui/game-hud.js', './js/ui/grid-board.js', './js/ui/hub-view.js', './js/ui/level-menu.js',
  './js/ui/overlays.js', './js/ui/piece-drag.js', './js/ui/settings-panel.js', './js/ui/templates.js',
  './js/ui/toast.js',
  './fonts/archivo-black.woff2', './fonts/archivo.woff2',
  './icons/icon.svg', './icons/apple-touch-icon.png', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png'
];
// Cada versión guarda todos sus archivos pedidos al servidor (no a la caché HTTP del navegador,
// que podría devolver los de la versión anterior)
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION)
    .then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Página y archivos salen siempre de la caché de la versión instalada, así nunca se mezclan dos
// versiones. Las nuevas llegan instalando otro service worker: la app avisa y se recarga (js/pwa.js).
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate'){
    e.respondWith(caches.match('./index.html').then(hit => hit || fetch(req)));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
