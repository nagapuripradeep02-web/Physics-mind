/**
 * eapcet_review.spec.ts — "I tried, here is my work": the reviewer in the
 * Solutions tab, against a faked ep-solve and a faked ep-review.
 *
 * Three builds. (A) hosted with EP_SOLVE_BASE and EP_REVIEW_BASE: the chip is
 * offered, the final answer is typed, the working photo is sent, the question
 * is solved in the background first (solve → confirm when the answer was
 * checked once), and the verdict card renders with its chips. The request
 * shapes are the contract: the review body carries the fingerprint, the typed
 * final, the attempt number and the SECOND image, never a solve field.
 * Attempts advance only on ok replies; a typed value for an unreadable line
 * keeps the same attempt; the third verdict ends in the full solution card.
 * (B) hosted with EP_SOLVE_BASE only: the chip is not offered and nothing
 * changes from today. (C) offline: the three original chips and the
 * not-available card, zero requests.
 *
 * Fonts and cdnjs (KaTeX) are aborted so the test is hermetic; the cards keep
 * their plain text. Two different PNGs (a 4×4 question, a 1×1 working) prove
 * the review carried the working, not the question.
 */
import { test, expect, type Page } from '@playwright/test';
import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { OPEN_KEY, STEP_TEXT, fixture, watchRequests, open, writeLearnDir } from './eapcet_helpers';

const ROOT = process.cwd();
const OUT_A = join(ROOT, 'eapcet-app', 'dist-e2e-review');
const OUT_B = join(ROOT, 'eapcet-app', 'dist-e2e-review-nobase');
const OUT_C = join(ROOT, 'eapcet-app', 'dist-e2e-review-offline');
const url = (out: string) => 'file:///' + join(out, 'index.html').replace(/\\/g, '/');
const STATE = 'https://ep.test/state';
const CHAT = 'https://ep.test/chat';
const PAY = 'https://ep.test/pay';
const SOLVE = 'https://ep.test/solve';
const REVIEW = 'https://ep.test/review';
const SKU = { sku: 'eapcet_physics_month', label: 'EAPCET Physics', price_inr: 399, list_price_inr: 399,
    founding: false, founding_locked: false, founding_slots_left: null, period_days: 31 };
const CORS = { 'access-control-allow-origin': '*', 'content-type': 'application/json' };
const FP = '0123456789abcdef'.repeat(4);
// a 4×4 PNG (opaque): the question. The page downsizes to JPEG before it sends.
const PNG_Q = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAFklEQVR4nGP8z8DAwMDAxAAFDAwMAB0nAQNZbCA9AAAAAElFTkSuQmCC', 'base64');
// a 1×1 PNG: the working. A different image, so the review's base64 differs from the solve's.
const PNG_W = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

const CHIPS_PHOTO = ['Take a photo', 'Pick from gallery'];
const FORBIDDEN = /why_this_step|approach|common_mistakes|right_route|mistake_type_hint|working|question_text/;
const REVIEW_KEYS = ['action', 'fingerprint', 'typed_final', 'attempt_no', 'image', 'media_type', 'typed_value_at_line', 'device_id', 'session_id', 'internal', 'access_token'];

