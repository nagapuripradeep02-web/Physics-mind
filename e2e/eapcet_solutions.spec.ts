/**
 * eapcet_solutions.spec.ts — the doubt desk, offline and hosted-locked.
 *
 * Offline: a typed question is matched on the phone and its card opens the
 * fix page (which says the solution is not in this build); a photo is shown
 * back from a blob URL, the flow ends in the not-available card, and the
 * page makes zero requests. Hosted + locked: the fix page reached from the
 * desk meets the lock wall, no solution byte reaches the page, no request
 * body exceeds 20 KB, and Back returns to the desk.
 */
import { test, expect, type Page } from '@playwright/test';
import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { OPEN_KEY, STEP_TEXT, MISTAKE_APP, fixture, watchRequests, open, writeLearnDir } from './eapcet_helpers';

const ROOT = process.cwd();
const OUT = join(ROOT, 'eapcet-app', 'dist-e2e-sol');
const URL = 'file:///' + join(OUT, 'index.html').replace(/\\/g, '/');
const HOSTED_OUT = join(ROOT, 'eapcet-app', 'dist-e2e-sol-hosted');
const HOSTED_URL = 'file:///' + join(HOSTED_OUT, 'index.html').replace(/\\/g, '/');
const STATE = 'https://ep.test/state';
const CHAT = 'https://ep.test/chat';
const CORS = { 'access-control-allow-origin': '*', 'content-type': 'application/json' };
const SKU = { sku: 'eapcet_physics_month', label: 'EAPCET Physics', price_inr: 399, list_price_inr: 399,
    founding: false, founding_locked: false, founding_slots_left: null, period_days: 31 };
// A 1×1 PNG.
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

function build(out: string, hosted: boolean) {
    mkdirSync(out, { recursive: true });
    const pool = join(out, 'fixture_release.json');
    writeFileSync(pool, JSON.stringify(fixture()));
    const learn = writeLearnDir(join(out, 'learn'));
    const args = ['tsx', 'src/scripts/build_eapcet_app.ts', ...(hosted ? ['--hosted'] : []), `--pool=${pool}`, `--out=${out}`, `--learn=${learn}`];
    execFileSync('npx', args, {
        cwd: ROOT, stdio: 'pipe', shell: true,
        env: { ...process.env, EP_CHAT_BASE: CHAT, EP_STATE_BASE: STATE, EP_PAY_BASE: '', EP_AUTH_BASE: '', EP_AUTH_ANON: '', EP_STAFF_WORD: '' },
    });
    if (!existsSync(join(out, 'index.html'))) throw new Error('the solutions e2e build produced no index.html');
}

/** The first eight words of a verified question of OPEN_KEY, and its id. */
async function firstWords(page: Page): Promise<{ qid: string; text: string }> {
    return await page.evaluate((k) => {
        const w = window as any;
        const ch = w.EP_POOL.chapters.find((c: { key: string }) => c.key === k);
        const qid = ch.verified_ids[0];
        return { qid, text: w.EP_POOL.questions[qid].question_en.split(' ').slice(0, 8).join(' ') };
    }, OPEN_KEY);
}

