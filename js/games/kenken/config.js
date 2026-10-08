/* Configuración de KenKen. */
import meta from './meta.js';
import { PEN, PENCIL } from '../../core/digit-grid-controller.js';

export const LEVELS = meta.levels;

/** Herramientas: escribir el número o anotarlo como candidato. */
export const TOOL = Object.freeze({ PEN, PENCIL });

export const DEFAULT_SETTINGS = Object.freeze({ errors: false, autoNotes: true, sameDigit: true, timer: true });

export const SETTINGS = Object.freeze([
  { key: 'errors',    title: 'Resaltar errores',         desc: 'Los números repetidos en una fila o columna se ponen rojos.' },
  { key: 'autoNotes', title: 'Limpiar notas',            desc: 'Al poner un número se borra de las notas de su fila y columna.' },
  { key: 'sameDigit', title: 'Resaltar números iguales', desc: 'Marca todas las casillas con el número seleccionado.' },
  { key: 'timer',     title: 'Cronómetro',               desc: 'Muestra el tiempo de la partida.' }
]);
