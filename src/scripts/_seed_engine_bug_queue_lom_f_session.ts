/**
 * The remaining lom-f session findings, into engine_bug_queue.
 *
 * Founder instruction (2026-08-01): put everything from this session in the table
 * so it cannot recur. The seven defects from the two video reviews are already in
 * (see _seed_engine_bug_queue_impulse_review*.ts and _impulse_video2.ts); this file
 * carries the rest — the quality-auditor blockers, the two visual defects found by
 * chasing them, and the three PROCESS scars that let broken work be reported as
 * fixed.
 *
 * Idempotent: upsert onConflict bug_class.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_lom_f_session.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const R = 'lom-f impulse quality-auditor round 1 (2026-07-31)';
const V = 'lom-f impulse founder video review (2026-08-01)';

const rows: Record<string, unknown>[] = [
    {
        bug_class: 'field3d_param_ramp_end_ms_equals_repeat_every_ms_burns_the_whole_ramp_in_cycle_zero',
        title: 'A param_ramp whose end_ms equals repeat_every_ms finishes inside the first cycle, so every later cycle is identical and the narrated trend never happens',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        root_cause:
            'impulse authored param_ramp.end_ms == repeat_every_ms on STATE_4/6/7 (4894/4894, 3966/3966, 4894/4894). The ramp is a closed form of the state clock, so the whole sweep was consumed before the first re-arm and every later launch repeated the final value. Measured STATE_4 peaks: 87.92, 105.02, 120.37, then 134.16 four times constant, while the narration promised a rising trend. Direct hit on teach_visual_must_match_narration. The shape still validates GREEN: Gate 8n fences mode step without repeat_every_ms, but NOTHING fences continuous with end_ms less than or equal to repeat_every_ms.',
        prevention_rule:
            'Size end_ms = N x repeat_every_ms for N+1 distinct launches spanning from to to inclusive, and prefer mode step so each cycle holds one value. Add a validator gate rejecting a param_ramp whose end_ms is at most repeat_every_ms when mode is continuous or absent: that combination can only ever show one distinct value per state.',
        probe_type: 'js_eval',
        probe_logic:
            'For every state with a param_ramp and a repeat_every_ms, assert end_ms > repeat_every_ms. Then drive the state and assert the launch value differs across at least 3 consecutive re-arm cycles.',
        status: 'FIXED',
        concepts_affected: ['impulse'],
        fixed_in_files: ['src/data/concepts/impulse.json'],
        discovered_in_session: R,
        row_type: 'incident',
    },
    {
        bug_class: 'field3d_param_ramp_velocity_write_cancels_the_rebound_every_frame',
        title: 'A v1 ramp rewrote live velocity every frame, so the ball could never leave the wall',
        severity: 'CRITICAL',
        owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause:
            'mbRunParamRamp called mbSetParam every frame with no churn guard and no early-out after saturation, and mbSetParam overwrote live velocity whenever the body was not engaged, erasing the NEGATIVE post-rebound velocity. Measured 15 contact events where 4 belong, clustered exactly 71 ms apart (one contact duration); the free ball also visibly ACCELERATED during its approach with nothing touching it. Control: an identical state with no ramp gave 5 clean bounces. No authored value could avoid it while param_ramp.param was v1.',
        prevention_rule:
            'A shared live write-path asks what the ENGINE is in the middle of, never who is writing. Distinguish a body that is STAGED awaiting launch (live v may be retimed) from one already SPENT in flight (v belongs to the physics). Never let a per-frame scripted write touch state the integrator is producing.',
        probe_type: 'js_eval',
        probe_logic:
            'Ramp each value of param_ramp.param in turn; assert the contact-event count over a fixed window equals the expected bounce count, and that velocity stays negative for the whole post-rebound flight.',
        status: 'FIXED',
        concepts_affected: ['impulse'],
        fixed_in_files: ['src/lib/renderers/field_3d_renderer.ts'],
        discovered_in_session: R,
        row_type: 'incident',
    },
    {
        bug_class: 'field3d_live_write_during_an_engaged_contact_breaks_the_segment_being_solved',
        title: 'Writing stiffness or mass into a contact the solver has already committed to breaks elasticity and momentum conservation',
        severity: 'CRITICAL',
        owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause:
            'mbSetParam wrote contacts[0].k unconditionally, including while c.engaged, changing stiffness underneath an already-solved contact segment. Measured: k=1601 gave 82.8 ms / 111.13 N / area 5.8136 and the ball departed at -2.811 m/s instead of -3.000; closed forms for a FIXED k=1601 give 120.04 N / 78.5 ms, so the observed pair matched NEITHER. The same hole existed on the MASS branch and was worse: an unguarded mid-contact mass write moves p = mv instantly and broke Sigma-p by 2 to 3 percent ACROSS a contact, in the one scenario whose entire job is conserving it.',
        prevention_rule:
            'Defer any live write into a segment the solver is mid-way through (engaged and not latched), per contact so a busy lane never blocks a free one. Store no pending value: a closed-form scripted source rewrites every frame and self-heals on the first free frame. Extend the guard to EVERY quantity inside the reduced mass or the force law, not only the obvious one.',
        probe_type: 'js_eval',
        probe_logic:
            'Ramp k and m through a contact; assert the parameter is exactly constant across each engaged segment and that measured F_peak and t_c match the closed form for that segment value. Assert Sigma-p is conserved across the contact to 1e-12.',
        status: 'FIXED',
        concepts_affected: ['impulse'],
        fixed_in_files: ['src/lib/renderers/field_3d_renderer.ts'],
        discovered_in_session: R,
        row_type: 'incident',
    },
    {
        bug_class: 'field3d_compliant_contact_standoff_leaves_a_visible_gap_at_the_moment_of_impact',
        title: 'A compliant contact with a non-zero natural length makes the ball bounce off thin air',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        root_cause:
            'The contact engages when facing-face separation is at most natural_length_m and compresses by delta = L_nat minus separation. With L_nat authored 0.4 m the peak compression F_peak/k was only 0.067 m (rigid) or 0.212 m (padded), so the surfaces never came closer than 0.333 m or 0.188 m, about 60 percent of a ball DIAMETER on the rigid wall. The founder saw force arrows and F = 127.4 N on the HUD with a clear gap between ball and wall. It was masked for months because a drawn contact element spanned exactly that gap; deleting the element did not create the gap, it revealed it.',
        prevention_rule:
            'natural_length_m is a STANDOFF, not a decoration: the surfaces can never approach closer than L_nat minus F_peak/k. Author it as 0 so contact begins when the surfaces meet, and remember the compression must then appear as overlap. Never use a drawn element to fill a geometric gap, because the element hides an authoring error rather than fixing it.',
        probe_type: 'js_eval',
        probe_logic:
            'At the frame of peak compression assert the facing-face separation is at most 0 (surfaces touching or overlapping). Assert no scene object spans the gap between the two contacting bodies at any time.',
        status: 'FIXED',
        concepts_affected: ['impulse'],
        fixed_in_files: ['src/data/concepts/impulse.json'],
        discovered_in_session: V,
        row_type: 'incident',
    },
    {
        bug_class: 'field3d_glow_focal_matching_nothing_dims_every_peer_and_brightens_none',
        title: 'A glow_focal naming an element that does not exist leaves the whole state dimmed with nothing highlighted',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause:
            'glowActive was computed as focal OR glowTargets.length > 0, so a focal string matching no element still switched emphasis ON while resolving to no target. Every peer dimmed and nothing brightened: the state rendered with the lights down and no focus, which is worse than no emphasis at all. It surfaced when an element was deleted from the engine while three states still authored glow_focal pointing at it, but the same hole opens on any typo in an authored focal id.',
        prevention_rule:
            'Resolve the focal FIRST and count matches. Zero matches means emphasis is off entirely (full brightness, nothing dimmed) plus one deduped warning naming the unresolvable value, never a silent partial state. An id-valued config key must fail loudly or degrade to the neutral state, never to a half-applied one.',
        probe_type: 'js_eval',
        probe_logic:
            'Author a glow_focal that matches nothing; assert no element has reduced emissive intensity and that exactly one warning names the bad value. Sweep every authored glow_focal in the concept and assert each resolves to at least one element.',
        status: 'FIXED',
        concepts_affected: ['impulse'],
        fixed_in_files: ['src/lib/renderers/field_3d_renderer.ts'],
        discovered_in_session: V,
        row_type: 'incident',
    },
    {
        bug_class: 'field3d_a_counter_cleared_on_re_arm_erases_the_evidence_of_a_once_per_cycle_defect',
        title: 'bound_hits is zeroed on every re-arm, so a clamp that fires once per cycle leaves no trace for any probe to find',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause:
            'mbSeedKinematics zeroes eng.bound_hits on each re-arm. A track clamp that fired once per cycle therefore erased its own evidence before any harness could read it, which is why the guided two-lane STATE_5 was clamping a ball dead at the track end on EVERY cycle, 68 of 700 frames, while every automated gate reported clean. The defect was found only by chasing a different symptom in another state.',
        prevention_rule:
            'Any counter used as PROOF that something never happened must be cumulative for the lifetime of the state, cleared only on entry or an explicit trajectory reset, never by a routine event inside the run. Keep the per-cycle counter if the display needs it, but assert against the cumulative one.',
        probe_type: 'js_eval',
        probe_logic:
            'Assert the cumulative counter bound_hits_all is 0 across the whole state, not the per-cycle counter. Verify the cumulative counter survives at least 3 re-arms in a state known to clamp.',
        status: 'FIXED',
        concepts_affected: ['impulse'],
        fixed_in_files: ['src/lib/renderers/field_3d_renderer.ts'],
        discovered_in_session: V,
        row_type: 'incident',
    },
    {
        bug_class: 'harness_proving_one_value_of_a_closed_enum_and_generalising_to_all_of_them',
        title: 'A bring-up harness exercised one member of a config enum and the surface was reported as fully implemented',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause:
            'The momentum_bench SEAM harness ramped param_ramp.param = k and only k, and asserted only BETWEEN contacts. On that basis the whole config surface was reported implemented with nothing parsing-and-ignoring. The v1 write-path had never executed, and the first authored concept to touch it hit two CRITICAL defects immediately; the k path itself was also broken DURING a contact, which between-contacts sampling could never see.',
        prevention_rule:
            'A harness covering a closed enum must exercise EVERY member, and must sample across the event it governs, not only between events. Generalising from one member to a whole surface is the reviewer claim, not the harness evidence: state coverage in terms of which members and which phases were actually driven.',
        probe_type: 'js_eval',
        probe_logic:
            'Enumerate the closed enum from the type or contract, assert one fixture exists per member, and assert each fixture samples at least one frame while the governed event is active.',
        status: 'FIXED',
        concepts_affected: ['impulse'],
        fixed_in_files: ['src/scripts/_scratch_mb_seams.ts'],
        discovered_in_session: 'lom-f Phase 0 gap, found by impulse (2026-07-31)',
        row_type: 'probe_definition',
    },
    {
        bug_class: 'review_site_served_with_http_caching_shows_the_reviewer_stale_pixels',
        title: 'A review server started without cache headers serves an hour-old sim while every check on the builder side reports fixed',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        root_cause:
            'The review site was served by http-server WITHOUT -c-1, so responses carried the default one-hour max-age. The sim loads in an iframe, so a hard refresh of the outer page did not re-fetch it. Three engine fixes were verified on disk and by a server-side fetch, both of which bypass the browser cache, and were reported to the founder as done while the founder was being served the old sim and correctly said nothing had changed. A first start attempt had appeared to fail while silently holding the port, so a second start with -c-1 was a no-op.',
        prevention_rule:
            'Verify a fix through the SAME path the reviewer uses: fetch the served URL and assert the new marker is present AND that Cache-Control disables caching. Checking the file on disk, or a fetch you make yourself, tests a different thing. When a server appears to fail to start, confirm the port owner before starting another.',
        probe_type: 'manual',
        probe_logic:
            'Request headers for the served sim URL and assert Cache-Control contains no-store; then fetch the body and assert a marker string from the newest commit is present.',
        status: 'FIXED',
        concepts_affected: ['impulse'],
        fixed_in_files: [],
        discovered_in_session: V,
        row_type: 'incident',
    },
    {
        bug_class: 'parallel_dispatch_reseeds_the_cache_while_the_other_agent_is_still_writing',
        title: 'Two agents editing one concept in parallel: the first re-seeded and ran the visual gate against the half-written JSON of the second',
        severity: 'MODERATE',
        owner_cluster: 'alex:json_author',
        root_cause:
            'An engine dispatch and a content dispatch ran concurrently on the same concept. The engine agent correctly re-seeded simulation_cache before its visual run, but did so before the content agent had finished writing the JSON, so its 35/35 pass certified the OLD content and it reported in good faith that the run had exercised the new state. The frames proved otherwise.',
        prevention_rule:
            'A cache re-seed is only valid for the tree state at the instant it runs. When dispatches run in parallel against one concept, the orchestrator owns the definitive re-seed and gate run AFTER all of them land, and a parallel agent visual result is provisional and must be labelled as such in its report.',
        probe_type: 'manual',
        probe_logic:
            'Before trusting a visual run, assert the concept file modification time and git status are unchanged since the seed script ran.',
        status: 'FIXED',
        concepts_affected: ['impulse'],
        fixed_in_files: [],
        discovered_in_session: V,
        row_type: 'incident',
    },
    {
        bug_class: 'zod_superrefine_gate_silently_never_runs_when_the_probe_fixture_fails_base_parse',
        title: 'A superRefine gate is unreachable for any object that fails the base schema, so a probe built on an invalid fixture proves nothing',
        severity: 'MODERATE',
        owner_cluster: 'alex:json_author',
        root_cause:
            'Zod runs superRefine only after the base object parses. A gate written as a superRefine and probed with a deliberately invalid fixture never executes, and the probe reports the gate as passing when it never ran at all. Found while proving the mutually-exclusive-keys gate on momentum_bench.',
        prevention_rule:
            'Prove a superRefine gate with a fixture that is VALID except for the one condition under test, and assert on the specific issue message, never merely on parse failure. A gate that has never been observed to fire has not been tested.',
        probe_type: 'js_eval',
        probe_logic:
            'Build a fixture valid under the base schema except for the single targeted violation; assert safeParse fails AND that the emitted issue message matches the gate wording.',
        status: 'OPEN',
        concepts_affected: ['impulse'],
        fixed_in_files: [],
        discovered_in_session: 'lom-f SEAM C (2026-07-31)',
        row_type: 'probe_definition',
    },
];

async function main(): Promise<void> {
    console.log(`upserting ${rows.length} lom-f session rows...`);
    let ok = 0;
    for (const r of rows) {
        const { error } = await supabaseAdmin
            .from('engine_bug_queue')
            .upsert(r, { onConflict: 'bug_class' });
        if (error) console.error(`  FAIL ${String(r.bug_class)}: ${error.message}`);
        else { ok += 1; console.log(`  ok  ${String(r.bug_class)}`); }
    }
    console.log(`${ok}/${rows.length} upserted`);
    if (ok !== rows.length) process.exit(1);
}

main().catch((err) => {
    console.error('seed failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
