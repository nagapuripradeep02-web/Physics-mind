-- =====================================================================
-- SCAR CANDIDATES - quality_auditor audit of `uniform_circular_motion`
-- 2026-08-01 - worktree C:\Tutor\physics-mind-lom-g (feat/lom-g-offaxis)
--
-- SQL TEXT ONLY. NOT APPLIED. NO DB WRITE WAS PERFORMED BY THE AUDITOR.
-- Schema mirrors docs/loop_runs/lom_g/_engine/scar_candidates.sql
-- (13 authored columns of the 16-col engine_bug_queue).
-- bug_class is the upsert key - check for an existing row before applying;
-- a recurrence is an UPDATE, not a duplicate INSERT.
--
-- OWNER-TAG NOTE: candidates A and B use `peter_parker:field3d_surgeon`.
-- The three OPEN rows already in the queue for this concept are tagged
-- `peter_parker:renderer_primitives`, which maps to pcpl-surgeon (the 2D
-- parametric renderer) and would REJECT field_3d scope. Retag statements
-- are supplied as candidate E.
-- =====================================================================


-- ---------------------------------------------------------------------
-- Candidate A - MAJOR, probe_definition. THE HIGHEST-VALUE ROW IN THIS FILE.
-- THE EYE returned 31/31 pass, exit 0, zero manifest warnings on a concept
-- whose STATE_6 is a byte-identical frozen frame for 12 of its 20 seconds.
-- D5 (the motion gate) is dark fleet-wide on field_3d because visual_eyes.ts:68
-- derives its motion map from cached.physics_config, which holds only
-- epic_l_path - so nothing in the deterministic suite can see a dead state.
-- The dense frames ALREADY CAPTURED contain the whole answer: hash them.
-- This is the cheap, zero-cost, engine-independent stand-in for D5 until the
-- founder platform call lands, and it directly addresses the prior session
-- scar in which an identical 31/31 certified SEVEN dead states.
-- ---------------------------------------------------------------------
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'eye_dense_frames_are_never_hashed_so_a_frozen_state_passes_31_of_31',
    'THE EYE captures every dense frame and hashes none of them, so a state that stops moving is indistinguishable from one that never stopped',
    'MAJOR',
    'peter_parker:field3d_surgeon',
    'visual_eyes.ts derives its motion expectations (D5) from cached.physics_config, which for a field_3d concept holds only epic_l_path and never field_3d_config - so D5 has no motion map, never fires, and the suite reports a clean 31/31 with the motion question entirely unasked. Every other gate is a per-frame assertion (bounds, overlap, cue presence) and is satisfied identically by a moving frame and a frozen one. The dense PNGs that would answer the question are already written to disk on every run; nothing ever compares two of them.',
    'A per-state motion assertion must be derived from the PIXELS ALREADY CAPTURED, never from a config the cache does not carry. After the dense sweep, hash every STATE_N__dense_t*.png and report per state: (a) the count of distinct hashes, (b) the timestamp of the LAST frame-to-frame change, (c) that timestamp as a fraction of the authored duration. Fail or warn when a guided state has fewer than 3 distinct frames, or when motion stops before roughly 70 percent of the authored duration while narration continues past it. This is renderer-agnostic, costs one hash per already-written file, and cannot be defeated by a missing config the way D5 was.',
    'js_eval',
    'per guided state: h = denseFrames.map(md5); assert new Set(h).size >= 3; lastChange = max t where h[i] != h[i-1]; assert lastChange >= 0.70 * duration_ms OR narration_ms <= lastChange.',
    'OPEN',
    ARRAY['uniform_circular_motion', 'equilibrium_of_particles']::text[],
    ARRAY['src/scripts/visual_eyes.ts', 'src/lib/validators/visual/deriveStateMeta.ts']::text[],
    'lom-g quality_auditor audit of uniform_circular_motion 2026-08-01',
    'probe_definition'
);


