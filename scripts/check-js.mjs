// Revisa la sintaxis de todo el JavaScript (node --check) y que cada import relativo apunte a un
// archivo que existe: sin paso de compilación, un error así solo se vería al abrir el juego.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { cpus } from 'node:os';

const root = new URL('..', import.meta.url).pathname;
const walk = dir => readdirSync(dir).flatMap(f => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? (f === 'node_modules' ? [] : walk(p)) : [p];
});
const files = [...['js', 'tests', 'scripts'].flatMap(d => walk(join(root, d))), join(root, 'sw.js'), join(root, 'playwright.config.js')]
  .filter(p => /\.(m?js|cjs)$/.test(p));

const errors = [];
const run = promisify(execFile);
const queue = [...files];
await Promise.all(Array.from({ length: cpus().length }, async () => {
  for (let f; (f = queue.shift()); ){
    try { await run(process.execPath, ['--check', f]); }
    catch (e) { errors.push(e.stderr.trim()); }
  }
}));

// import … from './x.js', import('./x.js'), new URL('./x.js', import.meta.url)
const SPEC = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|new URL\(\s*)(['"])(\.{1,2}\/[^'"]+)\1/g;
for (const f of files){
  const code = readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  for (const [, , spec] of code.matchAll(SPEC)){
    if (!existsSync(resolve(dirname(f), spec))) errors.push(`${relative(root, f)}: no existe '${spec}'`);
  }
}

if (errors.length){
  console.error(errors.join('\n\n'));
  process.exit(1);
}
console.log(`JavaScript correcto en ${files.length} archivos.`);
