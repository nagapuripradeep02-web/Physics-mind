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
import { existsSync, readFileSync } from 'fs';

const DIST = join(process.cwd(), 'answer-book', 'dist', 'index.html');
const URL = 'file:///' + DIST.replace(/\\/g, '/');

test.beforeAll(() => {
    if (!existsSync(DIST)) throw new Error('answer-book/dist/index.html missing — run npm run build:answers first');
    // These gates assert the OFFLINE build (PM_VIDI_BASE === ''). Serving a
    // person needs the HOSTED one, so dist flips back and forth — and a hosted
    // dist used to fail three unrelated gates with a confusing diff instead of
    // saying so. Name the problem and the fix. (scar, 2026-08-23)
    const base = /PM_VIDI_BASE\s*=\s*"([^"]*)"/.exec(readFileSync(DIST, 'utf8'));
    if (base && base[1]) {
        throw new Error(
            'answer-book/dist is the HOSTED build (PM_VIDI_BASE=' + base[1] + '). ' +
            'The smoke suite asserts the offline build. Run: npm run build:answers ' +
            '(then npm run build:answers:hosted again before serving it to a person).');
    }
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

// ── Test yourself — DORMANT (founder, 2026-08-23) ────────────────────────────
// The "Test myself" entry is removed for now: completion is two stages
// (Understand → Revise) and the self-check/photo/mic code stays in the page but
// unreachable. The gates that exercised the overlay went with it; the dormancy
// gate at the end of the suite asserts the entry stays hidden.

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
    const ids = await page.evaluate(() => (window as any).PM_ANSWER.questionIds);
    for (const id of ids) {
        await openQ(page, id);
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
    test.setTimeout(360_000);   // fleet sweep — cost grows with every unit; raised deliberately at 4 units, again at 8 (never trim the sweep)
    // Measured: 90s @111q · 126s @130q · 132s @157q · 162s @198q.
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
    test.setTimeout(360_000);   // fleet sweep — cost grows with every unit; raised deliberately at 4 units, again at 8 (never trim the sweep)
    // Measured: 90s @111q · 132s @130q · 132s @157q · 168s @198q.
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
    // This test does CONSTANT work — it opens two questions — but it runs straight
    // after the two 2-minute fleet sweeps, and its page.goto inherits a browser that
    // has just walked every question twice. Measured: 2.9s in isolation, 30.5s (the
    // 30s default, i.e. a TIMEOUT reported as a failure) in sequence at six units.
    // Raised deliberately in the commit that grew the fleet - do not trim the sweeps.
    test.slow();
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
    test.setTimeout(360_000);   // the WIDEST sweep: questions x cuts. Raised 240s -> 360s at 8 units.
    // Measured: 114s @111q · 144s @130q · 168s @157q · 204s @198q -> slope ~0.9 s/question,
    // so 360s holds to roughly 370 questions. Raise deliberately; never trim the sweep.
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
    await openFirst(page);
    const r = await page.evaluate(() => ({
        modeCard: document.querySelector('.mode-card') !== null,
        why: document.getElementById('whyCard') !== null,
        mistakes: document.getElementById('mistakeCard') !== null,
        railTitles: Array.from(document.querySelectorAll('.rail .card-title')).map((e) => e.textContent),
        testEntryHidden: (() => { const b = document.getElementById('btnTest'); return !!b && b.hidden; })(),
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
    expect(r.testEntryHidden).toBe(true);     // Test myself is dormant (founder, 2026-08-23)
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

test('board tags render: asked chips carry real years, predicted entries say so', async ({ page }) => {
    await page.goto(URL);
    await page.waitForSelector('#catalogView:not([hidden])');

    // Session 89: a TS or AP student must see which papers asked a question, and
    // an enumerated (predicted) question must NEVER dress as an asked one. The
    // expectations are computed from the DATA, not hardcoded: every card whose
    // question has appearances[] shows an .asked chip with each board's years;
    // every source:"enumerated" entry shows the predicted chip and no asked chip.
    const r = await page.evaluate(() => {
        const w = window as any;
        const qById: Record<string, any> = {};
        (w.PM_QUESTIONS as any[]).forEach((q) => { qById[q.question_id] = q; });
        const bad: string[] = [];
        let askedSeen = 0, predictedSeen = 0;
        (w.PM_UNITS as any[]).forEach((u) => u.questions.forEach((e: any) => {
            if (!e.question_id) return;
            const card = document.querySelector(
                `.cat-card[href="#/q/${encodeURIComponent(e.question_id)}"]`) ||
                [...document.querySelectorAll('.cat-card')].find((c) =>
                    (c.getAttribute('href') || '').indexOf(encodeURIComponent(e.question_id)) >= 0);
            if (!card) { bad.push(`${e.ref}: card not found`); return; }
            const asked = card.querySelector('.cc-chip.asked');
            const predicted = card.querySelector('.cc-chip.predicted');
            if (e.source === 'enumerated') {
                predictedSeen++;
                if (!predicted) bad.push(`${e.question_id}: enumerated but no predicted chip`);
                if (asked) bad.push(`${e.question_id}: enumerated yet shows an asked chip`);
                if (predicted && predicted.textContent !== 'Predicted — not asked yet')
                    bad.push(`${e.question_id}: predicted chip wording drifted`);
            } else {
                const apps = (qById[e.question_id] || {}).appearances || [];
                if (apps.length) {
                    askedSeen++;
                    if (!asked) { bad.push(`${e.question_id}: has appearances but no asked chip`); return; }
                    const txt = asked.textContent || '';
                    for (const a of apps) {
                        const label = a.board === 'ap_ipe' ? 'AP' : 'TS';
                        if (txt.indexOf(String(a.year)) < 0 || txt.indexOf(label) < 0)
                            bad.push(`${e.question_id}: asked chip "${txt}" missing ${label} ${a.year}`);
                    }
                } else if (asked) {
                    bad.push(`${e.question_id}: asked chip with no appearances data`);
                }
            }
        }));
        return { bad, askedSeen, predictedSeen };
    });
    expect(r.bad).toEqual([]);
    // the gate must have exercised both branches, or it proves nothing
    expect(r.askedSeen).toBeGreaterThanOrEqual(5);
    expect(r.predictedSeen).toBeGreaterThanOrEqual(5);

    // and the notebook meta row carries the asked line for a tagged question
    await page.evaluate(() => {
        const w = window as any;
        const tagged = (w.PM_QUESTIONS as any[]).find((q) => (q.appearances || []).length);
        w.PM_ANSWER.openQuestion(tagged.question_id);
    });
    await page.waitForSelector('.page');
    const metaAsked = await page.evaluate(
        () => document.querySelector('#questionMeta .chip.asked')?.textContent || '');
    expect(metaAsked).toContain('Asked:');
});

test('chapter chips appear from the second unit and filter to their own chapter', async ({ page }) => {
    await page.goto(URL);
    await page.waitForSelector('#catalogView:not([hidden])');

    // The row is stubbed in shell.html but was never populated, so for one whole unit
    // it sat hidden and empty. It has to stay hidden while there is one chapter (a
    // filter with a single choice is noise) and appear the moment there are two.
    const shape = await page.evaluate(() => {
        const units = (window as any).PM_UNITS as any[];
        const row = document.getElementById('unitChips')!;
        return {
            unitCount: units.length,
            hidden: row.hidden,
            chips: [...row.querySelectorAll('.cat-chip')].map((c) => c.getAttribute('data-unit')),
            want: ['ALL', ...units.map((u: any) => String(u.number))],
        };
    });
    expect(shape.unitCount).toBeGreaterThanOrEqual(2);   // else this gate proves nothing
    expect(shape.hidden).toBe(false);
    expect(shape.chips).toEqual(shape.want);             // All chapters, then one per unit in order

    // Each chip shows only its own chapter, and its count is that chapter's whole
    // inventory — coming-soon entries included, exactly like the qtype chips.
    for (const key of shape.want) {
        await page.click('#unitChips .cat-chip[data-unit="' + key + '"]');
        await page.waitForTimeout(200);
        const r = await page.evaluate((k) => {
            const units = (window as any).PM_UNITS as any[];
            const mine = k === 'ALL' ? units : units.filter((u: any) => String(u.number) === k);
            const chip = document.querySelector('#unitChips .cat-chip[data-unit="' + k + '"]')!;
            return {
                visible: document.querySelectorAll('.cat-card').length,
                headings: document.querySelectorAll('.cat-section').length,
                want: mine.reduce((a: number, u: any) => a + u.questions.length, 0),
                wantHeadings: mine.length,
                chipCount: Number(chip.querySelector('.ct')!.textContent),
                chipOn: chip.classList.contains('on'),
            };
        }, key);
        expect(r.chipOn, key + ' chip active').toBe(true);
        expect(r.visible, key + ' visible cards').toBe(r.want);
        expect(r.headings, key + ' chapter headings').toBe(r.wantHeadings);
        expect(r.chipCount, key + ' chip count').toBe(r.want);
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

// ── Vidi — the assistant layer (docs/ANSWER_BOOK_VIDI_DESIGN.md, Rungs 1+2) ──
// The default build has NO chat base (PM_VIDI_BASE === ''), so every Vidi
// feature below must work with ZERO network calls — the offline guarantee
// extends to the assistant. The free-text ask row must not exist at all.

test('Vidi panel renders in the rail, chips answer deterministically, zero network', async ({ page }) => {
    const external: string[] = [];
    page.on('request', (r) => {
        const u = r.url();
        if (!u.startsWith('file://') && !u.includes('fonts.g')) external.push(u);
    });
    await openFirst(page);

    // panel visible, greeting bubble lands after its typing beat
    await page.waitForSelector('#pm-assistant-slot:not([hidden])');
    await page.waitForSelector('#vidiThread .vidi-msg.tutor:not(.vidi-typing)', { timeout: 4000 });

    const r = await page.evaluate(() => ({
        vidiBase: (window as any).PM_VIDI_BASE,
        askRowHidden: document.getElementById('vidiAskRow')!.hidden,
        chips: document.querySelectorAll('#vidiChips .vidi-chip').length,
        // the rail-order gate pins .card-title — the panel must not add one
        cardTitleInSlot: document.querySelector('#pm-assistant-slot .card-title') !== null,
        greeting: document.querySelector('#vidiThread .vidi-msg.tutor')!.textContent || '',
    }));
    expect(r.vidiBase).toBe('');
    expect(r.askRowHidden).toBe(true);        // no base → the ask row does not exist
    expect(r.chips).toBeGreaterThanOrEqual(3);
    expect(r.cardTitleInSlot).toBe(false);
    expect(r.greeting.length).toBeGreaterThan(0);

    // a chip answers instantly from authored data — still zero network
    await page.click('#vidiChips .vidi-chip');   // "Will this come?"
    await page.waitForFunction(
        () => document.querySelectorAll('#vidiThread .vidi-msg.tutor:not(.vidi-typing)').length >= 2,
        undefined, { timeout: 4000 });

    expect(external).toEqual([]);
});

test('the memory-tip chip appears only where a tip is authored', async ({ page }) => {
    await openFirst(page);
    const ids = await page.evaluate(() => {
        const qs = (window as any).PM_QUESTIONS as any[];
        const tipped = qs.find((q) => q.answer.steps[0] && q.answer.steps[0].memory_tip);
        const bare = qs.find((q) => q.answer.steps.every((s: any) => !s.memory_tip));
        return { tipped: tipped ? tipped.question_id : null, bare: bare ? bare.question_id : null };
    });

    const chipTexts = async () => page.evaluate(
        () => Array.from(document.querySelectorAll('#vidiChips .vidi-chip')).map((b) => b.textContent));

    test.skip(!ids.tipped, 'no question with a memory tip on its first step is authored yet');
    await openQ(page, ids.tipped!);
    expect(await chipTexts()).toContain('How to remember?');

    // The NEGATIVE control. It used to be a bare `if (ids.bare)`, which silently
    // becomes a no-op the moment every question has a tip — an enrichment pass
    // would disarm the only assertion proving the chip is conditional at all, and
    // this gate would stay green while testing half of itself. So: use a real bare
    // question when one exists, otherwise STRIP the tips off the loaded question in
    // the page and re-render. Same branch exercised either way.
    if (ids.bare) {
        await openQ(page, ids.bare);
        expect(await chipTexts()).not.toContain('How to remember?');
    } else {
        // Strip the TIPPED question, not just any question: stripping one that had
        // no tips to begin with is a no-op that passes while proving nothing.
        await page.evaluate((qid) => {
            const q = ((window as any).PM_QUESTIONS as any[]).find((x) => x.question_id === qid);
            (window as any).__PM_TIPS_SAVED = q.answer.steps.map((s: any) => s.memory_tip);
            q.answer.steps.forEach((s: any) => { delete s.memory_tip; });
        }, ids.tipped!);
        await openQ(page, ids.tipped!);
        expect(await chipTexts(), 'the tip chip must disappear when no step carries a tip')
            .not.toContain('How to remember?');
        await page.evaluate((qid) => {
            const q = ((window as any).PM_QUESTIONS as any[]).find((x) => x.question_id === qid);
            const saved = (window as any).__PM_TIPS_SAVED as (string | undefined)[];
            q.answer.steps.forEach((s: any, i: number) => { if (saved[i]) s.memory_tip = saved[i]; });
        }, ids.tipped!);
    }
});

test('rename is offered once after the first Mark revised, blocklist holds, name persists', async ({ page }) => {
    await bootPlanner(page, '2026-09-01', { pm_intro_done: '1' });
    const plan = await buildPlanViaChat(page, '2026-09-21');
    const qid = plan.days[0].learn[0];
    const qid2 = plan.days[0].learn[1];

    // learn today (tick claimed in the leave-question ask), revise tomorrow —
    // the FIRST finished revision is the rename moment (founder, 2026-08-23)
    await page.evaluate((q: string) => (window as any).PM_ANSWER.openQuestion(q), qid);
    await page.waitForTimeout(400);
    await page.evaluate(() => (window as any).PM_ANSWER.revealAll());
    // a full reveal alone sets nothing (founder, 2026-08-23) — the tick is
    // claimed on the way out, in the leave-question ask
    expect(await page.evaluate((q: string) =>
        !JSON.parse(localStorage.getItem('pm_stage_v1') || '{}')[q]?.u, qid)).toBe(true);
    await leaveAndAnswer(page);
    await page.waitForFunction((q: string) => {
        try { return !!JSON.parse(localStorage.getItem('pm_stage_v1') || '{}')[q]?.u; } catch { return false; }
    }, qid, { timeout: 3000 });
    await page.evaluate(() => localStorage.setItem('pm_today_override', '2026-09-02'));
    await page.evaluate((q: string) => (window as any).PM_ANSWER.openQuestion(q), qid);
    await page.locator('#vidiChips .vidi-chip', { hasText: 'Mark revised' }).click();

    await page.waitForSelector('#vidiRename:not([hidden])', { timeout: 4000 });

    // a blocked name is refused and the display name does not change
    await page.fill('#vidiNameInput', 'chutiya');
    await page.click('#vidiNameSave');
    const blocked = await page.evaluate(() => ({
        note: document.getElementById('vidiRenameNote')!.textContent || '',
        name: document.querySelector('#pm-assistant-slot .vidi-name')!.textContent,
        renameOpen: !document.getElementById('vidiRename')!.hidden,
    }));
    expect(blocked.renameOpen).toBe(true);
    expect(blocked.name).toBe('Vidi');
    expect(blocked.note).toContain('different');

    // a real name is saved and shown
    await page.fill('#vidiNameInput', 'Chintu');
    await page.click('#vidiNameSave');
    const renamed = await page.evaluate(() => ({
        name: document.querySelector('#pm-assistant-slot .vidi-name')!.textContent,
        renameOpen: !document.getElementById('vidiRename')!.hidden,
    }));
    expect(renamed.name).toBe('Chintu');
    expect(renamed.renameOpen).toBe(false);

    // a SECOND finished revision must not offer the rename again
    await page.evaluate((q: string) => (window as any).PM_ANSWER.openQuestion(q), qid2);
    await page.waitForTimeout(400);
    await page.evaluate(() => (window as any).PM_ANSWER.revealAll());
    await leaveAndAnswer(page);
    await page.evaluate(() => localStorage.setItem('pm_today_override', '2026-09-03'));
    await page.evaluate((q: string) => (window as any).PM_ANSWER.openQuestion(q), qid2);
    await page.locator('#vidiChips .vidi-chip', { hasText: 'Mark revised' }).click();
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => !document.getElementById('vidiRename')!.hidden)).toBe(false);

    // persistence is a localStorage property — file:// may block it; assert only when it works
    const storageWorks = await page.evaluate(() => {
        try { localStorage.setItem('pm_vidi_t', '1'); localStorage.removeItem('pm_vidi_t'); return true; }
        catch { return false; }
    });
    if (storageWorks) {
        await openFirst(page);   // full reload
        const kept = await page.evaluate(
            () => document.querySelector('#pm-assistant-slot .vidi-name')!.textContent);
        expect(kept).toBe('Chintu');
    }
});

test('the exam-eve route renders the most-asked list and Back returns to the catalog', async ({ page }) => {
    await page.goto(URL + '#/exam-eve/4');
    await page.waitForSelector('#examEveView:not([hidden])');

    const r = await page.evaluate(() => ({
        title: document.getElementById('eveTitle')!.textContent || '',
        cards: document.querySelectorAll('#eveBody a.eve-card').length,
        // eve cards must never read as catalog cards (the count gates pin .cat-card)
        catCardsInEve: document.querySelectorAll('#eveBody .cat-card').length,
        backShown: !document.getElementById('btnCatalog')!.hidden,
    }));
    expect(r.title).toContain('Unit 4');
    expect(r.cards).toBeGreaterThan(0);          // unit 4 has 3-star questions
    expect(r.catCardsInEve).toBe(0);
    expect(r.backShown).toBe(true);

    // a card opens its question
    await page.click('#eveBody a.eve-card');
    await page.waitForSelector('.page');

    // and Back from the catalog button still lands on the catalog
    await page.click('#btnCatalog');
    await page.waitForSelector('#catalogView:not([hidden])');
});

test('the triage strip appears under a chapter filter and card counts stay exact', async ({ page }) => {
    await page.goto(URL);
    await page.waitForSelector('#catalogView:not([hidden])');

    const landing = await page.evaluate(() => ({
        triageHidden: document.getElementById('vidiTriage')!.hidden,
        cards: document.querySelectorAll('.cat-card').length,
    }));
    expect(landing.triageHidden).toBe(true);     // no chapter filter → no strip

    await page.click('.cat-chip[data-unit="4"]');
    await page.waitForTimeout(150);
    const filtered = await page.evaluate(() => {
        const u4 = ((window as any).PM_UNITS as any[]).find((u) => u.number === 4);
        return {
            triageHidden: document.getElementById('vidiTriage')!.hidden,
            links: document.querySelectorAll('#vidiTriage .vidi-tri-link').length,
            cards: document.querySelectorAll('.cat-card').length,
            expected: u4.questions.length,
            triageIsCard: document.querySelectorAll('#vidiTriage .cat-card').length,
        };
    });
    expect(filtered.triageHidden).toBe(false);
    expect(filtered.links).toBeGreaterThan(0);
    expect(filtered.cards).toBe(filtered.expected);   // the strip added no cards
    expect(filtered.triageIsCard).toBe(0);

    // search hides the strip (the search gate counts a clean card list)
    await page.fill('#catSearch', 'parallelogram');
    await page.waitForTimeout(200);
    const searched = await page.evaluate(() => document.getElementById('vidiTriage')!.hidden);
    expect(searched).toBe(true);
});

test('the Vidi window minimizes to the launcher pill and comes back, no sideways scroll on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openFirst(page);

    // first question on a fresh device: the window opens once so the student meets her
    await page.waitForSelector('#pm-assistant-slot:not([hidden])');
    const open = await page.evaluate(() => ({
        fabHidden: document.getElementById('vidiFab')!.hidden,
        hScroll: document.documentElement.scrollWidth > window.innerWidth + 1,
    }));
    expect(open.fabHidden).toBe(true);      // pill hides while the window is up
    expect(open.hScroll).toBe(false);

    // minimize → the pill returns, carrying the assistant's name
    await page.click('#vidiClose');
    const min = await page.evaluate(() => ({
        winHidden: document.getElementById('pm-assistant-slot')!.hidden,
        fabHidden: document.getElementById('vidiFab')!.hidden,
        fabText: document.getElementById('vidiFab')!.textContent || '',
    }));
    expect(min.winHidden).toBe(true);
    expect(min.fabHidden).toBe(false);
    expect(min.fabText).toContain('Vidi');

    // the pill re-opens it
    await page.click('#vidiFab');
    const back = await page.evaluate(() => document.getElementById('pm-assistant-slot')!.hidden);
    expect(back).toBe(false);
});

test('at desktop width Vidi docks as the third column and minimize collapses it', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await openFirst(page);
    await page.waitForSelector('#pm-assistant-slot:not([hidden])');

    const docked = await page.evaluate(() => {
        const win = document.getElementById('pm-assistant-slot')!.getBoundingClientRect();
        return {
            bodyClass: document.body.classList.contains('vidi-docked'),
            rightEdge: window.innerWidth - win.right,
            fullHeight: win.bottom >= window.innerHeight - 2,
            nbMargin: parseInt(getComputedStyle(document.getElementById('notebookView')!).marginRight, 10),
            hScroll: document.documentElement.scrollWidth > window.innerWidth + 1,
        };
    });
    expect(docked.bodyClass).toBe(true);
    expect(docked.rightEdge).toBeLessThanOrEqual(2);      // flush with the screen edge
    expect(docked.fullHeight).toBe(true);                 // runs to the bottom
    expect(docked.nbMargin).toBe(344);                    // the notebook yields the column
    expect(docked.hScroll).toBe(false);

    // minimize: the column collapses and the middle takes the space back
    await page.click('#vidiClose');
    const min = await page.evaluate(() => ({
        bodyClass: document.body.classList.contains('vidi-docked'),
        nbMargin: parseInt(getComputedStyle(document.getElementById('notebookView')!).marginRight, 10),
        fabShown: !document.getElementById('vidiFab')!.hidden,
    }));
    expect(min.bodyClass).toBe(false);
    expect(min.nbMargin).toBe(0);
    expect(min.fabShown).toBe(true);
});

test('the Vidi window drags by its header and the place sticks', async ({ page }) => {
    // 1100px sits in the FLOATING band (721–1179): docked above it never drags
    await page.setViewportSize({ width: 1100, height: 800 });
    await openFirst(page);
    await page.waitForSelector('#pm-assistant-slot:not([hidden])');

    const before = (await page.locator('#pm-assistant-slot').boundingBox())!;
    const head = (await page.locator('#vidiHead').boundingBox())!;
    await page.mouse.move(head.x + head.width / 2, head.y + head.height / 2);
    await page.mouse.down();
    await page.mouse.move(head.x + head.width / 2 - 260, head.y + head.height / 2 - 220, { steps: 6 });
    await page.mouse.up();

    const after = (await page.locator('#pm-assistant-slot').boundingBox())!;
    expect(before.x - after.x).toBeGreaterThan(180);
    expect(before.y - after.y).toBeGreaterThan(150);

    // the position persists in localStorage (guarded — file:// may block it)
    const storageWorks = await page.evaluate(() => {
        try { localStorage.setItem('pm_vidi_t', '1'); localStorage.removeItem('pm_vidi_t'); return true; }
        catch { return false; }
    });
    if (storageWorks) {
        await openFirst(page);
        await page.waitForSelector('#pm-assistant-slot:not([hidden])');
        const kept = (await page.locator('#pm-assistant-slot').boundingBox())!;
        expect(Math.abs(kept.x - after.x)).toBeLessThan(8);
        expect(Math.abs(kept.y - after.y)).toBeLessThan(8);
    }
});

test('the ask field and the mic exist exactly when the build has a chat base', async ({ page }) => {
    await openFirst(page);
    await page.waitForSelector('#pm-assistant-slot:not([hidden])');
    const r = await page.evaluate(() => ({
        base: (window as any).PM_VIDI_BASE,
        askRowHidden: document.getElementById('vidiAskRow')!.hidden,
        micExists: document.getElementById('vidiMic') !== null,
        sendExists: document.getElementById('vidiSend') !== null,
    }));
    // this suite runs the OFFLINE build: the row (mic + field + send inside it)
    // must be absent here and present in any hosted build — same base, same row
    expect(r.base).toBe('');
    expect(r.askRowHidden).toBe(true);
    expect(r.micExists).toBe(true);
    expect(r.sendExists).toBe(true);
});

// ═══ the study planner — deterministic, offline, personal ═══════════════════
// The clock is injectable (pm_today_override) so every date-dependent behavior
// is testable byte-for-byte. All five gates run with zero network, like the
// rest of the offline suite.

/** Seed the injectable clock (and optional state) BEFORE the page boots. */
async function bootPlanner(page: any, today: string, seed: Record<string, string> = {}) {
    await page.addInitScript((args: { today: string; seed: Record<string, string> }) => {
        try {
            localStorage.setItem('pm_today_override', args.today);
            for (const k of Object.keys(args.seed)) localStorage.setItem(k, args.seed[k]);
        } catch { /* file:// storage may be blocked; the page has its own fallback */ }
    }, { today, seed });
    await page.goto(URL);
    await page.waitForFunction(() => (window as any).PM_ANSWER);
}

/** Drive the whole onboarding conversation and return the stored plan. */
async function buildPlanViaChat(page: any, examDate: string, unitIdx: number[] = [0, 1], hoursLabel = '1 hour', scopeUntick: string[] = []) {
    if (await page.isVisible('#vidiFab')) await page.click('#vidiFab');
    const lastW = () => page.locator('.vidi-widget').last();
    // intro not done → the intro widget; done → the offer chip
    const introBtn = page.locator('.vw-btn', { hasText: 'Plan my first-term exam' });
    if (await introBtn.count()) await introBtn.click();
    else await page.locator('#vidiChips .vidi-chip', { hasText: 'Plan my exam prep' }).click();
    await lastW().locator('input[type=date]').waitFor({ timeout: 4000 });
    await lastW().locator('input[type=date]').fill(examDate);
    await lastW().locator('.vw-btn.primary').click();                       // Set date
    await lastW().locator('.vw-check input').first().waitFor({ timeout: 4000 });
    for (const i of unitIdx) await lastW().locator('.vw-check input').nth(i).check();
    await lastW().locator('.vw-btn.primary').click();                       // These chapters →
    await lastW().locator('.vw-scope-box').first().waitFor({ timeout: 4000 });   // the qtype scope step
    for (const t of scopeUntick) await lastW().locator(`.vw-scope-box[value="${t}"]`).uncheck();
    await lastW().locator('.vw-btn.primary').click();                       // These types →
    await page.locator('.vw-btn', { hasText: 'Generate my plan' }).waitFor({ timeout: 5000 });
    await page.locator('.vw-btn', { hasText: 'Generate my plan' }).click();
    await page.locator('.vw-btn', { hasText: hoursLabel }).waitFor({ timeout: 4000 });
    await page.locator('.vw-btn', { hasText: hoursLabel }).click();
    await page.locator('.vw-btn', { hasText: 'Implement this plan' }).waitFor({ timeout: 4000 });
    await page.locator('.vw-btn', { hasText: 'Implement this plan' }).click();
    await page.waitForFunction(() => {
        try { const p = JSON.parse(localStorage.getItem('pm_plan_v1') || 'null'); return p && p.implemented; }
        catch { return false; }
    }, undefined, { timeout: 4000 });
    return page.evaluate(() => JSON.parse(localStorage.getItem('pm_plan_v1')!));
}

/** Navigate away from a fully revealed answer and answer the leave-question
    ask (founder, 2026-08-23) — Yes claims the tick, Not-yet leaves it clean. */
async function leaveAndAnswer(page: any, yes = true, target = '#/') {
    await page.evaluate((h: string) => { location.hash = h; }, target);
    await page.waitForSelector('.pm-ask:not([hidden])', { timeout: 4000 });
    await page.click(yes ? '#askYes' : '#askNo');
    // NOTE state:'hidden' — the default is 'visible', and a [hidden] element
    // never becomes visible, so the default silently hangs for the full timeout.
    await page.waitForSelector('.pm-ask', { state: 'hidden', timeout: 4000 });
}

test('the first open is the Viditra intro — no stars, and the whole onboarding runs offline', async ({ page }) => {
    const external: string[] = [];
    page.on('request', (r: any) => {
        const u = r.url();
        if (!u.startsWith('file://') && !u.includes('fonts.g')) external.push(u);
    });
    await bootPlanner(page, '2026-09-01');

    // the chat lives on the CATALOG now, pulsing until the intro has been seen
    await expect(page.locator('#vidiFab')).toBeVisible();
    expect(await page.evaluate(() => document.getElementById('vidiFab')!.classList.contains('vf-unread'))).toBe(true);

    await page.click('#vidiFab');
    await page.waitForSelector('#vidiThread .vidi-msg.tutor:not(.vidi-typing)', { timeout: 4000 });
    await page.locator('.vw-btn', { hasText: 'Plan my first-term exam' }).waitFor({ timeout: 4000 });
    const intro = await page.$$eval('#vidiThread .vidi-msg.tutor:not(.vidi-typing)',
        (els) => els.map((e) => e.textContent || ''));
    // the founder's requirement, locked: the first experience never talks stars
    // word-boundary, not substring: the founder's own "Start learning now" label
    // contains s-t-a-r. This still catches "3-star question" / "star rank",
    // which is what the rule is actually about. (2026-08-23)
    expect(intro.join(' ')).not.toMatch(/\bstars?\b/i);
    expect(intro.join(' ')).toContain('Viditra');

    const plan = await buildPlanViaChat(page, '2026-09-21');
    expect(plan.totalDays).toBe(20);
    expect(plan.implemented).toBe(true);
    expect(external).toEqual([]);   // the planner has NO network path at all

    // countdown strip live, outside the thread
    const strip = await page.$eval('#vidiPlanStrip', (e) => ({ hidden: (e as HTMLElement).hidden, text: e.textContent || '' }));
    expect(strip.hidden).toBe(false);
    expect(strip.text).toContain('Day 1 of 20');
});

test('the plan math is deterministic: priority first, revision next day, and re-runs agree', async ({ page }) => {
    await bootPlanner(page, '2026-09-01', { pm_intro_done: '1' });
    const plan = await buildPlanViaChat(page, '2026-09-21');

    // day 1 learns are the 3-star core first — never a 0-star predicted card
    const stars = await page.evaluate((qids: string[]) => {
        const units = (window as any).PM_UNITS as any[];
        return qids.map((qid) => {
            for (const u of units) for (const e of u.questions) if (e.question_id === qid) return e.stars;
            return -1;
        });
    }, plan.days[0].learn);
    expect(Math.min(...stars)).toBeGreaterThanOrEqual(2);

    // every day-1 learn is a day-2 revision: learn today, revise tomorrow
    expect(plan.days[1].revise).toEqual(plan.days[0].learn);

    // the final ~15% of days are the revision block
    expect(plan.revBlockStart).toBe(18);

    // same inputs ⇒ an identical schedule on a fresh run
    const firstDays = plan.days;
    await page.evaluate(() => localStorage.removeItem('pm_plan_v1'));
    await page.reload();
    await page.waitForFunction(() => (window as any).PM_ANSWER);
    const plan2 = await buildPlanViaChat(page, '2026-09-21');
    expect(plan2.days).toEqual(firstDays);
});

test('the leave-question ask claims Understand; Revise completes the green tick the catalog shows', async ({ page }) => {
    await bootPlanner(page, '2026-09-01', { pm_intro_done: '1' });
    const plan = await buildPlanViaChat(page, '2026-09-21');
    const qid = plan.days[0].learn[0];

    // reveal, then claim the tick in the leave-question ask (founder, 2026-08-23)
    await page.evaluate((q: string) => (window as any).PM_ANSWER.openQuestion(q), qid);
    await page.waitForTimeout(400);
    await page.evaluate(() => (window as any).PM_ANSWER.revealAll());
    // a full reveal alone sets nothing (founder, 2026-08-23) — the tick is
    // claimed on the way out, in the leave-question ask
    expect(await page.evaluate((q: string) =>
        !JSON.parse(localStorage.getItem('pm_stage_v1') || '{}')[q]?.u, qid)).toBe(true);
    await leaveAndAnswer(page);
    await page.waitForFunction((q: string) => {
        try { return !!JSON.parse(localStorage.getItem('pm_stage_v1') || '{}')[q]?.u; } catch { return false; }
    }, qid, { timeout: 3000 });

    // the Yes landed us on the catalog: the yellow chip says when revision is due
    await page.waitForSelector('.cc-chip.pm-upr.y');
    expect(await page.$$eval('.cc-chip.pm-upr.y', (els) => els.map((e) => e.textContent)))
        .toContain('✓ revise tomorrow');

    // next day: the revise chip appears on that question; ticking it goes green
    await page.evaluate(() => localStorage.setItem('pm_today_override', '2026-09-02'));
    await page.evaluate((q: string) => (window as any).PM_ANSWER.openQuestion(q), qid);
    await page.locator('#vidiChips .vidi-chip', { hasText: 'Mark revised' }).waitFor({ timeout: 4000 });
    await page.locator('#vidiChips .vidi-chip', { hasText: 'Mark revised' }).click();
    const st = await page.evaluate((q: string) =>
        JSON.parse(localStorage.getItem('pm_stage_v1')!)[q], qid);
    expect(st.u && st.r).toBeTruthy();

    // the catalog card shows the green tick — and the card-count gates stay true
    await page.evaluate(() => { location.hash = '#/'; });
    await page.waitForSelector('.cc-chip.pm-upr');
    const done = await page.$$eval('.cc-chip.pm-upr', (els) => els.map((e) => e.textContent));
    expect(done).toContain('✓ done');
    const counts = await page.evaluate(() => ({
        cards: document.querySelectorAll('.cat-card').length,
        entries: ((window as any).PM_UNITS as any[]).reduce((n: number, u: any) => n + u.questions.length, 0),
    }));
    expect(counts.cards).toBe(counts.entries);
});

test('behind pace, Vidi proposes a re-plan and the student must accept it', async ({ page }) => {
    await bootPlanner(page, '2026-09-01', { pm_intro_done: '1' });
    const plan = await buildPlanViaChat(page, '2026-09-21');

    // a week passes with nothing done → reopen the chat. NOTE addInitScript
    // re-runs on reload and would reset the clock override, so the day is
    // advanced in-page and the window is re-opened, not the page.
    await page.evaluate(() => localStorage.setItem('pm_today_override', '2026-09-08'));
    await page.click('#vidiClose');
    await page.click('#vidiFab');
    await page.locator('.vw-btn', { hasText: 'Use this plan' }).waitFor({ timeout: 6000 });
    const msgs = await page.$$eval('#vidiThread .vidi-msg.tutor:not(.vidi-typing)',
        (els) => els.map((e) => e.textContent || ''));
    expect(msgs.join(' ')).toContain('will not cover everything');
    // the strip carries the honest lag
    expect(await page.$eval('#vidiPlanStrip', (e) => e.textContent || '')).toContain('behind by');

    // nothing changes silently: the OLD plan stands until the student accepts
    const before = await page.evaluate(() => JSON.parse(localStorage.getItem('pm_plan_v1')!).start);
    expect(before).toBe(plan.start);
    await page.locator('.vw-btn', { hasText: 'Use this plan' }).click();
    await page.waitForFunction(() =>
        JSON.parse(localStorage.getItem('pm_plan_v1')!).start === '2026-09-08', undefined, { timeout: 4000 });
    const replanned = await page.evaluate(() => JSON.parse(localStorage.getItem('pm_plan_v1')!));
    expect(replanned.totalDays).toBe(13);
});

test('without a plan a question opens silently — chips only, and a quiet offer', async ({ page }) => {
    // intro already seen, no plan: the founder's "no 3-star talk" rule, locked
    await bootPlanner(page, '2026-09-01', { pm_intro_done: '1' });
    await openFirst(page);
    await page.waitForSelector('#pm-assistant-slot:not([hidden])');
    await page.waitForTimeout(1500);
    const bubbles = await page.$$eval('#vidiThread .vidi-msg.tutor:not(.vidi-typing)',
        (els) => els.map((e) => e.textContent || ''));
    expect(bubbles).toEqual([]);                       // silent open
    const chips = await page.$$eval('#vidiChips .vidi-chip', (els) => els.map((e) => e.textContent || ''));
    expect(chips.length).toBeGreaterThanOrEqual(3);    // the bank chips still answer
    expect(chips).toContain('Want a study plan?');     // the quiet offer, appended last
    expect(chips[0]).toBe('Will this come?');          // gate 27's first-chip click stays truthful
});

test('crunch mode: one week and too much work flips the plan to marks-first — LAQ and SAQ before any VSAQ', async ({ page }) => {
    // The founder's scenario, 2026-08-23: a plan was ignored and the student
    // opens the book with a week to go. The plan must NOT show all 200
    // questions — it puts long and short answers first (they carry the marks)
    // and says so; very short answers wait for exam-eve.
    await bootPlanner(page, '2026-09-01', { pm_intro_done: '1' });
    // Units 4+5 (they hold real LAQs) · 7 days · 30 min/day — cannot fit
    const plan = await buildPlanViaChat(page, '2026-09-08', [2, 3], '30 min');
    expect(plan.crunch).toBe(true);

    // in the learn order, no VSAQ is ever scheduled before an LAQ or SAQ
    const flat: string[] = plan.days.reduce((a: string[], d: any) => a.concat(d.learn), []);
    const qtypes = await page.evaluate((qids: string[]) => {
        const qs = (window as any).PM_QUESTIONS as any[];
        return qids.map((qid) => qs.find((q) => q.question_id === qid)!.qtype);
    }, flat);
    const firstVsaq = qtypes.indexOf('VSAQ');
    const lastBig = Math.max(qtypes.lastIndexOf('LAQ'), qtypes.lastIndexOf('SAQ'));
    if (firstVsaq >= 0) expect(firstVsaq).toBeGreaterThan(lastBig);

    // day 1 starts with the biggest marks on the table
    expect(['LAQ', 'SAQ']).toContain(qtypes[0]);

    // the overflow is named honestly, and the strategy is said out loud
    expect(plan.optional.length).toBeGreaterThan(0);
    const preview = await page.$$eval('#vidiThread .vidi-msg',
        (els) => els.map((e) => e.textContent || '').join(' '));
    expect(preview).toContain('long answers and short answers first');

    // the same flip happens on a RE-PLAN: an ignored plan replans into crunch
    await page.evaluate(() => localStorage.setItem('pm_today_override', '2026-09-05'));
    await page.click('#vidiClose');
    await page.click('#vidiFab');
    await page.locator('.vw-btn', { hasText: 'Use this plan' }).waitFor({ timeout: 6000 });
    await page.locator('.vw-btn', { hasText: 'Use this plan' }).click();
    await page.waitForFunction(() =>
        JSON.parse(localStorage.getItem('pm_plan_v1')!).start === '2026-09-05', undefined, { timeout: 4000 });
    const replanned = await page.evaluate(() => JSON.parse(localStorage.getItem('pm_plan_v1')!));
    expect(replanned.crunch).toBe(true);
});

// ── Test myself dormant + the qtype scope (founder, 2026-08-23) ──────────────

test('Test myself is dormant: the entry stays hidden and Understand alone completes learning', async ({ page }) => {
    await bootPlanner(page, '2026-09-01', { pm_intro_done: '1' });
    const plan = await buildPlanViaChat(page, '2026-09-21');
    const qid = plan.days[0].learn[0];
    await page.evaluate((q: string) => (window as any).PM_ANSWER.openQuestion(q), qid);
    await page.waitForTimeout(400);

    // the top-right entry keeps its dormant markup but is never shown
    const t = await page.evaluate(() => ({
        exists: document.querySelector('.topbar-actions #btnTest') !== null,
        hidden: (document.getElementById('btnTest') as any).hidden,
        overlayHidden: (document.getElementById('testOverlay') as any).hidden,
    }));
    expect(t.exists).toBe(true);      // dormant, not deleted — reversible by design
    expect(t.hidden).toBe(true);
    expect(t.overlayHidden).toBe(true);

    // with no self-check anywhere, the leave-question ask is the only path to a tick
    await page.evaluate(() => (window as any).PM_ANSWER.revealAll());
    // a full reveal alone sets nothing (founder, 2026-08-23) — the tick is
    // claimed on the way out, in the leave-question ask
    expect(await page.evaluate((q: string) =>
        !JSON.parse(localStorage.getItem('pm_stage_v1') || '{}')[q]?.u, qid)).toBe(true);
    await leaveAndAnswer(page);
    await page.waitForFunction((q: string) => {
        try { return !!JSON.parse(localStorage.getItem('pm_stage_v1') || '{}')[q]?.u; } catch { return false; }
    }, qid, { timeout: 3000 });
    const st = await page.evaluate((q: string) => JSON.parse(localStorage.getItem('pm_stage_v1')!)[q], qid);
    expect(st.p).toBeFalsy();         // nothing can set the vestigial practice tick
});

test('the plan can skip question types: unticked LAQs never appear anywhere in the plan', async ({ page }) => {
    await bootPlanner(page, '2026-09-01', { pm_intro_done: '1' });
    // Units 4+5 hold real LAQs (the crunch gate uses them for the same reason)
    const plan = await buildPlanViaChat(page, '2026-09-21', [2, 3], '1 hour', ['LAQ']);
    expect(plan.scope).toEqual(['SAQ', 'VSAQ']);

    const qids: string[] = Object.keys(plan.learnDay).concat(plan.optional);
    expect(qids.length).toBeGreaterThan(0);
    const qtypes = await page.evaluate((ids: string[]) => {
        const qs = (window as any).PM_QUESTIONS as any[];
        return ids.map((qid) => qs.find((q) => q.question_id === qid)!.qtype);
    }, qids);
    expect(qtypes).not.toContain('LAQ');

    // and the analysis said so out loud, honestly
    const msgs = await page.$$eval('#vidiThread .vidi-msg.tutor:not(.vidi-typing)',
        (els) => els.map((e) => e.textContent || '').join(' '));
    expect(msgs).toContain('The plan skips long answers');
});

test('mid-plan "Change my plan" re-scopes by proposal — nothing changes until the student accepts', async ({ page }) => {
    await bootPlanner(page, '2026-09-01', { pm_intro_done: '1' });
    const plan = await buildPlanViaChat(page, '2026-09-21', [2, 3]);
    expect(plan.scope).toBe(null);

    // the student has finished the very short answers elsewhere
    await page.locator('#vidiChips .vidi-chip', { hasText: 'Change my plan' }).click();
    await page.locator('.vw-btn', { hasText: 'Change question types' }).click();
    await page.locator('.vw-scope-box[value="VSAQ"]').last().uncheck();
    await page.locator('.vw-btn', { hasText: 'Re-plan with these' }).click();
    await page.locator('.vw-btn', { hasText: 'Use this plan' }).waitFor({ timeout: 5000 });

    // nothing changes silently: the OLD scope stands until the click
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('pm_plan_v1')!).scope)).toBe(null);

    await page.locator('.vw-btn', { hasText: 'Use this plan' }).click();
    await page.waitForFunction(() => {
        try { const p = JSON.parse(localStorage.getItem('pm_plan_v1')!); return Array.isArray(p.scope) && p.scope.join(',') === 'LAQ,SAQ'; }
        catch { return false; }
    }, undefined, { timeout: 4000 });
    const next = await page.evaluate(() => JSON.parse(localStorage.getItem('pm_plan_v1')!));
    const qids: string[] = Object.keys(next.learnDay).concat(next.optional);
    const qtypes = await page.evaluate((ids: string[]) => {
        const qs = (window as any).PM_QUESTIONS as any[];
        return ids.map((qid) => qs.find((q) => q.question_id === qid)!.qtype);
    }, qids);
    expect(qtypes).not.toContain('VSAQ');
});

