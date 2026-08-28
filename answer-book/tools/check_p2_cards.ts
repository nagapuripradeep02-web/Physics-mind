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
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { answerBookQuestionSchema } from '../../src/schemas/answerBook';

const QDIR = join(process.cwd(), 'answer-book', 'questions');
const PREFIX = process.argv[2] ?? 'ts_ipe_p2_';

/**
 * Rule 41: literary register that has no place in a reader-facing string.
 *
 * The scan looks for a PHYSICAL subject doing a human thing. An examiner who
 * "wants the substitution line" is a person wanting something — literal, and
 * exactly the plain wording Rule 41 asks for — so these verbs are reported only
 * when the nearby subject is a thing. Banning the verb outright produced 12
 * false hits on the first run and would have pushed authoring back towards
 * vaguer prose, which is the opposite of the rule's purpose. The one true hit it
 * found was a wave crest that "knows nothing of the motion".
 */
const HUMAN_SUBJECTS = /\b(examiner|examiners|teacher|student|marker|mark|marks|scheme|question|paper|board|code|phrasing)\b/i;
const IDIOMS = [
    'wants to', 'want to', 'wants', 'tries to', 'try to', 'happily', 'lazily',
    'fights', 'fight back', 'refuses', 'refuse to', 'prefers', 'prefer to',
    'knows', 'decides', 'chooses', 'seeks', 'hunts', 'escapes angrily',
    'like a blanket', 'traps heat', 'one-way street', 'gives up', 'gives back',
    'holds on to', 'lets go', 'runs away', 'dies out', 'stops dead', 'grip',
    'fate', 'all yours', 'budges', 'rides on', 'lurches', 'is shy of',
];

type Row = { file: string; msg: string };
const errors: Row[] = [];
const warns: Row[] = [];

const files = readdirSync(QDIR).filter((f) => f.startsWith(PREFIX) && f.endsWith('.json')).sort();
const byChapter = new Map<string, { n: number; V: number; S: number; L: number; figs: number }>();
const ids = new Set<string>();
let steps = 0;

for (const f of files) {
    let raw: unknown;
    try {
        raw = JSON.parse(readFileSync(join(QDIR, f), 'utf8'));
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

    // Rule 41 register scan over every reader-facing string
    const strings: string[] = [];
    const walk = (v: any) => {
        if (typeof v === 'string') strings.push(v);
        else if (Array.isArray(v)) v.forEach(walk);
        else if (v && typeof v === 'object') {
            for (const [k, x] of Object.entries(v)) {
                if (k === 'why' || k === 'verification' || k === 'note') continue; // explanation, not the answer
                walk(x);
            }
        }
    };
    walk({ question_text: q.question_text, steps: q.answer.steps, insider_note: q.insider_note });
    for (const str of strings) {
        for (const idiom of IDIOMS) {
            const re = new RegExp(`\\b${idiom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            const m = re.exec(str);
            if (!m) continue;
            // Look back a few words: a HUMAN subject makes the verb literal.
            if (HUMAN_SUBJECTS.test(str.slice(Math.max(0, m.index - 40), m.index))) continue;
            warns.push({ file: f, msg: `Rule 41: "${idiom}" in “${str.slice(0, 60)}…”` });
        }
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
