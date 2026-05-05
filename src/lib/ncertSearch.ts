import { supabaseAdmin } from "./supabaseAdmin";

// ---------------------------------------------------------------------------
// getConceptClassLevel — resolves canonical class_level from concept_panel_config
// ---------------------------------------------------------------------------

/**
 * Returns the concept's canonical class_level from concept_panel_config.
 * This OVERRIDES the student's enrolled class for NCERT search purposes.
 *
 * A Class 12 student asking about spring_mass_system should always get the
 * Class 11 Oscillations chunk — because that is where this concept lives in
 * NCERT, regardless of who is asking.
 *
 * Falls back to studentClassLevel when the concept is not in the config table.
 */
export async function getConceptClassLevel(
    conceptId: string,
    studentClassLevel: string | undefined
): Promise<string | undefined> {
    if (!conceptId || conceptId === 'unknown') return studentClassLevel;

    const { data } = await supabaseAdmin
        .from('concept_panel_config')
        .select('class_level, chapter')
        .eq('concept_id', conceptId)
        .maybeSingle();

    if (data?.class_level) {
        const canonical = String(data.class_level);
        if (canonical !== studentClassLevel) {
            console.log(`[NCERT] concept ${conceptId} canonical class: ${canonical} (student class: ${studentClassLevel ?? 'any'})`);
        }
        return canonical;
    }

    return studentClassLevel;
}

/**
 * Returns the concept's canonical chapter name from concept_panel_config.
 * Used as a chapter-hint fallback when the hardcoded CONCEPT_CHAPTER_MAP
 * has no entry for this concept_id.
 */
async function getConceptChapterFromDB(conceptId: string): Promise<string | null> {
    if (!conceptId || conceptId === 'unknown') return null;

    const { data } = await supabaseAdmin
        .from('concept_panel_config')
        .select('chapter')
        .eq('concept_id', conceptId)
        .maybeSingle();

    return data?.chapter ?? null;
}

// ---------------------------------------------------------------------------
// Dynamic search phrases loaded from concept_panel_config DB table
// ---------------------------------------------------------------------------

let dynamicSearchPhrases: Record<string, string> = {};

export async function loadSearchPhrasesFromDB(): Promise<void> {
    const { data } = await supabaseAdmin
        .from('concept_panel_config')
        .select('concept_id, search_phrase')
        .not('search_phrase', 'is', null);

    if (data) {
        data.forEach((row: { concept_id: string; search_phrase: string }) => {
            dynamicSearchPhrases[row.concept_id] = row.search_phrase;
        });
        console.log(`[ncertSearch] Loaded ${data.length} search phrases from DB`);
    }
}

export interface NCERTChunk {
    content_text: string;
    chapter_name: string;
    section_name: string | null;
    class_level: string;
    similarity: number;
}

// ─────────────────────────────────────────────────────────────────────
// extractSearchQuery
// Converts a student's question (long sentence) or concept_id (snake_case)
// into a short NCERT-friendly search phrase.
// NCERT chunks were embedded with short physics phrases — not full questions.
// Examples:
//   "drift_velocity_vs_current_speed" → "drift velocity current"
//   "why is drift velocity so slow…"  → first 4 meaningful words
// ─────────────────────────────────────────────────────────────────────

export function extractSearchQuery(
    fullQuestion: string,
    conceptId?: string
): string {
    // 1. Prefer conceptId — it's already the distilled concept
    if (conceptId && conceptId.trim().length > 0) {
        return conceptId
            .replace(/_/g, " ")     // underscores → spaces
            .split(" ")
            .slice(0, 4)            // at most 4 words
            .join(" ")
            .trim();
    }

    // 2. Fall back: strip stop words from the question, keep first 4 physics words
    const stops = new Set([
        "what", "why", "how", "when", "where", "is", "are", "was", "does",
        "do", "can", "the", "a", "an", "of", "in", "on", "at", "to", "for",
        "with", "about", "if", "i", "me", "my", "we", "you", "it", "this",
        "that", "so", "but", "and", "or", "explain", "tell", "show", "make",
        "very", "much", "more", "also", "just", "not",
    ]);

    const meaningful = fullQuestion
        .toLowerCase()
        .replace(/[?.,!]/g, "")
        .split(/\s+/)
        .filter(w => w.length > 1 && !stops.has(w));

    return meaningful.slice(0, 4).join(" ");
}

