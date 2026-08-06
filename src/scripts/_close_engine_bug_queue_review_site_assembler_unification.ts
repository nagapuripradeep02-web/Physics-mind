/**
 * engine_bug_queue — close review_site_private_config_assembler_drops_variable_choreography
 * after the assembler unification (2026-08-06).
 *
 * The original row (filed 2026-08-05) understated the defect in two load-bearing
 * ways, both corrected here before the flip to FIXED:
 *
 *   1. "The renderer reads exactly FOUR per-state fields" is FALSE — it reads
 *      FIVE. variable_overrides (PM_resolveStateVars) is read off a binding
 *      named `state`, not `stateData`, so the row's own proposed probe (scan
 *      for `stateData.<field>`) passes green over the live defect. The fix
 *      commit f98e9f7 wrote the same false invariant into a code comment.
 *   2. Blast radius: variable_overrides is authored on 10 of 18 PCPL concepts
 *      (54 states) — 2.5× the choreography half that was fixed first. And the
 *      app's EPIC-L bypass plus four admin test pages each kept their OWN
 *      hand-picked projections (3-field and 1-field), all dropping fields.
 *
 * What fixed it (all on master, 2026-08-06):
 *   - parametric_renderer.ts: ParametricStateConfig widened to the true 5-field
 *     read set + [key: string]: unknown, PARAMETRIC_STATE_FIELDS exported as
 *     the runtime oracle with a compile-time completeness check.
 *   - buildParametricConfig.ts is now THE single assembler (whole-state
 *     passthrough; focal-sequence synthesis and canvas_style as OPTIONS; the
 *     shared isParametricConcept predicate; numeric state ordering).
 *   - build_review_site.ts, aiSimulationGenerator.ts (EPIC-L bypass), and 4
 *     admin test pages all import it; their private projections are deleted.
 *   - Blocking vitest parametric_projection_parity.test.ts extracts the read
 *     set from the renderer source via EVERY PM_config.states binding (not one
 *     binding name) and asserts it equals the oracle; negative-controlled
 *     (removing variable_overrides from the oracle fails 2 assertions).
 *
 * Verified: rebuilt review-site/scalar_vs_vector/sim.html carries
 * variable_overrides=2, variable_choreography=3.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_close_engine_bug_queue_review_site_assembler_unification.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const row = {
    bug_class: 'review_site_private_config_assembler_drops_variable_choreography',
    title:
        'Teacher-facing surfaces assembled private ParametricConfigs that dropped per-state fields (variable_choreography AND variable_overrides) while THE EYE saw the correct cached sim',
    severity: 'CRITICAL' as const,
    owner_cluster: 'peter_parker:renderer_primitives' as const,
    subject: 'subject_neutral',
    root_cause:
        "MULTIPLE assemblers existed for ONE renderer and disagreed. The shared src/scripts/lib/buildParametricConfig.ts (cache path, THE EYE) passes whole state objects through; build_review_site.ts kept a private duplicate that hand-picked scene_composition/focal_primitive_id/focal_sequence; aiSimulationGenerator's EPIC-L bypass kept a 3-field copy; four admin pages kept 1-field copies. The renderer reads FIVE per-state fields, not four: scene_composition, focal_primitive_id, focal_sequence, variable_choreography (binding `stateData`), and variable_overrides (binding `state` inside PM_resolveStateVars, parametric_renderer.ts ~:1080) — a per-state numeric override channel authored on 10 of 18 PCPL concepts (54 states). The first fix (f98e9f7) restored variable_choreography only and wrote 'the renderer reads exactly four per-state fields' into the code as an invariant — false, and its proposed stateData-scan probe would have passed green over the still-dropped variable_overrides. Root enabler: the exported ParametricConfig type declared only 3 of 5 fields, and every assembler evaded excess-property checking via conditional spread or `as` cast, so tsc rewarded the lossy copies.",
    prevention_rule:
        'ONE assembler per renderer: every surface calls buildParametricConfig (whole-state passthrough); a surface needing different behavior passes an OPTION (synthesizeFocalSequenceFromScript, canvasStyle), it never forks the builder. The renderer exports PARAMETRIC_STATE_FIELDS as the read-set oracle, completeness-checked at compile time against ParametricStateKnownFields; the blocking vitest parametric_projection_parity.test.ts re-extracts the read set from the renderer source via EVERY binding of PM_config.states (never a single binding name) and asserts set equality, plus asserts each parametric surface imports the shared builder and keeps no hand-picked projection idiom. Never let a local structural type be narrower than the data it stands for — type states as ParametricStateConfig (open, indexed) so a dropped field is a compile error.',
    probe_type: 'js_eval' as const,
    probe_logic:
        'Static (BLOCKING, in CI via npm test): parametric_projection_parity.test.ts — renderer read-set extraction over all PM_config.states bindings == PARAMETRIC_STATE_FIELDS; per-surface shared-builder import + no hand-pick idiom. Dynamic (ADVISORY): npm run visual:playcheck -- <id> loads the BUILT review page, presses Play, free-runs the clock, and asserts PM_choreoValues is non-empty and every choreographed variable differs between t0 and t0+2s — the pinned-clock EYE path structurally cannot see this class.',
    status: 'FIXED' as const,
    concepts_affected: [
        'unit_circle_to_sine_wave',
        'scalar_vs_vector',
        'resultant_direction',
        'vector_addition_law',
        'newton_second_law_direction',
        'friction_static_kinetic',
        'umbrella_tilt_angle',
        'pressure_scalar',
        'current_not_vector',
        'field_forces',
        'hinge_force',
    ],
    fixed_in_files: [
        'src/lib/renderers/parametric_renderer.ts',
        'src/scripts/lib/buildParametricConfig.ts',
        'src/scripts/build_review_site.ts',
        'src/lib/aiSimulationGenerator.ts',
        'src/app/admin/test-scalar-vs-vector/page.tsx',
        'src/app/admin/test-vector-head-to-tail/page.tsx',
        'src/app/admin/test-newton-second-law-direction/page.tsx',
        'src/app/admin/test-friction-static-kinetic/page.tsx',
        'src/lib/renderers/__tests__/parametric_projection_parity.test.ts',
    ],
    discovered_in_session: 'founder review-site playback 2026-08-06; unification session 2026-08-06',
    fixed_at: new Date().toISOString(),
    row_type: 'incident' as const,
};

async function main(): Promise<void> {
    const { error } = await supabaseAdmin
        .from('engine_bug_queue')
        .upsert(row, { onConflict: 'bug_class' });
    if (error) throw new Error(`upsert ${row.bug_class} failed: ${error.message}`);
    console.log(`✅ FIXED ${row.bug_class}`);
    console.log(`   ${row.concepts_affected.length} concepts affected, ${row.fixed_in_files.length} files in the fix`);
}

main().catch((err) => {
    console.error('💥 close failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
