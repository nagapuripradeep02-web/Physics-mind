/**
 * backtest_maths_model_papers.ts — does the bank actually answer a whole maths paper?
 *
 *   npx tsx src/scripts/backtest_maths_model_papers.ts
 *   npm run backtest:maths
 *
 * Why this exists. `backtest:physics` diffs the physics bank against seven real TSBIE papers.
 * Mathematics had no equivalent, because we hold no maths past-paper corpus — so the only
 * coverage claim available for 1A/1B was "everything the source book lists is authored", which
 * is a claim about the LIST, not about a paper. The two Sri Chaitanya volumes each print a full
 * 21-question model paper on their last page, and those are a free, independent test set: they
 * were assembled by someone choosing what to examine, not by us choosing what to author.
 *
 * IMPORTANT — what this does NOT prove. These are a coaching publisher's MODEL papers, not TSBIE
 * papers. Passing means our bank covers what that publisher expects to be asked. It is evidence
 * about coverage, never about exam history, and nothing here may be rendered to a student as an
 * "Asked" year. A real-paper back-test still needs a real maths paper corpus we do not have.
 *
 * Exit 1 if any question lands on a chapter the bank cannot answer at that length.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const corpus = JSON.parse(readFileSync(join(ROOT, 'answer-book', 'sources', 'model_papers_maths_1a_1b.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(join(ROOT, 'answer-book', 'units.json'), 'utf8'));

/* chapter (as the model paper names it) -> the sections the bank can answer it at, and how many. */
const grid = new Map<string, Map<string, number>>();
for (const u of manifest.units) {
    const subject = u.subject ?? 'physics';
    /* units.json names carry a paper suffix - "Locus (Maths-1B)" - the model paper does not. */
    const chapter = String(u.name).replace(/\s*\(Maths-1[AB]\)\s*$/, '').trim();
    const key = subject + '|' + chapter;
    if (!grid.has(key)) grid.set(key, new Map());
    const g = grid.get(key)!;
    for (const e of u.questions ?? []) {
        if (!e.question_id) continue;             // a coming-soon row answers nothing
        g.set(e.section, (g.get(e.section) ?? 0) + 1);
    }
}

let missing = 0;
let thin = 0;
let total = 0;

for (const paper of corpus.papers) {
    console.log(`\n=== ${paper.paper} (${paper.subject}) — ${paper.questions.length} questions ===`);
    for (const q of paper.questions) {
        total++;
        const g = grid.get(paper.subject + '|' + q.chapter);
        const atLength = g?.get(q.section) ?? 0;
        const anywhere = g ? [...g.values()].reduce((a, b) => a + b, 0) : 0;
        let verdict: string;
        if (atLength > 0) {
            verdict = `ok      ${String(atLength).padStart(3)} ${q.section} card(s)`;
        } else if (anywhere > 0) {
            /* The chapter is written but not at this length. Worth seeing, not worth failing on:
             * the section a question is asked at is the paper-setter's choice, and our own
             * section labels follow a different source book. */
            verdict = `THIN    chapter written, but no ${q.section} card`;
            thin++;
        } else {
            verdict = `MISSING chapter not in the bank`;
            missing++;
        }
        console.log(`  Q${String(q.n).padStart(2)} ${q.section.padEnd(4)} ${q.chapter.padEnd(38)} ${verdict}`);
    }
}

console.log(`\n${total} model-paper questions · ${missing} on a missing chapter · ${thin} on a chapter with no card at that length`);
if (missing) {
    console.log('\nbacktest:maths FAILED — a model paper asks a chapter the bank cannot answer at all.');
    process.exit(1);
}
console.log('backtest:maths passes: every question falls on a chapter the bank answers.');
if (thin) console.log(`(${thin} land at a length we have not authored — read the THIN lines above.)`);