// ─────────────────────────────────────────────────────────────────────
// Chapter hint mapping — maps concept keywords to expected NCERT chapter
// Used to filter out wrong-chapter results from vector similarity search.
// ─────────────────────────────────────────────────────────────────────

const CONCEPT_CHAPTER_MAP: Record<string, string> = {
    'moment_of_inertia': 'system of particles',
    'rotational_motion': 'system of particles',
    'rotational': 'system of particles',
    'torque': 'system of particles',
    'angular_momentum': 'system of particles',
    'centre_of_mass': 'system of particles',
    'torque_rotation': 'system of particles',
    // ── Laws of Motion (Class 11, Ch. 5 / DC Pandey Ch. 8) ─────────────────
    'pseudo_forces': 'laws of motion',
    'pseudo_force': 'laws of motion',
    'newton': 'laws of motion',
    'friction': 'laws of motion',
    'laws_of_motion': 'laws of motion',
    'laws_of_motion_friction': 'laws of motion',
    'laws_of_motion_atwood': 'laws of motion',
    'conservation_of_momentum': 'laws of motion',
    // ── Motion in a Plane (Class 11, Ch. 4) ────────────────────────────────
    'projectile_motion': 'motion in a plane',
    'projectile': 'motion in a plane',
    'uniform_circular_motion': 'motion in a plane',
    'circular_motion_banking': 'motion in a plane',
    'circular_motion': 'motion in a plane',
    // ── Work, Energy & Power (Class 11, Ch. 6) ─────────────────────────────
    'work_energy_theorem': 'work energy and power',
    'work_energy': 'work energy and power',
    'conservation_of_energy': 'work energy and power',
    // ── Oscillations (Class 11, Ch. 14) ────────────────────────────────────
    'simple_pendulum': 'oscillations',
    'spring_mass_system': 'oscillations',
    'simple_harmonic': 'oscillations',
    'oscillation': 'oscillations',
    // ── Exact circuit concept_ids from physics_concept_map ─────────────────
    // These 8 IDs are the only valid classifier outputs for Current Electricity.
    // Explicit mapping prevents "Magnetism and Matter" cross-contamination.
    'ohms_law': 'current electricity',
    'series_resistance': 'current electricity',
    'parallel_resistance': 'current electricity',
    'kirchhoffs_voltage_law': 'current electricity',
    'kirchhoffs_current_law': 'current electricity',
    'wheatstone_bridge': 'current electricity',
    'meter_bridge': 'current electricity',
    'internal_resistance': 'current electricity',
    // ── Keyword-based fallbacks ────────────────────────────────────────────
    'drift_velocity': 'current electricity',
    'ohm': 'current electricity',
    'resistance': 'current electricity',
    'kirchhoff': 'current electricity',
    'electric_field': 'electric charges',
    'coulomb': 'electric charges',
    'gauss': 'electric charges',
    'capacitance': 'electrostatic potential',
    'capacitor': 'electrostatic potential',
    'potential': 'electrostatic potential',
    'magnetic_field': 'moving charges',
    'biot_savart': 'moving charges',
    'ampere': 'moving charges',
    'magnetism': 'magnetism',
    'electromagnetic_induction': 'electromagnetic induction',
    'faraday': 'electromagnetic induction',
    'lenz': 'electromagnetic induction',
    'alternating_current': 'alternating current',
    'ray_optics': 'ray optics',
    'refraction': 'ray optics',
    'lens': 'ray optics',
    'mirror': 'ray optics',
    'wave_optics': 'wave optics',
    'interference': 'wave optics',
    'diffraction': 'wave optics',
    'photoelectric': 'dual nature',
    'de_broglie': 'dual nature',
    'atomic_model': 'atoms',
    'bohr': 'atoms',
    'hydrogen_spectrum': 'atoms',
    'nuclear': 'nuclei',
    'radioactiv': 'nuclei',
    'semiconductor': 'semiconductor',
    'diode': 'semiconductor',
    'transistor': 'semiconductor',
    'gravitation': 'gravitation',
    'kepler': 'gravitation',
    'wave_motion': 'waves',
    'wave_superposition': 'waves',
    'standing_waves': 'waves',
    'beats_waves': 'waves',
    'doppler_effect': 'waves',
    'sound_waves': 'waves',
    'wave_on_string': 'waves',
    // ── Thermodynamics (Class 11, Ch. 12) ──────────────────────────────────
    'thermodynamics': 'thermodynamics',
    'first_law_thermodynamics': 'thermodynamics',
    'isothermal_process': 'thermodynamics',
    'adiabatic_process': 'thermodynamics',
    'carnot_engine': 'thermodynamics',
    'ideal_gas_kinetic_theory': 'kinetic theory',
    'kinetic_theory': 'kinetic theory',
    // ── Optics ─────────────────────────────────────────────────────────────
    'convex_lens': 'ray optics',
    'concave_lens': 'ray optics',
    'concave_mirror': 'ray optics',
    'convex_mirror': 'ray optics',
    'total_internal_reflection': 'ray optics',
    'prism_dispersion': 'ray optics',
};

