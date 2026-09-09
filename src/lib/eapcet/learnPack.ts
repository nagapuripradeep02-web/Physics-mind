/**
 * learnPack.ts — what the build does with a validated learn pack: checks it
 * against the release it ships with, folds every practice question into the
 * public shape the finder's engine already reads, and derives the shape →
 * lesson links the result page and the fix page follow.
 */
import type { EapcetLearnPack, LearnQuestion } from '../../schemas/eapcetLearn';
import { LEARN_PACK_MAX_BYTES, LEARN_PACK_WARN_BYTES } from '../../schemas/eapcetLearn';

/** FNV-1a, 32-bit — the same as hashStr in eapcet-app/js/00_core.js, so a
    route menu's order is a function of the question id alone and the right
    route is not always first. */
export function fnv1a(s: string): number {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h >>> 0;
}

type ReleaseLike = {
    chapters: { key: string; name: string; shapes?: { key: string; label: string }[] }[];
    questions: Record<string, { question_en: string }>;
};

/** Defects a pack has only in the company of a release: a shape key the
    chapter does not define, a practice stem copied from a past paper. */
export function checkLearnPackAgainstRelease(pack: EapcetLearnPack, release: ReleaseLike): string[] {
    const issues: string[] = [];
    const ch = release.chapters.find((c) => c.key === pack.chapter_key);
    if (!ch) return [`${pack.chapter_key}: the release has no such chapter`];
    const shapes = new Set((ch.shapes ?? []).map((s) => s.key));
    const stems = new Set(Object.values(release.questions).map((q) => norm(q.question_en)));
    for (const t of pack.topics) for (const s of t.subtopics) {
        for (const k of s.shapes) if (!shapes.has(k)) issues.push(`${s.key}: shape "${k}" is not one of ${pack.chapter_key}'s shapes`);
        for (const slot of s.apply) for (const v of slot.variants) {
            if (stems.has(norm(v.stem))) issues.push(`${v.id}: its stem is a past-paper question; write a fresh one`);
        }
    }
    return issues;
}
function norm(s: string): string { return s.trim().toLowerCase().replace(/\s+/g, ' '); }

export type PublicLearnQuestion = {
    id: string; question_en: string; options_en: string[]; answer: number; difficulty: number;
    has_routes: true; theory: false; route_key: 'r';
    option_types: Record<string, string>;
    routes: { id: string; text: string; type: string | null; option: number | null }[];
    fixes: Record<string, string>;
};

/** One practice question in the shape Data.facts / Diag.outcomeOf read:
    option_types from the routes, the menu in hash order, the fixes by option. */
export function foldLearnQuestion(q: LearnQuestion): PublicLearnQuestion {
    const optionTypes: Record<string, string> = {};
    const fixes: Record<string, string> = {};
    const routes: PublicLearnQuestion['routes'] = [];
    for (const r of q.routes) {
        if (r.id === 'r') { routes.push({ id: 'r', text: r.text, type: null, option: q.answer }); continue; }
        optionTypes[String(r.option)] = r.type as string;
        fixes[String(r.option)] = r.fix as string;
        routes.push({ id: r.id, text: r.text, type: r.type ?? null, option: r.option ?? null });
    }
    routes.sort((a, b) => fnv1a(`${q.id}|${a.id}`) - fnv1a(`${q.id}|${b.id}`));
    return {
        id: q.id, question_en: q.stem, options_en: q.options, answer: q.answer, difficulty: q.difficulty,
        has_routes: true, theory: false, route_key: 'r', option_types: optionTypes, routes, fixes,
    };
}

export type PublicLearnPack = {
    chapter_key: string; chapter_name: string; reviewed: boolean;
    topics: {
        key: string; title: string;
        subtopics: {
            key: string; title: string; shapes: string[];
            concept: EapcetLearnPack['topics'][number]['subtopics'][number]['concept'];
            check: EapcetLearnPack['topics'][number]['subtopics'][number]['check'];
            apply: { variants: PublicLearnQuestion[] }[];
        }[];
    }[];
};

export function foldLearnPack(pack: EapcetLearnPack): PublicLearnPack {
    return {
        chapter_key: pack.chapter_key, chapter_name: pack.chapter_name, reviewed: pack.reviewed,
        topics: pack.topics.map((t) => ({
            key: t.key, title: t.title,
            subtopics: t.subtopics.map((s) => ({
                key: s.key, title: s.title, shapes: s.shapes, concept: s.concept, check: s.check,
                apply: s.apply.map((slot) => ({ variants: slot.variants.map(foldLearnQuestion) })),
            })),
        })),
    };
}

/** shape key → the subtopic keys that teach it, in pack order. */
export function learnLinks(pack: EapcetLearnPack): Record<string, string[]> {
    const links: Record<string, string[]> = {};
    for (const t of pack.topics) for (const s of t.subtopics) for (const k of s.shapes) {
        if (!links[k]) links[k] = [];
        if (!links[k].includes(s.key)) links[k].push(s.key);
    }
    return links;
}

export function learnPackSize(pack: EapcetLearnPack): { bytes: number; warn: boolean; fail: boolean } {
    const bytes = Buffer.byteLength(JSON.stringify(pack), 'utf8');
    return { bytes, warn: bytes > LEARN_PACK_WARN_BYTES, fail: bytes > LEARN_PACK_MAX_BYTES };
}