test('the leave-question ask: Not yet leaves the question unmarked, Yes marks it yellow', async ({ page }) => {
    await bootPlanner(page, '2026-09-01', { pm_intro_done: '1' });
    const qid = await page.evaluate(() => (window as any).PM_QUESTIONS[0].question_id);
    await page.evaluate((q: string) => (window as any).PM_ANSWER.openQuestion(q), qid);
    await page.waitForTimeout(400);
    await page.evaluate(() => (window as any).PM_ANSWER.revealAll());

    // Not yet → nothing recorded, and the navigation still lands on the catalog
    await leaveAndAnswer(page, false);
    await page.waitForSelector('.cat-card');
    expect(await page.evaluate((q: string) =>
        !JSON.parse(localStorage.getItem('pm_stage_v1') || '{}')[q], qid)).toBe(true);
    expect(await page.$$('.cc-chip.pm-upr')).toHaveLength(0);

    // back in, reveal again, Yes → the yellow chip names the revision day
    await page.evaluate((q: string) => (window as any).PM_ANSWER.openQuestion(q), qid);
    await page.waitForTimeout(400);
    await page.evaluate(() => (window as any).PM_ANSWER.revealAll());
    await leaveAndAnswer(page);
    await page.waitForSelector('.cc-chip.pm-upr.y');
    expect(await page.$$eval('.cc-chip.pm-upr.y', (els) => els.map((e) => e.textContent)))
        .toContain('✓ revise tomorrow');
});

