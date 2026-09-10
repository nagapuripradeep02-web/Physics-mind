/**
 * eapcetPool.ts — zod schema for the EAPCET physics pool RELEASE file
 * (`eapcet/pool/physics_pool_v1.release.json`, schema "eapcet_physics_pool_v1"),
 * the one file the EAPCET app is allowed to build from.
 *
 * The release is produced by scripts/eapcet/build_release.py from the pool, the
 * gate, the audits and the founder's spot sheet. Only a VERIFIED question carries
 * its solution; the build strips every solution out of index.html regardless and
 * serves them from ep_solutions to entitled devices. What this schema enforces is
 * the part of that story a typo could break: a solution whose option is not the
 * official key, an "open" chapter with fewer verified questions than a run plus
 * three siblings needs, a sibling that names a question the pool does not hold.
 *
 * Routes and shapes (docs/superpowers/specs/2026-09-09-eapcet-precise-diagnosis-design.md):
 * a solution whose route sidecar passed its own gate and audit carries
 * `verified.routes`, and only then its release copy carries `right_route` and a
 * `type`/`route` on every common mistake. A question may carry a `shape` only
 * from its chapter's authored list. Every one of these is optional so a chapter
 * without the content still validates and runs, thinner.
 *
 * Question-keyed and separate from answerBook.ts on purpose: the EAPCET question
 * ships verbatim from a government paper (corpus rule 5, EAPCET exception), the
 * IPE card is our own restatement.
 */
import { z } from 'zod/v4';

/** A chapter opens with a run's ten plus three unseen siblings for "strong now". */
export const EAPCET_OPEN_AT = 13;
/** At most this many shapes per chapter; the result screen lists them all. */
export const EAPCET_MAX_SHAPES = 12;

const HEX64 = /^[0-9a-f]{64}$/;
const SHAPE_KEY = /^[a-z0-9_-]{1,40}$/;

/** `distractor`: a wrong option no method reaches (the entry is flagged `distractor: true`
    in the solution and typed so in its sidecar); a student who picks it guessed or misread. */
export const EapcetMistakeTypeSchema = z.enum(['concept', 'application', 'calculation', 'careless', 'distractor']);
/** The two types whose mistake IS a route the student can claim. */
export const EAPCET_ROUTE_TYPES = new Set<string>(['concept', 'application']);

export const EapcetSolutionSchema = z.object({
    schema: z.literal('eapcet_solution_v1'),
    question_id: z.string().min(1),
    approach: z.string().min(1),
    steps: z.array(z.object({
        text: z.string().min(1),
        equation: z.string().optional(),
        why_this_step: z.string().optional(),
    }).strict()).min(2).max(8),
    final_answer: z.object({
        option: z.number().int().min(1).max(4),
        value: z.string().min(1),
    }).strict(),
    confidence: z.literal('sure'),
    common_mistakes: z.array(z.object({
        option: z.number().int().min(1).max(4).nullable(),
        text: z.string().min(1),
        distractor: z.literal(true).optional(),
        type: EapcetMistakeTypeSchema.optional(),
        route: z.string().min(1).nullable().optional(),
    }).strict()).max(3),
    concept_tags: z.array(z.string().min(1)).min(1).max(4),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    mistake_type_hint: z.enum(['concept', 'calculation', 'application']),
    right_route: z.string().min(1).nullable().optional(),
    authored_by: z.object({
        model: z.string(),
        wave: z.number().int(),
        agent: z.string(),
        at: z.string(),
    }).strict(),
}).strict();

export const EapcetRoutesVerifiedSchema = z.object({
    routes_sha: z.string().regex(HEX64),
    audit_verdict: z.enum(['ok', 'weak']),
    audited_by: z.string().min(1),
}).strict();

export const EapcetVerifiedSchema = z.object({
    gate_sha: z.string().regex(HEX64),
    audit_verdict: z.enum(['ok', 'weak']),
    audited_by: z.string().min(1),
    spot_checked: z.boolean(),
    routes: EapcetRoutesVerifiedSchema.nullable().optional(),
}).strict();

export const EapcetGroundingSchema = z.object({
    answer_book_cards: z.array(z.object({
        question_id: z.string().min(1),
        score: z.number().nullable(),
        anchor: z.boolean().optional(),
        shape: z.string().regex(SHAPE_KEY).optional(),   // grounded by the question's shape, not by text
    }).strict()),
    concept_tags: z.array(z.string()).optional(),
    weak_match: z.boolean().optional(),
    unit_cards: z.number().int().optional(),
}).strict();

export const EapcetShapeRefSchema = z.object({
    key: z.string().regex(SHAPE_KEY),
    label: z.string().min(1).max(60),
}).strict();

