/**
 * The typed-question matcher — tested against the SHIPPED eapcet-app/js/58_match.js.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

type Q = { id: string; chapter_key: string; question_en: string };
type MatchApi = {
    normalise(s: string): string;
    tokens(s: string): string[];
    score(qTokens: string[], qNorm: string, stem: string): { score: number; shared: number; sharedNum: number };
    find(text: string, questions: Q[], ck?: string | null): { few: boolean; hits: { qid: string; ck: string; score: number; shared: number }[] };
    MIN_SCORE: number;
};
function load(): MatchApi {
    const js = readFileSync(join(process.cwd(), 'eapcet-app', 'js', '58_match.js'), 'utf8');
    expect(js.indexOf('var Match = (function () {'), '58_match.js does not define Match').toBeGreaterThan(-1);
    return new Function(`${js}\n; return Match;`)() as MatchApi;
}
const Match = load();

const STONE = 'A stone dropped from the top of a tower covers a distance of 45 m in the last second of its fall. The height of the tower is (g = 10 m/s²)';
const POOL: Q[] = [
    { id: 'stone', chapter_key: 'p1-02', question_en: STONE },
    { id: 'ball', chapter_key: 'p1-02', question_en: 'A ball is thrown vertically upwards with a velocity of 20 m/s. The time taken to reach the highest point is' },
    { id: 'car', chapter_key: 'p1-02', question_en: 'A car moving at 72 km/h is brought to rest in 4 s by brakes. The distance covered before stopping is' },
    { id: 'work', chapter_key: 'p1-05', question_en: 'A body of mass 2 kg is lifted through a height of 5 m. The work done against gravity is (g = 10 m/s²)' },
    { id: 'tower2', chapter_key: 'p1-05', question_en: 'A stone dropped from a tower reaches the ground in 3 s. The height of the tower is' },
];

describe('Match.normalise and tokens', () => {
    it('lower-cases, maps superscripts to digits and strips everything but letters and digits', () => {
        expect(Match.normalise('  (g = 10 m/s²)  Velocity²!')).toBe('g 10 m s2 velocity2');
        expect(Match.normalise('v₁ + v₂')).toBe('v1 v2');
    });
    it('drops stop words, strips a trailing s, keeps numbers, and dedupes', () => {
        expect(Match.tokens('The stones fall from the towers in 4 s and the stones')).toEqual(['stone', 'fall', 'tower', '4', 's']);
        expect(Match.tokens('mass class')).toEqual(['mass', 'class']);
    });
});

describe('Match.score and find', () => {
    it('the exact stem scores 1', () => {
        expect(Match.score(Match.tokens(STONE), Match.normalise(STONE), STONE).score).toBe(1);
    });
    it('the first eight words of a stem find it first with a score of at least 0.6', () => {
        const first8 = STONE.split(' ').slice(0, 8).join(' ');
        const r = Match.find(first8, POOL, null);
        expect(r.few).toBe(false);
        expect(r.hits[0].qid).toBe('stone');
        expect(r.hits[0].score).toBeGreaterThanOrEqual(0.6);
    });
    it('a mid-stem phrase with the numbers finds it too', () => {
        const r = Match.find('covers 45 m in the last second', POOL, null);
        expect(r.hits[0].qid).toBe('stone');
    });
    it('unrelated text finds nothing, and under three tokens asks for more', () => {
        expect(Match.find('resistance of a copper wire doubles when heated', POOL, null).hits).toEqual([]);
        expect(Match.find('the tower', POOL, null)).toEqual({ few: true, hits: [] });
    });
    it('returns three at most', () => {
        const many = POOL.concat([{ id: 'x1', chapter_key: 'p1-02', question_en: STONE + ' A' }, { id: 'x2', chapter_key: 'p1-02', question_en: STONE + ' B' }]);
        expect(Match.find(STONE, many, null).hits.length).toBe(3);
    });
    it('a near tie goes to the chapter the student came from', () => {
        const text = 'stone dropped from a tower height of the tower';
        const plain = Match.find(text, POOL, null).hits.map((h) => h.qid);
        const fromWork = Match.find(text, POOL, 'p1-05').hits.map((h) => h.qid);
        expect(plain).toContain('tower2');
        expect(plain).toContain('stone');
        expect(fromWork[0]).toBe('tower2');
    });
});
