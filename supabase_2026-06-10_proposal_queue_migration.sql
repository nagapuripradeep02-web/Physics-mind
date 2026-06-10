-- ============================================================================
-- 2026-06-10: proposal_queue migration
-- ----------------------------------------------------------------------------
-- Creates the proposal_queue table — the human-approval gate of the Part-2
-- improvement loop (Session 59 two-loop architecture; FULL BUILD plan,
-- founder-approved 2026-06-10).
--
-- Schema is the exact design from .agents/feedback_collector/CLAUDE.md
-- ("Output contract" section, Phase-I work). The Tier-8 nightly agents
-- (Collector / Clusterer / Proposer / Auto-Promoter) that WRITE proposals
-- stay deferred until real students exist; this migration ships the table +
-- the founder-approval surface first so the hard floor (CLAUDE.md Rule 17/18:
-- every learned change is an offline, reviewable, human-gated artifact) has a
-- physical home before any writer exists.
--
-- Approval UI: /admin/proposals (page + POST /api/admin/proposals).
--
-- Idempotent: CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS.
-- ============================================================================

CREATE TABLE IF NOT EXISTS proposal_queue (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kind           TEXT NOT NULL
        CHECK (kind IN ('new_cluster', 'archive_cluster', 'flag_sub_sim',
                        'engine_config_delta', 'concept_json_edit')),
    concept_id     TEXT NOT NULL,
    state_id       TEXT,
    payload        JSONB NOT NULL,  -- proposed row or action
    evidence       JSONB NOT NULL,  -- raw phrases, rating trends, sample session_ids
    confidence     NUMERIC
        CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
    status         TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewer       TEXT,
    decided_at     TIMESTAMPTZ,
    decision_notes TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The approval UI lists pending proposals newest-first.
CREATE INDEX IF NOT EXISTS idx_proposal_queue_status_created
    ON proposal_queue (status, created_at DESC);

-- ── Notes ─────────────────────────────────────────────────────────────────────
-- * kind values: the 3 original Tier-8 kinds (new_cluster / archive_cluster /
--   flag_sub_sim) + 2 forward-declared kinds from CLAUDE.md "The Learning
--   Model" (engine_config_delta for meaning-2 engine-default tuning,
--   concept_json_edit for content proposals). Widening later = one CHECK swap.
-- * No RLS: table is server-side only (supabaseAdmin), same posture as
--   engine_bug_queue.
--
-- ── Verification (do not execute — for documentation) ────────────────────────
--   SELECT count(*) FROM proposal_queue;                          -> 0
--   INSERT a test row, approve via /admin/proposals, verify status flip,
--   then DELETE the test row.
