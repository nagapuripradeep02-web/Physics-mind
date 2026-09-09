/**
 * The diagnosis rule — tested against the SHIPPED eapcet-app/js/55_diag.js.
 *
 * Everything the result screen says about a student is derived by Diag.diagnose
 * from the run's records and the public facts of its questions. The rules that
 * matter and are easy to get silently wrong: the option the student picked
 * outranks the route they tapped (a disagreement is a `mismatch`, and the option
 * decides the type); a wrong answer on an option nobody explained rests on the
 * claim alone (`confirmed: false`); a question with no audited routes names no
 * type at all; the weakness is the largest type count at two or more, ties
 * concept > application > calculation, then guessing at three, then solid at
 * eight right; the streak toward "strong now" survives only right-by-the-right-
 * route retries.
 *
 * Extract-and-evaluate, like syncMerge.test.ts: a reimplementation would pass
 * forever while the shipped one rotted.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

type Rec = { qid: string; picked: number; correct: boolean; ms: number; route?: string | null; probe?: string | null };
type Route = { id: string; text: string; type: string | null; option: number | null };
type Fact = {
    has_routes: boolean; theory: boolean; route_key: string | null;
    option_types: Record<string, string>; routes: Route[]; shape: { key: string; label: string } | null;
};
type Outcome = { qid?: string; outcome: string | null; type: string | null; confirmed: boolean; mismatch: boolean; rushed: boolean; legacy: boolean };
type Verdict = {
    score: number; total: number; outcomes: Outcome[];
    params: Record<string, number>; weakness: string | null;
    wrong: number; typed: number; confirmed: number; confirmed_share: number | null; mismatches: number;
    guessed_right: number; legacy: number; wrong_ids: string[]; check_ids: string[]; guessed_ids: string[];
    shapes: { key: string; label: string | null; qids: string[]; status: string }[];
    sec_per_q: number | null; exam_sec_per_q: number;
};
type DiagApi = {
    diagnose(records: Rec[], facts?: Record<string, Fact>): Verdict;
    outcomeOf(rec: Rec, fact?: Fact): Outcome;
    probeOf(route: string, correct: boolean): string;
    streakAfter(streak: Record<string, number> | null, key: string, retry: { correct: boolean; probe: string }): number;
    strongNow(n: number): boolean;
    TYPES: string[]; PARAMS: string[]; STRONG_AT: number; MIN_TYPE: number; MIN_GUESSED: number; SOLID_AT: number;
    RUSHED_MS: number; EXAM_SEC_PER_Q: number;
};

function loadDiag(): DiagApi {
    const js = readFileSync(join(process.cwd(), 'eapcet-app', 'js', '55_diag.js'), 'utf8');
    expect(js.indexOf('var Diag = (function () {'), '55_diag.js does not define Diag').toBeGreaterThan(-1);
    return new Function(`${js}\n; return Diag;`)() as DiagApi;
}

const Diag = loadDiag();

// A routed question, key 2. Mistake 0 is an application error with a route that
// leads to option 3; mistake 1 is a calculation slip (no route) that leads to
// option 4; option 1 is explained by nobody.
const ROUTED: Fact = {
    has_routes: true, theory: false, route_key: 'r',
    option_types: { '3': 'application', '4': 'calculation' },
    routes: [
        { id: 'm0', text: 'I treated the next 8 seconds as a fresh fall', type: 'application', option: 3 },
        { id: 'r', text: 'I found the distance by 12 s and took away the first 4 s', type: null, option: 2 },
    ],
    shape: { key: 'two_stage_fall', label: 'Fall in two stages' },
};
// A routed question, key 4, whose concept route names no option, and whose
// option 1 is a careless slip.
const ROUTED2: Fact = {
    has_routes: true, theory: false, route_key: 'r',
    option_types: { '1': 'careless' },
    routes: [
        { id: 'r', text: 'I wrote v = u + at and put v = 0 at the top', type: null, option: 4 },
        { id: 'm0', text: 'I took g as positive on the way up', type: 'concept', option: null },
    ],
    shape: { key: 'vertical_throw', label: 'Thrown up: speed and time' },
};
// A theory question with audited routes: no right route to describe; option 2 is a wrong belief.
const THEORY: Fact = { has_routes: true, theory: true, route_key: null, option_types: { '2': 'concept' }, routes: [], shape: { key: 'graphs', label: 'Reading a graph' } };
// A question from a chapter whose routes are not audited yet.
const UNROUTED: Fact = { has_routes: false, theory: false, route_key: null, option_types: {}, routes: [], shape: null };

const FACTS: Record<string, Fact> = { a: ROUTED, b: ROUTED2, c: THEORY, d: UNROUTED };

function rec(qid: string, picked: number, correct: boolean, route: string | null, ms = 60000): Rec {
    return { qid, picked, correct, ms, route };
}
function one(r: Rec): Outcome {
    const v = Diag.diagnose([r], FACTS);
    return v.outcomes[0];
}

describe('Diag.outcomeOf — the outcome table, one row at a time', () => {
    it('a right answer: by the right route is solid; a guess and a wrong route go to "check these too"', () => {
        expect(one(rec('a', 2, true, 'r'))).toMatchObject({ outcome: 'solid', type: null, rushed: false });
        expect(one(rec('d', 1, true, 'sure'))).toMatchObject({ outcome: 'solid' });
        expect(one(rec('a', 2, true, 'guess'))).toMatchObject({ outcome: 'guessed_right' });
        expect(one(rec('a', 2, true, 'm0'))).toMatchObject({ outcome: 'right_by_wrong_route' });
        const v = Diag.diagnose([rec('a', 2, true, 'guess'), rec('a', 2, true, 'm0'), rec('a', 2, true, 'r')], FACTS);
        expect(v.check_ids).toEqual(['a', 'a']);
        expect(v.guessed_ids).toEqual(['a']);
        expect(v.guessed_right).toBe(1);
        expect(v.params.guessed).toBe(1);
        expect(v.score).toBe(3);
    });

    it('a wrong guess names no type; a wrong answer under 15 seconds is rushed as well', () => {
        expect(one(rec('a', 1, false, 'guess'))).toMatchObject({ outcome: 'guessed_wrong', type: null, rushed: false });
        expect(one(rec('a', 1, false, 'guess', 14999))).toMatchObject({ outcome: 'guessed_wrong', rushed: true });
        expect(one(rec('a', 4, false, 'r', 3000))).toMatchObject({ outcome: 'slip', rushed: true });
        expect(one(rec('a', 2, true, 'r', 3000)).rushed).toBe(false);          // a fast RIGHT answer is not rushed
        expect(Diag.RUSHED_MS).toBe(15000);
    });

    it('a question with no audited routes: wrong is wrong_unrouted, and counts toward no parameter', () => {
        const o = one(rec('d', 3, false, 'sure'));
        expect(o).toMatchObject({ outcome: 'wrong_unrouted', type: null, confirmed: false, mismatch: false });
        const v = Diag.diagnose([rec('d', 3, false, 'sure'), rec('d', 3, false, 'sure'), rec('d', 3, false, 'sure')], FACTS);
        expect(v.params).toEqual({ concept: 0, application: 0, calculation: 0, guessed: 0, rushed: 0 });
        expect(v.weakness).toBeNull();
        expect(v.typed).toBe(0);
        expect(v.confirmed_share).toBeNull();
        expect(v.wrong_ids).toEqual(['d', 'd', 'd']);
    });

    it('a theory question, sure and wrong, is a wrong belief — confirmed only when the option is explained', () => {
        expect(one(rec('c', 2, false, 'sure'))).toMatchObject({ outcome: 'wrong_belief', type: 'concept', confirmed: true, mismatch: false });
        expect(one(rec('c', 4, false, 'sure'))).toMatchObject({ outcome: 'wrong_belief', type: 'concept', confirmed: false });
        expect(one(rec('c', 4, false, 'guess'))).toMatchObject({ outcome: 'guessed_wrong', type: null });
    });

    it('claims the right route: the option decides — a calculation option is a slip, a route option is a mismatch, an unexplained option is an unconfirmed slip', () => {
        expect(one(rec('a', 4, false, 'r'))).toMatchObject({ outcome: 'slip', type: 'calculation', confirmed: true, mismatch: false });
        expect(one(rec('a', 3, false, 'r'))).toMatchObject({ outcome: 'wrong_route', type: 'application', confirmed: true, mismatch: true });
        expect(one(rec('a', 1, false, 'r'))).toMatchObject({ outcome: 'slip_unconfirmed', type: 'calculation', confirmed: false, mismatch: false });
        expect(one(rec('b', 1, false, 'r'))).toMatchObject({ outcome: 'slip', type: 'calculation', confirmed: true });   // careless counts as calculation
    });

    it('claims a wrong route: confirmed when the option is where it leads, unconfirmed when the option is unexplained, and the other entry decides on a mismatch', () => {
        expect(one(rec('a', 3, false, 'm0'))).toMatchObject({ outcome: 'wrong_route', type: 'application', confirmed: true, mismatch: false });
        expect(one(rec('a', 1, false, 'm0'))).toMatchObject({ outcome: 'wrong_route', type: 'application', confirmed: false, mismatch: false });
        expect(one(rec('a', 4, false, 'm0'))).toMatchObject({ outcome: 'slip', type: 'calculation', confirmed: true, mismatch: true });
        // the concept route of question b names no option: unconfirmed on an unexplained pick, a slip on the careless one
        expect(one(rec('b', 2, false, 'm0'))).toMatchObject({ outcome: 'wrong_route', type: 'concept', confirmed: false, mismatch: false });
        expect(one(rec('b', 1, false, 'm0'))).toMatchObject({ outcome: 'slip', type: 'calculation', confirmed: true, mismatch: true });
    });

    it('a route id the question does not carry is treated as unrouted', () => {
        expect(one(rec('a', 3, false, 'm7'))).toMatchObject({ outcome: 'wrong_unrouted', type: null });
    });

    it('a record from before routes (probe, no route) counts toward the score and nothing else', () => {
        const v = Diag.diagnose([
            { qid: 'a', picked: 2, correct: true, ms: 30000, probe: 'sure' },
            { qid: 'a', picked: 3, correct: false, ms: 30000, probe: 'application' },
            rec('a', 3, false, 'm0'),
        ], FACTS);
        expect(v.score).toBe(1);
        expect(v.total).toBe(3);
        expect(v.legacy).toBe(2);
        expect(v.outcomes[0]).toMatchObject({ outcome: null, legacy: true });
        expect(v.outcomes[1]).toMatchObject({ outcome: null, legacy: true });
        expect(v.params.application).toBe(1);
        expect(v.wrong_ids).toEqual(['a', 'a']);           // a legacy wrong answer still gets its solution link
        expect(v.shapes).toEqual([{ key: 'two_stage_fall', label: 'Fall in two stages', qids: ['a', 'a', 'a'], status: 'fix' }]);
        const legacyRight = Diag.diagnose([{ qid: 'a', picked: 2, correct: true, ms: 30000, probe: 'guessed' }], FACTS);
        expect(legacyRight.shapes[0].status).toBe('check');
    });

    it('a record whose route is still owed lands nowhere', () => {
        expect(one(rec('a', 3, false, null))).toMatchObject({ outcome: null, legacy: false });
    });
});

describe('Diag.diagnose — tallies and the verdict', () => {
    it('empty run: zero score, no weakness, no timing, every parameter zero', () => {
        const v = Diag.diagnose([], {});
        expect(v.score).toBe(0);
        expect(v.total).toBe(0);
        expect(v.weakness).toBeNull();
        expect(v.sec_per_q).toBeNull();
        expect(v.params).toEqual({ concept: 0, application: 0, calculation: 0, guessed: 0, rushed: 0 });
        expect(v.shapes).toEqual([]);
    });

    it('a type names the weakness at two, and ties break concept > application > calculation', () => {
        expect(Diag.TYPES).toEqual(['concept', 'application', 'calculation']);
        expect(Diag.MIN_TYPE).toBe(2);
        expect(Diag.diagnose([rec('a', 4, false, 'r'), rec('a', 2, true, 'r')], FACTS).weakness).toBeNull();
        expect(Diag.diagnose([rec('a', 4, false, 'r'), rec('a', 4, false, 'r')], FACTS).weakness).toBe('calculation');
        // two calculation, two application → application
        expect(Diag.diagnose([rec('a', 4, false, 'r'), rec('a', 4, false, 'r'), rec('a', 3, false, 'm0'), rec('a', 3, false, 'm0')], FACTS).weakness).toBe('application');
        // two application, two concept → concept
        expect(Diag.diagnose([rec('a', 3, false, 'm0'), rec('a', 3, false, 'm0'), rec('c', 2, false, 'sure'), rec('c', 2, false, 'sure')], FACTS).weakness).toBe('concept');
        // the unconfirmed count too — the option could not refute the claim
        expect(Diag.diagnose([rec('a', 1, false, 'r'), rec('a', 1, false, 'r')], FACTS).weakness).toBe('calculation');
    });

    it('with no type at two: guessing at three, else solid at eight right, else nothing', () => {
        expect(Diag.MIN_GUESSED).toBe(3);
        expect(Diag.SOLID_AT).toBe(8);
        const g = Diag.diagnose([rec('a', 2, true, 'guess'), rec('a', 1, false, 'guess'), rec('a', 2, true, 'guess'), rec('a', 2, true, 'r')], FACTS);
        expect(g.params.guessed).toBe(3);
        expect(g.weakness).toBe('guessed');
        const two = Diag.diagnose([rec('a', 2, true, 'guess'), rec('a', 1, false, 'guess'), rec('a', 2, true, 'r')], FACTS);
        expect(two.weakness).toBeNull();
        const solid = Diag.diagnose(Array.from({ length: 8 }, () => rec('a', 2, true, 'r')).concat([rec('a', 4, false, 'r'), rec('a', 1, false, 'guess')]), FACTS);
        expect(solid.score).toBe(8);
        expect(solid.weakness).toBe('solid');
        const seven = Diag.diagnose(Array.from({ length: 7 }, () => rec('a', 2, true, 'r')).concat([rec('d', 1, false, 'sure')]), FACTS);
        expect(seven.weakness).toBeNull();
        // a type at two beats three guesses; three guesses beat eight right
        const mixed = Diag.diagnose([rec('a', 4, false, 'r'), rec('a', 4, false, 'r'), rec('a', 2, true, 'guess'), rec('a', 2, true, 'guess'), rec('a', 2, true, 'guess')], FACTS);
        expect(mixed.weakness).toBe('calculation');
        const guessedSolid = Diag.diagnose(Array.from({ length: 8 }, () => rec('a', 2, true, 'r')).concat([rec('a', 2, true, 'guess'), rec('a', 2, true, 'guess'), rec('a', 1, false, 'guess')]), FACTS);
        expect(guessedSolid.weakness).toBe('guessed');
    });

    it('confirmed, typed, mismatches and confirmed_share', () => {
        const v = Diag.diagnose([
            rec('a', 4, false, 'r'),        // slip, confirmed
            rec('a', 1, false, 'r'),        // slip, unconfirmed
            rec('a', 3, false, 'r'),        // wrong_route application, confirmed, mismatch
            rec('a', 1, false, 'guess'),    // guessed_wrong: no type
            rec('d', 2, false, 'sure'),     // unrouted: no type
            rec('a', 2, true, 'r'),
        ], FACTS);
        expect(v.wrong).toBe(5);
        expect(v.typed).toBe(3);
        expect(v.confirmed).toBe(2);
        expect(v.confirmed_share).toBe(0.67);
        expect(v.mismatches).toBe(1);
        expect(v.params).toEqual({ concept: 0, application: 1, calculation: 2, guessed: 1, rushed: 0 });
    });

    it('groups the run by shape, worst status first: fix > check > solid; a question without a shape sits under "other"', () => {
        const v = Diag.diagnose([
            rec('a', 2, true, 'r'), rec('a', 4, false, 'r'),      // two_stage_fall: one right, one wrong → fix
            rec('b', 4, true, 'guess'),                           // vertical_throw: guessed right → check
            rec('c', 3, true, 'sure'),                            // graphs: solid
            rec('d', 1, true, 'sure'), rec('d', 2, false, 'sure'),// other: fix
        ], FACTS);
        expect(v.shapes).toEqual([
            { key: 'two_stage_fall', label: 'Fall in two stages', qids: ['a', 'a'], status: 'fix' },
            { key: 'vertical_throw', label: 'Thrown up: speed and time', qids: ['b'], status: 'check' },
            { key: 'graphs', label: 'Reading a graph', qids: ['c'], status: 'solid' },
            { key: 'other', label: null, qids: ['d', 'd'], status: 'fix' },
        ]);
        expect(v.outcomes.map((o) => o.qid)).toEqual(['a', 'a', 'b', 'c', 'd', 'd']);
    });

    it('rushed counts wrong answers under 15 s only, on any outcome', () => {
        const v = Diag.diagnose([rec('a', 1, false, 'guess', 1000), rec('d', 1, false, 'sure', 1000), rec('a', 4, false, 'r', 15000), rec('a', 2, true, 'r', 500)], FACTS);
        expect(v.params.rushed).toBe(2);
        expect(v.outcomes.map((o) => o.rushed)).toEqual([true, true, false, false]);
    });

    it('seconds per question is the median, to one decimal, against the exam pace', () => {
        const v = Diag.diagnose([rec('a', 2, true, 'r', 30000), rec('a', 2, true, 'r', 90000), rec('a', 1, false, 'guess', 61234)], FACTS);
        expect(v.sec_per_q).toBe(61.2);
        const even = Diag.diagnose([rec('a', 2, true, 'r', 40000), rec('a', 2, true, 'r', 60000)], FACTS);
        expect(even.sec_per_q).toBe(50);
        expect(v.exam_sec_per_q).toBe(67.5);            // 160 questions in 180 minutes
        expect(Diag.EXAM_SEC_PER_Q).toBe(67.5);
        const bad = Diag.diagnose([rec('a', 2, true, 'r', -5), rec('a', 2, true, 'r', 20000)], FACTS);
        expect(bad.sec_per_q).toBe(20);                  // a negative duration is ignored, not averaged
    });

    it('a question missing from the facts is read as unrouted, never as routed', () => {
        const v = Diag.diagnose([rec('zz', 1, false, 'sure'), rec('zz', 1, false, 'r')], {});
        expect(v.outcomes.map((o) => o.outcome)).toEqual(['wrong_unrouted', 'wrong_unrouted']);
        expect(v.shapes[0]).toMatchObject({ key: 'other', status: 'fix' });
    });
});

describe('Diag.probeOf / streakAfter / strongNow', () => {
    it('a retry by the right route is sure; a guess is guessed; right by a wrong route is wrong_route; wrong is wrong', () => {
        expect(Diag.probeOf('r', true)).toBe('sure');
        expect(Diag.probeOf('sure', true)).toBe('sure');
        expect(Diag.probeOf('guess', true)).toBe('guessed');
        expect(Diag.probeOf('guess', false)).toBe('guessed');
        expect(Diag.probeOf('m0', true)).toBe('wrong_route');
        expect(Diag.probeOf('r', false)).toBe('wrong');
        expect(Diag.probeOf('m0', false)).toBe('wrong');
    });

    it('right-by-the-right-route extends the streak for that shape; anything else resets it', () => {
        expect(Diag.streakAfter(null, 'nth_second', { correct: true, probe: 'sure' })).toBe(1);
        expect(Diag.streakAfter({ nth_second: 2 }, 'nth_second', { correct: true, probe: 'sure' })).toBe(3);
        expect(Diag.streakAfter({ nth_second: 2 }, 'nth_second', { correct: true, probe: 'guessed' })).toBe(0);
        expect(Diag.streakAfter({ nth_second: 2 }, 'nth_second', { correct: true, probe: 'wrong_route' })).toBe(0);
        expect(Diag.streakAfter({ nth_second: 2 }, 'nth_second', { correct: false, probe: 'wrong' })).toBe(0);
        expect(Diag.streakAfter({ other: 5 }, 'nth_second', { correct: true, probe: 'sure' })).toBe(1);
    });

    it('strong now at three, not before', () => {
        expect(Diag.STRONG_AT).toBe(3);
        expect(Diag.strongNow(2)).toBe(false);
        expect(Diag.strongNow(3)).toBe(true);
        let n = 0;
        for (let i = 0; i < 3; i++) n = Diag.streakAfter({ k: n }, 'k', { correct: true, probe: Diag.probeOf('r', true) });
        expect(Diag.strongNow(n)).toBe(true);
        n = Diag.streakAfter({ k: n }, 'k', { correct: false, probe: Diag.probeOf('m0', false) });
        expect(Diag.strongNow(n)).toBe(false);
    });
});
