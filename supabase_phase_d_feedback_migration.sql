-- ============================================================================
-- Phase D — Session 18: Feedback log tables + auto-promotion plumbing
-- ----------------------------------------------------------------------------
-- Adds two per-vote log tables (deep_dive_feedback, drill_down_feedback) with
-- UNIQUE (cache_id, session_id) so one student/session can vote once per
-- cache row (upsert lets them change their mind). Counter columns on the
-- cache tables stay derived: the feedback API recounts from these logs and
-- overwrites positive_feedback_count / negative_feedback_count on every vote.
-- Auto-promotion logic lives in src/lib/autoPromotion.ts.
-- ============================================================================

-- ── 1. deep_dive_feedback ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deep_dive_feedback (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_id     UUID NOT NULL REFERENCES deep_dive_cache(id) ON DELETE CASCADE,
    session_id   TEXT NOT NULL,
    signal       TEXT NOT NULL CHECK (signal IN ('positive', 'negative')),
    created_at   TIMESTAMPTZ DEFAULT now(),
    updated_at   TIMESTAMPTZ DEFAULT now(),
    UNIQUE (cache_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_ddf_cache_id
    ON deep_dive_feedback (cache_id);
CREATE INDEX IF NOT EXISTS idx_ddf_cache_signal
    ON deep_dive_feedback (cache_id, signal);

ALTER TABLE deep_dive_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role full access ddf" ON deep_dive_feedback;
CREATE POLICY "service_role full access ddf"
    ON deep_dive_feedback FOR ALL
    USING (auth.role() = 'service_role');

-- ── 2. drill_down_feedback ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS drill_down_feedback (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_id     UUID NOT NULL REFERENCES drill_down_cache(id) ON DELETE CASCADE,
    session_id   TEXT NOT NULL,
    signal       TEXT NOT NULL CHECK (signal IN ('positive', 'negative')),
    created_at   TIMESTAMPTZ DEFAULT now(),
    updated_at   TIMESTAMPTZ DEFAULT now(),
    UNIQUE (cache_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_drdf_cache_id
    ON drill_down_feedback (cache_id);
CREATE INDEX IF NOT EXISTS idx_drdf_cache_signal
    ON drill_down_feedback (cache_id, signal);

ALTER TABLE drill_down_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role full access drdf" ON drill_down_feedback;
CREATE POLICY "service_role full access drdf"
    ON drill_down_feedback FOR ALL
    USING (auth.role() = 'service_role');
