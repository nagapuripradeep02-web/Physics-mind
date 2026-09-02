/**
 * practiceMarks.test.ts — the marks rule for the PRACTICE section (2026-09-02).
 *
 *   npx vitest run src/lib/answerBook/__tests__/practiceMarks.test.ts
 *
 * A PROBLEM is a question the source book prints and the paper does not ask, so
 * it is the first qtype with no slot of its own. Two properties have to hold, and
 * the second is the one that matters: the check must FAIL CLOSED on a paper that
 * never declared a practice section. The paper-section check does the opposite —
 * it skips a subject it does not know — and that is exactly how a whole paper
 * lost its marks gate by silence on 2026-08-29. This test is the negative control
 * for that, so a later hand cannot quietly widen the rule back to a free pass.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { answerBookQuestionSchema, allowedMarks, paperMarksFor, PAPER_QTYPES } from '../../../schemas/answerBook';

const base = JSON.parse(
    readFileSync(join(__dirname, 'fixtures', 'parallelogram_law.question.json'), 'utf8'),
);

/**
 * The fixture rebuilt as one question of the given shape. Steps and mark_split
 * are collapsed to a single row carrying the whole total, so the sum rules are
 * satisfied by construction and only the paper/practice rule can object.
 */
function variant(subject: string, qtype: string, marks: number) {
    const q = JSON.parse(JSON.stringify(base));
    q.subject = subject;
    q.qtype = qtype;
    q.marks_total = marks;
    if (qtype === 'PROBLEM') q.paper_section = 'Practice';
    q.answer.steps = [{ ...q.answer.steps[0], marks, mark_note: 'the whole answer' }];
    q.mark_split = [{ label: 'the whole answer', marks }];
    delete q.cuts;
    return q;
}

const messages = (o: unknown): string[] => {
    const r = answerBookQuestionSchema.safeParse(o);
    return r.success ? [] : r.error.issues.map((i) => i.message);
};
const marksComplaint = (o: unknown) =>
    messages(o).filter((m) => /marks_total|practice section|no \w+ section/.test(m));

describe('allowedMarks', () => {
    it('gives a paper section its single printed value', () => {
        expect(allowedMarks('physics', 'LAQ')).toEqual([8]);
        expect(allowedMarks('mathematics_2a', 'LAQ')).toEqual([7]);   // still the 75-mark paper
        expect(allowedMarks('physics', 'VSAQ')).toEqual([2]);
    });

    it('gives a practice problem the shapes its paper allows', () => {
        expect(allowedMarks('physics', 'PROBLEM')).toEqual([2, 4]);
        expect(allowedMarks('chemistry', 'PROBLEM')).toEqual([2, 4]);
    });

    it('returns EMPTY, never undefined, for a paper that declares no practice section', () => {
        // Empty is the fail-closed signal the schema reports on; undefined would
        // be read as "nothing to check" and let the card through.
        expect(allowedMarks('botany', 'PROBLEM')).toEqual([]);
        expect(allowedMarks('zoology', 'PROBLEM')).toEqual([]);
        expect(allowedMarks('mathematics', 'PROBLEM')).toEqual([]);
    });

    it('returns undefined only for a subject that is not in the table at all', () => {
        expect(allowedMarks('astrology', 'LAQ')).toBeUndefined();
    });

    it('paperMarksFor still answers for paper sections and stays silent on PROBLEM', () => {
        expect(paperMarksFor('physics', 'SAQ')).toBe(4);
        expect(paperMarksFor('physics', 'PROBLEM')).toBeUndefined();
        expect(PAPER_QTYPES).not.toContain('PROBLEM');
    });
});

describe('the schema on a practice problem', () => {
    it('accepts both shapes its paper allows', () => {
        expect(marksComplaint(variant('physics', 'PROBLEM', 2))).toEqual([]);
        expect(marksComplaint(variant('physics', 'PROBLEM', 4))).toEqual([]);
        expect(marksComplaint(variant('chemistry', 'PROBLEM', 4))).toEqual([]);
    });

    it('rejects a mark value the paper has no shape for', () => {
        const m = marksComplaint(variant('physics', 'PROBLEM', 3));
        expect(m.length).toBe(1);
        expect(m[0]).toContain('2 or 4');
    });

    it('rejects a problem on a paper that declares no practice section', () => {
        const m = marksComplaint(variant('botany', 'PROBLEM', 2));
        expect(m.length).toBe(1);
        expect(m[0]).toContain('declares no practice section');
    });

    it('still holds the paper sections to their own single value', () => {
        // The regression this must never lose: a 7-mark maths-1A long answer is
        // the pre-2026-27 pattern, and 99 cards once carried it.
        expect(marksComplaint(variant('mathematics', 'LAQ', 7)).length).toBe(1);
        expect(marksComplaint(variant('mathematics', 'LAQ', 8))).toEqual([]);
        expect(marksComplaint(variant('physics', 'VSAQ', 4)).length).toBe(1);
    });

    it('holds a CUT to the same rule as a root card', () => {
        // A real cuts array: at least two, and cuts[0] restates the root header.
        // The second cut is the offender — a problem at a value no paper shape has.
        const q = variant('physics', 'SAQ', 4);
        q.paper_section = 'Section B';
        q.expected_time_min = 8;
        const stepId = q.answer.steps[0].id;
        const cut = (key: string, qtype: string, marks: number, section: string, mins: number) => ({
            key, label: key, qtype, marks_total: marks, paper_section: section,
            expected_time_min: mins,
            mark_split: [{ label: 'the whole answer', marks }],
            steps: { [stepId]: { marks, mark_note: 'the whole answer' } },
            needs_teacher_verification: true,
        });
        q.cuts = [cut('saq', 'SAQ', 4, 'Section B', 8), cut('practice', 'PROBLEM', 3, 'Practice', 4)];
        const m = marksComplaint(q);
        expect(m.length).toBe(1);
        expect(m[0]).toContain('cut "practice"');
        expect(m[0]).toContain('2 or 4');

        // and the same cut at a legal shape is accepted
        q.cuts[1] = cut('practice', 'PROBLEM', 2, 'Practice', 4);
        expect(marksComplaint(q)).toEqual([]);
    });
});
