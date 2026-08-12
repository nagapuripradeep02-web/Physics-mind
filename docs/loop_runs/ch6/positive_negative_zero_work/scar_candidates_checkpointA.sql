-- Scar candidates — positive_negative_zero_work, Checkpoint A (founder-proxy, 2026-08-02)
--
-- SQL TEXT, NOT YET APPLIED. Written to a file at the moment the reviewer produced it, per the
-- 2026-08-02 standing lesson: nine rows from concept #1's review cycles existed ONLY in agent
-- report text and were one session-end from being lost forever. Apply with the seed-script
-- contract before this concept ships (the apply step belongs beside visual:approve).
--
-- bug_class values checked against all 11 live rows for this concept and every candidate file in
-- this run — no collisions.

-- 1 — F1. The concept-killer: a frictionless state whose drive opposes the motion cannot end.
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES
('nlb_frictionless_state_with_an_opposing_applied_force_reverses_and_unwinds_its_own_work_ledger',
 'A frictionless state whose applied force opposes the motion can never come to rest: it reverses at v=0 and the constant-force ledger climbs back to zero, erasing the sign the state teaches',
 'CRITICAL', 'alex:architect',
 'The static hold requires |drive| <= maxStat with maxStat = b.mu_s * N (L45471, L45491), and surface.frictionless hard-zeroes mu_s and mu_k (L44685-86), so maxStat = 0. A state authoring frictionless: true together with a nonzero backward along-component (applied_force at an obtuse angle, nlbForceAlong) therefore satisfies neither the stuck test nor the sign-flip rest clamp at L45506, and the body reverses. Because W = F_along * (s - s0) for a constant force (L44209-10), the displayed ledger unwinds to exactly 0 as the body returns to its release point and then changes sign, while angle_arc {applied -> displacement} keeps reading the authored obtuse angle throughout (nlbFangDir reads NET displacement, L43989). loop_reset_ms conceals this only until the first trusted slider input, which latches PM_nlbSweepSeized (L42171) and makes nlbRunLoopReset return early for the rest of the visit (L43022) - i.e. it is concealed everywhere EXCEPT the interaction the state exists for.',
 'A guided state whose claim is the SIGN of a constant force''s work must be able to END, and must stay ended for every value its own sliders can reach. If the along-component opposes the motion, either the surface supplies static friction able to hold it across the whole slider range (mu_s * N(theta) >= |F cos theta| for every reachable theta - compute the ENVELOPE, not the authored point: for F=25 N on 5 kg the binding value is mu_s ~ 0.60 near theta = 150 deg, not the 0.457 the authored 120 deg suggests), or the state authors no slider that outlives its loop. Never state a seized-run consequence for one state by analogy to another whose drive is different: a zero-drive coast arrests forward at the bound, a backward-drive coast reverses.',
 'js_eval',
 'For each state authoring work_accumulators with a non-empty controls_visible: drive the state, fire ONE trusted slider input to seize the loop, run 20 s. Assert that with the slider value unchanged from its authored value, the sign of every rendered work bar never changes and |W_rendered| never falls below 60 percent of its authored peak. Independently assert the body velocity never changes sign while the authored along-force is nonzero and constant.',
 'OPEN',
 ARRAY['positive_negative_zero_work','conservative_vs_nonconservative_forces','mechanical_energy_loss_with_friction']::text[],
 ARRAY[]::text[],
 'ch6-0d-checkpointA-founder_proxy-positive_negative_zero_work', 'incident')
ON CONFLICT (bug_class) DO UPDATE SET
  title = EXCLUDED.title, severity = EXCLUDED.severity, root_cause = EXCLUDED.root_cause,
  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,
  status = EXCLUDED.status, concepts_affected = EXCLUDED.concepts_affected;

