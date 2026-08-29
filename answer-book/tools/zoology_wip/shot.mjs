// usage: node shot.mjs <html path> <png path>   (full-page screenshot, waits for Kalam; dumps text widths)
import { createRequire } from 'module';
import { writeFileSync } from 'fs';
const require = createRequire('C:/Tutor/physics-mind-ipe-zoology/package.json');
const { chromium } = require('playwright');
const [html, png] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1180, height: 900 } });
await page.goto('file:///' + html.replace(/\\/g, '/'));
await page.waitForTimeout(1800);
await page.screenshot({ path: png, fullPage: true });
const widths = await page.evaluate(() => {
  const out = {};
  document.querySelectorAll('svg text').forEach((t) => {
    const b = t.getBBox();
    out[t.textContent + '|' + t.getAttribute('font-size')] = { w: +b.width.toFixed(1), h: +b.height.toFixed(1), y0: +(b.y - +t.getAttribute('y')).toFixed(1) };
  });
  return out;
});
writeFileSync(png.replace(/\.png$/, '_text.json'), JSON.stringify(widths, null, 1));
await browser.close();
console.log('wrote', png);
