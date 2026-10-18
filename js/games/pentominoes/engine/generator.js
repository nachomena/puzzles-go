/* Pentominoes doesn't generate boards: the puzzles are in sets-data.js and are chosen in the menu.
   It keeps the contract of the other games (one "board" per level) to reuse the shell. */
export function* generate(target){
  yield 0;
  return { level: target };
}
