/**
 * backtest_zoology.ts — the Zoology back-test.
 *
 *   npx tsx src/scripts/backtest_zoology.ts --refs <backtest_refs.json>
 *   npm run backtest:zoology -- --refs <path>
 *
 * The two-book union check and a real board paper are BOTH impossible for
 * zoology (the TSBIE Basic Learning Material on hand is physics-only, and no
 * zoology board paper is in the corpus). What this book DOES carry is its own
 * cross-reference web: three hit lists, a Bullet Model Paper, and five guess
 * papers, all citing answers as "P <page>(<qno>)". Every one of those citations
 * must resolve to a card we authored — a citation with no card is a question
 * the book asks and we do not answer.
 *
 * Matching is by NORMALISED QUESTION TEXT (the printed qno is the book's global
 * number, which units.json also stores as `number`, so both are checked and
 * disagreements reported). Text match is deliberately fuzzy — the same question
 * is printed with small wording differences across the hit list, the model
 * paper and the guess papers.
 *
 * Exit 1 if any reference is unmatched.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const opt = (n: string, d: string) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const REFS = opt('--refs', '');
const VERBOSE = args.includes('--verbose');
if (!REFS) { console.error('usage: backtest_zoology.ts --refs <backtest_refs.json>'); process.exit(2); }

const norm = (s: string): string =>
    s.toLowerCase()
        .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
        .replace(/[^a-z0-9 ]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

/** content words, minus the question-form noise that varies between printings */
const STOP = new Set(['what', 'is', 'are', 'the', 'a', 'an', 'of', 'in', 'to', 'and', 'or', 'do', 'does',
    'you', 'your', 'give', 'write', 'explain', 'describe', 'define', 'mention', 'name', 'draw', 'short',
    'notes', 'note', 'on', 'with', 'help', 'neat', 'labelled', 'labeled', 'diagram', 'diagrams', 'its',
    'it', 'their', 'them', 'they', 'for', 'from', 'by', 'how', 'which', 'why', 'any', 'two', 'one',
    'example', 'examples', 'briefly', 'brief', 'account', 'out', 'this', 'that', 'about', 'at', 'as',
    'various', 'different', 'types', 'type', 'salient', 'features', 'feature', 'characters', 'discuss']);
const bag = (s: string): Set<string> => new Set(norm(s).split(' ').filter((w) => w.length > 2 && !STOP.has(w)));
const jaccard = (a: Set<string>, b: Set<string>): number => {
    if (!a.size || !b.size) return 0;
    let inter = 0;
    a.forEach((w) => { if (b.has(w)) inter++; });
    return inter / (a.size + b.size - inter);
};

type Entry = { qid: string; number: number; section: string; text: string; unit: number; bag: Set<string> };

const units = JSON.parse(readFileSync(join(ROOT, 'answer-book', 'units.json'), 'utf8'));
const bank: Entry[] = [];
for (const u of units.units) {
    if (u.subject !== 'zoology') continue;
    for (const e of u.questions) {
        if (!e.question_id) continue;
        bank.push({ qid: e.question_id, number: e.number, section: e.section, text: e.text, unit: u.number, bag: bag(e.text) });
    }
}
if (!bank.length) { console.error('no zoology entries in units.json — author the units first'); process.exit(1); }

const refs = JSON.parse(readFileSync(REFS, 'utf8'));
type Ref = { src: string; text: string; qno: number | null; section?: string };
const all: Ref[] = [];
for (const r of refs.hit_lists || []) all.push({ src: `hit:${r.list}${r.n}`, text: r.text, qno: r.qno ?? null, section: r.list });
for (const r of refs.model_paper || []) all.push({ src: `model:${r.section}`, text: r.text, qno: null, section: r.section === 'A' ? 'VSAQ' : r.section === 'B' ? 'SAQ' : 'LAQ' });
for (const r of refs.guess_papers || []) all.push({ src: `gp${r.paper}:${r.section}${r.n}`, text: r.text, qno: r.qno ?? null, section: r.section === 'A' ? 'VSAQ' : r.section === 'B' ? 'SAQ' : 'LAQ' });

const MATCH = 0.5;
const misses: { ref: Ref; best: number; bestQid: string }[] = [];
const numberMismatch: string[] = [];
let matched = 0;
const hitByQid = new Map<string, number>();

for (const ref of all) {
    const rb = bag(ref.text);
    let best = 0, bestE: Entry | null = null;
    for (const e of bank) {
        const s = jaccard(rb, e.bag);
        if (s > best) { best = s; bestE = e; }
    }
    // the printed global qno is a strong confirmation when it agrees
    const byNo = ref.qno != null ? bank.find((e) => e.number === ref.qno) : undefined;
    if (byNo && best >= MATCH && bestE && byNo.qid !== bestE.qid) {
        numberMismatch.push(`${ref.src} "${ref.text.slice(0, 60)}" → text matches ${bestE.qid} but printed qno ${ref.qno} is ${byNo.qid}`);
    }
    if (best >= MATCH && bestE) {
        matched++;
        hitByQid.set(bestE.qid, (hitByQid.get(bestE.qid) || 0) + 1);
        if (VERBOSE) console.log(`  ok ${ref.src.padEnd(12)} ${best.toFixed(2)} ${bestE.qid}`);
    } else {
        misses.push({ ref, best, bestQid: bestE ? bestE.qid : '—' });
    }
}

console.log(`zoology cards: ${bank.length} · references checked: ${all.length} · resolved: ${matched}`);
const never = bank.filter((e) => !hitByQid.has(e.qid));
if (never.length) {
    console.log(`\n${never.length} authored card(s) no reference points at (fine — the bank is wider than the papers):`);
    for (const e of never.slice(0, 25)) console.log(`  · ${e.qid}`);
    if (never.length > 25) console.log(`  … ${never.length - 25} more`);
}
if (numberMismatch.length) {
    console.log(`\n${numberMismatch.length} printed-number disagreement(s) — check the book, they are often its own typos:`);
    for (const m of numberMismatch) console.log(`  ~ ${m}`);
}
if (misses.length) {
    console.log(`\n${misses.length} UNRESOLVED reference(s) — each is a question the book asks and we may not answer:`);
    for (const m of misses) {
        console.log(`  - ${m.ref.src} [${m.ref.section || '?'}${m.ref.qno != null ? ' P?(' + m.ref.qno + ')' : ''}] "${m.ref.text.slice(0, 90)}"`);
        console.log(`      best ${m.best.toFixed(2)} → ${m.bestQid}`);
    }
    process.exit(1);
}
console.log('\nback-test PASS — every printed reference resolves to an authored card.');
