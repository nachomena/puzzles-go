/* Shared app configuration. Each game's own settings live in js/games/<game>/config.js. */

export const APP_NAME = 'Puzzles Go';

/** Pre-generated boards kept per level: one ready; using it prepares the next. */
export const BUFFER_CAP = 1;
export const HISTORY_LIMIT = 400;

/** Seconds of play below which a game isn't offered to continue (it had barely started). */
export const MIN_RESUME_SEC = 5;

/** Seconds of play between one hint and the next. */
export const HINT_COOLDOWN_SEC = 3 * 60;

export const TIMING = Object.freeze({
  toastMs: 1900,
  winOverlayDelayMs: 1100,
  winWaveStepMs: 35,
  autosaveEverySec: 5,
  workerProbeMs: 2500,
  mainThreadSliceMs: 14
});
