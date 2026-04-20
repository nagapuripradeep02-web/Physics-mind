-- ============================================================
-- Combined cleanup + migrations — run in Supabase SQL Editor
-- Issues 1-4 from post-test audit
-- ============================================================

-- ── ISSUE 1: Delete poisoned lesson_cache entry ──────────────
-- fingerprint_key 'unknown|understand|12|conceptual|none' was cached
-- from a test where concept resolved to 'unknown'. Will serve wrong
-- content to future students matching this key.
DELETE FROM lesson_cache
WHERE fingerprint_key = 'unknown|understand|12|conceptual|none';

-- Also clean any response_cache / simulation_cache with unknown concept
DELETE FROM response_cache
WHERE fingerprint_key LIKE 'unknown|%';

DELETE FROM simulation_cache
WHERE fingerprint_key LIKE 'unknown|%';

-- Verify:
-- SELECT * FROM lesson_cache WHERE fingerprint_key LIKE 'unknown|%';
-- Should return 0 rows.


-- ── ISSUE 2: Add vector_addition to concept_panel_config ─────
-- Routes vector_addition to mechanics_2d renderer instead of
-- falling back to particle_field.
INSERT INTO concept_panel_config
  (concept_id, panel_a_renderer, technology_a,
   default_panel_count, class_level, chapter,
   sync_required, verified_by_human)
VALUES
  ('vector_addition', 'mechanics_2d', 'canvas2d',
   1, '11', 'Vectors', false, false)
ON CONFLICT (concept_id) DO UPDATE SET
  panel_a_renderer = EXCLUDED.panel_a_renderer,
  technology_a = EXCLUDED.technology_a,
  default_panel_count = EXCLUDED.default_panel_count,
  class_level = EXCLUDED.class_level,
  chapter = EXCLUDED.chapter;

-- Verify:
-- SELECT * FROM concept_panel_config WHERE concept_id = 'vector_addition';
-- Should return 1 row with panel_a_renderer = 'mechanics_2d'.


-- ── ISSUE 3: Create concept_routing_signals table ────────────
-- Stores per-concept routing overrides: trigger phrases that
-- force specific scope/simulation_needed values.
CREATE TABLE IF NOT EXISTS concept_routing_signals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  concept_id text UNIQUE NOT NULL,
  trigger_phrases text[] DEFAULT '{}',
  default_scope text DEFAULT 'local' CHECK (default_scope IN ('micro', 'local', 'global')),
  default_simulation_needed boolean DEFAULT true,
  force_scope text CHECK (force_scope IS NULL OR force_scope IN ('micro', 'local', 'global')),
  force_simulation_needed boolean,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_routing_signals_concept_id
ON concept_routing_signals (concept_id);

CREATE INDEX IF NOT EXISTS idx_routing_signals_trigger_phrases
ON concept_routing_signals USING GIN (trigger_phrases);


-- ── ISSUE 4: Clean stale expired sessions ────────────────────
-- 18 dead sessions from testing with concepts_covered = null
-- and simulation_shown = false. Safe to remove.
DELETE FROM session_context
WHERE expires_at < NOW();

-- Verify:
-- SELECT COUNT(*) FROM session_context WHERE expires_at < NOW();
-- Should return 0.


-- ── PRE-REQ: Ensure concepts_covered column exists ───────────
-- (from supabase_session_concepts_migration.sql — may not have been run)
ALTER TABLE session_context
ADD COLUMN IF NOT EXISTS concepts_covered text[] DEFAULT '{}';

ALTER TABLE session_context
ADD COLUMN IF NOT EXISTS simulation_shown boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_session_context_concepts_covered
ON session_context USING GIN (concepts_covered);
