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

/**
 * The page now lands on the CATALOG (founder decision 2026-08-20), so tests of
 * the notebook must open a question first. openFirst() = the old boot: first
 * question, default cut. openQ() = a specific question via the PM_ANSWER seam
 * (same path the router and the AI layer use).
 */
async function openFirst(page: any): Promise<void> {
    await page.goto(URL);
    await page.waitForSelector('#catalogView:not([hidden])');
    await page.evaluate(() => {
        const w = window as any;
        w.PM_ANSWER.openQuestion(w.PM_QUESTIONS[0].question_id);
    });
    await page.waitForSelector('.page');
}

async function openQ(page: any, id: string, cut?: string): Promise<void> {
    await page.evaluate(
        ([qid, ck]: [string, string | undefined]) => (window as any).PM_ANSWER.openQuestion(qid, ck),
        [id, cut] as [string, string | undefined]);
    await page.waitForSelector('.page');
    await page.waitForTimeout(200);
}

test('reveals all steps, earns exactly the total, and never splits a block across a page', async ({ page }) => {
    await openFirst(page);

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
    // >= 1, not >= 2: PM_QUESTIONS[0] is alphabetical and a 2-mark VSAQ
    // honestly fits one page. The straddle check below is the real gate.
    expect(result.state.pageCount).toBeGreaterThanOrEqual(1);
    expect(result.straddle).toEqual([]);                      // no block split across a page break
});

test('jump via the rail reproduces the identical pagination', async ({ page }) => {
    await openFirst(page);

    // Seek the LONGEST question and take a mid-list step from it. A literal step id
    // broke the moment a second question was authored and became PM_QUESTIONS[0]; a
    // literal index broke again when a second UNIT put a 2-step VSAQ in that slot
    // (steps.length - 3 === -1). The page break this gate exists to check only occurs
    // in a long answer, so the question must be sought, never assumed.
    const pick = await page.evaluate(() => {
        const qs = (window as any).PM_QUESTIONS as any[];
        const best = qs.reduce((a, q) => (q.answer.steps.length > a.answer.steps.length ? q : a), qs[0]);
        const steps = best.answer.steps as any[];
        return { qid: best.question_id, stepId: steps[steps.length - 3].id, stepCount: steps.length };
    });
    expect(pick.stepCount).toBeGreaterThanOrEqual(3);   // a degenerate pick is not a pass
    await openQ(page, pick.qid);
    const target = pick.stepId;                          // late enough to be past a page break

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

test('mobile viewport scales without horizontal scroll, in both views', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    // the catalog is the landing view now — it must not scroll sideways either
    await page.goto(URL);
    await page.waitForSelector('#catalogView:not([hidden])');
    const catScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1
    );
    expect(catScroll, 'catalog view').toBe(false);

    await page.evaluate(() => {
        const w = window as any;
        w.PM_ANSWER.openQuestion(w.PM_QUESTIONS[0].question_id);
    });
    await page.waitForSelector('.page');
    const nbScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1
    );
    expect(nbScroll, 'notebook view').toBe(false);
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
    await openFirst(page);

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
    await openFirst(page);
    const r = await page.evaluate(() => {
        (window as any).PM_ANSWER.revealAll();
        return (window as any).PM_ANSWER.getState();
    });
    expect(r.marksEarned).toBe(r.marksTotal);
    expect(r.pageCount).toBeGreaterThanOrEqual(1);
});

// ── Test yourself (top-right entry: self-check, photo, mic) ──────────────────
// The offline guarantee is the one that regresses silently: with no API base the
// two SERVER paths must stay absent and the page must make zero network calls.
// The self-check needs no server, so it is always offered — which is why there
// is no longer an empty state to show.

