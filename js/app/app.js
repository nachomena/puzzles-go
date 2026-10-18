/* App shell: game picker, level menu, game screens and shared overlays.
   It knows nothing about any particular game: everything comes from their definitions. */
import { byId, loadStylesheet } from '../lib/dom.js';
import { Store } from '../core/store.js';
import { PuzzleSupply } from '../core/puzzle-supply.js';
import { GameHud } from '../ui/game-hud.js';
import { HubView } from '../ui/hub-view.js';
import { LevelMenu } from '../ui/level-menu.js';
import { Overlays } from '../ui/overlays.js';
import { SettingsPanel } from '../ui/settings-panel.js';
import { NightMode } from '../ui/night-mode.js';
import { ConfirmDialog } from '../ui/confirm-dialog.js';
import { formatTime } from '../lib/format.js';
import { Toast } from '../ui/toast.js';
import { keepFitted, fitToWidth } from '../ui/fit-text.js';
import { playScreen } from '../ui/templates.js';
import { fitPlay } from '../ui/fit-play.js';
import { winStripSvg } from '../ui/win-strip.js';
import { gameHtml, levelHtml, bindChartTips } from '../ui/progress-view.js';
import { progressRows } from '../core/progress.js';
import { bindEdgeBack } from '../ui/edge-back.js';
import { t, translateDom, LANGUAGES, languageChoice, deviceLanguage, setLanguage } from '../i18n/index.js';

const htmlToElement = html => {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};

export class App {
  /**
   * @param {object} deps
   * @param {{ meta: object, load: () => Promise<{ default: object }>, css?: string }[]} deps.catalog  (js/games/catalog.js)
   * @param {Storage|null} deps.storage
   */
  constructor({ catalog, storage }){
    this.catalog = catalog;
    this.storage = storage;
    this.screen = 'hub';
    this.current = null;
    this.toast = new Toast(byId('toast'));
    this.overlays = new Overlays();
    this.hub = new HubView(byId('games'), byId('resumeLast'));
    this.levelMenu = new LevelMenu({ title: byId('gameTitle'), label: byId('levelsLabel'), levels: byId('levelList'), resume: byId('resume') });
    this.settings = new SettingsPanel(byId('settingsList'));
    translateDom();
    this.night = new NightMode(storage);
    document.querySelectorAll('[data-night-toggle]').forEach(el => el.addEventListener('change', e => this.night.set(e.target.checked)));
    this.#bindLanguage(document.querySelector('[data-lang-select]'));
    this.confirm = new ConfirmDialog(byId('confirm'), this.overlays);
    this.fitHubTitle = keepFitted(byId('title'));
    this.fitGameTitle = keepFitted(byId('gameTitle'));
    this.fitPickTitle = keepFitted(byId('pickTitle'));
    this.pickLevel = null;      // level whose board table is open (games with a picker)
    // progress screens: chosen game and row, period, and which screen to go back to
    this.progress = { game: null, key: null, range: 'last20', from: 'hub' };

    this.entries = new Map();   // games already opened: id → entry
    this.loading = new Map();   // imports in progress: id → promise
    this.#bindEvents();
  }

