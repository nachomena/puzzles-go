/* Punto de entrada: arranca la app con los juegos registrados. */
import { App } from './app/app.js';
import { CATALOG } from './games/catalog.js';
import { safeStorage } from './lib/dom.js';
import { registerServiceWorker } from './pwa.js';

new App({ catalog: CATALOG, storage: safeStorage() }).start();
registerServiceWorker();
