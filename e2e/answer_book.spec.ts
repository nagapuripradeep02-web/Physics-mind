/**
 * answer_book.spec.ts — evidence for the Answer Book static surface.
 *
 *   npm run build:answers && npm run smoke:answers
 *
 * Deliberately its own script (NOT part of `npm run smoke`, which talks to
 * Supabase) — this spec opens the built file from file:// and needs nothing.
 * It is the only automated way to catch a pagination regression when
 * question #2 lands.
 */
import { test, expect } from '@playwright/test';
import { join } from 'path';
import { existsSync } from 'fs';

const DIST = join(process.cwd(), 'answer-book', 'dist', 'index.html');
const URL = 'file:///' + DIST.replace(/\\/g, '/');

test.beforeAll(() => {
    if (!existsSync(DIST)) throw new Error('answer-book/dist/index.html missing — run npm run build:answers first');
});

test('reveals all steps, earns exactly the total, and never splits a block across a page', async ({ page }) => {
    await page.goto(URL);
    await page.waitForSelector('.page');

    // tap through every step, waiting for the completion event each time
    const stepCount = await page.evaluate(() => (window as any).PM_ANSWER.question.answer.steps.length);
    for (let i = 0; i < stepCount; i++) {
        await page.evaluate(() => new Promise<void>((resolve) => {
            document.addEventListener('pm:step-revealed', () => resolve(), { once: true });
            (window as any).PM_ANSWER.revealNext();
            // impatient tap — finish the writing instantly
            setTimeout(() => (window as any).PM_ANSWER.revealNext(), 120);
        }));
    }

    const result = await page.evaluate(() => {
        const state = (window as any).PM_ANSWER.getState();
        const straddle: string[] = [];
        document.querySelectorAll('.page-body').forEach((body) => {
            body.querySelectorAll('.step-block').forEach((bl) => {
                const b = bl as HTMLElement;
                if (b.offsetTop + b.offsetHeight > (body as HTMLElement).clientHeight) {
                    straddle.push(b.getAttribute('data-step-id') || '?');
                }
            });
        });
        return { state, straddle, acc: document.getElementById('accValue')!.textContent };
    });

    expect(result.state.marksEarned).toBe(result.state.marksTotal);
    expect(result.acc).toBe(String(result.state.marksTotal));
    expect(result.state.pageCount).toBeGreaterThanOrEqual(2); // the derivation honestly fills page 1
    expect(result.straddle).toEqual([]);                      // no block split across a page break
});

test('jump via the rail reproduces the identical pagination', async ({ page }) => {
    await page.goto(URL);
    await page.waitForSelector('.page');

    const tapped = await page.evaluate(async () => {
        const pm = (window as any).PM_ANSWER;
        pm.revealAll();
        return { pages: pm.getState().pageCount, marks: pm.getState().marksEarned };
    });

    const jumped = await page.evaluate(async () => {
        const pm = (window as any).PM_ANSWER;
        pm.goToStep('s6_direction');
        // goToStep animates the last step — finish it instantly
        pm.revealNext();
        await new Promise((r) => setTimeout(r, 400));
        return pm.getState();
    });

    // Sum the AUTHORED marks up to and including s6 rather than writing a literal:
    // the mark split is a claim pending teacher verification and has already been
    // revised once (LAQ/8 -> SAQ/4). A literal turns a legitimate re-split into a
    // false failure and tells you nothing about pagination, which is what this
    // test is actually for.
    const expected = await page.evaluate(() => {
        const steps = (window as any).PM_ANSWER.question.answer.steps as any[];
        const upto = steps.findIndex((s) => s.id === 's6_direction');
        return steps.slice(0, upto + 1).reduce((a, s) => a + s.marks, 0);
    });

    expect(jumped.stepId).toBe('s6_direction');
    expect(jumped.marksEarned).toBe(expected);
    // page break must land in the same place either way
    expect(jumped.pageCount).toBe(tapped.pages);
});

