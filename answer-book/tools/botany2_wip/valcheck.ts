/** Per-unit zod + build-gate pre-flight for ts_ipe_b2_* cards, so an authoring
 *  pass is checked before units.json is touched. Mirrors the build's own gates. */
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { answerBookQuestionSchema } from '../../../src/schemas/answerBook';
import { idiomsIn } from '../../../src/lib/answerBook/vidiChecks';

const DIR = join(process.cwd(), 'answer-book', 'questions');
const only = process.argv[2] || 'ts_ipe_b2_';
const bad: string[] = [];
let n = 0;
for (const f of readdirSync(DIR).filter((x) => x.startsWith(only) && x.endsWith('.json')).sort()) {
    const raw = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
    const r = answerBookQuestionSchema.safeParse(raw);
    if (!r.success) { bad.push(`${f}\n` + r.error.issues.map((i) => `    ${i.path.join('.')}: ${i.message}`).join('\n')); continue; }
    const q = r.data; n++;
    if (q.question_id !== f.replace(/\.json$/, '')) bad.push(`${f}: question_id !== filename`);
    const sum = q.answer.steps.reduce((a, s) => a + s.marks, 0);
    if (sum !== q.marks_total) bad.push(`${f}: steps sum ${sum} != marks_total ${q.marks_total}`);
    const ms = q.mark_split.reduce((a, s) => a + s.marks, 0);
    if (ms !== q.marks_total) bad.push(`${f}: mark_split sum ${ms} != ${q.marks_total}`);
    let tips = 0, notes = 0;
    for (const s of q.answer.steps) {
        if (!s.why) bad.push(`${f}/${s.id}: no why`);
        if (!s.common_mistakes?.length) bad.push(`${f}/${s.id}: no common_mistakes`);
        if (s.marks > 0 && !s.mark_note) bad.push(`${f}/${s.id}: no mark_note on a ${s.marks}M step`);
        if (s.memory_tip) tips++;
        if (s.margin_note) notes++;
        for (const [k, t] of [['why', s.why], ['memory_tip', s.memory_tip], ['margin_note', s.margin_note],
                              ...(s.common_mistakes ?? []).map((m, i) => [`cm[${i}]`, m] as [string, string])] as [string, string | undefined][]) {
            if (t && idiomsIn(t).length) bad.push(`${f}/${s.id}.${k}: Rule 41 "${idiomsIn(t).join('", "')}"`);
        }
    }
    const N = q.answer.steps.length;
    if (tips > 0 && tips < N) bad.push(`${f}: memory_tip on ${tips}/${N} — all or none`);
    if (notes > 0 && notes < N) bad.push(`${f}: margin_note on ${notes}/${N} — all or none`);
    if (q.insider_note && idiomsIn(q.insider_note).length) bad.push(`${f}: insider_note Rule 41`);
}
console.log(`${n} card(s) checked under "${only}"`);
if (bad.length) { console.log(`\n${bad.length} problem(s):`); bad.forEach((b) => console.log('  - ' + b)); process.exit(1); }
console.log('valcheck PASS');