export const EapcetShapeSchema = z.object({
    key: z.string().regex(SHAPE_KEY),
    label: z.string().min(1).max(60),
    definition: z.string().optional(),
    cards: z.array(z.string().min(1)).max(3).optional(),   // the Answer Book cards a teacher opens for this shape
}).strict();

export const EapcetQuestionSchema = z.object({
    id: z.string().regex(/^tg_eapcet_\d{4}_\d{8}_(fn|an)_q\d{3}$/),
    chapter_key: z.string().regex(/^p[12]-\d{2}$/),
    chapter: z.string().min(1),
    year: z.number().int().min(2021),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    session: z.enum(['FN', 'AN']),
    q_no: z.number().int().min(1).max(160),
    asked_label: z.string().min(1),
    question_en: z.string().min(1),
    options_en: z.array(z.string().min(1)).length(4),
    answer: z.number().int().min(1).max(4),
    recurrence: z.number().int().min(0),
    twin_of: z.array(z.string()),
    grounding: EapcetGroundingSchema,
    shape: EapcetShapeRefSchema.optional(),
    solution: EapcetSolutionSchema.optional(),
    verified: EapcetVerifiedSchema.optional(),
}).strict().superRefine((q, ctx) => {
    if ((q.solution === undefined) !== (q.verified === undefined)) {
        ctx.addIssue({ code: 'custom', message: `${q.id}: solution and verified must travel together` });
    }
    if (!q.solution) return;
    if (q.solution.question_id !== q.id) {
        ctx.addIssue({ code: 'custom', message: `${q.id}: solution.question_id is ${q.solution.question_id}` });
    }
    if (q.solution.final_answer.option !== q.answer) {
        ctx.addIssue({ code: 'custom', message: `${q.id}: solution says option ${q.solution.final_answer.option}, the key says ${q.answer}` });
    }
    const routed = !!q.verified?.routes;
    const s = q.solution;
    if (routed) {
        if (s.right_route === undefined) ctx.addIssue({ code: 'custom', message: `${q.id}: routes are verified but right_route is missing` });
        s.common_mistakes.forEach((m, i) => {
            if (!m.type) { ctx.addIssue({ code: 'custom', message: `${q.id}: common_mistakes[${i}] has no type although routes are verified` }); return; }
            const wantsRoute = EAPCET_ROUTE_TYPES.has(m.type);
            if (wantsRoute && (typeof m.route !== 'string' || !m.route.trim())) {
                ctx.addIssue({ code: 'custom', message: `${q.id}: common_mistakes[${i}] is ${m.type} and needs a route phrase` });
            }
            if (!wantsRoute && m.route) {
                ctx.addIssue({ code: 'custom', message: `${q.id}: common_mistakes[${i}] is ${m.type} and must not carry a route` });
            }
            if (m.route && m.route === m.text) {
                ctx.addIssue({ code: 'custom', message: `${q.id}: common_mistakes[${i}] route equals its text` });
            }
        });
        if (s.mistake_type_hint !== 'concept' && s.right_route === null) {
            ctx.addIssue({ code: 'custom', message: `${q.id}: hint is ${s.mistake_type_hint} but right_route is null` });
        }
    } else {
        if (s.right_route !== undefined) ctx.addIssue({ code: 'custom', message: `${q.id}: right_route present without verified routes` });
        s.common_mistakes.forEach((m, i) => {
            if (m.type !== undefined || m.route !== undefined) {
                ctx.addIssue({ code: 'custom', message: `${q.id}: common_mistakes[${i}] carries type/route without verified routes` });
            }
        });
    }
});

export const EapcetChapterSchema = z.object({
    key: z.string().regex(/^p[12]-\d{2}$/),
    name: z.string().min(1),
    paper: z.enum(['first_year', 'second_year']),
    order: z.number().int().min(1),
    answer_book_unit: z.object({ subject: z.enum(['physics', 'physics_2']), number: z.number().int().min(1) }).strict(),
    asked_total: z.number().int().min(0),
    share_pct: z.number().min(0).max(100),
    per_exam: z.number().min(0),
    eligible: z.number().int().min(0),
    pool_ids: z.array(z.string()),
    verified_ids: z.array(z.string()),
    open: z.boolean(),
    closed_because: z.string().nullable(),
    shapes: z.array(EapcetShapeSchema).max(EAPCET_MAX_SHAPES).optional(),
}).strict();

