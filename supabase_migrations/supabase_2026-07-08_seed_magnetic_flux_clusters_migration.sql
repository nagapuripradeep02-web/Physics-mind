-- supabase_2026-07-08_seed_magnetic_flux_clusters_migration.sql
-- Seeds confusion_cluster_registry with 3 clusters for magnetic_flux.json.
-- Authored 2026-07-08 by alex:json_author per architect skeleton + physics_author
-- drill-down trigger phrases. Migration is AUTHORED, not applied — quality_auditor's
-- pre-run step applies it (json_author is forbidden from apply_migration).
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- Each trigger_examples array carries 5 real-Indian-11th-grade phrasings (lowercase,
-- idiomatic, no textbook prose). status='pending_review' per cluster-registry convention.
--
-- THREE has_prebuilt_deep_dive-flagged states (json_author §5, drill-down is a
-- DEFERRED feature — Rule 18 — hand-authored only after analytics flag the state):
--   STATE_1 — flux is a snapshot count, not a flow: flux_is_not_a_flow
--   STATE_4 — edge-on kills flux to zero despite full field strength (PRIMARY aha): edge_on_zero_flux
--   STATE_5 — theta measured from the area vector (normal), not the loop's plane: theta_measured_from_normal

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_1 flux-is-not-a-flow deep-dive ─────────────────────────────
(
  'flux_is_not_a_flow',
  'magnetic_flux',
  'STATE_1',
  'Does flux mean something is actually flowing through the loop?',
  'Student imports the everyday sense of "flux" (a current or a liquid flowing through) onto magnetic flux, which is a static SNAPSHOT count of field lines threading a surface at one instant — nothing continues to move once counted.',
  ARRAY[
    'does flux mean something is actually flowing through',
    'is flux like current passing through the loop',
    'why is flux zero if nothing moves',
    'flux sounds like liquid flowing through a pipe',
    'what is actually moving when we say flux'
  ],
  'pending_review'
),
-- ─── STATE_4 edge-on-zero-flux deep-dive (PRIMARY aha) ────────────────
(
  'edge_on_zero_flux',
  'magnetic_flux',
  'STATE_4',
  'If the field is strong, why does tilting the loop make flux zero?',
  'Student conflates field STRENGTH (B) with flux (Φ). Tilting the loop to edge-on (θ = 90°) shrinks the effective area to nothing without touching B at all — flux depends on the field''s component through the window, not on B alone.',
  ARRAY[
    'if field is strong why is flux zero',
    'how can flux be zero when B is not zero',
    'does tilting the loop change the field itself',
    'why does turning the loop kill the flux',
    'shouldnt strong magnet always give big flux'
  ],
  'pending_review'
),
-- ─── STATE_5 theta-measured-from-normal deep-dive ─────────────────────
(
  'theta_measured_from_normal',
  'magnetic_flux',
  'STATE_5',
  'Is theta the angle with the loop surface or with the normal?',
  'Student measures θ from the flat face (plane) of the loop instead of from the AREA VECTOR (the normal to the face) — the single most common sign/setup error in flux problems, and the reason many students get 90°-swapped answers.',
  ARRAY[
    'is theta the angle with the loop surface or with the normal',
    'why is theta not measured from the plane of the loop',
    'in the formula which line is theta measured from',
    'does theta start from the flat face of the loop',
    'why is my answer wrong if I take theta from the plane'
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
