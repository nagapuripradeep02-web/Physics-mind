/**
 * eapcet_learn.spec.ts — the tab bar and the classroom, on the offline build
 * with the fixture pool and the fixture learn pack (e2e/eapcet_helpers.ts).
 *
 * What is asserted: the bar shows on the section routes and never on the
 * door; the alias; one lesson end to end (card, sample tag, check, three
 * practice questions by the right route → green, the feel recorded, the
 * green date stored, the chapter row reading "learned, not tested yet");
 * a wrong route ends the pass and shows the pack's fix, the retry goes
 * green; an unknown lesson redirects with a toast; a chapter without a pack
 * shows the empty page; the result hub's three actions and where "Learn
 * this" lands. The page makes zero requests throughout.
 */
import { test, expect } from '@playwright/test';
import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
    OPEN_KEY, PLAIN_KEY, LEARN_LINE, LEARN_CHECK_STEM, LEARN_FIX, LEARN_SUBS,
    fixture, watchRequests, installClock, open, currentLearnCard, pickFor, playRun, writeLearnDir, type Intent,
} from './eapcet_helpers';

const ROOT = process.cwd();
const OUT = join(ROOT, 'eapcet-app', 'dist-e2e-learn');
const DIST = join(OUT, 'index.html');
const URL = 'file:///' + DIST.replace(/\\/g, '/');

test.beforeAll(() => {
    mkdirSync(OUT, { recursive: true });
    const pool = join(OUT, 'fixture_release.json');
    writeFileSync(pool, JSON.stringify(fixture()));
    const learn = writeLearnDir(join(OUT, 'learn'));
    execFileSync('npx', ['tsx', 'src/scripts/build_eapcet_app.ts', `--pool=${pool}`, `--out=${OUT}`, `--learn=${learn}`], { cwd: ROOT, stdio: 'pipe', shell: true });
    if (!existsSync(DIST)) throw new Error('the learn e2e build produced no index.html');
});

/** The practice card on screen: the LAST one — a retry asks the same question
    again (one variant per slot in the fixture), so the id alone is ambiguous. */
function lastCard(page: import('@playwright/test').Page) {
    return page.locator('#learnThread .ep-card[data-qid]').last();
}
/** Answer the practice card on screen by the right route; returns its id. */
async function solid(page: import('@playwright/test').Page): Promise<string> {
    const q = await currentLearnCard(page);
    await lastCard(page).locator(`.ep-opt[data-option="${q.answer}"]`).click();
    await expect(page.locator('#learnChips .ep-chip')).toHaveCount(5);       // r, m0, m1, m2, guess
    await page.locator('#learnChips .ep-chip[data-route="r"]').click();
    return q.id;
}

