/* Definición de Star Battle para el registro de juegos (contrato en js/games/README.md). */
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
    if (!Array.isArray(s.hl)) s.hl = s.marks.map(() => 0);
    return s;
  },
  sizeLabel: () => '',   // siempre es 10×10 con 2★: no aporta nada en la cabecera

  controls: controls(),
  help: help(),
  Controller: StarBattleController
});
