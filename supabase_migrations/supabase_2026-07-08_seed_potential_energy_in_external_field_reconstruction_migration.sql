-- supabase_2026-07-08_seed_potential_energy_in_external_field_reconstruction_migration.sql
-- Rule 31/32 reconstruction of potential_energy_in_external_field.json: 9 states -> 7
-- states (STATE_2+STATE_3 merged into new STATE_2; STATE_7+STATE_8 merged into new
-- STATE_6). This migration RE-POINTS the 6 drill-down clusters that survive the merge
-- to their new state_id, and RETIRES the 3 clusters whose teaching state (old STATE_6,
-- the qV -> -p.E derivation) no longer carries has_prebuilt_deep_dive in the
-- reconstructed JSON. Replaces the row set seeded by
-- supabase_2026-06-30_seed_potential_energy_in_external_field_clusters_migration.sql.
--
-- Old -> new cluster placement:
--   STATE_3 -> STATE_2 (negative_charge_energy_well, does_sign_of_V_or_q_decide_U,
--                        dna_slides_toward_anode)
--   STATE_7 -> STATE_6 (aligned_is_minimum_not_maximum, energy_vs_torque_which_peaks_where,
--                        stable_vs_unstable_equilibrium)
--   STATE_6 -> RETIRED (where_does_minus_p_dot_E_come_from, two_qV_terms_to_one_formula,
--                        p_equals_qd_meaning) — the collapse-to-dipole beat (new STATE_5)
--                        no longer ships has_prebuilt_deep_dive in the reconstructed JSON.
--
-- Schema columns: cluster_id (PK), concept_id, state_id, label, description,
--   trigger_examples, status. DELETE is safe here: confusion_cluster_registry holds
--   CLUSTER DEFINITIONS (not the sacred student_confusion_log event data), and these
--   3 rows have no corresponding drill_downs[] entry anywhere in the reconstructed
--   JSON, so leaving them would misdirect a lookup at the new (differently-taught)
--   STATE_6. Authored but NOT applied — quality_auditor's pre-run step applies this.

-- 1. Re-point the 3 STATE_3 -> STATE_2 clusters (PRIMARY aha: sign of U).
UPDATE confusion_cluster_registry
SET state_id = 'STATE_2', updated_at = now()
WHERE concept_id = 'potential_energy_in_external_field'
  AND cluster_id IN (
    'negative_charge_energy_well',
    'does_sign_of_V_or_q_decide_U',
    'dna_slides_toward_anode'
  );

-- 2. Re-point the 3 STATE_7 -> STATE_6 clusters (extrema + stability, now taught
--    together via the single damped-pendulum release).
UPDATE confusion_cluster_registry
SET state_id = 'STATE_6', updated_at = now()
WHERE concept_id = 'potential_energy_in_external_field'
  AND cluster_id IN (
    'aligned_is_minimum_not_maximum',
    'energy_vs_torque_which_peaks_where',
    'stable_vs_unstable_equilibrium'
  );

-- 3. Retire the 3 clusters that were seeded against old STATE_6 (the qV+qV -> -p.E
--    derivation beat). The reconstructed JSON's STATE_5 (same physics content) does
--    NOT declare has_prebuilt_deep_dive, so these clusters have no live drill_downs[]
--    entry anywhere in the concept. Hard-deleted (not soft-status'd — no 'retired'
--    status value exists in this registry's established convention; see
--    supabase_2026-06-30_seed_..._clusters_migration.sql / supabase_2026-05-04_seed_
--    pressure_scalar_clusters_migration.sql for the only two conventions in use,
--    'pending_review' and 'active').
DELETE FROM confusion_cluster_registry
WHERE concept_id = 'potential_energy_in_external_field'
  AND cluster_id IN (
    'where_does_minus_p_dot_E_come_from',
    'two_qV_terms_to_one_formula',
    'p_equals_qd_meaning'
  );

-- Verify:
-- SELECT cluster_id, state_id, status FROM confusion_cluster_registry
--   WHERE concept_id = 'potential_energy_in_external_field' ORDER BY state_id, cluster_id;
-- Should return exactly 6 rows: 3 STATE_2, 3 STATE_6.
