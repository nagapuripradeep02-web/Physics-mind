// Measure the REAL Kalam widths of unit-8 labels from the rendered gallery and
// MERGE them into label_widths.json (never overwrite — other units' measured
// strings live in the same file).
import { createRequire } from 'module';
import { readFileSync, writeFileSync, existsSync } from 'fs';
const require = createRequire('C:/Tutor/physics-mind-ipe-zoology/package.json');
const { chromium } = require('playwright');

const WIDTHS = '../label_widths.json';
const prev = existsSync(WIDTHS) ? JSON.parse(readFileSync(WIDTHS, 'utf8')) : {};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1180, height: 900 } });
await page.goto('file:///C:/Tutor/physics-mind-ipe-zoology/answer-book/tools/out/figures_z1_ee.html');
await page.waitForTimeout(2000);
const rows = await page.evaluate(() => {
  const out = {};
  document.querySelectorAll('svg text').forEach((t) => {
    const b = t.getBBox();
    out[t.getAttribute('font-size') + '|' + t.textContent] = +b.width.toFixed(1);
  });
  return out;
});
await browser.close();

let added = 0;
for (const [k, v] of Object.entries(rows)) if (prev[k] === undefined) added++;
const merged = { ...prev, ...rows };
writeFileSync(WIDTHS, JSON.stringify(merged, null, 1));
console.log(`measured ${Object.keys(rows).length} labels, ${added} new; label_widths.json now holds ${Object.keys(merged).length}`);
