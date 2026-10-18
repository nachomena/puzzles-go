/* Peg Solitaire doesn't generate boards: the starting position depends on the board chosen in Settings.
   It keeps the contract of the other games (one "board" per level) to reuse the shell. */
export function* generate(target){
  yield 0;
  return { level: target };
}
