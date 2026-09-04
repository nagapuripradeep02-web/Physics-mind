/**
 * check_cards.ts — validate answer-book cards WITHOUT the catalog cross-check.
 *
 *   npx tsx src/scripts/check_cards.ts --prefix ts_ipe_c2
 *   npx tsx src/scripts/check_cards.ts answer-book/questions/ts_ipe_c2_ss_foo.json ...
 *   npm run check:cards -- --prefix ts_ipe_c2
 *
 * Why this exists. `build_answer_book.ts` is the real gate, but it hard-fails on
 * "authored question X is not listed in any unit" — and a unit's cards are not in
 * units.json until the orchestrator merges the fragments at the END of a subject.
 * So during authoring the full build cannot pass by construction, and a parallel
 * run of unit agents has no way to check its own work. Worse, one agent's build
 * would abort on another agent's half-written file.
 *
 * This runs exactly the per-card gates — the zod schema (which carries the marks
 * arithmetic as a superRefine) and the §1c completeness + Rule 41 pass — over a
 * NAMED set of files, and says nothing about the manifest. It is a pre-flight, not
 * a replacement: `npm run build:answers` still has to pass before anything ships.
 *
 * Exit 1 on any problem. Problems are COLLECTED and reported together, because an
 * authoring pass over a whole unit cannot be run one abort at a time.
 */
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';
import katex from 'katex';
import { answerBookQuestionSchema, type AnswerBookQuestion } from '../schemas/answerBook';
import { idiomsIn, markNumberError } from '../lib/answerBook/vidiChecks';

const ROOT = process.cwd();
const QDIR = join(ROOT, 'answer-book', 'questions');

const args = process.argv.slice(2);
const pIdx = args.indexOf('--prefix');
const PREFIX = pIdx >= 0 && args[pIdx + 1] ? args[pIdx + 1] : '';
const explicit = args.filter((a) => a.endsWith('.json'));

let files: string[];
if (explicit.length) {
    files = explicit.map((f) => (existsSync(f) ? f : join(QDIR, basename(f))));
} else if (PREFIX) {
    files = readdirSync(QDIR)
        .filter((f) => f.startsWith(PREFIX) && f.endsWith('.json'))
        .sort()
        .map((f) => join(QDIR, f));
} else {
    console.error('usage: check_cards.ts (--prefix <id_prefix> | <file.json> ...)');
    process.exit(2);
}

if (files.length === 0) {
    console.error(`no cards matched${PREFIX ? ` prefix "${PREFIX}"` : ''} — nothing to check`);
    process.exit(2);
}

const bad: string[] = [];
const parsed: AnswerBookQuestion[] = [];
let katexLines = 0;

for (const path of files) {
    const name = basename(path);
    let raw: unknown;
    try {
        raw = JSON.parse(readFileSync(path, 'utf8'));
    } catch (e) {
        bad.push(`${name}: invalid JSON — ${(e as Error).message}`);
        continue;
    }
    const res = answerBookQuestionSchema.safeParse(raw);
    if (!res.success) {
        for (const i of res.error.issues) {
            bad.push(`${name} / ${i.path.join('.') || '(root)'}: ${i.message}`);
        }
        continue;
    }
    const q = res.data;
    if (q.question_id !== name.replace(/\.json$/, '')) {
        bad.push(`${name}: question_id "${q.question_id}" must match the filename`);
    }
    parsed.push(q);
}

// ── the build's §1c: completeness + Rule 41, per card ────────────────────────
for (const q of parsed) {
    const where = q.question_id;
    const strings: [string, string][] = [];
    if (q.insider_note) strings.push(['insider_note', q.insider_note]);

    let tips = 0, notes = 0;
    let marksSoFar = 0;
    for (const s of q.answer.steps) {
        const at = `${where} / ${s.id}`;
        const markNumErr = markNumberError(s.margin_note, s.marks, marksSoFar);
        if (markNumErr) bad.push(`${at}: ${markNumErr}`);
        marksSoFar += s.marks || 0;
        if (!s.why) bad.push(`${at}: no \`why\` — it is the model's WHY line`);
        if (!s.common_mistakes?.length) bad.push(`${at}: no \`common_mistakes\``);
        if (s.marks > 0 && !s.mark_note) bad.push(`${at}: no \`mark_note\` on a ${s.marks}M step`);
        if (s.memory_tip) tips++;
        if (s.margin_note) notes++;

        if (s.why) strings.push([`${s.id}.why`, s.why]);
        if (s.memory_tip) strings.push([`${s.id}.memory_tip`, s.memory_tip]);
        if (s.margin_note) strings.push([`${s.id}.margin_note`, s.margin_note]);
        for (const [i, m] of (s.common_mistakes ?? []).entries()) {
            strings.push([`${s.id}.common_mistakes[${i}]`, m]);
        }

        // katex is typeset at BUILD time and a bad macro must fail loudly here too,
        // named, rather than reaching a student's page as a red error string.
        for (const [i, line] of (s.lines ?? []).entries()) {
            if (typeof line === 'string' || line.render !== 'katex') continue;
            katexLines++;
            try {
                katex.renderToString(line.text, { throwOnError: true, displayMode: false, output: 'html', strict: 'ignore' });
            } catch (e) {
                bad.push(`${where} / ${s.id} line ${i}: KaTeX could not typeset "${line.text}" — ${(e as Error).message}`);
            }
        }
    }

    const n = q.answer.steps.length;
    if (tips > 0 && tips < n) bad.push(`${where}: \`memory_tip\` on ${tips}/${n} steps — author all or none`);
    if (notes > 0 && notes < n) bad.push(`${where}: \`margin_note\` on ${notes}/${n} steps — author all or none`);

    for (const [field, text] of strings) {
        const hit = idiomsIn(text);
        if (hit.length) bad.push(`${where} / ${field}: Rule 41 — "${hit.join('", "')}"`);
    }
}

console.log(`checked ${files.length} card(s)${PREFIX ? ` under "${PREFIX}"` : ''} · katex lines: ${katexLines}`);
if (bad.length) {
    console.log(`\n${bad.length} problem(s):`);
    for (const b of bad) console.log('  - ' + b);
    console.log('\ncheck:cards FAILED. (This is the per-card pre-flight; build:answers is still the gate.)');
    process.exit(1);
}
console.log('all per-card gates pass.');
