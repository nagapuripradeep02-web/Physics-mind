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

// ── the paper each subject sits (TGBIE, first year, w.e.f. 2026-27) ──────────
//
// ONE table for the whole product: the build emits it as window.PM_PATTERNS,
// the schema below holds every card's marks_total to it, and the player reads
// its labels from it. Until 2026-08-28 the Maths papers were 75 marks with a
// 7-mark Section C (any 5 of 7), and 99 maths LAQ cards were authored at 7.
// The 2026-27 reform moved BOTH maths papers to 60 written + 15 activity-based
// learning, and the Telugu Akademi Maths-1A textbook prints the new model
// paper: 3 hours · 60 marks · A 10×2 all · B any 6 of 8 ×4 · C any 2 of 3 ×8 —
// the Physics shape. Physics/Chemistry/Botany/Zoology theory is unchanged
// (the 15 they gained is a practical, outside the written paper).
// Source record: docs/SYLLABUS_2026_27.md.
export type PaperSection = {
    key: 'VSAQ' | 'SAQ' | 'LAQ';
    section: string;
    /** questions printed */
    printed: number;
    /** questions the student must answer */
    answer: number;
    marks: number;
};
/**
 * The PRACTICE section (founder, 2026-09-02) — a fourth question kind that the
 * paper does not have.
 *
 * Every source book prints a PROBLEMS block (physics) or an NCERT "intext solved
 * problems" block (chemistry): real questions a student is set, and which an
 * examiner reuses, but which sit on NO paper section and carry no board mark
 * scheme. That is exactly why they were DEFERRED on 2026-08-20 — holding one
 * needed a fourth section across the build, the player and the gates. The 2026-27
 * books print 328 of them, and the deferred ones kept turning up on real papers,
 * so they get their own section rather than being forced into A/B/C.
 *
 * `marks` is a LIST, not a number, and that is the whole point: a practice problem
 * BORROWS the paper's numeric shapes instead of owning a slot. A one-step
 * numerical is the 2-mark shape; a derive-then-substitute is the 4-mark shape. It
 * also keeps a problem promotable — the day a paper asks one, it becomes a cut of
 * the same card at the same marks.
 *
 * A subject that omits `practice` FORBIDS problem cards, and the check FAILS
 * CLOSED (see allowedMarks). That is deliberate: the paper-section check skips a
 * subject it does not know, which is how a whole paper lost its marks gate by
 * silence on 2026-08-29. Silence must not buy a free pass twice.
 */
export type PracticeSection = { key: 'PROBLEM'; label: string; marks: number[] };
/** Every question kind a card may be. */
export type QType = 'VSAQ' | 'SAQ' | 'LAQ' | 'PROBLEM';
/**
 * The kinds the PAPER examines. PROBLEM is deliberately absent, and every
 * marks-weighted surface reads this list rather than hardcoding three strings:
 * the study planner, the exam-eve list and the readiness meter all allocate by
 * paper marks, and a question that is on no paper cannot be allocated.
 */
export const PAPER_QTYPES: readonly QType[] = ['VSAQ', 'SAQ', 'LAQ'];
export type PaperPattern = {
    label: string;
    total: number;
    /**
     * Marks outside the written paper (practical / activity-based learning).
     *
     * OPTIONAL since 2026-08-29. notebook.js renders this into the PAPER line
     * Vidi shows the STUDENT — "plus N marks practical outside the written
     * paper" — so a number here is a number a student reads. The SECOND-YEAR
     * practical mark is not sourced for either physics_2 or chemistry_2: the
     * 30 in docs/SYLLABUS_2026_27.md describes the PRE-reform arrangement and
     * the reform's 15 is first-year, so copying either would be inventing a
     * figure. Omit the key until one is sourced; the renderer already guards
     * with `pat.internal ? …`. Agreed with the Senior Chemistry desk.
     */
    internal?: { marks: number; kind: string };
    sections: PaperSection[];
    /**
     * The practice-problem shapes this paper's source book prints. OMITTED means
     * this subject may not carry problem cards at all — see PracticeSection.
     * Registered only where a source book has actually been read and found to
     * print a problems block, never by analogy with a neighbouring paper.
     */
    practice?: PracticeSection;
    wef: string;
};
const ABC_60: PaperSection[] = [
    { key: 'VSAQ', section: 'Section A', printed: 10, answer: 10, marks: 2 },
    { key: 'SAQ', section: 'Section B', printed: 8, answer: 6, marks: 4 },
    { key: 'LAQ', section: 'Section C', printed: 3, answer: 2, marks: 8 },
];
// The pre-reform maths paper - still the SECOND-YEAR shape in 2026-27. The
// 60-mark re-cut of Maths-1A/1B is FIRST YEAR ONLY: TV9 Telugu, 17 May 2026 —
// "these reforms apply only to first year this year; they will be implemented
// for second year from 2027-28". So a Maths-2A/2B student sitting March 2027 is
// still on A 10x2 all · B any 5 of 7 x4 · C any 5 of 7 x7 = 75, which is also
// what the Baby Bullet-Q Sr. Maths-2B book prints in its IPE BLUE PRINT (book
// p.5) and all five model papers (pp.118-127) — docs/IPE_MATHS_2B_SOURCE.md.
// Reusing ABC_60 here would put every long answer at 8 marks instead of 7: the
// exact defect the 1A/1B re-cut repaired, reversed. Re-cut to ABC_60 for the
// 2027-28 cohort, not before.
const ABC_75_MATHS_PRE_REFORM: PaperSection[] = [
    { key: 'VSAQ', section: 'Section A', printed: 10, answer: 10, marks: 2 },
    { key: 'SAQ', section: 'Section B', printed: 7, answer: 5, marks: 4 },
    { key: 'LAQ', section: 'Section C', printed: 7, answer: 5, marks: 7 },
];
/**
 * Practice problems at the paper's own numeric shapes. Registered on the two
 * first-year papers whose 2026-27 books were read chapter by chapter on
 * 2026-09-02 and found to print a problems block on every chapter
 * (answer-book/sources/chaitanya_{p1,c1}_2027_*.json — 130 physics, 198
 * chemistry). Every other paper omits `practice` until someone reads its book
 * and can say the same: botany and zoology print no numericals at all, and the
 * maths and second-year books have not been checked for one.
 */
