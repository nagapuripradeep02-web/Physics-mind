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

    // Pick a mid-list step from the ACTIVE question. A literal step id broke the
    // moment a second question was authored and became PM_QUESTIONS[0].
    const target = await page.evaluate(() => {
        const steps = (window as any).PM_ANSWER.question.answer.steps as any[];
        return steps[steps.length - 3].id;   // late enough to be past a page break
    });

    // Which PAGE the target step lands on. Comparing total pageCount instead was
    // wrong: tapping to the end renders more steps than jumping to the middle, so
    // the totals legitimately differ and the old literal only matched by luck.
    // What must hold is that a step lands on the SAME page either way.
    const pageOf = (id: string) => page.evaluate((stepId) => {
        const bodies = [...document.querySelectorAll('.page-body')];
        return bodies.findIndex((b) => b.querySelector(`[data-step-id="${stepId}"]`) !== null);
    }, id);

    await page.evaluate(() => (window as any).PM_ANSWER.revealAll());
    await page.waitForTimeout(400);
    const tappedPage = await pageOf(target);

    const jumped = await page.evaluate(async (id) => {
        const pm = (window as any).PM_ANSWER;
        pm.goToStep(id);
        // goToStep animates the last step — finish it instantly
        pm.revealNext();
        await new Promise((r) => setTimeout(r, 400));
        return pm.getState();
    }, target);
    const jumpedPage = await pageOf(target);

    // Marks are summed from the AUTHORED steps, never written as a literal: the
    // split is a claim pending teacher verification and has been revised once
    // already, and a literal would report that revision as a pagination failure.
    const expected = await page.evaluate((id) => {
        const steps = (window as any).PM_ANSWER.question.answer.steps as any[];
        const upto = steps.findIndex((s: any) => s.id === id);
        return steps.slice(0, upto + 1).reduce((a, s) => a + s.marks, 0);
    }, target);

    expect(jumped.stepId).toBe(target);
    expect(jumped.marksEarned).toBe(expected);
    expect(tappedPage).toBeGreaterThanOrEqual(0);
    expect(jumpedPage).toBe(tappedPage);   // same page break either way
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

/**
 * Select the first question in the build that offers more than one cut.
 *
 * These tests used to `test.skip` when PM_QUESTIONS[0] had a single cut — and
 * that is exactly what happened the moment a one-cut question sorted to the
 * front: two cut tests reported as skipped, which reads as green. A skipped
 * check is not a pass. Now they go and FIND a multi-cut question, and only skip
 * if the build genuinely has none.
 */
async function selectMultiCutQuestion(page: any): Promise<any[] | null> {
    const count = await page.evaluate(() => (window as any).PM_QUESTIONS.length);
    for (let i = 0; i < count; i++) {
        await page.evaluate((n: number) => {
            const sel = document.getElementById('qPick') as HTMLSelectElement | null;
            if (sel) { sel.value = String(n); sel.dispatchEvent(new Event('change')); }
        }, i);
        await page.waitForTimeout(250);
        const cuts = await page.evaluate(() => (window as any).PM_ANSWER.listCuts());
        if (cuts.length >= 2) return cuts;
    }
    return null;
}

// ── cuts: the same question at two lengths ──────────────────────────────────
// The chrome used to be append-only, so a second render stacked duplicates and
// the step pills kept click handlers closed over the previous step set. These
// tests exist to keep that from coming back.