const WORKING = [{ text: 'v = 2t', tex: 'v = 2t', kind: 'line' }, { text: 'W = 24 J', tex: 'W = 24\\,\\text{J}', kind: 'line' }];
function solved(label: 'once' | 'two_ways' | 'unsure', questionText: string) {
    const base = { ok: true, source: 'model', label, option: 4, answer: '24 J', answer_tex: null, format: 'lines_v1', working: WORKING, working_alt: null,
        syllabus: 'within', question_text: questionText, options: ['32 J', '3.8 J', '5.2 J', '24 J'], subject: 'physics', has_figure: false,
        route: 'text', fingerprint: FP, cost_usd: 0.002, ms: 900 };
    return label === 'unsure' ? { ...base, option: null, answer: null, working_alt: { steps: WORKING } } : base;
}
const LINE3 = { n: 3, text: '2 × 3 = 5', tex: '2 \\times 3 = 5' };
const TRANSCRIPT = [
    { n: 1, text: 's = t³/3', tex: 's = t^3/3', kind: 'equation', legible: 0.9 },
    { n: 2, text: 'v = t²', tex: 'v = t^2', kind: 'equation', legible: 0.9 },
    { ...LINE3, kind: 'equation', legible: 0.8 },
];
function verdict(v: 'CORRECT' | 'ERROR' | 'UNSURE', extra: Record<string, unknown>) {
    return { ok: true, verdict: v, first_error_line: null, error_class: null, what_should_be: null, concept_tag: null, evidence_line: null,
        transcript: TRANSCRIPT, final_value_read: '24 J', final_matches_key: true, judges_ran: ['B'], escalated: false, escalation_reason: null,
        ask: null, ask_line: null, method: null, attempt_no: 1, review_id: 500, reads_left: 19, cost_usd: 0.004, ms: 8000, ...extra };
}
const ERROR = (attempt: number, id: number) => verdict('ERROR', {
    first_error_line: 3, error_class: 'calculation', what_should_be: '2 × 3 = 6', concept_tag: 'arithmetic', evidence_line: LINE3,
    final_matches_key: false, attempt_no: attempt, review_id: id,
});
const CORRECT = (attempt: number, id: number) => verdict('CORRECT', {
    method: 'Work equals the change in kinetic energy.', attempt_no: attempt, review_id: id,
});
const UNSURE_VALUE = (attempt: number, id: number) => verdict('UNSURE', {
    ask: 'type_value_at_line', ask_line: 3, final_value_read: null, final_matches_key: false, attempt_no: attempt, review_id: id,
});

interface Fake { unlocked: boolean; posts: Array<{ url: string; body: any }>; solve: any; confirm: any; reviews: any[] }

function build(out: string, mode: 'review' | 'solve' | 'offline') {
    mkdirSync(out, { recursive: true });
    const pool = join(out, 'fixture_release.json');
    writeFileSync(pool, JSON.stringify(fixture()));
    const learn = writeLearnDir(join(out, 'learn'));
    const args = ['tsx', 'src/scripts/build_eapcet_app.ts', ...(mode === 'offline' ? [] : ['--hosted']), `--pool=${pool}`, `--out=${out}`, `--learn=${learn}`];
    execFileSync('npx', args, {
        cwd: ROOT, stdio: 'pipe', shell: true,
        env: { ...process.env, EP_CHAT_BASE: CHAT, EP_STATE_BASE: STATE, EP_PAY_BASE: PAY, EP_PHOTO_BASE: '', EP_AUTH_BASE: '', EP_AUTH_ANON: '', EP_STAFF_WORD: '',
            EP_SOLVE_BASE: mode === 'offline' ? '' : SOLVE, EP_REVIEW_BASE: mode === 'review' ? REVIEW : '' },
    });
    if (!existsSync(join(out, 'index.html'))) throw new Error(`the review e2e build (${mode}) produced no index.html`);
}

async function wire(page: Page, fake: Fake): Promise<void> {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
    await page.route(/cdnjs\.cloudflare\.com/, (r) => r.abort());
    const standing = () => ({ unlocked: fake.unlocked, paid_until: fake.unlocked ? '2026-10-10T00:00:00Z' : null, signed_in: false, devices: 1, sku: SKU });
    await page.route(STATE, async (route) => {
        const body = JSON.parse(route.request().postData() || '{}');
        fake.posts.push({ url: STATE, body });
        if (body.action === 'standing') return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ ok: true, ...standing() }) });
        if (body.action === 'bundle') {
            if (!fake.unlocked) return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ ok: true, locked: true, sku: SKU }) });
            const f = fixture();
            const solutions: Record<string, unknown> = {};
            for (const q of Object.values(f.questions) as any[]) {
                if (q.chapter_key === body.chapter_key && q.solution) solutions[q.id] = { solution: q.solution, grounding: [] };
            }
            return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ ok: true, unlocked: true, chapter_key: body.chapter_key, solutions }) });
        }
        return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ ok: true, chapters: {}, server_time: new Date().toISOString(), internal: false, standing: standing() }) });
    });
    await page.route(CHAT, async (route) => {
        const body = JSON.parse(route.request().postData() || '{}');
        fake.posts.push({ url: CHAT, body });
        return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify(body.type === 'events' ? { ok: true } : { reply: 'ok', questions_left: 39 }) });
    });
    await page.route(PAY, (route) => route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ ok: true, url: 'https://rzp.test/l/abc', price: SKU }) }));
    await page.route(SOLVE, async (route) => {
        const body = JSON.parse(route.request().postData() || '{}');
        fake.posts.push({ url: SOLVE, body });
        if (body.action === 'report') return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ ok: true }) });
        if (!fake.unlocked) return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ locked: true }) });
        if (body.action === 'confirm') return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify(fake.confirm) });
        return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify(fake.solve) });
    });
    await page.route(REVIEW, async (route) => {
        const body = JSON.parse(route.request().postData() || '{}');
        fake.posts.push({ url: REVIEW, body });
        if (body.action === 'dispute') return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ ok: true }) });
        if (!fake.unlocked) return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ locked: true }) });
        const next = fake.reviews.shift() || { ok: false, reason: 'down' };
        return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify(next) });
    });
}

