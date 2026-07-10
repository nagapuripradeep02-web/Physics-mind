-- supabase_2026-07-10_seed_emf_definition_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 clusters for emf_definition.json —
-- the FIFTH concept on the particle_field (2D p5.js) renderer, same engine
-- family as drift_velocity/ohms_law/resistivity/combination_of_resistors
-- (a new charge-pump-cell + potential-ladder circuit scenario). Diamond 1
-- of the two-diamond emf/internal-resistance split.
-- Authored 2026-07-10 by alex:json_author per architect skeleton §6 +
-- physics_author drill-down trigger phrases §6. Migration is AUTHORED, not
-- applied — quality_auditor's pre-run step applies it (json_author is
-- forbidden from apply_migration). The clusters-registry Gate 8 probe is
-- N/A-DORMANT this phase (authored-not-applied precedent, per architect
-- FLAG 3 / conceptual-only directive) — do not let the auditor false-FAIL it.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- Each trigger_examples array carries 5 real-Indian-11th/12th-grade phrasings
-- (lowercase, idiomatic, no textbook prose), verbatim from physics_author §6.
-- status='pending_review' per the current cluster-registry convention.
--
-- THREE has_prebuilt_deep_dive-flagged states (json_author §5 / architect §5,
-- drill-down is a DEFERRED feature — Rule 18 — hand-authored only after
-- analytics flag the state), 3 candidate clusters each:
--   STATE_2 — the abstraction: ε = W/q, the volt = J/C unit identity, who does the work
--   STATE_3 — PRIMARY aha + naming-trap: emf is not a force, the intensive-invariance test
--   STATE_5 — the measurement condition: no current to measure ε, the ideal-voltmeter assumption

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_2 why_volts_not_joules deep-dive ───────────────────────────
(
  'why_volts_not_joules',
  'emf_definition',
  'STATE_2',
  'If emf is energy, why is it measured in volts and not joules?',
  'Student expects an energy quantity to be reported in joules directly. Volts are joules PER COULOMB — a ratio, not a raw energy — because emf is defined as work done per unit charge (ε = W/q), and the volt is the SI name for that ratio unit (1 V ≡ 1 J/C), not a separate physical quantity from energy.',
  ARRAY[
    'if emf is energy why is it measured in volts',
    'why dont we just say joules for emf',
    'how can energy be volts, isnt volt a different unit',
    'why divide by charge to get emf, why not just use joules',
    '1 volt is really 1 joule per coulomb? that sounds weird'
  ],
  'pending_review'
),
-- ─── STATE_2 emf_vs_potential_difference deep-dive ────────────────────
(
  'emf_vs_potential_difference',
  'emf_definition',
  'STATE_2',
  'Is emf just another name for voltage / potential difference?',
  'Student conflates emf and terminal p.d. because both are measured in volts and both read the same number for THIS ideal cell. At the definition level they are distinct concepts: emf is a property of the SOURCE (work per charge done by the pump), while potential difference is what is measured BETWEEN two points in a circuit — they coincide here only because r = 0; the operational split (V = ε − Ir) is the next diamond.',
  ARRAY[
    'is emf the same thing as voltage',
    'whats the difference between emf and potential difference',
    'why does the book use two different symbols if they mean the same thing',
    'is emf just p.d. across the battery',
    'why cant we just call it terminal voltage'
  ],
  'pending_review'
),
-- ─── STATE_2 who_does_the_work deep-dive ──────────────────────────────
(
  'who_does_the_work',
  'emf_definition',
  'STATE_2',
  'What actually lifts the charge inside the cell — the electric field?',
  'Student assumes the same electrostatic field that pushes charge through the external circuit must also push it inside the cell — but that field points the WRONG way inside a working cell (it would push charge back down, − to +... no, + to −). The actual agent is non-electrostatic: the cell''s stored chemical energy (a redox reaction) does work against that internal field, lifting the charge from − to + — this is why a cell is called a "seat of emf", a genuinely different kind of agent from an electric field doing work.',
  ARRAY[
    'what actually pushes the charge inside the cell',
    'is it the electric field that lifts the charge inside the battery',
    'what force moves the electron from minus to plus terminal',
    'why doesnt the charge just go back down on its own inside the cell',
    'what agent is doing this work, is it chemical energy'
  ],
  'pending_review'
),
-- ─── STATE_3 emf_is_not_a_force deep-dive ─────────────────────────────
(
  'emf_is_not_a_force',
  'emf_definition',
  'STATE_3',
  'It''s called electromotive FORCE — how is it not a force?',
  '"Electromotive force" is a 19th-century historical name that predates the modern force/energy distinction — it is a misnomer that stuck. emf has units of volts (joules per coulomb), which dimensionally is energy per charge, NOT force (newtons). If emf really were a force, it would scale with the amount of charge being pushed (like a force scales with mass under gravity); instead the ladder step (ε) holds exactly the same height when the charge count doubles — proof it is an intensive, per-charge quantity, not a force.',
  ARRAY[
    'its called electromotive force so why isnt it a force',
    'if its not a force why does it push the current',
    'the name literally says force, shouldnt it have units of newton',
    'why is emf measured in volts if its really a force',
    'isnt emf literally the force pushing the electrons around'
  ],
  'pending_review'
),
-- ─── STATE_3 double_charge_double_energy deep-dive ────────────────────
(
  'double_charge_double_energy',
  'emf_definition',
  'STATE_3',
  'If more charge takes more energy, why doesn''t emf go up?',
  'Student correctly notices total work W = ε·q rises with more charge, but wrongly concludes ε itself must be rising too. ε is the RATIO W/q, not W itself — doubling both the numerator (W) and denominator (q) by the same factor leaves the ratio exactly unchanged. This is the same "intensive vs extensive" distinction as density (mass grows with volume, but density itself does not change) or speed (distance grows with time, speed can stay constant).',
  ARRAY[
    'if more charge needs more energy why doesnt emf go up',
    'cell does more work for more charge so emf should increase right',
    'why does the ratio stay the same when total work doubles',
    'shouldnt bigger current mean bigger emf',
    'if I push double the charge doesnt the cell get stronger'
  ],
  'pending_review'
),
-- ─── STATE_3 volts_equal_joules_per_coulomb deep-dive ─────────────────
(
  'volts_equal_joules_per_coulomb',
  'emf_definition',
  'STATE_3',
  'Prove that 1 volt is exactly 1 joule per coulomb.',
  'This is the SI DEFINITION of the volt, not a derived approximation — the volt is defined as the potential difference between two points such that 1 joule of work is done moving 1 coulomb of charge between them, i.e. V ≡ J/C by definition. This is the identical W/q ratio used to define both electric potential difference in electrostatics and emf here — the same mathematical object (work per unit charge), just applied to a source (emf) versus a field-based potential difference.',
  ARRAY[
    'prove that 1 volt is 1 joule per coulomb',
    'why is v = w/q the definition of a volt',
    'where does joule per coulomb come from in the volt unit',
    'is this the same w/q as in electric potential from electrostatics',
    'how do you actually derive 1V = 1J/C'
  ],
  'pending_review'
),
-- ─── STATE_5 why_no_current_to_measure deep-dive ──────────────────────
(
  'why_no_current_to_measure',
  'emf_definition',
  'STATE_5',
  'Why must no current flow to read the emf?',
  'For a NON-ideal real cell, current flowing means a voltage drop ACROSS the cell''s own internal resistance (V = ε − Ir), so the terminal voltage under load reads LESS than ε — you would be measuring a diminished value, not the true emf. Only when i = 0 does the Ir term vanish entirely, leaving V = ε exactly — this is why the definitional measurement condition is "no current". (For THIS diamond''s ideal cell, r = 0, so V = ε even under load — but real cells, taught next, always need the open-circuit condition.)',
  ARRAY[
    'why must no current flow to read the emf',
    'why cant I just measure emf while current is flowing',
    'whats wrong with measuring voltage on a closed circuit',
    'why does opening the switch change what the meter reads',
    'what happens to the reading if current is flowing instead'
  ],
  'pending_review'
),
-- ─── STATE_5 voltmeter_draws_no_current deep-dive ─────────────────────
(
  'voltmeter_draws_no_current',
  'emf_definition',
  'STATE_5',
  'Doesn''t the voltmeter itself complete the circuit and draw current?',
  'An IDEAL voltmeter has infinite resistance, so by Ohm''s law it draws exactly zero current no matter what voltage it sits across — connecting it does not disturb the circuit it measures. Real voltmeters approximate this with a very large (but finite) internal resistance, drawing a tiny, usually-negligible current; the "ideal voltmeter" assumption used throughout this diamond and the whole syllabus is exactly this idealisation.',
  ARRAY[
    'doesnt the voltmeter itself complete the circuit',
    'if a voltmeter is connected wont current flow through it too',
    'how can a voltmeter measure something without drawing any current',
    'is a real voltmeter also ideal like the one in this sim',
    'why does an ideal voltmeter have infinite resistance'
  ],
  'pending_review'
),
-- ─── STATE_5 emf_when_current_flows deep-dive ─────────────────────────
(
  'emf_when_current_flows',
  'emf_definition',
  'STATE_5',
  'Will the meter still read ε when the loop is closed?',
  'Honest answer, scoped to THIS diamond: YES for this IDEAL cell (r = 0), because there is no internal-resistance voltage drop to subtract — V_terminal = ε whether the loop is open or closed. This is the honesty-guard boundary of Diamond 1: a REAL cell (taught next, in internal_resistance) has r > 0, so V = ε − Ir falls below ε the moment current flows — the open-circuit condition stops being optional and becomes essential for a real measurement.',
  ARRAY[
    'will the voltmeter still show emf when the switch is closed',
    'does closing the circuit change what the voltmeter reads',
    'is v = emf always true even when current is flowing',
    'whats different for a real battery when current is flowing',
    'why does the reading only equal emf when there is no current'
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
