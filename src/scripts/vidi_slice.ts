/**
 * vidi_slice.ts — cut an audit JSONL into N markdown slices, one per grading reader.
 *
 *   npm run vidi:slice -- --in=.answerbook_logs/audit_ts_ipe_m1a.jsonl --slices=12
 *
 * WHY THIS EXISTS AS A SCRIPT. The grading step is the one place the audit can go
 * wrong for free: if the orchestrating session reads the replies itself, it burns
 * its context on 3,600 answers and starts grading from memory instead of from the
 * bank. Slicing them to disk and handing one file per reader is the same discipline
 * eye-walker uses for frame dumps — the caller keeps the verdicts, never the pixels.
 *
 * Each slice carries the ANSWER FACTS the model was given, so a reader grades
 * against the authored bank rather than against its own idea of the subject. That
 * is the whole point: the bank is the brain, and a reply is right only if the bank
 * says so.
 *
 * Output: <in-dir>/<in-name>.slice-NN.md  (gitignored alongside the JSONL)
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, basename } from 'path';

const arg = (k: string, d: string) => process.argv.find((a) => a.startsWith('--' + k + '='))?.split('=')[1] ?? d;
const IN = arg('in', '');
const SLICES = Number(arg('slices', '12'));
const CONTEXTS = join(process.cwd(), '.answerbook_logs', 'vidi_contexts.json');

if (!IN) { console.error('usage: npm run vidi:slice -- --in=<audit.jsonl> [--slices=12]'); process.exit(1); }
const inPath = IN.startsWith('.') || !IN.includes(':') ? join(process.cwd(), IN) : IN;
if (!existsSync(inPath)) { console.error('no such file: ' + inPath); process.exit(1); }

type Row = {
    id: string; qid: string; subject: string; cut: string; qtype: string; stars: number;
    marks_total: number; template: string; step: string | null; ask: string; reply: string;
    flags: string[];
};
type Ctx = { question_id: string; cut_key: string; context: string };

const rows = readFileSync(inPath, 'utf8').trim().split('\n')
    .map((l) => { try { return JSON.parse(l) as Row; } catch { return null; } })
    .filter((r): r is Row => !!r);

if (!rows.length) { console.error('no rows in ' + inPath); process.exit(1); }

// The grounding text, keyed the way the audit keyed it.
const ctxs = existsSync(CONTEXTS) ? JSON.parse(readFileSync(CONTEXTS, 'utf8')) as Ctx[] : [];
const ctxBy = new Map<string, string>();
for (const c of ctxs) ctxBy.set(c.question_id + '|' + c.cut_key, c.context);

// Group by question so one reader sees all ten asks about the same card together —
// a reply is judged against the card, and switching cards every row loses that.
const byQuestion = new Map<string, Row[]>();
for (const r of rows) {
    const k = r.qid + '|' + r.cut;
    if (!byQuestion.has(k)) byQuestion.set(k, []);
    byQuestion.get(k)!.push(r);
}
const keys = [...byQuestion.keys()].sort();
const per = Math.ceil(keys.length / SLICES);

const dir = dirname(inPath);
const stem = basename(inPath).replace(/\.jsonl$/, '');
let written = 0;

for (let s = 0; s < SLICES; s++) {
    const mine = keys.slice(s * per, (s + 1) * per);
    if (!mine.length) continue;
    const out: string[] = [
        '# Vidi audit slice ' + (s + 1) + ' of ' + SLICES,
        '',
        'Grade every reply 0-3 **against the ANSWER FACTS given above it**, not against your',
        'own knowledge of the subject:',
        '',
        '- **3 precise** - correct and grounded in the facts shown.',
        '- **2 acceptable** - correct but vague, padded, or over the length the ask deserved.',
        '- **1 weak/misleading** - a student could take away something wrong.',
        '- **0 harmful** - states a falsehood, invents a mark value or a step, or answers a',
        '  question the bank does not hold instead of declining it.',
        '',
        'Report per template: mean score, the count at each grade, and every reply you scored',
        '0 or 1 quoted with the reason. Mechanical flags are hints from a regex, not verdicts —',
        'a flag that is wrong is itself a finding worth reporting.',
        '',
        '---',
        '',
    ];
    for (const k of mine) {
        const rs = byQuestion.get(k)!;
        const facts = ctxBy.get(k);
        out.push('## ' + k);
        out.push('');
        if (facts) {
            out.push('<details><summary>ANSWER FACTS the model was given</summary>');
            out.push('');
            out.push('```');
            out.push(facts);
            out.push('```');
            out.push('</details>');
            out.push('');
        } else {
            out.push('_(no context found for this key - grade the reply on internal consistency only)_');
            out.push('');
        }
        for (const r of rs) {
            out.push('### [' + r.template + '] ' + (r.step ? 'step ' + r.step : 'no step open'));
            out.push('');
            out.push('**Student asks:** ' + r.ask);
            out.push('');
            out.push('**Vidi replies:**');
            out.push('');
            out.push('> ' + r.reply.split('\n').join('\n> '));
            out.push('');
            if (r.flags.length) out.push('_flags: ' + r.flags.join(', ') + '_');
            out.push('');
        }
        out.push('---');
        out.push('');
    }
    const p = join(dir, stem + '.slice-' + String(s + 1).padStart(2, '0') + '.md');
    writeFileSync(p, out.join('\n'));
    written++;
    console.log('  ' + p + '  (' + mine.length + ' questions, ' +
        mine.reduce((n, k) => n + byQuestion.get(k)!.length, 0) + ' replies)');
}

console.log(rows.length + ' replies across ' + keys.length + ' question-cuts -> ' + written + ' slices');
