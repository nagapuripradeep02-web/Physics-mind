-- Scar candidates — sigma_pi_bonding / the kind:"mo" molecular-orbital surface, 2026-07-29
--
-- ═══════════════════════════════════════════════════════════════════════════
-- STATUS: **NOT APPLIED.** Files-only, per the standing convention
-- (scar_candidates_law_of_conservation_of_mass.sql, 2026-07-27):
-- "engine_bug_queue writes are a founder decision".
-- Live table at time of writing: 412 rows, 28 chemistry, 0 for sigma_pi_bonding.
-- Apply with an idempotent seed script (skip any bug_class already present),
-- mirroring src/scripts/_seed_engine_bug_queue_vsepr_3d_surface.ts.
--
-- SCHEMA VERIFIED LIVE before writing (dxwpkjfypzxrzgbevfnx), so this text is
-- executable as-is rather than needing the deviations the vsepr file carried:
--   NOT NULL: bug_class, title, severity, owner_cluster, root_cause,
--             prevention_rule, probe_type, probe_logic, status,
--             concepts_affected, fixed_in_files, row_type, subject
--   severity     CHECK: CRITICAL | MAJOR | MODERATE          (no LOW)
--   probe_type   CHECK: sql | js_eval | manual | vision_model
--   row_type     CHECK: incident | probe_definition | directive
--   subject      CHECK: physics | chemistry | subject_neutral
--   owner_cluster CHECK includes alex:chemistry_author,
--             peter_parker:visual_validator and peter_parker:field3d_surgeon.
--
-- CORRECTION TO THE THIRD-PASS AUDIT (its note N8): it reported that
-- `alex:chemistry_author` "is still rejected by the engine_bug_queue DB CHECK
-- constraint". That is FALSE as of this query — the value is in the constraint.
-- Nothing here is blocked from being filed against its real owner.
--
-- CONTEXT. sigma_pi_bonding (P4 #17) took THREE audit rounds: 7 blocking
-- defects -> 2 -> PASS-WITH-NOTES, with archetype delivery going 4/9 -> 8/8.
-- THE EYE reported 39 deterministic checks, 39 passed, 0 failed on EVERY ONE of
-- four captures, including the capture containing all 7 blocking defects. That
-- is the fourth consecutive concept where the deterministic suite was green on
-- frames containing critical errors. Two of the 7 were recurrences of classes
-- already marked FIXED — hence rows 1 and 2 are UPDATEs, not INSERTs.
-- ═══════════════════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────────────────
-- 1. RECURRENCE — reopen and ESCALATE. Do NOT insert a duplicate.
--    Recorded on populate_steps (atomic_orbitals_s_p_d) with the hardening
--    noted as "available and not yet done". It then recurred on a DIFFERENT
--    KEY and the consequence was far worse than the original.
-- ───────────────────────────────────────────────────────────────────────────
UPDATE engine_bug_queue SET
  severity = 'CRITICAL',
  concepts_affected = array_cat(concepts_affected, ARRAY['sigma_pi_bonding']),
  fixed_in_files = array_cat(fixed_in_files, ARRAY['src/lib/renderers/field_3d_renderer.ts']),
  prevention_rule = prevention_rule || E'\n\nRECURRENCE 2026-07-29 (sigma_pi_bonding, ONE KEY UP, escalated MODERATE -> CRITICAL). '
    'An mo state names its orbital under mo.orbital / mo.orbitals, so os.orbital was absent and the '
    'fallback `os.orbital || "1s"` resolved to the 1s ATOM on all NINE states. Two consequences, both '
    'rendered: a large "1s" name sprite over every molecular orbital, and a 1200-dot hydrogen-1s '
    'probability swarm drawn THROUGH the sigma and pi bonds. The dot path already refused to invent a '
    'swarm for an MO (its own comment: "an MO simply has no swarm") — the fallback defeated that intent '
    'by handing it a real atom. It also caused a Rule-34d collision: the scene-anchored "1s" sprite '
    'orbited into s3_law_label. A VALID default is more dangerous than one that throws. '
    'PREVENTION (now built, osMoDeclared): a per-state identity fallback MUST be suppressed whenever the '
    'state DECLARES an object of another family, and declared-but-unbuildable counts as declared — a '
    'mis-authored id blanks the stage rather than repainting it with another object''s identity.',
  probe_logic = probe_logic || E'\n\nPROBE 2026-07-29: for every state, assert the resolved active-identity '
    'list is EMPTY when os.mo names anything; and assert no glyph matching /^[1-9][spdf]$/ appears on '
    'canvas in any frame of an MO concept.',
  updated_at = now()
WHERE bug_class = 'field3d_populate_baseid_fallback_paints_another_orbitals_identity';


-- ───────────────────────────────────────────────────────────────────────────
-- 2. RECURRENCE — reopen. Do NOT insert a duplicate.
--    The dE matrix that exists to prevent exactly this did not COVER the pair.
-- ───────────────────────────────────────────────────────────────────────────
UPDATE engine_bug_queue SET
  concepts_affected = array_cat(concepts_affected, ARRAY['sigma_pi_bonding']),
  fixed_in_files = array_cat(fixed_in_files, ARRAY['src/lib/renderers/field_3d_renderer.ts']),
  prevention_rule = prevention_rule || E'\n\nRECURRENCE 2026-07-29 (sigma_pi_bonding STATE_8). '
    '`pi_systems: 2` correctly BUILT the second system (rotated 90 deg about the bond axis) and then drew '
    'it in the FIRST system''s hue at opacity/moSys — half strength each. Two half-strength same-coloured '
    'shells is the least countable arrangement available; they fused into one teal rosette under a caption '
    'reading "Triple: one sigma, two pi". The CIELAB dE matrix that exists to prevent this did not cover '
    'the pair, because both systems drew from ONE colour field, so the matrix compared TYPES and not '
    'INSTANCES. PREVENTION: when one config key multiplies an object into N instances that a caption asks '
    'a viewer to COUNT, each instance takes its own hue and the dE matrix is extended to instance pairs, '
    'not just type pairs; and per-instance opacity DIVISION is forbidden — it works directly against '
    'countability.',
  probe_logic = probe_logic || E'\n\nPROBE 2026-07-29: count independently outlined regions per hue in the '
    'frozen frame, classified by Lab HUE ANGLE (never absolute a*/b* — see the companion instrument row), '
    'and compare with the count the caption implies.',
  updated_at = now()
WHERE bug_class = 'field3d_uniform_translucent_same_family_surfaces_fuse_with_no_silhouette_cue';


-- ───────────────────────────────────────────────────────────────────────────
-- 3. NEW — CRITICAL. Two instruments for one quantity, disagreeing in one frame.
-- ───────────────────────────────────────────────────────────────────────────
INSERT INTO engine_bug_queue
  (bug_class, title, severity, owner_cluster, subject, row_type, status,
   concepts_affected, fixed_in_files, probe_type, probe_logic, root_cause, prevention_rule,
   discovered_in_session, state_id)
VALUES (
  'field3d_slider_readout_resolves_first_object_not_the_one_the_state_drives',
  'A shared slider readout named the wrong bond, contradicting the HUD in the same frame',
  'CRITICAL', 'peter_parker:renderer_primitives', 'chemistry', 'incident', 'FIXED',
  ARRAY['sigma_pi_bonding'], ARRAY['src/lib/renderers/field_3d_renderer.ts'],
  'js_eval',
  'For each state and each of 0/18/45/64/90 deg of the twist, assert the slider inline value EQUALS the '
  'HUD value for the SAME species, and that the species is named on both surfaces whenever more than one '
  'object is on stage.',
  'osMoSliderReadout was called with moPrim = moList[0]. STATE_6 authors mo.orbitals '
  '["sigma_sp2","pi_2p"] with overlap_of "pi_2p"; the surfaces and the HUD honoured overlap_of, the '
  'slider did not — so it resolved sigma, which is INVARIANT under the twist.',
  'ONE FRAME printed "S/S0 = 1.000" on the slider beside "pi S/S0 = 0.000" in the HUD, for a quantity with '
  'the same rendered name, on the PRIMARY-AHA state the whole concept exists for. A teacher reading the '
  'slider learns the exact opposite of the lesson. Neither a DOM probe nor THE EYE can see it: both '
  'strings are present, well-formed, non-colliding and stable. PREVENTION: a readout resolves its subject '
  'from the state''s OWN selector (overlap_of / atomic_of / the physical responder), never from list[0], '
  'and NAMES the species whenever more than one is on stage. Corollary: two instruments rendering the same '
  'named quantity must be driven from one resolved subject, or they will eventually disagree.',
  'chemistry-p4-sigma-pi-2026-07-29', 'STATE_6'
);


-- ───────────────────────────────────────────────────────────────────────────
-- 4. NEW — CRITICAL. "Watch X hold still" requires X to be findable.
-- ───────────────────────────────────────────────────────────────────────────
INSERT INTO engine_bug_queue
  (bug_class, title, severity, owner_cluster, subject, row_type, status,
   concepts_affected, fixed_in_files, probe_type, probe_logic, root_cause, prevention_rule,
   discovered_in_session, state_id)
VALUES (
  'field3d_invariant_object_on_a_multi_object_stage_has_no_silhouette_to_track',
  'The invariant object was the faintest thing on stage, so the primary aha did not land as a picture',
  'CRITICAL', 'peter_parker:renderer_primitives', 'subject_neutral', 'incident', 'FIXED',
  ARRAY['sigma_pi_bonding'], ARRAY['src/lib/renderers/field_3d_renderer.ts'],
  'js_eval',
  'Name ONE pixel region and show it is trackable across the whole beat WITHOUT the HUD: hue-class pixel '
  'count roughly constant and centroid near-stationary, while the changing element visibly moves or '
  'collapses. Reference measurement: sigma held 11955 -> 15655 px with 2 px of centroid drift while its '
  'neighbour collapsed 85%.',
  'On a stage of 5+ translucent surfaces at one authored alpha, the element that does NOT change is the '
  'least visible thing present — nothing distinguished it, and no glow_focal was authored, so '
  'applyOrbitalShapesGlow never fired.',
  'When a caption says "watch X hold still while Y changes", X must be a LOCATABLE object or the state '
  'teaches nothing a viewer can verify. PREVENTION: on a multi-object stage the element that is NOT the '
  'subject of the change is inked (brightness only, Rule 29 — never resized, never recoloured) and '
  'composited last; the changing element carries the focal by MOVING. Verify in pixels, not in the JSON: a '
  'declared focal that no code path consumes is indistinguishable from no focal at all.',
  'chemistry-p4-sigma-pi-2026-07-29', 'STATE_6'
);


-- ───────────────────────────────────────────────────────────────────────────
-- 5. NEW — MAJOR. An authored field that no-ops produces a state that LIES.
-- ───────────────────────────────────────────────────────────────────────────
INSERT INTO engine_bug_queue
  (bug_class, title, severity, owner_cluster, subject, row_type, status,
   concepts_affected, fixed_in_files, probe_type, probe_logic, root_cause, prevention_rule,
   discovered_in_session)
VALUES (
  'field3d_authored_mode_string_is_inert_decoration_and_states_render_static',
  'Nine authored motion-archetype mode strings were decoration; three states were byte-static',
  'MAJOR', 'ambiguous', 'subject_neutral', 'incident', 'FIXED',
  ARRAY['sigma_pi_bonding'], ARRAY['src/lib/renderers/field_3d_renderer.ts'],
  'js_eval',
  'Per state, diff consecutive dense frames across the declared motion window and assert a non-zero '
  'changed-pixel signature. Then assert every authored key that names a motion is READ by the frame path '
  '(grep the emitted renderer for each key; an authored key with no consumer is a defect, not a style).',
  'orbital_shapes.mode is read in exactly two places: an OS_CAMERAS lookup (which this concept overrode '
  'with an explicit per-state camera) and a local variable never used again. The nine distinct mode '
  'strings therefore did nothing, and STATE_4/7/8 authored no other motion field — they changed ZERO '
  'pixels from t=4000 to t=16000 while their captions described motion. Only 4 of 9 declared archetypes '
  'were delivered.',
  'An authored field that silently no-ops is worse than a missing feature: it produces a state that '
  'passes every gate while its caption describes something that never happens. Same family as '
  'field3d_growth_beat_gated_on_a_renderer_specific_field_silently_noops and the duplicate-JSON-key scar. '
  'PREVENTION: do NOT give an existing string a second meaning (mode stayed the camera key); add explicit '
  'timing fields instead, and treat "an archetype is a claim about RHYTHM, not a label" as testable — '
  'verify by diffing dense frames of two states at matching t, never by reading the archetype names.',
  'chemistry-p4-sigma-pi-2026-07-29'
);


-- ───────────────────────────────────────────────────────────────────────────
-- 6. NEW — MAJOR. A missing primitive silently became a state that renders
--    the RIGHT answer twice, so a declared contrast pair had no contrast.
-- ───────────────────────────────────────────────────────────────────────────
INSERT INTO engine_bug_queue
  (bug_class, title, severity, owner_cluster, subject, row_type, status,
   concepts_affected, fixed_in_files, probe_type, probe_logic, root_cause, prevention_rule,
   discovered_in_session, state_id)
VALUES (
  'field3d_rule16a_belief_unbuildable_for_want_of_a_rod_primitive',
  'The misconception state was byte-identical to the state refuting it',
  'MAJOR', 'alex:architect', 'chemistry', 'incident', 'FIXED',
  ARRAY['sigma_pi_bonding'], ARRAY['src/lib/renderers/field_3d_renderer.ts',
                                   'src/data/concepts/chemistry/sigma_pi_bonding.json'],
  'js_eval',
  'Wherever a contrast pair is DECLARED, assert state N''s opening frame differs from state N+1''s by more '
  'than a caption''s worth of pixels. Reference failure: 0.00% differing pixels.',
  'Rule 16a requires the wrong belief to be SHOWN, and the belief for a whole family of chemistry concepts '
  'is "a bond is a line". orbital_shapes had no rod/cylinder primitive, so STATE_1 could not draw two '
  'identical lines and was improvised from what existed: it drew the REAL sigma bond''s own lobes, ran '
  'STATE_2''s approach at 3x speed, and dissolved. Its label "Two identical bonds?" fired at the exact '
  'moment the lobes had merged into ONE.',
  'A missing primitive does not fail loudly — it becomes a state that renders the right answer twice and '
  'passes every gate. PREVENTION: an architect skeleton that declares a misconception picture must NAME '
  'the primitive that draws it, and a missing primitive is an engine dispatch AT DESIGN TIME, never an '
  'improvisation at authoring time. Built: orbital_shapes.bond_sticks (N parallel rods between the nuclei, '
  'count/spacing authorable, own fade-in and dissolve cues so the wrong picture leads alone and clears). '
  'Deliberately NOT gated behind config.mo so Lewis/VSEPR/mechanism concepts can reuse it.',
  'chemistry-p4-sigma-pi-2026-07-29', 'STATE_1'
);


-- ───────────────────────────────────────────────────────────────────────────
-- 7. NEW — MAJOR. The baselines about to be LOCKED did not contain the
--    content they exist to protect. Filed against the validator, not the sim.
-- ───────────────────────────────────────────────────────────────────────────
INSERT INTO engine_bug_queue
  (bug_class, title, severity, owner_cluster, subject, row_type, status,
   concepts_affected, fixed_in_files, probe_type, probe_logic, root_cause, prevention_rule,
   discovered_in_session)
VALUES (
  'visual_frozen_pin_blind_to_scene_composition_at_ms_locks_a_baseline_without_its_labels',
  'Eight on-canvas labels were absent from the frames about to be approved, including both labels of the CRITICAL fix made minutes earlier',
  'MAJOR', 'peter_parker:visual_validator', 'subject_neutral', 'incident', 'OPEN',
  ARRAY['sigma_pi_bonding'], ARRAY['src/data/concepts/chemistry/sigma_pi_bonding.json'],
  'js_eval',
  'Before visual:approve, for every state assert that each scene_composition annotation whose at_ms is '
  'less than the state duration is PRESENT in that state''s frozen frame; report every label the baseline '
  'cannot see.',
  'THE EYE pins each frozen frame at deriveMaxRevealTimeMs, which reads scenario reveal fields and is '
  'blind to scene_composition at_ms. STATE_3 pinned at 1500 ms and its baseline missed "Same overlap, any '
  'angle" — the state''s entire lesson. STATE_8 pinned at 10900 ms and missed BOTH labels of the honesty '
  'ordering fix landed in the same session, which had no coverage in check:sigma-pi either.',
  'A baseline photographed before the concept happens cannot catch a regression in the concept — '
  'visual_eyes.ts:95 says exactly this, and eye_capture_ms is the authored opt-in built for it. The defect '
  'is that nothing WARNS when a state needs it: this concept authored zero and the omission was silent '
  'right up to the approve step. MITIGATED HERE by authoring eye_capture_ms on 5 states (S1 11600, S3 '
  '10000, S4 10200, S7 14500, S8 12600). STILL OPEN as a platform ask: visual_eyes should report, per '
  'state, any annotation the frozen pin cannot see. Related and unfixed: a state whose reveal ENDS IN A '
  'DISSOLVE (bond_sticks) cannot have both its lead and its cleared stage in one frozen frame — that needs '
  'a second capture, and STATE_1''s rods are currently protected only by check:sigma-pi section 11.',
  'chemistry-p4-sigma-pi-2026-07-29'
);


-- ───────────────────────────────────────────────────────────────────────────
-- 8. NEW — MAJOR. A platform gate that only ran if one chapter's content
--    happened to be checked out. Rule 40 violated inside the Rule-40 gate.
-- ───────────────────────────────────────────────────────────────────────────
INSERT INTO engine_bug_queue
  (bug_class, title, severity, owner_cluster, subject, row_type, status,
   concepts_affected, fixed_in_files, probe_type, probe_logic, root_cause, prevention_rule,
   discovered_in_session)
VALUES (
  'check_script_reads_chapter_content_and_dies_on_master',
  'The engine gate crashed with ENOENT on master the moment the engine landed there',
  'MAJOR', 'peter_parker:renderer_primitives', 'subject_neutral', 'incident', 'FIXED',
  ARRAY['sigma_pi_bonding'], ARRAY['src/scripts/check_sigma_pi.ts'],
  'manual',
  'Run every check:* script on a checkout that does NOT contain the chapter content it was written '
  'alongside. A platform gate must pass, skip explicitly, or fail with a diagnosis — never ENOENT.',
  'check_sigma_pi.ts sections 0-6 assert the ENGINE and need only the renderer; sections 7-12 assert the '
  'authored CONCEPT and read sigma_pi_bonding.json unguarded. Rule 40 lands the engine on master and keeps '
  'the concept on its branch, so the gate died the moment its own subject arrived on master.',
  'A gate that only runs when one specific chapter is checked out is the Rule-40 failure mode expressed '
  'INSIDE the gate meant to enforce it, and CI on master would have failed on it. PREVENTION: a check '
  'script split across engine and content must guard the content read and SKIP the content half with an '
  'explicit note naming where to run it, so the engine half keeps reporting on master. Found only by '
  'running the gate on master after the cherry-pick rather than assuming a clean cherry-pick meant a '
  'working tree.',
  'chemistry-p4-sigma-pi-2026-07-29'
);


-- ───────────────────────────────────────────────────────────────────────────
-- 9. NEW — MAJOR. The scar list's own query tool gives a FALSE all-clear on
--    chemistry. This one silently weakens Gate 8 on every future concept.
-- ───────────────────────────────────────────────────────────────────────────
INSERT INTO engine_bug_queue
  (bug_class, title, severity, owner_cluster, subject, row_type, status,
   concepts_affected, fixed_in_files, probe_type, probe_logic, root_cause, prevention_rule,
   discovered_in_session)
VALUES (
  'query_engine_bug_queue_field3d_list_hardcoded_physics_returns_false_all_clear',
  'Gate 8''s query tool reported "no matching rows" for a chemistry concept because its concept list is hardcoded physics',
  'MAJOR', 'peter_parker:runtime_generation', 'subject_neutral', 'incident', 'OPEN',
  ARRAY['sigma_pi_bonding','vsepr_molecular_shapes','atomic_orbitals_s_p_d','hybridisation_sp_sp2_sp3'],
  ARRAY[]::text[],
  'sql',
  'Assert the tool''s concept list is DERIVED from src/data/concepts/** (both physics and chemistry '
  'namespaces) rather than hardcoded, and that querying a known-affected chemistry concept returns its '
  'rows.',
  'query_engine_bug_queue.ts carries a hardcoded FIELD3D array of physics concepts containing no '
  'chemistry ids, so --field3d returns "No matching engine_bug_queue rows." for every chemistry concept. '
  'Both readers in this session received that false all-clear; the audit only found the two on-point '
  'recurrences because it re-queried all 47 OPEN/DEFERRED rows by hand.',
  'A regression-check tool that silently reports clean is worse than no tool: Gate 8 is the step that '
  'exists to stop recurrences, and TWO of this concept''s seven blocking defects WERE recurrences. Until '
  'this is fixed, Gate 8 on any chemistry concept must be performed by direct query, not through the '
  'helper. PREVENTION: derive the list, never hardcode it; and a query returning zero rows for a concept '
  'with known history should be treated as a tooling failure until proven otherwise.',
  'chemistry-p4-sigma-pi-2026-07-29'
);


-- ───────────────────────────────────────────────────────────────────────────
-- 10. NEW — MODERATE. A defect in the MEASURING INSTRUMENT, recorded because
--     it nearly produced a wrong verdict on one of the fixes above.
-- ───────────────────────────────────────────────────────────────────────────
INSERT INTO engine_bug_queue
  (bug_class, title, severity, owner_cluster, subject, row_type, status,
   concepts_affected, fixed_in_files, probe_type, probe_logic, root_cause, prevention_rule,
   discovered_in_session)
VALUES (
  'lab_distance_pixel_probe_undercounts_the_dimmer_of_two_translucent_hues',
  'The pixel probe read a plainly visible surface at 492 px and nearly justified a fix for a defect that did not exist',
  'MODERATE', 'peter_parker:visual_validator', 'subject_neutral', 'incident', 'FIXED',
  ARRAY['sigma_pi_bonding'], ARRAY[]::text[],
  'js_eval',
  'Any pixel probe over translucent 3D surfaces classifies by Lab HUE ANGLE with a minimum-chroma floor, '
  'never by absolute a*/b* distance; and the palette compared against is the STATE''s own drawables only.',
  'A translucent shell at alpha ~0.22 over a dark scene composites to a DARK, LOW-CHROMA version of its '
  'colour: the hue ANGLE survives but the (a*,b*) vector is scaled toward the origin. A classifier using '
  'absolute Lab distance therefore accepts whichever hue starts nearer the origin and rejects the other — '
  'it counted a teal surface at 8423 px and the equally large orange one beside it at 492 px.',
  'Recorded because it ALMOST produced a correction for a non-existent occlusion defect: sigma appeared to '
  'survive a multi-object frame at 157 classified pixels, which looked exactly like the predicted failure. '
  'Re-measured on chromaticity, both surfaces were comfortably countable with no correction at all. '
  'PREVENTION: before trusting a measurement that motivates a fix, run the negative control — and treat a '
  'probe that disagrees with what the frame plainly shows as a broken probe, not a discovered defect. '
  'Also: the amber delta-cue caption steals an orange surface''s pixels if the palette is not restricted.',
  'chemistry-p4-sigma-pi-2026-07-29'
);


-- ───────────────────────────────────────────────────────────────────────────
-- 11. NEW — MODERATE. A validator fallback that HID a real defect for a
--     whole authoring round.
-- ───────────────────────────────────────────────────────────────────────────
INSERT INTO engine_bug_queue
  (bug_class, title, severity, owner_cluster, subject, row_type, status,
   concepts_affected, fixed_in_files, probe_type, probe_logic, root_cause, prevention_rule,
   discovered_in_session)
VALUES (
  'derive_state_meta_fallback_masks_a_real_pacing_defect_as_validator_noise',
  'A ~1500 ms settle-time fallback made seven genuinely mis-paced states look like spurious warnings',
  'MODERATE', 'peter_parker:visual_validator', 'subject_neutral', 'incident', 'FIXED',
  ARRAY['sigma_pi_bonding'], ARRAY['src/lib/validators/visual/deriveStateMeta.ts'],
  'sql',
  'When deriveStateMeta gains no knowledge of a newly added motion field, its Rule-31a ratio for states '
  'using that field is not evidence. Assert every authored motion/staging key is read by '
  'deriveMaxRevealTimeMs, and treat a fleet where ONE concept produces ALL warnings as a signal about '
  'that concept, not about the validator.',
  'The engine gained staging fields (reveal_offsets_ms, system_offsets_ms, atomic_* and bond_sticks) and '
  'deriveStateMeta was not taught them the same day, so it fell back to ~1500 ms. That made the Rule-31a '
  'ratios read 0.08-0.29 and invited the conclusion "spurious warning, the derivation cannot see the '
  'motion" — which was true for three states and FALSE for the rest.',
  'Two distinct harms from one fallback. (1) THE EYE''s frozen pin would have photographed S4/S7/S8 BEFORE '
  'their staged motion settled, locking half-built scenes as approved baselines. (2) Once the derivation '
  'was honest, 7 of 9 states still warned — and every narration-ratio warning in the entire chemistry '
  'fleet was this one concept, the other seven emitting zero. The picture genuinely completed in 4-6 s '
  'against 15-19 s of narration. PREVENTION: a fallback must be loud. A derivation that cannot see a field '
  'should report "unknown" rather than substitute a plausible number, because a plausible number gets '
  'believed and then explains away real defects.',
  'chemistry-p4-sigma-pi-2026-07-29'
);


-- ───────────────────────────────────────────────────────────────────────────
-- 12. NEW — MODERATE. An authored key at the wrong nesting level.
--     My own edit, caught only by reading the file back.
-- ───────────────────────────────────────────────────────────────────────────
INSERT INTO engine_bug_queue
  (bug_class, title, severity, owner_cluster, subject, row_type, status,
   concepts_affected, fixed_in_files, probe_type, probe_logic, root_cause, prevention_rule,
   discovered_in_session)
VALUES (
  'authored_key_written_at_the_wrong_nesting_level_is_a_silent_noop',
  'An annotation move wrote properties.x/y where the schema reads a top-level position key',
  'MODERATE', 'alex:json_author', 'subject_neutral', 'incident', 'FIXED',
  ARRAY['sigma_pi_bonding'], ARRAY['src/data/concepts/chemistry/sigma_pi_bonding.json'],
  'js_eval',
  'After any programmatic JSON edit, READ THE FILE BACK and assert the intended value is at the path the '
  'consumer reads. Assert no scene_composition primitive carries positional keys outside `position`.',
  'scene_composition annotations position via a top-level `position: {x,y}`. An edit set '
  'properties.x/y instead — on a dict fetched with .get(default), so it mutated a temporary and never '
  'touched the file at all. Valid JSON, plausible shape, zero effect.',
  'Same family as the duplicate-JSON-key scar (last-wins silently discarded a value) and the dead-'
  'annotation scar (authored JSON the renderer never receives): the file stays valid, every gate passes, '
  'and the change does nothing. PREVENTION: verify the WRITE, not the intent — re-read and assert at the '
  'consumer''s path. A programmatic edit that reports success is not evidence the value landed.',
  'chemistry-p4-sigma-pi-2026-07-29'
);


-- ═══════════════════════════════════════════════════════════════════════════
-- SUMMARY: 12 rows — 2 UPDATEs (recurrences, one escalated MODERATE -> CRITICAL)
-- and 10 INSERTs. Severity: 2 CRITICAL new, 4 MAJOR, 4 MODERATE.
-- Status: 8 FIXED (fixed and verified this session), 2 OPEN (rows 7 and 9 —
-- both platform asks that outlive this concept and weaken FUTURE gates).
--
-- Rows 7 and 9 are the two that matter most beyond this concept:
--   7 — the frozen pin cannot see scene_composition labels, so a lock can be
--       approved without the content it protects.
--   9 — Gate 8's query tool returns a false all-clear on every chemistry
--       concept, and Gate 8 is the step that exists to stop recurrences.
--       TWO of this concept's seven blocking defects were recurrences.
-- ═══════════════════════════════════════════════════════════════════════════
