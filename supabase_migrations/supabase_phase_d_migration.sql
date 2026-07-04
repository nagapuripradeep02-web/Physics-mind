-- ============================================================================
-- Phase D — Session 1: Deep-Dive + Drill-Down schema + cluster seed
-- Applied 2026-04-19 via mcp__supabase__apply_migration
-- ----------------------------------------------------------------------------
-- Adds four new tables (confusion_cluster_registry, deep_dive_cache,
-- drill_down_cache, feynman_attempts) and a cluster_id column on
-- student_confusion_log. Seeds six clusters for normal_reaction so the
-- Haiku classifier has real targets to match against.
-- ============================================================================

-- ── 1. confusion_cluster_registry ───────────────────────────────────────────
-- Pre-seeded semantic clusters of student confusion phrases. Haiku classifies
-- a typed phrase into one of these; cluster_id then keys drill_down_cache.
CREATE TABLE IF NOT EXISTS confusion_cluster_registry (
    cluster_id        TEXT PRIMARY KEY,
    concept_id        TEXT NOT NULL,
    state_id          TEXT NOT NULL,
    label             TEXT NOT NULL,
    description       TEXT,
    trigger_examples  TEXT[] DEFAULT '{}',
    status            TEXT DEFAULT 'active',
    created_at        TIMESTAMPTZ DEFAULT now(),
    updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ccr_concept_state
    ON confusion_cluster_registry (concept_id, state_id);

ALTER TABLE confusion_cluster_registry ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role full access ccr" ON confusion_cluster_registry;
CREATE POLICY "service_role full access ccr"
    ON confusion_cluster_registry FOR ALL
    USING (auth.role() = 'service_role');

-- ── 2. deep_dive_cache ──────────────────────────────────────────────────────
-- On-demand sub-simulations when a student clicks "Explain step-by-step".
-- 4D key: concept_id | state_id | class_level | mode.
CREATE TABLE IF NOT EXISTS deep_dive_cache (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fingerprint_key         TEXT UNIQUE NOT NULL,
    concept_id              TEXT NOT NULL,
    state_id                TEXT NOT NULL,
    class_level             TEXT,
    mode                    TEXT,
    sub_states              JSONB NOT NULL,
    teacher_script          JSONB,
    status                  TEXT DEFAULT 'pending_review',
    review_notes            TEXT,
    positive_feedback_count INT DEFAULT 0,
    negative_feedback_count INT DEFAULT 0,
    served_count            INT DEFAULT 0,
    generated_by            TEXT,
    model                   TEXT,
    created_at              TIMESTAMPTZ DEFAULT now(),
    updated_at              TIMESTAMPTZ DEFAULT now(),
    verified_at             TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ddc_concept_state
    ON deep_dive_cache (concept_id, state_id);
CREATE INDEX IF NOT EXISTS idx_ddc_pending
    ON deep_dive_cache (status) WHERE status = 'pending_review';

ALTER TABLE deep_dive_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role full access ddc" ON deep_dive_cache;
CREATE POLICY "service_role full access ddc"
    ON deep_dive_cache FOR ALL
    USING (auth.role() = 'service_role');

-- ── 3. drill_down_cache ─────────────────────────────────────────────────────
-- Confusion-targeted MICRO / LOCAL sub-sims. 5D key:
-- concept_id | state_id | cluster_id | class_level | mode.
CREATE TABLE IF NOT EXISTS drill_down_cache (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fingerprint_key         TEXT UNIQUE NOT NULL,
    concept_id              TEXT NOT NULL,
    state_id                TEXT NOT NULL,
    cluster_id              TEXT NOT NULL REFERENCES confusion_cluster_registry(cluster_id),
    class_level             TEXT,
    mode                    TEXT,
    sub_sim                 JSONB NOT NULL,
    protocol                TEXT,
    teacher_script          JSONB,
    status                  TEXT DEFAULT 'pending_review',
    review_notes            TEXT,
    positive_feedback_count INT DEFAULT 0,
    negative_feedback_count INT DEFAULT 0,
    served_count            INT DEFAULT 0,
    generated_by            TEXT,
    model                   TEXT,
    created_at              TIMESTAMPTZ DEFAULT now(),
    updated_at              TIMESTAMPTZ DEFAULT now(),
    verified_at             TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_drdc_concept_cluster
    ON drill_down_cache (concept_id, cluster_id);
CREATE INDEX IF NOT EXISTS idx_drdc_pending
    ON drill_down_cache (status) WHERE status = 'pending_review';

ALTER TABLE drill_down_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role full access drdc" ON drill_down_cache;
CREATE POLICY "service_role full access drdc"
    ON drill_down_cache FOR ALL
    USING (auth.role() = 'service_role');

-- ── 4. feynman_attempts ─────────────────────────────────────────────────────
-- Student explains a concept back; Sonnet grades against the concept JSON's
-- physics_engine_config + epic_c_branches. Table created now so the schema
-- is stable; logic ships in Phase G.
CREATE TABLE IF NOT EXISTS feynman_attempts (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id              TEXT,
    concept_id              TEXT NOT NULL,
    student_explanation     TEXT NOT NULL,
    accuracy_score          FLOAT,
    completeness_score      FLOAT,
    misconceptions_detected TEXT[],
    targeted_feedback       TEXT,
    grader_model            TEXT,
    created_at              TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fa_concept ON feynman_attempts (concept_id);
CREATE INDEX IF NOT EXISTS idx_fa_session ON feynman_attempts (session_id);

ALTER TABLE feynman_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role full access fa" ON feynman_attempts;
CREATE POLICY "service_role full access fa"
    ON feynman_attempts FOR ALL
    USING (auth.role() = 'service_role');

-- ── 5. student_confusion_log.cluster_id ─────────────────────────────────────
-- Added so every incoming confusion phrase can be retroactively tagged once
-- the classifier runs. Nullable: pre-existing 159 rows stay as NULL and can
-- be backfilled later.
ALTER TABLE student_confusion_log
    ADD COLUMN IF NOT EXISTS cluster_id TEXT;

CREATE INDEX IF NOT EXISTS idx_scl_cluster
    ON student_confusion_log (cluster_id);

-- ── 6. Seed clusters for normal_reaction ────────────────────────────────────
-- These match the drill_downs arrays declared in
-- src/data/concepts/normal_reaction.json on STATE_3 and STATE_5.
INSERT INTO confusion_cluster_registry
    (cluster_id, concept_id, state_id, label, description, trigger_examples)
VALUES
    (
        'why_mg_doesnt_tilt',
        'normal_reaction',
        'STATE_3',
        'Why does not gravity tilt with the surface?',
        'Student believes gravity should rotate with the incline, or expects mg to realign perpendicular to the tilted surface.',
        ARRAY[
            'why gravity does not tilt',
            'does not mg rotate with surface',
            'why is mg still vertical',
            'why does weight stay vertical on incline',
            'shouldnt mg tilt too'
        ]
    ),
    (
        'what_is_cos_doing_here',
        'normal_reaction',
        'STATE_3',
        'What does cos(theta) represent on the incline?',
        'Student does not understand why cosine shows up in N = mg cos(theta) and what geometric role it plays.',
        ARRAY[
            'what does cos theta mean',
            'why cos and not sin',
            'where did cos come from',
            'what does cosine do here',
            'why is there a cosine in N'
        ]
    ),
    (
        'how_to_decompose_mg',
        'normal_reaction',
        'STATE_3',
        'How do I split mg into components?',
        'Student is unsure how to project the weight vector onto surface-parallel and surface-perpendicular axes.',
        ARRAY[
            'how to decompose mg',
            'what are the two components of weight',
            'how do I find mg sin and mg cos',
            'how to break mg into parts',
            'how to split weight on incline'
        ]
    ),
    (
        'what_if_theta_90',
        'normal_reaction',
        'STATE_5',
        'What happens when theta = 90 degrees?',
        'Student is confused why N becomes zero on a vertical wall and what physical meaning this has.',
        ARRAY[
            'what if theta is 90',
            'vertical wall incline',
            'why does N become zero',
            'what happens at 90 degrees',
            'N at theta equal 90'
        ]
    ),
    (
        'how_do_i_remember_cos_vs_sin',
        'normal_reaction',
        'STATE_5',
        'How do I remember cos vs sin for N?',
        'Student keeps confusing which trigonometric function applies to N versus the along-slope component.',
        ARRAY[
            'cos or sin for normal',
            'always confuse cos and sin',
            'quick way to remember mg cos',
            'is it cos or sin for N',
            'how to remember which trig function'
        ]
    ),
    (
        'why_mg_is_not_in_formula',
        'normal_reaction',
        'STATE_5',
        'Why is plain mg not the answer on an incline?',
        'Student expects N = mg on all surfaces and does not see why the incline changes the formula.',
        ARRAY[
            'why not N = mg here',
            'what changes on incline',
            'how is N different from mg',
            'why is mg not N on incline',
            'where does mg go'
        ]
    )
ON CONFLICT (cluster_id) DO NOTHING;