-- 2 — F2. Third occurrence of the archetype-on-paper class in this chapter.
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES
('nlb_motion_archetype_declared_from_a_between_state_delta_or_a_teacher_driven_control',
 'A state declares a motion archetype naming a between-state difference or a slider the teacher must drag, so its authored beat silently repeats a sibling',
 'MAJOR', 'alex:architect',
 'Rule 31 requires a distinct WITHIN-STATE authored motion, but nothing machine-checks the declaration against the produced pixels. When the engine cannot author the transition the state wants (param_ramp.param is the closed enum theta|F|mu_s|mu_k|m, L1576-1582 - there is no F_ang member, so an in-state angle sweep is unauthorable), an architect can still satisfy the declaration on paper by naming the difference from the PREVIOUS state (which is the delta cue, not the archetype) or the live slider (which is a Rule-31 addition, not the authored beat). Gate 3e/3f, eye_walker and quality_auditor all read the declared label. Third occurrence in one chapter: work_done_by_constant_force Checkpoint A F4 (declared delta was a verified pixel no-op), its Checkpoint B S5 (declared reveal-build with no time-varying mechanism - a third undeclared pure-translate, rebuilt), and positive_negative_zero_work S5 (declared rotate/flip on a beat where the only motion is a crate decelerating to a stop, i.e. S2''s beat with a different force name).',
 'A motion archetype names a motion the AUTHORED beat produces with NO teacher input, inside the state, between t=0 and the loop reset. A between-state difference is the DELTA CUE. A live slider is a Rule-31 contextual control and is required, but it never discharges the archetype. If the engine cannot author the transition the idea wants, the state needs a genuinely different motion - not a renamed one, and not an engine extension whose output would contradict the state''s own formula surface (a ramping theta accumulates the integral of F cos theta ds, which does not equal F*d*cos theta).',
 'manual',
 'For each guided state, write one sentence describing the motion visible from t=0 to the loop reset with every control untouched. Two states whose sentences are the same with different nouns are the same archetype, whatever they declare. Run this before the archetype audit, not after.',
 'OPEN',
 ARRAY['positive_negative_zero_work','work_done_by_constant_force','work_energy_theorem']::text[],
 ARRAY[]::text[],
 'ch6-0d-checkpointA-founder_proxy-positive_negative_zero_work', 'incident')
ON CONFLICT (bug_class) DO UPDATE SET
  title = EXCLUDED.title, severity = EXCLUDED.severity, root_cause = EXCLUDED.root_cause,
  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,
  status = EXCLUDED.status, concepts_affected = EXCLUDED.concepts_affected;

-- 3 — F4. Sub-frame margin between an asserted beat and the pin that photographs it.
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES
('nlb_frozen_pin_lands_within_one_frame_of_the_beat_the_dod_asserts_it_shows',
 'A DoD asserts what the frozen frame shows, and the asserted event precedes the pin by less than one frame',
 'MODERATE', 'alex:architect',
 'A loop_reset_ms state pins at cycle*R + clamp(0.60*R, 150, R-150) (deriveStateMeta L2931-2943). Authoring R so that 0.60*R only just exceeds the physical event the DoD names - a stop, an arrow hiding, a crossing - leaves a sub-frame margin, and the H2 baseline is minted on it. Measured on positive_negative_zero_work S2: R = 2600 gives a pin at 1560 ms; the friction arrow hides only once the static branch reports f = 0 (stuck requires |v| < NLB_STOP_EPS_V = 0.01, L39590/L45491), which at a = -3.92 first happens at frame 93, t = 1550 ms. Margin 10 ms = 0.6 frames, on a DoD that names that frame the state''s best single picture. Any later change to mu, m, g or R silently re-photographs the baseline on the wrong side of the event, and no gate compares the baseline to the DoD sentence.',
 'When a DoD asserts what the frozen frame shows, state the margin in milliseconds between the asserted event and clamp(0.60*R, 150, R-150), and require at least 10 frames (167 ms). Compute the event time from the authored physics at the engine''s own step size, not from the continuum solution - the discrete stop lands up to two steps after the analytic one because the rest clamp fires on a sign flip and the frame that fires it still reports the sliding value.',
 'js_eval',
 'For each loop_reset_ms state whose DoD asserts a discrete event (a stop, an arrow hiding, a crossing): integrate the authored physics at h = 1/60 to the first frame the event actually holds, and assert clamp(0.60*R, 150, R-150) minus that time >= 167 ms. Independently, pin at the contracted instant and assert the asserted element''s rendered visibility matches the DoD sentence.',
 'OPEN',
 ARRAY['positive_negative_zero_work','work_done_by_constant_force','work_energy_theorem','conservation_of_mechanical_energy']::text[],
 ARRAY[]::text[],
 'ch6-0d-checkpointA-founder_proxy-positive_negative_zero_work', 'incident')
ON CONFLICT (bug_class) DO UPDATE SET
  title = EXCLUDED.title, severity = EXCLUDED.severity, root_cause = EXCLUDED.root_cause,
  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,
  status = EXCLUDED.status, concepts_affected = EXCLUDED.concepts_affected;
