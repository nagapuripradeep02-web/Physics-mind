/* Reusable manifest merge for the first-year 2026-27 campaign.
 *
 *   node merge_unit.mjs <plan.json>
 *
 * plan.json = { "subject": "physics", "unit": 10, "prefix": "ts_ipe_p1_flu_",
 *               "add": [ ["VSAQ","slug"], ["SAQ","slug"],
 *                        ["LAQ","slug","laq"], ["SAQ","slug","saq"], ... ] }
 *
 * A third element is a CUT KEY: the row points at that cut of the card rather than
 * at the card's root, which is how one question printed at two lengths becomes two
 * student-facing rows off one authored step list.
 *
 * Each new row's `text` is READ FROM the card (the cut's own question_text if it has
 * one, else the root's), so the manifest and the card can never disagree. New refs
 * continue the unit's own per-section numbering; existing rows keep theirs. Rows are
 * re-grouped VSAQ, SAQ, LAQ, rest, with existing rows of a section before the new
 * ones. Refuses on any mismatch.
 *
 * A unit that has never been authored carries ONE placeholder row with no
 * `question_id` -- the "questions coming" line the catalog renders. A manifest row
 * with no card behind it is a placeholder by definition, so the first real merge
 * DROPS every such row before it numbers the new ones. Otherwise a fully carded
 * chapter would keep printing "questions coming" above its own questions, and the
 * new refs would start at 2. Reported, never silent. */
import { readFileSync, writeFileSync, existsSync } from 'fs';

const MARKS = { VSAQ: 2, SAQ: 4, LAQ: 8 };
const plan = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const P = 'answer-book/units.json';
const j = JSON.parse(readFileSync(P, 'utf8'));

const unit = j.units.find((u) => (u.subject || 'physics') === plan.subject && u.number === plan.unit);
if (!unit) { console.error(`FAIL: ${plan.subject}-${plan.unit} not in the manifest`); process.exit(1); }

const problems = [];
const cards = new Map();
for (const [section, slug, cutKey] of plan.add) {
    const id = plan.prefix + slug;
    const p = `answer-book/questions/${id}.json`;
    if (!existsSync(p)) { problems.push(`${slug}: no card file`); continue; }
    const c = cards.get(slug) ?? JSON.parse(readFileSync(p, 'utf8'));
    cards.set(slug, c);
    if (c.question_id !== id) problems.push(`${slug}: question_id is "${c.question_id}"`);
    if (c.unit?.number !== plan.unit) problems.push(`${slug}: unit.number ${c.unit?.number}`);
    if (c.subject !== plan.subject) problems.push(`${slug}: subject ${c.subject}`);

    if (cutKey) {
        const cut = (c.cuts ?? []).find((x) => x.key === cutKey);
        if (!cut) { problems.push(`${slug}: no cut named "${cutKey}"`); continue; }
        if (cut.qtype !== section) problems.push(`${slug}/${cutKey}: qtype ${cut.qtype}, expected ${section}`);
        if (cut.marks_total !== MARKS[section]) problems.push(`${slug}/${cutKey}: ${cut.marks_total} marks, expected ${MARKS[section]}`);
        if (!(cut.question_text || c.question_text)) problems.push(`${slug}/${cutKey}: no question_text anywhere`);
    } else {
        if (c.qtype !== section) problems.push(`${slug}: qtype ${c.qtype}, expected ${section}`);
        if (c.marks_total !== MARKS[section]) problems.push(`${slug}: ${c.marks_total} marks, expected ${MARKS[section]}`);
        if (!c.question_text) problems.push(`${slug}: no question_text`);
    }
}
if (problems.length) { console.error('FAIL:\n  ' + problems.join('\n  ')); process.exit(1); }

const placeholders = unit.questions.filter((e) => !e.question_id);
unit.questions = unit.questions.filter((e) => e.question_id);

const existingRefs = new Set(unit.questions.map((e) => e.ref));
const existingKeys = new Set(unit.questions.map((e) => `${e.question_id}|${e.cut ?? ''}`).filter((k) => !k.startsWith('undefined')));
const next = {};
for (const s of ['VSAQ', 'SAQ', 'LAQ']) {
    const tag = s.toLowerCase();
    next[s] = Math.max(0, ...unit.questions.filter((e) => e.section === s)
        .map((e) => Number(String(e.ref).replace(tag, '')) || 0));
}

const added = { VSAQ: [], SAQ: [], LAQ: [] };
for (const [section, slug, cutKey] of plan.add) {
    const n = ++next[section];
    const ref = section.toLowerCase() + n;
    const id = plan.prefix + slug;
    const c = cards.get(slug);
    const cut = cutKey ? c.cuts.find((x) => x.key === cutKey) : null;
    if (existingRefs.has(ref)) { console.error(`FAIL: ref ${ref} already exists`); process.exit(1); }
    if (existingKeys.has(`${id}|${cutKey ?? ''}`)) { console.error(`FAIL: ${id}${cutKey ? ' cut ' + cutKey : ''} already listed`); process.exit(1); }
    existingRefs.add(ref);
    existingKeys.add(`${id}|${cutKey ?? ''}`);
    const row = {
        ref, section, number: n, stars: 0,
        text: (cut && cut.question_text) || c.question_text,
        question_id: id,
    };
    if (cutKey) row.cut = cutKey;
    row.source = 'chaitanya_fastrack';
    added[section].push(row);
}

const of = (s) => unit.questions.filter((e) => e.section === s);
const rest = unit.questions.filter((e) => !['VSAQ', 'SAQ', 'LAQ'].includes(e.section));
unit.questions = [
    ...of('VSAQ'), ...added.VSAQ,
    ...of('SAQ'), ...added.SAQ,
    ...of('LAQ'), ...added.LAQ,
    ...rest,
];

writeFileSync(P, JSON.stringify(j, null, 2).replace(/\n/g, '\r\n') + '\r\n');
const n = (s) => added[s].length;
const cutRows = plan.add.filter((a) => a[2]).length;
if (placeholders.length) {
    console.log(`dropped ${placeholders.length} placeholder row(s) with no card: ` +
        placeholders.map((e) => `${e.ref} ("${e.text}")`).join(', '));
}
console.log(`${plan.subject}-${plan.unit}: +${n('VSAQ')} VSAQ, +${n('SAQ')} SAQ, +${n('LAQ')} LAQ` + (cutRows ? ` (${cutRows} of them point at a cut)` : ''));
console.log(`rows now ${unit.questions.length}: ` + unit.questions.map((e) => e.ref + (e.cut ? `[${e.cut}]` : '')).join(' '));
