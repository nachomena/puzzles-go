/* Punto de entrada: arranca la app con los juegos registrados. */
import { App } from './app/app.js';
import { CATALOG } from './games/catalog.js';
import { safeStorage } from './lib/dom.js';
import { registerServiceWorker, requestPersistentStorage } from './pwa.js';

const app = new App({ catalog: CATALOG, storage: safeStorage() });
app.start();
registerServiceWorker({ onUpdate: () => app.showUpdate() });
requestPersistentStorage();
