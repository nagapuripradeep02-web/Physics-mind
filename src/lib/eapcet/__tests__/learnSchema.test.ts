/**
 * The learn pack schema and its fold — one mutation per gate, so a gate that
 * stops firing is noticed the day it stops.
 */
import { describe, expect, it } from 'vitest';
import { EapcetLearnPackSchema, type EapcetLearnPack, type LearnQuestion } from '../../../schemas/eapcetLearn';
import { checkLearnPackAgainstRelease, fnv1a, foldLearnQuestion, learnLinks } from '../learnPack';

function question(id: string, difficulty: 1 | 2 | 3, answer = 2): LearnQuestion {
    const wrong = [1, 2, 3, 4].filter((o) => o !== answer);
    return {
        id, stem: `A car moves at a steady speed of 5 m/s for 4 s. Distance covered? (${difficulty})`,
        options: ['10 m', '20 m', '30 m', '40 m'], answer, difficulty,
        routes: [
            { id: 'r', text: 'I multiplied the speed by the time' },
            { id: 'm0', text: 'I added the speed to the time', type: 'concept', option: wrong[0], fix: 'Speed times time gives distance. Add nothing.' },
            { id: 'm1', text: 'I divided the speed by the time', type: 'application', option: wrong[1], fix: 'Distance is speed times time. Multiply.' },
            { id: 'm2', text: 'I doubled the product at the end', type: 'calculation', option: wrong[2], fix: 'Multiply once. Check the last step.' },
        ],
    };
}

function validPack(): EapcetLearnPack {
    return {
        schema: 'eapcet_learn_pack_v1', chapter_key: 'p1-05', chapter_name: 'Work Power Energy', reviewed: false,
        authored_by: { agent: 'test', at: '2026-09-09T00:00:00+05:30' },
        topics: [{
            key: 'work', title: 'Work',
            subtopics: [{
                key: 'work_from_force', title: 'Work from a constant force', shapes: ['work_from_force'],
                concept: {
                    lines: ['Work is force times displacement along the force.', 'A force at right angles does no work.', 'Work has the unit joule.', 'A larger displacement means more work.', 'Zero displacement means zero work.'],
                    formula: { text: 'W = F × s', meaning: 'W is work, F the force, s the displacement along the force.' },
                    example: { given: 'F = 5 N, s = 2 m along the force. Work?', steps: [{ text: 'Multiply.', equation: 'W = 5 × 2' }, { text: 'Write the unit.', equation: 'W = 10 J' }], answer: '10 J' },
                },
                check: {
                    stem: 'A force acts at right angles to the motion. What is the work done by it?',
                    options: ['The same as along the motion', 'Zero', 'Negative'], answer: 2,
                    why_right: 'No displacement along the force means no work.',
                    why_wrong: { '1': 'Only the part of the force along the motion does work.', '3': 'Negative work needs a force against the motion.' },
                },
                apply: [
                    { variants: [question('lq_p1-05_work_from_force_01', 1)] },
                    { variants: [question('lq_p1-05_work_from_force_02', 2, 3)] },
                    { variants: [question('lq_p1-05_work_from_force_03', 3, 4)] },
                ],
            }],
        }],
    };
}

function messages(p: unknown): string {
    const r = EapcetLearnPackSchema.safeParse(p);
    return r.success ? '' : r.error.issues.map((i) => i.message).join('\n');
}
function firstQ(p: EapcetLearnPack): LearnQuestion { return p.topics[0].subtopics[0].apply[0].variants[0]; }

