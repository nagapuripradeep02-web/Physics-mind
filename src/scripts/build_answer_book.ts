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

// ── 2. read the engine files ─────────────────────────────────────────────────
const shell = readFileSync(join(BOOK_DIR, 'shell.html'), 'utf8');
const css = readFileSync(join(BOOK_DIR, 'notebook.css'), 'utf8');
const js = readFileSync(join(BOOK_DIR, 'notebook.js'), 'utf8');

for (const token of ['/*__CSS__*/', '/*__JS__*/', '/*__DATA__*/', '<!--__BUILT_AT__-->']) {
    if (!shell.includes(token)) fail(`shell.html is missing the token ${token}`);
}

// ── 3. inline + write ────────────────────────────────────────────────────────
// </script> inside any string can never break out of the data block:
const dataJs = `window.PM_QUESTIONS = ${JSON.stringify(questions).replace(/</g, '\\u003c')};`;

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
for (const q of questions) {
    const sum = q.answer.steps.reduce((a, s) => a + s.marks, 0);
    console.log(`  ${q.question_id}  [${q.qtype} ${q.marks_total}M]  steps=${q.answer.steps.length}  marks-sum=${sum} ✓`);
    for (const s of q.answer.steps) {
        console.log(`    ${String(s.marks).padStart(2)}M  ${s.id}  (${s.kind})`);
    }
}
console.log(`\nNext: npm run serve:answers → http://localhost:8100  (or open ${outPath} directly)`);
