/**
 * Shared loaders for the visual-validator CLI scripts (smoke / eyes / approve).
 *
 * loadCachedSim   — newest/most-served simulation_cache row for a concept.
 * loadConceptJson — RAW concept JSON, resolved subject-aware via
 *                   resolveConceptJson.ts (flat physics dir first, then
 *                   src/data/concepts/chemistry/ — Phase 2.5). No
 *                   normalizeConstants pass — Category I needs the original
 *                   epic_l_path…tts_sentences glow / math_show fields.
 */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { resolveConceptJsonPath } from './resolveConceptJson';
import { assembleSimFromSource } from './assembleSimFromSource';

export interface CacheRow {
    sim_html: string;
    secondary_sim_html: string | null;
    physics_config: Record<string, unknown> | null;
    teacher_script: unknown;
    sim_type: string | null;
    fingerprint_key: string | null;
}

export function fail(message: string, exitCode = 1): never {
    console.error(`\n❌ ${message}\n`);
    process.exit(exitCode);
}

export async function loadCachedSim(conceptId: string): Promise<CacheRow> {
    const { data, error } = await supabaseAdmin
        .from('simulation_cache')
        .select('sim_html, secondary_sim_html, physics_config, teacher_script, sim_type, fingerprint_key')
        .eq('concept_key', conceptId)
        .order('served_count', { ascending: false })
        .limit(1)
        .maybeSingle<CacheRow>();
    if (error) fail(`simulation_cache query failed: ${error.message}`);
    if (!data) fail(`No cached simulation found for concept_id="${conceptId}". Run /api/generate-simulation against this concept first.`);
    if (!data.sim_html) fail(`Cached row exists but sim_html is empty for "${conceptId}".`);
    assertCacheMatchesSource(conceptId, data.sim_html);
    return data;
}

/**
 * HARD FAIL when a hand-seeded cache row no longer matches its source.
 *
 * THE reason this exists (engine_bug_queue:
 * eye_reads_the_hand_seeded_cache_not_the_current_source, CRITICAL): chemistry
 * concepts never run through the live generation pipeline, so their
 * simulation_cache row is seeded by hand and never auto-refreshes — while THE EYE
 * reads ONLY that row. A post-fix re-walk therefore returned 35 checks / 35
 * passed over entirely PRE-fix content: four already-fixed defects still present
 * in every frame, and every visual finding in the run a false negative. It was
 * caught by a human cross-checking frames against live source, which is not a
 * gate. The class then cost a second session the same way.
 *
 * Scoped by EXCLUDING PHYSICS, deliberately — not by naming one subject.
 * Physics concepts are served by the live pipeline (aiSimulationGenerator), whose
 * output legitimately differs from a bare renderer assembly, so comparing there
 * would fail on every run. EVERY other namespace is hand-seeded and therefore
 * exposed to the exact defect above.
 *
 * 2026-08-04: this read `!== 'chemistry'` and so silently skipped MATHEMATICS,
 * which is hand-seeded for the identical reason (mathematics concepts register at
 * site #1 only — the isolation contract — so they never touch the live pipeline
 * either). A guard written as an allowlist of one had to be edited for every new
 * subject, and the cost of forgetting is not a broken run but a GREEN one: the
 * class above returned "35 checks / 35 passed" over pre-fix pixels twice. Written
 * as a physics-exclusion it is correct for every future subject by construction.
 */
export function assertCacheMatchesSource(conceptId: string, cachedHtml: string): void {
    let built: ReturnType<typeof assembleSimFromSource>;
    try {
        built = assembleSimFromSource(conceptId);
    } catch {
        return;                       // not assemblable from source — nothing to compare against
    }
    if (!built || built.subject === 'physics') return;
    if (built.simHtml === cachedHtml) return;

    const h = (s: string) => createHash('sha256').update(s).digest('hex').slice(0, 12);
    fail(
        `STALE simulation_cache for "${conceptId}" — the cached sim does NOT match the current source.\n` +
        `     cached  ${h(cachedHtml)}  (${cachedHtml.length} chars)\n` +
        `     source  ${h(built.simHtml)}  (${built.simHtml.length} chars)\n\n` +
        `   ${built.subject} cache rows are seeded BY HAND and never auto-refresh, and this gate reads only\n` +
        `   the row — so continuing would report on PRE-EDIT pixels and every visual finding would be\n` +
        `   a false negative. This has already happened twice (engine_bug_queue:\n` +
        `   eye_reads_the_hand_seeded_cache_not_the_current_source).\n\n` +
        `   Re-seed, then re-run:\n` +
        `     npx tsx --env-file=.env.local src/scripts/_seed_subject_cache.ts ${conceptId}`,
    );
}

export function loadConceptJson(conceptId: string): Record<string, unknown> | null {
    // Subject-aware resolution (flat physics dir first, then chemistry/ — Phase 2.5).
    const resolved = resolveConceptJsonPath(conceptId);
    if (!resolved) {
        // Explicit warning (2026-07-23): a silent null here used to quietly disable
        // THE EYE's Category I (TTS↔visual) + Category E (storyboard) checks — a
        // degraded run looked like a clean pass. Legacy-bundle ids (no standalone
        // JSON) will print this too; that is informational, not fatal.
        console.warn(`⚠ loadConceptJson: no concept JSON found for "${conceptId}" (checked flat + chemistry namespaces) — JSON-based checks (Category I/E, reveal timings) will be skipped.`);
        return null;
    }
    try {
        return JSON.parse(readFileSync(resolved.path, 'utf-8')) as Record<string, unknown>;
    } catch {
        console.warn(`⚠ loadConceptJson: failed to parse ${resolved.path} — JSON-based checks will be skipped.`);
        return null;
    }
}
