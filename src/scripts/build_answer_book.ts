/**
 * build_answer_book.ts — builds the Answer Book static surface.
 *
 *   npm run build:answers        → answer-book/dist/index.html
 *   npm run serve:answers        → http://localhost:8100
 *
 * What it does — deliberately dumb (sub-second, no minify, no watch):
 *   1. Read every answer-book/questions/*.json, validate against
 *      src/schemas/answerBook.ts (zod). Any violation = exit 1 with the path
 *      and the issue. The one product gate — sum(steps[].marks) ===
 *      marks_total — lives in the schema as a superRefine.
 *   2. Read answer-book/shell.html + notebook.css + notebook.js (real files,
 *      never TS template literals — the check:renderer-backticks scar).
 *   3. Replace 4 tokens and write ONE self-contained HTML. Inlined because
 *      Chrome blocks fetch()/modules from file:// (same scar as
 *      build_review_site.ts vendoring, which this script deliberately does
 *      NOT touch — Rule 40).
 *
 * Rule 18: the output is preloaded JSON + deterministic JS. No LLM, no API
 * call, no network at runtime (Google Fonts CSS is the single exception,
 * with a cursive fallback).
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import katex from 'katex';
import { answerBookQuestionSchema, PAPER_PATTERNS, type AnswerBookQuestion } from '../schemas/answerBook';
// The Rule 41 word list, IMPORTED not copied — it is the same list the shakedown
// grades Vidi's replies with, so the bank and the model are held to one standard.
import { idiomsIn } from '../lib/answerBook/vidiChecks';

const ROOT = process.cwd();
const BOOK_DIR = join(ROOT, 'answer-book');
const QUESTIONS_DIR = join(BOOK_DIR, 'questions');
// --gated (P3): the page ships the full CATALOG but answer bodies are a
// server-side entitlement (answerbook-content). Its dist is SEPARATE so the
// offline build, the hosted full build and every existing gate are untouched
// by construction. Gated also writes the per-unit content bundles that
// content:push uploads.
const GATED = process.argv.includes('--gated');

function fail(msg: string): never {
    console.error(`\n✗ build:answers failed\n${msg}`);
    process.exit(1);
}

// --stream=<name> (2026-08-26): ONE bank, one build, a subject LENS over it —
// never a second catalog and never duplicated question files (the same doctrine
// the board picker follows). A stream is the set of PAPERS a student actually
// sits, so an MPC student is never shown Botany, and a BiPC student is never
// handed a book that silently omits Zoology.
//
// The lens is applied SYMMETRICALLY — to the questions AND to the manifest —
// because §1b's cross-checks run in both directions: shrink only the manifest
// and "authored question X is not listed in any unit" fires once per dropped
// file; shrink only the files and "question_id X has no authored file" fires.
// Filtering both with one predicate leaves every downstream guard satisfied.
// `label`/`blurb` are the STUDENT-FACING words for the stream and are the single
// source for both the link-preview card and the on-page header, so the two can
// never disagree about what the reader is holding.
const STREAMS: Record<string, { subjects: string[]; label: string; blurb: string; short: string; year: string }> = {
    // Maths-1A is `mathematics` for historical reasons (see SUBJECTS below).
    mpc: {
        subjects: ['physics', 'chemistry', 'mathematics', 'mathematics_1b'],
        label: 'Junior Inter MPC',
        blurb: 'Maths, Physics and Chemistry',
        // `short` joins the catalog eyebrow, which already carries the board and
        // the year — so it must NOT repeat either ("Telangana IPE · First year · MPC").
        short: 'MPC',
        year: 'First year',
    },
    // Senior Inter (2026-08-28). The FIRST second-year stream, and the reason
    // `year` above stopped being three hardcoded "First year" strings: the
    // eyebrow, the shell's static fallback and the og description each printed
    // it, so a second-year student would have read "First year" on all three.
    // Subjects grow as the other Paper-IIs are authored (mathematics_2a is the
    // one still missing) — the stream is the seam for that. chemistry_2 joined
    // 2026-08-29, mathematics_2b the same day, and the blurb moved with each in
    // the same commit: a stream that serves a paper its blurb does not name
    // advertises a book it does contain, which is the same defect as the
    // reverse and just as invisible.
    mpc_2: {
        subjects: ['physics_2', 'chemistry_2', 'mathematics_2b'],
        label: 'Senior Inter MPC',
        blurb: 'Maths 2B, Physics and Chemistry',
        short: 'MPC',
        year: 'Second year',
    },
};
// The DOOR (founder, 2026-08-27): the group-and-year chooser a student meets
// before the catalog. It exists because answers.viditra.co dropped straight into
// an MPC first-year book with nothing on screen telling a BiPC, MEC or
// second-year student that theirs is coming — so that student bounced without
// ever learning we are building it.
//
// This table is PRESENTATION ONLY and is deliberately NOT the STREAMS registry
// above. STREAMS says what a build may contain; TRACKS says what a student may
// be told exists. Adding `bipc` to STREAMS would make `--stream=bipc` a legal
// build of a three-subject book (Zoology is authored but unmerged), and `mec`
// has no economics/commerce subject anywhere in the bank — so those tiles must
// never be able to produce an artifact.
//
// A year cell is LIVE only when its `stream` equals the stream being built, so
// the door of any artifact can advertise exactly one live path — its own — and
// a future --stream=bipc build lights BiPC's first year with no edit here.
//
// The notes are checked against what is on disk, not against the marketing
// site: Botany is on master (13 chapters) and Zoology is real but on an
// unmerged branch (8 chapters), so "written, being checked" is true of both.
// MPC second year went live 2026-08-28 with Physics-II (16 chapters), gained
// Chemistry-II (18 units) on 2026-08-29 and Maths-2B (8 units) the same day;
// Maths-2A is not written, which is why `mpc_2.blurb` says "Maths 2B, Physics
// and Chemistry" and not "Maths, Physics and Chemistry" — the blurb is what the
// reader is promised, and it must describe the artifact, not the ambition.
const TRACKS: {
    id: string;
    label: string;
    subjects: string;
    years: { id: string; label: string; stream: string | null; note: string }[];
}[] = [
    {
        id: 'mpc',
        label: 'MPC',
        subjects: 'Maths 1A · Maths 1B · Physics · Chemistry',
        years: [
            { id: 'first_year', label: 'First year', stream: 'mpc', note: '' },
            { id: 'second_year', label: 'Second year', stream: 'mpc_2', note: '' },
        ],
    },
    {
        id: 'bipc',
        label: 'BiPC',
        subjects: 'Botany · Zoology · Physics · Chemistry',
        years: [
            {
                id: 'first_year', label: 'First year', stream: null,
                note: 'Botany and Zoology are written. We are checking them before we hand them to you.',
            },
            { id: 'second_year', label: 'Second year', stream: null, note: 'Not started yet.' },
        ],
    },
    {
        id: 'mec',
        label: 'MEC',
        subjects: 'Maths 1A · Maths 1B · Economics · Commerce',
        years: [
            {
                id: 'first_year', label: 'First year', stream: null,
                note: 'Maths 1A and 1B are written. Economics and Commerce are not started.',
            },
            { id: 'second_year', label: 'Second year', stream: null, note: 'Not started yet.' },
        ],
    },
];

const streamArg = process.argv.find((a) => a.startsWith('--stream='));
const STREAM = streamArg ? streamArg.slice('--stream='.length) : null;
if (STREAM !== null && !STREAMS[STREAM]) {
    // Loud, not lenient: a typo'd stream falling back to the full bank would
    // ship Botany to an MPC student — the exact thing this flag prevents.
    fail(`  --stream="${STREAM}" is not one of ${Object.keys(STREAMS).join('/')}`);
}
const STREAM_SUBJECTS = STREAM ? new Set(STREAMS[STREAM].subjects) : null;

const OUT_DIR = join(
    BOOK_DIR,
    GATED ? (STREAM ? `dist-gated-${STREAM}` : 'dist-gated') : STREAM ? `dist-${STREAM}` : 'dist'
);
// Content bundles are scoped PER STREAM (2026-08-27). --gated and --stream used
// to be refused outright: the bundles all landed in one flat answer-book/content/,
// so a streamed gated build left the dropped subjects' bundles behind and
// content:push either aborted on them or served dead content forever. A stream
// gets its own directory, cleared before every write, so what is on disk is
// exactly what this build produced — nothing inherited from a previous one.
const CONTENT_DIR = STREAM ? join(BOOK_DIR, 'content', STREAM) : join(BOOK_DIR, 'content');

// ── 1. read + validate every question ────────────────────────────────────────
const files = readdirSync(QUESTIONS_DIR).filter((f) => f.endsWith('.json')).sort();
if (files.length === 0) fail(`no question JSONs found in ${QUESTIONS_DIR}`);

const allQuestions: AnswerBookQuestion[] = [];
for (const f of files) {
    const path = join(QUESTIONS_DIR, f);
    let raw: unknown;
    try {
        raw = JSON.parse(readFileSync(path, 'utf8'));
    } catch (e) {
        fail(`${path}\n  invalid JSON: ${(e as Error).message}`);
    }
    const parsed = answerBookQuestionSchema.safeParse(raw);
    if (!parsed.success) {
        const issues = parsed.error.issues
            .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
            .join('\n');
        fail(`${path}\n${issues}`);
    }
    const q = parsed.data;
    if (q.question_id !== f.replace(/\.json$/, '')) {
        fail(`${path}\n  question_id "${q.question_id}" must match the filename`);
    }
    allQuestions.push(q);
}

// The stream lens, half 1 of 2 (half 2 is the manifest, below). Every file is
// parsed and validated above FIRST, so a streamed build still proves the whole
// bank is sound — the lens only decides what ships, never what is checked.
//
// This keys on the question's own `subject` field, which the schema REQUIRES on
// every file. It deliberately does not parse the `ts_ipe_<x>_` id prefix: three
// tools in this repo do parse it, none of them learned `ts_ipe_b1_`, and all
// three silently file Botany as physics. A lens must not inherit that bug.
const questions = STREAM_SUBJECTS
    ? allQuestions.filter((q) => STREAM_SUBJECTS.has(q.subject))
    : allQuestions;
if (STREAM_SUBJECTS && questions.length === 0) {
    fail(`  --stream="${STREAM}" matched no authored questions (wanted ${[...STREAM_SUBJECTS].join('/')})`);
}

// ── 1b. read + cross-check the unit manifest ─────────────────────────────────
// units.json is the catalog's inventory: every question the BOOK lists for a
// unit, whether authored yet or not. Its star ranks and section numbering are
// the book's; entries with a question_id open in the notebook, the rest render
// as coming-soon cards. Drift in EITHER direction is a build failure: an
// authored question the manifest does not list would be invisible in the
// catalog, and a manifest pointer at nothing would be a dead card. Both are
// exactly the silent-drop failure mode PILOT_CONCEPTS once had.
//
// RETIRED entries (2026-08-28, the TGBIE 2026-27 syllabus revision): a question
// whose topic left the syllabus keeps its file and its manifest row — the
// seven-paper corpus (answer-book/papers/matches.json) still resolves to it and
// its exam history is real — but it is NOT the book any more. `status:
// "retired"` + `retired: {wef, reason}` on the entry (or on a whole unit) keeps
// both drift checks satisfied and strips the entry from EVERYTHING a student is
// offered: the catalog, the counts, the chapter picker, the planner, exam-eve,
// Vidi's chapter lists, the door, the og card and the gated content bundles.
// The card itself still ships, so a forwarded #/q/<id> link renders with a
// "removed from the 2026-27 syllabus" banner instead of a dead route
// (window.PM_RETIRED carries the reason). Deleting the file was the only
// alternative, and deleting is exactly what the corpus tags forbid.
type Retired = { wef: string; reason: string };
type ManifestEntry = {
    ref: string;
    section: 'VSAQ' | 'SAQ' | 'LAQ';
    number: number;
    stars: number;
    text: string;
    question_id?: string;
    cut?: string;
    source?: string;
    status?: 'retired';
    retired?: Retired;
};
type ManifestUnit = {
    number: number;
    name: string;
    subject?: string;
    questions: ManifestEntry[];
    status?: 'retired';
    retired?: Retired;
};

const manifestPath = join(BOOK_DIR, 'units.json');
let manifest: { units: ManifestUnit[] };
try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
} catch (e) {
    fail(`${manifestPath}\n  invalid JSON: ${(e as Error).message}`);
}
if (!Array.isArray(manifest.units) || manifest.units.length === 0) {
    fail(`${manifestPath}\n  units[] is missing or empty`);
}

// The stream lens, half 2 of 2 — the same predicate the questions were filtered
// with, so §1b's bidirectional cross-checks below stay satisfied. Absent
// `subject` means physics (the historical meaning), exactly as the unitKey guard
// reads it.
if (STREAM_SUBJECTS) {
    manifest.units = manifest.units.filter((u) => STREAM_SUBJECTS.has(u.subject || 'physics'));
    if (manifest.units.length === 0) {
        fail(`${manifestPath}\n  --stream="${STREAM}" matched no units (wanted ${[...STREAM_SUBJECTS].join('/')})`);
    }
}

const questionById = new Map(questions.map((q) => [q.question_id, q]));
const listedIds = new Set<string>();
// One PAPER = one subject value. Maths-1A and Maths-1B are different papers with
// their own unit 1, so they cannot share a subject: unit numbers namespace per
// SUBJECT, and two papers under one value would collide (see the unitKey guard
// below). `mathematics` is Maths-1A for historical reasons — it predates 1B, the
// same way an absent subject means physics. Physics-II will need the same
// treatment when it opens.
const SUBJECTS = ['physics', 'chemistry', 'mathematics', 'mathematics_1b', 'botany', 'zoology', 'physics_2', 'chemistry_2', 'botany_2', 'mathematics_2b'];
// STREAMS (top of file) names subjects too. If the two lists drift — a stream
// naming a subject that no longer exists, or a renamed subject — the lens would
// silently drop a whole paper from a student's book rather than erroring. Cheap
// to assert, expensive to discover in a WhatsApp group.
for (const [name, def] of Object.entries(STREAMS)) {
    const unknown = def.subjects.filter((s) => !SUBJECTS.includes(s));
    if (unknown.length) {
        fail(`  stream "${name}" names subject(s) ${unknown.join('/')} which are not in SUBJECTS (${SUBJECTS.join('/')})`);
    }
}
const unitKeys = new Set<string>();
for (const u of manifest.units) {
    // Unit identity is subject-number EVERYWHERE (catalog chips, triage, the
    // exam-eve route, and the study planner). Two units sharing one key silently
    // merge into each other: on 2026-08-23 physics Unit 3 and maths Unit 3 keyed
    // alike and Matrices' 17 LAQs were scheduled into physics study plans.
    const key = `${u.subject || 'physics'}-${u.number}`;
    if (unitKeys.has(key)) {
        fail(`${manifestPath}
  two units share the key "${key}" — unit numbers namespace per subject, so a second paper needs its own subject value (e.g. mathematics_1b)`);
    }
    unitKeys.add(key);
    // Absent = physics (the historical meaning). A TYPO must fail the build: it would
    // silently mint a fourth subject chip rather than filing the unit where it belongs.
    if (u.subject !== undefined && !SUBJECTS.includes(u.subject)) {
        fail(`${manifestPath}\n  unit ${u.number}: subject "${u.subject}" is not one of ${SUBJECTS.join('/')}`);
    }
    if (u.status !== undefined && u.status !== 'retired') {
        fail(`${manifestPath}\n  unit ${u.number}: status "${u.status}" — the only status is "retired"`);
    }
    if ((u.status === 'retired') !== (u.retired !== undefined)) {
        fail(`${manifestPath}\n  unit ${u.number}: status "retired" and a retired {wef, reason} block go together`);
    }
    if (u.retired && !(u.retired.wef && u.retired.reason)) {
        fail(`${manifestPath}\n  unit ${u.number}: retired needs both wef and reason`);
    }
    const refs = new Set<string>();
    for (const e of u.questions) {
        if (refs.has(e.ref)) fail(`${manifestPath}\n  unit ${u.number}: duplicate ref "${e.ref}"`);
        refs.add(e.ref);
        if (e.status !== undefined && e.status !== 'retired') {
            fail(`${manifestPath}\n  unit ${u.number} ${e.ref}: status "${e.status}" — the only status is "retired"`);
        }
        if ((e.status === 'retired') !== (e.retired !== undefined)) {
            fail(`${manifestPath}\n  unit ${u.number} ${e.ref}: status "retired" and a retired {wef, reason} block go together`);
        }
        if (e.retired && !(e.retired.wef && e.retired.reason)) {
            fail(`${manifestPath}\n  unit ${u.number} ${e.ref}: retired needs both wef and reason`);
        }
        if (e.status === 'retired' && !e.question_id) {
            fail(`${manifestPath}\n  unit ${u.number} ${e.ref}: a coming-soon entry cannot be retired — delete the row instead`);
        }
        if (!['VSAQ', 'SAQ', 'LAQ'].includes(e.section)) {
            fail(`${manifestPath}\n  unit ${u.number} ${e.ref}: section "${e.section}" is not VSAQ/SAQ/LAQ`);
        }
        if (!(e.stars >= 0 && e.stars <= 3)) {
            fail(`${manifestPath}\n  unit ${u.number} ${e.ref}: stars must be 0-3`);
        }
        if (e.question_id) {
            const q = questionById.get(e.question_id);
            if (!q) fail(`${manifestPath}\n  unit ${u.number} ${e.ref}: question_id "${e.question_id}" has no authored file`);
            // The gated client fetches content by the key it derives from the
            // QUESTION's own fields — so the question and its manifest unit
            // must agree, or an unlock fetches the wrong (or no) bundle.
            const qKey = `${q.subject}-${q.unit.number}`;
            if (qKey !== key) {
                fail(`${manifestPath}\n  unit ${u.number} ${e.ref}: ${e.question_id} derives unit key "${qKey}" but is listed under "${key}" — subject/unit fields disagree with the manifest`);
            }
            listedIds.add(e.question_id);
            if (e.cut && !(q.cuts ?? []).some((c) => c.key === e.cut)) {
                fail(`${manifestPath}\n  unit ${u.number} ${e.ref}: cut "${e.cut}" does not exist on ${e.question_id}`);
            }
        }
    }
}
for (const q of questions) {
    if (!listedIds.has(q.question_id)) {
        fail(`${manifestPath}\n  authored question "${q.question_id}" is not listed in any unit — it would be invisible in the catalog`);
    }
}

// Strip what is retired, NOW that both drift checks have run over the full
// manifest. From here down `manifest.units` is the book a student is offered;
// `retiredById` is what the notebook shows on a forwarded link to a retired
// card. A question retired under one entry but still live under another (a cut
// listed twice) stays live — retirement is per entry, and the banner keys on
// the question having NO live entry left.
const retiredById: Record<string, Retired & { unit: string }> = {};
const liveIds = new Set<string>();
for (const u of manifest.units) {
    for (const e of u.questions) {
        if (!e.question_id) continue;
        const r = u.retired ?? e.retired;
        if (r) retiredById[e.question_id] = { ...r, unit: u.name };
        else liveIds.add(e.question_id);
    }
}
for (const id of liveIds) delete retiredById[id];
const retiredCount = Object.keys(retiredById).length;
manifest.units = manifest.units
    .filter((u) => u.status !== 'retired')
    .map((u) => ({ ...u, questions: u.questions.filter((e) => e.status !== 'retired') }));

// ── 1c. completeness + plain-language (Rule 41) ──────────────────────────────
// Four of these fields ARE the model's grounding text (notebook.js buildVidiContext
// emits WHY / MISTAKES / EARNS THE MARK FOR / REMEMBER / NOTE), so a gap here is
// not cosmetic — a MISSING mark fact is what made Vidi invent a mark scheme in a
// real chat. Everything asserted below is ALREADY true across all 157 files, so
// this locks the floor at zero cost rather than demanding new work.
//
// Violations are COLLECTED and reported once: fail() exits on its first call, and
// an authoring pass over 157 files cannot be run one abort at a time.
{
    const bad: string[] = [];

    // Rule 41: no idioms, metaphors or personification in anything a student reads.
    // idiomsIn() is the house list, imported — NOT copied — from vidiChecks.ts,
    // which until now only ever graded the MODEL's replies and never the bank.
    // Every recorded authoring session found idioms BY HAND (0.3–0.6 per new
    // card); this is the first time the check is mechanical.
    for (const q of questions) {
        const where = q.question_id;
        const strings: [string, string][] = [];
        if (q.insider_note) strings.push(['insider_note', q.insider_note]);

        let tips = 0, notes = 0;
        for (const s of q.answer.steps) {
            const at = `${where} / ${s.id}`;
            // The two fields carrying every explanation Vidi gives.
            if (!s.why) bad.push(`${at}: no \`why\` — it is the model's WHY line`);
            if (!s.common_mistakes?.length) bad.push(`${at}: no \`common_mistakes\``);
            // The step→mark-split mapping. The schema forbids it on a 0-mark step.
            if (s.marks > 0 && !s.mark_note) bad.push(`${at}: no \`mark_note\` on a ${s.marks}M step`);
            if (s.memory_tip) tips++;
            if (s.margin_note) notes++;

            if (s.why) strings.push([`${s.id}.why`, s.why]);
            if (s.memory_tip) strings.push([`${s.id}.memory_tip`, s.memory_tip]);
            if (s.margin_note) strings.push([`${s.id}.margin_note`, s.margin_note]);
            for (const [i, m] of (s.common_mistakes ?? []).entries()) {
                strings.push([`${s.id}.common_mistakes[${i}]`, m]);
            }
        }

        // memory_tip and margin_note are authored in WHOLE-QUESTION passes — all
        // steps or none, true for all 157 files today. Locking that keeps a partial
        // pass from shipping a question where one step's chip works and the next
        // silently does not.
        const n = q.answer.steps.length;
        if (tips > 0 && tips < n) bad.push(`${where}: \`memory_tip\` on ${tips}/${n} steps — author all or none`);
        if (notes > 0 && notes < n) bad.push(`${where}: \`margin_note\` on ${notes}/${n} steps — author all or none`);

        for (const [field, text] of strings) {
            const hit = idiomsIn(text);
            if (hit.length) bad.push(`${where} / ${field}: Rule 41 — "${hit.join('", "')}"`);
        }
    }

    if (bad.length) {
        fail(`completeness / Rule 41 — ${bad.length} problem(s):\n` + bad.map((b) => '  - ' + b).join('\n'));
    }
}

// ── 1d. typeset every katex line AT BUILD TIME ───────────────────────────────
// A `render: "katex"` line carries TeX source, not text. It is typeset here, never
// in the browser: the page ships zero JS libraries and makes zero runtime decisions
// (Rule 18), and a bad macro must fail the BUILD, loudly, naming the step — not
// render as a red error string on a student's answer page.
let katexLineCount = 0;

type LineObj = { text: string; render?: string; html?: string };

function typesetLines(lines: unknown[] | undefined, where: string): unknown[] | undefined {
    if (!lines) return lines;
    return lines.map((raw, i) => {
        if (typeof raw === 'string' || (raw as LineObj).render !== 'katex') return raw;
        const line = raw as LineObj;
        try {
            const html = katex.renderToString(line.text, {
                throwOnError: true,
                displayMode: false,
                output: 'html',   // no MathML twin: it would land in textContent and in the reveal
                strict: 'ignore',
            });
            katexLineCount++;
            return { ...line, html };
        } catch (e) {
            fail(`${where} line ${i}\n  KaTeX could not typeset: ${line.text}\n  ${(e as Error).message}`);
        }
    });
}

// KaTeX's own stylesheet, with every @font-face rewritten to an embedded woff2 data
// URI — the page must stay ONE self-contained file that works from file:// (same
// constraint that forces the CSS/JS inlining below). Emitted only when a katex line
// exists, so a book without one stays byte-for-byte as small as it was.
function katexCss(): string {
    const dist = join(ROOT, 'node_modules', 'katex', 'dist');
    const raw = readFileSync(join(dist, 'katex.min.css'), 'utf8');
    return raw.replace(/@font-face\{([^}]*)\}/g, (block, body: string) => {
        const m = /url\(fonts\/([A-Za-z0-9_-]+\.woff2)\)/.exec(body);
        if (!m) return '';
        const fontPath = join(dist, 'fonts', m[1]);
        if (!existsSync(fontPath)) return '';   // drop, never leave a dead url() behind
        const b64 = readFileSync(fontPath).toString('base64');
        const src = `src:url(data:font/woff2;base64,${b64}) format("woff2")`;
        return `@font-face{${body.replace(/src:[^;]*$/, src).replace(/src:.*/, src)}}`;
    });
}

// ── 2. read the engine files ─────────────────────────────────────────────────
const shell = readFileSync(join(BOOK_DIR, 'shell.html'), 'utf8');
const css = readFileSync(join(BOOK_DIR, 'notebook.css'), 'utf8');
const js = readFileSync(join(BOOK_DIR, 'notebook.js'), 'utf8');

for (const token of ['/*__CSS__*/', '/*__JS__*/', '/*__DATA__*/', '<!--__BUILT_AT__-->', '<!--__HEAD_META__-->']) {
    if (!shell.includes(token)) fail(`shell.html is missing the token ${token}`);
}

// ── 3. inline + write ────────────────────────────────────────────────────────
// The `recall` rubric is GRADER-side data (it contains reject lists and the
// must_convey wording). The API reads the question file itself, so strip it from
// the browser copy — the page only needs to know whether recall is available.
const browserQuestions = questions.map((q) => ({
    ...q,
    recall_available: q.answer.steps.every((s) => Boolean(s.recall)),
    answer: {
        ...q.answer,
        steps: q.answer.steps.map(({ recall, ...step }) => {
            void recall;
            return { ...step, lines: typesetLines(step.lines, `${q.question_id} ${step.id}`) };
        }),
    },
    // A cut may substitute shorter `lines` for a step, so those need typesetting too —
    // missing them would ship a cut whose matrix silently arrived as raw TeX.
    cuts: q.cuts?.map((c) => ({
        ...c,
        steps: Object.fromEntries(
            Object.entries(c.steps).map(([id, cs]) => [
                id,
                { ...cs, lines: typesetLines(cs.lines, `${q.question_id} cut:${c.key} ${id}`) },
            ])
        ),
    })),
}));

// ── gated projection + content bundles (P3) ─────────────────────────────────
// The gated page keeps every METADATA field (catalog, planner, search, Vidi
// chips and exam-eve all work unmodified) and reduces the answer to a
// boot-safe SKELETON: notebook.js reads question.answer.steps at module init
// (applyCut(0)), so steps must EXIST — as {id, marks} only, which is exactly
// what applyCut's filter and the cut maps need and nothing a student would
// pay for. Cut-step override bodies reduce to {marks} the same way. The
// `gated: true` flag is what the client's loadQuestion gate keys on.
type AnyRec = Record<string, unknown>;
const gatedQuestions = !GATED ? browserQuestions : browserQuestions.map((q) => ({
    ...q,
    gated: true,
    answer: {
        page_header: q.answer.page_header,
        steps: q.answer.steps.map((s) => ({ id: (s as AnyRec).id, marks: (s as AnyRec).marks })),
    },
    cuts: q.cuts?.map((c) => ({
        ...c,
        steps: Object.fromEntries(
            Object.entries(c.steps).map(([id, cs]) => [id, { marks: (cs as AnyRec).marks }])
        ),
    })),
}));

if (GATED) {
    // The bundles the answerbook-content endpoint serves: the FULL projection
    // (typeset, recall-stripped — byte-what the full build ships), grouped by
    // unit key. content:push uploads these to ab_content.
    const byId = new Map(browserQuestions.map((q) => [q.question_id, q]));
    mkdirSync(CONTENT_DIR, { recursive: true });
    // Clear first: a bundle left over from an earlier build — a renamed unit, a
    // subject since dropped from this stream — would upload as live content for
    // a chapter this build no longer knows about, and nothing downstream would
    // ever notice. What ships is only what this run wrote.
    for (const stale of readdirSync(CONTENT_DIR)) {
        if (stale.endsWith('.json')) rmSync(join(CONTENT_DIR, stale));
    }
    let bundleBytes = 0;
    for (const u of manifest.units) {
        const key = `${u.subject || 'physics'}-${u.number}`;
        const ids: string[] = [];
        for (const e of u.questions) {
            if (e.question_id && !ids.includes(e.question_id)) ids.push(e.question_id);
        }
        const bundle = {
            unit_key: key,
            name: u.name,
            questions: ids.map((id) => byId.get(id)!),
        };
        const text = JSON.stringify(bundle);
        bundleBytes += text.length;
        writeFileSync(join(CONTENT_DIR, `${key}.json`), text, 'utf8');
    }
    console.log(`  content bundles: ${manifest.units.length} units → ${CONTENT_DIR} (${(bundleBytes / 1024).toFixed(0)} KB) — run npm run content:push`);
}

// The checking API is optional. Unset → the page offers neither photo nor mic and
// makes zero network calls, exactly as it shipped (progressive enhancement, not a
// dependency). One base; the client derives /recall-check and /photo-check.
const apiBase = process.env.ANSWER_BOOK_API_BASE ?? '';

// Vidi's live-chat endpoint — the SAME progressive-enhancement contract as the
// checking API. Unset (the default) → the free-text ask row and the telemetry
// flush never exist and the page stays fully offline (deterministic Vidi — the
// chips, the verdict, the exam-eve view — works everywhere, file:// included).
// `--hosted` bakes the deployed Edge Function base for the served copy.
// Gated is hosted by nature — it cannot work without its endpoint, so it
// bakes every hosted base.
const HOSTED = process.argv.includes('--hosted') || GATED;
const VIDI_HOSTED_BASE = 'https://dxwpkjfypzxrzgbevfnx.supabase.co/functions/v1/answerbook-vidi-chat';
const vidiBase = HOSTED
    ? (process.env.ANSWER_BOOK_VIDI_BASE ?? VIDI_HOSTED_BASE)
    : (process.env.ANSWER_BOOK_VIDI_BASE ?? '');

// Progress sync (P2). Same shape as the chat base and the same guarantee: unset
// means the Sync module is inert — no device id, no timer, no request — so the
// offline build and every zero-network gate are unaffected. The hosted default
// is the answerbook-sync function deployed + live-verified 2026-08-23 (403 on a
// foreign origin, earliest-tick-wins merge, 400 on a malformed device id).
const SYNC_HOSTED_BASE = 'https://dxwpkjfypzxrzgbevfnx.supabase.co/functions/v1/answerbook-sync';
const syncBase = HOSTED
    ? (process.env.ANSWER_BOOK_SYNC_BASE ?? SYNC_HOSTED_BASE)
    : '';

// P3: the content endpoint. Set ONLY in the gated build — the full builds
// carry every answer already, and an empty base keeps the client Gate module
// inert there, the same guarantee Sync makes.
const CONTENT_HOSTED_BASE = 'https://dxwpkjfypzxrzgbevfnx.supabase.co/functions/v1/answerbook-content';
const contentBase = GATED
    ? (process.env.ANSWER_BOOK_CONTENT_BASE ?? CONTENT_HOSTED_BASE)
    : '';

// P4: the payment-link endpoint. Gated builds only — and even there the sheet
// only offers to buy when this is set AND the server quotes a price, so a build
// can never show a pay button that leads nowhere.
const PAY_HOSTED_BASE = 'https://dxwpkjfypzxrzgbevfnx.supabase.co/functions/v1/answerbook-pay';
const payBase = GATED
    ? (process.env.ANSWER_BOOK_PAY_BASE ?? PAY_HOSTED_BASE)
    : '';

// Google sign-in (2026-08-27). The Supabase project ROOT, not a function — the
// client redirects to /auth/v1/authorize and reads the token back off the hash,
// so there is no SDK and no dependency added to a single-file build. Gated
// builds only: signing in exists to carry a PASS between devices, and an
// ungated build has nothing to carry. Unset keeps the Auth module inert — the
// same guarantee Sync and Gate make.
const AUTH_HOSTED_BASE = 'https://dxwpkjfypzxrzgbevfnx.supabase.co';
const authBase = GATED
    ? (process.env.ANSWER_BOOK_AUTH_BASE ?? AUTH_HOSTED_BASE)
    : '';
// Supabase Auth's REST endpoints want an `apikey` header as well as the bearer
// token — without it /auth/v1/user answers 401 even for a perfectly valid
// session, and the client would sign a real student straight back out. This is
// the ANON key, which is public by design (it ships in every Supabase web app
// and grants nothing on its own; RLS and the service key do the guarding). The
// service key must NEVER appear here.
// Hardcoded like the endpoint URLs above, and for the same reason: this build
// does not read .env.local, so an env-only value bakes as an empty string and
// then signs every student straight back out — silently, because an empty
// apikey looks exactly like a bad token. Overridable for another project.
const AUTH_ANON_PUBLIC = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4d3BramZ5cHp4cnpnYmV2Zm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMTU4MjUsImV4cCI6MjA4NzU5MTgyNX0.YaWg-pForGJOGsuoeMTT9QlfEJBLZVjeJSjgvYBf0is';
const authAnon = GATED ? (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? AUTH_ANON_PUBLIC) : '';
if (GATED && !authAnon) {
    fail('  no Supabase anon key — Google sign-in would sign every student back out');
}

// The door's tiles, resolved against THIS build. Counts for the live cell are
// read off the BUILT manifest rather than typed in — the same rule the og card
// follows, so the door can never advertise a book bigger than the file it is
// printed on.
const doorTracks = TRACKS.map((t) => ({
    id: t.id,
    label: t.label,
    subjects: t.subjects,
    years: t.years.map((y) => {
        const live = !!STREAM && y.stream === STREAM;
        return {
            id: y.id,
            label: y.label,
            live,
            note: y.note,
            // Chapters and answers a student can OPEN — coming-soon rows for a
            // chapter the 2026-27 syllabus announced but nobody has written yet
            // are listed in the catalog (true shape) and must not be counted in
            // a number the door uses to say what this book contains.
            units: live ? manifest.units.filter((u) => u.questions.some((e) => e.question_id)).length : 0,
            questions: live ? manifest.units.reduce((n, u) => n + u.questions.filter((e) => e.question_id).length, 0) : 0,
        };
    }),
}));
// Exactly one way in, or the door is broken in a way no gate would notice: zero
// live cells strands every student on the chooser, two lets one artifact claim
// to be two different books.
if (STREAM) {
    const liveCells = doorTracks.reduce((n, t) => n + t.years.filter((y) => y.live).length, 0);
    if (liveCells !== 1) {
        fail(`  the door resolved ${liveCells} live cells for --stream=${STREAM} — TRACKS must name exactly one`);
    }
}

// </script> inside any string can never break out of the data block:
const dataJs =
    `window.PM_QUESTIONS = ${JSON.stringify(GATED ? gatedQuestions : browserQuestions).replace(/</g, '\\u003c')};\n` +
    `window.PM_UNITS = ${JSON.stringify(manifest.units).replace(/</g, '\\u003c')};\n` +
    // The paper each subject sits — ONE table (src/schemas/answerBook.ts), so
    // the marks the schema enforces and the marks the player prints agree.
    `window.PM_PATTERNS = ${JSON.stringify(PAPER_PATTERNS).replace(/</g, '\\u003c')};\n` +
    // Cards whose topic left the syllabus: still in PM_QUESTIONS (a forwarded
    // link must not 404), absent from PM_UNITS (never offered).
    `window.PM_RETIRED = ${JSON.stringify(retiredById).replace(/</g, '\\u003c')};\n` +
    `window.PM_API_BASE = ${JSON.stringify(apiBase)};\n` +
    `window.PM_VIDI_BASE = ${JSON.stringify(vidiBase)};
