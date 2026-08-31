/**
 * check_originality.ts — enforce the boundary we keep around a third-party question bank.
 *
 *   npx tsx src/scripts/check_originality.ts
 *   npm run check:originality
 *
 * Why this exists. `docs/ORIGINALITY_MATHS.md` states, in prose, how we may use the
 * Sri Chaitanya maths Fastrack: take the question, never the solution; never republish
 * the book's priority stars; record the boundary on every card that used it. Prose is
 * not a gate. This is.
 *
 * A note on what this deliberately does NOT do. The obvious design is a text-similarity
 * check between our answers and the source book. That would measure nothing: we never
 * store the book's solutions anywhere, so there is no corpus to diff against, and a
 * similarity score against a solution-free index would come back clean no matter how
 * badly the rule had been broken. Guarding the boundary itself is the check that can
 * actually fail.
 *
 * Exit 1 on any problem; problems are collected and reported together.
 */
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const QDIR = join(ROOT, 'answer-book', 'questions');
const SRCDIR = join(ROOT, 'answer-book', 'sources');
const MANIFEST = join(ROOT, 'answer-book', 'units.json');
const BUILD = join(ROOT, 'src', 'scripts', 'build_answer_book.ts');

const bad: string[] = [];
const note = (s: string) => console.log('  ' + s);

/* The book we are bounded against, and the sentence a card must carry when it used it. */
const SOURCE_NAME = 'Sri Chaitanya';
const BOUNDARY = 'Only the question was taken';
const DOSSIER = 'ORIGINALITY_MATHS.md';

/* Text that would mean a solution had been copied into the research index. */
const SOLUTION_MARKERS = [/\bSol\s*:/i, /\bSolution\s*:/i, /\bhence\s+proved\b/i, /\bR\.H\.S\b/i, /\bL\.H\.S\b/i];

/* SCOPE. The founder scoped this gate to MATHEMATICS (2026-08-30). Physics, chemistry and
 * botany were authored from a different Sri Chaitanya title - the Junior Phy & Chem Fastrack -
 * long before, and they DO republish that book's priority stars. That is a real and larger
 * exposure than anything in maths, and it is deliberately out of scope here rather than fixed.
 * It is COUNTED and printed on every run so the number stays visible instead of quietly
 * passing. Widen MATHS_SUBJECTS when the founder decides to bring those subjects in. */
const MATHS_SUBJECTS = new Set(['mathematics', 'mathematics_1b', 'mathematics_2a', 'mathematics_2b']);

console.log('1. research index holds questions only');
let indexed = 0;
const citedPages = new Map<string, string>();
if (!existsSync(SRCDIR)) {
    note('no answer-book/sources/ — nothing indexed yet');
} else {
    for (const f of readdirSync(SRCDIR).filter((x) => x.endsWith('.json')).sort()) {
        const path = join(SRCDIR, f);
        let j: any;
        try { j = JSON.parse(readFileSync(path, 'utf8')); }
        catch (e) { bad.push(`sources/${f}: invalid JSON — ${(e as Error).message}`); continue; }
        if (j.internal_only !== true) bad.push(`sources/${f}: missing "internal_only": true`);
        /* Two shapes live here: a chapter index (questions[] at the top level) and a model-paper
         * corpus (papers[], each with its own questions[]). Both are research indexes and both
         * must obey the questions-only rule, so flatten rather than exempt one. */
        const qs = Array.isArray(j.questions) ? j.questions
            : Array.isArray(j.papers) ? j.papers.flatMap((p: any) => p.questions ?? [])
            : null;
        if (!qs) { bad.push(`sources/${f}: neither questions[] nor papers[].questions[]`); continue; }
        for (const q of qs) {
            indexed++;
            /* Markers are scanned on the STEM only. The stem is content taken from the book, so a
             * `Sol:` there means working leaked in. `notes` is OUR commentary about the scan, and it
             * legitimately mentions the marker to record that a solution block was NOT copied - the
             * first run flagged exactly that sentence. Length guards notes instead: our own note is a
             * line or two, a pasted solution is not. */
            for (const re of SOLUTION_MARKERS) {
                if (re.test(q.stem ?? '')) bad.push(`sources/${f} ${q.ref ?? ('Q' + q.n)}: stem looks like solution text (${re}) — the index takes questions only`);
            }
            /* A stem far longer than any exam question is the shape of a solution that leaked in. */
            if ((q.stem ?? '').length > 600) bad.push(`sources/${f} ${q.ref ?? ('Q' + q.n)}: stem is ${q.stem.length} chars — too long for a question stem`);
            if ((q.notes ?? '').length > 400) bad.push(`sources/${f} ${q.ref ?? ('Q' + q.n)}: notes is ${q.notes.length} chars — too long for a scan note`);
        }
        note(`sources/${f}: ${qs.length} questions`);
    }
}

