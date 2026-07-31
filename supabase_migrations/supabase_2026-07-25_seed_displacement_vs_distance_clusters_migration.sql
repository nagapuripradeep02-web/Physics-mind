-- supabase_2026-07-25_seed_displacement_vs_distance_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 clusters for displacement_vs_distance.json —
-- concept #1 of the Class 11 Kinematics "Motion in a Straight Line" DAG track
-- (chapter:2, section:"2.1", prerequisites:["scalar_vs_vector"]). Authored on the
-- NEW field_3d "kinematics_1d_track" scenario (does not exist in
-- field_3d_renderer.ts yet — see field_3d_config.engine_build_spec in the
-- concept JSON for the full peter_parker:renderer_primitives contract).
--
-- Authored 2026-07-25 by alex:json_author, using the physics_author's
-- drill-down trigger phrases VERBATIM (STATE_3: round_trip_zero_displacement,
-- distance_always_grows, when_are_they_equal — STATE_5:
-- endpoint_subtraction_mechanics, path_independence_of_displacement,
-- magnitude_vs_signed_value).
--
-- Migration is AUTHORED, NOT APPLIED — quality_auditor's pre-run step
-- applies it (json_author is forbidden from apply_migration). Drill-down
-- itself is DEFERRED (Rule 18, 2026-06-10 directive) — the
-- confusion_cluster_registry Gate-8 probe is N/A-DORMANT this phase per the
-- documented false-FAIL scar (memory: auditor-cluster-registry-false-fail).
-- Do not let the auditor re-route json_author to "fix" this.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- status='pending_review' per the current cluster-registry convention.
--
-- has_prebuilt_deep_dive: true is tagged (metadata only, Rule 18) on
-- STATE_3 and STATE_5 in the concept JSON itself, referencing these
-- cluster_ids via each state's drill_downs array.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_3 round_trip_zero_displacement deep-dive ────────────────────
(
  'round_trip_zero_displacement',
  'displacement_vs_distance',
  'STATE_3',
  'How can displacement be zero when I clearly moved?',
  'Student cannot see why displacement is zero when the runner very obviously walked a long way. Displacement never asks "how much did you move" — it only asks "where did you end up, compared with where you began". A round trip that returns to the exact starting point makes x_f equal x0 again, so Δx = x_f − x0 collapses to exactly zero, no matter how far the feet actually travelled to get there. The odometer (distance) still remembers every step; the displacement arrow does not — it only ever points from start to end.',
  ARRAY[
    'how can displacement be zero when I clearly moved',
    'I walked the whole way there and back, why does it say zero',
    'if I ran 4 km how is my displacement nothing',
    'does going back to the start erase my movement',
    'why is displacement 0 after a round trip'
  ],
  'pending_review'
),
-- ─── STATE_3 distance_always_grows deep-dive ───────────────────────────
(
  'distance_always_grows',
  'displacement_vs_distance',
  'STATE_3',
  'Why can distance only go up?',
  'Student assumes a reversal in direction should make the distance reading go back down, the way displacement does. Distance is an odometer, not a position — it adds up the LENGTH of every step taken, and length is always a positive number. Walking backward does not "un-walk" the forward steps; it just adds more positive length on top of what is already there. That is why the distance readout only ever climbs, in every state of this sim, on both the outbound leg and the return leg.',
  ARRAY[
    'why can distance only go up',
    'can the odometer number ever go down',
    'why does distance keep increasing even when I turn around',
    'does walking backward reduce the distance reading',
    'why doesnt distance care which way Im going'
  ],
  'pending_review'
),
-- ─── STATE_3 when_are_they_equal deep-dive ─────────────────────────────
(
  'when_are_they_equal',
  'displacement_vs_distance',
  'STATE_3',
  'When are distance and displacement actually the same?',
  'Student has seen both a case where the two numbers match (STATE_2, one-directional motion) and a case where they diverge sharply (STATE_3, the round trip) and wants the general rule. Distance equals the SIZE of displacement exactly when the motion never reverses direction — every step keeps adding to x_f in the same sense, so the accumulated path length and the straight-line endpoint gap grow together. The instant the motion turns back on itself, distance keeps climbing on the return leg while displacement starts shrinking back toward its earlier values — from that moment on the two numbers must diverge.',
  ARRAY[
    'when are distance and displacement actually the same',
    'is displacement ever equal to distance',
    'do they match if I never turn around',
    'why did distance equal displacement in the first part but not later',
    'what has to be true for the two numbers to be equal'
  ],
  'pending_review'
),
-- ─── STATE_5 endpoint_subtraction_mechanics deep-dive ──────────────────
(
  'endpoint_subtraction_mechanics',
  'displacement_vs_distance',
  'STATE_5',
  'How do I calculate displacement if both positions are negative, or the start isn''t zero?',
  'Student is comfortable with Δx = x_f − x0 when x0 = 0 but freezes once either coordinate is nonzero or negative. The formula never changes: subtract the starting position from the final position, keeping every sign exactly as given. A runner who starts at −20 m and ends at +10 m has Δx = 10 − (−20) = 30 m — the subtraction itself handles the negative sign correctly, there is no separate rule for "when the start isn''t zero" or "when a coordinate is negative".',
  ARRAY[
    'how do I calculate displacement if both positions are negative',
    'is displacement just final minus initial',
    'what do I do if the starting point isnt zero',
    'how do you find displacement from two coordinates',
    'why do we subtract the starting position and not just use the ending one'
  ],
  'pending_review'
),
-- ─── STATE_5 path_independence_of_displacement deep-dive ───────────────
(
  'path_independence_of_displacement',
  'displacement_vs_distance',
  'STATE_5',
  'Does it matter how I get from one point to the other?',
  'Student notices the runner swept back and forth several times in STATE_5 yet the displacement formula only ever used the very first and very last position, and wonders if that is a shortcut or the actual rule. It is the actual rule: displacement is defined ENTIRELY by the two endpoints, x0 and x_f, and is completely blind to every twist, turn, pause, or extra lap taken in between. Two journeys that look nothing alike on the track — one direct, one zig-zagging with five reversals — can have the identical displacement as long as they share the same start and end points; only the distance readout (and the effort involved) would differ between them.',
  ARRAY[
    'does it matter how I get from one point to the other',
    'why dont the twists and turns in my path affect displacement',
    'can two totally different journeys have the same displacement',
    'why does displacement ignore my actual route',
    'does zig zagging change my displacement if I end up at the same place'
  ],
  'pending_review'
),
-- ─── STATE_5 magnitude_vs_signed_value deep-dive ───────────────────────
(
  'magnitude_vs_signed_value',
  'displacement_vs_distance',
  'STATE_5',
  'Is displacement always positive?',
  'Student has just seen displacement swing negative in STATE_4 and settle positive in STATE_5, and wants to know which one is the "real" behaviour, or whether the minus sign should be dropped when reporting an answer. Displacement is a signed quantity by definition — the sign IS the direction, positive for +x motion, negative for −x motion, and it must be kept in any reported answer (Δx = −20 m is a complete, correct answer, not a magnitude waiting to be signed). Its MAGNITUDE, |Δx|, is what is always non-negative — that is a separate quantity from displacement itself, and conflating the two is exactly the slip that drops a required minus sign on an exam.',
  ARRAY[
    'is displacement always positive',
    'when do I use the plus or minus sign versus just the size',
    'whats the difference between magnitude of displacement and displacement itself',
    'should I drop the negative sign when I report displacement',
    'is negative displacement smaller than positive displacement'
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


-- ============================================================
-- displacement_vs_distance — concept_panel_config routing row
-- (authored-not-applied; quality_auditor's pre-run step applies this
-- migration — json_author is forbidden from apply_migration via the
-- Supabase MCP). Mirrors the field_3d row shape used by
-- electric_potential_dipole / magnetisation_and_intensity, NOT the PCPL
-- mechanics_2d row shape used by scalar_vs_vector/vector_addition_law/
-- resultant_direction — this concept is field_3d, not PCPL.
-- ============================================================
--
-- WHY (CRITICAL — flagged by physics_author): jsonModifier.ts
-- fetchTechnologyConfig() reads concept_panel_config.default_panel_count
-- FIRST. Without this row, a cache-miss falls back to the JSON's own
-- renderer_pair, and per the fetch_technology_config_silent_particle_field_default
-- engine_bug_queue class, an unregistered concept can silently route into a
-- dual-panel mechanics_2d-shaped block instead of the single-panel field_3d
-- sim it actually is — a Rule-18 risk (wrong renderer decides what the
-- student sees). default_panel_count=1 + panel_a_renderer='field_3d' +
-- panel_b_renderer=NULL locks this concept onto the correct single-panel
-- field_3d path unconditionally, independent of cache state.
--
-- technology_a='threejs' mirrors every other field_3d concept's row
-- (electric_potential_dipole, magnetisation_and_intensity, etc.).

INSERT INTO concept_panel_config
  (concept_id, default_panel_count, panel_a_renderer, panel_b_renderer,
   panel_c_renderer, sonnet_can_upgrade, upgrade_max, verified_by_human,
   reasoning, technology_a, technology_b, sync_required, class_level, chapter)
VALUES
  ('displacement_vs_distance', 1, 'field_3d', NULL,
   NULL, false, 1, false,
   'CRITICAL per physics_author: without this row, a simulation_cache miss falls back to JSON-only resolution and risks routing into a dual-panel mechanics_2d-shaped block instead of the correct single-panel field_3d sim (fetch_technology_config_silent_particle_field_default defect class). default_panel_count=1, panel_a_renderer=field_3d, panel_b_renderer=NULL locks the correct single-panel field_3d path unconditionally. Mirrors electric_potential_dipole / magnetisation_and_intensity (field_3d family), not the PCPL mechanics_2d row shape.',
   'threejs', NULL, false, 11, '2')
ON CONFLICT (concept_id) DO UPDATE SET
  default_panel_count = EXCLUDED.default_panel_count,
  panel_a_renderer = EXCLUDED.panel_a_renderer,
  panel_b_renderer = EXCLUDED.panel_b_renderer,
  panel_c_renderer = EXCLUDED.panel_c_renderer,
  sonnet_can_upgrade = EXCLUDED.sonnet_can_upgrade,
  upgrade_max = EXCLUDED.upgrade_max,
  verified_by_human = EXCLUDED.verified_by_human,
  reasoning = EXCLUDED.reasoning,
  technology_a = EXCLUDED.technology_a,
  technology_b = EXCLUDED.technology_b,
  sync_required = EXCLUDED.sync_required,
  class_level = EXCLUDED.class_level,
  chapter = EXCLUDED.chapter;

-- Verify:
-- SELECT * FROM confusion_cluster_registry WHERE concept_id = 'displacement_vs_distance';
-- Should return 6 rows (3 x STATE_3, 3 x STATE_5), all status='pending_review'.
-- SELECT * FROM concept_panel_config WHERE concept_id = 'displacement_vs_distance';
-- Should return 1 row with default_panel_count = 1, panel_a_renderer = 'field_3d', technology_a = 'threejs'.
