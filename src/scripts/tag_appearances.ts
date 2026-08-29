/**
 * tag_appearances — write board-paper provenance into the cards.
 *
 * Reads the reviewed mapping at answer-book/papers/matches.json and, for every
 * row that resolves to a card, adds `{ year, q_no, board }` to that card's
 * `appearances[]`.
 *
 * Three properties this script is built around, each of which cost something to
 * learn:
 *
 * 1. IT PRESERVES LINE ENDINGS. 18 of the 198 physics cards are CRLF (the whole
 *    Unit-4 vector/projectile block) and so is units.json. A writer that emits
 *    "\n" turns each of those into a whole-file diff, and those files hold the
 *    most-examined questions in the book. The EOL is read off the file and put
 *    back.
 *
 * 2. IT NEVER OVERWRITES. Existing appearances — the Fastrack's printed years,
 *    the AP-2026 pass — are left exactly as they are. The idempotency key is
 *    (board, year): re-running adds nothing. A row proposing a (board, year)
 *    that already exists with a DIFFERENT q_no is a hard failure, not a silent
 *    rewrite, because that is how provenance quietly goes wrong.
 *
 * 3. IT REFUSES TO HALF-DO THE `enumerated` PROBLEM. e2e/answer_book.spec.ts:642
 *    fails when an entry with source:"enumerated" shows an asked chip, and
 *    notebook.js:3532 tells Vidi such a question has "no exam history to report"
 *    and then prints the Asked line anyway — the dangling-pointer defect the
 *    round-2 graders indicted. So if any target entry is still `enumerated`,
 *    this script stops and names them rather than writing a red build.
 *
 * Dry run by default. `--write` performs it.
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..');
const BOOK = join(ROOT, 'answer-book');
const QUESTIONS = join(BOOK, 'questions');
const PAPERS = join(BOOK, 'papers');
const UNITS = join(BOOK, 'units.json');

const WRITE = process.argv.includes('--write');

type Appearance = { year: number; q_no?: number; board?: 'ts_ipe' | 'ap_ipe' };
type Row = {
    paper_id: string; year: number; q_no: number; part?: string;
    resolution: 'card' | 'gap' | 'unbuilt';
    question_id?: string; cut?: string; unit?: number; text: string;
};

function fail(msg: string): never {
    console.error(`\n✗ tag:appearances failed\n  ${msg}\n`);
    process.exit(1);
}

/** Read a JSON file, remembering how its lines ended. */
function readKeepingEol(path: string): { data: any; crlf: boolean; trailingNewline: boolean } {
    const raw = readFileSync(path, 'utf8');
    return {
        data: JSON.parse(raw),
        crlf: raw.includes('\r\n'),
        trailingNewline: raw.endsWith('\n') || raw.endsWith('\r\n'),
    };
}

/** Write it back the way it was found. */
function writeKeepingEol(path: string, data: any, meta: { crlf: boolean; trailingNewline: boolean }): void {
    let out = JSON.stringify(data, null, 2);
    if (meta.trailingNewline) out += '\n';
    if (meta.crlf) out = out.replace(/\n/g, '\r\n');
    writeFileSync(path, out, 'utf8');
}

// --- load -----------------------------------------------------------------
const matches = JSON.parse(readFileSync(join(PAPERS, 'matches.json'), 'utf8'));
const rows: Row[] = matches.rows;

const unitsMeta = readKeepingEol(UNITS);
const physUnits = unitsMeta.data.units.filter((u: any) => !u.subject);

const entriesByQid = new Map<string, any[]>();
for (const u of physUnits) {
    for (const e of u.questions) {
        if (!e.question_id) continue;
        const list = entriesByQid.get(e.question_id) || [];
        list.push(e);
        entriesByQid.set(e.question_id, list);
    }
}

const cardFiles = new Set(readdirSync(QUESTIONS).filter((f) => f.endsWith('.json')));

// --- pre-flight -----------------------------------------------------------
const cardRows = rows.filter((r) => r.resolution === 'card');
if (!cardRows.length) fail('matches.json holds no rows that resolve to a card');

