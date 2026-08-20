/**
 * recallGrader.test.ts — the guards that stand between a real recall and a wrong
 * "you missed this". Pure: a canned model response is injected, no network.
 *
 *   npx vitest run src/lib/answerBook/recallGrader.test.ts
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { gradeRecall, normalizeForQuote, findInNormalized, normalizeForRescue } from '../recallGrader';
import { answerBookQuestionSchema, type AnswerBookQuestion } from '../../../schemas/answerBook';
import type { RecallCheck } from '../../../schemas/answerBookRecall';

const question: AnswerBookQuestion = answerBookQuestionSchema.parse(
    JSON.parse(
        readFileSync(
            join(process.cwd(), 'answer-book', 'questions', 'ts_ipe_p1_vec_parallelogram_law.json'),
            'utf8',
        ),
    ),
);

const ALL_IDS = question.answer.steps.map((s) => s.id);

/** Model says every step covered, quoting the given span. */
function allCovered(evidence: string, confidence = 0.9): RecallCheck {
    return { on_topic: true, steps: ALL_IDS.map((id) => ({ step_id: id, covered: true, evidence, confidence })) };
}
const bucketOf = (r: { steps: Array<{ step_id: string; bucket: string }> }, id: string) =>
    r.steps.find((s) => s.step_id === id)!.bucket;

const canned = (o: RecallCheck) => ({ callModel: async () => o });

describe('normalisers', () => {
    it('maps a normalised hit back to raw offsets so the student sees their own words', () => {
        const raw = 'First, the STATEMENT -- two vectors!';
        const norm = normalizeForQuote(raw);
        const hit = findInNormalized(norm, 'the statement');
        expect(hit).not.toBeNull();
        expect(raw.slice(hit!.rawStart, hit!.rawEnd)).toBe('the STATEMENT');
    });

    it('repairs common speech-to-text manglings for the rescue pass only', () => {
        expect(normalizeForRescue('tan universe of that')).toContain('tan inverse');
        expect(normalizeForRescue('pythagorus theorem')).toContain('pythagoras');
        expect(normalizeForRescue('parallel program law')).toContain('parallelogram');
        expect(normalizeForRescue('cos theater')).toContain('theta');
    });
});

describe('G2 — thin transcript never reaches the model', () => {
    it('returns not_enough_heard with no score, no misses and no LLM call', async () => {
        let called = false;
        const r = await gradeRecall(question, 'um first statement', {
            callModel: async () => {
                called = true;
                return allCovered('x');
            },
        });
        expect(r.outcome).toBe('not_enough_heard');
        expect(called).toBe(false);       // the whole point: an accidental tap costs nothing
        expect(r.steps).toHaveLength(0);
        expect(r.marks_earned).toBe(0);
    });
});

describe('G3 — off topic', () => {
    it('returns not_this_answer with no misses', async () => {
        const t = 'yesterday i went to the market and bought some vegetables for dinner at home';
        const r = await gradeRecall(question, t, canned({ on_topic: false, steps: [] }));
        expect(r.outcome).toBe('not_this_answer');
        expect(r.steps).toHaveLength(0);
    });
});

describe('G4 — an unverifiable evidence quote demotes, it never accuses', () => {
    it('moves a paraphrased-evidence step to unsure, not missed, and does not credit it', async () => {
        const t = 'first the statement then i draw the figure then construction then pythagoras and tan inverse and special cases at the end';
        const r = await gradeRecall(question, t, canned(allCovered('THIS PHRASE IS NOT IN THE TRANSCRIPT')));
        expect(r.outcome).toBe('graded');
        for (const id of ALL_IDS) expect(bucketOf(r, id)).toBe('unsure');
        expect(r.marks_earned).toBe(0);           // never credited on unverified evidence
        expect(r.steps.every((s) => s.demoted_by === 'evidence_check')).toBe(true);
    });
});