test('mobile viewport scales without horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(URL);
    await page.waitForSelector('.page');
    const hscroll = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1
    );
    expect(hscroll).toBe(false);
});

// ── spoken-recall check ──────────────────────────────────────────────────────
// The offline guarantee is the one that regresses silently: if a future change
// makes the page fetch unconditionally, a student on file:// loses the answer book.

test('with no recall endpoint the page stays fully offline and offers no mic', async ({ page }) => {
    const external: string[] = [];
    page.on('request', (r) => {
        const u = r.url();
        if (!u.startsWith('file://') && !u.includes('fonts.googleapis') && !u.includes('fonts.gstatic')) {
            external.push(u);
        }
    });
    await page.goto(URL);
    await page.waitForSelector('.page');

    const state = await page.evaluate(() => ({
        endpoint: (window as any).PM_API_BASE,
        // the assess panel exists in every mode; the MIC inside it is what must be absent
        micHidden: document.getElementById('btnMic')!.hidden,
        // the grader-side rubric must never ship to the browser
        leakedRubric: JSON.stringify((window as any).PM_QUESTIONS).includes('must_convey'),
    }));

    expect(state.endpoint).toBe('');       // default build has no endpoint
    expect(state.micHidden).toBe(true);    // therefore no mic
    expect(state.leakedRubric).toBe(false);
    expect(external).toEqual([]);          // and zero network calls
});

test('the answer still earns the full mark total with the recall feature present', async ({ page }) => {
    await page.goto(URL);
    await page.waitForSelector('.page');
    const r = await page.evaluate(() => {
        (window as any).PM_ANSWER.revealAll();
        return (window as any).PM_ANSWER.getState();
    });
    expect(r.marksEarned).toBe(r.marksTotal);
    expect(r.pageCount).toBeGreaterThanOrEqual(2);
});

// ── Test yourself (top-right entry: self-check, photo, mic) ──────────────────
// The offline guarantee is the one that regresses silently: with no API base the
// two SERVER paths must stay absent and the page must make zero network calls.
// The self-check needs no server, so it is always offered — which is why there
// is no longer an empty state to show.

test('with no checking API the page offers the self-check but neither photo nor mic', async ({ page }) => {
    await page.goto(URL);
    await page.waitForSelector('.page');
    await page.click('#btnTest');

    const r = await page.evaluate(() => ({
        apiBase: (window as any).PM_API_BASE,
        overlayOpen: !document.getElementById('testOverlay')!.hidden,
        selfHidden: document.getElementById('btnSelf')!.hidden,
        photoHidden: document.getElementById('btnPhoto')!.hidden,
        micHidden: document.getElementById('btnMic')!.hidden,
        noticeShown: !document.getElementById('testNone')!.hidden,
    }));
    expect(r.apiBase).toBe('');
    expect(r.overlayOpen).toBe(true);
    expect(r.selfHidden).toBe(false);        // always available — costs nothing
    expect(r.photoHidden).toBe(true);        // the server paths stay absent
    expect(r.micHidden).toBe(true);
    expect(r.noticeShown).toBe(false);       // no dead end left to announce
});

test('the test panel carries no clock', async ({ page }) => {
    await page.goto(URL);
    await page.waitForSelector('.page');
    await page.click('#btnTest');
    await page.waitForTimeout(1500);         // long enough for a 1 s tick to have fired

    const r = await page.evaluate(() => ({
        timerEl: document.getElementById('assessTimer') !== null,
        clockText: /\d:\d\d/.test(document.getElementById('testChoose')!.textContent || ''),
        examMention: (document.getElementById('testChoose')!.textContent || '')
            .includes('minutes in the exam'),
    }));
    expect(r.timerEl).toBe(false);
    expect(r.clockText).toBe(false);
    expect(r.examMention).toBe(false);
});

