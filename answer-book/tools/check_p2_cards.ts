/**
 * check_p2_cards.ts — an INDEPENDENT audit of the Physics-II cards.
 *
 *   npx tsx answer-book/tools/check_p2_cards.ts [prefix]
 *
 * The build already enforces the schema and the mark sums, but it only runs
 * once every chapter is merged into units.json. This runs against the files
 * alone, so a chapter can be audited the moment its agent finishes — and it
 * re-derives every claim rather than trusting a report.
 *
 * It exists as a FILE, not an `npx tsx -e` one-liner: a multi-line -e string
 * dies silently in this shell's transport (a recorded scar), and a check that
 * silently prints nothing is worse than no check at all.
 */
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { answerBookQuestionSchema } from '../../src/schemas/answerBook';
// The HOUSE Rule-41 list, imported not copied — the same one build_answer_book.ts
// uses and the same one the shakedown grades Vidi's replies with. This tool kept
// a private word list at first, which is how it ended up with a DIFFERENT
// standard from the build: it skipped `why`, and the build caught an idiom there
// that this had passed. Agents working on parked cards cannot run the build, so
// this is their only Rule-41 gate and it must be the same gate.
import { idiomsIn } from '../../src/lib/answerBook/vidiChecks';

// Both the shipped cards and the parked ones. The first version read
// `answer-book/questions/` alone, so running it on a chapter still parked in
// wip/ matched NOTHING and printed "every card passes" over an empty set — a
// green check over zero work, which is the one failure a verification tool
// cannot afford. Two chapter agents hit it on the same afternoon. It now scans
// both directories and REFUSES an empty match.
const DIRS = [
    join(process.cwd(), 'answer-book', 'questions'),
    join(process.cwd(), 'answer-book', 'wip', 'p2', 'cards'),
];
const PREFIX = process.argv[2] ?? 'ts_ipe_p2_';

type Row = { file: string; msg: string };
const errors: Row[] = [];
const warns: Row[] = [];

// [dir, filename] pairs, so an error can name where the card actually lives.
const files: [string, string][] = [];
for (const d of DIRS) {
    if (!existsSync(d)) continue;
    for (const f of readdirSync(d)) {
        if (f.startsWith(PREFIX) && f.endsWith('.json')) files.push([d, f]);
    }
}
files.sort((a, b) => a[1].localeCompare(b[1]));
if (files.length === 0) {
    console.error(`✗ check_p2_cards: no card matches "${PREFIX}" in:`);
    for (const d of DIRS) console.error(`    ${d}`);
    console.error('  Refusing to report a pass over an empty set.');
    process.exit(1);
}
const byChapter = new Map<string, { n: number; V: number; S: number; L: number; figs: number }>();
const ids = new Set<string>();
let steps = 0;

