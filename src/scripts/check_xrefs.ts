/**
 * check_xrefs — reader-facing cross-references that point at nothing.
 *
 * The answer book has NO fixed reading order: a student opens one chapter, and
 * the player can filter, reorder and lens by unit and by year. So "the previous
 * question", "the twin", "the bubble question" name a card the reader cannot
 * open. Worse, `buildVidiContext()` emits these fields verbatim, so the chatbot
 * speaks the dangling reference to the student as if it were navigable.
 *
 * Origin: the 2026-09-01 maths audit filed these one card at a time. A bank-wide
 * sweep then found 135 strings in 96 cards across ALL ELEVEN subjects — the
 * audit had been sampling a systemic defect. This gate exists so that never
 * silently regrows.
 *
 * Sibling of the source-book-numbering rule in docs/reports/maths_audit/
 * SOURCE_BOOK_LEAKS.md: a reference must name the MATHEMATICS (or the biology,
 * or the reaction), never a location.
 *
 * Run: npm run check:xrefs            (whole bank)
 *      npm run check:xrefs -- --subject=botany
 *      npm run check:xrefs -- --list  (print every offending string)
 */
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const DIR = join(process.cwd(), 'answer-book', 'questions');

/**
 * Excluded by design:
 *   verification.*  internal provenance. It is SUPPOSED to cite the source
 *                   book's pages and answer numbers; that is where they belong.
 *   recall.accept / recall.heard_as
 *                   speech-recognition match targets, not rendered prose.
 *                   Rewording them weakens matching for no student-visible gain.
 */
const EXCLUDED_PATHS = [
    /^verification\b/,
    // The WHOLE recall rubric, not just accept/heard_as. build_answer_book.ts
    // strips `recall` from the browser copy (it is GRADER-side data), and
    // buildVidiContext() does not emit it — so nothing in it is ever read to a
    // student. `reject` entries are content-free BY DESIGN ("the last part"),
    // which is exactly what this gate would otherwise flag.
    /\brecall\b/,
];

/**
 * NOT DETECTED HERE, deliberately: pointers that name another card by its TOPIC
 * — "the bubble question", "the azeotrope question", "the balloon question".
 * They are the same defect, but telling them from ordinary English ("the whole
 * question", "the asked question") needs a hand-kept vocabulary, and a gate
 * carrying a word list rots and cries wolf. A green run here therefore does NOT
 * mean the bank is free of dangling pointers — it means the mechanical ones are
 * gone. The topic-shaped ones were cleared by hand on 2026-09-01 and need human
 * review when a new subject lands.
 */
const PATTERNS: [string, RegExp][] = [
    ['previous/next question', /\bthe\s+(previous|next|last|earlier|preceding)\s+(question|answer|card|part|one)\b/i],
    // ...and with a word in between: "the earlier −π/2-to-π/2 answer".
    ['previous/next <x> question', /\bthe\s+(previous|next|last|earlier|preceding)\s+\S+\s+(question|answer|card)\b/i],
    // "above"/"before" must END the phrase. Otherwise they are ordinary
    // prepositions governing what follows, and this fired on four innocent
    // cards on 2026-09-01 — "lifts the answer above three disconnected
    // definitions", "the question before you start". A gate that cries wolf
    // gets card text rewritten to appease it, which is backwards.
    ['the question above/below', /\bthe\s+(question|answer|card)\s+(above|below|before|after|opposite|facing)(?=\s*[.,;:)—]|\s*$)/i],
    // "its twin" / "their twin" slip past a bare "the twin".
    ['the twin(s)', /\b(the|its|their)\s+twins?\b/i],
    ['sibling pointer', /\b(the|its|their)\s+(twin|sibling|similar|companion|partner|matching|neighbouring|parallel)\s+(question|answer|card)\b/i],
    ['this page / facing', /\bon\s+this\s+page\b|\bfacing\s+(answer|page)\b/i],
];

type Hit = { file: string; subject: string; path: string; pattern: string; text: string };

