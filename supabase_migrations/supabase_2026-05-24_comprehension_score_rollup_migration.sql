-- Comprehension Metric v1 — score rollup materialized views.
-- Spec: physics-mind/docs/COMPREHENSION_METRIC.md §3
-- Authored: 2026-05-23 (filename dated 05-24 for sequencing after base tables)
--
-- Depends on: supabase_2026-05-23_comprehension_metric_migration.sql
--
-- Refresh strategy for v1: manual / on-demand via Supabase MCP or scheduled
-- function. Cadence target: every 6 hours.
--   SELECT cron.schedule('refresh-comprehension', '0 */6 * * *',
--     $$ REFRESH MATERIALIZED VIEW CONCURRENTLY comprehension_state_score;
--        REFRESH MATERIALIZED VIEW CONCURRENTLY comprehension_concept_score;
--        REFRESH MATERIALIZED VIEW CONCURRENTLY comprehension_chapter_score; $$);

-- =============================================================================
-- 1. Per-state score — % correct on questions tagged to that state
-- =============================================================================
-- Rules from spec §3.1:
--   • Trailing 30 days of attempts
--   • Minimum 10 attempts required for a "trusted" score; below = NULL
--   • dwell_median computed from state_interaction_log for behavior signature
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS comprehension_state_score AS
WITH attempts_30d AS (
  SELECT
    ca.concept_id,
    ca.state_id,
    ca.is_correct,
    ca.session_id
  FROM comprehension_attempt ca
  WHERE ca.attempted_at >= now() - INTERVAL '30 days'
),
interactions_30d AS (
  SELECT
    sil.concept_id,
    sil.state_id,
    sil.dwell_ms,
    sil.replay_count,
    sil.asked_explain,
    sil.typed_confusion,
    sil.completed,
    sil.abandoned
  FROM state_interaction_log sil
  WHERE sil.entered_at >= now() - INTERVAL '30 days'
    AND sil.exited_at IS NOT NULL
)
SELECT
  COALESCE(a.concept_id, i.concept_id) AS concept_id,
  COALESCE(a.state_id, i.state_id)     AS state_id,
  COUNT(DISTINCT a.session_id)         AS attempt_sessions,
  COUNT(a.is_correct)                  AS attempt_count,
  CASE
    WHEN COUNT(a.is_correct) >= 10
      THEN ROUND( (SUM(CASE WHEN a.is_correct THEN 1 ELSE 0 END)::numeric / COUNT(a.is_correct)) * 100, 1)
    ELSE NULL
  END                                  AS state_score_pct,
  COUNT(i.dwell_ms)                    AS interaction_count,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY i.dwell_ms) AS dwell_median_ms,
  AVG(i.replay_count)                  AS avg_replay_count,
  AVG(CASE WHEN i.asked_explain THEN 1.0 ELSE 0.0 END)    AS asked_explain_rate,
  AVG(CASE WHEN i.typed_confusion THEN 1.0 ELSE 0.0 END)  AS typed_confusion_rate,
  AVG(CASE WHEN i.completed THEN 1.0 ELSE 0.0 END)        AS completion_rate,
  AVG(CASE WHEN i.abandoned THEN 1.0 ELSE 0.0 END)        AS abandonment_rate,
  now()                                AS computed_at
FROM attempts_30d a
  FULL OUTER JOIN interactions_30d i
    ON a.concept_id = i.concept_id AND a.state_id = i.state_id
