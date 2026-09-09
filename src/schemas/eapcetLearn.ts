/**
 * eapcetLearn.ts — the Learn-and-practice content pack: one chapter of
 * lessons. A lesson (subtopic) is one idea: a concept card, one check
 * question about the belief, and three basic practice questions, each with
 * the finder's route menu (one right route, one route per wrong option).
 *
 * The gates are the ones an author gets wrong silently; every message names
 * the item. The pack is sample content until a teacher signs it off
 * (`reviewed: false`), and the build refuses an unreviewed pack for the
 * student site (--hosted) while allowing it in offline, dev and preview
 * builds.
 */
import { z } from 'zod';
import { idiomsIn } from '../lib/answerBook/vidiChecks';

export const EAPCET_LEARN_SCHEMA = 'eapcet_learn_pack_v1';
export const LEARN_PACK_WARN_BYTES = 40 * 1024;
export const LEARN_PACK_MAX_BYTES = 80 * 1024;
export const LEARN_ROUTE_MAX_WORDS = 12;

const KEY = /^[a-z0-9_]{1,50}$/;
const CHAPTER_KEY = /^p[12]-\d{2}$/;
const QID = /^lq_p[12]-\d{2}_[a-z0-9_]+_\d{2}$/;
const SHAPE_KEY = /^[a-z0-9_-]{1,40}$/;
/** A route phrase that marks itself wrong (hindsight: a student who "dropped"
    or "skipped" a step did not know it at the time), or names the right
    quantity or method beside the wrong one ("X, not Y", "X instead of Y"). */
const VERDICT_WORDS = /\b(wrongly|forgot|forgetting|by mistake|mistakenly|incorrectly|dropped|skipped|left out|missed|swapped)\b/i;
const CONTRAST = /(,\s*not\s+|\binstead of\b|\brather than\b)/i;

const line = (max: number) => z.string().trim().min(1).max(max);
const option = z.number().int().min(1).max(4);

export const LearnRouteTypeSchema = z.enum(['concept', 'application', 'calculation', 'careless']);
export type LearnRouteType = z.infer<typeof LearnRouteTypeSchema>;

export const LearnRouteSchema = z.object({
    id: z.string().regex(/^(r|m[0-2])$/),
    text: line(120),
    type: LearnRouteTypeSchema.optional(),
    option: option.optional(),
    fix: line(240).optional(),
}).strict();

function norm(s: string): string { return s.trim().toLowerCase().replace(/\s+/g, ' '); }
function words(s: string): number { return s.trim().split(/\s+/).filter(Boolean).length; }

export const LearnQuestionSchema = z.object({
    id: z.string().regex(QID),
    stem: line(300),
    options: z.array(line(80)).length(4),
    answer: option,
    difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    routes: z.array(LearnRouteSchema).length(4),
}).strict().superRefine((q, ctx) => {
    const right = q.routes.filter((r) => r.id === 'r');
    if (right.length !== 1) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['routes'], message: `${q.id}: exactly one "r" route` });
    for (const r of right) {
        if (r.type || r.fix) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['routes'], message: `${q.id}: the "r" route carries no type or fix` });
        if (r.option !== undefined && r.option !== q.answer) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['routes'], message: `${q.id}: the "r" route's option must be the answer` });
    }
    const wrongOptions = new Set([1, 2, 3, 4].filter((o) => o !== q.answer));
    const seenOptions = new Set<number>();
    const seenIds = new Set<string>();
    for (const r of q.routes) {
        if (seenIds.has(r.id)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['routes'], message: `${q.id}: route id "${r.id}" repeats` });
        seenIds.add(r.id);
        if (r.id === 'r') continue;
        if (r.option === undefined || !wrongOptions.has(r.option)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['routes'], message: `${q.id}: route "${r.id}" must name a wrong option` });
        } else if (seenOptions.has(r.option)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['routes'], message: `${q.id}: two routes lead to option ${r.option}` });
        } else {
            seenOptions.add(r.option);
        }
        if (!r.type) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['routes'], message: `${q.id}: route "${r.id}" has no type` });
        if (!r.fix) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['routes'], message: `${q.id}: route "${r.id}" has no fix` });
    }
    for (const o of wrongOptions) {
        if (!seenOptions.has(o)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['routes'], message: `${q.id}: wrong option ${o} has no route` });
    }
    // The phrases: what the student would say they did, before knowing it was wrong.
    const texts = new Set<string>();
    const optionTexts = new Set(q.options.map(norm));
    for (const r of q.routes) {
        const t = r.text;
        if (!/^I /.test(t)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['routes'], message: `${q.id}: route "${r.id}" must start with "I "` });
        if (words(t) > LEARN_ROUTE_MAX_WORDS) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['routes'], message: `${q.id}: route "${r.id}" is over ${LEARN_ROUTE_MAX_WORDS} words` });
        if (/\d{2,}/.test(t)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['routes'], message: `${q.id}: route "${r.id}" carries a number of two or more digits` });
        if (VERDICT_WORDS.test(t)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['routes'], message: `${q.id}: route "${r.id}" marks itself wrong` });
        if (CONTRAST.test(t)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['routes'], message: `${q.id}: route "${r.id}" names the right quantity ("X, not Y" / "instead of")` });
        if (texts.has(norm(t))) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['routes'], message: `${q.id}: route "${r.id}" repeats another route's text` });
        texts.add(norm(t));
        if (optionTexts.has(norm(t))) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['routes'], message: `${q.id}: route "${r.id}" equals an option` });
    }
    if (new Set(q.options.map(norm)).size !== 4) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['options'], message: `${q.id}: two options are the same` });
});
export type LearnQuestion = z.infer<typeof LearnQuestionSchema>;

