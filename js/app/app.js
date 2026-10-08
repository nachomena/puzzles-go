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
import { ConfirmDialog } from '../ui/confirm-dialog.js';
import { formatTime } from '../lib/format.js';
import { Toast } from '../ui/toast.js';
import { keepFitted, keepNamesFitted } from '../ui/fit-text.js';
import { playScreen } from '../ui/templates.js';

const htmlToElement = html => {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};

export class App {
  /**
   * @param {object} deps
   * @param {{ meta: object, load: () => Promise<{ default: object }> }[]} deps.catalog  (js/games/catalog.js)
   * @param {Storage|null} deps.storage
   */
  constructor({ catalog, storage }){
    this.catalog = catalog;
    this.storage = storage;
    this.screen = 'hub';
    this.current = null;
    this.toast = new Toast(byId('toast'));
    this.overlays = new Overlays();
    this.hub = new HubView(byId('games'));
    this.levelMenu = new LevelMenu({ title: byId('gameTitle'), label: byId('levelsLabel'), levels: byId('levelList'), resume: byId('resume') });
    this.settings = new SettingsPanel(byId('settingsList'));
    this.confirm = new ConfirmDialog(byId('confirm'), this.overlays);
    this.fitHubTitle = keepFitted(byId('title'));
    this.fitGameTitle = keepFitted(byId('gameTitle'));
    this.fitPickTitle = keepFitted(byId('pickTitle'));
    this.pickLevel = null;      // nivel cuya tabla de tableros está abierta (juegos con picker)
    this.fitGames = keepNamesFitted(byId('games'));
    this.fitLevels = keepNamesFitted(byId('levelList'));

    this.entries = new Map();   // juegos ya abiertos: id → entrada
    this.loading = new Map();   // importaciones en curso: id → promesa
    this.#bindEvents();
  }

