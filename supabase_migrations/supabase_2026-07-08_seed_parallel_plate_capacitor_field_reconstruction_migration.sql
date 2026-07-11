-- supabase_2026-07-08_seed_parallel_plate_capacitor_field_reconstruction_migration.sql
-- Rule 31/32 reconstruction of parallel_plate_capacitor_field.json: 7 states -> 6 states.
-- STATE_1+STATE_2 merged into new STATE_1 (setup + switch-on hook). Old STATE_3 (three
-- equal probes, the PRIMARY aha) becomes new STATE_2. Old STATE_4 (two-sheet
-- superposition derivation) is SPLIT: the inside-add half becomes new STATE_3, the
-- outside-cancel/edge-on half absorbs old STATE_5 and becomes new STATE_4. Old STATE_6
-- (fixed-V, double-d gap widen) becomes new STATE_5. Old STATE_7 (explore) becomes new
-- STATE_6. All predict-pause/wait_for_answer wiring is stripped (Rule 31).
--
-- This migration RE-POINTS the 3 drill-down clusters that survive the merge to their
-- new state_id, RETIRES the 1 cluster whose teaching state (old STATE_5, the edge-on
-- "field zero outside" beat) no longer carries has_prebuilt_deep_dive in the
-- reconstructed JSON (that content is now taught in new STATE_4, which the
-- reconstruction intentionally leaves without a canned deep-dive), and INSERTS 6 new
-- clusters for drill-down topics the physics content always supported but which had no
-- canned cluster before (E = V/d derivation, the sheet-field factor of two, why fields
-- add inside, the σ/ε₀ vs V/d equivalence, fixed-V vs fixed-Q, and whether charge
-- changes with the gap). Replaces the row set seeded by
-- supabase_2026-06-28_seed_parallel_plate_capacitor_field_clusters_migration.sql.
--
-- Old -> new cluster placement:
--   STATE_2 (old, switch-on predict) -> STATE_2 (new, PRIMARY aha: three probes)
--       why_field_doesnt_fan_out — re-pointed. Its content (the radial-fan
--       misconception) is now first NAMED in new STATE_1's narration + misconception_watch,
--       but the canned deep-dive button/cluster lives on new STATE_2 alongside
--       field_same_in_middle (both are "why is the field simple/uniform" drill-downs,
--       colocated on the state that visually proves it with the 3-probe reveal).
--   STATE_3 (old, three probes) -> STATE_2 (new, PRIMARY aha) — direct 1:1 content match.
--       field_same_in_middle — re-pointed.
--   STATE_6 (old, gap-widen) -> STATE_5 (new, gap-widen) — direct 1:1 content match.
--       e_inverse_d_at_fixed_v — re-pointed.
--   STATE_5 (old, edge-on "field zero outside") -> RETIRED.
--       field_zero_outside_capacitor — new STATE_4 (edge-on cancel-outside content) does
--       NOT carry has_prebuilt_deep_dive in the reconstructed JSON (task-directed), so this
--       cluster has no live drill_downs[] entry anywhere in the concept. Hard-deleted,
--       matching the established convention (see
--       supabase_2026-07-08_seed_potential_energy_in_external_field_reconstruction_migration.sql).
--
-- New clusters (brand new rows, no prior row to re-point):
--   STATE_2 (new) — where_does_v_over_d_come_from
--   STATE_3 (new) — sheet_field_sigma_two_epsilon, why_fields_add_inside, sigma_epsilon_vs_v_over_d
--   STATE_5 (new) — fixed_v_vs_fixed_q_gap_change, does_charge_change_when_d_changes
--
-- Schema columns: cluster_id (PK), concept_id, state_id, label, description,
--   trigger_examples, status. DELETE is safe here: confusion_cluster_registry holds
--   CLUSTER DEFINITIONS (not the sacred student_confusion_log event data), and the
--   retired row has no corresponding drill_downs[] entry anywhere in the reconstructed
--   JSON, so leaving it would misdirect a lookup at a state that no longer teaches that
--   beat. Authored but NOT applied — quality_auditor's pre-run step applies this.

-- 1. Re-point the 2 clusters that land on new STATE_2 (PRIMARY aha: three equal probes).
UPDATE confusion_cluster_registry
SET state_id = 'STATE_2', updated_at = now()
WHERE concept_id = 'parallel_plate_capacitor_field'
  AND cluster_id IN (
    'why_field_doesnt_fan_out',
    'field_same_in_middle'
  );

-- 2. Re-point the 1 cluster that lands on new STATE_5 (fixed-V, double-d gap widen).
UPDATE confusion_cluster_registry
SET state_id = 'STATE_5', updated_at = now()
WHERE concept_id = 'parallel_plate_capacitor_field'
  AND cluster_id = 'e_inverse_d_at_fixed_v';

-- 3. Retire the cluster seeded against old STATE_5 (edge-on "field zero outside"). The
--    reconstructed JSON's new STATE_4 (same physics content — outside cancellation,
--    edge-on view, fringe) does NOT declare has_prebuilt_deep_dive, so this cluster has
--    no live drill_downs[] entry anywhere in the concept.
DELETE FROM confusion_cluster_registry
WHERE concept_id = 'parallel_plate_capacitor_field'
  AND cluster_id = 'field_zero_outside_capacitor';

