/**
 * The draw and the sibling — tested against the SHIPPED eapcet-app/js/50_data.js
 * (with 00_core.js for hashStr/rng/shuffled), loaded with a fixture pool in
 * place of window.EP_POOL.
 *
 * What matters: a ten-question run covers every shape of the chapter (round
 * one takes one per shape), the questions the previous run did not show all
 * come back, the run opens easy and ends hard, the same inputs give the same
 * ten on every device, and a chapter with no shapes still draws. The sibling
 * prefers an unseen question of the same shape and says whether it found one.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

type Q = { id: string; chapter_key: string; answer: number; shape?: { key: string; label: string }; difficulty?: string | null };
type Chapter = { key: string; name: string; pool_ids: string[]; verified_ids: string[]; open: boolean; shapes?: { key: string; label: string }[] };
type DataApi = {
    chapter(key: string): Chapter;
    question(id: string): Q | null;
    draw(ch: Chapter, runNo: number, seed: string, seen: string[]): { seed: number; ids: string[] };
    sibling(qid: string, ch: Chapter, seenOrder: string[]): { qid: string; same_shape: boolean } | null;
    facts(ids: string[]): Record<string, { has_routes: boolean; theory: boolean; shape: { key: string; label: string } | null }>;
    shapeKey(q: Q | null): string;
    shapeLabel(ch: Chapter, key: string): string | null;
    RUN_LENGTH: number;
};

function load(pool: unknown): DataApi {
    const dir = join(process.cwd(), 'eapcet-app', 'js');
    const js = readFileSync(join(dir, '00_core.js'), 'utf8') + '\n;\n' + readFileSync(join(dir, '50_data.js'), 'utf8');
    return new Function('window', `${js}\n; return Data;`)({ EP_POOL: pool }) as DataApi;
}

const DIFFS = ['easy', 'medium', 'hard'];

/** A chapter of n verified questions over the given shapes, shapes cycling by index. */
function pool(shapes: string[], n: number, opts: { theoryEvery?: number } = {}) {
    const ids = Array.from({ length: n }, (_, i) => `tg_eapcet_2023_20230512_fn_q${String(81 + i).padStart(3, '0')}`);
    const questions: Record<string, Q & Record<string, unknown>> = {};
    ids.forEach((id, i) => {
        const key = shapes.length ? shapes[i % shapes.length] : '';
        questions[id] = {
            id, chapter_key: 'p1-02', answer: (i % 4) + 1, difficulty: DIFFS[i % 3],
            ...(key ? { shape: { key, label: 'Shape ' + key.toUpperCase() } } : {}),
            has_routes: true, theory: !!opts.theoryEvery && i % opts.theoryEvery === 0, route_key: 'r',
            option_types: { [String(((i % 4) + 1) % 4 + 1)]: 'application' },
            routes: [{ id: 'r', text: 'I did it', type: null, option: (i % 4) + 1 }],
        };
    });
    const siblings: Record<string, string[]> = {};
    ids.forEach((id, i) => { siblings[id] = ids.filter((_, j) => j !== i).slice(i % 3, i % 3 + 4); });
    const chapter: Chapter = {
        key: 'p1-02', name: 'Motion in a Straight Line', pool_ids: ids, verified_ids: ids, open: true,
        ...(shapes.length ? { shapes: shapes.map((k) => ({ key: k, label: 'Shape ' + k.toUpperCase() })) } : {}),
    };
    return { chapters: [chapter], questions, siblings, ids };
}

