/**
 * Wrapper around generateSimulation() for prewarming the dual-panel "EPIC-L
 * BYPASS" concepts (aiSimulationGenerator.ts ~line 6017-6043), whose cache
 * upsert is fire-and-forget (`void supabaseAdmin...upsert(...).then(...)`,
 * never awaited) before the function `return`s. `regen_sim_cache.ts`'s
 * `process.exit(0)` right after `generateSimulation()` resolves races that
 * write and kills the process before it lands — observed empirically during
 * the 2026-07-23 parametric_expr_field_scope_missing_derived cache sweep
 * (contact_forces/field_forces/friction_static_kinetic/hinge_force/
 * normal_reaction/tension_in_string all logged "✅ Generated" but wrote ZERO
 * simulation_cache rows). This wrapper just adds a settle delay before exit —
 * no production code touched.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_regen_prewarm_with_settle.ts <concept_id> [classLevel]
 */
import '@/lib/loadEnvLocal';
import { generateSimulation } from '@/lib/aiSimulationGenerator';
import type { QuestionFingerprint } from '@/lib/intentClassifier';

async function main(): Promise<void> {
    const conceptId = (process.argv[2] ?? '').trim();
    if (!conceptId) {
        console.error('Usage: npx tsx --env-file=.env.local src/scripts/_regen_prewarm_with_settle.ts <concept_id> [classLevel]');
        process.exit(1);
    }
    const classLevel = (process.argv[3] ?? '11').trim();

    const fingerprint: QuestionFingerprint = {
        concept_id: conceptId,
        intent: 'understand',
        class_level: classLevel,
        mode: 'conceptual',
        aspect: 'full',
        cache_key: `${conceptId}|understand|${classLevel}|conceptual|full`,
        confidence: 1,
    };

    console.log(`\n♻️  Regenerating (settle-aware) simulation cache for ${conceptId} (class ${classLevel})...\n`);
    const result = await generateSimulation(
        conceptId,
        `Explain ${conceptId.replaceAll('_', ' ')}`,
        classLevel,
        undefined,
        undefined,
        fingerprint,
    );

    if (!result) {
        console.error('❌ generateSimulation returned null — no cache row written.');
        process.exit(1);
    }
    console.log(`✅ Generated (type: ${result.type ?? 'single'}). Waiting 4s for any fire-and-forget cache upsert to settle...`);
    await new Promise((resolve) => setTimeout(resolve, 4000));
    console.log('✅ Settle wait complete.');
    process.exit(0);
}

main().catch(err => {
    console.error('\n💥 regen crashed:', err instanceof Error ? err.stack : err);
    process.exit(2);
});