-- 4. Insert the 6 new clusters (STATE_2: 1 new; STATE_3: 3 new; STATE_5: 2 new).
-- ON CONFLICT idempotent so re-running re-syncs the rows.
INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
(
  'where_does_v_over_d_come_from',
  'parallel_plate_capacitor_field',
  'STATE_2',
  'Where does E = V/d actually come from?',
  'student accepts E=V/d as a memorized formula without connecting it to the uniform-field picture; needs to see that once the three probes prove the field is the SAME everywhere, dividing the total voltage drop V by the total gap d gives that one constant field value',
  ARRAY[
    'where does e equals v over d come from',
    'why is the formula v divided by d and not something else',
    'how do we get e = v/d from the field being uniform',
    'is e = v/d just a definition or is it derived',
    'why does dividing voltage by distance give the field'
  ],
  'active'
),
(
  'sheet_field_sigma_two_epsilon',
  'parallel_plate_capacitor_field',
  'STATE_3',
  'Why does one charged sheet make a field of σ/2ε₀?',
  'student is unsure why a single infinite charged sheet''s field carries the factor of 2 in the denominator; needs the reminder that each plate independently produces sigma over two epsilon-nought on EITHER side, before superposition combines the two plates'' fields',
  ARRAY[
    'why is a single sheets field sigma over two epsilon not just sigma over epsilon',
    'where does the 2 come from in sigma over two epsilon nought',
    'is sigma over 2 epsilon0 the field of one plate or both plates',
    'why does one charged sheet alone give half the field',
    'whats the field of just one plate by itself'
  ],
  'active'
),
(
  'why_fields_add_inside',
  'parallel_plate_capacitor_field',
  'STATE_3',
  'Why do the two plates'' fields ADD instead of cancel?',
  'student may expect a positive and negative plate''s fields to cancel everywhere (since the charges are opposite); needs to see that BETWEEN the plates the two individual sheet-fields point the SAME way (both push from + to −), so they add, while only OUTSIDE do they oppose',
  ARRAY[
    'why do the two plates fields add instead of cancelling since theyre opposite charges',
    'shouldnt positive and negative plate fields cancel each other',
    'why does the field between the plates get bigger not smaller',
    'how can two opposite charges fields add up',
    'do the fields add inside the same way they cancel outside'
  ],
  'active'
),
(
  'sigma_epsilon_vs_v_over_d',
  'parallel_plate_capacitor_field',
  'STATE_3',
  'How do σ/ε₀ and V/d give the same answer?',
  'student sees two different-looking formulas (E = sigma/epsilon-nought from the sheet derivation, E = V/d from the voltage definition) and doesn''t trust they''re the same field; needs the reminder that these are two routes to the identical uniform field measured earlier by the three probes',
  ARRAY[
    'how are sigma over epsilon0 and v over d the same thing',
    'why are there two different formulas for the same field',
    'is e equals sigma over epsilon0 different from e equals v over d',
    'do i use v over d or sigma over epsilon0 for the field',
    'why do both formulas give the same field value'
  ],
  'active'
),
(
  'fixed_v_vs_fixed_q_gap_change',
  'parallel_plate_capacitor_field',
  'STATE_5',
  'Does E still halve if the plates are isolated (fixed Q) instead of fixed V?',
  'student conflates the fixed-voltage case (this concept, E = V/d halves when d doubles) with a DIFFERENT fixed-charge scenario (an isolated charged capacitor, where E = sigma/epsilon0 stays constant as d changes because sigma doesn''t change); needs the distinction that THIS demo keeps V pinned by a battery, not Q',
  ARRAY[
    'does e still halve if the capacitor is isolated instead of connected to a battery',
    'whats different between fixed voltage and fixed charge when d changes',
    'if charge stays constant does the field still drop when i pull the plates apart',
    'is this e halves rule only true when the battery stays connected',
    'what if the plates are disconnected from the battery does e still fall'
  ],
  'active'
),
(
  'does_charge_change_when_d_changes',
  'parallel_plate_capacitor_field',
  'STATE_5',
  'Does the charge on the plates change when I pull them apart?',
  'student wonders whether widening the gap at fixed V changes how much charge sits on the plates (it does, via Q=CV and C=epsilon0 A/d falling as d rises), a subtlety this concept doesn''t need but students often ask; keep the answer scoped to E = V/d without introducing capacitance',
  ARRAY[
    'does the charge on the plates change when i move them apart',
    'if d increases does q also change at fixed voltage',
    'why does pulling the plates apart affect the charge too',
    'is charge constant or does it change with the gap',
    'does more separation mean less charge on the plates'
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
-- SELECT cluster_id, state_id, status FROM confusion_cluster_registry
--   WHERE concept_id = 'parallel_plate_capacitor_field' ORDER BY state_id, cluster_id;
-- Should return exactly 9 rows: 1 STATE_2 (why_field_doesnt_fan_out) + 1 STATE_2
-- (field_same_in_middle) + 1 STATE_2 (where_does_v_over_d_come_from) = 3 STATE_2 rows,
-- 3 STATE_3 rows, 3 STATE_5 rows (e_inverse_d_at_fixed_v + fixed_v_vs_fixed_q_gap_change
-- + does_charge_change_when_d_changes). field_zero_outside_capacitor must be ABSENT.
