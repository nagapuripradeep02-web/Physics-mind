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

// The SHIPPED gated artifact is the MPC stream (2026-08-27) — dist-gated-mpc,
// what wrangler.answers.toml serves. Fall back to the unstreamed dist-gated so
// a plain `build:answers:gated` still has a spec to run against.
const GATED_MPC = join(process.cwd(), 'answer-book', 'dist-gated-mpc', 'index.html');
const GATED_PLAIN = join(process.cwd(), 'answer-book', 'dist-gated', 'index.html');
const GATED_DIST = existsSync(GATED_MPC) ? GATED_MPC : GATED_PLAIN;
const FULL_DIST = join(process.cwd(), 'answer-book', 'dist', 'index.html');
// Bundles are stream-scoped since 2026-08-27 — the shipped gated build is MPC.
const CONTENT_MPC = join(process.cwd(), 'answer-book', 'content', 'mpc');
const CONTENT_DIR = existsSync(CONTENT_MPC) ? CONTENT_MPC : join(process.cwd(), 'answer-book', 'content');
const URL = 'file:///' + GATED_DIST.replace(/\\/g, '/');
const CONTENT = 'https://content.test/functions/v1/answerbook-content';

test.beforeAll(() => {
    if (!existsSync(GATED_DIST)) throw new Error('answer-book/dist-gated-mpc missing — run npm run build:answers:gated:mpc first');
    if (!existsSync(CONTENT_DIR)) throw new Error('answer-book/content/mpc missing — run npm run build:answers:gated:mpc first');
});

/** THE DOOR (2026-08-27) stands in front of the bare landing route, so every
    gate written before it would otherwise be asserting the chooser instead of
    the catalog. Each one is a student who has already chosen — which is what
    they were always testing. The door's own gates below clear this key in an
    init script of their own; init scripts run in registration order, so theirs
    runs after this one and wins. */
const TRACK_SEED = { group: 'mpc', year: 'first_year', at: '2026-08-27T00:00:00.000Z' };

test.beforeEach(async ({ page }) => {
    await page.addInitScript((t: unknown) => {
        try {
            if (localStorage.getItem('pm_door_gate') === '1') return;   // a door gate owns storage
            localStorage.setItem('pm_track_v1', JSON.stringify(t));
        } catch { /* file:// */ }
    }, TRACK_SEED);
});

/** A real answer line from a physics file and a KaTeX TeX source from a maths
    file — the strings a paying student is paying for. */
