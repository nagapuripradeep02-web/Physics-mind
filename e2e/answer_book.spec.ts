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
    // Find the id from the DATA, then open only that one. This used to open every
    // question in turn and ask listCuts() — O(n) page renders — which timed out once
    // Maths-1A Unit 6 took the book past 160 questions. `cuts` is a top-level field
    // on the question, so the scan needs no rendering at all. Raising the timeout
    // would have worked today and failed again at the next unit.
    //
    // ⚠ THIS BUILD HAS NO MULTI-CUT QUESTION, so the two tests below currently SKIP.
    // The only ones the book ever had were physics (parallelogram law at LAQ+SAQ,
    // projectile motion at LAQ+2xSAQ), and physics Unit 4 was removed from this
    // mathematics-only book. Mathematics authors one length per question, so nothing
    // here exercises cuts. The tests are KEPT, not deleted: the mechanism is still
    // live in the router, the catalog and the PM_ANSWER seam, and it guards a real
    // past bug (append-only chrome stacking duplicate renders). Coverage returns the
    // moment any question is authored at two lengths — do NOT invent a two-cut
    // question just to turn these green.
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
    test.setTimeout(1_800_000);   // fleet sweep — raised deliberately at 4 units, at 8, at the physics+maths merge (448 questions), at botany (~945), and at zoology (~1136). Never trim the sweep.
    // Measured: 90s @111q · 126s @130q · 132s @157q · 162s @198q; slope ~0.9s/q so 900s holds to ~900 questions.
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
    test.setTimeout(1_800_000);   // fleet sweep — raised deliberately at 4 units, at 8, at the physics+maths merge (448 questions), at botany (~945), and at zoology (~1136). Never trim the sweep.
    // Measured: 90s @111q · 132s @130q · 132s @157q · 168s @198q; slope ~0.9s/q so 900s holds to ~900 questions.
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

test('a tap mid-draw on an unphased figure completes the whole figure (legacy pin)', async ({ page }) => {
    // Pins the pre-phase impatience semantics: a figure WITHOUT pause elements
    // must fast-forward to fully drawn on ONE tap, exactly as before phased
    // figures existed. Nothing tested this while it was the only behavior;
    // now that playFigure branches on pauses, it needs a pin. (Phased-figure
    // behavior gets its own constant-work tests targeting a zoology question.)
    await openFirst(page);
    const pick = await page.evaluate(() => {
        const qs = (window as any).PM_QUESTIONS as any[];
        for (const q of qs) {
            const steps = q.answer.steps as any[];
            const di = steps.findIndex((s: any) => {
                if (s.kind !== 'diagram') return false;
                const els = s.figure.elements as any[];
                if (els.some((e) => e.type === 'pause')) return false;
                // long enough that a 200ms tap is genuinely mid-draw
                return els.reduce((t, e) => t + (e.ms || 0), 0) >= 2000;
            });
            if (di >= 0) return { qid: q.question_id, di };
        }
        return null;
    });
    expect(pick, 'no unphased figure question in the bank').not.toBeNull();
    await openQ(page, pick!.qid);

    // reveal every step BEFORE the diagram (impatient-tap each one)
    for (let i = 0; i < pick!.di; i++) {
        await page.evaluate(() => new Promise<void>((resolve) => {
            document.addEventListener('pm:step-revealed', () => resolve(), { once: true });
            (window as any).PM_ANSWER.revealNext();
            setTimeout(() => (window as any).PM_ANSWER.revealNext(), 60);
        }));
    }

    // start the diagram, let it draw ~200ms, then exactly ONE impatient tap
    const finished = await page.evaluate(() => new Promise<boolean>((resolve) => {
        let done = false;
        document.addEventListener('pm:step-revealed', () => { done = true; resolve(true); }, { once: true });
        (window as any).PM_ANSWER.revealNext();
        setTimeout(() => { if (!done) (window as any).PM_ANSWER.revealNext(); }, 200);
        setTimeout(() => { if (!done) resolve(false); }, 4000);
    }));
    expect(finished, 'one mid-draw tap did not complete the unphased figure').toBe(true);

    const undrawn = await page.evaluate(() => {
        const bad: string[] = [];
        document.querySelectorAll('.figure-wrap svg path').forEach((p) => {
            const off = parseFloat((p as SVGPathElement).style.strokeDashoffset || '0');
            if (off > 0.5) bad.push('stroke at dashoffset ' + off);
        });
        document.querySelectorAll('.figure-wrap svg text').forEach((t) => {
            const el = t as SVGTextElement;
            if (el.style.opacity !== '' && parseFloat(el.style.opacity) < 1) {
                bad.push('label "' + el.textContent + '" at opacity ' + el.style.opacity);
            }
        });
        document.querySelectorAll('.figure-wrap clipPath rect').forEach((r) => {
            const w = parseFloat(r.getAttribute('width') || '0');
            const h = parseFloat(r.getAttribute('height') || '0');
            if (w <= 0 || h <= 0) bad.push('clip rect ' + w + 'x' + h);
        });
        return bad;
    });
    expect(undrawn).toEqual([]);
});

/**
 * Phased figures ("watch it drawn", zoology 2026-08-25). A figure may carry
 * `pause` elements: the player stops at each one, shows its caption under the
 * figure, and waits for a tap. These tests INJECT pauses into an existing long
 * figure at runtime (PM_QUESTIONS is the live array the player reads), so they
 * are constant-work and do not depend on any particular authored question.
 * Element objects are shared with the player, which hangs `_node` on them —
 * that is how the tests read each element's drawn/undrawn state.
 */
async function injectPhasedFigure(page: any): Promise<{ qid: string; di: number; pauseAt: number; n: number }> {
    const pick = await page.evaluate(() => {
        const qs = (window as any).PM_QUESTIONS as any[];
        for (const q of qs) {
            const steps = q.answer.steps as any[];
            const di = steps.findIndex((s: any) => {
                if (s.kind !== 'diagram') return false;
                const els = s.figure.elements as any[];
                if (els.some((e) => e.type === 'pause')) return false;
                return els.length >= 8 && els.reduce((t, e) => t + (e.ms || 0), 0) >= 2000;
            });
            if (di < 0) continue;
            const els = steps[di].figure.elements as any[];
            const mid = Math.floor(els.length / 2);
            els.splice(mid, 0, { type: 'pause', id: 'p_mid', caption: 'Step 2 — test phase' });
            els.unshift({ type: 'pause', id: 'p_0', caption: 'Step 1 — outline' });
            return { qid: q.question_id, di, pauseAt: mid + 1, n: els.length };
        }
        return null;
    });
    expect(pick, 'no long unphased figure to inject pauses into').not.toBeNull();
    return pick!;
}

async function revealBefore(page: any, di: number): Promise<void> {
    for (let i = 0; i < di; i++) {
        await page.evaluate(() => new Promise<void>((resolve) => {
            document.addEventListener('pm:step-revealed', () => resolve(), { once: true });
            (window as any).PM_ANSWER.revealNext();
            setTimeout(() => (window as any).PM_ANSWER.revealNext(), 60);
        }));
    }
}

