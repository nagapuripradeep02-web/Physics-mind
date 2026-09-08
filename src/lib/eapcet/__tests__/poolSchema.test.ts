/**
 * The release-file schema — the gates a typo could break, each proven to fire.
 *
 * A valid fixture is built once and every test mutates one thing: the schema
 * must accept the fixture and reject each mutation with a message naming the
 * question or chapter, because the build prints that message and stops.
 */
import { describe, expect, it } from 'vitest';
import { EAPCET_OPEN_AT, EapcetPoolReleaseSchema } from '@/schemas/eapcetPool';

const SHA = 'a'.repeat(64);

function solution(id: string, option: number) {
    return {
        schema: 'eapcet_solution_v1', question_id: id,
        approach: 'Work equals the change in kinetic energy.',
        steps: [{ text: 'Differentiate.', equation: 'v = t²' }, { text: 'Evaluate.', equation: 'W = 24 J' }],
        final_answer: { option, value: '24 J' }, confidence: 'sure',
        common_mistakes: [{ option: 1, text: 'Using the final force as constant gives 32 J.' }],
        concept_tags: ['work-energy theorem'], difficulty: 'easy', mistake_type_hint: 'application',
        authored_by: { model: 'sonnet', wave: 1, agent: 'W01-A-p1-05', at: '2026-09-09T10:00:00+05:30' },
    };
}

function question(n: number, chapter_key: string, verified: boolean) {
    const id = `tg_eapcet_2023_20230512_fn_q${String(80 + n).padStart(3, '0')}`;
    const q: Record<string, unknown> = {
        id, chapter_key, chapter: 'Work Power Energy', year: 2023, date: '2023-05-12', session: 'FN', q_no: 80 + n,
        asked_label: `TG EAPCET 2023, 12 May, morning, Q${80 + n}`,
        question_en: 'A body of mass 3 kg moves with s = t³/3. The work done in the first two seconds is',
        options_en: ['32 J', '3.8 J', '5.2 J', '24 J'], answer: 4, recurrence: 0, twin_of: [],
        grounding: { answer_book_cards: [{ question_id: 'ts_ipe_p1_wpe_state_work_energy_theorem', score: 0.18 }], weak_match: false, unit_cards: 24 },
    };
    if (verified) {
        q.solution = solution(id, 4);
        q.verified = { gate_sha: SHA, audit_verdict: 'ok', audited_by: 'W01-U-p1-05', spot_checked: false };
    }
    return q;
}

function fixture(verifiedCount: number) {
    const qs = Array.from({ length: 15 }, (_, i) => question(i, 'p1-05', i < verifiedCount));
    const questions: Record<string, unknown> = {};
    for (const q of qs) questions[q.id as string] = q;
    const ids = qs.map((q) => q.id as string);
    const siblings: Record<string, string[]> = {};
    for (const id of ids) siblings[id] = ids.filter((o) => o !== id).slice(0, 6);
    return {
        schema: 'eapcet_physics_pool_v1',
        built_from: { bank: 'eapcet/bank/physics_v1.json', bank_sha256: SHA, bank_rows: 1041, selector_version: 1,
            built_at: '2026-09-08T02:00:00+05:30', release_at: '2026-09-08T03:00:00+05:30', open_at: EAPCET_OPEN_AT,
            gated: 15, verified: verifiedCount },
        exam: { shifts: 26, physics_per_shift: 40 },
        rules: { exclude: ['needs_figure'], twin_jaccard: 0.85, recurrence_jaccard_digits_masked: 0.5, target_per_chapter: 15, siblings: 6 },
        chapters: [{ key: 'p1-05', name: 'Work Power Energy', paper: 'first_year', order: 5,
            answer_book_unit: { subject: 'physics', number: 5 }, asked_total: 47, share_pct: 4.5, per_exam: 1.8, eligible: 46,
            pool_ids: ids, verified_ids: ids.slice(0, verifiedCount),
            open: verifiedCount >= EAPCET_OPEN_AT,
            closed_because: verifiedCount >= EAPCET_OPEN_AT ? null : `${verifiedCount} of ${EAPCET_OPEN_AT} verified` }],
        questions, siblings,
    };
}

function messages(rel: unknown): string[] {
    const r = EapcetPoolReleaseSchema.safeParse(rel);
    return r.success ? [] : r.error.issues.map((i) => i.message);
}

describe('EapcetPoolReleaseSchema', () => {
    it('accepts a release with an open chapter of 13 and a closed one of 5', () => {
        expect(messages(fixture(13))).toEqual([]);
        expect(messages(fixture(5))).toEqual([]);
    });

    it('rejects a solution whose option is not the official key', () => {
        const rel = fixture(13) as any;
        const id = rel.chapters[0].verified_ids[0];
        rel.questions[id].solution.final_answer.option = 1;
        expect(messages(rel).join('\n')).toMatch(new RegExp(`${id}: solution says option 1, the key says 4`));
    });

    it('rejects a chapter open under the threshold, and a closed one carrying no reason', () => {
        const rel = fixture(12) as any;
        rel.chapters[0].open = true;
        rel.chapters[0].closed_because = null;
        expect(messages(rel).join('\n')).toMatch(/p1-05 is open with 12 verified \(needs 13\)/);
    });

    it('rejects a solution travelling without its verification, and the reverse', () => {
        const rel = fixture(13) as any;
        const id = rel.chapters[0].verified_ids[0];
        delete rel.questions[id].verified;
        expect(messages(rel).join('\n')).toMatch(/solution and verified must travel together/);
    });

    it('rejects a verified id that carries no solution, and a solution outside verified_ids', () => {
        const rel = fixture(13) as any;
        const [a] = rel.chapters[0].verified_ids;
        delete rel.questions[a].solution;
        delete rel.questions[a].verified;
        expect(messages(rel).join('\n')).toMatch(new RegExp(`verified_ids names ${a}, which carries no solution`));
        const rel2 = fixture(13) as any;
        rel2.chapters[0].verified_ids = rel2.chapters[0].verified_ids.slice(1);
        expect(messages(rel2).join('\n')).toMatch(/carries a solution but is not in p1-05 verified_ids/);
    });

    it('rejects a sibling that is unknown, itself, or from another chapter', () => {
        const rel = fixture(13) as any;
        const id = rel.chapters[0].pool_ids[0];
        rel.siblings[id] = ['tg_eapcet_2099_20990101_fn_q001'];
        expect(messages(rel).join('\n')).toMatch(/not in questions/);
        rel.siblings[id] = [id];
        expect(messages(rel).join('\n')).toMatch(/names itself/);
    });

    it('rejects an unknown key anywhere (a stray field is a stray field)', () => {
        const rel = fixture(13) as any;
        rel.questions[rel.chapters[0].pool_ids[0]].note = 'hello';
        expect(messages(rel).length).toBeGreaterThan(0);
        const rel2 = fixture(13) as any;
        rel2.questions[rel2.chapters[0].verified_ids[0]].solution.confidence = 'medium';
        expect(messages(rel2).length).toBeGreaterThan(0);
    });
});
