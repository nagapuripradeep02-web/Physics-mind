// ─────────────────────────────────────────────────────────────────────────────
// UNIFIED NCERT Search Query Extraction
// Used by BOTH teacherEngine AND aiSimulationGenerator
// Converts concept_id or raw question → short NCERT-searchable phrase
// ─────────────────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
    "what", "is", "how", "why", "does", "the", "a", "an", "explain",
    "describe", "define", "if", "i", "make", "can", "do", "will",
    "when", "where", "are", "was", "of", "in", "on", "at", "to",
    "for", "with", "about", "me", "my", "we", "you", "it", "this",
    "that", "so", "but", "and", "or", "tell", "show", "very",
    "much", "more", "also", "just", "not",
]);

/**
 * Extract a short NCERT-searchable phrase from concept_id or question.
 *
 * Primary:  conceptId → replace underscores with spaces, keep ALL words
 *   "drift_velocity_basic"       → "drift velocity basic"
 *   "wire_resistance_length_area" → "wire resistance length area"
 *   "moment_of_inertia"          → "moment of inertia"
 *
 * Fallback: strip stop words from question, keep first 4 physics words
 *   "why is drift velocity so slow?" → "drift velocity slow"
 */
export function extractNCERTSearchQuery(
    conceptId: string | undefined,
    fullQuestion: string
): string {
    // 1. Prefer conceptId — it's the distilled concept from the classifier
    if (conceptId && conceptId.trim().length > 0) {
        return conceptId
            .replace(/_/g, " ")
            .trim();
    }

    // 2. Fall back: strip stop words from the question, keep first 4 physics words
    const meaningful = fullQuestion
        .toLowerCase()
        .replace(/[?.,!'"]/g, "")
        .split(/\s+/)
        .filter(w => w.length > 1 && !STOP_WORDS.has(w));

    return meaningful.slice(0, 4).join(" ");
}
