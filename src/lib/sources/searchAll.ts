/**
 * searchAll — cross-source RAG fan-out helper.
 *
 * Calls searchNCERT() and searchPYQ() in parallel for a single query and
 * returns the results separately, NOT auto-merged. Letting the consumer
 * (Alex / chat route / "show me a similar JEE problem" UI) decide blend
 * logic avoids subtle semantic drift between explanation-style chunks
 * (NCERT/OpenStax) and problem-style chunks (PYQ).
 *
 * Pure additive — neither searchNCERT nor any of its existing callers are
 * changed. searchAll() is opt-in for new consumers.
 *
 * Future: when chat-side RAG starts blending NCERT explanations with
 * PYQ problems ("here's the concept + try this PYQ"), the blend rule
 * lives in that route, not here.
 */

import { searchNCERT, type NCERTChunk } from "../ncertSearch";
import { searchPYQ, type PYQResult, type SearchPYQOptions } from "../pyqSearch";

export interface SearchAllOptions {
    /** Class level for NCERT search (e.g. "11", "12"). */
    classLevel?: string;
    /** concept_id used by both NCERT chapter-hint resolution and PYQ concept_ids[] filter. */
    conceptId?: string;
    /** Max results per source (NCERT and PYQ each capped at this). */
    maxResults?: number;
    /** Optional NCERT source override (default 'ncert' triggers two-pass cross-source fan-out). */
    ncertSourceBook?: string;
    /** Optional PYQ-specific filters; passed through to searchPYQ. */
    pyqOptions?: Omit<SearchPYQOptions, "conceptIdFilter" | "maxResults">;
}

export interface SearchAllResult {
    ncert: NCERTChunk[];
    pyq: PYQResult[];
}

/**
 * Run NCERT and PYQ searches in parallel, return both result sets unmerged.
 *
 * @example
 *   await searchAll("Bernoulli equation", { classLevel: "11" })
 *   await searchAll("photoelectric effect", {
 *       conceptId: "photoelectric_effect",
 *       maxResults: 3,
 *       pyqOptions: { examFilter: "jee_advanced" },
 *   })
 */
export async function searchAll(
    query: string,
    options: SearchAllOptions = {}
): Promise<SearchAllResult> {
    const {
        classLevel,
        conceptId,
        maxResults = 3,
        ncertSourceBook = "ncert",
        pyqOptions = {},
    } = options;

    const [ncert, pyq] = await Promise.all([
        searchNCERT(query, classLevel, maxResults, conceptId, ncertSourceBook),
        searchPYQ(query, {
            ...pyqOptions,
            conceptIdFilter: conceptId,
            maxResults,
        }),
    ]);

    return { ncert, pyq };
}