const StepSchema = z.object({ text: line(160), equation: line(80).optional() }).strict();
export const LearnConceptSchema = z.object({
    lines: z.array(line(160)).min(5).max(8),
    formula: z.object({ text: line(80), meaning: line(120) }).strict(),
    example: z.object({ given: line(200), steps: z.array(StepSchema).min(2).max(4), answer: line(80) }).strict(),
}).strict();

export const LearnCheckSchema = z.object({
    stem: line(300),
    options: z.array(line(160)).min(2).max(4),
    answer: option,
    why_right: line(200),
    why_wrong: z.record(z.string(), line(200)),
}).strict().superRefine((c, ctx) => {
    if (c.answer > c.options.length) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['answer'], message: 'check: the answer names an option that does not exist' });
    if (/\d/.test(c.stem)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['stem'], message: 'check: the stem carries a number; it asks about the idea only' });
    const wrong = new Set<string>();
    for (let o = 1; o <= c.options.length; o++) if (o !== c.answer) wrong.add(String(o));
    for (const k of Object.keys(c.why_wrong)) {
        if (!wrong.has(k)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['why_wrong'], message: `check: why_wrong names "${k}", which is not a wrong option` });
    }
    for (const k of wrong) {
        if (!c.why_wrong[k]) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['why_wrong'], message: `check: wrong option ${k} has no why_wrong line` });
    }
});

export const LearnSubtopicSchema = z.object({
    key: z.string().regex(KEY),
    title: line(90),
    shapes: z.array(z.string().regex(SHAPE_KEY)).max(6),
    concept: LearnConceptSchema,
    check: LearnCheckSchema,
    apply: z.array(z.object({ variants: z.array(LearnQuestionSchema).min(1).max(2) }).strict()).length(3),
}).strict().superRefine((s, ctx) => {
    const lines = new Set(s.concept.lines.map(norm));
    s.apply.forEach((slot, i) => {
        for (const v of slot.variants) {
            if (v.difficulty !== i + 1) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['apply', i], message: `${s.key}: slot ${i + 1} holds ${v.id} at difficulty ${v.difficulty}; the three rise 1, 2, 3` });
            if (!v.id.includes(`_${s.key}_`)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['apply', i], message: `${s.key}: ${v.id} does not carry the subtopic key` });
            for (const r of v.routes) if (lines.has(norm(r.text))) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['apply', i], message: `${v.id}: route "${r.id}" repeats a concept line` });
        }
    });
});
export type LearnSubtopic = z.infer<typeof LearnSubtopicSchema>;

export const LearnTopicSchema = z.object({
    key: z.string().regex(KEY),
    title: line(90),
    subtopics: z.array(LearnSubtopicSchema).min(1).max(8),
}).strict();

/** Every string a student can read in the pack, for the Rule 41 scan. */
export function learnPackStrings(pack: { topics: z.infer<typeof LearnTopicSchema>[] }): string[] {
    const out: string[] = [];
    for (const t of pack.topics) {
        out.push(t.title);
        for (const s of t.subtopics) {
            out.push(s.title, ...s.concept.lines, s.concept.formula.text, s.concept.formula.meaning, s.concept.example.given, s.concept.example.answer);
            for (const st of s.concept.example.steps) { out.push(st.text); if (st.equation) out.push(st.equation); }
            out.push(s.check.stem, ...s.check.options, s.check.why_right, ...Object.values(s.check.why_wrong));
            for (const slot of s.apply) for (const v of slot.variants) {
                out.push(v.stem, ...v.options);
                for (const r of v.routes) { out.push(r.text); if (r.fix) out.push(r.fix); }
            }
        }
    }
    return out;
}

export const EapcetLearnPackSchema = z.object({
    schema: z.literal(EAPCET_LEARN_SCHEMA),
    chapter_key: z.string().regex(CHAPTER_KEY),
    chapter_name: line(80),
    reviewed: z.boolean(),
    authored_by: z.object({ agent: z.string().min(1), at: z.string().min(1) }).strict(),
    checked_by: z.array(z.object({ agent: z.string().min(1), at: z.string().min(1), verdict: z.string().min(1) }).strict()).optional(),
    topics: z.array(LearnTopicSchema).min(1).max(8),
}).strict().superRefine((pack, ctx) => {
    const subs = new Set<string>();
    const topicKeys = new Set<string>();
    const qids = new Set<string>();
    pack.topics.forEach((t, ti) => {
        if (topicKeys.has(t.key)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['topics', ti], message: `topic key "${t.key}" repeats` });
        topicKeys.add(t.key);
        t.subtopics.forEach((s, si) => {
            if (subs.has(s.key)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['topics', ti, 'subtopics', si], message: `subtopic key "${s.key}" repeats; keys are unique in a chapter` });
            subs.add(s.key);
            for (const slot of s.apply) for (const v of slot.variants) {
                if (qids.has(v.id)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['topics', ti, 'subtopics', si], message: `question id ${v.id} repeats` });
                qids.add(v.id);
                if (!v.id.startsWith(`lq_${pack.chapter_key}_`)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['topics', ti, 'subtopics', si], message: `${v.id} does not carry the chapter key ${pack.chapter_key}` });
            }
        });
    });
    for (const s of learnPackStrings(pack)) {
        const hits = idiomsIn(s);
        if (hits.length) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['topics'], message: `Rule 41: "${s.slice(0, 50)}" carries ${hits.join(', ')}` });
    }
});
export type EapcetLearnPack = z.infer<typeof EapcetLearnPackSchema>;
