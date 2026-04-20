-- Migration: Add concepts_covered to session_context
-- Tracks which concepts have had simulations generated in this session.
-- Used by the session-aware simulation skip gate.

ALTER TABLE session_context
ADD COLUMN IF NOT EXISTS concepts_covered text[] DEFAULT '{}';

-- Index for efficient array containment check
CREATE INDEX IF NOT EXISTS idx_session_context_concepts_covered
ON session_context USING GIN (concepts_covered);
