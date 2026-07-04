-- supabase_2026-06-25_seed_cyclotron_period_independent_of_speed_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 drill-down clusters for
-- cyclotron_period_independent_of_speed.json (Class 12 Ch.4 §4.2 — how LONG one
-- orbit takes: the period T = 2πm/qB and its independence from speed v and radius
-- r. A faster charge traces a BIGGER circle but completes each lap in the SAME
-- time, because the extra distance is paid for by the extra speed (v cancels).
-- The single surfaced quantity is T, and only as a RELATIVE lap-timer).
-- Authored 2026-06-25 by json_author from the physics-author drill-down trigger
-- phrasings (physics block §6).
--
-- Cluster placement (3 clusters per state, on the two allow_deep_dive states):
--   STATE_2 (faster, but same lap — the race; the AHA)              — 3 clusters
--   STATE_3 (why it cancels — T = 2πm/qB; the substitution)         — 3 clusters
--
-- STATE_2 and STATE_3 each carry allow_deep_dive: true in the JSON.
--
-- CUT-LINE GUARD: this concept teaches the PERIOD T = 2πm/qB and its independence
-- from speed and radius ONLY. It CITES r = mv/qB (the size concept,
-- circular_motion_charge_in_uniform_B) but does NOT re-derive it, does NOT show the
-- force MAGNITUDE F = qvB sin(theta) (that is magnetic_force_moving_charge), and
-- touches NO Ampere / current-loop / dipole / solenoid content. Any "how big is
-- the circle / how strong is the force / how many Newtons" drill-down belongs to
-- those concepts, not here. The clusters below stay on the race-tie intuition
-- (bigger circle, same time), the re-convergence at the start, and the algebra of
-- the v-cancellation that yields T = 2πm/qB.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description,
--   trigger_examples, status, created_at, updated_at.
-- PRIMARY KEY is (cluster_id). ON CONFLICT (cluster_id) DO UPDATE so re-running
-- this migration re-syncs the label/description/triggers idempotently.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
(
  'bigger_circle_more_distance',
  'cyclotron_period_independent_of_speed',
  'STATE_2',
  'A bigger circle is more distance — surely it takes longer?',
  'Student reasons that the fast charge covers a longer path (the bigger circle), so it MUST take more time, and cannot reconcile a longer path with the same lap time.',
  ARRAY[
    'the fast one has a bigger circle so it travels more distance',
    'how can a longer path take the same time',
    'bigger circle means more distance so it should be slower right',
    'doesnt covering more distance mean more time',
    'if the loop is bigger how is the lap time same'
  ],
  'active'
),
(
  'who_wins_the_race',
  'cyclotron_period_independent_of_speed',
  'STATE_2',
  'Which charge finishes one loop first?',
  'Student does not believe the race is a tie — expects the faster charge (or, having heard the path is longer, the slower charge) to finish a lap before the other.',
  ARRAY[
    'who finishes one loop first slow or fast',
    'which charge wins the race',
    'does the fast charge come back to start first',
    'is it really a tie or does fast win',
    'shouldnt the faster one finish before the slow one'
  ],
  'active'
),
(
  'same_start_same_finish',
  'cyclotron_period_independent_of_speed',
  'STATE_2',
  'Why do both charges reach the start at the same time, every lap?',
  'Student suspects the tie is a one-off coincidence rather than a built-in fact, and does not see why the two charges re-converge at the start on every single lap.',
  ARRAY[
    'why do both charges reach the start at the same time',
    'how do they meet at the start again',
    'why do they finish together every lap not just once',
    'is it a coincidence that they tie or always',
    'do the two charges line up at the start every time'
  ],
  'active'
),
(
  'where_does_v_cancel',
  'cyclotron_period_independent_of_speed',
  'STATE_3',
  'Where exactly does the v cancel in the period formula?',
  'Student cannot follow the cancellation step that turns T = 2π(mv/qB)/v into T = 2πm/qB — wants the meeting of the two v''s (top and bottom) made explicit.',
  ARRAY[
    'where does the v cancel in the period formula',
    'how does v disappear from t',
    'why does the speed cancel out',
    'i dont get how the two v become one',
    'how is there no v in t equals 2 pi m over qb'
  ],
  'active'
),
(
  'period_vs_radius',
  'cyclotron_period_independent_of_speed',
  'STATE_3',
  'Why does the period not depend on the radius?',
  'Student points out that r appears in T = 2πr/v and we used r = mv/qB, so cannot see how the final period ends up independent of the circle''s size.',
  ARRAY[
    'why doesnt the period depend on the radius',
    'r is in the formula so how is t independent of r',
    'if radius changes why does time stay same',
    'how can period not depend on the circle size',
    'but we used r equals mv qb so why no r in t'
  ],
  'active'
),
(
  'frequency_is_one_over_t',
  'cyclotron_period_independent_of_speed',
  'STATE_3',
  'How does the frequency f = qB/2πm relate to the period?',
  'Student is unclear how the aside frequency f = qB/2πm connects to the period T — what the difference between f and T is, and how one comes from the other.',
  ARRAY[
    'what is the difference between f and t',
    'why is f equal to one over t',
    'how do you get frequency from the period',
    'what does cyclotron frequency mean',
    'is f qb over 2 pi m the same as the period'
  ],
  'active'
)
ON CONFLICT (cluster_id) DO UPDATE
  SET concept_id       = EXCLUDED.concept_id,
      state_id         = EXCLUDED.state_id,
      label            = EXCLUDED.label,
      description      = EXCLUDED.description,
      trigger_examples = EXCLUDED.trigger_examples,
      status           = EXCLUDED.status,
      updated_at       = now();

-- Verify:
-- SELECT cluster_id, state_id FROM confusion_cluster_registry
--   WHERE concept_id = 'cyclotron_period_independent_of_speed' ORDER BY state_id, cluster_id;
-- Should return 6 rows (3 STATE_2, 3 STATE_3).
