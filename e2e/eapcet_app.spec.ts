/**
 * eapcet_app.spec.ts — evidence for the EAPCET finder's offline build.
 *
 *   npm run smoke:eapcet
 *
 * Builds its own fixture release (eapcet_helpers.ts: one open chapter with
 * audited routes and shapes, one open chapter with neither, one closed) into
 * eapcet-app/dist-e2e/ with the real build script, then opens the file from
 * file:// and walks it the way a student does. Its own script, not part of
 * `npm run smoke` (which talks to Supabase): this needs nothing.
 *
 * What it proves: the offline page makes zero requests; a run asks ten pool
 * questions and scores them against the key; after a right OR a wrong pick
 * the route menu follows (the routes plus "I guessed", unmarked; "Were you
 * sure?" on a theory question or an unaudited chapter); the records carry the
 * route and the diagnosis matches what the script meant — the option outranks
 * the claim (a mismatch), an unexplained option is unconfirmed, an unaudited
 * chapter names no type; no card in a run or a retry names its paper, the fix
 * page does, and the result's reveal lists exactly the papers drawn; a locked
 * page holds no solution byte and no mistake text; a mid-run reload resumes
 * with the route still owed; a second run brings back what the first did not
 * show; three right-by-the-right-route siblings flip "strong now" for that
 * shape and one wrong retry resets the streak.
 */
import { test, expect } from '@playwright/test';
import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
    OPEN_KEY, PLAIN_KEY, CLOSED_KEY, STEP_TEXT, MISTAKE_APP, MISTAKE_CALC, ROUTE_RIGHT, ROUTE_APP, SHAPES,
    fixture, watchRequests, installClock, advance, open, currentCard, pickFor, menuOf, playRun, expectation,
    writeLearnDir, typeFirst,
    type Intent,
} from './eapcet_helpers';

const ROOT = process.cwd();
const OUT = join(ROOT, 'eapcet-app', 'dist-e2e');
const DIST = join(OUT, 'index.html');
const FIXTURE = join(OUT, 'fixture_release.json');
const URL = 'file:///' + DIST.replace(/\\/g, '/');

test.beforeAll(() => {
    mkdirSync(OUT, { recursive: true });
    writeFileSync(FIXTURE, JSON.stringify(fixture()));
    // The fixture pack, not the real one: the real p1-02 pack names shapes the fixture's closed p1-02 does not have.
    const learn = writeLearnDir(join(OUT, 'learn'));
    execFileSync('npx', ['tsx', 'src/scripts/build_eapcet_app.ts', `--pool=${FIXTURE}`, `--out=${OUT}`, `--learn=${learn}`], { cwd: ROOT, stdio: 'pipe', shell: true });
    if (!existsSync(DIST)) throw new Error('the e2e build produced no index.html');
});

/** The scripted ten: what the student means to do at each question. */
const SCRIPT: Intent[] = ['solid', 'slip', 'guess_right', 'wrong_route', 'solid', 'slip', 'guess_right', 'slip', 'solid', 'mismatch'];

