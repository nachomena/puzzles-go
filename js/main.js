/* Entry point: starts the app with the registered games. */
import { App } from './app/app.js';
import { CATALOG } from './games/catalog.js';
import { safeStorage } from './lib/dom.js';
import { migrateLevels } from './core/level-migration.js';
import { fixStandaloneViewport, registerServiceWorker, requestPersistentStorage } from './pwa.js';

fixStandaloneViewport();
const storage = safeStorage();
migrateLevels(storage, CATALOG.map(item => item.meta));   // old levels → Easy, Hard, Expert
const app = new App({ catalog: CATALOG, storage });
app.start();
registerServiceWorker({ onUpdate: () => app.showUpdate() });
requestPersistentStorage();