const PRACTICE_2_OR_4: PracticeSection = { key: 'PROBLEM', label: 'Practice problem', marks: [2, 4] };

export const PAPER_PATTERNS: Record<string, PaperPattern> = {
    physics: { label: 'Physics', total: 60, internal: { marks: 15, kind: 'practical' }, sections: ABC_60, practice: PRACTICE_2_OR_4, wef: '2026-27' },
    chemistry: { label: 'Chemistry', total: 60, internal: { marks: 15, kind: 'practical' }, sections: ABC_60, practice: PRACTICE_2_OR_4, wef: '2026-27' },
    mathematics: { label: 'Maths 1A', total: 60, internal: { marks: 15, kind: 'activity-based learning' }, sections: ABC_60, wef: '2026-27' },
    mathematics_1b: { label: 'Maths 1B', total: 60, internal: { marks: 15, kind: 'activity-based learning' }, sections: ABC_60, wef: '2026-27' },
    botany: { label: 'Botany', total: 60, internal: { marks: 15, kind: 'practical' }, sections: ABC_60, wef: '2026-27' },
    // Junior Zoology is the same ABC_60 shape: Section A 10 of 10 x 2, B any 6 of 8 x 4,
    // C any 2 of 3 x 8 = 60, plus the 15-mark practical (docs/ZOOLOGY_START_HERE.md).
    zoology: { label: 'Zoology', total: 60, internal: { marks: 15, kind: 'practical' }, sections: ABC_60, wef: '2026-27' },

    // Senior Inter Physics Paper-II (2026-08-29). Same ABC_60 shape: the 2026-27
    // reform is FIRST YEAR ONLY and second year switches in 2027-28, so this paper
    // is unchanged. `internal` is deliberately omitted — see the type above.
    physics_2: { label: 'Physics II', total: 60, sections: ABC_60, wef: '2026-27' },

    // Senior Inter Chemistry Paper-II (2026-08-29). Same ABC_60 shape and the same
    // reasoning as physics_2 above: the reform is first year only and second year
    // switches in 2027-28, so `wef` names the syllabus year this row DESCRIBES.
    // `internal` is deliberately omitted — see the type above.
    chemistry_2: { label: 'Chemistry II', total: 60, sections: ABC_60, wef: '2026-27' },

    // Senior Inter Maths Paper-IIA (2026-08-29). NOT ABC_60. The 2026-27 reform
    // that took Maths 1A/1B to 60 marks is FIRST YEAR ONLY (Telangana Today,
    // 28 May 2026: the revision is to "the first-year intermediate public
    // examinations question paper pattern"; Resonance Colleges, 15 May 2026:
    // "the examination framework reforms shall apply to second-year students
    // from 2027-28 onwards"), so a 2A student sitting March 2027 writes the
    // unchanged 75-mark paper: A 10x2 all · B any 5 of 7 x4 · C any 5 of 7 x7.
    // The source book (Baby Bullet-Q Senior Inter Maths-2A, blueprint p.3 —
    // "prepared according to the Model Question Paper issued by B.I.E." — and
    // all five of its model papers pp.111-120) prints exactly this shape.
    // `internal` is deliberately omitted — see the type above. Founder decision
    // 2026-08-29: "if same as old for the mathematics, continue for 75 marks".
    mathematics_2a: { label: 'Maths 2A', total: 75, sections: ABC_75_MATHS_PRE_REFORM, wef: '2026-27' },

    // Senior Inter Botany Paper-II (2026-08-29). Same ABC_60 shape, confirmed against
    // the 2022 BIE blue print and all five of the book's model papers. `internal` is
    // deliberately omitted for the same reason as physics_2 and chemistry_2 above: the
    // book prints a Botany practical sheet but no mark value for it, and copying the
    // first-year 15 would be inventing a figure.
    botany_2: { label: 'Botany-II', total: 60, sections: ABC_60, wef: '2026-27' },

    // Senior Inter Maths-2B (2026-08-29). The OLD 75-mark shape — see
    // ABC_75_MATHS_PRE_REFORM above. `internal` is deliberately omitted: second year
    // carries no activity-based-learning mark in 2026-27, and this number reaches a
    // student. Maths-2A shares that table (one table, never a copy).
    mathematics_2b: { label: 'Maths 2B', total: 75, sections: ABC_75_MATHS_PRE_REFORM, wef: '2026-27' },
};
/**
 * The marks a question of this qtype carries on this subject's PAPER.
 * Returns undefined for PROBLEM, which is not on the paper — callers that must
 * validate a problem use allowedMarks instead.
 */
