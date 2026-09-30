/* Configuración común de la aplicación. Lo propio de cada juego vive en js/games/<juego>/config.js. */

export const APP_NAME = 'Puzzles Go';

/** Tableros pre-generados que se guardan por nivel. */
export const BUFFER_CAP = 5;
export const HISTORY_LIMIT = 400;

export const TIMING = Object.freeze({
  toastMs: 1900,
  winOverlayDelayMs: 1100,
  winWaveStepMs: 35,
  autosaveEverySec: 5,
  workerProbeMs: 2500,
  mainThreadSliceMs: 14
});
