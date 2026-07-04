-- supabase_2026-06-26_seed_parallel_currents_force_clusters_migration.sql
-- Seeds confusion_cluster_registry with 3 drill-down clusters for
-- parallel_currents_force.json (Class 12 Ch.4 §4.11 — force between two parallel
-- currents: wire 1's field at wire 2 is B1 = mu0 I1 / 2 pi d, so F/L = mu0 I1 I2 /
-- 2 pi d; parallel currents attract, antiparallel repel; this defines the ampere).
-- Authored 2026-06-26.
--
-- Cluster placement (1 cluster per state, on the three hardest states):
-- (state numbers shifted +1 on 2026-06-26 when STATE_4 "Wire 1 feels a force too"
--  was inserted as the RHR mirror of STATE_3; attract/formula/repel moved down one.)
--   STATE_5 (parallel currents attract — opposite of like charges; the AHA)  — 1 cluster
--   STATE_6 (F/L depends on BOTH currents, symmetric)                        — 1 cluster
--   STATE_7 (antiparallel repel; only relative direction matters)            — 1 cluster
--
-- CUT-LINE GUARD: this concept teaches the FORCE BETWEEN TWO PARALLEL WIRES and
-- the definition of the ampere. It does NOT teach the field of a single wire
-- (that is magnetic_field_wire / biot_savart_law / amperes_circuital_law) nor the
-- force on one wire in an external field (that is force_on_current_carrying_wire).
-- Any "field of one wire" or "force on a wire in a given B" drill-down belongs to
-- those concepts. The clusters below stay on attract-vs-repel, the two-current
-- dependence, and the relative-direction rule.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description,
--   trigger_examples, status, created_at, updated_at.
-- PRIMARY KEY is (cluster_id). ON CONFLICT (cluster_id) DO UPDATE so re-running
-- this migration re-syncs the label/description/triggers idempotently.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
(
  'parallel_currents_attract_not_repel',
  'parallel_currents_force',
  'STATE_5',
  'Why do parallel currents attract instead of repel?',
  'student applies the like-charges-repel intuition to currents and expects same-direction currents to push apart',
  ARRAY[
    'why do parallel currents attract',
    'shouldnt same direction currents repel like charges',
    'do two wires with current in same direction pull together',
    'why is it opposite to charges',
    'like currents attract but like charges repel confusing'
  ],
  'active'
),
(
  'force_depends_on_both_currents',
  'parallel_currents_force',
  'STATE_6',
  'Does the force depend on both currents or just one?',
  'student thinks only the source wire pushes, or that the bigger current pushes harder, missing the symmetric F/L and Newtons third law',
  ARRAY[
    'does the force depend on both currents',
    'which wire pushes harder if currents are different',
    'is the force only from the bigger current',
    'why is F/L symmetric in I1 and I2',
    'do both wires feel the same force'
  ],
  'active'
),
(
  'antiparallel_repel_relative_direction',
  'parallel_currents_force',
  'STATE_7',
  'When do the wires repel, and does reversing both currents matter?',
  'student is unsure when wires repel and thinks reversing both currents flips attraction, missing that only relative direction matters',
  ARRAY[
    'when do two wires repel',
    'if i reverse both currents do they repel',
    'does opposite current mean repel',
    'why does reversing both keep them attracting',
    'attract or repel for antiparallel currents'
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
--   WHERE concept_id = 'parallel_currents_force' ORDER BY state_id, cluster_id;
-- Should return 3 rows (1 STATE_5, 1 STATE_6, 1 STATE_7).
