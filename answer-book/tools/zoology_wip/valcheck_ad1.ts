import fs from 'fs';
import path from 'path';
import { answerBookQuestionSchema } from 'C:/Tutor/physics-mind-ipe-zoology/src/schemas/answerBook';
const dir = path.resolve('answer-book/questions');
const files = fs.readdirSync(dir).filter((f) => f.startsWith('ts_ipe_z1_ad1_') && f.endsWith('.json'));
let bad = 0;
for (const f of files) {
  const raw = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const r = answerBookQuestionSchema.safeParse(raw);
  if (!r.success) { bad++; console.log('FAIL', f); console.log(JSON.stringify(r.error.issues, null, 1)); continue; }
  if (raw.question_id !== f.replace(/\.json$/, '')) { bad++; console.log('FAIL id/filename mismatch', f); }
  const longest: string[] = [];
  raw.answer.steps.forEach((s: any) => (s.lines || []).forEach((l: any) => {
    const t = typeof l === 'string' ? l : l.text;
    if (t.length > 52) longest.push(`${s.id}: ${t.length} "${t}"`);
  }));
  const noWhy = raw.answer.steps.filter((s: any) => !s.why).length;
  const noCm = raw.answer.steps.filter((s: any) => !s.common_mistakes?.length).length;
  const noMn = raw.answer.steps.filter((s: any) => s.marks > 0 && !s.mark_note).length;
  const noMt = raw.answer.steps.filter((s: any) => !s.memory_tip).length;
  const noMg = raw.answer.steps.filter((s: any) => !s.margin_note).length;
  console.log('OK  ', f, '·', raw.qtype, raw.marks_total + 'M · steps', raw.answer.steps.length,
    `· gaps why:${noWhy} cm:${noCm} mark_note:${noMn} memory_tip:${noMt} margin_note:${noMg}`,
    longest.length ? `· LONG LINES ${longest.length}` : '');
  longest.forEach((l) => console.log('     >52  ', l));
}
console.log(bad ? `${bad} FAILED` : `all ${files.length} valid`);