/** drawn state of every non-pause element of the figure at step `di` */
const figureStates = (page: any, qid: string, di: number) => page.evaluate(([id, d]: [string, number]) => {
    const q = ((window as any).PM_QUESTIONS as any[]).find((x) => x.question_id === id);
    const els = q.answer.steps[d].figure.elements as any[];
    const caption = document.querySelector('.figure-caption');
    return {
        caption: caption ? caption.textContent : null,
        states: els.map((e) => {
            if (e.type === 'pause') return 'pause';
            const n = e._node;
            if (!n) return 'nonode';
            if (e.type === 'label') return n.style.opacity === '1' ? 'on' : 'off';
            if (e._clipRect) {
                const w = parseFloat(e._clipRect.getAttribute('width') || '0');
                const h = parseFloat(e._clipRect.getAttribute('height') || '0');
                return w > 0 && h > 0 ? 'on' : 'off';
            }
            return parseFloat(n.style.strokeDashoffset || '0') < 0.5 ? 'on' : 'off';
        }),
    };
}, [qid, di]);

test('a phased figure stops at each pause, and a mid-phase tap completes only the current phase', async ({ page }) => {
    await openFirst(page);
    const pick = await injectPhasedFigure(page);
    await openQ(page, pick.qid);
    await revealBefore(page, pick.di);

    // start the diagram: the index-0 pause names phase 1 without waiting
    let revealed = false;
    await page.evaluate(() => {
        document.addEventListener('pm:step-revealed', () => { (window as any).__phaseDone = true; }, { once: true });
        (window as any).__phaseDone = false;
        (window as any).PM_ANSWER.revealNext();
    });
    await page.waitForTimeout(300);
    let s = await figureStates(page, pick.qid, pick.di);
    expect(s.caption).toBe('Step 1 — outline');

    // ONE tap mid-phase: phase 1 completes instantly, phase 2 stays undrawn, step not done
    await page.evaluate(() => (window as any).PM_ANSWER.revealNext());
    await page.waitForTimeout(150);
    s = await figureStates(page, pick.qid, pick.di);
    revealed = await page.evaluate(() => (window as any).__phaseDone);
    expect(revealed, 'step completed on the first tap — the pause was skipped').toBe(false);
    expect(s.caption).toBe('Step 2 — test phase');
    const before = s.states.slice(1, pick.pauseAt).filter((x: string) => x !== 'pause');
    const after = s.states.slice(pick.pauseAt + 1);
    expect(before.every((x: string) => x === 'on'), 'phase 1 not fully drawn: ' + before.join(',')).toBe(true);
    expect(after.every((x: string) => x === 'off'), 'phase 2 drew before its tap: ' + after.join(',')).toBe(true);

    // tap at the boundary starts phase 2; a further mid-phase tap finishes the figure
    await page.evaluate(() => (window as any).PM_ANSWER.revealNext());
    await page.waitForTimeout(200);
    const finished = await page.evaluate(() => new Promise<boolean>((resolve) => {
        if ((window as any).__phaseDone) { resolve(true); return; }
        document.addEventListener('pm:step-revealed', () => resolve(true), { once: true });
        (window as any).PM_ANSWER.revealNext();
        setTimeout(() => resolve(false), 4000);
    }));
    expect(finished, 'the last phase did not complete on its tap').toBe(true);
    s = await figureStates(page, pick.qid, pick.di);
    expect(s.caption).toBe('');
    expect(s.states.filter((x: string) => x !== 'pause').every((x: string) => x === 'on')).toBe(true);
});

test('the instant path draws a phased figure completely, with no caption and one reserved caption rule', async ({ page }) => {
    await openFirst(page);
    const pick = await injectPhasedFigure(page);
    await openQ(page, pick.qid);
    await page.evaluate(() => (window as any).PM_ANSWER.revealAll());
    await page.waitForTimeout(400);

    const s = await figureStates(page, pick.qid, pick.di);
    expect(s.caption, 'a caption survived the instant path').toBe('');
    expect(s.states.filter((x: string) => x !== 'pause').every((x: string) => x === 'on')).toBe(true);

    const geom = await page.evaluate(([id, d]: [string, number]) => {
        const q = ((window as any).PM_QUESTIONS as any[]).find((x) => x.question_id === id);
        const fig = q.answer.steps[d].figure;
        const wrap = document.querySelector(`[data-step-id="${q.answer.steps[d].id}"] .figure-wrap`) as HTMLElement;
        const collapsed: string[] = [];
        wrap.querySelectorAll('clipPath rect').forEach((r) => {
            const w = parseFloat(r.getAttribute('width') || '0');
            const h = parseFloat(r.getAttribute('height') || '0');
            if (w <= 0 || h <= 0) collapsed.push(w + 'x' + h);
        });
        return { height: wrap.style.height, expected: (Math.ceil(fig.height / 32) + 1) * 32 + 'px', collapsed };
    }, [pick.qid, pick.di] as [string, number]);
    expect(geom.collapsed).toEqual([]);
    expect(geom.height, 'a captioned figure reserves exactly one extra rule').toBe(geom.expected);
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
    // assertion, so the gate was reporting "failed" while nothing was wrong. It then
    // hit 240 s at 270 entries, for the same reason. The floor is arithmetic: the
    // waits below are 250 ms per question plus 650 ms per cut, so N entries need at
    // least N x 0.9 s before any evaluate overhead. RAISE THIS when the book grows —
    // never trim the sweep or the waits to fit, because a shortened sweep silently
    // stops checking the questions it drops.
    test.setTimeout(1_800_000);   // the WIDEST sweep: questions x cuts. ~1340 entries after zoology opened.
    // Measured: 114s @111q · 144s @130q · 168s @157q · 204s @198q -> slope ~0.9 s/question.
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
    // The chapter filter became a native <select> (2026-08-26): 38 chapters as
    // chips was a wall a student had to scroll past to reach one answer. With no
    // subject chosen every chapter is still offered — grouped by paper through
    // <optgroup> — so this gate still sees the whole inventory.
    const shape = await page.evaluate(() => {
        const units = (window as any).PM_UNITS as any[];
        const sel = document.getElementById('unitSelect') as HTMLSelectElement;
        return {
            unitCount: units.length,
            hidden: document.getElementById('unitField')!.hidden,
            options: [...sel.querySelectorAll('option')].map((o) => o.getAttribute('data-unit')),
            want: ['ALL', ...units.map((u: any) => ((u.subject || 'physics') + '-' + u.number))],
        };
    });
    expect(shape.unitCount).toBeGreaterThanOrEqual(2);   // else this gate proves nothing
    expect(shape.hidden).toBe(false);
    expect(shape.options).toEqual(shape.want);           // All chapters, then one per unit in order

    // Each option filters to only its own chapter, and its count is that chapter's
    // whole inventory — coming-soon entries included, like the qtype chips.
    for (const key of shape.want) {
        await page.selectOption('#unitSelect', key);
        await page.waitForTimeout(200);
        const r = await page.evaluate((k) => {
            const units = (window as any).PM_UNITS as any[];
            const mine = k === 'ALL' ? units : units.filter((u: any) => ((u.subject || 'physics') + '-' + u.number) === k);
            const sel = document.getElementById('unitSelect') as HTMLSelectElement;
            const opt = sel.querySelector('option[data-unit="' + k + '"]')!;
            const m = /\((\d+)\)\s*$/.exec(opt.textContent || '');   // trailing "(N)"
            return {
                visible: document.querySelectorAll('.cat-card').length,
                headings: document.querySelectorAll('.cat-section').length,
                want: mine.reduce((a: number, u: any) => a + u.questions.length, 0),
                wantHeadings: mine.length,
                optCount: m ? Number(m[1]) : -1,
                selected: sel.value === k,
            };
        }, key);
        expect(r.selected, key + ' option selected').toBe(true);
        expect(r.visible, key + ' visible cards').toBe(r.want);
        expect(r.headings, key + ' chapter headings').toBe(r.wantHeadings);
        expect(r.optCount, key + ' option count').toBe(r.want);
    }
});

