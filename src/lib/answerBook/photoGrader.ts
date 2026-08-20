/**
 * photoGrader.ts — reads a photo or PDF of a HANDWRITTEN answer and proposes
 * which authored steps appear on the page.
 *
 * The critical difference from recallGrader: there is no transcript to verify an
 * evidence quote against, so the substring guard (G4) cannot apply. The guard here
 * is the STUDENT — every proposal is shown as a tick-list and only what they
 * confirm becomes a mark (`renderCheck(..., 'photo')` in notebook.js). A misread of
 * handwriting therefore costs a tap, never a wrong accusation.
 *
 * Rule 18 holds the same way as the mic path: the model reads, it never composes
 * physics and never sees a mark value.
 */
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { readFileSync } from 'fs';
import { join } from 'path';
import { z } from 'zod/v4';
import { renderStepsBlock, type RecallResult, type RecallStepResult } from './recallGrader';
import type { AnswerBookQuestion } from '../../schemas/answerBook';

const MODEL_TIMEOUT_MS = 45000;   // vision on a phone photo is slower than text
/** Below this we call it unclear rather than absent — a photo problem, not a student problem. */
const UNCLEAR_FLOOR = 0.5;

export const photoCheckSchema = z.object({
    on_topic: z.boolean(),
    readable: z.boolean(),
    steps: z.array(
        z.object({
            step_id: z.string(),
            found: z.boolean(),
            evidence: z.string().nullable(),
            confidence: z.number(),
        }),
    ),
});
export type PhotoCheck = z.infer<typeof photoCheckSchema>;

export type PhotoOutcome = RecallResult['outcome'] | 'nothing_readable';

export interface PhotoDeps {
    /** Injectable for tests — defaults to the real vision call. */
    callModel?: (prompt: string, bytes: Uint8Array, mediaType: string) => Promise<PhotoCheck>;
}

function empty(outcome: PhotoOutcome, marksTotal: number) {
    return {
        outcome,
        transcript: '',
        thin_transcript: false,
        marks_earned: 0,
        marks_total: marksTotal,
        steps: [] as RecallStepResult[],
        order_note: null,
        promptChars: 0,
        outputChars: 0,
    };
}

export async function gradePhoto(
    question: AnswerBookQuestion,
    bytes: Uint8Array,
    mediaType: string,
    deps: PhotoDeps = {},
) {
    const marksTotal = question.marks_total;
    const prompt = readFileSync(join(process.cwd(), 'src', 'prompts', 'answer_book_photo.txt'), 'utf8')
        .replace('{{question_text}}', question.question_text)
        .replace('{{steps_block}}', renderStepsBlock(question));

    let object: PhotoCheck;
    try {
        const call =
            deps.callModel ??
            (async (p: string, b: Uint8Array, mt: string) => {
                const { object: o } = await generateObject({
                    model: google('gemini-2.5-flash'),
                    schema: photoCheckSchema,
                    temperature: 0,
                    // Same trap as the mic path: thinking tokens come out of the output
                    // budget and truncate the JSON.
                    maxOutputTokens: 3000,
                    providerOptions: { google: { thinkingConfig: { thinkingBudget: 0 } } },
                    messages: [
                        {
                            role: 'user',
                            content: [
                                { type: 'text', text: p },
                                { type: 'file', data: b, mediaType: mt },
                            ],
                        },
                    ],
                });
                return o as PhotoCheck;
            });
        object = await Promise.race([
            call(prompt, bytes, mediaType),
            new Promise<never>((_, rej) => setTimeout(() => rej(new Error('photo_timeout')), MODEL_TIMEOUT_MS)),
        ]);
    } catch {
        return { ...empty('check_failed', marksTotal), promptChars: prompt.length };
    }

    const outputChars = JSON.stringify(object).length;
    if (object.readable === false) return { ...empty('nothing_readable', marksTotal), promptChars: prompt.length, outputChars };
    if (object.on_topic === false) return { ...empty('not_this_answer', marksTotal), promptChars: prompt.length, outputChars };

    // Intersect against the authored answer; unknown or duplicate ids are dropped.
    const byId = new Map(question.answer.steps.map((s) => [s.id, s]));
    const judged = new Map<string, PhotoCheck['steps'][number]>();
    for (const j of object.steps ?? []) {
        const id = String(j?.step_id ?? '').trim();
        if (!byId.has(id) || judged.has(id)) continue;
        judged.set(id, j);
    }

    const steps: RecallStepResult[] = question.answer.steps.map((step) => {
        const j = judged.get(step.id);
        const conf = j && Number.isFinite(j.confidence) ? Math.max(0, Math.min(1, j.confidence)) : 0;
        // A low-confidence read is "unsure", never "missed": the tick-list lets the
        // student settle it, and an accusation from a blurry photo is the one thing
        // that would make this feature untrustworthy.
        const found = Boolean(j?.found) && conf >= UNCLEAR_FLOOR;
        const bucket: RecallStepResult['bucket'] = found ? 'covered' : conf >= UNCLEAR_FLOOR ? 'missed' : 'unsure';
        return {
            step_id: step.id,
            label: step.label,
            marks: step.marks,
            bucket,
            credit: step.recall!.credit,
            evidence: found ? (j?.evidence ?? null) : null,
            evidence_start: null,
            evidence_end: null,
            confidence: conf,
            demoted_by: !j ? 'omitted' : null,
        };
    });

    // Provisional only — the browser recomputes from what the student ticks.
    const marks_earned = Math.max(
        0,
        Math.min(marksTotal, steps.filter((s) => s.bucket === 'covered').reduce((a, s) => a + s.marks, 0)),
    );

    return {
        outcome: 'graded' as PhotoOutcome,
        transcript: '',
        thin_transcript: false,
        marks_earned,
        marks_total: marksTotal,
        steps,
        order_note: null,
        promptChars: prompt.length,
        outputChars,
    };
}
