-- ============================================================================
-- 2026-04-25 (session 36): engine_bug_queue schema migration
-- ----------------------------------------------------------------------------
-- Durable structured storage for every bug class surfaced during PhysicsMind
-- concept authoring. One row per bug CLASS (not per occurrence). Each row
-- carries:
--   * the prevention_rule that authoring agents (architect/physics_author/
--     json_author) read BEFORE producing artifacts;
--   * the probe_logic that quality_auditor runs as Gate 8 BEFORE approving
--     any new concept;
--   * the historical surface area in concepts_affected (cross-concept blast
--     radius for engine bugs that infect every PCPL concept).
--
-- Replaces the markdown bug-tagging convention documented in
-- .agents/peter_parker/OVERVIEW.md "Migration path to Phase I tables" — every
-- markdown owner-tagged bug becomes one row here.
--
-- See plan: ~/.claude/plans/please-plan-thoroughly-regarding-distributed-squirrel.md
-- ============================================================================

CREATE TABLE IF NOT EXISTS engine_bug_queue (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bug_class              TEXT NOT NULL UNIQUE,
    title                  TEXT NOT NULL,
    severity               TEXT NOT NULL
                            CHECK (severity IN ('CRITICAL','MAJOR','MODERATE')),
    owner_cluster          TEXT NOT NULL
                            CHECK (owner_cluster IN (
                                'alex:architect',
                                'alex:physics_author',
                                'alex:json_author',
                                'peter_parker:renderer_primitives',
                                'peter_parker:runtime_generation',
                                'ambiguous'
                            )),
    root_cause             TEXT NOT NULL,
    prevention_rule        TEXT NOT NULL,
    probe_type             TEXT NOT NULL
                            CHECK (probe_type IN ('sql','js_eval','manual')),
    probe_logic            TEXT NOT NULL,
    status                 TEXT NOT NULL DEFAULT 'OPEN'
                            CHECK (status IN ('OPEN','FIXED','DEFERRED','NOT_REPRODUCING')),
    concepts_affected      TEXT[] NOT NULL DEFAULT '{}',
    fixed_in_files         TEXT[] NOT NULL DEFAULT '{}',
    discovered_in_session  TEXT,
    fixed_at               TIMESTAMPTZ,
    created_at             TIMESTAMPTZ DEFAULT now(),
    updated_at             TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ebq_status            ON engine_bug_queue(status);
CREATE INDEX IF NOT EXISTS idx_ebq_owner_cluster     ON engine_bug_queue(owner_cluster);
CREATE INDEX IF NOT EXISTS idx_ebq_probe_type        ON engine_bug_queue(probe_type);
CREATE INDEX IF NOT EXISTS idx_ebq_bug_class         ON engine_bug_queue(bug_class);
CREATE INDEX IF NOT EXISTS idx_ebq_concepts_affected ON engine_bug_queue USING GIN(concepts_affected);

ALTER TABLE engine_bug_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role full access ebq" ON engine_bug_queue;
CREATE POLICY "service_role full access ebq"
    ON engine_bug_queue FOR ALL
    USING (auth.role() = 'service_role');

-- Verification queries (do not execute — for documentation):
--   SELECT column_name, data_type FROM information_schema.columns
--     WHERE table_name = 'engine_bug_queue' ORDER BY ordinal_position;
--     -> 14 rows
--   SELECT polname FROM pg_policies WHERE tablename = 'engine_bug_queue';
--     -> 'service_role full access ebq'