` +
    `window.PM_SYNC_BASE = ${JSON.stringify(syncBase)};\n` +
    `window.PM_CONTENT_BASE = ${JSON.stringify(contentBase)};
` +
    `window.PM_PAY_BASE = ${JSON.stringify(payBase)};\n` +
    `window.PM_AUTH_BASE = ${JSON.stringify(authBase)};\n` +
    `window.PM_AUTH_ANON = ${JSON.stringify(authAnon)};\n` +
    // null on the full build — the catalog eyebrow then stays subject-neutral.
    `window.PM_STREAM = ${JSON.stringify(STREAM ? STREAMS[STREAM].short : null)};
` +
    // The YEAR the built artifact is for. Hardcoded in three places until
    // 2026-08-28; null on the full build, where the eyebrow stays neutral.
    `window.PM_YEAR = ${JSON.stringify(STREAM ? STREAMS[STREAM].year : null)};
` +
    // null on the full build too, and that is what switches the DOOR off. An
    // unstreamed build is the whole five-subject bank — it belongs to no group,
    // so a chooser over it would be a lie. It also keeps the 59-gate offline
    // suite, which runs against dist/, meeting the catalog exactly as before.
    `window.PM_TRACKS = ${JSON.stringify(STREAM ? doorTracks : null).replace(/</g, '\u003c')};`;

// ── the social-preview card ──────────────────────────────────────────────────
// A student meets this product as a link in a WhatsApp group before they ever
// meet the page, so the preview card is the storefront. Without og: tags the
// link renders as a bare grey box, which reads as spam in exactly the channel
// distribution depends on.
//
// og:image must be an ABSOLUTE url to a real file — WhatsApp does not fetch
// data: URIs — so the card png is written alongside index.html and referenced
// off PUBLIC_URL. If the png is missing the tags still degrade to a clean
// text-only card rather than a broken image.
const PUBLIC_URL = (process.env.ANSWER_BOOK_PUBLIC_URL ?? 'https://answers.viditra.co/').replace(/\/*$/, '/');
const streamDef = STREAM ? STREAMS[STREAM] : null;
const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const metaTitle = streamDef ? `IPE Answer Book — ${streamDef.label}` : 'IPE Answer Book — Telangana';
const metaDesc = streamDef
    ? `Every Telangana IPE question answered step by step, with the marks for each step. ` +
      `${streamDef.blurb} — ${streamDef.year.toLowerCase()}. Four chapters free.`
    : 'Every Telangana IPE question answered step by step, with the marks for each step. Four chapters free.';

const headMeta = [
    `<title>${esc(metaTitle)} | Viditra</title>`,
    `<meta name="description" content="${esc(metaDesc)}">`,
    // Viditra clay — the phone browser's chrome tints to this, so it is the
    // first brand colour a student sees, before the page paints.
    `<meta name="theme-color" content="#CB6843">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="Viditra">`,
    `<meta property="og:title" content="${esc(metaTitle)}">`,
    `<meta property="og:description" content="${esc(metaDesc)}">`,
    `<meta property="og:url" content="${esc(PUBLIC_URL)}">`,
    `<meta property="og:image" content="${esc(PUBLIC_URL + 'og.png')}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(metaTitle)}">`,
    `<meta name="twitter:description" content="${esc(metaDesc)}">`,
    `<meta name="twitter:image" content="${esc(PUBLIC_URL + 'og.png')}">`,
].join('\n');

const html = shell
    .replace('/*__CSS__*/', () => (katexLineCount > 0 ? katexCss() + '\n' : '') + css)
    .replace('/*__DATA__*/', () => dataJs)
    .replace('/*__JS__*/', () => js)
    .replace('<!--__HEAD_META__-->', () => headMeta)
    .replace('<!--__BUILT_AT__-->', () => `<!-- built ${new Date().toISOString()} -->`);

mkdirSync(OUT_DIR, { recursive: true });
const outPath = join(OUT_DIR, 'index.html');
writeFileSync(outPath, html, 'utf8');

// ── report ───────────────────────────────────────────────────────────────────
console.log(`✓ answer-book built → ${outPath} (${(html.length / 1024).toFixed(1)} KB)`);
// State the lens on every build. A streamed artifact and a full one are the same
// filename in different directories; the one thing that must never be ambiguous
// is which subjects a student is about to receive.
if (STREAM) {
    const dropped = SUBJECTS.filter((s) => !STREAM_SUBJECTS!.has(s));
    console.log(`  stream:       ${STREAM.toUpperCase()} — ${[...STREAM_SUBJECTS!].join(', ')}`);
    console.log(`                ${questions.length} of ${allQuestions.length} cards, ${manifest.units.length} units` +
        (dropped.length ? ` (excluded: ${dropped.join(', ')})` : ''));
} else {
    console.log(`  stream:       (none — the FULL bank, every subject)`);
}
if (retiredCount) {
    console.log(`  retired:      ${retiredCount} card(s) kept on file but not offered (syllabus revision — see units.json status:"retired")`);
}
console.log(`  checking API: ${apiBase || '(unset — no photo, no mic, page stays fully offline)'}`);
console.log(`  Vidi chat:    ${vidiBase || '(unset — deterministic Vidi only, no ask row, no telemetry)'}`);
console.log(`  progress sync: ${syncBase || '(unset — Sync inert, localStorage only, zero network)'}`);
console.log(`  content gate:  ${contentBase || '(unset — every answer embedded, Gate inert)'}${GATED ? ' [GATED — answer bodies NOT in the page]' : ''}`);
console.log(`  payments:      ${payBase || '(unset — no pay button)'}`);
console.log(`  katex lines: ${katexLineCount || '0 (no KaTeX stylesheet or fonts embedded)'}`);
for (const q of questions) {
    const sum = q.answer.steps.reduce((a, s) => a + s.marks, 0);
    const recall = q.answer.steps.every((s) => s.recall) ? 'recall: ready' : 'recall: not authored';
    console.log(`  ${q.question_id}  [${q.qtype} ${q.marks_total}M]  steps=${q.answer.steps.length}  marks-sum=${sum} ✓  ${recall}`);
    for (const s of q.answer.steps) {
        console.log(`    ${String(s.marks).padStart(2)}M  ${s.id}  (${s.kind})`);
    }
    // Print every cut. A reduced cut that silently lost a step, or whose split
    // stopped adding up, is invisible in the full-answer line above.
    if (q.cuts?.length) {
        for (const c of q.cuts) {
            const ids = Object.keys(c.steps);
            const omitted = q.answer.steps.filter((s) => !ids.includes(s.id)).map((s) => s.id);
            const flag = c.needs_teacher_verification ? '  ⚠ split unverified' : '';
            console.log(
                `    cut "${c.key}"  [${c.qtype} ${c.marks_total}M]  ${ids.length}/${q.answer.steps.length} steps` +
                `  ~${c.expected_time_min}min${flag}`
            );
            if (omitted.length) console.log(`         omits: ${omitted.join(', ')}`);
        }
    }
}
// Per-unit coverage — READY counts manifest ENTRIES, not files: SAQ 2 and SAQ 4
// both map to the projectile file, and each is its own card in the catalog.
console.log('');
for (const u of manifest.units) {
    const ready = u.questions.filter((e) => e.question_id).length;
    const pending = u.questions.filter((e) => !e.question_id);
    const bySec = pending.reduce<Record<string, number>>((acc, e) => {
        acc[e.section] = (acc[e.section] ?? 0) + 1;
        return acc;
    }, {});
    const pendingTxt = pending.length
        ? ` (pending: ${Object.entries(bySec).map(([s, n]) => `${n} ${s}`).join(', ')})`
        : '';
    console.log(`  Unit ${u.number} — ${u.name}: ${ready}/${u.questions.length} ready${pendingTxt}`);
}

// Vidi-depth coverage. `why` / `common_mistakes` / `mark_note` are gated hard in
// §1c, so they are not repeated here; these three are the SPARSE ones and the
// remaining authoring work, per unit. Report-only by design — the bar is
// complete-for-its-size, and a 2-mark VSAQ is not padded to hit a number.
console.log('\n  Vidi depth (the sparse fields — authoring, not a gate):');
{
    const byId = new Map(questions.map((q) => [q.question_id, q]));
    let gTip = 0, gNote = 0, gIns = 0, gQ = 0;
    for (const u of manifest.units) {
        const seen = new Set<string>();
        let tip = 0, note = 0, ins = 0, n = 0;
        for (const e of u.questions) {
            if (!e.question_id || seen.has(e.question_id)) continue;
            seen.add(e.question_id);
            const q = byId.get(e.question_id);
            if (!q) continue;
            n++;
            if (q.answer.steps.some((s) => s.memory_tip)) tip++;
            if (q.answer.steps.some((s) => s.margin_note)) note++;
            if (q.insider_note) ins++;
        }
        gTip += tip; gNote += note; gIns += ins; gQ += n;
        const pct = (x: number) => String(Math.round((100 * x) / Math.max(1, n)) + '%').padStart(4);
        console.log(`    Unit ${u.number}: memory_tip ${pct(tip)} (${tip}/${n})` +
            ` · margin_note ${pct(note)} (${note}/${n})` +
            ` · insider_note ${pct(ins)} (${ins}/${n})`);
    }
    const g = (x: number) => String(Math.round((100 * x) / Math.max(1, gQ)) + '%').padStart(4);
    console.log(`    ALL    : memory_tip ${g(gTip)} (${gTip}/${gQ})` +
        ` · margin_note ${g(gNote)} (${gNote}/${gQ})` +
        ` · insider_note ${g(gIns)} (${gIns}/${gQ})`);
}
console.log(`\nNext: npm run serve:answers → http://localhost:8100  (or open ${outPath} directly)`);
