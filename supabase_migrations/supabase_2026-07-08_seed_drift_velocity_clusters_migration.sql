-- supabase_2026-07-08_seed_drift_velocity_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 clusters for drift_velocity.json —
-- the FIRST concept on the particle_field (2D p5.js) renderer.
-- Authored 2026-07-08 by alex:json_author per architect skeleton §6 +
-- physics_author drill-down trigger phrases §7. Migration is AUTHORED, not
-- applied — quality_auditor's pre-run step applies it (json_author is
-- forbidden from apply_migration).
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- Each trigger_examples array carries 5 real-Indian-11th/12th-grade phrasings
-- (lowercase, idiomatic, no textbook prose). status='pending_review' per the
-- current cluster-registry convention (mirrors supabase_2026-07-08_seed_magnetic_flux_clusters_migration.sql).
--
-- THREE has_prebuilt_deep_dive-flagged states (json_author §5, drill-down is a
-- DEFERRED feature — Rule 18 — hand-authored only after analytics flag the state),
-- 3 candidate clusters each (json_author §6):
--   STATE_3 — PRIMARY aha: the field arrives instantly, electrons only crawl
--   STATE_4 — the collision-clock mechanism: v_d = eEτ/m
--   STATE_6 — i = neAv_d plumbing: what n means, why A multiplies current not speed

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_3 field_travels_not_electrons deep-dive ────────────────────
(
  'field_travels_not_electrons',
  'drift_velocity',
  'STATE_3',
  'So electrons don''t actually travel down the wire?',
  'Student believes the electrons themselves race down the wire near light speed when a switch is flipped. What actually travels near light speed is the electric FIELD; each electron everywhere starts drifting the same instant, but every individual electron itself only crawls at v_d ~ 10^-4 m/s.',
  ARRAY[
    'so electrons dont actually travel down the wire',
    'what is moving so fast then if not electrons',
    'is it the field that travels not the electron',
    'why do people say current flows if electrons barely move',
    'does the electron itself go all the way to the bulb'
  ],
  'pending_review'
),
-- ─── STATE_3 why_bulb_lights_instantly deep-dive ──────────────────────
(
  'why_bulb_lights_instantly',
  'drift_velocity',
  'STATE_3',
  'Why does the bulb light up instantly when electrons are so slow?',
  'Student sees the apparent contradiction between a tiny drift velocity (~10^-4 m/s) and the instant response of a switch. The resolution: the electric field is established along the whole wire at near light speed, so every electron everywhere begins drifting the same instant the switch closes — no single electron needs to travel the length of the wire for the bulb to light.',
  ARRAY[
    'why does the bulb light up instantly when electrons are so slow',
    'how is the switch instant if drift velocity is tiny',
    'bulb turns on immediately but electrons take hours doesnt that contradict',
    'why is there no delay when i flip the switch',
    'if v d is 10 to the minus 4 why is light instant'
  ],
  'pending_review'
),
-- ─── STATE_3 signal_speed_vs_electron_speed deep-dive ─────────────────
(
  'signal_speed_vs_electron_speed',
  'drift_velocity',
  'STATE_3',
  'What''s the difference between signal speed, thermal speed, and drift speed?',
  'Student conflates three distinct speeds in this concept: the SIGNAL speed (~10^8 m/s, the field establishing itself along the wire), the THERMAL speed (~10^5 m/s, the random zigzag every free electron already has), and the DRIFT speed (~10^-4 m/s, the tiny collective bias that constitutes current). These are three separately-labelled, never-conflated readouts.',
  ARRAY[
    'whats the difference between signal speed and electron speed',
    'is drift velocity the same as the speed of electricity',
    'three different speeds im confused which one is which',
    'why is thermal speed so much bigger than drift speed',
    'does current travel at speed of light or at v d'
  ],
  'pending_review'
),
-- ─── STATE_4 relaxation_time_meaning deep-dive ────────────────────────
(
  'relaxation_time_meaning',
  'drift_velocity',
  'STATE_4',
  'What exactly is relaxation time (tau)?',
  'Student is unsure whether tau is a single fixed collision interval or an average. Tau (τ) is the AVERAGE free time between two successive collisions for an electron, averaged over the whole population''s random collision history — not a fixed per-electron clock tick.',
  ARRAY[
    'what exactly is relaxation time',
    'is tau the time between two collisions or something else',
    'why do we call it relaxation time not collision time',
    'is tau same for every electron or an average',
    'what does tau physically mean in the formula'
  ],
  'pending_review'
),
-- ─── STATE_4 collision_reset_mechanism deep-dive ──────────────────────
(
  'collision_reset_mechanism',
  'drift_velocity',
  'STATE_4',
  'Why does the electron lose its velocity gain after every collision?',
  'Student wonders why an electron accelerated by E does not just keep speeding up forever. Each collision with a lattice ion randomizes the electron''s velocity direction again, wiping out the small directed gain from the field — only the AVERAGE bias across many such collisions survives as v_d.',
  ARRAY[
    'why does the electron lose its velocity after every collision',
    'does the drift velocity reset to zero at each collision',
    'why doesnt the electron just keep speeding up forever',
    'what happens to the extra speed gained between collisions',
    'why does hitting the lattice cancel the electrons motion'
  ],
  'pending_review'
),
-- ─── STATE_4 why_vd_proportional_tau deep-dive ────────────────────────
(
  'why_vd_proportional_tau',
  'drift_velocity',
  'STATE_4',
  'Why is v_d proportional to tau (not tau squared)?',
  'Student tries to import the s = ut + (1/2)at^2 displacement formula and expects a tau-squared dependence. v_d is a VELOCITY gained per flight (v = u + at, with u averaging to zero across the population), so it scales linearly with tau — not a displacement, so no tau-squared term appears.',
  ARRAY[
    'why is v d proportional to tau and not tau squared',
    'if collisions are less frequent why does drift increase',
    'longer tau means what physically for the electron',
    'why does more time between collisions mean more drift',
    'is v d proportional to tau because of v equals u plus at'
  ],
  'pending_review'
),
-- ─── STATE_6 current_area_dependence deep-dive ────────────────────────
(
  'current_area_dependence',
  'drift_velocity',
  'STATE_6',
  'Why does a thicker wire carry more current?',
  'Student is unsure whether cross-section A speeds up the electrons or just increases their count. A wider cross-section gives MORE parallel "lanes" of electrons crossing the counting plane per second (i = neAv_d) — the drift speed v_d itself is unaffected by A.',
  ARRAY[
    'why does a thicker wire carry more current',
    'does area affect the speed of electrons or just the count',
    'if v d stays same why does i change with area',
    'why does current depend on area but not drift speed',
    'wider wire same field why is current different'
  ],
  'pending_review'
),
-- ─── STATE_6 number_density_n_confusion deep-dive ─────────────────────
(
  'number_density_n_confusion',
  'drift_velocity',
  'STATE_6',
  'What is n in i = neAv_d?',
  'Student is unsure what n represents — a count for the whole wire, or something else. n is the FREE-ELECTRON NUMBER DENSITY (electrons per cubic metre), a fixed material property of the conductor (~8.5x10^28 /m^3 for copper) — it does not depend on the battery, the current, or the wire''s length.',
  ARRAY[
    'what is n in i equals n e a v d',
    'is n the number of electrons in the whole wire or per volume',
    'does n change if i use a different wire',
    'is n same for every material or only copper',
    'why is n a property of the metal not the battery'
  ],
  'pending_review'
),
-- ─── STATE_6 same_current_thinner_wire_faster_drift deep-dive ─────────
(
  'same_current_thinner_wire_faster_drift',
  'drift_velocity',
  'STATE_6',
  'If current is the same, why does drift speed change in a thinner wire?',
  'Student encounters a series circuit where a thinner wire segment carries the SAME current as a thicker one and is confused why v_d differs there. Since i = neAv_d and n, e, i are fixed/equal, a smaller A forces a correspondingly larger v_d in that segment — the same current is carried by fewer lanes, each moving faster on average.',
  ARRAY[
    'if current is same why does drift speed change in a thinner wire',
    'same current thinner wire does that mean electrons move faster',
    'why does v d increase when area decreases at constant current',
    'in a series circuit does drift velocity change wire to wire',
    'thinner wire same current so is v d higher there'
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
