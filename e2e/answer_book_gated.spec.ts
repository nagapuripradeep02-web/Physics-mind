/**
 * Gates for the GATED Answer Book build (P3, 2026-08-23).
 *
 * Own spec file on purpose: the main suite (answer_book.spec.ts) asserts the
 * OFFLINE full build and its beforeAll refuses anything else — this file
 * asserts answer-book/dist-gated, so the two can never trip each other.
 *
 * Run: npm run smoke:answers:gated   (build first: npm run build:answers:gated)
 *
 * The content endpoint is ROUTED (page.route) like the P2 sync gates: the
 * PM_CONTENT_BASE override must be a defineProperty getter because the data
 * block assigns it before notebook.js reads it. Bundles served by the fake
 * endpoint are the REAL files from answer-book/content/, so a gate that
 * unlocks renders the same bytes production would.
 */
import { test, expect } from '@playwright/test';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const GATED_DIST = join(process.cwd(), 'answer-book', 'dist-gated', 'index.html');
const FULL_DIST = join(process.cwd(), 'answer-book', 'dist', 'index.html');
const CONTENT_DIR = join(process.cwd(), 'answer-book', 'content');
const URL = 'file:///' + GATED_DIST.replace(/\\/g, '/');
const CONTENT = 'https://content.test/functions/v1/answerbook-content';

test.beforeAll(() => {
    if (!existsSync(GATED_DIST)) throw new Error('answer-book/dist-gated missing — run npm run build:answers:gated first');
    if (!existsSync(CONTENT_DIR)) throw new Error('answer-book/content missing — run npm run build:answers:gated first');
});

/** A real answer line from a physics file and a KaTeX TeX source from a maths
    file — the strings a paying student is paying for. */
function leakProbes(): { text: string; tex: string } {
    const phys = JSON.parse(readFileSync(
        join(process.cwd(), 'answer-book', 'questions', 'ts_ipe_p1_vec_parallelogram_law.json'), 'utf8'));
    const l0 = phys.answer.steps[0].lines[0];
    const text = typeof l0 === 'string' ? l0 : l0.text;
    // any maths bundle carries render:"katex" lines with raw TeX sources
    const m3 = JSON.parse(readFileSync(join(CONTENT_DIR, 'mathematics-3.json'), 'utf8'));
    let tex = '';
    outer: for (const q of m3.questions) {
        for (const s of q.answer.steps) {
            for (const ln of s.lines ?? []) {
                if (ln && typeof ln === 'object' && ln.render === 'katex') { tex = ln.text; break outer; }
            }
        }
    }
    if (!text || !tex) throw new Error('leak probes not found — question shapes changed?');
    return { text, tex };
}

function bundleFor(unitKey: string): unknown {
    return JSON.parse(readFileSync(join(CONTENT_DIR, `${unitKey}.json`), 'utf8'));
}

/** Boot the gated page with PM_CONTENT_BASE routed to the fake endpoint. */
async function bootGated(page: any, handler: (body: any) => any) {
    await page.addInitScript((base: string) => {
        Object.defineProperty(window, 'PM_CONTENT_BASE', {
            get: () => base, set: () => {}, configurable: true,
        });
    }, CONTENT);
    await page.route('https://content.test/**', async (route: any) => {
        const req = route.request();
        if (req.method() === 'OPTIONS') {
            return route.fulfill({ status: 204, headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            } });
        }
        const body = JSON.parse(req.postData() || '{}');
        return route.fulfill({
            status: 200,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: JSON.stringify(handler(body)),
        });
    });
    await page.goto(URL);
    await page.waitForFunction(() => (window as any).PM_ANSWER);
}

