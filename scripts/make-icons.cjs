// Generates the PNGs in icons/ from icons/icon.svg (and the maskable one from icons/icon-maskable.svg) with Chromium (Playwright).
// Usage: node scripts/make-icons.cjs   (needs playwright installed globally or in the project)
const path = require('path');
const fs = require('fs');
let pw;
try { pw = require('playwright'); }
catch { pw = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright'); }

const root = path.join(__dirname, '..');
const svg = name => fs.readFileSync(path.join(root, 'icons', name), 'utf8');
const font = 'file://' + path.join(root, 'fonts/archivo-black.woff2');
const SIZES = { 'apple-touch-icon.png': 180, 'icon-192.png': 192, 'icon-512.png': 512, 'icon-maskable-512.png': 512 };
const source = file => file.includes('maskable') ? 'icon-maskable.svg' : 'icon.svg';

(async () => {
  const browser = await pw.chromium.launch();
  for (const [file, size] of Object.entries(SIZES)){
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    await page.setContent(`<style>@font-face{font-family:"Archivo Black";src:url(${font})}html,body{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg(source(file))}`);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(root, 'icons', file), clip: { x: 0, y: 0, width: size, height: size } });
    await page.close();
    console.log('icons/' + file, size + 'px');
  }
  await browser.close();
})();
