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
    });

export type AnswerBookQuestion = z.infer<typeof answerBookQuestionSchema>;
