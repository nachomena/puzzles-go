/* Configuración central de la aplicación. Todo valor "mágico" vive aquí. */

export const BOARD = Object.freeze({ size: 10, stars: 2 });

/** Niveles de dificultad. `target` es el nivel del solucionador lógico que exige el tablero. */
export const LEVELS = Object.freeze({
  easy:   Object.freeze({ name: 'Fácil',   target: 1, desc: 'Solo reglas básicas' }),
  hard:   Object.freeze({ name: 'Difícil', target: 2, desc: 'Razonar con varias regiones' }),
  expert: Object.freeze({ name: 'Experto', target: 3, desc: 'Necesita probar hipótesis' })
});
export const LEVEL_ORDER = Object.freeze(['easy', 'hard', 'expert']);
export const levelByTarget = target => LEVEL_ORDER.find(L => LEVELS[L].target === target) || null;

/** Tableros pre-generados que se guardan por nivel. */
export const BUFFER_CAP = 5;
export const HISTORY_LIMIT = 400;
export const STORAGE_KEY = 'starbattlego.v2';

/** Estado de cada casilla en la partida. */
export const MARK = Object.freeze({ EMPTY: 0, X: 1, STAR: 2, AUTO_X: 3 });
export const TOOL = Object.freeze({ STAR: 'star', BRUSH: 'brush' });

export const DEFAULT_SETTINGS = Object.freeze({ autoX: true, errors: true, timer: true, tint: false });

export const TIMING = Object.freeze({
  toastMs: 1900,
  winOverlayDelayMs: 1100,
  winWaveStepMs: 35,
  autosaveEverySec: 5,
  workerProbeMs: 2500,
  mainThreadSliceMs: 14
});
