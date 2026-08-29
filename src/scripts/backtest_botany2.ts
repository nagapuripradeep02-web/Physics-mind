/**
 * backtest_botany2.ts — Botany-II's substitute for the two checks that are structurally
 * impossible for this paper.
 *
 * There is ONE source book, the TSBIE Basic Learning Material in hand is physics-only,
 * and no Botany-II board paper is in the corpus — so neither the two-book union check nor
 * a real back-test can be run. What the book DOES have is its own cross-reference web:
 * five Model Guess Papers (book pp.60-64), each printing an "Ans-Page Index" column that
 * cites every question as `P <page>(<global qno>)`.
 *
 * Every citation must resolve to an authored card. An unresolved one is a question the
 * book asks and we do not answer.
 *
 *   npm run backtest:botany2
 */
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const QDIR = join(ROOT, 'answer-book', 'questions');
const refsPath = process.argv.includes('--refs')
    ? process.argv[process.argv.indexOf('--refs') + 1]
    : join(ROOT, 'answer-book', 'tools', 'botany2_wip', 'backtest_refs.json');

type Ref = { section: string; n: number; page: number; q: number; text: string };
const corpus = JSON.parse(readFileSync(refsPath, 'utf8')) as {
    papers: { id: string; page: number; refs: Ref[] }[];
};

// index every authored card by its printed GLOBAL question number
const byGlobal = new Map<number, { id: string; text: string; qtype: string }>();
const manifest = JSON.parse(readFileSync(join(ROOT, 'answer-book', 'units.json'), 'utf8'));
for (const u of manifest.units) {
    if (u.subject !== 'botany_2') continue;
    for (const e of u.questions) {
        if (!e.question_id) continue;
        byGlobal.set(e.number, { id: e.question_id, text: e.text, qtype: e.section });
    }
}
const onDisk = new Set(
    readdirSync(QDIR).filter((f) => f.startsWith('ts_ipe_b2_') && f.endsWith('.json'))
        .map((f) => f.replace(/\.json$/, ''))
);

// The book prints ONE question twice (globals 146 and 150, book p.49) with the same
// answer. One card is authored, so 150 resolves to the card authored from 146.
const DUPLICATES: Record<number, number> = { 150: 146 };

// Deliberate wording divergences: the card is worded differently from the guess paper ON
// PURPOSE, with the reason recorded on the card. Listed here explicitly so a NEW mismatch
// still fails the gate rather than being lost in a general tolerance.
const ALLOWED_DIVERGENCE: Record<number, string> = {
    116: 'the guess paper prints "agar gel"; the book\'s own LAQ (p.16) says "agarose gel '
       + 'electrophoresis", which is the correct name for the technique, so the card says agarose.',
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const overlap = (a: string, b: string): number => {
    const A = new Set(norm(a).split(' ').filter((w) => w.length > 3));
    const B = new Set(norm(b).split(' ').filter((w) => w.length > 3));
    if (!A.size) return 0;
    let hit = 0;
    A.forEach((w) => { if (B.has(w)) hit++; });
    return hit / A.size;
};

let total = 0, resolved = 0;
const problems: string[] = [];
const divergences: string[] = [];
for (const paper of corpus.papers) {
    for (const r of paper.refs) {
        total++;
        const g = DUPLICATES[r.q] ?? r.q;
        const card = byGlobal.get(g);
        if (!card) { problems.push(`${paper.id} ${r.section}${r.n}: P ${r.page}(${r.q}) resolves to NO authored card — "${r.text}"`); continue; }
        if (!onDisk.has(card.id)) { problems.push(`${paper.id} ${r.section}${r.n}: global ${g} -> ${card.id}, which has no file on disk`); continue; }
        const sim = overlap(r.text, card.text);
        if (sim >= 0.34) { resolved++; continue; }
        if (ALLOWED_DIVERGENCE[g]) {
            resolved++;
            divergences.push(`global ${g}: ${ALLOWED_DIVERGENCE[g]}`);
            continue;
        }
        problems.push(`${paper.id} ${r.section}${r.n}: global ${g} text mismatch (${(sim * 100).toFixed(0)}% overlap)\n      paper: "${r.text}"\n      card : "${card.text}"`);
    }
}

console.log(`Botany-II back-test — the book's own cross-reference web`);
console.log(`  ${corpus.papers.length} guess papers · ${total} citations · ${byGlobal.size} authored cards indexed`);
console.log(`  ${resolved}/${total} citations resolve to an authored card with matching text`);
if (divergences.length) {
    console.log(`\n${divergences.length} deliberate wording divergence(s), each recorded on its card:`);
    for (const d of [...new Set(divergences)]) console.log('  ~ ' + d);
}
if (problems.length) {
    console.log(`\n${problems.length} unresolved citation(s):`);
    for (const p of problems) console.log('  - ' + p);
    process.exit(1);
}
console.log('\nback-test PASS — every question the five guess papers set is answered.');
console.log('NOTE: this is NOT a board-paper back-test. No Telangana Botany-II paper is in');
console.log('the corpus and there is no second source book, so the two-book union check and');
console.log('the real back-test remain structurally impossible. Run both when either arrives.');