export const EapcetPoolReleaseSchema = z.object({
    schema: z.literal('eapcet_physics_pool_v1'),
    built_from: z.object({
        bank: z.string(),
        bank_sha256: z.string().regex(HEX64),
        bank_rows: z.number().int(),
        selector_version: z.number().int(),
        built_at: z.string(),
        release_at: z.string(),
        open_at: z.literal(EAPCET_OPEN_AT),
        gated: z.number().int(),
        verified: z.number().int(),
        shapes_sha256: z.string().regex(HEX64).optional(),
    }).strict(),
    exam: z.object({ shifts: z.number().int(), physics_per_shift: z.number().int() }).strict(),
    rules: z.object({
        exclude: z.array(z.string()).min(1),
        twin_jaccard: z.number(),
        recurrence_jaccard_digits_masked: z.number(),
        target_per_chapter: z.number().int(),
        siblings: z.number().int(),
    }).strict(),
    chapters: z.array(EapcetChapterSchema).min(1),
    questions: z.record(z.string(), EapcetQuestionSchema),
    siblings: z.record(z.string(), z.array(z.string())),
}).strict().superRefine((rel, ctx) => {
    const ids = new Set(Object.keys(rel.questions));
    for (const [id, q] of Object.entries(rel.questions)) {
        if (q.id !== id) ctx.addIssue({ code: 'custom', message: `questions[${id}].id is ${q.id}` });
    }
    const seen = new Set<string>();
    for (const c of rel.chapters) {
        if (seen.has(c.key)) ctx.addIssue({ code: 'custom', message: `chapter ${c.key} listed twice` });
        seen.add(c.key);
        for (const id of c.pool_ids) {
            if (!ids.has(id)) ctx.addIssue({ code: 'custom', message: `${c.key} pool_ids names ${id}, not in questions` });
            else if (rel.questions[id].chapter_key !== c.key) {
                ctx.addIssue({ code: 'custom', message: `${id} sits in ${c.key} pool_ids but its chapter_key is ${rel.questions[id].chapter_key}` });
            }
        }
        const pool = new Set(c.pool_ids);
        for (const id of c.verified_ids) {
            if (!pool.has(id)) ctx.addIssue({ code: 'custom', message: `${c.key} verified_ids names ${id}, not in its pool_ids` });
            else if (!rel.questions[id]?.solution) ctx.addIssue({ code: 'custom', message: `${c.key} verified_ids names ${id}, which carries no solution` });
        }
        for (const id of c.pool_ids) {
            if (rel.questions[id]?.solution && !c.verified_ids.includes(id)) {
                ctx.addIssue({ code: 'custom', message: `${id} carries a solution but is not in ${c.key} verified_ids` });
            }
        }
        if (c.open && c.verified_ids.length < EAPCET_OPEN_AT) {
            ctx.addIssue({ code: 'custom', message: `${c.key} is open with ${c.verified_ids.length} verified (needs ${EAPCET_OPEN_AT})` });
        }
        if (c.open && c.closed_because !== null) {
            ctx.addIssue({ code: 'custom', message: `${c.key} is open but carries closed_because` });
        }
        // Shapes: every listed key unique and used by a pool question; every used key listed.
        const listed = new Map<string, number>();
        for (const s of c.shapes ?? []) {
            if (listed.has(s.key)) ctx.addIssue({ code: 'custom', message: `${c.key} lists shape ${s.key} twice` });
            listed.set(s.key, 0);
        }
        for (const id of c.pool_ids) {
            const sh = rel.questions[id]?.shape;
            if (!sh) continue;
            if (!c.shapes) { ctx.addIssue({ code: 'custom', message: `${id} carries shape ${sh.key} but ${c.key} lists no shapes` }); continue; }
            if (!listed.has(sh.key)) { ctx.addIssue({ code: 'custom', message: `${id} carries shape ${sh.key}, not in ${c.key}'s list` }); continue; }
            listed.set(sh.key, listed.get(sh.key)! + 1);
        }
        for (const [k, n] of listed) {
            if (n === 0) ctx.addIssue({ code: 'custom', message: `${c.key} lists shape ${k} that no pool question carries` });
        }
    }
    for (const [id, sibs] of Object.entries(rel.siblings)) {
        if (!ids.has(id)) ctx.addIssue({ code: 'custom', message: `siblings[${id}]: not in questions` });
        for (const s of sibs) {
            if (!ids.has(s)) ctx.addIssue({ code: 'custom', message: `siblings[${id}] names ${s}, not in questions` });
            else if (s === id) ctx.addIssue({ code: 'custom', message: `siblings[${id}] names itself` });
            else if (rel.questions[s].chapter_key !== rel.questions[id]?.chapter_key) {
                ctx.addIssue({ code: 'custom', message: `siblings[${id}] names ${s} from another chapter` });
            }
        }
    }
});

export type EapcetSolution = z.infer<typeof EapcetSolutionSchema>;
export type EapcetQuestion = z.infer<typeof EapcetQuestionSchema>;
export type EapcetChapter = z.infer<typeof EapcetChapterSchema>;
export type EapcetPoolRelease = z.infer<typeof EapcetPoolReleaseSchema>;
