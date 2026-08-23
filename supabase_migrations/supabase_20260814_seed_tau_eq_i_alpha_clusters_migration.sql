-- supabase_20260814_seed_tau_eq_i_alpha_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 clusters for
-- tau_eq_i_alpha.json — Class 11 Ch.7 System of Particles and Rotational
-- Motion, the rotational second law tau_net = I alpha. Authored on the
-- rigid_body_rotation field_3d engine (build 0c-3,
-- docs/loop_runs/rotmech/_engine/findings_d.md), chapter:7, section:"7.9",
-- prerequisites: ["rotational_kinematics","torque","moment_of_inertia",
-- "rigid_body_rotation"].
--
-- Authored 2026-08-14 by alex:json_author, using the physics_author's
-- drill-down trigger phrases VERBATIM (docs/loop_runs/rotmech/
-- tau_eq_i_alpha/physics_block.md Section 5):
--   STATE_2 — constant_torque_constant_speed, why_it_keeps_speeding_up,
--             torque_off_no_stop;
--   STATE_5 — same_torque_different_alpha, mass_position_matters,
--             alpha_formula_use.
--
-- Migration is AUTHORED, NOT APPLIED. json_author's own tooling forbids
-- `apply_migration` — this file is left for the founder / quality_auditor's
-- pre-run step. Drill-down itself is DEFERRED (Rule 18, 2026-06-10
-- directive) — the confusion_cluster_registry Gate-8 probe is
-- N/A-DORMANT this phase per the documented false-FAIL scar
-- (memory: auditor-cluster-registry-false-fail). Do not let the auditor
-- re-route json_author to "fix" this.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- status='pending_review' per the current cluster-registry convention.
--
-- has_prebuilt_deep_dive picks (skeleton Section 5, metadata only, Rule 18):
-- STATE_2 (the PRIMARY aha — the force-to-velocity carryover is the single
-- most documented rotational-dynamics misconception) and STATE_5 (the
-- I-dependence — where exam mistakes concentrate). Both states carry a
-- drill_downs array in the concept JSON referencing these cluster_ids.
--
-- BOUNDARY NOTE, binding on every description below: this concept owns the
-- RELATION tau_net = I alpha. It never re-derives what torque IS or the
-- moment arm (torque, not yet shipped), how I is computed or its
-- axis-dependence (moment_of_inertia, not yet shipped), the kinematics
-- omega = omega0 + alpha t as its own subject (rotational_kinematics), or
-- angular momentum L and its conservation (angular_momentum /
-- conservation_of_angular_momentum). No description here may cross any of
-- those lines, and none may show or imply the L / KE / dL/dt readouts this
-- concept deliberately never displays.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_2 constant_torque_constant_speed deep-dive ───────────────────
(
  'constant_torque_constant_speed',
  'tau_eq_i_alpha',
  'STATE_2',
  'Shouldn''t a constant push mean a constant speed?',
  'Student watches the drive wheel press onto the rim with a force that visibly never changes — the rim arrow holds at exactly 2.78 newtons the whole state — and reasonably expects a constant cause to produce a constant effect: one steady push, one steady spin rate. That expectation is exactly right for FORCE and VELOCITY in the everyday, friction-heavy world the student already knows, where a steady push against drag settles a body at one speed. It is exactly wrong here, because this turntable has no such drag to settle against: a constant torque tau produces a constant angular ACCELERATION alpha, not a constant angular speed omega. The spin rate omega keeps climbing the entire time the drive is engaged — past 2.00, past 3.00, all the way to 5.56 radians per second by the state''s end — while the one readout that stays fixed is alpha, at a steady +0.50. A constant push means constantly increasing speed, not one settled speed; the turning point is realising which quantity the torque actually controls.',
  ARRAY[
    'why doesnt it just spin at one speed',
    'shouldnt a constant push mean a constant speed',
    'why does the spin rate keep going up',
    'if the force never changes why does the speed keep changing',
    'doesnt a steady push mean a steady spin'
  ],
  'pending_review'
),
-- ─── STATE_2 why_it_keeps_speeding_up deep-dive ─────────────────────────
(
  'why_it_keeps_speeding_up',
  'tau_eq_i_alpha',
  'STATE_2',
  'What''s staying the same if the speed keeps changing?',
  'Student sees the omega readout in constant motion — 1.50, then past 2.00, then past 3.00, never landing on a final number — and struggles to find anything "steady" in a picture where a number is always moving. The steady thing is simply a DIFFERENT readout: alpha, the angular acceleration, sits fixed at +0.50 radians per second squared for the entire drive, even while omega itself never stops climbing. Acceleration being constant is not a contradiction with speed always changing — it is the DEFINITION of speed always changing at a fixed rate. Every second, omega gains exactly 0.50 more than it had, forever, for as long as the torque stays on; that steady per-second gain is what alpha measures, and it is the quantity a constant torque actually fixes. Something can be steady (alpha) and something else can be always changing (omega) at the very same time, because they are two different physical quantities answering two different questions.',
  ARRAY[
    'whats staying the same if the speed keeps changing',
    'why is alpha constant but omega isnt',
    'how can something be steady and always changing at the same time',
    'what does it mean for acceleration to be constant here',
    'why does alpha not change even though omega does'
  ],
  'pending_review'
),
-- ─── STATE_2 torque_off_no_stop deep-dive (bridges S2→S3) ───────────────
(
  'torque_off_no_stop',
  'tau_eq_i_alpha',
  'STATE_2',
  'If the push stops, why doesn''t the spinning stop?',
  'Student expects that once the drive wheel pulls back and the torque disappears, the spin should slow down and eventually stop — the everyday-friction intuition that motion needs a continuing cause to survive. What actually happens (shown directly in the very next state) is that the spin rate omega holds EXACTLY where the torque left it: alpha and tau both drop cleanly to 0.00 the instant the wheel withdraws, and omega neither rises nor falls afterward. Removing a torque removes the CHANGE in spin rate, not the spin rate itself — no torque acting means alpha is zero, and alpha being zero means omega stays constant at whatever value it already had, however large. The turntable is not "coasting down" against some hidden resistance; with nothing turning it and nothing slowing it, there is genuinely no reason for the number to move at all.',
  ARRAY[
    'if the push stops why doesnt the spinning stop',
    'shouldnt it slow down once the force is gone',
    'why does it keep spinning with nothing pushing it',
    'doesnt no torque mean it should stop',
    'why does the speed stay the same after the push ends'
  ],
  'pending_review'
),
-- ─── STATE_5 same_torque_different_alpha deep-dive ──────────────────────
(
  'same_torque_different_alpha',
  'tau_eq_i_alpha',
  'STATE_5',
  'How can the same push give different speeding up?',
  'Student watches two runs use the exact same drive wheel at the exact same torque, 1.53 newton-metres, for the exact same 2.5 seconds, and expects two identical outcomes — same cause, same push, so surely the same result. Run A (masses out at 0.80 m) reaches an angular speed of 1.25 radians per second; run B (masses moved in to 0.20 m) reaches 5.80 radians per second in that same stretch of time, more than four and a half times faster. The torque genuinely is identical in both runs — what changed is the moment of inertia I, from 3.06 down to 0.66, because the masses sit closer to the axle. The relation is alpha = tau over I, a PROPORTION, never a fixed equality: the same numerator (torque) divided by a smaller denominator (inertia) gives a larger angular acceleration, so the same push produces a bigger speeding-up whenever the body is easier to spin.',
  ARRAY[
    'how can the same push give different speeding up',
    'why isnt the acceleration the same if the torque is the same',
    'same force so why is one faster than the other',
    'doesnt equal torque mean equal alpha',
    'why does moving the masses change how fast it speeds up'
  ],
  'pending_review'
),
-- ─── STATE_5 mass_position_matters deep-dive ────────────────────────────
(
  'mass_position_matters',
  'tau_eq_i_alpha',
  'STATE_5',
  'Why does where the mass sits matter, not just how much?',
  'Student reasons that "how spinnable" a body is should depend only on its TOTAL mass — two 2 kg masses are two 2 kg masses, wherever they happen to sit on the rod, so moving them should change nothing about how the torque affects the spin. The masses themselves never change (2.0 kg each, in both runs); only their DISTANCE from the axle changes, from 0.80 m to 0.20 m, and the moment of inertia readout drops from 3.06 to 0.66 as a direct result — a body''s resistance to being spun up depends on where its mass sits relative to the axis it turns about, not merely how much mass exists somewhere on the body. This concept reads that difference off the I readout directly, without opening why the relationship is a SQUARE of the distance (moment_of_inertia''s own job) — the point here is only that position, not total mass, is what the I readout is answering.',
  ARRAY[
    'why does where the mass sits matter and not just how much there is',
    'isnt it just about the total mass',
    'why does moving the mass closer change the inertia',
    'how does distance from the axle affect spinning up',
    'why cant i just use the mass number without the radius'
  ],
  'pending_review'
),
-- ─── STATE_5 alpha_formula_use deep-dive ────────────────────────────────
(
  'alpha_formula_use',
  'tau_eq_i_alpha',
  'STATE_5',
  'How do I find alpha from torque and inertia?',
  'Student has watched two runs demonstrate the relationship on screen but is not yet confident turning tau and I into a number on their own, for an exam-style question rather than a live readout. The relation is exactly what the run-A and run-B numbers exhibit: alpha equals tau divided by I. Run A: 1.53 newton-metres divided by 3.06 kilogram-metres-squared gives 0.50 radians per second squared, matching the alpha readout exactly. Run B: the same 1.53 newton-metres divided by 0.66 kilogram-metres-squared gives 2.32 radians per second squared, again matching the readout exactly. The procedure is always the same three steps: read off the net torque, read off the moment of inertia for that configuration, and divide — the readout is never doing anything a written calculation could not reproduce by hand.',
  ARRAY[
    'how do i find alpha from torque and inertia',
    'whats the formula to get angular acceleration',
    'how do i use tau equals i alpha in a problem',
    'if i know the torque and inertia how do i get alpha',
    'how do i solve for alpha when torque is given'
  ],
  'pending_review'
)
ON CONFLICT (cluster_id) DO UPDATE
SET concept_id        = EXCLUDED.concept_id,
    state_id          = EXCLUDED.state_id,
    label             = EXCLUDED.label,
    description       = EXCLUDED.description,
    trigger_examples  = EXCLUDED.trigger_examples,
    status            = EXCLUDED.status,
    updated_at        = now();

-- ── Registration note ──────────────────────────────────────────────────
-- Unlike prior seed migrations in this directory, this file does NOT INSERT
-- into concept_panel_config. All 8 CLAUDE.md §6 registration sites for
-- tau_eq_i_alpha were PRE-REGISTERED on master at commit 4b289d4 — verified
-- present, READ-ONLY on this desk (src/config/panelConfig.ts:1891-1899,
-- src/lib/aiSimulationGenerator.ts:3088 [CONCEPT_RENDERER_MAP] + PCPL_CONCEPTS
-- N/A (this is a field_3d concept, not PCPL), src/lib/intentClassifier.ts:373
-- [VALID_CONCEPT_IDS] + :1350-1352/:1619-1621 [CLASSIFIER_PROMPT]). Adding a
-- second concept_panel_config INSERT here would be redundant with the
-- pre-registered row and is deliberately omitted.
