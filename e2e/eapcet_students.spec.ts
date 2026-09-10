/**
 * eapcet_students.spec.ts — three students sit the REAL release of one chapter.
 *
 *   npm run smoke:eapcet:students            (EP_CHAPTER=p1-02 by default)
 *   EP_POOL=<release.json> EP_CHAPTER=p1-05 npm run smoke:eapcet:students
 *
 * Builds the finder from the real release (hosted flavour, endpoints faked in
 * the page so the paid half — the fix page, the sibling retry, the chat post —
 * runs offline), then plays Pradeep, Rahul and Yashwanth (eapcet_students.ts):
 * each is a rule over the public facts of a question, so what the engine must
 * conclude is derived from the draw at test time and asserted, never typed in.
 * Every draw is pinned (ep_session), every clock is the test's, and the
 * designed truth is also checked over EVERY possible ten-question draw of the
 * chapter, so the founder can replay any student on any phone with the answer
 * sheet the report prints.
 *
 * Writes docs/reports/eapcet_students/<date>_<chapter>.md and one full-page
 * screenshot per student beside it.
 */
import { test, expect, type Browser, type Page } from '@playwright/test';
import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { installClock, advance, pinSeed, currentCard, menuOf, resolveRoute, expectation, labelOf, typeFirst, type Played } from './eapcet_helpers';
import { STUDENTS, OUTCOME_OF, routeText, combinations, playedFor, type Fact, type Persona } from './eapcet_students';

const ROOT = process.cwd();
const CHAPTER = process.env.EP_CHAPTER || 'p1-02';
const RELEASE = process.env.EP_POOL || 'C:/Tutor/physics-mind-eapcet-corpus/eapcet/pool/physics_pool_v1.release.json';
const OUT = join(ROOT, 'eapcet-app', 'dist-students');
const URL = 'file:///' + join(OUT, 'index.html').replace(/\\/g, '/');
const STATE = 'https://ep.test/state';
const CHAT = 'https://ep.test/chat';
const PAY = 'https://ep.test/pay';
const CORS = { 'access-control-allow-origin': '*', 'content-type': 'application/json' };
const SKU = { sku: 'eapcet_physics_month', label: 'EAPCET Physics', price_inr: 399, list_price_inr: 399,
    founding: false, founding_locked: false, founding_slots_left: null, period_days: 31 };
const REPORT_DIR = join(ROOT, 'docs', 'reports', 'eapcet_students');
const DATE = new Date().toISOString().slice(0, 10);
const VIDI_REPLY = 'The important step is the one that chooses the interval; the worked solution shows it in step 1.';

let release: any;

test.beforeAll(() => {
    if (!existsSync(RELEASE)) throw new Error(`no release at ${RELEASE} — pass EP_POOL=<release.json>`);
    release = JSON.parse(readFileSync(RELEASE, 'utf8'));
    mkdirSync(OUT, { recursive: true });
    mkdirSync(REPORT_DIR, { recursive: true });
    execFileSync('npx', ['tsx', 'src/scripts/build_eapcet_app.ts', '--hosted', `--pool=${RELEASE}`, `--out=${OUT}`], {
        cwd: ROOT, stdio: 'pipe', shell: true,
        env: { ...process.env, EP_CHAT_BASE: CHAT, EP_STATE_BASE: STATE, EP_PAY_BASE: PAY, EP_AUTH_BASE: '', EP_AUTH_ANON: '', EP_STAFF_WORD: 'teamword' },
    });
    if (!existsSync(join(OUT, 'index.html'))) throw new Error('the students build produced no index.html');
});

interface Post { url: string; body: any }

/** The three endpoints, answered in the page: every device is entitled, the
    bundle is the release's own solutions, Vidi answers with one canned line. */