GROUP BY COALESCE(a.concept_id, i.concept_id), COALESCE(a.state_id, i.state_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_css_concept_state
  ON comprehension_state_score (concept_id, state_id);

COMMENT ON MATERIALIZED VIEW comprehension_state_score IS
  'Per-state comprehension score + behavior signals over trailing 30 days. Refresh every 6h. Comprehension Metric v1.';

-- =============================================================================
-- 2. Per-concept score — weighted average of per-state scores
-- =============================================================================
-- PRIMARY-aha questions weighted 2.0 per state_comprehension_quiz.weight.
-- The score per state-question is weighted by its quiz row's weight.
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS comprehension_concept_score AS
WITH per_question_30d AS (
  SELECT
    ca.concept_id,
    ca.question_id,
    q.weight,
    AVG(CASE WHEN ca.is_correct THEN 1.0 ELSE 0.0 END) AS question_score
  FROM comprehension_attempt ca
    INNER JOIN state_comprehension_quiz q ON q.id = ca.question_id
  WHERE ca.attempted_at >= now() - INTERVAL '30 days'
  GROUP BY ca.concept_id, ca.question_id, q.weight
  HAVING COUNT(*) >= 10
)
SELECT
  concept_id,
  ROUND( SUM(question_score * weight) / SUM(weight) * 100, 1) AS concept_score_pct,
  SUM( (SELECT COUNT(*) FROM comprehension_attempt WHERE question_id = per_question_30d.question_id AND attempted_at >= now() - INTERVAL '30 days') ) AS total_attempts,
  COUNT(*) AS questions_with_data,
  now() AS computed_at
FROM per_question_30d
GROUP BY concept_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_ccs_concept
  ON comprehension_concept_score (concept_id);

COMMENT ON MATERIALIZED VIEW comprehension_concept_score IS
  'Per-concept weighted comprehension score over trailing 30 days. Weight=2.0 for PRIMARY-aha state questions. Comprehension Metric v1.';

-- =============================================================================
-- 3. Per-chapter score — average of per-concept scores
-- =============================================================================
-- Chapter inference: pulled from concept JSON's chapter field; for v1 we infer
-- from concept_id prefix or a static map. Defer chapter_id column on concept
-- JSON to a separate ticket (open question §11 in spec).
--
-- For v1: use the helper function below to infer chapter from concept_id.
-- This is a deliberate v1 shortcut — replace with concept JSON chapter_id
-- field when that ticket lands.
-- =============================================================================

CREATE OR REPLACE FUNCTION infer_chapter_id(p_concept_id TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- v1 stub: best-effort inference from concept_id prefixes.
  -- Replace with concept JSON chapter_id lookup once that field exists.
  RETURN CASE
    WHEN p_concept_id IN ('magnetic_field_wire', 'magnetic_force_moving_charge',
                          'torque_on_current_loop_in_field', 'magnetic_field_solenoid')
      THEN 'ch26_magnetism'
    WHEN p_concept_id LIKE 'vector_%' OR p_concept_id IN ('unit_vector', 'angle_between_vectors',
         'scalar_multiplication', 'negative_vector', 'equal_vs_parallel', 'parallelogram_law_test',
         'pressure_scalar', 'area_vector', 'resultant_formula', 'special_cases', 'range_inequality',
         'direction_of_resultant', 'unit_vector_form', 'inclined_plane_components',
         'negative_components', 'dot_product', 'current_not_vector')
      THEN 'ch5_vectors'
    WHEN p_concept_id IN ('distance_displacement_basics', 'average_speed_velocity',
         'instantaneous_velocity', 'sign_convention', 's_in_equations', 'three_cases',
         'free_fall', 'sth_formula', 'negative_time', 'xt_graph', 'vt_graph', 'at_graph',
         'direction_reversal')
      THEN 'ch6_kinematics_1d'
    WHEN p_concept_id IN ('a_function_of_t', 'a_function_of_x', 'a_function_of_v',
         'initial_conditions', 'vab_formula', 'relative_1d_cases', 'time_to_meet',
         'upstream_downstream', 'shortest_time_crossing', 'shortest_path_crossing',
         'apparent_rain_velocity', 'umbrella_tilt_angle', 'ground_velocity_vector',
         'heading_correction', 'time_of_flight', 'max_height', 'range_formula',
         'up_incline_projectile', 'down_incline_projectile', 'two_projectile_meeting',
         'two_projectile_never_meet')
      THEN 'ch7_kinematics_2d'
    WHEN p_concept_id IN ('field_forces', 'contact_forces', 'normal_reaction',
         'tension_in_string', 'hinge_force', 'free_body_diagram',
         'friction_static_kinetic', 'newton_second_law_direction')
      THEN 'ch8_forces'
    WHEN p_concept_id = 'class12_current_electricity'
      THEN 'ch3_current_electricity'
    ELSE 'unclassified'
  END;
END;
$$;

CREATE MATERIALIZED VIEW IF NOT EXISTS comprehension_chapter_score AS
SELECT
  infer_chapter_id(concept_id) AS chapter_id,
  COUNT(*) AS concept_count,
  ROUND(AVG(concept_score_pct), 1) AS chapter_score_pct,
  SUM(total_attempts) AS chapter_total_attempts,
  now() AS computed_at
FROM comprehension_concept_score
GROUP BY infer_chapter_id(concept_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_chs_chapter
  ON comprehension_chapter_score (chapter_id);

COMMENT ON MATERIALIZED VIEW comprehension_chapter_score IS
  'Per-chapter average of concept scores. Uses infer_chapter_id() helper as v1 shortcut. Comprehension Metric v1.';

-- =============================================================================
-- Initial refresh — populate views (empty until first attempts arrive)
-- =============================================================================

REFRESH MATERIALIZED VIEW comprehension_state_score;
REFRESH MATERIALIZED VIEW comprehension_concept_score;
REFRESH MATERIALIZED VIEW comprehension_chapter_score;
