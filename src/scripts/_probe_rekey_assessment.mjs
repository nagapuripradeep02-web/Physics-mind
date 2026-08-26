// N4 — re-key pure_rolling's assessment so the correct answer is not always "A".
// SAFETY INVARIANT: distractor_misconceptions is keyed BY LETTER, so the pairing
// that must survive is (option TEXT -> misconception TEXT). This script rebuilds
// only the options / correct / distractor_misconceptions blocks, byte-preserving
// everything else, then asserts the text->misconception pairing is unchanged.
import { readFileSync, writeFileSync } from 'node:fs';

const P = 'src/data/concepts/pure_rolling.json';
let src = readFileSync(P, 'utf8');
const before = JSON.parse(src);
const NEW_KEY = ['C', 'A', 'D', 'B', 'A', 'C', 'B'];   // A×2 B×2 C×2 D×1
const L = ['A', 'B', 'C', 'D'];

const pairsOf = (q) => {
  const m = new Map();
  for (const k of L) m.set(q.options[k], q.correct === k ? '<<CORRECT>>' : q.distractor_misconceptions[k]);
  return m;
};
const beforePairs = before.assessment.questions.map(pairsOf);

before.assessment.questions.forEach((q, qi) => {
  const correctText = q.options[q.correct];
  const distractors = L.filter((k) => k !== q.correct).map((k) => [q.options[k], q.distractor_misconceptions[k]]);
  const target = NEW_KEY[qi];
  const newOpts = {}, newDis = {};
  newOpts[target] = correctText;
  let di = 0;
  for (const k of L) if (k !== target) { const [t, mis] = distractors[di++]; newOpts[k] = t; newDis[k] = mis; }

  const optBlock = `"options": {\n${L.map((k) => `          ${JSON.stringify(k)}: ${JSON.stringify(newOpts[k])}`).join(',\n')}\n        }`;
  const disBlock = `"distractor_misconceptions": {\n${L.filter((k) => k !== target).map((k) => `          ${JSON.stringify(k)}: ${JSON.stringify(newDis[k])}`).join(',\n')}\n        }`;

  // Replace the three blocks inside THIS question only, located by its q_id.
  const qStart = src.indexOf(`"q_id": ${JSON.stringify(q.q_id)}`);
  if (qStart < 0) throw new Error(`q_id ${q.q_id} not found`);
  const qEnd = qi + 1 < before.assessment.questions.length
    ? src.indexOf(`"q_id": ${JSON.stringify(before.assessment.questions[qi + 1].q_id)}`)
    : src.length;
  let seg = src.slice(qStart, qEnd);
  const oldOpt = seg.match(/"options": \{[\s\S]*?\n\s*\}/);
  const oldDis = seg.match(/"distractor_misconceptions": \{[\s\S]*?\n\s*\}/);
  const oldCor = seg.match(/"correct": "[A-D]"/);
  if (!oldOpt || !oldDis || !oldCor) throw new Error(`blocks not found in ${q.q_id}`);
  seg = seg.replace(oldOpt[0], optBlock).replace(oldDis[0], disBlock).replace(oldCor[0], `"correct": ${JSON.stringify(target)}`);
  src = src.slice(0, qStart) + seg + src.slice(qEnd);
});

const after = JSON.parse(src);
// INVARIANT CHECK
after.assessment.questions.forEach((q, qi) => {
  const a = pairsOf(q), b = beforePairs[qi];
  if (a.size !== b.size) throw new Error(`${q.q_id}: option count changed`);
  for (const [text, mis] of b) {
    if (!a.has(text)) throw new Error(`${q.q_id}: option text lost: ${text}`);
    if (a.get(text) !== mis) throw new Error(`${q.q_id}: DETACHED — "${text}" was ${mis}, now ${a.get(text)}`);
  }
});
const keys = after.assessment.questions.map((q) => q.correct);
writeFileSync(P, src);
console.log('invariant HELD for all 7 questions (option text -> misconception preserved)');
console.log('new keys:', keys.join(' '), '| distinct:', [...new Set(keys)].sort().join(''));