async function wire(page: Page, posts: Post[]): Promise<void> {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
    const standing = () => ({ unlocked: true, paid_until: null, signed_in: false, devices: 1, sku: SKU });
    await page.route(STATE, async (route) => {
        const body = JSON.parse(route.request().postData() || '{}');
        posts.push({ url: STATE, body });
        if (body.action === 'standing') return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ ok: true, ...standing() }) });
        if (body.action === 'bundle') {
            const solutions: Record<string, unknown> = {};
            for (const q of Object.values(release.questions) as any[]) {
                if (q.chapter_key === body.chapter_key && q.solution) solutions[q.id] = { solution: q.solution, grounding: [] };
            }
            return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ ok: true, unlocked: true, chapter_key: body.chapter_key, solutions }) });
        }
        return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ ok: true, chapters: {}, server_time: new Date().toISOString(), internal: false, standing: standing() }) });
    });
    await page.route(CHAT, async (route) => {
        const body = JSON.parse(route.request().postData() || '{}');
        posts.push({ url: CHAT, body });
        if (body.type === 'events') return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ ok: true }) });
        return route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ reply: VIDI_REPLY, questions_left: 39 }) });
    });
    await page.route(PAY, (route) => route.fulfill({ status: 200, headers: CORS, body: JSON.stringify({ ok: true, url: 'https://rzp.test/l/abc', price: SKU }) }));
}

const VERDICT_WORDS: Record<string, string> = {
    concept: 'not knowing the concept', application: 'could not see which one', calculation: 'Your calculation slips',
    guessed: 'you guessed on three or more', solid: 'you are solid', none: 'No clear pattern yet',
};

interface Sat {
    persona: Persona; seed: string; ids: string[]; played: Played[]; want: ReturnType<typeof expectation>;
    diagnosis: any; resultText: string; png: string; retry: any; retryVerdict: string; chat: any;
    exhaustive: { total: number; held: number };
}

