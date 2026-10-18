/** Runs a generator to the end and returns its result. */
export function runToEnd(gen){
  let r;
  do r = gen.next(); while (!r.done);
  return r.value;
}