export function paperMarksFor(subject: string, qtype: QType): number | undefined {
    const p = PAPER_PATTERNS[subject];
    return p?.sections.find((s) => s.key === qtype)?.marks;
}

/**
 * Every marks value a question of this qtype may carry for this subject.
 *
 *   [8]      a paper section — exactly one legal value
 *   [2, 4]   a practice problem on a paper that declares one
 *   []       this subject forbids this qtype (a problem on a paper with no
 *            practice section) — the caller MUST report it
 *   undefined the subject is not in PAPER_PATTERNS at all
 *
 * The empty array is the fail-closed case and the reason this function exists:
 * returning undefined there would have let a problem card through unchecked on
 * any paper that never declared one.
 */
export function allowedMarks(subject: string, qtype: QType): number[] | undefined {
    const p = PAPER_PATTERNS[subject];
    if (!p) return undefined;
    if (qtype === 'PROBLEM') return p.practice ? p.practice.marks.slice() : [];
    const s = p.sections.find((x) => x.key === qtype);
    return s ? [s.marks] : [];
}

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

/**
 * A phase boundary inside a figure. The player STOPS here, shows `caption`
 * under the figure ("Step 2 — internal organs"), and waits for the student's
 * tap before drawing the next phase — the student watches each stage and can
 * copy it before continuing. A pause at index 0 is a caption-only marker for
 * phase 1 (no wait: the tap that opened the step is the consent). On the
 * instant path (revealAll / print / reduced-motion) pauses are skipped and no
 * caption shows — captions are drawing pedagogy, not answer content.
 */
const figurePauseSchema = z.object({
    type: z.literal('pause'),
    id: z.string().min(1),
    /** Phase name shown while the phase that FOLLOWS this pause draws. */
    caption: z.string().min(1).max(64).optional(),
});

