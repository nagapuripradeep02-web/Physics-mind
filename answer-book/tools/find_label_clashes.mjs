/**
 * find_label_clashes.mjs — list EVERY figure-label collision in one pass.
 *
 *   node answer-book/tools/find_label_clashes.mjs [dist-dir]
 *
 * The e2e gate ("no two figure labels overlap, in any question") walks the whole
 * fleet and fails at the FIRST offending question, so each run reveals one figure
 * and costs ~14 minutes. Four separate runs found four collisions, one at a time.
 *
 * This runs the gate's own measurement — `getBoundingClientRect()` on every
 * `<text>` in a revealed step, true rectangle intersection — but COLLECTS instead
 * of asserting, and visits only the questions that actually contain a diagram.
 * One pass, the complete list.
 *
 * Why coordinate arithmetic cannot replace it: the gate measures RENDERED boxes
 * over a page-scaled SVG, so a character-width estimate is not the same
 * measurement. A local estimate flagged 42 pairs, most of them false, and still
 * missed the pair that actually failed. Estimate to triage; measure to decide.
 */
import { chromium } from '@playwright/test';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const DIST = join(ROOT, 'answer-book', process.argv[2] ?? 'dist', 'index.html');
if (!existsSync(DIST)) {
    console.error(`✗ ${DIST} does not exist — build first`);
    process.exit(1);
}

// Only questions with a diagram can have colliding labels; skipping the rest
// turns a ~14 minute sweep into a short one.
const QDIR = join(ROOT, 'answer-book', 'questions');
const withFigures = new Set();
for (const f of readdirSync(QDIR).filter((x) => x.endsWith('.json'))) {
    const q = JSON.parse(readFileSync(join(QDIR, f), 'utf8'));
    if ((q.answer?.steps ?? []).some((s) => s.kind === 'diagram')) {
        withFigures.add(q.question_id);
    }
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('file:///' + DIST.replace(/\\/g, '/'));
await page.waitForFunction(() => (window).PM_ANSWER && (window).PM_QUESTIONS);

const ids = await page.evaluate(() => (window).PM_ANSWER.questionIds);
const targets = ids.filter((id) => withFigures.has(id));
console.log(`${targets.length} question(s) with figures, of ${ids.length} in the book\n`);

const found = [];
for (const [n, id] of targets.entries()) {
    await page.evaluate((qid) => (window).PM_ANSWER.openQuestion(qid), id);
    await page.waitForTimeout(160);
    await page.evaluate(() => (window).PM_ANSWER.revealAll());
    await page.waitForTimeout(320);
    const clashes = await page.evaluate(() => {
        const bad = [];
        document.querySelectorAll('.step-block svg').forEach((svg) => {
            const t = [...svg.querySelectorAll('text')]
                .map((e) => ({ s: e.textContent || '', r: e.getBoundingClientRect() }))
                .filter((e) => e.r.width > 0);
            for (let i = 0; i < t.length; i++) {
                for (let j = i + 1; j < t.length; j++) {
                    const a = t[i].r, c = t[j].r;
                    if (a.left < c.right && c.left < a.right && a.top < c.bottom && c.top < a.bottom) {
                        // how far apart they would have to move to stop touching
                        const dx = Math.min(a.right, c.right) - Math.max(a.left, c.left);
                        const dy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top);
                        bad.push(`"${t[i].s}" / "${t[j].s}"  (overlap ${dx.toFixed(0)}x${dy.toFixed(0)} px)`);
                    }
                }
            }
        });
        return bad;
    });
    if (clashes.length) found.push([id, clashes]);
    if ((n + 1) % 25 === 0) process.stdout.write(`  … ${n + 1}/${targets.length}\r`);
}
await browser.close();

if (!found.length) {
    console.log('\n✓ no figure-label collisions anywhere in the book.');
    process.exit(0);
}
console.log(`\n${found.length} question(s) with colliding labels:\n`);
for (const [id, cl] of found) {
    console.log(`  ${id}`);
    for (const c of cl) console.log(`      ${c}`);
}
process.exit(1);