test('switching cut changes the answer, the marks and the header together', async ({ page }) => {
    await page.goto(URL);
    await page.waitForSelector('.page');

    const cuts = await selectMultiCutQuestion(page);
    test.skip(cuts === null, 'no question in this build declares more than one cut');
    const cutSplitRows = await page.evaluate(
        () => ((window as any).PM_ANSWER.question.cuts ?? []).map((c: any) => c.mark_split.length));

    const read = () => page.evaluate(() => ({
        state: (window as any).PM_ANSWER.getState(),
        pills: document.querySelectorAll('#stepList .step-pill').length,
        split: document.querySelectorAll('#markSplit .split-row').length,
        chips: document.querySelectorAll('#questionMeta .chip').length,
        accTotal: document.getElementById('accTotal')!.textContent,
        header: [...document.querySelectorAll('.page-header-block .line')]
            .map((e) => e.textContent).join(' | '),
    }));

    const first = await read();
    expect(first.state.cutKey).toBe(cuts![0].key);
    expect(first.pills).toBe(first.state.stepIds.length);
    expect(first.accTotal).toBe('/' + cuts![0].marks_total);
    expect(first.header).toContain(`${cuts![0].marks_total} marks`);

    await page.click('#cutSwitch .cut-btn:nth-child(2)');
    await page.waitForTimeout(300);
    const second = await read();

    // the shorter cut really is shorter, and every readout followed it
    expect(second.state.cutKey).toBe(cuts![1].key);
    expect(second.state.marksTotal).toBe(cuts![1].marks_total);
    expect(second.state.stepIds.length).toBeLessThan(first.state.stepIds.length);
    expect(second.pills).toBe(second.state.stepIds.length);
    expect(second.accTotal).toBe('/' + cuts![1].marks_total);
    expect(second.header).toContain(`${cuts![1].marks_total} marks`);
    expect(second.header).not.toContain(`${cuts![0].marks_total} marks`);

    // chrome CLEARS rather than appends — the old bug stacked these
    expect(second.chips).toBe(first.chips);
    expect(second.split).toBe(cutSplitRows[1]);   // rows follow the cut, not the marks

    // and the reduced cut still totals exactly its own marks
    await page.evaluate(() => (window as any).PM_ANSWER.revealAll());
    await page.waitForTimeout(400);
    const done = await page.evaluate(() => (window as any).PM_ANSWER.getState());
    expect(done.marksEarned).toBe(cuts![1].marks_total);

    // switching back restores the full answer without duplicating anything
    await page.click('#cutSwitch .cut-btn:nth-child(1)');
    await page.waitForTimeout(300);
    const back = await read();
    expect(back.pills).toBe(first.pills);
    expect(back.split).toBe(first.split);
    expect(back.chips).toBe(first.chips);
    expect(back.header).toBe(first.header);
});

test('a step pill jumps to the right step after a cut switch', async ({ page }) => {
    await page.goto(URL);
    await page.waitForSelector('.page');
    const cuts = await selectMultiCutQuestion(page);
    test.skip(cuts === null, 'no question in this build declares more than one cut');

    await page.click('#cutSwitch .cut-btn:nth-child(2)');
    await page.waitForTimeout(300);

    // the LAST pill of the reduced cut — under the old append-only list its
    // handler still carried an index from the full step set
    const ids = await page.evaluate(() => (window as any).PM_ANSWER.getState().stepIds);
    await page.click('#stepList .step-pill:last-child');
    await page.waitForTimeout(500);
    await page.evaluate(() => (window as any).PM_ANSWER.revealNext());
    await page.waitForTimeout(400);

    const st = await page.evaluate(() => (window as any).PM_ANSWER.getState());
    expect(st.stepId).toBe(ids[ids.length - 1]);
});

test('construction lines survive an instant placement, in every question', async ({ page }) => {
    await page.goto(URL);
    await page.waitForSelector('.page');
    const count = await page.evaluate(() => (window as any).PM_QUESTIONS.length);

    // Pencil strokes reveal through a clip rect that starts zero-sized along the
    // wipe axis. revealAll(), a rail jump and PRINT all place steps instantly, so
    // if the instant path does not finish the figure every dashed construction
    // line silently disappears — invisible to every other gate, because the path
    // element is still there, still "visible", just clipped to nothing.
    for (let q = 0; q < count; q++) {
        await page.evaluate((i) => {
            const sel = document.getElementById('qPick') as HTMLSelectElement | null;
            if (sel) { sel.value = String(i); sel.dispatchEvent(new Event('change')); }
        }, q);
        await page.waitForTimeout(250);
        await page.evaluate(() => (window as any).PM_ANSWER.revealAll());
        await page.waitForTimeout(500);

        const collapsed = await page.evaluate(() => {
            const bad: string[] = [];
            document.querySelectorAll('.step-block clipPath rect').forEach((r) => {
                const w = parseFloat(r.getAttribute('width') || '0');
                const h = parseFloat(r.getAttribute('height') || '0');
                if (w <= 0 || h <= 0) bad.push(`${r.parentElement?.getAttribute('id')} ${w}x${h}`);
            });
            return bad;
        });
        const id = await page.evaluate(() => (window as any).PM_ANSWER.question.question_id);
        expect(collapsed, `${id} has clipped-away construction lines`).toEqual([]);
    }
});

