/** Unit 8 (Ecology and Environment, zoology) self-check: schema, authoring bar,
 *  line length, the build's Rule-41 idiom gate, a personification sweep, and the
 *  manifest <-> file cross-check. Run from the repo root:
 *    npx tsx answer-book/tools/zoology_wip/ee/validate_ee.ts
 */
import fs from 'fs';
import path from 'path';
import { answerBookQuestionSchema } from '../../../../src/schemas/answerBook';
import { idiomsIn } from '../../../../src/lib/answerBook/vidiChecks';

const PREFIX = 'ts_ipe_z1_ee_';
const dir = path.resolve('answer-book/questions');
const FRAG = 'C:/Users/PRADEEEP/AppData/Local/Temp/claude/C--Tutor-physics-mind/'
    + '40aee229-2ba0-40be-831f-912f984d9e01/scratchpad/zoology/unit_08.json';

// Rule 41: no personification / metaphor. These are WARNINGS to eyeball, not
// hard fails — "the tide", "grip of a clamp" can be literal in another unit.
const SUSPECT = ['wants', 'want to', 'tries', 'decides', 'cleverly', 'hides',
    'escapes', 'strategy', 'waits for', 'fate', 'budges', 'lurches', 'rides on',
    'gives back', 'all yours', 'knows', 'cares', 'loves', 'clever', 'nature\'s way',
    'seeks', 'chooses', 'prefers to', 'struggles'];

const files = fs.readdirSync(dir).filter((f) => f.startsWith(PREFIX) && f.endsWith('.json')).sort();
let bad = 0, warn = 0;
const seen = new Set<string>();
const counts: Record<string, number> = { VSAQ: 0, SAQ: 0, LAQ: 0 };
let figures = 0;

for (const f of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const r = answerBookQuestionSchema.safeParse(raw);
    if (!r.success) {
        bad++; console.log('FAIL schema', f);
        console.log(JSON.stringify(r.error.issues, null, 1));
        continue;
    }
    if (raw.question_id !== f.replace(/\.json$/, '')) { bad++; console.log('FAIL id/filename', f); }
    seen.add(raw.question_id);
    counts[raw.qtype]++;

    const probs: string[] = [];
    raw.answer.steps.forEach((s: any) => {
        for (const k of ['why', 'memory_tip', 'margin_note']) if (!s[k]) probs.push(`${s.id}: no ${k}`);
        if (!s.common_mistakes?.length) probs.push(`${s.id}: no common_mistakes`);
        if (s.marks > 0 && !s.mark_note) probs.push(`${s.id}: no mark_note`);
        (s.lines || []).forEach((l: any) => {
            const t = typeof l === 'string' ? l : l.text;
            if (t.length > 52) probs.push(`${s.id}: line ${t.length} chars "${t}"`);
        });
        if (s.kind === 'diagram') figures++;
    });
    if (!raw.insider_note) probs.push('no insider_note');
    if (!raw.verification.needs_teacher_verification) probs.push('needs_teacher_verification not set');
    if (raw.unit.number !== 8) probs.push(`unit ${raw.unit.number}`);
    if (raw.subject !== 'zoology') probs.push(`subject ${raw.subject}`);

    // every reader-facing string
    const strings: string[] = [raw.question_text, ...raw.answer.page_header];
    raw.answer.steps.forEach((s: any) => {
        strings.push(s.label);
        (s.lines || []).forEach((l: any) => strings.push(typeof l === 'string' ? l : l.text));
        (s.figure?.elements || []).forEach((e: any) => {
            if (e.type === 'label') strings.push(e.text);
            if (e.type === 'pause' && e.caption) strings.push(e.caption);
        });
    });
    for (const t of strings) {
        const hit = idiomsIn(t);
        if (hit.length) { probs.push(`IDIOM ${hit.join(',')} in "${t}"`); }
    }
    const soft: string[] = [];
    for (const t of strings) {
        for (const w of SUSPECT) {
            if (new RegExp('\\b' + w.replace(/'/g, "'") + '\\b', 'i').test(t)) soft.push(`${w} -> "${t}"`);
        }
    }

    if (probs.length) { bad++; console.log('FAIL', f); probs.forEach((p) => console.log('     ', p)); }
    else if (soft.length) { warn++; console.log('warn', f); soft.forEach((p) => console.log('     ', p)); }
}

// manifest <-> files, both directions
const frag = JSON.parse(fs.readFileSync(FRAG, 'utf8'));
const inFrag = new Set<string>(frag.questions.map((q: any) => q.question_id));
for (const id of seen) if (!inFrag.has(id)) { bad++; console.log('FAIL not in manifest:', id); }
for (const id of inFrag) if (!seen.has(id)) { bad++; console.log('FAIL manifest entry has no file:', id); }
const nums = frag.questions.map((q: any) => q.number);
if (new Set(nums).size !== nums.length) { bad++; console.log('FAIL duplicate global numbers'); }
for (const q of frag.questions) {
    if (q.stars !== 0) { bad++; console.log('FAIL stars != 0', q.question_id); }
    if (q.ref !== q.section.toLowerCase() + q.number) { bad++; console.log('FAIL ref/number', q.question_id); }
}

console.log(`\n${files.length} files · VSAQ ${counts.VSAQ} · SAQ ${counts.SAQ} · LAQ ${counts.LAQ}`
    + ` · ${figures} diagram steps · manifest ${frag.questions.length}`);
console.log(bad ? `${bad} FAILED` : `unit 8 clean${warn ? ` (${warn} soft warning(s) to eyeball)` : ''}`);