test('a card opens the length it advertises, for both LAQ and SAQ', async ({ page }) => {
    // This used to assert the literal 8 and 4 of a Physics-I paper. Those numbers
    // are NOT universal — a Maths-1A long answer is 7 — so with physics removed the
    // literal would have failed on a book that was correct. What the test is really
    // for is that the card's advertised length is the length that opens, so it now
    // reads the number OFF THE CARD and compares. That holds for every subject and
    // catches a genuine mismatch the hardcoded pair would have missed.
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

    for (const section of ['LAQ', 'SAQ'] as const) {
        await page.click(`#qtypeChips .cat-chip[data-qtype="${section}"]`);
        await page.waitForTimeout(200);

        // what the first card PROMISES, read off its own chip
        const promised = await page.evaluate(() => {
            const chip = document.querySelector('a.cat-card .cc-chip')?.textContent ?? '';
            const m = /(\d+)\s*marks/.exec(chip);
            return m ? Number(m[1]) : null;
        });
        expect(promised, `${section} card advertises a mark value`).not.toBeNull();

        await page.click('a.cat-card');
        await page.waitForSelector('.page');
        await page.waitForTimeout(300);
        const opened = await page.evaluate(() => ({
            qtype: (window as any).PM_ANSWER.listCuts().find((c: any) => c.active).qtype,
            total: (window as any).PM_ANSWER.getState().marksTotal,
        }));
        expect(opened.qtype, `${section} card opens a ${section}`).toBe(section);
        expect(opened.total, `${section} card keeps its promise`).toBe(promised);

        await page.click('#btnCatalog');
        await page.waitForSelector('#catalogView:not([hidden])');
    }
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
    // The shareable path: a hash link opens a question (+ cut, when it has one)
    // directly. The target is taken FROM THE DATA — it used to name a physics id,
    // which stopped existing when physics Unit 4 left this mathematics-only book.
    // Prefer a question with a second cut so the /<cutKey> segment is exercised;
    // fall back to the first question, whose default cut carries no segment.
    await page.goto(URL);
    await page.waitForSelector('#catalogView:not([hidden])');
    const pick = await page.evaluate(() => {
        const qs = (window as any).PM_QUESTIONS as any[];
        const multi = qs.find((q) => (q.cuts || []).length >= 2);
        if (multi) return { id: multi.question_id, cut: multi.cuts[1].key };
        return { id: qs[0].question_id, cut: null };
    });
    const target = pick.id;
    await page.goto(URL + '#/q/' + target + (pick.cut ? '/' + pick.cut : ''));
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
    if (pick.cut) expect(nb.cut).toBe(pick.cut);
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

    const all = await page.evaluate(() => document.querySelectorAll('.cat-card').length);
    await page.fill('#catSearch', 'parallelogram');
    await page.waitForTimeout(200);
    const one = await page.evaluate(() => document.querySelectorAll('.cat-card').length);
    expect(one).toBeGreaterThanOrEqual(1);
    // NARROWS, measured against the unfiltered list — not an absolute card count.
    // A fixed bound rots: "parallelogram" passed 5 cards the moment the Star
    // Questions Plus backfill added a parallelogram-diagonals question, and the
    // gate failed on a book that had grown, not on a book that had broken.
    expect(one).toBeLessThan(all / 4);

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
    // physics-3 = Motion in a Plane since the 2026-27 renumbering; the trailing
    // year marks the link as post-renumbering (a bare '4' would be remapped).
    await page.goto(URL + '#/exam-eve/physics-3/2027');
    await page.waitForSelector('#examEveView:not([hidden])');

    const r = await page.evaluate(() => ({
        title: document.getElementById('eveTitle')!.textContent || '',
        cards: document.querySelectorAll('#eveBody a.eve-card').length,
        // eve cards must never read as catalog cards (the count gates pin .cat-card)
        catCardsInEve: document.querySelectorAll('#eveBody .cat-card').length,
        backShown: !document.getElementById('btnCatalog')!.hidden,
    }));
    expect(r.title).toContain('Unit 3');
    expect(r.cards).toBeGreaterThan(0);          // Motion in a Plane has 3-star questions
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

    await page.selectOption('#unitSelect', 'physics-4');
    await page.waitForTimeout(150);
    const filtered = await page.evaluate(() => {
        const u4 = ((window as any).PM_UNITS as any[]).find((u) => ((u.subject || 'physics') + '-' + u.number) === 'physics-4');
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
            // The planner is DORMANT for students (founder, 2026-08-27) — its
            // timings are unvalidated. Every gate below revives it explicitly so
            // the feature stays PROVEN while it sleeps; a dormant feature that
            // stops being tested is one that cannot be switched back on.
            localStorage.setItem('pm_planner', '1');
            for (const k of Object.keys(args.seed)) localStorage.setItem(k, args.seed[k]);
        } catch { /* file:// storage may be blocked; the page has its own fallback */ }
    }, { today, seed });
    await page.goto(URL);
    await page.waitForFunction(() => (window as any).PM_ANSWER);
}

/** Drive the whole onboarding conversation and return the stored plan.

    Single-subject by default (physics), which is what every plan gate below
    means — so this signature is unchanged by the per-subject exam dates of
    2026-08-26. For several papers with their own dates, use
    buildMultiSubjectPlan. */
async function buildPlanViaChat(page: any, examDate: string,
    unitNames: string[] = ['Physical World and Measurement', 'Motion in a Straight Line'],
    hoursLabel = '1 hour', scopeUntick: string[] = []) {
    return buildMultiSubjectPlan(page, { physics: examDate }, unitNames, hoursLabel, scopeUntick);
}

/** Drive onboarding with one exam date PER SUBJECT.

    `dates` is keyed by the subject value units.json uses — 'physics',
    'chemistry', 'mathematics' (Maths-1A), 'mathematics_1b', 'botany'. */
