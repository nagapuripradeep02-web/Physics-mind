// Show me your working — the photo on the fix page, against a faked
// ep-photo-read. Builds the hosted page with EP_PHOTO_BASE set, walks one run
// with a claim-only wrong answer, opens its fix page, sends a photo, and checks:
// the request carries the image as base64 JPEG with the pick and the route,
// never the solution; the tick-list renders what the fake read, with the
// final number matched to an option and the diverging step named; confirming
// keeps ONE photo row (no image bytes) in ep_state_v1 and the next sync body
// carries it under chapters[ck].photos; the ledger now reads the shape "fix"
// from the photo's evidence; a locked device sees the plan note and no image
// ever leaves the phone.
import { test, expect, type Page } from '@playwright/test';
import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
    OPEN_KEY, fixture, installClock, advance, open, currentCard, pickFor, menuOf, writeLearnDir, typeFirst,
} from './eapcet_helpers';

const ROOT = process.cwd();
const OUT = join(ROOT, 'eapcet-app', 'dist-e2e-photo');
const URL = 'file:///' + join(OUT, 'index.html').replace(/\\/g, '/');
const STATE = 'https://ep.test/state';
const CHAT = 'https://ep.test/chat';
const PAY = 'https://ep.test/pay';
const PHOTO = 'https://ep.test/photo';
const SKU = { sku: 'eapcet_physics_month', label: 'EAPCET Physics', price_inr: 399, list_price_inr: 399,
    founding: false, founding_locked: false, founding_slots_left: null, period_days: 31 };
const CORS = { 'access-control-allow-origin': '*', 'content-type': 'application/json' };
// a 4×4 PNG (opaque); the page downsizes to JPEG before it sends
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAFklEQVR4nGP8z8DAwMDAxAAFDAwMAB0nAQNZbCA9AAAAAElFTkSuQmCC', 'base64');

interface Fake { unlocked: boolean; posts: Array<{ url: string; body: any }>; read: any }

async function wire(page: Page, fake: Fake): Promise<void> {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
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
    await page.route(PHOTO, async (route) => {
        const body = JSON.parse(route.request().postData() || '{}');
        fake.posts.push({ url: PHOTO, body });
        if (!fake.unlocked) return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ locked: true }) });
        return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify(fake.read) });
    });
}

/** Play to the first routed question whose calculation option exists, pick an UNEXPLAINED option
    with the right route (claim-only), then finish the run with the key. Returns that question. */
async function runWithClaimOnlyWrong(page: Page) {
    let target: any = null;
    for (let i = 0; i < 10; i++) {
        const q = await currentCard(page);
        const menu = await menuOf(page, q.id);
        const card = page.locator('.ep-card[data-qid]').last();
        let picked = q.answer, route = menu.includes('r') ? 'r' : 'sure';
        if (!target && menu.includes('r') && pickFor(q, 'other') !== q.answer && !q.option_types[String(pickFor(q, 'other'))]) {
            target = q; picked = pickFor(q, 'other'); route = 'r';
        }
        await typeFirst(page, card, undefined, q, picked);
        await advance(page, 40000);
        await card.locator(`.ep-opt[data-option="${picked}"]`).click();
        await expect(page.locator('#runChips .ep-chip')).toHaveCount(menu.length);
        await page.locator(`#runChips .ep-chip[data-route="${route}"]`).click();
    }
    expect(target, 'a routed question with an unexplained wrong option').toBeTruthy();
    return target;
}