test('plan-less revision: the next day queues yesterday\'s questions, and revising completes green', async ({ page }) => {
    await bootPlanner(page, '2026-09-01', { pm_intro_done: '1' });
    const qid = await page.evaluate(() => (window as any).PM_QUESTIONS[0].question_id);
    await page.evaluate((q: string) => (window as any).PM_ANSWER.openQuestion(q), qid);
    await page.waitForTimeout(400);
    await page.evaluate(() => (window as any).PM_ANSWER.revealAll());
    await leaveAndAnswer(page);

    // next day, NO plan: the catalog chip flips to today, and the home chat
    // queues the revision with a tappable link
    await page.evaluate(() => localStorage.setItem('pm_today_override', '2026-09-02'));
    await page.evaluate(() => (window as any).PM_ANSWER.openCatalog());
    await page.waitForSelector('.cc-chip.pm-upr.y');
    expect(await page.$$eval('.cc-chip.pm-upr.y', (els) => els.map((e) => e.textContent)))
        .toContain('✓ revise today');
    // The thread only re-reads the clock when the window is OPENED, so a window
    // left open by the leave-question ask still shows yesterday. Close it if it
    // is open, then open it — the move the behind-pace gate already makes.
    if (!(await page.isVisible('#vidiFab'))) await page.click('#vidiClose');
    await page.click('#vidiFab');
    await page.waitForSelector('.vidi-widget .vw-item', { timeout: 4000 });
    await page.waitForFunction(() => /due for revision/.test(
        document.getElementById('vidiThread')!.textContent || ''), undefined, { timeout: 6000 });

    // the queued link opens the question; the plan-less greeting names revision
    await page.click('.vidi-widget .vw-item');
    await page.waitForFunction(() => /up for revision/.test(
        document.getElementById('vidiThread')!.textContent || ''), undefined, { timeout: 4000 });

    // reveal once more and claim the revise tick on the way out → full green
    await page.waitForTimeout(400);
    await page.evaluate(() => (window as any).PM_ANSWER.revealAll());
    await leaveAndAnswer(page);
    const st = await page.evaluate((q: string) =>
        JSON.parse(localStorage.getItem('pm_stage_v1')!)[q], qid);
    expect(st.u && st.r).toBeTruthy();
    await page.waitForSelector('.cc-chip.pm-upr.g');
    expect(await page.$$eval('.cc-chip.pm-upr.g', (els) => els.map((e) => e.textContent)))
        .toContain('✓ done');
});