async function buildMultiSubjectPlan(page: any, dates: Record<string, string>,
    unitNames: string[] = ['Physical World and Measurement', 'Motion in a Straight Line'],
    hoursLabel = '1 hour', scopeUntick: string[] = []) {
    if (await page.isVisible('#vidiFab')) await page.click('#vidiFab');
    const lastW = () => page.locator('.vidi-widget').last();
    // intro not done → the intro widget; done → the offer chip
    const introBtn = page.locator('.vw-btn', { hasText: 'Plan my first-term exam' });
    if (await introBtn.count()) await introBtn.click();
    else await page.locator('#vidiChips .vidi-chip', { hasText: 'Plan my exam prep' }).click();
    // Subjects and their dates are ONE step: tick the paper, set its date.
    await lastW().locator('.vw-subject-box').first().waitFor({ timeout: 4000 });
    const wanted = Object.keys(dates);
    const boxes = lastW().locator('.vw-subject-box');
    for (let i = 0; i < await boxes.count(); i++) {
        const box = boxes.nth(i);
        const subject = await box.getAttribute('value');
        const want = wanted.indexOf(subject!) >= 0;
        if (want !== await box.isChecked()) await box.setChecked(want);
        if (want) {
            await lastW().locator(`.vw-subject-date[data-subject="${subject}"]`).fill(dates[subject!]);
        }
    }
    await lastW().locator('.vw-btn.primary').click();                       // These subjects →
    await lastW().locator('.vw-check input').first().waitFor({ timeout: 4000 });
    // Chapters now default to ALL of each picked paper, so a test that means a
    // specific pair must clear the rest before ticking the two it wants.
    const chapterBoxes = lastW().locator('.vw-check input[type=checkbox]');
    for (let i = 0; i < await chapterBoxes.count(); i++) {
        await chapterBoxes.nth(i).setChecked(false);
    }
    // Pick chapters BY NAME, never by array index. units.json is ordered by unit
    // number, so a new low-numbered chapter shifts every index: physics Unit 1
    // landed on 2026-08-26 and silently re-pointed [0,1] from units 2+3 to units
    // 1+2 — a 3-question chapter paired with a 22-question one, which changes how
    // deep day 1 has to dig into the star ranking. The planner was correct; the
    // selection was not what the test meant.
    for (const name of unitNames) {
        await lastW().locator('.vw-check', { hasText: name }).locator('input').check();
    }
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
    const plan = await buildPlanViaChat(page, '2026-09-08', ['Motion in a Plane', 'Laws of Motion'], '30 min');
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
    const plan = await buildPlanViaChat(page, '2026-09-21', ['Motion in a Plane', 'Laws of Motion'], '1 hour', ['LAQ']);
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
    const plan = await buildPlanViaChat(page, '2026-09-21', ['Motion in a Plane', 'Laws of Motion']);
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
    // The subject filter is a native <select> (2026-08-26) — see the chapter test.
    const row = page.locator('#subjectField');
    // One subject = no picker at all; the physics-only build must look untouched.
    if (names.length < 2) {
        await expect(row).toBeHidden();
        return;
    }
    await expect(row).toBeVisible();

    for (const s of names) {
        await page.selectOption('#subjectSelect', s);
        await page.waitForTimeout(200);
        const shown = await page.evaluate(() => document.querySelectorAll('.cat-card').length);
        expect(shown, `cards shown for ${s}`).toBe(subjects[s]);
    }

    // The section heading's mark value is read off the questions, never hardcoded:
    // a Physics-I long answer is 8 marks and a Maths-1A long answer is 7.
    await page.selectOption('#subjectSelect', 'ALL');
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

// ── P2: anonymous progress sync ─────────────────────────────────────────
// The offline guarantee is the one that regresses silently: sync must be INERT
// with no endpoint — not merely quiet, but never minting a device id and never
// arming a timer. Everything else in this suite runs in that configuration, so
// a regression here would show up as mysterious network flakes everywhere.

test('with no sync base the page mints no device id and makes no sync call', async ({ page }) => {
    const external: string[] = [];
    page.on('request', (r) => {
        const u = r.url();
        if (!u.startsWith('file://') && !u.includes('fonts.g')) external.push(u);
    });
    await bootPlanner(page, '2026-09-01', { pm_intro_done: '1' });
    await openFirst(page);
    await page.evaluate(() => (window as any).PM_ANSWER.revealAll());
    await leaveAndAnswer(page);          // the leave-question ask IS the U tick (P1)
    await page.waitForTimeout(3200);     // past the sync debounce

    const r = await page.evaluate(() => ({
        base: (window as any).PM_SYNC_BASE,
        deviceId: localStorage.getItem('pm_device_id'),
        stages: localStorage.getItem('pm_stage_v1'),
    }));
    expect(r.base).toBe('');
    expect(r.deviceId).toBe(null);       // no identity is minted when sync is off
    expect(r.stages).toBeTruthy();       // ...but progress is still stored locally
    expect(external).toEqual([]);
});

test('with a sync base the device syncs once, and a remote tick merges in earliest-first', async ({ page }) => {
    const SYNC = 'https://sync.test/functions/v1/answerbook-sync';
    const posted: any[] = [];

    // The data block assigns PM_SYNC_BASE before notebook.js reads it, so the
    // override has to be a getter that swallows that write.
    await page.addInitScript((base: string) => {
        Object.defineProperty(window, 'PM_SYNC_BASE', {
            get: () => base, set: () => {}, configurable: true,
        });
        try { localStorage.setItem('pm_today_override', '2026-09-10'); } catch { /* file:// */ }
    }, SYNC);

    await page.route('https://sync.test/**', async (route) => {
        const req = route.request();
        if (req.method() === 'OPTIONS') {
            return route.fulfill({ status: 204, headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            } });
        }
        posted.push(JSON.parse(req.postData() || '{}'));
        // The server answers with a tick this device has never seen, plus an
        // EARLIER date for one it has — both must land, the second by winning.
        return route.fulfill({
            status: 200,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: JSON.stringify({ ok: true, plan: null, plan_saved_at: null, stages: [
                { q: 'from-other-device', u: '2026-08-01', r: '2026-08-02' },
                { q: 'seeded', u: '2026-08-05', r: '' },
            ] }),
        });
    });

    await page.goto(URL);
    await page.waitForFunction(() => (window as any).PM_ANSWER);
    // a local tick the remote will beat with an earlier date
    await page.evaluate(() => localStorage.setItem('pm_stage_v1',
        JSON.stringify({ seeded: { u: '2026-09-09', p: '', r: '' } })));
    await page.reload();
    await page.waitForFunction(() => (window as any).PM_ANSWER);

    await page.waitForFunction(() => {
        try { return !!JSON.parse(localStorage.getItem('pm_stage_v1') || '{}')['from-other-device']; }
        catch { return false; }
    }, undefined, { timeout: 8000 });

    const st = await page.evaluate(() => JSON.parse(localStorage.getItem('pm_stage_v1')!));
    expect(st['from-other-device'].u).toBe('2026-08-01');   // adopted
    expect(st['from-other-device'].r).toBe('2026-08-02');
    expect(st.seeded.u).toBe('2026-08-05');                 // EARLIEST wins, not newest

    // the push carried a real device id, and the id persists across reloads
    const id = await page.evaluate(() => localStorage.getItem('pm_device_id'));
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(posted.length).toBeGreaterThan(0);
    expect(posted[posted.length - 1].device_id).toBe(id);
    expect(Array.isArray(posted[posted.length - 1].stages)).toBe(true);
});

test('a sync endpoint that is down never breaks the book', async ({ page }) => {
    // Offline-first is the promise: the student must not be able to tell.
    const SYNC = 'https://sync.test/functions/v1/answerbook-sync';
    await page.addInitScript((base: string) => {
        Object.defineProperty(window, 'PM_SYNC_BASE', {
            get: () => base, set: () => {}, configurable: true,
        });
    }, SYNC);
    await page.route('https://sync.test/**', (route) => route.abort('failed'));

    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto(URL);
    await page.waitForFunction(() => (window as any).PM_ANSWER);
    await openFirst(page);
    const marks = await page.evaluate(() => {
        (window as any).PM_ANSWER.revealAll();
        return (window as any).PM_ANSWER.getState();
    });
    await leaveAndAnswer(page);          // the leave-question ask IS the U tick (P1)
    await page.waitForTimeout(3200);     // the failed push must change nothing

    const r = await page.evaluate(() => ({
        stages: localStorage.getItem('pm_stage_v1'),
    }));
    expect(errors).toEqual([]);                        // no unhandled rejection
    expect(marks.marksEarned).toBe(marks.marksTotal);
    expect(r.stages).toBeTruthy();                     // progress still recorded
});