-- ---------------------------------------------------------------------
-- Candidate B - MODERATE, incident. Engine-owned, content-visible.
-- Authoring a `release` on a whirl state widens THAT STATE ground plane from
-- L x 1.30 to L x 2.80 (FR_W_PLANE_R_CUT). The widening is correct and
-- necessary (the post-cut flight needs the room), but it is applied PER
-- STATE, so the plane visibly grows about 2.2x at the moment the student
-- clicks into the concept PRIMARY AHA state, with no narration and no
-- pedagogical meaning. Rule 32d: at every click the only visible change
-- should BE the new thing. Verified in frames: STATE_2__frozen.png plane
-- spans x 335..945 fully in frame; STATE_3__dense_t00000.png plane overflows
-- both frame edges. Anchor, string, bob and orbit circle are unchanged, so
-- the defect is cosmetic continuity, not pedagogical - hence MODERATE.
-- ---------------------------------------------------------------------
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'field3d_release_widens_ground_plane_per_state_causing_unnarrated_apparatus_jump',
    'A whirl state that authors a release gets a 2.2x wider ground plane than its neighbours, so the apparatus visibly jumps size at state entry',
    'MODERATE',
    'peter_parker:field3d_surgeon',
    'FR_W_PLANE_R_FACTOR (1.30) and FR_W_PLANE_R_CUT (2.80) are selected per state from whether that state authored a release. The wider plane is required for the flight to stay in frame, but because the choice is per-state rather than per-concept, a concept whose release lives in one state renders two different apparatus scales across otherwise-identical flat states. The author cannot avoid this: the plane radius is not an authorable key.',
    'A scenario dimension that exists to accommodate the LARGEST excursion any state can produce must be computed once per CONCEPT (max over all states) and applied to every state sharing the apparatus, not selected per state. Same family as the OPEN row field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable: reference surfaces are sized from the largest excursion, and sized ONCE so the apparatus does not resize between states.',
    'manual',
    'Render every state of a concept that authors a release on any state and confirm the ground or reference surface subtends the same on-screen extent in all states sharing that apparatus geometry.',
    'OPEN',
    ARRAY['uniform_circular_motion']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'lom-g quality_auditor audit of uniform_circular_motion 2026-08-01',
    'incident'
);


-- ---------------------------------------------------------------------
-- Candidate C - MODERATE, incident. RECURRENCE of the capacitance proof-run
-- class (Rule 38b): the explore state formula surface asserts a relation no
-- state in the concept derives. STATE_7 shows T = m omega^2 L while its own
-- HUD reads r = 0.790 m against a slider reading L = 1.00 m, and STATE_2
-- (the only other T-form in the concept) shows T = m omega^2 r. Both are
-- correct physics; nothing on screen or in any narration reconciles them.
-- Under the core_only preset (S1,S2,S3,S7) the reconciling states are hidden
-- entirely. If a row for the capacitance instance already exists, UPDATE it
-- and append uniform_circular_motion to concepts_affected instead.
-- ---------------------------------------------------------------------
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'explore_state_formula_surface_asserts_a_relation_no_state_derives',
    'The explore state carries a formula surface whose form contradicts the guided states formula surface, with no state reconciling the two',
    'MODERATE',
    'alex:architect',
    'The explore state is designed last and inherits the most general true formula for its apparatus rather than the formula the LESSON established. Rule 38b tends to be checked as are the SYMBOLS core-established, which passes because T, m, omega and L all appear earlier, while the actual failure is that the RELATION is new. The auditor-visible tell is an on-canvas contradiction: the explore HUD exposes r and the slider exposes L with r not equal to L, directly beside a formula that uses L where the guided states used r.',
    'A formula surface on the explore state must be derived by a surviving state under EVERY authored preset, not merely built from previously-seen symbols. Check the relation, not the alphabet. For each preset, list the surviving states and confirm one of them states or shows the explore formula. If none does, either drop the explore formula_overlay entirely (a value-only sandbox is Rule-34-clean and is already precedented by formula-free guided states) or add one clause to the last guided state that derives it. Never leave two different closed forms for the same quantity on screen in one concept with nothing reconciling them.',
    'manual',
    'For each preset in the concept Rule-38 cut list, list the surviving states, then assert the explore state formula_overlay relation is stated or derived by at least one of them. Additionally assert the explore formula is consistent with every quantity its own readouts expose: a formula in L beside a live r not equal to L readout is a contradiction on screen.',
    'OPEN',
    ARRAY['uniform_circular_motion', 'capacitance']::text[],
    ARRAY[]::text[],
    'lom-g quality_auditor audit of uniform_circular_motion 2026-08-01',
    'incident'
);


