/**
 * backtest_ipe_papers — diff the bank against real board papers, question by question.
 *
 * `docs/patterns/answer_book.md` records why this exists:
 *
 *   "Back-testing the archetype set is not back-testing the OUTPUT. When a real
 *    paper is in the corpus, diff the sweep's authored list against that paper
 *    question by question. 'Everything asked falls inside the grid' is a
 *    statement about the grid; it says nothing about what you actually wrote."
 *
 * It re-derives every claim in answer-book/papers/matches.json from the bank
 * itself, so the mapping cannot quietly rot as cards are renamed, retired or
 * re-tagged.
 *
 * WHAT FAILS (exit 1)
 *   1. a corpus question or part with no row in matches.json
 *   2. a row resolving to a card that has no file, or is in no unit
 *   3. a row whose `cut` does not exist on that card
 *   4. `unbuilt` claimed for a unit that IS in units.json  (hiding a real gap)
 *   5. `gap` claimed for a unit that is NOT in units.json  (mislabelled)
 *   6. a card row whose card does not actually carry that paper's (board, year)
 *   7. a ts_ipe appearance in a corpus year that no row justifies (invented tag)
 *   8. a card row whose manifest entry is still source:"enumerated"
 *
 * WHAT REPORTS (exit 0)
 *   - `gap` rows: the authoring queue, grouped by unit
 *   - `unbuilt` rows: units that do not exist yet, ranked by how often the
 *     papers examine them. An absent unit is a known, counted state — never an
 *     error. Making it one would give us a gate nobody can keep green, and the
 *     six missing units are exactly what this ranking is for.
 *
 * `--strict` additionally fails when the `gap` queue is non-empty. That is the
 * release check, not the everyday one.
 */
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..');
const BOOK = join(ROOT, 'answer-book');
const QUESTIONS = join(BOOK, 'questions');
const PAPERS = join(BOOK, 'papers');

const STRICT = process.argv.includes('--strict');

type Row = {
    paper_id: string; year: number; q_no: number; part?: string;
    section: string; qtype: string; text: string;
    resolution: 'card' | 'gap' | 'unbuilt';
    question_id?: string; cut?: string; unit?: number; unit_name?: string;
    plan?: string; note?: string;
};

const failures: string[] = [];
const fail = (m: string) => failures.push(m);

// --- load -----------------------------------------------------------------
if (!existsSync(join(PAPERS, 'matches.json'))) {
    console.error('✗ answer-book/papers/matches.json is missing — nothing to back-test against.');
    process.exit(1);
}
const matches = JSON.parse(readFileSync(join(PAPERS, 'matches.json'), 'utf8'));
const rows: Row[] = matches.rows;

const paperFiles = readdirSync(PAPERS).filter((f) => /^ts_ipe_p1_\d{4}_\d{2}\.json$/.test(f)).sort();
const papers = paperFiles.map((f) => JSON.parse(readFileSync(join(PAPERS, f), 'utf8')));

const units = JSON.parse(readFileSync(join(BOOK, 'units.json'), 'utf8'));
const physUnits = units.units.filter((u: any) => !u.subject);
const builtUnits = new Set<number>(physUnits.map((u: any) => u.number));

const entriesByQid = new Map<string, any[]>();
for (const u of physUnits) {
    for (const e of u.questions) {
        if (!e.question_id) continue;
        const l = entriesByQid.get(e.question_id) || [];
        l.push({ unit: u.number, ...e });
        entriesByQid.set(e.question_id, l);
    }
}

const cards = new Map<string, any>();
for (const f of readdirSync(QUESTIONS).filter((f) => f.startsWith('ts_ipe_p1_') && f.endsWith('.json'))) {
    const c = JSON.parse(readFileSync(join(QUESTIONS, f), 'utf8'));
    cards.set(c.question_id, c);
}

// --- 1. the mapping must be exhaustive ------------------------------------
const rowKey = (r: Row) => `${r.year}:${r.q_no}${r.part || ''}`;
const seen = new Set(rows.map(rowKey));
let slots = 0;
for (const p of papers) {
    for (const q of p.questions) {
        const parts = q.parts ? q.parts.map((x: any) => x.part) : [null];
        for (const part of parts) {
            slots++;
            const k = `${p.year}:${q.q_no}${part || ''}`;
            if (!seen.has(k)) fail(`corpus slot ${k} has no row in matches.json — a half-processed paper is exactly what this file exists to prevent`);
        }
    }
}
for (const r of rows) {
    const p = papers.find((x) => x.paper_id === r.paper_id);
    if (!p) fail(`row ${rowKey(r)} names paper_id "${r.paper_id}", which is not in the corpus`);
}

// --- 2/3/8. card rows resolve, and are not still "predicted" --------------
const corpusYears = new Set<number>(papers.map((p) => p.year));
const justified = new Map<string, Set<number>>(); // question_id -> years the corpus justifies

