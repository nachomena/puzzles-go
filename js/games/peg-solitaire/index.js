/* Definición del Solitario para el registro de juegos (contrato en js/games/README.md). */
import { defineGame } from '../../core/game-definition.js';
import { generate } from './engine/generator.js';
import { N, isBoard } from './engine/rules.js';
import { PegSolitaireController } from './controller.js';
import { boardHtml, controls, help } from './templates.js';
import { LEVELS, TOOL, DEFAULT_SETTINGS, SETTINGS } from './config.js';
import meta from './meta.js';

export default defineGame({
  ...meta,
  tools: Object.values(TOOL),
  defaultSettings: DEFAULT_SETTINGS,
  settings: SETTINGS,
  hint: false,   // sin pistas: no se busca la solución
  statsKey: s => s.board,   // estadísticas por tablero (meta.statsRows)

  workerUrl: new URL('./worker.js', import.meta.url),
  generate,
  isValidPuzzle: (p, L) => p.level === LEVELS[L].target,
  restoreSession: s => {
    if (!isBoard(s.board) || !Array.isArray(s.balls) || s.balls.length !== N * N || !Array.isArray(s.out)) return null;
    if (typeof s.sel !== 'number') s.sel = -1;
    if (typeof s.resets !== 'number') s.resets = 0;
    return s;
  },
  sizeLabel: () => '',

  boardHtml: boardHtml(),
  controls: controls(),
  help: help(),
  Controller: PegSolitaireController
});
