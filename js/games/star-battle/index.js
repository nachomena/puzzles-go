/* Definición de Star Battle para el registro de juegos (contrato en js/games/README.md). */
import { defineGame } from '../../core/game-definition.js';
import { generate } from './engine/generator.js';
import { StarBattleController } from './controller.js';
import { controls, help } from './templates.js';
import { BOARD, LEVELS, LEVEL_ORDER, STORAGE_KEY, TOOL, DEFAULT_SETTINGS, SETTINGS } from './config.js';

export default defineGame({
  id: 'star-battle',
  name: 'Star Battle',
  tagline: `${BOARD.size}×${BOARD.size} · ${BOARD.stars} estrellas por fila, columna y región`,
  icon: 'star',
  storageKey: STORAGE_KEY,
  levels: LEVELS,
  levelOrder: LEVEL_ORDER,
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
  sizeLabel: p => `${p.N}x${p.N} ${p.K}★`,

  controls: controls(),
  help: help(),
  Controller: StarBattleController
});
