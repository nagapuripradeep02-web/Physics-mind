/**
 * answerBook.ts — zod schema for the Answer Book question files
 * (`answer-book/questions/*.json`, schema_version "answer_book_v1").
 *
 * A question file is the single source of truth for one board-exam question:
 * identity header (board-specific) + an ordered `answer.steps[]` (portable
 * physics). The build (`src/scripts/build_answer_book.ts`) hard-fails on any
 * schema violation, and on the one gate that matters for this product:
 * sum(steps[].marks) must equal marks_total.
 *
 * This schema is question-keyed and deliberately separate from the concept
 * schema (`conceptJson.ts`) — Rule 20 [D] suspends concept board-mode
 * authoring; this track does not touch it.
 */
import { z } from 'zod/v4';

// ── figure (progressive-stroke diagram) ─────────────────────────────────────

/** One drawn element. Array order IS the draw order — no separate order field. */
const figureStrokeSchema = z.object({
    type: z.literal('stroke'),
    id: z.string().min(1),
    /** SVG path data. Straight lines and arcs; hand-authored 1-2px imperfection welcome. */
    d: z.string().min(1),
    /** Reveal duration in ms. */
    ms: z.number().int().positive(),
    /** "pencil" = thin grey-blue dashed construction line (revealed by clip wipe, not dashoffset). */
    pen: z.enum(['pencil']).optional(),
    /** Wipe axis for pen:"pencil" strokes — along the drawing direction. */
    wipe: z.enum(['x', 'y']).optional(),
    /** Stroke width override (default 2.25). */
    w: z.number().positive().optional(),
});

const figureLabelSchema = z.object({
    type: z.literal('label'),
    id: z.string().min(1),
    x: z.number(),
    y: z.number(),
    text: z.string().min(1),
    /** Fade duration in ms. */
    ms: z.number().int().positive(),
    /** em = vector-name emphasis (P, Q, R): bold, slightly larger. */
    em: z.boolean().optional(),
    /** sm = small annotation (Q sin θ, Q cos θ). */
    sm: z.boolean().optional(),
});

const figureSchema = z.object({
    id: z.string().min(1),
    width: z.number().positive(),
    height: z.number().positive(),
    elements: z.array(z.discriminatedUnion('type', [figureStrokeSchema, figureLabelSchema])),
});

// ── answer steps ─────────────────────────────────────────────────────────────

const lineStyleSchema = z.enum(['heading', 'normal', 'indent', 'eq', 'boxed']);

/** A written line: plain string, or object with style/pause. One line = one rule. */
const lineSchema = z.union([
    z.string().min(1),
    z.object({
        text: z.string().min(1),
        style: lineStyleSchema.optional(),
        pause_after_ms: z.number().int().nonnegative().optional(),
    }),
]);

/**
 * Voice-recall rubric for one step — grader-side only, never shipped to the browser.
 *
 * Used by the "speak your recall" check: the student says the SKELETON of the answer
 * from memory and we report what they covered. Authored per question (~12-15 min for
 * an 8-mark LAQ). A question is recall-enabled only when EVERY step carries one.
 */
const stepRecallSchema = z.object({
    /**
     * name_it — the student physically CANNOT speak this step (a drawing, a construction,
     *           a list of extras). Naming the move is FULL credit. This single enum removes
     *           the largest class of false negative before the model is even asked.
     * say_it  — the idea itself must come through in some words; naming alone is not enough.
     */
    credit: z.enum(['name_it', 'say_it']),
    /** One sentence: what must come through. Grader-facing — never shown to a student. */
    must_convey: z.string().min(1),
    /** Spoken phrasings that DO earn this step. 3-5 is enough. */
    accept: z.array(z.string().min(1)).min(1),
    /** Near-misses that do NOT earn it — mostly stops a neighbouring step's words leaking in. */
    reject: z.array(z.string().min(1)).default([]),
    /** Forms speech-to-text is likely to produce for this step's terms. Drives the rescue pass. */
    heard_as: z.array(z.string().min(1)).default([]),
});

