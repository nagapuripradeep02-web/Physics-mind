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
 * TOPIC-SHAPED POINTERS — "the azeotrope question", "the ZnO question".
 *
 * These name another card by its subject matter. Detecting them looked
 * impossible at first (topic words are unbounded), but the problem inverts:
 * flag `the <word> question` and exempt the small closed set of GENERIC
 * modifiers that refer to the card in hand or to no card at all.
 *
 * Two measurements shaped this:
 *   - Matching `answer` and `card` as well as `question` produced 400 hits, 226
 *     of them "the FINAL answer" — where "answer" means the mathematical result,
 *     not a card. `question` almost always means a card; `answer` is ambiguous.
 *     So this pattern matches `question` ONLY.
 *   - That still leaves genuine English: self-reference ("this is the one
 *     question in the unit whose diagram is asked for") and hypothetical exam
 *     talk ("the follow-up question an examiner attaches"). About 70% precision.
 *
 * 70% is not good enough for a gate — a gate that cries wolf gets good text
 * rewritten to appease it, which already happened here once. So every accepted
 * phrase is listed in REVIEWED_EXCEPTIONS below WITH ITS REASON. New ones fail
 * until a human looks at them. That keeps the gate exact by construction rather
 * than by hoping a regex is clever enough.
 */
const GENERIC_MODIFIERS = new Set([
    'whole', 'same', 'asked', 'wrong', 'right', 'correct', 'original', 'actual', 'real', 'given',
    'present', 'current', 'main', 'key', 'only', 'full', 'entire', 'general', 'standard', 'typical',
    'usual', 'following', 'exam', 'board', 'model', 'practice', 'set', 'printed', 'stated', 'above',
    'below', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth',
    'tenth', 'next', 'previous', 'last', 'earlier', 'preceding', 'longer', 'shorter',
    'harder', 'easier', 'hardest', 'easiest', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
    'and', 'or',   // joiners inside a compound topic: "the antiseptic AND disinfectant questions"
    // Question-TYPE wording, not a topic: "the very short answer question".
    'very', 'short', 'long', 'answer', 'multiple', 'choice',
]);

/**
 * If one of these appears between "the" and "question", the phrase is not a
 * modifier at all — the sentence has simply run on into a new noun phrase:
 * "the point OF THE question", "the form THE question takes", "the book prints
 * THIS question". Allowing a 3-word span without this check produced 291 false
 * hits against 51 real ones.
 */
const SPAN_BREAKERS = new Set([
    'the', 'a', 'an', 'of', 'to', 'in', 'on', 'at', 'for', 'with', 'from', 'by', 'into', 'about',
    'this', 'that', 'these', 'those', 'it', 'its', 'their', 'his', 'her',
    'when', 'where', 'which', 'what', 'why', 'how', 'if', 'as', 'than', 'then',
]);
/**
 * Up to three modifier words, plural, and the exam-code nouns.
 *
 * Each widening came from a real miss found while repairing, not from
 * speculation — the single-word version let through "the POSITIVE DEVIATION
 * question", the singular version let through "the antiseptic and disinfectant
 * questionS" while catching its twin (repairing one side of a pair and not the
 * other), and the question/answer/card nouns let through "the conservation SAQ".
 */
const TOPIC_RE = /\bthe\s+((?:[a-z][a-z-]*\s+){1,3})(questions?|SAQs?|LAQs?|VSAQs?)\b/gi;

/**
 * Phrases reviewed on 2026-09-01 and judged NOT to be dangling pointers.
 * Each entry says why. Keep the reason — an unexplained suppression is how a
 * gate quietly stops meaning anything.
 */
const REVIEWED_EXCEPTIONS: [string, string][] = [
    ['the one question in the unit whose diagram is asked for', 'self-reference: "this is the one question…"'],
    ['the one question in the chapter where the guide', 'self-reference: describes this card'],
    ['Not answering the final question', 'refers to the last PART of this same question'],
    ['before the consistency question is answered', 'refers to the consistency test inside this card'],
    ['the different question a student often confuses', 'indefinite in meaning — "a different question"'],
    ['the most involved VSAQ in the whole Definite Integrals chapter', 'self-reference: "This is the most involved VSAQ…" describes this card'],
];
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
    // NOT widened to allow words before "twin" ("the 3 : 2 twin"), and the
    // measurement is why: that version scored 14 hits, TWO of them real. In this
    // bank "<x> twin" overwhelmingly names a conceptual ANALOGUE, not a card —
    // "the rotational twin of linear momentum", "the cotangent twin of
    // tan²x = sec²x − 1", "the a²−x² twin of the x²−a² log formula". Those are
    // self-contained and resolvable; flagging them would be pure noise. The
    // handful of genuine card-pointers of that shape ("the no-zero twin", "the
    // ⁿP₃ twin") were fixed by hand on 2026-09-01 instead. Precision over reach:
    // a gate at 14% gets ignored, then relaxed, then deleted.
    ['sibling pointer', /\b(the|its|their)\s+(twin|sibling|similar|companion|partner|matching|neighbouring|parallel)\s+(question|answer|card)\b/i],
    ['this page / facing', /\bon\s+this\s+page\b|\bfacing\s+(answer|page)\b/i],
    // "the mirror of the other card" — `other` is a generic MODIFIER above, but
    // as a bare pointer it names a card the reader cannot open.
    ['the other question/card', /\bthe\s+other\s+(question|answer|card)s?\b/i],
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

        if (REVIEWED_EXCEPTIONS.some(([phrase]) => s.includes(phrase))) return;
        for (const m of s.matchAll(TOPIC_RE)) {
            const words = m[1].trim().toLowerCase().split(/\s+/);
            if (words.some((w) => SPAN_BREAKERS.has(w))) continue;
            if (!words.some((w) => !(GENERIC_MODIFIERS.has(w) || /^\d/.test(w) || /marks?$/.test(w)))) continue;
            hits.push({ file: f, subject, path, pattern: `names another card by topic ("${m[0].trim()}")`, text: s.trim() });
        }
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

/** The topic pattern, proved both ways too. */
const topicWords = (m: RegExpMatchArray): string[] => m[1].trim().toLowerCase().split(/\s+/);
const isGenericWord = (w: string): boolean => GENERIC_MODIFIERS.has(w) || /^\d/.test(w) || /marks?$/.test(w);
const topicFires = (s: string): boolean =>
    !REVIEWED_EXCEPTIONS.some(([p]) => s.includes(p)) &&
    [...s.matchAll(TOPIC_RE)].some((m) => {
        const words = topicWords(m);
        return !words.some((w) => SPAN_BREAKERS.has(w)) && words.some((w) => !isGenericWord(w));
    });

for (const s of [
    'links this answer to the azeotrope question',
    'Confusing this with the antibiotic question',
    'the mirror of the positive deviation question',              // two-word topic
    'The antiseptic and disinfectant questions are marked',       // compound + plural
    'appears inside the conservation SAQ in both source books',   // exam-code noun
]) {
    if (!topicFires(s)) { console.error(`x self-test FAILED: topic pattern misses "${s}"`); process.exit(1); }
}
for (const s of [
    'the whole question turns on one comparison',   // generic modifier
    'this is the 8-mark question in the chapter',   // numeric
    'the two-mark question',                        // mark-shaped
    'the final answer is 12',                       // noun is `answer`, not `question`
    'the first and second questions are alike',     // generic + joiner + generic
    'that is the point of the question',            // span runs into a new noun phrase
    'the rest of the question is arithmetic',
    'the form the question takes',
    'The book prints this question twice',
    'This is the one question in the unit whose diagram is asked for',  // reviewed exception
]) {
    if (topicFires(s)) { console.error(`x self-test FAILED: topic pattern fires on "${s}"`); process.exit(1); }
}

/**
 * A REVIEWED_EXCEPTION whose phrase no longer exists anywhere is dead weight —
 * and worse, it can silently suppress a FUTURE hit that happens to contain the
 * same substring. So a dead exception fails the gate and must be deleted.
 */
const allText: string[] = [];
for (const f of readdirSync(DIR).filter((x) => x.endsWith('.json'))) {
    walk(JSON.parse(readFileSync(join(DIR, f), 'utf8')), '', (_p, s) => { allText.push(s); });
}
for (const [phrase, reason] of REVIEWED_EXCEPTIONS) {
    if (!allText.some((s) => s.includes(phrase))) {
        console.error(`x self-test FAILED: stale REVIEWED_EXCEPTION, delete it — "${phrase}" (${reason})`);
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