async function sit(browser: Browser, persona: Persona, pool: Fact[]): Promise<Sat> {
    const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    const posts: Post[] = [];
    await wire(page, posts);
    await installClock(page);
    const seed = 'student-' + persona.name.toLowerCase();
    await pinSeed(page, seed);
    await page.goto(URL + `#/physics/${CHAPTER}`);
    await page.waitForSelector('main');
    const rushed = persona.wait < 15000;

    const played: Played[] = [];
    for (let i = 0; i < 10; i++) {
        const q = await currentCard(page);
        expect(await page.locator('#runView .ep-asked').count(), 'no paper label on a run card').toBe(0);
        expect(await page.locator('#runView').innerText()).not.toContain('TG EAPCET');
        const idx = pool.findIndex((x) => x.id === q.id);
        expect(idx, `${q.id} is a pool question`).toBeGreaterThanOrEqual(0);
        const d = persona.decide(pool[idx], idx);
        const menu = await menuOf(page, q.id);
        const route = resolveRoute(menu, d.route);
        await typeFirst(page, page.locator('.ep-card[data-qid]').last(), d.typed, pool[idx], d.picked);
        await advance(page, persona.wait);
        await page.locator('.ep-card[data-qid]').last().locator(`.ep-opt[data-option="${d.picked}"]`).click();
        await expect(page.locator('#runChips .ep-chip')).toHaveCount(menu.length);
        await page.locator(`#runChips .ep-chip[data-route="${route}"]`).click();
        played.push({ qid: q.id, theory: !menu.includes('r'), intent: d.intent, picked: d.picked, route, label: labelOf(pool[idx], d.picked) });
    }
    await expect(page).toHaveURL(new RegExp(`#/physics/${CHAPTER}/result$`));
    const ids = played.map((p) => p.qid);
    const want = expectation(played, rushed);
    const state = await page.evaluate(() => JSON.parse(localStorage.getItem('ep_state_v1')!));
    const run = state.chapters[CHAPTER].runs[0];
    const diagnosis = run.diagnosis;

    // the engine recovered the designed student
    expect(run.records.map((r: any) => r.route)).toEqual(played.map((p) => p.route));
    expect(diagnosis.score).toBe(want.score);
    expect(diagnosis.params).toEqual(want.params);
    expect(diagnosis.weakness).toBe(want.weakness);
    expect(diagnosis.mismatches).toBe(want.mismatches);
    expect(diagnosis.confirmed).toBe(want.confirmed);
    expect(persona.holds(want), `${persona.name}: the designed truth holds for this draw`).toBe(true);
    // and the screen says it
    await expect(page.locator('.ep-score')).toHaveText(`${want.score} out of 10 correct`);
    await expect(page.locator('#resultVerdict')).toContainText(want.score === 10 ? 'All ten correct' : VERDICT_WORDS[want.weakness || 'none']);
    for (const p of ['concept', 'application', 'calculation', 'guessed', 'rushed']) {
        await expect(page.locator(`.ep-bar[data-param="${p}"] .ep-bar-n`)).toHaveText(String((want.params as any)[p]));
    }
    const papers = new Set(ids.map((id) => String(pool.find((q) => q.id === id)!.asked_label).replace(/,\s*Q\d+$/, '')));
    const listed = await page.locator('#resultReveal .ep-reveal-paper').allTextContents();
    expect(listed.map((l) => l.replace(/ — Q.*$/, '')).sort()).toEqual([...papers].sort());
    const resultText = await page.locator('#resultBody').innerText();
    const png = join(REPORT_DIR, `${DATE}_${CHAPTER}_${persona.name.toLowerCase()}.png`);
    await page.screenshot({ path: png, fullPage: true });

    // the paid half: the fix page (paper named), a sibling retry by the same rule, one question to Vidi
    let retry: any = null, retryVerdict = '', chat: any = null;
    const target = diagnosis.wrong_ids[0] || diagnosis.check_ids[0];
    if (target) {
        await page.locator(`.ep-shape-item[data-qid="${target}"] .ep-fix-btn`).click();
        await expect(page.locator('.ep-step').first()).toBeVisible();
        await expect(page.locator('#fixView .ep-asked')).toContainText('TG EAPCET');
        await page.locator('#retryBox button', { hasText: 'Try a similar question' }).click();
        const sib = page.locator('#retryBox .ep-card[data-qid]');
        await expect(sib).toHaveCount(1);
        expect(await page.locator('#retryBox .ep-asked').count()).toBe(0);
        const sibId = (await sib.getAttribute('data-qid')) || '';
        const sidx = pool.findIndex((x) => x.id === sibId);
        const d = persona.decide(pool[sidx], sidx);
        const menu = await menuOf(page, sibId);
        await typeFirst(page, sib, d.typed, pool[sidx], d.picked);
        await sib.locator(`.ep-opt[data-option="${d.picked}"]`).click();
        await page.locator(`#retryBox .ep-chip[data-route="${resolveRoute(menu, d.route)}"]`).click();
        retryVerdict = await page.locator('#retryVerdict').innerText();
        retry = (await page.evaluate(() => JSON.parse(localStorage.getItem('ep_state_v1')!))).chapters[CHAPTER].retries[0];
        expect(retry).toMatchObject({ qid: sibId, from_qid: target });
        expect(typeof retry.shape_key).toBe('string');
        expect(typeof retry.same_shape).toBe('boolean');
        await page.fill('.ep-chat-input', 'Which step did I get wrong?');
        await page.click('.ep-chat-send');
        await expect(page.locator('.ep-chat-msg.tutor .ep-chat-text').last()).toHaveText(VIDI_REPLY);
        const ask = posts.find((p) => p.url === CHAT && p.body.question);
        chat = { question_id: ask?.body.question_id, picked: ask?.body.picked, route: ask?.body.route, solid_shapes: ask?.body.solid_shapes, weak_shapes: ask?.body.weak_shapes, streak: ask?.body.streak };
        expect(chat.question_id).toBe(target);
        expect(chat.route).toBe(played.find((p) => p.qid === target)!.route);
        expect(JSON.stringify(ask?.body)).not.toMatch(/why_this_step|approach/);
    }
    await context.close();

    // the designed truth over every possible draw of this chapter
    let total = 0, held = 0;
    for (const draw of combinations(pool.map((q) => q.id), 10)) {
        total++;
        if (persona.holds(expectation(playedFor(persona, pool, draw), rushed))) held++;
    }
    return { persona, seed, ids, played, want, diagnosis, resultText, png, retry, retryVerdict, chat, exhaustive: { total, held } };
}

