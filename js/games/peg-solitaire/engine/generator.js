/* El solitario no genera tableros: la posición inicial depende del tablero elegido en Ajustes.
   Se mantiene el contrato del resto de juegos (un "tablero" por nivel) para reutilizar la carcasa. */
export function* generate(target){
  yield 0;
  return { level: target };
}
