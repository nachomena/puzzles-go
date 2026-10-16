// Calcula retos de Kakuro Experto (12 × 12) y los escribe en js/games/kakuro/engine/bank-data.js.
// En el teléfono tardarían demasiado en generarse; cada uno sale luego en 4 versiones (ver generator.js).
// Uso: node scripts/build-kakuro-bank.mjs [cuántos=120]
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
writeFileSync(file, '/* Retos de Kakuro Experto ya calculados (scripts/build-kakuro-bank.mjs): "." negra, dígito = blanca. */\n' +
  'export default [\n' + [...out].map(s => `  '${s}'`).join(',\n') + '\n];\n');
console.log(`\n${out.size} retos en bank-data.js`);
