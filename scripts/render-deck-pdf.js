// One-off: render the EXIST deck HTML to a landscape 16:9 PDF.
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const htmlPath = path.resolve('docs/pitch/EXIST_deck.html');
  const outPath = path.resolve('docs/pitch/EXIST_deck.pdf');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.pdf({
    path: outPath,
    width: '1280px',
    height: '720px',
    printBackground: true,
    pageRanges: '1-8',
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });
  await browser.close();
  console.log('WROTE ' + outPath);
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
