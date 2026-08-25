import fs from 'node:fs';
import path from 'node:path';
import { answerBookQuestionSchema } from '../../../src/schemas/answerBook';

const QDIR = 'C:/Tutor/physics-mind-ipe-zoology/answer-book/questions';
const files = fs.readdirSync(QDIR).filter((f) => f.startsWith('ts_ipe_z1_bhw_') && f.endsWith('.json'));
let bad = 0;
const stubs: string[] = [];
for (const f of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(QDIR, f), 'utf8'));
    const r = answerBookQuestionSchema.safeParse(raw);
    if (!r.success) {
        bad++;
        console.log('FAIL', f);
        for (const iss of r.error.issues) console.log('   ', iss.path.join('.'), iss.message);
        continue;
    }
    if (raw.question_id + '.json' !== f) { bad++; console.log('FAIL', f, 'id mismatch', raw.question_id); }
    for (const st of raw.answer.steps) {
        if (st.figure && String(st.figure.id).startsWith('STUB_')) stubs.push(`${f} :: ${st.id}`);
        for (const ln of st.lines ?? []) {
            const t = typeof ln === 'string' ? ln : ln.text;
            if (t.length > 52) console.log('LONG', f, st.id, t.length, t);
        }
        if (!st.why || !st.common_mistakes?.length || !st.memory_tip || !st.margin_note) {
            bad++; console.log('FAIL', f, st.id, 'missing rail field');
        }
    }
    if (!raw.insider_note) { bad++; console.log('FAIL', f, 'no insider_note'); }
    if (!raw.verification?.needs_teacher_verification) { bad++; console.log('FAIL', f, 'verification'); }
}
console.log(`\nchecked ${files.length} files, ${bad} problems`);
if (stubs.length) { console.log('STUB figures still present:'); stubs.forEach((s) => console.log('  ', s)); }
else console.log('no stub figures remain');