test('the PM_ANSWER seam follows a question switch', async ({ page }) => {
    await page.goto(URL);
    await page.waitForSelector('.page');
    const count = await page.evaluate(() => (window as any).PM_QUESTIONS.length);
    test.skip(count < 2, 'single-question build');

    // PM_ANSWER.question was a CAPTURED value on a frozen object, so after a
    // switch this seam still described the boot-time question — silently, and
    // it is the documented hook for the AI layer. It must be a live read.
    const before = await page.evaluate(() => (window as any).PM_ANSWER.question.question_id);
    await page.evaluate(() => {
        const sel = document.getElementById('qPick') as HTMLSelectElement;
        sel.value = '1'; sel.dispatchEvent(new Event('change'));
    });
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => ({
        seam: (window as any).PM_ANSWER.question.question_id,
        dom: document.querySelector('.notebook-col')!.getAttribute('data-question-id'),
        text: document.getElementById('questionText')!.textContent,
    }));

    expect(after.seam).not.toBe(before);
    expect(after.seam).toBe(after.dom);                       // seam agrees with the DOM
    expect(after.text).toContain('Q.');
});

test('every cut of every question totals exactly its own marks', async ({ page }) => {
    await page.goto(URL);
    await page.waitForSelector('.page');
    const qCount = await page.evaluate(() => (window as any).PM_QUESTIONS.length);

    for (let q = 0; q < qCount; q++) {
        await page.evaluate((i) => {
            const sel = document.getElementById('qPick') as HTMLSelectElement | null;
            if (sel) { sel.value = String(i); sel.dispatchEvent(new Event('change')); }
        }, q);
        await page.waitForTimeout(250);

        const cuts = await page.evaluate(() => (window as any).PM_ANSWER.listCuts());
        for (const c of cuts) {
            await page.evaluate((k) => (window as any).PM_ANSWER.setCut(k), c.key);
            await page.waitForTimeout(200);
            await page.evaluate(() => (window as any).PM_ANSWER.revealAll());
            await page.waitForTimeout(450);

            const r = await page.evaluate(() => ({
                st: (window as any).PM_ANSWER.getState(),
                acc: document.getElementById('accValue')!.textContent,
                total: document.getElementById('accTotal')!.textContent,
                header: [...document.querySelectorAll('.page-header-block .line')]
                    .map((e) => e.textContent).join(' | '),
            }));
            const where = `${r.st.cutKey} of question ${q + 1}`;
            expect(r.st.marksTotal, where).toBe(c.marks_total);
            expect(r.st.marksEarned, where).toBe(c.marks_total);   // a full answer earns the lot
            expect(r.acc, where).toBe(String(c.marks_total));
            expect(r.total, where).toBe('/' + c.marks_total);
            expect(r.header, where).toContain(`${c.marks_total} marks`);
        }
    }
});

test('no written line wraps past its own height, in either cut', async ({ page }) => {
    await page.goto(URL);
    await page.waitForSelector('.page');
    const cuts = await page.evaluate(() => (window as any).PM_ANSWER.listCuts());

    // A too-long authored equation silently wraps and strands a fragment on the
    // next rule. Measured, not guessed at with a character budget: compare each
    // line's rendered height against the single-line height of its own siblings.
    for (let i = 0; i < cuts.length; i++) {
        await page.evaluate((k) => (window as any).PM_ANSWER.setCut(k), cuts[i].key);
        await page.waitForTimeout(250);
        await page.evaluate(() => (window as any).PM_ANSWER.revealAll());
        await page.waitForTimeout(500);

        const wrapped = await page.evaluate(() => {
            const bad: string[] = [];
            document.querySelectorAll('.step-block .line').forEach((el) => {
                const e = el as HTMLElement;
                const lh = parseFloat(getComputedStyle(e).lineHeight || '0');
                if (!lh || !e.textContent) return;
                if (e.getBoundingClientRect().height > lh * 1.6) bad.push(e.textContent.trim());
            });
            return bad;
        });
        expect(wrapped, `cut "${cuts[i].key}" has wrapped line(s)`).toEqual([]);
    }
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
    // The Question card only exists in a multi-question build, so assert the
    // stable core is present and in order rather than pinning the whole array.
    expect(r.railTitles).toContain('Answer plan');
    expect(r.railTitles).toContain('How to earn it');
    expect(r.railTitles).toContain('Mark split');
    expect(r.railTitles.indexOf('Answer plan')).toBeLessThan(r.railTitles.indexOf('Mark split'));
    expect(r.railTitles).not.toContain('Study');       // the three-mode toggle is gone
    expect(r.railTitles).not.toContain('Why this step');
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
