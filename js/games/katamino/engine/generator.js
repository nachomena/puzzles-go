/* Katamino no genera tableros: los PENTAS están en sets-data.js y se eligen en el menú.
   Se mantiene el contrato del resto de juegos (un "tablero" por nivel) para reutilizar la carcasa. */
export function* generate(target){
  yield 0;
  return { level: target };
}
