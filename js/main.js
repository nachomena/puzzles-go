/* Punto de entrada: arranca la app con los juegos registrados. */
import { App } from './app/app.js';
import { GAMES } from './games/index.js';
import { safeStorage } from './lib/dom.js';
import { registerServiceWorker } from './pwa.js';

new App({ games: GAMES, storage: safeStorage() }).start();
registerServiceWorker();