test.describe('EAPCET finder — offline build', () => {
    test('door, chapter list, and zero network requests', async ({ page }) => {
        const seen = watchRequests(page);
        await open(page, URL);
        await expect(page.locator('#doorView')).toBeVisible();
        await page.click('.ep-tile[data-subject="physics"]');
        await expect(page.locator('#chaptersView')).toBeVisible();
        await expect(page.locator('#chaptersSub')).toHaveText('Pick a chapter. Ten questions, about twelve minutes. Then you see what kind of mistake you make.');
        const openRow = page.locator(`.ep-row[data-chapter="${OPEN_KEY}"]`);
        await expect(openRow).toHaveAttribute('href', `#/physics/${OPEN_KEY}`);
        await expect(openRow.locator('.ep-badge')).toHaveText('Not tested yet');
        await expect(page.locator(`.ep-row[data-chapter="${PLAIN_KEY}"]`)).toHaveAttribute('href', `#/physics/${PLAIN_KEY}`);
        const closedRow = page.locator(`.ep-row[data-chapter="${CLOSED_KEY}"]`);
        await expect(closedRow).not.toHaveAttribute('href', /.*/);
        await expect(closedRow.locator('.ep-badge')).toHaveText('Not enough verified questions yet');
        await openRow.click();
        await expect(page.locator('#runView')).toBeVisible();
        await expect(page.locator('.ep-card[data-qid]')).toHaveCount(1);
        expect(seen).toEqual([]);
    });

    test('a run asks ten verified questions, offers the route menu after every pick, never names a paper, and diagnoses what the script meant', async ({ page }) => {
        await installClock(page);
        await open(page, URL, `#/physics/${OPEN_KEY}`);
        await expect(page.locator('.ep-msg.tutor').first()).toContainText('Work Power Energy');
        await expect(page.locator('.ep-msg.tutor').nth(1)).toHaveText('Ten questions. Answer each one, then tell me which way you went. There is no skipping.');

        // the first card: the route menu is the routes in hash order plus "I guessed", nothing marked
        const first = await currentCard(page);
        const menu = await menuOf(page, first.id);
        if (!first.theory) {
            expect(menu.sort()).toEqual(['guess', 'm0', 'r']);
            // a number question asks for the number first: the options are hidden until then
            const card = page.locator('.ep-card[data-qid]').last();
            if (first.answer_kind === 'number') {
                await expect(card.locator('.ep-opt').first()).toBeHidden();
                await typeFirst(page, card, '4.56');
                await expect(card.locator('.ep-typed-said')).toHaveText('You wrote: 4.56');
            }
            await expect(card.locator('.ep-opt').first()).toBeVisible();
            await card.locator(`.ep-opt[data-option="${first.answer}"]`).click();
            // the pick locks the options but shows no key yet: the student says which way first
            await expect(page.locator('.ep-msg.tutor').last()).toHaveText('Which way did you go?');
            expect(await card.locator('.ep-opt.right').count()).toBe(0);
            const chips = page.locator('#runChips .ep-chip');
            await expect(chips).toHaveCount(3);
            const labels = await chips.allTextContents();
            expect(labels).toContain(ROUTE_RIGHT);
            expect(labels).toContain(ROUTE_APP);
            expect(labels).toContain('I guessed');
            for (let i = 0; i < 3; i++) expect(await chips.nth(i).getAttribute('class')).toBe('ep-chip');
            await page.reload();                                          // start the scripted run from the owed route
            await expect(page.locator('.ep-msg.tutor').nth(1)).toContainText('continues from where you stopped');
            await expect(page.locator('.ep-card[data-qid]').last().locator('.ep-opt').first()).toBeVisible();   // no number row on a resumed pick
            await page.locator('#runChips .ep-chip[data-route="r"]').click();
            await expect(page.locator('.ep-msg.tutor').last()).toHaveText('Correct.');
            await expect(page.locator('.ep-card[data-qid]').first().locator(`.ep-opt[data-option="${first.answer}"]`)).toHaveClass(/right/);
        } else {
            expect(menu).toEqual(['sure', 'guess']);
            const card = page.locator('.ep-card[data-qid]').last();
            await typeFirst(page, card, undefined, first, first.answer);
            await card.locator(`.ep-opt[data-option="${first.answer}"]`).click();
            await expect(page.locator('.ep-msg.tutor').last()).toHaveText('Were you sure?');
            await page.locator('#runChips .ep-chip[data-route="sure"]').click();
            await expect(page.locator('.ep-msg.tutor').last()).toHaveText('Correct.');
        }
        const played = [{ qid: first.id, theory: first.theory, intent: 'solid' as Intent, picked: first.answer, route: first.theory ? 'sure' : 'r', label: null as string | null }];
        played.push(...await playRun(page, SCRIPT.slice(1)));
        await expect(page).toHaveURL(new RegExp(`#/physics/${OPEN_KEY}/result$`));
        expect(await page.locator('#runView .ep-asked').count()).toBe(0);

        const verified: string[] = await page.evaluate((k) => (window as any).EP_POOL.chapters.find((c: any) => c.key === k).verified_ids, OPEN_KEY);
        const ids = played.map((p) => p.qid);
        expect(new Set(ids).size).toBe(10);
        for (const id of ids) expect(verified).toContain(id);

        const want = expectation(played);
        const state = await page.evaluate(() => JSON.parse(localStorage.getItem('ep_state_v1')!));
        const run = state.chapters[OPEN_KEY].runs[0];
        expect(run.records).toHaveLength(10);
        expect(run.finished_at).toBeTruthy();
        run.records.forEach((r: any, i: number) => {
            expect(r.qid).toBe(ids[i]);
            expect(r.picked).toBe(played[i].picked);
            expect(r.route).toBe(played[i].route);
            expect(r.probe).toBeUndefined();
            if (i > 0) expect(r.ms).toBe(40000);
        });
        const d = run.diagnosis;
        expect(d.score).toBe(want.score);
        expect(d.params).toEqual(want.params);
        expect(d.weakness).toBe(want.weakness);
        expect(d.mismatches).toBe(want.mismatches);
        expect(d.confirmed).toBe(want.confirmed);
        expect(d.typed).toBe(want.typed);
        expect(d.outcomes.map((o: any) => o.outcome)).toEqual(played.map((p) => ({
            solid: 'solid', slip: 'slip', guess_right: 'guessed_right', guess_wrong: 'guessed_wrong', wrong_route: 'wrong_route',
            mismatch: 'wrong_route', belief: 'wrong_belief', unlabelled: 'slip_unconfirmed',
        })[p.intent]));

        // the screen says the same
        await expect(page.locator('.ep-score')).toHaveText(`${want.score} out of 10 correct`);
        for (const p of ['concept', 'application', 'calculation', 'guessed', 'rushed']) {
            await expect(page.locator(`.ep-bar[data-param="${p}"] .ep-bar-n`)).toHaveText(String((want.params as any)[p]));
        }
        if (want.weakness) await expect(page.locator(`.ep-bar[data-param="${want.weakness}"]`)).toHaveClass(/ep-bar-weak/);
        if (want.weakness === 'calculation') await expect(page.locator('#resultVerdict')).toContainText('Your calculation slips');
        await expect(page.locator('#resultConfirmed')).toHaveText(`${want.confirmed} of your ${want.wrong} wrong answers are confirmed by the option you picked, not only by what you said.`);
        await expect(page.locator('.ep-shape-item')).toHaveCount(10);
        await expect(page.locator('.ep-fix-btn')).toHaveCount(10 - played.filter((p) => p.intent === 'solid').length);
        const mismatch = played.find((p) => p.intent === 'mismatch');
        if (mismatch) {
            await expect(page.locator(`.ep-shape-item[data-qid="${mismatch.qid}"] .ep-outcome`)).toContainText(`You say the right route. The option you picked is where a wrong route leads: “${ROUTE_APP}”. That is an application mistake.`);
        }
        await expect(page.locator('[data-group="fix"] .ep-shape-label').first()).toHaveText(/Work from a force equation|Power at an instant|Change in kinetic energy/);
        // the reveal: only now, and exactly the papers drawn
        const papers = new Set<string>();
        for (const id of ids) papers.add(String(await page.evaluate((q) => (window as any).EP_POOL.questions[q].asked_label, id)).replace(/,\s*Q\d+$/, ''));
        await expect(page.locator('#resultReveal .ep-reveal-title')).toHaveText('Congratulations.');
        await expect(page.locator('#resultReveal .ep-reveal-body')).toHaveText(`Every one of these 10 questions was a real TG EAPCET question from a past paper, with its official key. You got ${want.score} of them right.`);
        const listed = await page.locator('#resultReveal .ep-reveal-paper').allTextContents();
        expect(listed.map((l) => l.replace(/ — Q.*$/, '')).sort()).toEqual([...papers].sort());
        expect(listed.join('\n')).toMatch(/Q\d+/);

        await page.goto(URL + '#/physics');
        if (want.weakness && want.weakness !== 'solid') {
            await expect(page.locator(`.ep-row[data-chapter="${OPEN_KEY}"] .ep-badge`)).toHaveText(`Weak: ${want.weakness === 'guessed' ? 'guessing' : want.weakness} (${want.score}/10)`);
        }
    });

    test('a seeded set of records renders the parameters, the verdict, the outcome lines and a legacy record without a route', async ({ page }) => {
        await open(page, URL);
        const ids: string[] = await page.evaluate((k) => (window as any).EP_POOL.chapters.find((c: any) => c.key === k).verified_ids, OPEN_KEY);
        const facts = await page.evaluate((list) => list.map((id: string) => (window as any).EP_POOL.questions[id]), ids.slice(0, 6));
        const routedIds = facts.filter((q: any) => !q.theory).map((q: any) => q.id);
        expect(routedIds.length).toBeGreaterThanOrEqual(4);
        const [a, b, c, e] = routedIds;
        const qa = facts.find((q: any) => q.id === a), qb = facts.find((q: any) => q.id === b), qc = facts.find((q: any) => q.id === c);
        const records = [
            { qid: a, picked: pickFor(qa, 'calc'), correct: false, ms: 30000, route: 'r' },          // slip, confirmed
            { qid: b, picked: pickFor(qb, 'calc'), correct: false, ms: 30000, route: 'r' },          // slip, confirmed
            { qid: c, picked: pickFor(qc, 'other'), correct: false, ms: 9000, route: 'r' },          // slip, unconfirmed, rushed
            { qid: e, picked: 1, correct: true, ms: 30000, route: 'guess' },                          // guessed right
            { qid: ids[6], picked: 1, correct: true, ms: 30000, probe: 'sure' },                      // legacy: before routes
        ];
        await page.evaluate(([k, recs]: [string, unknown[]]) => {
            const w = window as any;
            const run = { run_no: 1, seed: 1, ids: (recs as any[]).map((r) => r.qid), started_at: '2026-09-08T10:00:00Z',
                finished_at: '2026-09-08T10:06:00Z', records: recs, diagnosis: w.Diag.diagnose(recs, w.Data.facts((recs as any[]).map((r) => r.qid))) };
            localStorage.setItem('ep_state_v1', JSON.stringify({ chapters: { [k]: { runs: [run], retries: [], streak: {}, strong_now: {} } } }));
        }, [OPEN_KEY, records] as [string, unknown[]]);
        // Run reads ep_state_v1 once at boot, so the seeded state needs a fresh boot
        // BEFORE the result route runs (a stale boot would start a new run and overwrite it).
        await page.reload();
        await page.goto(URL + `#/physics/${OPEN_KEY}/result`);
        await expect(page.locator('.ep-score')).toHaveText('2 out of 5 correct');
        await expect(page.locator('.ep-bar[data-param="calculation"] .ep-bar-n')).toHaveText('3');
        await expect(page.locator('.ep-bar[data-param="guessed"] .ep-bar-n')).toHaveText('1');
        await expect(page.locator('.ep-bar[data-param="rushed"] .ep-bar-n')).toHaveText('1');
        // two confirmed slips do not earn the type headline (three do): the shapes lead
        expect(await page.locator('.ep-bar-weak').count()).toBe(0);
        await expect(page.locator('#resultVerdict')).toContainText('to fix: ');
        await expect(page.locator('#resultConfirmed')).toHaveText('2 of your 3 wrong answers are confirmed by the option you picked, not only by what you said.');
        // the shapes come before the bars
        const order = await page.evaluate(() => Array.from(document.querySelectorAll('#resultBody .ep-shapes, #resultBody .ep-bars')).map((e) => e.className));
        expect(order[order.length - 1]).toBe('ep-bars');
        await expect(page.locator(`.ep-shape-item[data-qid="${a}"] .ep-outcome`)).toHaveText('Q1 — Right route. The option you picked comes from a calculation slip.');
        await expect(page.locator(`.ep-shape-item[data-qid="${c}"] .ep-outcome`)).toHaveText('Q3 — You say the right route. The option you picked says nothing more. It counts as a slip for now. Answered in under 15 seconds.');
        await expect(page.locator(`.ep-shape-item[data-qid="${e}"]`)).toHaveAttribute('data-outcome', 'guessed_right');
        await expect(page.locator(`.ep-shape-item[data-qid="${ids[6]}"]`)).toHaveAttribute('data-outcome', 'legacy');
        await expect(page.locator(`.ep-shape-item[data-qid="${ids[6]}"] .ep-outcome`)).toHaveText('Q5 — Right.');
        // a guessed-right answer keeps its solution link even inside a shape that has a wrong answer
        await expect(page.locator(`.ep-shape-item[data-qid="${e}"] .ep-fix-btn`)).toHaveCount(1);
        await expect(page.locator(`.ep-shape-item[data-qid="${ids[6]}"] .ep-fix-btn`)).toHaveCount(0);
        await expect(page.locator('#resultBody .ep-note').last()).toContainText('about 30 seconds a question. The exam gives 67.5 s.');
    });

    test('the page holds no solution byte and no mistake text; fewer than two of a type name no pattern', async ({ page }) => {
        await open(page, URL);
        const html = await page.content();
        expect(html).not.toContain(STEP_TEXT);
        expect(html).not.toContain(MISTAKE_APP);
        expect(html).not.toContain(MISTAKE_CALC);
        expect(html).not.toContain('"why_this_step"');
        expect(html).not.toContain('"common_mistakes"');
        expect(html).toContain(ROUTE_RIGHT);                     // the menu is public by design
        const anySolution = await page.evaluate(() => Object.values((window as any).EP_POOL.questions).some((q: any) => q.solution));
        expect(anySolution).toBe(false);
        await installClock(page);
        await page.goto(URL + `#/physics/${OPEN_KEY}`);
        await playRun(page, ['solid', 'solid', 'guess_wrong', 'solid', 'solid', 'solid', 'solid', 'slip', 'solid', 'solid']);
        await expect(page.locator('#resultVerdict')).toContainText('you are solid: eight or more right');
        await page.goto(URL + '#/physics');
        await expect(page.locator(`.ep-row[data-chapter="${OPEN_KEY}"] .ep-badge`)).toHaveText('Last run 8/10');
    });

    test('a chapter without audited routes asks "Were you sure?", names no type, and reports under the chapter name', async ({ page }) => {
        await installClock(page);
        await open(page, URL, `#/physics/${PLAIN_KEY}`);
        const q = await currentCard(page);
        expect(q.has_routes).toBe(false);
        expect(await menuOf(page, q.id)).toEqual(['sure', 'guess']);
        await typeFirst(page, page.locator('.ep-card[data-qid]').last(), undefined, q, (q.answer % 4) + 1);
        await advance(page, 40000);
        await page.locator('.ep-card[data-qid]').last().locator(`.ep-opt[data-option="${(q.answer % 4) + 1}"]`).click();
        await expect(page.locator('.ep-msg.tutor').last()).toHaveText('Were you sure?');
        await expect(page.locator('#runChips .ep-chip')).toHaveText(['I was sure', 'I guessed']);
        await page.locator('#runChips .ep-chip[data-route="sure"]').click();
        await expect(page.locator('.ep-msg.tutor').last()).toHaveText(`You picked (${(q.answer % 4) + 1}). The key says (${q.answer}).`);
        await playRun(page, ['belief', 'belief', 'solid', 'solid', 'guess_wrong', 'solid', 'solid', 'solid', 'solid']);
        const d = await page.evaluate((k) => JSON.parse(localStorage.getItem('ep_state_v1')!).chapters[k].runs[0].diagnosis, PLAIN_KEY);
        expect(d.params).toEqual({ concept: 0, application: 0, calculation: 0, guessed: 1, rushed: 0 });
        expect(d.outcomes.filter((o: any) => !o.outcome || o.outcome === 'wrong_unrouted').length).toBe(3);
        expect(d.typed).toBe(0);
        expect(d.weakness).toBeNull();
        await expect(page.locator('#resultVerdict')).toHaveText('No clear pattern yet. Run it again for a second look.');
        await expect(page.locator('#resultConfirmed')).toHaveCount(0);
        await expect(page.locator('.ep-shape-label').first()).toHaveText('Gravitation');
        await expect(page.locator('[data-group="fix"] .ep-outcome').first()).toContainText('Wrong. You picked');
        await expect(page.locator('#resultReveal')).toBeVisible();
    });

    test('a mid-run reload resumes at the same question with the route still owed; the result and its reveal do not exist yet', async ({ page }) => {
        await installClock(page);
        await open(page, URL, `#/physics/${OPEN_KEY}`);
        await playRun(page, SCRIPT.slice(0, 3));
        const q = await currentCard(page);
        const menu = await menuOf(page, q.id);
        await typeFirst(page, page.locator('.ep-card[data-qid]').last(), undefined, q, q.answer);
        await page.locator('.ep-card[data-qid]').last().locator(`.ep-opt[data-option="${q.answer}"]`).click();
        await expect(page.locator('#runChips .ep-chip')).toHaveCount(menu.length);
        await page.goto(URL + `#/physics/${OPEN_KEY}/result`);
        await expect(page.locator('#runView')).toBeVisible();                // no finished run: back to the run
        await expect(page.locator('#resultReveal')).toHaveCount(0);
        await expect(page.locator('.ep-msg.tutor').nth(1)).toContainText('continues from where you stopped');
        await expect(page.locator('#runChips .ep-chip')).toHaveCount(menu.length);
        expect(await page.locator('#runView .ep-asked').count()).toBe(0);
        await expect(page.locator('.ep-card[data-qid]').last()).toHaveAttribute('data-qid', q.id);
        await page.locator(`#runChips .ep-chip[data-route="${menu.includes('r') ? 'r' : 'sure'}"]`).click();
        const next = await currentCard(page);
        expect(next.id).not.toBe(q.id);
        await expect(page.locator('.ep-card .ep-progress').last()).toHaveText('Question 5 of 10');
        const state = await page.evaluate(() => JSON.parse(localStorage.getItem('ep_state_v1')!));
        expect(state.chapters[OPEN_KEY].runs).toHaveLength(1);
        expect(state.chapters[OPEN_KEY].runs[0].records[3]).toMatchObject({ qid: q.id, correct: true, route: menu.includes('r') ? 'r' : 'sure' });
    });

    test('a second run is a fresh draw that brings back what the first did not show, and covers every shape', async ({ page }) => {
        await installClock(page);
        await open(page, URL, `#/physics/${OPEN_KEY}`);
        const first = (await playRun(page, SCRIPT)).map((p) => p.qid);
        await page.click('#btnRunAgain');
        await expect(page.locator('#runView')).toBeVisible();
        const second = (await playRun(page, SCRIPT)).map((p) => p.qid);
        const state = await page.evaluate(() => JSON.parse(localStorage.getItem('ep_state_v1')!));
        expect(state.chapters[OPEN_KEY].runs).toHaveLength(2);
        expect(state.chapters[OPEN_KEY].runs[1].run_no).toBe(2);
        // 13 verified, 10 drawn: the three the first run never showed all come back
        const unseen = second.filter((id) => !first.includes(id));
        expect(unseen.length).toBe(3);
        for (const ids of [first, second]) {
            const keys = await page.evaluate((list) => list.map((id: string) => (window as any).EP_POOL.questions[id].shape.key), ids);
            expect(new Set(keys).size).toBe(SHAPES.length);
        }
    });

    test('three right-by-the-right-route siblings flip strong now for the shape; one wrong retry resets the streak', async ({ page }) => {
        await installClock(page);
        await open(page, URL, `#/physics/${OPEN_KEY}`);
        await playRun(page, SCRIPT);
        const flip = await page.evaluate((k) => {
            const w = window as any;
            const ch = w.Data.chapter(k);
            const from = w.Run.lastFinished(k).diagnosis.wrong_ids[0];
            const shape = w.Data.shapeKey(w.Data.question(from));
            const out: any = { shape, same: [] };
            let seen = w.Run.seenIds(k);
            for (let i = 0; i < 3; i++) {
                const sib = w.Data.sibling(from, ch, seen);
                out.same.push(sib.same_shape === (w.Data.shapeKey(w.Data.question(sib.qid)) === shape));
                out['streak' + i] = w.Run.retry(k, from, shape, sib.qid, 1, true, 'r', 5000, sib.same_shape);
                seen = w.Run.seenIds(k);
            }
            out.badge = w.Run.badge(k);
            out.retry0 = w.Run.chapterState(k).retries[0];
            out.after_wrong = w.Run.retry(k, from, shape, w.Data.sibling(from, ch, seen).qid, 2, false, 'm0', 5000, false);
            out.strong_kept = w.Run.chapterState(k).strong_now[shape];
            out.guessed_resets = w.Run.retry(k, from, shape, w.Data.sibling(from, ch, w.Run.seenIds(k)).qid, 1, true, 'guess', 5000, false);
            return out;
        }, OPEN_KEY);
        expect([flip.streak0, flip.streak1, flip.streak2]).toEqual([1, 2, 3]);
        expect(flip.same).toEqual([true, true, true]);
        expect(flip.badge).toMatchObject({ kind: 'strong', shape_key: flip.shape });
        expect(flip.retry0).toMatchObject({ shape_key: flip.shape, route: 'r', probe: 'sure', correct: true });
        expect(typeof flip.retry0.same_shape).toBe('boolean');
        expect(flip.after_wrong).toBe(0);
        expect(flip.strong_kept).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(flip.guessed_resets).toBe(0);
        await page.goto(URL + '#/physics');
        const label = SHAPES.find((s) => s.key === flip.shape)!.label;
        await expect(page.locator(`.ep-row[data-chapter="${OPEN_KEY}"] .ep-badge`)).toHaveText(flip.badge.same_shape ? `Strong now: ${label}` : 'Strong now on similar questions');
    });

    test('the fix page names the paper; the run card does not', async ({ page }) => {
        await installClock(page);
        await open(page, URL, `#/physics/${OPEN_KEY}`);
        const q = await currentCard(page);
        expect(await page.locator('#runView .ep-asked').count()).toBe(0);
        expect(await page.locator('#runView').textContent()).not.toContain('TG EAPCET');
        await page.goto(URL + `#/physics/${OPEN_KEY}/fix/${encodeURIComponent(q.id)}`);
        await expect(page.locator('#fixView .ep-asked')).toHaveText(q.asked_label);
    });
});

