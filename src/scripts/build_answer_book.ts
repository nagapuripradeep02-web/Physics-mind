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
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { answerBookQuestionSchema, type AnswerBookQuestion } from '../schemas/answerBook';

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
type ManifestUnit = { number: number; name: string; questions: ManifestEntry[] };

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
for (const u of manifest.units) {
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
            return step;
        }),
    },
}));

// The checking API is optional. Unset → the page offers neither photo nor mic and
// makes zero network calls, exactly as it shipped (progressive enhancement, not a
// dependency). One base; the client derives /recall-check and /photo-check.
const apiBase = process.env.ANSWER_BOOK_API_BASE ?? '';

// </script> inside any string can never break out of the data block:
const dataJs =
    `window.PM_QUESTIONS = ${JSON.stringify(browserQuestions).replace(/</g, '\\u003c')};\n` +
    `window.PM_UNITS = ${JSON.stringify(manifest.units).replace(/</g, '\\u003c')};\n` +
    `window.PM_API_BASE = ${JSON.stringify(apiBase)};`;

const html = shell
    .replace('/*__CSS__*/', () => css)
    .replace('/*__DATA__*/', () => dataJs)
    .replace('/*__JS__*/', () => js)
    .replace('<!--__BUILT_AT__-->', () => `<!-- built ${new Date().toISOString()} -->`);

mkdirSync(OUT_DIR, { recursive: true });
const outPath = join(OUT_DIR, 'index.html');
writeFileSync(outPath, html, 'utf8');

// ── report ───────────────────────────────────────────────────────────────────
console.log(`✓ answer-book built → ${outPath} (${(html.length / 1024).toFixed(1)} KB)`);
console.log(`  checking API: ${apiBase || '(unset — no photo, no mic, page stays fully offline)'}`);
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
console.log(`\nNext: npm run serve:answers → http://localhost:8100  (or open ${outPath} directly)`);