  /** Loads a game the first time it is opened and starts generating its boards. */
  #entryFor(id){
    if (this.entries.has(id)) return Promise.resolve(this.entries.get(id));
    if (!this.loading.has(id)){
      const item = this.catalog.find(c => c.meta.id === id);
      if (!item) return Promise.resolve(null);
      // its stylesheet is requested together with the code: the game isn't drawn without it
      this.loading.set(id, Promise.all([item.load(), item.css && loadStylesheet(item.css)]).then(([{ default: game }]) => {
        const entry = this.#createEntry(game, this.storage);
        this.entries.set(id, entry);
        this.loading.delete(id);
        entry.supply.init();
        return entry;
      }));
    }
    return this.loading.get(id);
  }

  /** Everything that lives per game: state, generation, screen and controller. */
  #createEntry(game, storage){
    const screen = htmlToElement(playScreen({ id: game.id, name: game.name, boardClass: game.boardClass || '', boardHtml: game.boardHtml, controls: game.controls, hint: game.hint !== false,
      back: t(game.levelOrder.length === 1 ? 'common.games' : 'common.menu') }));   // without a level menu, back goes to the picker
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
      onWin: ({ time, detail, strip }) => {
        byId('winTime').textContent = time;
        byId('winDetail').textContent = detail;
        byId('winStrip').innerHTML = winStripSvg(strip);
        this.overlays.open('win');
      }
    });
    return entry;
  }

  /** Draws the picker and removes the startup screen (the loading layer, see index.html). */
  start(){
    this.#refreshMenus();
    byId('loading').classList.remove('is-on', 'is-boot');
  }

  /* ---------- New version ---------- */

  /**
   * A new version is ready: tell the player and apply it on reload (progress is kept).
   * The notice is created here and not in the HTML, so it never shows up with another version's
   * styles or code.
   */
  showUpdate(){
    if (byId('updateBar')) return;
    const bar = document.createElement('div');
    bar.id = 'updateBar';
    bar.className = 'update-bar';
    bar.setAttribute('role', 'status');
    bar.innerHTML = `<span>${t('update.text')}</span><button data-action="apply-update">${t('update.apply')}</button>`;
    document.body.appendChild(bar);
    requestAnimationFrame(() => requestAnimationFrame(() => bar.classList.add('is-on')));
  }

  #saveAll(){ for (const e of this.entries.values()) e.store.save(); }

  /* ---------- Navigation ---------- */

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

  /** A game with a single level has no menu: it goes straight into the game. */
  #isDirect(meta = this.currentMeta){ return meta?.levelOrder.length === 1; }

  /** Opens the game menu at once; its code loads and generates boards in the background. */
  openGame(id){
    const item = this.catalog.find(c => c.meta.id === id);
    if (!item) return;
    this.currentMeta = item.meta;
    if (this.#isDirect()){
      // no menu: continue the open game or start one
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
      if (this.currentMeta?.id !== id) return;   // the game changed while loading
      this.current = entry;
      this.#refreshMenus();
    });
  }

  /** "Continue" on the picker: straight into the game's unfinished session (or its menu if there is none). */
  resumeGame(id){
    const item = this.catalog.find(c => c.meta.id === id);
    if (!item) return;
    this.currentMeta = item.meta;
    this.#entryFor(id).then(entry => {
      if (this.currentMeta?.id !== id || this.screen !== 'hub') return;
      this.current = entry;
      if (entry.store.hasOpenSession) this.continueGame();
      else this.openGame(id);
    });
  }

  /** Runs `fn` with the open game, waiting for it to finish loading if needed. */
  async #withGame(fn){
    const id = this.currentMeta?.id;
    if (!id) return;
    const entry = await this.#entryFor(id);
    if (entry && this.currentMeta?.id === id && this.screen !== 'hub') fn(entry);
  }

  continueGame(){
    const { controller, game } = this.current;
    if (!controller.mount()) return;
    if (game.picker) this.pickLevel = controller.session.L;   // when going back, to its level's table
    this.showScreen('play');
    fitPlay(this.current.screen);
  }

  /** Table of boards of a level (games with a picker, e.g. Pentominoes). */
  openPicker(L, entry){
    this.current = entry;
    this.pickLevel = L;
    this.showScreen('pick');
  }

  /**
   * New game from the menu (or a specific board from the table, `puzzle`). If there is an unfinished
   * game, ask first so it isn't lost: the player can start the new one or keep the current one.
   */
  async requestLevel(L, entry, puzzle = null){
    const cur = entry.store.hasOpenSession ? entry.store.state.cur : null;
    const screen = this.screen;
    if (cur && puzzle && cur.L === L && entry.game.picker.same(cur, puzzle)){ this.current = entry; this.continueGame(); return; }
    if (cur){
      const choice = await this.confirm.ask({
        title: t('confirm.newTitle'),
        text: t('confirm.newText', { level: entry.game.sessionLabel?.(cur) ?? entry.game.levels[cur.L].name, time: formatTime(cur.time || 0) }),
        accept: t('confirm.newAccept'),
        alternate: t('confirm.newKeep')
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
    if (this.screen === 'play'){
      const { store, game } = this.current;
      store.save();
      // barely started: not kept to continue (a picker table board doesn't go back to the reserve)
      store.dropFreshSession({ keepPuzzle: !game.picker });
      this.#toMenu();
    }
    else if (this.screen === 'pick') this.showScreen('levels');
    else if (this.screen === 'progress-level') this.showScreen('progress');
    else if (this.screen === 'progress' && this.progress.from === 'levels') this.showScreen('levels');
    else { this.currentMeta = null; this.showScreen('hub'); }
  }

  /** Restart the game (bottom bar button), asking for confirmation. */
  async #confirmReset(){
    const c = this.current?.controller;
    if (this.screen !== 'play' || !c?.active) return;
    if (!c.hasInput()){ this.toast.show(t('play.alreadyEmpty')); return; }
    const choice = await this.confirm.ask({
      title: t('confirm.resetTitle'),
      text: t('confirm.resetText'),
      accept: t('confirm.resetAccept')
    });
    if (choice === 'accept' && this.current?.controller === c) c.reset();
  }

  /* ---------- Progress ---------- */

  /** Opens progress: for the game of the open menu, or the last one played when coming from the picker. */
  openProgress(){
    const from = this.screen === 'levels' ? 'levels' : 'hub';
    let game = from === 'levels' ? this.currentMeta?.id : this.progress.game;
    if (!game){
      // the game with the most recent session
      let latest = -1;
      for (const { meta } of this.catalog){
        const at = this.#menuData(meta).log?.at(-1)?.at ?? -1;
        if (at > latest){ latest = at; game = meta.id; }
      }
    }
    this.progress = { ...this.progress, game: game ?? this.catalog[0].meta.id, from };
    this.showScreen('progress');
  }

  #progressRows(){
    const meta = this.catalog.find(c => c.meta.id === this.progress.game).meta, data = this.#menuData(meta);
    return { meta, data, rows: progressRows(meta, data.stats, data.log) };
  }

  #renderProgress(){
    const { meta, data, rows } = this.#progressRows();
    byId('progressBody').innerHTML = gameHtml({
      games: this.catalog.map(({ meta: m }) => ({ id: m.id, name: m.shortName ?? m.name })),
      game: meta.id, name: meta.name, stats: data.stats, rows
    });
    byId('progressBody').querySelector('[aria-pressed="true"]')?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  #renderProgressLevel(){
    const { meta, data, rows } = this.#progressRows(), row = rows.find(r => r.key === this.progress.key);
    if (!row) return;
    byId('progressGame').textContent = meta.name;
    byId('progressLevelTitle').textContent = row.name.toUpperCase();
    fitToWidth(byId('progressLevelTitle'));   // next to the back button: make it fit on one line
    byId('progressLevelBody').innerHTML = levelHtml({ row, range: this.progress.range, meta, stats: data.stats });
  }

  /** Current game's menu: its board table, its levels or the picker if it has no menu. */
  #toMenu(){
    if (this.#isDirect()){ this.currentMeta = null; this.showScreen('hub'); }
    else if (this.current?.game.picker && this.pickLevel) this.showScreen('pick');
    else this.showScreen('levels');
  }

  /** "Next board" after winning: whatever the game says, or a new one of the same level. */
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
      byId('pickBack').textContent = game.menuLabel ?? t('common.levels');
      byId('pickBody').innerHTML = game.picker.render(this.pickLevel, store.menuData());
    }
    if (this.screen === 'progress') this.#renderProgress();
    if (this.screen === 'progress-level') this.#renderProgressLevel();
  }

  /** Statistics and open session: from the store if the game is loaded, otherwise from storage. */
  #menuData(meta){
    return this.entries.get(meta.id)?.store.menuData() ?? Store.peek(this.storage, meta.storageKey);
  }

  /* ---------- Actions: each [data-action] in the HTML is handled here or by the current game ---------- */

  get #actions(){
    const cur = this.current;
    return {
      'open-game':    el => this.openGame(el.dataset.game),
      'resume-last':  el => this.resumeGame(el.dataset.game),
      'open-progress':  () => this.openProgress(),
      'open-app-settings': () => this.overlays.open('app-settings'),
      'progress-game':  el => { this.progress.game = el.dataset.pgGame; this.#renderProgress(); },
      'progress-level': el => { this.progress.key = el.dataset.key; this.showScreen('progress-level'); },
      'progress-range': el => { this.progress.range = el.dataset.range; this.#renderProgressLevel(); },
      'toggle-group': el => { this.hub.toggle(el.dataset.group); this.#refreshMenus(); },
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
      'apply-update': () => { this.#saveAll(); location.reload(); },
      'close':        () => this.overlays.closeDismissable(),
      'cancel-generation': () => { this.overlays.close('loading'); cur.supply.cancelRequest(); },
      'next-puzzle':  () => { this.overlays.close('win'); this.#next(); },
      'to-menu':      () => { this.overlays.close('win'); this.#toMenu(); },
      'wipe-stats':   () => { cur.store.clearStats(); this.#refreshMenus(); this.toast.show(t('settings.wiped')); },
      'undo':         () => cur.controller.undo(),
      'redo':         () => cur.controller.redo(),
      'reset':        () => this.#confirmReset(),
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

  /** Language select in the app settings: the phone's or a fixed one; changing it reloads the app. */
  #bindLanguage(select){
    if (!select) return;
    const options = { auto: t('appSettings.languageAuto', { name: LANGUAGES[deviceLanguage()] }), ...LANGUAGES };
    const choice = languageChoice();
    select.innerHTML = Object.entries(options).map(([v, label]) => `<option value="${v}"${v === choice ? ' selected' : ''}>${label}</option>`).join('');
    select.addEventListener('change', () => { this.#saveAll(); setLanguage(select.value); });
  }

  #bindEvents(){
    document.addEventListener('click', e => {
      const el = e.target.closest('[data-action]');
      if (el){ this.#actions[el.dataset.action]?.(el, e); return; }
      // Tapping outside a sheet closes it
      if (e.target.matches('.overlay[data-dismissable]')) this.overlays.closeDismissable();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape'){ this.confirm.answer('cancel'); this.overlays.closeDismissable(); return; }
      if (this.screen !== 'play' || this.overlays.anyOpen() || e.metaKey || e.ctrlKey || e.altKey) return;
      if (this.current.controller.onKey(e)) e.preventDefault();
    });

    bindChartTips(byId('progressLevelBody'));

    // Swipe from the left edge to go back (not while a sheet is open)
    bindEdgeBack({ enabled: () => this.screen !== 'hub' && !this.overlays.anyOpen(), onBack: () => this.back() });
    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { if (this.screen === 'play') fitPlay(this.current.screen); }, 150);
    });

    // Timer: only runs while the game is on screen
    setInterval(() => {
      if (this.screen === 'play' && !document.hidden && !this.overlays.anyOpen()) this.current.controller.tick();
    }, 1000);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) for (const e of this.entries.values()) e.store.save();
    });
  }
}