test.describe('EAPCET — the tab bar and the classroom', () => {
    test('the tab bar is hidden on the door, shown on the sections with the right tab active; the weakness alias', async ({ page }) => {
        const seen = watchRequests(page);
        await open(page, URL);
        await expect(page.locator('#tabbar')).toBeHidden();
        await expect(page.locator('body')).not.toHaveClass(/ep-has-tabbar/);
        await expect(page.locator('.ep-tile[data-subject="physics"] .ep-tile-line')).toContainText('Lessons for 1 chapter so far.');
        await page.click('.ep-tile[data-subject="physics"]');
        await expect(page.locator('#chaptersView')).toBeVisible();
        await expect(page.locator('#chaptersTitle')).toHaveText('Find your weakness');
        const bar = page.locator('#tabbar');
        await expect(bar).toBeVisible();
        await expect(page.locator('body')).toHaveClass(/ep-has-tabbar/);
        await expect(bar.locator('.ep-tab')).toHaveCount(3);
        await expect(bar.locator('.ep-tab[data-tab="learn"]')).toHaveAttribute('href', '#/physics/learn');
        await expect(bar.locator('.ep-tab[data-tab="weakness"]')).toHaveAttribute('href', '#/physics');
        await expect(bar.locator('.ep-tab[data-tab="solutions"]')).toHaveAttribute('href', '#/physics/solutions');
        await expect(bar.locator('.ep-tab[aria-current="page"]')).toHaveAttribute('data-tab', 'weakness');
        await bar.locator('.ep-tab[data-tab="learn"]').click();
        await expect(page.locator('#learnView')).toBeVisible();
        await expect(page.locator('#learnBody h1')).toHaveText('Learn and practice');
        await expect(bar.locator('.ep-tab[aria-current="page"]')).toHaveAttribute('data-tab', 'learn');
        await expect(page.locator('#btnBack')).toHaveText('← Subjects');
        await page.goto(URL + '#/physics/weakness');
        await expect.poll(() => page.evaluate(() => location.hash)).toBe('#/physics');
        await expect(page.locator('#chaptersView')).toBeVisible();
        await page.goto(URL + '#/');
        await expect(page.locator('#tabbar')).toBeHidden();
        expect(seen).toEqual([]);
    });

    test('one lesson end to end: card, check, three right by the right route, green, the feel recorded, the chapter row learned', async ({ page }) => {
        const seen = watchRequests(page);
        await installClock(page);
        const sub = LEARN_SUBS[0];
        await open(page, URL, `#/physics/learn/${OPEN_KEY}/${sub}`);
        await expect(page.locator('#subtopicView')).toBeVisible();
        await expect(page.locator('#subBody h1')).toHaveText('Work from a constant force');
        await expect(page.locator('#subBody .ep-eyebrow')).toHaveText('Topic 1 · Work');
        await expect(page.locator('.ep-sample-tag')).toHaveText('Sample · not yet reviewed');
        await expect(page.locator('#subPill')).toHaveText('Not started');
        await expect(page.locator('#btnBack')).toHaveText('← Work Power Energy');
        await expect(page.locator('#conceptCard')).toContainText(LEARN_LINE);
        await expect(page.locator('#conceptCard .ep-concept-formula')).toHaveText('W = F × s');
        await expect(page.locator('#conceptCard .ep-concept-answer')).toHaveText('Answer: 10 J');
        await expect(page.locator('#learnChips .ep-chip')).toHaveText(['Check it']);
        await page.locator('#learnChips .ep-chip[data-route="check"]').click();
        await expect(page.locator('#checkCard .ep-stem')).toHaveText(LEARN_CHECK_STEM);
        await expect(page.locator('#checkCard .ep-opt')).toHaveCount(3);
        await page.locator('#checkCard .ep-opt[data-option="2"]').click();
        await expect(page.locator('#checkWhy')).toContainText('Right. No displacement along that force means no work by it.');
        await expect(page.locator('#subPill')).toHaveText('Started');
        await expect(page.locator('#learnChips .ep-chip')).toHaveText(['Apply it', 'Read the card again']);
        await page.locator('#learnChips .ep-chip[data-route="apply"]').click();
        await expect(page.locator('#learnThread .ep-msg.tutor').last()).toHaveText('Three practice questions, each a little harder. After each one, tell which way you went.');
        for (let i = 1; i <= 3; i++) {
            await expect(page.locator('#learnThread .ep-card[data-qid]').last().locator('.ep-progress')).toHaveText(`Practice ${i} of 3`);
            const id = await solid(page);
            expect(id).toBe(`lq_${OPEN_KEY}_${sub}_0${i}`);
        }
        await expect(page.locator('#greenCard .ep-green-title')).toHaveText('Done. Three right by the right route.');
        await expect(page.locator('#greenCard')).toContainText('Real exam questions are in Weakness.');
        await expect(page.locator('#subPill')).toHaveText('Done');
        await expect(page.locator('#learnThread .ep-msg.tutor').last()).toHaveText('How do you feel about this idea?');
        await expect(page.locator('#learnChips .ep-chip')).toHaveText(['Confident', 'Not yet']);
        await page.locator('#learnChips .ep-chip[data-route="confident"]').click();
        await expect(page.locator('#learnThread .ep-msg.tutor').last()).toHaveText('Recorded. This does not change any result.');
        await expect(page.locator('#learnChips .ep-chip')).toHaveText(['Next lesson', 'Test this chapter in Weakness', 'All lessons in this chapter']);
        const stored = await page.evaluate((s) => JSON.parse(localStorage.getItem('ep_state_v1') || '{}').learn[s], sub);
        expect(stored.green_at).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(stored.feel).toBe('confident');
        expect(stored.pass).toBeNull();
        expect(stored.passes).toHaveLength(1);
        expect(stored.passes[0]).toMatchObject({ n: 3, outcome: 'green' });
        expect(stored.check).toMatchObject({ picked: 2, correct: true });
        // A page that never mentions readiness.
        const text = (await page.locator('#subtopicView').innerText()).toLowerCase();
        expect(text).not.toMatch(/exam ready|mastered|\bready\b/);

        // Next lesson lands on the next not-green one; the chapter page and the two lists say what happened.
        await page.locator('#learnChips .ep-chip[data-route="next"]').click();
        await expect.poll(() => page.evaluate(() => location.hash)).toBe(`#/physics/learn/${OPEN_KEY}/${LEARN_SUBS[1]}`);
        await page.goto(URL + `#/physics/learn/${OPEN_KEY}`);
        await expect(page.locator('#learnProgress')).toHaveText('1 of 4 lessons done');
        await expect(page.locator(`.ep-sub-row[data-sub="${sub}"]`)).toHaveAttribute('data-state', 'green');
        await expect(page.locator(`.ep-sub-row[data-sub="${sub}"] .ep-mpill`)).toHaveText('Done');
        await expect(page.locator(`.ep-sub-row[data-sub="${LEARN_SUBS[1]}"] .ep-tag-next`)).toHaveText('Next');
        await expect(page.locator('.ep-sample')).toBeVisible();
        await page.goto(URL + '#/physics/learn');
        await expect(page.locator(`.ep-row[data-chapter="${OPEN_KEY}"] .ep-badge`)).toHaveText('1 of 4 done');
        await expect(page.locator(`.ep-row[data-chapter="${PLAIN_KEY}"] .ep-badge`)).toHaveText('No lessons yet');
        await expect(page.locator(`.ep-row[data-chapter="${PLAIN_KEY}"]`)).not.toHaveAttribute('href', /.*/);
        await page.goto(URL + '#/physics');
        const row = page.locator(`.ep-row[data-chapter="${OPEN_KEY}"]`);
        await expect(row.locator('.ep-badge')).toHaveText('Not tested yet');
        await expect(row.locator('.ep-mastery-seg')).toHaveCount(3);
        await expect(row.locator('.ep-mastery-seg[data-shape="work_from_force"]')).toHaveAttribute('data-state', 'learned');
        await expect(row.locator('.ep-mastery-sum')).toHaveText('1 learned, not tested yet · 2 not tried');
        expect(seen).toEqual([]);
    });

    test('a wrong route ends the pass and shows the fix; the three start again and go green', async ({ page }) => {
        await installClock(page);
        const sub = LEARN_SUBS[2];
        await open(page, URL, `#/physics/learn/${OPEN_KEY}/${sub}`);
        await page.locator('#learnChips .ep-chip[data-route="check"]').click();
        await page.locator('#checkCard .ep-opt[data-option="1"]').click();
        await expect(page.locator('#checkWhy')).toContainText('Not this one. Only the part of the force along the motion does work.');
        await page.locator('#learnChips .ep-chip[data-route="apply"]').click();
        await solid(page);
        // Question 2: the application-labelled option by its own route.
        const q = await currentLearnCard(page);
        const app = pickFor(q, 'app');
        const route = (q.routes || []).find((r) => r.option === app)!.id;
        await lastCard(page).locator(`.ep-opt[data-option="${app}"]`).click();
        await expect(page.locator('#learnThread .ep-msg.tutor').last()).toContainText(`You picked (${app}). The key says (${q.answer}). Which way did you go?`);
        await page.locator(`#learnChips .ep-chip[data-route="${route}"]`).click();
        await expect(page.locator('#learnThread .ep-lfix .ep-lfix-text')).toHaveText('Multiply the two numbers; do not divide them.');
        await expect(page.locator('#learnThread .ep-msg.tutor').last()).toHaveText('The three start again after a wrong answer. Read the fix, then try again.');
        await expect(page.locator('#subPill')).toHaveText('Started');
        await expect(page.locator('#learnChips .ep-chip')).toHaveText(['Try the three again', 'Read the card again', 'All lessons in this chapter']);
        let stored = await page.evaluate((s) => JSON.parse(localStorage.getItem('ep_state_v1') || '{}').learn[s], sub);
        expect(stored.passes).toHaveLength(1);
        expect(stored.passes[0]).toMatchObject({ n: 2, outcome: 'ended' });
        expect(stored.green_at).toBeNull();
        await page.locator('#learnChips .ep-chip[data-route="retry"]').click();
        for (let i = 1; i <= 3; i++) {
            await expect(page.locator('#learnThread .ep-card[data-qid]').last().locator('.ep-progress')).toHaveText(`Practice ${i} of 3`);
            await solid(page);
        }
        await expect(page.locator('#greenCard')).toBeVisible();
        await page.locator('#learnChips .ep-chip[data-route="not_yet"]').click();
        stored = await page.evaluate((s) => JSON.parse(localStorage.getItem('ep_state_v1') || '{}').learn[s], sub);
        expect(stored.passes.map((p: { outcome: string }) => p.outcome)).toEqual(['ended', 'green']);
        expect(stored.feel).toBe('not_yet');
        // Green is sticky: reopening shows the card, the settled check and the green note.
        await page.reload();
        await page.waitForSelector('main');
        await expect(page.locator('#subPill')).toHaveText('Done');
        await expect(page.locator('#checkCard .ep-opt[data-option="1"]')).toHaveClass(/wrong/);
        await expect(page.locator('#greenCard')).toBeVisible();
        await expect(page.locator('#learnChips .ep-chip')).toHaveText(['Apply it', 'Read the card again']);
    });

    test('a lesson left mid-pass resumes at the owed route', async ({ page }) => {
        await installClock(page);
        const sub = LEARN_SUBS[3];
        await open(page, URL, `#/physics/learn/${OPEN_KEY}/${sub}`);
        await page.locator('#learnChips .ep-chip[data-route="check"]').click();
        await page.locator('#checkCard .ep-opt[data-option="2"]').click();
        await page.locator('#learnChips .ep-chip[data-route="apply"]').click();
        await solid(page);
        const q = await currentLearnCard(page);
        await lastCard(page).locator(`.ep-opt[data-option="${q.answer}"]`).click();
        await page.reload();
        await page.waitForSelector('main');
        await expect(page.locator('#learnThread .ep-msg.tutor').nth(1)).toHaveText('You left this lesson in the middle. It continues from where you stopped.');
        await expect(page.locator('#learnThread .ep-card[data-qid]')).toHaveCount(2);
        await expect(page.locator('#learnChips .ep-chip')).toHaveCount(5);
        await page.locator('#learnChips .ep-chip[data-route="r"]').click();
        await expect(page.locator('#learnThread .ep-card[data-qid]').last().locator('.ep-progress')).toHaveText('Practice 3 of 3');
    });

    test('an unknown lesson redirects to the chapter with a toast; a chapter without a pack shows the empty page', async ({ page }) => {
        await open(page, URL, `#/physics/learn/${OPEN_KEY}/no_such_lesson`);
        await expect.poll(() => page.evaluate(() => location.hash)).toBe(`#/physics/learn/${OPEN_KEY}`);
        await expect(page.locator('#toast')).toHaveText('That lesson is not in this chapter.');
        await expect(page.locator('#learnBody h1')).toHaveText('Work Power Energy');
        await page.goto(URL + `#/physics/learn/${PLAIN_KEY}`);
        await expect(page.locator('#learnBody .ep-empty')).toContainText('Lessons for this chapter are not written yet.');
        await expect(page.locator('#learnBody .ep-empty .ep-chip')).toHaveAttribute('href', `#/physics/${PLAIN_KEY}`);
        await expect(page.locator('#btnBack')).toHaveText('← Lessons');
    });

    test('the result is a hub: fix this, learn this (the first fix shape\'s lesson), ask; the shapes carry pills and learn links', async ({ page }) => {
        await installClock(page);
        await open(page, URL, `#/physics/${OPEN_KEY}`);
        const script: Intent[] = ['solid', 'wrong_route', 'solid', 'slip', 'solid', 'solid', 'guess_right', 'solid', 'solid', 'solid'];
        await playRun(page, script);
        await expect(page.locator('#resultView')).toBeVisible();
        const hub = page.locator('#resultHub');
        await expect(hub.locator('.ep-hub-btn')).toHaveCount(3);
        const firstFix = await page.evaluate((k) => {
            const w = window as any;
            const d = w.Run.diagnosisOf(w.Run.lastFinished(k));
            const f = d.shapes.find((s: { status: string }) => s.status === 'fix');
            return { key: f.key, qid: f.qids[0] };
        }, OPEN_KEY);
        await expect(hub.locator('[data-hub="fix"]')).toHaveAttribute('href', `#/physics/${OPEN_KEY}/fix/${firstFix.qid}`);
        await expect(hub.locator('[data-hub="fix"] .ep-hub-title')).toHaveText('Fix this');
        await expect(hub.locator('[data-hub="learn"]')).toHaveAttribute('href', `#/physics/learn/${OPEN_KEY}/${firstFix.key}`);
        await expect(hub.locator('[data-hub="ask"]')).toHaveAttribute('href', `#/physics/solutions/${OPEN_KEY}`);
        await expect(page.locator('.ep-shape-head .ep-mpill')).toHaveCount(3);
        await expect(page.locator('.ep-shape-head .ep-learn-btn')).toHaveCount(3);
        await expect(page.locator(`.ep-shape[data-shape="${firstFix.key}"] .ep-mpill`)).toHaveText('To fix');
        await expect(page.locator('#btnRunAgain')).toHaveClass(/btn-primary/);
        await hub.locator('[data-hub="learn"]').click();
        await expect(page.locator('#subtopicView')).toBeVisible();
        await expect(page.locator('#btnBack')).toHaveText('← Work Power Energy');
        await expect(page.locator('#resultView')).toBeHidden();
        expect(await page.locator('#resultView .ep-shape-item').count()).toBe(0);    // cleared on leave
        // The chapter page tags the lesson whose shape the run found weak.
        await page.goto(URL + `#/physics/learn/${OPEN_KEY}`);
        await expect(page.locator(`.ep-sub-row[data-sub="${firstFix.key}"] .ep-tag-fix`)).toHaveText('To fix in Weakness');
        // The chapter list carries the run's shapes and the badge is unchanged.
        await page.goto(URL + '#/physics');
        const row = page.locator(`.ep-row[data-chapter="${OPEN_KEY}"]`);
        await expect(row.locator(`.ep-mastery-seg[data-shape="${firstFix.key}"]`)).toHaveAttribute('data-state', 'fix');
        await expect(row.locator('.ep-mastery-sum')).toContainText('to fix');
    });
});