describe('EapcetLearnPackSchema', () => {
    it('accepts the valid pack', () => {
        expect(messages(validPack())).toBe('');
    });
    it('needs exactly one right route', () => {
        const p = validPack();
        firstQ(p).routes[1] = { id: 'r', text: 'I found the distance another way' };
        expect(messages(p)).toContain('exactly one "r" route');
    });
    it('needs a route for every wrong option', () => {
        const p = validPack();
        firstQ(p).routes[3].option = 3;         // now two routes lead to 3, and 4 has none
        const m = messages(p);
        expect(m).toContain('two routes lead to option 3');
        expect(m).toContain('wrong option 4 has no route');
    });
    it('rejects a route that leads to the answer', () => {
        const p = validPack();
        firstQ(p).routes[1].option = 2;
        expect(messages(p)).toContain('must name a wrong option');
    });
    it('needs a type and a fix on every wrong route', () => {
        const p = validPack();
        delete firstQ(p).routes[1].type;
        delete firstQ(p).routes[2].fix;
        const m = messages(p);
        expect(m).toContain('has no type');
        expect(m).toContain('has no fix');
    });
    it('route phrases start with "I ", stay under thirteen words, carry no two-digit number', () => {
        const p = validPack();
        firstQ(p).routes[0].text = 'Multiplied the speed by the time';
        firstQ(p).routes[1].text = 'I added the speed to the time and then to the distance as well';
        firstQ(p).routes[2].text = 'I divided 20 by the time';
        const m = messages(p);
        expect(m).toContain('must start with "I "');
        expect(m).toContain('over 12 words');
        expect(m).toContain('two or more digits');
    });
    it('route phrases never mark themselves wrong or name the right quantity', () => {
        const p = validPack();
        firstQ(p).routes[1].text = 'I wrongly added the speed to the time';
        firstQ(p).routes[2].text = 'I used the speed, not the distance';
        const m = messages(p);
        expect(m).toContain('marks itself wrong');
        expect(m).toContain('"X, not Y"');
        const p2 = validPack();
        firstQ(p2).routes[1].text = 'I dropped the factor of two';
        firstQ(p2).routes[2].text = 'I added the two instead of multiplying them';
        firstQ(p2).routes[3].text = 'I used the time rather than the distance';
        const m2 = messages(p2);
        expect(m2.match(/marks itself wrong/g)).toHaveLength(1);
        expect(m2.match(/instead of/g)).toHaveLength(2);
    });
    it('route phrases are distinct and never equal an option or a concept line', () => {
        const p = validPack();
        firstQ(p).routes[2].text = firstQ(p).routes[1].text;
        firstQ(p).routes[3].text = 'I multiplied the speed by the time';   // same as r
        expect(messages(p)).toContain('repeats another route');
        const p2 = validPack();
        p2.topics[0].subtopics[0].concept.lines[0] = 'I multiplied the speed by the time';
        expect(messages(p2)).toContain('repeats a concept line');
        const p3 = validPack();
        firstQ(p3).options[0] = 'I added the speed to the time';
        expect(messages(p3)).toContain('equals an option');
    });
    it('difficulty rises 1, 2, 3 across the slots', () => {
        const p = validPack();
        p.topics[0].subtopics[0].apply[1].variants[0].difficulty = 1;
        expect(messages(p)).toContain('the three rise 1, 2, 3');
    });
    it('question ids are unique and carry the chapter and subtopic keys', () => {
        const p = validPack();
        p.topics[0].subtopics[0].apply[2].variants[0].id = 'lq_p1-05_work_from_force_01';
        expect(messages(p)).toContain('repeats');
        const p2 = validPack();
        firstQ(p2).id = 'lq_p1-02_work_from_force_01';
        expect(messages(p2)).toContain('does not carry the chapter key');
        const p3 = validPack();
        firstQ(p3).id = 'lq_p1-05_other_01';
        expect(messages(p3)).toContain('does not carry the subtopic key');
    });
    it('subtopic keys are unique in a chapter', () => {
        const p = validPack();
        const s = JSON.parse(JSON.stringify(p.topics[0].subtopics[0]));
        s.apply.forEach((slot: { variants: LearnQuestion[] }, i: number) => { slot.variants[0].id = `lq_p1-05_work_from_force_1${i}`; });
        p.topics.push({ key: 'more', title: 'More', subtopics: [s] });
        expect(messages(p)).toContain('subtopic key "work_from_force" repeats');
    });
    it('the check asks about the idea: no number in the stem, a why_wrong line for every wrong option', () => {
        const p = validPack();
        p.topics[0].subtopics[0].check.stem = 'A 5 N force acts at right angles. Work?';
        delete p.topics[0].subtopics[0].check.why_wrong['3'];
        const m = messages(p);
        expect(m).toContain('carries a number');
        expect(m).toContain('wrong option 3 has no why_wrong');
    });
    it('runs the Rule 41 idiom scan over every string', () => {
        const p = validPack();
        p.topics[0].subtopics[0].concept.lines[1] = 'Once you see it, the trick is to multiply.';
        expect(messages(p)).toContain('Rule 41');
    });
    it('refuses a solution field name as an extra key', () => {
        const p = validPack() as unknown as Record<string, unknown>;
        (p.topics as Record<string, unknown>[])[0].right_route = 'x';
        expect(messages(p)).not.toBe('');
    });
});

describe('foldLearnQuestion', () => {
    it('types the wrong options, keeps the fixes by option, orders the menu by hash, gives r the answer', () => {
        const q = question('lq_p1-05_work_from_force_01', 1, 2);
        const f = foldLearnQuestion(q);
        expect(f.option_types).toEqual({ '1': 'concept', '3': 'application', '4': 'calculation' });
        expect(f.fixes['3']).toBe('Distance is speed times time. Multiply.');
        expect(f.has_routes).toBe(true);
        expect(f.theory).toBe(false);
        expect(f.route_key).toBe('r');
        expect(f.question_en).toBe(q.stem);
        expect(f.options_en).toEqual(q.options);
        expect(f.routes.find((r) => r.id === 'r')?.option).toBe(2);
        const expected = ['r', 'm0', 'm1', 'm2'].sort((a, b) => fnv1a(`${q.id}|${a}`) - fnv1a(`${q.id}|${b}`));
        expect(f.routes.map((r) => r.id)).toEqual(expected);
        expect(JSON.stringify(f)).not.toContain('"fix"');
    });
});

describe('learnLinks and the release check', () => {
    it('links a shape to the subtopics that teach it', () => {
        expect(learnLinks(validPack())).toEqual({ work_from_force: ['work_from_force'] });
    });
    it('rejects a shape the chapter does not define and a stem copied from a past paper', () => {
        const p = validPack();
        p.topics[0].subtopics[0].shapes.push('power_at_instant');
        const release = {
            chapters: [{ key: 'p1-05', name: 'Work Power Energy', shapes: [{ key: 'work_from_force', label: 'Work from a force' }] }],
            questions: { q1: { question_en: firstQ(p).stem } },
        };
        const issues = checkLearnPackAgainstRelease(p, release);
        expect(issues.some((i) => i.includes('power_at_instant'))).toBe(true);
        expect(issues.some((i) => i.includes('past-paper'))).toBe(true);
        expect(checkLearnPackAgainstRelease(validPack(), { ...release, questions: {} })).toEqual([]);
    });
});