/** The first eight words of the first verified question of OPEN_KEY, and its id. */
async function firstWords(page: Page): Promise<{ qid: string; text: string }> {
    return await page.evaluate((k) => {
        const w = window as any;
        const ch = w.EP_POOL.chapters.find((c: { key: string }) => c.key === k);
        const qid = ch.verified_ids[0];
        return { qid, text: w.EP_POOL.questions[qid].question_en.split(' ').slice(0, 8).join(' ') };
    }, OPEN_KEY);
}
const lastTutor = (page: Page) => page.locator('#solThread .ep-sol-msg.tutor .ep-sol-text').last();
const lastStudent = (page: Page) => page.locator('#solThread .ep-sol-msg.student .ep-sol-text').last();
const chips = (page: Page) => page.locator('#solChips .ep-chip');
const postsTo = (fake: Fake, u: string, action?: string) => fake.posts.filter((p) => p.url === u && (!action || p.body.action === action));
async function sendQuestion(page: Page) { await page.locator('#solCamera').setInputFiles({ name: 'problem.png', mimeType: 'image/png', buffer: PNG_Q }); }
async function sendWorking(page: Page) { await page.locator('#solGallery').setInputFiles({ name: 'working.png', mimeType: 'image/png', buffer: PNG_W }); }

/** Question photo → "I tried" → the typed final → the working photo. */
async function throughToWorking(page: Page, typedFinal: string) {
    await sendQuestion(page);
    await expect(lastTutor(page)).toHaveText('What do you want for this one?');
    await expect(chips(page)).toHaveText(['I tried, here is my work', 'Solve it', 'Explain each step']);
    await page.locator('#solChips .ep-chip[data-route="tried"]').click();
    await expect(lastStudent(page)).toHaveText('I tried, here is my work');
    await expect(lastTutor(page)).toHaveText('First, your final answer. Type it in the box below, with its unit. If you have none yet, say so.');
    await expect(page.locator('#solInput')).toHaveAttribute('placeholder', 'Your final answer, with its unit');
    await expect(chips(page)).toHaveText(['I have no answer yet']);
    await page.locator('#solInput').fill(typedFinal);
    await page.locator('#solSend').click();
    await expect(lastStudent(page)).toHaveText(typedFinal);
    await expect(lastTutor(page)).toHaveText('Now take a photo of your working. One page, the whole page in the frame, in good light.');
    await expect(chips(page)).toHaveText(CHIPS_PHOTO);
    await expect(page.locator('#solInput')).toHaveAttribute('placeholder', 'Or type the question here');
    await sendWorking(page);
    await expect(page.locator('#solThread .ep-photo')).toHaveCount(2);
    await expect(page.locator('#solThread .ep-photo').nth(1).locator('.ep-photo-cap')).toHaveText('Your working. It is sent once to be checked, then dropped. It is not stored.');
}

