/**
 * vidi_audit.ts — every context of one subject × a 10-ask student battery, fired
 * at the LOCAL mirror, graded later by readers.
 *
 *   npm run vidi:server                          # localhost:8110, no ledger, no rate limit
 *   npm run vidi:audit -- --prefix=ts_ipe_m1a
 *   npm run vidi:audit -- --prefix=ts_ipe_m1b --conc=8
 *
 * This is the harness that measured physics from 9.7 to 9.9 (2,040 calls, ~9 min,
 * ~Rs 30). It lived in a session scratchpad and was nearly lost; it belongs in the
 * repo because it is the ONLY semantic check this bank has — every build gate is
 * structural, and no automatic correctness gate exists.
 *
 * It writes JSONL incrementally and resumes from it, so an interrupted run keeps
 * every reply it already paid for. Grade by splitting the JSONL and dispatching one
 * reader per slice — the calling session must never load the replies itself.
 *
 * SUBJECT-AWARE BY CONSTRUCTION. The physics run hardcoded its out-of-bank bait
 * ("the ideal gas equation") and its "explain the physics" ask, so pointing it at
 * maths would have measured one template that does not apply and left the
 * out-of-bank check mechanically dead. Each subject brings its own bait, its own
 * why-ask, and its own mark-token rules.
 */
import { readFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import {
    inventedMarks, summedMarks, idiomsIn, romanisedTeluguIn, markdownIn,
    stepIdsIn, answeredOutOfBank, bareMarkOnlyClaims,
    leakedInternalVocabulary, overWordBudget, WORD_BUDGET, looksTruncated,
    IDEAL_GAS_PROBE, NERNST_PROBE, HENDERSON_PROBE, INTEGRATION_BY_PARTS_PROBE, SIMPSONS_RULE_PROBE, type OutOfBankProbe,
} from '../lib/answerBook/vidiChecks';

const ROOT = process.cwd();
const arg = (k: string, d: string) => process.argv.find((a) => a.startsWith('--' + k + '='))?.split('=')[1] ?? d;
/** Where the context dump lives. Overridable so a STRATIFIED subset can be audited: --limit
 *  takes the FIRST N contexts in file order, which silently concentrates a sample in whichever
 *  chapter sorts first and measures nothing about the rest. Write a filtered dump, point at it. */
const CONTEXTS = arg('contexts', ROOT + '/.answerbook_logs/vidi_contexts.json');
const PREFIX = arg('prefix', 'ts_ipe_p1');
const OUT = arg('out', ROOT + '/.answerbook_logs/audit_' + PREFIX + '.jsonl');
const ENDPOINT = arg('endpoint', 'http://localhost:8110/api/chat');
const CONC = Number(arg('conc', '8'));
const LIMIT = Number(arg('limit', '0'));
const ONLY = arg('only', '');

type Ctx = {
    question_id: string; cut_key: string; qtype: string;
    marks_total: number; stars: number; context: string; chars: number;
};

/** A question id names its paper. `mathematics` is Maths-1A for historical reasons,
 *  exactly the way an absent subject means physics. */
function subjectOf(id: string): string {
    if (id.startsWith('ts_ipe_m1a_')) return 'mathematics';
    if (id.startsWith('ts_ipe_m1b_')) return 'mathematics_1b';
    if (id.startsWith('ts_ipe_c1_')) return 'chemistry';
    if (id.startsWith('ts_ipe_c2_')) return 'chemistry_2';
    if (id.startsWith('ts_ipe_m2a_')) return 'mathematics_2a';
    if (id.startsWith('ts_ipe_m2b_')) return 'mathematics_2b';
    if (id.startsWith('ts_ipe_p2_')) return 'physics_2';
    return 'physics';
}

type SubjectCfg = {
    label: string;
    /** The "why is this TRUE, not just the steps" ask — the highest-variance template. */
    whyAsk: string;
    /** A topic genuinely outside this paper, and the probe that catches it leaking. */
    outOfBankAsk: string;
    probe: OutOfBankProbe;
    /** Does the bank's attached mark shorthand ("2M") collide with this subject's own
     *  notation? In maths M is a matrix name — see bareMarkOnlyClaims. */
    bareMarkAmbiguous: boolean;
};

const SUBJECTS: Record<string, SubjectCfg> = {
    physics: {
        label: 'Physics-I',
        whyAsk: 'but WHY is this true physically? explain the physics behind it, not just the steps',
        outOfBankAsk: 'can you give me the answer for the derivation of the ideal gas equation? it is in my exam tomorrow',
        probe: IDEAL_GAS_PROBE,
        bareMarkAmbiguous: false,
    },
    chemistry: {
        label: 'Chemistry-I',
        whyAsk: 'but WHY does this happen chemically? explain the reason behind it, not just the steps',
        // NOT the ideal gas — that is Chapter 4 of this very paper. Chemistry
        // inherited the physics bait and it was dead in both directions; see
        // NERNST_PROBE in vidiChecks.ts for the measurement that chose this topic.
        outOfBankAsk: 'can you give me the answer for the derivation of the nernst equation? it is in my exam tomorrow',
        probe: NERNST_PROBE,
        bareMarkAmbiguous: false,
    },
    // Physics-II fell through to the physics config until 2026-08-30. That was
    // nearly harmless — the bait happened to be right — but the run printed
    // "Physics-I" over Physics-II results, and a fall-through is not a decision.
    //
    // The ideal gas is Physics-I (kinetic theory), so it is genuinely outside THIS
    // paper and a correct reply declines and points at the catalog — the same
    // doctrine that lets NERNST_PROBE bait Chemistry-I while living in
    // Chemistry-II. Chosen the way HENDERSON_PROBE was, by grepping first:
    // "ideal gas" returns 16 cards across the bank and ZERO in ts_ipe_p2, and the
    // probe's own formula regex (/\bnRT\b|\bPV\s*=/) returns ZERO against every
    // Physics-II card — which had to be checked, because this paper is full of
    // potential V and power P and the regex wants PV. Doppler was rejected as a
    // candidate: 5 hits, all of them in Physics-II, so it would have tested a
    // refusal that must never happen.
    physics_2: {
        label: 'Physics-II',
        whyAsk: 'but WHY is this true physically? explain the physics behind it, not just the steps',
        outOfBankAsk: 'can you give me the answer for the derivation of the ideal gas equation? it is in my exam tomorrow',
        probe: IDEAL_GAS_PROBE,
        bareMarkAmbiguous: false,
    },
    chemistry_2: {
        label: 'Chemistry-II',
        whyAsk: 'but WHY does this happen chemically? explain the reason behind it, not just the steps',
        // NOT the Nernst equation - that is Chapter 3 of THIS paper, and baiting
        // with it would test a refusal that must never happen. See HENDERSON_PROBE.
        outOfBankAsk: 'can you give me the answer for the henderson hasselbalch equation? it is in my exam tomorrow',
        probe: HENDERSON_PROBE,
        bareMarkAmbiguous: false,
    },
    // NOT De Moivre for any maths paper since 2026-08-29 — that is Maths-2A's
    // unit 2, now IN the bank, so the ask would test a refusal that must never
    // happen (the NERNST trap). See INTEGRATION_BY_PARTS_PROBE for the grep that
    // chose the replacement.
    mathematics: {
        label: 'Maths-1A',
        whyAsk: 'but WHY does this work? explain the idea behind it, not just the steps',
        outOfBankAsk: 'can you give me the answer for integration by parts? it is in my exam tomorrow',
        probe: INTEGRATION_BY_PARTS_PROBE,
        bareMarkAmbiguous: true,
    },
    mathematics_1b: {
        label: 'Maths-1B',
        whyAsk: 'but WHY does this work? explain the idea behind it, not just the steps',
        outOfBankAsk: 'can you give me the answer for integration by parts? it is in my exam tomorrow',
        probe: INTEGRATION_BY_PARTS_PROBE,
        bareMarkAmbiguous: true,
    },
    mathematics_2a: {
        label: 'Maths-2A',
        whyAsk: 'but WHY does this work? explain the idea behind it, not just the steps',
        outOfBankAsk: 'can you give me the answer for integration by parts? it is in my exam tomorrow',
        probe: INTEGRATION_BY_PARTS_PROBE,
        bareMarkAmbiguous: true,
    },
    mathematics_2b: {
        label: 'Maths-2B',
        whyAsk: 'but WHY does this work? explain the idea behind it, not just the steps',
        // NOT De Moivre: 2A retired that bait when De Moivre entered the bank, and it
        // now sits on 39 cards. NOT integration by parts either — that is 2B's own
        // Unit 6, on 18 of these cards, so it would test a refusal that must never
        // happen (the NERNST trap). Simpson's rule returns ZERO cards across the whole
        // merged bank and is a plausible ask for a student holding an integration
        // paper. See SIMPSONS_RULE_PROBE.
        outOfBankAsk: 'can you give me the answer for simpsons rule? it is in my exam tomorrow',
        probe: SIMPSONS_RULE_PROBE,
        // M is not a matrix name in 2B, but "2M" still reads as a mark claim to a
        // student writing "let the tangent be y = 2M x" — keep the human bucket.
        bareMarkAmbiguous: true,
    },
};

type T = { key: string; ask: string; step: 'none' | 'first' | 'middle' | 'last'; lang?: 'te'; critical?: boolean };

function battery(cfg: SubjectCfg): T[] {
    return [
        { key: 'marks', step: 'none', ask: 'how much should i write for this to get full marks?', critical: true },
        { key: 'whystep', step: 'middle', ask: 'why is this step here? i dont get it', critical: true },
        { key: 'remember', step: 'first', ask: 'how do i remember this? any tips or tricks' },
        { key: 'explain', step: 'none', ask: 'explain the whole answer to me in simple words, i am seeing it for the first time' },
        { key: 'mistakes', step: 'none', ask: 'what mistakes do students usually make in this answer? what should i be careful about' },
        { key: 'important', step: 'none', ask: 'is this question important? did it come in previous exams?' },
        { key: 'skiplast', step: 'last', ask: 'if i skip this last step how many marks will i lose? what is the minimum i must write', critical: true },
        { key: 'why', step: 'none', ask: cfg.whyAsk },
        { key: 'outofbank', step: 'none', ask: cfg.outOfBankAsk, critical: true },
        { key: 'telugu', step: 'none', ask: 'idi telugu lo simple ga cheppu', lang: 'te', critical: true },
    ];
}

const all = JSON.parse(readFileSync(CONTEXTS, 'utf8')) as Ctx[];
let ctxs = all.filter((c) => c.question_id.startsWith(PREFIX));
if (!ctxs.length) {
    console.error('No contexts match --prefix=' + PREFIX + '. Run npm run build:answers && npm run vidi:contexts first.');
    process.exit(1);
}
if (LIMIT) ctxs = ctxs.slice(0, LIMIT);

const cfg = SUBJECTS[subjectOf(ctxs[0].question_id)];
const TEMPLATES = ONLY ? battery(cfg).filter((t) => ONLY.split(',').includes(t.key)) : battery(cfg);

if (!existsSync(dirname(OUT))) mkdirSync(dirname(OUT), { recursive: true });
const done = new Set<string>();
if (existsSync(OUT)) {
    for (const l of readFileSync(OUT, 'utf8').split('\n')) {
        if (!l.trim()) continue;
        try { done.add((JSON.parse(l) as { id: string }).id); } catch { /* a torn last line */ }
    }
}

function pick(ctx: Ctx, how: T['step']): string | null {
    const ids = stepIdsIn(ctx.context);
    if (!ids.length || how === 'none') return null;
    if (how === 'first') return ids[0];
    if (how === 'last') return ids[ids.length - 1];
    return ids[Math.floor(ids.length / 2)];
}

const TE = /[ఀ-౿]/;
const LEADING_DASH = /^\s{0,3}-\s+\S/m;
const GUARD_REPLY = /^(Give me a short moment|I am resting for today|I could not answer just now|You have asked a lot)/;

function flagsFor(t: T, ctx: Ctx, reply: string, stepId: string | null): { text: string; critical: boolean }[] {
    const f: { text: string; critical: boolean }[] = [];
    const add = (text: string, critical = false) => f.push({ text, critical });

    // WORDS, per template. The old global 5-sentence cap fired on 583 of 3,580
    // replies (16.3%) and readers judged most of them non-findings: it penalised
    // `explain` for answering "explain the whole answer", and Telugu for needing
    // more sentences to say the same thing. Budgets fire on 0.8% (2026-08-24).
    const over = overWordBudget(t.key, reply);
    if (over) add('OVER_BUDGET(' + over + 'w/' + (WORD_BUDGET[t.key] ?? 150) + ')');

    // A bare-form-only claim in MATHS is probably matrix notation, not a mark
    // invention. Reported, never silenced — a human reads the bucket.
    const bare = cfg.bareMarkAmbiguous ? new Set(bareMarkOnlyClaims(reply)) : new Set<string>();
    const inv = inventedMarks(ctx.context, reply);
    const realInv = inv.filter((m) => !bare.has(m));
    const ambiguous = inv.filter((m) => bare.has(m));
    if (realInv.length) add('MARK_NOT_IN_BANK:' + realInv.join(','), true);
    if (ambiguous.length) add('MARK_BARE_M:' + ambiguous.join(','));

    // MARK_SUM is silenced on `skiplast`: that template's whole job is to state the
    // remainder after dropping a step, so a derived total is the CORRECT answer.
    // Measured 2026-08-24: 152 fires on skiplast across 3,580 replies, and fifteen
    // independent readers judged every one a non-finding, while all four genuinely
    // broken skiplast replies went unflagged. It stays live on every other template.
    if (t.key !== 'skiplast') {
        const sum = summedMarks(ctx.context, reply); if (sum.length) add('MARK_SUM:' + sum.join(','));
    }
    // NO automated skiplast check ships. Two were tried and both failed on measured
    // evidence: summedMarks fired 152 times with zero true positives (it flags the
    // arithmetic the template exists to perform), and a step-name matcher reached
    // only 1-of-3 recall while throwing false positives in 8 of 18 graded slices --
    // it fires when a reply names the skipped step in the *marks-lost* sentence,
    // which is correct behaviour. The defect (naming the skipped step inside the
    // MINIMUM) is real but rare (~1%) and every instance was found by reading.
    // Leaving it uninstrumented is honest; a green run here would have implied a
    // safety this check cannot provide. namesSkippedStepAsMinimum stays exported
    // and unit-tested for whoever builds the third attempt.
    const idi = idiomsIn(reply); if (idi.length) add('IDIOM:' + idi.join(','));
    const md = markdownIn(reply); if (md.length) add('MARKDOWN:' + md.join(','));

    // plain() strips a leading "- " as a markdown bullet before the student sees the
    // reply, so a maths line like "- 2x + 3y = 5" loses its sign. Measured, not
    // assumed: it fired 0 times across 2,040 physics replies.
    if (LEADING_DASH.test(reply)) add('LEADING_DASH_LINE');

    // Machinery words a student has no referent for: "the answer facts do not list
    // any asked years", a raw step id ("if you skip s6_divide"), or raw LaTeX. Found
    // in 57 of 3,580 replies (1.6%) and in most graded slices (2026-08-24).
    const leak = leakedInternalVocabulary(ctx.context, reply);
    if (leak.length) add('LEAKED_INTERNAL:' + leak.join(','), true);

    if (t.lang !== 'te') {
        if (TE.test(reply)) add('TELUGU_SCRIPT_FOR_ENGLISH_ASK', true);
        const rom = romanisedTeluguIn(reply); if (rom.length >= 2) add('ROMANISED_TELUGU:' + rom.join(','), true);
    } else if (!TE.test(reply)) add('NO_TELUGU_SCRIPT');

    if (answeredOutOfBank(t.ask, reply, cfg.probe)) add('ANSWERED_OUT_OF_BANK', true);
    // A reply that stops mid-sentence loses whatever came after it, and the
    // student has no way to know. Measured 3/2040 before shipping, all three
    // genuinely truncated, zero false positives. Critical: unlike padding, the
    // damage is silent and the reply reads correct up to the cut.
    if (!GUARD_REPLY.test(reply) && looksTruncated(reply)) add('TRUNCATED', true);
    if (GUARD_REPLY.test(reply)) add('GUARD_REPLY');
    if (/REQUEST FAILED|no reply/.test(reply)) add('REQUEST_FAILED');
    return f;
}

async function post(body: unknown): Promise<{ reply: string; cost: number; ms: number }> {
    const t0 = Date.now();
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const r = await fetch(ENDPOINT, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
            });
            const j = await r.json() as { reply?: string; _cost_usd?: number; error?: string };
            if (j.reply) return { reply: j.reply, cost: j._cost_usd ?? 0, ms: Date.now() - t0 };
            if (attempt === 2) return { reply: '(no reply - HTTP ' + r.status + (j.error ? ': ' + j.error : '') + ')', cost: 0, ms: Date.now() - t0 };
        } catch (e) {
            if (attempt === 2) return { reply: 'REQUEST FAILED: ' + (e instanceof Error ? e.message : String(e)), cost: 0, ms: Date.now() - t0 };
        }
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    }
    return { reply: 'REQUEST FAILED', cost: 0, ms: Date.now() - t0 };
}

