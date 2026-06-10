/**
 * Shared loaders for the visual-validator CLI scripts (smoke / eyes / approve).
 *
 * loadCachedSim   — newest/most-served simulation_cache row for a concept.
 * loadConceptJson — RAW concept JSON from src/data/concepts/<id>.json (no
 *                   normalizeConstants pass — Category I needs the original
 *                   epic_l_path…tts_sentences glow / math_show fields).
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

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
    const path = join(process.cwd(), 'src', 'data', 'concepts', `${conceptId}.json`);
    if (!existsSync(path)) return null;
    try {
        return JSON.parse(readFileSync(path, 'utf-8')) as Record<string, unknown>;
    } catch {
        return null;
    }
}
