/**
 * backtest_zoology2.ts — Zoology-II's substitute for the two checks that are
 * structurally impossible for this paper.
 *
 * There is ONE source book, no second Senior Zoology book, and no Telangana
 * Zoology-II board paper in the corpus — so neither the two-book union check nor
 * a real back-test can be run. What the book DOES have is its own cross-reference
 * web: five Model Guess Papers (book pp.75-79), each printing an "Ans-Page Index"
 * column that cites every question it sets as `P <page>(<global qno>)`.
 *
 * Every citation must resolve to an authored card. An unresolved one is a question
 * the book asks and we do not answer — which is exactly how globals 172 and 175
 * (the Star Questions Plus section, book pp.61-68) were found after the first
 * authoring pass had declared the paper complete.
 *
 *   npm run backtest:zoology2
 */
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const QDIR = join(ROOT, 'answer-book', 'questions');
const refsPath = process.argv.includes('--refs')
    ? process.argv[process.argv.indexOf('--refs') + 1]
    : join(ROOT, 'answer-book', 'tools', 'zoology2_wip', 'backtest_refs.json');

type Ref = { section: string; n: number; page: number; q: number; text: string };
const corpus = JSON.parse(readFileSync(refsPath, 'utf8')) as {
    papers: { id: string; page: number; refs: Ref[] }[];
};

// index every authored card by the book's GLOBAL question number
const byGlobal = new Map<number, { id: string; text: string; section: string }>();
const manifest = JSON.parse(readFileSync(join(ROOT, 'answer-book', 'units.json'), 'utf8'));
for (const u of manifest.units) {
    if (u.subject !== 'zoology_2') continue;
    for (const e of u.questions) {
        if (!e.question_id) continue;
        byGlobal.set(e.number, { id: e.question_id, text: e.text, section: e.section });
    }
}
const onDisk = new Set(
    readdirSync(QDIR)
        .filter((f) => f.startsWith('ts_ipe_z2_') && f.endsWith('.json'))
        .map((f) => f.replace(/\.json$/, ''))
);

/**
 * The book miscites ONE question. Its VSAQ hit list and Model Paper-1 both cite
 * "Name the valves that guard the left and right atrioventricular apertures" as
 * global 61, but the answer section (book p.48) numbers it 63 — 61 there is the
 * open/closed circulation question on the same page. The answer section is the
 * authoritative numbering, since `number` in units.json is defined as that; the
 * citation is the book's own typo. Adjudicated, not papered over: the card exists
 * either way, so nothing is missing.
 */
const KNOWN_MISCITES = new Map<number, { actual: number; why: string }>([
    [61, { actual: 63, why: "book cites the AV-valves question as 61; its answer section numbers it 63" }],
]);

/**
 * Resolving is NOT enough. The book's miscitation of the AV-valves question as 61
 * still RESOLVES — to the open/closed circulation card, which happens to be 61 in
 * the answer section. A back-test that only asked "does this number exist?" would
 * pass while the paper's question went unanswered. So every citation also has to
 * agree with the card it lands on: at least one distinctive word of the cited
 * question must appear in the resolved card's text.
 */
const STOP = new Set(['the', 'of', 'and', 'a', 'an', 'in', 'to', 'is', 'are', 'what', 'name',
    'write', 'define', 'give', 'between', 'from', 'with', 'for', 'its', 'their', 'any', 'two',
    'four', 'man', 'human', 'beings', 'vs', 'short', 'note', 'notes', 'describe', 'explain']);
const words = (s: string): Set<string> =>
    new Set(s.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/)
        .filter((w) => w.length > 3 && !STOP.has(w)));
const agrees = (refText: string, cardText: string): boolean => {
    const a = words(refText), b = words(cardText);
    for (const w of a) {
        if (b.has(w)) return true;
        for (const x of b) if (x.startsWith(w.slice(0, 5)) || w.startsWith(x.slice(0, 5))) return true;
    }
    return false;
};

let checked = 0;
const missing: { paper: string; ref: Ref }[] = [];
const mismatched: { paper: string; ref: Ref; got: string }[] = [];
const miscited: string[] = [];
const seen = new Set<number>();

for (const paper of corpus.papers) {
    for (const ref of paper.refs) {
        checked++;
        seen.add(ref.q);
        let hit = byGlobal.get(ref.q);

        // the cited number exists but names a DIFFERENT question → a miscitation
        if (hit && !agrees(ref.text, hit.text)) {
            const fix = KNOWN_MISCITES.get(ref.q);
            const alt = fix ? byGlobal.get(fix.actual) : undefined;
            if (fix && alt && agrees(ref.text, alt.text)) {
                hit = alt;
                miscited.push(`${paper.id} q${ref.n} "${ref.text}" — ${fix.why}`);
            } else {
                mismatched.push({ paper: paper.id, ref, got: hit.text });
                continue;
            }
        }
        if (!hit) {
            const fix = KNOWN_MISCITES.get(ref.q);
            if (fix && byGlobal.get(fix.actual)) {
                hit = byGlobal.get(fix.actual);
                miscited.push(`${paper.id} q${ref.n} "${ref.text}" — ${fix.why}`);
            }
        }
        if (!hit || !onDisk.has(hit.id)) {
            missing.push({ paper: paper.id, ref });
        }
    }
}

console.log(`${corpus.papers.length} model papers · ${checked} citations · ${seen.size} distinct questions`);
if (miscited.length) {
    console.log('\nadjudicated miscitations (the book\'s own, not ours):');
    for (const m of miscited) console.log(`  ~ ${m}`);
}
if (mismatched.length) {
    console.log(`\n${mismatched.length} citation(s) resolved to the WRONG question:`);
    for (const m of mismatched) {
        console.log(`  - ${m.paper} ${m.ref.section} q${m.ref.n}: P${m.ref.page}(${m.ref.q}) cites "${m.ref.text}"`);
        console.log(`      but ${m.ref.q} is "${m.got}"`);
    }
}
if (missing.length) {
    console.log(`\n${missing.length} UNRESOLVED citation(s) — questions the book sets and we do not answer:`);
    for (const m of missing) {
        console.log(`  - ${m.paper} ${m.ref.section} q${m.ref.n}: P${m.ref.page}(${m.ref.q}) "${m.ref.text}"`);
    }
}
if (missing.length || mismatched.length) process.exit(1);
console.log('\nback-test PASS — every question the five model papers set is answered.');
console.log('NOTE: this is NOT a board-paper back-test. No Telangana Zoology-II paper is in');
console.log('the corpus and there is no second source book, so the two-book union check and');
console.log('the real back-test remain structurally impossible. Run both when either arrives.');
