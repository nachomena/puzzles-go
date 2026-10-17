// Calcula retos de Engranajes y los escribe en js/games/gears/engine/bank-data.js. Sin prisa, el
// solucionador demuestra la solución única con muchos más pasos que en el teléfono, así que el Experto
// queda con menos números. Cada reto sale luego en 2 versiones (ver generator.js#decode).
// Uso: node scripts/build-gears-bank.mjs [cuántos por nivel=150] [niveles=1,3,4]
// Los niveles que no se piden se conservan como estaban.
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
    // sin repetir un reto ni su otra versión
    const s = encode(p), twin = encode(decode(s, L, { turn: true }));
    if (!out.has(twin)) out.add(s);
    process.stdout.write(`\rnivel ${L}: ${out.size}/${want}  ${Math.round((Date.now() - t0) / 1000)} s`);
  }
  bank[L] = [...out];
  process.stdout.write('\n');
}
const file = new URL('../js/games/gears/engine/bank-data.js', import.meta.url);
writeFileSync(file, '/* Retos de Engranajes ya calculados por nivel (scripts/build-gears-bank.mjs); formato en generator.js#encode. */\n' +
  'export default {\n' + Object.keys(bank).sort().map(L => `  ${L}: [\n` + bank[L].map(s => `    '${s}'`).join(',\n') + '\n  ]').join(',\n') + '\n};\n');
console.log(`${Object.values(bank).reduce((t, l) => t + l.length, 0)} retos en bank-data.js`);
