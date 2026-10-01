// Genera los PNG de icons/ a partir de icons/icon.svg con Chromium (Playwright).
// Uso: node scripts/make-icons.cjs   (necesita playwright instalado globalmente o en el proyecto)
const path = require('path');
const fs = require('fs');
let pw;
try { pw = require('playwright'); }
catch { pw = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright'); }

const root = path.join(__dirname, '..');
const svg = fs.readFileSync(path.join(root, 'icons/icon.svg'), 'utf8');
const font = 'file://' + path.join(root, 'fonts/archivo-black.woff2');
const SIZES = { 'apple-touch-icon.png': 180, 'icon-192.png': 192, 'icon-512.png': 512, 'icon-maskable-512.png': 512 };

(async () => {
  const browser = await pw.chromium.launch();
  for (const [file, size] of Object.entries(SIZES)){
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    await page.setContent(`<style>@font-face{font-family:"Archivo Black";src:url(${font})}html,body{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(root, 'icons', file), clip: { x: 0, y: 0, width: size, height: size } });
    await page.close();
    console.log('icons/' + file, size + 'px');
  }
  await browser.close();
})();