test.describe('EAPCET — I tried, here is my work (hosted, solver and reviewer on)', () => {
    test.beforeAll(() => build(OUT_A, 'review'));

    test('ERROR then CORRECT: the typed final, the post order, the request shapes, the cards, the chips, the similar question', async ({ page }) => {
        const fake: Fake = { unlocked: true, posts: [], solve: null, confirm: null, reviews: [ERROR(1, 501), CORRECT(2, 502)] };
        await wire(page, fake);
        await open(page, url(OUT_A), '#/physics/solutions');
        await expect(chips(page)).toHaveText(CHIPS_PHOTO);
        const { qid, text } = await firstWords(page);
        fake.solve = solved('once', text);
        fake.confirm = { ...solved('two_ways', text), source: 'confirm' };

        await throughToWorking(page, '24 J');
        const error = page.locator('.ep-review[data-verdict="error"]');
        await expect(error).toBeVisible();

        // the post order: solve, confirm (the answer was checked once), review
        const seq = fake.posts.filter((p) => p.url === SOLVE || p.url === REVIEW).map((p) => `${p.url === SOLVE ? 'solve' : 'review'}:${p.body.action}`);
        expect(seq).toEqual(['solve:solve', 'solve:confirm', 'review:review']);
        const solve = postsTo(fake, SOLVE, 'solve')[0].body;
        expect(solve).toMatchObject({ action: 'solve', ask: 'solve', media_type: 'image/jpeg' });
        expect(solve.image).toMatch(/^[A-Za-z0-9+/=]+$/);
        const confirm = postsTo(fake, SOLVE, 'confirm')[0].body;
        expect(confirm).toMatchObject({ action: 'confirm', fingerprint: FP });
        expect(confirm.image).toBeUndefined();
        const review = postsTo(fake, REVIEW, 'review')[0].body;
        expect(review).toMatchObject({ action: 'review', fingerprint: FP, typed_final: '24 J', attempt_no: 1, media_type: 'image/jpeg' });
        expect(review.image).toMatch(/^[A-Za-z0-9+/=]+$/);
        expect(review.image).not.toBe(solve.image);                       // the working, not the question
        expect(review.typed_value_at_line).toBeUndefined();
        for (const k of Object.keys(review)) expect(REVIEW_KEYS, `review body key ${k}`).toContain(k);
        expect(JSON.stringify(review)).not.toMatch(FORBIDDEN);
        expect(JSON.stringify(review)).not.toContain(STEP_TEXT);
        expect(await page.locator('#solThread .ep-solve').count()).toBe(0);   // the hidden solve shows no card

        // the error card: the line, the student's own line flagged, what should be there, the class, the attempt, the dispute button
        await expect(error.locator('.ep-eyebrow')).toHaveText('One line to fix');
        await expect(error.locator('.ep-h3').nth(0)).toHaveText('Line 3 on your page');
        await expect(error.locator('.ep-paper').nth(0).locator('.ep-line')).toHaveText(['2 × 3 = 5']);
        await expect(error.locator('.ep-paper').nth(0).locator('.ep-line')).toHaveClass(/ep-line-flag/);
        await expect(error.locator('.ep-h3').nth(1)).toHaveText('What should be here');
        await expect(error.locator('.ep-paper').nth(1).locator('.ep-line')).toHaveText(['2 × 3 = 6']);
        await expect(error.locator('.ep-review-class')).toHaveText('Calculation: the numbers or the algebra on this line.');
        await expect(error.locator('.ep-review-attempt')).toHaveText('Attempt 1 of 3');
        await expect(error.locator('.ep-review-dispute')).toHaveText('This review is wrong? Tell us');
        await expect(error).toHaveAttribute('data-review-id', '501');
        await expect(chips(page)).toHaveText(['Fix it and send the next photo', 'Show me the full solution']);
        await expect(page.locator('#solChips .ep-chip[data-route="full"]')).toHaveClass(/ep-chip-quiet/);
        await expect(page.locator('#solThread .ep-ai-tag')).toHaveCount(0);

        // Fix it → the next photo → a second review with attempt 2, no second solve
        await page.locator('#solChips .ep-chip[data-route="next"]').click();
        await expect(lastTutor(page)).toHaveText('Fix that line, then take a photo of the page again.');
        await expect(chips(page)).toHaveText(CHIPS_PHOTO);
        await sendWorking(page);
        const correct = page.locator('.ep-review[data-verdict="correct"]');
        await expect(correct).toBeVisible();
        expect(postsTo(fake, SOLVE)).toHaveLength(2);
        const reviews = postsTo(fake, REVIEW, 'review');
        expect(reviews).toHaveLength(2);
        expect(reviews[1].body).toMatchObject({ action: 'review', fingerprint: FP, typed_final: '24 J', attempt_no: 2 });
        expect(reviews[1].body.typed_value_at_line).toBeUndefined();

        // the correct card and its chips
        await expect(correct.locator('.ep-eyebrow')).toHaveText('Correct');
        await expect(correct.locator('.ep-review-title')).toHaveText('Correct. Your working reaches the right answer.');
        await expect(correct.locator('.ep-review-body')).toHaveText(['Your method: Work equals the change in kinetic energy.', 'Your final answer, as read: 24 J.', 'It matches the key.']);
        await expect(correct.locator('.ep-review-attempt')).toHaveText('Attempt 2 of 3');
        await expect(chips(page)).toHaveText(['Similar question', 'Another question', 'Open Weakness']);
        expect(await page.locator('#solThread .ep-solve').count()).toBe(0);
        expect(await page.content()).not.toMatch(/gemini|deepseek|claude|gpt/i);

        // Similar question → the matched question's fix page
        await page.locator('#solChips .ep-chip[data-route="similar"]').click();
        await expect(page.locator('#fixView')).toBeVisible();
        await expect.poll(() => page.evaluate(() => location.hash)).toBe(`#/physics/${OPEN_KEY}/fix/${qid}`);
    });

    test('UNSURE → a typed value keeps the attempt; three verdicts end in the full solution; a dispute is filed', async ({ page }) => {
        const fake: Fake = { unlocked: true, posts: [], solve: null, confirm: null,
            reviews: [UNSURE_VALUE(1, 601), ERROR(1, 602), ERROR(2, 603), ERROR(3, 604)] };
        await wire(page, fake);
        await open(page, url(OUT_A), '#/physics/solutions');
        const { text } = await firstWords(page);
        fake.solve = solved('two_ways', text);                              // checked two ways already: no confirm

        await throughToWorking(page, '24 J');
        const unsure = page.locator('.ep-review[data-verdict="unsure"]');
        await expect(unsure).toBeVisible();
        expect(postsTo(fake, SOLVE, 'confirm')).toHaveLength(0);
        await expect(unsure.locator('.ep-eyebrow')).toHaveText('Not sure');
        await expect(unsure.locator('.ep-review-body')).toHaveText('Line 3 could not be read. Type the value you got at line 3 in the box below.');
        await expect(unsure.locator('.ep-review-attempt')).toHaveText('Attempt 1 of 3');
        await expect(page.locator('#solInput')).toHaveAttribute('placeholder', 'The value at line 3');
        await expect(chips(page)).toHaveText(['Take the photo again', 'Show me the full solution']);

        // the typed value: the same photo, the same attempt, the value at the line
        await page.locator('#solInput').fill('12');
        await page.locator('#solInput').press('Enter');
        await expect(lastStudent(page)).toHaveText('12');
        await expect(page.locator('.ep-review[data-verdict="error"]')).toHaveCount(1);
        const r = postsTo(fake, REVIEW, 'review');
        expect(r).toHaveLength(2);
        expect(r[1].body).toMatchObject({ action: 'review', fingerprint: FP, typed_final: '24 J', attempt_no: 1, typed_value_at_line: { n: 3, value: '12' } });
        expect(r[1].body.image).toBe(r[0].body.image);
        await expect(page.locator('.ep-review[data-verdict="error"]').last().locator('.ep-review-attempt')).toHaveText('Attempt 1 of 3');
        await expect(page.locator('#solInput')).toHaveAttribute('placeholder', 'Or type the question here');
        await expect(chips(page)).toHaveText(['Fix it and send the next photo', 'Show me the full solution']);

        // attempt 2
        await page.locator('#solChips .ep-chip[data-route="next"]').click();
        await sendWorking(page);
        await expect(page.locator('.ep-review[data-verdict="error"]')).toHaveCount(2);
        expect(postsTo(fake, REVIEW, 'review')[2].body).toMatchObject({ attempt_no: 2 });
        expect(postsTo(fake, REVIEW, 'review')[2].body.typed_value_at_line).toBeUndefined();
        await expect(page.locator('.ep-review').last().locator('.ep-review-attempt')).toHaveText('Attempt 2 of 3');

        // attempt 3: the verdict, then the full solution, no Fix-it chip
        await page.locator('#solChips .ep-chip[data-route="next"]').click();
        await sendWorking(page);
        await expect(page.locator('.ep-review[data-verdict="error"]')).toHaveCount(3);
        expect(postsTo(fake, REVIEW, 'review')[3].body).toMatchObject({ attempt_no: 3 });
        await expect(page.locator('.ep-review').last().locator('.ep-review-attempt')).toHaveText('Attempt 3 of 3');
        await expect(lastTutor(page)).toHaveText('That was the third attempt. Here is the full solution.');
        const card = page.locator('#solThread .ep-solve[data-label="two_ways"]');
        await expect(card).toBeVisible();
        await expect(card.locator('.ep-paper .ep-line')).toHaveText(['v = 2t', 'W = 24 J']);
        expect(await page.locator('#solChips .ep-chip[data-route="next"]').count()).toBe(0);
        expect(postsTo(fake, SOLVE)).toHaveLength(1);                        // the hidden solve, once

        // the dispute
        const dispute = page.locator('.ep-review').last().locator('.ep-review-dispute');
        await dispute.click();
        await expect(dispute).toHaveText('Noted. A teacher will check it.');
        await expect(dispute).toBeDisabled();
        expect(postsTo(fake, REVIEW, 'dispute')).toHaveLength(1);
        expect(postsTo(fake, REVIEW, 'dispute')[0].body).toMatchObject({ action: 'dispute', review_id: 604 });
        expect(postsTo(fake, REVIEW, 'dispute')[0].body.image).toBeUndefined();
    });

    test('an unverified answer ends in the honest card; Solve it still works; no review is sent', async ({ page }) => {
        const fake: Fake = { unlocked: true, posts: [], solve: null, confirm: null, reviews: [ERROR(1, 701)] };
        await wire(page, fake);
        await open(page, url(OUT_A), '#/physics/solutions');
        const { text } = await firstWords(page);
        fake.solve = solved('unsure', text);

        await throughToWorking(page, '24 J');
        const na = page.locator('#solThread .ep-na.ep-na-review');
        await expect(na).toBeVisible();
        await expect(na.locator('.ep-eyebrow')).toHaveText('Not checked');
        await expect(na.locator('.ep-na-title')).toHaveText('Your working cannot be checked for this question.');
        await expect(na.locator('.ep-na-body')).toHaveText('The answer to this question is not verified yet, so there is nothing sure to check your working against. Your working photo was dropped. Ask for the solution to see the workings.');
        expect(postsTo(fake, REVIEW)).toHaveLength(0);
        expect(postsTo(fake, SOLVE)).toHaveLength(1);
        await expect(chips(page)).toHaveText(['Solve it', 'Open Weakness']);
        await page.locator('#solChips .ep-chip[data-route="solution"]').click();
        await expect(page.locator('#solThread .ep-solve[data-label="unsure"]')).toBeVisible();
        expect(postsTo(fake, SOLVE, 'solve')).toHaveLength(2);
        expect(postsTo(fake, SOLVE, 'solve')[1].body.image).toBe(postsTo(fake, SOLVE, 'solve')[0].body.image);   // the question photo, again
        expect(postsTo(fake, REVIEW)).toHaveLength(0);
    });

    test('a locked device meets the plan note at the chip; no byte leaves the phone', async ({ page }) => {
        const fake: Fake = { unlocked: false, posts: [], solve: null, confirm: null, reviews: [] };
        await wire(page, fake);
        await open(page, url(OUT_A), '#/physics/solutions');
        await sendQuestion(page);
        await expect(chips(page)).toHaveText(['I tried, here is my work', 'Solve it', 'Explain each step']);
        await page.locator('#solChips .ep-chip[data-route="tried"]').click();
        await expect(lastTutor(page)).toHaveText('Checking a photo of your working is part of the plan.');
        await expect(page.locator('#solThread .ep-sol-unlock')).toHaveAttribute('href', '#/physics/unlock');
        await expect(chips(page)).toHaveText(['Open Weakness']);
        expect(postsTo(fake, SOLVE)).toHaveLength(0);
        expect(postsTo(fake, REVIEW)).toHaveLength(0);
    });

    test('an unreadable working photo costs no attempt: the next photo is still attempt 1', async ({ page }) => {
        const fake: Fake = { unlocked: true, posts: [], solve: null, confirm: null,
            reviews: [{ ok: false, reason: 'unreadable', reads_left: 19 }, ERROR(1, 801)] };
        await wire(page, fake);
        await open(page, url(OUT_A), '#/physics/solutions');
        const { text } = await firstWords(page);
        fake.solve = solved('two_ways', text);

        await throughToWorking(page, '24 J');
        await expect(lastTutor(page)).toHaveText('Your working could not be read from that photo. Take it again in more light, straight above the page, with the whole page in the frame.');
        await expect(chips(page)).toHaveText([...CHIPS_PHOTO, 'Open Weakness']);
        expect(await page.locator('.ep-review').count()).toBe(0);
        await sendWorking(page);
        await expect(page.locator('.ep-review[data-verdict="error"]')).toBeVisible();
        const r = postsTo(fake, REVIEW, 'review');
        expect(r).toHaveLength(2);
        expect(r[0].body.attempt_no).toBe(1);
        expect(r[1].body.attempt_no).toBe(1);
        await expect(page.locator('.ep-review .ep-review-attempt')).toHaveText('Attempt 1 of 3');
        expect(postsTo(fake, SOLVE)).toHaveLength(1);
    });
});

