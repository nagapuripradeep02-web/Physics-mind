/**
 * Weighted question sampler for ComprehensionMCQOverlay.
 *
 * Selects up to N questions from the full quiz bank, weighted by:
 *  - PRIMARY-aha state questions (weight ≥ 2.0) — always include 1 if exists
 *  - SUPPORTING-aha questions (weight = 1.5) — include 1 if exists
 *  - Other states — fill remaining slots, random with weight bias
 *
 * Spec: physics-mind/docs/COMPREHENSION_METRIC.md §6.1
 */
import type { QuizQuestion } from "@/app/api/comprehension/quiz/[concept_id]/route";

const DEFAULT_SAMPLE_SIZE = 3;

export function sampleQuestions(
    allQuestions: readonly QuizQuestion[],
    sampleSize = DEFAULT_SAMPLE_SIZE
): QuizQuestion[] {
    if (!allQuestions || allQuestions.length === 0) return [];
    if (allQuestions.length <= sampleSize) return [...allQuestions];

    const primary = allQuestions.filter((q) => q.weight >= 2.0);
    const supporting = allQuestions.filter((q) => q.weight >= 1.5 && q.weight < 2.0);
    const other = allQuestions.filter((q) => q.weight < 1.5);

    const picked: QuizQuestion[] = [];
    const usedIds = new Set<number>();

    const pickOneFrom = (pool: readonly QuizQuestion[]) => {
        const available = pool.filter((q) => !usedIds.has(q.id));
        if (available.length === 0) return null;
        const choice = available[Math.floor(Math.random() * available.length)];
        usedIds.add(choice.id);
        return choice;
    };

    // Slot 1: PRIMARY (if exists)
    const primaryPick = pickOneFrom(primary);
    if (primaryPick) picked.push(primaryPick);

    // Slot 2: SUPPORTING (if exists)
    if (picked.length < sampleSize) {
        const supportingPick = pickOneFrom(supporting);
        if (supportingPick) picked.push(supportingPick);
    }

    // Fill remaining slots from any pool, biased toward higher-weight questions
    const remaining = sampleSize - picked.length;
    if (remaining > 0) {
        const weightedPool: QuizQuestion[] = [];
        for (const q of allQuestions) {
            if (usedIds.has(q.id)) continue;
            const reps = Math.max(1, Math.round(q.weight));
            for (let i = 0; i < reps; i++) weightedPool.push(q);
        }
        for (let i = 0; i < remaining; i++) {
            if (weightedPool.length === 0) break;
            const idx = Math.floor(Math.random() * weightedPool.length);
            const choice = weightedPool[idx];
            if (!usedIds.has(choice.id)) {
                picked.push(choice);
                usedIds.add(choice.id);
            }
            // Remove all occurrences of the picked question to avoid duplicates
            for (let j = weightedPool.length - 1; j >= 0; j--) {
                if (weightedPool[j].id === choice.id) weightedPool.splice(j, 1);
            }
        }
    }

    // Final fallback: if still short (rare), fill with any remaining unused
    if (picked.length < sampleSize) {
        for (const q of allQuestions) {
            if (picked.length >= sampleSize) break;
            if (!usedIds.has(q.id)) {
                picked.push(q);
                usedIds.add(q.id);
            }
        }
    }

    return picked;
}
