/**
 * shot_gallery.mjs — screenshot each figure block of a rendered gallery to its
 * own PNG, so a reviewer can LOOK at one figure at a time. The whole gallery
 * page is far too tall to read in a single capture.
 *
 *   node answer-book/tools/shot_gallery.mjs <gallery.html> [outDir]
 */
import { createRequire } from 'module';
import { dirname, join } from 'path';
import { pathToFileURL, fileURLToPath } from 'url';

const HERE = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(HERE, '..', '..', 'package.json'));
const { chromium } = require('playwright');

const html = process.argv[2];
if (!html) { console.error('usage: node answer-book/tools/shot_gallery.mjs <gallery.html> [outDir]'); process.exit(2); }
const outDir = process.argv[3] || dirname(html);

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1000, height: 900 }, deviceScaleFactor: 2 });
await p.goto(pathToFileURL(html).href);
await p.waitForTimeout(2200);   // let Kalam load — capturing in fallback cursive is misleading

const n = await p.locator('.f').count();
for (let i = 0; i < n; i++) {
    const el = p.locator('.f').nth(i);
    const head = await el.locator('.h').first().innerText();
    const name = head.split('/')[0].trim().replace(/[^a-z0-9_]/gi, '');
    const file = join(outDir, `fig_${i + 1}_${name}.png`);
    await el.screenshot({ path: file });
    console.log('wrote', file);
}
await b.close();
