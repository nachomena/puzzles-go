/* Star Battle definition for the game registry (contract in js/games/README.md). */
import { defineGame } from '../../core/game-definition.js';
import { generate } from './engine/generator.js';
import { StarBattleController } from './controller.js';
import { controls, help } from './templates.js';
import { BOARD, LEVELS, TOOL, DEFAULT_SETTINGS, SETTINGS } from './config.js';
import meta from './meta.js';

export default defineGame({
  ...meta,
  tools: Object.values(TOOL),
  defaultSettings: DEFAULT_SETTINGS,
  settings: SETTINGS,

  workerUrl: new URL('./worker.js', import.meta.url),
  generate,
  isValidPuzzle: (p, L) => p.N === BOARD.size && p.K === BOARD.stars && p.level === LEVELS[L].target,
  restoreSession: s => {
    if (!Array.isArray(s.marks)) return null;
    delete s.hl;   // the old brush's paint
    return s;
  },
  sizeLabel: () => '',   // it is always 10×10 with 2★: it adds nothing to the header

  controls: controls(),
  help: help(),
  Controller: StarBattleController
});
