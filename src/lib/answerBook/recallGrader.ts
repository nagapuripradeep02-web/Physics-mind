/**
 * recallGrader.ts — grades a student's SPOKEN recall of an authored answer.
 *
 * Rule 18 posture: the model generates no physics and no marks. The answer is
 * authored and fixed; the model only MATCHES spoken words against an authored
 * rubric. Every id it returns is intersected against real step ids, every evidence
 * quote is verified to occur in the transcript, and the score is summed here from
 * authored marks. The model never sees a number.
 *
 * Seven guards stand between a real recall and a wrong "you missed this" — a
 * confident false accusation is the one failure that would kill this feature:
 *   G1 rubric `credit: name_it` (a drawing cannot be spoken — naming it is full credit)
 *   G2 thin transcript short-circuits BEFORE any LLM call
 *   G3 off-topic → no score, no misses
 *   G4 unverifiable evidence quote → "not sure", never "missed"
 *   G5 asymmetric confidence floors: 0.50 to credit, 0.70 to accuse
 *   G6 `heard_as` rescue demotes missed → not sure (never promotes to covered)
 *   G7 an omitted/malformed step is "not sure"; zero-mark steps are never "missed"
 *
 * Pure and fully unit-testable: feed it a transcript plus a canned model response.
 */
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { readFileSync } from 'fs';
import { join } from 'path';
import { recallCheckSchema, type RecallCheck } from '../../schemas/answerBookRecall';
import type { AnswerBookQuestion } from '../../schemas/answerBook';

// ── tunables ─────────────────────────────────────────────────────────────────
const MIN_WORDS_TO_GRADE = 12;   // below this we never call the model at all
const THIN_TRANSCRIPT_WORDS = 25;
const CREDIT_FLOOR = 0.5;        // confidence needed to COUNT a step
const ACCUSE_FLOOR = 0.7;        // confidence needed to say "you did not say this"
const MODEL_TIMEOUT_MS = 20000;

export type RecallBucket = 'covered' | 'missed' | 'unsure';
export type RecallOutcome = 'graded' | 'not_enough_heard' | 'not_this_answer' | 'check_failed';

export interface RecallStepResult {
    step_id: string;
    label: string;
    marks: number;
    bucket: RecallBucket;
    credit: 'name_it' | 'say_it';
    /** Verified exact quote from the raw transcript, with offsets for highlighting. */
    evidence: string | null;
    evidence_start: number | null;
    evidence_end: number | null;
    confidence: number;
    /** Set when a guard demoted this, rather than the model being unsure. */
    demoted_by: 'evidence_check' | 'rescue' | 'omitted' | null;
}

export interface RecallResult {
    outcome: RecallOutcome;
    transcript: string;
    thin_transcript: boolean;
    marks_earned: number;
    marks_total: number;
    steps: RecallStepResult[];
    order_note: string | null;
}

// ── normalisation ────────────────────────────────────────────────────────────

/** Offset-preserving normaliser: lowercase, punctuation → space, runs collapsed. */
export function normalizeForQuote(raw: string): { text: string; rawIndex: number[] } {
    const out: string[] = [];
    const rawIndex: number[] = [];
    let lastWasSpace = true;
    for (let i = 0; i < raw.length; i++) {
        const ch = raw[i].toLowerCase();
        const keep = /[a-z0-9]/.test(ch);
        if (keep) {
            out.push(ch);
            rawIndex.push(i);
            lastWasSpace = false;
        } else if (!lastWasSpace) {
            out.push(' ');
            rawIndex.push(i);
            lastWasSpace = true;
        }
    }
    while (out.length && out[out.length - 1] === ' ') {
        out.pop();
        rawIndex.pop();
    }
    return { text: out.join(''), rawIndex };
}

/**
 * Spoken-maths normaliser for the RESCUE pass only (never for the quote check).
 * Longest phrases first — order matters.
 */
const SPOKEN_MATH_MAP: Array<[RegExp, string]> = [
    [/\btan to the power minus one\b/g, 'tan inverse'],
    [/\btan power minus one\b/g, 'tan inverse'],
    [/\btan universe\b/g, 'tan inverse'],
    [/\bthan inverse\b/g, 'tan inverse'],
    [/\barc ?tan\b/g, 'tan inverse'],
    [/\bparallel program\b/g, 'parallelogram'],
    [/\bpara logram\b/g, 'parallelogram'],
    [/\bpythagor(us|ous)\b/g, 'pythagoras'],
    [/\b(theater|thita|theeta)\b/g, 'theta'],
    [/\b(under root|square root)\b/g, 'root'],
    [/\bsquared\b/g, 'square'],
    [/\b(cue|kyu)(?= (cos|sin|square|by|over))/g, 'q'],
    [/\b(divided by|over)\b/g, 'by'],
];

export function normalizeForRescue(raw: string): string {
    let t = normalizeForQuote(raw).text;
    for (const [re, to] of SPOKEN_MATH_MAP) t = t.replace(re, to);
    return t.replace(/\s+/g, ' ').trim();
}

