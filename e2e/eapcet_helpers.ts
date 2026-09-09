/**
 * eapcet_helpers.ts — the fixture release and the page helpers the EAPCET
 * finder's e2e specs share (eapcet_app.spec.ts on the fixture,
 * eapcet_students.spec.ts on the real release).
 *
 * The fixture has three chapters: one open with audited routes and shapes
 * (every question carries an application mistake with a route and a
 * calculation mistake without one; every fifth is a theory question), one
 * open with neither (the other nine chapters of the real release), and one
 * closed. The strings below are what the leak tests look for.
 */
import { expect, type Page } from '@playwright/test';

export const OPEN_KEY = 'p1-05';        // open; routes audited; shapes authored
export const PLAIN_KEY = 'p1-08';       // open; no routes, no shapes
export const CLOSED_KEY = 'p1-02';      // closed: five verified
export const SHA = 'f'.repeat(64);
export const STEP_TEXT = 'Differentiate the displacement with respect to time to get the velocity.';
export const MISTAKE_APP = 'Using the final force as if it were constant over the motion.';
export const MISTAKE_CALC = 'Dropping the factor of one half when squaring the time.';
export const ROUTE_RIGHT = 'I found the force from the acceleration first';
export const ROUTE_APP = 'I used the force at the end for the whole motion';
export const SHAPES = [
    { key: 'work_from_force', label: 'Work from a force equation' },
    { key: 'power_at_instant', label: 'Power at an instant' },
    { key: 'energy_change', label: 'Change in kinetic energy' },
];
const DIFFS = ['easy', 'medium', 'hard'];

export type PublicQuestion = {
    id: string; answer: number; asked_label: string; q_no: number; has_routes: boolean; theory: boolean;
    option_types: Record<string, string>; routes?: { id: string; text: string; type: string | null; option: number | null }[];
    shape?: { key: string; label: string };
};

function solution(id: string, option: number, i: number, routed: boolean, theory: boolean) {
    const app = option % 4 + 1;
    const calc = (option + 1) % 4 + 1;
    return {
        schema: 'eapcet_solution_v1', question_id: id,
        approach: 'Work equals the change in kinetic energy over the interval.',
        steps: [{ text: STEP_TEXT, equation: 'v = t²' }, { text: 'Evaluate the work done.', equation: 'W = 24 J' }],
        final_answer: { option, value: '24 J' }, confidence: 'sure',
        common_mistakes: [
            { option: app, text: MISTAKE_APP, ...(routed ? { type: 'application', route: ROUTE_APP } : {}) },
            { option: calc, text: MISTAKE_CALC, ...(routed ? { type: 'calculation', route: null } : {}) },
        ],
        concept_tags: ['work-energy theorem'], difficulty: DIFFS[i % 3], mistake_type_hint: theory ? 'concept' : 'application',
        ...(routed ? { right_route: theory ? null : ROUTE_RIGHT } : {}),
        authored_by: { model: 'sonnet', wave: 1, agent: 'W01-A-p1-05', at: '2026-09-09T10:00:00+05:30' },
    };
}