// ═══ per-subject exam dates (2026-08-26) ═══════════════════════════════════
// A board student sits three or four papers on DIFFERENT days, and the gap
// between two papers is when the second one actually gets revised. One shared
// date cannot express that, so each subject carries its own date and races its
// own runway. These gates cover the promises that follow from it.

/** Day number (1-based, plan.start = day 1) of a calendar date. */
function planDayOf(start: string, iso: string) {
    return Math.round((Date.parse(iso + 'T00:00:00Z') - Date.parse(start + 'T00:00:00Z')) / 86400000) + 1;
}

function countBySubject(plan: any, qids: string[]) {
    const out: Record<string, number> = {};
    for (const q of qids) { const s = plan.subjectByQid[q]; out[s] = (out[s] || 0) + 1; }
    return out;
}

test('three papers, three dates: nothing is scheduled on or after its OWN subject\'s exam', async ({ page }) => {
    await bootPlanner(page, '2026-09-01', { pm_intro_done: '1' });
    const plan = await buildMultiSubjectPlan(page, {
        physics: '2026-09-13', chemistry: '2026-09-18', mathematics: '2026-09-24',
    }, ['Physical World and Measurement', 'Atomic Structure', 'Matrices']);

    expect(plan.examDates).toEqual({
        physics: '2026-09-13', chemistry: '2026-09-18', mathematics: '2026-09-24',
    });
    // examDate stays the LAST paper so every pre-existing reader still works
    expect(plan.examDate).toBe('2026-09-24');
    expect((plan.subjects as string[]).sort()).toEqual(['chemistry', 'mathematics', 'physics']);

    // THE promise: a subject's learning never lands on or after its own paper.
    // With one shared date this is exactly what broke — maths revision was
    // scheduled for days after the maths exam had already been written.
    let checked = 0;
    for (const qid of Object.keys(plan.learnDay)) {
        const s = plan.subjectByQid[qid];
        expect(plan.learnDay[qid]).toBeLessThan(planDayOf(plan.start, plan.examDates[s]));
        checked++;
    }
    expect(checked).toBeGreaterThan(20);          // the assertion actually ran

    // each paper gets its OWN revision run-in, not one shared tail
    expect(plan.revBlockStartBy.physics).toBeLessThan(plan.revBlockStartBy.chemistry);
    expect(plan.revBlockStartBy.chemistry).toBeLessThan(plan.revBlockStartBy.mathematics);
});

test('day one mixes every paper the student picked', async ({ page }) => {
    await bootPlanner(page, '2026-09-01', { pm_intro_done: '1' });
    const plan = await buildMultiSubjectPlan(page, {
        physics: '2026-09-13', chemistry: '2026-09-18', mathematics: '2026-09-24',
    }, ['Physical World and Measurement', 'Atomic Structure', 'Matrices'], '2 hours');

    const day1 = countBySubject(plan, plan.days[0].learn);
    expect(Object.keys(day1).sort()).toEqual(['chemistry', 'mathematics', 'physics']);
});

test('the nearer a paper is, the bigger its share of the day', async ({ page }) => {
    // Same chapters, same pace, same rival — ONLY the physics date moves. A
    // bare threshold would not prove urgency drives the split; this comparison
    // does, and carries its own control.
    // Sample = a 22-question chapter (Motion in a Straight Line since the 2026-27
    // renumbering; it was Units and Measurements, also 22). The merged 25-card
    // Unit 1 saturates the ten-day window in BOTH cases and the shares tie.
    await bootPlanner(page, '2026-09-01', { pm_intro_done: '1' });
    const far = await buildMultiSubjectPlan(page, {
        physics: '2026-10-20', chemistry: '2026-10-24',
    }, ['Physical World and Measurement', 'Atomic Structure'], '2 hours');

    await page.evaluate(() => localStorage.removeItem('pm_plan_v1'));
    await page.reload();
    await page.waitForFunction(() => (window as any).PM_ANSWER);
    const near = await buildMultiSubjectPlan(page, {
        physics: '2026-09-12', chemistry: '2026-10-24',
    }, ['Physical World and Measurement', 'Atomic Structure'], '2 hours');

    // Measured over the first FIVE days, not day one and not ten. Day one
    // saturates: the same physics questions fit whether the paper is six weeks
    // out or ten days out, so a day-1 comparison can see nothing. Ten days
    // saturates the other way since the 2026-27 renumbering merged old Units 1+2
    // into one 25-card chapter that BOTH plans finish inside ten days — the
    // cumulative shares then tie exactly. Five days is where urgency shows.
    // Sample: merged Unit 1 + Atomic Structure at 2 hours a day (2026-08-28) —
    // the comparison is the assertion, so no fixed percentage is recorded here.
    const share = (p: any) => {
        let phy = 0, tot = 0;
        for (let d = 0; d < Math.min(5, p.days.length); d++) {
            for (const q of p.days[d].learn) { if (p.subjectByQid[q] === 'physics') phy++; tot++; }
        }
        return phy / Math.max(1, tot);
    };
    expect(share(near)).toBeGreaterThan(share(far));
    // and day one still mixes both papers in each case
    for (const p of [far, near]) {
        expect(Object.keys(countBySubject(p, p.days[0].learn)).length).toBeGreaterThan(1);
    }
});

test('a paper already written leaves the plan — the rest keep going', async ({ page }) => {
    await bootPlanner(page, '2026-09-01', { pm_intro_done: '1' });
    const plan = await buildMultiSubjectPlan(page, {
        physics: '2026-09-10', chemistry: '2026-09-25',
    }, ['Physical World and Measurement', 'Atomic Structure']);

    // walk the clock past the physics paper, keeping the plan
    await bootPlanner(page, '2026-09-14', {
        pm_intro_done: '1', pm_plan_v1: JSON.stringify(plan),
    });
    if (await page.isVisible('#vidiFab')) await page.click('#vidiFab');

    // the plan is NOT archived — only the written paper is done
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('pm_plan_v1')!));
    expect(stored.archived).toBeFalsy();
    expect(stored.doneSubjects).toContain('physics');

    // the countdown now names the paper that is actually next
    const strip = await page.$eval('#vidiPlanStrip', (e) => ({
        hidden: (e as HTMLElement).hidden, text: e.textContent || '',
    }));
    expect(strip.hidden).toBe(false);
    expect(strip.text).toContain('Chemistry');
    expect(strip.text).not.toContain('Physics');

    // and no physics question is offered any more
    const rows = await page.$$eval('.vw-item', (es) => es.map((e) => e.textContent || ''));
    const physicsText = await page.evaluate((qids: string[]) => {
        const units = (window as any).PM_UNITS as any[];
        const out: string[] = [];
        for (const u of units) {
            if ((u.subject || 'physics') !== 'physics') continue;
            for (const e of u.questions) if (qids.indexOf(e.question_id) >= 0) out.push(e.text);
        }
        return out;
    }, Object.keys(plan.learnDay));
    for (const t of physicsText) {
        for (const r of rows) expect(r).not.toContain(t.slice(0, 30));
    }
});

