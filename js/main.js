/* Punto de entrada: crea los módulos, los conecta entre sí y enlaza las acciones de la interfaz. */
import { byId, safeStorage } from './lib/dom.js';
import { Store } from './game/store.js';
import { PuzzleSupply } from './game/puzzle-supply.js';
import { GameController } from './game/game-controller.js';
import { BoardView } from './ui/board-view.js';
import { GameHud, isTool } from './ui/game-hud.js';
import { MenuView } from './ui/menu-view.js';
import { Overlays } from './ui/overlays.js';
import { SettingsPanel } from './ui/settings-panel.js';
import { Toast } from './ui/toast.js';
import { bindCellDrag } from './ui/cell-drag.js';
import { keepFitted } from './ui/fit-text.js';
import { registerServiceWorker } from './pwa.js';

/* ---------- Módulos ---------- */
const store = new Store(safeStorage());
store.load();

const toast = new Toast(byId('toast'));
const overlays = new Overlays();
const menu = new MenuView({ levels: byId('levels'), resume: byId('resume') });
const board = new BoardView(byId('board'));

let screen = 'menu';
const fitTitle = keepFitted(byId('title'));

const supply = new PuzzleSupply({
  store,
  workerUrl: new URL('./engine/worker.js', import.meta.url),
  isBusy: () => screen === 'game',
  onChange: () => menu.render(store, supply.job),
  onReady: L => { overlays.close('loading'); startLevel(L); }
});

const game = new GameController({
  store, board,
  hud: new GameHud(byId('game')),
  notify: msg => toast.show(msg),
  onWin: ({ time, detail }) => {
    byId('winTime').textContent = time;
    byId('winDetail').textContent = detail;
    overlays.open('win');
  }
});

const settings = new SettingsPanel(byId('settings'), store, key => {
  if (screen === 'game') game.applySettings(key);
});
overlays.beforeOpen('settings', () => settings.sync());

/* ---------- Navegación ---------- */
function showScreen(name){
  screen = name;
  document.querySelectorAll('.screen').forEach(el => el.classList.toggle('is-on', el.id === name));
  window.scrollTo(0, 0);
  if (name === 'menu'){ menu.render(store, supply.job); fitTitle(); }
  supply.pump();
}

function openGame(){
  if (game.mount()) showScreen('game');
}

function startLevel(L){
  const puzzle = store.takePuzzle(L);
  if (!puzzle){
    overlays.open('loading');
    supply.request(L);
    return;
  }
  game.begin(L, puzzle);
  openGame();
}

/* ---------- Acciones: cada [data-action] del HTML se resuelve aquí ---------- */
const actions = {
  'start-level':  el => startLevel(el.dataset.level),
  'continue':     () => openGame(),
  'back':         () => { store.save(); showScreen('menu'); },
  'open':         el => overlays.open(el.dataset.target),
  'close':        () => overlays.closeDismissable(),
  'cancel-generation': () => { overlays.close('loading'); supply.cancelRequest(); },
  'next-puzzle':  () => { overlays.close('win'); startLevel(store.state.cur.L); },
  'to-menu':      () => { overlays.close('win'); showScreen('menu'); },
  'tool':         el => { if (isTool(el.dataset.tool)) game.setTool(el.dataset.tool); },
  'undo':         () => game.undo(),
  'redo':         () => game.redo(),
  'reset':        () => game.reset(),
  'hint':         () => game.hint(),
  'wipe-stats':   () => { store.clearStats(); menu.render(store, supply.job); toast.show('Estadísticas borradas'); }
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (el) { actions[el.dataset.action]?.(el, e); return; }
  // Tocar fuera de una hoja la cierra
  if (e.target.matches('.overlay[data-dismissable]')) overlays.closeDismissable();
});

bindCellDrag(board.root, {
  cellAt: (x, y) => board.cellAt(x, y),
  cellSize: () => board.cellSize(),
  enabled: () => game.active,
  onStart: i => game.pressCell(i),
  onEnter: cells => game.dragOver(cells),
  onEnd: () => game.release()
});

/* ---------- Cronómetro y guardado ---------- */
setInterval(() => {
  if (screen === 'game' && !document.hidden && !overlays.anyOpen()) game.tick();
}, 1000);
document.addEventListener('visibilitychange', () => { if (document.hidden) store.save(); });

/* ---------- Arranque ---------- */
menu.render(store, supply.job);
supply.init();
registerServiceWorker();