const stepSchema = z
    .object({
        /** Stable forever — the chatbot seam + deep-link anchor. */
        id: z.string().regex(/^[a-z0-9_]+$/),
        kind: z.enum(['text', 'equation', 'diagram', 'boxed_final']),
        /** Short literal rail label (Rule 41d: first words carry the meaning). */
        label: z.string().min(1),
        /** Marks this step earns. 0 is legal (extra content the examiner does not mark). */
        marks: z.number().int().nonnegative(),
        /** Red-gutter caption beside the tick; omit when marks === 0. */
        mark_note: z.string().optional(),
        /** Rail-side guidance (never rendered on the notebook page). Future chatbot grounding. */
        margin_note: z.string().optional(),
        lines: z.array(lineSchema).optional(),
        figure: figureSchema.optional(),
        /** Voice-recall rubric. All steps carry one, or none do (enforced question-level). */
        recall: stepRecallSchema.optional(),
        /**
         * One line: WHY this step exists — the reasoning a student needs to reconstruct
         * the answer rather than memorise it. Shown in the rail in Study mode only.
         * NEVER rendered on the notebook page: the page is an answer script, not a textbook
         * (Rules 24/34), and anything inside .step-block would be typed and would change
         * pagination.
         */
        why: z.string().min(1).optional(),
        /**
         * Where students actually lose this step's marks. 1-3 short, literal items.
         * Rail only, same reasoning as `why`.
         */
        common_mistakes: z.array(z.string().min(1)).max(3).optional(),
    })
    .superRefine((step, ctx) => {
        if (step.kind === 'diagram') {
            if (!step.figure) ctx.addIssue({ code: 'custom', message: `step "${step.id}": kind "diagram" requires a figure` });
        } else if (!step.lines || step.lines.length === 0) {
            ctx.addIssue({ code: 'custom', message: `step "${step.id}": kind "${step.kind}" requires non-empty lines[]` });
        }
        if (step.marks === 0 && step.mark_note) {
            ctx.addIssue({ code: 'custom', message: `step "${step.id}": mark_note is set but marks is 0 — an unmarked step gets no red mark` });
        }
    });

// ── question header ──────────────────────────────────────────────────────────

export const answerBookQuestionSchema = z
    .object({
        schema_version: z.literal('answer_book_v1'),
        question_id: z.string().regex(/^[a-z0-9_]+$/),

        // identity: the only board-specific block in the file
        board: z.string().min(1), // e.g. "ts_ipe"
        board_label: z.string().min(1),
        subject: z.enum(['physics', 'chemistry', 'mathematics']),
        year_cycle: z.enum(['first_year', 'second_year']),
        class_label: z.string().min(1),
        unit: z.object({ number: z.number().int().positive(), name: z.string().min(1) }),
        chapter: z.string().min(1),
        qtype: z.enum(['VSAQ', 'SAQ', 'LAQ']),
        marks_total: z.number().int().positive(),
        paper_section: z.string().min(1),
        expected_time_min: z.number().int().positive(),
        question_text: z.string().min(1),
        /** Exam appearances — claims until a teacher confirms (see verification). */
        appearances: z.array(z.object({ year: z.number().int(), q_no: z.number().int().optional() })),
        /** Human-readable mark breakdown shown in the rail (display only; steps[] is the truth). */
        mark_split: z.array(z.object({ label: z.string().min(1), marks: z.number().int().positive() })),
        /** Rule 38g spirit: mark split + appearances are claims until a TS IPE teacher confirms. */
        verification: z.object({
            status: z.enum(['unverified', 'teacher_verified']),
            needs_teacher_verification: z.boolean(),
            note: z.string().optional(),
        }),

        /** What the student is asked to say aloud in the recall check. Required when steps carry `recall`. */
        recall_prompt: z.string().min(1).optional(),

        answer: z.object({
            /** Written at the top of page 1, e.g. ["Q. 21", "Addition of Vectors — 8 marks"]. */
            page_header: z.array(z.string().min(1)).min(1),
            steps: z.array(stepSchema).min(1),
        }),
    })
    .superRefine((q, ctx) => {
        const sum = q.answer.steps.reduce((acc, s) => acc + s.marks, 0);
        if (sum !== q.marks_total) {
            ctx.addIssue({
                code: 'custom',
                message: `sum(steps[].marks) = ${sum} but marks_total = ${q.marks_total} — every mark must be accounted for`,
            });
        }
        const splitSum = q.mark_split.reduce((acc, s) => acc + s.marks, 0);
        if (splitSum !== q.marks_total) {
            ctx.addIssue({
                code: 'custom',
                message: `sum(mark_split[].marks) = ${splitSum} but marks_total = ${q.marks_total}`,
            });
        }
        const ids = q.answer.steps.map((s) => s.id);
        const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
        if (dupes.length) {
            ctx.addIssue({ code: 'custom', message: `duplicate step ids: ${[...new Set(dupes)].join(', ')}` });
        }
        // Recall rubric is all-or-none: a partial rubric would silently tell a student
        // they missed a step that was never graded.
        const withRecall = q.answer.steps.filter((s) => s.recall).length;
        if (withRecall > 0 && withRecall !== q.answer.steps.length) {
            ctx.addIssue({
                code: 'custom',
                message:
                    `recall rubric is on ${withRecall}/${q.answer.steps.length} steps — author all of them or none. ` +
                    `A partial rubric would report an ungraded step as missed.`,
            });
        }
        if (withRecall > 0 && !q.recall_prompt) {
            ctx.addIssue({ code: 'custom', message: 'steps carry a recall rubric, so recall_prompt is required' });
        }
    });

export type AnswerBookQuestion = z.infer<typeof answerBookQuestionSchema>;