test('the gated page carries the catalog but not one answer byte', async ({ page }) => {
    const probes = leakProbes();
    const gated = readFileSync(GATED_DIST, 'utf8');

    // positive control first: the probes ARE the product (present in the full build)
    if (existsSync(FULL_DIST)) {
        const full = readFileSync(FULL_DIST, 'utf8');
        expect(full).toContain(probes.text.slice(0, 60));
    }
    expect(gated).not.toContain(probes.text.slice(0, 60));
    expect(gated).not.toContain(probes.tex.slice(0, 40));
    // and no step teaching text anywhere — the skeleton is {id, marks} only
    expect(gated).not.toContain('"why"');
    expect(gated).not.toContain('"common_mistakes"');
    expect(gated).not.toContain('"memory_tip"');

    // the page still boots and sells: full catalog, every card
    await bootGated(page, () => ({ ok: true, unlocked: [], free_available: true, sku: { price_inr: null } }));
    await page.waitForSelector('#catalogView:not([hidden])');
    const r = await page.evaluate(() => ({
        cards: document.querySelectorAll('.cat-card').length,
        entries: ((window as any).PM_UNITS as any[]).reduce((n: number, u: any) => n + u.questions.length, 0),
    }));
    expect(r.cards).toBe(r.entries);
});

test('a locked question shows the sheet, and the free-chapter tap unlocks and renders it', async ({ page }) => {
    let claimed = false;
    await bootGated(page, (body) => {
        if (body.list) return { ok: true, unlocked: [], free_available: true, sku: { price_inr: null } };
        if (body.claim_free) { claimed = true; return { ok: true, unlocked: true, bundle: bundleFor(body.unit_key) }; }
        return { ok: true, locked: true, free_available: !claimed, sku: { price_inr: null } };
    });
    await page.waitForSelector('#catalogView:not([hidden])');

    // open a physics-4 question (a gated one)
    const qid = 'ts_ipe_p1_vec_parallelogram_law';
    await page.evaluate((q: string) => (window as any).PM_ANSWER.openQuestion(q), qid);

    // the sheet offers the free chapter; no answer page rendered behind it
    await page.waitForSelector('#lockOverlay:not([hidden])');
    const sheet = await page.evaluate(() => ({
        text: document.getElementById('lockText')!.textContent || '',
        pages: document.querySelectorAll('.page').length,
    }));
    expect(sheet.text).toContain('one full chapter free'.toUpperCase().slice(0, 0) + 'ONE full chapter free');
    expect(sheet.pages).toBe(0);

    // the explicit tap — never a silent claim
    await page.click('#lockRow .vw-btn.primary');
    await page.waitForSelector('.page', { timeout: 8000 });
    expect(claimed).toBe(true);

    // the unlocked answer is the real thing: full marks on reveal
    const st = await page.evaluate(() => {
        (window as any).PM_ANSWER.revealAll();
        return (window as any).PM_ANSWER.getState();
    });
    expect(st.marksEarned).toBe(st.marksTotal);
    expect(await page.evaluate(() => document.getElementById('lockOverlay')!.hidden)).toBe(true);
});

test('an entitled unit opens directly — no sheet at all', async ({ page }) => {
    await bootGated(page, (body) => {
        if (body.list) return { ok: true, unlocked: ['physics-2'], free_available: false, sku: { price_inr: null } };
        if (body.unit_key === 'physics-2') return { ok: true, unlocked: true, bundle: bundleFor('physics-2') };
        return { ok: true, locked: true, free_available: false, sku: { price_inr: null } };
    });
    await page.waitForSelector('#catalogView:not([hidden])');

    const qid = await page.evaluate(() => {
        const u = ((window as any).PM_UNITS as any[]).find((x) => (x.subject || 'physics') + '-' + x.number === 'physics-2');
        return u.questions.find((e: any) => e.question_id).question_id;
    });
    await page.evaluate((q: string) => (window as any).PM_ANSWER.openQuestion(q), qid);
    await page.waitForSelector('.page', { timeout: 8000 });
    // the sheet may flash "Opening this chapter…" while fetching; it must END hidden
    expect(await page.evaluate(() => document.getElementById('lockOverlay')!.hidden)).toBe(true);
});

