-- supabase_2026-07-24_seed_resultant_direction_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 clusters for resultant_direction.json —
-- concept #3 of the Class 11 Mechanics Ch.1 "Vectors" DAG track
-- (chapter:1, section:"1.3", prerequisites:["vector_addition_law"]). Authored
-- on the mechanics_2d (parametric_renderer / PCPL) family, matching
-- scalar_vs_vector/vector_addition_law/current_not_vector/pressure_scalar.
--
-- Authored 2026-07-24 by alex:json_author, using the physics_author's
-- drill-down trigger phrases VERBATIM (STATE_2: why_b_splits_sin_cos,
-- shadow_negative_past_90, is_this_vector_resolution — STATE_5:
-- resultant_perpendicular_to_a, theta_180_direction_flip,
-- max_lean_when_b_smaller).
--
-- Migration is AUTHORED, NOT APPLIED — quality_auditor's pre-run step
-- applies it (json_author is forbidden from apply_migration). Drill-down
-- itself is DEFERRED (Rule 18, 2026-06-10 directive) — the
-- confusion_cluster_registry Gate-8 probe is N/A-DORMANT this phase per the
-- documented false-FAIL scar (memory: auditor-cluster-registry-false-fail).
-- Do not let the auditor re-route json_author to "fix" this.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- status='pending_review' per the current cluster-registry convention.
--
-- has_prebuilt_deep_dive: true is tagged (metadata only, Rule 18) on
-- STATE_2 and STATE_5 in the concept JSON itself, referencing these
-- cluster_ids via each state's drill_downs array.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_2 why_b_splits_sin_cos deep-dive ────────────────────────────
(
  'why_b_splits_sin_cos',
  'resultant_direction',
  'STATE_2',
  'Why is one part sin theta and the other cos theta?',
  'Student cannot see why the along-A projection gets cos theta while the across-A projection gets sin theta (or worries it should be the other way round). Read it off the drop triangle itself: theta is the angle at the START of B, between B and A''s own direction. The side ADJACENT to theta (touching the angle, running along A) is B cos theta — cosine always names the side hugging the angle. The side OPPOSITE theta (across, the perpendicular drop) is B sin theta — sine always names the side facing away from the angle. It is the same SOH-CAH-TOA read used on every right triangle, just applied to the triangle B itself forms with its own shadow.',
  ARRAY[
    'why is one part sin and the other cos',
    'how do you know which side gets sin and which gets cos',
    'why does the up part use sin theta',
    'isnt it supposed to be the other way, cos for up and sin for along',
    'why split B into two pieces at all'
  ],
  'pending_review'
),
-- ─── STATE_2 shadow_negative_past_90 deep-dive ─────────────────────────
(
  'shadow_negative_past_90',
  'resultant_direction',
  'STATE_2',
  'Can the along part (B cos theta) ever be negative?',
  'Student assumes a length-like quantity can never be negative. B cos theta is not B''s own length — it is B''s SIGNED projection onto A''s direction, and a projection can absolutely point backward. Once theta passes 90 degrees, B tips past perpendicular to A and its shadow falls BEHIND A''s tail instead of ahead of it; cos theta itself turns negative there, and the shadow arrow genuinely reverses direction on screen. The base of the triangle, A + B cos theta, can then shrink, hit zero, or even go negative — every one of those is correct physics, not a sign error to "fix".',
  ARRAY[
    'can the along part be negative',
    'what does negative B cos theta even mean',
    'why does the shadow point backward after 90 degrees',
    'does the base go negative if theta is more than 90',
    'how can a length be negative'
  ],
  'pending_review'
),
-- ─── STATE_2 is_this_vector_resolution deep-dive ───────────────────────
(
  'is_this_vector_resolution',
  'resultant_direction',
  'STATE_2',
  'Is dropping this perpendicular the same thing as resolving a vector into components?',
  'Student notices the drop-and-split looks exactly like resolving a force into x and y components and wonders if it is the same topic. It previews the IDEA (any vector can be split into a part along a chosen direction and a part across it) but is not the general skill: here the "axis" is always vector A itself, chosen because A is the reference this whole concept measures angles from, and the goal is a one-off angle calculation, not a reusable x/y coordinate system for solving forces, tensions, or Newton''s law problems. General resolution onto arbitrary x/y axes is its own, separate concept — this is a narrower, purpose-built application of the same underlying trick.',
  ARRAY[
    'is this the same as resolving a vector into components',
    'isnt this just splitting a vector like we did for forces',
    'why is this not called component resolution',
    'so B cos theta and B sin theta are just components right',
    'is dropping the perpendicular the same thing as resolving along axes'
  ],
  'pending_review'
),
-- ─── STATE_5 resultant_perpendicular_to_a deep-dive ────────────────────
(
  'resultant_perpendicular_to_a',
  'resultant_direction',
  'STATE_5',
  'When is the resultant exactly perpendicular to A?',
  'Student has seen alpha reach 90 degrees on the sweep and wants the general condition, not just the one demonstrated number. R is perpendicular to A exactly when the base (A + B cos theta) is zero — because with zero along-component left, the resultant is built ENTIRELY from the across (B sin theta) piece, which by construction always points perpendicular to A. Setting the base to zero gives cos theta = −A/B, which only has a solution when B is at least as large as A (cosine cannot go below −1) — a genuine JEE staple condition, not a coincidence tied to any particular pair of numbers.',
  ARRAY[
    'when is the resultant exactly perpendicular to A',
    'what angle makes R perpendicular to A',
    'how do you find theta so that R is at 90 to A',
    'does R ever point straight up from A',
    'whats special when cos theta equals minus A over B'
  ],
  'pending_review'
),
-- ─── STATE_5 theta_180_direction_flip deep-dive ────────────────────────
(
  'theta_180_direction_flip',
  'resultant_direction',
  'STATE_5',
  'Why does alpha jump to 0 or 180 degrees when the vectors point opposite ways?',
  'Student expects a smooth, gradual change in alpha all the way to theta = 180 degrees and is surprised the resultant''s direction seems to "snap". Nothing actually snaps — at theta = 180 degrees the two vectors are exactly opposite, so the resultant collapses to a single straight line: |A − B| pointing along whichever of A or B is longer. If B is the bigger vector, R ends up pointing along B, meaning alpha closes in on theta itself (both equal 180 degrees); if A is bigger, R points along A, so alpha closes in on 0 degrees instead. The apparent jump is really alpha continuously approaching one of these two limits as theta sweeps toward 180, decided entirely by which vector is longer.',
  ARRAY[
    'why does alpha jump to 180 at theta 180',
    'why does the direction flip when the vectors are opposite',
    'at 180 degrees which way does R point',
    'does alpha become 0 or 180 when vectors are opposite',
    'why does R suddenly point along B instead of A'
  ],
  'pending_review'
),
-- ─── STATE_5 max_lean_when_b_smaller deep-dive ─────────────────────────
(
  'max_lean_when_b_smaller',
  'resultant_direction',
  'STATE_5',
  'Whats the biggest angle R can lean away from A, when B is the smaller vector?',
  'Student wants a general maximum-lean formula, distinct from the perpendicular-to-A condition (a different, easily-confused special case). When B is smaller than A, alpha cannot grow without bound as theta increases — it climbs to a genuine PEAK and then falls back. That peak occurs at cos theta = −B/A (only defined, and only reachable, when B is smaller than A), and the peak value itself satisfies sin(alpha_max) = B/A — a classic competitive-exam result, and a DIFFERENT formula from the perpendicular-to-A condition''s cos theta = −A/B. Confusing the two is the most common slip: this one needs B smaller than A and gives the LARGEST possible lean, not R sitting at exactly 90 degrees to A.',
  ARRAY[
    'whats the biggest angle R can lean by',
    'is there a maximum value for alpha',
    'how far can R tilt away from A if B is small',
    'whats the formula for the maximum lean angle',
    'why cant alpha ever reach 90 when B is smaller than A'
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


-- ============================================================
-- resultant_direction — concept_panel_config routing row
-- (authored-not-applied; quality_auditor's pre-run step applies this
-- migration — see the header note above. Mirrors
-- supabase_2026-07-24_seed_vector_addition_law_panel_config_migration.sql
-- exactly, which was itself applied via
-- src/scripts/_insert_vector_addition_law_panel_config.ts using
-- supabaseAdmin, since the Supabase MCP needs interactive OAuth and won't
-- run headless — see reference_visual_gate_ops memory).
-- ============================================================
--
-- WHY: jsonModifier.ts fetchTechnologyConfig() (~lines 79-99) reads
-- concept_panel_config.default_panel_count FIRST. resultant_direction's
-- JSON declares renderer_pair.panel_b = "graph_interactive" with no
-- panel_b_config ever authored (Panel B is NOT rendered for this concept)
-- — so without this row, generateSimulation() would route it dual-panel,
-- hit the runStage2() Sonnet call, and crash whenever the LLM call fails
-- (exactly the scalar_vs_vector_missing_panel_config_row defect class that
-- already bit scalar_vs_vector and vector_addition_law in this same DAG
-- track).
--
-- FIX: default_panel_count = 1 makes `panelCount > 1` false, so the entire
-- dual-panel block is skipped. Execution falls through to the
-- "strict-engines bypass" → PCPL_CONCEPTS.has('resultant_direction')
-- (aiSimulationGenerator.ts PCPL_CONCEPTS set) → assembleParametricHtml(),
-- zero-LLM. panel_a_renderer/technology_a values below are NOT what
-- selects that path (PCPL_CONCEPTS membership is) — they mirror the
-- concept's own JSON renderer_pair.panel_a ("mechanics_2d") and the direct
-- parent row (vector_addition_law — same "Vectors" DAG track, identical
-- renderer_pair shape, same missing-panel_b_config defect fixed this exact
-- way).
--
-- Rule 18 unaffected: this only changes generation-time routing (Sonnet
-- Stage 2 is never invoked either way for the PCPL bypass path); serving
-- stays zero-LLM/cache-first in both cases.

INSERT INTO concept_panel_config
  (concept_id, default_panel_count, panel_a_renderer, panel_b_renderer,
   panel_c_renderer, sonnet_can_upgrade, upgrade_max, verified_by_human,
   reasoning, technology_a, technology_b, sync_required, class_level, chapter)
VALUES
  ('resultant_direction', 1, 'mechanics_2d', NULL,
   NULL, false, 1, false,
   'Same defect class as scalar_vs_vector_missing_panel_config_row / vector_addition_law''s own row: JSON renderer_pair.panel_b="graph_interactive" has no panel_b_config authored, which would crash the dual-panel Stage-2 Sonnet path. default_panel_count=1 forces the zero-LLM single-panel PCPL bypass (PCPL_CONCEPTS membership) instead — mirrors scalar_vs_vector, vector_addition_law, current_not_vector, pressure_scalar.',
   'p5js', NULL, false, 11, '1')
ON CONFLICT (concept_id) DO UPDATE SET
  default_panel_count = EXCLUDED.default_panel_count,
  panel_a_renderer = EXCLUDED.panel_a_renderer,
  panel_b_renderer = EXCLUDED.panel_b_renderer,
  panel_c_renderer = EXCLUDED.panel_c_renderer,
  sonnet_can_upgrade = EXCLUDED.sonnet_can_upgrade,
  upgrade_max = EXCLUDED.upgrade_max,
  verified_by_human = EXCLUDED.verified_by_human,
  reasoning = EXCLUDED.reasoning,
  technology_a = EXCLUDED.technology_a,
  technology_b = EXCLUDED.technology_b,
  sync_required = EXCLUDED.sync_required,
  class_level = EXCLUDED.class_level,
  chapter = EXCLUDED.chapter;

-- Verify:
-- SELECT * FROM confusion_cluster_registry WHERE concept_id = 'resultant_direction';
-- Should return 6 rows (3 x STATE_2, 3 x STATE_5), all status='pending_review'.
-- SELECT * FROM concept_panel_config WHERE concept_id = 'resultant_direction';
-- Should return 1 row with default_panel_count = 1, panel_a_renderer = 'mechanics_2d'.
