// Computes Gears puzzles and writes them to js/games/gears/engine/bank-data.js. With time to spare, the
// solver proves the unique solution with many more steps than on the phone, so Expert
// ends up with fewer numbers. Each puzzle later comes in 2 versions (see generator.js#decode).
// Usage: node scripts/build-gears-bank.mjs [how many per level=150] [levels=1,3,4]
// Levels not asked for are kept as they were.
import { writeFileSync } from 'node:fs';
import { build, encode, decode } from '../js/games/gears/engine/generator.js';
import BANK from '../js/games/gears/engine/bank-data.js';
import { runToEnd } from '../js/lib/iter.js';

const BUDGET = 20_000_000;
const want = Number(process.argv[2] || 150), levels = (process.argv[3] || '1,3,4').split(',').map(Number);
const bank = { ...BANK };
for (const L of levels){
  const out = new Set(), t0 = Date.now();
  while (out.size < want){
    const p = runToEnd(build(L, BUDGET));
    if (!p) continue;
    // without repeating a puzzle or its other version
    const s = encode(p), twin = encode(decode(s, L, { turn: true }));
    if (!out.has(twin)) out.add(s);
    process.stdout.write(`\rlevel ${L}: ${out.size}/${want}  ${Math.round((Date.now() - t0) / 1000)} s`);
  }
  bank[L] = [...out];
  process.stdout.write('\n');
}
const file = new URL('../js/games/gears/engine/bank-data.js', import.meta.url);
writeFileSync(file, '/* Precomputed Gears puzzles per level (scripts/build-gears-bank.mjs); format in generator.js#encode. */\n' +
  'export default {\n' + Object.keys(bank).sort().map(L => `  ${L}: [\n` + bank[L].map(s => `    '${s}'`).join(',\n') + '\n  ]').join(',\n') + '\n};\n');
console.log(`${Object.values(bank).reduce((t, l) => t + l.length, 0)} puzzles in bank-data.js`);