function firstWords(s: string, n = 9): string {
    return s.replace(/\s+/g, ' ').trim().split(' ').slice(0, n).join(' ') + '…';
}

function report(chapterName: string, pool: Fact[], sats: Sat[]): string {
    const L: string[] = [];
    const routed = pool.filter((q) => q.has_routes).length;
    L.push(`# Three students on ${chapterName} (${CHAPTER}) — ${DATE}`);
    L.push('');
    L.push(`Release built ${release.built_from.release_at}; ${pool.length} verified questions, ${routed} with audited routes, ${(release.chapters.find((c: any) => c.key === CHAPTER)?.shapes ?? []).length} shapes. Every student below is a rule over the public facts of a question, so what the app must conclude is derived from the draw, not typed in. The run is played with a test clock (each student's time per question is exact) and a pinned draw, so it replays byte for byte.`);
    L.push('');
    L.push('## How to replay a student on your phone');
    L.push('');
    L.push('1. Open the site in a fresh private window (a new device gets its own draw — the sheet below covers every pool question, so any draw works).');
    L.push(`2. Physics → ${chapterName}.`);
    L.push('3. For each question on screen, find its row in the student\'s sheet by the first words. Tap the option the row says, then the route text the row says.');
    L.push('4. Pradeep and Rahul wait more than 15 seconds before each answer; Yashwanth answers within 15 seconds.');
    L.push('5. Compare the result screen with the student\'s truth table. The last line of each student says for how many of the possible draws the truth holds.');
    L.push('');
    for (const s of sats) {
        const p = s.persona;
        L.push(`## ${p.name} — ${p.who}`);
        L.push('');
        L.push(`**Designed truth:** ${p.truth}. Time per question: ${p.wait / 1000} s.`);
        L.push('');
        L.push('### Answer sheet (every pool question, in pool order)');
        L.push('');
        L.push('| # | Question (first words) | Type first | Tap option | Then tap | Expected outcome |');
        L.push('|---|---|---|---|---|---|');
        pool.forEach((q, i) => {
            const d = p.decide(q, i);
            const menuLess = !(q.has_routes && !q.theory && q.routes && q.routes.length);
            const route = menuLess && d.route === 'r' ? 'sure' : d.route;
            const drawn = s.ids.includes(q.id) ? ' ◀ drawn' : '';
            const typed = q.answer_kind !== 'number' ? '—' : d.typed === null ? '“I have no answer yet”' : (d.typed ?? q.options_en[d.picked - 1]);
            L.push(`| ${i + 1} | ${firstWords(q.question_en)}${drawn} | ${typed} | (${d.picked}) ${q.options_en[d.picked - 1]} | “${routeText(q, route)}” | ${OUTCOME_OF[d.intent]} |`);
        });
        L.push('');
        L.push(`### What the app said (seed \`${s.seed}\`, draw ${s.ids.map((id) => pool.findIndex((q) => q.id === id) + 1).join(', ')})`);
        L.push('');
        L.push(`![${p.name}'s result](${DATE}_${CHAPTER}_${p.name.toLowerCase()}.png)`);
        L.push('');
        L.push('```text');
        L.push(s.resultText.trim());
        L.push('```');
        L.push('');
        L.push('### Truth against verdict');
        L.push('');
        L.push('| Field | Derived for this draw | App said | Match |');
        L.push('|---|---|---|---|');
        const rows: [string, unknown, unknown][] = [
            ['weakness', s.want.weakness, s.diagnosis.weakness],
            ['concept', s.want.params.concept, s.diagnosis.params.concept],
            ['application', s.want.params.application, s.diagnosis.params.application],
            ['calculation', s.want.params.calculation, s.diagnosis.params.calculation],
            ['guessed', s.want.params.guessed, s.diagnosis.params.guessed],
            ['rushed', s.want.params.rushed, s.diagnosis.params.rushed],
            ['mismatches', s.want.mismatches, s.diagnosis.mismatches],
            ['confirmed / wrong', `${s.want.confirmed} / ${s.want.wrong}`, `${s.diagnosis.confirmed} / ${s.diagnosis.wrong}`],
            ['score', s.want.score, s.diagnosis.score],
        ];
        for (const [f, w, a] of rows) L.push(`| ${f} | ${String(w)} | ${String(a)} | ${String(w) === String(a) ? 'yes' : 'NO'} |`);
        L.push('');
        L.push(`Shapes on the result: ${s.diagnosis.shapes.map((g: any) => `${g.label || chapterName} (${g.status})`).join('; ')}.`);
        L.push('');
        if (s.retry) {
            L.push(`Sibling retry from ${s.retry.from_qid}: shape \`${s.retry.shape_key}\`, same shape ${s.retry.same_shape}, picked (${s.retry.picked}), route \`${s.retry.route}\` → ${s.retry.correct ? 'right' : 'wrong'}. The app said: “${s.retryVerdict}”.`);
            L.push('');
            L.push(`What the page sent Vidi (ids and enums only): \`${JSON.stringify(s.chat)}\`.`);
            L.push('');
        }
        L.push(`**Holds for every draw?** ${s.exhaustive.held} of ${s.exhaustive.total} possible ten-question draws of this chapter give ${p.name} the designed verdict${s.exhaustive.held === s.exhaustive.total ? '.' : ` — the exceptions are draws that hold too few of ${p.name}'s target questions.`}`);
        L.push('');
    }
    L.push('## Cross-checks');
    L.push('');
    L.push('- No paper label was visible on any run card or retry card; the fix page names the paper; the result\'s reveal listed exactly the papers drawn.');
    L.push('- Every route the students tapped is stored as an id; the chat post carried ids and shape keys only, never a phrase.');
    L.push(`- Shape labels the students read (founder to confirm): ${(release.chapters.find((c: any) => c.key === CHAPTER)?.shapes ?? []).map((s: any) => `“${s.label}”`).join(', ')}.`);
    L.push('');
    return L.join('\n');
}

test('Pradeep, Rahul and Yashwanth sit the chapter, and the engine recovers each of them', async ({ browser }) => {
    test.setTimeout(600000);
    const probe = await browser.newPage();
    await probe.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
    await probe.route(/ep\.test/, (r) => r.fulfill({ status: 200, headers: CORS, body: '{"ok":true}' }));
    await probe.goto(URL);
    await probe.waitForSelector('main');
    const [chapterName, pool] = await probe.evaluate((k) => {
        const w = window as any;
        const ch = w.Data.chapter(k);
        return [ch.name, ch.verified_ids.map((id: string) => w.EP_POOL.questions[id])];
    }, CHAPTER) as [string, Fact[]];
    await probe.close();
    expect(pool.length).toBeGreaterThanOrEqual(13);

    const sats: Sat[] = [];
    for (const persona of STUDENTS) sats.push(await sit(browser, persona, pool));

    const md = report(chapterName, pool, sats);
    const path = join(REPORT_DIR, `${DATE}_${CHAPTER}.md`);
    writeFileSync(path, md, 'utf8');
    console.log(`report -> ${path}`);
    for (const s of sats) console.log(`  ${s.persona.name}: weakness ${s.diagnosis.weakness}, score ${s.diagnosis.score}, holds ${s.exhaustive.held}/${s.exhaustive.total}`);
});