test('a plan saved before per-subject dates still loads and still counts down', async ({ page }) => {
    // The plan is an opaque blob in localStorage AND in ab_plans, so an old
    // one can arrive from another device at any time. It must read as "every
    // subject sits on that one date" — a lazy normalizer, never a migration.
    const legacy = {
        v: 1, start: '2026-09-01', examDate: '2026-09-21',
        units: ['physics-2'], minsPerDay: 60, scope: null,
        days: [{ learn: ['ts_ipe_p2_um_what_is_physics'], revise: [] }],
        learnDay: {}, optional: [], revBlockStart: 18, totalDays: 20,
        crunch: false, implemented: true, lastNudgeDay: '2026-09-01', archived: false,
    };
    await bootPlanner(page, '2026-09-05', {
        pm_intro_done: '1', pm_plan_v1: JSON.stringify(legacy),
    });
    if (await page.isVisible('#vidiFab')) await page.click('#vidiFab');

    const strip = await page.$eval('#vidiPlanStrip', (e) => ({
        hidden: (e as HTMLElement).hidden, text: e.textContent || '',
    }));
    expect(strip.hidden).toBe(false);
    expect(strip.text).toContain('16 days left');     // one subject ⇒ the old wording
    // nothing threw: the page is still alive and the chat opened
    expect(await page.isVisible('#vidiThread')).toBe(true);
});

test('an unknown timetable is guessed two days apart, and the plan says it guessed', async ({ page }) => {
    await bootPlanner(page, '2026-09-01', { pm_intro_done: '1' });
    if (await page.isVisible('#vidiFab')) await page.click('#vidiFab');
    const lastW = () => page.locator('.vidi-widget').last();
    await page.locator('#vidiChips .vidi-chip', { hasText: 'Plan my exam prep' }).click();
    await lastW().locator('.vw-subject-box').first().waitFor({ timeout: 4000 });

    // tick three papers but date only the first
    for (const s of ['physics', 'chemistry', 'mathematics']) {
        await lastW().locator(`.vw-subject-box[value="${s}"]`).setChecked(true);
    }
    await lastW().locator('.vw-subject-date[data-subject="physics"]').fill('2026-09-14');
    await lastW().locator('.vw-btn', { hasText: 'I do not know the rest yet' }).click();

    await lastW().locator('.vw-check input').first().waitFor({ timeout: 4000 });
    await lastW().locator('.vw-btn.primary').click();                       // These chapters →
    await lastW().locator('.vw-scope-box').first().waitFor({ timeout: 4000 });
    await lastW().locator('.vw-btn.primary').click();                       // These types →
    await page.locator('.vw-btn', { hasText: 'Generate my plan' }).click();
    await page.locator('.vw-btn', { hasText: '1 hour' }).click();
    await page.locator('.vw-btn', { hasText: 'Implement this plan' }).waitFor({ timeout: 6000 });
    await page.locator('.vw-btn', { hasText: 'Implement this plan' }).click();

    const plan = await page.evaluate(() => JSON.parse(localStorage.getItem('pm_plan_v1')!));
    expect(plan.datesProvisional).toBe(true);
    expect(plan.examDates.physics).toBe('2026-09-14');
    expect(plan.examDates.chemistry).toBe('2026-09-16');       // the ladder: +2
    expect(plan.examDates.mathematics).toBe('2026-09-18');     // and +2 again
});

test('a real four-paper plan at one hour a day MIXES its days — not one subject at a time', async ({ page }) => {
    // The regression the founder caught in the shipped build (2026-08-27): a
    // 50-day, four-paper, one-hour plan read "Chemistry" on days 1, 2, 3 and 4
    // and never mixed. The old per-day quota (~15 min across four papers)
    // could not fit a single long answer (mins x 2 = 16-20), so every day fell
    // through to the spill and the most urgent subject took all of it.
    //
    // Deliberately the WHOLE book at a realistic pace — a smaller pick with a
    // roomier budget is exactly what hid this.
    await bootPlanner(page, '2026-09-01', { pm_intro_done: '1' });
    if (await page.isVisible('#vidiFab')) await page.click('#vidiFab');
    const lastW = () => page.locator('.vidi-widget').last();
    await page.locator('#vidiChips .vidi-chip', { hasText: 'Plan my exam prep' }).click();
    await lastW().locator('.vw-subject-box').first().waitFor({ timeout: 4000 });

    const dates: Record<string, string> = {
        physics: '2026-10-14', chemistry: '2026-10-17',
        mathematics: '2026-10-19', mathematics_1b: '2026-10-21',
    };
    for (const s of Object.keys(dates)) {
        await lastW().locator(`.vw-subject-box[value="${s}"]`).setChecked(true);
        await lastW().locator(`.vw-subject-date[data-subject="${s}"]`).fill(dates[s]);
    }
    await lastW().locator('.vw-btn.primary').click();          // These subjects →
    await lastW().locator('.vw-check input').first().waitFor({ timeout: 4000 });
    await lastW().locator('.vw-btn.primary').click();          // every chapter, pre-ticked
    await lastW().locator('.vw-scope-box').first().waitFor({ timeout: 4000 });
    await lastW().locator('.vw-btn.primary').click();          // These types →
    await page.locator('.vw-btn', { hasText: 'Generate my plan' }).click();
    await page.locator('.vw-btn', { hasText: '1 hour' }).click();
    await page.locator('.vw-btn', { hasText: 'Implement this plan' }).waitFor({ timeout: 8000 });
    await page.locator('.vw-btn', { hasText: 'Implement this plan' }).click();
    const plan = await page.evaluate(() => JSON.parse(localStorage.getItem('pm_plan_v1')!));

    expect(plan.subjects.length).toBe(4);

    // Across the opening fortnight every paper must get real time — the bug
    // gave one subject all fourteen days.
    const seen = new Set<string>();
    for (let d = 0; d < Math.min(14, plan.days.length); d++) {
        for (const qid of plan.days[d].learn) seen.add(plan.subjectByQid[qid]);
    }
    expect([...seen].sort()).toEqual(['chemistry', 'mathematics', 'mathematics_1b', 'physics']);

    // and no single paper may swallow the opening fortnight
    const share: Record<string, number> = {};
    let n = 0;
    for (let d = 0; d < Math.min(14, plan.days.length); d++) {
        for (const qid of plan.days[d].learn) { share[plan.subjectByQid[qid]] = (share[plan.subjectByQid[qid]] || 0) + 1; n++; }
    }
    for (const s of Object.keys(share)) expect(share[s] / n).toBeLessThan(0.75);
});

