/**
 * Pre-warm deep_dive_cache for spine concepts.
 *
 * Walks every concept JSON tagged `is_spine: true` in the catalog, finds every
 * EPIC-L state with `has_prebuilt_deep_dive: true`, and ensures a deep-dive
 * row exists in `deep_dive_cache` (status: pending_review). Skips if a row
 * already exists for the (concept_id, state_id, class_level, mode) fingerprint
 * unless `--force` is passed.
 *
 * Bypasses HTTP auth — calls `generateDeepDive` directly via the same path the
 * `/api/deep-dive` route uses on cache miss. Cost: ~$0.04 per generation.
 *
 * Usage:
 *   npm run prewarm:deepdive                 # all spine concepts
 *   npm run prewarm:deepdive -- <concept_id> # single concept
 *   npm run prewarm:deepdive -- --force      # regenerate even if cached
 */

import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { loadConstants } from '@/lib/physics_constants';
import { generateDeepDive } from '@/lib/deepDiveGenerator';
import { GHOST_CONCEPTS } from '@/lib/conceptCatalog';

const CLASS_LEVEL_DEFAULT = '11';
const MODE_DEFAULT = 'conceptual';

interface ConceptShape {
    concept_id?: string;
    concept_name?: string;
    class_level?: number;
    real_world_anchor?: unknown;
    physics_engine_config?: unknown;
    epic_l_path?: {
        states?: Record<string, {
            title?: string;
            scene_composition?: unknown;
            teacher_script?: unknown;
            has_prebuilt_deep_dive?: boolean;
        }>;
    };
}

interface Target {
    conceptId: string;
    stateId: string;
    classLevel: string;
    mode: string;
}

function parseArgs(argv: string[]): { conceptFilter: string | null; force: boolean } {
    let conceptFilter: string | null = null;
    let force = false;
    for (const a of argv.slice(2)) {
        if (a === '--force') force = true;
        else if (a.startsWith('-')) continue;
        else conceptFilter = a;
    }
    return { conceptFilter, force };
}

async function findTargets(conceptFilter: string | null): Promise<Target[]> {
    const targets: Target[] = [];
    const candidates = conceptFilter
        ? GHOST_CONCEPTS.filter(c => c.concept_id === conceptFilter)
        : GHOST_CONCEPTS.filter(c => c.is_spine === true);

    for (const cat of candidates) {
        const concept = (await loadConstants(cat.concept_id).catch(() => null)) as ConceptShape | null;
        if (!concept?.epic_l_path?.states) {
            console.log(`[skip]  ${cat.concept_id} — no concept JSON or epic_l_path`);
            continue;
        }
        const classLevel = String(concept.class_level ?? cat.class_level ?? CLASS_LEVEL_DEFAULT);
        for (const [stateId, state] of Object.entries(concept.epic_l_path.states)) {
            if (state?.has_prebuilt_deep_dive === true) {
                targets.push({ conceptId: cat.concept_id, stateId, classLevel, mode: MODE_DEFAULT });
            }
        }
    }
    return targets;
}

async function isCached(t: Target): Promise<boolean> {
    const fingerprintKey = `${t.conceptId}|${t.stateId}|${t.classLevel}|${t.mode}`;
    const { data } = await supabaseAdmin
        .from('deep_dive_cache')
        .select('id, status')
        .eq('fingerprint_key', fingerprintKey)
        .maybeSingle();
    return !!data && data.status !== 'rejected';
}

