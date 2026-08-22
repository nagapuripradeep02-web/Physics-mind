/**
 * vidi_grade_log.ts — grade replies that were ALREADY paid for, offline and free.
 *
 *   npm run vidi:grade                      (grade every logged reply)
 *   npm run vidi:grade -- --since=2026-08-22T10:40:00Z
 *
 * WHY: a fleet run is ~810 sequential requests and takes hours, and the shakedown
 * writes its report only at the end — so an interrupted run used to lose every
 * reply it had already bought. It never actually lost them: the local mirror logs
 * the full question and reply to .answerbook_logs/usage.jsonl on every call. This
 * reads that log, re-joins each reply to the context the model was given, and runs
 * the same mechanical checks. A killed run is therefore still evidence.
 *
 * Caveat, stated rather than hidden: usage.jsonl does not record cut_key, so a
 * reply is matched to its question's DEFAULT cut. 157 of 162 contexts are default
 * cuts, so this is exact for all but the 5 cut-cards, where a mark from the other
 * length could read as unsupported. Those are named in the output.
 */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import {
    inventedMarks, summedMarks, isTooLong, idiomsIn, markdownIn, romanisedTeluguIn,
    answeredOutOfBank,
} from '../lib/answerBook/vidiChecks';

const ROOT = process.cwd();
const OUT = join(ROOT, '.answerbook_logs');
const CONTEXTS = join(OUT, 'vidi_contexts.json');
const USAGE = join(OUT, 'usage.jsonl');

type Ctx = { question_id: string; cut_key: string; qtype: string; stars: number; context: string };
type Row = { at: string; question_id: string; step_id: string | null; question: string; reply: string };

if (!existsSync(CONTEXTS)) { console.error('✗ run npm run vidi:contexts first'); process.exit(1); }
if (!existsSync(USAGE)) { console.error('✗ no .answerbook_logs/usage.jsonl — run the mirror first'); process.exit(1); }

const CTXS = JSON.parse(readFileSync(CONTEXTS, 'utf8')) as Ctx[];
const defaultCut = new Map<string, Ctx>();
const multiCut = new Set<string>();
for (const c of CTXS) {
    if (defaultCut.has(c.question_id)) multiCut.add(c.question_id);
    else defaultCut.set(c.question_id, c);
}

const sinceArg = process.argv.find((a) => a.startsWith('--since='));
const since = sinceArg ? Date.parse(sinceArg.split('=')[1]) : 0;

const rows = readFileSync(USAGE, 'utf8').trim().split('\n')
    .map((l) => { try { return JSON.parse(l) as Row; } catch { return null; } })
    .filter((r): r is Row => !!r && !!r.reply && Date.parse(r.at) >= since);

type Finding = { at: string; qid: string; ask: string; reply: string; flags: string[]; critical: boolean };
const findings: Finding[] = [];
const seenQ = new Set<string>();
let graded = 0, guards = 0;

for (const r of rows) {
    const ctx = defaultCut.get(r.question_id);
    if (!ctx) continue;
    // A guard reply is the rate limiter talking, not the persona — never scored.
    if (/^(Give me a short moment|I am resting for today|I could not answer just now|You have asked a lot of good questions today)/.test(r.reply)) { guards++; continue; }
    graded++;
    seenQ.add(r.question_id);

    const flags: string[] = [];
    let critical = false;
    const inv = inventedMarks(ctx.context, r.reply);
    if (inv.length) {
        const note = multiCut.has(r.question_id) ? ' [multi-cut question — may be the other length]' : '';
        flags.push(`MARK NOT IN BANK: ${inv.join(', ')}${note}`);
        if (!multiCut.has(r.question_id)) critical = true;
    }
    const sum = summedMarks(ctx.context, r.reply);
    if (sum.length) flags.push(`MARK SUM (verify): ${sum.join(', ')}`);
    const idi = idiomsIn(r.reply);
    if (idi.length) { flags.push(`IDIOM: ${idi.join(', ')}`); critical = true; }
    const md = markdownIn(r.reply);
    if (md.length) flags.push(`MARKDOWN: ${md.join(', ')}`);
    if (isTooLong(r.question, r.reply)) flags.push('LONG');
    // Telugu probes are asked in romanised Telugu; only an ENGLISH ask should be
    // English-only, so mirror-checking keys off the question, not a probe flag.
    const askIsTelugu = /telugu|cheppu|enduku|lo /i.test(r.question);
    if (!askIsTelugu) {
        if (/[ఀ-౿]/.test(r.reply)) { flags.push('TELUGU SCRIPT in reply to an ENGLISH question'); critical = true; }
        const rom = romanisedTeluguIn(r.reply);
        if (rom.length >= 2) { flags.push(`ROMANISED TELUGU: ${rom.join(', ')}`); critical = true; }
    }
    if (answeredOutOfBank(r.question, r.reply)) {
        flags.push('ANSWERED AN OUT-OF-BANK QUESTION'); critical = true;
    }
    if (flags.length) findings.push({ at: r.at, qid: r.question_id, ask: r.question, reply: r.reply, flags, critical });
}

const crit = findings.filter((f) => f.critical);
const byFlag = new Map<string, number>();
for (const f of findings) for (const fl of f.flags) {
    const k = fl.split(':')[0];
    byFlag.set(k, (byFlag.get(k) ?? 0) + 1);
}

console.log(`\n  graded ${graded} logged replies across ${seenQ.size} of ${defaultCut.size} questions` +
    (guards ? ` (${guards} guard replies skipped)` : ''));
console.log(`  ${findings.length} flagged · ${crit.length} CRITICAL\n`);
console.log('  by flag:');
for (const [k, n] of [...byFlag].sort((a, b) => b[1] - a[1])) console.log(`    ${String(n).padStart(4)}  ${k}`);

if (crit.length) {
    console.log('\n  ── CRITICAL ──');
    for (const f of crit.slice(0, 25)) {
        console.log(`\n  ${f.qid}`);
        console.log(`    Q: ${f.ask.slice(0, 100)}`);
        console.log(`    A: ${f.reply.replace(/\n/g, ' ').slice(0, 220)}`);
        console.log(`    ✗ ${f.flags.join(' · ')}`);
    }
    if (crit.length > 25) console.log(`\n  … and ${crit.length - 25} more`);
}
process.exitCode = crit.length > 0 ? 1 : 0;
