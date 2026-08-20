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
    expect(result.state.pageCount).toBeGreaterThanOrEqual(2); // the LAQ honestly fills page 1
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

    expect(jumped.stepId).toBe('s6_direction');
    expect(jumped.marksEarned).toBe(7); // 2+1+1+1+1+1 through s6
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
        endpoint: (window as any).PM_RECALL_ENDPOINT,
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

test('the answer still reaches 8/8 with the recall feature present', async ({ page }) => {
    await page.goto(URL);
    await page.waitForSelector('.page');
    const r = await page.evaluate(() => {
        (window as any).PM_ANSWER.revealAll();
        return (window as any).PM_ANSWER.getState();
    });
    expect(r.marksEarned).toBe(r.marksTotal);
    expect(r.pageCount).toBeGreaterThanOrEqual(2);
});

// ── Tier 1: modes, teaching layer, self-assessment ───────────────────────────
// The regression that matters most is that Exam mode is a TRUE no-op: the
// teaching layer must never reach the notebook page, because anything inside
// .step-block gets typed and changes pagination.

test('exam mode is a true no-op — nothing extra reaches the notebook page', async ({ page }) => {
    await page.goto(URL);
    await page.waitForSelector('.page');
    await page.click('.mode-btn[data-mode="exam"]');

    const r = await page.evaluate(() => {
        (window as any).PM_ANSWER.revealAll();
        const allowed = ['line', 'red-mark', 'figure-wrap', 'total-underline'];
        const stray: string[] = [];
        document.querySelectorAll('.step-block').forEach((b) => {
            Array.from(b.children).forEach((c) => {
                if (!allowed.some((cls) => c.classList.contains(cls))) {
                    stray.push(`${b.getAttribute('data-step-id')}:${c.className}`);
                }
            });
        });
        return {
            stray,
            pages: document.querySelectorAll('.page').length,
            state: (window as any).PM_ANSWER.getState(),
            whyHidden: document.getElementById('whyCard')!.hidden,
            mistakesHidden: document.getElementById('mistakeCard')!.hidden,
        };
    });

    expect(r.stray).toEqual([]);            // the page is still only an answer script
    expect(r.pages).toBe(2);                // pagination unchanged
    expect(r.state.marksEarned).toBe(r.state.marksTotal);
    expect(r.whyHidden).toBe(true);
    expect(r.mistakesHidden).toBe(true);
});

test('study mode shows the teaching layer in the rail only', async ({ page }) => {
    await page.goto(URL);
    await page.waitForSelector('.page');
    const r = await page.evaluate(() => ({
        mode: (document.querySelector('.mode-btn.active') as HTMLElement).dataset.mode,
        why: document.getElementById('whyNote')!.textContent!.length,
        mistakes: document.querySelectorAll('#mistakeList li').length,
        pageHasWhy: document.querySelector('.step-block .why-note') !== null,
    }));
    expect(r.mode).toBe('study');           // the default
    expect(r.why).toBeGreaterThan(20);
    expect(r.mistakes).toBeGreaterThan(0);
    expect(r.pageHasWhy).toBe(false);
});

test('test mode: blank page, tap does not advance, self-score totals correctly', async ({ page }) => {
    await page.goto(URL);
    await page.waitForSelector('.page');
    await page.click('.mode-btn[data-mode="test"]');

    // the notebook stays blank on purpose — and tapping it must not reveal anything
    expect(await page.locator('.step-block').count()).toBe(0);
    await page.click('#notebook');
    expect(await page.locator('.step-block').count()).toBe(0);
    expect(await page.locator('#btnNext').isHidden()).toBe(true);
    // no mic without an endpoint; the paper path must still work
    expect(await page.locator('#btnMic').isHidden()).toBe(true);

    await page.click('#btnDonePaper');
    // 2 + 0.5 + 1 + 0 + 1 + 1 + 0.5 + 0(no-mark step) = 6
    for (const v of ['got', 'partly', 'got', 'missed', 'got', 'got', 'partly']) {
        await page.waitForSelector(`.ss-buttons .btn.${v}`);
        await page.click(`.ss-buttons .btn.${v}`);
    }
    await page.waitForSelector('.ss-buttons .btn');   // the 0-mark step's plain Next
    await page.click('.ss-buttons .btn');

    await expect(page.locator('.ss-total')).toHaveText('You would have scored 6 out of 8.');
    // partly + missed land in the redo list; got does not
    expect(await page.locator('.ss-redo .ri-label').allTextContents())
        .toEqual(['Draw the figure', 'Find AD and CD', 'Final answer for α']);
});