const figureSchema = z
    .object({
        id: z.string().min(1),
        width: z.number().positive(),
        height: z.number().positive(),
        elements: z.array(
            z.discriminatedUnion('type', [figureStrokeSchema, figureLabelSchema, figurePauseSchema])
        ),
    })
    .superRefine((fig, ctx) => {
        fig.elements.forEach((el, i) => {
            if (el.type !== 'pause') return;
            if (i === fig.elements.length - 1) {
                ctx.addIssue({ code: 'custom', message: `figure "${fig.id}": pause "${el.id}" is the last element — a pause introduces the phase that follows it` });
            }
            if (i > 0 && fig.elements[i - 1].type === 'pause') {
                ctx.addIssue({ code: 'custom', message: `figure "${fig.id}": pauses "${fig.elements[i - 1].id}" and "${el.id}" are adjacent — a phase may not be empty` });
            }
            if (i === 0 && !el.caption) {
                ctx.addIssue({ code: 'custom', message: `figure "${fig.id}": a pause at index 0 is a caption-only phase-1 marker and requires a caption` });
            }
        });
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
        /**
         * How `text` is drawn. Default `plain` — Unicode math in the handwriting font,
         * typed character by character. `katex` means `text` is TeX SOURCE, typeset by
         * KaTeX at BUILD time (never in the browser — Rule 18) and revealed by a
         * width-clip wipe, because a typeset tree cannot be typed a character at a time.
         *
         * Use it ONLY for constructs with no honest one-line Unicode form: matrices and
         * determinants, and capital-letter subscripts (Iᴀ, I_B) which Unicode simply does
         * not encode. A fraction, a root or a power that reads fine on one line stays
         * `plain` — the notebook is a handwritten answer script, and every KaTeX line is
         * a small break in that illusion (docs/patterns/answer_book.md).
         */
        render: z.enum(['plain', 'katex']).optional(),
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

/**
 * One move of "Working in full" — the step explained slowly for a student WATCHING
 * the answer write itself (founder, 2026-09-04; proof card
 * ts_ipe_m2a_bt_series_1_by_3_3_6_sum). `say` is one plain sentence naming the
 * move (Rule 41); `show` is the intermediate math line the exam script skips —
 * plain Unicode like lines[], never KaTeX. A check with no line omits `show`.
 */
const explainMoveSchema = z.object({
    say: z.string().min(1),
    show: z.string().min(1).optional(),
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
        /**
         * "Working in full": 2-8 moves that walk the step slowly (see explainMoveSchema).
         * Rail card + Vidi chip + Vidi grounding ONLY — never on the notebook page,
         * which stays the exam script (the rail-only invariant). All steps carry it
         * or none do, gated by the build like memory_tip. Sparse by design: authored
         * where the page's own lines skip working a student cannot reconstruct.
         */
        explain: z.array(explainMoveSchema).min(1).max(8).optional(),
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
        /** Override the full working when the shorter step covers different ground. */
        explain: z.array(explainMoveSchema).min(1).max(8).optional(),
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
    qtype: z.enum(['VSAQ', 'SAQ', 'LAQ', 'PROBLEM']),
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
        // One PAPER = one subject value (same list as build_answer_book.ts
        // SUBJECTS): mathematics = Maths-1A (predates 1B), mathematics_1b =
        // Maths-1B, physics_2 = Senior Inter Physics Paper-II (year_cycle
        // 'second_year'). Unit numbers namespace per subject — and physics_2
        // rather than "physics units 15-30" is load-bearing, not cosmetic:
        // notebook.js LEGACY_PHYSICS_KEYS remaps exact `physics-N` keys for the
        // 2026-27 first-year renumbering, so second-year chapters filed under
        // `physics` would be silently remapped onto first-year units.
        subject: z.enum(['physics', 'chemistry', 'mathematics', 'mathematics_1b', 'botany', 'zoology', 'physics_2', 'chemistry_2', 'botany_2', 'mathematics_2a', 'mathematics_2b']),
        year_cycle: z.enum(['first_year', 'second_year']),
        class_label: z.string().min(1),
        unit: z.object({ number: z.number().int().positive(), name: z.string().min(1) }),
        chapter: z.string().min(1),
        qtype: z.enum(['VSAQ', 'SAQ', 'LAQ', 'PROBLEM']),
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
        // The card must carry the marks its PAPER gives that section — a 7-mark
        // maths LAQ is the old pattern and would print the wrong number on every
        // surface (rail chip, red gutter, Vidi). Cuts are held to the same table.
        // A PROBLEM is not on the paper, so it is held to its subject's practice
        // shapes instead, and to NOTHING BEING DECLARED being an error rather
        // than a free pass (allowedMarks returns [] for that, never undefined).
        const marksProblem = (
            qtype: QType, marks: number, where: string,
        ): string | null => {
            const allowed = allowedMarks(q.subject, qtype);
            if (allowed === undefined || allowed.includes(marks)) return null;
            const wef = PAPER_PATTERNS[q.subject].wef;
            if (!allowed.length) {
                return qtype === 'PROBLEM'
                    ? `${where}the ${q.subject} paper declares no practice section, so it may not carry a PROBLEM card — register \`practice\` in PAPER_PATTERNS once its book is read, or file this question under the section the paper asks it in`
                    : `${where}a ${q.subject} paper has no ${qtype} section on the ${wef} pattern`;
            }
            return qtype === 'PROBLEM'
                ? `${where}marks_total = ${marks} but a ${q.subject} practice problem is ${allowed.join(' or ')} marks (PAPER_PATTERNS.practice) — a problem borrows the paper's numeric shapes, it does not own a slot`
                : `${where}marks_total = ${marks} but a ${q.subject} ${qtype} is ${allowed[0]} marks on the ${wef} paper (PAPER_PATTERNS)`;
        };
        const rootIssue = marksProblem(q.qtype, q.marks_total, '');
        if (rootIssue) ctx.addIssue({ code: 'custom', message: rootIssue });
        for (const c of q.cuts ?? []) {
            const cutIssue = marksProblem(c.qtype, c.marks_total, `cut "${c.key}": `);
            if (cutIssue) ctx.addIssue({ code: 'custom', message: cutIssue });
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