async function generate(t: Target): Promise<{ ok: boolean; error?: string }> {
    const concept = (await loadConstants(t.conceptId)) as ConceptShape | null;
    if (!concept) return { ok: false, error: 'concept JSON missing' };
    const state = concept.epic_l_path?.states?.[t.stateId];
    if (!state) return { ok: false, error: `state ${t.stateId} missing in concept JSON` };

    const sibling = Object.entries(concept.epic_l_path?.states ?? {})
        .filter(([k]) => k !== t.stateId)
        .map(([k, s]) => `${k}: ${s?.title ?? '(untitled)'}`)
        .join('\n') || '(no sibling states)';

    let gen;
    try {
        gen = await generateDeepDive({
            conceptId: t.conceptId,
            conceptName: concept.concept_name ?? t.conceptId,
            classLevel: t.classLevel,
            mode: t.mode,
            stateId: t.stateId,
            stateTitle: state.title ?? '',
            parentSceneComposition: (state.scene_composition as unknown[]) ?? [],
            parentTeacherScript: state.teacher_script ?? {},
            siblingStatesSummary: sibling,
            realWorldAnchor: concept.real_world_anchor ?? {},
            physicsEngineConfig: concept.physics_engine_config ?? {},
            sessionId: undefined,
        });
    } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'generation threw' };
    }

    const physicsCritical = (gen.physicsViolations ?? []).filter(v => v.severity === 'CRITICAL');
    const isRejected = physicsCritical.length > 0;
    const rowStatus = isRejected ? 'rejected' : 'pending_review';
    const fingerprintKey = `${t.conceptId}|${t.stateId}|${t.classLevel}|${t.mode}`;

    const reviewNotes: string[] = [];
    if ((gen.layoutViolations ?? []).length > 0) {
        reviewNotes.push(`solver_schema_invalid: ${gen.layoutViolations!.length} violation(s)`);
    }
    if (physicsCritical.length > 0) {
        reviewNotes.push(`physics_invalid: ${physicsCritical.length} critical`);
    }

    const { error } = await supabaseAdmin
        .from('deep_dive_cache')
        .upsert({
            fingerprint_key: fingerprintKey,
            concept_id: t.conceptId,
            state_id: t.stateId,
            class_level: t.classLevel,
            mode: t.mode,
            sub_states: gen.subStates,
            teacher_script: gen.teacherScriptFlat,
            status: rowStatus,
            generated_by: 'prewarm-script',
            model: 'claude-sonnet-4-6',
            served_count: 0,
            ...(reviewNotes.length > 0 ? { review_notes: reviewNotes.join('\n') } : {}),
        }, { onConflict: 'fingerprint_key' });

    if (error) return { ok: false, error: error.message };
    if (isRejected) return { ok: false, error: 'physics_invalid (row stored as rejected)' };
    return { ok: true };
}

async function main(): Promise<void> {
    const { conceptFilter, force } = parseArgs(process.argv);
    const overallStart = Date.now();

    console.log(`\n🔥 Pre-warm deep_dive_cache${conceptFilter ? ` for ${conceptFilter}` : ' for all spine concepts'}${force ? ' (force regenerate)' : ''}\n`);

    const targets = await findTargets(conceptFilter);
    console.log(`Found ${targets.length} (concept, state) pair(s) flagged has_prebuilt_deep_dive.\n`);
    if (targets.length === 0) {
        console.log('Nothing to pre-warm. Exiting.');
        return;
    }

    let generatedCount = 0;
    let cachedCount = 0;
    let failedCount = 0;
    const failures: { target: Target; error: string }[] = [];

    for (let i = 0; i < targets.length; i++) {
        const t = targets[i];
        const tag = `[${i + 1}/${targets.length}] ${t.conceptId} ${t.stateId}`;

        if (!force && (await isCached(t))) {
            console.log(`${tag} — cached, skipping`);
            cachedCount++;
            continue;
        }

        process.stdout.write(`${tag} — generating... `);
        const start = Date.now();
        const result = await generate(t);
        const ms = Date.now() - start;
        if (result.ok) {
            console.log(`✅ ${ms}ms`);
            generatedCount++;
        } else {
            console.log(`❌ ${result.error} (${ms}ms)`);
            failedCount++;
            failures.push({ target: t, error: result.error ?? 'unknown' });
        }
    }

    const totalSec = ((Date.now() - overallStart) / 1000).toFixed(1);
    const estCostUsd = generatedCount * 0.04;

    console.log('\n' + '='.repeat(60));
    console.log(`Generated: ${generatedCount}`);
    console.log(`Cached (skipped): ${cachedCount}`);
    console.log(`Failed: ${failedCount}`);
    console.log(`Total time: ${totalSec}s`);
    console.log(`Estimated cost: ~$${estCostUsd.toFixed(2)} (Sonnet 4.6)`);
    if (failures.length > 0) {
        console.log('\nFailures:');
        for (const f of failures) {
            console.log(`  ${f.target.conceptId} ${f.target.stateId} — ${f.error}`);
        }
    }
    console.log('\nReview new rows: localhost:3000/admin/deep-dive-review');
}

main().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
});
