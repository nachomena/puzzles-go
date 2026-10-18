// Computes Kakuro Expert puzzles (12 × 12) and writes them to js/games/kakuro/engine/bank-data.js.
// On the phone they would take too long to generate; each one later comes in 4 versions (see generator.js).
// Usage: node scripts/build-kakuro-bank.mjs [how many=120]
import { writeFileSync } from 'node:fs';
import { build, encode } from '../js/games/kakuro/engine/generator.js';
import { runToEnd } from '../js/lib/iter.js';

const want = Number(process.argv[2] || 120), out = new Set(), t0 = Date.now();
while (out.size < want){
  const p = runToEnd(build(4));
  if (p) out.add(encode(p));
  process.stdout.write(`\r${out.size}/${want}  ${Math.round((Date.now() - t0) / 1000)} s`);
}
const file = new URL('../js/games/kakuro/engine/bank-data.js', import.meta.url);
writeFileSync(file, '/* Precomputed Kakuro Expert puzzles (scripts/build-kakuro-bank.mjs): "." black, digit = white. */\n' +
  'export default [\n' + [...out].map(s => `  '${s}'`).join(',\n') + '\n];\n');
console.log(`\n${out.size} puzzles in bank-data.js`);
