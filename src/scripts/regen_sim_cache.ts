/**
 * regen:sim — regenerate a concept's simulation_cache row by calling the
 * production generator directly (same code path as /api/generate-simulation,
 * minus the HTTP/auth layer — the serving route stays behind login).
 *
 * For field_3d / hand-authored diamonds this is fully deterministic assembly
 * from the concept JSON (Rule 18-safe: no LLM decides physics).
 *
 * Usage:
 *   npx tsx --env-file=.env.local src/scripts/regen_sim_cache.ts <concept_id> [classLevel]
 */

// MUST be the first import.
import '@/lib/loadEnvLocal';
import { generateSimulation } from '@/lib/aiSimulationGenerator';
import type { QuestionFingerprint } from '@/lib/intentClassifier';

async function main(): Promise<void> {
    const conceptId = (process.argv[2] ?? '').trim();
    if (!conceptId) {
        console.error('Usage: npx tsx --env-file=.env.local src/scripts/regen_sim_cache.ts <concept_id> [classLevel]');
        process.exit(1);
    }
    const classLevel = (process.argv[3] ?? '12').trim();

    // Explicit 5D fingerprint (concept|intent|class|mode|aspect). Without one,
    // the generator's cache upsert targets (concept_key,class_level) which has
    // NO unique index — the save silently fails (flagged 2026-06-10).
    const fingerprint: QuestionFingerprint = {
        concept_id: conceptId,
        intent: 'understand',
        class_level: classLevel,
        mode: 'conceptual',
        aspect: 'full',
        cache_key: `${conceptId}|understand|${classLevel}|conceptual|full`,
        confidence: 1,
    };

    console.log(`\n♻️  Regenerating simulation cache for ${conceptId} (class ${classLevel})...\n`);
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
    console.log(`\n✅ Generated (type: ${result.type ?? 'single'}). Cache row should now exist.`);
    process.exit(0);
}

main().catch(err => {
    console.error('\n💥 regen:sim crashed:', err instanceof Error ? err.stack : err);
    process.exit(2);
});
