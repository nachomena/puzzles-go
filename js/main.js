/* Punto de entrada: arranca la app con los juegos registrados. */
import { App } from './app/app.js';
import { CATALOG } from './games/catalog.js';
import { safeStorage } from './lib/dom.js';
import { migrateLevels } from './core/level-migration.js';
import { fixStandaloneViewport, registerServiceWorker, requestPersistentStorage } from './pwa.js';

fixStandaloneViewport();
const storage = safeStorage();
migrateLevels(storage, CATALOG.map(item => item.meta));   // niveles de antes → Fácil, Difícil, Experto
const app = new App({ catalog: CATALOG, storage });
app.start();
registerServiceWorker({ onUpdate: () => app.showUpdate() });
requestPersistentStorage();
