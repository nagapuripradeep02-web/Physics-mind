/**
 * build_og_card — render the social-preview card (og:image) for a built book.
 *
 * Why a script and not a checked-in png: the card states the STREAM and the card
 * count, and both change. A stale hand-made image would advertise subjects the
 * artifact no longer contains — the same class of lie the --stream lens exists to
 * prevent. Rendering it from the built manifest keeps the claim true by
 * construction.
 *
 * Run:   npx tsx src/scripts/build_og_card.ts --stream=mpc
 *        (chained after the build by `npm run build:answers:mpc`)
 * Out:   answer-book/dist-<stream>/og.png  (1200x630) — sits beside index.html so
 *        wrangler serves it at <origin>/og.png, which is what the og:image tag
 *        that build_answer_book.ts writes points at.
 *
 * Uses the Playwright already installed for the e2e suite — no new dependency,
 * and no image library. Google Fonts are requested but every family has a real
 * fallback, so the card still renders correctly offline.
 */
import { chromium } from '@playwright/test';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const BOOK_DIR = join(ROOT, 'answer-book');

const streamArg = process.argv.find((a) => a.startsWith('--stream='));
const STREAM = streamArg ? streamArg.slice('--stream='.length) : null;

const LABELS: Record<string, { title: string; subjects: string }> = {
    mpc: { title: 'Junior Inter · MPC', subjects: 'Maths · Physics · Chemistry' },
};

function fail(msg: string): never {
    console.error(`\n✗ build:og-card failed\n${msg}`);
    process.exit(1);
}

if (!STREAM) fail('  --stream=<name> is required (e.g. --stream=mpc)');
if (!LABELS[STREAM]) fail(`  --stream="${STREAM}" has no card copy in LABELS`);

// The card sits beside the index.html it describes. The shipped stream build is
// GATED since 2026-08-27 (dist-gated-<stream>), so prefer that and fall back to
// the ungated dist-<stream> — a card written next to the wrong index.html is a
// card that never reaches a reader.
const GATED_OUT = join(BOOK_DIR, `dist-gated-${STREAM}`);
const PLAIN_OUT = join(BOOK_DIR, `dist-${STREAM}`);
const OUT_DIR = existsSync(join(GATED_OUT, 'index.html')) ? GATED_OUT : PLAIN_OUT;
const indexPath = join(OUT_DIR, 'index.html');
if (!existsSync(indexPath)) {
    fail(`  ${indexPath} does not exist — run the book build for this stream first`);
}

// Read the card count out of the BUILT artifact, never from units.json: the card
// must describe the file that actually ships, not the bank it was cut from.
const html = readFileSync(indexPath, 'utf8');
const m = html.match(/window\.PM_UNITS\s*=\s*(\[[\s\S]*?\]);\n/);
if (!m) fail('  could not find window.PM_UNITS in the built index.html');
let entryCount = 0;
let unitCount = 0;
try {
    const units = JSON.parse(m[1]) as Array<{ questions?: unknown[] }>;
    unitCount = units.length;
    for (const u of units) entryCount += (u.questions ?? []).length;
} catch (e) {
    fail(`  PM_UNITS did not parse: ${(e as Error).message}`);
}

const { title, subjects } = LABELS[STREAM];

// Viditra light: warm paper, clay rule, warm ink — the same tokens as
// notebook.css, which in turn mirror the marketing site's hues. The
// marks-in-the-margin motif is the product's signature, and it is what makes
// this card recognisably THIS product rather than a generic study app.
const card = `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Inter:wght@400;600;700&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1200px;height:630px;overflow:hidden;background:#FFFDF7;
       font-family:'Inter',system-ui,sans-serif;color:#2B2620;position:relative}
  /* ruled paper */
  .rules{position:absolute;inset:0;
    background:repeating-linear-gradient(to bottom,transparent 0 51px,rgba(43,38,32,.13) 51px 52px);}
  .margin{position:absolute;top:0;bottom:0;left:150px;width:2px;background:#CB6843;opacity:.7}
  .body{position:absolute;inset:0;padding:74px 82px 74px 200px;display:flex;flex-direction:column;height:100%}
  .eyebrow{font-size:25px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;
           color:#CB6843;opacity:.95}
  h1{font-family:'Fraunces',Georgia,serif;font-weight:700;font-size:82px;line-height:1.03;
     margin-top:20px;letter-spacing:-.015em}
  .stream{font-family:'Fraunces',Georgia,serif;font-weight:600;font-size:45px;
          margin-top:14px;color:#B0552F}
  .subjects{font-size:31px;font-weight:500;margin-top:26px;color:#6B6154}
  .foot{margin-top:auto;display:flex;align-items:flex-end;justify-content:space-between}
  .count{font-family:'Kalam',cursive;font-size:35px;color:#B0552F;transform:rotate(-1.4deg)}
  .brand{font-size:27px;font-weight:700;letter-spacing:.03em;color:#2B2620;opacity:.85}
  /* the marks-in-the-margin signature */
  .marks{position:absolute;left:52px;top:150px;font-family:'Kalam',cursive;font-size:33px;
         color:#B0552F;line-height:2.06;text-align:right;width:78px;opacity:.95}
</style></head><body>
  <div class="rules"></div><div class="margin"></div>
  <div class="marks">+1<br>+1<br>+2</div>
  <div class="body">
    <div class="eyebrow">Telangana IPE</div>
    <h1>Answer&nbsp;Book</h1>
    <div class="stream">${title}</div>
    <div class="subjects">${subjects}</div>
    <div class="foot">
      <div class="count">${entryCount} questions · ${unitCount} chapters</div>
      <div class="brand">viditra.co</div>
    </div>
  </div>
</body></html>`;

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
    await page.setContent(card, { waitUntil: 'load' });
    // Webfonts land after `load`; screenshotting early bakes the fallback face.
    // Never let a font timeout fail the build — the fallbacks are real.
    try {
        await page.evaluate(() => (document as unknown as { fonts: FontFaceSet }).fonts.ready);
        await page.waitForTimeout(400);
    } catch {
        console.warn('  (webfonts did not settle — card rendered with fallback faces)');
    }
    const outPath = join(OUT_DIR, 'og.png');
    await page.screenshot({ path: outPath, type: 'png' });
    await browser.close();
    console.log(`✓ og card → ${outPath} (1200x630, ${entryCount} questions · ${unitCount} chapters)`);
})().catch((e) => fail(`  ${(e as Error).stack ?? String(e)}`));
