/**
 * eapcet_app.spec.ts — evidence for the EAPCET finder's offline build.
 *
 *   npm run smoke:eapcet
 *
 * Builds its own fixture release (one open chapter, one closed) into
 * eapcet-app/dist-e2e/ with the real build script, then opens the file from
 * file:// and walks it the way a student does. Its own script, not part of
 * `npm run smoke` (which talks to Supabase): this needs nothing.
 *
 * What it proves: the offline page makes zero requests; a run asks ten pool
 * questions and scores them against the key; the guess tap follows a correct
 * pick and the four probes follow a wrong one; a known set of records yields
 * the known histogram, guessed-right count and weakness; a locked page holds
 * no solution byte; a mid-run reload resumes at the same question; a second
 * run avoids the previous run's questions; three correct-and-sure siblings
 * flip "strong now" and one wrong retry resets the streak.
 */
import { test, expect, type Page } from '@playwright/test';
import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const OUT = join(ROOT, 'eapcet-app', 'dist-e2e');
const DIST = join(OUT, 'index.html');
const FIXTURE = join(OUT, 'fixture_release.json');
const URL = 'file:///' + DIST.replace(/\\/g, '/');
const OPEN_KEY = 'p1-05';
const CLOSED_KEY = 'p1-02';
const SHA = 'f'.repeat(64);
const STEP_TEXT = 'Differentiate the displacement with respect to time to get the velocity.';

function solution(id: string, option: number) {
    return {
        schema: 'eapcet_solution_v1', question_id: id,
        approach: 'Work equals the change in kinetic energy over the interval.',
        steps: [{ text: STEP_TEXT, equation: 'v = t²' }, { text: 'Evaluate the work done.', equation: 'W = 24 J' }],
        final_answer: { option, value: '24 J' }, confidence: 'sure',
        common_mistakes: [{ option: option % 4 + 1, text: 'Using the final force as if it were constant over the motion.' }],
        concept_tags: ['work-energy theorem'], difficulty: 'easy', mistake_type_hint: 'application',
        authored_by: { model: 'sonnet', wave: 1, agent: 'W01-A-p1-05', at: '2026-09-09T10:00:00+05:30' },
    };
}

