/**
 * engine_bug_queue — the review-site choreography defect (2026-08-06).
 *
 * Found by the FOUNDER pressing Play on the review site and reporting that the
 * point would not move. Not by tsc, not by a validator, not by THE EYE, and not
 * by three eye_walker passes over 600+ frames. Worth its own row for that reason
 * as much as for the defect.
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const rows = [
    {
        bug_class: 'review_site_private_config_assembler_drops_variable_choreography',
        title:
            'The teacher-facing review site assembles its own ParametricConfig and omits variable_choreography, so every choreographed variable is dead on the product surface while THE EYE sees it working',
        severity: 'CRITICAL' as const,
        owner_cluster: 'peter_parker:renderer_primitives' as const,
        subject: 'subject_neutral',
        root_cause:
            "TWO assemblers exist for ONE renderer and they disagree. src/scripts/lib/buildParametricConfig.ts (used by _seed_subject_cache.ts, so by THE EYE) passes whole state objects through — `states: states as ParametricConfig['states']` — and therefore carries every per-state field. build_review_site.ts keeps a PRIVATE duplicate that hand-picks fields: scene_composition, focal_primitive_id, focal_sequence. The renderer reads FOUR per-state fields; the fourth, variable_choreography, was never copied. PM_applyChoreography (parametric_renderer.ts:3530) therefore hit `if (!Array.isArray(choreo) || choreo.length === 0) return;` on every frame, PM_choreoValues stayed {}, and every choreographed variable sat pinned at its authored default for the life of the state — the marker never moved, the pen never travelled, the readout never counted. Compounding it, the local ConceptJson state type in that same file also omitted the field, so the omission could not even be expressed, let alone type-checked: a hand-maintained structural type narrower than the data it describes hides exactly the bug it looks like it would catch. Measured on the built site with a free-running clock: PM_frozen false, PM_simClockMs advancing 1133->4650 ms, the player's subtitle timeline and scrubber both rolling 0->20 s, while theta stayed 0.00 and the marker sat at its t=0 coordinate in every sample. Affected every PCPL concept authoring choreography — scalar_vs_vector, resultant_direction, vector_addition_law (all SHIPPED PHYSICS) and unit_circle_to_sine_wave.",
        prevention_rule:
            'ONE assembler per renderer. A surface that needs a different shape passes an OPTION to the shared builder (as responsiveFill already does) — it does not fork it. Where a projection must hand-pick fields, that list is derived from, or asserted equal to, the set the renderer actually reads: grep `stateData.` / `spec.` in the renderer and assert the projection covers it. And never let a local structural type be NARROWER than the data it stands for; type the state as the shared type or as a passthrough, so a dropped field is a compile error rather than silence. Standing lesson: THE EYE proves the CACHED sim; it never opens the review site, so a defect that lives only in the review-site assembler is invisible to every gate in the repo. Any change to how the review site builds its config needs a Play-and-watch check, or a headless drive of the built page with a FREE-RUNNING clock — the pinned-clock path cannot see it.',
        probe_type: 'js_eval' as const,
        probe_logic:
            "Static: assert the set of per-state keys build_review_site.ts's buildParametricConfig emits equals the set of `stateData.<field>` reads in parametric_renderer.ts; FAIL naming any field the renderer reads and the projection drops. Dynamic (the one that would have caught it): load the BUILT review page headlessly, post the Play unpin, let the clock free-run, and assert that for every state declaring variable_choreography each choreographed variable's value at t=2s differs from its value at t=0 — and that PM_choreoValues is non-empty.",
        status: 'OPEN' as const,
        concepts_affected: [
            'unit_circle_to_sine_wave',
            'scalar_vs_vector',
            'resultant_direction',
            'vector_addition_law',
        ],
        fixed_in_files: ['src/scripts/build_review_site.ts'],
        discovered_in_session: 'founder review-site playback, 2026-08-06',
        row_type: 'incident' as const,
    },
];

async function main(): Promise<void> {
    for (const row of rows) {
        const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(row, { onConflict: 'bug_class' });
        if (error) throw new Error(`upsert ${row.bug_class} failed: ${error.message}`);
        console.log(`✅ ${row.severity} ${row.bug_class}`);
        console.log(`   affects ${row.concepts_affected.length} concepts, 3 of them shipped physics`);
    }
}

main().catch((err) => {
    console.error('💥 seed failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
