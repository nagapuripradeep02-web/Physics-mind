/**
 * merge_p2_units.mjs — the ONLY writer of Physics-II units into units.json.
 *
 *   node answer-book/tools/merge_p2_units.mjs <fragment-dir> [--write]
 *
 * Chapter agents write one manifest FRAGMENT each (a single unit object) to a
 * scratchpad directory; nobody but this script touches answer-book/units.json.
 * Parallel writes to the manifest collide, and the collision is silent — a
 * units.json listing cards whose files were never staged is a tree that fails
 * the build (the zoology scar, 2026-08-25).
 *
 * It refuses rather than repairs. Checks, in order:
 *   1. every fragment parses and is one unit object with subject "physics_2";
 *   2. unit numbers are 1..16, unique, and match the known chapter names;
 *   3. every entry's question_id has an authored file, and every authored
 *      ts_ipe_p2_ file is listed in exactly one entry (drift, both directions —
 *      the same rule build_answer_book.ts enforces, checked before writing so a
 *      bad merge never reaches the tree);
 *   4. no question_id collides with the existing bank (cross-subject ids are
 *      globally unique because the filename IS the id);
 *   5. refs are unique within a unit and sections are VSAQ/SAQ/LAQ;
 *   6. the file round-trips BYTE-IDENTICALLY when no physics_2 unit is present,
 *      so this script can only ever add or replace physics_2 units — it is
 *      structurally unable to touch physics, chemistry, maths, or botany.
 *
 * Without --write it reports and changes nothing.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const UNITS = join(ROOT, 'answer-book', 'units.json');
const QDIR = join(ROOT, 'answer-book', 'questions');
const PREFIX = 'ts_ipe_p2_';

const CHAPTERS = [
    'Waves',
    'Ray Optics and Optical Instruments',
    'Wave Optics',
    'Electric Charges and Fields',
    'Electric Potential and Capacitance',
    'Current Electricity',
    'Moving Charges and Magnetism',
    'Magnetism and Matter',
    'Electromagnetic Induction',
    'Alternating Current',
    'Electromagnetic Waves',
    'Dual Nature of Radiation and Matter',
    'Atoms',
    'Nuclei',
    'Semiconductor Electronics',
    'Communication System',
];

const args = process.argv.slice(2);
const FRAG_DIR = args.find((a) => !a.startsWith('--'));
const WRITE = args.includes('--write');
const problems = [];
const fail = (m) => problems.push(m);

if (!FRAG_DIR || !existsSync(FRAG_DIR)) {
    console.error(`\n✗ merge_p2_units: fragment directory "${FRAG_DIR ?? ''}" does not exist`);
    process.exit(1);
}

// ── read the manifest, and prove we can rewrite it losslessly ────────────────
const original = readFileSync(UNITS, 'utf8');
const manifest = JSON.parse(original);
const eol = original.includes('\r\n') ? '\r\n' : '\n';
const trailingNewline = /\n$/.test(original);

/** Serialise exactly the way the file on disk is serialised. */
function render(obj) {
    let s = JSON.stringify(obj, null, 2);
    if (eol === '\r\n') s = s.replace(/\n/g, '\r\n');
    return trailingNewline ? s + eol : s;
}

// The round-trip proof: re-rendering the manifest EXACTLY AS PARSED must
// reproduce the file byte for byte. That is what proves our serialiser agrees
// with whatever wrote the file, so replacing the physics_2 block cannot reformat
// another subject as a side effect.
//
// The first version of this compared `render(manifest minus physics_2)` to the
// original instead — which is only true before the FIRST merge. The moment
// units 3, 11 and 16 landed, the guard failed permanently and the tool could
// never merge a fourth unit. It failed safe (it refused rather than wrote), but
// a proof that expires after one use is not a proof. Caught 2026-08-28 by the
// agent writing the units 8 and 12 fragments, not by the tool's own author.
if (render(manifest) !== original) {
    console.error('\n✗ merge_p2_units: the round-trip proof FAILED — re-rendering units.json as parsed');
    console.error('  does not reproduce the file byte for byte. Writing would silently reformat');
    console.error('  other subjects. Fix the serialiser before merging anything.');
    process.exit(1);
}
const withoutP2 = { ...manifest, units: manifest.units.filter((u) => u.subject !== 'physics_2') };

// ── load the fragments ───────────────────────────────────────────────────────
const fragFiles = readdirSync(FRAG_DIR).filter((f) => f.endsWith('.json')).sort();
if (fragFiles.length === 0) {
    console.error(`\n✗ merge_p2_units: no .json fragments in ${FRAG_DIR}`);
    process.exit(1);
}

