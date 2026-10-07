/* Catálogo de juegos. El selector solo necesita los datos de meta.js; el resto del juego
   (motor, controlador, plantillas) se importa al abrirlo por primera vez.
   Para añadir un juego: crea su carpeta (ver README.md) y añade aquí su entrada. */
import starBattle from './star-battle/meta.js';
import sudoku from './sudoku/meta.js';
import smartDices from './smart-dices/meta.js';
import smartCircuit from './smart-circuit/meta.js';
import smartCircle from './smart-circle/meta.js';
import smartHexagon from './smart-hexagon/meta.js';
import pegSolitaire from './peg-solitaire/meta.js';

export const CATALOG = [
  { meta: starBattle, load: () => import('./star-battle/index.js') },
  { meta: sudoku,     load: () => import('./sudoku/index.js') },
  { meta: smartDices,   load: () => import('./smart-dices/index.js') },
  { meta: smartCircuit, load: () => import('./smart-circuit/index.js') },
  { meta: smartCircle,  load: () => import('./smart-circle/index.js') },
  { meta: smartHexagon, load: () => import('./smart-hexagon/index.js') },
  { meta: pegSolitaire, load: () => import('./peg-solitaire/index.js') }
];