export function getChapterHint(conceptId: string): string | null {
    const normalized = conceptId.toLowerCase();
    for (const [key, chapter] of Object.entries(CONCEPT_CHAPTER_MAP)) {
        if (normalized.includes(key)) return chapter;
    }
    return null;
}

/**
 * Internal: run vector + keyword search for one source book.
 * Takes a pre-generated embedding so the caller can reuse it across passes.
 */
async function runSourceSearch(
    query: string,
    embedding: number[],
    classLevel: string | undefined,
    maxChunks: number,
    conceptId: string | undefined,
    sourceBook: string,
    chapterHintOverride?: string | null  // canonical chapter from concept_panel_config (takes precedence)
): Promise<NCERTChunk[]> {
    let keywordQuery = supabaseAdmin
        .from('ncert_content')
        .select('id, content_text, chapter_name, section_name, class_level')
        .ilike('content_text', `%${query.split(' ').slice(0, 3).join('%')}%`)
        .eq('source_book', sourceBook)
        .limit(maxChunks);

    if (classLevel) {
        keywordQuery = keywordQuery.eq('class_level', classLevel);
    }

    // Chapter hint: use the override (from concept_panel_config) when provided,
    // otherwise fall back to the hardcoded map.
    const chapterHint = chapterHintOverride ?? (conceptId ? getChapterHint(conceptId) : null);

    const [vectorRes, keywordRes] = await Promise.all([
        supabaseAdmin.rpc("match_ncert_chunks", {
            query_embedding:    embedding,
            match_threshold:    0.45,
            match_count:        maxChunks * 5,
            filter_class:       classLevel ?? null,
            filter_source_book: sourceBook,
        }),
        keywordQuery
    ]);

    if (vectorRes.error) {
        console.error("[NCERT SEARCH] RPC error:", vectorRes.error.message);
        return [];
    }

    const vectorChunks = ((vectorRes.data ?? []) as Array<Record<string, unknown>>).map((row): NCERTChunk => ({
        content_text: (row.content_text ?? row.content ?? "") as string,
        chapter_name: (row.chapter_name ?? "") as string,
        section_name: (row.section_name ?? null) as string | null,
        class_level: (row.class_level ?? "") as string,
        similarity: (row.similarity ?? 0) as number,
    }));

    const keywordChunks: NCERTChunk[] = (keywordRes.data ?? []).map((row: Record<string, unknown>): NCERTChunk => ({
        content_text: row.content_text as string,
        chapter_name: row.chapter_name as string,
        section_name: (row.section_name ?? null) as string | null,
        class_level: row.class_level as string,
        similarity: 0.8,
    }));

    const seenObjects = new Set<string>();
    let chunks: NCERTChunk[] = [];

    for (const c of [...keywordChunks, ...vectorChunks]) {
        const key = c.content_text?.trim().slice(0, 100);
        if (!key || seenObjects.has(key)) continue;
        seenObjects.add(key);
        chunks.push(c);
    }

    if (chapterHint) {
        const inChapter = chunks.filter((c: NCERTChunk) =>
            c.chapter_name.toLowerCase().includes(chapterHint)
        );
        const outOfChapter = chunks.filter((c: NCERTChunk) =>
            !c.chapter_name.toLowerCase().includes(chapterHint)
        );
        chunks = inChapter.length > 0 ? inChapter : outOfChapter;
    }

    return chunks.slice(0, maxChunks);
}

