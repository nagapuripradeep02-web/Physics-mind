/**
 * find_wide_katex.mjs — list EVERY over-wide typeset line in the built book.
 *
 *   node answer-book/tools/find_wide_katex.mjs [answer-book/dist/index.html]
 *
 * Why this exists. `e2e/answer_book.spec.ts` "a typeset line renders as math…" is the
 * only guard against a truncated KaTeX line — `.kx-clip` is `overflow:hidden`, so an
 * over-wide matrix loses its right edge with no other symptom. But that test asserts
 * per question and stops at the first bad card, so a fleet-wide problem has to be
 * discovered one 3-minute run at a time.
 *
 * This runs the SAME two measurements over every typeset question and prints them all,
 * with the overflow in px so the worst offenders can be fixed first. Report-only.
 */
import { createRequire } from 'module';
import { dirname, join, resolve } from 'path';
import { pathToFileURL, fileURLToPath } from 'url';

const HERE = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(HERE, '..', '..', 'package.json'));
const { chromium } = require('playwright');

const dist = resolve(process.argv[2] || join(HERE, '..', 'dist', 'index.html'));
const URL = pathToFileURL(dist).href;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(URL);
await page.waitForSelector('#catalogView:not([hidden])');

const ids = await page.evaluate(() =>
    (window.PM_QUESTIONS || [])
        .filter((q) => q.answer.steps.some((s) => (s.lines || []).some((l) => l && l.render === 'katex')))
        .map((q) => q.question_id));

console.log(`typeset questions: ${ids.length}\n`);

const bad = [];
for (const id of ids) {
    // PM_ANSWER.openQuestion is the API the spec's own openQ() helper uses. An earlier
    // version of this file called PM_ANSWER.open() -- which does not exist -- inside a
    // try/catch, so every iteration silently measured the SAME page and the harness
    // reported "no over-wide line" over an empty set. Assert the question actually
    // changed rather than trusting the call.
    await page.evaluate((qid) => window.PM_ANSWER.openQuestion(qid), id);
    await page.waitForSelector('.page');
    await page.waitForTimeout(150);
    const shownId = await page.evaluate(() => window.PM_ANSWER.question && window.PM_ANSWER.question.question_id);
    if (shownId !== id) {
        console.error(`FATAL: asked for ${id} but the page shows ${shownId} — harness is measuring the wrong card`);
        await browser.close();
        process.exit(2);
    }
    await page.evaluate(() => window.PM_ANSWER.revealAll());
    await page.waitForTimeout(320);

    const rows = await page.evaluate(() => {
        const out = [];
        for (const c of document.querySelectorAll('.kx-clip')) {
            const line = c.closest('.line');
            if (!line) continue;
            const cs = getComputedStyle(line);
            const avail = line.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
            const kin = c.firstElementChild;
            const natural = kin ? kin.getBoundingClientRect().width : c.scrollWidth;
            const shown = c.getBoundingClientRect().width;
            if (natural > avail + 0.5 || natural > shown + 0.5) {
                out.push({
                    tex: (c.getAttribute('data-tex') || '').slice(0, 110),
                    natural: Math.round(natural), avail: Math.round(avail), shown: Math.round(shown),
                });
            }
        }
        return out;
    });
    for (const r of rows) bad.push({ id, ...r });
}
await browser.close();

if (!bad.length) {
    console.log('no over-wide typeset line — every .kx-clip shows its whole tree.');
    process.exit(0);
}
bad.sort((a, b) => (b.natural - b.avail) - (a.natural - a.avail));
console.log(`${bad.length} over-wide typeset line(s), widest overflow first:\n`);
let last = '';
for (const b of bad) {
    if (b.id !== last) { console.log(`  ${b.id}`); last = b.id; }
    console.log(`     natural ${b.natural}  avail ${b.avail}  SHOWN ${b.shown}   ${b.natural > b.avail + 0.5 ? '[a] too wide for the line' : '[b] clip frozen NARROWER than its tree'}`);
    console.log(`       ${b.tex}`);
}
process.exit(1);