// ═══ the hosted build, against faked endpoints ═══════════════════════════════
// The same fixture built with --hosted and three EP_* bases on a host that does
// not exist; page.route answers for ep-state, ep-vidi-chat and ep-pay. What it
// proves: a locked device meets the lock wall and never receives a solution
// byte in the page or in any response body; paying posts THIS device's id and
// the return lands on the solution the student was heading to; an entitled
// device renders the verified solution, the mistake that names its pick first,
// the grounded card, a sibling retry (no paper label) that counts toward the
// streak of its shape; the chat posts the open question, the route tapped and
// the shape keys — never a phrase — and renders the reply under the AI tag.
import { type Page } from '@playwright/test';
const HOSTED_OUT = join(ROOT, 'eapcet-app', 'dist-e2e-hosted');
const HOSTED_URL = 'file:///' + join(HOSTED_OUT, 'index.html').replace(/\\/g, '/');
const STATE = 'https://ep.test/state';
const CHAT = 'https://ep.test/chat';
const PAY = 'https://ep.test/pay';
const SKU = { sku: 'eapcet_physics_month', label: 'EAPCET Physics', price_inr: 399, list_price_inr: 399,
    founding: false, founding_locked: false, founding_slots_left: null, period_days: 31 };
const CORS = { 'access-control-allow-origin': '*', 'content-type': 'application/json' };

