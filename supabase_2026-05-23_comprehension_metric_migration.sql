-- Comprehension Metric v1 — three tables for state-level instrumentation.
-- Spec: physics-mind/docs/COMPREHENSION_METRIC.md §2
-- Authored: 2026-05-23
--
-- Writes are server-side only (Next.js server actions / API routes with service-role key).
-- No client-side RLS policies — clients never hit these tables directly.

-- =============================================================================
-- 1. state_interaction_log — per-state behavior signals
-- =============================================================================

CREATE TABLE IF NOT EXISTS state_interaction_log (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL,
  user_email TEXT,
  concept_id TEXT NOT NULL,
  state_id TEXT NOT NULL,
  state_index INT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'conceptual',
  class_level INT,

  entered_at TIMESTAMPTZ NOT NULL,
  exited_at TIMESTAMPTZ,
  dwell_ms INT,

  replay_count INT NOT NULL DEFAULT 0,
  asked_explain BOOLEAN NOT NULL DEFAULT FALSE,
  typed_confusion BOOLEAN NOT NULL DEFAULT FALSE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  abandoned BOOLEAN NOT NULL DEFAULT FALSE,

  device_class TEXT,
  network_type TEXT,

  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_sil_concept_state ON state_interaction_log (concept_id, state_id);
CREATE INDEX IF NOT EXISTS idx_sil_session ON state_interaction_log (session_id);
CREATE INDEX IF NOT EXISTS idx_sil_entered ON state_interaction_log (entered_at);

COMMENT ON TABLE state_interaction_log IS
  'Per-state interaction events fired by TeacherPlayer on STATE_REACHED postMessage. One row per state-entry per session. Comprehension Metric v1.';
COMMENT ON COLUMN state_interaction_log.session_id IS
  'Anonymous client-generated UUID persisted in localStorage. Same student across sessions = same UUID until they clear browser data.';
COMMENT ON COLUMN state_interaction_log.user_email IS
  'Nullable — populated only if student voluntarily provides email after MCQ.';

-- =============================================================================
-- 2. state_comprehension_quiz — MCQ bank authored alongside concept JSON
-- =============================================================================

CREATE TABLE IF NOT EXISTS state_comprehension_quiz (
  id BIGSERIAL PRIMARY KEY,
  concept_id TEXT NOT NULL,
  state_id TEXT NOT NULL,
  question_index INT NOT NULL,

  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'mcq_single',
  options JSONB NOT NULL,
  correct_explanation TEXT,
  difficulty TEXT DEFAULT 'medium',

  state_concept_tag TEXT NOT NULL,
  pyq_reference TEXT,
  weight NUMERIC NOT NULL DEFAULT 1.0,

  active BOOLEAN NOT NULL DEFAULT TRUE,
  authored_at TIMESTAMPTZ DEFAULT now(),
  authored_by TEXT,

  CONSTRAINT uq_quiz_concept_state_index UNIQUE (concept_id, state_id, question_index),
  CONSTRAINT chk_quiz_type CHECK (question_type IN ('mcq_single', 'mcq_multi', 'true_false')),
  CONSTRAINT chk_quiz_difficulty CHECK (difficulty IN ('easy', 'medium', 'hard'))
);

CREATE INDEX IF NOT EXISTS idx_scq_concept_active ON state_comprehension_quiz (concept_id) WHERE active;

COMMENT ON TABLE state_comprehension_quiz IS
  'MCQ bank. Synced from concept JSON `comprehension_quiz` field by `npm run seed:comprehension-quiz`. Comprehension Metric v1.';
COMMENT ON COLUMN state_comprehension_quiz.weight IS
  'PRIMARY-aha state questions carry weight=2.0; others 1.0. Drives weighted per-concept score.';
COMMENT ON COLUMN state_comprehension_quiz.options IS
  '[{"id":"A","text":"...","is_correct":true,"distractor_label":"common_mistake_X"}, ...] — distractor_label seeds Phase-2 misconception clustering.';

-- =============================================================================
-- 3. comprehension_attempt — student's quiz answers
-- =============================================================================

CREATE TABLE IF NOT EXISTS comprehension_attempt (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL,
  user_email TEXT,
  concept_id TEXT NOT NULL,
  state_id TEXT NOT NULL,
  question_id BIGINT NOT NULL REFERENCES state_comprehension_quiz(id),

  chosen_option TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_to_answer_ms INT,

  attempted_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ca_concept_state ON comprehension_attempt (concept_id, state_id);
CREATE INDEX IF NOT EXISTS idx_ca_session ON comprehension_attempt (session_id);
CREATE INDEX IF NOT EXISTS idx_ca_question ON comprehension_attempt (question_id);
CREATE INDEX IF NOT EXISTS idx_ca_attempted ON comprehension_attempt (attempted_at);

COMMENT ON TABLE comprehension_attempt IS
  'Student MCQ responses. One row per question answered. Comprehension Metric v1.';
COMMENT ON COLUMN comprehension_attempt.state_id IS
  'Denormalized from state_comprehension_quiz for fast per-state aggregation.';

-- =============================================================================
-- Notes for next migration (Day 6 — score rollup materialized view)
-- =============================================================================
-- See supabase_2026-05-24_comprehension_score_rollup_migration.sql for the
-- materialized view that computes state/concept/chapter scores from these
-- three base tables. That view depends on these tables existing first.
