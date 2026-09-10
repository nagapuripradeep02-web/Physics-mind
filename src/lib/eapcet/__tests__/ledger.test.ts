/**
 * The ledger — Diag.ledger over a chapter's runs AND retries, tested against
 * the SHIPPED eapcet-app/js/55_diag.js like diagnose.test.ts.
 *
 * A shape's state is read from its last attempts across every run and every
 * sibling retry, so one run never has the last word: a shape found "fix" two
 * runs ago and answered right by the right route twice since reads "solid"; a
 * wrong answer resting on the claim alone reads "check", not "fix"; the
 * headline's evidence (confirmed wrong answers per type) is counted over the
 * whole ledger, and a run can be left out so it is not counted twice.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

type Rec = { qid: string; picked: number; correct: boolean; ms: number; route?: string | null; probe?: string | null; shape_key?: string; at?: string };
type Fact = { has_routes: boolean; theory: boolean; route_key: string | null; option_types: Record<string, string>; routes: { id: string; text: string; type: string | null; option: number | null }[]; shape: { key: string; label: string } | null };
type Shape = { key: string; label: string | null; attempts: number; solid: number; wrong_confirmed: number; wrong_plain: number; wrong_claimed: number; last_at: string | null; status: string };
type Ledger = { shapes: Shape[]; by: Record<string, Shape>; types: Record<string, number>; attempts: number };
type Api = { ledger(cs: unknown, facts?: Record<string, Fact>, opts?: { without_run?: number | null }): Ledger; LEDGER_WINDOW: number };

const js = readFileSync(join(process.cwd(), 'eapcet-app', 'js', '55_diag.js'), 'utf8');
const Diag = new Function(`${js}\n; return Diag;`)() as Api;

const FALL: Fact = {
    has_routes: true, theory: false, route_key: 'r', option_types: { '3': 'application', '4': 'calculation' },
    routes: [{ id: 'm0', text: 'I treated the next 8 seconds as a fresh fall', type: 'application', option: 3 }, { id: 'r', text: 'I found the distance by 12 s', type: null, option: 2 }],
    shape: { key: 'two_stage_fall', label: 'Fall in two stages' },
};
const THROW: Fact = { ...FALL, option_types: { '1': 'careless' }, routes: [{ id: 'r', text: 'I wrote v = u + at', type: null, option: 4 }], shape: { key: 'vertical_throw', label: 'Thrown up' } };
const FACTS = { a: FALL, a2: FALL, b: THROW };

function rec(qid: string, picked: number, correct: boolean, route: string | null): Rec { return { qid, picked, correct, ms: 60000, route }; }
function run(run_no: number, finished_at: string, records: Rec[]) { return { run_no, seed: 1, ids: records.map((r) => r.qid), started_at: finished_at, finished_at, records }; }
function retry(qid: string, shape_key: string, picked: number, correct: boolean, route: string, at: string) {
    return { qid, from_qid: 'a', shape_key, route, probe: correct && route === 'r' ? 'sure' : 'wrong', same_shape: true, picked, correct, ms: 30000, at };
}
const KEY_A = 2;   // FALL's key is option 2; THROW's key is option 4

describe('Diag.ledger: a shape state across runs and retries', () => {
    it('an empty chapter has no shapes and no evidence', () => {
        const l = Diag.ledger({ runs: [], retries: [], streak: {}, strong_now: {} }, FACTS);
        expect(l.shapes).toEqual([]);
        expect(l.types).toEqual({ concept: 0, application: 0, calculation: 0 });
        expect(l.attempts).toBe(0);
    });
    it('one clean attempt is solid; a confirmed wrong is fix; a claim-only wrong, a guess or a right-by-wrong-route is check', () => {
        const cs = { runs: [run(1, '2026-09-10T10:00:00Z', [rec('a', KEY_A, true, 'r'), rec('b', 1, false, 'r'), rec('a2', 1, false, 'r')])], retries: [], streak: {}, strong_now: {} };
        const l = Diag.ledger(cs, FACTS);
        // a and a2 share the shape: one solid, one claim-only wrong → check
        expect(l.by.two_stage_fall).toMatchObject({ attempts: 2, solid: 1, wrong_claimed: 1, wrong_confirmed: 0, status: 'check', label: 'Fall in two stages' });
        expect(l.by.vertical_throw).toMatchObject({ attempts: 1, wrong_confirmed: 1, status: 'fix' });
        expect(l.types).toEqual({ concept: 0, application: 0, calculation: 1 });
        const g = Diag.ledger({ runs: [run(1, '2026-09-10T10:00:00Z', [rec('a', KEY_A, true, 'guess')])], retries: [] }, FACTS);
        expect(g.by.two_stage_fall.status).toBe('check');
        const w = Diag.ledger({ runs: [run(1, '2026-09-10T10:00:00Z', [rec('a', KEY_A, true, 'm0')])], retries: [] }, FACTS);
        expect(w.by.two_stage_fall.status).toBe('check');
        const s = Diag.ledger({ runs: [run(1, '2026-09-10T10:00:00Z', [rec('a', KEY_A, true, 'r')])], retries: [] }, FACTS);
        expect(s.by.two_stage_fall.status).toBe('solid');
    });
    it('a fix two runs ago, then right by the right route twice, reads solid; once is still fix', () => {
        const runs = [run(1, '2026-09-08T10:00:00Z', [rec('a', 4, false, 'r')]), run(2, '2026-09-09T10:00:00Z', [rec('a2', KEY_A, true, 'r')])];
        expect(Diag.ledger({ runs, retries: [] }, FACTS).by.two_stage_fall.status).toBe('fix');
        const runs3 = runs.concat([run(3, '2026-09-10T10:00:00Z', [rec('a', KEY_A, true, 'r')])]);
        expect(Diag.ledger({ runs: runs3, retries: [] }, FACTS).by.two_stage_fall.status).toBe('solid');
        // the order is by time, not by array position: right answers BEFORE the wrong one do not clear it
        const back = [run(2, '2026-09-10T10:00:00Z', [rec('a', 4, false, 'r')]), run(1, '2026-09-08T10:00:00Z', [rec('a', KEY_A, true, 'r'), rec('a2', KEY_A, true, 'r')])];
        expect(Diag.ledger({ runs: back, retries: [] }, FACTS).by.two_stage_fall.status).toBe('fix');
    });
    it('sibling retries are attempts: two right retries after a wrong run answer clear the shape; a guessed retry does not', () => {
        const cs = {
            runs: [run(1, '2026-09-10T10:00:00Z', [rec('a', 4, false, 'r')])],
            retries: [retry('a2', 'two_stage_fall', KEY_A, true, 'r', '2026-09-10T10:05:00Z'), retry('a', 'two_stage_fall', KEY_A, true, 'r', '2026-09-10T10:06:00Z')],
            streak: {}, strong_now: {},
        };
        const l = Diag.ledger(cs, FACTS);
        expect(l.by.two_stage_fall).toMatchObject({ attempts: 3, solid: 2, wrong_confirmed: 1, status: 'solid', last_at: '2026-09-10T10:06:00Z' });
        const guessed = { ...cs, retries: [cs.retries[0], retry('a', 'two_stage_fall', KEY_A, true, 'guess', '2026-09-10T10:06:00Z')] };
        expect(Diag.ledger(guessed, FACTS).by.two_stage_fall.status).toBe('fix');
        // the last three are read: a wrong answer four attempts back is gone once the tail is clean of it
        const clean = { ...cs, retries: cs.retries.concat([retry('a', 'two_stage_fall', KEY_A, true, 'guess', '2026-09-10T10:07:00Z')]) };
        expect(Diag.ledger(clean, FACTS).by.two_stage_fall.status).toBe('check');
    });
    it('in a chapter without audited routes a sure wrong answer is plainly wrong: fix, though nothing confirms it', () => {
        const UNROUTED: Fact = { has_routes: false, theory: false, route_key: null, option_types: {}, routes: [], shape: null };
        const l = Diag.ledger({ runs: [run(1, '2026-09-10T10:00:00Z', [rec('u', 1, false, 'sure'), rec('u', 1, false, 'guess')])], retries: [] }, { u: UNROUTED });
        expect(l.by.other).toMatchObject({ attempts: 2, wrong_plain: 1, wrong_claimed: 1, wrong_confirmed: 0, status: 'fix' });
        expect(l.types).toEqual({ concept: 0, application: 0, calculation: 0 });
    });
    it('strong_now is sticky, above everything the attempts say', () => {
        const cs = { runs: [run(1, '2026-09-10T10:00:00Z', [rec('a', 4, false, 'r')])], retries: [], streak: {}, strong_now: { two_stage_fall: '2026-09-09' } };
        expect(Diag.ledger(cs, FACTS).by.two_stage_fall.status).toBe('strong');
    });
    it('records never routed are not attempts; legacy probe records are (sure is solid, guessed is check)', () => {
        const cs = { runs: [run(1, '2026-09-10T10:00:00Z', [rec('a', KEY_A, true, null), { qid: 'a2', picked: KEY_A, correct: true, ms: 1, route: null, probe: 'guessed' }])], retries: [] };
        const l = Diag.ledger(cs, FACTS);
        expect(l.attempts).toBe(1);
        expect(l.by.two_stage_fall.status).toBe('check');
    });
    it('the headline evidence counts confirmed wrong answers per type over every attempt, and can leave one run out', () => {
        const cs = {
            runs: [run(1, '2026-09-08T10:00:00Z', [rec('a', 4, false, 'r'), rec('a2', 3, false, 'r')]), run(2, '2026-09-09T10:00:00Z', [rec('a', 4, false, 'r'), rec('b', 1, false, 'r')])],
            retries: [retry('a', 'two_stage_fall', 4, false, 'r', '2026-09-09T10:05:00Z'), retry('a2', 'two_stage_fall', 1, false, 'r', '2026-09-09T10:06:00Z')],
        };
        // calculation: a/4 (run 1), a/4 (run 2), b/1 careless (run 2), a/4 (retry) = 4; application: a2/3 mismatch (run 1) = 1; the retry on option 1 is claim-only
        expect(Diag.ledger(cs, FACTS).types).toEqual({ concept: 0, application: 1, calculation: 4 });
        expect(Diag.ledger(cs, FACTS, { without_run: 2 }).types).toEqual({ concept: 0, application: 1, calculation: 2 });
        expect(Diag.ledger(cs, FACTS, { without_run: 1 }).types).toEqual({ concept: 0, application: 0, calculation: 3 });
    });
});