test.describe('EAPCET — the doubt desk, offline', () => {
    test.beforeAll(() => build(OUT, false));

    test('a typed question finds its past-paper card and opens the fix page; Back returns to the desk', async ({ page }) => {
        const seen = watchRequests(page);
        await open(page, URL, '#/physics/solutions');
        await expect(page.locator('#solutionsView')).toBeVisible();
        await expect(page.locator('#solTitle')).toHaveText('Vidi · your own problem');
        await expect(page.locator('#tabbar .ep-tab[aria-current="page"]')).toHaveAttribute('data-tab', 'solutions');
        await expect(page.locator('#solThread .ep-sol-msg.tutor .ep-sol-text').first()).toHaveText('Bring a problem. Take a photo of it, pick one from your gallery, or type it.');
        await expect(page.locator('#solChips .ep-chip')).toHaveText(['Take a photo', 'Pick from gallery']);
        await expect(page.locator('#solInput')).toHaveAttribute('placeholder', 'Or type the question here');
        await page.locator('#solInput').fill('the tower');
        await page.locator('#solSend').click();
        await expect(page.locator('#solThread .ep-sol-msg.tutor .ep-sol-text').last()).toHaveText('Type a few more words of the question.');
        await page.locator('#solInput').fill('a copper wire doubles its resistance when heated strongly');
        await page.locator('#solSend').click();
        await expect(page.locator('#solThread .ep-sol-msg.tutor .ep-sol-text').last()).toHaveText('No past question matches that text. Check the key words, or type more of the question.');
        const { qid, text } = await firstWords(page);
        await page.locator('#solInput').fill(text);
        await page.locator('#solInput').press('Enter');
        await expect(page.locator('#solThread .ep-sol-msg.student .ep-sol-text').last()).toHaveText(text);
        await expect(page.locator('#solThread .ep-sol-msg.tutor .ep-sol-text').last()).toHaveText('Is it one of these?');
        const cards = page.locator('#solThread .ep-match');
        expect(await cards.count()).toBeGreaterThanOrEqual(1);
        expect(await cards.count()).toBeLessThanOrEqual(3);
        await expect(cards.first()).toHaveAttribute('data-qid', qid);
        await expect(cards.first().locator('.ep-eyebrow')).toContainText('Work Power Energy');
        await expect(page.locator('#solChips .ep-chip')).toHaveText(['None of these']);
        await cards.first().locator('.ep-match-btn').click();
        await expect(page.locator('#fixView')).toBeVisible();
        await expect.poll(() => page.evaluate(() => location.hash)).toBe(`#/physics/${OPEN_KEY}/fix/${qid}`);
        await expect(page.locator('#fixBody .ep-note')).toHaveText('The worked solution for this question is not in this build yet.');
        await expect(page.locator('#fixBody .ep-learn-btn')).toHaveText('Learn the idea first (free)');
        await expect(page.locator('#btnBack')).toHaveText('← Solutions');
        await expect(page.locator('#tabbar .ep-tab[aria-current="page"]')).toHaveAttribute('data-tab', 'solutions');
        await page.locator('#btnBack').click();
        await expect(page.locator('#solutionsView')).toBeVisible();
        await expect.poll(() => page.evaluate(() => location.hash)).toBe(`#/physics/solutions/${OPEN_KEY}`);
        await expect(page.locator('#solThread .ep-sol-msg.tutor .ep-sol-text').nth(1)).toHaveText('You came from Work Power Energy. Questions from that chapter are listed first.');
        expect(await page.locator('#fixView .ep-note').count()).toBe(0);     // cleared on leave
        expect(seen).toEqual([]);
    });

    test('a photo is shown back from this phone, nothing is sent, and the flow ends in the not-available card', async ({ page }) => {
        const seen = watchRequests(page);
        await open(page, URL, '#/physics/solutions');
        await page.locator('#solCamera').setInputFiles({ name: 'problem.png', mimeType: 'image/png', buffer: PNG });
        const photo = page.locator('#solThread .ep-photo');
        await expect(photo.locator('img')).toHaveAttribute('src', /^blob:/);
        await expect(photo.locator('.ep-photo-cap')).toHaveText('Your photo. It stays on this phone. Nothing is sent.');
        await expect(photo.locator('.btn')).toHaveText(['Retake', 'Remove']);
        await expect(page.locator('#solThread .ep-sol-msg.tutor .ep-sol-text').last()).toHaveText('What do you want for this one?');
        await expect(page.locator('#solChips .ep-chip')).toHaveText(['I tried, here is my work', 'I am stuck at a step', 'Just show me the solution']);
        await page.locator('#solChips .ep-chip[data-route="tried"]').click();
        await expect(page.locator('#solThread .ep-sol-msg.tutor .ep-sol-text').last()).toHaveText('Take a photo of your working.');
        await page.locator('#solGallery').setInputFiles({ name: 'working.png', mimeType: 'image/png', buffer: PNG });
        await expect(page.locator('#solThread .ep-photo')).toHaveCount(2);
        const na = page.locator('#solThread .ep-na');
        await expect(na).toBeVisible();
        await expect(na.locator('.ep-eyebrow')).toHaveText('Not available yet');
        await expect(na.locator('.ep-na-title')).toHaveText('Reading a photo is not available yet.');
        await expect(na.locator('.ep-na-body')).toHaveText('This version cannot read what is in a photo. Your photo stayed on this phone and was not sent anywhere.');
        await expect(page.locator('#solChips .ep-chip')).toHaveText(['Type the question', 'Open Weakness', 'Open lessons']);
        await expect(page.locator('#solThread .ep-ai-tag')).toHaveCount(0);
        await page.locator('#solChips .ep-chip[data-route="lessons"]').click();
        await expect(page.locator('#learnView')).toBeVisible();
        expect(await page.locator('#solThread .ep-photo').count()).toBe(0);      // cleared on leave
        expect(seen).toEqual([]);
    });
});

test.describe('EAPCET — the doubt desk, hosted and locked', () => {
    test.beforeAll(() => build(HOSTED_OUT, true));

    test('the fix page reached from the desk meets the lock wall; no solution byte, no large request', async ({ page }) => {
        const posts: { url: string; bytes: number; body: any }[] = [];
        await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
        await page.route(STATE, async (route) => {
            const raw = route.request().postData() || '';
            const body = JSON.parse(raw || '{}');
            posts.push({ url: STATE, bytes: raw.length, body });
            if (body.action === 'standing') return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ ok: true, unlocked: false, paid_until: null, signed_in: false, devices: 1, sku: SKU }) });
            if (body.action === 'bundle') return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ ok: true, locked: true, sku: SKU }) });
            return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ ok: true, chapters: {}, server_time: new Date().toISOString(), internal: false }) });
        });
        await page.route(CHAT, async (route) => {
            const raw = route.request().postData() || '';
            posts.push({ url: CHAT, bytes: raw.length, body: JSON.parse(raw || '{}') });
            return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ ok: true }) });
        });
        await page.goto(HOSTED_URL + `#/physics/solutions/${OPEN_KEY}`);
        await page.waitForSelector('main');
        const { qid, text } = await firstWords(page);
        await page.locator('#solInput').fill(text);
        await page.locator('#solSend').click();
        await page.locator('#solThread .ep-match').first().locator('.ep-match-btn').click();
        await expect(page.locator('#fixView')).toBeVisible();
        await expect(page.locator('#lockWall')).toBeVisible();
        await expect(page.locator('#lockWall .ep-lock-title')).toHaveText('The worked solutions are part of the paid plan.');
        const html = await page.content();
        expect(html).not.toContain(STEP_TEXT);
        expect(html).not.toContain(MISTAKE_APP);
        expect(html).not.toContain('"common_mistakes"');
        for (const p of posts) expect(p.bytes, `${p.url} body of ${p.bytes} bytes`).toBeLessThan(20 * 1024);
        const bodies = JSON.stringify(posts);
        expect(bodies).not.toContain(text);                 // the typed question never leaves the phone
        expect(bodies).not.toContain('blob:');
        await expect(page.locator('#btnBack')).toHaveText('← Solutions');
        await page.locator('#btnBack').click();
        await expect(page.locator('#solutionsView')).toBeVisible();
        expect(qid).toBeTruthy();
    });
});
