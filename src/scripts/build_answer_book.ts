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
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import katex from 'katex';
import { answerBookQuestionSchema, type AnswerBookQuestion } from '../schemas/answerBook';
// The Rule 41 word list, IMPORTED not copied — it is the same list the shakedown
// grades Vidi's replies with, so the bank and the model are held to one standard.
import { idiomsIn } from '../lib/answerBook/vidiChecks';

const ROOT = process.cwd();
const BOOK_DIR = join(ROOT, 'answer-book');
const QUESTIONS_DIR = join(BOOK_DIR, 'questions');
const OUT_DIR = join(BOOK_DIR, 'dist');

function fail(msg: string): never {
    console.error(`\n✗ build:answers failed\n${msg}`);
    process.exit(1);
}

// ── 1. read + validate every question ────────────────────────────────────────
const files = readdirSync(QUESTIONS_DIR).filter((f) => f.endsWith('.json')).sort();
if (files.length === 0) fail(`no question JSONs found in ${QUESTIONS_DIR}`);

const questions: AnswerBookQuestion[] = [];
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
    questions.push(q);
}

// ── 1b. read + cross-check the unit manifest ─────────────────────────────────
// units.json is the catalog's inventory: every question the BOOK lists for a
// unit, whether authored yet or not. Its star ranks and section numbering are
// the book's; entries with a question_id open in the notebook, the rest render
// as coming-soon cards. Drift in EITHER direction is a build failure: an
// authored question the manifest does not list would be invisible in the
// catalog, and a manifest pointer at nothing would be a dead card. Both are
// exactly the silent-drop failure mode PILOT_CONCEPTS once had.
type ManifestEntry = {
    ref: string;
    section: 'VSAQ' | 'SAQ' | 'LAQ';
    number: number;
    stars: number;
    text: string;
    question_id?: string;
    cut?: string;
};
type ManifestUnit = { number: number; name: string; subject?: string; questions: ManifestEntry[] };

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

const questionById = new Map(questions.map((q) => [q.question_id, q]));
const listedIds = new Set<string>();
const SUBJECTS = ['physics', 'chemistry', 'mathematics'];
for (const u of manifest.units) {
    // Absent = physics (the historical meaning). A TYPO must fail the build: it would
    // silently mint a fourth subject chip rather than filing the unit where it belongs.
    if (u.subject !== undefined && !SUBJECTS.includes(u.subject)) {
        fail(`${manifestPath}\n  unit ${u.number}: subject "${u.subject}" is not one of ${SUBJECTS.join('/')}`);
    }
    const refs = new Set<string>();
    for (const e of u.questions) {
        if (refs.has(e.ref)) fail(`${manifestPath}\n  unit ${u.number}: duplicate ref "${e.ref}"`);
        refs.add(e.ref);
        if (!['VSAQ', 'SAQ', 'LAQ'].includes(e.section)) {
            fail(`${manifestPath}\n  unit ${u.number} ${e.ref}: section "${e.section}" is not VSAQ/SAQ/LAQ`);
        }
        if (!(e.stars >= 0 && e.stars <= 3)) {
            fail(`${manifestPath}\n  unit ${u.number} ${e.ref}: stars must be 0-3`);
        }
        if (e.question_id) {
            const q = questionById.get(e.question_id);
            if (!q) fail(`${manifestPath}\n  unit ${u.number} ${e.ref}: question_id "${e.question_id}" has no authored file`);
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

for (const token of ['/*__CSS__*/', '/*__JS__*/', '/*__DATA__*/', '<!--__BUILT_AT__-->']) {
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

// The checking API is optional. Unset → the page offers neither photo nor mic and
// makes zero network calls, exactly as it shipped (progressive enhancement, not a
// dependency). One base; the client derives /recall-check and /photo-check.
const apiBase = process.env.ANSWER_BOOK_API_BASE ?? '';

// Vidi's live-chat endpoint — the SAME progressive-enhancement contract as the
// checking API. Unset (the default) → the free-text ask row and the telemetry
// flush never exist and the page stays fully offline (deterministic Vidi — the
// chips, the verdict, the exam-eve view — works everywhere, file:// included).
// `--hosted` bakes the deployed Edge Function base for the served copy.
const VIDI_HOSTED_BASE = 'https://dxwpkjfypzxrzgbevfnx.supabase.co/functions/v1/answerbook-vidi-chat';
const vidiBase = process.argv.includes('--hosted')
    ? (process.env.ANSWER_BOOK_VIDI_BASE ?? VIDI_HOSTED_BASE)
    : (process.env.ANSWER_BOOK_VIDI_BASE ?? '');

// </script> inside any string can never break out of the data block:
const dataJs =
    `window.PM_QUESTIONS = ${JSON.stringify(browserQuestions).replace(/</g, '\\u003c')};\n` +
    `window.PM_UNITS = ${JSON.stringify(manifest.units).replace(/</g, '\\u003c')};\n` +
    `window.PM_API_BASE = ${JSON.stringify(apiBase)};\n` +
    `window.PM_VIDI_BASE = ${JSON.stringify(vidiBase)};`;

const html = shell
    .replace('/*__CSS__*/', () => (katexLineCount > 0 ? katexCss() + '\n' : '') + css)
    .replace('/*__DATA__*/', () => dataJs)
    .replace('/*__JS__*/', () => js)
    .replace('<!--__BUILT_AT__-->', () => `<!-- built ${new Date().toISOString()} -->`);

mkdirSync(OUT_DIR, { recursive: true });
const outPath = join(OUT_DIR, 'index.html');
writeFileSync(outPath, html, 'utf8');

// ── report ───────────────────────────────────────────────────────────────────
console.log(`✓ answer-book built → ${outPath} (${(html.length / 1024).toFixed(1)} KB)`);
console.log(`  checking API: ${apiBase || '(unset — no photo, no mic, page stays fully offline)'}`);
console.log(`  Vidi chat:    ${vidiBase || '(unset — deterministic Vidi only, no ask row, no telemetry)'}`);
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
