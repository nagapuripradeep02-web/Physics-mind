/**
 * Seed engine_bug_queue with the defect classes surfaced by the Phase-0 bonding
 * wave: the E3b engine programme (8 field3d_surgeon dispatches) plus the
 * `ionic_bonding` authoring run (Checkpoint A, two quality_auditor cycles,
 * three eye_walker walks, two founder_proxy Checkpoint-B cycles).
 *
 * Why this exists: root CLAUDE.md §2 — engine_bug_queue IS the build-side moat.
 * Every agent queries it for prevention_rules BEFORE authoring, so a defect
 * that is not recorded here is a defect the NEXT concept repeats. This wave
 * produced its rows as SQL text inside dispatch reports and none had been
 * applied; `metallic_bonding` is authoring against this same engine right now,
 * so the un-filed rows were actively costing the sibling desk.
 *
 * The through-line of the whole wave, worth reading before the table: FIVE of
 * these classes are the same shape — a mechanism, a gate or a correction that
 * was applied to ONE surface and not to its sibling. Site layer vs unit layer.
 * One camera row vs the other twelve. `coordination`'s fit_ramp vs
 * `lattice_grow`'s. The melt's containment vs the drift's. The narration and
 * annotation a rigor doc named vs the state title it did not. Nothing in the
 * build catches that shape, which is why it recurred five times in one wave.
 *
 * Idempotent: upserts on the UNIQUE bug_class, so re-running only refreshes.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_bonding_wave_e3b.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'bonding-wave-e3b-ionic-2026-08-05';
const BOTH = ['ionic_bonding', 'metallic_bonding'];
const IONIC = ['ionic_bonding'];

const R = 'src/lib/renderers/field_3d_renderer.ts';
const GATE = 'src/scripts/check_bonding_scene.ts';
const META = 'src/lib/validators/visual/deriveStateMeta.ts';
const JSON_ = 'src/data/concepts/chemistry/ionic_bonding.json';

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
    // ─────────────────────────────────────────────────────────────────────
    // THE PARITY FAMILY — one mechanism, one of two layers
    // ─────────────────────────────────────────────────────────────────────
    {
        bug_class: 'field3d_site_layer_ignores_the_unit_layer_position_script',
        title: 'bonding_scene: the site (ion/lattice) layer ignored every scripted position mechanism the unit layer had',
        severity: 'CRITICAL',
        owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause:
            'sitePos was built from the raw authored SI.at plus spin and never called the sepAt/baseAt/orgAt chain. bscIsSite switches the unit layer OFF for ion and bare-atom species, so nothing picked up the slack: separation, separation_axis, approach_from, approach_at_ms and approach_duration_ms were ALL inert on ions and on every lattice. A state authoring mode approach_link on two ions was byte-static while deriveStateMeta, reading the same authored fields, declared it MOVING. Second order: bscOpeningExtent and bscSiteExtent both carried "if (!msp) continue;" and skipped every species not in MG_MOLECULES, so an ion pair opening at approach_from was framed for its settled pose and opened off frame. ionic_bonding S3 was a dead state certified as buildable.',
        prevention_rule:
            'A scenario with TWO draw layers gets ONE position chain, as top-level pure functions BOTH layers call — never a mechanism added to one draw pass. check:bonding-scene section 32 asserts that every scripted position mechanism appears in both chains, so a one-sided addition fails automatically.',
        probe_type: 'js_eval',
        probe_logic:
            'For each of {separation_axis, the separation ramp, the temperature ramp, bscJiggle}: the regex must match in the unit chain IFF it matches in the site chain (bscSiteBaseAt + bscSiteAt + bscSepAt + bscTempAt). Plus: bscSiteAt on an approach fixture at t=0 differs from t=state_end and the end separation equals the authored value exactly.',
        status: 'FIXED',
        concepts_affected: BOTH,
        fixed_in_files: [R, GATE],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'field3d_thermal_jiggle_has_one_call_site_so_lattice_states_are_byte_static',
        title: 'bonding_scene: thermal.jiggle_scale was a no-op on every lattice and ion scene, under a green MOVING declaration',
        severity: 'CRITICAL',
        owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause:
            'bscJiggle was called exactly once in the whole file, inside the unit layer orgAt. Every lattice and ion state therefore rendered byte-frozen while deriveStateMeta read the same authored jiggle_scale and declared the state MOVING — a green motion gate over a dead beat. The explore idle-spin fallback compounded it by standing DOWN on jiggle_scale > 0, so a lattice sandbox authoring jiggle under the no-static-state discipline got no jiggle AND no spin.',
        prevention_rule:
            'A motion signal that a SECOND file reads in order to DECLARE motion must be live for the layer that actually draws the state. A fallback may only stand down on such a signal. Assert motion from rendered frames, never from an authored field.',
        probe_type: 'js_eval',
        probe_logic:
            'Lattice fixture with thermal.jiggle_scale 1: the site pose at t and t+200ms must differ; with jiggle_scale 0 they must be identical. Explore + lattice + jiggle + no spin_rate: poses 400ms apart must differ.',
        status: 'FIXED',
        concepts_affected: BOTH,
        fixed_in_files: [R, META, GATE],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'field3d_shell_dots_bind_to_the_molecule_table_and_fall_back_to_hcl',
        title: 'bonding_scene: electrons.show shells drew ONE dot on a sodium atom and the HUD printed "outer electrons = 1"',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause:
            'The valence ring counted BS_VALENCE[mol.central], drew one ring at the focal MOLECULAR unit origin, and sized it off MG_ELEMENTS — while "if (!MG_MOLECULES[molKey]) molKey = HCl" silently resolves any non-molecular scene to HCl. A scene of bare Na and Cl atoms therefore drew BS_VALENCE.H = 1 dot buried inside the sodium sphere, and the valence HUD line read the same wrong field. A decoration layer bound to a table the scene is not made of, with a fallback that makes the mismatch invisible. ionic_bonding S1 was a dead state certified as buildable.',
        prevention_rule:
            'Any per-object decoration or readout resolves against the layer that is actually on screen (the radius_pm HUD branch is the reference implementation). A shared fallback constant must never be able to answer for a scene it does not describe.',
        probe_type: 'js_eval',
        probe_logic:
            'units [{species:Na},{species:Cl}] + electrons.show shells: exactly 8 visible shell dots, 1 ringing Na and 7 ringing Cl; the valence HUD names BOTH participants. Negative control: BS_VALENCE[MG_MOLECULES.HCl.central] === 1 and the HCl fallback line is still present.',
        status: 'FIXED',
        concepts_affected: BOTH,
        fixed_in_files: [R, GATE],
        subject: 'subject_neutral',
    },

    // ─────────────────────────────────────────────────────────────────────
    // CONTAINMENT — a sample is not allowed to leave itself
    // ─────────────────────────────────────────────────────────────────────
    {
        bug_class: 'field3d_melting_sample_disperses_past_its_own_container_volume',
        title: 'A melting sample wandered further than the sample is wide and invaded the neighbouring block',
        severity: 'CRITICAL',
        owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause:
            'The melt law let each ion wander 8.64 scene units against a 3x3x3 block whose own half-span is 5.875 u. Melting was modelled as loss of ORDER and loss of CONTAINMENT together, so two co-present samples (ionic_bonding S8 solid-vs-molten, S9 NaCl-vs-MgO) rendered as one fused blob with both group labels on it, destroying the negative-control pedagogy those states exist for. A liquid keeps its volume.',
        prevention_rule:
            'A disorder law is bounded by the sample envelope it belongs to: the group own lattice box grown by a NAMED fusion-expansion constant (BS_MELT_EXPAND = 1.08, the real ~26% volume expansion). Bound by reflection, not by a clamp, so surface ions are not pinned flat; apply the fold to the lattice point and hand only the NET displacement forward, so jiggle/drift/slip are untouched.',
        probe_type: 'js_eval',
        probe_logic:
            'Over the shipped position chain, sample every site every 250 ms through the beat: no site leaves its group envelope on any axis (jiggle off), no site crosses nearer the neighbouring group centre than its own, and — the negative control — sites still displace past 0.2 u (a frozen melt would pass containment and fail the lesson).',
        status: 'FIXED',
        concepts_affected: IONIC,
        fixed_in_files: [R, GATE],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'field3d_ion_drift_migration_unbounded_leaves_the_sample_and_invades_the_neighbour',
        title: 'Field-driven ion migration was not bounded by the sample, so a molten group anions drifted into the solid block beside it',
        severity: 'CRITICAL',
        owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause:
            'bscIonDriftOf translated a mobile ion 1.6 nearest-neighbour spacings along the field with no containment. The melt fix bounded the disorder and explicitly exempted the migration, so at full field ionic_bonding S8 molten Cl- sublattice was drawn INSIDE the solid negative control (15.4 u migration, 78 neighbour crossings). Same class as the melt excursion fixed in the same programme, one mechanism over — and physically wrong the same way: electrolysis carries ions to the ELECTRODES, i.e. to the sample surface, not out of the sample.',
        prevention_rule:
            'Every per-site excursion law (disorder, migration, slip) is bounded by the group envelope it belongs to; the bound is a property of the SAMPLE, not of the mechanism. Directionless motion FOLDS; driven motion PILES (a soft algebraic wall whose depth is the smaller of the constant and the drive itself, so planes stay ordered and nothing pops when the field arrives). Ions reaching the envelope face is the correct picture — the space-charge layer — not a defect.',
        probe_type: 'js_eval',
        probe_logic:
            'Sample every site of every group through the beat at full field (scripted ramp AND drag): no site leaves its own envelope, zero crossings — PAIRED with the lesson controls (sublattices separate by sign and are disjoint along the field axis, each pile on the face its charge sends it to, piled ions still travel > 0.5 nn, the solid half bit-identical with field on/off).',
        status: 'FIXED',
        concepts_affected: IONIC,
        fixed_in_files: [R, GATE],
        subject: 'subject_neutral',
    },

    // ─────────────────────────────────────────────────────────────────────
    // CAMERA / FRAMING
    // ─────────────────────────────────────────────────────────────────────
    {
        bug_class: 'field3d_camera_solved_for_the_post_reveal_pose_does_not_ramp_with_the_scene_it_frames',
        title: 'A camera solved for the pose a reveal ARRIVES at framed the pose the state OPENS in',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause:
            'bonding_scene coordination was solved at dist 16 for the ball-and-stick pose (radius_scale 0.35) the reveal reaches, while the reveal starts at 3500 ms — so the state rendered its packed block under that camera for its first 3.5 s at worst |NDC| 1.653 (one sphere filling 60% of the frame under a HUD already printing coordination = 6 : 6), then jumped 68.9% of pixels in one second when the reveal fired. A camera solved once at state entry is correct only if the scene has ONE pose. The sibling row lattice_grow had the same defect in the opposite direction (solved for the GROWN block, opening its seed pair at a 5.03x collapse on the PRIMARY aha state).',
        prevention_rule:
            'A state whose scene changes scale during its own beat is framed for the pose it OPENS in and ramps to its solved distance across the SAME ramp that changes the scene (fit_ramp). Closed form in the ramp fraction, so a freeze pin photographs the same distance. Every camera fixture is measured at EVERY pose it is drawn in, the pre-reveal pose included. Size a smoothing window in the RAMP own domain, never in items at the average rate — an eased ramp snaps otherwise.',
        probe_type: 'js_eval',
        probe_logic:
            'For each camera row, measure worst |NDC| of every drawn disc at each scale the row is drawn at; a fit_ramp row is measured at its opening distance while the scene is unrevealed and at its solved distance at the ramp target. Sweep the ramp at 16 ms: 0 under-framed frames, 0 non-monotone frames, worst single-frame move < 2.0 u.',
        status: 'FIXED',
        concepts_affected: IONIC,
        fixed_in_files: [R, GATE],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'framing_gate_measures_containment_only_so_an_empty_frame_passes',
        title: 'A framing gate that only asks "is it inside the frame" certifies a camera parked far away',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause:
            'The framing section measured worst |NDC| <= 1.0 over every drawn disc at every camera row. That metric is ONE-SIDED: a camera solved for a scene the state has not built yet passes it trivially, because a smaller scene at a farther camera is contained by construction. ionic_bonding S4 opened with its seed pair at 7% of frame width (fill 0.195) and every assertion in the gate passed, across two framing dispatches.',
        prevention_rule:
            'Every camera row is measured at the pose it OPENS in as well as the pose it settles into, and against BOTH bounds: containment (|NDC| <= 1.0) and FILL (the frame is not mostly empty). A row fixture must carry the scripted beat the shipped state authors, or the fixture IS the settled pose and the opening one is unmeasurable. A camera row with no fixture FAILS — that is how an unmeasured camera shipped.',
        probe_type: 'js_eval',
        probe_logic:
            'For each camera row: build the opening scene (growth cut to grow_from, scripted-only excursions zeroed, approach at approach_from), compute the distance the shipped apply puts it at on frame 1, assert FILL_MIN <= worstNdc <= 1.0. Negative control: the pre-fix lattice_grow camera measures fill 0.195 at its opening pose and PASSES at the settled pose it was solved for.',
        status: 'FIXED',
        concepts_affected: IONIC,
        fixed_in_files: [GATE],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'field3d_camera_fit_ignores_a_pose_only_an_exposed_slider_can_reach',
        title: 'The engine-owned camera fit framed the authored pose and not the pose a live control can reach',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause:
            'bscSiteExtent is solved once at state entry from config alone (correct — a fit chasing live geometry would move the camera whenever a teacher touched a control, Rule 32d). But an explore sandbox exposing the shift slider authors no shift block, so the extent covered only the packed lattice and a drag to full travel pushed the cleaved half off the frame edge. Invisible to every closed-form assertion; found by reading a drag frame.',
        prevention_rule:
            'When a control can drive geometry, the fit reads that control FULL TRAVEL as a config fact (a slider bound in site units has a known maximum), so the reachable pose is framed without the fit ever reading the clock or the drag state.',
        probe_type: 'js_eval',
        probe_logic:
            'Assert the shift extent is 0 for a scene with neither an authored shift nor a shift control, and equals the authored-shift extent for an explore scene that exposes the shift control and authors no shift.',
        status: 'FIXED',
        concepts_affected: BOTH,
        fixed_in_files: [R, GATE],
        subject: 'subject_neutral',
    },

    // ─────────────────────────────────────────────────────────────────────
    // GATES THAT REPORTED CLEAN OVER NOTHING
    // ─────────────────────────────────────────────────────────────────────
    {
        bug_class: 'gate_scan_reads_the_wrong_state_container_and_reports_pass_over_zero_files',
        title: 'A shipped-concept scan read j.states while every concept nests under field_3d_config.states, so it had never scanned a file and printed PASS',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause:
            'The slider-range sweep walked src/data/concepts recursively, parsed each file, then read Object.values(j.states) — a container no concept uses. It extracted zero blocks from every file, skipped each one, and reported PASS with "0 concept(s) scanned". A gate that can silently match nothing is worse than no gate: it reads as coverage. The sibling instance was query_engine_bug_queue walking src/data/concepts NON-recursively, so every chemistry concept was invisible and --scenario hard-exited while a chemistry concept was authoring against that scenario.',
        prevention_rule:
            'Any gate that scans shipped files states its structure assumption in ONE named reader, asserts that reader against an in-repo-shaped fixture (a SELF-TEST that arms whatever files exist), and FAILS when a file matches the scan own text trigger but yields zero parsed items. An empty walk exits non-zero rather than reporting a clean sweep.',
        probe_type: 'js_eval',
        probe_logic:
            'SELF-TEST: readBlocks({field_3d_config:{states:{STATE_1:{bonding_scene:{}}}}}) === 1 and readBlocks({field_3d_config:{states:{STATE_1:{}}}}) === 0. LIVE: every file whose raw text contains the scenario name must yield at least one block, else FAIL naming the file.',
        status: 'FIXED',
        concepts_affected: IONIC,
        fixed_in_files: [GATE, 'src/scripts/query_engine_bug_queue.ts'],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'gate_fixture_asserts_a_solid_state_law_at_a_temperature_past_the_melting_point',
        title: 'A jiggle-amplitude fixture ran a NaCl lattice at 1192 K, 118 K past its own melting point',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause:
            'The gate asserted the sqrt(T/T0) jiggle law at T0 and 4*T0 = 1192 K on a NaCl block. The amplitude law is a property of a SOLID; once the melt law landed, the fixture was asking the wrong question of a molten block and read 6.00x instead of 2x. The fixture had been green only because the physics it crossed did not exist yet.',
        prevention_rule:
            'A gate fixture must stay inside the physical regime of the law it asserts. When a new phase transition lands, re-read every fixture whose temperature crosses it.',
        probe_type: 'js_eval',
        probe_logic:
            'Run the amplitude law at 200 K and 800 K (the same 4x ratio, both solid) AND assert that at 1192 K the same block is no longer merely jiggling — so the fixture move is proved to be about physics, not about accommodating new code.',
        status: 'FIXED',
        concepts_affected: IONIC,
        fixed_in_files: [GATE],
        subject: 'subject_neutral',
    },

    // ─────────────────────────────────────────────────────────────────────
    // DERIVED METRICS + INSTRUMENTS
    // ─────────────────────────────────────────────────────────────────────
    {
        bug_class: 'field3d_contact_metric_counts_raw_like_neighbours_instead_of_unscreened_delta',
        title: 'A like-charge contact readout must be a screened DELTA, not a raw same-sign neighbour count',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause:
            'The obvious implementation — count nearest-neighbour pairs of the same charge sign — reads 0 on unshifted rock salt, which looks correct and passes any gate written only against the ionic case. On a cation-only metal the same count reads 8 before anything moves and 6 after, so the instrument would announce that slipping a metal REMOVES like-charge contacts. The wave declared this pair (ionic split vs metallic hold) as its one archetype repeat, so the metric IS the lesson.',
        prevention_rule:
            'A contact metric is a DELTA against the unshifted reference lattice at the same instant, counting only contacts left UNSCREENED; screening is derived from the charge pattern (a lattice carrying one sign of charge only is not neutral by itself, so the compensating charge is delocalised between the cores). Any gate for such a metric must assert the DISAGREEMENT case where naive and intended differ, not only the case where they agree.',
        probe_type: 'js_eval',
        probe_logic:
            'On a cation-only bcc block assert the naive count is non-zero pre-shift AND changes across the slide, while the shipped metric reads 0 on both sides. Ionic rock salt reads 0 -> 6 with a derived gap; a byte-identical shift block must split one and hold the other.',
        status: 'FIXED',
        concepts_affected: BOTH,
        fixed_in_files: [R, GATE],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'field3d_live_readout_flickers_under_thermal_noise_and_stops_being_readable',
        title: 'A live distance readout read the DRAWN positions and flickered 282/294/298 pm on a jiggling lattice',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause:
            'A new separation instrument was written as "the live centre-to-centre distance of the two leading sites", which under a thermal jiggle re-rolls every frame: measured 282 -> 294 -> 298 pm with nothing physical changing. Rule 33d asks for an instrument that TRACKS the physical change; a number that wanders 6% of its own value at 60 Hz is noise a teacher cannot read aloud. Found only by driving the emitted renderer in a browser — every closed-form gate assertion passed.',
        prevention_rule:
            'A numeric HUD reads the quantity a state TEACHES, not whatever the draw layer last computed: equilibrium where the noise is thermal, the drawn value where the motion IS the lesson. Every new readout gets a stability probe over a NOISY fixture, not only a correctness probe over a quiet one.',
        probe_type: 'js_eval',
        probe_logic:
            'Read the instrument over a rock-salt fixture at jiggle_scale 0.35 sampled at 0/250/500/750/1000/4000 ms: every read identical. Negative control: the DRAWN distance at those same times spans more than 1 pm.',
        status: 'FIXED',
        concepts_affected: BOTH,
        fixed_in_files: [R, GATE],
        subject: 'subject_neutral',
    },

    // ─────────────────────────────────────────────────────────────────────
    // AUTHORING / PROCESS CLASSES
    // ─────────────────────────────────────────────────────────────────────
    {
        bug_class: 'skeleton_certifies_a_state_buildable_from_a_mode_string_without_a_frame_probe',
        title: 'An architect skeleton marked states buildable by checking mode names against the implemented-mode enum',
        severity: 'MAJOR',
        owner_cluster: 'alex:architect',
        root_cause:
            'The engine-block map was built by checking mode names against the implemented list and HUD keys against the implemented HUD list. Both checks passed for two states whose beats depend on layers (shell dots, scripted separation, jiggle) that the mode enum says nothing about. Enum membership is a NECESSARY, not sufficient, condition for buildability — a mode string only selects the solved camera. Two dead states reached json_author certified as live.',
        prevention_rule:
            'A skeleton that marks a state buildable must name the specific renderer FUNCTION that produces its motion, with a line number, not the mode string that selects its camera. A state whose only citation is an enum entry is not certified — it is a dispatch.',
        probe_type: 'manual',
        probe_logic:
            'For each state marked buildable, the skeleton names the taught element, the layer that draws it (unit vs site vs annotation), and the named engine function that moves it, with a line number. A cell that cannot be filled is a dispatch, not a build.',
        status: 'FIXED',
        concepts_affected: BOTH,
        fixed_in_files: ['docs/skeletons/ionic_bonding_skeleton.md'],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'rejected_claim_survives_unswept_surface',
        title: 'A claim a rigor document rejects is swept only from the surfaces that document names, surviving in the state title',
        severity: 'CRITICAL',
        owner_cluster: 'alex:json_author',
        root_cause:
            'chemistry_author rejected the claim "the whole network fails at once" as literally false — melting is a threshold phenomenon and the engine own melt law mobilises sites progressively. The correction was applied to the two surfaces the rigor block NAMED (narration + one annotation) and to nothing else. The claim survived in the STATE TITLE, which the review-site rail renders, plus two skeleton cells. THE EYE, eye_walker and check-layout-overlap are all structurally blind to the rail: no gate reads state titles.',
        prevention_rule:
            'When a rigor document rejects a CLAIM, enumerate EVERY reader-facing surface that can carry it — title, label, caption, delta cue, annotation, narration, misconception one_line_fix — and sweep them all, not only the surfaces the document happened to name. Re-run the sweep as a scripted regex over every reader-facing key and require a 0-hit result as evidence.',
        probe_type: 'js_eval',
        probe_logic:
            'Walk every string under a reader-facing key (title,label,caption,text,text_en,text_hi,belief,visual_counter,one_line_fix,delta_cue); regex each against the rejected-claim phrases recorded in the concept rigor block; FAIL on any hit outside /source_book.',
        status: 'FIXED',
        concepts_affected: IONIC,
        fixed_in_files: [JSON_, 'docs/skeletons/ionic_bonding_skeleton.md'],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'field3d_annotation_until_ms_at_duration_boundary_hides_on_resting_frame',
        title: 'Scene annotations authored with until_ms == duration vanish on the state natural resting frame',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        root_cause:
            'The annotation predicate tests onB = (ams < until_ms), strict-less-than against the state-local clock. When until_ms is authored exactly equal to the state duration — the value the end-of-timeline resting pose lands on — survival depends on sub-ms float/step-accumulation noise, not authored intent: three of four boundary states sampled hid ALL annotations at t=duration while one did not, for no authored reason. THE EYE frozen baseline pins at reveal-complete time, always earlier, so the boundary is never exercised and the gate passes regardless. On this concept the defect was systemic — 24 annotations across all nine guided states.',
        prevention_rule:
            'Never author until_ms == duration for a label meant to survive to the held frame the teacher pauses on. Author null (persist) or duration + a buffer. The class generalises: any authored boundary that coincides exactly with a clock terminus is decided by float noise, not by intent.',
        probe_type: 'js_eval',
        probe_logic:
            'For each guided state, capture the frame at t = duration and assert every annotation with until_ms >= duration is still visible; flag any state where visibility differs from the frame at duration - 50.',
        status: 'FIXED',
        concepts_affected: IONIC,
        fixed_in_files: [JSON_],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'explore_state_jiggle_authorisation_suppresses_the_idle_spin_fallback',
        title: 'Authoring jiggle_scale on an explore state stands the engine idle-spin fallback down, and the sandbox opens with turn speed 0',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        root_cause:
            'The explore idle-spin fallback fires only when no other motion signal is live. A state authoring thermal.jiggle_scale > 0 under the no-static-state discipline therefore disables the very spin that made the sandbox inviting, and THE EYE passes because jiggle does move pixels. The engine is correct as designed — a motion-of-last-resort guard — but the authored config silently switched it off.',
        prevention_rule:
            'An explore state that authors jiggle_scale MUST also author spin_rate (matching the spin any earlier state taught with), or accept jiggle-only motion as a deliberate, stated choice. Never leave the decision to a fallback the authored config has already switched off.',
        probe_type: 'js_eval',
        probe_logic:
            'For every state with advance_mode interaction_complete: if thermal.jiggle_scale > 0 and spin_rate is absent/0, flag. Cross-check the spin_rate of any earlier state that authored one.',
        status: 'FIXED',
        concepts_affected: IONIC,
        fixed_in_files: [JSON_],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'annotation_names_an_instrument_on_the_opposite_side_of_the_screen',
        title: 'A label instructing the teacher to watch a readout was placed 800 px from that readout',
        severity: 'MODERATE',
        owner_cluster: 'alex:json_author',
        root_cause:
            'An annotation reading "Watch the like-charge counter" was authored at x=160 while the counter it names is the right-anchored HUD at x 1049-1265. Screen-anchored annotation positions are chosen for SLOT AVAILABILITY, and no gate relates an annotation TEXT to the position of the element it names.',
        prevention_rule:
            'An annotation whose text names a specific on-screen element (a readout, a slider, a labelled group) is authored in the same screen half as that element. The engine HUD-reserve clamp will keep it from colliding; it will not move it to the right side of the screen.',
        probe_type: 'manual',
        probe_logic:
            'Read every annotation text; where it names a named on-canvas element or panel, measure that element rendered rect in the state frozen frame and assert the annotation centre falls in the same screen half.',
        status: 'FIXED',
        concepts_affected: IONIC,
        fixed_in_files: [JSON_],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'bonding_scene_scripted_destination_outside_its_own_slider_range',
        title: 'A scripted destination past its own slider max pins the thumb while the scene and the value span read the destination',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        root_cause:
            'slider_controls is read ONCE at concept level and the renderer writes the raw scripted value into the widget; the browser then clamps the thumb silently while the value span and the scene carry the unclamped number. ionic_bonding ramps to 1200 K and 1500 K and needs 3400 K in its sandbox, all against an engine default range of 100-600 K. No engine change can fix it, because the range is concept-level authoring.',
        prevention_rule:
            'A scripted destination that shares an id with an EXPOSED control must lie inside that control authored range. It is a hard authoring error, never a silent clamp; a state that does not expose the control is unconstrained. Author slider_controls default alongside min/max, or the panel default can open outside its own new floor.',
        probe_type: 'js_eval',
        probe_logic:
            'For every state, for each control exposed in controls or static_readouts, every scripted destination must lie within slider_controls[id].{min,max} (engine defaults when unauthored). Runs over every shipped concept using the scenario.',
        status: 'FIXED',
        concepts_affected: BOTH,
        fixed_in_files: [GATE, JSON_],
        subject: 'subject_neutral',
    },

    // ─────────────────────────────────────────────────────────────────────
    // STILL OPEN — recorded, deliberately not fixed this wave
    // ─────────────────────────────────────────────────────────────────────
    {
        bug_class: 'bonding_scene_lattice_glow_key_cannot_discriminate_co_present_groups',
        title: 'The lattice glow key lights every site in every group, so a two-sample contrast state has no discriminating focal',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause:
            'The lattice glow key resolves to the shared lattice element type, and group label meshes deliberately carry it too (a group IS its lattice). On a grouped state, a narration sentence about ONE sample brightens both. The two states built entirely as contrasts are the two where narration glow has zero discriminating power — 7 of 30 sentences affected on ionic_bonding.',
        prevention_rule:
            'A scenario that supports co-present groups needs a per-group focal resolution (group id via userData.group), or a narration sentence about one of two samples is unbindable by construction — the same shape as the trend-key and field-key gaps before it.',
        probe_type: 'js_eval',
        probe_logic:
            'On a state with groups[], send the glow for the lattice key with a group qualifier and assert emissive intensity rises only on sites whose userData.group matches; assert the other group is dimmed as a peer.',
        status: 'OPEN',
        concepts_affected: BOTH,
        fixed_in_files: [],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'free_placement_pair_axis_inverts_against_the_lattice_seed_pair_pose',
        title: 'A pair handed from a free-placement state to a lattice seed pair swaps sides and rotates, breaking home pose at the aha handoff',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause:
            'placement free honours separation_axis (cation left, anion right); the lattice_grow seed pair inherits its orientation from the rock-salt cell under its own camera row, which puts the anion upper-left. The two poses are solved independently and nothing relates them, so the cation/anion left-right convention held since S1 inverts on the one click where the narration says "here is the pair you just saw". The fit_ramp fix cut the SCALE discontinuity from 5.03x to 1.49x but interpolates distance only, not viewing angle.',
        prevention_rule:
            'When one state hands its apparatus to another, the receiving camera/seed is solved to PRESERVE the handing state screen-space arrangement, or the discontinuity is stated. Rule 32d applies hardest at a misconception pivot.',
        probe_type: 'js_eval',
        probe_logic:
            'For consecutive states sharing an apparatus, project the two leading sites in each and assert the sign of (siteA.ndc.x - siteB.ndc.x) is unchanged across the transition, and that camera azimuth/elevation at the later state t=0 is within tolerance of the earlier state last frame.',
        status: 'OPEN',
        concepts_affected: IONIC,
        fixed_in_files: [],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'field3d_bonding_fit_omits_the_field_arrow_row_it_draws',
        title: 'The camera fit frames the ions and not the field arrows drawn above them',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause:
            'The fit points are built from the site discs (and molecular units) only. The field arrow row is drawn geometry lifted clear on the off-axis and is in no fit point. It survives only on a conservative migration reserve which the containment fix made physically impossible: at the distance the ions alone ask for, the shafts reach |NDC| 1.013 and are cut by the border. Measured and left unfixed deliberately — tightening the reserve cascades into the HUD band and the label solver.',
        prevention_rule:
            'Every drawn layer of a scenario is either in its fit points or has a WRITTEN reason why not.',
        probe_type: 'js_eval',
        probe_logic:
            'Project the arrow row (reconstructed from the drawn discs, not from the shipped fit) at the shipped solved distance and at the distance the ions alone ask for; the first must be <= 0.95 and the second is the recorded defect.',
        status: 'OPEN',
        concepts_affected: BOTH,
        fixed_in_files: [],
        subject: 'subject_neutral',
    },
];

async function main(): Promise<void> {
    let ok = 0;
    for (const row of ROWS) {
        const { error } = await supabaseAdmin
            .from('engine_bug_queue')
            .upsert({ ...row, discovered_in_session: SESSION }, { onConflict: 'bug_class' });
        if (error) {
            // degrade gracefully if the `subject` column migration is not applied
            const { subject, ...noSubject } = row;
            const retry = await supabaseAdmin
                .from('engine_bug_queue')
                .upsert({ ...noSubject, discovered_in_session: SESSION }, { onConflict: 'bug_class' });
            if (retry.error) {
                console.error(`  ✗ ${row.bug_class}: ${retry.error.message}`);
                continue;
            }
        }
        ok++;
        console.log(`  ✓ ${row.status.padEnd(5)} ${row.severity.padEnd(8)} ${row.bug_class}`);
    }
    console.log(`\n${ok}/${ROWS.length} rows upserted into engine_bug_queue (session ${SESSION}).`);
    const open = ROWS.filter((r) => r.status === 'OPEN').length;
    console.log(`${ROWS.length - open} FIXED · ${open} OPEN (carried forward for metallic_bonding).`);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