for (const [dir, f] of files) {
    let raw: unknown;
    try {
        raw = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    } catch (e) {
        errors.push({ file: f, msg: `invalid JSON: ${(e as Error).message}` });
        continue;
    }
    const parsed = answerBookQuestionSchema.safeParse(raw);
    if (!parsed.success) {
        for (const i of parsed.error.issues.slice(0, 4)) {
            errors.push({ file: f, msg: `${i.path.join('.') || '(root)'}: ${i.message}` });
        }
        continue;
    }
    const q = parsed.data as any;
    const id = f.replace(/\.json$/, '');

    if (q.question_id !== id) errors.push({ file: f, msg: `question_id "${q.question_id}" ≠ filename` });
    if (ids.has(id)) errors.push({ file: f, msg: 'duplicate id' });
    ids.add(id);

    // header
    if (q.subject !== 'physics_2') errors.push({ file: f, msg: `subject "${q.subject}" ≠ physics_2` });
    if (q.year_cycle !== 'second_year') errors.push({ file: f, msg: `year_cycle "${q.year_cycle}" ≠ second_year` });
    if (q.board !== 'ts_ipe') errors.push({ file: f, msg: `board "${q.board}" ≠ ts_ipe` });
    if (!/II Year|Class 12/.test(q.class_label ?? '')) {
        errors.push({ file: f, msg: `class_label "${q.class_label}" does not name second year` });
    }

    // marks: the paper's own shape, checked here because PAPER_PATTERNS is not
    // on this branch yet and its gate is a silent no-op for an unknown subject.
    const want = q.qtype === 'VSAQ' ? 2 : q.qtype === 'SAQ' ? 4 : 8;
    const section = q.qtype === 'VSAQ' ? 'Section A' : q.qtype === 'SAQ' ? 'Section B' : 'Section C';
    if (q.marks_total !== want) errors.push({ file: f, msg: `${q.qtype} is ${want}M on this paper, card says ${q.marks_total}` });
    if (q.paper_section !== section) errors.push({ file: f, msg: `${q.qtype} sits in ${section}, card says "${q.paper_section}"` });

    const stepSum = q.answer.steps.reduce((a: number, s: any) => a + (s.marks ?? 0), 0);
    const splitSum = (q.mark_split ?? []).reduce((a: number, s: any) => a + (s.marks ?? 0), 0);
    if (stepSum !== q.marks_total) errors.push({ file: f, msg: `steps sum ${stepSum} ≠ marks_total ${q.marks_total}` });
    if (splitSum !== q.marks_total) errors.push({ file: f, msg: `mark_split sum ${splitSum} ≠ marks_total ${q.marks_total}` });

    // the two things every card on this paper must say
    if (!q.verification?.needs_teacher_verification) errors.push({ file: f, msg: 'needs_teacher_verification is not true' });
    const note = String(q.verification?.note ?? '');
    if (!/back-?test/i.test(note) || !/union check|two-book/i.test(note)) {
        warns.push({ file: f, msg: 'verification.note does not record BOTH impossible source checks' });
    }

    // a step with zero marks may not carry a mark_note (schema forbids it, but
    // the schema has been wrong about this before — check it directly)
    const stepIds = new Set<string>();
    for (const s of q.answer.steps) {
        steps++;
        if (stepIds.has(s.id)) errors.push({ file: f, msg: `duplicate step id "${s.id}"` });
        stepIds.add(s.id);
        if ((s.marks ?? 0) === 0 && s.mark_note) errors.push({ file: f, msg: `step "${s.id}" has 0 marks and a mark_note` });
    }

    // Rule 41, over exactly the fields build_answer_book.ts scans — including
    // `why`, which an earlier version of this tool skipped.
    const r41: [string, string][] = [];
    if (q.insider_note) r41.push(['insider_note', q.insider_note]);
    for (const s of q.answer.steps) {
        if (s.why) r41.push([`${s.id}.why`, s.why]);
        if (s.memory_tip) r41.push([`${s.id}.memory_tip`, s.memory_tip]);
        if (s.margin_note) r41.push([`${s.id}.margin_note`, s.margin_note]);
        for (const [i, m] of (s.common_mistakes ?? []).entries()) {
            r41.push([`${s.id}.common_mistakes[${i}]`, m]);
        }
        for (const [i, l] of (s.lines ?? []).entries()) {
            const text = typeof l === 'string' ? l : l?.text;
            if (text) r41.push([`${s.id}.lines[${i}]`, text]);
        }
    }
    r41.push(['question_text', q.question_text]);
    for (const [field, text] of r41) {
        const hit = idiomsIn(text);
        if (hit.length) errors.push({ file: f, msg: `${field}: Rule 41 — "${hit.join('", "')}"` });
    }

    const abbr = id.split('_')[3];
    const c = byChapter.get(abbr) ?? { n: 0, V: 0, S: 0, L: 0, figs: 0 };
    c.n++;
    if (q.qtype === 'VSAQ') c.V++; else if (q.qtype === 'SAQ') c.S++; else c.L++;
    c.figs += q.answer.steps.filter((s: any) => s.kind === 'diagram').length;
    byChapter.set(abbr, c);
}

console.log(`${files.length} card(s), ${steps} step(s) under "${PREFIX}"\n`);
for (const [abbr, c] of [...byChapter].sort()) {
    console.log(`  ${abbr.padEnd(4)} ${String(c.n).padStart(3)} cards  ·  VSAQ ${String(c.V).padStart(2)} · SAQ ${String(c.S).padStart(2)} · LAQ ${String(c.L).padStart(2)}  ·  ${c.figs} figure(s)`);
}
if (warns.length) {
    console.log(`\n${warns.length} warning(s):`);
    for (const w of warns.slice(0, 30)) console.log(`  ~ ${w.file}: ${w.msg}`);
    if (warns.length > 30) console.log(`  … ${warns.length - 30} more`);
}
if (errors.length) {
    console.log(`\n${errors.length} ERROR(s):`);
    for (const e of errors.slice(0, 40)) console.log(`  - ${e.file}: ${e.msg}`);
    if (errors.length > 40) console.log(`  … ${errors.length - 40} more`);
    process.exit(1);
}
console.log('\n✓ every card passes the schema, the paper shape, the mark sums and the header.');