test('with the free chapter spent, a second locked chapter says so and leaks nothing', async ({ page }) => {
    const probes = leakProbes();
    await bootGated(page, (body) => {
        if (body.list) return { ok: true, unlocked: ['physics-3'], free_available: false, sku: { price_inr: null } };
        if (body.unit_key === 'physics-3') return { ok: true, unlocked: true, bundle: bundleFor('physics-3') };
        // locked — claim_free included: the slot is spent, the server refuses
        return { ok: true, locked: true, free_available: false, sku: { price_inr: null } };
    });
    await page.waitForSelector('#catalogView:not([hidden])');

    await page.evaluate(() => (window as any).PM_ANSWER.openQuestion('ts_ipe_p1_vec_parallelogram_law'));
    await page.waitForSelector('#lockOverlay:not([hidden])');
    const r = await page.evaluate(() => ({
        text: document.getElementById('lockText')!.textContent || '',
        claimBtns: document.querySelectorAll('#lockRow .vw-btn.primary').length,
        pageText: document.getElementById('notebookView')!.textContent || '',
    }));
    expect(r.text).toContain('already used your free chapter');
    expect(r.text).toContain('coming soon');
    expect(r.claimBtns).toBe(0);                          // nothing to claim
    expect(r.pageText).not.toContain(probes.text.slice(0, 40));

    // locked units carry the lock cue in the catalog (physics-3 does not)
    await page.click('#lockRow .vw-btn');                  // Back to all questions
    await page.waitForSelector('#catalogView:not([hidden])');
    const chips = await page.evaluate(() => ({
        locks: document.querySelectorAll('.cc-chip.pm-lock').length,
        cards: document.querySelectorAll('.cat-card').length,
    }));
    expect(chips.locks).toBeGreaterThan(0);
    expect(chips.locks).toBeLessThan(chips.cards);         // the unlocked unit is unbadged
});

test('the endpoint being down never breaks the catalog — the sheet says try again', async ({ page }) => {
    await page.addInitScript((base: string) => {
        Object.defineProperty(window, 'PM_CONTENT_BASE', {
            get: () => base, set: () => {}, configurable: true,
        });
    }, CONTENT);
    await page.route('https://content.test/**', (route: any) => route.abort('failed'));

    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto(URL);
    await page.waitForFunction(() => (window as any).PM_ANSWER);
    await page.waitForSelector('#catalogView:not([hidden])');

    await page.evaluate(() => (window as any).PM_ANSWER.openQuestion('ts_ipe_p1_vec_parallelogram_law'));
    await page.waitForSelector('#lockOverlay:not([hidden])');
    const text = await page.evaluate(() => document.getElementById('lockText')!.textContent || '');
    expect(text).toContain('try again');

    // back out — the catalog still works, no crash anywhere
    await page.click('#lockRow .vw-btn:not(.primary)');
    await page.waitForSelector('#catalogView:not([hidden])');
    expect(errors).toEqual([]);
    expect(await page.evaluate(() => document.querySelectorAll('.cat-card').length)).toBeGreaterThan(400);
});

test('every unit has a bundle and every bundle question is the full projection', async () => {
    const manifest = JSON.parse(readFileSync(join(process.cwd(), 'answer-book', 'units.json'), 'utf8'));
    const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.json'));
    expect(files.length).toBe(manifest.units.length);
    let total = 0;
    for (const f of files) {
        const b = JSON.parse(readFileSync(join(CONTENT_DIR, f), 'utf8'));
        expect(b.unit_key + '.json').toBe(f);
        total += b.questions.length;
        for (const q of b.questions) {
            expect(q.answer.steps.length).toBeGreaterThan(0);
            expect(q.answer.steps[0].lines || q.answer.steps[0].figure).toBeTruthy();  // real bodies
            expect(JSON.stringify(q)).not.toContain('"recall"');                        // grader rubric never ships
        }
    }
    expect(total).toBe(448);
});
