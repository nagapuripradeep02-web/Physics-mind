-- PhysicsMind Phase 2 Migration
-- Run this in Supabase SQL Editor before starting Phase 2

-- ── Pre-requisite fixes (Section 8.1) ────────────────────────────────────────
ALTER TABLE response_cache ALTER COLUMN query_keywords DROP NOT NULL;
ALTER TABLE response_cache ALTER COLUMN query_normalized DROP NOT NULL;

-- Clear stale simulation cache entries from old pipeline versions
DELETE FROM simulation_cache
WHERE pipeline_version IS NULL OR pipeline_version != 'v3';

-- ── Stage 3A/3B Fix: clear ALL cached simulations ──────────────────────────
-- Old cached sims lack the PhysicsMind Sync API (SIM_READY / SET_STATE).
-- Force fresh generation with the new Stage 3A/3B pipeline.
-- Run this AFTER deploying the code with the new Stage 3A/3B prompt.
DELETE FROM simulation_cache
WHERE sim_html IS NOT NULL
  AND sim_html NOT LIKE '%SIM_READY%';

-- ── Setup crash fix: clear cached sims that crash in p.setup ───────────────
-- Old sims have complex nested PhysicsConfig objects that cause
-- "Cannot read properties of undefined (reading 'type')" in p.setup.
-- Clear ALL cached sims to force regeneration with sanitized configs.
-- Run this AFTER deploying the sanitizePhysicsConfig + safety wrapper fix.
DELETE FROM simulation_cache
WHERE pipeline_version = 'v3';

-- ── Phase 2A: Physics Concept Map table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS physics_concept_map (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  concept_id TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  class_level TEXT NOT NULL,          -- "10", "11", "12", "11-12"
  chapter TEXT NOT NULL,
  subject TEXT DEFAULT 'physics',
  formula TEXT,                        -- Primary formula string
  formula_latex TEXT,                  -- LaTeX version for rendering
  variables JSONB,                     -- Each variable with metadata
  what_if_rules JSONB,                 -- Array of cause-effect strings
  why_rules JSONB,                     -- Array of reasoning strings
  misconceptions JSONB,                -- Common wrong beliefs
  connected_concepts TEXT[],           -- Array of related concept_ids
  confusion_patterns JSONB,            -- Phase 2C: confusion pattern array
  visualization_type TEXT,             -- particle_flow, wave, graph, etc
  simulation_emphasis TEXT,            -- What simulation MUST show
  simulation_states JSONB,             -- Phase 2D: named states for sync
  exam_relevance TEXT[],               -- ["JEE_Mains","NEET","CBSE"]
  difficulty TEXT,                     -- "basic","intermediate","advanced"
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fast lookup indexes
CREATE INDEX IF NOT EXISTS idx_concept_map_id ON physics_concept_map(concept_id);
CREATE INDEX IF NOT EXISTS idx_concept_map_chapter
  ON physics_concept_map(chapter, class_level);

-- ── Phase 2E: Simulation feedback table ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS simulation_feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text,
  concept_id text,
  confusion_pattern_id text,   -- which confusion was detected
  student_rating text,         -- "confused","neutral","clear","great"
  interaction_data JSONB,      -- slider events, time per state
  was_confusion_correct bool,  -- did sim address actual confusion?
  sim_html_length int,         -- for debugging quality
  created_at timestamptz DEFAULT now()
);