function walk(node: unknown, path: string, visit: (p: string, s: string) => void): void {
    if (EXCLUDED_PATHS.some((re) => re.test(path))) return;
    if (typeof node === 'string') { visit(path, node); return; }
    if (Array.isArray(node)) { node.forEach((n, i) => walk(n, `${path}[${i}]`, visit)); return; }
    if (node && typeof node === 'object')
        for (const [k, v] of Object.entries(node as Record<string, unknown>)) walk(v, path ? `${path}.${k}` : k, visit);
}

const subjArg = process.argv.find((a) => a.startsWith('--subject='));
const WANT = subjArg ? subjArg.slice('--subject='.length) : null;

const hits: Hit[] = [];
for (const f of readdirSync(DIR).filter((x) => x.endsWith('.json'))) {
    const card = JSON.parse(readFileSync(join(DIR, f), 'utf8')) as Record<string, unknown>;
    const subject = String(card.subject ?? 'physics');
    if (WANT && subject !== WANT) continue;
    walk(card, '', (path, s) => {
        for (const [name, re] of PATTERNS) if (re.test(s)) hits.push({ file: f, subject, path, pattern: name, text: s.trim() });
    });
}

/**
 * A sweep that finds nothing looks exactly like a sweep that is broken. The
 * 2026-09-01 re-sweep walked `card.steps`, which does not exist (steps live
 * under `answer.steps`), reported a clean zero, and shipped a card still
 * carrying the defect. So the patterns are proved against a known positive
 * before any zero is believed, and the traversal is proved against a real card.
 */
const MUST_FIRE = [
    'This proof and the twin share every line.',
    'the same tactic as the previous question',
    'where this one differs from its twin',
    'the earlier −π/2-to-π/2 answer',
    'compare with the answer above.',
    'worked already on this page',
];
const MUST_NOT_FIRE = [
    // Ordinary English that four cards were needlessly rewritten to avoid.
    'lifts the answer above three disconnected definitions',
    'copy the domain from the question before you start',
    'the shape of the answer before any derivative is computed',
    // Within-card pointers: a card's own step order IS fixed, so these resolve.
    'comparing with the previous step',
    'the Δ over the last arrow',
    // Naming a class of method, not a card.
    'the same shape as the other sum-of-reciprocals proofs',
];
for (const s of MUST_FIRE) {
    if (!PATTERNS.some(([, re]) => re.test(s))) {
        console.error(`x self-test FAILED: no pattern fires on a known positive: "${s}"`);
        process.exit(1);
    }
}
for (const s of MUST_NOT_FIRE) {
    const hit = PATTERNS.find(([, re]) => re.test(s));
    if (hit) {
        console.error(`x self-test FAILED: "${hit[0]}" fires on ordinary English: "${s}"`);
        process.exit(1);
    }
}
let walked = 0;
walk(JSON.parse(readFileSync(join(DIR, readdirSync(DIR).filter((x) => x.endsWith('.json'))[0]), 'utf8')), '', (p) => {
    if (/^answer\.steps\[\d+\]\./.test(p)) walked++;
});
if (walked === 0) {
    console.error('x self-test FAILED: traversal never reached answer.steps[] — the walk is blind');
    process.exit(1);
}

const cards = new Set(hits.map((h) => h.file));
if (process.argv.includes('--list')) {
    for (const h of hits) console.log(`[${h.subject}] ${h.file.replace('.json', '')}\n  ${h.path}  (${h.pattern})\n  ${h.text}\n`);
}

if (!hits.length) {
    console.log(`check:xrefs passes — no unresolvable cross-references${WANT ? ` in ${WANT}` : ''}.`);
    process.exit(0);
}

const bySubject = new Map<string, Set<string>>();
for (const h of hits) {
    if (!bySubject.has(h.subject)) bySubject.set(h.subject, new Set());
    bySubject.get(h.subject)!.add(h.file);
}
console.error(`\n${hits.length} unresolvable cross-reference(s) in ${cards.size} card(s):\n`);
for (const [s, f] of [...bySubject].sort()) console.error(`  ${s.padEnd(16)} ${f.size} card(s)`);
console.error('\nA cross-reference must name the CONTENT it points at, never a position');
console.error('("the previous question", "the twin"). The book has no fixed reading order.');
console.error('Run with --list to see every offending string.\n');
console.error('check:xrefs FAILED.');
process.exit(1);