const units = [];
for (const f of fragFiles) {
    let u;
    try {
        u = JSON.parse(readFileSync(join(FRAG_DIR, f), 'utf8'));
    } catch (e) {
        fail(`${f}: invalid JSON — ${e.message}`);
        continue;
    }
    if (Array.isArray(u)) { fail(`${f}: a fragment is ONE unit object, not an array`); continue; }
    if (u.subject !== 'physics_2') { fail(`${f}: subject is "${u.subject}", must be "physics_2"`); continue; }
    if (!Number.isInteger(u.number) || u.number < 1 || u.number > CHAPTERS.length) {
        fail(`${f}: unit number ${u.number} is outside 1..${CHAPTERS.length}`); continue;
    }
    if (u.name !== CHAPTERS[u.number - 1]) {
        fail(`${f}: unit ${u.number} is named "${u.name}", the book calls it "${CHAPTERS[u.number - 1]}"`);
    }
    if (!Array.isArray(u.questions) || u.questions.length === 0) {
        fail(`${f}: unit ${u.number} has no questions`); continue;
    }
    const refs = new Set();
    for (const e of u.questions) {
        if (refs.has(e.ref)) fail(`${f}: unit ${u.number} duplicate ref "${e.ref}"`);
        refs.add(e.ref);
        if (!['VSAQ', 'SAQ', 'LAQ'].includes(e.section)) {
            fail(`${f}: unit ${u.number} ${e.ref}: section "${e.section}" is not VSAQ/SAQ/LAQ`);
        }
        if (e.stars !== 0) {
            fail(`${f}: unit ${u.number} ${e.ref}: stars must be 0 — this edition prints no star ranks`);
        }
        if (typeof e.text !== 'string' || e.text.trim() === '') {
            fail(`${f}: unit ${u.number} ${e.ref}: missing question text`);
        }
        if (e.question_id && !e.question_id.startsWith(PREFIX)) {
            fail(`${f}: unit ${u.number} ${e.ref}: "${e.question_id}" is not a ${PREFIX} id`);
        }
    }
    units.push(u);
}

const seenNumbers = new Map();
for (const u of units) {
    if (seenNumbers.has(u.number)) fail(`two fragments both claim unit ${u.number}`);
    seenNumbers.set(u.number, u);
}

// ── drift, both directions ───────────────────────────────────────────────────
const authored = new Set(
    readdirSync(QDIR).filter((f) => f.startsWith(PREFIX) && f.endsWith('.json'))
        .map((f) => f.replace(/\.json$/, ''))
);
const listed = new Map();
for (const u of units) {
    for (const e of u.questions) {
        if (!e.question_id) continue;              // a coming-soon card is legal
        if (listed.has(e.question_id)) {
            fail(`"${e.question_id}" is listed twice (units ${listed.get(e.question_id)} and ${u.number})`);
        }
        listed.set(e.question_id, u.number);
        if (!authored.has(e.question_id)) fail(`unit ${u.number}: "${e.question_id}" has no authored file`);
    }
}
for (const id of authored) {
    if (!listed.has(id)) fail(`authored file "${id}.json" is in no unit — the build will reject it`);
}

// ── cross-bank id collisions ─────────────────────────────────────────────────
const existing = new Set();
for (const u of manifest.units) {
    if (u.subject === 'physics_2') continue;
    for (const e of u.questions) if (e.question_id) existing.add(e.question_id);
}
for (const id of listed.keys()) {
    if (existing.has(id)) fail(`"${id}" already belongs to another subject`);
}

if (problems.length) {
    console.error(`\n✗ merge_p2_units: ${problems.length} problem(s) — nothing written\n`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
}

// ── merge ────────────────────────────────────────────────────────────────────
// physics_2 units sit at the END of the array, in unit order. The array order is
// the catalog's order within a subject, and every other subject's block is left
// exactly where it was.
units.sort((a, b) => a.number - b.number);
const merged = { ...manifest, units: [...withoutP2.units, ...units] };
const out = render(merged);

const counts = units.map((u) => {
    const by = (s) => u.questions.filter((e) => e.section === s).length;
    return { n: u.number, name: u.name, V: by('VSAQ'), S: by('SAQ'), L: by('LAQ'), total: u.questions.length };
});
console.log(`physics_2: ${units.length} unit(s), ${listed.size} authored card(s)\n`);
for (const c of counts) {
    console.log(`  ${String(c.n).padStart(2)} ${c.name.padEnd(38)} VSAQ ${String(c.V).padStart(2)} · SAQ ${String(c.S).padStart(2)} · LAQ ${String(c.L).padStart(2)}  = ${c.total}`);
}
const missing = CHAPTERS.map((n, i) => i + 1).filter((n) => !seenNumbers.has(n));
if (missing.length) console.log(`\n  not yet merged: unit(s) ${missing.join(', ')}`);

if (!WRITE) {
    console.log('\n(dry run — pass --write to update answer-book/units.json)');
    process.exit(0);
}
writeFileSync(UNITS, out, 'utf8');
console.log(`\n✓ answer-book/units.json updated (${manifest.units.length} → ${merged.units.length} units)`);
