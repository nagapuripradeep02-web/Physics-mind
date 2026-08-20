/**
 * answerBookRecall.ts — the MODEL-FACING schema for the spoken-recall check.
 *
 * Deliberately the loosest schema that still parses: Gemini's structured-output
 * dialect drops most zod refinements, so ranges and constraints are enforced
 * server-side in recallGrader.ts (the repo already clamps by hand — see
 * inputUnderstanding.ts). Keeping refinements here would give false assurance.
 *
 * Note what is ABSENT by construction: there is no marks field, no score, no total.
 * The model is structurally incapable of returning a number that reaches a student.
 */
import { z } from 'zod/v4';

export const recallStepJudgementSchema = z.object({
    step_id: z.string(),
    covered: z.boolean(),
    /** Must be an exact substring of the transcript when covered, else null. Verified server-side. */
    evidence: z.string().nullable(),
    /** 0..1, about the model's own certainty. Clamped server-side. */
    confidence: z.number(),
});

export const recallCheckSchema = z.object({
    /** false only when the transcript is not an attempt at this answer at all. */
    on_topic: z.boolean(),
    steps: z.array(recallStepJudgementSchema),
});

export type RecallCheck = z.infer<typeof recallCheckSchema>;
export type RecallStepJudgement = z.infer<typeof recallStepJudgementSchema>;