/**
 * Generate a 768-dim embedding via Google's gemini-embedding-001 model.
 * Uses outputDimensionality=768 to match our vector(768) Supabase column.
 */
async function generateEmbedding(text: string): Promise<number[]> {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const url =
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`;

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "models/gemini-embedding-001",
            content: { parts: [{ text }] },
            outputDimensionality: 768,
        }),
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Embedding API ${res.status}: ${body}`);
    }

    const data = await res.json();
    return data.embedding.values as number[];
}

/**
 * Semantic search over NCERT / DC Pandey content using vector similarity.
 *
 * @param query       Short physics phrase (use extractSearchQuery first!)
 * @param classLevel  Optional filter: "10", "11", or "12"
 * @param maxChunks   Max results to return (default 3)
 * @param conceptId   Optional concept ID for phrase override + chapter hint
 * @param sourceBook  Source to search: "ncert" (default) | "dc_pandey"
 */
export async function searchNCERT(
    query: string,
    classLevel?: string,
    maxChunks: number = 3,
    conceptId?: string,
    sourceBook: string = 'ncert'
): Promise<NCERTChunk[]> {
    // ── CANONICAL CLASS RESOLUTION ────────────────────────────────────────────
    // Always use the concept's class_level from concept_panel_config, NOT the
    // student's enrolled class.  A Class 12 student asking about spring_mass_system
    // must get the Class 11 Oscillations chunk, not a Class 12 chunk.
    // getConceptClassLevel() falls back to studentClassLevel when unknown.
    const resolvedClassLevel = conceptId
        ? await getConceptClassLevel(conceptId, classLevel)
        : classLevel;
    try {
        // Override the caller-supplied query with a curated phrase when conceptId
        // is known to return wrong-chapter results from generic vector search.
        const CONCEPT_SEARCH_PHRASE_MAP: Record<string, string> = {
            potentiometer:          'potentiometer wire jockey galvanometer balance point',
            ohms_law:               "Ohm's law current voltage resistance proportional",
            drift_velocity:         'drift velocity electron current conductor',
            kirchhoffs_laws:        "Kirchhoff's loop junction rule current voltage",
            electric_power_heating: 'power dissipated resistor joule heating current electricity',
        };
        const searchPhrase = CONCEPT_SEARCH_PHRASE_MAP[conceptId ?? '']
            ?? dynamicSearchPhrases[conceptId ?? ''];
        if (searchPhrase) {
            query = searchPhrase;
        }

        // ── DB CHAPTER HINT FALLBACK (Step 4) ────────────────────────────────
        // When the hardcoded CONCEPT_CHAPTER_MAP has no entry but concept_panel_config
        // has a chapter column, use it as the chapter hint.  This is performed in
        // parallel with the embedding generation below to keep latency low.
        const hardcodedChapter = conceptId ? getChapterHint(conceptId) : null;
        const dbChapterPromise = (!hardcodedChapter && conceptId)
            ? getConceptChapterFromDB(conceptId)
            : Promise.resolve<string | null>(null);

        // Generate embedding + DB chapter lookup in parallel
        const [embedding, dbChapter] = await Promise.all([
            generateEmbedding(query),
            dbChapterPromise,
        ]);

        // Effective chapter hint: hardcoded map wins, DB chapter is fallback
        const effectiveChapterHint = hardcodedChapter ?? dbChapter;
        if (effectiveChapterHint && !hardcodedChapter && dbChapter) {
            console.log(`[NCERT] chapter hint from DB: "${effectiveChapterHint}" for concept: ${conceptId}`);
        }

        // Helper: run source search using resolvedClassLevel (canonical) instead of caller's classLevel
        const runSearch = (book: string) =>
            runSourceSearch(query, embedding, resolvedClassLevel, maxChunks, conceptId, book, effectiveChapterHint);

        // Single-source mode: when caller explicitly requests a non-ncert source
        if (sourceBook !== 'ncert') {
            console.log(`[NCERT] searching with query: "${query}" | class: ${resolvedClassLevel ?? "any"} | source: ${sourceBook}`);
            const results = await runSearch(sourceBook);
            console.log(`[NCERT SEARCH] ${results.length} chunk(s) for "${query.substring(0, 60)}"`, resolvedClassLevel ? `(class ${resolvedClassLevel})` : "", results.map(c => c.chapter_name).join(", "));
            return results;
        }

        // ── PASS 1: NCERT (authoritative source) ─────────────────────────────
        console.log(`[NCERT] searching with query: "${query}" | class: ${resolvedClassLevel ?? "any"} | source: ncert`);
        const ncertResults = await runSearch('ncert');

        const NCERT_STRONG_THRESHOLD = 0.65;
        const strongNcertHit = ncertResults.some(r => r.similarity >= NCERT_STRONG_THRESHOLD);
        console.log(`[NCERT Search] Pass 1 | strong_hit=${strongNcertHit} | results=${ncertResults.length} | top_similarity=${ncertResults[0]?.similarity?.toFixed(3) ?? 'none'} | source=ncert`);

        if (strongNcertHit) {
            console.log(`[NCERT SEARCH] ${ncertResults.length} chunk(s) for "${query.substring(0, 60)}"`, resolvedClassLevel ? `(class ${resolvedClassLevel})` : "", effectiveChapterHint ?? "", ncertResults.map(c => c.chapter_name).join(", "));
            return ncertResults;
        }

        // ── PASS 2: Advanced sources — DC Pandey + HC Verma + OpenStax ───────
        // OpenStax College Physics (source_book='openstax_cp') is more
        // pedagogical/explanatory than the problem-set rigor of DC Pandey/HCV.
        // Useful when NCERT is weak on a concept and the student needs a clear
        // explanation. Ingested 2026-04-30 (CC-BY 3.0 attribution required at
        // product surface).
        const [dcpResults, hcvResults, ossResults] = await Promise.all([
            runSearch('dc_pandey'),
            runSearch('hc_verma'),
            runSearch('openstax_cp'),
        ]);

        const advancedResults = [...dcpResults, ...hcvResults, ...ossResults]
            .sort((a, b) => b.similarity - a.similarity);

        console.log(`[NCERT Search] Pass 2 | dc_pandey=${dcpResults.length} | hc_verma=${hcvResults.length} | openstax=${ossResults.length} | top_similarity=${advancedResults[0]?.similarity?.toFixed(3) ?? 'none'}`);

        if (advancedResults.length > 0) {
            // Keep best NCERT chunk as physics anchor if it clears minimum threshold
            const ncertAnchor = ncertResults.filter(r => r.similarity >= 0.45).slice(0, 1);
            const combined = [...ncertAnchor, ...advancedResults.slice(0, 2)];
            console.log(`[NCERT SEARCH] ${combined.length} chunk(s) for "${query.substring(0, 60)}"`, resolvedClassLevel ? `(class ${resolvedClassLevel})` : "", combined.map(c => c.chapter_name).join(", "));
            return combined;
        }

        // Fallback — return NCERT results even if weak
        console.log(`[NCERT SEARCH] ${ncertResults.length} chunk(s) (fallback) for "${query.substring(0, 60)}"`, resolvedClassLevel ? `(class ${resolvedClassLevel})` : "", ncertResults.map(c => c.chapter_name).join(", "));
        return ncertResults;

    } catch (err: unknown) {
        const chapterHint = conceptId ? getChapterHint(conceptId) : null;
        console.log('[ncertSearch] returning 0 chunks for concept:', conceptId, 'chapter:', chapterHint ?? 'any');
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[NCERT SEARCH] failed:", msg);
        return [];
    }
}