const enumerated: string[] = [];
for (const r of cardRows) {
    const qid = r.question_id!;
    if (!cardFiles.has(`${qid}.json`)) fail(`${r.year} q${r.q_no}: question_id "${qid}" has no authored file`);
    const entries = entriesByQid.get(qid);
    if (!entries?.length) fail(`${r.year} q${r.q_no}: "${qid}" is not listed in any physics unit of units.json`);
    if (r.cut && !entries.some((e) => e.cut === r.cut)) {
        fail(`${r.year} q${r.q_no}: "${qid}" has no manifest entry for cut "${r.cut}"`);
    }
    for (const e of entries) {
        if (e.source === 'enumerated') enumerated.push(`  unit ${e.ref}  ${qid}`);
    }
}
if (enumerated.length) {
    fail(
        `${enumerated.length} manifest entries are still source:"enumerated" but the corpus proves they WERE asked.\n` +
        `  Tagging them would fail e2e "board tags render" and make Vidi contradict itself.\n` +
        `  Flip them to source:"ts_paper" first.\n${[...new Set(enumerated)].join('\n')}`,
    );
}

// --- plan -----------------------------------------------------------------
type Plan = { qid: string; add: Appearance[]; already: Appearance[] };
const plans = new Map<string, Plan>();

for (const r of cardRows) {
    const qid = r.question_id!;
    const plan = plans.get(qid) || { qid, add: [], already: [] };
    // one appearance per (board, year) per card, even when two parts of one
    // Section-C question both resolve to it
    if (!plan.add.some((a) => a.year === r.year)) {
        plan.add.push({ year: r.year, q_no: r.q_no, board: 'ts_ipe' });
    }
    plans.set(qid, plan);
}

let toWrite = 0;
let noop = 0;
const conflicts: string[] = [];

for (const plan of plans.values()) {
    const path = join(QUESTIONS, `${plan.qid}.json`);
    const { data } = readKeepingEol(path);
    const existing: Appearance[] = data.appearances || [];
    const keep: Appearance[] = [];
    for (const a of plan.add) {
        const hit = existing.find((e) => (e.board || 'ts_ipe') === 'ts_ipe' && e.year === a.year);
        if (hit) {
            if (hit.q_no !== undefined && hit.q_no !== a.q_no) {
                conflicts.push(`  ${plan.qid}: ts_ipe ${a.year} already recorded as q${hit.q_no}, corpus says q${a.q_no}`);
            }
            noop++;
        } else {
            keep.push(a);
        }
    }
    plan.already = existing;
    plan.add = keep;
    toWrite += keep.length;
}

if (conflicts.length) fail(`existing appearances disagree with the corpus — resolve by hand, never overwrite:\n${conflicts.join('\n')}`);

// --- report ---------------------------------------------------------------
console.log(`${WRITE ? 'WRITING' : 'DRY RUN'} — ${plans.size} cards, ${toWrite} new appearances (${noop} already present)\n`);
for (const plan of [...plans.values()].sort((a, b) => a.qid.localeCompare(b.qid))) {
    const years = plan.add.map((a) => `${a.year} q${a.q_no}`).join(', ');
    const prior = plan.already.length ? `  (keeps ${plan.already.length} existing)` : '';
    console.log(`  ${plan.qid}`);
    console.log(`      + ${years || '(nothing new)'}${prior}`);
}

if (!WRITE) {
    console.log('\nNothing written. Re-run with --write to apply.');
    process.exit(0);
}

// --- write ----------------------------------------------------------------
const BOARD_RANK: Record<string, number> = { ts_ipe: 0, ap_ipe: 1 };
let filesTouched = 0;

for (const plan of plans.values()) {
    if (!plan.add.length) continue;
    const path = join(QUESTIONS, `${plan.qid}.json`);
    const meta = readKeepingEol(path);
    const card = meta.data;
    card.appearances = [...(card.appearances || []), ...plan.add];
    // Sort only the arrays we touch: TS before AP, newest year first — the same
    // order askedLine() renders. Untouched cards keep whatever order they had.
    card.appearances.sort((a: Appearance, b: Appearance) => {
        const br = BOARD_RANK[a.board || 'ts_ipe'] - BOARD_RANK[b.board || 'ts_ipe'];
        return br !== 0 ? br : b.year - a.year;
    });
    writeKeepingEol(path, card, meta);
    filesTouched++;
}

console.log(`\n✓ ${toWrite} appearances written across ${filesTouched} cards (line endings preserved)`);