test('the whole plan expands day by day, and names the day each paper is written', async ({ page }) => {
    await bootPlanner(page, '2026-09-01', { pm_intro_done: '1' });
    if (await page.isVisible('#vidiFab')) await page.click('#vidiFab');
    const lastW = () => page.locator('.vidi-widget').last();
    await page.locator('#vidiChips .vidi-chip', { hasText: 'Plan my exam prep' }).click();
    await lastW().locator('.vw-subject-box').first().waitFor({ timeout: 4000 });
    for (const [s, d] of Object.entries({ physics: '2026-09-20', chemistry: '2026-09-25' })) {
        await lastW().locator(`.vw-subject-box[value="${s}"]`).setChecked(true);
        await lastW().locator(`.vw-subject-date[data-subject="${s}"]`).fill(d);
    }
    await lastW().locator('.vw-btn.primary').click();
    await lastW().locator('.vw-check input').first().waitFor({ timeout: 4000 });
    await lastW().locator('.vw-btn.primary').click();
    await lastW().locator('.vw-scope-box').first().waitFor({ timeout: 4000 });
    await lastW().locator('.vw-btn.primary').click();
    await page.locator('.vw-btn', { hasText: 'Generate my plan' }).click();
    await page.locator('.vw-btn', { hasText: '1 hour' }).click();
    await page.locator('.vw-toggle', { hasText: 'View whole plan' }).waitFor({ timeout: 8000 });

    // collapsed: the opening days, an ellipsis, then the revision run-ins
    const collapsed = await page.locator('.vw-plan .vw-day').count();
    expect(collapsed).toBeLessThan(10);

    await page.locator('.vw-toggle', { hasText: 'View whole plan' }).click();
    const rows = await page.locator('.vw-plan .vw-day').count();
    expect(rows).toBeGreaterThan(20);                 // every day, not a sample

    const text = await page.locator('.vw-plan').innerText();
    // the exam row is CSS-uppercased, so compare case-insensitively
    expect(text).toMatch(/physics exam/i);            // the anchor days are named
    expect(text).toMatch(/chemistry exam/i);
    expect(text).toMatch(/Day\s*1\b/);
    expect(text).not.toMatch(/Day (\d+)–\1\b/);         // never "Day 43–43"

    // and it closes again
    await page.locator('.vw-toggle', { hasText: 'Show less' }).click();
    expect(await page.locator('.vw-plan .vw-day').count()).toBe(collapsed);
});

test('the planner is dormant: a student sees no plan offer anywhere', async ({ page }) => {
    // Deliberately NOT bootPlanner — that revives the planner. This is the
    // student's build, exactly as shipped.
    await page.addInitScript(() => {
        try { localStorage.clear(); localStorage.setItem('pm_today_override', '2026-09-01'); } catch { /* file:// */ }
    });
    await page.goto(URL);
    await page.waitForFunction(() => (window as any).PM_ANSWER);
    if (await page.isVisible('#vidiFab')) await page.click('#vidiFab');

    // the intro offers only "Start learning now"
    await page.locator('.vw-btn', { hasText: 'Start learning now' }).waitFor({ timeout: 6000 });
    expect(await page.locator('.vw-btn', { hasText: 'Plan my first-term exam' }).count()).toBe(0);
    await page.locator('.vw-btn', { hasText: 'Start learning now' }).click();

    // no plan chip on the home conversation, and no countdown strip
    const body = await page.locator('#vidiThread').innerText();
    expect(body).not.toMatch(/study plan|plan your exam|exam preparation/i);
    for (const label of ['Plan my exam prep', 'Plan my next exam', 'Change my plan', 'Want a study plan?']) {
        expect(await page.locator('.vidi-chip', { hasText: label }).count()).toBe(0);
    }
    expect(await page.$eval('#vidiPlanStrip', (e) => (e as HTMLElement).hidden)).toBe(true);

    // and a plan blob left on the device (a test device, or one synced from
    // another) must not resurrect any of it
    await page.evaluate(() => {
        localStorage.setItem('pm_plan_v1', JSON.stringify({
            v: 2, start: '2026-09-01', examDate: '2026-09-21', examDates: { physics: '2026-09-21' },
            units: ['physics-2'], minsPerDay: 60, scope: null, days: [], learnDay: {},
            subjects: ['physics'], optional: [], revBlockStart: 18, totalDays: 20,
            implemented: true, lastNudgeDay: '', archived: false,
        }));
    });
    await page.reload();
    await page.waitForFunction(() => (window as any).PM_ANSWER);
    if (await page.isVisible('#vidiFab')) await page.click('#vidiFab');
    expect(await page.$eval('#vidiPlanStrip', (e) => (e as HTMLElement).hidden)).toBe(true);
    expect(await page.locator('.vidi-chip', { hasText: 'Change my plan' }).count()).toBe(0);
});

test('with the planner dormant, revision and the answer flow still work', async ({ page }) => {
    // What must survive the removal: the two-stage Understand/Revise ticks and
    // the plan-less next-day revision queue. Neither ever needed a schedule.
    // Earned through the REAL flow, not by seeding pm_stage_v1 — the app reads
    // stages into memory at boot, so a post-load write is simply ignored.
    await page.addInitScript(() => {
        try {
            localStorage.clear();
            localStorage.setItem('pm_today_override', '2026-09-01');
            localStorage.setItem('pm_intro_done', '1');
        } catch { /* file:// storage may be blocked */ }
    });
    await page.goto(URL);
    await page.waitForFunction(() => (window as any).PM_ANSWER);

    const qid = await page.evaluate(() => (window as any).PM_QUESTIONS[0].question_id);
    await page.evaluate((q: string) => (window as any).PM_ANSWER.openQuestion(q), qid);
    await page.waitForTimeout(400);
    await page.evaluate(() => (window as any).PM_ANSWER.revealAll());
    await leaveAndAnswer(page);                       // claims the Understand tick

    // next day: the revision queues itself, with no plan in sight
    await page.evaluate(() => localStorage.setItem('pm_today_override', '2026-09-02'));
    if (!(await page.isVisible('#vidiFab'))) await page.click('#vidiClose');
    await page.click('#vidiFab');
    await page.waitForSelector('.vidi-widget .vw-item', { timeout: 6000 });
    await page.waitForFunction(() => /due for revision/.test(
        document.getElementById('vidiThread')!.textContent || ''), undefined, { timeout: 6000 });

    // and the greeting never offers a plan
    const text = await page.locator('#vidiThread').innerText();
    expect(text).not.toMatch(/study plan|plan your exam|exam preparation/i);
    expect(await page.locator('.vidi-chip', { hasText: 'Plan my exam prep' }).count()).toBe(0);

    // the revise tick still completes to green
    await page.click('.vidi-widget .vw-item');
    await page.waitForTimeout(400);
    await page.evaluate(() => (window as any).PM_ANSWER.revealAll());
    await leaveAndAnswer(page);
    const st = await page.evaluate((q: string) =>
        JSON.parse(localStorage.getItem('pm_stage_v1') || '{}')[q], qid);
    expect(st.u).toBeTruthy();
    expect(st.r).toBeTruthy();
});


test('the home chat is never blank: a returning student with nothing due still gets a greeting', async ({ page }) => {
    // Regression guard. Removing the plan offer left this branch rendering
    // NOTHING — intro seen, no plan, nothing due for revision, so the student
    // opened the chat to an empty thread and no chips.
    await page.addInitScript(() => {
        try {
            localStorage.clear();
            localStorage.setItem('pm_today_override', '2026-09-05');
            localStorage.setItem('pm_intro_done', '1');
        } catch { /* file:// storage may be blocked */ }
    });
    await page.goto(URL);
    await page.waitForFunction(() => (window as any).PM_ANSWER);
    if (await page.isVisible('#vidiFab')) await page.click('#vidiFab');
    // Wait for the SETTLED text, not the typing dots — say() renders "· · ·"
    // first, which satisfies a naive "length > 0" and reads as a blank chat.
    await page.waitForFunction(() => /step by step/.test(
        document.getElementById('vidiThread')!.textContent || ''), undefined, { timeout: 8000 });
    const text = await page.locator('#vidiThread').innerText();
    expect(text.trim().length).toBeGreaterThan(20);
    expect(text).toMatch(/step by step/i);
    expect(text).not.toMatch(/study plan|plan your exam|exam preparation/i);
});


