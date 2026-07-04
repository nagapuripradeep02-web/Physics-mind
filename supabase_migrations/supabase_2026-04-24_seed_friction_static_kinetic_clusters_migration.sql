-- ============================================================================
-- SESSION 34: Confusion Cluster Registry — seed for friction_static_kinetic
-- To be applied via mcp__supabase__apply_migration
-- ----------------------------------------------------------------------------
-- Adds 6 cluster rows for friction_static_kinetic so the Haiku classifier can
-- resolve typed confusion phrases on STATE_3 (threshold) and STATE_5
-- (static-vs-kinetic comparison) to concrete drill-down sub-sims.
--
-- Produced by the physics_author → json_author handoff documented in
-- docs/concepts/friction_static_kinetic.notes.md §B5.
-- Mirrors the umbrella_tilt_angle / field_forces seed pattern from
-- supabase_2026-04-23_seed_umbrella_tilt_angle_clusters_migration.sql.
-- ============================================================================

INSERT INTO confusion_cluster_registry
    (cluster_id, concept_id, state_id, label, description, trigger_examples)
VALUES
    (
        'threshold_when_block_slips',
        'friction_static_kinetic',
        'STATE_3',
        'When does the block actually start to slip?',
        'Student wants the exact condition that makes the block slip, not just the formula.',
        ARRAY[
            'when does block start moving',
            'what F makes block slip',
            'how to find the slip point',
            'when does it become kinetic',
            'at what force does it move'
        ]
    ),
    (
        'static_friction_max_value',
        'friction_static_kinetic',
        'STATE_3',
        'What is the maximum value of static friction?',
        'Student knows static friction varies but is unclear about its ceiling.',
        ARRAY[
            'what is max static friction',
            'fs maximum value',
            'largest static friction can be',
            'static friction limit formula',
            'is fs always mu s times N'
        ]
    ),
    (
        'friction_force_direction_at_threshold',
        'friction_static_kinetic',
        'STATE_3',
        'Which way does friction point at the verge of slipping?',
        'Student confused about friction direction precisely at the threshold (about to slip but not yet sliding).',
        ARRAY[
            'friction direction when about to slip',
            'where does fs point at maximum',
            'is friction same direction at threshold',
            'fs direction just before slipping',
            'which way friction at slip point'
        ]
    ),
    (
        'static_kinetic_swap',
        'friction_static_kinetic',
        'STATE_5',
        'I confuse static and kinetic — which is which?',
        'Student mixes up the two regimes and the two coefficients.',
        ARRAY[
            'static and kinetic are same',
            'is mu s same as mu k',
            'what is difference between static kinetic',
            'kinetic friction less or more than static',
            'why two coefficients for friction'
        ]
    ),
    (
        'mu_s_vs_mu_k_value_relationship',
        'friction_static_kinetic',
        'STATE_5',
        'Which coefficient is bigger — μₛ or μₖ?',
        'Student unsure about the empirical inequality μₖ < μₛ.',
        ARRAY[
            'which is bigger mu s or mu k',
            'is kinetic friction smaller',
            'why mu k less than mu s',
            'are mu s and mu k always different',
            'mu k bigger than mu s possible'
        ]
    ),
    (
        'friction_after_motion_starts',
        'friction_static_kinetic',
        'STATE_5',
        'What happens to friction the moment the block starts moving?',
        'Student wants the physical story of the friction drop at the moment of slipping.',
        ARRAY[
            'friction reduces when moving',
            'what happens to friction once moving',
            'why pushing is easier once moving',
            'friction drops after slipping',
            'kinetic less than static why'
        ]
    )
ON CONFLICT (cluster_id) DO NOTHING;