/** Find a quote in the normalised transcript; map the hit back to raw offsets. */
export function findInNormalized(
    norm: { text: string; rawIndex: number[] },
    quote: string,
): { rawStart: number; rawEnd: number; unique: boolean } | null {
    const nq = normalizeForQuote(quote).text;
    if (!nq) return null;
    const at = norm.text.indexOf(nq);
    if (at === -1) return null;
    const second = norm.text.indexOf(nq, at + 1);
    const endIdx = Math.min(at + nq.length - 1, norm.rawIndex.length - 1);
    return {
        rawStart: norm.rawIndex[at],
        rawEnd: norm.rawIndex[endIdx] + 1,
        unique: second === -1,
    };
}

/** G6: does the transcript contain any authored `heard_as` term or a 4+ word run of an `accept` phrase? */
export function rescueHit(rescueText: string, recall: NonNullable<AnswerBookQuestion['answer']['steps'][number]['recall']>): boolean {
    const hay = ` ${rescueText} `;
    for (const h of recall.heard_as) {
        const n = normalizeForRescue(h);
        if (n && hay.includes(` ${n} `)) return true;
    }
    for (const a of recall.accept) {
        const words = normalizeForRescue(a).split(' ').filter(Boolean);
        for (let i = 0; i + 4 <= words.length; i++) {
            if (hay.includes(` ${words.slice(i, i + 4).join(' ')} `)) return true;
        }
    }
    return false;
}

// ── prompt ───────────────────────────────────────────────────────────────────

function loadPrompt(): string {
    return readFileSync(join(process.cwd(), 'src', 'prompts', 'answer_book_recall.txt'), 'utf8');
}

/** Marks are deliberately ABSENT here — the model must not be able to do arithmetic. */
export function renderStepsBlock(q: AnswerBookQuestion): string {
    return q.answer.steps
        .map((s) => {
            const r = s.recall!;
            const lines = [
                `[${s.id}] ${s.label}`,
                `  credit: ${r.credit}`,
                `  must convey: ${r.must_convey}`,
                `  counts as covered: ${r.accept.map((a) => `"${a}"`).join(' | ')}`,
            ];
            if (r.reject.length) lines.push(`  does not count: ${r.reject.map((x) => `"${x}"`).join(' | ')}`);
            if (r.heard_as.length) lines.push(`  may be heard as: ${r.heard_as.join(', ')}`);
            return lines.join('\n');
        })
        .join('\n\n');
}

// ── grading ──────────────────────────────────────────────────────────────────

function emptyResult(outcome: RecallOutcome, transcript: string, marksTotal: number): RecallResult {
    return {
        outcome,
        transcript,
        thin_transcript: false,
        marks_earned: 0,
        marks_total: marksTotal,
        steps: [],
        order_note: null,
    };
}

export interface GradeDeps {
    /** Injectable for tests — defaults to the real model call. */
    callModel?: (prompt: string) => Promise<RecallCheck>;
}

