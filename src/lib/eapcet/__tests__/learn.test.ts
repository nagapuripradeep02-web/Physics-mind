/**
 * The classroom's rules — tested against the SHIPPED eapcet-app/js/57_learn.js
 * (with 55_diag.js beside it, since a pass reads Diag.outcomeOf).
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

type Rec = { qid: string; picked: number; correct: boolean; ms: number; route: string | null };
type Fact = { has_routes: boolean; theory: boolean; route_key: string; option_types: Record<string, string>; routes: { id: string; text: string; type: string | null; option: number | null }[]; shape: null };
type Entry = { ck: string; opened: number; check: unknown; pass: unknown; passes: unknown[]; green_at: string | null };
type LearnApi = {
    passStatus(records: Rec[], facts: Record<string, Fact>): { solid: number; ended: boolean; owed: boolean; green: boolean; i: number; last: { outcome: string } | null };
    subtopicState(entry: Entry | null | undefined): string;
    nextFor(subs: string[], learn: Record<string, Entry>): string | null;
    nextAfter(subs: string[], learn: Record<string, Entry>, after: string): string | null;
    progress(learn: Record<string, Entry>, subs: string[]): { done: number; total: number; next: string | null };
    masteryOf(keys: string[], strong: Record<string, string>, last: { key: string; status: string }[] | null, learn: Record<string, Entry>, links: Record<string, string[]>): Record<string, string>;
    summary(m: Record<string, string>): { state: string; n: number }[];
    variantIndex(passes: number, len: number): number;
    N: number;
};

function load(): LearnApi {
    const dir = join(process.cwd(), 'eapcet-app', 'js');
    const diag = readFileSync(join(dir, '55_diag.js'), 'utf8');
    const learn = readFileSync(join(dir, '57_learn.js'), 'utf8');
    expect(learn.indexOf('var Learn = (function () {'), '57_learn.js does not define Learn').toBeGreaterThan(-1);
    return new Function(`${diag}\n;${learn}\n; return Learn;`)() as LearnApi;
}
const Learn = load();

// Key 2; option 3 is a concept mistake with route m0; option 4 a calculation slip with route m1; option 1 unexplained.
const FACT: Fact = {
    has_routes: true, theory: false, route_key: 'r', option_types: { '3': 'concept', '4': 'calculation' }, shape: null,
    routes: [{ id: 'r', text: 'I did it right', type: null, option: 2 }, { id: 'm0', text: 'I mixed the idea', type: 'concept', option: 3 }, { id: 'm1', text: 'I slipped', type: 'calculation', option: 4 }],
};
const facts = { q1: FACT, q2: FACT, q3: FACT };
const rec = (qid: string, picked: number, route: string | null): Rec => ({ qid, picked, correct: picked === 2, ms: 30000, route });
const entry = (over: Partial<Entry> = {}): Entry => ({ ck: 'p1-02', opened: 1, check: null, pass: null, passes: [], green_at: null, ...over });

describe('Learn.passStatus', () => {
    it('three right by the right route, in order, is green', () => {
        const s = Learn.passStatus([rec('q1', 2, 'r'), rec('q2', 2, 'r'), rec('q3', 2, 'r')], facts);
        expect(s).toMatchObject({ solid: 3, ended: false, owed: false, green: true, i: -1 === s.i ? -1 : 3 });
        expect(s.green).toBe(true);
    });
    it('counts the slot to show next while the pass is open', () => {
        expect(Learn.passStatus([], facts).i).toBe(0);
        expect(Learn.passStatus([rec('q1', 2, 'r')], facts)).toMatchObject({ solid: 1, i: 1, green: false, ended: false });
    });
    it('a pick whose route is still owed holds the slot', () => {
        const s = Learn.passStatus([rec('q1', 2, 'r'), rec('q2', 2, null)], facts);
        expect(s).toMatchObject({ solid: 1, owed: true, ended: false, green: false, i: 1 });
    });
    it('a guess, a right answer by a wrong route, or a wrong pick ends the pass', () => {
        expect(Learn.passStatus([rec('q1', 2, 'guess')], facts)).toMatchObject({ ended: true, i: -1, solid: 0 });
        expect(Learn.passStatus([rec('q1', 2, 'r'), rec('q2', 2, 'm0')], facts)).toMatchObject({ ended: true, solid: 1 });
        expect(Learn.passStatus([rec('q1', 2, 'r'), rec('q2', 3, 'r')], facts)).toMatchObject({ ended: true, solid: 1 });
        expect(Learn.passStatus([rec('q1', 2, 'r'), rec('q2', 3, 'r')], facts).last?.outcome).toBe('wrong_route');
        expect(Learn.passStatus([rec('q1', 4, 'r')], facts).last?.outcome).toBe('slip');
    });
    it('nothing after the end counts', () => {
        expect(Learn.passStatus([rec('q1', 3, 'm0'), rec('q2', 2, 'r'), rec('q3', 2, 'r')], facts)).toMatchObject({ ended: true, solid: 0, green: false });
    });
});

describe('Learn.subtopicState, progress, next', () => {
    it('none until a check or a pass; green is sticky', () => {
        expect(Learn.subtopicState(null)).toBe('none');
        expect(Learn.subtopicState(entry())).toBe('none');
        expect(Learn.subtopicState(entry({ check: { picked: 1 } }))).toBe('started');
        expect(Learn.subtopicState(entry({ passes: [{ outcome: 'ended' }] }))).toBe('started');
        expect(Learn.subtopicState(entry({ green_at: '2026-09-09', pass: { records: [] } }))).toBe('green');
    });
    it('progress counts green lessons and names the first not-green one', () => {
        const learn = { a: entry({ green_at: '2026-09-09' }), b: entry({ check: {} }) };
        expect(Learn.progress(learn, ['a', 'b', 'c'])).toEqual({ done: 1, total: 3, next: 'b' });
        expect(Learn.nextFor(['a'], learn)).toBeNull();
        expect(Learn.nextFor([], learn)).toBeNull();
    });
    it('nextAfter walks on from the current lesson and wraps round', () => {
        const learn = { a: entry(), b: entry({ green_at: 'x' }), c: entry({ green_at: 'x' }) };
        expect(Learn.nextAfter(['a', 'b', 'c'], learn, 'b')).toBe('a');
        expect(Learn.nextAfter(['a', 'b', 'c'], { a: entry({ green_at: 'x' }), b: entry({ green_at: 'x' }), c: entry({ green_at: 'x' }) }, 'a')).toBeNull();
    });
});

describe('Learn.masteryOf', () => {
    const links = { s1: ['l1'], s2: ['l2', 'l3'], s3: [] };
    it('the test hall outranks the classroom: strong > last run > learned > none', () => {
        const learn = { l1: entry({ green_at: 'x' }), l2: entry({ green_at: 'x' }), l3: entry({ green_at: 'x' }) };
        const m = Learn.masteryOf(['s1', 's2', 's3', 's4'], { s1: '2026-09-09' }, [{ key: 's2', status: 'fix' }], learn, links);
        expect(m).toEqual({ s1: 'strong', s2: 'fix', s3: 'none', s4: 'none' });
    });
    it('learned needs every linked lesson green and the shape absent from the last run', () => {
        expect(Learn.masteryOf(['s2'], {}, null, { l2: entry({ green_at: 'x' }) }, links)).toEqual({ s2: 'none' });
        expect(Learn.masteryOf(['s2'], {}, [], { l2: entry({ green_at: 'x' }), l3: entry({ green_at: 'x' }) }, links)).toEqual({ s2: 'learned' });
        expect(Learn.masteryOf(['s2'], {}, [{ key: 's2', status: 'solid' }], { l2: entry({ green_at: 'x' }), l3: entry({ green_at: 'x' }) }, links)).toEqual({ s2: 'solid' });
    });
    it('summary counts in display order and drops zero counts', () => {
        expect(Learn.summary({ a: 'solid', b: 'fix', c: 'solid', d: 'learned', e: 'none', f: 'none' })).toEqual([
            { state: 'fix', n: 1 }, { state: 'solid', n: 2 }, { state: 'learned', n: 1 }, { state: 'none', n: 2 },
        ]);
    });
    it('pass n draws variants[n % len]', () => {
        expect(Learn.variantIndex(0, 2)).toBe(0);
        expect(Learn.variantIndex(3, 2)).toBe(1);
        expect(Learn.variantIndex(5, 1)).toBe(0);
        expect(Learn.variantIndex(2, 0)).toBe(0);
        expect(Learn.N).toBe(3);
    });
});