interface Fake { unlocked: boolean; posts: Array<{ url: string; body: any }>; reply: string }

/** Wire the three endpoints. `fake.unlocked` decides the standing and the bundle. */
async function wire(page: Page, fake: Fake): Promise<void> {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
    const standing = () => ({ unlocked: fake.unlocked, paid_until: fake.unlocked ? '2026-10-10T00:00:00Z' : null,
        signed_in: false, devices: 1, sku: SKU });
    await page.route(STATE, async (route) => {
        const body = JSON.parse(route.request().postData() || '{}');
        fake.posts.push({ url: STATE, body });
        if (body.action === 'standing') return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ ok: true, ...standing() }) });
        if (body.action === 'bundle') {
            if (!fake.unlocked) return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ ok: true, locked: true, sku: SKU }) });
            const f = fixture();
            const solutions: Record<string, unknown> = {};
            for (const q of Object.values(f.questions) as any[]) {
                if (q.chapter_key === body.chapter_key && q.solution) {
                    solutions[q.id] = { solution: q.solution, grounding: [{ question_id: 'ts_ipe_p1_wpe_card', title: 'Work-energy theorem', text: 'The net work done on a body equals the change in its kinetic energy.' }] };
                }
            }
            return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ ok: true, unlocked: true, chapter_key: body.chapter_key, solutions }) });
        }
        return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ ok: true, chapters: {}, server_time: new Date().toISOString(), internal: false, standing: standing() }) });
    });
    await page.route(CHAT, async (route) => {
        const body = JSON.parse(route.request().postData() || '{}');
        fake.posts.push({ url: CHAT, body });
        if (body.type === 'events') return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ ok: true }) });
        if (!fake.unlocked) return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ locked: true, questions_left: 0 }) });
        return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ reply: fake.reply, questions_left: 39 }) });
    });
    await page.route(PAY, async (route) => {
        const body = JSON.parse(route.request().postData() || '{}');
        fake.posts.push({ url: PAY, body });
        return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ ok: true, url: 'https://rzp.test/l/abc', price: SKU }) });
    });
    await page.route('https://rzp.test/l/abc', (route) => route.fulfill({ status: 200, headers: { 'content-type': 'text/html' }, body: '<html><body><h1>Razorpay</h1></body></html>' }));
}