describe('G5 — asymmetric confidence floors', () => {
    const t = 'first the statement then i draw the figure then construction then pythagoras and tan inverse and special cases at the end';

    it('credits a covered step at 0.50 but not at 0.49', async () => {
        const at50 = await gradeRecall(question, t, canned(allCovered('the statement', 0.5)));
        expect(bucketOf(at50, 's1_statement')).toBe('covered');
        const at49 = await gradeRecall(question, t, canned(allCovered('the statement', 0.49)));
        expect(bucketOf(at49, 's1_statement')).toBe('unsure');
    });

    it('needs 0.70 to accuse — a low-confidence not-covered is unsure, never missed', async () => {
        const low: RecallCheck = {
            on_topic: true,
            steps: ALL_IDS.map((id) => ({ step_id: id, covered: false, evidence: null, confidence: 0.69 })),
        };
        const r = await gradeRecall(question, t, canned(low));
        expect(r.steps.every((s) => s.bucket === 'unsure')).toBe(true);
    });
});

describe('G6 — heard_as rescue removes an accusation without inventing credit', () => {
    it('demotes missed → unsure when the mangled term is present, and never to covered', async () => {
        const t = 'first the statement then i draw the figure then construction then legs then tan universe of q sin theta by p plus q cos theta and special cases';
        const missDirection: RecallCheck = {
            on_topic: true,
            steps: ALL_IDS.map((id) => ({
                step_id: id,
                covered: id !== 's7_alpha',
                evidence: id !== 's7_alpha' ? 'the statement' : null,
                confidence: 0.95,
            })),
        };
        const r = await gradeRecall(question, t, canned(missDirection));
        // "tan universe" normalises to "tan inverse", an authored heard_as for s7
        expect(bucketOf(r, 's7_alpha')).toBe('unsure');
        expect(r.steps.find((s) => s.step_id === 's7_alpha')!.demoted_by).toBe('rescue');
    });
});

describe('G7 — omissions and zero-mark steps are never accusations', () => {
    const t = 'first the statement then i draw the figure then construction then pythagoras and tan inverse and special cases at the end';

    it('treats a step the model never returned as unsure', async () => {
        const partial: RecallCheck = {
            on_topic: true,
            steps: [{ step_id: 's1_statement', covered: true, evidence: 'the statement', confidence: 0.9 }],
        };
        const r = await gradeRecall(question, t, canned(partial));
        expect(bucketOf(r, 's1_statement')).toBe('covered');
        for (const id of ALL_IDS.filter((i) => i !== 's1_statement')) {
            expect(bucketOf(r, id)).toBe('unsure');
            expect(r.steps.find((s) => s.step_id === id)!.demoted_by).toBe('omitted');
        }
    });

    it('never reports the zero-mark step as missed', async () => {
        const missAll: RecallCheck = {
            on_topic: true,
            steps: ALL_IDS.map((id) => ({ step_id: id, covered: false, evidence: null, confidence: 1 })),
        };
        const r = await gradeRecall(question, t, canned(missAll));
        expect(question.answer.steps.find((s) => s.id === 's8_special_cases')!.marks).toBe(0);
        expect(bucketOf(r, 's8_special_cases')).not.toBe('missed');
    });

    it('drops unknown and duplicate step ids from the model', async () => {
        const junk: RecallCheck = {
            on_topic: true,
            steps: [
                { step_id: 'not_a_real_step', covered: true, evidence: 'the statement', confidence: 1 },
                { step_id: 's1_statement', covered: true, evidence: 'the statement', confidence: 0.9 },
                { step_id: 's1_statement', covered: false, evidence: null, confidence: 1 },
            ],
        };
        const r = await gradeRecall(question, t, canned(junk));
        expect(r.steps).toHaveLength(ALL_IDS.length);          // one row per AUTHORED step
        expect(bucketOf(r, 's1_statement')).toBe('covered');   // first judgement wins
        expect(r.steps.some((s) => s.step_id === 'not_a_real_step')).toBe(false);
    });
});

describe('scoring is server-side arithmetic over authored marks', () => {
    it('sums only covered steps and never exceeds the authored total', async () => {
        const t = 'first the statement then i draw the figure then construction then pythagoras and tan inverse and special cases at the end';
        const r = await gradeRecall(question, t, canned(allCovered('the statement')));
        expect(r.marks_earned).toBe(question.marks_total);
        expect(r.marks_earned).toBe(8);
        expect(r.marks_total).toBe(8);
    });
});
