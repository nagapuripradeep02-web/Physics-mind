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
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { resolveConceptJsonPath } from './resolveConceptJson';

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
    return data;
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
