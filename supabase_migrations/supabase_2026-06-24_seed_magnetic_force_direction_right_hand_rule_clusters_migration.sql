-- supabase_2026-06-24_seed_magnetic_force_direction_right_hand_rule_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 drill-down clusters for
-- magnetic_force_direction_right_hand_rule.json (Class 12 Ch.4 §4.2 — which WAY
-- the magnetic force points: the right-hand rule for F = q v × B. F is
-- perpendicular to BOTH v and B; the right hand picks which of the two
-- perpendicular sides; a negative charge flips the answer 180°; ⊗/⊙ map a flat
-- diagram back to the 3D hand; v∥B → F = 0). Authored 2026-06-24 by json_author
-- from the physics-author drill-down trigger phrasings (physics block §6).
--
-- Cluster placement:
--   STATE_4 (a negative charge reverses F by 180°) — 3 clusters
--   STATE_5 (⊗/⊙ into/out-of-page mapped to the 3D hand) — 3 clusters
--
-- STATE_4 and STATE_5 both carry allow_deep_dive: true in the JSON.
--
-- CUT-LINE GUARD: this concept teaches the DIRECTION of F = q v × B only —
-- the right-hand rule, the perpendicularity, the sign flip, the page-glyph
-- mapping, the v∥B zero-force edge. It does NOT teach the MAGNITUDE
-- F = qvB sin(theta), the circular-motion radius r = mv/qB, the period, or any
-- "how strong / how big / what is the formula" question; those belong to
-- magnetic_force_moving_charge, not here. The clusters below stay on direction,
-- the sign flip, and the flat-diagram-to-hand bridge only.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description,
--   trigger_examples, status, created_at, updated_at.
-- PRIMARY KEY is (cluster_id). ON CONFLICT (cluster_id) DO UPDATE so re-running
-- this migration re-syncs the label/description/triggers idempotently.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
(
  'negative_charge_force_reversal',
  'magnetic_force_direction_right_hand_rule',
  'STATE_4',
  'Why does the force point the opposite way for a negative charge?',
  'Student does not see why keeping v and B the same but making the charge negative turns the force a full 180 degrees, since the right-hand gesture itself did not change.',
  ARRAY[
    'why force opposite for negative charge',
    'negative charge force goes other way',
    'does the force reverse if charge is minus',
    'why does electron force flip 180',
    'minus charge same v same B but force opposite why'
  ],
  'active'
),
(
  'electron_vs_proton_same_vB',
  'magnetic_force_direction_right_hand_rule',
  'STATE_4',
  'Same v and B — do an electron and a proton feel the force the same way?',
  'Student is unsure whether a proton and an electron moving with the same velocity in the same field are pushed in the same direction or in opposite directions.',
  ARRAY[
    'proton and electron same v and B force same or not',
    'electron force vs proton force direction',
    'if i replace proton with electron does force change',
    'do electron and proton feel force in same direction',
    'same speed same field why proton goes one side electron other'
  ],
  'active'
),
(
  'which_step_to_reverse',
  'magnetic_force_direction_right_hand_rule',
  'STATE_4',
  'For a negative charge, what exactly do I change in the rule?',
  'Student knows the answer flips for a negative charge but does not know whether to switch to the left hand, curl the fingers the other way, or simply reverse the thumb at the end.',
  ARRAY[
    'for negative charge do i use left hand',
    'which step to reverse for electron in right hand rule',
    'do i flip the fingers or the thumb for negative charge',
    'should i curl fingers other way for negative charge',
    'what do i change in the rule for a negative charge'
  ],
  'active'
),
(
  'into_page_out_of_page_meaning',
  'magnetic_force_direction_right_hand_rule',
  'STATE_5',
  'What do the cross and dot symbols mean for the field direction?',
  'Student cannot read the ⊗ (cross in a circle) and ⊙ (dot in a circle) symbols — which one is the field going into the page and which is coming out toward you.',
  ARRAY[
    'what does cross in circle mean for field',
    'into the page out of the page meaning',
    'cross means field going where',
    'dot symbol vs cross symbol field direction',
    'is the cross field going into the page or coming out'
  ],
  'active'
),
(
  'flat_diagram_to_hand',
  'magnetic_force_direction_right_hand_rule',
  'STATE_5',
  'How do I use the right-hand rule on a flat textbook diagram?',
  'Student can do the rule in 3D space but cannot connect a flat into-the-page diagram to the right hand — how to hold the hand when the field points into the page.',
  ARRAY[
    'how to use right hand rule on a flat textbook diagram',
    'convert into page diagram to right hand',
    'how do i hold my hand when field is into the page',
    '2d diagram to 3d hand rule how',
    'cant connect the flat picture to the hand rule'
  ],
  'active'
),
(
  'force_in_page_plane',
  'magnetic_force_direction_right_hand_rule',
  'STATE_5',
  'When the field is into the page, where does the force point?',
  'Student has the velocity in the plane of the page and the field into the page, and is unsure whether the resulting force stays in the page plane and which way it points there.',
  ARRAY[
    'if field is into page where does force point',
    'force direction when B into the page',
    'v in the page B into page where is force',
    'does force stay in the page when field goes into page',
    'force on the screen plane when field is into page'
  ],
  'active'
)
ON CONFLICT (cluster_id) DO UPDATE
  SET concept_id       = EXCLUDED.concept_id,
      state_id         = EXCLUDED.state_id,
      label            = EXCLUDED.label,
      description      = EXCLUDED.description,
      trigger_examples = EXCLUDED.trigger_examples,
      status           = EXCLUDED.status,
      updated_at       = now();

-- Verify:
-- SELECT cluster_id, state_id FROM confusion_cluster_registry
--   WHERE concept_id = 'magnetic_force_direction_right_hand_rule' ORDER BY state_id, cluster_id;
-- Should return 6 rows (3 STATE_4, 3 STATE_5).
