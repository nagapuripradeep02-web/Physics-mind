/**
 * probe_recall.ts — tune a question's recall rubric against the REAL model.
 *
 *   npx tsx --env-file=.env.local src/scripts/probe_recall.ts [question_id]
 *
 * The grader's guards are unit-tested with canned responses
 * (src/lib/answerBook/__tests__/recallGrader.test.ts). What CANNOT be unit-tested is
 * whether the authored rubric + prompt make the real model generous enough — and
 * honest enough. This probe is that check. Run it after authoring a new question's
 * `recall` blocks, and after any prompt edit.
 *
 * Costs a few paise per run (LLM only — no speech-to-text involved).
 *
 * What good output looks like:
 *   FULL      → every step covered
 *   PARTIAL   → exactly the omitted step MISSED (not "unsure" — a plain absence is
 *               a confident judgement), zero-mark steps never missed
 *   ODD_WORDS → still covered; this is the false-negative probe that protects the
 *               student who knows the physics but phrases it their own way
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { gradeRecall } from '../lib/answerBook/recallGrader';
import { answerBookQuestionSchema } from '../schemas/answerBook';

// Default target. The old default named a physics question that no longer exists in
// this mathematics-only book; the CASES below are still written against it, so pass
// an id explicitly when probing anything else.
const questionId = process.argv[2] ?? 'ts_ipe_m1a_fn_gof_bijective';

/** Written the way students actually speak: no punctuation, code-mixed, STT-mangled. */
const CASES: Array<{ name: string; expect: string; transcript: string }> = [
    {
        name: 'FULL — code-mixed, speech-to-text manglings throughout',
        expect: 'every step covered',
        transcript:
            'ok first i write the statement two vectors acting at a point are the adjacent sides of a parallel program and the diagonal is the resultant then diagram geestha parallelogram O A C B then construction raastha O A is P and O B is Q angle is theta then in triangle C A D A D is Q cos theater and C D is Q sin theater then pythagorus so R is under root P square plus Q square plus two P Q cos theater then tan alpha is Q sin theta by P plus Q cos theta so alpha is tan universe of that and last lo special cases theta zero R is P plus Q',
    },
    {
        name: 'PARTIAL — the construction is skipped',
        expect: 'construction MISSED, everything else covered',
        transcript:
            'first the statement two vectors adjacent sides of a parallelogram the diagonal is the resultant then i draw the figure then A D is Q cos theta and C D is Q sin theta then pythagoras R equals root of P square plus Q square plus two P Q cos theta and tan alpha equals Q sin theta by P plus Q cos theta so alpha is tan inverse of that',
    },
    {
        name: 'THIN — statement only, student says they stopped there',
        expect: 'statement covered, the rest confidently MISSED, zero-mark step never missed',
        transcript:
            'ok so for this question first i write the statement two vectors acting at a point are represented by the two adjacent sides of a parallelogram and their resultant is the diagonal drawn from the same point that is all i remember about this one honestly',
    },
    {
        name: 'ODD_WORDS — knows the physics, phrases it their own way',
        expect: 'still covered — the false-negative probe',
        transcript:
            'so first i state the law properly two vectors adjacent sides diagonal is the resultant then i draw the picture then i name all the points then i drop the perpendicular and get the two sides then the slanted line across the middle is the answer i square everything and add it up and take the root then the angle comes from tan and i box it and then the special cases',
    },
];

async function main() {
    const q = answerBookQuestionSchema.parse(
        JSON.parse(readFileSync(join(process.cwd(), 'answer-book', 'questions', `${questionId}.json`), 'utf8')),
    );
    if (!q.answer.steps.every((s) => s.recall)) {
        console.error(`${questionId} has no recall rubric authored.`);
        process.exit(1);
    }
    console.log(`probing ${questionId} — ${q.qtype} ${q.marks_total}M, ${q.answer.steps.length} steps\n`);

    let usd = 0;
    for (const c of CASES) {
        const r = await gradeRecall(q, c.transcript);
        const g = (b: string) => r.steps.filter((s) => s.bucket === b).map((s) => s.step_id).join(', ') || '—';
        usd += (r.promptChars / 1000) * 0.0001 + (r.outputChars / 1000) * 0.0006;
        console.log(c.name);
        console.log(`  expect  : ${c.expect}`);
        console.log(`  outcome : ${r.outcome}   score ${r.marks_earned}/${r.marks_total}${r.thin_transcript ? '  (thin)' : ''}`);
        console.log(`  covered : ${g('covered')}`);
        console.log(`  missed  : ${g('missed')}`);
        console.log(`  unsure  : ${g('unsure')}`);
        const demoted = r.steps.filter((s) => s.demoted_by).map((s) => `${s.step_id}:${s.demoted_by}`);
        if (demoted.length) console.log(`  demoted : ${demoted.join(', ')}`);
        if (r.order_note) console.log(`  order   : ${r.order_note}`);
        console.log('');
    }
    console.log(`LLM cost for this probe: $${usd.toFixed(4)} (speech-to-text not involved)`);
}
main();