console.log('2. the research index never reaches the shipped bundle');
const build = readFileSync(BUILD, 'utf8');
if (/answer-book['"\s,)\]]*[/\]*\s*['"]?sources/.test(build) || /'sources'/.test(build)) {
    bad.push('build_answer_book.ts appears to read answer-book/sources/ — the index must never ship');
}
for (const dist of ['dist', 'dist-gated', 'dist-mpc', 'dist-mpc_2']) {
    const p = join(ROOT, 'answer-book', dist, 'index.html');
    if (!existsSync(p)) continue;
    const html = readFileSync(p, 'utf8');
    if (html.includes('"internal_only"') || html.includes('chaitanya_m1')) {
        bad.push(`answer-book/${dist}/index.html contains research-index content`);
    } else note(`answer-book/${dist}/index.html: clean`);
}

console.log('3. every maths card that used the book records the boundary');
const cards = readdirSync(QDIR).filter((f) => f.endsWith('.json'));
const citedIds = new Set<string>();
const outOfScope = new Map<string, number>();
for (const f of cards) {
    const q = JSON.parse(readFileSync(join(QDIR, f), 'utf8'));
    const n: string = q?.verification?.note ?? '';
    if (!n.includes(SOURCE_NAME)) continue;
    if (!MATHS_SUBJECTS.has(q.subject)) {
        outOfScope.set(q.subject, (outOfScope.get(q.subject) ?? 0) + 1);
        continue;
    }
    citedIds.add(q.question_id);
        /* Case-insensitive on purpose. The requirement is that the card RECORDS the boundary,
         * not that it shouts or bolds it: 46 cards wrote ONLY THE QUESTION WAS TAKEN in capitals
         * to match the exemplar's register, and a case-sensitive match called all 46 a violation
         * when every one was correct. A gate that fails on typography teaches authors to fight
         * the gate instead of the rule. */
        const hay = n.toLowerCase();
        if (!hay.includes(BOUNDARY.toLowerCase())) bad.push(`${f}: cites ${SOURCE_NAME} but does not record "${BOUNDARY}"`);
        if (!hay.includes(DOSSIER.toLowerCase())) bad.push(`${f}: cites ${SOURCE_NAME} but does not point at ${DOSSIER}`);
}
note(`${citedIds.size} maths card(s) cite ${SOURCE_NAME}; ${indexed} question(s) indexed`);

console.log(`4. the book's priority stars are not republished (maths)`);
const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
for (const u of manifest.units) {
    for (const e of u.questions ?? []) {
        if (!e.question_id || !citedIds.has(e.question_id)) continue;
        if (e.stars) {
            bad.push(`units.json ${u.subject ?? 'physics'}-${u.number} ${e.ref}: stars=${e.stars} on a card sourced from ${SOURCE_NAME} — its ranking is not ours to publish (R1)`);
        }
    }
}

console.log('5. a chapter new to the syllabus claims no exam history');
const NEVER_ASKED = new Set(['Sets and Relations', 'Sequences and Series']);
for (const f of cards) {
    const q = JSON.parse(readFileSync(join(QDIR, f), 'utf8'));
    if (!NEVER_ASKED.has(q.chapter)) continue;
    if ((q.appearances ?? []).length) {
        bad.push(`${f}: chapter "${q.chapter}" is new to the 2026-27 syllabus — appearances[] must be empty`);
    }
    if (q.insider_note) bad.push(`${f}: insider_note on a chapter no board has examined`);
}

/* Out of scope, but never silent — see the SCOPE note above. */
if (outOfScope.size) {
    const total = [...outOfScope.values()].reduce((a, b) => a + b, 0);
    const per = [...outOfScope.entries()].map(([s2, n2]) => `${s2} ${n2}`).join(' · ');
    console.log(`
OUT OF SCOPE (not a failure): ${total} non-maths card(s) cite ${SOURCE_NAME} — ${per}.`);
    console.log(`  Those subjects were authored FROM a Sri Chaitanya title and republish its priority`);
    console.log(`  stars in units.json. R1 is not enforced there yet; see docs/ORIGINALITY_MATHS.md §6.`);
}

if (bad.length) {
    console.log(`\n${bad.length} problem(s):`);
    for (const b of bad) console.log('  - ' + b);
    console.log('\ncheck:originality FAILED. The rules are in docs/ORIGINALITY_MATHS.md.');
    process.exit(1);
}
console.log('\ncheck:originality passes.');
