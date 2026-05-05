-- ============================================================================
-- PHASE E: Confusion Cluster Registry — seed for retrofitted gold-standards
-- Applied 2026-04-22 via mcp__supabase__apply_migration (session 30.7)
-- ----------------------------------------------------------------------------
-- Adds 6 cluster rows for two of the nine retrofitted concepts so their
-- "Confused?" drill-down flow actually resolves to a cluster_id at runtime.
-- Mirrors the normal_reaction seed pattern from supabase_phase_d_migration.sql.
--
-- Concepts seeded here:
--   field_forces       STATE_3 — gravitational field
--   vector_resolution  STATE_8 — rotated-axes resolution on incline
--
-- Six other retrofitted concepts (contact_forces, tension_in_string,
-- free_body_diagram, hinge_force, resultant_formula, direction_of_resultant)
-- still have zero registry rows and are deferred to a later sweep.
-- ============================================================================

INSERT INTO confusion_cluster_registry
    (cluster_id, concept_id, state_id, label, description, trigger_examples)
VALUES
    (
        'does_gravity_need_medium',
        'field_forces',
        'STATE_3',
        'Does gravity need air or some medium to travel?',
        'Student suspects the gravitational pull needs a substance to propagate, like sound through air.',
        ARRAY[
            'does gravity need air',
            'how does gravity travel through space',
            'does gravity need a medium',
            'what carries the gravity force',
            'gravity in vacuum still works'
        ]
    ),
    (
        'field_only_one_way',
        'field_forces',
        'STATE_3',
        'Does only Earth pull the mango, or does the mango also pull Earth?',
        'Student misses the mutual nature of gravitational interaction; thinks the field is one-directional.',
        ARRAY[
            'does the mango pull earth too',
            'is gravity one way only',
            'why dont we pull the earth',
            'mutual gravitational pull',
            'newton third law for gravity'
        ]
    ),
    (
        'gravity_only_for_big_things',
        'field_forces',
        'STATE_3',
        'Does gravity only act on big objects like planets?',
        'Student believes gravity is reserved for cosmic scales and underestimates that every mass creates its own field.',
        ARRAY[
            'does small mass have gravity',
            'is gravity only for planets',
            'do humans have gravity',
            'why dont small objects pull each other',
            'is gravity only for big things'
        ]
    ),
    (
        'why_rotate_axes',
        'vector_resolution',
        'STATE_8',
        'Why rotate the axes instead of using horizontal and vertical?',
        'Student does not see why we abandon the standard horizontal-vertical axes for the tilted incline frame.',
        ARRAY[
            'why rotate the axes',
            'why not use x and y',
            'whats wrong with horizontal vertical axes',
            'why pick incline axes',
            'why not normal axes here'
        ]
    ),
    (
        'mg_along_vs_mg_perp',
        'vector_resolution',
        'STATE_8',
        'Which mg component drives sliding and which presses into the surface?',
        'Student confuses which projection of weight produces the down-slope motion versus the contact force into the surface.',
        ARRAY[
            'which component pulls block down',
            'is mg sin theta along or perpendicular',
            'why mg cos goes into surface',
            'how do mg sin and mg cos differ',
            'which one is the sliding force'
        ]
    ),
    (
        'which_axes_to_pick',
        'vector_resolution',
        'STATE_8',
        'How do I decide which axes to choose for any problem?',
        'Student wants a rule for picking the rotated axes — when to align with motion, when to keep horizontal-vertical.',
        ARRAY[
            'how do i pick the axes',
            'when to rotate the axes',
            'rule for choosing axes',
            'how do i know which direction to align axes',
            'which axes for projectile vs incline'
        ]
    )
ON CONFLICT (cluster_id) DO UPDATE
    SET concept_id       = EXCLUDED.concept_id,
        state_id         = EXCLUDED.state_id,
        label            = EXCLUDED.label,
        description      = EXCLUDED.description,
        trigger_examples = EXCLUDED.trigger_examples,
        status           = 'active',
        updated_at       = now();