export function chapter(key: string, name: string, order: number, n: number, verified: number, date: string,
    opts: { routed?: boolean; shaped?: boolean; theoryEvery?: number } = {}) {
    const ids = Array.from({ length: n }, (_, i) => `tg_eapcet_2023_${date}_fn_q${String(81 + i).padStart(3, '0')}`);
    const questions: Record<string, unknown> = {};
    ids.forEach((id, i) => {
        const answer = (i % 4) + 1;
        const theory = !!opts.theoryEvery && i % opts.theoryEvery === 0;
        const q: Record<string, unknown> = {
            id, chapter_key: key, chapter: name, year: 2023, date: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`,
            session: 'FN', q_no: 81 + i, asked_label: `TG EAPCET 2023, ${i < 8 ? '12 May' : '13 May'}, morning, Q${81 + i}`,
            question_en: `${name} question ${i + 1}: a body moves so that s = t³/3. The work done in the first two seconds is`,
            options_en: ['32 J', '3.8 J', '5.2 J', '24 J'], answer, recurrence: i % 3, twin_of: [],
            grounding: { answer_book_cards: [], weak_match: true, unit_cards: 0 },
            ...(opts.shaped ? { shape: SHAPES[i % SHAPES.length] } : {}),
        };
        if (i < verified) {
            q.solution = solution(id, answer, i, !!opts.routed, theory);
            q.verified = {
                gate_sha: SHA, audit_verdict: 'ok', audited_by: 'W01-U-' + key, spot_checked: false,
                routes: opts.routed ? { routes_sha: SHA, audit_verdict: 'ok', audited_by: 'W01-V-' + key } : null,
            };
        }
        questions[id] = q;
    });
    const siblings: Record<string, string[]> = {};
    ids.forEach((id, i) => { siblings[id] = ids.filter((_, j) => j !== i).slice(0, 6); });
    return {
        chapter: {
            key, name, paper: 'first_year', order, answer_book_unit: { subject: 'physics', number: order },
            asked_total: 40, share_pct: 4.0, per_exam: 1.5, eligible: n, pool_ids: ids, verified_ids: ids.slice(0, verified),
            open: verified >= 13, closed_because: verified >= 13 ? null : `${verified} of 13 verified`,
            ...(opts.shaped ? { shapes: SHAPES } : {}),
        },
        questions, siblings,
    };
}

export function fixture() {
    const a = chapter(OPEN_KEY, 'Work Power Energy', 5, 15, 13, '20230512', { routed: true, shaped: true, theoryEvery: 5 });
    const b = chapter(CLOSED_KEY, 'Motion in a Straight Line', 2, 15, 5, '20230513');
    const c = chapter(PLAIN_KEY, 'Gravitation', 8, 14, 13, '20230514');
    return {
        schema: 'eapcet_physics_pool_v1',
        built_from: { bank: 'eapcet/bank/physics_v1.json', bank_sha256: SHA, bank_rows: 1041, selector_version: 1,
            built_at: '2026-09-08T02:00:00+05:30', release_at: '2026-09-08T03:00:00+05:30', open_at: 13, gated: 44, verified: 31, shapes_sha256: SHA },
        exam: { shifts: 26, physics_per_shift: 40 },
        rules: { exclude: ['needs_figure'], twin_jaccard: 0.85, recurrence_jaccard_digits_masked: 0.5, target_per_chapter: 15, siblings: 6 },
        chapters: [b.chapter, a.chapter, c.chapter],
        questions: { ...a.questions, ...b.questions, ...c.questions },
        siblings: { ...a.siblings, ...b.siblings, ...c.siblings },
    };
}

// ── page helpers ─────────────────────────────────────────────────────────────

/** Requests that are not the page itself or the font stylesheet the shell links. */
export function watchRequests(page: Page): string[] {
    const seen: string[] = [];
    page.on('request', (r) => {
        const u = r.url();
        if (u.startsWith('file:') || /fonts\.(googleapis|gstatic)\.com/.test(u)) return;
        seen.push(u);
    });
    return seen;
}

/** A clock only the test moves: Date.now() = the instant the page loaded +
    skew, frozen otherwise. Installed before the page scripts, so
    Run.shown()/Run.pick() read it and `ms` is exactly what the test says. */
export async function installClock(page: Page): Promise<void> {
    await page.addInitScript(() => {
        const w = window as any;
        w.__epSkew = 0;
        const base = Date.now();
        Date.now = () => base + w.__epSkew;
    });
}
export async function advance(page: Page, ms: number): Promise<void> {
    await page.evaluate((n) => { (window as any).__epSkew += n; }, ms);
}
/** Pin the draw: the run is seeded on ep_session. */
export async function pinSeed(page: Page, seed: string): Promise<void> {
    await page.addInitScript((s) => { try { localStorage.setItem('ep_session', s); } catch { /* file:// */ } }, seed);
}

export async function open(page: Page, url: string, hash = '#/'): Promise<void> {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
    await page.goto(url + hash);
    await page.waitForSelector('main');
}

/** The card on screen and the public question behind it, from the page's own pool. */
export async function currentCard(page: Page): Promise<PublicQuestion> {
    const qid = (await page.locator('.ep-card[data-qid]').last().getAttribute('data-qid')) || '';
    expect(qid).toBeTruthy();
    return await page.evaluate((id) => (window as any).EP_POOL.questions[id], qid) as PublicQuestion;
}

export type Pick = 'key' | 'app' | 'calc' | 'other';
/** An option by what the release says about it: the key, the application-
    labelled wrong option, the calculation-labelled one, or an unexplained one. */
export function pickFor(q: PublicQuestion, kind: Pick): number {
    if (kind === 'key') return q.answer;
    const types = q.option_types || {};
    const labelled = (t: string) => Number(Object.keys(types).find((o) => types[o] === t || (t === 'calculation' && types[o] === 'careless')) || 0);
    if (kind === 'app') return labelled('application') || labelled('concept') || (q.answer % 4) + 1;
    if (kind === 'calc') return labelled('calculation') || ((q.answer + 1) % 4) + 1;
    for (let o = 1; o <= 4; o++) if (o !== q.answer && !types[String(o)]) return o;
    return (q.answer % 4) + 1;
}

/** The route ids this question's menu offers (Run.routesOf), so a script can
    say 'r' and get 'sure' on a question with no menu. */
export async function menuOf(page: Page, qid: string): Promise<string[]> {
    return await page.evaluate((id) => (window as any).Run.routesOf((window as any).EP_POOL.questions[id]), qid) as string[];
}
export function resolveRoute(menu: string[], want: string): string {
    if (menu.includes(want)) return want;
    if (want === 'guess') return 'guess';
    return menu.includes('sure') ? 'sure' : menu[0];
}

export type Intent = 'solid' | 'slip' | 'wrong_route' | 'mismatch' | 'guess_right' | 'guess_wrong' | 'belief' | 'unlabelled';
/** `label` is the type the release gives the option picked (careless counts as
    calculation), null when the option is unexplained: it decides the type of a
    wrong route, exactly as the engine reads it. */
export type Played = { qid: string; theory: boolean; intent: Intent; picked: number; route: string; label: string | null };
export function labelOf(q: PublicQuestion, picked: number): string | null {
    const t = (q.option_types || {})[String(picked)];
    return t ? (t === 'careless' ? 'calculation' : t) : null;
}

/** One step of a scripted run: what the student means to do, resolved against
    the card on screen. On a theory question every wrong intent becomes a sure
    wrong belief. `wait` moves the clock before the pick. */
export async function playStep(page: Page, intent: Intent, wait = 40000, chips = '#runChips'): Promise<Played> {
    const q = await currentCard(page);
    const menu = await menuOf(page, q.id);
    const routed = menu.includes('r');
    let want: Intent = intent;
    if (!routed && (intent === 'slip' || intent === 'wrong_route' || intent === 'mismatch' || intent === 'unlabelled')) want = 'belief';
    let picked: number, route: string;
    switch (want) {
        case 'solid': picked = q.answer; route = 'r'; break;
        case 'guess_right': picked = q.answer; route = 'guess'; break;
        case 'guess_wrong': picked = pickFor(q, 'other'); route = 'guess'; break;
        case 'slip': picked = pickFor(q, 'calc'); route = 'r'; break;
        case 'unlabelled': picked = pickFor(q, 'other'); route = 'r'; break;
        case 'wrong_route': picked = pickFor(q, 'app'); route = 'm0'; break;
        case 'mismatch': picked = pickFor(q, 'app'); route = 'r'; break;
        default: picked = pickFor(q, 'app'); route = 'sure';                     // belief
    }
    route = resolveRoute(menu, route);
    if (wait) await advance(page, wait);
    await page.locator('.ep-card[data-qid]').last().locator(`.ep-opt[data-option="${picked}"]`).click();
    await expect(page.locator(`${chips} .ep-chip`)).toHaveCount(menu.length);
    await page.locator(`${chips} .ep-chip[data-route="${route}"]`).click();
    return { qid: q.id, theory: !routed, intent: want, picked, route, label: labelOf(q, picked) };
}

export async function playRun(page: Page, intents: Intent[], wait = 40000): Promise<Played[]> {
    const out: Played[] = [];
    for (const it of intents) out.push(await playStep(page, it, wait));
    return out;
}

/** What a played script means, without the engine: counts per parameter and
    the verdict rule (a type at two, ties concept > application > calculation;
    else guessing at three; else solid at eight right; else nothing). */
export function expectation(played: Played[], rushed = false) {
    const params = { concept: 0, application: 0, calculation: 0, guessed: 0, rushed: 0 };
    let score = 0, wrong = 0, mismatches = 0, confirmed = 0, typed = 0;
    for (const p of played) {
        const right = p.intent === 'solid' || p.intent === 'guess_right';
        if (right) score++; else wrong++;
        if (p.intent === 'guess_right' || p.intent === 'guess_wrong') params.guessed++;
        if (!right && rushed) params.rushed++;
        if (p.intent === 'slip' || p.intent === 'unlabelled') { params.calculation++; typed++; if (p.intent === 'slip') confirmed++; }
        if (p.intent === 'wrong_route' || p.intent === 'mismatch') {
            // the option decides the type: a concept-labelled option is a concept mistake whatever route was claimed
            const t = p.label === 'concept' ? 'concept' : 'application';
            params[t]++; typed++; confirmed++;
        }
        if (p.intent === 'belief') { params.concept++; typed++; confirmed++; }
        if (p.intent === 'mismatch') mismatches++;
    }
    let weakness: string | null = null, best = 0;
    for (const t of ['concept', 'application', 'calculation'] as const) if (params[t] > best) { best = params[t]; weakness = t; }
    if (best < 2) weakness = params.guessed >= 3 ? 'guessed' : (score >= 8 ? 'solid' : null);
    return { params, score, wrong, mismatches, confirmed, typed, weakness };
}