test.describe('EAPCET — the reviewer off (hosted, solver only)', () => {
    test.beforeAll(() => build(OUT_B, 'solve'));

    test('the chip is not offered and nothing is sent to a reviewer', async ({ page }) => {
        const fake: Fake = { unlocked: true, posts: [], solve: null, confirm: null, reviews: [] };
        await wire(page, fake);
        await open(page, url(OUT_B), '#/physics/solutions');
        expect(await page.evaluate(() => (window as any).EP_REVIEW_BASE)).toBe('');
        await sendQuestion(page);
        await expect(lastTutor(page)).toHaveText('What do you want for this one?');
        await expect(chips(page)).toHaveText(['Solve it', 'Explain each step']);
        expect(await page.locator('#solChips .ep-chip[data-route="tried"]').count()).toBe(0);
        expect(postsTo(fake, REVIEW)).toHaveLength(0);
        expect(postsTo(fake, SOLVE)).toHaveLength(0);
    });
});

test.describe('EAPCET — the reviewer off (offline)', () => {
    test.beforeAll(() => build(OUT_C, 'offline'));

    test('the three original chips lead to the not-available card and the page makes zero requests', async ({ page }) => {
        const seen = watchRequests(page);
        await open(page, url(OUT_C), '#/physics/solutions');
        await sendQuestion(page);
        await expect(chips(page)).toHaveText(['I tried, here is my work', 'I am stuck at a step', 'Just show me the solution']);
        await page.locator('#solChips .ep-chip[data-route="tried"]').click();
        await expect(lastTutor(page)).toHaveText('Take a photo of your working.');
        await sendWorking(page);
        await expect(page.locator('#solThread .ep-photo')).toHaveCount(2);
        const na = page.locator('#solThread .ep-na');
        await expect(na).toBeVisible();
        expect(await page.locator('#solThread .ep-na-review').count()).toBe(0);
        await expect(na.locator('.ep-eyebrow')).toHaveText('Not available yet');
        await expect(chips(page)).toHaveText(['Type the question', 'Open Weakness', 'Open lessons']);
        expect(seen).toEqual([]);
    });
});
