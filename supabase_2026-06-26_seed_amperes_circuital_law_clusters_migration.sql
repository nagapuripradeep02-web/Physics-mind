-- supabase_2026-06-26_seed_amperes_circuital_law_clusters_migration.sql
-- Seeds confusion_cluster_registry with 3 drill-down clusters for
-- amperes_circuital_law.json (Class 12 Ch.4 §4.5 — Ampère's circuital law
-- ∮B·dl = μ₀ I_enc applied to a long straight wire: choose a coaxial circular
-- Amperian loop, use symmetry (|B| constant AND tangent on the loop) to reduce the
-- line integral to ∮B·dl = B·(2πr), set it equal to μ₀ I_enc, and DERIVE
-- B = μ₀I/(2πr) — the integral-law route to the straight-wire field).
-- Authored 2026-06-26 by json_author from the physics-author drill-down trigger
-- phrasings (physics block §6).
--
-- Cluster placement (1 cluster per state, on the three hardest states):
--   STATE_3 (why must the loop be a circle? — constant-|B| symmetry)        — 1 cluster
--   STATE_5 (what does ∮B·dl mean and how do you add it up? — equal tiles)   — 1 cluster
--   STATE_7 (I_enc vs total current; does loop size change it?)             — 1 cluster
--
-- STATE_5 carries allow_deep_dive: true in the JSON (the AHA state); STATE_3 and
-- STATE_7 are the other two confusion hotspots flagged by physics-author.
--
-- CUT-LINE GUARD: this concept teaches Ampère's circuital law for the LONG
-- STRAIGHT WIRE ONLY. It does NOT teach the solenoid (B = μ₀nI, that is
-- magnetic_field_solenoid), the toroid, the Biot-Savart element-summation route
-- (that is biot_savart_law), or any off-axis / non-symmetric loop. Any "field
-- inside a solenoid / coil / toroid" or "field of one current element / dl × r"
-- drill-down belongs to those concepts, not here. The clusters below stay on the
-- loop-shape choice, the meaning of the circulation integral, and the enclosed
-- current vs total/loop-size confusion.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description,
--   trigger_examples, status, created_at, updated_at.
-- PRIMARY KEY is (cluster_id). ON CONFLICT (cluster_id) DO UPDATE so re-running
-- this migration re-syncs the label/description/triggers idempotently.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
(
  'why_circle_not_any_loop',
  'amperes_circuital_law',
  'STATE_3',
  'Why must the Amperian loop be a circle?',
  'student thinks any loop shape is usable for finding B; needs the constant-|B| symmetry argument',
  ARRAY[
    'why circle loop not square',
    'can i use any shape for amperian loop',
    'why does the loop have to be a circle',
    'why not take a rectangle as the loop',
    'what is special about circular loop in ampere law'
  ],
  'active'
),
(
  'circulation_is_abstract_integral',
  'amperes_circuital_law',
  'STATE_5',
  'What does ∮B·dl actually mean and how do you add it up?',
  'student treats the circulation as un-evaluable symbolic calculus; needs the equal-tile sum',
  ARRAY[
    'how do you actually add B dl around the loop',
    'the closed integral B.dl confusing how to solve',
    'what does the circle on the integral mean',
    'is integral B dl just notation or can we calculate',
    'how to evaluate line integral of B around wire'
  ],
  'active'
),
(
  'ienc_vs_total_current',
  'amperes_circuital_law',
  'STATE_7',
  'Is enclosed current the same as total current, and does loop size change it?',
  'student conflates I_enc with total/passing current and thinks a bigger loop encloses more',
  ARRAY[
    'is I enclosed same as total current',
    'does bigger loop enclose more current',
    'what counts as enclosed current in ampere law',
    'if loop is bigger does I enc increase',
    'difference between current in wire and current enclosed'
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
--   WHERE concept_id = 'amperes_circuital_law' ORDER BY state_id, cluster_id;
-- Should return 3 rows (1 STATE_3, 1 STATE_5, 1 STATE_7).