  /** Carga un juego la primera vez que se abre y arranca su generación de tableros. */
  #entryFor(id){
    if (this.entries.has(id)) return Promise.resolve(this.entries.get(id));
    if (!this.loading.has(id)){
      const item = this.catalog.find(c => c.meta.id === id);
      if (!item) return Promise.resolve(null);
      this.loading.set(id, item.load().then(({ default: game }) => {
        const entry = this.#createEntry(game, this.storage);
        this.entries.set(id, entry);
        this.loading.delete(id);
        entry.supply.init();
        return entry;
      }));
    }
    return this.loading.get(id);
  }

  /** Todo lo que vive por juego: estado, generación, pantalla y controlador. */
  #createEntry(game, storage){
    const screen = htmlToElement(playScreen({ id: game.id, name: game.name, boardClass: game.boardClass || '', boardHtml: game.boardHtml, controls: game.controls, hint: game.hint !== false }));
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

  start(){ this.#refreshMenus(); }

  /* ---------- Navegación ---------- */

  showScreen(name){
    this.screen = name;
    const id = name === 'play' ? `play-${this.current.game.id}` : name;
    document.querySelectorAll('.screen').forEach(el => el.classList.toggle('is-on', el.id === id));
    window.scrollTo(0, 0);
    this.#refreshMenus();
    if (name === 'hub') this.fitHubTitle();
    if (name === 'levels') this.fitGameTitle();
    if (name === 'pick') this.fitPickTitle();
    for (const e of this.entries.values()) e.supply.pump();
  }

  /** Un juego con un solo nivel no tiene menú: se entra directo a la partida. */
  #isDirect(meta = this.currentMeta){ return meta?.levelOrder.length === 1; }

  /** Abre el menú del juego al instante; su código se carga y genera tableros en segundo plano. */
  openGame(id){
    const item = this.catalog.find(c => c.meta.id === id);
    if (!item) return;
    this.currentMeta = item.meta;
    if (this.#isDirect()){
      // sin menú: sigue la partida abierta o empieza una
      this.#entryFor(id).then(entry => {
        if (this.currentMeta?.id !== id || this.screen !== 'hub') return;
        this.current = entry;
        if (entry.store.hasOpenSession) this.continueGame();
        else this.startLevel(item.meta.levelOrder[0], entry);
      });
      return;
    }
    this.current = this.entries.get(id) || null;
    this.showScreen('levels');
    this.#entryFor(id).then(entry => {
      if (this.currentMeta?.id !== id) return;   // se cambió de juego mientras cargaba
      this.current = entry;
      this.#refreshMenus();
    });
  }

  /** Ejecuta `fn` con el juego abierto, esperando a que termine de cargar si hace falta. */
  async #withGame(fn){
    const id = this.currentMeta?.id;
    if (!id) return;
    const entry = await this.#entryFor(id);
    if (entry && this.currentMeta?.id === id && this.screen !== 'hub') fn(entry);
  }

  continueGame(){
    const { controller, game } = this.current;
    if (!controller.mount()) return;
    if (game.picker) this.pickLevel = controller.session.L;   // al volver, a la tabla de su nivel
    this.showScreen('play');
  }

  /** Tabla de tableros de un nivel (juegos con picker, p. ej. Katamino). */
  openPicker(L, entry){
    this.current = entry;
    this.pickLevel = L;
    this.showScreen('pick');
  }

  /**
   * Nueva partida desde el menú (o un tablero concreto de la tabla, `puzzle`). Si hay una partida a
   * medias, pregunta antes para no perderla: se puede empezar la nueva o seguir con la actual.
   */
  async requestLevel(L, entry, puzzle = null){
    const cur = entry.store.hasOpenSession ? entry.store.state.cur : null;
    const screen = this.screen;
    if (cur && puzzle && cur.L === L && entry.game.picker.same(cur, puzzle)){ this.current = entry; this.continueGame(); return; }
    if (cur){
      const choice = await this.confirm.ask({
        title: '¿Empezar otra partida?',
        text: `Tienes una partida de ${entry.game.sessionLabel?.(cur) ?? entry.game.levels[cur.L].name} en curso (${formatTime(cur.time || 0)}). Si empiezas otra, se perderá.`,
        accept: 'Empezar nueva',
        alternate: 'Seguir con la actual'
      });
      if (this.currentMeta?.id !== entry.game.id || this.screen !== screen) return;
      if (choice === 'alternate'){ this.current = entry; this.continueGame(); return; }
      if (choice !== 'accept') return;
    }
    if (puzzle){
      this.current = entry;
      entry.controller.begin(L, puzzle);
      this.continueGame();
    } else this.startLevel(L, entry);
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
    if (this.screen === 'play') this.current.store.save();
    if (this.screen === 'play') this.#toMenu();
    else if (this.screen === 'pick') this.showScreen('levels');
    else { this.currentMeta = null; this.showScreen('hub'); }
  }

  /** Menú del juego actual: su tabla de tableros, sus niveles o el selector si no tiene menú. */
  #toMenu(){
    if (this.#isDirect()){ this.currentMeta = null; this.showScreen('hub'); }
    else if (this.current?.game.picker && this.pickLevel) this.showScreen('pick');
    else this.showScreen('levels');
  }

  /** "Siguiente tablero" tras ganar: el que diga el juego o uno nuevo del mismo nivel. */
  #next(){
    const { controller, store } = this.current, r = controller.next();
    if (r === null) this.startLevel(store.state.cur.L);
    else if (r) this.continueGame();
    else this.#toMenu();
  }

  #refreshMenus(){
    if (this.screen === 'hub') this.hub.render(this.catalog.map(({ meta }) => ({ meta, data: this.#menuData(meta) })));
    if (this.screen === 'levels' && this.currentMeta) this.levelMenu.render(this.currentMeta, this.#menuData(this.currentMeta));
    if (this.screen === 'pick' && this.current){
      const { game, store } = this.current;
      byId('pickTitle').textContent = game.levels[this.pickLevel].name.toUpperCase();
      byId('pickBody').innerHTML = game.picker.render(this.pickLevel, store.menuData());
    }
    if (this.screen === 'hub') this.fitGames();
    if (this.screen === 'levels') this.fitLevels();
  }

  /** Estadísticas y partida abierta: del store si el juego ya está cargado, si no del almacenamiento. */
  #menuData(meta){
    return this.entries.get(meta.id)?.store.menuData() ?? Store.peek(this.storage, meta.storageKey);
  }

  /* ---------- Acciones: cada [data-action] del HTML se resuelve aquí o en el juego actual ---------- */

  get #actions(){
    const cur = this.current;
    return {
      'open-game':    el => this.openGame(el.dataset.game),
      'start-level':  el => this.#withGame(entry => entry.game.picker
        ? this.openPicker(el.dataset.level, entry)
        : this.requestLevel(el.dataset.level, entry)),
      'pick-puzzle':  el => this.#withGame(entry => {
        const puzzle = entry.game.picker.puzzle(this.pickLevel, el.dataset);
        if (puzzle) this.requestLevel(this.pickLevel, entry, puzzle);
      }),
      'confirm-accept':    () => this.confirm.answer('accept'),
      'confirm-alternate': () => this.confirm.answer('alternate'),
      'continue':     () => this.#withGame(entry => { this.current = entry; this.continueGame(); }),
      'back':         () => this.back(),
      'open':         el => this.#withGame(entry => { this.current = entry; this.#openOverlay(el.dataset.target); }),
      'close':        () => this.overlays.closeDismissable(),
      'cancel-generation': () => { this.overlays.close('loading'); cur.supply.cancelRequest(); },
      'next-puzzle':  () => { this.overlays.close('win'); this.#next(); },
      'to-menu':      () => { this.overlays.close('win'); this.#toMenu(); },
      'wipe-stats':   () => { cur.store.clearStats(); this.#refreshMenus(); this.toast.show('Estadísticas borradas'); },
      'undo':         () => cur.controller.undo(),
      'redo':         () => cur.controller.redo(),
      'reset':        () => cur.controller.reset(),
      'hint':         () => cur.controller.hint(),
      ...cur?.controller.actions
    };
  }

  #openOverlay(id){
    if (!this.current) return;
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
      if (e.key === 'Escape'){ this.confirm.answer('cancel'); this.overlays.closeDismissable(); return; }
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
