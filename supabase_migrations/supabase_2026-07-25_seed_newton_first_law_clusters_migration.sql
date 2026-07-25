-- supabase_2026-07-25_seed_newton_first_law_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 clusters (3 per has_prebuilt_deep_dive state)
-- for newton_first_law.json. Authored 2026-07-25 by alex:json_author per
-- architect skeleton §5/§6 + physics_author §5 (Laws of Motion, lom-b worktree).
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- Each trigger_examples array carries 5 real-student phrasings (lowercase, idiomatic,
-- no textbook prose) taken VERBATIM from the physics_author handoff. status='pending_review'
-- per cluster-registry convention.
--
-- TWO deep-dive states (architect §5, cross-referenced with the Pass-1 cliff sentences):
--   STATE_1 — frictionless coast (PRIMARY aha): 3 clusters
--     motion_needs_force_myth, frictionless_idealization, galileo_inclined_plane_argument
--   STATE_3 — rest equilibrium (SUPPORTING aha): 3 clusters
--     rest_means_no_forces, balanced_vs_zero_forces, net_force_vs_individual_forces
--
-- NOTE: this migration is authored but NOT applied here (json_author does not run
-- apply_migration). quality_auditor's pre-run step applies it.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_1 frictionless-coast deep-dive ─────────────────────────────
(
  'motion_needs_force_myth',
  'newton_first_law',
  'STATE_1',
  'Doesn''t something have to keep pushing it?',
  'Student holds the Aristotelian default: every object they have ever pushed eventually stopped, so they infer that sustaining motion requires a continuous force. Needs to see that the block''s velocity is unchanging with F_net = 0.00 the entire time — motion needs no force, only a CHANGE in motion does.',
  ARRAY[
    'why does it need force to keep going',
    'doesnt something have to keep pushing it',
    'why isnt there a force in the direction of motion',
    'wont it slow down eventually anyway',
    'how can it move with no force at all'
  ],
  'pending_review'
),
(
  'frictionless_idealization',
  'newton_first_law',
  'STATE_1',
  'Is there really a frictionless floor anywhere?',
  'Student questions whether the idealization is physically real anywhere, not just a textbook fiction. Needs the ice / air-track / space anchor: real surfaces approach frictionless as a limit, and deep space genuinely reaches it.',
  ARRAY[
    'is there really a frictionless floor anywhere',
    'where would you ever find zero friction',
    'is space actually frictionless',
    'why do we pretend friction is zero',
    'does ice count as frictionless'
  ],
  'pending_review'
),
(
  'galileo_inclined_plane_argument',
  'newton_first_law',
  'STATE_1',
  'What was Galileo''s ramp argument for this?',
  'Student wants the historical/logical derivation behind the law — the limiting-case reasoning (ball rolling down one ramp and up another, the second ramp flattened to horizontal) that led to inertia without ever reaching true zero friction experimentally.',
  ARRAY[
    'why did galileo use a ramp for this',
    'whats the ball rolling forever argument',
    'how did anyone prove this without space travel',
    'why cant you test this on earth directly',
    'what did galileo actually imagine happening'
  ],
  'pending_review'
),
-- ─── STATE_3 rest-equilibrium deep-dive ───────────────────────────────
(
  'rest_means_no_forces',
  'newton_first_law',
  'STATE_3',
  'If it''s not moving, aren''t there just no forces?',
  'Student equates zero motion with zero force, missing that weight and normal reaction are both large, real, and present at rest — they simply cancel. Needs the two full-length arrows (mg down, N up) with F_net pinned at 0.00.',
  ARRAY[
    'if its not moving arent there just no forces',
    'why would forces be there if nothing happens',
    'so at rest nothing is pushing on it right',
    'how can two forces be huge but do nothing',
    'doesnt zero motion mean zero force'
  ],
  'pending_review'
),
(
  'balanced_vs_zero_forces',
  'newton_first_law',
  'STATE_3',
  'How can mg and N cancel if they''re different things?',
  'Student is uneasy that two forces from different physical origins (gravity vs. contact) can sum to exactly zero. Needs the vector-sum framing: forces add as vectors regardless of origin, and equal-magnitude opposite-direction vectors sum to zero.',
  ARRAY[
    'how can mg and N cancel if theyre different things',
    'why dont the forces just add up instead',
    'if forces are equal why arent they zero individually',
    'why does the net force matter more than each force alone',
    'so the forces are still fighting each other'
  ],
  'pending_review'
),
(
  'net_force_vs_individual_forces',
  'newton_first_law',
  'STATE_3',
  'Why does only the total force decide motion?',
  'Student has not internalized that Newton''s first law speaks about the NET (vector sum) force, not any individual force in isolation. Needs the mass-independence demo (dragging m rescales both mg and N together, F_net always 0.00) as the concrete counter-example.',
  ARRAY[
    'why only the total force decides motion',
    'what if one force is huge but net is small',
    'why doesnt mg alone move the block down',
    'does every force count separately for motion',
    'why do we add forces before deciding what happens'
  ],
  'pending_review'
)
ON CONFLICT (cluster_id) DO UPDATE
SET concept_id        = EXCLUDED.concept_id,
    state_id          = EXCLUDED.state_id,
    label             = EXCLUDED.label,
    description       = EXCLUDED.description,
    trigger_examples  = EXCLUDED.trigger_examples,
    status            = EXCLUDED.status,
    updated_at        = now();
