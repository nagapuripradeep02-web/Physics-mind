-- supabase_2026-07-04_seed_ac_generator_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 drill-down clusters for
-- ac_generator.json (Class 12 Ch.6 §6.10 AC Generator — the LAST concept of
-- Ch.6 Electromagnetic Induction). Authored 2026-07-04 by json_author from the
-- physics-author drill-down trigger phrasings.
--
-- Cluster placement:
--   STATE_2 (flux_trace — flux linkage Phi = NBA cos(omega t), max face-on) — 3 clusters
--   STATE_3 (emf_phase — PRIMARY aha: EMF peaks where flux is zero, 90 deg lag) — 3 clusters
--   STATE_5 (slip_rings — two rings -> AC, split ring -> DC) — 3 clusters
--
-- STATE_2, STATE_3, STATE_5 carry has_prebuilt_deep_dive: true + drill_downs: [...]
-- in the JSON.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description,
--   trigger_examples, status.
-- PRIMARY KEY is (cluster_id). ON CONFLICT (cluster_id) DO NOTHING per the
-- json_author output contract for this concept (idempotent, additive-only).
-- NOT applied here — quality_auditor's pre-run step applies this migration.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
(
  'flux_max_when_coil_faces_field',
  'ac_generator',
  'STATE_2',
  'When is the flux through the rotating coil maximum?',
  'Student is unsure which coil orientation gives the greatest flux, not yet seeing that the flux is maximum when the coil is FACE-ON (its plane perpendicular to B, so the field threads straight through) and zero when edge-on, because Phi = NBA cos(theta) depends on the angle between the coil normal and B.',
  ARRAY[
    'when is flux maximum in the coil',
    'why is flux max when the coil faces the magnet',
    'does flux depend on the angle of the coil',
    'coil flat means more flux or less flux',
    'why is flux zero when the coil is sideways'
  ],
  'pending_review'
),
(
  'where_the_cosine_comes_from',
  'ac_generator',
  'STATE_2',
  'Why cosine (and not sine) in the flux formula?',
  'Student cannot see where cos(omega t) comes from, not connecting that the flux is the field times the AREA PROJECTED onto B (A cos theta), so as the coil turns the projected area — and hence the flux — follows a cosine, starting at its maximum face-on.',
  ARRAY[
    'why cos and not sin for the flux',
    'where does cos theta come from in the flux formula',
    'why NBA cos wt for the flux',
    'how does the angle become a cosine in flux',
    'is flux cos or sin i keep mixing it up'
  ],
  'pending_review'
),
(
  'flux_linkage_n_turns',
  'ac_generator',
  'STATE_2',
  'Why is the flux multiplied by N turns?',
  'Student conflates the single-turn flux with the N-turn flux LINKAGE, not seeing that each of the N turns links the same flux so the total linkage is N times bigger — which is why N appears in Phi = NBA cos(omega t) and again (already folded in) in the EMF.',
  ARRAY[
    'why do we multiply the flux by N turns',
    'difference between flux and flux linkage',
    'does each turn add its own flux',
    'why does N come into NBA',
    'flux per turn vs total flux confusion'
  ],
  'pending_review'
),
(
  'emf_max_at_flux_zero',
  'ac_generator',
  'STATE_3',
  'Why is the EMF maximum exactly when the flux is zero?',
  'Student assumes the EMF should be largest when the flux is largest, not yet trusting that the EMF tracks the RATE of change of flux (dPhi/dt), which is steepest exactly as the cosine flux passes through zero — so the EMF peaks at the coil''s edge-on instant, where the flux is momentarily zero.',
  ARRAY[
    'why is the emf max when the flux is zero',
    'shouldnt the voltage be max when the flux is max',
    'how can the emf be maximum if the flux is zero',
    'emf max at which position of the coil',
    'flux is zero but the voltage is highest how'
  ],
  'pending_review'
),
(
  'ninety_degree_phase_meaning',
  'ac_generator',
  'STATE_3',
  'What does the 90-degree phase difference between flux and EMF mean?',
  'Student does not have a physical picture for the 90-degree lag, not seeing that because eps = -dPhi/dt, a cosine flux differentiates into a sine EMF — the two curves are a quarter cycle apart, so the EMF always peaks a quarter turn after the flux does.',
  ARRAY[
    'what does 90 degree phase difference mean here',
    'why are the emf and the flux out of phase',
    'why is the emf a sine when the flux is a cosine',
    'meaning of the phase lag between flux and emf',
    'why does the emf peak a quarter turn after the flux'
  ],
  'pending_review'
),
(
  'steady_spin_still_gives_ac',
  'ac_generator',
  'STATE_3',
  'If the speed is constant, how is the output alternating current?',
  'Student expects a constant rotation speed to give a constant (DC) output, not seeing that it is the changing GEOMETRY — the coil''s orientation reversing every half turn — that reverses the flux and hence the EMF, so a steady omega still produces a reversing sine with no acceleration.',
  ARRAY[
    'if the speed is constant how is it AC',
    'why does steady rotation give alternating current',
    'dont you need to speed up to make AC',
    'constant omega but the current still reverses why',
    'how does turning at the same speed give a sine wave'
  ],
  'pending_review'
),
(
  'slip_ring_vs_commutator',
  'ac_generator',
  'STATE_5',
  'What is the difference between slip rings and a commutator?',
  'Student treats slip rings and a split-ring commutator as the same part, not seeing that two CONTINUOUS rings keep each coil end on its own brush so the output stays alternating, while a single SPLIT ring swaps the connections each half turn to force the output one way (pulsating DC).',
  ARRAY[
    'difference between slip rings and a commutator',
    'is a slip ring and a split ring the same or not',
    'why does an AC generator use two rings',
    'how is a slip ring different from a motor commutator',
    'which ring gives AC and which gives DC'
  ],
  'pending_review'
),
(
  'why_the_wires_dont_tangle',
  'ac_generator',
  'STATE_5',
  'How do the wires not twist when the coil rotates?',
  'Student cannot picture how current leaves a continuously spinning coil, not seeing that the coil ends terminate on rings that rotate WITH the coil while fixed brushes press against them — the sliding contact carries current out without any fixed wire having to twist.',
  ARRAY[
    'how do the wires not twist when the coil rotates',
    'why brushes and rings instead of fixed wires',
    'how does the current come out of a spinning coil',
    'wont the connecting wires get tangled',
    'purpose of brushes in a generator'
  ],
  'pending_review'
),
(
  'how_a_commutator_makes_dc',
  'ac_generator',
  'STATE_5',
  'How does a split ring convert AC into DC?',
  'Student cannot see how a mechanical part changes AC to DC, not yet connecting that the split ring''s gap swaps which coil end touches which brush exactly at each half turn — right as the coil''s EMF would reverse — so the external terminal always sees the same polarity (a rectified, pulsating DC).',
  ARRAY[
    'how does a split ring convert AC to DC',
    'how does a commutator change AC into DC',
    'why does the split ring flip the connection',
    'a commutator makes DC how exactly',
    'does the commutator reverse the output every half turn'
  ],
  'pending_review'
)
ON CONFLICT (cluster_id) DO NOTHING;

-- Verify:
-- SELECT cluster_id, state_id FROM confusion_cluster_registry
--   WHERE concept_id = 'ac_generator' ORDER BY state_id, cluster_id;
-- Should return 9 rows (3 STATE_2, 3 STATE_3, 3 STATE_5).