test.describe('EAPCET finder — hosted build against faked endpoints', () => {
    test.beforeAll(() => {
        mkdirSync(HOSTED_OUT, { recursive: true });
        writeFileSync(join(HOSTED_OUT, 'fixture_release.json'), JSON.stringify(fixture()));
        const learn = writeLearnDir(join(HOSTED_OUT, 'learn'));
        execFileSync('npx', ['tsx', 'src/scripts/build_eapcet_app.ts', '--hosted', `--pool=${join(HOSTED_OUT, 'fixture_release.json')}`, `--out=${HOSTED_OUT}`, `--learn=${learn}`], {
            cwd: ROOT, stdio: 'pipe', shell: true,
            env: { ...process.env, EP_CHAT_BASE: CHAT, EP_STATE_BASE: STATE, EP_PAY_BASE: PAY, EP_AUTH_BASE: '', EP_AUTH_ANON: '', EP_STAFF_WORD: 'teamword' },
        });
        if (!existsSync(join(HOSTED_OUT, 'index.html'))) throw new Error('the hosted e2e build produced no index.html');
    });

    test('a locked device meets the lock wall and never receives a solution byte; paying carries its device id and returns to the solution', async ({ page }) => {
        const fake: Fake = { unlocked: false, posts: [], reply: '' };
        await wire(page, fake);
        await installClock(page);
        const bodies: string[] = [];
        page.on('response', async (r) => { try { if (/ep\.test/.test(r.url())) bodies.push(await r.text()); } catch { /* aborted */ } });
        await page.goto(HOSTED_URL + `#/physics/${OPEN_KEY}`);
        await playRun(page, SCRIPT);
        await page.locator('.ep-fix-btn').first().click();
        await expect(page.locator('#lockWall')).toBeVisible();
        await expect(page.locator('#lockWall')).toContainText('₹399 for 31 days');
        const html = await page.content();
        expect(html).not.toContain(STEP_TEXT);
        expect(html).not.toContain(MISTAKE_APP);
        for (const b of bodies) { expect(b).not.toContain(STEP_TEXT); expect(b).not.toContain(MISTAKE_APP); }
        const fixHash = await page.evaluate(() => location.hash);
        expect(fixHash).toMatch(new RegExp(`^#/physics/${OPEN_KEY}/fix/`));
        const deviceId = await page.evaluate(() => localStorage.getItem('ep_device_id'));
        expect(deviceId).toMatch(/^[0-9a-f-]{36}$/);
        // the sync on boot carried this device and its chapters
        expect(fake.posts.some((p) => p.url === STATE && p.body.action === 'sync' && p.body.device_id === deviceId)).toBe(true);

        await page.locator('#lockWall button', { hasText: 'Unlock for ₹399' }).click();
        await page.waitForURL('https://rzp.test/l/abc');
        const pay = fake.posts.find((p) => p.url === PAY);
        expect(pay?.body.device_id).toBe(deviceId);

        // Back from Razorpay: the webhook has landed, the plan is live, the page
        // returns the student to the solution they were heading to.
        fake.unlocked = true;
        await page.goto(HOSTED_URL + '#/physics');
        await expect(page).toHaveURL(new RegExp(fixHash.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'), { timeout: 12000 });
        await expect(page.locator('.ep-step')).toHaveCount(2);
        expect(fake.posts.some((p) => p.url === CHAT && p.body.type === 'events' && p.body.events.some((e: any) => e.t === 'lock_hit'))).toBe(true);
        expect(fake.posts.some((p) => p.url === CHAT && p.body.type === 'events' && p.body.events.some((e: any) => e.t === 'route' && typeof e.outcome === 'string'))).toBe(true);
    });

    test('an entitled device reads the verified solution, its own mistake first, the grounded card, and a sibling retry that counts toward its shape', async ({ page }) => {
        const fake: Fake = { unlocked: true, posts: [], reply: '' };
        await wire(page, fake);
        await installClock(page);
        await page.goto(HOSTED_URL + `#/physics/${OPEN_KEY}`);
        const played = await playRun(page, SCRIPT);
        const slip = played.find((p) => p.intent === 'slip')!;
        await page.locator(`.ep-shape-item[data-qid="${slip.qid}"] .ep-fix-btn`).click();
        await expect(page.locator('.ep-step')).toHaveCount(2);
        await expect(page.locator('.ep-step').first()).toContainText(STEP_TEXT);
        await expect(page.locator('.ep-approach')).toContainText('Work equals the change in kinetic energy');
        await expect(page.locator('.ep-fix-key')).toContainText('You picked');
        await expect(page.locator('#fixView .ep-asked')).toContainText('TG EAPCET 2023');
        // the calculation mistake names the option the slip picked: it is tagged as the student's own
        await expect(page.locator('.ep-mistake').first()).toHaveClass(/ep-mistake-mine/);
        await expect(page.locator('.ep-mistake').first()).toContainText(MISTAKE_CALC);
        await expect(page.locator('.ep-gcard-title')).toHaveText('Work-energy theorem');
        // the solution never leaves memory for localStorage
        const stored = await page.evaluate(() => Object.keys(localStorage).map((k) => localStorage.getItem(k) || '').join('\n'));
        expect(stored).not.toContain(STEP_TEXT);
        expect(fake.posts.some((p) => p.url === STATE && p.body.action === 'bundle' && p.body.chapter_key === OPEN_KEY)).toBe(true);

        await page.locator('#retryBox button', { hasText: 'Try a similar question' }).click();
        const sib = page.locator('#retryBox .ep-card[data-qid]');
        await expect(sib).toHaveCount(1);
        expect(await page.locator('#retryBox .ep-asked').count()).toBe(0);
        const sibId = (await sib.getAttribute('data-qid')) || '';
        expect(sibId).toBeTruthy();
        expect(sibId).not.toBe(slip.qid);
        const [fromShape, sibShape, answer, answerText] = await page.evaluate(([a, b]) => {
            const w = window as any;
            const sq = w.Data.question(b);
            return [w.Data.shapeKey(w.Data.question(a)), w.Data.shapeKey(sq), sq.answer, sq.options_en[sq.answer - 1]];
        }, [slip.qid, sibId]);
        await typeFirst(page, sib, answerText);                       // the sibling asks for the number first too
        await sib.locator(`.ep-opt[data-option="${answer}"]`).click();
        const menu = await menuOf(page, sibId);
        await expect(page.locator('#retryBox .ep-chip')).toHaveCount(menu.length);
        await page.locator(`#retryBox .ep-chip[data-route="${menu.includes('r') ? 'r' : 'sure'}"]`).click();
        await expect(page.locator('#retryVerdict')).toHaveText('1 of 3 right by the right route in a row.');
        const state = await page.evaluate(() => JSON.parse(localStorage.getItem('ep_state_v1')!));
        expect(state.chapters[OPEN_KEY].retries).toHaveLength(1);
        expect(state.chapters[OPEN_KEY].retries[0]).toMatchObject({
            qid: sibId, from_qid: slip.qid, shape_key: fromShape, route: menu.includes('r') ? 'r' : 'sure', probe: 'sure',
            same_shape: fromShape === sibShape, correct: true,
        });
        expect(state.chapters[OPEN_KEY].streak[fromShape]).toBe(1);
        // the sync carried the retry with its shape
        await page.evaluate(() => (window as any).Track.flush());
        await expect.poll(() => fake.posts.some((p) => p.url === STATE && p.body.action === 'sync' && p.body.chapters?.[OPEN_KEY]?.retries?.[0]?.shape_key === fromShape), { timeout: 8000 }).toBe(true);
    });

    test('the chat posts the open question, the route tapped and the shape keys — never a phrase — and renders the reply under the AI tag', async ({ page }) => {
        const fake: Fake = { unlocked: true, posts: [], reply: 'Step 2 evaluates the work because the theorem needs the change in kinetic energy.' };
        await wire(page, fake);
        await installClock(page);
        await page.goto(HOSTED_URL + `#/physics/${OPEN_KEY}`);
        const played = await playRun(page, SCRIPT);
        const mismatch = played.find((p) => p.intent === 'mismatch') ?? played.find((p) => p.intent !== 'solid' && p.intent !== 'guess_right')!;
        await page.locator(`.ep-shape-item[data-qid="${mismatch.qid}"] .ep-fix-btn`).click();
        await expect(page.locator('.ep-chat')).toBeVisible();
        await expect(page.locator('.ep-chat-chips .ep-chip')).toHaveCount(3);
        await page.fill('.ep-chat-input', 'Why divide by two in step 2?');
        await page.click('.ep-chat-send');
        await expect(page.locator('.ep-chat-msg.tutor .ep-chat-text').last()).toHaveText(fake.reply);
        await expect(page.locator('.ep-ai-tag').last()).toHaveText('AI answer — check it against the worked solution above');
        const ask = fake.posts.find((p) => p.url === CHAT && p.body.question);
        expect(ask?.body).toMatchObject({ question: 'Why divide by two in step 2?', question_id: mismatch.qid, picked: mismatch.picked, route: mismatch.route });
        expect(ask?.body.probe).toBeUndefined();
        expect(ask?.body.weakness).toBeUndefined();
        expect(Array.isArray(ask?.body.solid_shapes)).toBe(true);
        expect(Array.isArray(ask?.body.weak_shapes)).toBe(true);
        for (const k of [...ask!.body.solid_shapes, ...ask!.body.weak_shapes]) expect(k).toMatch(/^[a-z0-9_-]{1,40}$/);
        expect(ask?.body.weak_shapes.length).toBeGreaterThan(0);
        expect(ask?.body.device_id).toMatch(/^[0-9a-f-]{36}$/);
        // the page never sent a solution string or a route phrase: grounding is the server's job
        const sent = JSON.stringify(ask?.body);
        expect(sent).not.toContain(STEP_TEXT);
        expect(sent).not.toContain(ROUTE_RIGHT);
        expect(sent).not.toContain(ROUTE_APP);
    });

    test('the team route marks the device, and every batch after it says so', async ({ page }) => {
        const fake: Fake = { unlocked: false, posts: [], reply: '' };
        await wire(page, fake);
        await page.goto(HOSTED_URL + '#/notastudent/teamword');
        await expect(page.locator('#doorNote')).toContainText('marked as a team phone');
        expect(await page.evaluate(() => localStorage.getItem('ep_internal'))).toBe('1');
        await page.goto(HOSTED_URL + '#/physics');
        await page.waitForTimeout(300);
        await page.evaluate(() => (window as any).Track.flush());
        await expect.poll(() => fake.posts.filter((p) => p.url === CHAT && p.body.type === 'events').some((p) => p.body.internal === true)).toBe(true);
    });
});
