import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { QuestionFingerprint } from '@/lib/intentClassifier';

// ─────────────────────────────────────────────────────────────────────────────
// TIER 1: Exact concept_id lookup — classifier is the single source of truth.
// No keyword scanning. concept_id from the classifier maps to concept_slug by
// replacing underscores with hyphens. Exact match only.
// ─────────────────────────────────────────────────────────────────────────────
export async function lookupVerifiedByConceptId(
    conceptId: string,
    sectionMode: string = 'conceptual'
): Promise<{ response: string; source: 'verified' } | null> {
    if (!conceptId) return null;

    // concept_id "force_between_parallel_currents"
    // → slug    "force-between-parallel-currents"
    const slug = conceptId.replace(/_/g, '-');

    try {
        const { data, error } = await supabaseAdmin
            .from('verified_concepts')
            .select('concept_slug, full_content_competitive, full_content_board')
            .eq('concept_slug', slug)
            .eq('physics_verified', true)
            .maybeSingle();

        if (error) {
            console.warn('[Tier1] lookup error:', error.message);
            return null;
        }
        if (!data) {
            console.log(`[Tier1] NOT FOUND: ${slug}`);
            return null;
        }

        // Pick content by section, with fallback chain
        const response =
            sectionMode === 'board'
                ? (data.full_content_board ?? data.full_content_competitive ?? '')
                : (data.full_content_competitive ?? data.full_content_board ?? '');

        if (!response) return null;

        console.log(`[Tier1] ✅ VERIFIED HIT: ${slug}`);
        return { response, source: 'verified' };
    } catch (e) {
        console.warn('[Tier1] unexpected error:', e);
        return null;
    }
}

// ─────────────────────────────────────────
// TIER 2: Check response cache by fingerprint_key
// One row per (fingerprint_key) — concept + intent + class + mode + aspect
// ─────────────────────────────────────────
export async function matchCachedResponse(
    fingerprintKey: string
): Promise<string | null> {
    try {
        const { data, error } = await supabaseAdmin
            .from('response_cache')
            .select('id, response, served_count')
            .eq('fingerprint_key', fingerprintKey)
            .eq('invalidated', false)
            .maybeSingle();

        if (error) {
            console.warn('[queryRouter] matchCachedResponse error:', error.message);
            return null;
        }
        if (!data?.response) return null;

        // Fire-and-forget served_count bump
        void supabaseAdmin
            .from('response_cache')
            .update({ served_count: (data.served_count ?? 0) + 1 })
            .eq('id', data.id)
            .then(() => {});

        return data.response;
    } catch (e) {
        console.warn('[queryRouter] matchCachedResponse unexpected error:', e);
        return null;
    }
}

// ─────────────────────────────────────────
// TIER 3: Cache response with full fingerprint metadata
// ─────────────────────────────────────────
export async function cacheResponseForMode(
    fingerprint: QuestionFingerprint,
    response: string,
    factChecked: boolean = false,
): Promise<void> {
    try {
        const { error } = await supabaseAdmin
            .from('response_cache')
            .upsert({
                fingerprint_key: fingerprint.cache_key,
                question_hash: fingerprint.cache_key,
                intent: fingerprint.intent,
                mode: fingerprint.mode,
                class_level: fingerprint.class_level,
                aspect: fingerprint.aspect,
                response,
                // response_board / response_competitive have NOT NULL constraints in the DB schema.
                // Populate them with the same text so the upsert never violates the constraint.
                response_board: response,
                response_competitive: response,
                fact_checked: factChecked,
                served_count: 0,
                invalidated: false,
            }, { onConflict: 'fingerprint_key' });

        if (error) {
            console.warn('[queryRouter] cacheResponseForMode error:', error.code, error.message);
        }
    } catch (e) {
        console.warn('[queryRouter] cacheResponseForMode unexpected error:', e);
    }
}

// ─────────────────────────────────────────
// FACT CHECKER
// ─────────────────────────────────────────
export async function factCheckResponse(
    response: string
): Promise<{ hasError: boolean; error?: string; correction?: string }> {
    try {
        const { anthropicGenerate } = await import('@/lib/providers/anthropicProvider');

        const system = 'You are a strict physics fact-checker for Class 12 NCERT content. Reply with JSON only.';
        const prompt = `Check this explanation for factual errors only:
---
${response.substring(0, 1500)}
---

Check ONLY for:
1. Wrong energy signs (climbing UP = GAINING potential energy)
2. Wrong formula statements
3. Wrong direction of current/fields
4. Incorrect analogies that contradict physics

If correct: {"hasError": false}
If error: {"hasError": true, "error": "what is wrong", "correction": "what it should say"}

JSON only. Nothing else.`;

        const { text } = await anthropicGenerate(
            { model: 'claude-sonnet-4-6', provider: 'anthropic', costPer1KInput: 0.003, costPer1KOutput: 0.015 },
            system,
            prompt,
            200
        );

        return JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch {
        return { hasError: false };
    }
}
