/** Ejecuta un generador hasta el final y devuelve su resultado. */
export function runToEnd(gen){
  let r;
  do r = gen.next(); while (!r.done);
  return r.value;
}
