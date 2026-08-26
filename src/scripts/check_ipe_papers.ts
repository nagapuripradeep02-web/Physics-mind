/**
 * check:papers — structural gate on the transcribed board papers.
 *
 * The corpus in answer-book/papers/ is evidence: every appearance tag, every
 * coverage claim and the whole authoring queue are derived from it. A silent
 * transcription slip there propagates into student-facing cards, so the shape
 * is checked mechanically even though the WORDS can only be checked by reading
 * the scan.
 *
 * It also validates the `source` vocabulary in units.json. The build checks
 * ref, section, stars, question_id and cut — but never `source`, so a typo
 * silently reclassifies a predicted card as an asked one. Adding `ts_paper`
 * as a fourth value made that gap worth closing here.
 */
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..');
const BOOK = join(ROOT, 'answer-book');
const PAPERS = join(BOOK, 'papers');

const KNOWN_SOURCES = new Set(['blm', 'enumerated', 'ap_2026_paper', 'ts_paper']);

const failures: string[] = [];
const fail = (m: string) => failures.push(m);

if (!existsSync(PAPERS)) {
    console.error('✗ answer-book/papers/ does not exist');
    process.exit(1);
}

const files = readdirSync(PAPERS).filter((f) => f.endsWith('.json') && f !== 'matches.json').sort();
if (!files.length) fail('no paper files found');

const seenPapers = new Set<string>();
let totalSlots = 0;

for (const f of files) {
    const at = `answer-book/papers/${f}`;
    let doc: any;
    try {
        doc = JSON.parse(readFileSync(join(PAPERS, f), 'utf8'));
    } catch (e: any) {
        fail(`${at}: invalid JSON — ${e.message}`);
        continue;
    }

    if (doc.schema_version !== 'ipe_paper_v1') fail(`${at}: schema_version must be "ipe_paper_v1"`);
    if (`${doc.paper_id}.json` !== f) fail(`${at}: paper_id "${doc.paper_id}" does not match the filename`);

    const key = `${doc.board}|${doc.year}|${doc.month}`;
    if (seenPapers.has(key)) fail(`${at}: a second paper claims ${doc.board} ${doc.month_label}`);
    seenPapers.add(key);

    if (!['printed', 'inferred'].includes(doc.date_confidence)) {
        fail(`${at}: date_confidence must be "printed" or "inferred"`);
    }
    if (doc.date_confidence === 'inferred' && !doc.provenance?.year_source?.trim()) {
        fail(`${at}: an inferred year MUST carry provenance.year_source saying how it was inferred`);
    }
    if (!doc.provenance?.source_pdf) fail(`${at}: provenance.source_pdf is missing`);

    const sections: any[] = doc.exam_pattern?.sections || [];
    if (!sections.length) { fail(`${at}: exam_pattern.sections is empty`); continue; }

    const offered = sections.reduce((a, s) => a + s.count, 0);
    const attemptable = sections.reduce((a, s) => a + s.choose * s.marks_each, 0);
    if (attemptable !== doc.exam_pattern.max_marks) {
        fail(`${at}: sections total ${attemptable} attemptable marks but max_marks is ${doc.exam_pattern.max_marks}`);
    }

    const qs: any[] = doc.questions || [];
    if (qs.length !== offered) fail(`${at}: ${qs.length} questions listed but the pattern offers ${offered}`);

    const nos = qs.map((q) => q.q_no);
    for (let i = 1; i <= qs.length; i++) {
        if (!nos.includes(i)) fail(`${at}: question number ${i} is missing`);
    }
    if (new Set(nos).size !== nos.length) fail(`${at}: duplicate question numbers`);

    for (const q of qs) {
        const sec = sections.find((s) => s.name === q.section);
        if (!sec) { fail(`${at} q${q.q_no}: section "${q.section}" is not in exam_pattern`); continue; }
        const [lo, hi] = sec.q_range;
        if (q.q_no < lo || q.q_no > hi) fail(`${at} q${q.q_no}: outside ${q.section} range ${lo}–${hi}`);
        if (q.qtype !== sec.qtype) fail(`${at} q${q.q_no}: qtype ${q.qtype} != section qtype ${sec.qtype}`);
        if (q.marks !== sec.marks_each) fail(`${at} q${q.q_no}: ${q.marks} marks != section ${sec.marks_each}`);
        if (!q.text?.trim()) fail(`${at} q${q.q_no}: empty text`);

        totalSlots += q.parts ? q.parts.length : 1;
        if (q.parts) {
            if (q.parts.length < 2) fail(`${at} q${q.q_no}: parts[] with fewer than 2 entries — drop it`);
            const joined = q.parts.map((p: any) => p.text).join(' ');
            if (joined !== q.text) fail(`${at} q${q.q_no}: parts do not reassemble into text`);
            const labels = q.parts.map((p: any) => p.part);
            if (new Set(labels).size !== labels.length) fail(`${at} q${q.q_no}: duplicate part labels`);
            for (const p of q.parts) if (!p.kind) fail(`${at} q${q.q_no}${p.part}: part has no kind`);
        }
        // ASCII transcription of maths that should be Unicode
        if (/\b\d+\s*\^\s*\d|[a-zA-Z]\^\d|sqrt\(|\bm\/s2\b|\bdeg\b/.test(q.text)) {
            fail(`${at} q${q.q_no}: looks like ASCII maths — the corpus is Unicode`);
        }
    }
}

// --- units.json source vocabulary ------------------------------------------
const units = JSON.parse(readFileSync(join(BOOK, 'units.json'), 'utf8'));
for (const u of units.units) {
    for (const e of u.questions) {
        if (e.source && !KNOWN_SOURCES.has(e.source)) {
            fail(`units.json ${u.subject || 'physics'}-${u.number} ${e.ref}: unknown source "${e.source}" — allowed: ${[...KNOWN_SOURCES].join(', ')}`);
        }
    }
}

if (failures.length) {
    console.error('\n✗ check:papers failed\n');
    for (const f of failures) console.error(`  ${f}`);
    console.error('');
    process.exit(1);
}

console.log(`✓ ${files.length} papers, ${totalSlots} answerable slots, structure and source vocabulary clean`);