test('with no checking API the page offers the self-check but neither photo nor mic', async ({ page }) => {
    await openFirst(page);
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
    await openFirst(page);
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
    await openFirst(page);
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
    await openFirst(page);

    // Sweeps EVERY question, like the other inventory gates. Checking only the first
    // one made the gate a hostage to file order: it hardcoded "Section B" and went red
    // the moment a second unit sorted a VSAQ (Section A) into PM_QUESTIONS[0] — while
    // saying nothing at all about the other thirty-six.
    const bad = await page.evaluate(() => {
        const out: string[] = [];
        for (const q of (window as any).PM_QUESTIONS as any[]) {
            const splitSum = q.mark_split.reduce((a: number, m: any) => a + m.marks, 0);
            const stepSum = q.answer.steps.reduce((a: number, s: any) => a + s.marks, 0);
            const header = q.answer.page_header.join(' | ');
            // the three places a mark total appears must never drift apart, and the
            // header must name the section the question is actually sat in
            if (splitSum !== q.marks_total) out.push(`${q.question_id}: mark_split sums ${splitSum}, not ${q.marks_total}`);
            if (stepSum !== q.marks_total) out.push(`${q.question_id}: steps sum ${stepSum}, not ${q.marks_total}`);
            if (!header.includes(`${q.marks_total} marks`)) out.push(`${q.question_id}: header omits "${q.marks_total} marks"`);
            if (!header.includes(q.paper_section)) out.push(`${q.question_id}: header omits "${q.paper_section}"`);
        }
        return out;
    });
    expect(bad).toEqual([]);
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
    // Find the id from the DATA, then open only that one. This used to open every
    // question in turn and ask listCuts() — O(n) page renders — which timed out once
    // Maths-1A Unit 6 took the book past 160 questions: the only multi-cut questions
    // are the physics ones, and `ts_ipe_p1_*` now sorts behind 130+ `ts_ipe_m1a_*`.
    // `cuts` is a top-level field on the question, so the scan needs no rendering at
    // all. Raising the timeout would have worked today and failed again at Unit 7.
    const id = await page.evaluate(() =>
        ((window as any).PM_QUESTIONS as any[]).find((q) => (q.cuts || []).length >= 2)?.question_id
        ?? null);
    if (id === null) return null;
    await openQ(page, id);
    return await page.evaluate(() => (window as any).PM_ANSWER.listCuts());
}

// ── cuts: the same question at two lengths ──────────────────────────────────
// The chrome used to be append-only, so a second render stacked duplicates and
// the step pills kept click handlers closed over the previous step set. These
// tests exist to keep that from coming back.

test('switching cut changes the answer, the marks and the header together', async ({ page }) => {
    await openFirst(page);

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

    await page.evaluate((k) => (window as any).PM_ANSWER.setCut(k), cuts![1].key);
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
    await page.evaluate((k) => (window as any).PM_ANSWER.setCut(k), cuts![0].key);
    await page.waitForTimeout(300);
    const back = await read();
    expect(back.pills).toBe(first.pills);
    expect(back.split).toBe(first.split);
    expect(back.chips).toBe(first.chips);
    expect(back.header).toBe(first.header);
});

test('a step pill jumps to the right step after a cut switch', async ({ page }) => {
    await openFirst(page);
    const cuts = await selectMultiCutQuestion(page);
    test.skip(cuts === null, 'no question in this build declares more than one cut');

    await page.evaluate(() => {
        const pm = (window as any).PM_ANSWER;
        pm.setCut(pm.listCuts()[1].key);
    });
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
    test.setTimeout(240_000);   // fleet sweep — cost grows with every unit; raised deliberately at 4 units (never trim the sweep)
    await openFirst(page);
    const count = await page.evaluate(() => (window as any).PM_QUESTIONS.length);

    // Pencil strokes reveal through a clip rect that starts zero-sized along the
    // wipe axis. revealAll(), a rail jump and PRINT all place steps instantly, so
    // if the instant path does not finish the figure every dashed construction
    // line silently disappears — invisible to every other gate, because the path
    // element is still there, still "visible", just clipped to nothing.
    for (let q = 0; q < count; q++) {
        await page.evaluate((i) => {
            const w = window as any;
            w.PM_ANSWER.openQuestion(w.PM_ANSWER.questionIds[i]);
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

test('no two figure labels overlap, in any question', async ({ page }) => {
    test.setTimeout(240_000);   // fleet sweep — cost grows with every unit; raised deliberately at 4 units (never trim the sweep)
    await openFirst(page);
    const count = await page.evaluate(() => (window as any).PM_QUESTIONS.length);

    // Figures are hand-placed by coordinate, so two labels colliding is the most
    // likely defect as more are authored — and it is invisible to every other
    // gate, which only ever checks that elements EXIST.
    for (let q = 0; q < count; q++) {
        await page.evaluate((i) => {
            const w = window as any;
            w.PM_ANSWER.openQuestion(w.PM_ANSWER.questionIds[i]);
        }, q);
        await page.waitForTimeout(250);
        await page.evaluate(() => (window as any).PM_ANSWER.revealAll());
        await page.waitForTimeout(500);

        const clashes = await page.evaluate(() => {
            const bad: string[] = [];
            document.querySelectorAll('.step-block svg').forEach((svg) => {
                const t = [...svg.querySelectorAll('text')]
                    .map((e) => ({ s: e.textContent || '', r: e.getBoundingClientRect() }))
                    .filter((e) => e.r.width > 0);
                for (let i = 0; i < t.length; i++) {
                    for (let j = i + 1; j < t.length; j++) {
                        const a = t[i].r, c = t[j].r;
                        if (a.left < c.right && c.left < a.right && a.top < c.bottom && c.top < a.bottom) {
                            bad.push(`"${t[i].s}" overlaps "${t[j].s}"`);
                        }
                    }
                }
            });
            return bad;
        });
        const id = await page.evaluate(() => (window as any).PM_ANSWER.question.question_id);
        expect(clashes, `${id} figure labels collide`).toEqual([]);
    }
});

test('the PM_ANSWER seam follows a question switch', async ({ page }) => {
    await openFirst(page);
    const count = await page.evaluate(() => (window as any).PM_QUESTIONS.length);
    test.skip(count < 2, 'single-question build');

    // PM_ANSWER.question was a CAPTURED value on a frozen object, so after a
    // switch this seam still described the boot-time question — silently, and
    // it is the documented hook for the AI layer. It must be a live read.
    const before = await page.evaluate(() => (window as any).PM_ANSWER.question.question_id);
    await page.evaluate(() => {
        const w = window as any;
        w.PM_ANSWER.openQuestion(w.PM_ANSWER.questionIds[1]);
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
    // Fleet sweep, and the widest one: every question TIMES every cut. It hit the
    // 30 s default the moment a second unit doubled the book — a timeout, never an
    // assertion, so the gate was reporting "failed" while nothing was wrong.
    test.setTimeout(240_000);
    await openFirst(page);
    const qCount = await page.evaluate(() => (window as any).PM_QUESTIONS.length);

    for (let q = 0; q < qCount; q++) {
        await page.evaluate((i) => {
            const w = window as any;
            w.PM_ANSWER.openQuestion(w.PM_ANSWER.questionIds[i]);
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
    await openFirst(page);
    const cuts = await page.evaluate(() => (window as any).PM_ANSWER.listCuts());

    // A too-long authored equation silently wraps and strands a fragment on the
    // next rule. Measured, not guessed at with a character budget: compare each
    // line's rendered height against the single-line height of its own siblings.
    for (let i = 0; i < cuts.length; i++) {
        await page.evaluate((k) => (window as any).PM_ANSWER.setCut(k), cuts[i].key);
        await page.waitForTimeout(250);
        await page.evaluate(() => (window as any).PM_ANSWER.revealAll());
        await page.waitForTimeout(500);

        const r = await page.evaluate(() => {
            const bad: string[] = [];
            const offRule: string[] = [];
            document.querySelectorAll('.step-block .line').forEach((el) => {
                const e = el as HTMLElement;
                const lh = parseFloat(getComputedStyle(e).lineHeight || '0');
                if (!lh || !e.textContent) return;
                const h = e.getBoundingClientRect().height;
                // A typeset line (render: "katex") is legitimately several rules tall —
                // a 3×3 matrix is three. The wrap rule cannot apply to it, but the
                // STRONGER invariant does: it must occupy a whole number of rules, or
                // every line after it walks off the ruled paper.
                if (e.getAttribute('data-render') === 'katex') {
                    if (Math.round(h) % 32 !== 0) offRule.push(e.textContent.trim() + ` [h=${h}]`);
                    return;
                }
                if (h > lh * 1.6) bad.push(e.textContent.trim());
            });
            return { bad, offRule };
        });
        expect(r.bad, `cut "${cuts[i].key}" has wrapped line(s)`).toEqual([]);
        expect(r.offRule, `cut "${cuts[i].key}" has typeset line(s) off the rule`).toEqual([]);
    }
});

test('the modes and the rail teaching cards are gone', async ({ page }) => {
    await openFirst(page);
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
    await openFirst(page);
    const hidden = () => page.evaluate(() => document.getElementById('testOverlay')!.hidden);

    await page.click('#btnTest');
    expect(await hidden()).toBe(false);
    await page.keyboard.press('Escape');
    expect(await hidden()).toBe(true);

    await page.click('#btnTest');
    await page.click('#testOverlay', { position: { x: 8, y: 8 } });   // backdrop
    expect(await hidden()).toBe(true);
});

// ── catalog: the landing view ────────────────────────────────────────────────
// The catalog lists the BOOK'S inventory (PM_UNITS), not just what is authored,
// so a student sees the chapter's true shape. Coming-soon entries must never
// read as clickable, and the qtype filter works on the UNION of an entry's book
// section and its authored cuts (the projectile counts as LAQ and SAQ both).

test('the catalog is the landing view and shows the full inventory', async ({ page }) => {
    await page.goto(URL);
    await page.waitForSelector('#catalogView:not([hidden])');

    const r = await page.evaluate(() => {
        const units = (window as any).PM_UNITS as any[];
        const entries = units.reduce((a: number, u: any) => a + u.questions.length, 0);
        const ready = units.reduce(
            (a: number, u: any) => a + u.questions.filter((e: any) => e.question_id).length, 0);
        return {
            entries, ready,
            notebookHidden: document.getElementById('notebookView')!.hidden,
            cards: document.querySelectorAll('.cat-card').length,
            soon: document.querySelectorAll('.cat-card.soon').length,
            soonHrefs: [...document.querySelectorAll('.cat-card.soon')]
                .filter((c) => c.hasAttribute('href')).length,
            soonChips: [...document.querySelectorAll('.cat-card.soon .cc-chip')]
                .every((c) => c.textContent === 'Not written yet'),
            // One pill per unit, each counting ITS OWN unit — the whole-book total
            // lives in catSub. Reading only the first pill and comparing it to the
            // global count passed by coincidence while there was exactly one unit.
            expectedPills: units.map((u: any) =>
                u.questions.filter((e: any) => e.question_id).length + ' of ' + u.questions.length + ' ready'),
            pills: [...document.querySelectorAll('.cat-count')].map((p) => p.textContent),
            sub: document.getElementById('catSub')!.textContent,
        };
    });

    expect(r.notebookHidden).toBe(true);
    expect(r.cards).toBe(r.entries);                    // every book entry is a card
    expect(r.soon).toBe(r.entries - r.ready);           // unauthored render as coming-soon
    expect(r.soonHrefs).toBe(0);                        // and never as links
    expect(r.soonChips).toBe(true);
    expect(r.pills).toEqual(r.expectedPills);           // per-unit pills, one each, in order
    expect(r.sub).toContain(r.ready + ' answers ready'); // whole-book total
});

test('qtype filter chips match on the section alone, with true counts', async ({ page }) => {
    await page.goto(URL);
    await page.waitForSelector('#catalogView:not([hidden])');

    const expectFilter = async (qtype: string) => {
        await page.click('#qtypeChips .cat-chip[data-qtype="' + qtype + '"]');
        await page.waitForTimeout(200);
        return page.evaluate((t) => {
            const w = window as any;
            // ONE CARD = ONE LENGTH: an entry belongs to exactly its section
            const match = (e: any) => t === 'ALL' || e.section === t;
            const want = (w.PM_UNITS as any[])
                .reduce((a: number, u: any) => a + u.questions.filter(match).length, 0);
            const chip = document.querySelector('#qtypeChips .cat-chip[data-qtype="' + t + '"]')!;
            return {
                visible: document.querySelectorAll('.cat-card').length,
                want,
                chipCount: Number(chip.querySelector('.ct')!.textContent),
                chipOn: chip.classList.contains('on'),
            };
        }, qtype);
    };

    for (const t of ['LAQ', 'SAQ', 'VSAQ', 'ALL']) {
        const r = await expectFilter(t);
        expect(r.chipOn, t + ' chip active').toBe(true);
        expect(r.visible, t + ' visible cards').toBe(r.want);
        expect(r.chipCount, t + ' chip count').toBe(r.want);
    }
});

test('an LAQ card opens the 8-mark answer, an SAQ card the 4-mark one', async ({ page }) => {
    await page.goto(URL);
    await page.waitForSelector('#catalogView:not([hidden])');

    // Both sections must exist authored for this to mean anything.
    const have = await page.evaluate(() => {
        const w = window as any;
        const entries = (w.PM_UNITS as any[]).flatMap((u: any) => u.questions);
        return {
            laq: entries.some((e: any) => e.section === 'LAQ' && e.question_id),
            saq: entries.some((e: any) => e.section === 'SAQ' && e.question_id),
        };
    });
    test.skip(!have.laq || !have.saq, 'need an authored LAQ and SAQ');

    await page.click('#qtypeChips .cat-chip[data-qtype="LAQ"]');
    await page.waitForTimeout(200);
    await page.click('a.cat-card');
    await page.waitForSelector('.page');
    await page.waitForTimeout(300);
    const laq = await page.evaluate(() => ({
        qtype: (window as any).PM_ANSWER.listCuts().find((c: any) => c.active).qtype,
        total: (window as any).PM_ANSWER.getState().marksTotal,
    }));
    expect(laq.qtype).toBe('LAQ');
    expect(laq.total).toBe(8);

    await page.click('#btnCatalog');
    await page.waitForSelector('#catalogView:not([hidden])');
    await page.click('#qtypeChips .cat-chip[data-qtype="SAQ"]');
    await page.waitForTimeout(200);
    await page.click('a.cat-card');
    await page.waitForSelector('.page');
    await page.waitForTimeout(300);
    const saq = await page.evaluate(() => ({
        qtype: (window as any).PM_ANSWER.listCuts().find((c: any) => c.active).qtype,
        total: (window as any).PM_ANSWER.getState().marksTotal,
    }));
    expect(saq.qtype).toBe('SAQ');
    expect(saq.total).toBe(4);
});

test('the notebook offers no length switch — the catalog choice is final', async ({ page }) => {
    // The in-page "How much to write" switcher was the confusion the one-length
    // model removed. It must not come back; the cut mechanism lives on only in
    // the data, the router and the PM_ANSWER seam.
    await openFirst(page);
    const r = await page.evaluate(() => ({
        switcher: document.getElementById('cutSwitch') !== null,
        card: document.getElementById('cutCard') !== null,
        railTitles: [...document.querySelectorAll('.rail .card-title')].map((e) => e.textContent),
    }));
    expect(r.switcher).toBe(false);
    expect(r.card).toBe(false);
    expect(r.railTitles).not.toContain('How much to write');
});

test('deep link boots into the notebook and Back returns to the catalog', async ({ page }) => {
    // the shareable path: a hash link opens a question + cut directly
    const target = 'ts_ipe_p1_mp_projectile_motion';
    await page.goto(URL + '#/q/' + target + '/saq_parabola');
    await page.waitForSelector('.page');
    await page.waitForTimeout(300);

    const nb = await page.evaluate(() => ({
        view: document.getElementById('notebookView')!.hidden ? 'catalog' : 'notebook',
        id: (window as any).PM_ANSWER.question.question_id,
        cut: (window as any).PM_ANSWER.getState().cutKey,
        backShown: !document.getElementById('btnCatalog')!.hidden,
    }));
    expect(nb.view).toBe('notebook');
    expect(nb.id).toBe(target);
    expect(nb.cut).toBe('saq_parabola');
    expect(nb.backShown).toBe(true);

    await page.click('#btnCatalog');
    await page.waitForSelector('#catalogView:not([hidden])');
    const cat = await page.evaluate(() => ({
        hash: location.hash,
        notebookHidden: document.getElementById('notebookView')!.hidden,
        backHidden: document.getElementById('btnCatalog')!.hidden,
    }));
    expect(cat.hash).toBe('#/');
    expect(cat.notebookHidden).toBe(true);
    expect(cat.backHidden).toBe(true);
});

test('catalog search narrows the cards and can find nothing', async ({ page }) => {
    await page.goto(URL);
    await page.waitForSelector('#catalogView:not([hidden])');

    await page.fill('#catSearch', 'parallelogram');
    await page.waitForTimeout(200);
    const one = await page.evaluate(() => document.querySelectorAll('.cat-card').length);
    expect(one).toBeGreaterThanOrEqual(1);
    expect(one).toBeLessThan(5);

    // a search that matches nothing shows the no-results row, not a blank page
    await page.fill('#catSearch', 'zzzz nothing');
    await page.waitForTimeout(200);
    const none = await page.evaluate(() => ({
        cards: document.querySelectorAll('.cat-card').length,
        noneShown: !document.getElementById('catNone')!.hidden,
    }));
    expect(none.cards).toBe(0);
    expect(none.noneShown).toBe(true);
});

// ── mathematics: the subject dimension + typeset lines ───────────────────────
// Both mechanisms landed with the Maths-1A track. They are asserted here because
// each one fails SILENTLY: a broken subject filter just shows the wrong cards, and
// a build that stops typesetting shows raw TeX that still "renders".

test('the catalog filters by subject and each section shows its own mark value', async ({ page }) => {
    await page.goto(URL);
    await page.waitForSelector('#catalogView:not([hidden])');

    const subjects = await page.evaluate(() => {
        const units = (window as any).PM_UNITS as any[];
        const by: Record<string, number> = {};
        units.forEach((u) => {
            const s = u.subject || 'physics';
            by[s] = (by[s] ?? 0) + u.questions.length;
        });
        return by;
    });
    const names = Object.keys(subjects);
    const row = page.locator('#subjectChips');
    // One subject = no row at all; the physics-only build must look untouched.
    if (names.length < 2) {
        await expect(row).toBeHidden();
        return;
    }
    await expect(row).toBeVisible();

    for (const s of names) {
        await page.click(`#subjectChips [data-subject="${s}"]`);
        await page.waitForTimeout(200);
        const shown = await page.evaluate(() => document.querySelectorAll('.cat-card').length);
        expect(shown, `cards shown for ${s}`).toBe(subjects[s]);
    }

    // The section heading's mark value is read off the questions, never hardcoded:
    // a Physics-I long answer is 8 marks and a Maths-1A long answer is 7.
    await page.click('#subjectChips [data-subject="ALL"]');
    await page.waitForTimeout(200);
    const heads = await page.evaluate(() =>
        [...document.querySelectorAll('#catSections .cat-subhead')].map((h) => h.textContent || ''));
    for (const h of heads) {
        const m = /·\s*(\d+)\s*marks/.exec(h);
        if (!m) continue;
        const card = await page.evaluate((label) => {
            const hs = [...document.querySelectorAll('#catSections .cat-subhead')];
            const el = hs.find((x) => x.textContent === label)!;
            let n: Element | null = el.nextElementSibling;
            while (n && !n.classList.contains('cat-card')) n = n.nextElementSibling;
            return n ? (n.querySelector('.cc-chip')?.textContent ?? '') : '';
        }, h);
        expect(card, `first card under "${h}"`).toContain(m[1] + ' marks');
    }
});

test('a typeset line renders as math, sits on whole rules, and never shows raw TeX', async ({ page }) => {
    test.setTimeout(240_000);   // fleet sweep — cost grows with every typeset question; raised deliberately
                                // when Maths-1A Unit 3 (Matrices) took the book from 2 typeset questions to 39.
                                // NEVER trim the sweep instead: .kx-clip is overflow:hidden, so an over-wide
                                // typeset line is truncated with NO other symptom, and this is the only guard.
    await page.goto(URL);
    await page.waitForSelector('#catalogView:not([hidden])');

    const withKatex = await page.evaluate(() =>
        ((window as any).PM_QUESTIONS as any[])
            .filter((q) => q.answer.steps.some((s: any) =>
                (s.lines || []).some((l: any) => l && l.render === 'katex')))
            .map((q) => q.question_id));
    if (!withKatex.length) return;              // a book with no typeset line is legal

    for (const id of withKatex) {
        await openQ(page, id);
        await page.evaluate(() => (window as any).PM_ANSWER.revealAll());
        await page.waitForTimeout(700);
        const r = await page.evaluate(() => {
            const clips = [...document.querySelectorAll('.kx-clip')] as HTMLElement[];
            return {
                clips: clips.length,
                typeset: clips.filter((c) => c.querySelector('.katex')).length,
                // overflow:hidden makes the wipe possible and truncation invisible.
                // Two DIFFERENT ways a typeset line loses its right edge, so assert both:
                //  (a) the tree is wider than the space the line actually gives it. Measure
                //      against the CONTENT box — clientWidth still includes the 56px
                //      padding-left that .line.eq/.boxed add, and every matrix line is
                //      eq-styled, so comparing against clientWidth alone silently allowed
                //      anything up to 56px of overflow.
                //  (b) the clip ended up NARROWER than the tree inside it — the frozen-width
                //      bug that shaved the closing "]" off the Matrices answers.
                clipped: clips.filter((c) => {
                    const line = c.closest('.line') as HTMLElement;
                    const cs = getComputedStyle(line);
                    const avail = line.clientWidth
                        - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
                    const kin = c.firstElementChild as HTMLElement | null;
                    const natural = kin ? kin.getBoundingClientRect().width : c.scrollWidth;
                    return natural > avail + 0.5                       // (a) genuinely too wide
                        || natural > c.getBoundingClientRect().width + 0.5;  // (b) under-shown
                }).map((c) => c.getAttribute('data-tex')),
                rawTex: /\\(circ|therefore|because|begin\{|frac|text\{)/.test(
                    document.getElementById('notebookView')!.textContent || ''),
            };
        });
        expect(r.clips, `${id} has typeset lines`).toBeGreaterThan(0);
        expect(r.typeset, `${id}: every clip holds real KaTeX output`).toBe(r.clips);
        expect(r.clipped, `${id}: typeset line(s) truncated by the wipe container`).toEqual([]);
        expect(r.rawTex, `${id}: raw TeX leaked onto the page`).toBe(false);
    }
});

// The sweep above reveals INSTANTLY, which never freezes a clip width — so it cannot
// see the failure this test exists for. Stepping through with the real wipe measures
// each clip and freezes that width; a matrix measured before its tall-delimiter KaTeX
// Size font has loaded freezes SHORT, and the closing "]" is gone for good. That is
// font-load dependent, so it hit the first matrix opened on a cold page and not the
// rest — exactly the "sometimes there is no ]" a reader reported on 2026-08-21.
test('an animated typeset reveal never leaves a clip narrower than its own ink', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(URL);                       // cold: the Size fonts are not fetched yet
    await page.waitForSelector('#catalogView:not([hidden])');

    const matrixQ = await page.evaluate(() =>
        ((window as any).PM_QUESTIONS as any[]).find((q) =>
            q.answer.steps.some((s: any) => (s.lines || []).some((l: any) =>
                l && l.render === 'katex' && /\\begin\{[bv]matrix\}/.test(l.text))))?.question_id);
    if (!matrixQ) return;                       // a book with no matrix is legal

    await page.evaluate((q) => (window as any).PM_ANSWER.openQuestion(q), matrixQ);
    await page.waitForSelector('.page');
    for (let i = 0; i < 3; i++) {
        await page.evaluate(() => (window as any).PM_ANSWER.revealNext());
        await page.waitForTimeout(2600);        // let the wipe finish and the clip settle
    }

    const short = await page.evaluate(() =>
        [...document.querySelectorAll('.kx-clip')]
            .map((c) => {
                const ink = (c.firstElementChild as HTMLElement).getBoundingClientRect().width;
                return { tex: c.getAttribute('data-tex') || '',
                         missing: +(ink - c.getBoundingClientRect().width).toFixed(1) };
            })
            .filter((r) => r.missing > 0.5));
    expect(short, `${matrixQ}: clip is narrower than its typeset ink — the closing ` +
        `delimiter is being cut off`).toEqual([]);
});
