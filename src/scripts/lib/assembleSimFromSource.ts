/**
 * Assemble a concept's sim HTML straight from its JSON + the current renderer —
 * the single source of truth for what a HAND-SEEDED cache row ought to contain.
 *
 * WHY THIS IS SHARED. Chemistry concepts never run through the live generation
 * pipeline, so their `simulation_cache` row is seeded by hand and never
 * auto-refreshes. THE EYE reads only that row. The two facts together produced
 * the worst gate failure this project has recorded (engine_bug_queue:
 * eye_reads_the_hand_seeded_cache_not_the_current_source): a post-fix re-walk
 * returned 35 checks / 35 passed while rendering entirely PRE-fix content, so
 * four already-fixed defects all still appeared broken in frames and every
 * visual finding in that run was a false negative.
 *
 * Factoring the assembly here lets the seeder WRITE the row and loadCachedSim
 * CHECK it with the same code, so a stale row can no longer be walked silently.
 * Verified deterministic: assembling twice yields byte-identical HTML.
 */
import { readFileSync } from 'node:fs';
import { assembleField3DHtml, type Field3DConfig } from '@/lib/renderers/field_3d_renderer';
import { assembleParametricHtml } from '@/lib/renderers/parametric_renderer';
import { assembleParticleFieldHtml, type ParticleFieldAuthoredConfig } from '@/lib/renderers/particle_field_renderer';
import { resolveConceptJsonPath } from './resolveConceptJson';
import { buildParametricConfig, isParametricConcept, type ParametricSourceJson } from './buildParametricConfig';

export type SeedableConceptJson = ParametricSourceJson & {
    field_3d_config?: Field3DConfig;
    particle_field_config?: ParticleFieldAuthoredConfig;
    epic_l_path?: Record<string, unknown>;
};

export interface AssembledSim {
    simHtml: string;
    rendererType: 'field_3d' | 'particle_field' | 'parametric';
    engine: 'threejs' | 'p5';
    json: SeedableConceptJson;
    subject: string;
}

/**
 * Returns null when the concept has no seedable renderer family (i.e. it is
 * served by the live pipeline instead) — callers treat that as "not checkable",
 * never as an error.
 *
 * Sizing note: parametric and particle_field are assembled at their NATIVE
 * authored canvas size, because THE EYE captures frozen baselines and a
 * viewport-dependent fit transform would make every frozen frame depend on the
 * capture window.
 */
export function assembleSimFromSource(conceptId: string): AssembledSim | null {
    const resolved = resolveConceptJsonPath(conceptId);
    if (!resolved) return null;
    const json = JSON.parse(readFileSync(resolved.path, 'utf-8')) as SeedableConceptJson;

    if (json.field_3d_config) {
        return { simHtml: assembleField3DHtml(json.field_3d_config), rendererType: 'field_3d', engine: 'threejs', json, subject: resolved.subject };
    }
    if (json.particle_field_config) {
        return { simHtml: assembleParticleFieldHtml(json.particle_field_config), rendererType: 'particle_field', engine: 'p5', json, subject: resolved.subject };
    }
    if (isParametricConcept(json)) {
        return { simHtml: assembleParametricHtml(buildParametricConfig(conceptId, json)), rendererType: 'parametric', engine: 'p5', json, subject: resolved.subject };
    }
    return null;
}