-- ---------------------------------------------------------------------
-- Candidate D - MINOR, incident. Narration references an object that is not
-- on screen and belongs to a different concept apparatus.
-- STATE_1 sentence s1_2 ends: "...unlike the balanced ring's zero sum."
-- The ring is the force_table fixture of the sibling concept
-- equilibrium_of_particles; no ring exists anywhere in this concept, and
-- prerequisites are advisory (Rule 23), so a student may reach STATE_1 having
-- never seen it. "zero sum" also reads as the everyday idiom rather than the
-- physics (the forces sum to zero) - Rule 41a. The architect skeleton phrased
-- the same patch with an explicit "last time ..." time-marker, which is the
-- form that works; the compression to one clause dropped it.
-- ---------------------------------------------------------------------
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'narration_references_a_prerequisite_concepts_apparatus_that_is_not_on_screen',
    'A prerequisite-bridging sentence names a fixture from the sibling concept (the balanced ring) that appears nowhere in this concept picture',
    'MINOR',
    'alex:physics_author',
    'Chapter-coherence bridging sentences are written while both concepts are in the author head, so a reference to the previous sim apparatus reads as obvious. On screen it is a bare noun with no referent: the student sees a ball on a string and hears about a ring. Prerequisites are advisory (Rule 23), so the bridge cannot assume the prior lesson was taken.',
    'A bridging sentence may reference a prior concept IDEA but never its APPARATUS by name unless that apparatus is visible. Either name the idea (when the forces balanced, their sum was zero) or keep an explicit time-marker that flags it as recall (last time ...). Additionally avoid the phrase zero sum, which collides with the everyday idiom; write the forces summed to zero (Rule 41a).',
    'manual',
    'Grep every text_en sentence for nouns naming a physical object, then confirm each such object is rendered somewhere in that state frames.',
    'OPEN',
    ARRAY['uniform_circular_motion']::text[],
    ARRAY[]::text[],
    'lom-g quality_auditor audit of uniform_circular_motion 2026-08-01',
    'incident'
);


-- ---------------------------------------------------------------------
-- Candidate E - OWNER-TAG CORRECTION (no new rows).
-- Two OPEN rows naming this concept have a field_3d_renderer.ts root cause but
-- are tagged peter_parker:renderer_primitives, which maps to pcpl-surgeon
-- (parametric_renderer.ts / PCPL primitives / particle_field) and would reject
-- the scope. Dispatching them as tagged wastes a cycle. The third OPEN row
-- (harness CRLF comment strip) is a tooling defect, not a renderer defect -
-- its correct owner is ambiguous and is left for the founder to decide.
-- ---------------------------------------------------------------------
UPDATE engine_bug_queue
   SET owner_cluster = 'peter_parker:field3d_surgeon'
 WHERE bug_class = 'field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable'
   AND owner_cluster = 'peter_parker:renderer_primitives';

UPDATE engine_bug_queue
   SET owner_cluster = 'peter_parker:field3d_surgeon'
 WHERE bug_class = 'explicit_linear_drag_is_unstable_at_the_damping_a_legible_settle_requires'
   AND owner_cluster = 'peter_parker:renderer_primitives';

-- END OF FILE - nothing above was executed by the auditor.