describe('Data.draw', () => {
    it('ten distinct verified questions, the same ten for the same device, chapter and run number', () => {
        const p = pool(['a', 'b', 'c'], 15);
        const Data = load(p);
        const one = Data.draw(Data.chapter('p1-02'), 1, 'device-1', []);
        const again = Data.draw(Data.chapter('p1-02'), 1, 'device-1', []);
        expect(one.ids).toHaveLength(10);
        expect(new Set(one.ids).size).toBe(10);
        for (const id of one.ids) expect(p.ids).toContain(id);
        expect(again).toEqual(one);
        const other = Data.draw(Data.chapter('p1-02'), 1, 'device-2', []);
        expect(other.ids).not.toEqual(one.ids);
        expect(Data.RUN_LENGTH).toBe(10);
    });

    it('covers every shape of the chapter on every device: round one takes one question per shape', () => {
        // five shapes of three: a plain shuffle misses a shape on many seeds
        const p = pool(['a', 'b', 'c', 'd', 'e'], 15);
        const Data = load(p);
        for (let d = 0; d < 40; d++) {
            const ids = Data.draw(Data.chapter('p1-02'), 1, 'device-' + d, []).ids;
            const keys = new Set(ids.map((id) => Data.shapeKey(Data.question(id))));
            expect([...keys].sort()).toEqual(['a', 'b', 'c', 'd', 'e']);
        }
    });

    it('with more shapes than a run holds, a run covers ten different shapes', () => {
        const shapes = Array.from({ length: 12 }, (_, i) => 's' + i);
        const Data = load(pool(shapes, 24));
        const ids = Data.draw(Data.chapter('p1-02'), 1, 'device-x', []).ids;
        expect(new Set(ids.map((id) => Data.shapeKey(Data.question(id)))).size).toBe(10);
    });

    it('the questions the previous run did not show all come back in the next run', () => {
        const p = pool(['a', 'b', 'c'], 15);
        const Data = load(p);
        for (let d = 0; d < 20; d++) {
            const first = Data.draw(Data.chapter('p1-02'), 1, 'device-' + d, []).ids;
            const second = Data.draw(Data.chapter('p1-02'), 2, 'device-' + d, first).ids;
            const unseen = p.ids.filter((id) => !first.includes(id));
            expect(unseen).toHaveLength(5);
            for (const id of unseen) expect(second).toContain(id);
        }
    });

    it('opens easy and ends hard: difficulty never decreases along the run', () => {
        const Data = load(pool(['a', 'b', 'c'], 15));
        const rank: Record<string, number> = { easy: 0, medium: 1, hard: 2 };
        for (let d = 0; d < 20; d++) {
            const ids = Data.draw(Data.chapter('p1-02'), 1, 'device-' + d, []).ids;
            const ranks = ids.map((id) => rank[Data.question(id)!.difficulty!]);
            for (let i = 1; i < ranks.length; i++) expect(ranks[i]).toBeGreaterThanOrEqual(ranks[i - 1]);
        }
    });

    it('a chapter with no shapes still draws ten, unseen first', () => {
        const p = pool([], 13);
        const Data = load(p);
        const ch = Data.chapter('p1-02');
        expect(ch.shapes).toBeUndefined();
        const first = Data.draw(ch, 1, 'device-0', []).ids;
        expect(first).toHaveLength(10);
        const second = Data.draw(ch, 2, 'device-0', first).ids;
        const unseen = p.ids.filter((id) => !first.includes(id));
        expect(unseen).toHaveLength(3);
        for (const id of unseen) expect(second).toContain(id);
        expect(Data.shapeKey(Data.question(first[0]))).toBe('other');
    });
});

describe('Data.sibling', () => {
    it('prefers an unseen question of the same shape, and says so', () => {
        const p = pool(['a', 'b', 'c'], 15);
        const Data = load(p);
        const ch = Data.chapter('p1-02');
        const from = p.ids[0];                                          // shape a
        const s = Data.sibling(from, ch, [from])!;
        expect(s.same_shape).toBe(true);
        expect(Data.shapeKey(Data.question(s.qid))).toBe('a');
        expect(s.qid).not.toBe(from);
    });

    it('falls back to the similarity list, then any unseen, then the least recent, and reports same_shape honestly', () => {
        const p = pool(['a', 'b', 'c'], 15);
        const Data = load(p);
        const ch = Data.chapter('p1-02');
        const from = p.ids[0];
        const sameShape = p.ids.filter((_, i) => i % 3 === 0);        // every question of shape a
        const s = Data.sibling(from, ch, sameShape)!;                   // all of shape a seen
        expect(p.siblings[from]).toContain(s.qid);
        expect(s.same_shape).toBe(Data.shapeKey(Data.question(s.qid)) === 'a');
        expect(s.same_shape).toBe(false);
        const allSeen = Data.sibling(from, ch, p.ids.slice())!;         // everything seen: the least recent that is not `from`
        expect(allSeen.qid).toBe(p.ids[1]);
        expect(Data.sibling(from, ch, [])!.qid).not.toBe(from);
    });

    it('never says same_shape for a question with no shape', () => {
        const p = pool([], 13);
        const Data = load(p);
        const s = Data.sibling(p.ids[0], Data.chapter('p1-02'), [p.ids[0]])!;
        expect(s.same_shape).toBe(false);
    });
});

describe('Data.facts / shapeLabel', () => {
    it('facts carries the public route facts and the shape; shapeLabel reads the chapter list', () => {
        const p = pool(['a', 'b'], 6, { theoryEvery: 3 });
        const Data = load(p);
        const f = Data.facts([p.ids[0], p.ids[1], 'missing']);
        expect(Object.keys(f)).toEqual([p.ids[0], p.ids[1]]);
        expect(f[p.ids[0]]).toMatchObject({ has_routes: true, theory: true, shape: { key: 'a', label: 'Shape A' } });
        expect(f[p.ids[1]]).toMatchObject({ has_routes: true, theory: false, route_key: 'r' });
        expect(Data.shapeLabel(Data.chapter('p1-02'), 'b')).toBe('Shape B');
        expect(Data.shapeLabel(Data.chapter('p1-02'), 'zz')).toBeNull();
    });
});
