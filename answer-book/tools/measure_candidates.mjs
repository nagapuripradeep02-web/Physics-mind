/**
 * measure_candidates.mjs — measure candidate line texts in the real font before
 * authoring them, instead of guessing from a character count.
 *
 *   node answer-book/tools/measure_candidates.mjs boxed "text one" "text two" ...
 *
 * style budgets: boxed 535 · eq/indent 568 · normal 624 (Kalam 26px, page width).
 */
import { createRequire } from 'module';
import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { writeFileSync, mkdirSync } from 'fs';

const HERE = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(HERE, '..', '..', 'package.json'));
const { chromium } = require('playwright');

const style = process.argv[2] || 'normal';
const texts = process.argv.slice(3);
if (!texts.length) { console.error('usage: node measure_candidates.mjs <style> "text" ...'); process.exit(2); }
const budget = style === 'boxed' ? 535 : (style === 'eq' || style === 'indent') ? 568 : 624;

const outDir = join(HERE, 'out');
mkdirSync(outDir, { recursive: true });
const harness = join(outDir, 'cand_harness.html');
writeFileSync(harness, `<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&display=swap" rel="stylesheet">
<style>span.m{font-family:Kalam,cursive;font-size:26px;white-space:pre;display:inline-block}</style><div id="h"></div>`);

const b = await chromium.launch();
const p = await b.newPage();
await p.goto(pathToFileURL(harness).href);
await p.waitForTimeout(2200);
const widths = await p.evaluate((texts) => {
    const h = document.getElementById('h');
    return texts.map((t) => {
        const s = document.createElement('span'); s.className = 'm'; s.textContent = t;
        h.appendChild(s); const w = Math.ceil(s.getBoundingClientRect().width); h.innerHTML = ''; return w;
    });
}, texts);
await b.close();

console.log(`style ${style} · budget ${budget}px`);
texts.forEach((t, i) => {
    const w = widths[i];
    const slack = budget - w;
    console.log(`  ${w >= budget ? 'OVER ' : 'fits '} ${String(w).padStart(4)}px  slack ${String(slack).padStart(4)}  | ${t}`);
});