export async function gradeRecall(
    question: AnswerBookQuestion,
    rawTranscript: string,
    deps: GradeDeps = {},
): Promise<RecallResult & { promptChars: number; outputChars: number }> {
    const raw = (rawTranscript ?? '').trim();
    const norm = normalizeForQuote(raw);
    const words = norm.text.split(' ').filter(Boolean);
    const marksTotal = question.marks_total;

    // ── G2: never spend money on an accidental tap ───────────────────────────
    if (words.length < MIN_WORDS_TO_GRADE) {
        return { ...emptyResult('not_enough_heard', raw, marksTotal), promptChars: 0, outputChars: 0 };
    }

    const prompt = loadPrompt()
        .replace('{{question_text}}', question.question_text)
        .replace('{{steps_block}}', renderStepsBlock(question))
        .replace('{{transcript}}', raw)
        .replace('{{word_count}}', String(words.length));

    let object: RecallCheck;
    try {
        const call =
            deps.callModel ??
            (async (p: string) => {
                const { object: o } = await generateObject({
                    model: google('gemini-2.5-flash'),
                    prompt: p,
                    schema: recallCheckSchema,
                    temperature: 0,
                    // gemini-2.5-flash is a THINKING model: reasoning tokens are drawn from
                    // the same output budget. At 900 with thinking on, the JSON was truncated
                    // and every call died as AI_NoObjectGeneratedError. This is a matching
                    // task, not a reasoning one — thinking off, budget generous.
                    maxOutputTokens: 3000,
                    providerOptions: { google: { thinkingConfig: { thinkingBudget: 0 } } },
                });
                return o as RecallCheck;
            });
        object = await Promise.race([
            call(prompt),
            new Promise<never>((_, rej) => setTimeout(() => rej(new Error('recall_timeout')), MODEL_TIMEOUT_MS)),
        ]);
    } catch {
        return { ...emptyResult('check_failed', raw, marksTotal), promptChars: prompt.length, outputChars: 0 };
    }

    const outputChars = JSON.stringify(object).length;

    // ── G3: not an attempt at this answer ────────────────────────────────────
    if (object.on_topic === false) {
        return { ...emptyResult('not_this_answer', raw, marksTotal), promptChars: prompt.length, outputChars };
    }

    // ── intersect ids against the authored answer; first win on duplicates ───
    const byId = new Map(question.answer.steps.map((s) => [s.id, s]));
    const judged = new Map<string, RecallCheck['steps'][number]>();
    for (const j of object.steps ?? []) {
        const id = String(j?.step_id ?? '').trim();
        if (!byId.has(id) || judged.has(id)) continue; // unknown or duplicate — drop
        judged.set(id, j);
    }

    const rescueText = normalizeForRescue(raw);
    const results: RecallStepResult[] = [];

    for (const step of question.answer.steps) {
        const recall = step.recall!;
        const j = judged.get(step.id);

        // ── G7: silence is never an accusation ───────────────────────────────
        if (!j || typeof j.covered !== 'boolean') {
            results.push({
                step_id: step.id, label: step.label, marks: step.marks, credit: recall.credit,
                bucket: 'unsure', evidence: null, evidence_start: null, evidence_end: null,
                confidence: 0, demoted_by: 'omitted',
            });
            continue;
        }

        const conf = Number.isFinite(j.confidence) ? Math.max(0, Math.min(1, j.confidence)) : 0;
        let covered = j.covered === true;
        let demoted: RecallStepResult['demoted_by'] = null;
        let evidence: string | null = null;
        let evStart: number | null = null;
        let evEnd: number | null = null;
        let evUnique = false;

        // ── G4: an unverifiable quote means the model paraphrased — demote, never accuse
        if (covered) {
            const quote = String(j.evidence ?? '').trim();
            const hit = quote ? findInNormalized(norm, quote) : null;
            if (!hit) {
                covered = false;
                demoted = 'evidence_check';
            } else {
                evidence = raw.slice(hit.rawStart, hit.rawEnd);
                evStart = hit.rawStart;
                evEnd = hit.rawEnd;
                evUnique = hit.unique;
            }
        }

        // ── G5: asymmetric floors — 0.50 to credit, 0.70 to accuse ───────────
        let bucket: RecallBucket;
        if (covered && conf >= CREDIT_FLOOR) bucket = 'covered';
        else if (covered) bucket = 'unsure';
        else if (demoted === 'evidence_check') bucket = 'unsure';
        else if (conf >= ACCUSE_FLOOR) bucket = 'missed';
        else bucket = 'unsure';

        // ── G6: an authored heard_as hit removes the accusation ──────────────
        if (bucket === 'missed' && rescueHit(rescueText, recall)) {
            bucket = 'unsure';
            demoted = 'rescue';
        }
        // a student cannot "miss" content the examiner does not mark
        if (bucket === 'missed' && step.marks === 0) bucket = 'unsure';

        results.push({
            step_id: step.id, label: step.label, marks: step.marks, credit: recall.credit,
            bucket, evidence, evidence_start: evStart, evidence_end: evEnd,
            confidence: conf, demoted_by: demoted,
        });
        void evUnique;
    }

    // ── the ONLY arithmetic in the system ────────────────────────────────────
    const marks_earned = Math.max(
        0,
        Math.min(marksTotal, results.filter((r) => r.bucket === 'covered').reduce((a, r) => a + r.marks, 0)),
    );

    return {
        outcome: 'graded',
        transcript: raw,
        thin_transcript: words.length < THIN_TRANSCRIPT_WORDS,
        marks_earned,
        marks_total: marksTotal,
        steps: results,
        order_note: computeOrderNote(question, results, norm),
        promptChars: prompt.length,
        outputChars,
    };
}

/**
 * At most ONE note, the earliest inversion, using the coarse mark_split labels
 * (they read naturally in a sentence). Reported, never deducted — there is no code
 * path from an inversion to a number.
 */
export function computeOrderNote(
    question: AnswerBookQuestion,
    results: RecallStepResult[],
    norm: { text: string; rawIndex: number[] },
): string | null {
    const orderOf = new Map(question.answer.steps.map((s, i) => [s.id, i]));
    const splitLabel = (i: number) => question.mark_split[i]?.label?.toLowerCase() ?? null;

    const pairs = results
        .filter((r) => r.bucket === 'covered' && r.evidence_start !== null && r.evidence)
        .filter((r) => {
            const hit = findInNormalized(norm, r.evidence!);
            return hit?.unique === true; // ambiguous quote → unreliable offset, skip
        })
        .map((r) => ({ index: orderOf.get(r.step_id) ?? 0, at: r.evidence_start!, id: r.step_id }))
        .sort((a, b) => a.at - b.at);

    for (let i = 0; i < pairs.length - 1; i++) {
        if (pairs[i].index > pairs[i + 1].index) {
            const first = splitLabel(pairs[i].index);
            const second = splitLabel(pairs[i + 1].index);
            if (!first || !second) return null;
            return (
                `Note: you said the ${first} before the ${second}. ` +
                `In the answer booklet the ${second} comes first. No marks are lost for this.`
            );
        }
    }
    return null;
}
