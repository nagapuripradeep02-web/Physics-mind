/**
 * sweep_simplify.mjs — open every card under a prefix and press every Simplify button.
 *
 *   node answer-book/tools/sweep_simplify.mjs <id_prefix> [dist]
 *   node answer-book/tools/sweep_simplify.mjs ts_ipe_m2a
 *   node answer-book/tools/sweep_simplify.mjs ts_ipe_m2b dist-mpc_2
 *
 * Run it after marking a paper with mark_expansion.py, against a fresh build.
 *
 * The e2e suite gates the MECHANISM on one card. This gates the PAPER: it opens
 * every card, checks it at exam length, presses every button, and checks it again
 * — one button per expandable step, no second pen before a press and some after,
 * no step block straddling a page break at either length, the marks intact, and
 * not one console error anywhere.
 *
 * It earned its place twice on Maths-2A, on defects a single card could not show:
 *
 *   - the gutter column (tick + mark number + button, ~94px) overhanging a
 *     ONE-LINE step and landing on the next step's button, where it read as the
 *     wrong step's control and, being later in the DOM, ate its clicks. It took a
 *     card with seven one-mark steps to appear;
 *   - `lines: null` written onto a diagram step, which the validator reported a
 *     card away from its cause.
 *
 * A straddle or a marks mismatch is a PAGINATION defect: the fuller working is
 * taller, and a step block is never split across a page break.
 */
import { join } from 'path';
import { createRequire } from 'module';

const prefix = process.argv[2];
const distDir = process.argv[3] || 'dist';
if (!prefix) {
    console.error('usage: node answer-book/tools/sweep_simplify.mjs <id_prefix> [dist]');
    process.exit(2);
}

const HERE = new URL('.', import.meta.url).pathname;
const ROOT = join(HERE, '..', '..');
const require = createRequire(join(ROOT, 'package.json'));
const { chromium } = require('playwright');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
const errs = [];
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));

const url = 'file://' + join(ROOT, 'answer-book', distDir, 'index.html');
await page.goto(url);
await page.waitForFunction(() => !!window.PM_ANSWER, null, { timeout: 60000 });

const ids = await page.evaluate((pfx) =>
    window.PM_QUESTIONS.filter((q) => q.question_id.startsWith(pfx)).map((q) => q.question_id), prefix);
if (!ids.length) { console.error(`no cards under "${prefix}" in ${distDir}`); await browser.close(); process.exit(2); }

/** What the page looks like right now. */
const probe = () => page.evaluate(() => {
    const straddle = [];
    document.querySelectorAll('.page-body').forEach((body) => {
        body.querySelectorAll('.step-block').forEach((bl) => {
            if (bl.offsetTop + bl.offsetHeight > body.clientHeight) {
                straddle.push(bl.getAttribute('data-step-id'));
            }
        });
    });
    const st = window.PM_ANSWER.getState();
    return {
        straddle,
        added: document.querySelectorAll('.line.added').length,
        buttons: document.querySelectorAll('.step-simplify').length,
        pages: document.querySelectorAll('.page').length,
        marks: st.marksEarned, total: st.marksTotal, expandable: st.expandableSteps,
    };
});

const defects = [];
let buttons = 0, pressed = 0, pagesShort = 0, pagesFull = 0, grew = 0;

for (const id of ids) {
    const before = errs.length;
    await page.evaluate((i) => window.PM_ANSWER.openQuestion(i), id);
    await page.evaluate(() => window.PM_ANSWER.revealAll());

    let r = await probe();
    buttons += r.buttons;
    pagesShort += r.pages;
    if (r.buttons !== r.expandable.length) defects.push(`${id}: ${r.buttons} buttons for ${r.expandable.length} expandable steps`);
    if (r.added !== 0) defects.push(`${id}: ${r.added} lines in the second pen before any press`);
    if (r.straddle.length) defects.push(`${id}: step block straddles a page break (exam length) — ${r.straddle.join(',')}`);
    if (r.marks !== r.total) defects.push(`${id}: marks ${r.marks}/${r.total} (exam length)`);
    const shortPages = r.pages;

    for (const sid of r.expandable) {
        await page.click(`.step-simplify[data-step-id="${sid}"]`);
        pressed++;
    }
    await page.evaluate(() => window.PM_ANSWER.revealAll());

    r = await probe();
    pagesFull += r.pages;
    if (r.pages > shortPages) grew++;
    if (r.expandable.length && r.added === 0) defects.push(`${id}: every button pressed, nothing in the second pen`);
    if (r.straddle.length) defects.push(`${id}: step block straddles a page break (written out) — ${r.straddle.join(',')}`);
    if (r.marks !== r.total) defects.push(`${id}: marks ${r.marks}/${r.total} (written out)`);
    if (errs.length > before) defects.push(`${id}: console — ${errs.slice(before).join(' | ')}`);
}

console.log(`swept ${ids.length} cards under "${prefix}" · ${buttons} buttons · ${pressed} pressed`);
console.log(`pages: ${pagesShort} at exam length, ${pagesFull} with every mark written out ` +
            `(${grew} cards need an extra page only when expanded)`);
console.log(defects.length ? `DEFECTS: ${defects.length}` : 'no defects');
defects.slice(0, 40).forEach((d) => console.log('  !', d));
console.log('console errors:', errs.length);

await browser.close();
process.exit(defects.length ? 1 : 0);
