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
        /**
         * One line: how to REMEMBER this step (Vidi's "How to remember?" chip).
         * Plain literal English (Rule 41) — a real memory device (order, contrast,
         * a named anchor image), never decoration. Optional and sparse by design
         * (like margin_note): the chip shows only where a tip exists. Authored
         * 3-star + LAQ first (founder, 2026-08-22).
         */
        memory_tip: z.string().min(1).optional(),
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

// ── cuts: the same question answered at two lengths ──────────────────────────
//
// The SAME derivation is asked at 8 marks (Section C) and at 4 (Section B), and a
// student needs to see HOW MUCH to write for each. A cut is therefore a view over
// the one authored step list, never a second copy of the answer: it selects which
// steps appear, re-marks them, and may substitute a shorter `lines` for a step
// that has to absorb an omitted neighbour.
//
// A step id absent from `steps` is OMITTED from that cut. That makes coherence the
// author's job (the Rule 38a test, applied here): with the omitted steps hidden,
// no surviving line may refer to something only an omitted step introduced.

const cutStepSchema = z
    .object({
        marks: z.number().int().nonnegative(),
        mark_note: z.string().optional(),
        /** Override the rail label when the shorter step covers more ground. */
        label: z.string().min(1).optional(),
        /** Override the written lines. Omit to reuse the full-cut lines verbatim. */
        lines: z.array(lineSchema).optional(),
        /**
         * Override the rail guidance when the full cut's wording states a mark
         * count this cut contradicts ("the two marks are for the words alone"
         * beside a 1-mark step). Same reasoning for `why`.
         */
        margin_note: z.string().optional(),
        why: z.string().min(1).optional(),
        /** Override the memory tip when the shorter step covers different ground. */
        memory_tip: z.string().min(1).optional(),
    })
    .superRefine((cs, ctx) => {
        if (cs.marks === 0 && cs.mark_note) {
            ctx.addIssue({ code: 'custom', message: 'mark_note is set but marks is 0 — an unmarked step gets no red mark' });
        }
    });

const cutSchema = z.object({
    key: z.string().regex(/^[a-z0-9_]+$/),
    /** Toggle button text, e.g. "8-mark answer". Rule 41: literal, not clever. */
    label: z.string().min(1),
    qtype: z.enum(['VSAQ', 'SAQ', 'LAQ']),
    marks_total: z.number().int().positive(),
    paper_section: z.string().min(1),
    expected_time_min: z.number().int().positive(),
    /**
     * The paper does not ask the same words at both lengths — the 8-mark form asks
     * for the trajectory AND the results, the 4-mark form asks only for the results.
     * Omit to reuse the question's own text.
     */
    question_text: z.string().min(1).optional(),
    mark_split: z.array(z.object({ label: z.string().min(1), marks: z.number().int().positive() })),
    /** step_id -> override. A step id NOT present here does not appear in this cut. */
    steps: z.record(z.string(), cutStepSchema),
    /** Same claim discipline as the question's: an invented split must say so. */
    needs_teacher_verification: z.boolean(),
    note: z.string().optional(),
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
        /**
         * Exam appearances — claims until a teacher confirms (see verification).
         * `board` absent = ts_ipe (the historical meaning; TS years predate the field).
         * ap_ipe entries exist because both boards draw one NCERT bank at different
         * lengths — the March 2026 AP paper asked six of our authored questions
         * (docs/patterns/answer_book.md §Board landscape).
         */
        appearances: z.array(z.object({
            year: z.number().int(),
            q_no: z.number().int().optional(),
            board: z.enum(['ts_ipe', 'ap_ipe']).optional(),
        })),
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

        /**
         * One authored sentence of examiner insight for Vidi's greeting — what the
         * template line (stars + asked years) cannot say: "most students lose the
         * figure mark here". Optional and sparse; plain literal English (Rule 41).
         */
        insider_note: z.string().min(1).optional(),

        /**
         * Optional: the same answer offered at more than one length. cuts[0] is the
         * DEFAULT and must restate the root header exactly, so a consumer that knows
         * nothing about cuts (the grader, PM_ANSWER) still reads the truth.
         */
        cuts: z.array(cutSchema).min(2).optional(),

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

        // ── cuts ─────────────────────────────────────────────────────────────
        if (q.cuts) {
            const stepById = new Map(q.answer.steps.map((s) => [s.id, s]));
            const keys = q.cuts.map((c) => c.key);
            const dupKeys = keys.filter((k, i) => keys.indexOf(k) !== i);
            if (dupKeys.length) {
                ctx.addIssue({ code: 'custom', message: `duplicate cut keys: ${[...new Set(dupKeys)].join(', ')}` });
            }

            // cuts[0] IS the root. Without this the chip, the header and the grader
            // can disagree with the cut the student is looking at.
            const d = q.cuts[0];
            const rootMismatch: string[] = [];
            if (d.qtype !== q.qtype) rootMismatch.push(`qtype ${d.qtype} vs ${q.qtype}`);
            if (d.marks_total !== q.marks_total) rootMismatch.push(`marks_total ${d.marks_total} vs ${q.marks_total}`);
            if (d.paper_section !== q.paper_section) rootMismatch.push(`paper_section "${d.paper_section}" vs "${q.paper_section}"`);
            if (d.expected_time_min !== q.expected_time_min) rootMismatch.push(`expected_time_min ${d.expected_time_min} vs ${q.expected_time_min}`);
            if (rootMismatch.length) {
                ctx.addIssue({
                    code: 'custom',
                    message: `cuts[0] ("${d.key}") is the default and must restate the root header — ${rootMismatch.join('; ')}`,
                });
            }

            for (const cut of q.cuts) {
                const ids = Object.keys(cut.steps);
                if (!ids.length) {
                    ctx.addIssue({ code: 'custom', message: `cut "${cut.key}": no steps — a cut must show something` });
                    continue;
                }
                for (const id of ids) {
                    const base = stepById.get(id);
                    if (!base) {
                        ctx.addIssue({ code: 'custom', message: `cut "${cut.key}": step "${id}" does not exist in answer.steps` });
                        continue;
                    }
                    // A figure is authored once, in the step; a cut may not retype it.
                    if (base.kind === 'diagram' && cut.steps[id].lines) {
                        ctx.addIssue({
                            code: 'custom',
                            message: `cut "${cut.key}": step "${id}" is a diagram — override its figure in the step, not with lines[]`,
                        });
                    }
                }
                const cutSum = ids.reduce((acc, id) => acc + cut.steps[id].marks, 0);
                if (cutSum !== cut.marks_total) {
                    ctx.addIssue({
                        code: 'custom',
                        message: `cut "${cut.key}": sum(steps[].marks) = ${cutSum} but marks_total = ${cut.marks_total}`,
                    });
                }
                const cutSplit = cut.mark_split.reduce((acc, r) => acc + r.marks, 0);
                if (cutSplit !== cut.marks_total) {
                    ctx.addIssue({
                        code: 'custom',
                        message: `cut "${cut.key}": sum(mark_split[].marks) = ${cutSplit} but marks_total = ${cut.marks_total}`,
                    });
                }
                // Order is the authored order, always (Rule 25d): a cut hides, never reorders.
                const order = q.answer.steps.map((s) => s.id).filter((id) => ids.includes(id));
                if (order.length !== ids.length) {
                    ctx.addIssue({ code: 'custom', message: `cut "${cut.key}": step id list disagrees with answer.steps` });
                }
            }
        }
    });

export type AnswerBookQuestion = z.infer<typeof answerBookQuestionSchema>;
