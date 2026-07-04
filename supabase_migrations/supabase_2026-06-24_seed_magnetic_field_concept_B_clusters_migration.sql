-- supabase_2026-06-24_seed_magnetic_field_concept_B_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 drill-down clusters for
-- magnetic_field_concept_B.json (Class 12 Ch.4 §4.3 — what a magnetic field IS:
-- B as a vector field SOURCED by moving charge, REVEALED by a compass; it
-- circulates around the wire; it is the magnetic counterpart of the electric
-- field). Authored 2026-06-24 by json_author from the physics-author drill-down
-- trigger phrasings (physics block §6).
--
-- Cluster placement:
--   STATE_5 (B is a vector field that circulates around the wire) — 3 clusters
--   STATE_6 (just like E — both vector fields, source still vs moving) — 3 clusters
--
-- STATE_5 and STATE_6 both carry allow_deep_dive: true in the JSON.
--
-- CUT-LINE GUARD: this concept teaches WHAT a magnetic field IS — direction,
-- source, vector-field nature, the E analogy. It does NOT teach the MAGNITUDE
-- B = μ₀I/(2πr); any "how strong is B / what is the formula" drill-down belongs
-- to magnetic_field_wire, not here. The clusters below stay on direction,
-- circulation, source, and the E↔B analogy only.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description,
--   trigger_examples, status, created_at, updated_at.
-- PRIMARY KEY is (cluster_id). ON CONFLICT (cluster_id) DO UPDATE so re-running
-- this migration re-syncs the label/description/triggers idempotently.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
(
  'b_direction_vs_current',
  'magnetic_field_concept_B',
  'STATE_5',
  'Why is B not in the direction of the current?',
  'Student expects the magnetic field to point the same way as the current (along the wire), and cannot see why it circles sideways around the wire instead.',
  ARRAY[
    'why is B not in the direction of current',
    'current goes up so why B goes sideways',
    'shouldnt the field follow the current',
    'does B point same way as I or not',
    'why field is not along the wire if current is along wire'
  ],
  'active'
),
(
  'b_is_perpendicular_everywhere',
  'magnetic_field_concept_B',
  'STATE_5',
  'Why is B perpendicular to the wire at every point?',
  'Student does not see why the field is perpendicular to the wire (tangent to the circle) at every single point, not just at one place — has not connected tangent-to-the-circle with perpendicular-to-the-wire.',
  ARRAY[
    'why is B perpendicular to the wire everywhere',
    'is the field perpendicular at every point or just one',
    'how can B be perpendicular all around the wire',
    'why is B tangent and not straight out',
    'what does perpendicular to the wire actually mean here'
  ],
  'active'
),
(
  'circulation_vs_radial',
  'magnetic_field_concept_B',
  'STATE_5',
  'Why does B circle around rather than point straight out like E?',
  'Student pictures the magnetic field pointing radially outward from the wire like spokes (the way E points out from a charge) instead of circulating around it.',
  ARRAY[
    'why does B circle around instead of going straight out',
    'why isnt B radial like the electric field',
    'why does the field go around the wire not away from it',
    'shouldnt the field point out from the wire like spokes',
    'why is B in circles and not pointing outward'
  ],
  'active'
),
(
  'source_at_rest_vs_motion',
  'magnetic_field_concept_B',
  'STATE_6',
  'Why does a moving charge make B but a still charge does not?',
  'Student cannot see why motion is what matters — why a charge sitting still makes only an electric field, while the same charge moving also makes a magnetic field.',
  ARRAY[
    'why does a moving charge make a magnetic field but a still one doesnt',
    'why does motion matter for the magnetic field',
    'what is special about moving charge for B',
    'a charge at rest has a field so why no magnetic field',
    'why does the charge have to move to make B'
  ],
  'active'
),
(
  'both_are_vector_fields',
  'magnetic_field_concept_B',
  'STATE_6',
  'In what sense are E and B both vector fields?',
  'Student is unsure what it means to call B a vector field and how that makes it the same KIND of thing as E, given the two look so different (radial vs circulating).',
  ARRAY[
    'how are E and B both vector fields',
    'what makes B a vector field like E',
    'in what way is the magnetic field like the electric field',
    'why do we call both of them fields',
    'are B and E the same type of thing or not'
  ],
  'active'
),
(
  'test_object_reveals_not_creates',
  'magnetic_field_concept_B',
  'STATE_6',
  'Does the compass (or test charge) reveal the field or create it?',
  'Student thinks the compass or test charge is what brings the field into being, instead of seeing it as a probe that reveals a field which is already present in the space.',
  ARRAY[
    'does the compass create the field or just show it',
    'is the field there before i put the compass',
    'does the test charge make the electric field',
    'would there be a field without the compass',
    'does putting a probe in create the field or reveal it'
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
--   WHERE concept_id = 'magnetic_field_concept_B' ORDER BY state_id, cluster_id;
-- Should return 6 rows (3 STATE_5, 3 STATE_6).
