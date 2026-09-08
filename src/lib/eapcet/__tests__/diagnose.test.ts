/**
 * The diagnosis rule — tested against the SHIPPED eapcet-app/js/55_diag.js.
 *
 * Everything the result screen says about a student ("you know the concepts; your
 * calculation slips", "guessed right: 2", the seconds-per-question line) is derived
 * by Diag.diagnose from the run's records. The rules that matter and are easy to
 * get silently wrong: the weakness is the largest wrong-type count, ties broken
 * concept > application > calculation > time; fewer than two wrong answers name no
 * weakness; a guessed-right answer counts in the score but is listed for a second
 * look; the streak toward "strong now" survives only correct-AND-sure retries.
 *
 * Extract-and-evaluate, like syncMerge.test.ts: a reimplementation would pass
 * forever while the shipped one rotted.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

type Rec = { qid: string; picked: number; correct: boolean; ms: number; probe: string };
type Verdict = {
    score: number; total: number; hist: Record<string, number>; guessed_right: number;
    weakness: string | null; wrong_ids: string[]; guessed_ids: string[];
    sec_per_q: number | null; exam_sec_per_q: number;
};
type DiagApi = {
    diagnose(records: Rec[]): Verdict;
    streakAfter(streak: Record<string, number> | null, type: string, retry: { correct: boolean; probe: string }): number;
    strongNow(n: number): boolean;
    WRONG_TYPES: string[]; STRONG_AT: number; MIN_WRONG: number; EXAM_SEC_PER_Q: number;
};

function loadDiag(): DiagApi {
    const js = readFileSync(join(process.cwd(), 'eapcet-app', 'js', '55_diag.js'), 'utf8');
    expect(js.indexOf('var Diag = (function () {'), '55_diag.js does not define Diag').toBeGreaterThan(-1);
    return new Function(`${js}\n; return Diag;`)() as DiagApi;
}

const Diag = loadDiag();

function rec(qid: string, correct: boolean, probe: string, ms = 60000): Rec {
    return { qid, picked: 1, correct, ms, probe };
}

describe('Diag.diagnose', () => {
    it('empty run: zero score, no weakness, no timing', () => {
        const v = Diag.diagnose([]);
        expect(v.score).toBe(0);
        expect(v.total).toBe(0);
        expect(v.weakness).toBeNull();
        expect(v.sec_per_q).toBeNull();
        expect(v.hist).toEqual({ concept: 0, application: 0, calculation: 0, time: 0 });
    });

    it('a ten-question run: score, histogram, guessed-right, weakness, order of ids', () => {
        const v = Diag.diagnose([
            rec('q1', true, 'sure'), rec('q2', true, 'guessed'), rec('q3', false, 'calculation'),
            rec('q4', true, 'sure'), rec('q5', false, 'concept'), rec('q6', true, 'guessed'),
            rec('q7', false, 'calculation'), rec('q8', true, 'sure'), rec('q9', false, 'time'),
            rec('q10', true, 'sure'),
        ]);
        expect(v.score).toBe(6);
        expect(v.total).toBe(10);
        expect(v.guessed_right).toBe(2);
        expect(v.hist).toEqual({ concept: 1, application: 0, calculation: 2, time: 1 });
        expect(v.weakness).toBe('calculation');
        expect(v.wrong_ids).toEqual(['q3', 'q5', 'q7', 'q9']);
        expect(v.guessed_ids).toEqual(['q2', 'q6']);
    });

    it('ties break concept > application > calculation > time', () => {
        expect(Diag.WRONG_TYPES).toEqual(['concept', 'application', 'calculation', 'time']);
        expect(Diag.diagnose([rec('a', false, 'calculation'), rec('b', false, 'concept'),
            rec('c', false, 'calculation'), rec('d', false, 'concept')]).weakness).toBe('concept');
        expect(Diag.diagnose([rec('a', false, 'time'), rec('b', false, 'application'),
            rec('c', false, 'time'), rec('d', false, 'application')]).weakness).toBe('application');
        expect(Diag.diagnose([rec('a', false, 'time'), rec('b', false, 'calculation'),
            rec('c', false, 'time'), rec('d', false, 'calculation')]).weakness).toBe('calculation');
        expect(Diag.diagnose([rec('a', false, 'time'), rec('b', false, 'time')]).weakness).toBe('time');
    });

    it('fewer than two wrong answers name no weakness', () => {
        expect(Diag.MIN_WRONG).toBe(2);
        const one = Diag.diagnose([rec('a', false, 'concept'), rec('b', true, 'sure'), rec('c', true, 'sure')]);
        expect(one.weakness).toBeNull();
        expect(one.hist.concept).toBe(1);
        expect(one.wrong_ids).toEqual(['a']);
    });

    it('a wrong answer with no recognised probe counts as wrong but names no type', () => {
        const v = Diag.diagnose([rec('a', false, ''), rec('b', false, 'unknown')]);
        expect(v.wrong_ids).toEqual(['a', 'b']);
        expect(v.hist).toEqual({ concept: 0, application: 0, calculation: 0, time: 0 });
        expect(v.weakness).toBeNull();
    });

    it('seconds per question is the median, to one decimal, against the exam pace', () => {
        const v = Diag.diagnose([rec('a', true, 'sure', 30000), rec('b', true, 'sure', 90000), rec('c', false, 'time', 61234)]);
        expect(v.sec_per_q).toBe(61.2);
        const even = Diag.diagnose([rec('a', true, 'sure', 40000), rec('b', true, 'sure', 60000)]);
        expect(even.sec_per_q).toBe(50);
        expect(v.exam_sec_per_q).toBe(67.5);            // 160 questions in 180 minutes
        expect(Diag.EXAM_SEC_PER_Q).toBe(67.5);
        const bad = Diag.diagnose([rec('a', true, 'sure', -5), rec('b', true, 'sure', 20000)]);
        expect(bad.sec_per_q).toBe(20);                  // a negative duration is ignored, not averaged
    });
});

describe('Diag.streakAfter / strongNow', () => {
    it('correct-and-sure extends the streak; wrong or guessed resets it', () => {
        expect(Diag.streakAfter(null, 'calculation', { correct: true, probe: 'sure' })).toBe(1);
        expect(Diag.streakAfter({ calculation: 2 }, 'calculation', { correct: true, probe: 'sure' })).toBe(3);
        expect(Diag.streakAfter({ calculation: 2 }, 'calculation', { correct: true, probe: 'guessed' })).toBe(0);
        expect(Diag.streakAfter({ calculation: 2 }, 'calculation', { correct: false, probe: 'concept' })).toBe(0);
        expect(Diag.streakAfter({ concept: 5 }, 'calculation', { correct: true, probe: 'sure' })).toBe(1);
    });

    it('strong now at three, not before', () => {
        expect(Diag.STRONG_AT).toBe(3);
        expect(Diag.strongNow(2)).toBe(false);
        expect(Diag.strongNow(3)).toBe(true);
        let n = 0;
        for (let i = 0; i < 3; i++) n = Diag.streakAfter({ concept: n }, 'concept', { correct: true, probe: 'sure' });
        expect(Diag.strongNow(n)).toBe(true);
        n = Diag.streakAfter({ concept: n }, 'concept', { correct: false, probe: 'time' });
        expect(Diag.strongNow(n)).toBe(false);
    });
});
