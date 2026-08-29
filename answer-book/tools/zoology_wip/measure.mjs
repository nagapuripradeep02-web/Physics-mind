// Dump measured Kalam label widths from the rendered gallery -> label_widths.json
import { createRequire } from 'module';
import { writeFileSync } from 'fs';
const require = createRequire('C:/Tutor/physics-mind-ipe-zoology/package.json');
const { chromium } = require('playwright');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1180, height: 900 } });
await page.goto('file:///C:/Tutor/physics-mind-ipe-zoology/answer-book/tools/out/figures_z1_pa.html');
await page.waitForTimeout(2000);
const rows = await page.evaluate(() => {
  const out = {};
  document.querySelectorAll('svg text').forEach((t) => {
    const b = t.getBBox();
    out[t.getAttribute('font-size') + '|' + t.textContent] = +b.width.toFixed(1);
  });
  return out;
});
writeFileSync('label_widths.json', JSON.stringify(rows, null, 1));
const per = Object.entries(rows).map(([k, w]) => w / k.split('|')[1].length);
console.log(Object.keys(rows).length, 'labels measured; per-char', Math.min(...per).toFixed(2), '-', Math.max(...per).toFixed(2));
await browser.close();