test('the self-check scores from authored marks with no network', async ({ page }) => {
    const external: string[] = [];
    page.on('request', (req) => {
        const u = req.url();
        if (!u.startsWith('file://') && !u.includes('fonts.g')) external.push(u);
    });
    await page.goto(URL);
    await page.waitForSelector('.page');
    await page.click('#btnTest');
    await page.click('#btnSelf');

    // Read the expected numbers from the AUTHORED question, never hardcode them:
    // this question was reclassified LAQ/8 -> SAQ/4 and a literal would have made
    // a correct reclassification look like a scoring regression.
    const authored = await page.evaluate(() => {
        const q = (window as any).PM_ANSWER.question;
        return { total: q.marks_total, firstMarks: q.answer.steps[0].marks };
    });

    // every row starts unticked: this path makes no claim about the page
    const start = await page.evaluate(() => ({
        rows: document.querySelectorAll('#recallResult .confirm-row').length,
        ticked: document.querySelectorAll('#recallResult input:checked').length,
        score: document.querySelector('#recallResult .recall-score')!.textContent,
    }));
    expect(start.rows).toBeGreaterThan(0);
    expect(start.ticked).toBe(0);
    expect(start.score).toContain(`0 out of ${authored.total}`);

    // ticking the first step must move the score by exactly that step's marks
    await page.click('#recallResult .confirm-row');
    const after = await page.evaluate(
        () => document.querySelector('#recallResult .recall-score')!.textContent);
    expect(after).toContain(`${authored.firstMarks} out of ${authored.total}`);

    expect(external).toEqual([]);            // scored entirely in the browser
});

test('the paper section and marks agree across header, chip and mark split', async ({ page }) => {
    await page.goto(URL);
    await page.waitForSelector('.page');
    const r = await page.evaluate(() => {
        const q = (window as any).PM_ANSWER.question;
        return {
            qtype: q.qtype,
            total: q.marks_total,
            splitSum: q.mark_split.reduce((a: number, m: any) => a + m.marks, 0),
            stepSum: q.answer.steps.reduce((a: number, s: any) => a + s.marks, 0),
            header: q.answer.page_header.join(' | '),
        };
    });
    // the three places a mark total appears must never drift apart
    expect(r.splitSum).toBe(r.total);
    expect(r.stepSum).toBe(r.total);
    expect(r.header).toContain(`${r.total} marks`);
    expect(r.header).toContain(r.qtype === 'LAQ' ? 'Section C' : 'Section B');
});

test('the modes and the rail teaching cards are gone', async ({ page }) => {
    await page.goto(URL);
    await page.waitForSelector('.page');
    const r = await page.evaluate(() => ({
        modeCard: document.querySelector('.mode-card') !== null,
        why: document.getElementById('whyCard') !== null,
        mistakes: document.getElementById('mistakeCard') !== null,
        railTitles: Array.from(document.querySelectorAll('.rail .card-title')).map((e) => e.textContent),
        testEntryInTopBar: document.querySelector('.topbar-actions #btnTest') !== null,
    }));
    expect(r.modeCard).toBe(false);
    expect(r.why).toBe(false);
    expect(r.mistakes).toBe(false);
    expect(r.railTitles).toEqual(['Answer plan', 'How to earn it', 'Mark split']);
    expect(r.testEntryInTopBar).toBe(true);   // the entry lives top-right now
});

test('the overlay closes on Escape and on a backdrop click', async ({ page }) => {
    await page.goto(URL);
    await page.waitForSelector('.page');
    const hidden = () => page.evaluate(() => document.getElementById('testOverlay')!.hidden);

    await page.click('#btnTest');
    expect(await hidden()).toBe(false);
    await page.keyboard.press('Escape');
    expect(await hidden()).toBe(true);

    await page.click('#btnTest');
    await page.click('#testOverlay', { position: { x: 8, y: 8 } });   // backdrop
    expect(await hidden()).toBe(true);
});
