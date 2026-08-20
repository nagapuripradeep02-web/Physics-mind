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
        cardHidden: document.getElementById('recallCard')!.hidden,
        // the grader-side rubric must never ship to the browser
        leakedRubric: JSON.stringify((window as any).PM_QUESTIONS).includes('must_convey'),
    }));

    expect(state.endpoint).toBe('');       // default build has no endpoint
    expect(state.cardHidden).toBe(true);   // therefore no mic
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