function leakProbes(): { text: string; tex: string } {
    const phys = JSON.parse(readFileSync(
        join(process.cwd(), 'answer-book', 'questions', 'ts_ipe_p1_vec_parallelogram_law.json'), 'utf8'));
    const l0 = phys.answer.steps[0].lines[0];
    const text = typeof l0 === 'string' ? l0 : l0.text;
    // Any maths bundle carries render:"katex" lines with raw TeX sources. Found
    // by SCANNING the maths bundles, never by a hardcoded unit key: this named
    // mathematics-3 until the 2026-27 book renumbered Maths-1A and chapter 3
    // became "Sequences and Series", which nobody has written yet — so the probe
    // silently found no TeX and the leak gate failed for the wrong reason.
    let tex = '';
    outer: for (const f of readdirSync(CONTENT_DIR)) {
        if (!f.startsWith('mathematics')) continue;
        const b = JSON.parse(readFileSync(join(CONTENT_DIR, f), 'utf8'));
        for (const q of b.questions) {
            for (const s of q.answer.steps) {
                for (const ln of s.lines ?? []) {
                    if (ln && typeof ln === 'object' && ln.render === 'katex') { tex = ln.text; break outer; }
                }
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

test('a free chapter opens with no tap and no claim — four are free to everyone', async ({ page }) => {
    // Since 2026-08-27 the free content is FOUR FIXED chapters, one per subject,
    // marked `free` in ab_content and folded into `unlocked` by the server. No
    // claim, no slot, no tap: the student simply opens it. The per-device claim
    // (claim_free / ab_claim_free) is dormant, and this gate proves the client
    // never reaches for it.
    let claimAttempted = false;
    await bootGated(page, (body) => {
        if (body.list) {
            return { ok: true, unlocked: ['physics-3'], free_available: false, sku: { price_inr: null } };
        }
        if (body.claim_free) { claimAttempted = true; }
        if (body.unit_key === 'physics-3') return { ok: true, unlocked: true, bundle: bundleFor('physics-3') };
        return { ok: true, locked: true, free_available: false, sku: { price_inr: null } };
    });
    await page.waitForSelector('#catalogView:not([hidden])');

    const qid = 'ts_ipe_p1_vec_parallelogram_law';        // a physics-3 question (Motion in a Plane — Unit 3 since the 2026-27 renumbering)
    await page.evaluate((q: string) => (window as any).PM_ANSWER.openQuestion(q), qid);
    await page.waitForSelector('.page', { timeout: 8000 });

    expect(claimAttempted).toBe(false);                    // nothing was spent
    expect(await page.evaluate(() => document.getElementById('lockOverlay')!.hidden)).toBe(true);

    // and it is the real answer, not a skeleton
    const st = await page.evaluate(() => {
        (window as any).PM_ANSWER.revealAll();
        return (window as any).PM_ANSWER.getState();
    });
    expect(st.marksEarned).toBe(st.marksTotal);
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

test('a locked chapter names the free four, offers the pass, and leaks nothing', async ({ page }) => {
    const probes = leakProbes();
    await bootGated(page, (body) => {
        if (body.list) return { ok: true, unlocked: ['physics-2'], free_available: false, sku: { price_inr: null } };
        if (body.unit_key === 'physics-2') return { ok: true, unlocked: true, bundle: bundleFor('physics-2') };
        // locked — free_available is false everywhere now: the per-device claim
        // is dormant, so there is nothing for the client to spend.
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
    // The copy tells the truth under the fixed-free-chapters model: it must NOT
    // say the student spent a free chapter they never had.
    expect(r.text).toContain('Four chapters');
    expect(r.text).not.toContain('already used your free chapter');
    expect(r.text).toContain('coming soon');              // price_inr null = unpriced
    expect(r.claimBtns).toBe(0);                          // nothing to claim
    expect(r.pageText).not.toContain(probes.text.slice(0, 40));

    // The cue lives on the CHAPTER now (2026-08-27), not on every card inside
    // it: the old .cc-chip.pm-lock said the same thing twenty-nine times over
    // and never in the heading or the picker, which are the two places a student
    // actually decides from.
    await page.click('#lockRow .vw-btn');                  // Back to all questions
    await page.waitForSelector('#catalogView:not([hidden])');
    const cues = await page.evaluate(() => ({
        locked: document.querySelectorAll('.cat-lock:not(.free)').length,
        free: document.querySelectorAll('.cat-lock.free').length,
        sections: document.querySelectorAll('.cat-section').length,
        perCard: document.querySelectorAll('.cc-chip.pm-lock').length,
        // Chapters the 2026-27 syllabus lists but nobody has written yet. DERIVED,
        // never a magic offset: there was one on 2026-08-28 (physics Unit 14) and
        // three by the end of the same day (Maths-1A gained Sets and Relations
        // and Sequences and Series), and a hardcoded "- 2" silently rots.
        unwritten: ((window as any).PM_UNITS as any[])
            .filter((u) => !u.questions.some((e: any) => e.question_id)).length,
    }));
    expect(cues.free).toBe(1);                             // physics-2 (Motion in a Straight Line), and only it — the parallelogram card is Unit 3 and stays locked
    expect(cues.unwritten).toBeGreaterThan(0);             // the case this guards is real
    // Every chapter that HAS answers and is not the free one says locked; an
    // unwritten chapter carries no pill at all rather than being sold.
    expect(cues.locked).toBe(cues.sections - 1 - cues.unwritten);
    expect(cues.perCard).toBe(0);                          // the chip this replaced
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
    const raw = JSON.parse(readFileSync(join(process.cwd(), 'answer-book', 'units.json'), 'utf8'));
    // The shipped gated build is the MPC stream, and its bundles are scoped to
    // it (2026-08-27). Compare against the MPC units, not the whole manifest —
    // Botany's absence from content/mpc is the point of the lens, not drift.
    const MPC = new Set(['physics', 'chemistry', 'mathematics', 'mathematics_1b']);
    const streamed = CONTENT_DIR.endsWith('mpc');
    // A retired unit (status:"retired" — Chemistry-I States of Matter, 2026-09-02)
    // is stripped by the build before bundles are written: no bundle, no ids.
    const live = raw.units.filter((u: any) => u.status !== 'retired');
    const manifest = {
        units: streamed
            ? live.filter((u: any) => MPC.has(u.subject || 'physics'))
            : live,
    };
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
    // Derived, never hardcoded: the bank grows (448 -> 652 the day chemistry
    // opened) and a literal here would turn a correct book red.
    const manifestTotal = manifest.units.reduce(
        (n: number, u: any) => n + u.questions.filter((e: any) => e.question_id).length, 0);
    const distinctIds = new Set<string>();
    for (const u of manifest.units) {
        for (const e of u.questions) if (e.question_id) distinctIds.add(e.question_id);
    }
    expect(total).toBe(distinctIds.size);
    expect(manifestTotal).toBeGreaterThanOrEqual(total);   // cuts share one file
});

// -- P4: the paywall ---------------------------------------------------------
// The price is ALWAYS the server's (ab_price_for): founding while slots remain
// or if this device already paid it (grandfathered), list price after. The page
// never names a number, so these gates assert it RENDE₹ what it was told --
// including the two different truths two students can be shown.

const PAY = 'https://pay.test/functions/v1/answerbook-pay';

/** Boot gated with BOTH endpoints routed. */
async function bootPaid(page: any, contentHandler: (b: any) => any, payHandler?: (b: any) => any) {
    await page.addInitScript((bases: { c: string; p: string }) => {
        Object.defineProperty(window, 'PM_CONTENT_BASE', { get: () => bases.c, set: () => {}, configurable: true });
        Object.defineProperty(window, 'PM_PAY_BASE', { get: () => bases.p, set: () => {}, configurable: true });
    }, { c: CONTENT, p: PAY });
    const routes: [string, ((b: any) => any) | undefined][] = [
        ['https://content.test/**', contentHandler],
        ['https://pay.test/**', payHandler],
    ];
    for (const [host, handler] of routes) {
        if (!handler) continue;
        await page.route(host, async (route: any) => {
            const req = route.request();
            if (req.method() === 'OPTIONS') {
                return route.fulfill({ status: 204, headers: {
                    'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type' } });
            }
            return route.fulfill({
                status: 200,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                body: JSON.stringify(handler(JSON.parse(req.postData() || '{}'))),
            });
        });
    }
    await page.goto(URL);
    await page.waitForFunction(() => (window as any).PM_ANSWER);
}

const FOUNDING_SKU = {
    sku: 'full_book', label: 'Every chapter, both subjects',
    price_inr: 99, list_price_inr: 199, founding: true, founding_locked: false,
    founding_slots_left: 500, period_days: 31,
};
const LIST_SKU = { ...FOUNDING_SKU, price_inr: 199, founding: false, founding_slots_left: 0 };
const LOCKED_IN_SKU = { ...FOUNDING_SKU, founding_locked: true, founding_slots_left: 0 };

test('a founding student is quoted ₹99, told places are limited, and that the price stays theirs', async ({ page }) => {
    await bootPaid(page, (b) => {
        if (b.list) return { ok: true, unlocked: [], free_available: false, paid_until: null, sku: FOUNDING_SKU };
        return { ok: true, locked: true, free_available: false, sku: FOUNDING_SKU };
    });
    await page.waitForSelector('#catalogView:not([hidden])');
    await page.evaluate(() => (window as any).PM_ANSWER.openQuestion('ts_ipe_p1_vec_parallelogram_law'));
    await page.waitForSelector('#lockOverlay:not([hidden])');

    const r = await page.evaluate(() => {
        const g = (s: string) => (document.querySelector(s) || { textContent: '' }).textContent || '';
        return {
            text: document.getElementById('lockText')!.textContent || '',
            was: g('#lockPrice .lp-was'), now: g('#lockPrice .lp-now'),
            per: g('#lockPrice .lp-per'), note: g('#lockPrice .lp-note'),
            buttons: [...document.querySelectorAll('#lockRow .vw-btn')].map((b) => b.textContent || ''),
        };
    });
    expect(r.now).toBe('₹99');
    expect(r.per).toContain('31 days');
    expect(r.was).toBe('₹199');                   // what it costs later, struck through
    expect(r.note).toContain('500');              // places left
    expect(r.text).toContain('stays yours');      // the grandfather promise, said out loud
    expect(r.buttons.some((b) => b.includes('₹99'))).toBe(true);
});

test('a later student is quoted ₹199 and never sees the founding pitch', async ({ page }) => {
    await bootPaid(page, (b) => {
        if (b.list) return { ok: true, unlocked: [], free_available: false, paid_until: null, sku: LIST_SKU };
        return { ok: true, locked: true, free_available: false, sku: LIST_SKU };
    });
    await page.waitForSelector('#catalogView:not([hidden])');
    await page.evaluate(() => (window as any).PM_ANSWER.openQuestion('ts_ipe_p1_vec_parallelogram_law'));
    await page.waitForSelector('#lockOverlay:not([hidden])');

    const r = await page.evaluate(() => {
        const g = (s: string) => (document.querySelector(s) || { textContent: '' }).textContent || '';
        return {
            text: document.getElementById('lockText')!.textContent || '',
            was: document.querySelector('#lockPrice .lp-was') ? 'present' : 'absent',
            now: g('#lockPrice .lp-now'), per: g('#lockPrice .lp-per'),
            note: g('#lockPrice .lp-note'),
            buttons: [...document.querySelectorAll('#lockRow .vw-btn')].map((b) => b.textContent || ''),
        };
    });
    expect(r.now).toBe('₹199');
    expect(r.per).toContain('31 days');
    expect(r.was).toBe('absent');                 // nothing to strike: this IS the price
    expect(r.note).toBe('');
    expect(r.text).not.toContain('founding');
    expect(r.buttons.some((b) => b.includes('₹199'))).toBe(true);
});

test('a renewing founder is still quoted their own ₹99', async ({ page }) => {
    await bootPaid(page, (b) => {
        if (b.list) return { ok: true, unlocked: [], free_available: false, paid_until: null, sku: LOCKED_IN_SKU };
        return { ok: true, locked: true, free_available: false, sku: LOCKED_IN_SKU };
    });
    await page.waitForSelector('#catalogView:not([hidden])');
    await page.evaluate(() => (window as any).PM_ANSWER.openQuestion('ts_ipe_p1_vec_parallelogram_law'));
    await page.waitForSelector('#lockOverlay:not([hidden])');
    const r = await page.evaluate(() => {
        const g = (s: string) => (document.querySelector(s) || { textContent: '' }).textContent || '';
        return { text: document.getElementById('lockText')!.textContent || '',
                 now: g('#lockPrice .lp-now'), note: g('#lockPrice .lp-note'),
                 was: document.querySelector('#lockPrice .lp-was') ? 'present' : 'absent' };
    });
    expect(r.now).toBe('₹99');
    expect(r.note).toMatch(/kept for you/i);       // their price, not a countdown
    // The strike STAYS for a grandfathered founder: 199 struck beside their 99
    // is the whole point — it shows what they keep, every renewal.
    expect(r.was).toBe('present');
    expect(r.text).toContain('your own price');
    expect(r.note).not.toContain('students');      // the slot race is over for them
});

test('the unlock tap asks the server for a link and carries the device id', async ({ page }) => {
    const asked: any[] = [];
    await bootPaid(page,
        (b) => b.list
            ? { ok: true, unlocked: [], free_available: false, paid_until: null, sku: FOUNDING_SKU }
            : { ok: true, locked: true, free_available: false, sku: FOUNDING_SKU },
        (b) => { asked.push(b); return { ok: true, url: 'https://rzp.test/paid', price: FOUNDING_SKU }; });
    await page.route('https://rzp.test/**', (route: any) => route.fulfill({
        status: 200, contentType: 'text/html', body: '<html><body>paid</body></html>' }));

    await page.waitForSelector('#catalogView:not([hidden])');
    await page.evaluate(() => (window as any).PM_ANSWER.openQuestion('ts_ipe_p1_vec_parallelogram_law'));
    await page.waitForSelector('#lockOverlay:not([hidden])');
    await page.click('#lockRow .vw-btn.primary');
    await page.waitForFunction(() => location.href.indexOf('rzp.test') >= 0, undefined, { timeout: 8000 });

    expect(asked.length).toBe(1);
    expect(asked[0].device_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(asked[0].price_inr).toBeUndefined();    // the client never proposes an amount
    expect(asked[0].amount).toBeUndefined();
});

test('with a live pass every chapter opens and no lock chip is drawn', async ({ page }) => {
    const until = new Date(Date.now() + 20 * 86400000).toISOString();
    await bootPaid(page, (b) => {
        if (b.list) return { ok: true, unlocked: ['all'], free_available: false, paid_until: until, sku: LOCKED_IN_SKU };
        return { ok: true, unlocked: true, bundle: bundleFor(b.unit_key) };
    });
    await page.waitForSelector('#catalogView:not([hidden])');
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => document.querySelectorAll('.cc-chip.pm-lock').length)).toBe(0);

    await page.evaluate(() => (window as any).PM_ANSWER.openQuestion('ts_ipe_p1_vec_parallelogram_law'));
    await page.waitForSelector('.page', { timeout: 8000 });
    const st = await page.evaluate(() => {
        (window as any).PM_ANSWER.revealAll();
        return (window as any).PM_ANSWER.getState();
    });
    expect(st.marksEarned).toBe(st.marksTotal);
});

test('a payment endpoint that is down never traps the student', async ({ page }) => {
    await bootPaid(page,
        (b) => b.list
            ? { ok: true, unlocked: [], free_available: false, paid_until: null, sku: FOUNDING_SKU }
            : { ok: true, locked: true, free_available: false, sku: FOUNDING_SKU });
    await page.route('https://pay.test/**', (route: any) => route.abort('failed'));
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.waitForSelector('#catalogView:not([hidden])');
    await page.evaluate(() => (window as any).PM_ANSWER.openQuestion('ts_ipe_p1_vec_parallelogram_law'));
    await page.waitForSelector('#lockOverlay:not([hidden])');
    await page.click('#lockRow .vw-btn.primary');
    await page.waitForFunction(() => (document.getElementById('lockText')!.textContent || '').indexOf('try again') >= 0,
        undefined, { timeout: 8000 });

    // and Back still works -- no dead end
    await page.click('#lockRow .vw-btn:not(.primary)');
    await page.waitForSelector('#catalogView:not([hidden])');
    expect(errors).toEqual([]);
});

// ═══ Google accounts — a pass follows the STUDENT, not the phone ═══════════
// Identity was an anonymous device UUID, so a student who paid on their phone
// and opened the book on a laptop met the paywall again. These gates cover the
// client half; the server half (union across an account's devices) is proven by
// the ab_link_device RPC and answerbook-content.

test('the OAuth return is captured, stripped from the URL, and never left in history', async ({ page }) => {
    const errs: string[] = [];
    page.on('pageerror', (e) => errs.push(e.message));
    await page.addInitScript(() => {
        // Cleared to prove a signed-OUT device, then the group choice is put
        // back: this gate is about the OAuth return, not about the door, and a
        // chooser standing in front of the catalog would fail it for the wrong
        // reason.
        try {
            localStorage.clear();
            localStorage.setItem('pm_track_v1', JSON.stringify({ group: 'mpc', year: 'first_year' }));
        } catch { /* file:// */ }
    });
    // exactly the shape Supabase sends back after Google
    await page.goto(URL + '#access_token=TOK_ABC&refresh_token=REF_XYZ&expires_in=3600&token_type=bearer');
    await page.waitForFunction(() => (window as any).PM_ANSWER, undefined, { timeout: 20000 });
    await page.waitForFunction(() => location.hash === '#/', undefined, { timeout: 10000 });

    const r = await page.evaluate(() => ({ href: location.href, hash: location.hash }));
    // A token sitting in the URL gets pasted into a WhatsApp group with the link.
    expect(r.href).not.toContain('access_token');
    expect(r.href).not.toContain('refresh_token');
    expect(r.hash).toBe('#/');                       // and the router got a real route
    // The book still booted — a token blob must never break the catalog. The
    // wait is load-bearing since 2026-08-27: the first catalog paint is held for
    // the entitlement list, because the chapter ORDER is a function of it, so
    // counting cards the instant the hash settles now races the gate.
    await page.waitForSelector('#catalogView:not([hidden])', { timeout: 10000 });
    expect(await page.evaluate(() => document.querySelectorAll('.cat-card').length)).toBeGreaterThan(400);
    expect(errs).toEqual([]);
});

test('a token the server rejects is forgotten; a server that is merely down is not', async ({ page }) => {
    // The distinction that protects a paying student: 401 means this token is
    // no good, but a 500 or a dead network must never sign them out — they would
    // come back to a paywall over a transient blip.
    for (const [status, shouldKeep] of [[401, false], [500, true]] as [number, boolean][]) {
        await page.addInitScript((code: number) => {
            try {
                localStorage.clear();
                localStorage.setItem('pm_ab_at', 'SOME_TOKEN');
                localStorage.setItem('pm_track_v1', JSON.stringify({ group: 'mpc', year: 'first_year' }));
            } catch { /* file:// */ }
            const orig = window.fetch;
            window.fetch = function (input: any, init?: any) {
                const u = typeof input === 'string' ? input : (input && input.url) || '';
                if (u.indexOf('/auth/v1/user') >= 0) {
                    return Promise.resolve(new Response('{}', { status: code }));
                }
                return orig(input, init);
            } as typeof window.fetch;
        }, status);
        await page.goto(URL);
        await page.waitForFunction(() => (window as any).PM_ANSWER, undefined, { timeout: 20000 });
        await page.waitForTimeout(2500);
        const kept = await page.evaluate(() => !!localStorage.getItem('pm_ab_at'));
        expect(kept, `status ${status} should ${shouldKeep ? 'KEEP' : 'DROP'} the token`).toBe(shouldKeep);
    }
});

test('the pricing page offers Google sign-in signed out, and sign-out signed in', async ({ page }) => {
    await bootGated(page, (body) => {
        if (body.list) return { ok: true, unlocked: [], free_available: false, sku: FOUNDING_SKU };
        return { ok: true, locked: true, free_available: false, sku: FOUNDING_SKU };
    });
    await page.waitForSelector('#catalogView:not([hidden])');

    await page.evaluate(() => { location.hash = '#/pricing'; });
    await page.waitForFunction(() => !document.getElementById('lockList')!.hidden, undefined, { timeout: 10000 });
    const out = await page.evaluate(() => ({
        buttons: [...document.querySelectorAll('#lockRow .vw-btn')].map((b) => b.textContent || ''),
        first: (document.querySelector('#lockList li') || { textContent: '' }).textContent || '',
    }));
    expect(out.buttons.some((b) => /Sign in with Google/.test(b))).toBe(true);
    expect(out.first).toMatch(/follows you/i);

    await page.evaluate(() => {
        localStorage.setItem('pm_ab_at', 'TOK');
        localStorage.setItem('pm_ab_email', 'student@example.com');
        location.hash = '#/';
    });
    await page.waitForTimeout(400);
    await page.evaluate(() => { location.hash = '#/pricing'; });
    await page.waitForFunction(() => !document.getElementById('lockList')!.hidden, undefined, { timeout: 10000 });
    const inn = await page.evaluate(() => ({
        buttons: [...document.querySelectorAll('#lockRow .vw-btn')].map((b) => b.textContent || ''),
        first: (document.querySelector('#lockList li') || { textContent: '' }).textContent || '',
    }));
    expect(inn.buttons.some((b) => /Sign out/.test(b))).toBe(true);
    expect(inn.first).toContain('student@example.com');
});

test('signing in is never required — the free chapters work signed out', async ({ page }) => {
    // The anonymous journey is the product's front door and must survive
    // accounts entirely: open a link, read, never sign in.
    await bootGated(page, (body) => {
        if (body.list) return { ok: true, unlocked: ['physics-3'], free_available: false, sku: FOUNDING_SKU };
        if (body.unit_key === 'physics-3') return { ok: true, unlocked: true, bundle: bundleFor('physics-3') };
        return { ok: true, locked: true, free_available: false, sku: FOUNDING_SKU };
    });
    await page.waitForSelector('#catalogView:not([hidden])');
    expect(await page.evaluate(() => !!localStorage.getItem('pm_ab_at'))).toBe(false);
    await page.evaluate(() => (window as any).PM_ANSWER.openQuestion('ts_ipe_p1_vec_parallelogram_law'));
    await page.waitForSelector('.page', { timeout: 10000 });
    const st = await page.evaluate(() => {
        (window as any).PM_ANSWER.revealAll();
        return (window as any).PM_ANSWER.getState();
    });
    expect(st.marksEarned).toBe(st.marksTotal);
});

test('the account chip shows signed-out, then signed-in, and dismisses', async ({ page }) => {
    // Students had no way to tell whether signing in had worked — the book looked
    // identical either way, so the honest read was "it did nothing".
    await bootGated(page, (body) => {
        if (body.list) return { ok: true, unlocked: [], free_available: false, sku: FOUNDING_SKU };
        return { ok: true, locked: true, free_available: false, sku: FOUNDING_SKU };
    });
    await page.waitForSelector('#catalogView:not([hidden])');

    const chip = await page.evaluate(() => {
        const b = document.getElementById('btnAccount') as HTMLElement;
        return { hidden: b.hidden, text: (b.textContent || '').trim() };
    });
    expect(chip.hidden).toBe(false);
    expect(chip.text).toBe('Sign in');

    await page.click('#btnAccount');
    const card = await page.evaluate(() => ({
        hidden: (document.getElementById('acctCard') as HTMLElement).hidden,
        action: document.getElementById('acctAction')!.textContent,
    }));
    expect(card.hidden).toBe(false);
    expect(card.action).toMatch(/Sign in with Google/);

    // tapping outside dismisses it — a card only closable by its own control
    // reads as stuck on a phone
    await page.click('#catalogView', { position: { x: 5, y: 5 } });
    expect(await page.evaluate(() => (document.getElementById('acctCard') as HTMLElement).hidden)).toBe(true);
});

test('signed in, the chip becomes the student\'s initial and offers sign out', async ({ page }) => {
    await page.addInitScript(() => {
        try {
            localStorage.setItem('pm_ab_at', 'TOK');
            localStorage.setItem('pm_ab_email', 'pradeep@example.com');
        } catch { /* file:// */ }
        // Stub the profile lookup. A fake token is correctly REJECTED and signed
        // out — that is the behaviour, not a bug — and this test is about the
        // chip, so it needs a server that says the session is good.
        const orig = window.fetch;
        window.fetch = function (input: any, init?: any) {
            const u = typeof input === 'string' ? input : (input && input.url) || '';
            if (u.indexOf('/auth/v1/user') >= 0) {
                return Promise.resolve(new Response(JSON.stringify({ id: 'x', email: 'pradeep@example.com' }), { status: 200 }));
            }
            return orig(input, init);
        } as typeof window.fetch;
    });
    await bootGated(page, (body) => {
        if (body.list) return { ok: true, unlocked: [], free_available: false, signed_in: true, devices: 2, sku: FOUNDING_SKU };
        return { ok: true, locked: true, free_available: false, sku: FOUNDING_SKU };
    });
    await page.waitForSelector('#catalogView:not([hidden])');
    await page.waitForFunction(() => (document.getElementById('btnAccount')!.textContent || '').trim() === 'P',
        undefined, { timeout: 8000 });

    const b = await page.evaluate(() => {
        const e = document.getElementById('btnAccount') as HTMLElement;
        return { text: (e.textContent || '').trim(), cls: e.className, title: e.title };
    });
    expect(b.text).toBe('P');
    expect(b.cls).toContain('is-in');
    expect(b.title).toBe('pradeep@example.com');

    await page.click('#btnAccount');
    const c = await page.evaluate(() => ({
        email: document.getElementById('acctEmail')!.textContent,
        action: document.getElementById('acctAction')!.textContent,
    }));
    expect(c.email).toBe('pradeep@example.com');
    expect(c.action).toBe('Sign out');
});

test('the price shows as a price: 199 struck through, 99 big', async ({ page }) => {
    // A sentence saying "it later costs 199" gets read past. A struck-through
    // number does not. Values still come from the server; only the look is here.
    await bootGated(page, (body) => {
        if (body.list) return { ok: true, unlocked: [], free_available: false, sku: FOUNDING_SKU };
        return { ok: true, locked: true, free_available: false, sku: FOUNDING_SKU };
    });
    await page.waitForSelector('#catalogView:not([hidden])');
    await page.evaluate(() => { location.hash = '#/pricing'; });
    await page.waitForSelector('#lockPrice:not([hidden])', { timeout: 10000 });

    const p = await page.evaluate(() => {
        const was = document.querySelector('#lockPrice .lp-was') as HTMLElement;
        const now = document.querySelector('#lockPrice .lp-now') as HTMLElement;
        return {
            was: was.textContent, now: now.textContent,
            note: (document.querySelector('#lockPrice .lp-note') || { textContent: '' }).textContent,
            struck: getComputedStyle(was).textDecorationLine,
            wasPx: parseFloat(getComputedStyle(was).fontSize),
            nowPx: parseFloat(getComputedStyle(now).fontSize),
        };
    });
    expect(p.was).toBe('₹199');
    expect(p.struck).toContain('line-through');       // struck, not merely grey
    expect(p.now).toBe('₹99');
    expect(p.nowPx).toBeGreaterThan(p.wasPx);          // and it is the bigger number
    expect(p.note).toMatch(/First \d+ students/);

    // a student who already holds the founding price is not shown a fake discount
    await page.evaluate(() => { location.hash = '#/'; });
    await bootGated(page, (body) => {
        const locked = { ...FOUNDING_SKU, founding: false, founding_locked: true };
        if (body.list) return { ok: true, unlocked: [], free_available: false, sku: locked };
        return { ok: true, locked: true, free_available: false, sku: locked };
    });
    await page.waitForSelector('#catalogView:not([hidden])');
    await page.evaluate(() => { location.hash = '#/pricing'; });
    await page.waitForSelector('#lockPrice:not([hidden])', { timeout: 10000 });
    const q = await page.evaluate(() => ({
        was: document.querySelector('#lockPrice .lp-was') ? 'present' : 'absent',
        note: (document.querySelector('#lockPrice .lp-note') || { textContent: '' }).textContent,
    }));
    expect(q.was).toBe('absent');                      // nothing to strike through
    expect(q.note).toMatch(/kept for you/i);
});


// ═══ THE DOOR, THE ORDER, AND THE PRINT BUTTON (founder, 2026-08-27) ═══════
// Three changes to what a student meets on the other side of a WhatsApp link:
// a group-and-year chooser in front of the bare landing route, chapters they
// can open sorted above the ones they cannot, and no way to print a paid book.

/** The four chapters flagged `free` in ab_content — one per subject, and never
    the first chapter of any of them, which is the whole reason the order had to
    change. */
// Maths-1A's Addition of Vectors moved from chapter 4 to 6 when the 2026-27 book
// inserted Sets and Relations at 1 and Sequences and Series at 3 (2026-08-28).
const FREE_UNITS = ['physics-3', 'chemistry-3', 'mathematics-6', 'mathematics_1b-3'];
const SKU_99 = {
    sku: 'full_book', price_inr: 99, list_price_inr: 199, founding: true,
    founding_locked: false, founding_slots_left: 486, period_days: 31,
};

/** A student who has never chosen a group. Registered after the beforeEach
    seed, so this wins. */
async function forgetTrack(page: any) {
    await page.addInitScript(() => {
        try {
            // Once. A reload must show what the STUDENT left behind, not what
            // the fixture keeps re-imposing — two of these gates assert exactly
            // that a choice and a tap survive coming back.
            if (localStorage.getItem('pm_door_gate') === '1') return;
            localStorage.setItem('pm_door_gate', '1');
            localStorage.removeItem('pm_track_v1');
            localStorage.removeItem('pm_soon_asked');
        } catch { /* file:// */ }
    });
}

/** Boot with the entitlement list answering `unlocked`, which is what decides
    the catalog's ORDER now, not only its lock cues. */
async function bootWith(page: any, unlocked: string[]) {
    await bootGated(page, (body: any) => {
        if (body.list) {
            return { ok: true, unlocked, free_available: false, signed_in: false, devices: 1, sku: SKU_99 };
        }
        if (unlocked.indexOf(body.unit_key) >= 0 || unlocked[0] === 'all') {
            return { ok: true, unlocked: true, bundle: bundleFor(body.unit_key) };
        }
        return { ok: true, locked: true, free_available: false, sku: SKU_99 };
    });
    await page.waitForSelector('#catalogView:not([hidden])');
}

const heads = (page: any) =>
    page.$$eval('.cat-section h2', (ns: Element[]) =>
        ns.map((n) => (n.textContent || '').replace(/\s+/g, ' ').trim()));

test('a student who has never chosen meets the door, not the catalog', async ({ page }) => {
    await forgetTrack(page);
    await page.goto(URL);
    await page.waitForFunction(() => (window as any).PM_ANSWER);
    await page.waitForSelector('#doorView:not([hidden])');

    expect(await page.evaluate(() => document.getElementById('catalogView')!.hidden)).toBe(true);
    const groups = await page.$$eval('[data-door-group]', (ns: Element[]) =>
        ns.map((n) => n.getAttribute('data-door-group')));
    // All three groups are offered even though two are unbuilt: a BiPC student
    // has to be able to see that theirs is coming, which is the whole point.
    expect(groups).toEqual(['mpc', 'bipc', 'mec']);
});

test('a group, then a year, then the book — and the choice survives a reload', async ({ page }) => {
    await forgetTrack(page);
    // bootGated, not bootWith: the catalog is behind the door here, so waiting
    // for it before choosing would simply time out.
    await bootGated(page, (body: any) => (body.list
        ? { ok: true, unlocked: FREE_UNITS, free_available: false, sku: SKU_99 }
        : { ok: true, locked: true, sku: SKU_99 }));
    await page.waitForSelector('#doorView:not([hidden])');

    await page.click('[data-door-group="mpc"]');
    await page.waitForSelector('#doorStep2:not([hidden])');
    await page.click('button[data-door-year="first_year"]');
    await page.waitForSelector('#catalogView:not([hidden])');

    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('pm_track_v1') || 'null'));
    expect(saved).toMatchObject({ group: 'mpc', year: 'first_year' });

    // and it is not asked again
    await page.reload();
    await page.waitForFunction(() => (window as any).PM_ANSWER);
    await page.waitForSelector('#catalogView:not([hidden])');
    expect(await page.evaluate(() => document.getElementById('doorView')!.hidden)).toBe(true);
});

test('a link to an answer never passes through the door', async ({ page }) => {
    // The product travels between students as a link to one answer. A chooser
    // standing in front of a forwarded answer would cost us exactly the reader
    // it was built to keep.
    await forgetTrack(page);
    await bootGated(page, (body: any) => {
        if (body.list) return { ok: true, unlocked: FREE_UNITS, free_available: false, sku: SKU_99 };
        if (body.unit_key === 'physics-3') return { ok: true, unlocked: true, bundle: bundleFor('physics-3') };
        return { ok: true, locked: true, sku: SKU_99 };
    });
    await page.evaluate(() => { location.hash = '#/q/ts_ipe_p1_vec_parallelogram_law'; });
    await page.waitForSelector('.page', { timeout: 10000 });

    expect(await page.evaluate(() => document.getElementById('doorView')!.hidden)).toBe(true);
    expect(await page.evaluate(() => document.getElementById('notebookView')!.hidden)).toBe(false);
});

test('every group reaches the year step, and only MPC first year opens anything', async ({ page }) => {
    await forgetTrack(page);
    await page.goto(URL);
    await page.waitForFunction(() => (window as any).PM_ANSWER);
    await page.waitForSelector('#doorView:not([hidden])');

    for (const group of ['bipc', 'mec']) {
        await page.click(`[data-door-group="${group}"]`);
        await page.waitForSelector('#doorStep2:not([hidden])');
        const years = await page.$$eval('[data-door-year]', (ns: Element[]) =>
            ns.map((n) => ({ id: n.getAttribute('data-door-year'), tag: n.tagName, text: n.textContent || '' })));
        expect(years.map((y) => y.id)).toEqual(['first_year', 'second_year']);
        // Not one of them is pressable: a div, never a button, so nothing looks
        // like a door that does not open.
        expect(years.every((y) => y.tag === 'DIV')).toBe(true);
        expect(years.every((y) => /Coming soon/.test(y.text))).toBe(true);
        await page.click('#doorBack');
        await page.waitForSelector('#doorStep1:not([hidden])');
    }

    await page.click('[data-door-group="mpc"]');
    await page.waitForSelector('#doorStep2:not([hidden])');
    const mpc = await page.$$eval('[data-door-year]', (ns: Element[]) =>
        ns.map((n) => n.tagName + ':' + n.getAttribute('data-door-year')));
    expect(mpc).toEqual(['BUTTON:first_year', 'DIV:second_year']);
    // and nothing was stored by merely looking around
    expect(await page.evaluate(() => localStorage.getItem('pm_track_v1'))).toBeNull();
});

test('the coming-soon tap answers the student, and stays answered', async ({ page }) => {
    await forgetTrack(page);
    await page.goto(URL);
    await page.waitForFunction(() => (window as any).PM_ANSWER);
    await page.waitForSelector('#doorView:not([hidden])');
    await page.click('[data-door-group="bipc"]');
    await page.waitForSelector('#doorStep2:not([hidden])');

    const btn = page.locator('[data-soon="bipc_first_year"]');
    await expect(btn).toHaveText(/Tell me when/i);
    await btn.click();
    // A control that visibly does nothing reads as broken, and is never tapped twice.
    await expect(btn).toHaveText(/Noted/i);
    expect(await btn.isDisabled()).toBe(true);

    const asked = await page.evaluate(() => JSON.parse(localStorage.getItem('pm_soon_asked') || '{}'));
    expect(asked).toMatchObject({ bipc_first_year: 1 });

    // still answered when they come back — the promise has to outlive the tap
    await page.reload();
    await page.waitForFunction(() => (window as any).PM_ANSWER);
    await page.waitForSelector('#doorView:not([hidden])');
    await page.click('[data-door-group="bipc"]');
    await expect(page.locator('[data-soon="bipc_first_year"]')).toHaveText(/Noted/i);
});

test('the chapters a student can open come first, in the list and in the picker', async ({ page }) => {
    await bootWith(page, FREE_UNITS);
    await page.selectOption('#subjectSelect', 'physics');

    const h = await heads(page);
    // physics-3 is the free one; 1 and 2 are locked and used to come first.
    expect(h[0]).toContain('Motion in a Plane');
    expect(h[0]).toContain('Free');
    const firstLocked = h.findIndex((s: string) => s.includes('Locked'));
    const lastFree = h.map((s: string) => s.includes('Free')).lastIndexOf(true);
    expect(firstLocked).toBeGreaterThan(-1);
    expect(lastFree).toBeLessThan(firstLocked);

    // The picker was the ONE surface carrying no lock signal at all — a student
    // chose "Physical World" off a clean-looking list and only found out inside.
    const opts = await page.$$eval('#unitSelect option', (ns: Element[]) => ns.map((n) => n.textContent || ''));
    expect(opts[0]).toContain('All chapters');
    expect(opts[1]).toContain('Motion in a Plane');
    expect(opts[1]).not.toContain('🔒');
    // Every remaining option that HAS answers is locked. A chapter with none
    // written yet (physics Unit 14, 2026-08-28) sorts last and carries no lock:
    // there is nothing in it to unlock (see "never sold as locked" below).
    const unwritten = 'Physics of Emerging Technologies';
    expect(opts.slice(2).every((o: string) => o.includes('🔒') || o.includes(unwritten))).toBe(true);
    expect(opts[opts.length - 1]).toContain(unwritten);      // and it is last

    // the lock moved UP to the chapter; it is no longer repeated on every card
    expect(await page.locator('.cc-chip.pm-lock').count()).toBe(0);
});

test('the offer is drawn once, immediately below the last chapter that opens', async ({ page }) => {
    await bootWith(page, FREE_UNITS);
    expect(await page.locator('.cat-wall').count()).toBe(1);

    const shape = await page.evaluate(() => {
        const kids = Array.from(document.getElementById('catSections')!.children);
        const i = kids.findIndex((n) => n.classList.contains('cat-wall'));
        const txt = (n: Element | undefined) => (n ? (n.textContent || '').replace(/\s+/g, ' ') : '');
        return {
            i,
            before: txt(kids[i - 1]).slice(0, 80),
            after: txt(kids[i + 1]).slice(0, 80),
            title: (document.querySelector('.cat-wall-title') || { textContent: '' }).textContent,
            // what the wall may claim: chapters with at least one written answer
            // (notebook.js sellableUnits) — derived, because the bank grows and a
            // literal here went stale twice (37 → 42 → 41 within a week).
            sellable: ((window as any).PM_UNITS as any[]).filter((u) => u.questions.some((e: any) => e.question_id)).length,
        };
    });
    expect(shape.i).toBe(4);                       // the four free chapters, then the offer
    expect(shape.before).toContain('Free');
    expect(shape.after).toContain('Locked');
    // The number is the server's (ab_price_for), never one the client invented.
    expect(shape.title).toContain('₹99');
    // Chapters that HAVE answers. The catalog lists more (the 2026-27 syllabus
    // added chapters nobody has written yet); the offer counts only what the
    // pass can actually open.
    expect(shape.sellable).toBeGreaterThan(0);
    expect(shape.title).toContain(shape.sellable + ' chapters');
});

test('with a pass the order is untouched and no lock cue is drawn', async ({ page }) => {
    await bootWith(page, ['all']);
    const h = await heads(page);
    expect(h[0]).toContain('Physical World');      // units.json order, exactly as before
    expect(await page.locator('.cat-wall').count()).toBe(0);
    expect(await page.locator('.cat-lock').count()).toBe(0);
    const opts = await page.$$eval('#unitSelect option', (ns: Element[]) => ns.map((n) => n.textContent || ''));
    expect(opts.some((o: string) => o.includes('🔒'))).toBe(false);
});

test('a server that never answers costs a moment, not the catalog, and invents no cue', async ({ page }) => {
    // The order is a function of the entitlement list, so the first paint waits
    // for it. A dead endpoint must therefore still end in a catalog — in
    // units.json order, with nothing claimed about what is locked.
    await page.addInitScript((base: string) => {
        Object.defineProperty(window, 'PM_CONTENT_BASE', {
            get: () => base, set: () => {}, configurable: true,
        });
    }, CONTENT);
    await page.route('https://content.test/**', (route: any) => route.abort('failed'));
    await page.goto(URL);
    await page.waitForFunction(() => (window as any).PM_ANSWER);
    await page.waitForSelector('#catalogView:not([hidden])', { timeout: 8000 });

    const h = await heads(page);
    expect(h[0]).toContain('Physical World');
    expect(await page.locator('.cat-lock').count()).toBe(0);
    expect(await page.locator('.cat-wall').count()).toBe(0);
});

test('an answer opens, and there is no way to print it', async ({ page }) => {
    await bootWith(page, FREE_UNITS);
    await page.evaluate(() => (window as any).PM_ANSWER.openQuestion('ts_ipe_p1_vec_parallelogram_law'));
    await page.waitForSelector('.page', { timeout: 8000 });
    await page.waitForSelector('#notebookView:not([hidden])');

    expect(await page.locator('#btnPrint').count()).toBe(0);
    const visible = await page.$$eval('.topbar button, .topbar a', (ns: Element[]) =>
        ns.filter((n) => !(n as HTMLElement).hidden).map((n) => (n.textContent || '').trim()));
    expect(visible.join(' | ')).not.toMatch(/print/i);
    // the answer itself still works — the listener went with the button, and an
    // unguarded getElementById left behind would have taken the whole script down
    const st = await page.evaluate(() => {
        (window as any).PM_ANSWER.revealAll();
        return (window as any).PM_ANSWER.getState();
    });
    expect(st.marksEarned).toBe(st.marksTotal);
});


test('a forwarded link to a retired card shows the syllabus sheet and never asks the server', async ({ page }) => {
    // Chemistry-I States of Matter left the 2026-27 syllabus (2026-09-02). Its cards
    // still ship as gated skeletons so a forwarded #/q link resolves, but the unit
    // has no bundle on the server and nothing to sell: the lock flow must never
    // run for it, and the sheet must say why, plainly, with only the way back.
    const asked: string[] = [];
    await bootGated(page, (body: any) => {
        if (body.list) return { ok: true, unlocked: FREE_UNITS, free_available: false, signed_in: false, devices: 1, sku: SKU_99 };
        asked.push(body.unit_key);
        return { ok: true, locked: true, free_available: false, sku: SKU_99 };
    });
    await page.waitForSelector('#catalogView:not([hidden])');

    await page.evaluate(() => (window as any).PM_ANSWER.openQuestion('ts_ipe_c1_som_aqueous_tension'));
    await page.waitForSelector('#lockOverlay:not([hidden])');
    const r = await page.evaluate(() => ({
        text: document.getElementById('lockText')!.textContent || '',
        buttons: [...document.querySelectorAll('#lockRow button')].map((b) => b.textContent || ''),
        primary: document.querySelectorAll('#lockRow .vw-btn.primary').length,
        listed: ((window as any).PM_UNITS as any[]).some((u) => u.name.includes('States of Matter')),
    }));
    expect(r.text).toContain('Not in the 2026-27 syllabus');
    expect(r.text).toContain('States of Matter');
    expect(r.text).not.toContain('Four chapters');        // not the lock copy
    expect(r.primary).toBe(0);                            // nothing to buy or claim
    expect(r.buttons).toEqual(['Back to all questions']);
    expect(r.listed).toBe(false);                         // and the chapter is offered nowhere
    expect(asked).not.toContain('chemistry-99');          // the server was never asked for it
    expect(asked.filter((k) => k.startsWith('chemistry-')).length).toBe(0);
});

test('a chapter with nothing written yet is never sold as locked', async ({ page }) => {
    // Physics Unit 14 "Physics of Emerging Technologies" is listed for the
    // chapter's true shape (2026-08-28) but has no answers yet. Labelling it
    // Locked would invite a student to pay for an empty chapter, and counting
    // its coming-soon rows into the offer would overstate what the pass buys.
    await bootWith(page, FREE_UNITS);
    await page.selectOption('#subjectSelect', 'physics');
    await page.waitForTimeout(150);

    const r = await page.evaluate(() => {
        const heads = [...document.querySelectorAll('#catSections h2')].map((h) => h.textContent || '');
        const u14 = heads.find((h) => h.includes('Physics of Emerging Technologies')) || '';
        const wall = document.querySelector('.cat-wall-sub')?.textContent || '';
        const units = (window as any).PM_UNITS as any[];
        // what the offer may honestly claim: authored answers in locked chapters
        let sellable = 0;
        for (const u of units) {
            const ready = u.questions.filter((e: any) => e.question_id).length;
            if (ready > 0) sellable += ready;
        }
        return { u14, wall, sellable };
    });

    expect(r.u14).toMatch(/0 of \d+ ready/);        // listed honestly (15 rows since 2026-09-02)
    expect(r.u14).not.toContain('Locked');         // never sold
    expect(r.u14).not.toContain('Free');           // and never promised either
    const claimed = Number((r.wall.match(/^(\d+)/) || [])[1]);
    expect(claimed).toBeGreaterThan(0);
    expect(claimed).toBeLessThanOrEqual(r.sellable);   // never promises answers that do not exist
});