for (const r of rows.filter((x) => x.resolution === 'card')) {
    const qid = r.question_id;
    if (!qid) { fail(`row ${rowKey(r)} resolves to a card but names no question_id`); continue; }
    const card = cards.get(qid);
    if (!card) { fail(`row ${rowKey(r)} → "${qid}" has no authored file`); continue; }
    const entries = entriesByQid.get(qid);
    if (!entries?.length) { fail(`row ${rowKey(r)} → "${qid}" is in no physics unit of units.json`); continue; }
    if (r.cut && !entries.some((e) => e.cut === r.cut)) {
        fail(`row ${rowKey(r)} → "${qid}" has no manifest entry for cut "${r.cut}"`);
    }
    for (const e of entries) {
        if (e.source === 'enumerated') {
            fail(`row ${rowKey(r)} → "${qid}" is still source:"enumerated" but a real paper asked it — flip it to "ts_paper" (e2e :642 and Vidi both break otherwise)`);
        }
    }
    if (!justified.has(qid)) justified.set(qid, new Set());
    justified.get(qid)!.add(r.year);
}

// --- 4/5. unit labels are honest ------------------------------------------
for (const r of rows) {
    if (r.resolution === 'unbuilt' && r.unit !== undefined && builtUnits.has(r.unit)) {
        fail(`row ${rowKey(r)} is marked "unbuilt" for unit ${r.unit}, but that unit IS in units.json — a real gap is being hidden`);
    }
    if (r.resolution === 'gap' && r.unit !== undefined && !builtUnits.has(r.unit)) {
        fail(`row ${rowKey(r)} is marked "gap" for unit ${r.unit}, which is not in units.json — it should be "unbuilt"`);
    }
    if (r.resolution === 'gap' && !r.plan) {
        fail(`row ${rowKey(r)} is a gap with no plan — say "author" or "defer" (with a reason), never leave it silent`);
    }
}

// --- 6. every card row is actually tagged ---------------------------------
for (const [qid, years] of justified) {
    const card = cards.get(qid);
    if (!card) continue;
    const have = new Set<number>((card.appearances || [])
        .filter((a: any) => (a.board || 'ts_ipe') === 'ts_ipe')
        .map((a: any) => a.year));
    for (const y of years) {
        if (!have.has(y)) fail(`"${qid}" should carry a ts_ipe ${y} appearance (the corpus proves it) but does not — run npm run tag:appearances -- --write`);
    }
}

// --- 7. no invented tags --------------------------------------------------
for (const [qid, card] of cards) {
    for (const a of card.appearances || []) {
        if ((a.board || 'ts_ipe') !== 'ts_ipe') continue;
        if (!corpusYears.has(a.year)) continue; // 2004-2012 book years are outside the corpus
        if (!justified.get(qid)?.has(a.year)) {
            fail(`"${qid}" claims a ts_ipe ${a.year} appearance that no matches.json row justifies — an invented tag`);
        }
    }
}

// --- report ---------------------------------------------------------------
const pad = (n: number, w = 2) => String(n).padStart(w);
console.log(`\nTS IPE Physics Paper-I back-test — ${papers.length} papers, ${slots} question slots\n`);

const cardRows = rows.filter((r) => r.resolution === 'card');
const gapRows = rows.filter((r) => r.resolution === 'gap');
const unbuiltRows = rows.filter((r) => r.resolution === 'unbuilt');
const distinctCards = new Set(cardRows.map((r) => r.question_id)).size;

console.log(`  answered by the bank : ${pad(cardRows.length, 3)} slots across ${distinctCards} cards`);
console.log(`  gap (unit is built)  : ${pad(gapRows.length, 3)} slots`);
console.log(`  unbuilt unit         : ${pad(unbuiltRows.length, 3)} slots`);
const covered = ((cardRows.length / slots) * 100).toFixed(1);
console.log(`  coverage             : ${covered}%\n`);

const group = (rs: Row[]) => {
    const m = new Map<number, { name: string; slots: number; texts: Set<string> }>();
    for (const r of rs) {
        const u = r.unit ?? 0;
        if (!m.has(u)) m.set(u, { name: r.unit_name || '?', slots: 0, texts: new Set() });
        const g = m.get(u)!;
        g.slots++;
        g.texts.add(r.text);
    }
    return [...m.entries()].sort((a, b) => b[1].slots - a[1].slots);
};

if (gapRows.length) {
    console.log('  THE AUTHORING QUEUE — the unit exists, nothing answers the question:');
    for (const [u, g] of group(gapRows)) {
        console.log(`    unit ${pad(u)} ${g.name.padEnd(34)} ${pad(g.slots)} slots · ${g.texts.size} distinct`);
    }
    console.log('');
}

if (unbuiltRows.length) {
    console.log('  UNITS NOT BUILT YET — ranked by how often these papers examine them:');
    for (const [u, g] of group(unbuiltRows)) {
        console.log(`    unit ${pad(u)} ${g.name.padEnd(34)} ${pad(g.slots)} slots · ${g.texts.size} distinct`);
    }
    console.log('');
}

const inferred = papers.filter((p) => p.date_confidence === 'inferred');
if (inferred.length) {
    console.log(`  NOTE — ${inferred.length} paper(s) carry an INFERRED year; every tag from them is a claim:`);
    for (const p of inferred) console.log(`    ${p.paper_id}: ${p.provenance.year_source.split('.')[0]}.`);
    console.log('');
}

if (failures.length) {
    console.error('✗ backtest:physics failed\n');
    for (const f of failures) console.error(`  ${f}`);
    console.error('');
    process.exit(1);
}

if (STRICT && gapRows.length) {
    console.error(`✗ --strict: ${gapRows.length} slots in BUILT units still have no card.\n`);
    process.exit(1);
}

console.log('✓ every mapping resolves, every tag is justified, nothing is hidden\n');
