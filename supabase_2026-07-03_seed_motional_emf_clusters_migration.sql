-- supabase_2026-07-03_seed_motional_emf_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 drill-down clusters for
-- motional_emf.json (Class 12 Ch.6 §6.6 Motional EMF, spanning into §6.7 Energy
-- Consideration). Authored 2026-07-03 by json_author from the physics-author
-- drill-down trigger phrasings.
--
-- Cluster placement:
--   STATE_2 (charge_separation — why there's an EMF at all: q v×B) — 3 clusters
--   STATE_3 (polarity_rhr — which end is positive, the right-hand rule)  — 3 clusters
--   STATE_6 (energy_consideration — no work on a charge, yet the resistor heats) — 3 clusters
--
-- STATE_2, STATE_3, STATE_6 carry has_prebuilt_deep_dive: true + drill_downs: [...]
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
  'why_charges_separate_in_rod',
  'motional_emf',
  'STATE_2',
  'Why do charges move to the ends of the rod at all?',
  'Student does not see that every free charge inside the rod is itself moving with the rod through the field, so each one feels its own q v×B force — the separation is not a mysterious side-effect but a direct consequence of the rod''s own motion.',
  ARRAY[
    'why do charges move to the ends of the rod',
    'what force pushes the electrons to one side',
    'why does the rod act like it has two charged ends',
    'where do the extra charges come from',
    'why isnt the rod neutral everywhere anymore'
  ],
  'pending_review'
),
(
  'equilibrium_stops_further_separation',
  'motional_emf',
  'STATE_2',
  'Why does the charge separation stop after some time?',
  'Student assumes charge keeps piling up indefinitely, not seeing that the growing internal field E_internal = vB eventually balances the magnetic push exactly, capping the separation at a fixed equilibrium.',
  ARRAY[
    'why does the charge separation stop after some time',
    'why doesnt all the charge go to one end',
    'what balances the magnetic push on the electrons',
    'why is there a limit to how much charge separates',
    'does the separation keep growing forever or not'
  ],
  'pending_review'
),
(
  'is_this_the_same_as_a_battery',
  'motional_emf',
  'STATE_2',
  'Is the rod basically acting like a battery?',
  'Student senses the analogy to a cell (separated + and − ends, an internal driving field) but has not connected it explicitly — that the moving rod is genuinely a source of EMF, not merely something that resembles one.',
  ARRAY[
    'is the rod basically acting like a battery',
    'does the rod have plus and minus terminals like a cell',
    'is this the same idea as a battery emf',
    'why does a moving rod behave like a source of emf',
    'can this rod actually light a bulb like a battery'
  ],
  'pending_review'
),
(
  'which_end_is_positive',
  'motional_emf',
  'STATE_3',
  'How do I know which end of the rod is positive?',
  'Student has no reliable method to determine polarity and guesses, not yet trusting the right-hand rule (fingers along v, curl toward B, thumb gives F) as a deterministic, repeatable procedure.',
  ARRAY[
    'how do i know which end of the rod is positive',
    'which side becomes plus and which becomes minus',
    'is there a rule to find the positive end',
    'why is this end negative and not the other one',
    'how do i decide the sign of each end quickly'
  ],
  'pending_review'
),
(
  'polarity_flips_with_direction',
  'motional_emf',
  'STATE_3',
  'Does reversing the rod''s direction flip the polarity?',
  'Student is uncertain whether the polarity is a fixed property of the rod or depends on the direction of motion, not yet seeing that reversing v deterministically reverses which end is positive.',
  ARRAY[
    'what happens to the polarity if the rod moves the other way',
    'does reversing the rod direction flip plus and minus',
    'if i push the rod backward does the emf reverse',
    'why did plus and minus switch sides just now',
    'does flipping the field also flip the polarity'
  ],
  'pending_review'
),
(
  'fingers_curl_confusion',
  'motional_emf',
  'STATE_3',
  'Do I point my fingers along v or along B first?',
  'Student confuses the order and roles of the right-hand rule''s three vectors (which one the fingers start along, which one they curl toward, which one the thumb gives), often crossing it with the solenoid grip rule.',
  ARRAY[
    'do i point fingers along v or along B first',
    'which way do i curl my fingers exactly',
    'im getting confused between palm rule and finger rule',
    'why does my thumb point the wrong way when i try it',
    'is this the same right hand rule as for the wire'
  ],
  'pending_review'
),
(
  'if_no_work_then_why_effort',
  'motional_emf',
  'STATE_6',
  'If the magnetic force does no work, why do I need to push the rod?',
  'Student treats "zero work on a charge" and "zero mechanical effort on the rod" as the same claim, not seeing that the external force overcoming F_retard is real and necessary even though no single charge gains kinetic energy from the magnetic force itself.',
  ARRAY[
    'if the magnetic force does no work why do i need to push the rod',
    'doesnt zero work mean i shouldnt feel any resistance',
    'why does pushing the rod feel harder if there is no work done',
    'where does the extra effort go if the force does no work',
    'isnt it a contradiction that i push but no work is done'
  ],
  'pending_review'
),
(
  'where_does_electrical_energy_come_from',
  'motional_emf',
  'STATE_6',
  'Where does the electrical energy in the resistor actually come from?',
  'Student cannot trace the energy pathway from the mechanical push to the resistor''s heat, sometimes suspecting the magnetic field itself supplies energy rather than the external agent doing mechanical work on the rod.',
  ARRAY[
    'where does the energy in the resistor actually come from',
    'is the magnetic field giving energy to the circuit',
    'does the field create energy out of nowhere',
    'what is actually being converted into electrical energy here',
    'is my hand pushing the rod the real source of the energy'
  ],
  'pending_review'
),
(
  'does_heavier_rod_need_more_push',
  'motional_emf',
  'STATE_6',
  'Does a heavier rod need more force to keep moving at the same speed?',
  'Student conflates F_ext (which balances only F_retard = BIl at constant velocity) with an inertial force needed to overcome the rod''s mass, not seeing that F_ext is independent of the rod''s mass at steady speed.',
  ARRAY[
    'does a heavier rod need more force to keep moving',
    'is the extra push about the rods mass or about the current',
    'would a lighter rod need less force to slide at the same speed',
    'is F external only fighting the retarding force or also inertia',
    'why does F external not depend on the mass of the rod'
  ],
  'pending_review'
)
ON CONFLICT (cluster_id) DO NOTHING;

-- Verify:
-- SELECT cluster_id, state_id FROM confusion_cluster_registry
--   WHERE concept_id = 'motional_emf' ORDER BY state_id, cluster_id;
-- Should return 9 rows (3 STATE_2, 3 STATE_3, 3 STATE_6).
