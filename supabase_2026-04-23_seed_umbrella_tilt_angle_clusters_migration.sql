-- ============================================================================
-- SESSION 32: Confusion Cluster Registry — seed for umbrella_tilt_angle
-- To be applied via mcp__supabase__apply_migration
-- ----------------------------------------------------------------------------
-- Adds 6 cluster rows for umbrella_tilt_angle so the Haiku classifier can
-- resolve typed confusion phrases on STATE_3 (reference-frame shift) and
-- STATE_5 (arctan formula) to concrete drill-down sub-sims.
--
-- Produced by the physics_author → json_author handoff documented in
-- .agents/proof_run/umbrella_tilt_angle_skeleton.md §4.
-- Mirrors the field_forces / vector_resolution seed pattern from
-- supabase_phase_e_seed_clusters_migration.sql.
-- ============================================================================

INSERT INTO confusion_cluster_registry
    (cluster_id, concept_id, state_id, label, description, trigger_examples)
VALUES
    (
        'why_change_frame',
        'umbrella_tilt_angle',
        'STATE_3',
        'Why do I need to leave the ground frame?',
        'Student does not see why a frame shift is necessary; wants to stay in the ground frame.',
        ARRAY[
            'why do i look from my own perspective',
            'why change frames',
            'whats wrong with ground frame',
            'why not just use the ground frame',
            'why go into my own frame'
        ]
    ),
    (
        'what_does_apparent_mean',
        'umbrella_tilt_angle',
        'STATE_3',
        'Is apparent velocity real or imagined?',
        'Student questions whether the slanted rain in the person''s frame is physically real or just a math trick.',
        ARRAY[
            'is apparent velocity real',
            'does the rain actually move forward',
            'is apparent real or imagined',
            'whats the point of apparent velocity',
            'is rain really hitting me from front'
        ]
    ),
    (
        'rain_direction_in_both_frames',
        'umbrella_tilt_angle',
        'STATE_3',
        'How can rain have two directions at once?',
        'Student struggles with the same rain appearing vertical from outside but slanted in the person''s frame.',
        ARRAY[
            'whats the rain direction in my frame',
            'how does rain look different in two frames',
            'rain direction changes',
            'why rain slanted in my frame but vertical from outside',
            'same rain two directions how'
        ]
    ),
    (
        'why_tan_not_sin_or_cos',
        'umbrella_tilt_angle',
        'STATE_5',
        'Why tan specifically, not sin or cos?',
        'Student knows trig functions but is unclear why arctan is the right choice for this ratio of components.',
        ARRAY[
            'why tan not sin',
            'why not sin or cos',
            'when to use tan and when to use sin',
            'why is it tan here',
            'why not use cos theta'
        ]
    ),
    (
        'what_angle_is_this_exactly',
        'umbrella_tilt_angle',
        'STATE_5',
        'What does theta measure exactly?',
        'Student is unsure whether theta is measured from vertical or horizontal, and between which two vectors.',
        ARRAY[
            'tilt of what from what',
            'angle between what two things',
            'what is theta here exactly',
            'is it angle from vertical or horizontal',
            'which side is the angle measured from'
        ]
    ),
    (
        'why_ratio_not_sum',
        'umbrella_tilt_angle',
        'STATE_5',
        'Why divide v_person by v_rain, not add them?',
        'Student wants to add velocities (arithmetic intuition) instead of treating them as perpendicular vector components.',
        ARRAY[
            'why divide not add',
            'why not v_rain + v_person',
            'why ratio instead of sum',
            'why v_person over v_rain',
            'why not velocity sum 9'
        ]
    )
ON CONFLICT (cluster_id) DO NOTHING;
