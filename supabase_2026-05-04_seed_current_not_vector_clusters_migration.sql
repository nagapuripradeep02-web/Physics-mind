-- supabase_2026-05-04_seed_current_not_vector_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 clusters (3 per has_prebuilt_deep_dive state)
-- for current_not_vector.json. Authored 2026-05-04 by json_author per skeleton §7
-- and physics_block §20. Schema-corrected 2026-05-04 by quality_auditor:
--   - PRIMARY KEY is (cluster_id) alone, not the (concept_id, state_id, cluster_id) composite.
--   - `label` column is NOT NULL and was missing from the first authoring; added here.
--
-- APPLIED 2026-05-04 via Supabase MCP apply_migration. Idempotent on re-run.
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status, created_at, updated_at.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
(
  'condition_2_unclear',
  'current_not_vector',
  'STATE_4',
  'What does the parallelogram-law test actually mean?',
  'Student understands condition (1) magnitude+direction but cannot apply condition (2) parallelogram-law obedience as a concrete test.',
  ARRAY[
    'what does parallelogram law actually mean',
    'how do i check condition 2',
    'is the parallelogram thing same as cosine rule',
    'i don''t get how to test condition 2',
    'parallelogram law sounds vague'
  ],
  'pending_review'
),
(
  'which_test_to_apply_when',
  'current_not_vector',
  'STATE_4',
  'How do I decide scalar or vector for any new quantity?',
  'Procedural confusion: given an unfamiliar quantity, the student lacks an algorithm to apply the two-condition test.',
  ARRAY[
    'given a new quantity what do i do first',
    'is there a step by step way to check',
    'how do i decide scalar or vector for any new thing',
    'what is the algorithm for classifying quantities',
    'the test feels random which one to use'
  ],
  'pending_review'
),
(
  'degenerate_parallel_case',
  'current_not_vector',
  'STATE_4',
  'At theta=0 both formulas give 7. So is current a vector then?',
  'Student notices that at theta=0 (degenerate parallel case) the parallelogram law and scalar arithmetic agree, and concludes current passes the test in some cases.',
  ARRAY[
    'but at zero degrees both formulas give 7',
    'so current is vector when wires are parallel',
    'what about theta equals zero case',
    'if they agree at zero why call current scalar',
    'the parallel case looks like current passes the test'
  ],
  'pending_review'
),
(
  'pressure_seems_like_vector',
  'current_not_vector',
  'STATE_5',
  'Pressure pushes outward, that is a direction, isn''t pressure a vector?',
  'After wrongly classifying pressure on the STATE_5 quantity card. Student conflates direction-of-action at a surface with vector nature.',
  ARRAY[
    'pressure pushes outward thats a direction',
    'why is pressure scalar it acts in all directions',
    'fluid pressure has direction at every point',
    'isnt pressure a vector because it pushes on walls',
    'pressure on a wall has a clear direction'
  ],
  'pending_review'
),
(
  'surface_tension_pull_direction',
  'current_not_vector',
  'STATE_5',
  'Surface tension pulls a needle, that is a direction, isn''t it a vector?',
  'After wrongly classifying surface tension. Student conflates the boundary-pull direction with vector nature.',
  ARRAY[
    'surface tension pulls a needle thats a direction',
    'why is surface tension scalar it has direction',
    'the tension pulls along the surface direction',
    'isnt surface tension acting in a direction',
    'needle floats because surface tension pulls up'
  ],
  'pending_review'
),
(
  'current_classification_just_memorized',
  'current_not_vector',
  'STATE_5',
  'I got it right but I do not know why',
  'Student tapped the right answer on the card but cannot justify it. Pattern-matching the lesson without internalizing the two-condition rule.',
  ARRAY[
    'i got it right but i don''t know why',
    'im just remembering the answer',
    'explain why again i can''t remember the reason',
    'how do i actually justify this on a test',
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
