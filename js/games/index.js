/* Registro de juegos. Para añadir uno: crea su carpeta con un index.js que exporte
   defineGame({...}) y añádelo a esta lista (y sus archivos a sw.js). */
import starBattle from './star-battle/index.js';
import sudoku from './sudoku/index.js';

export const GAMES = [starBattle, sudoku];