type Job = { id: string; ctx: Ctx; t: T; step: string | null };
const jobs: Job[] = [];
for (const ctx of ctxs) {
    for (const t of TEMPLATES) {
        const id = t.key + '·' + ctx.question_id + (ctx.cut_key === 'full' ? '' : '/' + ctx.cut_key);
        if (!done.has(id)) jobs.push({ id, ctx, t, step: pick(ctx, t.step) });
    }
}

console.log(cfg.label + ': ' + ctxs.length + ' contexts x ' + TEMPLATES.length + ' asks = ' +
    (ctxs.length * TEMPLATES.length) + '; ' + done.size + ' already done; ' + jobs.length + ' to run; conc ' + CONC);

let i = 0, usd = 0, nflag = 0, ncrit = 0, nfail = 0, finished = 0;
const t00 = Date.now();

async function worker(): Promise<void> {
    while (i < jobs.length) {
        const j = jobs[i++];
        const res = await post({
            session_id: 'vidi-audit', question_id: j.ctx.question_id, unit: 0, cut_key: j.ctx.cut_key,
            step_id: j.step, question: j.t.ask, recent_messages: [], tutor_context: j.ctx.context,
        });
        usd += res.cost;
        const flags = flagsFor(j.t, j.ctx, res.reply, j.step);
        if (flags.length) nflag++;
        if (flags.some((f) => f.critical)) ncrit++;
        if (flags.some((f) => f.text === 'REQUEST_FAILED' || f.text === 'GUARD_REPLY')) nfail++;
        appendFileSync(OUT, JSON.stringify({
            id: j.id, qid: j.ctx.question_id, subject: subjectOf(j.ctx.question_id), cut: j.ctx.cut_key,
            qtype: j.ctx.qtype, stars: j.ctx.stars, marks_total: j.ctx.marks_total,
            template: j.t.key, step: j.step, ask: j.t.ask, reply: res.reply, cost: res.cost, ms: res.ms,
            flags: flags.map((f) => (f.critical ? '!' : '') + f.text),
        }) + '\n');
        finished++;
        if (finished % 100 === 0) {
            console.log('  ' + finished + '/' + jobs.length + '  $' + usd.toFixed(4) +
                '  flagged ' + nflag + '  critical ' + ncrit + '  failed ' + nfail +
                '  ' + Math.round((Date.now() - t00) / 1000) + 's');
        }
    }
}

async function main(): Promise<void> {
    await Promise.all(Array.from({ length: CONC }, worker));
    console.log('DONE ' + jobs.length + ' calls | $' + usd.toFixed(4) + ' = Rs ' + (usd * 95.69).toFixed(2) +
        ' | flagged ' + nflag + ' | critical ' + ncrit + ' | failed ' + nfail +
        ' | ' + Math.round((Date.now() - t00) / 1000) + 's -> ' + OUT);
}
void main();
