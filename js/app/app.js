/* Carcasa de la app: selector de juegos, menú de niveles, pantallas de juego y capas comunes.
   No sabe nada de ningún juego en concreto: todo lo recibe de sus definiciones. */
import { byId } from '../lib/dom.js';
import { Store } from '../core/store.js';
import { PuzzleSupply } from '../core/puzzle-supply.js';
import { GameHud } from '../ui/game-hud.js';
import { HubView } from '../ui/hub-view.js';
import { LevelMenu } from '../ui/level-menu.js';
import { Overlays } from '../ui/overlays.js';
import { SettingsPanel } from '../ui/settings-panel.js';
import { Toast } from '../ui/toast.js';
import { keepFitted } from '../ui/fit-text.js';
import { playScreen } from '../ui/templates.js';

const htmlToElement = html => {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};

export class App {
  /**
   * @param {object} deps
   * @param {object[]} deps.games   definiciones (js/games/index.js)
   * @param {Storage|null} deps.storage
   */
  constructor({ games, storage }){
    this.screen = 'hub';
    this.current = null;
    this.toast = new Toast(byId('toast'));
    this.overlays = new Overlays();
    this.hub = new HubView(byId('games'));
    this.levelMenu = new LevelMenu({ title: byId('gameTitle'), levels: byId('levelList'), resume: byId('resume') });
    this.settings = new SettingsPanel(byId('settingsList'));
    this.fitHubTitle = keepFitted(byId('title'));
    this.fitGameTitle = keepFitted(byId('gameTitle'));

    this.entries = new Map(games.map(game => [game.id, this.#createEntry(game, storage)]));
    this.#bindEvents();
  }

  /** Todo lo que vive por juego: estado, generación, pantalla y controlador. */
  #createEntry(game, storage){
    const screen = htmlToElement(playScreen({ id: game.id, name: game.name, boardClass: game.boardClass || '', controls: game.controls }));
    byId('app').appendChild(screen);
    const store = new Store(storage, game);
    store.load();
    const entry = { game, store, screen };
    entry.supply = new PuzzleSupply({
      store, game,
      isBusy: () => this.screen === 'play',
      onChange: () => this.#refreshMenus(),
      onReady: L => { this.overlays.close('loading'); this.startLevel(L, entry); }
    });
    entry.controller = new game.Controller({
      game, store, screen,
      hud: new GameHud(screen),
      notify: msg => this.toast.show(msg),
      onWin: ({ time, detail }) => {
        byId('winTime').textContent = time;
        byId('winDetail').textContent = detail;
        this.overlays.open('win');
      }
    });
    return entry;
  }

  start(){
    this.#refreshMenus();
    for (const e of this.entries.values()) e.supply.init();
  }

  /* ---------- Navegación ---------- */

  showScreen(name){
    this.screen = name;
    const id = name === 'play' ? `play-${this.current.game.id}` : name;
    document.querySelectorAll('.screen').forEach(el => el.classList.toggle('is-on', el.id === id));
    window.scrollTo(0, 0);
    this.#refreshMenus();
    if (name === 'hub') this.fitHubTitle();
    if (name === 'levels') this.fitGameTitle();
    for (const e of this.entries.values()) e.supply.pump();
  }

  openGame(id){
    this.current = this.entries.get(id);
    if (this.current) this.showScreen('levels');
  }

  continueGame(){
    if (this.current.controller.mount()) this.showScreen('play');
  }

  startLevel(L, entry = this.current){
    this.current = entry;
    const puzzle = entry.store.takePuzzle(L);
    if (!puzzle){
      this.overlays.open('loading');
      entry.supply.request(L);
      return;
    }
    entry.controller.begin(L, puzzle);
    this.continueGame();
  }

  back(){
    if (this.screen === 'play'){ this.current.store.save(); this.showScreen('levels'); }
    else this.showScreen('hub');
  }

  #refreshMenus(){
    if (this.screen === 'hub') this.hub.render([...this.entries.values()]);
    if (this.screen === 'levels'){
      const { game, store, supply } = this.current;
      this.levelMenu.render(game, store, supply.job);
    }
  }

  /* ---------- Acciones: cada [data-action] del HTML se resuelve aquí o en el juego actual ---------- */

  get #actions(){
    const cur = this.current;
    return {
      'open-game':    el => this.openGame(el.dataset.game),
      'start-level':  el => this.startLevel(el.dataset.level),
      'continue':     () => this.continueGame(),
      'back':         () => this.back(),
      'open':         el => this.#openOverlay(el.dataset.target),
      'close':        () => this.overlays.closeDismissable(),
      'cancel-generation': () => { this.overlays.close('loading'); cur.supply.cancelRequest(); },
      'next-puzzle':  () => { this.overlays.close('win'); this.startLevel(cur.store.state.cur.L); },
      'to-menu':      () => { this.overlays.close('win'); this.showScreen('levels'); },
      'wipe-stats':   () => { cur.store.clearStats(); this.#refreshMenus(); this.toast.show('Estadísticas borradas'); },
      'undo':         () => cur.controller.undo(),
      'redo':         () => cur.controller.redo(),
      'reset':        () => cur.controller.reset(),
      'hint':         () => cur.controller.hint(),
      ...cur?.controller.actions
    };
  }

  #openOverlay(id){
    const { game, store, controller } = this.current;
    if (id === 'settings') this.settings.show(game.settings, store, key => {
      if (this.screen === 'play') controller.applySettings(key);
      this.#refreshMenus();
    });
    if (id === 'help') byId('helpBody').innerHTML = game.help;
    this.overlays.open(id);
  }

  #bindEvents(){
    document.addEventListener('click', e => {
      const el = e.target.closest('[data-action]');
      if (el){ this.#actions[el.dataset.action]?.(el, e); return; }
      // Tocar fuera de una hoja la cierra
      if (e.target.matches('.overlay[data-dismissable]')) this.overlays.closeDismissable();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape'){ this.overlays.closeDismissable(); return; }
      if (this.screen !== 'play' || this.overlays.anyOpen() || e.metaKey || e.ctrlKey || e.altKey) return;
      if (this.current.controller.onKey(e)) e.preventDefault();
    });

    // Cronómetro: solo corre con la partida a la vista
    setInterval(() => {
      if (this.screen === 'play' && !document.hidden && !this.overlays.anyOpen()) this.current.controller.tick();
    }, 1000);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) for (const e of this.entries.values()) e.store.save();
    });
  }
}