test.describe('EAPCET finder — show me your working', () => {
    test.beforeAll(() => {
        mkdirSync(OUT, { recursive: true });
        writeFileSync(join(OUT, 'fixture_release.json'), JSON.stringify(fixture()));
        const learn = writeLearnDir(join(OUT, 'learn'));
        execFileSync('npx', ['tsx', 'src/scripts/build_eapcet_app.ts', '--hosted', `--pool=${join(OUT, 'fixture_release.json')}`, `--out=${OUT}`, `--learn=${learn}`], {
            cwd: ROOT, stdio: 'pipe', shell: true,
            env: { ...process.env, EP_CHAT_BASE: CHAT, EP_STATE_BASE: STATE, EP_PAY_BASE: PAY, EP_PHOTO_BASE: PHOTO, EP_AUTH_BASE: '', EP_AUTH_ANON: '', EP_STAFF_WORD: 'teamword' },
        });
        if (!existsSync(join(OUT, 'index.html'))) throw new Error('the photo e2e build produced no index.html');
    });

    test('a photo is read once, the tick-list is confirmed, one photo row syncs, and the ledger reads the evidence', async ({ page }) => {
        const fake: Fake = { unlocked: true, posts: [], read: null };
        await wire(page, fake);
        await installClock(page);
        await open(page, URL, `#/physics/${OPEN_KEY}`);
        const q = await runWithClaimOnlyWrong(page);
        await expect(page).toHaveURL(new RegExp(`#/physics/${OPEN_KEY}/result$`));
        const calcOption = pickFor(q, 'calc');
        expect(q.option_types[String(calcOption)]).toBe('calculation');
        // claim-only: the shape reads "check" before the photo
        const before = await page.evaluate((k) => (window as any).Run.ledger(k).by, OPEN_KEY);
        expect(before[q.shape!.key].status).toBe('check');

        await page.locator(`.ep-shape-item[data-qid="${q.id}"] .ep-fix-btn`).click();
        await expect(page.locator('.ep-step').first()).toBeVisible();
        const block = page.locator('#photoBlock');
        await expect(block.locator('.ep-h3')).toHaveText('Show me your working');
        await expect(block.locator('.ep-photo-privacy')).toHaveText('Your photo is sent once to read it, then discarded. It is not stored.');
        const stepCount = await page.locator('#fixBody .ep-step').count();
        fake.read = {
            ok: true, readable: true, on_topic: true,
            final_value_read: q.options_en![calcOption - 1], read_option: calcOption,
            // the first step seen, the last unclear (a low-confidence read), the rest not seen
            steps: Array.from({ length: stepCount }, (_, i) => {
                const last = i === stepCount - 1;
                const found = i === 0;
                return { step_index: i + 1, found, evidence: found ? `line ${i + 1}: the ${i + 1} step` : null, confidence: last ? 0.3 : 0.9, state: found ? 'found' : (last ? 'unsure' : 'not_found') };
            }),
            diverges_at: 2, note: null, reads_left: 19,
        };
        await page.locator('#photoGallery').setInputFiles({ name: 'working.png', mimeType: 'image/png', buffer: PNG });

        // the request: the image as base64 JPEG, the pick and the route; never a solution byte
        await expect(page.locator('#photoOut .ep-tick')).toHaveCount(stepCount);
        const sent = fake.posts.find((p) => p.url === PHOTO)!;
        expect(sent.body).toMatchObject({ action: 'read', question_id: q.id, picked: pickFor(q, 'other'), route: 'r', media_type: 'image/jpeg' });
        expect(typeof sent.body.device_id).toBe('string');
        expect(sent.body.image).toMatch(/^[A-Za-z0-9+/=]+$/);
        expect(sent.body.image.length).toBeGreaterThan(100);
        expect(JSON.stringify(sent.body)).not.toMatch(/why_this_step|approach|equation/);

        // the tick-list: seen / not seen / unclear, the final number, the diverging step
        await expect(page.locator('#photoOut .ep-tick[data-step="1"]')).toHaveAttribute('data-state', 'found');
        await expect(page.locator('#photoOut .ep-tick[data-step="1"] .ep-tick-ev')).toHaveText('On your page: line 1: the 1 step');
        await expect(page.locator(`#photoOut .ep-tick[data-step="${stepCount}"]`)).toHaveAttribute('data-state', 'unsure');
        await expect(page.locator('#photoFinal')).toHaveText(`Your final answer, as read: ${q.options_en![calcOption - 1]}. That is option (${calcOption}).`);
        await expect(page.locator('#photoDiverges')).toContainText('Your working leaves the verified solution at step 2');
        // the student settles the unclear line as seen, then confirms
        await page.locator(`#photoOut .ep-tick[data-step="${stepCount}"] .ep-tick-btn`).click();
        await expect(page.locator(`#photoOut .ep-tick[data-step="${stepCount}"]`)).toHaveAttribute('data-state', 'found');
        await page.locator('.ep-photo-confirm').click();
        await expect(page.locator('.ep-photo-saved')).toHaveText('Saved. This counts as evidence for this question.');
        await expect(page.locator('#photoOut .ep-note').nth(1)).toHaveText(`On paper you reached (${calcOption}). You picked (${pickFor(q, 'other')}).`);

        // one photo row, no image, in the state; the next sync carries it
        const state = await page.evaluate(() => JSON.parse(localStorage.getItem('ep_state_v1')!));
        const photos = state.chapters[OPEN_KEY].photos;
        expect(photos).toHaveLength(1);
        expect(photos[0]).toMatchObject({ qid: q.id, run_no: 1, read_option: calcOption, diverges_at: 2, confirmed: true });
        expect(photos[0].evidence).toHaveLength(stepCount);
        expect(photos[0].evidence[0].found).toBe(true);
        expect(photos[0].evidence[stepCount - 1].found).toBe(true);          // the line the student settled
        if (stepCount > 2) expect(photos[0].evidence[1].found).toBe(false);
        expect(JSON.stringify(photos[0])).not.toMatch(/image|base64|data:/);
        await advance(page, 5000);
        await expect.poll(() => fake.posts.some((p) => p.url === STATE && p.body.action === 'sync' && p.body.chapters?.[OPEN_KEY]?.photos?.length === 1)).toBe(true);

        // the ledger: the number on paper confirms the wrong answer as a calculation slip
        const after = await page.evaluate((k) => (window as any).Run.ledger(k), OPEN_KEY);
        expect(after.by[q.shape!.key].status).toBe('fix');
        expect(after.types.calculation).toBeGreaterThanOrEqual(1);
    });

    test('a locked device sees the plan note and no image leaves the phone; an unreadable photo says so', async ({ page }) => {
        const fake: Fake = { unlocked: false, posts: [], read: null };
        await wire(page, fake);
        await installClock(page);
        await open(page, URL, `#/physics/${OPEN_KEY}`);
        const q = await runWithClaimOnlyWrong(page);
        await page.locator(`.ep-shape-item[data-qid="${q.id}"] .ep-fix-btn`).click();
        // the lock wall stands in front of the solution; no photo block, no photo request
        await expect(page.locator('#fixBody')).toContainText('The worked solutions are part of the paid plan.');
        expect(await page.locator('#photoBlock').count()).toBe(0);
        expect(fake.posts.filter((p) => p.url === PHOTO)).toHaveLength(0);

        // now unlocked: an unreadable photo is a photo problem, not a student problem
        fake.unlocked = true;
        fake.read = { ok: true, readable: false, on_topic: true, final_value_read: null, read_option: null, steps: [], diverges_at: null, note: null, reads_left: 19 };
        await page.reload();                                          // the standing is read on boot
        await page.goto(URL + `#/physics/${OPEN_KEY}/fix/${encodeURIComponent(q.id)}`);
        await expect(page.locator('#photoBlock')).toBeVisible();
        await page.locator('#photoGallery').setInputFiles({ name: 'dark.png', mimeType: 'image/png', buffer: PNG });
        await expect(page.locator('#photoOut .ep-note')).toHaveText('That photo could not be read. Take it again in more light, straight above the page.');
        const state = await page.evaluate(() => JSON.parse(localStorage.getItem('ep_state_v1')!));
        expect(state.chapters[OPEN_KEY].photos ?? []).toHaveLength(0);
    });
});
