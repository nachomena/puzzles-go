/* Catálogo de juegos. El selector solo necesita los datos de meta.js; el resto del juego
   (motor, controlador, plantillas) se importa al abrirlo por primera vez.
   Para añadir un juego: crea su carpeta (ver README.md) y añade aquí su entrada. */
import starBattle from './star-battle/meta.js';
import sudoku from './sudoku/meta.js';
import smartDices from './smart-dices/meta.js';
import smartCircuit from './smart-circuit/meta.js';
import smartCircle from './smart-circle/meta.js';
import smartHexagon from './smart-hexagon/meta.js';
import iqPuzzler from './iq-puzzler/meta.js';
import katamino from './katamino/meta.js';
import rushHour from './rush-hour/meta.js';
import zip from './zip/meta.js';
import hashi from './hashi/meta.js';
import kenken from './kenken/meta.js';
import akari from './akari/meta.js';
import pegSolitaire from './peg-solitaire/meta.js';

export const CATALOG = [
  { meta: starBattle, load: () => import('./star-battle/index.js') },
  { meta: sudoku,     load: () => import('./sudoku/index.js') },
  { meta: smartDices,   load: () => import('./smart-dices/index.js') },
  { meta: smartCircuit, load: () => import('./smart-circuit/index.js') },
  { meta: smartCircle,  load: () => import('./smart-circle/index.js') },
  { meta: smartHexagon, load: () => import('./smart-hexagon/index.js') },
  { meta: iqPuzzler,    load: () => import('./iq-puzzler/index.js') },
  { meta: katamino,     load: () => import('./katamino/index.js') },
  { meta: rushHour,     load: () => import('./rush-hour/index.js') },
  { meta: zip,          load: () => import('./zip/index.js') },
  { meta: hashi,        load: () => import('./hashi/index.js') },
  { meta: kenken,       load: () => import('./kenken/index.js') },
  { meta: akari,        load: () => import('./akari/index.js') },
  { meta: pegSolitaire, load: () => import('./peg-solitaire/index.js') }
];
