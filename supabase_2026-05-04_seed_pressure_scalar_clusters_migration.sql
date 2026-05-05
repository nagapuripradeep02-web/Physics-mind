-- supabase_2026-05-04_seed_pressure_scalar_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 clusters (3 per has_prebuilt_deep_dive state)
-- for pressure_scalar.json. Authored 2026-05-04 by json_author.
-- Schema columns: cluster_id (PK), concept_id, state_id, label, description, trigger_examples, status.
-- Idempotent on re-run via ON CONFLICT (cluster_id) DO UPDATE.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
(
  'pascal_test_unclear',
  'pressure_scalar',
  'STATE_4',
  'What does Pascal''s test actually prove?',
  'Student watched STATE_2 but cannot articulate why same-pressure-on-rotated-face implies pressure is not a vector.',
  ARRAY[
    'what does pascal principle actually prove',
    'how does rotating face show pressure is scalar',
    'why is same pressure on every direction the test',
    'i don''t get pascal',
    'pascal sounds vague to me'
  ],
  'pending_review'
),
(
  'when_does_n_hat_come_in',
  'pressure_scalar',
  'STATE_4',
  'Where does n_hat come from in F = P A n_hat?',
  'Student sees the formula but does not know how to pick the surface normal in problems.',
  ARRAY[
    'where does n hat come from',
    'how do i find n hat',
    'is n hat just up always',
    'when do i use n hat in problems',
    'n hat is confusing in this formula'
  ],
  'pending_review'
),
(
  'pressure_burst_lid',
  'pressure_scalar',
  'STATE_4',
  'But a pressure cooker bursts upward — pressure has direction',
  'Student uses cooker-burst evidence to argue pressure is directional. Conflates mechanical-design weakness with pressure direction.',
  ARRAY[
    'cooker bursts upward so pressure goes up',
    'lid lifts off proves pressure direction',
    'if pressure had no direction nothing would burst',
    'pressure cooker shows direction is up',
    'why does the lid lift if pressure is scalar'
  ],
  'pending_review'
),
(
  'surface_tension_trap',
  'pressure_scalar',
  'STATE_5',
  'Surface tension pulls a needle, isn''t that direction?',
  'Student wrongly classifies surface tension on STATE_5 card. Conflates boundary-pull with vector nature.',
  ARRAY[
    'surface tension pulls a needle thats a direction',
    'why is surface tension scalar it has a pull',
    'the tension acts along the surface direction',
    'surface tension is along the surface so vector',
    'isn''t surface tension a vector'
  ],
  'pending_review'
),
(
  'omnidirectional_meaning',
  'pressure_scalar',
  'STATE_5',
  'Pressure pushes all directions, that means it is many vectors',
  'Student misreads omnidirectional as "many vectors superposed" rather than "scalar at a point".',
  ARRAY[
    'pressure has many vectors at a point',
    'omnidirectional means many directions so vector',
    'pressure pushes all sides isn''t that vector sum',
    'all directions sounds like a vector property',
    'how can scalar push every wall'
  ],
  'pending_review'
),
(
  'got_it_right_but_no_why',
  'pressure_scalar',
  'STATE_5',
  'I got it right but I do not know why',
  'Student tapped scalar correctly but cannot justify with the two-condition rule. Pattern-matching, not internalized.',
  ARRAY[
    'i got it right but i don''t know why',
    'im just remembering pressure is scalar',
    'explain why pressure is scalar again',
    'how do i justify this on a test',
    'i picked scalar but i was guessing'
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