function chapter(key: string, name: string, order: number, n: number, verified: number, date: string) {
    const ids = Array.from({ length: n }, (_, i) => `tg_eapcet_2023_${date}_fn_q${String(81 + i).padStart(3, '0')}`);
    const questions: Record<string, unknown> = {};
    ids.forEach((id, i) => {
        const answer = (i % 4) + 1;
        const q: Record<string, unknown> = {
            id, chapter_key: key, chapter: name, year: 2023, date: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`,
            session: 'FN', q_no: 81 + i, asked_label: `TG EAPCET 2023, 12 May, morning, Q${81 + i}`,
            question_en: `${name} question ${i + 1}: a body moves so that s = t³/3. The work done in the first two seconds is`,
            options_en: ['32 J', '3.8 J', '5.2 J', '24 J'], answer, recurrence: i % 3, twin_of: [],
            grounding: { answer_book_cards: [], weak_match: true, unit_cards: 0 },
        };
        if (i < verified) {
            q.solution = solution(id, answer);
            q.verified = { gate_sha: SHA, audit_verdict: 'ok', audited_by: 'W01-U-p1-05', spot_checked: false };
        }
        questions[id] = q;
    });
    const siblings: Record<string, string[]> = {};
    ids.forEach((id, i) => { siblings[id] = ids.filter((_, j) => j !== i).slice(i, i + 6).length >= 3 ? ids.filter((_, j) => j !== i).slice(0, 6) : ids.filter((_, j) => j !== i).slice(0, 6); });
    return {
        chapter: {
            key, name, paper: 'first_year', order, answer_book_unit: { subject: 'physics', number: order },
            asked_total: 40, share_pct: 4.0, per_exam: 1.5, eligible: n, pool_ids: ids, verified_ids: ids.slice(0, verified),
            open: verified >= 13, closed_because: verified >= 13 ? null : `${verified} of 13 verified`,
        },
        questions, siblings,
    };
}

function fixture() {
    const a = chapter(OPEN_KEY, 'Work Power Energy', 5, 15, 13, '20230512');
    const b = chapter(CLOSED_KEY, 'Motion in a Straight Line', 2, 15, 5, '20230513');
    return {
        schema: 'eapcet_physics_pool_v1',
        built_from: { bank: 'eapcet/bank/physics_v1.json', bank_sha256: SHA, bank_rows: 1041, selector_version: 1,
            built_at: '2026-09-08T02:00:00+05:30', release_at: '2026-09-08T03:00:00+05:30', open_at: 13, gated: 30, verified: 18 },
        exam: { shifts: 26, physics_per_shift: 40 },
        rules: { exclude: ['needs_figure'], twin_jaccard: 0.85, recurrence_jaccard_digits_masked: 0.5, target_per_chapter: 15, siblings: 6 },
        chapters: [b.chapter, a.chapter],
        questions: { ...a.questions, ...b.questions },
        siblings: { ...a.siblings, ...b.siblings },
    };
}

test.beforeAll(() => {
    mkdirSync(OUT, { recursive: true });
    writeFileSync(FIXTURE, JSON.stringify(fixture()));
    execFileSync('npx', ['tsx', 'src/scripts/build_eapcet_app.ts', `--pool=${FIXTURE}`, `--out=${OUT}`], { cwd: ROOT, stdio: 'pipe', shell: true });
    if (!existsSync(DIST)) throw new Error('the e2e build produced no index.html');
});

/** Requests that are not the page itself or the font stylesheet the shell links. */
function watchRequests(page: Page): string[] {
    const seen: string[] = [];
    page.on('request', (r) => {
        const u = r.url();
        if (u.startsWith('file:') || /fonts\.(googleapis|gstatic)\.com/.test(u)) return;
        seen.push(u);
    });
    return seen;
}

async function open(page: Page, hash = '#/'): Promise<void> {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
    await page.goto(URL + hash);
    await page.waitForSelector('main');
}

/** The card on screen and the key for it, straight from the page's own pool. */
async function currentCard(page: Page): Promise<{ qid: string; answer: number }> {
    const qid = await page.locator('.ep-card[data-qid]').last().getAttribute('data-qid');
    expect(qid).toBeTruthy();
    const answer = await page.evaluate((id) => (window as any).EP_POOL.questions[id].answer, qid);
    return { qid: qid!, answer };
}

/** The scripted ten: c/w = right or wrong pick, then the probe tapped. */
const SCRIPT: Array<[boolean, string]> = [
    [true, 'sure'], [false, 'calculation'], [true, 'guessed'], [false, 'concept'], [true, 'sure'],
    [false, 'calculation'], [true, 'guessed'], [false, 'calculation'], [true, 'sure'], [false, 'time'],
];

async function playRun(page: Page, script = SCRIPT): Promise<string[]> {
    const ids: string[] = [];
    for (const [right, probe] of script) {
        const { qid, answer } = await currentCard(page);
        ids.push(qid);
        const pick = right ? answer : (answer % 4) + 1;
        await page.locator('.ep-card[data-qid]').last().locator(`.ep-opt[data-option="${pick}"]`).click();
        const chips = page.locator('#runChips .ep-chip');
        await expect(chips).toHaveCount(right ? 2 : 4);
        await page.locator(`#runChips .ep-chip[data-probe="${probe}"]`).click();
    }
    return ids;
}

test.describe('EAPCET finder — offline build', () => {
    test('door, chapter list, and zero network requests', async ({ page }) => {
        const seen = watchRequests(page);
        await open(page);
        await expect(page.locator('#doorView')).toBeVisible();
        await page.click('.ep-tile[data-subject="physics"]');
        await expect(page.locator('#chaptersView')).toBeVisible();
        const openRow = page.locator(`.ep-row[data-chapter="${OPEN_KEY}"]`);
        await expect(openRow).toHaveAttribute('href', `#/physics/${OPEN_KEY}`);
        await expect(openRow.locator('.ep-badge')).toHaveText('Not tested yet');
        const closedRow = page.locator(`.ep-row[data-chapter="${CLOSED_KEY}"]`);
        await expect(closedRow).not.toHaveAttribute('href', /.*/);
        await expect(closedRow.locator('.ep-badge')).toHaveText('Not enough verified questions yet');
        await openRow.click();
        await expect(page.locator('#runView')).toBeVisible();
        await expect(page.locator('.ep-card[data-qid]')).toHaveCount(1);
        expect(seen).toEqual([]);
    });

    test('a run asks ten verified questions, scores against the key, probes, and diagnoses', async ({ page }) => {
        await open(page, `#/physics/${OPEN_KEY}`);
        await expect(page.locator('.ep-msg.tutor').first()).toContainText('Work Power Energy');
        const ids = await playRun(page);
        await expect(page).toHaveURL(new RegExp(`#/physics/${OPEN_KEY}/result$`));

        const verified: string[] = await page.evaluate((k) => (window as any).EP_POOL.chapters.find((c: any) => c.key === k).verified_ids, OPEN_KEY);
        expect(new Set(ids).size).toBe(10);
        for (const id of ids) expect(verified).toContain(id);

        const state = await page.evaluate(() => JSON.parse(localStorage.getItem('ep_state_v1')!));
        const run = state.chapters[OPEN_KEY].runs[0];
        expect(run.records).toHaveLength(10);
        expect(run.finished_at).toBeTruthy();
        run.records.forEach((r: any, i: number) => {
            expect(r.qid).toBe(ids[i]);
            expect(r.correct).toBe(SCRIPT[i][0]);
            expect(r.probe).toBe(SCRIPT[i][1]);
            expect(r.ms).toBeGreaterThanOrEqual(0);
        });
        expect(run.diagnosis.score).toBe(5);
        expect(run.diagnosis.guessed_right).toBe(2);
        expect(run.diagnosis.hist).toEqual({ concept: 1, application: 0, calculation: 3, time: 1 });
        expect(run.diagnosis.weakness).toBe('calculation');

        await expect(page.locator('.ep-score')).toHaveText('5 out of 10 correct');
        await expect(page.locator('.ep-bar[data-type="calculation"] .ep-bar-n')).toHaveText('3');
        await expect(page.locator('.ep-bar[data-type="calculation"]')).toHaveClass(/ep-bar-weak/);
        await expect(page.locator('#resultVerdict')).toContainText('Your calculation slips');
        await expect(page.locator('.ep-fix-item')).toHaveCount(7);          // 5 wrong + 2 guessed right
        await expect(page.locator('.ep-fix-btn').first()).toHaveAttribute('href', new RegExp(`#/physics/${OPEN_KEY}/fix/`));

        await page.goto(URL + '#/physics');
        await expect(page.locator(`.ep-row[data-chapter="${OPEN_KEY}"] .ep-badge`)).toHaveText('Weak: calculation (5/10)');
    });

    test('a seeded set of records renders the known histogram, guessed-right and weakness', async ({ page }) => {
        const records = [
            { qid: 'a', picked: 1, correct: false, ms: 30000, probe: 'concept' },
            { qid: 'b', picked: 1, correct: false, ms: 30000, probe: 'concept' },
            { qid: 'c', picked: 1, correct: true, ms: 30000, probe: 'guessed' },
            { qid: 'd', picked: 1, correct: false, ms: 90000, probe: 'application' },
            { qid: 'e', picked: 1, correct: true, ms: 30000, probe: 'sure' },
        ];
        const ids = await (async () => {
            await open(page);
            return page.evaluate((k) => (window as any).EP_POOL.chapters.find((c: any) => c.key === k).verified_ids, OPEN_KEY) as Promise<string[]>;
        })();
        records.forEach((r, i) => { r.qid = ids[i]; });
        await page.evaluate(([k, recs]: [string, unknown[]]) => {
            const run = { run_no: 1, seed: 1, ids: (recs as any[]).map((r) => r.qid), started_at: '2026-09-08T10:00:00Z',
                finished_at: '2026-09-08T10:06:00Z', records: recs, diagnosis: (window as any).Diag.diagnose(recs) };
            localStorage.setItem('ep_state_v1', JSON.stringify({ chapters: { [k]: { runs: [run], retries: [], streak: {}, strong_now: {} } } }));
        }, [OPEN_KEY, records] as [string, unknown[]]);
        // Run reads ep_state_v1 once at boot, so the seeded state needs a fresh boot
        // BEFORE the result route runs (a stale boot would start a new run and overwrite it).
        await page.reload();
        await page.goto(URL + `#/physics/${OPEN_KEY}/result`);
        await expect(page.locator('.ep-score')).toHaveText('2 out of 5 correct');
        await expect(page.locator('#resultBody .ep-note').first()).toHaveText('1 of them was a guess');
        await expect(page.locator('.ep-bar[data-type="concept"] .ep-bar-n')).toHaveText('2');
        await expect(page.locator('.ep-bar[data-type="application"] .ep-bar-n')).toHaveText('1');
        await expect(page.locator('.ep-bar[data-type="concept"]')).toHaveClass(/ep-bar-weak/);
        await expect(page.locator('#resultVerdict')).toContainText('not knowing the concept');
        await expect(page.locator('#resultBody .ep-note').nth(1)).toContainText('about 30 seconds a question. The exam gives 67.5 s.');
    });

    test('the page holds no solution byte, and fewer than two wrong answers name no weakness', async ({ page }) => {
        await open(page);
        const html = await page.content();
        expect(html).not.toContain(STEP_TEXT);
        expect(html).not.toContain('"why_this_step"');
        const anySolution = await page.evaluate(() => Object.values((window as any).EP_POOL.questions).some((q: any) => q.solution));
        expect(anySolution).toBe(false);
        await page.goto(URL + `#/physics/${OPEN_KEY}`);
        await playRun(page, [[true, 'sure'], [true, 'sure'], [false, 'time'], [true, 'sure'], [true, 'sure'],
            [true, 'sure'], [true, 'sure'], [true, 'sure'], [true, 'sure'], [true, 'sure']]);
        await expect(page.locator('#resultVerdict')).toContainText('no weakness to name yet');
        await expect(page.locator('.ep-bars')).toHaveCount(1);
    });

    test('a mid-run reload resumes at the same question, with the probe still owed', async ({ page }) => {
        await open(page, `#/physics/${OPEN_KEY}`);
        await playRun(page, SCRIPT.slice(0, 3));
        const { qid, answer } = await currentCard(page);
        await page.locator('.ep-card[data-qid]').last().locator(`.ep-opt[data-option="${answer}"]`).click();
        await expect(page.locator('#runChips .ep-chip')).toHaveCount(2);
        await page.reload();
        await expect(page.locator('.ep-msg.tutor').nth(1)).toContainText('continues from where you stopped');
        await expect(page.locator('#runChips .ep-chip')).toHaveCount(2);
        await page.locator('#runChips .ep-chip[data-probe="sure"]').click();
        const next = await currentCard(page);
        expect(next.qid).not.toBe(qid);
        await expect(page.locator('.ep-card .ep-progress').last()).toHaveText('Question 5 of 10');
        const state = await page.evaluate(() => JSON.parse(localStorage.getItem('ep_state_v1')!));
        expect(state.chapters[OPEN_KEY].runs).toHaveLength(1);
        expect(state.chapters[OPEN_KEY].runs[0].records[3]).toMatchObject({ qid, correct: true, probe: 'sure' });
    });

    test('a second run is a fresh draw that avoids the previous run', async ({ page }) => {
        await open(page, `#/physics/${OPEN_KEY}`);
        const first = await playRun(page);
        await page.click('#btnRunAgain');
        await expect(page.locator('#runView')).toBeVisible();
        const second = await playRun(page);
        const state = await page.evaluate(() => JSON.parse(localStorage.getItem('ep_state_v1')!));
        expect(state.chapters[OPEN_KEY].runs).toHaveLength(2);
        expect(state.chapters[OPEN_KEY].runs[1].run_no).toBe(2);
        // 13 verified, 10 drawn: the three the first run never showed come first
        const unseen = second.filter((id) => !first.includes(id));
        expect(unseen.length).toBe(3);
    });

    test('three correct-and-sure siblings flip strong now; one wrong retry resets the streak', async ({ page }) => {
        await open(page, `#/physics/${OPEN_KEY}`);
        await playRun(page);
        const flip = await page.evaluate((k) => {
            const w = window as any;
            const ch = w.Data.chapter(k);
            const from = w.Run.lastFinished(k).diagnosis.wrong_ids[0];
            const out: any = {};
            let seen = w.Run.seenIds(k);
            for (let i = 0; i < 3; i++) {
                const sib = w.Data.sibling(from, ch, seen);
                out['streak' + i] = w.Run.retry(k, from, 'calculation', sib, 1, true, 'sure', 5000);
                seen = w.Run.seenIds(k);
            }
            out.badge = w.Run.badge(k);
            out.after_wrong = w.Run.retry(k, from, 'calculation', w.Data.sibling(from, ch, seen), 2, false, 'concept', 5000);
            out.strong_kept = w.Run.chapterState(k).strong_now.calculation;
            out.guessed_counts = w.Run.retry(k, from, 'guessed', w.Data.sibling(from, ch, w.Run.seenIds(k)), 1, true, 'sure', 5000);
            return out;
        }, OPEN_KEY);
        expect([flip.streak0, flip.streak1, flip.streak2]).toEqual([1, 2, 3]);
        expect(flip.badge).toEqual({ kind: 'strong', type: 'calculation' });
        expect(flip.after_wrong).toBe(0);
        expect(flip.strong_kept).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(flip.guessed_counts).toBeNull();
        await page.goto(URL + '#/physics');
        await expect(page.locator(`.ep-row[data-chapter="${OPEN_KEY}"] .ep-badge`)).toHaveText('Strong now: calculation');
    });
});
