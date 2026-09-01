/**
 * Seed engine_bug_queue with the defect classes surfaced by the `metallic_bonding`
 * build (Phase-0 bonding wave, Desk 3, 2026-08-03 — `bonding_scene` on field_3d).
 *
 * Why this exists: root CLAUDE.md §2 — engine_bug_queue IS the build-side moat.
 * Every one of these six was found by MEASUREMENT, not by a gate: THE EYE returned
 * 31/31 twice over this concept, once while its explore state was completely frozen
 * and once while four of its states were rendering zero scene pixels. Two of the six
 * are defects in the visual gate itself, which is why the rest went unseen.
 *
 * Provenance: eye-walker frame walk + founder_proxy Checkpoint B (which replicated
 * the shipped projection from bscCellSites/bscSiteList/bscSiteExtent and matched the
 * measured pixels to within 2%). Every root_cause below cites source lines that were
 * read, not inferred.
 *
 * Idempotent: upserts on the UNIQUE bug_class, so re-running only refreshes.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_metallic_bonding_session.ts
 *
 * Degrades gracefully if the 2026-07-24 chemistry `subject` migration is absent
 * (same contract as _seed_engine_bug_queue_chemistry_session.ts).
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'chemistry-phase0-metallic-bonding-2026-08-03';

interface BugRow {
    bug_class: string;
    title: string;
    severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
    owner_cluster: string;
    root_cause: string;
    prevention_rule: string;
    probe_type: 'sql' | 'js_eval' | 'manual' | 'vision_model';
    probe_logic: string;
    status: 'OPEN' | 'FIXED' | 'DEFERRED' | 'NOT_REPRODUCING' | 'FALSE_POSITIVE';
    concepts_affected: string[];
    fixed_in_files: string[];
    subject: 'physics' | 'chemistry' | 'subject_neutral';
}

const ROWS: BugRow[] = [
    {
        bug_class: 'field3d_bonding_scene_mode_without_a_camera_entry_falls_to_an_unfitted_default',
        title: 'Five states rendered from inside the lattice: deferred modes have no BS_CAMERAS entry and the default carries no fit',
        severity: 'CRITICAL',
        owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause:
            'BS_CAMERAS (field_3d_renderer.ts:51843-51975) holds nine keys; electron_sea/drift/layer_shift/melt have none, ' +
            'so bscSolvedCamera (:52215) falls through to BS_CAMERA_DEFAULT {az:35,el:28,dist:7.0} (:51975), which omits ' +
            'fit:true. The E3a auto-fit only runs under cam.fit (:53666), so a 35-site block of bounding radius 17.6-19.4u ' +
            'is drawn from 7.0u — the camera is 10.6-12.4 units INSIDE the block. Measured by replicating the shipped ' +
            'projection: a sphere at the origin draws a predicted 199px radius vs ~195px measured (STATE_3__frozen.png), ' +
            'and a predicted 414px on STATE_2 vs a sphere that overflows the 720px canvas.',
        prevention_rule:
            'A mode enum and a camera table must not be able to drift apart. Every member of the mode enum needs a camera ' +
            'entry, and the fallback default must itself carry fit:true so no future mode can silently inherit an unfitted ' +
            'close distance. This is independent of whether the mode has physics yet: a deferred mode still renders.',
        probe_type: 'js_eval',
        probe_logic:
            'Assert BS_CAMERAS covers every mode string the scenario accepts. For each state: compute bscSiteExtent from ' +
            'config and assert the resolved camera distance >= extent * 2.0; fail if any site projects behind the near ' +
            'plane or outside |NDC| 1.0.',
        status: 'OPEN',
        concepts_affected: ['metallic_bonding', 'ionic_bonding'],
        fixed_in_files: [],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'field3d_camera_fit_margin_is_the_orthographic_bound_not_the_perspective_bound',
        title: 'BS_FIT_MARGIN 1.90 derives from 1/tan(30) but the fitted extent is a bounding sphere, which needs 1/sin(30)=2.0',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause:
            'field_3d_renderer.ts:51686-51689 reasons "half-height at d is d*tan30, so fitting extent e needs d >= 1.732*e; ' +
            '1.90 is that with margin". That is correct for a planar extent in the origin plane, but bscSiteExtent (:52862) ' +
            'returns a bounding-SPHERE radius, whose perspective bound is d >= e/sin30 = 2.0*e. At 1.90 the fit is 5% short: ' +
            'metallic_bonding STATE_1 lands at worst |NDC.y| = 1.000 (exactly tangent) and clips at the bottom canvas edge.',
        prevention_rule:
            'Same family as the OPEN scar orthographic_separation_metric_underpredicts_perspective_overlap: an orthographic ' +
            'bound applied under a perspective camera is always OPTIMISTIC. Any camera-fit constant must be derived from the ' +
            'projection actually used and stated with the geometry it assumes (point, plane or sphere).',
        probe_type: 'js_eval',
        probe_logic:
            'Project every site sphere silhouette to NDC under the solved camera and assert max(|NDC.x|,|NDC.y|) < 1.0 with ' +
            'margin; regression-test at the bounding-sphere worst case, not the centroid.',
        status: 'OPEN',
        concepts_affected: ['metallic_bonding', 'ionic_bonding'],
        fixed_in_files: [],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'field3d_thermal_jiggle_never_applied_to_lattice_sites_only_molecular_units',
        title: 'thermal.jiggle_scale is a silent no-op on placement:lattice, and deriveStateMeta declares motion from it',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause:
            'bscJiggle is defined at field_3d_renderer.ts:52444 and called at exactly one site, :54095, inside the molecular ' +
            'UNIT loop. Lattice sites never receive it. metallic_bonding authors thermal:{T_K:298,jiggle_scale:0.5} on all six ' +
            'guided states; measured, STATE_1 t18000 and t19000 are byte-identical and STATE_3/4/5 are byte-identical to each ' +
            'other across the whole 3D region (0 of 361900 px). Compounded: the Rule-37 explore fallback at :53967-53968 ' +
            'stands DOWN when jiggle_scale > 0, so a lattice explore state gets neither jiggle nor spin and freezes entirely.',
        prevention_rule:
            'An authored key with no consumer on the code path it is authored for is a defect, not a style (see ' +
            'field3d_authored_mode_string_is_inert_decoration_and_states_render_static). Worse here because ' +
            'deriveStateMeta:284-287 reads this key to DECLARE motion, so a no-op key drives a validator expectation, and a ' +
            'guard elsewhere treats it as proof of motion. Either implement it on the site pass or reject it as a config ' +
            'error on lattice placement; a silent no-op is the one unacceptable option.',
        probe_type: 'js_eval',
        probe_logic:
            'grep the emitted renderer for every authored key per state and assert a consumer exists on that state own ' +
            'code path; then assert a non-zero scene-region pixel diff between two frames 500ms apart on any state authoring ' +
            'jiggle_scale > 0 with placement:lattice.',
        status: 'OPEN',
        concepts_affected: ['metallic_bonding', 'ionic_bonding'],
        fixed_in_files: [],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'field3d_lattice_radius_scale_silently_noops_unless_a_reveal_mode_is_authored',
        title: 'radius_scale is multiplied by the reveal ramp factor, which is zero at reveal:none',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause:
            'field_3d_renderer.ts:54416 computes rsNow = 1 + (rsTarget - 1) * revF, and revF is hard 0 when revMode === "none" ' +
            '(:54412). So lattice.radius_scale — documented and used as an independent knob — does nothing on any state ' +
            'authoring reveal:none, with no warning. This is the exact lever identified to fix metallic_bonding STATE_1 ' +
            'legibility; pulled alone it would have failed silently.',
        prevention_rule:
            'A knob whose effect is gated on an unrelated key must either declare the dependency in the config schema and ' +
            'reject the invalid combination, or be applied independently. Silent no-ops on legibility knobs are how an ' +
            'unreadable state passes review twice.',
        probe_type: 'js_eval',
        probe_logic:
            'Assert that authoring radius_scale != 1 changes the drawn site radius; fail the config if radius_scale is ' +
            'authored alongside reveal:none.',
        status: 'OPEN',
        concepts_affected: ['metallic_bonding'],
        fixed_in_files: [],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'pixel_gate_d5_max_reducer_lets_a_dom_annotation_certify_a_static_scene',
        title: 'D5 passes a byte-static 3D scene because one text overlay toggling clears the canvas floor',
        severity: 'CRITICAL',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause:
            'pixelGate.ts:273 reduces adjacent-pair diffs with Math.max, so ONE pair anywhere in the state clearing ' +
            'DENSE_MOTION_EPSILON (0.001) certifies the whole state. A DOM annotation appearing is ~4300px of 921600 = 0.47%, ' +
            'five times the floor. Measured on metallic_bonding: STATE_3/4/5/6 changed ZERO scene pixels across 24-27 dense ' +
            'frames each, every change instant landing exactly on an annotation at_ms/until_ms boundary, and D5 passed all ' +
            'four. STATE_3, STATE_4 and STATE_5 frozen frames are byte-identical over the 3D region (0 of 361900 px).',
        prevention_rule:
            'The motion probe must diff the CANVAS REGION ONLY, excluding DOM overlay bands, and should report the fraction ' +
            'of pairs that moved rather than the max. Renderer-agnostic and fleet-wide: annotations are shared machinery, so ' +
            'any concept on any renderer can pass D5 on text alone.',
        probe_type: 'js_eval',
        probe_logic:
            'Re-run D5 with overlay bands masked out and assert a non-zero scene-region diff in a majority of adjacent pairs; ' +
            'cross-check that the set of change instants is not a subset of the annotation at_ms/until_ms values.',
        status: 'OPEN',
        concepts_affected: ['metallic_bonding'],
        fixed_in_files: [],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'pixel_gate_d5_declares_every_explore_state_static_so_a_rule37_freeze_is_unreachable',
        title: 'A skipped D5 is pushed as passed=true, and every scenario branch declares its explore state static',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause:
            'pixelGate.ts:302-305 pushes the skipped branch with passed=true. deriveStateMeta declares mode===explore static ' +
            'in every scenario branch (em_wave, orbital_shapes, bonding_scene, ac_resistor, ac_inductor and others), so ' +
            'expectsMotion===false and D5 never runs on an explore state. A fully frozen explore state — the Rule 37 defect ' +
            'class — is therefore unreachable by D5 on any concept on any renderer. metallic_bonding shipped exactly that ' +
            'defect into review, found by hand from a byte-diff, not by the gate.',
        prevention_rule:
            'A check that did not run must be reported as SKIPPED, never as passed, and a skip must not aggregate into a pass ' +
            'count. Rule 37 needs its own probe: for any interaction_complete state, byte-compare two late frames and fail on ' +
            'equality.',
        probe_type: 'js_eval',
        probe_logic:
            'For every state with advance_mode interaction_complete, capture two frames >= 1s apart after narration end and ' +
            'assert they differ; report skipped checks with a distinct status that cannot aggregate into a pass count.',
        status: 'OPEN',
        concepts_affected: ['metallic_bonding'],
        fixed_in_files: [],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'field3d_fixed_900ms_reveal_ramp_cannot_satisfy_the_d6_teleport_guard',
        title: 'BS_REVEAL_MS 900ms against a 1s sampling grid makes any large lattice reveal unauthorable without a D6 failure',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause:
            'BS_REVEAL_MS is hard-coded at 900ms (field_3d_renderer.ts:51662) and is not authorable. THE EYE samples dense ' +
            'frames on a 1-second grid, and D6 fails any adjacent pair exceeding max(20%, 8x median). A peer_fade reveal on ' +
            'metallic_bonding STATE_1 changes ~40.7% of pixels in total (fade-dominated: BS_PEER_FADE_OPACITY 0.12 is also an ' +
            'engine constant), so the 900ms ramp necessarily straddles two buckets. Measured across three authored ' +
            'reveal_at_ms values: 17200 gave 24.85%, 17550 gave 22.82/17.18%, 17600 gave 21.05/19.68% — the best split ' +
            'achievable and still over the floor. Starting the ramp on a bucket boundary is strictly worse: the entire ~40% ' +
            'lands in ONE pair. There is therefore NO authorable value that passes.',
        prevention_rule:
            'An engine transition whose duration is shorter than the visual gate sampling interval cannot be tuned into ' +
            'compliance from JSON, so either the ramp duration must be authorable (a reveal_duration_ms alongside ' +
            'reveal_at_ms) or D6 must recognise a declared, continuous, one-shot reveal as not-a-teleport. Do not let an ' +
            'author burn cycles tuning a cue time against a constant they cannot reach — and do not let the workaround be ' +
            'shrinking the reveal until it is too small to read.',
        probe_type: 'js_eval',
        probe_logic:
            'For any state authoring lattice.reveal, assert the total pixel change of the reveal divided by the ramp ' +
            'duration in sampling intervals is under the D6 per-step floor; if not, flag the config as unauthorable rather ' +
            'than failing the state.',
        status: 'OPEN',
        concepts_affected: ['metallic_bonding'],
        fixed_in_files: [],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'field3d_60deg_fov_offaxis_camera_cannot_render_a_crystal_lattice_as_a_lattice',
        title: 'A regular lattice cannot read as regular under a 60-degree perspective FOV viewed off-axis',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause:
            'The renderer camera is PerspectiveCamera(60, ...) (field_3d_renderer.ts:3341) — a wide-angle lens — and the ' +
            'lattice_grow camera views from az 35 / el 26 (:51966). Two independent consequences, both measured on ' +
            'metallic_bonding STATE_1: (1) at 60 degrees FOV and fit distance, near sites draw 2.40x the radius of far sites ' +
            '(46.6px vs 111.9px), so equal spacings project unequally and the eye cannot read a regular grid; (2) az 35 / ' +
            'el 26 is off every crystallographic axis of a cubic cell, so no row of sites ever lines up on screen. The state ' +
            'claims "Atoms pack in rows" and "The same spacing repeats everywhere" and neither is visible. Confirmed ' +
            'unauthorable: three reveal mechanisms (peer_fade, cutaway), three radius_scale values (0.45/0.6/1.0) and three ' +
            'block sizes were rendered and read; none produces a lattice reading, because the distortion is in the ' +
            'projection, not the geometry. Every textbook draws bcc/fcc/hcp orthographic or near-orthographic for exactly ' +
            'this reason.',
        prevention_rule:
            'A scenario whose subject is a REGULAR ARRAY needs a near-orthographic projection (a narrow FOV at a long ' +
            'distance, or an OrthographicCamera) and a camera aligned to a crystallographic axis, or the regularity it ' +
            'exists to teach is destroyed by the projection. A wide FOV is right for a single molecule with depth and wrong ' +
            'for a lattice. This cannot be compensated from JSON: reveal mode, radius_scale and block size all leave the ' +
            'projection unchanged.',
        probe_type: 'js_eval',
        probe_logic:
            'For any state with placement:lattice, project all sites and assert the ratio of largest to smallest drawn site ' +
            'radius is under ~1.3, and that at least one lattice row projects to a straight line of near-equal screen ' +
            'spacings; fail the camera, not the config.',
        status: 'OPEN',
        concepts_affected: ['metallic_bonding', 'ionic_bonding'],
        fixed_in_files: [],
        subject: 'subject_neutral',
    },
];

async function main(): Promise<void> {
    console.log(`Seeding ${ROWS.length} metallic_bonding-session defect classes into engine_bug_queue…\n`);

    let withSubject = true;
    let inserted = 0;
    const failures: string[] = [];

    for (const row of ROWS) {
        const base = {
            ...row,
            discovered_in_session: SESSION,
            row_type: 'incident',
            fixed_at: null,
            updated_at: new Date().toISOString(),
        };

        let payload: Record<string, unknown> = { ...base };
        if (!withSubject) delete payload.subject;

        let { error } = await supabaseAdmin
            .from('engine_bug_queue')
            .upsert(payload, { onConflict: 'bug_class' });

        if (error && /subject|owner_cluster/i.test(error.message)) {
            withSubject = false;
            payload = { ...base };
            delete payload.subject;
            ({ error } = await supabaseAdmin
                .from('engine_bug_queue')
                .upsert(payload, { onConflict: 'bug_class' }));
        }

        if (error) {
            failures.push(`${row.bug_class}: ${error.message}`);
            console.log(`  ✖ ${row.bug_class} — ${error.message}`);
        } else {
            inserted++;
            console.log(`  ✓ [${row.severity.padEnd(8)}] ${row.bug_class}`);
        }
    }

    console.log(`\n${inserted}/${ROWS.length} rows upserted.`);
    if (failures.length) {
        console.log(`\n${failures.length} failure(s):`);
        for (const f of failures) console.log(`  - ${f}`);
        process.exitCode = 1;
    }

    const { count } = await supabaseAdmin
        .from('engine_bug_queue')
        .select('*', { count: 'exact', head: true })
        .eq('discovered_in_session', SESSION);
    console.log(`\nengine_bug_queue rows tagged "${SESSION}": ${count}`);
}

main();