// ═══ the 2026-27 syllabus revision (2026-08-28) ═══════════════════════════════
// Three mechanisms landed together: the physics renumbering (old Units 1+2 merged,
// old 3-14 → 2-13, new Unit 14), the legacy-link remap that keeps forwarded
// exam-eve links pointing at the chapter they meant, and the retire mechanism.

test('a pre-renumbering exam-eve link still lands on the chapter it meant', async ({ page }) => {
    // Old links carried the OLD physics key and no year: "#/exam-eve/4" and
    // "#/exam-eve/physics-4" both meant Motion in a Plane (old Unit 4), which is
    // Unit 3 in the 2026-27 book. A link WITH the year is taken literally.
    await page.goto(URL + '#/exam-eve/physics-4');
    await page.waitForSelector('#examEveView:not([hidden])');
    expect(await page.locator('#eveTitle').textContent()).toContain('Unit 3 — Motion in a Plane');

    await page.goto(URL + '#/exam-eve/4');
    await page.waitForSelector('#examEveView:not([hidden])');
    expect(await page.locator('#eveTitle').textContent()).toContain('Unit 3 — Motion in a Plane');

    await page.goto(URL + '#/exam-eve/physics-4/2027');
    await page.waitForSelector('#examEveView:not([hidden])');
    expect(await page.locator('#eveTitle').textContent()).toContain('Unit 4 — Laws of Motion');

    // Subject keys with an underscore never matched the old route regex, so a
    // Maths-1B exam-eve link fell through to the catalog.
    await page.goto(URL + '#/exam-eve/mathematics_1b-3/2027');
    await page.waitForSelector('#examEveView:not([hidden])');
    expect(await page.locator('#eveTitle').textContent()).toContain('The Straight Line');
});

test('the physics bank is on the 2026-27 numbering and Unit 14 is coming-soon', async ({ page }) => {
    await page.goto(URL);
    await page.waitForFunction(() => (window as any).PM_ANSWER);
    const r = await page.evaluate(() => {
        const units = ((window as any).PM_UNITS as any[]).filter((u) => !u.subject);
        const byN: Record<number, any> = {};
        for (const u of units) byN[u.number] = u;
        return {
            n: units.length,
            u1: byN[1]?.name, u1n: byN[1]?.questions.length,
            u3: byN[3]?.name, u14: byN[14]?.name,
            u14ready: byN[14]?.questions.filter((e: any) => e.question_id).length,
            u14coming: byN[14]?.questions.length,
            patternsLaq: (window as any).PM_PATTERNS?.mathematics?.sections?.find((s: any) => s.key === 'LAQ')?.marks,
        };
    });
    expect(r.n).toBe(14);
    expect(r.u1).toBe('Physical World and Measurement');
    expect(r.u1n).toBe(25);                               // 3 + 22 merged
    expect(r.u3).toBe('Motion in a Plane');
    expect(r.u14).toBe('Physics of Emerging Technologies');
    expect(r.u14ready).toBe(0);
    expect(r.u14coming).toBeGreaterThan(0);
    expect(r.patternsLaq).toBe(8);                        // the maths LAQ is 8 marks now
});

test('a retired card renders on a forwarded link with the syllabus banner', async ({ page }) => {
    // No card is retired yet (the official syllabus lists are not in hand), so the
    // banner path is exercised by pinning PM_RETIRED before the page's own data
    // script assigns it — a setter that ignores the assignment keeps the pin.
    const qid = 'ts_ipe_p1_um_fundamental_vs_derived_units';
    await page.addInitScript((id: string) => {
        const pinned = { [id]: { wef: '2026-27', reason: 'this topic was removed from the syllabus', unit: 'Physical World and Measurement' } };
        Object.defineProperty(window, 'PM_RETIRED', { get: () => pinned, set: () => { /* pinned */ }, configurable: true });
    }, qid);
    await page.goto(URL + '#/q/' + qid);
    await page.waitForSelector('.page', { timeout: 8000 });
    const chip = page.locator('.question-meta .chip-retired');
    expect(await chip.count()).toBe(1);
    expect(await chip.textContent()).toContain('Not in the 2026-27 syllabus');
    expect(await chip.textContent()).toContain('removed from the syllabus');
});

test('a card that is not retired shows no syllabus banner', async ({ page }) => {
    await page.goto(URL + '#/q/ts_ipe_p1_um_fundamental_vs_derived_units');
    await page.waitForSelector('.page', { timeout: 8000 });
    expect(await page.locator('.question-meta .chip-retired').count()).toBe(0);
});


test('a pre-renumbering Maths-1A link lands on the chapter it meant', async ({ page }) => {
    // The 2026-27 Maths-1A book inserted Sets and Relations at 1 and Sequences
    // and Series at 3, so old mathematics-4 (Addition of Vectors) is now
    // mathematics-6. Same trap as physics: every old key is still a valid key
    // naming a DIFFERENT chapter, so only the trailing year tells them apart.
    await page.goto(URL + '#/exam-eve/mathematics-4');
    await page.waitForSelector('#examEveView:not([hidden])');
    expect(await page.locator('#eveTitle').textContent()).toContain('Addition of Vectors');

    await page.goto(URL + '#/exam-eve/mathematics-6/2027');
    await page.waitForSelector('#examEveView:not([hidden])');
    expect(await page.locator('#eveTitle').textContent()).toContain('Addition of Vectors');

    // Maths-1B did NOT renumber, so its old keys must pass through untouched.
    await page.goto(URL + '#/exam-eve/mathematics_1b-3');
    await page.waitForSelector('#examEveView:not([hidden])');
    expect(await page.locator('#eveTitle').textContent()).toContain('The Straight Line');
});

test('Maths-1A is on the 2026-27 numbering with its two new chapters listed', async ({ page }) => {
    await page.goto(URL);
    await page.waitForFunction(() => (window as any).PM_ANSWER);
    const r = await page.evaluate(() => {
        const u = ((window as any).PM_UNITS as any[]).filter((x) => x.subject === 'mathematics');
        const byN: Record<number, any> = {};
        for (const x of u) byN[x.number] = x;
        const ready = (n: number) => byN[n]?.questions.filter((e: any) => e.question_id).length;
        return {
            n: u.length,
            u1: byN[1]?.name, u1ready: ready(1),
            u3: byN[3]?.name, u3ready: ready(3),
            u8: byN[8]?.name, u9: byN[9]?.name, u12: byN[12]?.name,
        };
    });
    expect(r.n).toBe(12);
    expect(r.u1).toContain('Sets and Relations');
    expect(r.u1ready).toBe(0);                       // announced, not written yet
    expect(r.u3).toContain('Sequences and Series');
    expect(r.u3ready).toBe(0);
    // the book says "and", not the old "upto"
    expect(r.u8).toContain('Trigonometric Ratios and Transformations');
    // NOT removed, despite a circular proposing it — see docs/SYLLABUS_2026_27.md
    expect(r.u9).toContain('Trigonometric Equations');
    expect(r.u12).toContain('Properties of Triangles');
});
